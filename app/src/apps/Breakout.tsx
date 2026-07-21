import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, RotateCw } from 'lucide-react';

const BRICK_ROWS = 5;
const BRICK_COLS = 8;
const BRICK_HEIGHT = 15;
const BALL_SIZE = 8;
const PADDLE_WIDTH = 70;
const PADDLE_HEIGHT = 10;

const COLORS = ['#EF233C', '#FF7139', '#F4D03F', '#2DC653', '#00B4D8'];

export default function Breakout() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'over'>('idle');
  const ball = useRef({ x: 200, y: 250, dx: 3, dy: -3 });
  const paddle = useRef({ x: 165 });
  const bricks = useRef<boolean[][]>([]);
  const gsRef = useRef(gameState);
  gsRef.current = gameState;

  const initBricks = () => {
    bricks.current = Array(BRICK_ROWS).fill(null).map(() => Array(BRICK_COLS).fill(true));
  };

  const reset = useCallback(() => {
    ball.current = { x: 200, y: 250, dx: 3, dy: -3 };
    paddle.current = { x: 165 };
    initBricks();
    setScore(0);
    setLives(3);
    setGameState('playing');
  }, []);

  const start = useCallback(() => {
    initBricks();
    setGameState('playing');
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleMouse = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      paddle.current.x = Math.max(0, Math.min(e.clientX - rect.left - PADDLE_WIDTH / 2, canvas.width - PADDLE_WIDTH));
    };
    const handleTouch = (e: TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      paddle.current.x = Math.max(0, Math.min(touch.clientX - rect.left - PADDLE_WIDTH / 2, canvas.width - PADDLE_WIDTH));
    };
    canvas.addEventListener('mousemove', handleMouse);
    canvas.addEventListener('touchmove', handleTouch, { passive: true });

    let frame = 0;
    const loop = () => {
      const w = canvas.width, h = canvas.height;
      const b = ball.current, p = paddle.current;

      if (gsRef.current === 'playing') {
        b.x += b.dx;
        b.y += b.dy;

        // Wall bounce
        if (b.x <= 0 || b.x >= w - BALL_SIZE) b.dx *= -1;
        if (b.y <= 0) b.dy *= -1;

        // Paddle bounce
        if (b.y + BALL_SIZE >= h - 20 && b.y + BALL_SIZE <= h - 10 && b.x + BALL_SIZE >= p.x && b.x <= p.x + PADDLE_WIDTH) {
          b.dy = -Math.abs(b.dy);
          b.dx = (b.x - (p.x + PADDLE_WIDTH / 2)) * 0.1;
        }

        // Brick collision
        const brickW = w / BRICK_COLS;
        for (let r = 0; r < BRICK_ROWS; r++) {
          for (let c = 0; c < BRICK_COLS; c++) {
            if (bricks.current[r]?.[c]) {
              const bx = c * brickW, by = 30 + r * (BRICK_HEIGHT + 5);
              if (b.x + BALL_SIZE > bx && b.x < bx + brickW && b.y + BALL_SIZE > by && b.y < by + BRICK_HEIGHT) {
                bricks.current[r][c] = false;
                b.dy *= -1;
                setScore(s => s + 10);
              }
            }
          }
        }

        // Lose life
        if (b.y > h) {
          setLives(lv => {
            const nl = lv - 1;
            if (nl <= 0) setGameState('over');
            else { b.x = w / 2; b.y = h / 2; b.dy = -3; }
            return nl;
          });
        }

        // Win check
        if (bricks.current.every(row => row.every(b => !b))) {
          setGameState('over');
        }
      }

      // Draw
      ctx.fillStyle = '#0D1117';
      ctx.fillRect(0, 0, w, h);

      // Bricks
      const brickW = w / BRICK_COLS;
      for (let r = 0; r < BRICK_ROWS; r++) {
        for (let c = 0; c < BRICK_COLS; c++) {
          if (bricks.current[r]?.[c]) {
            ctx.fillStyle = COLORS[r % COLORS.length];
            ctx.fillRect(c * brickW + 1, 30 + r * (BRICK_HEIGHT + 5), brickW - 2, BRICK_HEIGHT);
          }
        }
      }

      // Paddle
      ctx.fillStyle = '#00B4D8';
      ctx.fillRect(p.x, h - 20, PADDLE_WIDTH, PADDLE_HEIGHT);

      // Ball
      ctx.fillStyle = '#EEF4ED';
      ctx.beginPath();
      ctx.arc(b.x, b.y, BALL_SIZE, 0, Math.PI * 2);
      ctx.fill();

      // HUD
      ctx.fillStyle = '#EEF4ED';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`得分: ${score}`, 10, 18);
      ctx.textAlign = 'right';
      ctx.fillText(`生命: ${lives}`, w - 10, 18);

      frame = requestAnimationFrame(loop);
    };

    frame = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(frame);
      canvas.removeEventListener('mousemove', handleMouse);
      canvas.removeEventListener('touchmove', handleTouch);
    };
  }, [score, lives]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center" style={{ background: 'rgba(0, 18, 51, 0.95)' }}>
      <canvas ref={canvasRef} width={380} height={440} className="rounded-lg" />
      {gameState === 'idle' && (
        <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)' }}>
          <button onClick={start} className="p-3 rounded-full bg-orange-400/20 hover:bg-orange-400/30">
            <Play size={24} className="text-orange-400" />
          </button>
        </div>
      )}
      {gameState === 'over' && (
        <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="text-center">
            <div className="text-xl font-bold mb-2">{lives <= 0 ? '游戏结束' : '通关!'}</div>
            <div className="text-sm text-muted-foreground mb-3">得分: {score}</div>
            <button onClick={reset} className="px-4 py-2 rounded-lg bg-orange-400/20 text-orange-400 hover:bg-orange-400/30 flex items-center gap-2 mx-auto">
              <RotateCw size={14} /> 再来一次
            </button>
          </div>
        </div>
      )}
      <div className="text-xs text-muted-foreground mt-2">移动鼠标或触摸控制挡板</div>
    </div>
  );
}
