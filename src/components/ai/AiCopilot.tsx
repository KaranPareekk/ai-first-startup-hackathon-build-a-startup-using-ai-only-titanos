import React, { useState, useEffect, useRef, ReactNode } from "react";
import { Bot, Send, Trash2, Key, Sparkles, Copy, Check, ExternalLink, AlertCircle, GraduationCap, Zap } from "lucide-react";

const STORAGE_KEY_MSGS = "titan_chat_messages";
const STORAGE_KEY_APIKEY = "titan_gemini_api_key";
const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=";

interface Msg { id: string; role: "user" | "ai"; text: string; }

function parseInline(text: string): ReactNode[] {
  return text.split(/(\*\*.*?\*\*|`.*?`)/g).map((s, i) => {
    if (s.startsWith("**") && s.endsWith("**")) return <strong key={i}>{s.slice(2, -2)}</strong>;
    if (s.startsWith("`") && s.endsWith("`")) return <code key={i} className="bg-zinc-800 px-1 rounded text-cyan-300 text-xs font-mono">{s.slice(1, -1)}</code>;
    return <React.Fragment key={i}>{s}</React.Fragment>;
  });
}

function renderMd(text: string): React.JSX.Element[] {
  const lines = text.split("\n");
  const out: React.JSX.Element[] = [];
  let inCode = false, codeBuf: string[] = [], codeLang = "", listBuf: React.JSX.Element[] = [];
  const flushList = () => {
    if (listBuf.length) { out.push(<ul key={"ul" + out.length} className="list-disc pl-5 my-1.5 space-y-0.5">{listBuf}</ul>); listBuf = []; }
  };
  for (const line of lines) {
    if (line.startsWith("```")) {
      if (inCode) { flushList(); const l = codeLang; const b = [...codeBuf]; out.push(<pre key={"c" + out.length} className="bg-[#0c0e14] p-3 rounded-md overflow-x-auto my-2 border border-zinc-800/50"><code className="text-zinc-300 font-mono text-xs leading-relaxed">{b.join("\n")}</code></pre>); inCode = false; codeBuf = []; codeLang = ""; }
      else { flushList(); inCode = true; codeLang = line.slice(3).trim(); } continue;
    }
    if (inCode) { codeBuf.push(line); continue; }
    if (line.trimStart().startsWith("- ") || line.trimStart().startsWith("* ")) { listBuf.push(<li key={"li" + listBuf.length} className="text-sm text-zinc-300">{parseInline(line.trimStart().slice(2))}</li>); continue; }
    flushList();
    if (line.startsWith("### ")) out.push(<p key={"h3" + out.length} className="font-bold text-base text-white mt-3 mb-1">{parseInline(line.slice(4))}</p>);
    else if (line.startsWith("## ")) out.push(<p key={"h2" + out.length} className="font-bold text-sm text-white mt-2 mb-1">{parseInline(line.slice(3))}</p>);
    else if (line.startsWith("# ")) out.push(<p key={"h1" + out.length} className="font-bold text-white mt-2 mb-1">{parseInline(line.slice(2))}</p>);
    else if (line.trim() === "") out.push(<div key={"br" + out.length} className="h-1.5" />);
    else out.push(<p key={"p" + out.length} className="text-sm text-zinc-300 leading-relaxed">{parseInline(line)}</p>);
  }
  flushList();
  if (inCode && codeBuf.length) out.push(<pre key="cend" className="bg-[#0c0e14] p-3 rounded-md overflow-x-auto my-2 border border-zinc-800/50"><code className="text-zinc-300 font-mono text-xs">{codeBuf.join("\n")}</code></pre>);
  return out;
}

const BEGINNER_CHIPS = ["What is a variable?", "How do loops work?", "Explain functions", "What are common errors?"];
const EXPERT_CHIPS = ["Explain Big-O complexity", "How does memory work?", "What is async/await?"];

