import { TableDef, ColumnDef, QueryResult } from '../../types';

export const INITIAL_DATABASE: Record<string, TableDef> = {
  students: {
    name: 'students',
    columns: [
      { name: 'id', type: 'INT', isPrimaryKey: true },
      { name: 'name', type: 'TEXT' },
      { name: 'major', type: 'TEXT' },
      { name: 'gpa', type: 'FLOAT' },
    ],
    rows: [
      { id: 1, name: 'Alice Chen', major: 'Computer Science', gpa: 3.9 },
      { id: 2, name: 'Bob Vance', major: 'Electrical Eng', gpa: 3.4 },
      { id: 3, name: 'Carol Danvers', major: 'Computer Science', gpa: 3.8 },
      { id: 4, name: 'David Kim', major: 'Robotics', gpa: 2.9 },
      { id: 5, name: 'Elena Rostova', major: 'Computer Science', gpa: 4.0 },
    ],
  },
  courses: {
    name: 'courses',
    columns: [
      { name: 'course_id', type: 'TEXT', isPrimaryKey: true },
      { name: 'title', type: 'TEXT' },
      { name: 'credits', type: 'INT' },
      { name: 'instructor', type: 'TEXT' },
    ],
    rows: [
      { course_id: 'CS101', title: 'Data Structures & Algorithms', credits: 4, instructor: 'Dr. Turing' },
      { course_id: 'CS202', title: 'Database Management Systems', credits: 3, instructor: 'Dr. Codd' },
      { course_id: 'EE105', title: 'Digital Logic Circuits', credits: 4, instructor: 'Dr. Shannon' },
      { course_id: 'CS301', title: 'Operating Systems Internals', credits: 4, instructor: 'Dr. Ritchie' },
    ],
  },
  enrollments: {
    name: 'enrollments',
    columns: [
      { name: 'enrollment_id', type: 'INT', isPrimaryKey: true },
      { name: 'student_id', type: 'INT' },
      { name: 'course_id', type: 'TEXT' },
      { name: 'grade', type: 'TEXT' },
    ],
    rows: [
      { enrollment_id: 101, student_id: 1, course_id: 'CS101', grade: 'A' },
      { enrollment_id: 102, student_id: 1, course_id: 'CS202', grade: 'A' },
      { enrollment_id: 103, student_id: 2, course_id: 'EE105', grade: 'B+' },
      { enrollment_id: 104, student_id: 3, course_id: 'CS101', grade: 'A-' },
      { enrollment_id: 105, student_id: 4, course_id: 'CS202', grade: 'C+' },
      { enrollment_id: 106, student_id: 5, course_id: 'CS301', grade: 'A' },
    ],
  },
};

export class SqlEngine {
  private tables: Record<string, TableDef>;

  constructor(initialTables?: Record<string, TableDef>) {
    this.tables = JSON.parse(JSON.stringify(initialTables || INITIAL_DATABASE));
  }

  getSchema(): Record<string, TableDef> {
    return this.tables;
  }

  resetDatabase() {
    this.tables = JSON.parse(JSON.stringify(INITIAL_DATABASE));
  }

  // Execute multi-statement SQL script separated by semicolons
  executeScript(script: string): QueryResult[] {
    const rawStatements = script
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith('--'));

    const results: QueryResult[] = [];

    for (let i = 0; i < rawStatements.length; i++) {
      const stmt = rawStatements[i];
      const startTime = performance.now();
      try {
        const res = this.executeSingleStatement(stmt);
        const endTime = performance.now();
        results.push({
          statementIndex: i + 1,
          statement: stmt,
          success: true,
          columns: res.columns,
          rows: res.rows,
          affectedRows: res.affectedRows,
          executionTimeMs: Math.round((endTime - startTime) * 10) / 10,
        });
      } catch (err: any) {
        const endTime = performance.now();
        results.push({
          statementIndex: i + 1,
          statement: stmt,
          success: false,
          error: `Statement #${i + 1} Error: ${err.message}`,
          executionTimeMs: Math.round((endTime - startTime) * 10) / 10,
        });
      }
    }

