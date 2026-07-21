import { useState } from 'react';
import { Plus, Trash2, Check, Circle } from 'lucide-react';

interface TodoItem {
  id: number;
  text: string;
  done: boolean;
}

export default function Todo() {
  const [items, setItems] = useState<TodoItem[]>([
    { id: 1, text: '配置 Hyprland 桌面环境', done: true },
    { id: 2, text: '安装 yay AUR 助手', done: true },
    { id: 3, text: '配置 Neovim + Lua', done: false },
    { id: 4, text: '设置 Docker 容器', done: false },
    { id: 5, text: '优化系统启动速度', done: false },
  ]);
  const [input, setInput] = useState('');

  const addTodo = () => {
    if (!input.trim()) return;
    setItems([...items, { id: Date.now(), text: input.trim(), done: false }]);
    setInput('');
  };

  const toggleTodo = (id: number) => {
    setItems(items.map(item => item.id === id ? { ...item, done: !item.done } : item));
  };

  const deleteTodo = (id: number) => {
    setItems(items.filter(item => item.id !== id));
  };

  return (
    <div className="w-full h-full flex flex-col" style={{ background: 'rgba(0, 18, 51, 0.9)' }}>
      <div className="flex items-center gap-2 p-3 border-b border-white/5">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTodo()}
          placeholder="添加新任务..."
          className="flex-1 glass-panel rounded-lg px-3 py-2 text-sm outline-none"
        />
        <button onClick={addTodo} className="p-2 rounded-lg bg-cyan-400/20 hover:bg-cyan-400/30 transition-colors">
          <Plus size={16} className="text-cyan-400" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {items.map(item => (
          <div key={item.id} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors group">
            <button onClick={() => toggleTodo(item.id)} className="flex-shrink-0">
              {item.done ? <Check size={16} className="text-green-400" /> : <Circle size={16} className="text-muted-foreground" />}
            </button>
            <span className={`flex-1 text-sm ${item.done ? 'line-through text-muted-foreground' : ''}`}>{item.text}</span>
            <button onClick={() => deleteTodo(item.id)} className="opacity-0 group-hover:opacity-100 transition-opacity">
              <Trash2 size={14} className="text-red-400" />
            </button>
          </div>
        ))}
      </div>
      <div className="px-3 py-2 border-t border-white/5 text-xs text-muted-foreground">
        {items.filter(i => !i.done).length} 个待办 / {items.length} 个总计
      </div>
    </div>
  );
}
