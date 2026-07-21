import { useState, useCallback, useEffect } from 'react';
import { RotateCcw, Lightbulb, Eraser, Check } from 'lucide-react';

// Generate a solved Sudoku grid
function generateSolvedGrid(): number[][] {
  const grid: number[][] = Array.from({ length: 9 }, () => Array(9).fill(0));

  function isValid(grid: number[][], row: number, col: number, num: number): boolean {
    for (let i = 0; i < 9; i++) {
      if (grid[row][i] === num || grid[i][col] === num) return false;
    }
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let i = boxRow; i < boxRow + 3; i++) {
      for (let j = boxCol; j < boxCol + 3; j++) {
        if (grid[i][j] === num) return false;
      }
    }
    return true;
  }

  function solve(grid: number[][]): boolean {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (grid[row][col] === 0) {
          const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
          for (const num of nums) {
            if (isValid(grid, row, col, num)) {
              grid[row][col] = num;
              if (solve(grid)) return true;
              grid[row][col] = 0;
            }
          }
          return false;
        }
      }
    }
    return true;
  }

  solve(grid);
  return grid;
}

function createPuzzle(difficulty: 'easy' | 'medium' | 'hard'): { puzzle: number[][]; solution: number[][] } {
  const solution = generateSolvedGrid();
  const puzzle = solution.map(row => [...row]);

  const cellsToRemove = difficulty === 'easy' ? 40 : difficulty === 'medium' ? 50 : 58;
  let removed = 0;

  while (removed < cellsToRemove) {
    const row = Math.floor(Math.random() * 9);
    const col = Math.floor(Math.random() * 9);
    if (puzzle[row][col] !== 0) {
      puzzle[row][col] = 0;
      removed++;
    }
  }

  return { puzzle, solution };
}

