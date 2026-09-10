import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  Cpu,
  Plus,
  Trash2,
  RotateCcw,
  Zap,
  Activity,
  Table,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { GateType, LogicGate, LogicWire } from '../../types';

// Preset configurations
const PRESET_HALF_ADDER: { gates: LogicGate[]; wires: LogicWire[] } = {
  gates: [
    { id: 'in_a', type: 'INPUT', x: 60, y: 80, width: 80, height: 50, inputs: [], output: true, label: 'IN A' },
    { id: 'in_b', type: 'INPUT', x: 60, y: 190, width: 80, height: 50, inputs: [], output: false, label: 'IN B' },
    { id: 'xor_1', type: 'XOR', x: 240, y: 70, width: 90, height: 65, inputs: [true, false], output: true, label: 'XOR' },
    { id: 'and_1', type: 'AND', x: 240, y: 180, width: 90, height: 65, inputs: [true, false], output: false, label: 'AND' },
    { id: 'out_sum', type: 'OUTPUT', x: 420, y: 80, width: 90, height: 50, inputs: [true], output: true, label: 'SUM (S)' },
    { id: 'out_carry', type: 'OUTPUT', x: 420, y: 190, width: 90, height: 50, inputs: [false], output: false, label: 'CARRY (C)' },
  ],
  wires: [
    { id: 'w1', fromGateId: 'in_a', fromPinIndex: 0, toGateId: 'xor_1', toPinIndex: 0 },
    { id: 'w2', fromGateId: 'in_b', fromPinIndex: 0, toGateId: 'xor_1', toPinIndex: 1 },
    { id: 'w3', fromGateId: 'in_a', fromPinIndex: 0, toGateId: 'and_1', toPinIndex: 0 },
    { id: 'w4', fromGateId: 'in_b', fromPinIndex: 0, toGateId: 'and_1', toPinIndex: 1 },
    { id: 'w5', fromGateId: 'xor_1', fromPinIndex: 0, toGateId: 'out_sum', toPinIndex: 0 },
    { id: 'w6', fromGateId: 'and_1', fromPinIndex: 0, toGateId: 'out_carry', toPinIndex: 0 },
  ],
};

const GATE_SPECS: Record<
  GateType,
  { name: string; inputCount: number; evaluate: (inputs: boolean[]) => boolean }
> = {
  INPUT: { name: 'INPUT SWITCH', inputCount: 0, evaluate: () => false },
  OUTPUT: { name: 'OUTPUT LED', inputCount: 1, evaluate: (inps) => Boolean(inps[0]) },
  AND: { name: 'AND GATE', inputCount: 2, evaluate: (inps) => Boolean(inps[0]) && Boolean(inps[1]) },
  OR: { name: 'OR GATE', inputCount: 2, evaluate: (inps) => Boolean(inps[0]) || Boolean(inps[1]) },
  NOT: { name: 'NOT GATE', inputCount: 1, evaluate: (inps) => !Boolean(inps[0]) },
  XOR: { name: 'XOR GATE', inputCount: 2, evaluate: (inps) => Boolean(inps[0]) !== Boolean(inps[1]) },
  NAND: { name: 'NAND GATE', inputCount: 2, evaluate: (inps) => !(Boolean(inps[0]) && Boolean(inps[1])) },
  NOR: { name: 'NOR GATE', inputCount: 2, evaluate: (inps) => !(Boolean(inps[0]) || Boolean(inps[1])) },
  XNOR: { name: 'XNOR GATE', inputCount: 2, evaluate: (inps) => Boolean(inps[0]) === Boolean(inps[1]) },
};

