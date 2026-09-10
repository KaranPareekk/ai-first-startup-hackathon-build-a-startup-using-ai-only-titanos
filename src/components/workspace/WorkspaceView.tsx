import React, { useState } from 'react';
import {
  FolderGit2,
  Trash2,
  Download,
  FileCode,
  Award,
  HardDrive,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import { StorageService } from '../../services/storage';

interface WorkspaceViewProps {
  onOpenCodeLab: () => void;
}

export const WorkspaceView: React.FC<WorkspaceViewProps> = ({ onOpenCodeLab }) => {
  const [programs, setPrograms] = useState(() => StorageService.getPrograms());
  const [assessments, setAssessments] = useState(() => StorageService.getAssessments());
  const [message, setMessage] = useState<string | null>(null);

  const handleDeleteProgram = (id: string) => {
    StorageService.deleteProgram(id);
    setPrograms(StorageService.getPrograms());
    setMessage('Program deleted.');
    setTimeout(() => setMessage(null), 2000);
  };

  const handleExportJson = () => {
    const data = {
      programs: StorageService.getPrograms(),
      assessments: StorageService.getAssessments(),
      exportDate: new Date().toISOString(),
      system: 'TITAN_OS v1.0.4',
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `titan_os_backup_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMessage('Backup snapshot downloaded.');
    setTimeout(() => setMessage(null), 2000);
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to reset all workstation local data?')) {
      StorageService.clearAll();
      setPrograms([]);
      setAssessments([]);
      setMessage('Workspace reset to factory state.');
      setTimeout(() => setMessage(null), 2000);
    }
  };

  return (
    <div
      id="workspace-root"
      className="h-full w-full flex flex-col bg-[#07090e] text-zinc-100 select-none overflow-hidden"
    >
      <div
        id="workspace-toolbar"
        className="h-14 bg-[#0c1017] border-b border-zinc-800 px-4 flex items-center justify-between shrink-0"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-teal-950/80 border border-teal-500/40 flex items-center justify-center text-teal-400">
            <FolderGit2 className="w-4 h-4" />
          </div>
          <div>
            <span className="font-tech text-xs font-bold text-zinc-200">
              TITAN WORKSPACE & LOCAL PERSISTENCE REPOSITORY
            </span>
            <span className="block text-[10px] font-mono text-zinc-400">
              Client-First Indexed Cache • Offline Telemetry Storage
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          {message && (
            <span className="text-[11px] text-cyan-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {message}
            </span>
          )}

          <button
            onClick={handleExportJson}
            className="px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 font-semibold flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export Snapshot</span>
          </button>

          <button
            onClick={handleClearAll}
            className="px-3 py-1.5 rounded bg-zinc-800 hover:bg-red-950/80 text-zinc-300 hover:text-red-300 border border-zinc-700 hover:border-red-500/50 flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Factory Reset</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto w-full">
        {/* Saved Programs Card */}
        <div className="bg-[#0c1017] border border-zinc-800 rounded-xl p-5 flex flex-col shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
            <div className="flex items-center gap-2 font-tech font-bold text-sm text-cyan-400">
              <FileCode className="w-4 h-4" />
              <span>SAVED PROGRAMS ({programs.length})</span>
            </div>
            <button
              onClick={onOpenCodeLab}
              className="text-xs font-mono text-cyan-400 hover:underline"
            >
              Open IDE →
            </button>
          </div>

          <div className="flex-1 flex flex-col gap-2 overflow-y-auto max-h-80">
            {programs.length === 0 ? (
              <div className="text-zinc-500 text-xs font-mono p-4 text-center">
                No saved programs found. Save your code in Code Lab to access it here.
              </div>
            ) : (
              programs.map((prog) => (
                <div
                  key={prog.id}
                  className="p-3 rounded-lg bg-zinc-900/80 border border-zinc-800/80 flex items-center justify-between font-mono text-xs"
                >
                  <div>
                    <div className="font-bold text-zinc-200">{prog.title}</div>
                    <div className="text-[10px] text-zinc-400 uppercase">
                      {prog.language} • {prog.code.split('\n').length} lines
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteProgram(prog.id)}
                    className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-red-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Assessment Score History */}
        <div className="bg-[#0c1017] border border-zinc-800 rounded-xl p-5 flex flex-col shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
            <div className="flex items-center gap-2 font-tech font-bold text-sm text-amber-400">
              <Award className="w-4 h-4" />
              <span>EXAM CERTIFICATION LOGS ({assessments.length})</span>
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-2 overflow-y-auto max-h-80">
            {assessments.length === 0 ? (
              <div className="text-zinc-500 text-xs font-mono p-4 text-center">
                No assessment attempts logged. Take a quiz in Assessment Terminal to record your engineering scores.
              </div>
            ) : (
              assessments.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-zinc-900/80 border border-zinc-800/80 flex items-center justify-between font-mono text-xs"
                >
                  <div>
                    <div className="font-bold text-zinc-200">
                      Score: {item.score} / {item.totalQuestions} ({Math.round((item.score / item.totalQuestions) * 100)}%)
                    </div>
                    <div className="text-[10px] text-zinc-400 uppercase">
                      Mode: {item.mode} • Date: {new Date(item.completedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <span className="text-emerald-400 font-bold">
                    {item.score >= 5 ? 'PASSED' : 'PRACTICING'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
