import { useState, useCallback, useEffect } from 'react';
import { RotateCcw } from 'lucide-react';

type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

interface Card {
  suit: Suit;
  rank: Rank;
  faceUp: boolean;
  id: string;
}

const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
const RANKS: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const SUIT_COLORS: Record<Suit, string> = {
  hearts: '#E11D48',
  diamonds: '#E11D48',
  clubs: '#1F2937',
  spades: '#1F2937',
};
const SUIT_SYMBOLS: Record<Suit, string> = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
};

function createDeck(): Card[] {
  const cards: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      cards.push({ suit, rank, faceUp: false, id: `${suit}-${rank}` });
    }
  }
  return cards.sort(() => Math.random() - 0.5);
}

function rankValue(rank: Rank): number {
  return RANKS.indexOf(rank) + 1;
}

function canPlaceOnTableau(bottom: Card | null, top: Card): boolean {
  if (!bottom) return top.rank === 'K';
  const bottomVal = rankValue(bottom.rank);
  const topVal = rankValue(top.rank);
  if (topVal !== bottomVal - 1) return false;
  const isRedBottom = bottom.suit === 'hearts' || bottom.suit === 'diamonds';
  const isRedTop = top.suit === 'hearts' || top.suit === 'diamonds';
  return isRedBottom !== isRedTop;
}

function canPlaceOnFoundation(top: Card | null, card: Card): boolean {
  if (!top) return card.rank === 'A';
  if (top.suit !== card.suit) return false;
  return rankValue(card.rank) === rankValue(top.rank) + 1;
}

