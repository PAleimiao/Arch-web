import { useState, useEffect, useCallback } from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, RotateCw } from 'lucide-react';

const SIZE = 4;
const COLORS: Record<number, string> = {
  0: 'rgba(0,40,85,0.3)',
  2: '#1E3A5F', 4: '#1E4D6B', 8: '#006494', 16: '#0077B6',
  32: '#0096C7', 64: '#00B4D8', 128: '#48CAE4', 256: '#90E0EF',
  512: '#ADE8F4', 1024: '#FFB703', 2048: '#FB8500', 4096: '#FF006E',
};

export default function Game2048() {
  const [board, setBoard] = useState<number[][]>(Array(SIZE).fill(null).map(() => Array(SIZE).fill(0)));
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const addRandom = useCallback((bd: number[][]) => {
    const empty: [number, number][] = [];
    for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) if (!bd[r][c]) empty.push([r, c]);
    if (empty.length === 0) return bd;
    const [r, c] = empty[Math.floor(Math.random() * empty.length)];
    bd[r][c] = Math.random() < 0.9 ? 2 : 4;
    return bd;
  }, []);

  const init = useCallback(() => {
    let bd = Array(SIZE).fill(null).map(() => Array(SIZE).fill(0));
    bd = addRandom(bd);
    bd = addRandom(bd);
    setBoard(bd);
    setScore(0);
    setGameOver(false);
  }, [addRandom]);

  useEffect(() => { init(); }, [init]);

  const slide = (row: number[]) => {
    const filtered = row.filter(x => x !== 0);
    for (let i = 0; i < filtered.length - 1; i++) {
      if (filtered[i] === filtered[i + 1]) {
        filtered[i] *= 2;
        setScore(s => s + filtered[i]);
        filtered[i + 1] = 0;
      }
    }
    const result = filtered.filter(x => x !== 0);
    while (result.length < SIZE) result.push(0);
    return result;
  };

  const move = (direction: 'up' | 'down' | 'left' | 'right') => {
    if (gameOver) return;
    const newBoard = board.map(row => [...row]);
    let moved = false;

    if (direction === 'left') {
      for (let r = 0; r < SIZE; r++) {
        const old = [...newBoard[r]];
        newBoard[r] = slide(newBoard[r]);
        if (old.some((v, i) => v !== newBoard[r][i])) moved = true;
      }
    } else if (direction === 'right') {
      for (let r = 0; r < SIZE; r++) {
        const old = [...newBoard[r]];
        newBoard[r] = slide(newBoard[r].reverse()).reverse();
        if (old.some((v, i) => v !== newBoard[r][i])) moved = true;
      }
    } else if (direction === 'up') {
      for (let c = 0; c < SIZE; c++) {
        const col = Array(SIZE).fill(0).map((_, r) => newBoard[r][c]);
        const old = [...col];
        const newCol = slide(col);
        for (let r = 0; r < SIZE; r++) newBoard[r][c] = newCol[r];
        if (old.some((v, i) => v !== newCol[i])) moved = true;
      }
    } else if (direction === 'down') {
      for (let c = 0; c < SIZE; c++) {
        const col = Array(SIZE).fill(0).map((_, r) => newBoard[r][c]);
        const old = [...col];
        const newCol = slide(col.reverse()).reverse();
        for (let r = 0; r < SIZE; r++) newBoard[r][c] = newCol[r];
        if (old.some((v, i) => v !== newCol[i])) moved = true;
      }
    }

    if (moved) {
      addRandom(newBoard);
      setBoard(newBoard);
      // Check game over
      let canMove = false;
      for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
          if (!newBoard[r][c]) canMove = true;
          if (c < SIZE - 1 && newBoard[r][c] === newBoard[r][c + 1]) canMove = true;
          if (r < SIZE - 1 && newBoard[r][c] === newBoard[r + 1][c]) canMove = true;
        }
      }
      if (!canMove) setGameOver(true);
    }
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp': move('up'); break;
        case 'ArrowDown': move('down'); break;
        case 'ArrowLeft': move('left'); break;
        case 'ArrowRight': move('right'); break;
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [board, gameOver]);

  return (
    <div className="w-full h-full flex flex-col items-center p-3" style={{ background: 'rgba(0, 18, 51, 0.95)' }}>
      <div className="flex items-center justify-between w-full mb-3">
        <span className="text-sm font-medium">得分: {score}</span>
        <button onClick={init} className="p-1.5 rounded glass-panel hover:bg-white/10"><RotateCw size={14} /></button>
      </div>

      <div className="grid gap-2 p-2 rounded-xl" style={{ gridTemplateColumns: `repeat(${SIZE}, 64px)`, background: 'rgba(0,40,85,0.4)' }}>
        {board.flat().map((cell, i) => (
          <div key={i} className="w-16 h-16 rounded-lg flex items-center justify-center text-lg font-bold transition-colors"
            style={{ background: COLORS[cell] || COLORS[4096], color: cell > 4 ? '#EEF4ED' : '#979DAC' }}>
            {cell || ''}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-1 mt-3">
        <div />
        <button onClick={() => move('up')} className="p-2 rounded glass-panel hover:bg-white/10"><ArrowUp size={16} /></button>
        <div />
        <button onClick={() => move('left')} className="p-2 rounded glass-panel hover:bg-white/10"><ArrowLeft size={16} /></button>
        <button onClick={() => move('down')} className="p-2 rounded glass-panel hover:bg-white/10"><ArrowDown size={16} /></button>
        <button onClick={() => move('right')} className="p-2 rounded glass-panel hover:bg-white/10"><ArrowRight size={16} /></button>
      </div>

      {gameOver && (
        <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.8)' }}>
          <div className="text-center">
            <div className="text-2xl font-bold mb-2">游戏结束</div>
            <div className="text-muted-foreground mb-4">得分: {score}</div>
            <button onClick={init} className="px-4 py-2 rounded-lg bg-cyan-400/20 text-cyan-400 hover:bg-cyan-400/30">再来一局</button>
          </div>
        </div>
      )}
    </div>
  );
}
