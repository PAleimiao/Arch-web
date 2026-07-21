import { useState } from 'react';
import { Crown } from 'lucide-react';

type Piece = string | null;

const INITIAL: Piece[][] = [
  ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
  ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
  ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'],
];

const PIECE_SYMBOLS: Record<string, string> = {
  'k': '♔', 'q': '♕', 'r': '♖', 'b': '♗', 'n': '♘', 'p': '♙',
  'K': '♚', 'Q': '♛', 'R': '♜', 'B': '♝', 'N': '♞', 'P': '♟',
};

export default function Chess() {
  const [board, setBoard] = useState<Piece[][]>(INITIAL.map(r => [...r]));
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const [turn, setTurn] = useState<'white' | 'black'>('white');

  const isValidMove = (fromR: number, fromC: number, toR: number, toC: number) => {
    const piece = board[fromR][fromC];
    if (!piece) return false;
    const isWhite = piece === piece.toUpperCase();
    if ((turn === 'white' && !isWhite) || (turn === 'black' && isWhite)) return false;
    const target = board[toR][toC];
    if (target && (isWhite === (target === target.toUpperCase()))) return false;
    
    const dr = Math.abs(toR - fromR);
    const dc = Math.abs(toC - fromC);
    
    switch (piece.toLowerCase()) {
      case 'p': {
        const dir = isWhite ? -1 : 1;
        const startRow = isWhite ? 6 : 1;
        if (toC === fromC && !target) {
          if (toR === fromR + dir) return true;
          if (fromR === startRow && toR === fromR + 2 * dir && !board[fromR + dir][fromC]) return true;
        }
        if (dc === 1 && toR === fromR + dir && target) return true;
        return false;
      }
      case 'r': return fromR === toR || fromC === toC;
      case 'n': return (dr === 2 && dc === 1) || (dr === 1 && dc === 2);
      case 'b': return dr === dc;
      case 'q': return fromR === toR || fromC === toC || dr === dc;
      case 'k': return dr <= 1 && dc <= 1;
      default: return false;
    }
  };

  const handleClick = (r: number, c: number) => {
    if (selected) {
      const [sr, sc] = selected;
      if (sr === r && sc === c) { setSelected(null); return; }
      if (isValidMove(sr, sc, r, c)) {
        const newBoard = board.map(row => [...row]);
        newBoard[r][c] = newBoard[sr][sc];
        newBoard[sr][sc] = null;
        setBoard(newBoard);
        setSelected(null);
        setTurn(t => t === 'white' ? 'black' : 'white');
      } else {
        setSelected(null);
      }
    } else if (board[r][c]) {
      setSelected([r, c]);
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center p-3" style={{ background: 'rgba(0, 18, 51, 0.95)' }}>
      <div className="flex items-center gap-2 mb-2">
        <Crown size={16} className={turn === 'white' ? 'text-yellow-400' : 'text-muted-foreground'} />
        <span className="text-sm">{turn === 'white' ? '白方' : '黑方'} 回合</span>
      </div>

      <div className="grid grid-cols-8 gap-0 border-2 border-white/20 rounded overflow-hidden">
        {board.map((row, r) => row.map((piece, c) => {
          const isLight = (r + c) % 2 === 0;
          const isSelected = selected && selected[0] === r && selected[1] === c;
          return (
            <button
              key={`${r}-${c}`}
              onClick={() => handleClick(r, c)}
              className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-xl transition-colors"
              style={{
                background: isSelected ? 'rgba(0, 180, 216, 0.5)' : isLight ? 'rgba(238, 244, 237, 0.85)' : 'rgba(92, 103, 125, 0.6)',
                color: piece && piece === piece.toUpperCase() ? '#1a1a1a' : '#1a1a1a',
              }}
            >
              {piece ? PIECE_SYMBOLS[piece] : ''}
            </button>
          );
        }))}
      </div>
    </div>
  );
}