export const CircuitLab: React.FC = () => {
  const [gates, setGates] = useState<LogicGate[]>(PRESET_HALF_ADDER.gates);
  const [wires, setWires] = useState<LogicWire[]>(PRESET_HALF_ADDER.wires);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [gateSizeScale, setGateSizeScale] = useState<number>(1); // 0.8, 1, 1.2
  const [showTruthTable, setShowTruthTable] = useState<boolean>(false);

  // Dragging state
  const [draggingGateId, setDraggingGateId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Wiring creation state
  const [wiringStart, setWiringStart] = useState<{ gateId: string; pinIndex: number } | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const canvasRef = useRef<SVGSVGElement | null>(null);

  // Propagate signals across the circuit
  const propagateSignals = useCallback((currentGates: LogicGate[], currentWires: LogicWire[]) => {
    const updated = currentGates.map((g) => ({
      ...g,
      inputs: Array(GATE_SPECS[g.type].inputCount).fill(false),
    }));

    // Topological evaluation passes
    for (let pass = 0; pass < 6; pass++) {
      for (const wire of currentWires) {
        const source = updated.find((g) => g.id === wire.fromGateId);
        const target = updated.find((g) => g.id === wire.toGateId);
        if (source && target && wire.toPinIndex < target.inputs.length) {
          target.inputs[wire.toPinIndex] = source.output;
        }
      }

      for (const gate of updated) {
        if (gate.type === 'INPUT') {
          // Output retained from user toggle
        } else {
          gate.output = GATE_SPECS[gate.type].evaluate(gate.inputs);
        }
      }
    }

    return updated;
  }, []);

  // Recalculate whenever inputs or wires change
  useEffect(() => {
    setGates((prevGates) => propagateSignals(prevGates, wires));
  }, [wires, propagateSignals]);

  // Handle Input Switch Toggle
  const handleToggleInput = (gateId: string) => {
    setGates((prev) => {
      const next = prev.map((g) => (g.id === gateId ? { ...g, output: !g.output } : g));
      return propagateSignals(next, wires);
    });
  };

  // Add Gate to Canvas
  const handleAddGate = (type: GateType) => {
    const spec = GATE_SPECS[type];
    const newId = `${type.toLowerCase()}_${Date.now().toString().slice(-4)}`;
    const baseW = type === 'INPUT' || type === 'OUTPUT' ? 80 : 90;
    const baseH = spec.inputCount === 1 ? 55 : 65;

    const newGate: LogicGate = {
      id: newId,
      type,
      x: 180 + Math.floor(Math.random() * 80),
      y: 120 + Math.floor(Math.random() * 80),
      width: Math.round(baseW * gateSizeScale),
      height: Math.round(baseH * gateSizeScale),
      inputs: Array(spec.inputCount).fill(false),
      output: false,
      label: type,
    };

    setGates((prev) => propagateSignals([...prev, newGate], wires));
  };

  // Pin coordinates calculation
  const getPinCoords = (gate: LogicGate, isInput: boolean, pinIndex: number) => {
    const scale = gateSizeScale;
    const w = gate.width;
    const h = gate.height;

    if (isInput) {
      const inputCount = GATE_SPECS[gate.type].inputCount;
      const spacing = h / (inputCount + 1);
      return {
        x: gate.x,
        y: gate.y + spacing * (pinIndex + 1),
      };
    } else {
      return {
        x: gate.x + w,
        y: gate.y + h / 2,
      };
    }
  };

  // Mouse coordinate helper inside SVG
  const getSvgPoint = (e: React.MouseEvent) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / zoomLevel,
      y: (e.clientY - rect.top) / zoomLevel,
    };
  };

  // Dragging Gate
  const handleMouseDownGate = (e: React.MouseEvent, gate: LogicGate) => {
    e.stopPropagation();
    const pt = getSvgPoint(e);
    setDraggingGateId(gate.id);
    setDragOffset({ x: pt.x - gate.x, y: pt.y - gate.y });
  };

  const handleMouseMoveCanvas = (e: React.MouseEvent) => {
    const pt = getSvgPoint(e);
    setMousePos(pt);

    if (draggingGateId) {
      setGates((prev) =>
        prev.map((g) => {
          if (g.id === draggingGateId) {
            return {
              ...g,
              x: Math.max(10, Math.round(pt.x - dragOffset.x)),
              y: Math.max(10, Math.round(pt.y - dragOffset.y)),
            };
          }
          return g;
        })
      );
    }
  };

  const handleMouseUpCanvas = () => {
    setDraggingGateId(null);
  };

  // Wire Connection Handlers
  const handleStartWiring = (e: React.MouseEvent, gateId: string, pinIndex: number) => {
    e.stopPropagation();
    setWiringStart({ gateId, pinIndex });
  };

  const handleFinishWiring = (e: React.MouseEvent, targetGateId: string, targetPinIndex: number) => {
    e.stopPropagation();
    if (!wiringStart) return;

    // Prevent connecting gate to itself
    if (wiringStart.gateId === targetGateId) {
      setWiringStart(null);
      return;
    }

    // Check if target pin already has a wire, remove it
    const filteredWires = wires.filter(
      (w) => !(w.toGateId === targetGateId && w.toPinIndex === targetPinIndex)
    );

    const newWire: LogicWire = {
      id: `wire_${Date.now().toString().slice(-5)}`,
      fromGateId: wiringStart.gateId,
      fromPinIndex: wiringStart.pinIndex,
      toGateId: targetGateId,
      toPinIndex: targetPinIndex,
    };

    setWires([...filteredWires, newWire]);
    setWiringStart(null);
  };

  const handleDeleteWire = (wireId: string) => {
    setWires((prev) => prev.filter((w) => w.id !== wireId));
  };

  const handleDeleteGate = (gateId: string) => {
    setGates((prev) => prev.filter((g) => g.id !== gateId));
    setWires((prev) => prev.filter((w) => w.fromGateId !== gateId && w.toGateId !== gateId));
  };

  const handleLoadPreset = (preset: 'half_adder' | 'blank') => {
    if (preset === 'half_adder') {
      setGates(PRESET_HALF_ADDER.gates);
      setWires(PRESET_HALF_ADDER.wires);
    } else {
      setGates([]);
      setWires([]);
    }
  };

  // Generate dynamic truth table based on all INPUT and OUTPUT gates
  const truthTableData = useMemo(() => {
    const inputGates = gates.filter((g) => g.type === 'INPUT');
    const outputGates = gates.filter((g) => g.type === 'OUTPUT');

    if (inputGates.length === 0 || inputGates.length > 4) {
      return null;
    }

    const rowsCount = Math.pow(2, inputGates.length);
    const rows = [];

    for (let i = 0; i < rowsCount; i++) {
      const inputVals: boolean[] = [];
      for (let bit = inputGates.length - 1; bit >= 0; bit--) {
        inputVals.push(Boolean((i >> bit) & 1));
      }

      // Simulate
      const simGates = gates.map((g) => {
        const inpIdx = inputGates.findIndex((ig) => ig.id === g.id);
        if (inpIdx >= 0) {
          return { ...g, output: inputVals[inpIdx] };
        }
        return { ...g };
      });

      const evaluated = propagateSignals(simGates, wires);

      const outVals = outputGates.map((og) => {
        const found = evaluated.find((g) => g.id === og.id);
        return found ? found.output : false;
      });

      rows.push({ inputVals, outVals });
    }

    return { inputGates, outputGates, rows };
  }, [gates, wires, propagateSignals]);

  return (
    <div
      id="circuit-lab-root"
      className="h-full w-full flex flex-col bg-[#07090e] text-zinc-100 select-none overflow-hidden"
    >
      {/* Top Toolbar */}
      <div
        id="circuit-toolbar"
        className="h-14 bg-[#0c1017] border-b border-zinc-800 px-4 flex flex-wrap items-center justify-between gap-3 shrink-0 z-10"
      >
        {/* Gate Catalog Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <span className="text-[11px] font-mono text-zinc-400 uppercase mr-1 hidden sm:inline">
            ADD:
          </span>

          <button
            id="btn-add-input"
            onClick={() => handleAddGate('INPUT')}
            className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-cyan-400 border border-cyan-500/30 text-xs font-mono font-bold"
          >
            + SWITCH
          </button>

          <button
            id="btn-add-output"
            onClick={() => handleAddGate('OUTPUT')}
            className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-amber-400 border border-amber-500/30 text-xs font-mono font-bold"
          >
            + LED
          </button>

          {(['AND', 'OR', 'NOT', 'XOR', 'NAND', 'NOR', 'XNOR'] as GateType[]).map((gt) => (
            <button
              key={gt}
              id={`btn-add-${gt.toLowerCase()}`}
              onClick={() => handleAddGate(gt)}
              className="px-2 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 text-xs font-mono"
            >
              {gt}
            </button>
          ))}
        </div>

        {/* Canvas Controls: Zoom, Scale, Presets, Truth Table */}
        <div className="flex items-center gap-2 font-mono text-xs">
          {/* Gate Scale Slider */}
          <div className="flex items-center gap-1 bg-zinc-900 px-2 py-1 rounded border border-zinc-800">
            <span className="text-[10px] text-zinc-400">SCALE:</span>
            <button
              onClick={() => setGateSizeScale(0.85)}
              className={`px-1.5 py-0.5 rounded ${gateSizeScale === 0.85 ? 'bg-cyan-500 text-black font-bold' : 'text-zinc-400'}`}
            >
              S
            </button>
            <button
              onClick={() => setGateSizeScale(1)}
              className={`px-1.5 py-0.5 rounded ${gateSizeScale === 1 ? 'bg-cyan-500 text-black font-bold' : 'text-zinc-400'}`}
            >
              M
            </button>
            <button
              onClick={() => setGateSizeScale(1.2)}
              className={`px-1.5 py-0.5 rounded ${gateSizeScale === 1.2 ? 'bg-cyan-500 text-black font-bold' : 'text-zinc-400'}`}
            >
              L
            </button>
          </div>

          <button
            id="btn-truth-table"
            onClick={() => setShowTruthTable(!showTruthTable)}
            className={`px-2.5 py-1 rounded border flex items-center gap-1 transition-all ${
              showTruthTable
                ? 'bg-cyan-950 border-cyan-400 text-cyan-300'
                : 'bg-zinc-800 border-zinc-700 text-zinc-300'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>Truth Table</span>
          </button>

          {/* Presets */}
          <select
            id="select-circuit-preset"
            onChange={(e) => handleLoadPreset(e.target.value as any)}
            className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-cyan-300 focus:outline-none"
            defaultValue="half_adder"
          >
            <option value="half_adder">Half Adder</option>
            <option value="blank">Blank Canvas</option>
          </select>

          <button
            id="btn-clear-circuit"
            onClick={() => handleLoadPreset('blank')}
            className="p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-red-400 border border-zinc-700"
            title="Clear Circuit"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Canvas + Interactive Wires */}
      <div
        className="flex-1 relative overflow-hidden bg-[#07090e] cyber-grid-dense cursor-crosshair"
        onMouseMove={handleMouseMoveCanvas}
        onMouseUp={handleMouseUpCanvas}
      >
        <svg
          ref={canvasRef}
          className="w-full h-full absolute inset-0"
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: '0 0' }}
        >
          {/* Wire rendering */}
          {wires.map((wire) => {
            const sourceGate = gates.find((g) => g.id === wire.fromGateId);
            const targetGate = gates.find((g) => g.id === wire.toGateId);
            if (!sourceGate || !targetGate) return null;

            const p1 = getPinCoords(sourceGate, false, wire.fromPinIndex);
            const p2 = getPinCoords(targetGate, true, wire.toPinIndex);

            const isHigh = sourceGate.output;
            const deltaX = Math.abs(p2.x - p1.x) * 0.5;
            const pathD = `M ${p1.x} ${p1.y} C ${p1.x + deltaX} ${p1.y}, ${p2.x - deltaX} ${p2.y}, ${p2.x} ${p2.y}`;

            return (
              <g key={wire.id} className="group cursor-pointer">
                {/* Wider invisible hit area */}
                <path
                  d={pathD}
                  fill="none"
                  stroke="transparent"
                  strokeWidth={14}
                  onClick={() => handleDeleteWire(wire.id)}
                />
                {/* Visible wire */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={isHigh ? '#06b6d4' : '#334155'}
                  strokeWidth={isHigh ? 3 : 2}
                  className="transition-colors duration-150"
                  filter={isHigh ? 'drop-shadow(0 0 6px #06b6d4)' : 'none'}
                />
              </g>
            );
          })}

          {/* Pending wire being dragged */}
          {wiringStart && (
            <path
              d={`M ${
                getPinCoords(
                  gates.find((g) => g.id === wiringStart.gateId)!,
                  false,
                  wiringStart.pinIndex
                ).x
              } ${
                getPinCoords(
                  gates.find((g) => g.id === wiringStart.gateId)!,
                  false,
                  wiringStart.pinIndex
                ).y
              } C ${(mousePos.x + 50)} ${mousePos.y}, ${mousePos.x} ${mousePos.y}, ${mousePos.x} ${mousePos.y}`}
              fill="none"
              stroke="#06b6d4"
              strokeWidth={2}
              strokeDasharray="4 4"
            />
          )}

          {/* Gates rendered directly inside SVG for precision */}
          {gates.map((gate) => {
            const spec = GATE_SPECS[gate.type];
            const isSelected = draggingGateId === gate.id;
            const isInputSwitch = gate.type === 'INPUT';
            const isOutputLed = gate.type === 'OUTPUT';

            return (
              <g
                key={gate.id}
                id={`gate-node-${gate.id}`}
                transform={`translate(${gate.x}, ${gate.y})`}
                className="cursor-move"
                onMouseDown={(e) => handleMouseDownGate(e, gate)}
              >
                {/* Gate Body Card */}
                <rect
                  width={gate.width}
                  height={gate.height}
                  rx={8}
                  fill={isInputSwitch ? '#0a1420' : isOutputLed ? '#17120a' : '#0d1117'}
                  stroke={
                    isSelected
                      ? '#06b6d4'
                      : isInputSwitch
                      ? '#0284c7'
                      : isOutputLed
                      ? '#d97706'
                      : '#27272a'
                  }
                  strokeWidth={isSelected ? 2 : 1.5}
                  filter="drop-shadow(0 4px 6px rgba(0,0,0,0.5))"
                />

                {/* Gate Label */}
                <text
                  x={gate.width / 2}
                  y={gate.height / 2 - (isInputSwitch || isOutputLed ? 2 : 6)}
                  textAnchor="middle"
                  fill="#f4f4f5"
                  fontSize={11}
                  fontWeight="bold"
                  fontFamily="monospace"
                  pointerEvents="none"
                >
                  {gate.label || gate.type}
                </text>

                {/* Gate Subtitle or Output Value */}
                <text
                  x={gate.width / 2}
                  y={gate.height / 2 + 12}
                  textAnchor="middle"
                  fill={gate.output ? '#06b6d4' : '#71717a'}
                  fontSize={10}
                  fontWeight="bold"
                  fontFamily="monospace"
                  pointerEvents="none"
                >
                  {isInputSwitch
                    ? `[${gate.output ? 'HIGH (1)' : 'LOW (0)'}]`
                    : isOutputLed
                    ? `STATE: ${gate.output ? '1' : '0'}`
                    : `OUT: ${gate.output ? '1' : '0'}`}
                </text>

                {/* Interactive Toggle for Input Switches */}
                {isInputSwitch && (
                  <circle
                    cx={gate.width / 2}
                    cy={gate.height / 2 + 10}
                    r={12}
                    fill="transparent"
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleInput(gate.id);
                    }}
                  />
                )}

                {/* Input Pins (Left side) */}
                {Array.from({ length: spec.inputCount }).map((_, pIdx) => {
                  const coords = getPinCoords(gate, true, pIdx);
                  const pinVal = gate.inputs[pIdx] || false;
                  return (
                    <g
                      key={pIdx}
                      className="cursor-pointer"
                      onClick={(e) => handleFinishWiring(e, gate.id, pIdx)}
                    >
                      <circle
                        cx={0}
                        cy={coords.y - gate.y}
                        r={6}
                        fill={pinVal ? '#06b6d4' : '#18181b'}
                        stroke={pinVal ? '#22d3ee' : '#52525b'}
                        strokeWidth={2}
                      />
                      <title>{`Input ${pIdx + 1} (${pinVal ? '1' : '0'})`}</title>
                    </g>
                  );
                })}

                {/* Output Pin (Right side) - except for OUTPUT LED */}
                {!isOutputLed && (
                  <g
                    className="cursor-pointer"
                    onMouseDown={(e) => handleStartWiring(e, gate.id, 0)}
                  >
                    <circle
                      cx={gate.width}
                      cy={gate.height / 2}
                      r={7}
                      fill={gate.output ? '#06b6d4' : '#18181b'}
                      stroke={gate.output ? '#22d3ee' : '#52525b'}
                      strokeWidth={2}
                      filter={gate.output ? 'drop-shadow(0 0 6px #06b6d4)' : 'none'}
                    />
                    <title>Output Pin (Click & Drag to Connect)</title>
                  </g>
                )}

                {/* Delete button (small 'x' on top right) */}
                <g
                  className="cursor-pointer opacity-40 hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteGate(gate.id);
                  }}
                >
                  <circle cx={gate.width - 8} cy={8} r={5} fill="#ef4444" />
                </g>
              </g>
            );
          })}
        </svg>

        {/* Dynamic Truth Table Modal / Floating Card */}
        {showTruthTable && truthTableData && (
          <div className="absolute right-4 bottom-4 bg-[#0d1117]/95 border border-cyan-500/40 rounded-xl p-4 shadow-2xl z-20 max-w-sm max-h-80 overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800 mb-3">
              <span className="text-xs font-mono text-cyan-400 font-bold uppercase">
                CIRCUIT TRUTH TABLE
              </span>
              <button
                onClick={() => setShowTruthTable(false)}
                className="text-xs text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <table className="w-full text-center font-mono text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400">
                  {truthTableData.inputGates.map((g) => (
                    <th key={g.id} className="p-1 text-cyan-400 font-bold">{g.label || g.id}</th>
                  ))}
                  <th className="p-1 text-zinc-500">|</th>
                  {truthTableData.outputGates.map((g) => (
                    <th key={g.id} className="p-1 text-amber-400 font-bold">{g.label || g.id}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {truthTableData.rows.map((row, rIdx) => (
                  <tr key={rIdx} className="border-b border-zinc-900/60 hover:bg-zinc-800/40">
                    {row.inputVals.map((v, i) => (
                      <td key={i} className="p-1 text-zinc-300">{v ? '1' : '0'}</td>
                    ))}
                    <td className="p-1 text-zinc-500">|</td>
                    {row.outVals.map((v, i) => (
                      <td
                        key={i}
                        className={`p-1 font-bold ${v ? 'text-cyan-400' : 'text-zinc-500'}`}
                      >
                        {v ? '1' : '0'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
