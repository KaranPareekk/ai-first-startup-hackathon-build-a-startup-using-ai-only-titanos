import React from 'react';
import {
  LayoutDashboard,
  GitGraph,
  Layers,
  Cpu,
  Code2,
  Database,
  BookOpen,
  GraduationCap,
  Gamepad2,
  FolderGit2,
  Sparkles,
  Bot,
} from 'lucide-react';
import { ModuleId } from '../../types';

interface NavigationRailProps {
  activeModule: ModuleId;
  onSelectModule: (module: ModuleId) => void;
  isCollapsed?: boolean;
}

interface NavItem {
  id: ModuleId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  tag: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home', icon: LayoutDashboard, tag: 'CMD' },
  { id: 'dsa', label: 'Data Structures', icon: GitGraph, tag: 'DSA' },
  { id: 'memory', label: 'Memory Lab', icon: Layers, tag: 'MEM' },
  { id: 'circuits', label: 'Digital Logic', icon: Cpu, tag: 'LOGIC' },
  { id: 'codelab', label: 'Code Lab', icon: Code2, tag: 'IDE' },
  { id: 'dbms', label: 'SQL Workbench', icon: Database, tag: 'SQL' },
  { id: 'ai', label: 'AI Copilot', icon: Bot, tag: 'AI' },
  { id: 'knowledge', label: 'Knowledge Base', icon: BookOpen, tag: 'REPO' },
  { id: 'assessment', label: 'Assessment', icon: GraduationCap, tag: 'TEST' },
  { id: 'games', label: 'Games Lab', icon: Gamepad2, tag: 'RETRO' },
  { id: 'workspace', label: 'My Workspace', icon: FolderGit2, tag: 'SAVED' },
];

export const NavigationRail: React.FC<NavigationRailProps> = ({
  activeModule,
  onSelectModule,
}) => {
  return (
    <aside
      id="titan-nav-rail"
      aria-label="Titan OS Workstation Navigation"
      className="w-16 bg-[#0F172A] border-r border-[#1E293B] flex flex-col items-center py-4 shrink-0 z-20 select-none justify-between overflow-y-auto overflow-x-hidden"
    >
      <div className="w-full flex flex-col items-center gap-2">
        {NAV_ITEMS.map((item) => {
          const isActive = activeModule === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              id={`nav-item-${item.id}`}
              onClick={() => onSelectModule(item.id)}
              title={`${item.label} (${item.tag})`}
              className={`group relative w-12 h-11 rounded-md flex flex-col items-center justify-center transition-all duration-200 ${
                isActive
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                  : 'text-slate-400 opacity-60 hover:opacity-100 hover:text-cyan-300 hover:bg-slate-800/60 border border-transparent'
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-cyan-400 rounded-r shadow-[0_0_8px_#06b6d4]" />
              )}
              <Icon
                className={`w-4 h-4 transition-transform duration-150 ${
                  isActive ? 'scale-110 text-cyan-400' : 'group-hover:scale-105'
                }`}
              />
              <span
                className={`text-[8px] terminal-font uppercase tracking-tighter mt-1 leading-none ${
                  isActive ? 'text-cyan-400 font-bold' : 'text-slate-400'
                }`}
              >
                {item.tag}
              </span>
            </button>
          );
        })}
      </div>

      <div className="w-full px-2 pt-3 border-t border-[#1E293B] flex flex-col items-center">
        <div className="text-[8px] terminal-font text-slate-500 text-center leading-tight">
          SYS
          <span className="block text-cyan-500 font-bold">1.0.4</span>
        </div>
      </div>
    </aside>
  );
};
