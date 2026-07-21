import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, RotateCw } from 'lucide-react';

const GRAVITY = 0.4;
const JUMP = -6;
const PIPE_GAP = 140;
const PIPE_WIDTH = 50;
const PIPE_SPEED = 2.5;

export default function FlappyBird() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'over'>('idle');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  const bird = useRef({ y: 200, velocity: 0 });
  const pipes = useRef<{ x: number; topHeight: number }[]>([]);
  const frameRef = useRef<number>(0);
  const gameStateRef = useRef(gameState);
  gameStateRef.current = gameState;

  const reset = useCallback(() => {
    bird.current = { y: 200, velocity: 0 };
    pipes.current = [];
    setScore(0);
    setGameState('playing');
  }, []);

  const jump = useCallback(() => {
    if (gameStateRef.current === 'idle') {
      setGameState('playing');
    } else if (gameStateRef.current === 'playing') {
      bird.current.velocity = JUMP;
    } else if (gameStateRef.current === 'over') {
      reset();
    }
  }, [reset]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frame = 0;
    const gameLoop = () => {
      const w = canvas.width, h = canvas.height;
      const b = bird.current;

      if (gameStateRef.current === 'playing') {
        b.velocity += GRAVITY;
        b.y += b.velocity;

        // Generate pipes
        frame++;
        if (frame % 90 === 0) {
          const topHeight = Math.random() * (h - PIPE_GAP - 100) + 50;
          pipes.current.push({ x: w, topHeight });
        }

        // Move pipes
        pipes.current = pipes.current.filter(p => {
          p.x -= PIPE_SPEED;
          // Score
          if (p.x + PIPE_SPEED > 80 && p.x <= 80) {
            setScore(s => s + 1);
          }
          return p.x > -PIPE_WIDTH;
        });

        // Collision
        if (b.y < 0 || b.y > h - 20) {
          setGameState('over');
          setHighScore(prev => Math.max(prev, score));
        }
        for (const p of pipes.current) {
          if (80 + 20 > p.x && 80 < p.x + PIPE_WIDTH) {
            if (b.y < p.topHeight || b.y + 20 > p.topHeight + PIPE_GAP) {
              setGameState('over');
              setHighScore(prev => Math.max(prev, score));
            }
          }
        }
      }

      // Draw
      ctx.fillStyle = '#70c5ce';
      ctx.fillRect(0, 0, w, h);

      // Ground
      ctx.fillStyle = '#ded895';
      ctx.fillRect(0, h - 20, w, 20);
      ctx.fillStyle = '#73bf2e';
      ctx.fillRect(0, h - 25, w, 5);

      // Pipes
      ctx.fillStyle = '#73bf2e';
      for (const p of pipes.current) {
        ctx.fillRect(p.x, 0, PIPE_WIDTH, p.topHeight);
        ctx.fillRect(p.x, p.topHeight + PIPE_GAP, PIPE_WIDTH, h - p.topHeight - PIPE_GAP);
        ctx.strokeStyle = '#558b2f';
        ctx.strokeRect(p.x, 0, PIPE_WIDTH, p.topHeight);
        ctx.strokeRect(p.x, p.topHeight + PIPE_GAP, PIPE_WIDTH, h - p.topHeight - PIPE_GAP);
      }

      // Bird
      ctx.save();
      ctx.translate(90, b.y + 10);
      ctx.rotate(Math.min(Math.max(b.velocity * 0.05, -0.5), 0.5));
      ctx.fillStyle = '#F4D03F';
      ctx.beginPath();
      ctx.ellipse(0, 0, 15, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(6, -4, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(8, -4, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FF7139';
      ctx.beginPath();
      ctx.moveTo(-5, 2);
      ctx.lineTo(-15, 5);
      ctx.lineTo(-5, 8);
      ctx.fill();
      ctx.restore();

      // Score
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 30px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(String(score), w / 2, 40);

      frameRef.current = requestAnimationFrame(gameLoop);
    };

    frameRef.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(frameRef.current);
  }, [score]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.code === 'Space') { e.preventDefault(); jump(); } };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [jump]);

  return (
    <div className="w-full h-full flex flex-col items-center" style={{ background: 'rgba(0, 18, 51, 0.95)' }}>
      <canvas
        ref={canvasRef}
        width={340}
        height={460}
        className="rounded-lg cursor-pointer touch-none"
        onClick={jump}
      />
      {gameState === 'idle' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center pointer-events-auto">
            <button onClick={jump} className="p-3 rounded-full bg-cyan-400/20 hover:bg-cyan-400/30">
              <Play size={24} className="text-cyan-400" />
            </button>
            <div className="text-xs text-muted-foreground mt-2">点击或按空格开始</div>
          </div>
        </div>
      )}
      {gameState === 'over' && (
        <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)' }}>
          <div className="text-center">
            <div className="text-2xl font-bold mb-1">游戏结束</div>
            <div className="text-sm text-muted-foreground mb-1">得分: {score}</div>
            <div className="text-xs text-muted-foreground mb-3">最高分: {Math.max(highScore, score)}</div>
            <button onClick={reset} className="px-4 py-2 rounded-lg bg-cyan-400/20 text-cyan-400 hover:bg-cyan-400/30 flex items-center gap-2 mx-auto">
              <RotateCw size={14} /> 再来一次
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
