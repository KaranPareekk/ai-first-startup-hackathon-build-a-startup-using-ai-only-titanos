import React, { useState, useEffect } from "react";
import { ExternalLink, Trophy, FileCode2, CheckSquare, RefreshCw, Loader2 } from "lucide-react";
import { UserProfile, ModuleId } from "../../types";
import { StorageService } from "../../services/storage";
import { TitanLogo } from "../common/TitanLogo";
import { UserProfileModal } from "./UserProfileModal";

interface NewsArticle {
  id: number;
  title: string;
  url: string;
  cover_image: string | null;
  social_image: string | null;
  description: string;
  readable_publish_date: string;
  tag_list: string[];
  user: { name: string };
  reading_time_minutes: number;
}

interface QuoteData {
  content: string;
  author: string;
}

const STATIC_QUOTES: QuoteData[] = [
  { content: "The best way to predict the future is to invent it.", author: "Alan Kay" },
  { content: "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.", author: "Martin Fowler" },
  { content: "First, solve the problem. Then, write the code.", author: "John Johnson" },
  { content: "Experience is the name everyone gives to their mistakes.", author: "Oscar Wilde" },
  { content: "Programs must be written for people to read, and only incidentally for machines to execute.", author: "Harold Abelson" },
  { content: "The most disastrous thing that you can ever learn is your first programming language.", author: "Alan Kay" },
  { content: "Simplicity is the soul of efficiency.", author: "Austin Freeman" },
];

const DEV_LINKS = [
  { label: "GitHub", abbr: "GH", url: "https://github.com", bg: "bg-[#24292e]" },
  { label: "LeetCode", abbr: "LC", url: "https://leetcode.com", bg: "bg-[#b45309]" },
  { label: "LinkedIn", abbr: "LI", url: "https://linkedin.com", bg: "bg-[#0a66c2]" },
  { label: "CodeChef", abbr: "CC", url: "https://codechef.com", bg: "bg-[#c84b0f]" },
  { label: "Codeforces", abbr: "CF", url: "https://codeforces.com", bg: "bg-[#991b1b]" },
  { label: "Stack Overflow", abbr: "SO", url: "https://stackoverflow.com", bg: "bg-[#8a4f00]" },
];

function timeAgo(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const diff = (Date.now() - d.getTime()) / 1000;
    if (diff < 3600) return Math.floor(diff / 60) + "m ago";
    if (diff < 86400) return Math.floor(diff / 3600) + "h ago";
    return Math.floor(diff / 86400) + "d ago";
  } catch {
    return dateStr;
  }
}

