import { useState } from 'react';
import { RotateCw } from 'lucide-react';

type Cell = 'X' | 'O' | null;

export default function TicTacToe() {
  const [board, setBoard] = useState<Cell[]>(Array(9).fill(null));
  const [current, setCurrent] = useState<'X' | 'O'>('X');
  const [winner, setWinner] = useState<string | null>(null);
  const [scores, setScores] = useState({ X: 0, O: 0, draw: 0 });

  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
  ];

  const checkWin = (b: Cell[]) => {
    for (const [a, c, d] of lines) {
      if (b[a] && b[a] === b[c] && b[a] === b[d]) return b[a];
    }
    if (b.every(c => c)) return 'draw';
    return null;
  };

  const handleClick = (i: number) => {
    if (board[i] || winner) return;
    const newBoard = [...board];
    newBoard[i] = current;
    setBoard(newBoard);
    const result = checkWin(newBoard);
    if (result) {
      setWinner(result);
      if (result === 'draw') setScores(s => ({ ...s, draw: s.draw + 1 }));
      else setScores(s => ({ ...s, [result]: s[result as 'X' | 'O'] + 1 }));
    } else {
      setCurrent(current === 'X' ? 'O' : 'X');
    }
  };

  const reset = () => { setBoard(Array(9).fill(null)); setWinner(null); setCurrent('X'); };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4" style={{ background: 'rgba(0, 18, 51, 0.95)' }}>
      <div className="flex items-center gap-6 mb-4 text-sm">
        <div className={`px-3 py-1 rounded-lg ${current === 'X' && !winner ? 'bg-cyan-400/20 text-cyan-400' : ''}`}>玩家 X: {scores.X}</div>
        <div className="text-muted-foreground">平局: {scores.draw}</div>
        <div className={`px-3 py-1 rounded-lg ${current === 'O' && !winner ? 'bg-purple-400/20 text-purple-400' : ''}`}>电脑 O: {scores.O}</div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        {board.map((cell, i) => (
          <button
            key={i}
            onClick={() => handleClick(i)}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl glass-panel flex items-center justify-center text-3xl sm:text-4xl font-bold transition-all hover:bg-white/5"
            style={{
              color: cell === 'X' ? '#00B4D8' : cell === 'O' ? '#7B2CBF' : '#EEF4ED',
              border: winner && lines.some(([a, b, c]) => board[a] === winner && board[a] === board[b] && board[a] === board[c] && (i === a || i === b || i === c)) ? '2px solid #2DC653' : '1px solid rgba(255,255,255,0.05)',
            }}
          >
            {cell}
          </button>
        ))}
      </div>

      {winner && (
        <div className="text-center mb-3">
          <div className="text-lg font-bold mb-1" style={{ color: winner === 'draw' ? '#F4D03F' : '#2DC653' }}>
            {winner === 'draw' ? '平局!' : `玩家 ${winner} 获胜!`}
          </div>
        </div>
      )}

      <button onClick={reset} className="px-4 py-2 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 flex items-center gap-2">
        <RotateCw size={14} /> 再来一局
      </button>
    </div>
  );
}
