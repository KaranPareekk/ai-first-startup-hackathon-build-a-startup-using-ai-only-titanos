import React, { useState, useRef } from 'react';
import {
  User,
  Mail,
  Upload,
  Check,
  Globe,
  Code2,
  Sparkles,
  Shield,
  Calendar,
  ExternalLink,
} from 'lucide-react';
import { GithubIcon, LinkedinIcon } from '../common/BrandIcons';
import { UserProfile } from '../../types';
import { StorageService } from '../../services/storage';

const PRESET_AVATARS = [
  {
    id: 'avatar_1',
    name: 'Cybernetic Tech',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
  },
  {
    id: 'avatar_2',
    name: 'Matrix Hacker',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
  },
  {
    id: 'avatar_3',
    name: 'Systems Architect',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
  },
  {
    id: 'avatar_4',
    name: 'AI Researcher',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80',
  },
  {
    id: 'avatar_5',
    name: 'Core Engineer',
    url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=256&q=80',
  },
];

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdated?: (profile: UserProfile) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  onProfileUpdated,
}) => {
  const [profile, setProfile] = useState<UserProfile>(() => StorageService.getUserProfile());
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleCustomImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setProfile((prev) => ({ ...prev, avatarUrl: dataUrl }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    StorageService.saveUserProfile(profile);
    setSaveSuccess(true);
    if (onProfileUpdated) {
      onProfileUpdated(profile);
    }
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-xl bg-[#0c1017] border border-cyan-500/50 rounded-2xl shadow-[0_0_40px_rgba(6,182,212,0.25)] flex flex-col overflow-hidden max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#0e141f] border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-tech text-sm font-bold text-zinc-100 tracking-wide">
                ENGINEER IDENTITY & PROFILE SETTINGS
              </h3>
              <span className="text-[10px] font-mono text-zinc-400">
                Personal details, Developer Platform links & Station Badge
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-white text-sm cursor-pointer p-1"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex flex-col gap-5 font-mono text-xs text-zinc-200">
          {/* Avatar Preview & Chooser */}
          <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-xl bg-[#080b11] border border-zinc-800">
            <div className="relative group">
              <div className="w-20 h-20 rounded-full border-2 border-cyan-400 p-0.5 shadow-[0_0_15px_rgba(6,182,212,0.5)] overflow-hidden">
                <img
                  src={profile.avatarUrl}
                  alt={profile.name}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <span className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#080b11] shadow-[0_0_8px_#10b981]" />
            </div>

            <div className="flex-1 flex flex-col gap-2 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-between flex-wrap gap-2">
                <span className="font-tech font-bold text-sm text-cyan-300">
                  Select Profile Image
                </span>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1 rounded bg-cyan-950/70 border border-cyan-700 text-cyan-300 hover:bg-cyan-900 text-[10px] flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <Upload className="w-3 h-3" /> Upload Custom Photo
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleCustomImageUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>

              {/* Preset Avatars Row */}
              <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                {PRESET_AVATARS.map((av) => (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => setProfile((prev) => ({ ...prev, avatarUrl: av.url }))}
                    className={`w-9 h-9 rounded-full border-2 overflow-hidden transition-transform cursor-pointer ${
                      profile.avatarUrl === av.url
                        ? 'border-cyan-400 scale-110 shadow-[0_0_10px_#06b6d4]'
                        : 'border-zinc-700 hover:border-slate-400 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={av.url} alt={av.name} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Name & Email Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-slate-400 block mb-1 text-[11px] font-semibold">
                Full Name / Handle:
              </label>
              <div className="flex items-center gap-2 bg-[#05070a] border border-zinc-700 rounded-lg px-3 py-2 focus-within:border-cyan-500">
                <User className="w-3.5 h-3.5 text-cyan-400" />
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  placeholder="e.g. Karan Pareek"
                  className="bg-transparent text-xs text-zinc-100 focus:outline-none w-full"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 block mb-1 text-[11px] font-semibold">
                Engineer Email:
              </label>
              <div className="flex items-center gap-2 bg-[#05070a] border border-zinc-700 rounded-lg px-3 py-2 focus-within:border-cyan-500">
                <Mail className="w-3.5 h-3.5 text-cyan-400" />
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  placeholder="engineer@domain.com"
                  className="bg-transparent text-xs text-zinc-100 focus:outline-none w-full"
                />
              </div>
            </div>
          </div>

          {/* Title & Bio */}
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="text-slate-400 block mb-1 text-[11px] font-semibold">
                Professional Role / Specialization:
              </label>
              <input
                type="text"
                value={profile.title || ''}
                onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                placeholder="e.g. Senior Systems & Distributed Systems Engineer"
                className="w-full bg-[#05070a] border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1 text-[11px] font-semibold">
                Bio / Engineering Statement:
              </label>
              <textarea
                value={profile.bio || ''}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                rows={2}
                placeholder="Architecting low-latency systems, kernel modules, and high-throughput databases..."
                className="w-full bg-[#05070a] border border-zinc-700 rounded-lg p-2.5 text-xs text-zinc-100 focus:outline-none focus:border-cyan-500 resize-none"
              />
            </div>
          </div>

          {/* Developer Platform Connect Links */}
          <div className="flex flex-col gap-2.5 pt-2 border-t border-zinc-800">
            <span className="text-[11px] font-bold text-cyan-400 uppercase flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" /> Developer Platform Connect Links
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* GitHub */}
              <div className="flex items-center gap-2 bg-[#05070a] border border-zinc-800 rounded-lg px-2.5 py-1.5 focus-within:border-cyan-500">
                <GithubIcon className="w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  value={profile.githubUrl || ''}
                  onChange={(e) => setProfile({ ...profile, githubUrl: e.target.value })}
                  placeholder="https://github.com/username"
                  className="bg-transparent text-[11px] text-zinc-200 focus:outline-none w-full"
                />
              </div>

              {/* LinkedIn */}
              <div className="flex items-center gap-2 bg-[#05070a] border border-zinc-800 rounded-lg px-2.5 py-1.5 focus-within:border-cyan-500">
                <LinkedinIcon className="w-3.5 h-3.5 text-blue-400" />
                <input
                  type="text"
                  value={profile.linkedinUrl || ''}
                  onChange={(e) => setProfile({ ...profile, linkedinUrl: e.target.value })}
                  placeholder="https://linkedin.com/in/username"
                  className="bg-transparent text-[11px] text-zinc-200 focus:outline-none w-full"
                />
              </div>

              {/* LeetCode */}
              <div className="flex items-center gap-2 bg-[#05070a] border border-zinc-800 rounded-lg px-2.5 py-1.5 focus-within:border-cyan-500">
                <Code2 className="w-3.5 h-3.5 text-amber-400" />
                <input
                  type="text"
                  value={profile.leetcodeUrl || ''}
                  onChange={(e) => setProfile({ ...profile, leetcodeUrl: e.target.value })}
                  placeholder="https://leetcode.com/username"
                  className="bg-transparent text-[11px] text-zinc-200 focus:outline-none w-full"
                />
              </div>

              {/* Codeforces */}
              <div className="flex items-center gap-2 bg-[#05070a] border border-zinc-800 rounded-lg px-2.5 py-1.5 focus-within:border-cyan-500">
                <Sparkles className="w-3.5 h-3.5 text-red-400" />
                <input
                  type="text"
                  value={profile.codeforcesUrl || ''}
                  onChange={(e) => setProfile({ ...profile, codeforcesUrl: e.target.value })}
                  placeholder="https://codeforces.com/profile/username"
                  className="bg-transparent text-[11px] text-zinc-200 focus:outline-none w-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-[#0e141f] border-t border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Profile stored locally & synced across all modules</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-slate-300 font-mono text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-tech font-bold text-xs flex items-center gap-1.5 shadow-[0_0_12px_rgba(6,182,212,0.4)] cursor-pointer"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>SAVED!</span>
                </>
              ) : (
                <span>SAVE PROFILE</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