export default function Sudoku() {
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [puzzle, setPuzzle] = useState<number[][]>([]);
  const [solution, setSolution] = useState<number[][]>([]);
  const [userGrid, setUserGrid] = useState<number[][]>([]);
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [conflicts, setConflicts] = useState<Set<string>>(new Set());
  const [completed, setCompleted] = useState(false);
  const [hints, setHints] = useState(3);

  const initGame = useCallback((diff: 'easy' | 'medium' | 'hard') => {
    const { puzzle: p, solution: s } = createPuzzle(diff);
    setPuzzle(p);
    setSolution(s);
    setUserGrid(p.map(row => [...row]));
    setSelectedCell(null);
    setConflicts(new Set());
    setCompleted(false);
    setHints(3);
  }, []);

  useEffect(() => {
    initGame(difficulty);
  }, [initGame, difficulty]);

  const checkConflicts = useCallback((grid: number[][]) => {
    const newConflicts = new Set<string>();

    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        const num = grid[row][col];
        if (num === 0) continue;

        // Check row and column
        for (let i = 0; i < 9; i++) {
          if (i !== col && grid[row][i] === num) {
            newConflicts.add(`${row}-${col}`);
            newConflicts.add(`${row}-${i}`);
          }
          if (i !== row && grid[i][col] === num) {
            newConflicts.add(`${row}-${col}`);
            newConflicts.add(`${i}-${col}`);
          }
        }

        // Check 3x3 box
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        for (let i = boxRow; i < boxRow + 3; i++) {
          for (let j = boxCol; j < boxCol + 3; j++) {
            if ((i !== row || j !== col) && grid[i][j] === num) {
              newConflicts.add(`${row}-${col}`);
              newConflicts.add(`${i}-${j}`);
            }
          }
        }
      }
    }

    setConflicts(newConflicts);
  }, []);

  const handleCellClick = useCallback((row: number, col: number) => {
    if (puzzle[row]?.[col] !== 0) return; // Fixed cell
    setSelectedCell([row, col]);
  }, [puzzle]);

  const handleNumberInput = useCallback((num: number) => {
    if (!selectedCell || completed) return;
    const [row, col] = selectedCell;
    if (puzzle[row][col] !== 0) return;

    const newGrid = userGrid.map(r => [...r]);
    newGrid[row][col] = num === userGrid[row][col] ? 0 : num;
    setUserGrid(newGrid);
    checkConflicts(newGrid);

    // Check if completed
    if (newGrid.every((r, ri) => r.every((c, ci) => c === solution[ri][ci]))) {
      setCompleted(true);
    }
  }, [selectedCell, completed, puzzle, userGrid, checkConflicts, solution]);

  const handleErase = useCallback(() => {
    if (!selectedCell || completed) return;
    const [row, col] = selectedCell;
    if (puzzle[row][col] !== 0) return;

    const newGrid = userGrid.map(r => [...r]);
    newGrid[row][col] = 0;
    setUserGrid(newGrid);
    checkConflicts(newGrid);
  }, [selectedCell, completed, puzzle, userGrid, checkConflicts]);

  const handleHint = useCallback(() => {
    if (!selectedCell || hints <= 0 || completed) return;
    const [row, col] = selectedCell;
    if (puzzle[row][col] !== 0) return;

    const correctNum = solution[row][col];
    const newGrid = userGrid.map(r => [...r]);
    newGrid[row][col] = correctNum;
    setUserGrid(newGrid);
    setHints(h => h - 1);
    checkConflicts(newGrid);
  }, [selectedCell, hints, completed, puzzle, userGrid, solution, checkConflicts]);

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '1' && e.key <= '9') {
        handleNumberInput(parseInt(e.key));
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        handleErase();
      } else if (e.key === 'ArrowUp' && selectedCell) {
        const [r, c] = selectedCell;
        if (r > 0) setSelectedCell([r - 1, c]);
      } else if (e.key === 'ArrowDown' && selectedCell) {
        const [r, c] = selectedCell;
        if (r < 8) setSelectedCell([r + 1, c]);
      } else if (e.key === 'ArrowLeft' && selectedCell) {
        const [r, c] = selectedCell;
        if (c > 0) setSelectedCell([r, c - 1]);
      } else if (e.key === 'ArrowRight' && selectedCell) {
        const [r, c] = selectedCell;
        if (c < 8) setSelectedCell([r, c + 1]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNumberInput, handleErase, selectedCell]);

  if (puzzle.length === 0) return null;

  return (
    <div className="w-full h-full flex flex-col p-3" style={{ background: '#FAFAF8' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-700">数独</span>
          <div className="flex gap-1">
            {(['easy', 'medium', 'hard'] as const).map(d => (
              <button
                key={d}
                onClick={() => { setDifficulty(d); initGame(d); }}
                className={`px-2 py-0.5 rounded text-xs transition-colors ${
                  difficulty === d ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                {d === 'easy' ? '简单' : d === 'medium' ? '中等' : '困难'}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-500">提示: {hints}</span>
          <button onClick={() => initGame(difficulty)} className="p-1.5 rounded hover:bg-gray-200 transition-colors" title="新游戏">
            <RotateCcw size={14} className="text-gray-600" />
          </button>
        </div>
      </div>

      {completed && (
        <div className="mb-2 px-3 py-1.5 rounded bg-green-100 text-green-700 text-xs text-center flex items-center justify-center gap-1">
          <Check size={14} /> 恭喜完成！
        </div>
      )}

      {/* Grid */}
      <div className="flex-1 flex items-center justify-center">
        <div className="grid grid-cols-9 gap-px bg-gray-400 border-2 border-gray-700 rounded-lg overflow-hidden"
          style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
          {userGrid.map((row, ri) => row.map((cell, ci) => {
            const isFixed = puzzle[ri][ci] !== 0;
            const isSelected = selectedCell?.[0] === ri && selectedCell?.[1] === ci;
            const hasConflict = conflicts.has(`${ri}-${ci}`);
            const isSameRow = selectedCell?.[0] === ri;
            const isSameCol = selectedCell?.[1] === ci;
            const isSameBox = selectedCell &&
              Math.floor(selectedCell[0] / 3) === Math.floor(ri / 3) &&
              Math.floor(selectedCell[1] / 3) === Math.floor(ci / 3);
            const isSameNumber = selectedCell && cell !== 0 && cell === userGrid[selectedCell[0]][selectedCell[1]];

            const bgColor = isSelected
              ? 'bg-blue-300'
              : isSameNumber
                ? 'bg-blue-100'
                : isSameRow || isSameCol || isSameBox
                  ? 'bg-blue-50'
                  : 'bg-white';

            const thickRight = (ci + 1) % 3 === 0 && ci < 8;
            const thickBottom = (ri + 1) % 3 === 0 && ri < 8;

            return (
              <button
                key={`${ri}-${ci}`}
                onClick={() => handleCellClick(ri, ci)}
                disabled={isFixed}
                className={`w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-sm font-medium transition-colors ${bgColor} ${
                  isFixed ? 'text-gray-900 font-bold' : 'text-blue-600'
                } ${hasConflict ? 'text-red-500 bg-red-100' : ''} ${thickRight ? 'border-r border-gray-700' : ''} ${thickBottom ? 'border-b border-gray-700' : ''}`}
              >
                {cell !== 0 ? cell : ''}
              </button>
            );
          }))}
        </div>
      </div>

      {/* Number pad */}
      <div className="mt-2 space-y-2">
        <div className="flex items-center justify-center gap-1">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <button
              key={num}
              onClick={() => handleNumberInput(num)}
              className="w-8 h-8 rounded bg-gray-100 hover:bg-blue-100 hover:text-blue-600 transition-colors text-sm font-medium text-gray-700 border border-gray-200"
            >
              {num}
            </button>
          ))}
        </div>
        <div className="flex items-center justify-center gap-2">
          <button onClick={handleHint} disabled={hints <= 0}
            className="flex items-center gap-1 px-3 py-1 rounded bg-yellow-100 text-yellow-700 text-xs hover:bg-yellow-200 transition-colors disabled:opacity-30">
            <Lightbulb size={12} /> 提示 ({hints})
          </button>
          <button onClick={handleErase}
            className="flex items-center gap-1 px-3 py-1 rounded bg-gray-100 text-gray-600 text-xs hover:bg-gray-200 transition-colors">
            <Eraser size={12} /> 清除
          </button>
        </div>
      </div>
    </div>
  );
}
