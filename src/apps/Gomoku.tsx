import { useState, useCallback } from 'react';
import { RotateCcw, Undo2, Info } from 'lucide-react';

type Player = 'black' | 'white';
type Cell = Player | null;

const BOARD_SIZE = 15;

function createBoard(): Cell[][] {
  return Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null));
}

function checkWin(board: Cell[][], row: number, col: number, player: Player): boolean {
  const directions = [
    [0, 1],  // horizontal
    [1, 0],  // vertical
    [1, 1],  // diagonal
    [1, -1], // anti-diagonal
  ];

  for (const [dr, dc] of directions) {
    let count = 1;

    // Check positive direction
    for (let i = 1; i < 5; i++) {
      const r = row + dr * i;
      const c = col + dc * i;
      if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE || board[r][c] !== player) break;
      count++;
    }

    // Check negative direction
    for (let i = 1; i < 5; i++) {
      const r = row - dr * i;
      const c = col - dc * i;
      if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE || board[r][c] !== player) break;
      count++;
    }

    if (count >= 5) return true;
  }

  return false;
}

export default function Gomoku() {
  const [board, setBoard] = useState<Cell[][]>(createBoard);
  const [currentPlayer, setCurrentPlayer] = useState<Player>('black');
  const [winner, setWinner] = useState<Player | 'draw' | null>(null);
  const [history, setHistory] = useState<{ row: number; col: number }[]>([]);
  const [lastMove, setLastMove] = useState<{ row: number; col: number } | null>(null);

  const handleClick = useCallback((row: number, col: number) => {
    if (board[row][col] || winner) return;

    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = currentPlayer;
    setBoard(newBoard);
    setHistory(prev => [...prev, { row, col }]);
    setLastMove({ row, col });

    if (checkWin(newBoard, row, col, currentPlayer)) {
      setWinner(currentPlayer);
    } else if (history.length + 1 >= BOARD_SIZE * BOARD_SIZE) {
      setWinner('draw');
    } else {
      setCurrentPlayer(currentPlayer === 'black' ? 'white' : 'black');
    }
  }, [board, currentPlayer, winner, history.length]);

  const reset = useCallback(() => {
    setBoard(createBoard());
    setCurrentPlayer('black');
    setWinner(null);
    setHistory([]);
    setLastMove(null);
  }, []);

  const undo = useCallback(() => {
    if (history.length === 0 || winner) return;
    const newHistory = [...history];
    const last = newHistory.pop()!;
    const newBoard = board.map(r => [...r]);
    newBoard[last.row][last.col] = null;
    setBoard(newBoard);
    setHistory(newHistory);
    setCurrentPlayer(currentPlayer === 'black' ? 'white' : 'black');
    setLastMove(newHistory.length > 0 ? newHistory[newHistory.length - 1] : null);
  }, [history, board, currentPlayer, winner]);

  return (
    <div className="w-full h-full flex flex-col items-center p-4" style={{ background: '#E8D5A3' }}>
      {/* Header */}
      <div className="flex items-center justify-between w-full max-w-md mb-2">
        <div className="flex items-center gap-2">
          <div className={`w-4 h-4 rounded-full border border-gray-600 ${currentPlayer === 'black' ? 'bg-gray-900' : 'bg-white'}`} />
          <span className="text-sm font-medium" style={{ color: '#5D4037' }}>
            {winner
              ? winner === 'draw' ? '平局！' : `${winner === 'black' ? '黑棋' : '白棋'} 获胜！`
              : `${currentPlayer === 'black' ? '黑棋' : '白棋'} 回合`
            }
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={undo} disabled={history.length === 0 || !!winner}
            className="p-1.5 rounded hover:bg-black/10 transition-colors disabled:opacity-30" title="悔棋">
            <Undo2 size={16} style={{ color: '#5D4037' }} />
          </button>
          <button onClick={reset} className="p-1.5 rounded hover:bg-black/10 transition-colors" title="重新开始">
            <RotateCcw size={16} style={{ color: '#5D4037' }} />
          </button>
          <div className="relative group">
            <button className="p-1.5 rounded hover:bg-black/10 transition-colors">
              <Info size={16} style={{ color: '#5D4037' }} />
            </button>
            <div className="absolute right-0 top-full mt-1 px-2 py-1 rounded bg-gray-800 text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
              五子连线即获胜
            </div>
          </div>
        </div>
      </div>

      {/* Board */}
      <div className="relative flex-1 flex items-center justify-center">
        <div
          className="relative rounded-lg shadow-lg"
          style={{
            background: '#D4A84B',
            padding: '4px',
          }}
        >
          {/* Grid background lines */}
          <svg
            className="absolute inset-0"
            style={{ margin: '4px' }}
            width={BOARD_SIZE * 28}
            height={BOARD_SIZE * 28}
          >
            {/* Horizontal lines */}
            {Array.from({ length: BOARD_SIZE }, (_, i) => (
              <line key={`h${i}`} x1={14} y1={i * 28 + 14} x2={(BOARD_SIZE - 1) * 28 + 14} y2={i * 28 + 14} stroke="#8B6914" strokeWidth={1} />
            ))}
            {/* Vertical lines */}
            {Array.from({ length: BOARD_SIZE }, (_, i) => (
              <line key={`v${i}`} x1={i * 28 + 14} y1={14} x2={i * 28 + 14} y2={(BOARD_SIZE - 1) * 28 + 14} stroke="#8B6914" strokeWidth={1} />
            ))}
            {/* Star points */}
            {[3, 7, 11].map(r => [3, 7, 11].map(c => (
              <circle key={`star-${r}-${c}`} cx={c * 28 + 14} cy={r * 28 + 14} r={3} fill="#8B6914" />
            )))}
          </svg>

          {/* Clickable cells */}
          <div
            className="relative grid"
            style={{
              gridTemplateColumns: `repeat(${BOARD_SIZE}, 28px)`,
              gridTemplateRows: `repeat(${BOARD_SIZE}, 28px)`,
            }}
          >
            {board.map((row, ri) => row.map((cell, ci) => (
              <button
                key={`${ri}-${ci}`}
                onClick={() => handleClick(ri, ci)}
                className="relative flex items-center justify-center transition-transform hover:scale-110"
                style={{ width: 28, height: 28 }}
              >
                {cell && (
                  <div
                    className={`w-5 h-5 rounded-full shadow-md ${
                      cell === 'black' ? 'bg-gray-900' : 'bg-white border border-gray-300'
                    } ${lastMove?.row === ri && lastMove?.col === ci ? 'ring-2 ring-red-400' : ''}`}
                  />
                )}
              </button>
            )))}
          </div>
        </div>
      </div>

      {/* Status bar */}
      <div className="text-xs mt-2" style={{ color: '#8D6E63' }}>
        步数: {history.length} {winner && ' - 游戏结束'}
      </div>
    </div>
  );
}
