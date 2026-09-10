import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  Clock,
  HardDrive,
  Code,
  Activity,
  Sliders,
} from 'lucide-react';
import { DsaAlgorithm, DsaStep } from '../../types';
import {
  DSA_ALGORITHMS,
  generateLcsSteps,
  generateEditDistanceSteps,
  generateBinarySearchSteps,
  generateBubbleSortSteps,
  generateSelectionSortSteps,
  generateInsertionSortSteps,
  generateMergeSortSteps,
  generateBfsSteps,
  generateDfsSteps,
  generateDijkstraSteps,
  SAMPLE_GRAPH,
} from './dsaEngines';

export const DsaLab: React.FC = () => {
  const [selectedAlgoId, setSelectedAlgoId] = useState<DsaAlgorithm>('binary_search');
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1000); // ms per step

  // Input states
  const [arrayInput, setArrayInput] = useState<string>('12, 25, 37, 42, 58, 64, 73, 89, 95');
  const [searchTarget, setSearchTarget] = useState<number>(42);
  const [stringA, setStringA] = useState<string>('AGGTAB');
  const [stringB, setStringB] = useState<string>('GXTXAYB');
  const [startGraphNode, setStartGraphNode] = useState<string>('A');

  const selectedMeta = useMemo(() => {
    return DSA_ALGORITHMS.find((a) => a.id === selectedAlgoId) || DSA_ALGORITHMS[0];
  }, [selectedAlgoId]);

  // Generate steps based on algorithm and inputs
  const steps: DsaStep[] = useMemo(() => {
    try {
      const parsedArray = arrayInput
        .split(',')
        .map((s) => parseInt(s.trim(), 10))
        .filter((n) => !isNaN(n));

      switch (selectedAlgoId) {
        case 'lcs':
          return generateLcsSteps(stringA || 'ABC', stringB || 'AC');
        case 'edit_distance':
          return generateEditDistanceSteps(stringA || 'KITTEN', stringB || 'SITTING');
        case 'binary_search':
          return generateBinarySearchSteps(
            parsedArray.length > 0 ? parsedArray : [10, 20, 30, 40, 50],
            searchTarget
          );
        case 'bubble_sort':
          return generateBubbleSortSteps(parsedArray.length > 0 ? parsedArray : [45, 12, 89, 34, 21]);
        case 'selection_sort':
          return generateSelectionSortSteps(parsedArray.length > 0 ? parsedArray : [45, 12, 89, 34, 21]);
        case 'insertion_sort':
          return generateInsertionSortSteps(parsedArray.length > 0 ? parsedArray : [45, 12, 89, 34, 21]);
        case 'merge_sort':
          return generateMergeSortSteps(parsedArray.length > 0 ? parsedArray : [38, 27, 43, 3, 9, 82, 10]);
        case 'bfs':
          return generateBfsSteps(startGraphNode);
        case 'dfs':
          return generateDfsSteps(startGraphNode);
        case 'dijkstra':
          return generateDijkstraSteps(startGraphNode);
        default:
          return [];
      }
    } catch (e) {
      console.error('Step generation error:', e);
      return [];
    }
  }, [selectedAlgoId, arrayInput, searchTarget, stringA, stringB, startGraphNode]);

  // Reset step index when algo changes
  useEffect(() => {
    setCurrentStepIndex(0);
    setIsPlaying(false);
  }, [selectedAlgoId]);

  // Autoplay timer
  const playTimerRef = useRef<any>(null);
  useEffect(() => {
    if (isPlaying) {
      playTimerRef.current = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev < steps.length - 1) {
            return prev + 1;
          } else {
            setIsPlaying(false);
            return prev;
          }
        });
      }, playbackSpeed);
    } else {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    }
    return () => {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    };
  }, [isPlaying, steps.length, playbackSpeed]);

  const currentStep = steps[currentStepIndex] || steps[0] || {
    description: 'Ready.',
    highlightLines: [],
    state: {},
  };

  const handleRandomizeArray = () => {
    const count = 7;
    const rand = Array.from({ length: count }, () => Math.floor(Math.random() * 80) + 10);
    if (selectedAlgoId === 'binary_search') {
      rand.sort((a, b) => a - b);
      setSearchTarget(rand[Math.floor(Math.random() * rand.length)]);
    }
    setArrayInput(rand.join(', '));
    setCurrentStepIndex(0);
    setIsPlaying(false);
  };

  return (
    <div
      id="dsa-lab-root"
      className="h-full w-full flex flex-col lg:flex-row overflow-hidden select-none bg-[#07090e] text-zinc-100"
    >
      {/* 1. Left: Vertical Algorithm Selector Rail */}
      <aside
        id="dsa-algo-selector"
        className="w-full lg:w-56 bg-[#090d14] border-b lg:border-b-0 lg:border-r border-zinc-800 p-2 flex lg:flex-col gap-1 overflow-x-auto lg:overflow-y-auto shrink-0 z-10"
      >
        <div className="hidden lg:block px-3 py-2 text-[11px] font-mono text-cyan-400 tracking-wider font-semibold border-b border-zinc-800/80 mb-1">
          ALGORITHM REGISTRY
        </div>

        {DSA_ALGORITHMS.map((algo) => {
          const isSelected = algo.id === selectedAlgoId;
          return (
            <button
              key={algo.id}
              id={`algo-btn-${algo.id}`}
              onClick={() => setSelectedAlgoId(algo.id)}
              className={`px-3 py-2 rounded-lg text-left transition-all shrink-0 text-xs font-medium flex items-center justify-between group ${
                isSelected
                  ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 border border-transparent'
              }`}
            >
              <div className="truncate">
                <span className="block truncate font-tech">{algo.name}</span>
                <span className="text-[10px] font-mono text-zinc-400 block group-hover:text-zinc-400">
                  {algo.category}
                </span>
              </div>
              {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#06b6d4] ml-2 shrink-0" />}
            </button>
          );
        })}
      </aside>

      {/* 2. Center & Right Workspace: Side-by-Side Canvas + Code/Trace */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Control Bar */}
        <div
          id="dsa-controls-bar"
          className="h-14 border-b border-zinc-800 bg-[#0c1017] px-4 flex flex-wrap items-center justify-between gap-2 shrink-0"
        >
          {/* Controls: Step Prev, Auto Play, Step Next, Run to End, Reset */}
          <div className="flex items-center gap-1.5 font-mono text-xs">
            <button
              id="btn-dsa-prepare"
              onClick={() => {
                setCurrentStepIndex(0);
                setIsPlaying(false);
              }}
              title="Prepare / Reset to Step 0"
              className="px-2.5 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 font-semibold flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
              <span>PREPARE</span>
            </button>

            <button
              id="btn-dsa-prev"
              onClick={() => {
                setIsPlaying(false);
                setCurrentStepIndex((prev) => Math.max(0, prev - 1));
              }}
              disabled={currentStepIndex === 0}
              className="p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed border border-zinc-700"
              title="Previous Step"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              id="btn-dsa-play"
              onClick={() => setIsPlaying(!isPlaying)}
              className={`px-3 py-1.5 rounded font-tech font-bold text-xs flex items-center gap-1.5 transition-all ${
                isPlaying
                  ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-[0_0_10px_rgba(245,158,11,0.4)]'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-[0_0_10px_rgba(6,182,212,0.4)]'
              }`}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{isPlaying ? 'PAUSE' : 'AUTO PLAY'}</span>
            </button>

            <button
              id="btn-dsa-next"
              onClick={() => {
                setIsPlaying(false);
                setCurrentStepIndex((prev) => Math.min(steps.length - 1, prev + 1));
              }}
              disabled={currentStepIndex >= steps.length - 1}
              className="p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed border border-zinc-700"
              title="Next Step"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              id="btn-dsa-run-end"
              onClick={() => {
                setIsPlaying(false);
                setCurrentStepIndex(Math.max(0, steps.length - 1));
              }}
              className="px-2.5 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 text-xs hidden sm:flex items-center gap-1"
              title="Jump to End"
            >
              <SkipForward className="w-3.5 h-3.5" />
              <span>END</span>
            </button>

            {/* Step Counter Badge */}
            <div className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 text-[11px] font-mono">
              STEP <span className="text-cyan-400 font-bold">{currentStepIndex + 1}</span> / {steps.length}
            </div>
          </div>

          {/* Speed & Input controls */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-400 bg-zinc-900 px-2 py-1 rounded border border-zinc-800">
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span>SPEED:</span>
              <select
                id="select-dsa-speed"
                value={playbackSpeed}
                onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                className="bg-transparent text-cyan-300 font-bold focus:outline-none cursor-pointer"
              >
                <option value={1600} className="bg-zinc-900">0.5x</option>
                <option value={1000} className="bg-zinc-900">1.0x</option>
                <option value={500} className="bg-zinc-900">2.0x</option>
                <option value={250} className="bg-zinc-900">4.0x</option>
              </select>
            </div>

            {/* Complexity Badges */}
            <div className="hidden xl:flex items-center gap-2 text-[11px] font-mono">
              <span className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 flex items-center gap-1">
                <Clock className="w-3 h-3 text-cyan-400" /> {selectedMeta.timeComplexity}
              </span>
              <span className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 flex items-center gap-1">
                <HardDrive className="w-3 h-3 text-indigo-400" /> {selectedMeta.spaceComplexity}
              </span>
            </div>
          </div>
        </div>

        {/* Algorithm Dynamic Inputs Bar */}
        <div
          id="dsa-inputs-bar"
          className="bg-[#090d14] border-b border-zinc-800 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs font-mono"
        >
          {selectedAlgoId === 'binary_search' && (
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-zinc-400">SORTED ARRAY:</span>
              <input
                id="input-dsa-array"
                type="text"
                value={arrayInput}
                onChange={(e) => {
                  setArrayInput(e.target.value);
                  setCurrentStepIndex(0);
                }}
                className="bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1 text-cyan-300 w-64 focus:border-cyan-400 focus:outline-none"
              />
              <span className="text-zinc-400">TARGET:</span>
              <input
                id="input-dsa-target"
                type="number"
                value={searchTarget}
                onChange={(e) => {
                  setSearchTarget(Number(e.target.value));
                  setCurrentStepIndex(0);
                }}
                className="bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1 text-cyan-300 w-20 focus:border-cyan-400 focus:outline-none"
              />
              <button
                id="btn-dsa-randomize"
                onClick={handleRandomizeArray}
                className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700"
                title="Randomize Values"
              >
                <Shuffle className="w-3.5 h-3.5 text-cyan-400" />
              </button>
            </div>
          )}

          {['bubble_sort', 'selection_sort', 'insertion_sort', 'merge_sort'].includes(selectedAlgoId) && (
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-zinc-400">ARRAY:</span>
              <input
                id="input-dsa-sort-array"
                type="text"
                value={arrayInput}
                onChange={(e) => {
                  setArrayInput(e.target.value);
                  setCurrentStepIndex(0);
                }}
                className="bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1 text-cyan-300 w-72 focus:border-cyan-400 focus:outline-none"
              />
              <button
                id="btn-dsa-randomize-sort"
                onClick={handleRandomizeArray}
                className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 flex items-center gap-1 px-2"
                title="Shuffle Array"
              >
                <Shuffle className="w-3.5 h-3.5 text-cyan-400" />
                <span>Shuffle</span>
              </button>
            </div>
          )}

          {['lcs', 'edit_distance'].includes(selectedAlgoId) && (
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-zinc-400">STR 1:</span>
              <input
                id="input-dsa-string-a"
                type="text"
                maxLength={8}
                value={stringA}
                onChange={(e) => {
                  setStringA(e.target.value.toUpperCase());
                  setCurrentStepIndex(0);
                }}
                className="bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1 text-cyan-300 w-24 uppercase focus:border-cyan-400 focus:outline-none"
              />
              <span className="text-zinc-400">STR 2:</span>
              <input
                id="input-dsa-string-b"
                type="text"
                maxLength={8}
                value={stringB}
                onChange={(e) => {
                  setStringB(e.target.value.toUpperCase());
                  setCurrentStepIndex(0);
                }}
                className="bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1 text-cyan-300 w-24 uppercase focus:border-cyan-400 focus:outline-none"
              />
            </div>
          )}

          {['bfs', 'dfs', 'dijkstra'].includes(selectedAlgoId) && (
            <div className="flex items-center gap-3">
              <span className="text-zinc-400">START NODE:</span>
              <select
                id="select-graph-start-node"
                value={startGraphNode}
                onChange={(e) => {
                  setStartGraphNode(e.target.value);
                  setCurrentStepIndex(0);
                }}
                className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-cyan-300 focus:outline-none"
              >
                {SAMPLE_GRAPH.nodes.map((n) => (
                  <option key={n.id} value={n.id}>Node {n.id}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Main Side-by-Side: Visualization Area + Pseudocode & Trace */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          {/* Left: Main Visualization Canvas (7 or 8 cols) */}
          <div
            id="dsa-canvas-pane"
            className="lg:col-span-7 xl:col-span-8 p-4 cyber-grid flex flex-col justify-between overflow-y-auto border-b lg:border-b-0 lg:border-r border-zinc-800"
          >
            {/* 1. Array Visualizer (Binary Search & Sorts) */}
            {['binary_search', 'bubble_sort', 'selection_sort', 'insertion_sort', 'merge_sort'].includes(
              selectedAlgoId
            ) && (
              <div className="flex-1 flex flex-col justify-center items-center py-4">
                <div className="w-full max-w-2xl bg-[#0b0f17]/90 border border-zinc-800 rounded-xl p-6 shadow-xl">
                  <div className="text-xs font-mono text-zinc-400 mb-4 flex items-center justify-between">
                    <span>ARRAY STATE BUFFER</span>
                    {selectedAlgoId === 'binary_search' && (
                      <span className="text-cyan-400">
                        LOW: {currentStep.state.low} | MID: {currentStep.state.mid} | HIGH: {currentStep.state.high}
                      </span>
                    )}
                  </div>

                  {/* Array bars / slots */}
                  <div className="flex items-end justify-center gap-2 h-44 border-b border-zinc-800 pb-2">
                    {(currentStep.state.arr || []).map((val: number, idx: number) => {
                      const isMid = currentStep.state.mid === idx;
                      const isLow = currentStep.state.low === idx;
                      const isHigh = currentStep.state.high === idx;
                      const isFound = currentStep.state.found && isMid;
                      const isComparing = currentStep.state.comparing?.includes(idx);
                      const isMin = currentStep.state.minIdx === idx;
                      const isKey = currentStep.state.keyIdx === idx;
                      const isOutsideSearch =
                        selectedAlgoId === 'binary_search' &&
                        (idx < currentStep.state.low || idx > currentStep.state.high);

                      let barColor = 'bg-cyan-950/70 border-cyan-500/40 text-cyan-300';
                      if (isFound) barColor = 'bg-emerald-500 text-black font-bold shadow-[0_0_15px_#10b981]';
                      else if (isMid) barColor = 'bg-cyan-400 text-black font-bold shadow-[0_0_12px_#06b6d4]';
                      else if (isComparing) barColor = 'bg-amber-500 text-black font-bold animate-pulse';
                      else if (isMin || isKey) barColor = 'bg-indigo-500 text-white font-bold';
                      else if (isOutsideSearch) barColor = 'bg-zinc-900/40 border-zinc-800 text-zinc-400 opacity-40';

                      // normalized height (min 20% to max 100%)
                      const maxVal = Math.max(...(currentStep.state.arr || [100]));
                      const heightPct = Math.max(25, Math.round((val / maxVal) * 85));

                      return (
                        <div key={idx} className="flex flex-col items-center flex-1 max-w-[54px] h-full justify-end">
                          <span className="text-[10px] font-mono text-zinc-400 mb-1">{val}</span>
                          <div
                            className={`w-full rounded-t-md border transition-all duration-200 flex items-center justify-center font-mono text-xs font-semibold ${barColor}`}
                            style={{ height: `${heightPct}%` }}
                          />
                          <div className="text-[9px] font-mono text-zinc-400 mt-1.5 flex flex-col items-center">
                            <span>[{idx}]</span>
                            {isLow && <span className="text-emerald-400 font-bold">L</span>}
                            {isMid && <span className="text-cyan-400 font-bold">MID</span>}
                            {isHigh && <span className="text-amber-400 font-bold">H</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* 2. Dynamic Programming Grid Visualizer (LCS / Edit Distance) */}
            {['lcs', 'edit_distance'].includes(selectedAlgoId) && (
              <div className="flex-1 flex flex-col items-center justify-center p-2">
                <div className="bg-[#0b0f17]/90 border border-zinc-800 rounded-xl p-4 shadow-xl overflow-auto max-w-full">
                  <div className="text-xs font-mono text-zinc-400 mb-2 flex items-center justify-between">
                    <span>DP MATRIX VISUALIZER</span>
                    <span className="text-cyan-400">
                      CURRENT CELL: [{currentStep.state.currentCell?.[0] ?? 0}][{currentStep.state.currentCell?.[1] ?? 0}]
                    </span>
                  </div>

                  <table className="border-collapse font-mono text-xs text-center">
                    <thead>
                      <tr>
                        <th className="p-2 border border-zinc-800 text-zinc-400">i \ j</th>
                        <th className="p-2 border border-zinc-800 text-zinc-400">∅</th>
                        {(currentStep.state.s2 || '').split('').map((ch: string, j: number) => (
                          <th key={j} className="p-2 border border-zinc-800 text-cyan-400 font-bold">
                            {ch}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(currentStep.state.dp || []).map((row: number[], rIdx: number) => (
                        <tr key={rIdx}>
                          <th className="p-2 border border-zinc-800 text-cyan-400 font-bold">
                            {rIdx === 0 ? '∅' : currentStep.state.s1?.[rIdx - 1]}
                          </th>
                          {row.map((val: number, cIdx: number) => {
                            const isCurrent =
                              currentStep.state.currentCell?.[0] === rIdx &&
                              currentStep.state.currentCell?.[1] === cIdx;
                            const isMatch = isCurrent && currentStep.state.match;

                            let cellBg = 'bg-zinc-900/40 text-zinc-300';
                            if (isMatch) cellBg = 'bg-emerald-500/40 text-emerald-300 border-emerald-400 font-bold shadow-[0_0_8px_#10b981]';
                            else if (isCurrent) cellBg = 'bg-cyan-500/40 text-cyan-200 border-cyan-400 font-bold shadow-[0_0_8px_#06b6d4]';

                            return (
                              <td
                                key={cIdx}
                                className={`w-9 h-9 border border-zinc-800 transition-all ${cellBg}`}
                              >
                                {val}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 3. Graph Algorithms Visualizer (BFS / DFS / Dijkstra) */}
            {['bfs', 'dfs', 'dijkstra'].includes(selectedAlgoId) && (
              <div className="flex-1 flex flex-col items-center justify-center p-2">
                <div className="w-full max-w-xl bg-[#0b0f17]/90 border border-zinc-800 rounded-xl p-4 shadow-xl">
                  <div className="text-xs font-mono text-zinc-400 mb-2 flex items-center justify-between">
                    <span>GRAPH TOPOLOGY & STATE</span>
                    <span className="text-cyan-400">
                      CURRENT NODE: <strong className="text-white">{currentStep.state.currentNode || 'NONE'}</strong>
                    </span>
                  </div>

                  {/* SVG Graph Canvas */}
                  <div className="w-full h-56 bg-[#07090e] rounded-lg border border-zinc-800/80 relative flex items-center justify-center">
                    <svg className="w-full h-full" viewBox="0 0 450 240">
                      {/* Edges */}
                      {SAMPLE_GRAPH.edges.map((edge, eIdx) => {
                        const fromNode = SAMPLE_GRAPH.nodes.find((n) => n.id === edge.from)!;
                        const toNode = SAMPLE_GRAPH.nodes.find((n) => n.id === edge.to)!;
                        const isActiveEdge =
                          (currentStep.state.activeEdge?.from === edge.from &&
                            currentStep.state.activeEdge?.to === edge.to) ||
                          (currentStep.state.activeEdge?.from === edge.to &&
                            currentStep.state.activeEdge?.to === edge.from);

                        const midX = (fromNode.x + toNode.x) / 2;
                        const midY = (fromNode.y + toNode.y) / 2;

                        return (
                          <g key={eIdx}>
                            <line
                              x1={fromNode.x}
                              y1={fromNode.y}
                              x2={toNode.x}
                              y2={toNode.y}
                              stroke={isActiveEdge ? '#06b6d4' : '#27272a'}
                              strokeWidth={isActiveEdge ? 3 : 1.5}
                              strokeDasharray={isActiveEdge ? '4 2' : 'none'}
                            />
                            {/* Weight badge */}
                            <circle cx={midX} cy={midY} r={8} fill="#090d14" stroke="#3f3f46" strokeWidth={1} />
                            <text
                              x={midX}
                              y={midY + 3}
                              fill="#a1a1aa"
                              fontSize={9}
                              textAnchor="middle"
                              fontFamily="monospace"
                            >
                              {edge.weight}
                            </text>
                          </g>
                        );
                      })}

                      {/* Nodes */}
                      {SAMPLE_GRAPH.nodes.map((node) => {
                        const isCurrent = currentStep.state.currentNode === node.id;
                        const isVisited = currentStep.state.visited?.includes(node.id);

                        let nodeFill = '#18181b';
                        let nodeStroke = '#3f3f46';
                        let textColor = '#d4d4d8';

                        if (isCurrent) {
                          nodeFill = '#06b6d4';
                          nodeStroke = '#22d3ee';
                          textColor = '#000000';
                        } else if (isVisited) {
                          nodeFill = '#064e3b';
                          nodeStroke = '#10b981';
                          textColor = '#6ee7b7';
                        }

                        return (
                          <g key={node.id} className="cursor-pointer">
                            <circle
                              cx={node.x}
                              cy={node.y}
                              r={16}
                              fill={nodeFill}
                              stroke={nodeStroke}
                              strokeWidth={2}
                              className="transition-all duration-200"
                            />
                            <text
                              x={node.x}
                              y={node.y + 4}
                              fill={textColor}
                              fontSize={12}
                              fontWeight="bold"
                              textAnchor="middle"
                              fontFamily="monospace"
                            >
                              {node.id}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>

                  {/* Sub-State: Queue / Stack / Distance Table */}
                  <div className="mt-3 pt-3 border-t border-zinc-800 text-xs font-mono flex items-center justify-between">
                    {selectedAlgoId === 'bfs' && (
                      <div>
                        <span className="text-zinc-400">FIFO QUEUE: </span>
                        <span className="text-cyan-300 font-bold">
                          [{(currentStep.state.queue || []).join(', ') || 'EMPTY'}]
                        </span>
                      </div>
                    )}
                    {selectedAlgoId === 'dfs' && (
                      <div>
                        <span className="text-zinc-400">CALL STACK: </span>
                        <span className="text-indigo-300 font-bold">
                          [{(currentStep.state.stackTrace || []).join(' → ') || 'EMPTY'}]
                        </span>
                      </div>
                    )}
                    {selectedAlgoId === 'dijkstra' && (
                      <div className="w-full flex items-center gap-3 overflow-x-auto">
                        <span className="text-zinc-400 shrink-0">DIST[]:</span>
                        {Object.entries(currentStep.state.dist || {}).map(([k, v]) => (
                          <span key={k} className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">
                            {k}: <strong className="text-cyan-400">{v === Infinity ? '∞' : String(v)}</strong>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Live Execution Trace Message */}
            <div className="mt-2 bg-[#0d1117] border border-cyan-500/30 rounded-xl p-3 flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
                <Activity className="w-4 h-4" />
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="text-[10px] font-mono text-cyan-400 uppercase font-semibold">
                  LIVE EXECUTION TRACE
                </div>
                <div className="text-xs text-zinc-200 font-mono truncate">
                  {currentStep.description}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Side-by-Side Pseudocode Area & Step Details (5 or 4 cols) */}
          <div
            id="dsa-code-pane"
            className="lg:col-span-5 xl:col-span-4 bg-[#090d14] flex flex-col p-4 overflow-y-auto"
          >
            {/* Pseudocode Header */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-3">
              <div className="flex items-center gap-2 text-xs font-mono font-semibold text-zinc-200">
                <Code className="w-4 h-4 text-cyan-400" />
                <span>ALGORITHM SOURCE / PSEUDOCODE</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                STEP {currentStepIndex + 1}
              </span>
            </div>

            {/* Pseudocode lines with line highlighting */}
            <div className="bg-[#05070a] rounded-lg border border-zinc-800/80 p-3 font-mono text-xs overflow-x-auto mb-4 flex-1">
              {selectedMeta.pseudocode.map((line, lIdx) => {
                const isLineActive = currentStep.highlightLines?.includes(lIdx);
                return (
                  <div
                    key={lIdx}
                    className={`py-1 px-2 rounded flex items-center gap-3 transition-colors ${
                      isLineActive
                        ? 'bg-cyan-950/80 text-cyan-300 border-l-2 border-cyan-400 font-semibold'
                        : 'text-zinc-400'
                    }`}
                  >
                    <span className="text-[10px] text-zinc-400 w-4 text-right select-none">{lIdx + 1}</span>
                    <span className="whitespace-pre">{line}</span>
                  </div>
                );
              })}
            </div>

            {/* Operations & Complexity Box */}
            <div className="bg-[#0b0f17] rounded-lg border border-zinc-800 p-3 text-xs font-mono flex flex-col gap-2">
              <div className="text-[11px] text-zinc-400 uppercase tracking-wider font-semibold">
                COMPLEXITY SPECIFICATION
              </div>
              <div className="grid grid-cols-2 gap-2 text-zinc-300">
                <div className="bg-zinc-900/60 p-2 rounded border border-zinc-800">
                  <span className="block text-[10px] text-zinc-400">TIME (WORST):</span>
                  <span className="font-bold text-cyan-400">{selectedMeta.timeComplexity}</span>
                </div>
                <div className="bg-zinc-900/60 p-2 rounded border border-zinc-800">
                  <span className="block text-[10px] text-zinc-400">SPACE (AUX):</span>
                  <span className="font-bold text-indigo-400">{selectedMeta.spaceComplexity}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
