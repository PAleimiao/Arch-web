import { useState, useCallback, useEffect } from 'react';
import { RotateCcw, Clock, Zap } from 'lucide-react';

interface Card {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const EMOJIS = ['🎮', '🎯', '🎲', '🎸', '🎨', '🚀', '💎', '🔥', '🌟', '🍕', '🍔', '🌈', '🐱', '🐶', '🦄', '🌺'];

function createDeck(pairCount: number): Card[] {
  const selected = EMOJIS.slice(0, pairCount);
  const pairs = [...selected, ...selected];
  return pairs
    .sort(() => Math.random() - 0.5)
    .map((emoji, i) => ({ id: i, emoji, isFlipped: false, isMatched: false }));
}

export default function MemoryGame() {
  const [gridSize, setGridSize] = useState<'4x4' | '4x5' | '6x4'>('4x4');
  const [cards, setCards] = useState<Card[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [bestScore, setBestScore] = useState(() => {
    const saved = localStorage.getItem('memory-best');
    return saved ? parseInt(saved) : Infinity;
  });

  const pairCount = gridSize === '4x4' ? 8 : gridSize === '4x5' ? 10 : 12;

  const initGame = useCallback(() => {
    setCards(createDeck(pairCount));
    setFlipped([]);
    setMoves(0);
    setTime(0);
    setTimerActive(false);
    setGameComplete(false);
  }, [pairCount]);

  useEffect(() => {
    initGame();
  }, [initGame, gridSize]);

  // Timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (timerActive && !gameComplete) {
      interval = setInterval(() => setTime(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, gameComplete]);

  const handleCardClick = useCallback((index: number) => {
    if (flipped.length >= 2) return;
    if (cards[index].isFlipped || cards[index].isMatched) return;

    if (!timerActive) setTimerActive(true);

    const newCards = [...cards];
    newCards[index] = { ...newCards[index], isFlipped: true };
    setCards(newCards);

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [first, second] = newFlipped;

      if (newCards[first].emoji === newCards[second].emoji) {
        // Match
        setTimeout(() => {
          setCards(prev => {
            const updated = [...prev];
            updated[first] = { ...updated[first], isMatched: true };
            updated[second] = { ...updated[second], isMatched: true };
            return updated;
          });
          setFlipped([]);

          // Check completion
          setTimeout(() => {
            setCards(prev => {
              if (prev.every(c => c.isMatched)) {
                setGameComplete(true);
                setTimerActive(false);
                const score = moves + 1;
                if (score < bestScore) {
                  setBestScore(score);
                  localStorage.setItem('memory-best', String(score));
                }
              }
              return prev;
            });
          }, 100);
        }, 400);
      } else {
        // No match
        setTimeout(() => {
          setCards(prev => {
            const updated = [...prev];
            updated[first] = { ...updated[first], isFlipped: false };
            updated[second] = { ...updated[second], isFlipped: false };
            return updated;
          });
          setFlipped([]);
        }, 800);
      }
    }
  }, [cards, flipped, moves, timerActive, bestScore]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const cols = gridSize === '4x4' ? 4 : gridSize === '4x5' ? 5 : 4;
  const rows = gridSize === '4x4' ? 4 : gridSize === '4x5' ? 4 : 6;

  return (
    <div className="w-full h-full flex flex-col p-4" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-white">记忆翻牌</span>
          <div className="flex gap-1">
            {(['4x4', '4x5', '6x4'] as const).map(s => (
              <button
                key={s}
                onClick={() => setGridSize(s)}
                className={`px-2 py-0.5 rounded text-xs transition-colors ${
                  gridSize === s ? 'bg-purple-500 text-white' : 'bg-white/10 text-gray-400 hover:bg-white/20'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <button onClick={initGame} className="p-1.5 rounded hover:bg-white/10 transition-colors" title="重新开始">
          <RotateCcw size={14} className="text-gray-400" />
        </button>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-center gap-6 mb-3 text-xs">
        <div className="flex items-center gap-1 text-gray-400">
          <Zap size={12} className="text-yellow-400" />
          <span>步数: <span className="text-white">{moves}</span></span>
        </div>
        <div className="flex items-center gap-1 text-gray-400">
          <Clock size={12} className="text-cyan-400" />
          <span>时间: <span className="text-white">{formatTime(time)}</span></span>
        </div>
        {bestScore < Infinity && (
          <div className="text-gray-400">
            最佳: <span className="text-green-400">{bestScore}步</span>
          </div>
        )}
      </div>

      {/* Complete message */}
      {gameComplete && (
        <div className="mb-3 px-3 py-2 rounded-lg bg-green-500/20 text-green-400 text-xs text-center">
          🎉 恭喜完成！用了 {moves} 步，耗时 {formatTime(time)}
        </div>
      )}

      {/* Card Grid */}
      <div className="flex-1 flex items-center justify-center">
        <div
          className="grid gap-2"
          style={{
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gridTemplateRows: `repeat(${rows}, 1fr)`,
          }}
        >
          {cards.map((card, i) => (
            <button
              key={card.id}
              onClick={() => handleCardClick(i)}
              disabled={card.isMatched || card.isFlipped || flipped.length >= 2}
              className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl transition-all duration-300 preserve-3d ${
                card.isFlipped || card.isMatched ? '' : 'hover:scale-105'
              } ${card.isMatched ? 'opacity-60' : ''}`}
              style={{
                transformStyle: 'preserve-3d',
                transform: card.isFlipped || card.isMatched ? 'rotateY(180deg)' : 'rotateY(0deg)',
              }}
            >
              {/* Front (hidden) */}
              <div
                className="absolute inset-0 rounded-xl flex items-center justify-center backface-hidden"
                style={{
                  backfaceVisibility: 'hidden',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
                }}
              >
                <span className="text-xl">?</span>
              </div>
              {/* Back (revealed) */}
              <div
                className="absolute inset-0 rounded-xl flex items-center justify-center"
                style={{
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                  background: card.isMatched
                    ? 'linear-gradient(135deg, #10b98140, #05966940)'
                    : 'linear-gradient(135deg, #1e293b, #334155)',
                  boxShadow: card.isMatched
                    ? '0 0 12px rgba(16, 185, 129, 0.5)'
                    : '0 4px 6px rgba(0,0,0,0.3)',
                }}
              >
                <span className="text-2xl">{card.emoji}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Footer hint */}
      <div className="text-center text-xs text-gray-500 mt-2">
        点击卡片翻开，找到所有配对的图标
      </div>
    </div>
  );
}
