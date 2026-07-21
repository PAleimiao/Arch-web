import { useState } from 'react';

export default function Calculator() {
  const [display, setDisplay] = useState('0');
  const [prev, setPrev] = useState('');
  const [op, setOp] = useState('');
  const [newNum, setNewNum] = useState(true);

  const handleNum = (n: string) => {
    if (newNum) {
      setDisplay(n);
      setNewNum(false);
    } else {
      setDisplay(display === '0' ? n : display + n);
    }
  };

  const handleOp = (operation: string) => {
    setOp(operation);
    setPrev(display);
    setNewNum(true);
  };

  const handleEqual = () => {
    if (!op || !prev) return;
    const a = parseFloat(prev);
    const b = parseFloat(display);
    let result = 0;
    switch (op) {
      case '+': result = a + b; break;
      case '-': result = a - b; break;
      case '*': result = a * b; break;
      case '/': result = b !== 0 ? a / b : NaN; break;
      case '%': result = a % b; break;
    }
    setDisplay(isNaN(result) ? 'Error' : String(result).slice(0, 12));
    setOp('');
    setPrev('');
    setNewNum(true);
  };

  const handleClear = () => {
    setDisplay('0');
    setPrev('');
    setOp('');
    setNewNum(true);
  };

  const btn = (label: string, onClick: () => void, className = '') => (
    <button onClick={onClick} className={`h-12 rounded-lg text-sm font-medium transition-colors ${className}`}
      style={{ background: 'rgba(0, 40, 85, 0.5)' }}>
      {label}
    </button>
  );

  return (
    <div className="w-full h-full flex flex-col p-3" style={{ background: 'rgba(0, 18, 51, 0.9)' }}>
      <div className="flex-1 flex items-end justify-end p-3 mb-2 rounded-lg font-mono text-2xl break-all"
        style={{ background: 'rgba(0, 40, 85, 0.5)' }}>
        {display}
      </div>
      <div className="grid grid-cols-4 gap-1.5">
        {btn('C', handleClear, 'text-red-400')}
        {btn('CE', () => setDisplay('0'), 'text-yellow-400')}
        {btn('%', () => handleOp('%'), 'text-cyan-400')}
        {btn('÷', () => handleOp('/'), 'text-cyan-400')}
        {btn('7', () => handleNum('7'))}
        {btn('8', () => handleNum('8'))}
        {btn('9', () => handleNum('9'))}
        {btn('×', () => handleOp('*'), 'text-cyan-400')}
        {btn('4', () => handleNum('4'))}
        {btn('5', () => handleNum('5'))}
        {btn('6', () => handleNum('6'))}
        {btn('-', () => handleOp('-'), 'text-cyan-400')}
        {btn('1', () => handleNum('1'))}
        {btn('2', () => handleNum('2'))}
        {btn('3', () => handleNum('3'))}
        {btn('+', () => handleOp('+'), 'text-cyan-400')}
        {btn('0', () => handleNum('0'))}
        {btn('.', () => handleNum('.'))}
        {btn('=', () => handleEqual(), 'col-span-2 text-cyan-400')}
      </div>
    </div>
  );
}
