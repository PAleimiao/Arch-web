import { useState, useEffect, useRef } from 'react';
import { Play } from 'lucide-react';

const PADDLE_H = 60;
const PADDLE_W = 10;
const BALL_SIZE = 8;

export default function Pong() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [playerScore, setPlayerScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [gameState, setGameState] = useState<'idle' | 'playing'>('idle');
  const state = useRef({
    playerY: 100, aiY: 100,
    ballX: 200, ballY: 150, ballDX: 3, ballDY: 2,
  });
  const gs = useRef(gameState);
  gs.current = gameState;

  const start = () => {
    state.current = { playerY: 100, aiY: 100, ballX: 200, ballY: 150, ballDX: 3, ballDY: 2 };
    setPlayerScore(0);
    setAiScore(0);
    setGameState('playing');
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleMouse = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      state.current.playerY = Math.max(0, Math.min(e.clientY - rect.top - PADDLE_H / 2, canvas.height - PADDLE_H));
    };
    const handleTouch = (e: TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      state.current.playerY = Math.max(0, Math.min(e.touches[0].clientY - rect.top - PADDLE_H / 2, canvas.height - PADDLE_H));
    };
    canvas.addEventListener('mousemove', handleMouse);
    canvas.addEventListener('touchmove', handleTouch, { passive: true });

    let frame = 0;
    const loop = () => {
      const w = canvas.width, h = canvas.height;
      const s = state.current;

      if (gs.current === 'playing') {
        s.ballX += s.ballDX;
        s.ballY += s.ballDY;

        if (s.ballY <= 0 || s.ballY >= h - BALL_SIZE) s.ballDY *= -1;

        // Player paddle
        if (s.ballX <= PADDLE_W + 10 && s.ballY + BALL_SIZE > s.playerY && s.ballY < s.playerY + PADDLE_H) {
          s.ballDX = Math.abs(s.ballDX) * 1.02;
          s.ballDY += (s.ballY - (s.playerY + PADDLE_H / 2)) * 0.1;
        }
        // AI paddle
        if (s.ballX >= w - PADDLE_W - 10 - BALL_SIZE && s.ballY + BALL_SIZE > s.aiY && s.ballY < s.aiY + PADDLE_H) {
          s.ballDX = -Math.abs(s.ballDX) * 1.02;
        }

        // AI movement
        const aiTarget = s.ballY - PADDLE_H / 2;
        s.aiY += (aiTarget - s.aiY) * 0.08;
        s.aiY = Math.max(0, Math.min(h - PADDLE_H, s.aiY));

        // Score
        if (s.ballX < 0) { setAiScore(sc => sc + 1); s.ballX = w / 2; s.ballY = h / 2; s.ballDX = -3; }
        if (s.ballX > w) { setPlayerScore(sc => sc + 1); s.ballX = w / 2; s.ballY = h / 2; s.ballDX = 3; }
      }

      ctx.fillStyle = '#0D1117';
      ctx.fillRect(0, 0, w, h);

      // Center line
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.beginPath();
      ctx.moveTo(w / 2, 0);
      ctx.lineTo(w / 2, h);
      ctx.stroke();
      ctx.setLineDash([]);

      // Paddles
      ctx.fillStyle = '#00B4D8';
      ctx.fillRect(10, s.playerY, PADDLE_W, PADDLE_H);
      ctx.fillStyle = '#EF233C';
      ctx.fillRect(w - 10 - PADDLE_W, s.aiY, PADDLE_W, PADDLE_H);

      // Ball
      ctx.fillStyle = '#EEF4ED';
      ctx.beginPath();
      ctx.arc(s.ballX, s.ballY, BALL_SIZE, 0, Math.PI * 2);
      ctx.fill();

      // Score
      ctx.fillStyle = '#EEF4ED';
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(String(playerScore), w / 2 - 30, 30);
      ctx.fillText(String(aiScore), w / 2 + 30, 30);

      frame = requestAnimationFrame(loop);
    };

    frame = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(frame);
      canvas.removeEventListener('mousemove', handleMouse);
      canvas.removeEventListener('touchmove', handleTouch);
    };
  }, [playerScore]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center" style={{ background: 'rgba(0, 18, 51, 0.95)' }}>
      <canvas ref={canvasRef} width={420} height={300} className="rounded-lg" />
      {gameState === 'idle' && (
        <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)' }}>
          <button onClick={start} className="p-3 rounded-full bg-cyan-400/20 hover:bg-cyan-400/30">
            <Play size={24} className="text-cyan-400" />
          </button>
        </div>
      )}
      <div className="text-xs text-muted-foreground mt-2">移动鼠标或触摸控制</div>
    </div>
  );
}
