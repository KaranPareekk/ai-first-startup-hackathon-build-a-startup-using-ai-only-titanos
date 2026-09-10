export interface ExecutionResult {
  stdout: string[];
  stderr: string[];
  executionTimeMs: number;
  success: boolean;
  executedLines: number[];
}

export class StdinBuffer {
  private tokens: string[] = [];
  private rawLines: string[] = [];
  private lineIndex: number = 0;
  private tokenIndex: number = 0;

  constructor(rawInput: string) {
    this.rawLines = rawInput.split(/\r?\n/);
    // Split into whitespace tokens for scanner.next(), nextInt(), etc.
    const allTokens: string[] = [];
    for (const line of this.rawLines) {
      const parts = line.trim().split(/\s+/).filter((p) => p.length > 0);
      allTokens.push(...parts);
    }
    this.tokens = allTokens;
  }

  nextLine(): string {
    if (this.lineIndex >= this.rawLines.length) {
      throw new Error('NoSuchElementException: End of STDIN buffer reached on nextLine()');
    }
    return this.rawLines[this.lineIndex++];
  }

  next(): string {
    if (this.tokenIndex >= this.tokens.length) {
      throw new Error('NoSuchElementException: No more tokens in STDIN buffer for next()');
    }
    return this.tokens[this.tokenIndex++];
  }

  nextInt(): number {
    const token = this.next();
    const val = parseInt(token, 10);
    if (isNaN(val)) {
      throw new Error(`InputMismatchException: Expected integer but found '${token}' in STDIN`);
    }
    return val;
  }

  nextDouble(): number {
    const token = this.next();
    const val = parseFloat(token);
    if (isNaN(val)) {
      throw new Error(`InputMismatchException: Expected double/float but found '${token}' in STDIN`);
    }
    return val;
  }

  nextBoolean(): boolean {
    const token = this.next().toLowerCase();
    if (token === 'true') return true;
    if (token === 'false') return false;
    throw new Error(`InputMismatchException: Expected boolean but found '${token}' in STDIN`);
  }

  hasNext(): boolean {
    return this.tokenIndex < this.tokens.length;
  }
}

// Execute JavaScript in real browser environment with STDIN buffer
export function runJavaScript(code: string, stdinText: string): ExecutionResult {
  const startTime = performance.now();
  const stdout: string[] = [];
  const stderr: string[] = [];
  const executedLines: number[] = [];

  const stdin = new StdinBuffer(stdinText);

  // Expose TITAN runtime object
  const TITAN = {
    input: () => stdin.nextLine(),
    nextInt: () => stdin.nextInt(),
    nextDouble: () => stdin.nextDouble(),
    next: () => stdin.next(),
  };

  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;

  try {
    // Intercept console.log
    const customLog = (...args: any[]) => {
      stdout.push(
        args
          .map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a)))
          .join(' ')
      );
    };

    const customError = (...args: any[]) => {
      stderr.push(args.map((a) => String(a)).join(' '));
    };

    // Construct sandboxed function
    const runner = new Function('console', 'TITAN', 'prompt', code);
    runner({ log: customLog, error: customError, warn: customLog, info: customLog }, TITAN, () =>
      stdin.nextLine()
    );

    const endTime = performance.now();
    return {
      stdout,
      stderr,
      executionTimeMs: Math.round((endTime - startTime) * 10) / 10,
      success: stderr.length === 0,
      executedLines,
    };
  } catch (err: any) {
    const endTime = performance.now();
    stderr.push(`RuntimeError: ${err.message}`);
    return {
      stdout,
      stderr,
      executionTimeMs: Math.round((endTime - startTime) * 10) / 10,
      success: false,
      executedLines,
    };
  }
}

