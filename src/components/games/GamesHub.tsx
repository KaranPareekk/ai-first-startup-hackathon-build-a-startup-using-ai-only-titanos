import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Gamepad2,
  Trophy,
  RotateCcw,
  Play,
  Pause,
  Zap,
  Cpu,
  User,
  Bot,
  Flame,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { StorageService } from '../../services/storage';

type GameMode = 'snake' | 'tictactoe';

export const GamesHub: React.FC = () => {
  const [activeGame, setActiveGame] = useState<GameMode>('snake');

  return (
    <div
      id="games-hub-root"
      className="h-full w-full flex flex-col bg-[#07090e] text-zinc-100 select-none overflow-hidden"
    >
      {/* Top Header */}
      <div
        id="games-toolbar"
        className="h-14 bg-[#0c1017] border-b border-zinc-800 px-4 flex items-center justify-between shrink-0"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-pink-950/70 border border-pink-500/40 flex items-center justify-center text-pink-400">
            <Gamepad2 className="w-4 h-4" />
          </div>
          <div>
            <span className="font-tech text-xs font-bold text-zinc-200">
              TITAN RECREATIONAL ARCADE
            </span>
            <span className="block text-[10px] font-mono text-zinc-400">
              Algorithmic Logic Games & Discrete Mathematics Simulators
            </span>
          </div>
        </div>

        {/* Game Switcher Tabs */}
        <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800 font-mono text-xs">
          <button
            id="btn-game-snake"
            onClick={() => setActiveGame('snake')}
            className={`px-3 py-1 rounded transition-all font-semibold ${
              activeGame === 'snake'
                ? 'bg-cyan-500 text-black shadow-[0_0_10px_#06b6d4]'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            MEMORY ALLOCATOR (SNAKE)
          </button>
          <button
            id="btn-game-tictactoe"
            onClick={() => setActiveGame('tictactoe')}
            className={`px-3 py-1 rounded transition-all font-semibold ${
              activeGame === 'tictactoe'
                ? 'bg-cyan-500 text-black shadow-[0_0_10px_#06b6d4]'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            MINIMAX TIC-TAC-TOE
          </button>
        </div>
      </div>

      {/* Main Game Arena */}
      <div className="flex-1 overflow-hidden p-4 flex items-center justify-center">
        {activeGame === 'snake' ? <SnakeGame /> : <TicTacToeGame />}
      </div>
    </div>
  );
};

/* =========================================================================
   1. MEMORY ALLOCATOR (SNAKE) GAME
========================================================================= */
const GRID_SIZE = 20;

const SnakeGame: React.FC = () => {
  const [snake, setSnake] = useState<{ x: number; y: number }[]>([
    { x: 10, y: 10 },
    { x: 10, y: 11 },
    { x: 10, y: 12 },
  ]);
  const [direction, setDirection] = useState<'UP' | 'DOWN' | 'LEFT' | 'RIGHT'>('UP');
  const [food, setFood] = useState<{ x: number; y: number; address: string }>({
    x: 5,
    y: 5,
    address: '0x7FF0',
  });
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(() =>
    StorageService.getCustomState('snake_highscore', 0)
  );
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(120); // ms per tick

  const directionRef = useRef(direction);
  directionRef.current = direction;

  const generateFood = useCallback((currentSnake: { x: number; y: number }[]) => {
    let newX = 0;
    let newY = 0;
    let collision = true;
    while (collision) {
      newX = Math.floor(Math.random() * GRID_SIZE);
      newY = Math.floor(Math.random() * GRID_SIZE);
      collision = currentSnake.some((seg) => seg.x === newX && seg.y === newY);
    }
    const hex = '0x' + (Math.floor(Math.random() * 0x8fff) + 0x1000).toString(16).toUpperCase();
    return { x: newX, y: newY, address: hex };
  }, []);

  const handleResetGame = () => {
    const initialSnake = [
      { x: 10, y: 10 },
      { x: 10, y: 11 },
      { x: 10, y: 12 },
    ];
    setSnake(initialSnake);
    setDirection('UP');
    directionRef.current = 'UP';
    setFood(generateFood(initialSnake));
    setScore(0);
    setIsGameOver(false);
    setIsPlaying(true);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying || isGameOver) return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        if (directionRef.current !== 'DOWN') setDirection('UP');
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        if (directionRef.current !== 'UP') setDirection('DOWN');
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        if (directionRef.current !== 'RIGHT') setDirection('LEFT');
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        if (directionRef.current !== 'LEFT') setDirection('RIGHT');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isGameOver]);

  // Game Loop
  useEffect(() => {
    if (!isPlaying || isGameOver) return;

    const timer = setInterval(() => {
      setSnake((prev) => {
        const head = { ...prev[0] };
        const curDir = directionRef.current;

        if (curDir === 'UP') head.y -= 1;
        else if (curDir === 'DOWN') head.y += 1;
        else if (curDir === 'LEFT') head.x -= 1;
        else if (curDir === 'RIGHT') head.x += 1;

        // Wall collisions
        if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
          setIsGameOver(true);
          return prev;
        }

        // Self collision
        if (prev.some((seg) => seg.x === head.x && seg.y === head.y)) {
          setIsGameOver(true);
          return prev;
        }

        const newSnake = [head, ...prev];

        // Food eaten
        if (head.x === food.x && head.y === food.y) {
          const newScore = score + 10;
          setScore(newScore);
          if (newScore > highScore) {
            setHighScore(newScore);
            StorageService.setCustomState('snake_highscore', newScore);
          }
          setFood(generateFood(newSnake));
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    }, speed);

    return () => clearInterval(timer);
  }, [isPlaying, isGameOver, food, score, highScore, speed, generateFood]);

  return (
    <div className="flex flex-col lg:flex-row items-center gap-6 max-w-4xl w-full">
      {/* Grid Canvas */}
      <div className="relative p-2 bg-[#0c1017] rounded-2xl border border-zinc-800 shadow-2xl">
        <div
          className="grid gap-[2px] bg-[#05070a] p-2 rounded-xl border border-zinc-900"
          style={{
            gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
            width: 380,
            height: 380,
          }}
        >
          {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, idx) => {
            const x = idx % GRID_SIZE;
            const y = Math.floor(idx / GRID_SIZE);

            const isHead = snake[0].x === x && snake[0].y === y;
            const isBody = snake.slice(1).some((s) => s.x === x && s.y === y);
            const isFood = food.x === x && food.y === y;

            return (
              <div
                key={idx}
                className={`rounded-[2px] transition-colors ${
                  isHead
                    ? 'bg-cyan-400 shadow-[0_0_8px_#06b6d4]'
                    : isBody
                    ? 'bg-cyan-700'
                    : isFood
                    ? 'bg-pink-500 animate-pulse shadow-[0_0_8px_#ec4899]'
                    : 'bg-zinc-900/40'
                }`}
              />
            );
          })}
        </div>

        {/* Game Over Overlay */}
        {isGameOver && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-6 text-center z-10">
            <span className="text-xl font-tech font-bold text-red-400 mb-1">
              HEAP OVERFLOW / SEGFAULT
            </span>
            <span className="text-xs font-mono text-zinc-400 mb-4">
              Pointers collided! Allocated bytes: {score * 8} KB
            </span>
            <button
              onClick={handleResetGame}
              className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-tech font-bold text-xs"
            >
              REBOOT HEAP
            </button>
          </div>
        )}
      </div>

      {/* Stats & Controls Panel */}
      <div className="w-full lg:w-72 flex flex-col gap-3 font-mono">
        <div className="bg-[#0c1017] border border-zinc-800 rounded-xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <span className="text-xs text-zinc-400 font-bold">HEAP ALLOCATOR</span>
            <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
              <Trophy className="w-3.5 h-3.5" />
              <span>HIGH: {highScore}</span>
            </div>
          </div>

          <div className="flex justify-between items-center py-1">
            <span className="text-xs text-zinc-400">SCORE</span>
            <span className="text-lg font-bold text-cyan-400">{score}</span>
          </div>

          <div className="flex justify-between items-center py-1">
            <span className="text-xs text-zinc-400">TARGET ADDRESS</span>
            <span className="text-xs text-pink-400 font-bold">{food.address}</span>
          </div>

          <div className="flex justify-between items-center py-1">
            <span className="text-xs text-zinc-400">SNAKE LENGTH</span>
            <span className="text-xs text-zinc-200">{snake.length} BLOCKS</span>
          </div>

          {/* Speed selector */}
          <div className="flex items-center justify-between pt-2 border-t border-zinc-800 text-xs">
            <span className="text-zinc-400">CLOCK SPEED:</span>
            <div className="flex gap-1">
              {[
                { label: '1x', val: 140 },
                { label: '2x', val: 100 },
                { label: '3x', val: 70 },
              ].map((sp) => (
                <button
                  key={sp.label}
                  onClick={() => setSpeed(sp.val)}
                  className={`px-2 py-0.5 rounded text-[10px] ${
                    speed === sp.val ? 'bg-cyan-500 text-black font-bold' : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {sp.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => {
              if (isGameOver) handleResetGame();
              else setIsPlaying(!isPlaying);
            }}
            className="flex-1 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-tech font-bold text-xs flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(6,182,212,0.3)]"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? 'PAUSE' : 'START / RESUME'}</span>
          </button>
          <button
            onClick={handleResetGame}
            className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700"
            title="Reset Game"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Instructions */}
        <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 text-[11px] text-zinc-400 leading-relaxed">
          Use <strong className="text-zinc-200">WASD</strong> or{' '}
          <strong className="text-zinc-200">Arrow Keys</strong> to direct the memory pointer and allocate free heap memory blocks!
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   2. MINIMAX TIC-TAC-TOE (AI vs Human or Human vs Human)
========================================================================= */
const TicTacToeGame: React.FC = () => {
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState<boolean>(true);
  const [vsAi, setVsAi] = useState<boolean>(true);
  const [scoreStats, setScoreStats] = useState<{ x: number; o: number; draws: number }>({
    x: 0,
    o: 0,
    draws: 0,
  });

  const checkWinner = (squares: (string | null)[]) => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (const [a, b, c] of lines) {
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return { winner: squares[a], line: [a, b, c] };
      }
    }
    if (squares.every((s) => s !== null)) {
      return { winner: 'DRAW', line: [] };
    }
    return null;
  };

  const winInfo = checkWinner(board);

  // Minimax algorithm for AI
  const findBestMove = (squares: (string | null)[]) => {
    let bestScore = -Infinity;
    let move = -1;

    for (let i = 0; i < squares.length; i++) {
      if (squares[i] === null) {
        squares[i] = 'O';
        const score = minimax(squares, 0, false);
        squares[i] = null;
        if (score > bestScore) {
          bestScore = score;
          move = i;
        }
      }
    }
    return move;
  };

  const minimax = (squares: (string | null)[], depth: number, isMaximizing: boolean): number => {
    const res = checkWinner(squares);
    if (res) {
      if (res.winner === 'O') return 10 - depth;
      if (res.winner === 'X') return depth - 10;
      if (res.winner === 'DRAW') return 0;
    }

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (let i = 0; i < squares.length; i++) {
        if (squares[i] === null) {
          squares[i] = 'O';
          const evalScore = minimax(squares, depth + 1, false);
          squares[i] = null;
          maxEval = Math.max(maxEval, evalScore);
        }
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (let i = 0; i < squares.length; i++) {
        if (squares[i] === null) {
          squares[i] = 'X';
          const evalScore = minimax(squares, depth + 1, true);
          squares[i] = null;
          minEval = Math.min(minEval, evalScore);
        }
      }
      return minEval;
    }
  };

  // AI turn triggering
  useEffect(() => {
    if (vsAi && !isXNext && !winInfo) {
      const timer = setTimeout(() => {
        const bestIdx = findBestMove(board);
        if (bestIdx !== -1) {
          const next = [...board];
          next[bestIdx] = 'O';
          setBoard(next);
          setIsXNext(true);

          const afterWin = checkWinner(next);
          if (afterWin) {
            updateStats(afterWin.winner);
          }
        }
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [vsAi, isXNext, board, winInfo]);

  const updateStats = (winner: string) => {
    setScoreStats((prev) => {
      if (winner === 'X') return { ...prev, x: prev.x + 1 };
      if (winner === 'O') return { ...prev, o: prev.o + 1 };
      return { ...prev, draws: prev.draws + 1 };
    });
  };

  const handleClickSquare = (idx: number) => {
    if (board[idx] || winInfo) return;
    if (vsAi && !isXNext) return;

    const next = [...board];
    next[idx] = isXNext ? 'X' : 'O';
    setBoard(next);
    setIsXNext(!isXNext);

    const check = checkWinner(next);
    if (check) {
      updateStats(check.winner);
    }
  };

  const handleResetBoard = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
  };

  return (
    <div className="flex flex-col lg:flex-row items-center gap-8 max-w-3xl w-full">
      {/* 3x3 Board */}
      <div className="p-3 bg-[#0c1017] rounded-2xl border border-zinc-800 shadow-2xl">
        <div className="grid grid-cols-3 gap-2 w-72 h-72">
          {board.map((sq, idx) => {
            const isWinningCell = winInfo?.line?.includes(idx);
            return (
              <button
                key={idx}
                id={`square-${idx}`}
                onClick={() => handleClickSquare(idx)}
                className={`rounded-xl border flex items-center justify-center font-tech text-3xl font-bold transition-all ${
                  isWinningCell
                    ? 'bg-cyan-950 border-cyan-400 text-cyan-300 shadow-[0_0_12px_#06b6d4]'
                    : sq === 'X'
                    ? 'bg-zinc-900 border-zinc-800 text-cyan-400'
                    : sq === 'O'
                    ? 'bg-zinc-900 border-zinc-800 text-amber-400'
                    : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/40'
                }`}
              >
                {sq}
              </button>
            );
          })}
        </div>
      </div>

      {/* Control Panel */}
      <div className="w-full lg:w-72 flex flex-col gap-3 font-mono">
        <div className="bg-[#0c1017] border border-zinc-800 rounded-xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800 text-xs">
            <span className="font-bold text-zinc-300">OPPONENT MODE</span>
            <div className="flex gap-1">
              <button
                onClick={() => {
                  if (!vsAi) {
                    setVsAi(true);
                    handleResetBoard();
                    setScoreStats({ x: 0, o: 0, draws: 0 });
                  }
                }}
                className={`px-2 py-0.5 rounded text-[10px] flex items-center gap-1 ${
                  vsAi ? 'bg-cyan-500 text-black font-bold' : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                <Bot className="w-3 h-3" />
                <span>AI</span>
              </button>
              <button
                onClick={() => {
                  if (vsAi) {
                    setVsAi(false);
                    handleResetBoard();
                    setScoreStats({ x: 0, o: 0, draws: 0 });
                  }
                }}
                className={`px-2 py-0.5 rounded text-[10px] flex items-center gap-1 ${
                  !vsAi ? 'bg-cyan-500 text-black font-bold' : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                <User className="w-3 h-3" />
                <span>PVP</span>
              </button>
            </div>
          </div>

          {/* Status */}
          <div className="py-2 text-center text-xs">
            {winInfo ? (
              <span className="font-bold text-cyan-400 text-sm">
                {winInfo.winner === 'DRAW' ? 'STALEMATE (DRAW)' : `PLAYER ${winInfo.winner} WINS!`}
              </span>
            ) : (
              <span className="text-zinc-400">
                TURN: <strong className={isXNext ? 'text-cyan-400' : 'text-amber-400'}>{isXNext ? 'X' : 'O'}</strong>
                {vsAi && !isXNext && ' (AI COMPUTING...)'}
              </span>
            )}
          </div>

          {/* Score Stats */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-800 text-center text-xs">
            <div className="p-2 rounded bg-zinc-900 border border-zinc-800">
              <div className="text-[10px] text-cyan-400 font-bold">X (YOU)</div>
              <div className="text-base font-bold text-zinc-100">{scoreStats.x}</div>
            </div>
            <div className="p-2 rounded bg-zinc-900 border border-zinc-800">
              <div className="text-[10px] text-zinc-500 font-bold">DRAWS</div>
              <div className="text-base font-bold text-zinc-100">{scoreStats.draws}</div>
            </div>
            <div className="p-2 rounded bg-zinc-900 border border-zinc-800">
              <div className="text-[10px] text-amber-400 font-bold">O ({vsAi ? 'AI' : 'P2'})</div>
              <div className="text-base font-bold text-zinc-100">{scoreStats.o}</div>
            </div>
          </div>
        </div>

        <button
          onClick={handleResetBoard}
          className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-tech font-bold text-xs flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(6,182,212,0.3)]"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>NEW MATCH</span>
        </button>
      </div>
    </div>
  );
};
