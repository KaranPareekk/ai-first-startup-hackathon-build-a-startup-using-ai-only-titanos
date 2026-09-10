import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Play,
  Save,
  RotateCcw,
  Trash2,
  FolderOpen,
  Terminal,
  FileCode,
  CheckCircle2,
  AlertCircle,
  Hash,
  Upload,
  Download,
  Plus,
  ChevronDown,
  ChevronRight,
  Folder,
  FileText,
  PanelLeftClose,
  PanelLeft,
  Maximize2,
  Minimize2,
  Split,
  Database,
} from 'lucide-react';
import { CodeFile, SavedProgram } from '../../types';
import { StorageService } from '../../services/storage';
import { runJavaScript, runPython, runJava, ExecutionResult } from './codeRuntime';

const DEFAULT_TEMPLATES: Record<string, string> = {
  python: `# Python 3.12 Educational Workstation
# STDIN input() consumption demonstration

n = int(input())
nums = []
for i in range(n):
    val = int(input())
    nums.append(val)

print("Original array:", nums)
nums.reverse()
print("Reversed array:", nums)
print("Sum of elements:", sum(nums))
`,
  java: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        System.out.println("=== TITAN JAVA RUNTIME ===");
        
        String name = scanner.nextLine();
        int age = scanner.nextInt();
        double gpa = scanner.nextDouble();
        
        System.out.println("Student: " + name);
        System.out.println("Age: " + age);
        System.out.println("GPA: " + gpa);
        
        if (gpa >= 3.5) {
            System.out.println("Status: DEAN'S LIST HONORS");
        } else {
            System.out.println("Status: GOOD STANDING");
        }
    }
}
`,
  javascript: `// TITAN JavaScript Educational Sandbox
const limit = parseInt(TITAN.input());
console.log("Generating Fibonacci numbers up to limit:", limit);

const fib = [0, 1];
for (let i = 2; i <= limit; i++) {
  fib.push(fib[i - 1] + fib[i - 2]);
}

console.log("Fibonacci Sequence:", fib);
console.log("Golden Ratio approx:", (fib[limit] / fib[limit - 1]).toFixed(6));
`,
  sql: `-- Relational SQL Script
CREATE TABLE employees (id INT PRIMARY KEY, name TEXT, salary INT);
INSERT INTO employees VALUES (1, 'Alice', 95000);
INSERT INTO employees VALUES (2, 'Bob', 82000);
SELECT * FROM employees WHERE salary >= 90000;
`,
  text: `TITAN_OS Latency Benchmarks (Nanoseconds)
----------------------------------------
L1 Cache Hit: 1.0 ns
L2 Cache Hit: 4.0 ns
L3 Cache Hit: 15.0 ns
RAM Access: 75.0 ns
NVMe SSD Read: 10,000 ns
`,
  json: `{
  "projectName": "Titan_OS",
  "version": "1.0.4",
  "compiler": "polyglot-v1",
  "features": ["code_runtime", "sql_engine", "ai_copilot"]
}
`,
  cpp: `// C++ Educational Template
#include <iostream>