    return results;
  }

  private executeSingleStatement(stmt: string): {
    columns?: string[];
    rows?: Record<string, any>[];
    affectedRows?: number;
  } {
    const clean = stmt.replace(/\s+/g, ' ').trim();
    const upper = clean.toUpperCase();

    // 1. CREATE TABLE
    if (upper.startsWith('CREATE TABLE')) {
      return this.handleCreateTable(clean);
    }

    // 2. INSERT INTO
    if (upper.startsWith('INSERT INTO')) {
      return this.handleInsert(clean);
    }

    // 3. UPDATE
    if (upper.startsWith('UPDATE ')) {
      return this.handleUpdate(clean);
    }

    // 4. DELETE FROM
    if (upper.startsWith('DELETE FROM')) {
      return this.handleDelete(clean);
    }

    // 5. SELECT
    if (upper.startsWith('SELECT ')) {
      return this.handleSelect(clean);
    }

    // 6. DROP TABLE
    if (upper.startsWith('DROP TABLE')) {
      const match = clean.match(/DROP\s+TABLE\s+(?:IF\s+EXISTS\s+)?(\w+)/i);
      if (!match) throw new Error('Syntax error in DROP TABLE statement.');
      const tbl = match[1].toLowerCase();
      if (!this.tables[tbl]) {
        if (upper.includes('IF EXISTS')) {
          return { affectedRows: 0 };
        }
        throw new Error(`Table '${tbl}' does not exist.`);
      }
      delete this.tables[tbl];
      return { affectedRows: 0 };
    }

    // 7. SHOW TABLES
    if (upper.startsWith('SHOW TABLES')) {
      const tableNames = Object.keys(this.tables).map((t) => ({
        table_name: t,
        columns: this.tables[t].columns.length,
        row_count: this.tables[t].rows.length,
      }));
      return {
        columns: ['table_name', 'columns', 'row_count'],
        rows: tableNames,
      };
    }

    throw new Error(`Unsupported SQL command. (Must begin with SELECT, INSERT, UPDATE, DELETE, CREATE TABLE, or DROP TABLE)`);
  }

  private handleCreateTable(stmt: string) {
    const match = stmt.match(/CREATE\s+TABLE\s+(\w+)\s*\((.+)\)/i);
    if (!match) throw new Error('Syntax error in CREATE TABLE definition.');
    const tableName = match[1].toLowerCase();
    const colsDef = match[2];

    if (this.tables[tableName]) {
      throw new Error(`Table '${tableName}' already exists.`);
    }

    const columns: ColumnDef[] = [];
    const colParts = colsDef.split(',').map((c) => c.trim());

    for (const part of colParts) {
      const [colName, colType] = part.split(/\s+/);
      const isPk = part.toUpperCase().includes('PRIMARY KEY');
      const validTypes: any[] = ['INT', 'TEXT', 'FLOAT', 'BOOLEAN'];
      const uType = (colType || 'TEXT').toUpperCase();
      columns.push({
        name: colName,
        type: (validTypes.includes(uType) ? uType : 'TEXT') as 'INT' | 'TEXT' | 'FLOAT' | 'BOOLEAN',
        isPrimaryKey: isPk,
      });
    }

    this.tables[tableName] = {
      name: tableName,
      columns,
      rows: [],
    };

    return { affectedRows: 0 };
  }

  private handleInsert(stmt: string) {
    const match = stmt.match(/INSERT\s+INTO\s+(\w+)\s*(?:\(([^)]+)\))?\s*VALUES\s*\((.+)\)/i);
    if (!match) throw new Error('Syntax error in INSERT statement. Example: INSERT INTO table VALUES (...);');

    const tableName = match[1].toLowerCase();
    const table = this.tables[tableName];
    if (!table) throw new Error(`Table '${tableName}' does not exist.`);

    const explicitCols = match[2] ? match[2].split(',').map((c) => c.trim()) : table.columns.map((c) => c.name);
    const rawVals = match[3].split(',').map((v) => v.trim());

    if (explicitCols.length !== rawVals.length) {
      throw new Error(`Column count (${explicitCols.length}) does not match value count (${rawVals.length}).`);
    }

    const newRow: Record<string, any> = {};
    for (let i = 0; i < explicitCols.length; i++) {
      const colName = explicitCols[i];
      let valStr = rawVals[i];
      if (
        (valStr.startsWith("'") && valStr.endsWith("'")) ||
        (valStr.startsWith('"') && valStr.endsWith('"'))
      ) {
        newRow[colName] = valStr.substring(1, valStr.length - 1);
      } else if (!isNaN(Number(valStr))) {
        newRow[colName] = Number(valStr);
      } else {
        newRow[colName] = valStr;
      }
    }

    table.rows.push(newRow);
    return { affectedRows: 1 };
  }

  private handleUpdate(stmt: string) {
    const match = stmt.match(/UPDATE\s+(\w+)\s+SET\s+(.+?)(?:\s+WHERE\s+(.+))?$/i);
    if (!match) throw new Error('Syntax error in UPDATE statement.');

    const tableName = match[1].toLowerCase();
    const setClause = match[2];
    const whereClause = match[3];

    const table = this.tables[tableName];
    if (!table) throw new Error(`Table '${tableName}' does not exist.`);

    const [setCol, setValRaw] = setClause.split('=').map((s) => s.trim());
    let setVal: any = setValRaw;
    if (
      (setValRaw.startsWith("'") && setValRaw.endsWith("'")) ||
      (setValRaw.startsWith('"') && setValRaw.endsWith('"'))
    ) {
      setVal = setValRaw.substring(1, setValRaw.length - 1);
    } else if (!isNaN(Number(setValRaw))) {
      setVal = Number(setValRaw);
    }

    let affected = 0;
    for (const row of table.rows) {
      if (!whereClause || this.evaluateWhere(row, whereClause)) {
        row[setCol] = setVal;
        affected++;
      }
    }

    return { affectedRows: affected };
  }

  private handleDelete(stmt: string) {
    const match = stmt.match(/DELETE\s+FROM\s+(\w+)(?:\s+WHERE\s+(.+))?$/i);
    if (!match) throw new Error('Syntax error in DELETE statement.');

    const tableName = match[1].toLowerCase();
    const whereClause = match[2];

    const table = this.tables[tableName];
    if (!table) throw new Error(`Table '${tableName}' does not exist.`);

    const initialLen = table.rows.length;
    if (!whereClause) {
      table.rows = [];
      return { affectedRows: initialLen };
    }

    table.rows = table.rows.filter((row) => !this.evaluateWhere(row, whereClause));
    return { affectedRows: initialLen - table.rows.length };
  }

  private handleSelect(stmt: string) {
    // Basic regex parser for SELECT with JOIN, WHERE, GROUP BY, ORDER BY, LIMIT
    const match = stmt.match(
      /SELECT\s+(.+?)\s+FROM\s+(\w+)(?:\s+INNER\s+JOIN\s+(\w+)\s+ON\s+(.+?))?(?:\s+WHERE\s+(.+?))?(?:\s+GROUP\s+BY\s+(.+?))?(?:\s+ORDER\s+BY\s+(.+?))?(?:\s+LIMIT\s+(\d+))?$/i
    );

    if (!match) {
      throw new Error('Malformed SELECT query. Please check syntax.');
    }

    const selectColsRaw = match[1].trim();
    const primaryTable = match[2].toLowerCase();
    const joinTable = match[3]?.toLowerCase();
    const joinOn = match[4];
    const whereClause = match[5];
    const groupByClause = match[6];
    const orderByClause = match[7];
    const limitClause = match[8];

    const pTable = this.tables[primaryTable];
    if (!pTable) throw new Error(`Table '${primaryTable}' not found in database.`);

    let workingRows: Record<string, any>[] = pTable.rows.map((r) => ({ ...r }));

    // JOIN handling
    if (joinTable && joinOn) {
      const jTable = this.tables[joinTable];
      if (!jTable) throw new Error(`Joined table '${joinTable}' not found.`);

      // e.g. enrollments.student_id = students.id
      const [leftSide, rightSide] = joinOn.split('=').map((s) => s.trim());
      const leftParts = leftSide.split('.');
      const rightParts = rightSide.split('.');

      const getVal = (row: Record<string, any>, tblName: string, parts: string[]) => {
        if (parts.length > 1) {
          if (parts[0].toLowerCase() === tblName) {
            return row[parts[1]];
          }
          return undefined;
        }
        return row[parts[0]];
      };

      const joined: Record<string, any>[] = [];
      for (const pRow of workingRows) {
        for (const jRow of jTable.rows) {
          let pVal = getVal(pRow, primaryTable, leftParts);
          let jVal = getVal(jRow, joinTable, rightParts);
          if (pVal === undefined || jVal === undefined) {
            // Check reverse
            pVal = getVal(pRow, primaryTable, rightParts);
            jVal = getVal(jRow, joinTable, leftParts);
          }
          if (pVal === undefined) {
            const c = leftParts.length > 1 ? leftParts[1] : leftParts[0];
            pVal = pRow[c];
          }
          if (jVal === undefined) {
            const c = rightParts.length > 1 ? rightParts[1] : rightParts[0];
            jVal = jRow[c];
          }
          if (pVal !== undefined && jVal !== undefined && String(pVal) === String(jVal)) {
            joined.push({ ...pRow, ...jRow });
          }
        }
      }
      workingRows = joined;
    }

    // WHERE filtering
    if (whereClause) {
      workingRows = workingRows.filter((row) => this.evaluateWhere(row, whereClause));
    }

    // Aggregate functions check: COUNT(*), COUNT(col), AVG(col), SUM(col), MIN(col), MAX(col)
    const upperCols = selectColsRaw.toUpperCase();
    const hasAgg =
      upperCols.includes('COUNT(') ||
      upperCols.includes('SUM(') ||
      upperCols.includes('AVG(') ||
      upperCols.includes('MIN(') ||
      upperCols.includes('MAX(');

    if (groupByClause || hasAgg) {
      const colTokens = selectColsRaw.split(',').map((s) => s.trim());
      const groupColNames = groupByClause
        ? groupByClause.split(',').map((s) => {
            const t = s.trim();
            return t.includes('.') ? t.split('.')[1] : t;
          })
        : [];

      // Group rows
      const groups = new Map<string, Record<string, any>[]>();
      if (groupColNames.length > 0) {
        for (const r of workingRows) {
          const key = groupColNames.map((c) => String(r[c] ?? '')).join(':::');
          if (!groups.has(key)) groups.set(key, []);
          groups.get(key)!.push(r);
        }
      } else {
        groups.set('__ALL__', workingRows);
      }

      const computeAggForGroup = (rows: Record<string, any>[]): Record<string, any> => {
        const rowResult: Record<string, any> = {};
        for (const token of colTokens) {
          const uTok = token.toUpperCase();
          const cleanToken = token.includes('.') && !uTok.includes('(') ? token.split('.')[1] : token;
          if (uTok.startsWith('COUNT(')) {
            const inner = token.substring(token.indexOf('(') + 1, token.indexOf(')')).trim();
            if (inner === '*' || inner === '1') {
              rowResult[token] = rows.length;
            } else {
              const col = inner.includes('.') ? inner.split('.')[1] : inner;
              rowResult[token] = rows.filter((r) => r[col] !== undefined && r[col] !== null).length;
            }
          } else if (uTok.startsWith('SUM(')) {
            const colRaw = token.substring(4, token.indexOf(')')).trim();
            const col = colRaw.includes('.') ? colRaw.split('.')[1] : colRaw;
            rowResult[token] = rows.reduce((acc, r) => acc + (Number(r[col]) || 0), 0);
          } else if (uTok.startsWith('AVG(')) {
            const colRaw = token.substring(4, token.indexOf(')')).trim();
            const col = colRaw.includes('.') ? colRaw.split('.')[1] : colRaw;
            const sum = rows.reduce((acc, r) => acc + (Number(r[col]) || 0), 0);
            rowResult[token] = rows.length > 0 ? Number((sum / rows.length).toFixed(2)) : 0;
          } else if (uTok.startsWith('MAX(')) {
            const colRaw = token.substring(4, token.indexOf(')')).trim();
            const col = colRaw.includes('.') ? colRaw.split('.')[1] : colRaw;
            rowResult[token] = rows.length > 0 ? Math.max(...rows.map((r) => Number(r[col]) || 0)) : null;
          } else if (uTok.startsWith('MIN(')) {
            const colRaw = token.substring(4, token.indexOf(')')).trim();
            const col = colRaw.includes('.') ? colRaw.split('.')[1] : colRaw;
            rowResult[token] = rows.length > 0 ? Math.min(...rows.map((r) => Number(r[col]) || 0)) : null;
          } else {
            // Grouping column or standard field
            rowResult[token] = rows[0]?.[cleanToken] ?? rows[0]?.[token] ?? null;
          }
        }
        return rowResult;
      };

      let groupedRows: Record<string, any>[] = [];
      for (const rows of groups.values()) {
        groupedRows.push(computeAggForGroup(rows));
      }

      // ORDER BY
      if (orderByClause) {
        const [col, dir] = orderByClause.trim().split(/\s+/);
        const isDesc = dir && dir.toUpperCase() === 'DESC';
        groupedRows.sort((a, b) => {
          const valA = a[col];
          const valB = b[col];
          if (valA === valB) return 0;
          if (valA > valB) return isDesc ? -1 : 1;
          return isDesc ? 1 : -1;
        });
      }

      // LIMIT
      if (limitClause) {
        const limitNum = parseInt(limitClause, 10);
        if (!isNaN(limitNum)) groupedRows = groupedRows.slice(0, limitNum);
      }

      return {
        columns: colTokens,
        rows: groupedRows,
      };
    }

    // ORDER BY
    if (orderByClause) {
      const [col, dir] = orderByClause.trim().split(/\s+/);
      const isDesc = dir && dir.toUpperCase() === 'DESC';
      workingRows.sort((a, b) => {
        const valA = a[col];
        const valB = b[col];
        if (valA === valB) return 0;
        if (valA > valB) return isDesc ? -1 : 1;
        return isDesc ? 1 : -1;
      });
    }

    // LIMIT
    if (limitClause) {
      const limitNum = parseInt(limitClause, 10);
      if (!isNaN(limitNum)) {
        workingRows = workingRows.slice(0, limitNum);
      }
    }

    // Columns projection
    let resultCols: string[] = [];
    if (selectColsRaw === '*') {
      resultCols = workingRows.length > 0 ? Object.keys(workingRows[0]) : pTable.columns.map((c) => c.name);
    } else {
      resultCols = selectColsRaw.split(',').map((c) => {
        const t = c.trim();
        return t.includes('.') ? t.split('.')[1] : t;
      });
      workingRows = workingRows.map((r) => {
        const proj: Record<string, any> = {};
        for (const c of resultCols) {
          proj[c] = r[c] ?? null;
        }
        return proj;
      });
    }

    return {
      columns: resultCols,
      rows: workingRows,
    };
  }

  private evaluateWhere(row: Record<string, any>, whereClause: string): boolean {
    // Support =, !=, >, <, >=, <=, LIKE
    const tokens = whereClause.split(/\s+AND\s+/i);

    return tokens.every((tok) => {
      const match = tok.match(/(\w+(?:\.\w+)?)\s*(=|!=|>=|<=|>|<|LIKE)\s*(.+)/i);
      if (!match) return true;

      const rawCol = match[1];
      const col = rawCol.includes('.') ? rawCol.split('.')[1] : rawCol;
      const op = match[2].toUpperCase();
      let expectedRaw = match[3].trim();

      let expected: any = expectedRaw;
      if (
        (expectedRaw.startsWith("'") && expectedRaw.endsWith("'")) ||
        (expectedRaw.startsWith('"') && expectedRaw.endsWith('"'))
      ) {
        expected = expectedRaw.substring(1, expectedRaw.length - 1);
      } else if (!isNaN(Number(expectedRaw))) {
        expected = Number(expectedRaw);
      }

      const actual = row[col];
      if (actual === undefined) return false;

      if (op === '=') return String(actual).toLowerCase() === String(expected).toLowerCase();
      if (op === '!=') return String(actual).toLowerCase() !== String(expected).toLowerCase();
      if (op === '>') return Number(actual) > Number(expected);
      if (op === '<') return Number(actual) < Number(expected);
      if (op === '>=') return Number(actual) >= Number(expected);
      if (op === '<=') return Number(actual) <= Number(expected);
      if (op === 'LIKE') {
        const pattern = String(expected).replace(/%/g, '.*');
        return new RegExp(`^${pattern}$`, 'i').test(String(actual));
      }

      return true;
    });
  }
}