// Interactive Educational Python Interpreter with STDIN input()
export function runPython(code: string, stdinText: string): ExecutionResult {
  const startTime = performance.now();
  const stdout: string[] = [];
  const stderr: string[] = [];
  const executedLines: number[] = [];

  const stdin = new StdinBuffer(stdinText);
  const lines = code.split(/\r?\n/);
  const vars: Record<string, any> = {};

  try {
    for (let i = 0; i < lines.length; i++) {
      const rawLine = lines[i];
      const trimmed = rawLine.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      executedLines.push(i + 1);

      // Print statement
      if (trimmed.startsWith('print(') && trimmed.endsWith(')')) {
        const inner = trimmed.substring(6, trimmed.length - 1);
        const parts = parseArgList(inner);
        const evaluated = parts.map((p) => evalExpr(p, vars, stdin));
        stdout.push(evaluated.join(' '));
        continue;
      }

      // Variable assignment: e.g. x = int(input()) or arr = [1, 2]
      if (trimmed.includes('=') && !trimmed.startsWith('if') && !trimmed.startsWith('for')) {
        const eqIdx = trimmed.indexOf('=');
        const varName = trimmed.substring(0, eqIdx).trim();
        const expr = trimmed.substring(eqIdx + 1).trim();

        vars[varName] = evalExpr(expr, vars, stdin);
        continue;
      }

      // Array method: e.g. nums.append(val) or nums.reverse()
      if (trimmed.includes('.append(')) {
        const dotIdx = trimmed.indexOf('.append(');
        const arrName = trimmed.substring(0, dotIdx).trim();
        const arg = trimmed.substring(dotIdx + 8, trimmed.length - 1).trim();
        if (Array.isArray(vars[arrName])) {
          vars[arrName].push(evalExpr(arg, vars, stdin));
        }
        continue;
      }

      if (trimmed.includes('.reverse()')) {
        const dotIdx = trimmed.indexOf('.reverse()');
        const arrName = trimmed.substring(0, dotIdx).trim();
        if (Array.isArray(vars[arrName])) {
          vars[arrName].reverse();
        }
        continue;
      }

      // For loop: for i in range(...):
      if (trimmed.startsWith('for ') && trimmed.includes(' in range(')) {
        const match = trimmed.match(/for\s+(\w+)\s+in\s+range\(([^)]+)\):/);
        if (match) {
          const iterVar = match[1];
          const rawArgs = parseArgList(match[2]);
          let start = 0;
          let stop = 0;
          let step = 1;

          if (rawArgs.length === 1) {
            stop = Number(evalExpr(rawArgs[0], vars, stdin));
          } else if (rawArgs.length === 2) {
            start = Number(evalExpr(rawArgs[0], vars, stdin));
            stop = Number(evalExpr(rawArgs[1], vars, stdin));
          } else if (rawArgs.length >= 3) {
            start = Number(evalExpr(rawArgs[0], vars, stdin));
            stop = Number(evalExpr(rawArgs[1], vars, stdin));
            step = Number(evalExpr(rawArgs[2], vars, stdin)) || 1;
          }

          // Collect body lines (indented lines following)
          const bodyLines: string[] = [];
          let j = i + 1;
          while (j < lines.length && (lines[j].startsWith('    ') || lines[j].startsWith('\t'))) {
            bodyLines.push(lines[j].trim());
            j++;
          }

          if (!isNaN(start) && !isNaN(stop) && !isNaN(step) && step !== 0) {
            if (step > 0) {
              for (let k = start; k < stop; k += step) {
                vars[iterVar] = k;
                for (const bLine of bodyLines) {
                  executePythonStatement(bLine, vars, stdin, stdout);
                }
              }
            } else {
              for (let k = start; k > stop; k += step) {
                vars[iterVar] = k;
                for (const bLine of bodyLines) {
                  executePythonStatement(bLine, vars, stdin, stdout);
                }
              }
            }
          }
          i = j - 1;
          continue;
        }
      }
    }

    const endTime = performance.now();
    return {
      stdout,
      stderr,
      executionTimeMs: Math.round((endTime - startTime) * 10) / 10,
      success: true,
      executedLines,
    };
  } catch (err: any) {
    const endTime = performance.now();
    stderr.push(`PythonRuntimeError: ${err.message}`);
    return {
      stdout,
      stderr,
      executionTimeMs: Math.round((endTime - startTime) * 10) / 10,
      success: false,
      executedLines,
    };
  }
}

