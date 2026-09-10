import React, { useState, useMemo, useEffect } from 'react';
import {
  Database,
  Play,
  RotateCcw,
  Table as TableIcon,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Key,
  Layers,
  Sparkles,
  Plus,
  Trash2,
  Download,
  ChevronDown,
  ChevronRight,
  Search,
  Code2,
  Copy,
  ExternalLink,
  SlidersHorizontal,
} from 'lucide-react';
import { QueryResult, TableDef } from '../../types';
import { SqlEngine } from './sqlEngine';

const SAMPLE_QUERIES = [
  {
    title: 'Select All Students',
    query: `SELECT * FROM students;`,
  },
  {
    title: 'Multi-Statement: Create & Query New Table',
    query: `-- Create a new table, insert rows, and select
CREATE TABLE engineering_projects (id INT PRIMARY KEY, name TEXT, category TEXT, stars INT);
INSERT INTO engineering_projects VALUES (1, 'Titan_Kernel', 'OS', 3500);
INSERT INTO engineering_projects VALUES (2, 'Fast_BTree', 'Storage', 1200);
INSERT INTO engineering_projects VALUES (3, 'NeuroCircuit', 'AI', 4800);
SELECT * FROM engineering_projects WHERE stars >= 2000;`,
  },
  {
    title: 'Inner Join (Students & Courses)',
    query: `SELECT students.name, courses.title, enrollments.grade
FROM enrollments
INNER JOIN students ON enrollments.student_id = students.id
WHERE students.gpa >= 3.5;`,
  },
  {
    title: 'Group By & Aggregate Analytics',
    query: `SELECT major, COUNT(*), AVG(gpa), MAX(gpa)
FROM students
GROUP BY major
ORDER BY AVG(gpa) DESC;`,
  },
  {
    title: 'Update & Filter Query',
    query: `UPDATE students SET gpa = 3.98 WHERE name = 'Carol Danvers';
SELECT * FROM students ORDER BY gpa DESC;`,
  },
];

