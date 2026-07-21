import { useState, useEffect, useCallback } from 'react';
import { Flag, Bomb, RotateCw } from 'lucide-react';

const ROWS = 10;
const COLS = 10;
const MINES = 15;

export default function Minesweeper() {
  const [board, setBoard] = useState<number[][]>([]);
  const [revealed, setRevealed] = useState<boolean[][]>([]);
  const [flagged, setFlagged] = useState<boolean[][]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [firstClick, setFirstClick] = useState(true);

  const initBoard = useCallback(() => {
    const newBoard = Array(ROWS).fill(null).map(() => Array(COLS).fill(0));
    const newRevealed = Array(ROWS).fill(null).map(() => Array(COLS).fill(false));
    const newFlagged = Array(ROWS).fill(null).map(() => Array(COLS).fill(false));
    setBoard(newBoard);
    setRevealed(newRevealed);
    setFlagged(newFlagged);
    setGameOver(false);
    setWon(false);
    setFirstClick(true);
  }, []);

  useEffect(() => { initBoard(); }, [initBoard]);

  const placeMines = (excludeR: number, excludeC: number) => {
    const newBoard = Array(ROWS).fill(null).map(() => Array(COLS).fill(0));
    let minesPlaced = 0;
    while (minesPlaced < MINES) {
      const r = Math.floor(Math.random() * ROWS);
      const c = Math.floor(Math.random() * COLS);
      if ((r === excludeR && c === excludeC) || newBoard[r][c] === -1) continue;
      newBoard[r][c] = -1;
      minesPlaced++;
    }
    // Calculate numbers
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (newBoard[r][c] === -1) continue;
        let count = 0;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr, nc = c + dc;
            if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && newBoard[nr][nc] === -1) count++;
          }
        }
        newBoard[r][c] = count;
      }
    }
    return newBoard;
  };

  const reveal = (r: number, c: number, bd: number[][], rev: boolean[][], flg: boolean[][]) => {
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS || rev[r][c] || flg[r][c]) return;
    rev[r][c] = true;
    if (bd[r][c] === 0) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          reveal(r + dr, c + dc, bd, rev, flg);
        }
      }
    }
  };

  const handleClick = (r: number, c: number) => {
    if (gameOver || won || revealed[r][c] || flagged[r][c]) return;
    
    let bd = board;
    if (firstClick) {
      bd = placeMines(r, c);
      setBoard(bd);
      setFirstClick(false);
    }

    if (bd[r][c] === -1) {
      setGameOver(true);
      const allRevealed = revealed.map(row => [...row]);
      for (let i = 0; i < ROWS; i++) for (let j = 0; j < COLS; j++) if (bd[i][j] === -1) allRevealed[i][j] = true;
      setRevealed(allRevealed);
      return;
    }

    const newRevealed = revealed.map(row => [...row]);
    const newFlagged = flagged.map(row => [...row]);
    reveal(r, c, bd, newRevealed, newFlagged);
    setRevealed(newRevealed);

    // Check win
    let unrevealedSafe = 0;
    for (let i = 0; i < ROWS; i++) for (let j = 0; j < COLS; j++) if (!newRevealed[i][j] && bd[i][j] !== -1) unrevealedSafe++;
    if (unrevealedSafe === 0) setWon(true);
  };

  const handleRightClick = (e: React.MouseEvent, r: number, c: number) => {
    e.preventDefault();
    if (gameOver || won || revealed[r][c]) return;
    const newFlagged = flagged.map(row => [...row]);
    newFlagged[r][c] = !newFlagged[r][c];
    setFlagged(newFlagged);
  };

  const numberColor = (n: number) => {
    switch (n) {
      case 1: return '#00B4D8';
      case 2: return '#2DC653';
      case 3: return '#EF233C';
      case 4: return '#7B2CBF';
      case 5: return '#FF7139';
      default: return '#EEF4ED';
    }
  };

  const flagCount = flagged.flat().filter(Boolean).length;

  return (
    <div className="w-full h-full flex flex-col items-center p-3" style={{ background: 'rgba(0, 18, 51, 0.95)' }}>
      <div className="flex items-center justify-between w-full mb-2">
        <span className="text-sm font-medium">💣 {MINES - flagCount}</span>
        <button onClick={initBoard} className="p-1.5 rounded glass-panel hover:bg-white/10"><RotateCw size={14} /></button>
      </div>

      <div className="grid gap-px p-1 rounded-lg border border-white/10" style={{ gridTemplateColumns: `repeat(${COLS}, 28px)` }}>
        {Array.from({ length: ROWS * COLS }, (_, i) => {
          const r = Math.floor(i / COLS), c = i % COLS;
          const isRevealed = revealed[r][c];
          const isFlagged = flagged[r][c];
          const isMine = board[r] && board[r][c] === -1;
          const number = board[r] ? board[r][c] : 0;

          return (
            <button
              key={i}
              onClick={() => handleClick(r, c)}
              onContextMenu={(e) => handleRightClick(e, r, c)}
              className="w-7 h-7 flex items-center justify-center text-xs font-bold rounded-sm transition-colors"
              style={{
                background: isRevealed ? (isMine ? '#EF233C' : 'rgba(0,40,85,0.8)') : 'rgba(0,60,100,0.6)',
                color: isRevealed && !isMine ? numberColor(number) : '#EEF4ED',
              }}
            >
              {isRevealed ? (isMine ? <Bomb size={14} /> : number > 0 ? number : '') : (isFlagged ? <Flag size={14} className="text-red-400" /> : '')}
            </button>
          );
        })}
      </div>

      {gameOver && <div className="mt-3 text-red-400 font-medium">游戏结束！</div>}
      {won && <div className="mt-3 text-green-400 font-medium">恭喜通关！</div>}
    </div>
  );
}