function executePythonStatement(
  trimmed: string,
  vars: Record<string, any>,
  stdin: StdinBuffer,
  stdout: string[]
) {
  if (trimmed.startsWith('print(') && trimmed.endsWith(')')) {
    const inner = trimmed.substring(6, trimmed.length - 1);
    const parts = parseArgList(inner);
    const evaluated = parts.map((p) => evalExpr(p, vars, stdin));
    stdout.push(evaluated.join(' '));
    return;
  }
  if (trimmed.includes('=') && !trimmed.startsWith('if') && !trimmed.startsWith('for')) {
    const eqIdx = trimmed.indexOf('=');
    const varName = trimmed.substring(0, eqIdx).trim();
    const expr = trimmed.substring(eqIdx + 1).trim();
    vars[varName] = evalExpr(expr, vars, stdin);
    return;
  }
  if (trimmed.includes('.append(')) {
    const dotIdx = trimmed.indexOf('.append(');
    const arrName = trimmed.substring(0, dotIdx).trim();
    const arg = trimmed.substring(dotIdx + 8, trimmed.length - 1).trim();
    if (Array.isArray(vars[arrName])) {
      vars[arrName].push(evalExpr(arg, vars, stdin));
    }
  }
}

function evalExpr(expr: string, vars: Record<string, any>, stdin: StdinBuffer): any {
  expr = expr.trim();
  if (expr === 'input()') return stdin.nextLine();
  if (expr.startsWith('input(')) return stdin.nextLine();
  if (expr.startsWith('int(input())')) return parseInt(stdin.nextLine(), 10);
  if (expr.startsWith('int(') && expr.endsWith(')')) {
    const sub = expr.substring(4, expr.length - 1);
    return parseInt(evalExpr(sub, vars, stdin), 10);
  }
  if (expr.startsWith('float(') && expr.endsWith(')')) {
    const sub = expr.substring(6, expr.length - 1);
    return parseFloat(evalExpr(sub, vars, stdin));
  }
  if (expr.startsWith('sum(') && expr.endsWith(')')) {
    const sub = expr.substring(4, expr.length - 1);
    const arr = evalExpr(sub, vars, stdin);
    return Array.isArray(arr) ? arr.reduce((a, b) => a + b, 0) : 0;
  }
  if (expr.startsWith('len(') && expr.endsWith(')')) {
    const sub = expr.substring(4, expr.length - 1);
    const arr = evalExpr(sub, vars, stdin);
    return arr?.length ?? 0;
  }
  if (expr === '[]') return [];

  // String literals
  if (
    (expr.startsWith('"') && expr.endsWith('"')) ||
    (expr.startsWith("'") && expr.endsWith("'"))
  ) {
    return expr.substring(1, expr.length - 1);
  }

  // Number literal
  if (!isNaN(Number(expr)) && expr !== '') return Number(expr);

  // Variable lookup
  if (vars[expr] !== undefined) return vars[expr];

  // Simple math expression fallback
  try {
    const safeEvaluator = new Function(...Object.keys(vars), `return ${expr};`);
    return safeEvaluator(...Object.values(vars));
  } catch {
    return expr;
  }
}

function parseArgList(text: string): string[] {
  const parts: string[] = [];
  let cur = '';
  let inQuotes = false;
  let quoteChar = '';

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if ((ch === '"' || ch === "'") && !inQuotes) {
      inQuotes = true;
      quoteChar = ch;
      cur += ch;
    } else if (ch === quoteChar && inQuotes) {
      inQuotes = false;
      cur += ch;
    } else if (ch === ',' && !inQuotes) {
      parts.push(cur.trim());
      cur = '';
    } else {
      cur += ch;
    }
  }
  if (cur.trim()) parts.push(cur.trim());
  return parts;
}