interface HomeDashboardProps { onNavigate?: (mod: ModuleId) => void; }
const HomeDashboard: React.FC<HomeDashboardProps> = ({ onNavigate: _onNavigate }) => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [quote, setQuote] = useState<QuoteData>(STATIC_QUOTES[new Date().getDay() % STATIC_QUOTES.length]);
  const [profileOpen, setProfileOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [solved, setSolved] = useState(0);
  const [written, setWritten] = useState(0);
  const [labs, setLabs] = useState(0);

  const fetchNews = async () => {
    setNewsLoading(true);
    try {
      const res = await fetch(
        "https://dev.to/api/articles?tag=programming&per_page=6&top=1"
      );
      const data: NewsArticle[] = await res.json();
      setArticles(data.filter(a => a.title && (a.cover_image || a.social_image)).slice(0, 6));
    } catch {
      setArticles([]);
    } finally {
      setNewsLoading(false);
    }
  };

  useEffect(() => {
    setUserProfile(StorageService.getUserProfile());
    const prog = StorageService.getProgress();
    setSolved(prog.assessmentsPassed || 0);
    setLabs(prog.completedLabs?.length || 0);
    const progs = StorageService.getPrograms();
    setWritten(progs.length);

    fetchNews();

    fetch("https://api.quotable.io/random?tags=technology")
      .then(r => r.json())
      .then(d => { if (d.content) setQuote({ content: d.content, author: d.author }); })
      .catch(() => {});
  }, []);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#07090e] text-white font-sans">

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between h-10 px-4 shrink-0 border-b border-zinc-800/60">
        <div className="flex items-center gap-2">
          <TitanLogo className="w-5 h-5 text-cyan-400" />
          <span className="text-sm font-bold tracking-widest text-zinc-100">TITAN_OS</span>
        </div>
        <button
          type="button"
          onClick={() => setProfileOpen(true)}
          className="w-7 h-7 rounded-full bg-cyan-900/60 border border-cyan-700/50 flex items-center justify-center text-xs font-bold text-cyan-300 hover:bg-cyan-800/60 transition-colors"
        >
          {userProfile?.name?.charAt(0)?.toUpperCase() || "U"}
        </button>
      </div>

      {/* ── Main Layout: News (left) + Sidebar (right) ──────────────── */}
      <div className="flex flex-1 min-h-0 gap-0 overflow-hidden">

        {/* ── LEFT: News Grid ────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0 border-r border-zinc-800/60 overflow-hidden">

          {/* News header */}
          <div className="flex items-center justify-between px-4 py-2 shrink-0 border-b border-zinc-800/40">
            <span className="text-xs font-semibold text-zinc-400 tracking-wider uppercase">Tech News</span>
            <button
              type="button"
              onClick={fetchNews}
              title="Refresh news"
              className="text-zinc-600 hover:text-zinc-400 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${newsLoading ? "animate-spin" : ""}`} />
            </button>
          </div>

          {/* Article card grid */}
          <div className="flex-1 overflow-hidden p-3">
            {newsLoading ? (
              <div className="h-full flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-zinc-600 animate-spin" />
              </div>
            ) : articles.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-zinc-600 gap-2">
                <span className="text-sm">Could not load news</span>
                <button type="button" onClick={fetchNews}
                  className="text-xs text-cyan-500 hover:underline">Retry</button>
              </div>
            ) : (
              <div className="grid grid-cols-3 grid-rows-2 gap-2.5 h-full">
                {articles.map(article => {
                  const img = article.cover_image || article.social_image;
                  return (
                    <a
                      key={article.id}
                      href={article.url}
                      target="_blank"
                      rel="noreferrer"
                      className="group flex flex-col overflow-hidden rounded-md border border-zinc-800/60 bg-[#0b0d13] hover:border-zinc-700 transition-all hover:shadow-lg hover:shadow-black/40 cursor-pointer"
                    >
                      {/* Article image */}
                      <div className="relative overflow-hidden shrink-0" style={{ height: "45%" }}>
                        {img ? (
                          <img
                            src={img}
                            alt={article.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                          />
                        ) : (
                          <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                            <span className="text-zinc-600 text-xs">No image</span>
                          </div>
                        )}
                        {/* Tag chip overlay */}
                        {article.tag_list?.[0] && (
                          <span className="absolute top-1.5 left-1.5 text-[9px] bg-black/70 text-cyan-400 px-1.5 py-0.5 rounded uppercase font-mono">
                            {article.tag_list[0]}
                          </span>
                        )}
                      </div>

                      {/* Article text */}
                      <div className="flex flex-col flex-1 p-2 gap-1 min-h-0 overflow-hidden">
                        <p className="text-[11px] font-semibold text-zinc-200 leading-snug line-clamp-2 group-hover:text-white transition-colors">
                          {article.title}
                        </p>
                        <div className="flex items-center justify-between mt-auto pt-1 border-t border-zinc-800/50">
                          <span className="text-[9px] text-zinc-500 truncate max-w-[70%]">{article.user.name}</span>
                          <span className="text-[9px] text-zinc-600">{article.reading_time_minutes}m read</span>
                        </div>
                      </div>
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: Sidebar (Quote + Dev Links + Progress) ──────────── */}
        <div className="w-52 flex-shrink-0 flex flex-col overflow-hidden">

          {/* Quote */}
          <div className="p-3 border-b border-zinc-800/60 bg-[#0d0a1a] flex flex-col gap-1.5">
            <span className="text-[10px] font-semibold text-purple-400 uppercase tracking-wider">Quote of the Day</span>
            <p className="text-[11px] text-zinc-300 leading-snug italic line-clamp-4">
              "{quote.content}"
            </p>
            <p className="text-[10px] text-purple-400/80 text-right">— {quote.author}</p>
          </div>

          {/* Dev Links grid (2 × 3) */}
          <div className="p-2 border-b border-zinc-800/60 flex-shrink-0">
            <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider px-1 block mb-1.5">Quick Access</span>
            <div className="grid grid-cols-2 gap-1.5">
              {DEV_LINKS.map(link => (
                <a
                  key={link.label}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className={"flex flex-col items-center justify-center py-2 rounded text-white cursor-pointer hover:brightness-110 transition-all " + link.bg}
                >
                  <span className="text-sm font-bold leading-none">{link.abbr}</span>
                  <span className="text-[9px] mt-0.5 opacity-80">{link.label}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Progress tiles (stacked) */}
          <div className="flex-1 flex flex-col gap-0 overflow-hidden">
            <div className="flex-1 flex flex-col items-center justify-center bg-[#022c22] border-b border-zinc-800/40 p-2">
              <Trophy className="w-4 h-4 text-emerald-400 mb-1 opacity-70" />
              <span className="text-3xl font-light text-white">{solved}</span>
              <span className="text-[9px] text-emerald-400/70 uppercase tracking-wider mt-0.5">Solved</span>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center bg-[#0a1628] border-b border-zinc-800/40 p-2">
              <FileCode2 className="w-4 h-4 text-blue-400 mb-1 opacity-70" />
              <span className="text-3xl font-light text-white">{written}</span>
              <span className="text-[9px] text-blue-400/70 uppercase tracking-wider mt-0.5">Programs</span>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center bg-[#1a0a2e] p-2">
              <CheckSquare className="w-4 h-4 text-violet-400 mb-1 opacity-70" />
              <span className="text-3xl font-light text-white">{labs}</span>
              <span className="text-[9px] text-violet-400/70 uppercase tracking-wider mt-0.5">Labs Done</span>
            </div>
          </div>
        </div>
      </div>

      <UserProfileModal
        isOpen={profileOpen}
        onClose={() => setProfileOpen(false)}
        onProfileUpdated={p => setUserProfile(p)}
      />
    </div>
  );
};

export { HomeDashboard };
export default HomeDashboard;
