import { useState, useEffect, useCallback, useRef } from 'react';
import { RotateCw, ArrowDown, ArrowLeft, ArrowRight, Pause } from 'lucide-react';

const SHAPES = [
  [[1,1,1,1]],
  [[1,1],[1,1]],
  [[1,1,1],[0,1,0]],
  [[1,1,1],[1,0,0]],
  [[1,1,1],[0,0,1]],
  [[1,1,0],[0,1,1]],
  [[0,1,1],[1,1,0]],
];

const COLORS = ['#00B4D8', '#F4D03F', '#7B2CBF', '#2DC653', '#FF7139', '#EF233C', '#00B4D8'];

export default function Tetris() {
  const [board, setBoard] = useState<number[][]>(() => Array(20).fill(null).map(() => Array(10).fill(0)));
  const [piece, setPiece] = useState<{ shape: number[][]; x: number; y: number; color: number }>(() => ({ shape: SHAPES[0], x: 3, y: 0, color: 1 }));
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const randomPiece = (): { shape: number[][]; x: number; y: number; color: number } => ({
    shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
    x: 3,
    y: 0,
    color: Math.floor(Math.random() * COLORS.length) + 1,
  });

  const isValid = (shape: number[][], x: number, y: number, bd: number[][]) => {
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c]) {
          const nx = x + c, ny = y + r;
          if (nx < 0 || nx >= 10 || ny >= 20 || (ny >= 0 && bd[ny][nx])) return false;
        }
      }
    }
    return true;
  };

  const placePiece = useCallback(() => {
    setBoard(prev => {
      const newBoard = prev.map(row => [...row]);
      piece.shape.forEach((row, r) => {
        row.forEach((cell, c) => {
          if (cell && piece.y + r >= 0) newBoard[piece.y + r][piece.x + c] = piece.color;
        });
      });
      
      // Clear lines
      let lines = 0;
      for (let r = 19; r >= 0; r--) {
        if (newBoard[r].every(c => c !== 0)) {
          newBoard.splice(r, 1);
          newBoard.unshift(Array(10).fill(0));
          lines++;
          r++;
        }
      }
      if (lines > 0) setScore(s => s + lines * 100 * lines);
      
      return newBoard;
    });
    
    const newPiece = randomPiece();
    setPiece(newPiece);
    setBoard(prev => {
      if (!isValid(newPiece.shape, newPiece.x, newPiece.y, prev)) {
        setGameOver(true);
      }
      return prev;
    });
  }, [piece]);

  useEffect(() => {
    if (gameOver || paused) return;
    intervalRef.current = setInterval(() => {
      setPiece(p => {
        if (isValid(p.shape, p.x, p.y + 1, board)) return { ...p, y: p.y + 1 };
        return p;
      });
    }, 500);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [board, gameOver, paused]);

  // Check if piece needs to be placed
  useEffect(() => {
    if (!isValid(piece.shape, piece.x, piece.y + 1, board) && !gameOver) {
      const timer = setTimeout(placePiece, 100);
      return () => clearTimeout(timer);
    }
  }, [piece, board, gameOver, placePiece]);

  const move = (dx: number) => {
    if (isValid(piece.shape, piece.x + dx, piece.y, board)) {
      setPiece(p => ({ ...p, x: p.x + dx }));
    }
  };

  const rotate = () => {
    const rotated = piece.shape[0].map((_, i) => piece.shape.map(row => row[i]).reverse());
    if (isValid(rotated, piece.x, piece.y, board)) {
      setPiece(p => ({ ...p, shape: rotated }));
    }
  };

  const drop = () => {
    let ny = piece.y;
    while (isValid(piece.shape, piece.x, ny + 1, board)) ny++;
    setPiece(p => ({ ...p, y: ny }));
    setScore(s => s + 10);
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (gameOver) return;
      switch (e.key) {
        case 'ArrowLeft': move(-1); break;
        case 'ArrowRight': move(1); break;
        case 'ArrowDown': drop(); break;
        case 'ArrowUp': rotate(); break;
        case ' ': setPaused(p => !p); break;
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [piece, board, gameOver]);

  const renderBoard = () => {
    const display = board.map(row => [...row]);
    piece.shape.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (cell && piece.y + r >= 0) display[piece.y + r][piece.x + c] = piece.color;
      });
    });
    return display;
  };

  const reset = () => {
    setBoard(Array(20).fill(null).map(() => Array(10).fill(0)));
    setPiece(randomPiece());
    setScore(0);
    setGameOver(false);
    setPaused(false);
  };

  return (
    <div className="w-full h-full flex flex-col items-center p-3" style={{ background: 'rgba(0, 18, 51, 0.95)' }}>
      <div className="flex items-center justify-between w-full mb-2">
        <span className="text-sm font-medium">得分: {score}</span>
        <button onClick={() => setPaused(!paused)} className="p-1 rounded hover:bg-white/10"><Pause size={16} /></button>
      </div>
      
      <div className="grid gap-px p-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.1)', gridTemplateColumns: 'repeat(10, 20px)' }}>
        {renderBoard().flat().map((cell, i) => (
          <div key={i} className="w-5 h-5 rounded-sm" style={{ background: cell ? COLORS[cell - 1] : 'rgba(0,18,51,0.8)' }} />
        ))}
      </div>

      <div className="flex items-center gap-3 mt-3">
        <button onClick={() => move(-1)} className="p-2 rounded-lg glass-panel hover:bg-white/10"><ArrowLeft size={18} /></button>
        <button onClick={rotate} className="p-2 rounded-lg glass-panel hover:bg-white/10"><RotateCw size={18} /></button>
        <button onClick={drop} className="p-2 rounded-lg glass-panel hover:bg-white/10"><ArrowDown size={18} /></button>
        <button onClick={() => move(1)} className="p-2 rounded-lg glass-panel hover:bg-white/10"><ArrowRight size={18} /></button>
      </div>

      {gameOver && (
        <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.8)' }}>
          <div className="text-center">
            <div className="text-2xl font-bold mb-2">游戏结束</div>
            <div className="text-muted-foreground mb-4">得分: {score}</div>
            <button onClick={reset} className="px-4 py-2 rounded-lg bg-cyan-400/20 text-cyan-400 hover:bg-cyan-400/30">重新开始</button>
          </div>
        </div>
      )}
      {paused && !gameOver && (
        <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="text-2xl font-bold">暂停</div>
        </div>
      )}
    </div>
  );
}
