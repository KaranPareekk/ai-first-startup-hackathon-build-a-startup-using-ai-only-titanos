import React, { useState, useEffect } from 'react';
import {
  Terminal,
  Cpu,
  Activity,
  Maximize2,
  Minimize2,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  User,
} from 'lucide-react';
import { ModuleId, SystemSettings, UserProfile } from '../../types';
import { StorageService } from '../../services/storage';
import { TitanLogo } from './TitanLogo';
import { UserProfileModal } from '../home/UserProfileModal';

interface HeaderBarProps {
  currentModule: ModuleId;
  settings: SystemSettings;
  onUpdateSettings: (s: Partial<SystemSettings>) => void;
  systemUptimeSec: number;
}

const MODULE_TITLES: Record<ModuleId, { title: string; subtitle: string }> = {
  home: { title: 'COMMAND CENTER', subtitle: 'Workstation Telemetry & Active Units' },
  dsa: { title: 'ALGORITHM & DS LAB', subtitle: 'Step-by-Step Interactive Visualizer' },
  memory: { title: 'MEMORY & HARDWARE LAB', subtitle: 'Typed Arrays, Pointer Geometry & Stacks' },
  circuits: { title: 'DIGITAL LOGIC WORKBENCH', subtitle: 'Schematic Gate Playground & Signals' },
  codelab: { title: 'TITAN CODE LAB', subtitle: 'JS / Python / Java Educational IDE & STDIN' },
  dbms: { title: 'SQL QUERY WORKBENCH', subtitle: 'In-Memory Relational Engine & Multi-SQL' },
  ai: { title: 'AI ENGINEERING COPILOT', subtitle: 'Context-Aware Systems Architect & Assistant' },
  study: { title: 'AI ENGINEERING COPILOT', subtitle: 'Context-Aware Systems Architect & Assistant' },
  knowledge: { title: 'ENGINEERING REPOSITORY', subtitle: 'CS Foundations & Live Handbooks' },
  assessment: { title: 'ASSESSMENT TERMINAL', subtitle: 'Domain Testing, Review & Weak Topic Radar' },
  games: { title: 'ENGINEERING RETRO LAB', subtitle: 'Terminal Snake & Logic Tic-Tac-Toe' },
  workspace: { title: 'MY WORKSPACE', subtitle: 'Saved Programs, Notebooks & System Diagnostics' },
};

export const HeaderBar: React.FC<HeaderBarProps> = ({
  currentModule,
  settings,
  onUpdateSettings,
  systemUptimeSec,
}) => {
  const [profile, setProfile] = useState<UserProfile>(() => StorageService.getUserProfile());
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);

  const formatUptime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const moduleInfo = MODULE_TITLES[currentModule] || { title: 'TITAN_OS', subtitle: 'Online' };

  return (
    <>
      <header
        id="titan-header-bar"
        className="h-14 bg-[#0F172A] border-b border-[#1E293B] flex items-center justify-between px-3 sm:px-4 z-30 shrink-0 select-none"
      >
        {/* Brand & Module Status */}
        <div className="flex items-center gap-3 sm:gap-4">
          <TitanLogo size={34} />
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-widest text-cyan-500 uppercase font-mono">
                Titan_OS v1.0.4
              </span>
              <span className="hidden sm:inline-block text-[10px] terminal-font text-slate-400 border-l border-slate-700 pl-2">
                {moduleInfo.title}
              </span>
            </div>
            <span className="text-[10px] terminal-font opacity-60 text-slate-400 hidden md:block">
              SYS_STATUS: OPTIMAL // CORE_SYNC: ACTIVE
            </span>
          </div>
        </div>

        {/* System Gauges, Quick Controls & User Profile Avatar */}
        <div className="flex items-center gap-3 sm:gap-5">
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-black/30 rounded border border-slate-800">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] terminal-font text-slate-300">
              UPTIME: {formatUptime(systemUptimeSec)}
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              id="btn-toggle-sound"
              onClick={() => onUpdateSettings({ soundFx: !settings.soundFx })}
              title={settings.soundFx ? 'Sound Effects Enabled' : 'Sound Effects Muted'}
              className="p-1.5 rounded text-slate-400 hover:text-cyan-400 transition-colors"
            >
              {settings.soundFx ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              id="btn-toggle-theme"
              onClick={() => onUpdateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })}
              title={`Toggle Theme (Current: ${settings.theme})`}
              className="p-1.5 rounded text-slate-400 hover:text-cyan-400 transition-colors"
            >
              {settings.theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              id="btn-toggle-focus-mode"
              onClick={() => onUpdateSettings({ focusMode: !settings.focusMode })}
              title={settings.focusMode ? 'Exit Focus Mode (Show Rail) - Press Esc' : 'Enter Focus Mode (Hide Rail)'}
              className={`px-2.5 py-1 text-[10px] rounded font-bold uppercase transition-all flex items-center gap-1.5 ${
                settings.focusMode
                  ? 'bg-cyan-500 text-black border border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                  : 'bg-cyan-600/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-600/20'
              }`}
            >
              {settings.focusMode ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
              <span className="hidden xs:inline sm:inline">FOCUS</span>
            </button>

            {/* Circular Profile Avatar Badge Button */}
            <button
              id="btn-user-profile"
              type="button"
              onClick={() => setIsProfileModalOpen(true)}
              title={`Engineer Profile: ${profile.name} (${profile.email})`}
              className="ml-1 sm:ml-2 flex items-center gap-2 p-1 rounded-full hover:bg-slate-800/80 border border-slate-700/80 hover:border-cyan-500 transition-all cursor-pointer group"
            >
              <div className="relative">
                <div className="w-7 h-7 rounded-full overflow-hidden border border-cyan-400 group-hover:shadow-[0_0_8px_#06b6d4]">
                  <img
                    src={profile.avatarUrl}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-[#0F172A]" />
              </div>

              <span className="text-[11px] font-mono text-slate-300 font-semibold hidden md:inline pr-1 group-hover:text-cyan-300">
                {profile.name.split(' ')[0]}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onProfileUpdated={(up) => setProfile(up)}
      />
    </>
  );
};
