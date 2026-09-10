import React, { useState, useEffect } from 'react';
import { ModuleId, SystemSettings } from './types';
import { StorageService } from './services/storage';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { HeaderBar } from './components/common/HeaderBar';
import { NavigationRail } from './components/common/NavigationRail';
import { HomeDashboard } from './components/home/HomeDashboard';
import { DsaLab } from './components/dsa/DsaLab';
import { MemoryLab } from './components/memory/MemoryLab';
import { CircuitLab } from './components/circuits/CircuitLab';
import { CodeLab } from './components/codelab/CodeLab';
import { DbmsLab } from './components/dbms/DbmsLab';
import { GamesHub } from './components/games/GamesHub';
import { KnowledgeBase } from './components/knowledge/KnowledgeBase';
import { AssessmentLab } from './components/assessment/AssessmentLab';
import { AiCopilot } from './components/ai/AiCopilot';
import { WorkspaceView } from './components/workspace/WorkspaceView';

export default function App() {
  const [currentModule, setCurrentModule] = useState<ModuleId>('home');
  const [settings, setSettings] = useState<SystemSettings>(() => StorageService.getSettings());
  const [uptimeSec, setUptimeSec] = useState<number>(0);

  // System uptime counter
  useEffect(() => {
    const timer = setInterval(() => {
      setUptimeSec((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Sync theme class to document.documentElement for Tailwind dark: variants
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
    }
  }, [settings.theme]);

  // Global key listener to exit Focus Mode on Escape
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && settings.focusMode) {
        handleUpdateSettings({ focusMode: false });
      }
    };
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, [settings.focusMode]);

  const handleUpdateSettings = (newPartial: Partial<SystemSettings>) => {
    const updated = { ...settings, ...newPartial };
    setSettings(updated);
    StorageService.saveSettings(updated);
  };

  const renderActiveModule = () => {
    switch (currentModule) {
      case 'home':
        return <HomeDashboard onNavigate={(mod) => setCurrentModule(mod)} />;
      case 'dsa':
        return <DsaLab />;
      case 'memory':
        return <MemoryLab />;
      case 'circuits':
        return <CircuitLab />;
      case 'codelab':
        return <CodeLab />;
      case 'dbms':
        return <DbmsLab />;
      case 'games':
        return <GamesHub />;
      case 'knowledge':
        return <KnowledgeBase />;
      case 'assessment':
        return <AssessmentLab />;
      case 'ai':
      case 'study':
        return <AiCopilot />;
      case 'workspace':
        return <WorkspaceView onOpenCodeLab={() => setCurrentModule('codelab')} />;
      default:
        return <HomeDashboard onNavigate={(mod) => setCurrentModule(mod)} />;
    }
  };

  return (
    <div
      id="titan-os-viewport"
      className={`h-screen w-screen flex flex-col bg-[#07090E] text-slate-300 overflow-hidden font-sans ${
        settings.theme === 'light' ? 'theme-light' : 'theme-dark'
      }`}
    >
      {/* Workstation Top Bar */}
      <HeaderBar
        currentModule={currentModule}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        systemUptimeSec={uptimeSec}
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Navigation Rail (auto-hidden if focus mode is active) */}
        {!settings.focusMode && (
          <NavigationRail
            activeModule={currentModule}
            onSelectModule={(mod) => setCurrentModule(mod)}
          />
        )}

        {/* Primary Interactive Module View with ErrorBoundary */}
        <main
          id="titan-main-stage"
          className="flex-1 h-full overflow-hidden relative bg-[#07090E]"
        >
          <ErrorBoundary
            key={currentModule}
            moduleName={currentModule.toUpperCase()}
            onReset={() => setCurrentModule('home')}
          >
            {renderActiveModule()}
          </ErrorBoundary>
        </main>
      </div>

      {/* Clean Minimalism Telemetry Footer */}
      <footer
        id="titan-status-footer"
        className="h-8 bg-[#07090E] border-t border-[#1E293B] px-4 flex items-center justify-between text-[10px] terminal-font shrink-0 select-none z-20"
      >
        <div className="flex items-center gap-4">
          <span className="text-cyan-500 uppercase">LOCATION: WORKSTATION_{currentModule.toUpperCase()}</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">RAM_USAGE: 4.2GB / 8.0GB</span>
          <span className="text-slate-600 hidden md:inline">|</span>
          <span className="text-slate-500 hidden md:inline">KERNEL: TITAN_v1.0.4_RELEASE</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-emerald-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            SYNCED
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-500 font-mono">© 2026 TITAN_ENGINEERING_INDUSTRIES</span>
        </div>
      </footer>
    </div>
  );
}
