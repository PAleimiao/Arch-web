import { useState, useEffect, useRef } from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Play } from 'lucide-react';

const GRID_SIZE = 20;

export default function Snake() {
  const [snake, setSnake] = useState(() => [{ x: 10, y: 10 }]);
  const [food, setFood] = useState({ x: 15, y: 15 });
  const [dir, setDir] = useState({ x: 1, y: 0 });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [started, setStarted] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const randomFood = () => {
    let pos: { x: number; y: number };
    do {
      pos = { x: Math.floor(Math.random() * GRID_SIZE), y: Math.floor(Math.random() * GRID_SIZE) };
    } while (snake.some(s => s.x === pos.x && s.y === pos.y));
    return pos;
  };

  useEffect(() => {
    if (!started || gameOver) return;
    intervalRef.current = setInterval(() => {
      setSnake(prev => {
        const head = prev[0];
        const newHead = { x: head.x + dir.x, y: head.y + dir.y };
        
        if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE || prev.some(s => s.x === newHead.x && s.y === newHead.y)) {
          setGameOver(true);
          return prev;
        }
        
        const newSnake = [newHead, ...prev];
        
        setFood(f => {
          if (newHead.x === f.x && newHead.y === f.y) {
            setScore(s => s + 10);
            return randomFood();
          }
          newSnake.pop();
          return f;
        });
        
        return newSnake;
      });
    }, 120);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [started, gameOver, dir, randomFood]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!started) { setStarted(true); return; }
      switch (e.key) {
        case 'ArrowUp': if (dir.y === 0) setDir({ x: 0, y: -1 }); break;
        case 'ArrowDown': if (dir.y === 0) setDir({ x: 0, y: 1 }); break;
        case 'ArrowLeft': if (dir.x === 0) setDir({ x: -1, y: 0 }); break;
        case 'ArrowRight': if (dir.x === 0) setDir({ x: 1, y: 0 }); break;
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [dir, started]);

  const reset = () => {
    setSnake([{ x: 10, y: 10 }]);
    setFood({ x: 15, y: 15 });
    setDir({ x: 1, y: 0 });
    setScore(0);
    setGameOver(false);
    setStarted(false);
  };

  return (
    <div className="w-full h-full flex flex-col items-center p-3" style={{ background: 'rgba(0, 18, 51, 0.95)' }}>
      <div className="flex items-center justify-between w-full mb-2">
        <span className="text-sm font-medium">得分: {score}</span>
        <span className="text-xs text-muted-foreground">长度: {snake.length}</span>
      </div>

      <div className="grid gap-px p-1 rounded-lg border border-white/10" 
        style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 16px)`, background: 'rgba(0,40,85,0.5)' }}>
        {Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => {
          const x = i % GRID_SIZE, y = Math.floor(i / GRID_SIZE);
          const isSnake = snake.some(s => s.x === x && s.y === y);
          const isHead = snake[0].x === x && snake[0].y === y;
          const isFood = food.x === x && food.y === y;
          return (
            <div key={i} className="w-4 h-4 rounded-sm" style={{
              background: isHead ? '#00B4D8' : isSnake ? '#00B4D880' : isFood ? '#EF233C' : 'rgba(0,18,51,0.5)'
            }} />
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-1 mt-3">
        <div />
        <button onClick={() => started ? setDir({ x: 0, y: -1 }) : setStarted(true)} className="p-2 rounded glass-panel hover:bg-white/10"><ArrowUp size={16} /></button>
        <div />
        <button onClick={() => started ? setDir({ x: -1, y: 0 }) : setStarted(true)} className="p-2 rounded glass-panel hover:bg-white/10"><ArrowLeft size={16} /></button>
        <button onClick={() => started ? setDir({ x: 0, y: 1 }) : setStarted(true)} className="p-2 rounded glass-panel hover:bg-white/10"><ArrowDown size={16} /></button>
        <button onClick={() => started ? setDir({ x: 1, y: 0 }) : setStarted(true)} className="p-2 rounded glass-panel hover:bg-white/10"><ArrowRight size={16} /></button>
      </div>

      {!started && (
        <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <button onClick={() => setStarted(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-400/20 text-cyan-400 hover:bg-cyan-400/30">
            <Play size={16} /> 开始游戏
          </button>
        </div>
      )}
      {gameOver && (
        <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.8)' }}>
          <div className="text-center">
            <div className="text-2xl font-bold mb-2">游戏结束</div>
            <div className="text-muted-foreground mb-4">得分: {score}</div>
            <button onClick={reset} className="px-4 py-2 rounded-lg bg-cyan-400/20 text-cyan-400 hover:bg-cyan-400/30">重新开始</button>
          </div>
        </div>
      )}
    </div>
  );
}