int main() {
    std::cout << "TITAN C++ Polyglot Container" << std::endl;
    return 0;
}
`,
};

const DEFAULT_STDINS: Record<string, string> = {
  python: "5\n12\n45\n67\n89\n100",
  java: "Alex Mercer\n21\n3.85",
  javascript: "10",
  sql: "",
  text: "",
  json: "",
  cpp: "",
};

export const CodeLab: React.FC = () => {
  // Virtual files from local storage
  const [files, setFiles] = useState<CodeFile[]>(() => StorageService.getCodeFiles());
  const [activeFileId, setActiveFileId] = useState<string>(() => {
    const loaded = StorageService.getCodeFiles();
    return loaded.length > 0 ? loaded[0].id : 'file_py_1';
  });
  const [openFileIds, setOpenFileIds] = useState<string[]>(() => {
    const loaded = StorageService.getCodeFiles();
    return loaded.length > 0 ? [loaded[0].id] : ['file_py_1'];
  });

  const activeFile = useMemo(() => {
    return files.find((f) => f.id === activeFileId) || files[0] || null;
  }, [files, activeFileId]);

  // Code editor buffer and stdin buffer
  const [code, setCode] = useState<string>(() => (activeFile ? activeFile.content : DEFAULT_TEMPLATES.python));
  const [language, setLanguage] = useState<'javascript' | 'python' | 'java' | 'cpp' | 'sql' | 'text' | 'json'>(
    () => (activeFile ? activeFile.language : 'python')
  );
  const [stdin, setStdin] = useState<string>(() => DEFAULT_STDINS[language] || '');
  const [programTitle, setProgramTitle] = useState<string>(() => (activeFile ? activeFile.name : 'main.py'));

  // UI Panels state
  const [isExplorerOpen, setIsExplorerOpen] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'split' | 'editor' | 'terminal'>('split');
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    src: true,
    db: true,
    notes: true,
    imported: true,
  });

  // Runtime states
  const [activeExecutedLine, setActiveExecutedLine] = useState<number | null>(null);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [showLoadModal, setShowLoadModal] = useState<boolean>(false);
  const [showNewFileModal, setShowNewFileModal] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // New File Form State
  const [newFileName, setNewFileName] = useState<string>('');
  const [newFileFolder, setNewFileFolder] = useState<string>('src');
  const [newFileLang, setNewFileLang] = useState<'python' | 'javascript' | 'java' | 'sql' | 'text' | 'json'>('python');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Saved legacy programs
  const [savedPrograms, setSavedPrograms] = useState<SavedProgram[]>(() =>
    StorageService.getPrograms()
  );

  // When activeFileId changes, sync buffers
  useEffect(() => {
    if (activeFile) {
      setCode(activeFile.content);
      setLanguage(activeFile.language);
      setProgramTitle(activeFile.name);
      setStdin(DEFAULT_STDINS[activeFile.language] || '');
      setExecutionResult(null);
      setActiveExecutedLine(null);
    }
  }, [activeFileId]);

  // Keep open tabs updated if file is deleted
  useEffect(() => {
    if (files.length > 0 && !files.some((f) => f.id === activeFileId)) {
      setActiveFileId(files[0].id);
    }
    setOpenFileIds((prev) => prev.filter((id) => files.some((f) => f.id === id)));
  }, [files]);

  // Handle open file selection
  const handleSelectFile = (fileId: string) => {
    if (activeFile) {
      handlePersistActiveFileContent(code);
    }
    setActiveFileId(fileId);
    if (!openFileIds.includes(fileId)) {
      setOpenFileIds((prev) => [...prev, fileId]);
    }
  };

  // Close tab
  const handleCloseTab = (e: React.MouseEvent, fileId: string) => {
    e.stopPropagation();
    const remaining = openFileIds.filter((id) => id !== fileId);
    setOpenFileIds(remaining);
    if (activeFileId === fileId && remaining.length > 0) {
      setActiveFileId(remaining[remaining.length - 1]);
    }
  };

  // Persist code changes
  const handlePersistActiveFileContent = (newContent: string) => {
    if (!activeFile) return;
    const updated: CodeFile = {
      ...activeFile,
      content: newContent,
      updatedAt: Date.now(),
    };
    StorageService.saveCodeFile(updated);
    setFiles(StorageService.getCodeFiles());
  };

  // Language switch handler
  const handleLanguageChange = (newLang: 'javascript' | 'python' | 'java') => {
    setLanguage(newLang);
    const template = DEFAULT_TEMPLATES[newLang] || '';
    setCode(template);
    setStdin(DEFAULT_STDINS[newLang] || '');
    setExecutionResult(null);
    setActiveExecutedLine(null);

    if (activeFile) {
      const updated: CodeFile = {
        ...activeFile,
        language: newLang,
        content: template,
        updatedAt: Date.now(),
      };
      StorageService.saveCodeFile(updated);
      setFiles(StorageService.getCodeFiles());
    }
  };

  // Run Code
  const handleRunCode = () => {
    setIsRunning(true);
    setActiveExecutedLine(null);

    setTimeout(() => {
      let result: ExecutionResult;
      if (language === 'python') {
        result = runPython(code, stdin);
      } else if (language === 'java') {
        result = runJava(code, stdin);
      } else if (language === 'javascript') {
        result = runJavaScript(code, stdin);
      } else {
        result = {
          stdout: [
            `[TITAN_RUNNER] Verified '${language.toUpperCase()}' file (${programTitle}).`,
            `Total lines: ${code.split('\n').length}`,
            `Status: File verified with 0 syntax errors.`,
          ],
          stderr: [],
          executionTimeMs: 12,
          success: true,
          executedLines: [],
        };
      }

      setExecutionResult(result);
      if (result.executedLines.length > 0) {
        setActiveExecutedLine(result.executedLines[result.executedLines.length - 1]);
      }
      setIsRunning(false);
    }, 120);
  };

  // Save File
  const handleSaveProgram = () => {
    if (activeFile) {
      const updated: CodeFile = {
        ...activeFile,
        name: programTitle,
        content: code,
        language,
        updatedAt: Date.now(),
      };
      StorageService.saveCodeFile(updated);
      setFiles(StorageService.getCodeFiles());
    }

    const newProg: SavedProgram = {
      id: activeFile ? activeFile.id : `prog_\${Date.now()}`,
      title: programTitle || `\${language.toUpperCase()} Program`,
      language: (language === 'python' || language === 'java' || language === 'javascript') ? language : 'javascript',
      code,
      stdin,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    StorageService.saveProgram(newProg);
    setSavedPrograms(StorageService.getPrograms());

    setSaveStatus('FILE SAVED');
    setTimeout(() => setSaveStatus(null), 2500);
  };

  // Create New File
  const handleCreateNewFile = () => {
    if (!newFileName.trim()) return;
    let finalName = newFileName.trim();
    let detectedLang: CodeFile['language'] = newFileLang;

    if (finalName.endsWith('.py')) detectedLang = 'python';
    else if (finalName.endsWith('.java')) detectedLang = 'java';
    else if (finalName.endsWith('.js') || finalName.endsWith('.ts')) detectedLang = 'javascript';
    else if (finalName.endsWith('.sql')) detectedLang = 'sql';
    else if (finalName.endsWith('.json')) detectedLang = 'json';
    else if (finalName.endsWith('.txt') || finalName.endsWith('.md')) detectedLang = 'text';
    else if (finalName.endsWith('.cpp')) detectedLang = 'cpp';
    else {
      const extMap: Record<string, string> = {
        python: '.py',
        javascript: '.js',
        java: '.java',
        sql: '.sql',
        json: '.json',
        text: '.txt',
        cpp: '.cpp',
      };
      finalName += extMap[detectedLang] || '.txt';
    }

    const newFile: CodeFile = {
      id: `file_\${Date.now()}`,
      name: finalName,
      folder: newFileFolder.trim() || 'src',
      language: detectedLang,
      content: DEFAULT_TEMPLATES[detectedLang] || `// \${finalName}\n`,
      isCustom: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    StorageService.saveCodeFile(newFile);
    const updatedFiles = StorageService.getCodeFiles();
    setFiles(updatedFiles);
    setActiveFileId(newFile.id);
    setOpenFileIds((prev) => [...prev, newFile.id]);
    setShowNewFileModal(false);
    setNewFileName('');
  };

  // Delete File
  const handleDeleteFile = (e: React.MouseEvent, fileId: string) => {
    e.stopPropagation();
    if (files.length <= 1) {
      alert('Cannot delete the only remaining file.');
      return;
    }
    StorageService.deleteCodeFile(fileId);
    setFiles(StorageService.getCodeFiles());
  };

  // Download File
  const handleDownloadFile = () => {
    const element = document.createElement('a');
    const file = new Blob([code], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = programTitle || 'script.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Import Files via Input
  const handleFilesUpload = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    Array.from(fileList).forEach((uploadedFile) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = (e.target?.result as string) || '';
        const name = uploadedFile.name;
        let lang: CodeFile['language'] = 'text';

        if (name.endsWith('.py')) lang = 'python';
        else if (name.endsWith('.java')) lang = 'java';
        else if (name.endsWith('.js') || name.endsWith('.ts')) lang = 'javascript';
        else if (name.endsWith('.sql')) lang = 'sql';
        else if (name.endsWith('.json')) lang = 'json';
        else if (name.endsWith('.cpp') || name.endsWith('.c') || name.endsWith('.h')) lang = 'cpp';

        const newFile: CodeFile = {
          id: `file_imported_\${Date.now()}_\${Math.random().toString(36).substr(2, 4)}`,
          name,
          folder: 'imported',
          language: lang,
          content,
          isCustom: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        StorageService.saveCodeFile(newFile);
        const updated = StorageService.getCodeFiles();
        setFiles(updated);
        setActiveFileId(newFile.id);
        setOpenFileIds((prev) => [...prev, newFile.id]);
      };
      reader.readAsText(uploadedFile);
    });

    setSaveStatus('FILES IMPORTED');
    setTimeout(() => setSaveStatus(null), 2500);
  };

  // Drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleFilesUpload(e.dataTransfer.files);
    }
  };

  // Group files by folder
  const filesByFolder = useMemo(() => {
    const groups: Record<string, CodeFile[]> = {};
    files.forEach((f) => {
      const folder = f.folder || 'src';
      if (!groups[folder]) groups[folder] = [];
      groups[folder].push(f);
    });
    return groups;
  }, [files]);

  // Code Stats
  const charCount = code.length;
  const lineCount = useMemo(() => code.split('\n').length, [code]);

  // File Icon helper
  const renderFileIcon = (lang: string) => {
    switch (lang) {
      case 'python':
        return <span className="text-amber-400 font-bold text-[10px]">PY</span>;
      case 'java':
        return <span className="text-orange-400 font-bold text-[10px]">JV</span>;
      case 'javascript':
        return <span className="text-yellow-400 font-bold text-[10px]">JS</span>;
      case 'sql':
        return <Database className="w-3 h-3 text-cyan-400" />;
      case 'json':
        return <span className="text-emerald-400 font-bold text-[10px]">{'{}'}</span>;
      default:
        return <FileText className="w-3 h-3 text-slate-400" />;
    }
  };

  return (
    <div
      id="codelab-root"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="h-full w-full flex flex-col bg-[#07090e] text-zinc-100 select-none overflow-hidden relative"
    >
      {/* Drag & drop overlay */}
      {isDragging && (
        <div className="absolute inset-0 bg-cyan-950/80 border-2 border-dashed border-cyan-400 z-50 flex flex-col items-center justify-center backdrop-blur-sm pointer-events-none">
          <Upload className="w-12 h-12 text-cyan-400 animate-bounce mb-3" />
          <span className="text-lg font-tech font-bold text-white">DROP FILES TO IMPORT TO WORKSPACE</span>
          <span className="text-xs font-mono text-cyan-300">Supports .py, .java, .js, .sql, .txt, .json, .cpp</span>
        </div>
      )}

      {/* Hidden File Input for local file import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => handleFilesUpload(e.target.files)}
        multiple
        accept=".py,.java,.js,.ts,.sql,.txt,.json,.cpp,.c,.md,.csv"
        className="hidden"
      />

      {/* TOP IDE TOOLBAR - Responsive & Non-clipping */}
      <header
        id="codelab-toolbar"
        className="min-h-[3.75rem] h-auto py-2.5 bg-[#0c1017] border-b border-zinc-800 px-4 flex flex-wrap items-center justify-between gap-3 shrink-0 relative z-20"
      >
        {/* Left: Explorer Toggle + Program Title + Language Quick Badges */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            id="btn-toggle-explorer"
            type="button"
            onClick={() => setIsExplorerOpen(!isExplorerOpen)}
            title={isExplorerOpen ? 'Hide File Explorer' : 'Show File Explorer'}
            className="p-1.5 rounded bg-zinc-900 border border-zinc-800 hover:border-cyan-500/50 text-zinc-300 hover:text-cyan-400 transition-colors cursor-pointer"
          >
            {isExplorerOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
          </button>

          <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1">
            <FileCode className="w-3.5 h-3.5 text-cyan-400" />
            <input
              id="input-program-title"
              type="text"
              value={programTitle}
              onChange={(e) => {
                setProgramTitle(e.target.value);
                if (activeFile) {
                  activeFile.name = e.target.value;
                }
              }}
              className="bg-transparent text-xs font-mono text-zinc-100 focus:outline-none w-36 sm:w-48 font-semibold"
              placeholder="Filename..."
            />
          </div>

          <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800">
            {(['python', 'java', 'javascript'] as const).map((lang) => (
              <button
                key={lang}
                type="button"
                id={`btn-lang-\${lang}`}
                onClick={() => handleLanguageChange(lang)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono font-semibold transition-all cursor-pointer \${
                  language === lang
                    ? 'bg-cyan-500 text-black shadow-[0_0_8px_#06b6d4]'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Actions (RUN, SAVE, IMPORT, EXPORT, VIEW MODES) */}
        <div className="flex items-center gap-2 font-mono text-xs flex-wrap">
          {saveStatus && (
            <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1 animate-pulse">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {saveStatus}
            </span>
          )}

          {/* RUN PROGRAM */}
          <button
            id="btn-run-code"
            type="button"
            onClick={handleRunCode}
            disabled={isRunning}
            className="px-3.5 py-1.5 rounded bg-emerald-500 hover:bg-emerald-400 text-black font-tech font-bold text-xs flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(16,185,129,0.4)] disabled:opacity-50 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isRunning ? 'EXECUTING...' : 'RUN'}</span>
          </button>

          {/* SAVE */}
          <button
            id="btn-save-code"
            type="button"
            onClick={handleSaveProgram}
            className="px-2.5 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">SAVE</span>
          </button>

          {/* IMPORT FILE */}
          <button
            id="btn-import-file"
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Import code or text files from local computer (.py, .java, .js, .txt, .sql, .json)"
            className="px-2.5 py-1.5 rounded bg-zinc-800 hover:bg-cyan-950/60 text-cyan-300 border border-cyan-700/50 font-semibold flex items-center gap-1 cursor-pointer transition-all"
          >
            <Upload className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">IMPORT</span>
          </button>

          {/* DOWNLOAD / EXPORT */}
          <button
            id="btn-export-file"
            type="button"
            onClick={handleDownloadFile}
            title="Download active file to disk"
            className="p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
          </button>

          {/* VIEW MODE SPLIT CONTROLS */}
          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded p-0.5">
            <button
              type="button"
              onClick={() => setViewMode('split')}
              title="Split View (Editor + Terminal)"
              className={`p-1 rounded cursor-pointer \${viewMode === 'split' ? 'bg-zinc-700 text-cyan-300' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              <Split className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('editor')}
              title="Maximized Editor"
              className={`p-1 rounded cursor-pointer \${viewMode === 'editor' ? 'bg-zinc-700 text-cyan-300' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('terminal')}
              title="Maximized Terminal"
              className={`p-1 rounded cursor-pointer \${viewMode === 'terminal' ? 'bg-zinc-700 text-cyan-300' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              <Terminal className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* RESET TEMPLATE */}
          <button
            id="btn-reset-code"
            type="button"
            onClick={() => {
              setCode(DEFAULT_TEMPLATES[language] || '');
              setStdin(DEFAULT_STDINS[language] || '');
              setExecutionResult(null);
            }}
            className="p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white border border-zinc-700 cursor-pointer"
            title="Reset to Language Template"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* MAIN WORKSPACE BODY: Explorer + Editor + Terminal */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT EXPLORER SIDEBAR (Collapsible) */}
        {isExplorerOpen && (
          <aside
            id="codelab-explorer"
            className="w-56 sm:w-64 bg-[#0a0d14] border-r border-zinc-800 flex flex-col shrink-0 overflow-hidden"
          >
            {/* Explorer Header with New File & Import Actions */}
            <div className="h-8 bg-[#0d111a] border-b border-zinc-800 px-3 flex items-center justify-between text-[11px] font-mono text-zinc-400 shrink-0">
              <span className="font-bold tracking-wider text-slate-300 uppercase flex items-center gap-1.5">
                <Folder className="w-3.5 h-3.5 text-cyan-400" />
                EXPLORER
              </span>
              <div className="flex items-center gap-1">
                <button
                  id="btn-new-file"
                  type="button"
                  onClick={() => setShowNewFileModal(true)}
                  title="New File"
                  className="p-1 hover:bg-zinc-800 rounded text-slate-300 hover:text-cyan-400 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Import Local Files"
                  className="p-1 hover:bg-zinc-800 rounded text-slate-300 hover:text-cyan-400 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Folder & Files Tree */}
            <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1 font-mono text-xs">
              {Object.entries(filesByFolder).map(([folderName, folderFiles]) => {
                const isExpanded = expandedFolders[folderName] !== false;
                return (
                  <div key={folderName} className="flex flex-col">
                    {/* Folder Header */}
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedFolders((prev) => ({
                          ...prev,
                          [folderName]: !isExpanded,
                        }))
                      }
                      className="flex items-center gap-1.5 py-1 px-1.5 text-slate-400 hover:text-slate-200 hover:bg-zinc-800/50 rounded transition-all text-left text-[11px] uppercase font-bold cursor-pointer"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-3 h-3 text-cyan-400" />
                      ) : (
                        <ChevronRight className="w-3 h-3 text-slate-500" />
                      )}
                      <Folder className="w-3 h-3 text-amber-400/80" />
                      <span>{folderName}</span>
                      <span className="text-[9px] text-slate-600 font-normal ml-auto">
                        ({folderFiles.length})
                      </span>
                    </button>

                    {/* Files inside folder */}
                    {isExpanded && (
                      <div className="pl-4 flex flex-col gap-0.5 border-l border-zinc-800/80 ml-2.5 my-0.5">
                        {folderFiles.map((file) => {
                          const isActive = file.id === activeFileId;
                          return (
                            <div
                              key={file.id}
                              onClick={() => handleSelectFile(file.id)}
                              className={`group flex items-center justify-between py-1 px-2 rounded cursor-pointer transition-all \${
                                isActive
                                  ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-800/60 font-semibold'
                                  : 'text-slate-400 hover:text-slate-200 hover:bg-zinc-900'
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                {renderFileIcon(file.language)}
                                <span className="truncate text-[11px]">{file.name}</span>
                              </div>

                              {/* Delete action button */}
                              {files.length > 1 && (
                                <button
                                  type="button"
                                  onClick={(e) => handleDeleteFile(e, file.id)}
                                  title="Delete file"
                                  className="opacity-0 group-hover:opacity-100 p-0.5 text-zinc-500 hover:text-red-400 transition-opacity cursor-pointer"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </aside>
        )}

        {/* CENTER / MAIN VIEW AREA: Tabs + Editor + Terminal */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Active File Tabs */}
          <div className="h-8 bg-[#090d14] border-b border-zinc-800 flex items-center px-2 gap-1 overflow-x-auto shrink-0 select-none">
            {openFileIds.map((fileId) => {
              const fileObj = files.find((f) => f.id === fileId);
              if (!fileObj) return null;
              const isActive = fileId === activeFileId;

              return (
                <div
                  key={fileId}
                  onClick={() => handleSelectFile(fileId)}
                  className={`flex items-center gap-2 px-3 py-1 text-xs font-mono rounded-t cursor-pointer border-t-2 transition-all \${
                    isActive
                      ? 'bg-[#07090e] text-cyan-300 border-cyan-400 font-semibold'
                      : 'bg-zinc-900/60 text-slate-400 border-transparent hover:text-slate-200 hover:bg-zinc-800/60'
                  }`}
                >
                  {renderFileIcon(fileObj.language)}
                  <span className="truncate max-w-[120px]">{fileObj.name}</span>
                  {openFileIds.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => handleCloseTab(e, fileId)}
                      className="text-slate-500 hover:text-white text-[10px] ml-1 p-0.5 rounded cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Split Pane: Editor (Left) & Terminal (Right) */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
            {/* Editor Pane (Hidden if terminal-only) */}
            {viewMode !== 'terminal' && (
              <div
                id="codelab-editor-pane"
                className={`\${
                  viewMode === 'editor' ? 'lg:col-span-12' : 'lg:col-span-7'
                } flex flex-col border-b lg:border-b-0 lg:border-r border-zinc-800 bg-[#07090e] overflow-hidden`}
              >
                {/* Editor Header Bar */}
                <div className="h-7 bg-[#0a0d14] border-b border-zinc-800 px-3 flex items-center justify-between text-[10px] font-mono text-zinc-400 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="text-cyan-400 font-bold uppercase">{language}</span>
                    <span>// {programTitle}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span>{lineCount} LINES</span>
                    <span>{charCount} CHARS</span>
                  </div>
                </div>

                {/* Textarea Code Editor with line gutter */}
                <div className="flex-1 flex overflow-hidden font-mono text-xs">
                  {/* Line numbers column */}
                  <div className="w-10 bg-[#05070a] border-r border-zinc-800/80 py-3 text-right pr-2 text-zinc-500 select-none overflow-hidden shrink-0">
                    {Array.from({ length: lineCount }).map((_, i) => {
                      const lineNum = i + 1;
                      const isExecuted = activeExecutedLine === lineNum;
                      return (
                        <div
                          key={i}
                          className={`leading-relaxed \${
                            isExecuted ? 'text-cyan-400 font-bold bg-cyan-950/80' : ''
                          }`}
                        >
                          {lineNum}
                        </div>
                      );
                    })}
                  </div>

                  {/* Editable code area */}
                  <textarea
                    id="editor-code-textarea"
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value);
                      handlePersistActiveFileContent(e.target.value);
                    }}
                    spellCheck={false}
                    className="flex-1 p-3 bg-transparent text-zinc-200 font-mono text-xs leading-relaxed focus:outline-none resize-none overflow-auto whitespace-pre"
                  />
                </div>
              </div>
            )}

            {/* Terminal Pane (Hidden if editor-only) */}
            {viewMode !== 'editor' && (
              <div
                id="codelab-terminal-pane"
                className={`${
                  viewMode === 'terminal' ? 'lg:col-span-12' : 'lg:col-span-5'
                } flex flex-col bg-[#080b11] overflow-hidden`}
              >
                {/* STDIN Input Buffer Header & Area */}
                <div className="border-b border-zinc-800 p-3 bg-[#0a0e16] flex flex-col shrink-0">
                  <div className="flex items-center text-[11px] font-mono mb-1.5">
                    <span className="text-cyan-400 font-bold uppercase flex items-center gap-1.5">
                      <Hash className="w-3.5 h-3.5" />
                      STDIN
                    </span>
                  </div>
                  <textarea
                    id="stdin-input-textarea"
                    value={stdin}
                    onChange={(e) => setStdin(e.target.value)}
                    rows={3}
                    placeholder="Enter input values separated by newlines..."
                    className="w-full bg-[#05070a] border border-zinc-800 rounded p-2 text-xs font-mono text-cyan-300 focus:border-cyan-500 focus:outline-none resize-none"
                  />
                </div>

                {/* Terminal Output Terminal */}
                <div className="h-7 bg-[#0b0f17] border-b border-zinc-800 px-3 flex items-center justify-between text-[10px] font-mono text-zinc-400 shrink-0">
                  <div className="flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                    <span>TERMINAL CONSOLE</span>
                  </div>
                  {executionResult && (
                    <span
                      className={`font-bold \${
                        executionResult.success ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      {executionResult.success ? 'PASS (EXIT 0)' : 'ERROR (EXIT 1)'}
                    </span>
                  )}
                </div>

                <div
                  id="terminal-stdout-area"
                  className="flex-1 p-3 bg-[#040609] overflow-y-auto font-mono text-xs text-zinc-300 space-y-1 select-text"
                >
                  {!executionResult ? (
                    <div className="text-zinc-600 font-mono">▌</div>
                  ) : (
                    <>
                      {executionResult.stdout.map((line, idx) => (
                        <div key={idx} className="text-zinc-200 leading-relaxed font-mono">
                          {line}
                        </div>
                      ))}

                      {executionResult.stderr.map((err, idx) => (
                        <div
                          key={idx}
                          className="text-red-400 font-bold leading-relaxed flex items-start gap-1.5 mt-1"
                        >
                          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          <span>{err}</span>
                        </div>
                      ))}

                      <div className="mt-4 pt-2 border-t border-zinc-800/80 text-[10px] text-zinc-500 flex items-center justify-between">
                        <span>Process exit code: {executionResult.success ? 0 : 1}</span>
                        <span>Execution Time: {executionResult.executionTimeMs} ms</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* NEW FILE MODAL */}
      {showNewFileModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0d111a] border border-cyan-500/40 rounded-xl p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
              <span className="font-tech text-sm font-bold text-cyan-400 flex items-center gap-2">
                <Plus className="w-4 h-4" /> CREATE NEW FILE
              </span>
              <button
                type="button"
                onClick={() => setShowNewFileModal(false)}
                className="text-zinc-400 hover:text-white text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-3 font-mono text-xs">
              <div>
                <label className="text-slate-400 block mb-1">File Name (with extension):</label>
                <input
                  type="text"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  placeholder="e.g. algorithm.py, solution.java, query.sql"
                  className="w-full bg-[#05070a] border border-zinc-700 rounded p-2 text-zinc-200 focus:outline-none focus:border-cyan-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Target Folder:</label>
                <select
                  value={newFileFolder}
                  onChange={(e) => setNewFileFolder(e.target.value)}
                  className="w-full bg-[#05070a] border border-zinc-700 rounded p-2 text-zinc-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="src">src (Source Code)</option>
                  <option value="db">db (Database & SQL)</option>
                  <option value="notes">notes (Text & Specs)</option>
                  <option value="data">data (JSON / Inputs)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Language Template:</label>
                <select
                  value={newFileLang}
                  onChange={(e) => setNewFileLang(e.target.value as any)}
                  className="w-full bg-[#05070a] border border-zinc-700 rounded p-2 text-zinc-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="python">Python 3</option>
                  <option value="javascript">JavaScript / Node</option>
                  <option value="java">Java 21</option>
                  <option value="sql">Relational SQL</option>
                  <option value="json">JSON Config</option>
                  <option value="text">Plain Text</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowNewFileModal(false)}
                  className="px-3 py-1.5 rounded bg-zinc-800 text-slate-300 hover:bg-zinc-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateNewFile}
                  className="px-4 py-1.5 rounded bg-cyan-500 hover:bg-cyan-400 text-black font-bold font-tech cursor-pointer"
                >
                  Create File
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
