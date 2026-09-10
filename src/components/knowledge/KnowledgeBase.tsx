import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Search,
  Cpu,
  Layers,
  Zap,
  Clock,
  Terminal,
  Calculator,
  ArrowRight,
} from 'lucide-react';

export const KnowledgeBase: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<'complexity' | 'hierarchy' | 'bitwise' | 'sql'>('complexity');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Interactive Bitwise Calculator state
  const [bitValA, setBitValA] = useState<number>(42);
  const [bitValB, setBitValB] = useState<number>(15);

  const complexityTable = [
    { name: 'Binary Search', best: 'O(1)', avg: 'O(log n)', worst: 'O(log n)', space: 'O(1)' },
    { name: 'Quick Sort', best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n²)', space: 'O(log n)' },
    { name: 'Merge Sort', best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n log n)', space: 'O(n)' },
    { name: 'Bubble Sort', best: 'O(n)', avg: 'O(n²)', worst: 'O(n²)', space: 'O(1)' },
    { name: 'Insertion Sort', best: 'O(n)', avg: 'O(n²)', worst: 'O(n²)', space: 'O(1)' },
    { name: 'Hash Table Lookup', best: 'O(1)', avg: 'O(1)', worst: 'O(n)', space: 'O(n)' },
    { name: 'Binary Search Tree', best: 'O(log n)', avg: 'O(log n)', worst: 'O(n)', space: 'O(n)' },
    { name: 'Breadth-First Search', best: 'O(V + E)', avg: 'O(V + E)', worst: 'O(V + E)', space: 'O(V)' },
    { name: 'Dijkstra Algorithm', best: 'O(E + V log V)', avg: 'O(E log V)', worst: 'O(V²)', space: 'O(V)' },
  ];

  const filteredComplexity = useMemo(() => {
    if (!searchTerm) return complexityTable;
    return complexityTable.filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const memoryHierarchy = [
    { level: 'CPU Registers', latency: '0.5 ns', capacity: '< 1 KB', tech: 'Flip-Flops', barWidth: '10%' },
    { level: 'L1 Cache', latency: '1.0 ns', capacity: '64 KB - 128 KB', tech: 'SRAM', barWidth: '22%' },
    { level: 'L2 Cache', latency: '4.0 ns', capacity: '512 KB - 1 MB', tech: 'SRAM', barWidth: '38%' },
    { level: 'L3 Cache (Shared)', latency: '12 - 20 ns', capacity: '8 MB - 64 MB', tech: 'SRAM', barWidth: '55%' },
    { level: 'Main Memory (RAM)', latency: '60 - 100 ns', capacity: '16 GB - 128 GB', tech: 'DDR5 DRAM', barWidth: '75%' },
    { level: 'NVMe Solid-State Drive', latency: '10,000 - 50,000 ns', capacity: '1 TB - 4 TB', tech: 'NAND Flash', barWidth: '95%' },
  ];

  return (
    <div
      id="knowledge-base-root"
      className="h-full w-full flex flex-col bg-[#07090e] text-zinc-100 select-none overflow-hidden"
    >
      {/* Top Header */}
      <div
        id="kb-toolbar"
        className="min-h-[3.75rem] h-auto py-2.5 bg-[#0c1017] border-b border-zinc-800 px-4 flex flex-wrap items-center justify-between gap-3 shrink-0 relative z-20"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <span className="font-tech text-xs font-bold text-zinc-200 tracking-wide">
              TITAN ENGINEERING KNOWLEDGE BASE
            </span>
            <span className="block text-[10px] font-mono text-zinc-400">
              Interactive Specifications, Complexity Matrices & Architecture References
            </span>
          </div>
        </div>

        {/* Category switcher */}
        <div className="relative z-30 flex items-center gap-1.5 bg-zinc-900/90 p-1 rounded-lg border border-zinc-700/70 font-mono text-xs shadow-md">
          <button
            type="button"
            id="btn-kb-complexity"
            onClick={() => setActiveCategory('complexity')}
            className={`px-3 py-1.5 rounded cursor-pointer transition-all duration-150 font-semibold ${
              activeCategory === 'complexity'
                ? 'bg-cyan-500 text-black font-bold shadow-[0_0_12px_rgba(6,182,212,0.6)]'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            Big-O Complexity
          </button>

          <button
            type="button"
            id="btn-kb-hierarchy"
            onClick={() => setActiveCategory('hierarchy')}
            className={`px-3 py-1.5 rounded cursor-pointer transition-all duration-150 font-semibold ${
              activeCategory === 'hierarchy'
                ? 'bg-cyan-500 text-black font-bold shadow-[0_0_12px_rgba(6,182,212,0.6)]'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            Memory Latency Hierarchy
          </button>

          <button
            type="button"
            id="btn-kb-bitwise"
            onClick={() => setActiveCategory('bitwise')}
            className={`px-3 py-1.5 rounded cursor-pointer transition-all duration-150 font-semibold ${
              activeCategory === 'bitwise'
                ? 'bg-cyan-500 text-black font-bold shadow-[0_0_12px_rgba(6,182,212,0.6)]'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            Interactive Bitwise Math
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-4 max-w-6xl mx-auto w-full">
        {/* Category 1: Complexity Matrix */}
        {activeCategory === 'complexity' && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="relative w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filter algorithm or data structure..."
                  className="w-full pl-9 pr-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded-lg text-xs font-mono text-zinc-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="text-[11px] font-mono text-zinc-400">
                Sorted by operational asymptotic scaling
              </div>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-[#0c1017] overflow-hidden shadow-2xl">
              <table className="w-full text-left font-mono text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-900/90 text-zinc-400">
                    <th className="p-3">ALGORITHM / STRUCTURE</th>
                    <th className="p-3 text-emerald-400">BEST TIME</th>
                    <th className="p-3 text-amber-400">AVERAGE TIME</th>
                    <th className="p-3 text-red-400">WORST TIME</th>
                    <th className="p-3 text-cyan-400">SPACE COMPLEXITY</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredComplexity.map((row, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-zinc-800/60 hover:bg-zinc-800/30 transition-colors"
                    >
                      <td className="p-3 font-bold text-zinc-200">{row.name}</td>
                      <td className="p-3 font-semibold text-emerald-400">{row.best}</td>
                      <td className="p-3 font-semibold text-amber-400">{row.avg}</td>
                      <td className="p-3 font-semibold text-red-400">{row.worst}</td>
                      <td className="p-3 font-semibold text-cyan-400">{row.space}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Category 2: Memory Hierarchy & Latency Visualizer */}
        {activeCategory === 'hierarchy' && (
          <div className="flex flex-col gap-4">
            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs font-mono text-zinc-300">
              <strong className="text-cyan-400">Latency Gap Principle:</strong> Accessing L1 cache is ~200,000x faster than reading from NVMe SSD storage. Cache-friendly memory layout (spatial and temporal locality) is vital for high-performance software engineering.
            </div>

            <div className="flex flex-col gap-3">
              {memoryHierarchy.map((lvl, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-[#0c1017] border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-md"
                >
                  <div className="w-48">
                    <span className="font-tech text-sm font-bold text-zinc-100">{lvl.level}</span>
                    <span className="block text-[10px] font-mono text-zinc-400">{lvl.tech}</span>
                  </div>

                  {/* Relative latency bar visual */}
                  <div className="flex-1 flex flex-col gap-1">
                    <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-amber-500 rounded-full"
                        style={{ width: lvl.barWidth }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-6 font-mono text-xs">
                    <div className="text-right">
                      <span className="text-[10px] text-zinc-400 block">LATENCY</span>
                      <span className="text-cyan-300 font-bold">{lvl.latency}</span>
                    </div>
                    <div className="text-right w-24">
                      <span className="text-[10px] text-zinc-400 block">TYPICAL SIZE</span>
                      <span className="text-amber-400 font-bold">{lvl.capacity}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Category 3: Interactive Bitwise Calculator */}
        {activeCategory === 'bitwise' && (
          <div className="flex flex-col gap-6 font-mono text-xs">
            {/* Input values */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[#0c1017] border border-zinc-800 flex flex-col gap-2">
                <span className="text-zinc-400 font-bold">OPERAND A (INTEGER)</span>
                <input
                  type="number"
                  value={bitValA}
                  onChange={(e) => setBitValA(parseInt(e.target.value, 10) || 0)}
                  className="bg-zinc-900 border border-zinc-700 rounded p-2 text-cyan-400 font-bold text-sm focus:outline-none focus:border-cyan-500"
                />
                <div className="text-[11px] text-zinc-400 flex justify-between">
                  <span>Binary: {bitValA.toString(2).padStart(8, '0')}</span>
                  <span>Hex: 0x{bitValA.toString(16).toUpperCase()}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#0c1017] border border-zinc-800 flex flex-col gap-2">
                <span className="text-zinc-400 font-bold">OPERAND B (INTEGER)</span>
                <input
                  type="number"
                  value={bitValB}
                  onChange={(e) => setBitValB(parseInt(e.target.value, 10) || 0)}
                  className="bg-zinc-900 border border-zinc-700 rounded p-2 text-amber-400 font-bold text-sm focus:outline-none focus:border-amber-500"
                />
                <div className="text-[11px] text-zinc-400 flex justify-between">
                  <span>Binary: {bitValB.toString(2).padStart(8, '0')}</span>
                  <span>Hex: 0x{bitValB.toString(16).toUpperCase()}</span>
                </div>
              </div>
            </div>

            {/* Computed Bitwise Results */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { op: 'A & B (Bitwise AND)', res: bitValA & bitValB, desc: '1 only if both bits are 1' },
                { op: 'A | B (Bitwise OR)', res: bitValA | bitValB, desc: '1 if either bit is 1' },
                { op: 'A ^ B (Bitwise XOR)', res: bitValA ^ bitValB, desc: '1 if bits differ' },
                { op: '~A (Bitwise NOT)', res: ~bitValA, desc: 'Inverts all bits (Two-s complement)' },
                { op: 'A << 1 (Left Shift)', res: bitValA << 1, desc: 'Equivalent to A * 2' },
                { op: 'A >> 1 (Right Shift)', res: bitValA >> 1, desc: 'Equivalent to floor(A / 2)' },
              ].map((item, i) => (
                <div key={i} className="p-4 rounded-xl bg-[#0c1017] border border-zinc-800 flex flex-col gap-1.5">
                  <span className="font-tech text-xs font-bold text-cyan-400">{item.op}</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-zinc-100">{item.res}</span>
                    <span className="text-[10px] text-zinc-500">
                      (0b{(item.res >>> 0).toString(2).slice(-8).padStart(8, '0')})
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-400">{item.desc}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