export const DbmsLab: React.FC = () => {
  const engine = useMemo(() => new SqlEngine(), []);
  const [schemaVersion, setSchemaVersion] = useState<number>(0);
  const schema = useMemo(() => engine.getSchema(), [engine, schemaVersion]);

  // Active database name (supports custom created databases)
  const [databases, setDatabases] = useState<string[]>(['titan_primary_db', 'analytics_dw']);
  const [activeDb, setActiveDb] = useState<string>('titan_primary_db');
  const [newDbModalOpen, setNewDbModalOpen] = useState<boolean>(false);
  const [newDbInput, setNewDbInput] = useState<string>('');

  // Table search & expand state in sidebar
  const [tableSearchTerm, setTableSearchTerm] = useState<string>('');
  const [expandedTables, setExpandedTables] = useState<Record<string, boolean>>({
    students: true,
    courses: false,
    enrollments: false,
  });

  // Editor and execution states
  const [queryText, setQueryText] = useState<string>(SAMPLE_QUERIES[1].query);
  const [queryResults, setQueryResults] = useState<QueryResult[]>([]);
  const [activeResultTab, setActiveResultTab] = useState<number>(0);
  const [resultFilter, setResultFilter] = useState<string>('');

  // New Table Modal
  const [newTableModalOpen, setNewTableModalOpen] = useState<boolean>(false);
  const [newTableName, setNewTableName] = useState<string>('');

  // Auto-run initial query on load to populate results
  useEffect(() => {
    handleExecute();
  }, []);

  // Execute SQL script
  const handleExecute = (overrideQuery?: string) => {
    const textToRun = overrideQuery !== undefined ? overrideQuery : queryText;
    const results = engine.executeScript(textToRun);
    setQueryResults(results);
    setSchemaVersion((v) => v + 1);
    setActiveResultTab(results.length - 1 >= 0 ? results.length - 1 : 0);
  };

  const handleResetDb = () => {
    if (window.confirm('Reset all tables to initial factory schema?')) {
      engine.resetDatabase();
      setSchemaVersion((v) => v + 1);
      setQueryResults([]);
      handleExecute('SELECT * FROM students;');
    }
  };

  const handleQuickSelect = (tableName: string) => {
    const q = `SELECT * FROM ${tableName};`;
    setQueryText(q);
    handleExecute(q);
  };

  const handleQuickDrop = (tableName: string) => {
    if (window.confirm(`Are you sure you want to drop table '${tableName}'?`)) {
      const q = `DROP TABLE ${tableName};`;
      setQueryText(q);
      handleExecute(q);
    }
  };

  const handleCreateNewDb = () => {
    if (!newDbInput.trim()) return;
    const dbClean = newDbInput.trim().toLowerCase().replace(/\s+/g, '_');
    if (!databases.includes(dbClean)) {
      setDatabases((prev) => [...prev, dbClean]);
    }
    setActiveDb(dbClean);
    setNewDbInput('');
    setNewDbModalOpen(false);
  };

  const handleCreateNewTable = () => {
    if (!newTableName.trim()) return;
    const tblClean = newTableName.trim().toLowerCase().replace(/\s+/g, '_');
    const sql = `CREATE TABLE ${tblClean} (id INT PRIMARY KEY, title TEXT, created_at TEXT);\nINSERT INTO ${tblClean} VALUES (1, 'Initial Record', '2026-09-09');\nSELECT * FROM ${tblClean};`;
    setQueryText(sql);
    handleExecute(sql);
    setNewTableName('');
    setNewTableModalOpen(false);
  };

  // Export Results to CSV
  const handleExportCsv = () => {
    const currentRes = queryResults[activeResultTab];
    if (!currentRes || !currentRes.rows || currentRes.rows.length === 0) return;

    const cols = currentRes.columns || Object.keys(currentRes.rows[0]);
    const csvLines = [cols.join(',')];

    currentRes.rows.forEach((row) => {
      const line = cols.map((col) => {
        const val = row[col];
        if (val === null || val === undefined) return '';
        if (typeof val === 'string' && val.includes(',')) return `"${val}"`;
        return String(val);
      }).join(',');
      csvLines.push(line);
    });

    const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `query_results_\${Date.now()}.csv`;
    link.click();
  };

  // Filtered tables list in sidebar
  const filteredTables = useMemo(() => {
    const all = Object.values(schema) as TableDef[];
    if (!tableSearchTerm.trim()) return all;
    return all.filter((t) =>
      t.name.toLowerCase().includes(tableSearchTerm.toLowerCase()) ||
      t.columns.some((c) => c.name.toLowerCase().includes(tableSearchTerm.toLowerCase()))
    );
  }, [schema, tableSearchTerm]);

  // Current active result
  const currentResult = queryResults[activeResultTab];

  // Filtered rows for results table
  const displayedRows = useMemo(() => {
    if (!currentResult || !currentResult.rows) return [];
    if (!resultFilter.trim()) return currentResult.rows;
    const term = resultFilter.toLowerCase();
    return currentResult.rows.filter((row) =>
      Object.values(row).some((val) => String(val).toLowerCase().includes(term))
    );
  }, [currentResult, resultFilter]);

  return (
    <div
      id="dbms-workbench-root"
      className="h-full w-full flex flex-col bg-[#07090e] text-zinc-100 select-none overflow-hidden"
    >
      {/* TOP CONTROLS BAR */}
      <header
        id="dbms-toolbar"
        className="min-h-[3.75rem] h-auto py-2.5 bg-[#0c1017] border-b border-zinc-800 px-4 flex flex-wrap items-center justify-between gap-3 shrink-0 relative z-20"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-950/80 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-tech text-xs font-bold text-zinc-200 tracking-wide">
                TITAN SQL DATABASE WORKBENCH
              </span>
              <span className="px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800 text-[10px] font-mono text-cyan-400 font-bold">
                {activeDb}
              </span>
            </div>
            <span className="block text-[10px] font-mono text-zinc-400">
              ACID Relational Engine • Multi-Statement (;) Execution Supported
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 font-mono text-xs flex-wrap">
          {/* Sample Query Presets */}
          <div className="flex items-center gap-1.5 bg-zinc-900 px-2.5 py-1 rounded border border-zinc-800">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <select
              id="select-sql-preset"
              onChange={(e) => {
                setQueryText(e.target.value);
                handleExecute(e.target.value);
              }}
              defaultValue=""
              className="bg-transparent text-zinc-300 focus:outline-none cursor-pointer text-xs max-w-[180px] sm:max-w-[220px] truncate"
            >
              <option value="" disabled>Load Sample Script...</option>
              {SAMPLE_QUERIES.map((sq, i) => (
                <option key={i} value={sq.query} className="bg-zinc-900 text-zinc-200">
                  {sq.title}
                </option>
              ))}
            </select>
          </div>

          {/* RUN BUTTON */}
          <button
            id="btn-run-sql"
            type="button"
            onClick={() => handleExecute()}
            className="px-4 py-1.5 rounded bg-cyan-500 hover:bg-cyan-400 text-black font-tech font-bold text-xs flex items-center gap-1.5 shadow-[0_0_12px_rgba(6,182,212,0.4)] transition-all cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>RUN SCRIPT</span>
          </button>

          {/* CLEAR QUERY */}
          <button
            type="button"
            onClick={() => setQueryText('')}
            className="px-2.5 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 text-xs cursor-pointer"
            title="Clear Editor"
          >
            Clear
          </button>

          {/* RESET DB */}
          <button
            id="btn-reset-db"
            type="button"
            onClick={handleResetDb}
            className="px-2.5 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 flex items-center gap-1 text-xs cursor-pointer"
            title="Reset Database to Default Seed"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Reset DB</span>
          </button>
        </div>
      </header>

      {/* 2-SECTION WORKSPACE: Left (Sidebar Navigator) | Right (Expanded Editor + Results) */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT SIDEBAR: Database & Tables Explorer */}
        <aside
          id="dbms-sidebar-navigator"
          className="w-64 sm:w-72 bg-[#0a0d14] border-r border-zinc-800 flex flex-col shrink-0 overflow-hidden"
        >
          {/* Database Selector & Actions */}
          <div className="p-3 border-b border-zinc-800 bg-[#0d111a] flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold text-slate-300 uppercase flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-cyan-400" />
                DATABASE
              </span>
              <button
                type="button"
                onClick={() => setNewDbModalOpen(true)}
                title="Create New Database"
                className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5 cursor-pointer bg-cyan-950/40 border border-cyan-800/60 px-1.5 py-0.5 rounded"
              >
                <Plus className="w-3 h-3" /> New DB
              </button>
            </div>

            <select
              value={activeDb}
              onChange={(e) => setActiveDb(e.target.value)}
              className="bg-[#05070a] border border-zinc-700 rounded p-1.5 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              {databases.map((db) => (
                <option key={db} value={db}>
                  {db}
                </option>
              ))}
            </select>
          </div>

          {/* Tables Section Header + Search + New Table */}
          <div className="p-2.5 border-b border-zinc-800 flex flex-col gap-2 bg-[#090c13]">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-slate-400 font-bold flex items-center gap-1">
                <TableIcon className="w-3.5 h-3.5 text-amber-400" />
                TABLES ({Object.keys(schema).length})
              </span>
              <button
                type="button"
                onClick={() => setNewTableModalOpen(true)}
                className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-0.5 cursor-pointer bg-amber-950/40 border border-amber-800/60 px-1.5 py-0.5 rounded"
              >
                <Plus className="w-3 h-3" /> New Table
              </button>
            </div>

            <div className="relative">
              <Search className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={tableSearchTerm}
                onChange={(e) => setTableSearchTerm(e.target.value)}
                placeholder="Filter tables & columns..."
                className="w-full bg-[#05070a] border border-zinc-800 rounded pl-7 pr-2 py-1 text-[11px] font-mono text-zinc-300 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Tables List with Columns & Quick Queries */}
          <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1.5 font-mono text-xs">
            {filteredTables.length === 0 ? (
              <div className="p-4 text-center text-zinc-500 text-xs italic">
                No tables match "{tableSearchTerm}".
              </div>
            ) : (
              filteredTables.map((tbl) => {
                const isExpanded = expandedTables[tbl.name] !== false;
                return (
                  <div
                    key={tbl.name}
                    className="rounded-lg border border-zinc-800 bg-[#0c1017] overflow-hidden"
                  >
                    {/* Table Title Bar */}
                    <div className="p-2 flex items-center justify-between hover:bg-zinc-800/40 transition-colors">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedTables((prev) => ({
                            ...prev,
                            [tbl.name]: !isExpanded,
                          }))
                        }
                        className="flex items-center gap-1.5 font-bold text-zinc-200 text-xs text-left cursor-pointer flex-1 truncate mr-1"
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        )}
                        <TableIcon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="truncate">{tbl.name}</span>
                        <span className="text-[10px] text-zinc-500 font-normal ml-1">
                          ({tbl.rows.length})
                        </span>
                      </button>

                      {/* Quick Actions */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleQuickSelect(tbl.name)}
                          title={`Execute SELECT * FROM ${tbl.name}`}
                          className="px-1.5 py-0.5 text-[10px] rounded bg-cyan-950/70 border border-cyan-800 text-cyan-300 hover:bg-cyan-900 cursor-pointer"
                        >
                          SELECT
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickDrop(tbl.name)}
                          title={`Drop table ${tbl.name}`}
                          className="p-1 text-zinc-500 hover:text-red-400 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Columns Dropdown */}
                    {isExpanded && (
                      <div className="px-2.5 pb-2 pt-1 border-t border-zinc-800/60 bg-[#080b11] flex flex-col gap-1 text-[11px]">
                        {tbl.columns.map((col) => (
                          <div
                            key={col.name}
                            className="flex items-center justify-between text-zinc-400 py-0.5"
                          >
                            <span className="flex items-center gap-1 text-zinc-300 truncate">
                              {col.isPrimaryKey ? (
                                <Key className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                              ) : (
                                <span className="w-2.5 h-2.5 inline-block text-[8px] text-zinc-600">•</span>
                              )}
                              <span className="truncate">{col.name}</span>
                            </span>
                            <span className="text-[9px] text-cyan-400/80 uppercase font-mono">
                              {col.type}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* MAIN CENTER WORKSPACE: SQL Editor (Top) & Results Table (Bottom) */}
        <main className="flex-1 flex flex-col overflow-hidden bg-[#07090e]">
          {/* UPPER SECTION: SQL Script Editor */}
          <div className="h-1/2 flex flex-col border-b border-zinc-800 bg-[#090d14]">
            {/* Editor Sub-header */}
            <div className="h-8 bg-[#0b0f17] border-b border-zinc-800 px-3 flex items-center justify-between text-[11px] font-mono text-zinc-400 shrink-0">
              <div className="flex items-center gap-2">
                <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-bold text-zinc-300">SQL SCRIPT EDITOR</span>
                <span className="text-zinc-600 hidden sm:inline">|</span>
                <span className="text-zinc-500 hidden sm:inline">Separate queries with semicolons (;)</span>
              </div>
              <div className="flex items-center gap-3 text-[10px]">
                <span>{queryText.split('\n').length} LINES</span>
                <span className="text-cyan-400">Ctrl+Enter to Execute</span>
              </div>
            </div>

            {/* Large Code Textarea with line numbering */}
            <div className="flex-1 flex overflow-hidden font-mono text-xs">
              <div className="w-10 bg-[#05070a] border-r border-zinc-800/80 py-3 text-right pr-2 text-zinc-500 select-none overflow-hidden shrink-0">
                {Array.from({ length: Math.max(1, queryText.split('\n').length) }).map((_, i) => (
                  <div key={i} className="leading-relaxed">
                    {i + 1}
                  </div>
                ))}
              </div>

              <textarea
                id="sql-query-textarea"
                value={queryText}
                onChange={(e) => setQueryText(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                    e.preventDefault();
                    handleExecute();
                  }
                }}
                spellCheck={false}
                placeholder="Write SQL statements here (e.g. SELECT * FROM students;)..."
                className="flex-1 p-3 bg-transparent text-zinc-100 font-mono text-xs leading-relaxed focus:outline-none resize-none overflow-auto whitespace-pre"
              />
            </div>
          </div>

          {/* LOWER SECTION: Query Execution Results & Data Grid */}
          <div className="h-1/2 flex flex-col bg-[#080b11] overflow-hidden">
            {/* Results Header Bar with Statement Tabs & Export */}
            <div className="h-9 bg-[#0b0f17] border-b border-zinc-800 px-3 flex items-center justify-between gap-2 shrink-0 overflow-x-auto select-none">
              <div className="flex items-center gap-1.5 overflow-x-auto">
                <span className="text-[11px] font-mono font-bold text-slate-400 mr-1 uppercase">
                  RESULTS:
                </span>
                {queryResults.length === 0 ? (
                  <span className="text-[11px] font-mono text-zinc-500">Awaiting execution</span>
                ) : (
                  queryResults.map((r, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActiveResultTab(i)}
                      className={`px-2.5 py-1 rounded text-[11px] font-mono flex items-center gap-1.5 transition-all cursor-pointer \${
                        activeResultTab === i
                          ? 'bg-cyan-950/80 border border-cyan-700 text-cyan-300 font-bold'
                          : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                      }`}
                    >
                      {r.success ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <AlertTriangle className="w-3 h-3 text-red-400" />
                      )}
                      <span>Stmt #{r.statementIndex}</span>
                    </button>
                  ))
                )}
              </div>

              {/* Status metrics & CSV export */}
              {currentResult && (
                <div className="flex items-center gap-3 font-mono text-[11px]">
                  <div className="flex items-center gap-1 text-zinc-400">
                    <Clock className="w-3 h-3 text-cyan-400" />
                    <span>{currentResult.executionTimeMs} ms</span>
                  </div>

                  {currentResult.rows && (
                    <button
                      type="button"
                      onClick={handleExportCsv}
                      title="Export current table result to CSV file"
                      className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 flex items-center gap-1 text-[10px] cursor-pointer"
                    >
                      <Download className="w-3 h-3 text-amber-400" />
                      <span>CSV</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Results Body / Data Grid */}
            <div className="flex-1 overflow-auto p-3 font-mono text-xs">
              {!currentResult ? (
                <div className="h-full flex flex-col items-center justify-center text-zinc-500 gap-2">
                  <Database className="w-8 h-8 opacity-40 text-cyan-400" />
                  <span>Execute a query to inspect records and tables here.</span>
                </div>
              ) : !currentResult.success ? (
                <div className="p-4 rounded-lg bg-red-950/40 border border-red-800 text-red-300 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div className="flex flex-col gap-1">
                    <span className="font-bold">Execution Error:</span>
                    <span className="font-mono text-xs text-red-200">{currentResult.error}</span>
                  </div>
                </div>
              ) : currentResult.rows ? (
                <div className="flex flex-col gap-2">
                  {/* Filter and stats row */}
                  <div className="flex items-center justify-between text-[11px] text-zinc-400">
                    <span>
                      Returned <strong className="text-cyan-400">{displayedRows.length}</strong> of{' '}
                      {currentResult.rows.length} rows
                    </span>

                    {currentResult.rows.length > 5 && (
                      <input
                        type="text"
                        value={resultFilter}
                        onChange={(e) => setResultFilter(e.target.value)}
                        placeholder="Search within results..."
                        className="bg-[#05070a] border border-zinc-800 rounded px-2 py-0.5 text-[11px] text-zinc-300 focus:outline-none focus:border-cyan-500 w-48"
                      />
                    )}
                  </div>

                  {/* Clean Tabular Results */}
                  <div className="rounded-lg border border-zinc-800 bg-[#06080e] overflow-hidden shadow-xl">
                    <table className="w-full text-left font-mono text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-zinc-800 bg-[#0d111a] text-zinc-300">
                          <th className="p-2.5 text-zinc-500 w-12 text-center">#</th>
                          {(currentResult.columns || Object.keys(currentResult.rows[0] || {})).map(
                            (col) => (
                              <th key={col} className="p-2.5 font-bold uppercase tracking-wider text-cyan-400">
                                {col}
                              </th>
                            )
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {displayedRows.length === 0 ? (
                          <tr>
                            <td
                              colSpan={(currentResult.columns?.length || 1) + 1}
                              className="p-4 text-center text-zinc-500 italic"
                            >
                              No matching rows.
                            </td>
                          </tr>
                        ) : (
                          displayedRows.map((row, rIdx) => (
                            <tr
                              key={rIdx}
                              className="border-b border-zinc-800/50 hover:bg-zinc-800/40 transition-colors"
                            >
                              <td className="p-2 text-zinc-600 text-center text-[10px] select-none">
                                {rIdx + 1}
                              </td>
                              {(currentResult.columns || Object.keys(row)).map((col) => (
                                <td key={col} className="p-2 text-zinc-200">
                                  {row[col] !== null && row[col] !== undefined ? (
                                    String(row[col])
                                  ) : (
                                    <span className="text-zinc-600 italic">NULL</span>
                                  )}
                                </td>
                              ))}
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-lg bg-emerald-950/30 border border-emerald-800/60 text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    Statement executed successfully. Affected rows: {currentResult.affectedRows ?? 0}.
                  </span>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* CREATE NEW DATABASE MODAL */}
      {newDbModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#0d111a] border border-cyan-500/40 rounded-xl p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
              <span className="font-tech text-sm font-bold text-cyan-400 flex items-center gap-2">
                <Database className="w-4 h-4" /> CREATE NEW DATABASE
              </span>
              <button
                type="button"
                onClick={() => setNewDbModalOpen(false)}
                className="text-zinc-400 hover:text-white text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-3 font-mono text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Database Name:</label>
                <input
                  type="text"
                  value={newDbInput}
                  onChange={(e) => setNewDbInput(e.target.value)}
                  placeholder="e.g. production_crm, metrics_db"
                  className="w-full bg-[#05070a] border border-zinc-700 rounded p-2 text-zinc-200 focus:outline-none focus:border-cyan-500"
                  autoFocus
                />
              </div>

              <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setNewDbModalOpen(false)}
                  className="px-3 py-1.5 rounded bg-zinc-800 text-slate-300 hover:bg-zinc-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateNewDb}
                  className="px-4 py-1.5 rounded bg-cyan-500 hover:bg-cyan-400 text-black font-bold font-tech cursor-pointer"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE NEW TABLE MODAL */}
      {newTableModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#0d111a] border border-amber-500/40 rounded-xl p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
              <span className="font-tech text-sm font-bold text-amber-400 flex items-center gap-2">
                <TableIcon className="w-4 h-4" /> CREATE NEW TABLE
              </span>
              <button
                type="button"
                onClick={() => setNewTableModalOpen(false)}
                className="text-zinc-400 hover:text-white text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-3 font-mono text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Table Name:</label>
                <input
                  type="text"
                  value={newTableName}
                  onChange={(e) => setNewTableName(e.target.value)}
                  placeholder="e.g. inventory, orders, logs"
                  className="w-full bg-[#05070a] border border-zinc-700 rounded p-2 text-zinc-200 focus:outline-none focus:border-amber-500"
                  autoFocus
                />
              </div>

              <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setNewTableModalOpen(false)}
                  className="px-3 py-1.5 rounded bg-zinc-800 text-slate-300 hover:bg-zinc-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateNewTable}
                  className="px-4 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-black font-bold font-tech cursor-pointer"
                >
                  Generate Schema
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
