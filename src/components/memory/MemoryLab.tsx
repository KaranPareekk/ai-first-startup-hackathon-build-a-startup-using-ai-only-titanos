import React, { useState } from 'react';
import {
  Layers,
  HardDrive,
  Database,
  ArrowRight,
  Plus,
  Trash2,
  Cpu,
  CornerDownRight,
  Zap,
} from 'lucide-react';
import { MemoryDataType } from '../../types';

interface DataTypeConfig {
  name: string;
  size: number;
  signed: boolean;
  desc: string;
}

const DATA_TYPES: Record<MemoryDataType, DataTypeConfig> = {
  int8: { name: 'int8_t / char', size: 1, signed: true, desc: '1 Byte (8 bits, -128 to 127)' },
  int16: { name: 'int16_t / short', size: 2, signed: true, desc: '2 Bytes (16 bits, -32768 to 32767)' },
  int32: { name: 'int32_t / int', size: 4, signed: true, desc: '4 Bytes (32 bits, 2s-complement)' },
  float32: { name: 'float (IEEE-754)', size: 4, signed: true, desc: '4 Bytes (1 sign, 8 exp, 23 mantissa)' },
  pointer: { name: 'uintptr_t (Ptr)', size: 8, signed: false, desc: '8 Bytes (64-bit Virtual Address)' },
};

interface LinkedListNode {
  address: string;
  value: number;
  next: string | null;
}