export default function Solitaire() {
  const [tableau, setTableau] = useState<Card[][]>([]);
  const [foundations, setFoundations] = useState<Card[][]>([[], [], [], []]);
  const [stock, setStock] = useState<Card[]>([]);
  const [waste, setWaste] = useState<Card[]>([]);
  const [selected, setSelected] = useState<{ pile: string; index: number; cards: Card[] } | null>(null);
  const [completed, setCompleted] = useState(false);

  const initGame = useCallback(() => {
    const deck = createDeck();
    const newTableau: Card[][] = [];
    let deckIndex = 0;

    for (let i = 0; i < 7; i++) {
      const pile: Card[] = [];
      for (let j = 0; j <= i; j++) {
        const card = { ...deck[deckIndex++], faceUp: j === i };
        pile.push(card);
      }
      newTableau.push(pile);
    }

    setTableau(newTableau);
    setFoundations([[], [], [], []]);
    setStock(deck.slice(deckIndex).map(c => ({ ...c, faceUp: false })));
    setWaste([]);
    setSelected(null);
    setCompleted(false);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  // Check win
  useEffect(() => {
    if (foundations.every(f => f.length === 13)) {
      setCompleted(true);
    }
  }, [foundations]);

  const drawFromStock = useCallback(() => {
    if (stock.length === 0) {
      if (waste.length > 0) {
        setStock(waste.map(c => ({ ...c, faceUp: false })).reverse());
        setWaste([]);
      }
      return;
    }

    const newStock = [...stock];
    const card = newStock.pop()!;
    setStock(newStock);
    setWaste(prev => [...prev, { ...card, faceUp: true }]);
    setSelected(null);
  }, [stock, waste]);

  const handleTableauClick = useCallback((pileIndex: number, cardIndex: number) => {
    if (selected) {
      // Try to place selected cards
      if (selected.pile === 'waste' || selected.pile === 'tableau') {
        const targetPile = tableau[pileIndex];
        const bottomCard = targetPile.length > 0 ? targetPile[targetPile.length - 1] : null;
        const topCard = selected.cards[0];

        if (canPlaceOnTableau(bottomCard, topCard)) {
          const newTableau = tableau.map(p => [...p]);
          newTableau[pileIndex] = [...targetPile, ...selected.cards];

          // Remove from source
          if (selected.pile === 'tableau') {
            const srcPile = newTableau[selected.index];
            srcPile.splice(srcPile.length - selected.cards.length);
            // Flip top card if face down
            if (srcPile.length > 0 && !srcPile[srcPile.length - 1].faceUp) {
              srcPile[srcPile.length - 1] = { ...srcPile[srcPile.length - 1], faceUp: true };
            }
          }

          setTableau(newTableau);
          if (selected.pile === 'waste') {
            setWaste(prev => prev.slice(0, -1));
          }
          setSelected(null);
          return;
        }
      }
      setSelected(null);
      return;
    }

    // Select from tableau
    const pile = tableau[pileIndex];
    if (cardIndex >= pile.length || !pile[cardIndex].faceUp) return;

    const cards = pile.slice(cardIndex);
    setSelected({ pile: 'tableau', index: pileIndex, cards });
  }, [selected, tableau]);

  const handleWasteClick = useCallback(() => {
    if (waste.length === 0) return;

    if (selected?.pile === 'waste') {
      setSelected(null);
      return;
    }

    const topCard = waste[waste.length - 1];
    setSelected({ pile: 'waste', index: 0, cards: [topCard] });
  }, [waste, selected]);

  const handleFoundationClick = useCallback((foundationIndex: number) => {
    if (!selected) return;

    if (selected.cards.length !== 1) {
      setSelected(null);
      return;
    }

    const card = selected.cards[0];
    const foundation = foundations[foundationIndex];
    const topCard = foundation.length > 0 ? foundation[foundation.length - 1] : null;

    if (canPlaceOnFoundation(topCard, card)) {
      const newFoundations = foundations.map(f => [...f]);
      newFoundations[foundationIndex] = [...foundation, card];
      setFoundations(newFoundations);

      if (selected.pile === 'waste') {
        setWaste(prev => prev.slice(0, -1));
      } else if (selected.pile === 'tableau') {
        const newTableau = tableau.map(p => [...p]);
        const srcPile = newTableau[selected.index];
        srcPile.pop();
        if (srcPile.length > 0 && !srcPile[srcPile.length - 1].faceUp) {
          srcPile[srcPile.length - 1] = { ...srcPile[srcPile.length - 1], faceUp: true };
        }
        setTableau(newTableau);
      }
      setSelected(null);
    } else {
      setSelected(null);
    }
  }, [selected, foundations, tableau]);

  const handleEmptyTableauClick = useCallback((pileIndex: number) => {
    if (!selected) return;

    const topCard = selected.cards[0];
    if (topCard.rank === 'K') {
      const newTableau = tableau.map(p => [...p]);
      newTableau[pileIndex] = [...selected.cards];

      if (selected.pile === 'waste') {
        setWaste(prev => prev.slice(0, -1));
      } else if (selected.pile === 'tableau') {
        const srcPile = newTableau[selected.index];
        srcPile.splice(srcPile.length - selected.cards.length);
        if (srcPile.length > 0 && !srcPile[srcPile.length - 1].faceUp) {
          srcPile[srcPile.length - 1] = { ...srcPile[srcPile.length - 1], faceUp: true };
        }
      }

      setTableau(newTableau);
      setSelected(null);
    }
  }, [selected, tableau]);

  const isSelected = (pile: string, index: number, cardIndex?: number) => {
    if (!selected) return false;
    if (selected.pile !== pile) return false;
    if (pile === 'waste') return true;
    if (pile === 'tableau' && cardIndex !== undefined) {
      return selected.index === index && cardIndex >= tableau[index].length - selected.cards.length;
    }
    return selected.index === index;
  };

  return (
    <div className="w-full h-full flex flex-col p-2 select-none" style={{ background: 'linear-gradient(180deg, #1a472a 0%, #2d6a3e 100%)' }}>
      {/* Win message */}
      {completed && (
        <div className="mb-1 px-2 py-1 rounded bg-yellow-400/20 text-yellow-300 text-xs text-center">
          🎉 恭喜通关！
        </div>
      )}

      {/* Top row: Stock, Waste, Foundations */}
      <div className="flex items-start justify-between mb-2 px-1">
        {/* Stock and Waste */}
        <div className="flex gap-1">
          {/* Stock */}
          <button
            onClick={drawFromStock}
            className="w-11 h-15 rounded-md border border-white/20 flex items-center justify-center transition-all hover:border-white/40"
            style={{
              minHeight: 60,
              background: stock.length > 0
                ? 'repeating-linear-gradient(45deg, #1a472a, #1a472a 4px, #2d6a3e 4px, #2d6a3e 8px)'
                : 'rgba(255,255,255,0.05)',
            }}
          >
            {stock.length > 0 ? (
              <span className="text-xs text-white/40">{stock.length}</span>
            ) : (
              <RotateCcw size={14} className="text-white/30" />
            )}
          </button>

          {/* Waste */}
          <button
            onClick={handleWasteClick}
            className={`w-11 rounded-md border transition-all ${
              isSelected('waste', 0) ? 'border-yellow-400 shadow-lg shadow-yellow-400/30' : 'border-white/20'
            }`}
            style={{
              minHeight: 60,
              background: waste.length > 0 ? '#f0f0f0' : 'rgba(255,255,255,0.05)',
            }}
          >
            {waste.length > 0 && (
              <div className="flex flex-col items-center justify-center h-full py-1">
                <span style={{ color: SUIT_COLORS[waste[waste.length - 1].suit], fontSize: 16 }}>
                  {SUIT_SYMBOLS[waste[waste.length - 1].suit]}
                </span>
                <span className="text-xs font-bold" style={{ color: SUIT_COLORS[waste[waste.length - 1].suit] }}>
                  {waste[waste.length - 1].rank}
                </span>
              </div>
            )}
          </button>
        </div>

        {/* Foundations */}
        <div className="flex gap-1">
          {foundations.map((foundation, fi) => (
            <button
              key={fi}
              onClick={() => handleFoundationClick(fi)}
              className="w-11 rounded-md border border-white/20 hover:border-white/40 transition-all flex items-center justify-center"
              style={{
                minHeight: 60,
                background: foundation.length > 0 ? '#f0f0f0' : 'rgba(255,255,255,0.05)',
              }}
            >
              {foundation.length > 0 ? (
                <div className="flex flex-col items-center">
                  <span style={{ color: SUIT_COLORS[foundation[foundation.length - 1].suit], fontSize: 16 }}>
                    {SUIT_SYMBOLS[foundation[foundation.length - 1].suit]}
                  </span>
                  <span className="text-xs font-bold" style={{ color: SUIT_COLORS[foundation[foundation.length - 1].suit] }}>
                    {foundation[foundation.length - 1].rank}
                  </span>
                </div>
              ) : (
                <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 18 }}>
                  {SUIT_SYMBOLS[SUITS[fi]]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tableau */}
      <div className="flex-1 flex gap-1 px-1 justify-center">
        {tableau.map((pile, pi) => (
          <div key={pi} className="flex-1 max-w-14 flex flex-col items-center">
            {pile.length === 0 ? (
              <button
                onClick={() => handleEmptyTableauClick(pi)}
                className="w-11 rounded-md border border-white/10 flex items-center justify-center"
                style={{ minHeight: 60, background: 'rgba(255,255,255,0.03)' }}
              >
                <span className="text-white/10 text-xs">K</span>
              </button>
            ) : (
              pile.map((card, ci) => (
                <button
                  key={`${card.id}-${ci}`}
                  onClick={() => handleTableauClick(pi, ci)}
                  className={`w-11 rounded-md border transition-all ${
                    isSelected('tableau', pi, ci) ? 'border-yellow-400 shadow-lg shadow-yellow-400/30' : 'border-gray-300/30'
                  } ${ci < pile.length - 1 ? '-mb-8' : ''}`}
                  style={{
                    minHeight: 60,
                    zIndex: ci,
                    background: card.faceUp ? '#f0f0f0' : 'repeating-linear-gradient(45deg, #1a5c3a, #1a5c3a 4px, #2d7a4e 4px, #2d7a4e 8px)',
                  }}
                >
                  {card.faceUp && (
                    <div className="flex flex-col items-center py-1">
                      <span style={{ color: SUIT_COLORS[card.suit], fontSize: 14 }}>
                        {SUIT_SYMBOLS[card.suit]}
                      </span>
                      <span className="text-xs font-bold" style={{ color: SUIT_COLORS[card.suit] }}>
                        {card.rank}
                      </span>
                    </div>
                  )}
                </button>
              ))
            )}
          </div>
        ))}
      </div>

      {/* Bottom controls */}
      <div className="flex items-center justify-between mt-1 px-1">
        <button onClick={initGame} className="flex items-center gap-1 px-2 py-1 rounded bg-white/10 text-white/60 text-xs hover:bg-white/20 transition-colors">
          <RotateCcw size={12} /> 新游戏
        </button>
        <div className="text-xs text-white/40">
          A→K 收集到上方
        </div>
      </div>
    </div>
  );
}