export const AiCopilot: React.FC = () => {
  const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem(STORAGE_KEY_APIKEY) || "");
  const [keyInput, setKeyInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>(() => {
    try { const s = localStorage.getItem(STORAGE_KEY_MSGS); if (s) return JSON.parse(s); } catch {}
    return [{ id: "w0", role: "ai", text: "Hi! I am **Titan AI** powered by Gemini. Ask me anything about programming and I will give you a real, thoughtful answer every time." }];
  });
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"beginner" | "expert">("beginner");
  const [copied, setCopied] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, busy]);
  useEffect(() => { try { localStorage.setItem(STORAGE_KEY_MSGS, JSON.stringify(msgs.slice(-60))); } catch {} }, [msgs]);

  const saveKey = () => {
    const k = keyInput.trim();
    if (!k) return;
    localStorage.setItem(STORAGE_KEY_APIKEY, k);
    setApiKey(k);
    setKeyInput("");
    setError(null);
  };

  const clearChat = () => {
    const welcome: Msg = { id: "w" + Date.now(), role: "ai", text: "Chat cleared. What would you like to learn?" };
    setMsgs([welcome]);
    setError(null);
  };

  const copyMsg = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const send = async (text: string) => {
    const q = text.trim();
    if (!q || !apiKey || busy) return;
    const userMsg: Msg = { id: "u" + Date.now(), role: "user", text: q };
    const next = [...msgs, userMsg];
    setMsgs(next);
    setInput("");
    setBusy(true);
    setError(null);
    try {
      const nowStr = new Date().toLocaleString("en-US", {
        dateStyle: "full",
        timeStyle: "short",
      });
      const sys = mode === "beginner"
        ? `You are Titan AI, a smart, direct, and concise AI assistant.
Current date and time: ${nowStr}.
Answer questions directly, accurately, and conversationally.
Do NOT over-explain or write unsolicited code examples/tutorials unless specifically asked.
If asked for factual information like date, time, definitions, or quick facts, answer in 1-2 sentences directly.`
        : `You are Titan AI, an efficient senior engineer assistant.
Current date and time: ${nowStr}.
Be direct, sharp, and concise. Provide technical depth only when requested, without unnecessary filler.`;
      const contents: { role: string; parts: { text: string }[] }[] = [
        { role: "user", parts: [{ text: sys }] },
        { role: "model", parts: [{ text: "Understood. I will answer directly, concisely, and accurately without unnecessary explanations." }] },
      ];
      for (const m of next.filter(x => x.id !== "w0" && x.id !== userMsg.id)) {
        contents.push({ role: m.role === "user" ? "user" : "model", parts: [{ text: m.text }] });
      }
      contents.push({ role: "user", parts: [{ text: q }] });
      const resp = await fetch(GEMINI_ENDPOINT + encodeURIComponent(apiKey), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({ contents, generationConfig: { temperature: 0.7, maxOutputTokens: 2048 } }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.error?.message || "HTTP " + resp.status);
      const reply: string = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response.";
      setMsgs(prev => [...prev, { id: "a" + Date.now(), role: "ai", text: reply }]);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#07090e] text-zinc-100 overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 h-12 border-b border-zinc-800/60 bg-[#0a0c10] flex items-center justify-between px-3 gap-2">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-cyan-400" />
          <span className="text-sm font-semibold text-zinc-200">Titan AI</span>
          {apiKey && <span className="text-[10px] bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 px-1.5 py-0.5 rounded font-mono flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />Gemini Live</span>}
          <div className="flex bg-zinc-900 rounded p-0.5 border border-zinc-800 ml-1">
            <button type="button" onClick={() => setMode("beginner")} className={mode === "beginner" ? "px-2 py-0.5 text-xs rounded bg-zinc-800 text-cyan-300 flex items-center gap-1" : "px-2 py-0.5 text-xs rounded text-zinc-500 hover:text-zinc-300 flex items-center gap-1"}><GraduationCap className="w-3 h-3" /><span className="hidden sm:inline">Beginner</span></button>
            <button type="button" onClick={() => setMode("expert")} className={mode === "expert" ? "px-2 py-0.5 text-xs rounded bg-zinc-800 text-purple-400 flex items-center gap-1" : "px-2 py-0.5 text-xs rounded text-zinc-500 hover:text-zinc-300 flex items-center gap-1"}><Zap className="w-3 h-3" /><span className="hidden sm:inline">Expert</span></button>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {apiKey && <button type="button" onClick={() => { localStorage.removeItem(STORAGE_KEY_APIKEY); setApiKey(""); }} title="Remove key" className="p-1.5 text-zinc-500 hover:text-red-400 rounded hover:bg-zinc-800"><Key className="w-3.5 h-3.5" /></button>}
          <button type="button" onClick={clearChat} title="Clear chat" className="p-1.5 text-zinc-500 hover:text-red-400 rounded hover:bg-zinc-800"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      </header>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {!apiKey ? (
          <div className="h-full flex items-center justify-center">
            <div className="max-w-sm w-full bg-[#0c0e14] border border-zinc-800 rounded-xl p-6 flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 bg-zinc-900 border border-zinc-700 rounded-full flex items-center justify-center"><Key className="w-6 h-6 text-cyan-400" /></div>
              <div><h2 className="text-lg font-semibold text-zinc-100 mb-1">Connect Gemini AI</h2><p className="text-sm text-zinc-400">Enter your free Gemini API key. It is saved only in your browser — never sent anywhere else.</p></div>
              <div className="w-full space-y-2">
                <input type="password" value={keyInput} onChange={e => setKeyInput(e.target.value)} onKeyDown={e => e.key === "Enter" && saveKey()} placeholder="AIzaSy..." className="w-full bg-[#07090e] border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-cyan-500/60" />
                <button type="button" onClick={saveKey} disabled={!keyInput.trim()} className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white text-sm font-medium py-2 rounded-lg flex items-center justify-center gap-2"><Sparkles className="w-4 h-4" />Connect</button>
              </div>
              <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-xs text-cyan-400/80 hover:text-cyan-400 flex items-center gap-1">Get free API key at aistudio.google.com<ExternalLink className="w-3 h-3" /></a>
            </div>
          </div>
        ) : (
          <>
            {msgs.map(m => (
              <div key={m.id} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                <div className={m.role === "user" ? "max-w-[80%] bg-cyan-900/30 border border-cyan-800/40 rounded-2xl rounded-tr-sm px-4 py-3" : "max-w-[90%] w-full bg-[#0d0f16] border border-zinc-800/50 rounded-2xl rounded-tl-sm px-4 py-3"}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] text-zinc-500">{m.role === "user" ? "You" : "Titan AI"}</span>
                    <button type="button" onClick={() => copyMsg(m.id, m.text)} className="text-zinc-600 hover:text-zinc-400 ml-2">{copied === m.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}</button>
                  </div>
                  {m.role === "user" ? <p className="text-sm text-zinc-200 whitespace-pre-wrap">{m.text}</p> : <div className="space-y-0.5">{renderMd(m.text)}</div>}
                </div>
              </div>
            ))}
            {busy && <div className="flex justify-start"><div className="bg-[#0d0f16] border border-zinc-800/50 rounded-2xl px-4 py-3 flex items-center gap-2"><Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" /><span className="text-sm text-zinc-400">Thinking...</span></div></div>}
            {error && <div className="flex justify-start"><div className="bg-red-950/30 border border-red-900/50 rounded-xl px-4 py-3 flex items-start gap-2 max-w-[90%]"><AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" /><div><p className="text-xs font-semibold text-red-400 mb-0.5">Error</p><p className="text-sm text-red-300">{error}</p></div></div></div>}
            <div ref={endRef} />
          </>
        )}
      </div>

      {/* Footer */}
      {apiKey && (
        <footer className="flex-shrink-0 border-t border-zinc-800/60 bg-[#0a0c10] p-3 space-y-2">
          <div className="flex flex-wrap gap-1.5">
            {(mode === "beginner" ? BEGINNER_CHIPS : EXPERT_CHIPS).map(c => (
              <button key={c} type="button" onClick={() => send(c)} disabled={busy} className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-full text-xs text-zinc-400 hover:text-zinc-200 whitespace-nowrap transition-colors disabled:opacity-40">{c}</button>
            ))}
          </div>
          <div className="flex gap-2 items-end">
            <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }} placeholder="Ask anything... (Enter to send)" disabled={busy} rows={1} className="flex-1 bg-[#07090e] border border-zinc-800 focus:border-cyan-600/50 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none resize-none max-h-32 min-h-[40px]" />
            <button type="button" onClick={() => send(input)} disabled={!input.trim() || busy} className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white p-2.5 rounded-lg flex-shrink-0 self-end"><Send className="w-4 h-4" /></button>
          </div>
        </footer>
      )}
    </div>
  );
};

export default AiCopilot;