export const MemoryLab: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'typed_memory' | 'stack' | 'queue' | 'linked_list'>('typed_memory');

  // Typed Memory State
  const [selectedType, setSelectedType] = useState<MemoryDataType>('int32');
  const [baseAddressHex, setBaseAddressHex] = useState<string>('0x7FFE2000');
  const [elementCount, setElementCount] = useState<number>(8);
  const [selectedIndex, setSelectedIndex] = useState<number>(2);
  const [memoryValues, setMemoryValues] = useState<number[]>([15, 42, 99, 120, 255, 314, 512, 1024]);
  const [writeValue, setWriteValue] = useState<string>('1337');
  const [memoryTrace, setMemoryTrace] = useState<string[]>([
    'KERNEL: Virtual Memory Page mapped at 0x7FFE2000.',
    'LOAD: Initialized 8-element typed array.',
  ]);

  // Stack State
  const [stack, setStack] = useState<number[]>([10, 25, 42, 88]);
  const [stackInput, setStackInput] = useState<string>('99');
  const [stackTrace, setStackTrace] = useState<string[]>([
    'STACK_INIT: Base frame created at RSP=0x7FFF00F0',
    'PUSH: 10, 25, 42, 88',
  ]);

  // Queue State
  const [queue, setQueue] = useState<number[]>([101, 102, 103, 104]);
  const [queueInput, setQueueInput] = useState<string>('105');
  const [queueTrace, setQueueTrace] = useState<string[]>([
    'QUEUE_INIT: FIFO Ring Buffer mapped. Capacity=8',
  ]);

  // Linked List State
  const [linkedList, setLinkedList] = useState<LinkedListNode[]>([
    { address: '0x0040A100', value: 12, next: '0x0040A120' },
    { address: '0x0040A120', value: 34, next: '0x0040A140' },
    { address: '0x0040A140', value: 56, next: '0x0040A160' },
    { address: '0x0040A160', value: 78, next: null },
  ]);
  const [llInput, setLlInput] = useState<string>('90');

  // Address Calculation Math
  const typeConfig = DATA_TYPES[selectedType];
  const baseDec = parseInt(baseAddressHex, 16) || 0x7ffe2000;
  const targetAddressDec = baseDec + selectedIndex * typeConfig.size;
  const targetAddressHex = '0x' + targetAddressDec.toString(16).toUpperCase();

  const handleWriteMemory = () => {
    const val = parseInt(writeValue, 10);
    if (isNaN(val)) return;
    const updated = [...memoryValues];
    updated[selectedIndex] = val;
    setMemoryValues(updated);
    const log = `STORE [${targetAddressHex}] (A[${selectedIndex}]) <= ${val} (Size: ${typeConfig.size}B)`;
    setMemoryTrace((prev) => [log, ...prev.slice(0, 15)]);
  };

  // Stack actions
  const handlePushStack = () => {
    const val = parseInt(stackInput, 10);
    if (isNaN(val)) return;
    if (stack.length >= 8) {
      setStackTrace((prev) => ['ERROR: STACK_OVERFLOW! Max frames reached.', ...prev]);
      return;
    }
    setStack((prev) => [...prev, val]);
    setStackTrace((prev) => [`PUSH [RSP] <= ${val} (RSP decremented by 8)`, ...prev.slice(0, 10)]);
    setStackInput(String(Math.floor(Math.random() * 90) + 10));
  };

  const handlePopStack = () => {
    if (stack.length === 0) {
      setStackTrace((prev) => ['ERROR: STACK_UNDERFLOW! Stack is empty.', ...prev]);
      return;
    }
    const popped = stack[stack.length - 1];
    setStack((prev) => prev.slice(0, -1));
    setStackTrace((prev) => [`POP [RSP] => ${popped} (RSP incremented by 8)`, ...prev.slice(0, 10)]);
  };

  // Queue actions
  const handleEnqueue = () => {
    const val = parseInt(queueInput, 10);
    if (isNaN(val)) return;
    if (queue.length >= 8) {
      setQueueTrace((prev) => ['QUEUE_FULL: Buffer at maximum capacity.', ...prev]);
      return;
    }
    setQueue((prev) => [...prev, val]);
    setQueueTrace((prev) => [`ENQUEUE: Value ${val} added to TAIL pointer.`, ...prev.slice(0, 10)]);
    setQueueInput(String(Number(queueInput) + 1));
  };

  const handleDequeue = () => {
    if (queue.length === 0) {
      setQueueTrace((prev) => ['QUEUE_EMPTY: Nothing to dequeue.', ...prev]);
      return;
    }
    const dequeued = queue[0];
    setQueue((prev) => prev.slice(1));
    setQueueTrace((prev) => [`DEQUEUE: Value ${dequeued} extracted from HEAD pointer.`, ...prev.slice(0, 10)]);
  };

  // Linked List actions
  const handleInsertHead = () => {
    const val = parseInt(llInput, 10);
    if (isNaN(val)) return;
    const newAddr = '0x0040A' + (Math.floor(Math.random() * 899) + 100).toString(16).toUpperCase();
    const oldHead = linkedList[0]?.address || null;
    const newNode: LinkedListNode = { address: newAddr, value: val, next: oldHead };
    setLinkedList([newNode, ...linkedList]);
    setLlInput(String(Math.floor(Math.random() * 90) + 10));
  };

  const handleInsertTail = () => {
    const val = parseInt(llInput, 10);
    if (isNaN(val)) return;
    const newAddr = '0x0040A' + (Math.floor(Math.random() * 899) + 100).toString(16).toUpperCase();
    const newNode: LinkedListNode = { address: newAddr, value: val, next: null };
    if (linkedList.length === 0) {
      setLinkedList([newNode]);
    } else {
      const updated = [...linkedList];
      updated[updated.length - 1].next = newAddr;
      updated.push(newNode);
      setLinkedList(updated);
    }
    setLlInput(String(Math.floor(Math.random() * 90) + 10));
  };

  const handleDeleteTail = () => {
    if (linkedList.length === 0) return;
    if (linkedList.length === 1) {
      setLinkedList([]);
    } else {
      const updated = linkedList.slice(0, -1);
      updated[updated.length - 1].next = null;
      setLinkedList(updated);
    }
  };

  return (
    <div
      id="memory-lab-root"
      className="h-full w-full flex flex-col bg-[#07090e] text-zinc-100 select-none overflow-hidden"
    >
      {/* Top Mode Selector Tabs */}
      <div
        id="memory-tabs-bar"
        className="h-12 bg-[#0c1017] border-b border-zinc-800 px-4 flex items-center justify-between shrink-0"
      >
        <div className="flex items-center gap-2">
          <button
            id="tab-typed-memory"
            onClick={() => setActiveTab('typed_memory')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'typed_memory'
                ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/50 shadow-[0_0_8px_rgba(6,182,212,0.2)]'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
            <span>Typed Memory & Arrays</span>
          </button>

          <button
            id="tab-stack"
            onClick={() => setActiveTab('stack')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'stack'
                ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/50 shadow-[0_0_8px_rgba(6,182,212,0.2)]'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>Stack Simulator (LIFO)</span>
          </button>

          <button
            id="tab-queue"
            onClick={() => setActiveTab('queue')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'queue'
                ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/50 shadow-[0_0_8px_rgba(6,182,212,0.2)]'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>Queue Simulator (FIFO)</span>
          </button>

          <button
            id="tab-linked-list"
            onClick={() => setActiveTab('linked_list')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'linked_list'
                ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/50 shadow-[0_0_8px_rgba(6,182,212,0.2)]'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <CornerDownRight className="w-3.5 h-3.5 text-amber-400" />
            <span>Linked List & Heap</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono text-zinc-400">
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          <span>LITTLE-ENDIAN BYTE ORDER (x86-64)</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-4 lg:p-6 overflow-y-auto cyber-grid">
        {/* 1. TYPED MEMORY & ADDRESS CALCULATION */}
        {activeTab === 'typed_memory' && (
          <div className="h-full flex flex-col gap-4 max-w-7xl mx-auto">
            {/* Top Config & Equation Card */}
            <div className="bg-[#0b0f17]/95 border border-zinc-800 rounded-xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-wrap">
                <div>
                  <span className="block text-[10px] font-mono text-zinc-400 uppercase">Data Type</span>
                  <select
                    id="select-memory-type"
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value as MemoryDataType)}
                    className="bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1 text-xs font-mono text-cyan-300 focus:outline-none"
                  >
                    {Object.entries(DATA_TYPES).map(([k, v]) => (
                      <option key={k} value={k}>{v.name} ({v.size}B)</option>
                    ))}
                  </select>
                </div>

                <div>
                  <span className="block text-[10px] font-mono text-zinc-400 uppercase">Base Address (Hex)</span>
                  <input
                    id="input-base-address"
                    type="text"
                    value={baseAddressHex}
                    onChange={(e) => setBaseAddressHex(e.target.value)}
                    className="bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1 text-xs font-mono text-cyan-300 w-32 focus:outline-none uppercase"
                  />
                </div>

                <div>
                  <span className="block text-[10px] font-mono text-zinc-400 uppercase">Selected Index</span>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: elementCount }).map((_, i) => (
                      <button
                        key={i}
                        id={`btn-idx-${i}`}
                        onClick={() => setSelectedIndex(i)}
                        className={`w-7 h-7 rounded text-xs font-mono font-bold transition-all ${
                          selectedIndex === i
                            ? 'bg-cyan-500 text-black shadow-[0_0_8px_#06b6d4]'
                            : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                        }`}
                      >
                        {i}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Formula & Calculation Result */}
              <div className="bg-zinc-950 p-3 rounded-lg border border-cyan-500/30 font-mono text-xs text-zinc-300 flex flex-col gap-1">
                <div className="text-[10px] text-cyan-400 uppercase tracking-wider font-semibold">
                  POINTER ADDRESS ARITHMETIC
                </div>
                <div className="text-zinc-200">
                  Address(A[{selectedIndex}]) = Base + (i × Size)
                </div>
                <div className="text-cyan-300 font-bold">
                  = {baseAddressHex} + ({selectedIndex} × {typeConfig.size} bytes) ={' '}
                  <span className="text-emerald-400">{targetAddressHex}</span>
                </div>
              </div>
            </div>

            {/* Middle: Contiguous Memory Layout & Read/Write */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
              {/* Left 8 cols: Array Elements & Byte Map */}
              <div className="lg:col-span-8 bg-[#0b0f17]/95 border border-zinc-800 rounded-xl p-4 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-800 mb-4">
                    <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
                      CONTIGUOUS MEMORY BLOCK (PHYSICAL / VIRTUAL)
                    </span>
                    <span className="text-xs font-mono text-cyan-400">
                      ELEMENT SIZE: {typeConfig.size} BYTE{typeConfig.size > 1 ? 'S' : ''}
                    </span>
                  </div>

                  {/* Visual Array Cells */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                    {Array.from({ length: elementCount }).map((_, idx) => {
                      const isSelected = selectedIndex === idx;
                      const addrDec = baseDec + idx * typeConfig.size;
                      const addrHex = '0x' + addrDec.toString(16).toUpperCase();
                      const val = memoryValues[idx] ?? 0;

                      return (
                        <div
                          key={idx}
                          id={`mem-card-${idx}`}
                          onClick={() => setSelectedIndex(idx)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer relative ${
                            isSelected
                              ? 'bg-cyan-950/70 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                              : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 mb-1">
                            <span className="text-cyan-400 font-bold">A[{idx}]</span>
                            <span>{typeConfig.size}B</span>
                          </div>
                          <div className="font-mono text-lg font-bold text-zinc-100 my-1">
                            {val}
                          </div>
                          <div className="text-[10px] font-mono text-zinc-400 truncate">
                            {addrHex}
                          </div>
                          {isSelected && (
                            <span className="absolute -top-2 right-2 text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-400 text-black font-bold shadow-[0_0_6px_#06b6d4]">
                              TARGET
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Read / Write Console */}
                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/80 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-zinc-400">STORE TO A[{selectedIndex}]:</span>
                    <input
                      id="input-write-value"
                      type="number"
                      value={writeValue}
                      onChange={(e) => setWriteValue(e.target.value)}
                      className="bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1 text-xs font-mono text-cyan-300 w-28 focus:outline-none"
                    />
                    <button
                      id="btn-memory-write"
                      onClick={handleWriteMemory}
                      className="px-3 py-1.5 rounded bg-cyan-500 hover:bg-cyan-400 text-black font-tech font-bold text-xs flex items-center gap-1 shadow-[0_0_8px_rgba(6,182,212,0.3)]"
                    >
                      <Zap className="w-3 h-3 fill-current" />
                      WRITE (STORE)
                    </button>
                  </div>

                  <div className="text-xs font-mono text-zinc-400">
                    READ VALUE: <strong className="text-emerald-400">{memoryValues[selectedIndex] ?? 0}</strong>
                  </div>
                </div>
              </div>

              {/* Right 4 cols: Process Trace Log */}
              <div className="lg:col-span-4 bg-[#0b0f17]/95 border border-zinc-800 rounded-xl p-4 shadow-xl flex flex-col">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800 mb-2">
                  <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
                    BUS & MEMORY TRACE
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400">ONLINE</span>
                </div>
                <div className="flex-1 bg-[#05070a] rounded-lg border border-zinc-800/80 p-3 font-mono text-[11px] overflow-y-auto max-h-80 flex flex-col gap-1.5 text-zinc-300">
                  {memoryTrace.map((line, idx) => (
                    <div key={idx} className="pb-1 border-b border-zinc-900 last:border-0">
                      <span className="text-cyan-400 font-bold">&gt;</span> {line}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. STACK SIMULATOR (LIFO) */}
        {activeTab === 'stack' && (
          <div className="h-full flex flex-col lg:flex-row gap-6 max-w-5xl mx-auto">
            {/* Stack Visualizer */}
            <div className="flex-1 bg-[#0b0f17]/95 border border-zinc-800 rounded-xl p-6 shadow-xl flex flex-col items-center">
              <div className="w-full flex items-center justify-between pb-3 border-b border-zinc-800 mb-6">
                <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
                  CALL & EXECUTION STACK (LIFO)
                </span>
                <span className="text-xs font-mono text-cyan-400">
                  STACK POINTER (RSP): {stack.length > 0 ? `0x7FFF00${(16 - stack.length).toString(16).toUpperCase()}0` : '0x7FFF0100 (EMPTY)'}
                </span>
              </div>

              {/* Vertical Stack Frame container */}
              <div className="w-64 border-2 border-dashed border-zinc-700 rounded-xl p-3 flex flex-col-reverse gap-2 min-h-[320px] bg-zinc-950/60 justify-start">
                {stack.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-zinc-400 font-mono text-xs">
                    [STACK IS EMPTY]
                  </div>
                ) : (
                  stack.map((val, idx) => {
                    const isTop = idx === stack.length - 1;
                    return (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg border font-mono flex items-center justify-between transition-all ${
                          isTop
                            ? 'bg-indigo-950/80 border-indigo-400 text-indigo-200 shadow-[0_0_12px_rgba(99,102,241,0.3)]'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-300'
                        }`}
                      >
                        <span className="text-xs font-bold">{val}</span>
                        {isTop && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500 text-white shadow">
                            TOP (RSP)
                          </span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Stack Controls */}
              <div className="mt-6 flex items-center gap-3">
                <input
                  id="input-stack-val"
                  type="number"
                  value={stackInput}
                  onChange={(e) => setStackInput(e.target.value)}
                  className="bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1 text-xs font-mono text-cyan-300 w-24 focus:outline-none"
                />
                <button
                  id="btn-stack-push"
                  onClick={handlePushStack}
                  className="px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-tech font-bold text-xs flex items-center gap-1 shadow-[0_0_8px_rgba(99,102,241,0.3)]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  PUSH
                </button>
                <button
                  id="btn-stack-pop"
                  onClick={handlePopStack}
                  className="px-3 py-1.5 rounded bg-red-950/80 hover:bg-red-900 border border-red-500/40 text-red-200 font-tech font-bold text-xs flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  POP
                </button>
              </div>
            </div>

            {/* Trace Panel */}
            <div className="w-full lg:w-80 bg-[#0b0f17]/95 border border-zinc-800 rounded-xl p-4 shadow-xl flex flex-col">
              <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider pb-2 border-b border-zinc-800 mb-2">
                STACK REGISTER TRACE
              </span>
              <div className="flex-1 bg-[#05070a] rounded-lg border border-zinc-800/80 p-3 font-mono text-[11px] overflow-y-auto flex flex-col gap-2 text-zinc-300">
                {stackTrace.map((line, idx) => (
                  <div key={idx} className="pb-1 border-b border-zinc-900 last:border-0">
                    <span className="text-indigo-400 font-bold">&gt;</span> {line}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 3. QUEUE SIMULATOR (FIFO) */}
        {activeTab === 'queue' && (
          <div className="h-full flex flex-col lg:flex-row gap-6 max-w-5xl mx-auto">
            <div className="flex-1 bg-[#0b0f17]/95 border border-zinc-800 rounded-xl p-6 shadow-xl flex flex-col items-center">
              <div className="w-full flex items-center justify-between pb-3 border-b border-zinc-800 mb-6">
                <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
                  FIFO CIRCULAR BUFFER QUEUE
                </span>
                <span className="text-xs font-mono text-emerald-400">
                  COUNT: {queue.length} / 8
                </span>
              </div>

              {/* Horizontal Queue visualization */}
              <div className="w-full max-w-xl h-28 border-2 border-dashed border-zinc-700 rounded-xl p-3 flex items-center gap-3 bg-zinc-950/60 overflow-x-auto">
                {queue.length === 0 ? (
                  <div className="w-full text-center text-zinc-400 font-mono text-xs">
                    [QUEUE IS EMPTY]
                  </div>
                ) : (
                  queue.map((val, idx) => {
                    const isHead = idx === 0;
                    const isTail = idx === queue.length - 1;
                    return (
                      <div
                        key={idx}
                        className={`min-w-[70px] h-16 rounded-lg border p-2 flex flex-col justify-between font-mono ${
                          isHead
                            ? 'bg-emerald-950/80 border-emerald-400 text-emerald-200 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                            : isTail
                            ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-300'
                        }`}
                      >
                        <div className="text-[9px] font-bold">
                          {isHead && 'HEAD'}
                          {isTail && !isHead && 'TAIL'}
                          {!isHead && !isTail && `[${idx}]`}
                        </div>
                        <div className="text-sm font-bold text-center">{val}</div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Controls */}
              <div className="mt-6 flex items-center gap-3">
                <input
                  id="input-queue-val"
                  type="number"
                  value={queueInput}
                  onChange={(e) => setQueueInput(e.target.value)}
                  className="bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1 text-xs font-mono text-cyan-300 w-24 focus:outline-none"
                />
                <button
                  id="btn-queue-enqueue"
                  onClick={handleEnqueue}
                  className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-tech font-bold text-xs flex items-center gap-1 shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  ENQUEUE (TAIL)
                </button>
                <button
                  id="btn-queue-dequeue"
                  onClick={handleDequeue}
                  className="px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 font-tech font-bold text-xs flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  DEQUEUE (HEAD)
                </button>
              </div>
            </div>

            {/* Queue Trace */}
            <div className="w-full lg:w-80 bg-[#0b0f17]/95 border border-zinc-800 rounded-xl p-4 shadow-xl flex flex-col">
              <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider pb-2 border-b border-zinc-800 mb-2">
                QUEUE BUS LOG
              </span>
              <div className="flex-1 bg-[#05070a] rounded-lg border border-zinc-800/80 p-3 font-mono text-[11px] overflow-y-auto flex flex-col gap-2 text-zinc-300">
                {queueTrace.map((line, idx) => (
                  <div key={idx} className="pb-1 border-b border-zinc-900 last:border-0">
                    <span className="text-emerald-400 font-bold">&gt;</span> {line}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 4. LINKED LIST & HEAP POINTER VISUALIZATION */}
        {activeTab === 'linked_list' && (
          <div className="h-full flex flex-col gap-4 max-w-6xl mx-auto">
            <div className="bg-[#0b0f17]/95 border border-zinc-800 rounded-xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-zinc-400">HEAP NEW NODE VAL:</span>
                <input
                  id="input-ll-val"
                  type="number"
                  value={llInput}
                  onChange={(e) => setLlInput(e.target.value)}
                  className="bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1 text-xs font-mono text-cyan-300 w-24 focus:outline-none"
                />
                <button
                  id="btn-ll-insert-head"
                  onClick={handleInsertHead}
                  className="px-3 py-1.5 rounded bg-cyan-500 hover:bg-cyan-400 text-black font-tech font-bold text-xs flex items-center gap-1 shadow-[0_0_8px_rgba(6,182,212,0.3)]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Insert Head
                </button>
                <button
                  id="btn-ll-insert-tail"
                  onClick={handleInsertTail}
                  className="px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 font-tech font-bold text-xs flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Insert Tail
                </button>
                <button
                  id="btn-ll-delete-tail"
                  onClick={handleDeleteTail}
                  className="px-3 py-1.5 rounded bg-red-950/80 hover:bg-red-900 border border-red-500/40 text-red-200 font-tech font-bold text-xs flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Tail
                </button>
              </div>

              <div className="text-xs font-mono text-cyan-400">
                HEAD PTR: <strong className="text-white">{linkedList[0]?.address || 'NULL'}</strong>
              </div>
            </div>

            {/* Visual Pointer Chain */}
            <div className="flex-1 bg-[#0b0f17]/95 border border-zinc-800 rounded-xl p-6 shadow-xl overflow-x-auto flex items-center gap-4 min-h-[220px]">
              {linkedList.map((node, idx) => (
                <div key={idx} className="flex items-center gap-3 shrink-0">
                  {/* Node Box */}
                  <div className="w-44 bg-zinc-950 border border-zinc-700 rounded-xl p-3 shadow-lg font-mono">
                    <div className="text-[10px] text-zinc-400 flex items-center justify-between border-b border-zinc-800 pb-1 mb-2">
                      <span className="text-cyan-400 font-bold">Node #{idx}</span>
                      <span>{node.address}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-zinc-400">DATA:</span>
                      <span className="text-base font-bold text-emerald-400">{node.value}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-zinc-400 bg-zinc-900 p-1.5 rounded border border-zinc-800">
                      <span>NEXT:</span>
                      <span className="text-cyan-300 font-bold truncate">
                        {node.next ? node.next : '0x0 (NULL)'}
                      </span>
                    </div>
                  </div>

                  {/* Arrow Pointer */}
                  <div className="flex items-center text-cyan-400 shrink-0">
                    <ArrowRight className="w-6 h-6" />
                  </div>
                </div>
              ))}

              {/* End of list NULL */}
              <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800 text-zinc-400 font-mono text-xs shrink-0">
                NULL (0x0)
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