// Educational Java Runtime Engine with Scanner support
export function runJava(code: string, stdinText: string): ExecutionResult {
  const startTime = performance.now();
  const stdout: string[] = [];
  const stderr: string[] = [];
  const executedLines: number[] = [];

  const stdin = new StdinBuffer(stdinText);
  const lines = code.split(/\r?\n/);
  const vars: Record<string, any> = {};

  try {
    for (let i = 0; i < lines.length; i++) {
      const rawLine = lines[i];
      const trimmed = rawLine.trim();
      if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('/*')) continue;
      if (
        trimmed.startsWith('import ') ||
        trimmed.startsWith('public class ') ||
        trimmed.startsWith('public static void main') ||
        trimmed === '{' ||
        trimmed === '}'
      ) {
        continue;
      }

      executedLines.push(i + 1);

      // System.out.println / System.out.print
      if (trimmed.startsWith('System.out.println(') || trimmed.startsWith('System.out.print(')) {
        const isPrintln = trimmed.startsWith('System.out.println(');
        const prefixLen = isPrintln ? 'System.out.println('.length : 'System.out.print('.length;
        const semicolonIdx = trimmed.lastIndexOf(');');
        if (semicolonIdx > 0) {
          const inner = trimmed.substring(prefixLen, semicolonIdx);
          const val = evalJavaStringConcat(inner, vars);
          stdout.push(String(val));
          continue;
        }
      }

      // Scanner next methods
      // String name = scanner.nextLine();
      // int age = scanner.nextInt();
      // double gpa = scanner.nextDouble();
      if (trimmed.includes('scanner.') || trimmed.includes('.next')) {
        const match = trimmed.match(/(?:String|int|double|boolean)?\s*(\w+)\s*=\s*scanner\.(\w+)\(\);/);
        if (match) {
          const varName = match[1];
          const method = match[2];

          if (method === 'nextLine') vars[varName] = stdin.nextLine();
          else if (method === 'nextInt') vars[varName] = stdin.nextInt();
          else if (method === 'nextDouble') vars[varName] = stdin.nextDouble();
          else if (method === 'nextBoolean') vars[varName] = stdin.nextBoolean();
          else if (method === 'next') vars[varName] = stdin.next();
          continue;
        }
      }

      // Simple condition: if (gpa >= 3.5)
      if (trimmed.startsWith('if (')) {
        const condMatch = trimmed.match(/if\s*\((.+)\)\s*\{?/);
        if (condMatch) {
          const cond = condMatch[1];
          const result = evalJavaCondition(cond, vars);

          // Find if block and else block
          let j = i + 1;
          const ifBody: string[] = [];
          const elseBody: string[] = [];
          let insideElse = false;

          while (j < lines.length) {
            const nextTrim = lines[j].trim();
            if (nextTrim === '}' || nextTrim.startsWith('} else')) {
              if (nextTrim.includes('else')) {
                insideElse = true;
                j++;
                continue;
              }
              break;
            }
            if (insideElse) elseBody.push(nextTrim);
            else ifBody.push(nextTrim);
            j++;
          }

          const targetBody = result ? ifBody : elseBody;
          for (const s of targetBody) {
            if (s.startsWith('System.out.println(')) {
              const inner = s.substring('System.out.println('.length, s.lastIndexOf(');'));
              stdout.push(String(evalJavaStringConcat(inner, vars)));
            }
          }
          i = j;
          continue;
        }
      }
    }

    const endTime = performance.now();
    return {
      stdout,
      stderr,
      executionTimeMs: Math.round((endTime - startTime) * 10) / 10,
      success: true,
      executedLines,
    };
  } catch (err: any) {
    const endTime = performance.now();
    stderr.push(`JavaException: ${err.message}`);
    return {
      stdout,
      stderr,
      executionTimeMs: Math.round((endTime - startTime) * 10) / 10,
      success: false,
      executedLines,
    };
  }
}

function evalJavaStringConcat(expr: string, vars: Record<string, any>): string {
  // e.g. "Student: " + name
  const tokens = expr.split('+');
  let result = '';
  for (const t of tokens) {
    const trimmed = t.trim();
    if (
      (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
      (trimmed.startsWith("'") && trimmed.endsWith("'"))
    ) {
      result += trimmed.substring(1, trimmed.length - 1);
    } else if (vars[trimmed] !== undefined) {
      result += vars[trimmed];
    } else {
      result += trimmed;
    }
  }
  return result;
}

function evalJavaCondition(cond: string, vars: Record<string, any>): boolean {
  try {
    const safeEvaluator = new Function(...Object.keys(vars), `return ${cond};`);
    return Boolean(safeEvaluator(...Object.values(vars)));
  } catch {
    return false;
  }
}
