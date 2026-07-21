import { useState } from 'react';
import { Plus, Trash2, Palette } from 'lucide-react';

const COLORS = ['#F4D03F', '#2DC653', '#00B4D8', '#FF7139', '#EC4899', '#8B5CF6'];

interface Note {
  id: number;
  text: string;
  color: string;
  date: string;
}

export default function StickyNotes() {
  const [notes, setNotes] = useState<Note[]>([
    { id: 1, text: '记得更新系统\\npacman -Syu', color: '#F4D03F', date: '2026-07-02' },
    { id: 2, text: '晚上和铁子打游戏！', color: '#2DC653', date: '2026-07-02' },
    { id: 3, text: '配置 Hyprland 动画', color: '#00B4D8', date: '2026-07-01' },
  ]);
  const [showColorPicker, setShowColorPicker] = useState<number | null>(null);

  const addNote = () => {
    const newNote: Note = { id: Date.now(), text: '', color: COLORS[Math.floor(Math.random() * COLORS.length)], date: new Date().toISOString().slice(0, 10) };
    setNotes([newNote, ...notes]);
  };

  const updateNote = (id: number, text: string) => {
    setNotes(notes.map(n => n.id === id ? { ...n, text } : n));
  };

  const deleteNote = (id: number) => {
    setNotes(notes.filter(n => n.id !== id));
  };

  const changeColor = (id: number, color: string) => {
    setNotes(notes.map(n => n.id === id ? { ...n, color } : n));
    setShowColorPicker(null);
  };

  return (
    <div className="w-full h-full flex flex-col" style={{ background: 'rgba(0, 18, 51, 0.95)' }}>
      <div className="flex items-center justify-between p-2 border-b border-white/5">
        <span className="text-sm font-medium">便签</span>
        <button onClick={addNote} className="p-1.5 rounded hover:bg-white/10"><Plus size={14} /></button>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {notes.map(note => (
          <div key={note.id} className="rounded-lg p-3 relative group" style={{ background: note.color + '30', border: `1px solid ${note.color}40` }}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-muted-foreground">{note.date}</span>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setShowColorPicker(showColorPicker === note.id ? null : note.id)} className="p-0.5 rounded hover:bg-white/10">
                  <Palette size={10} />
                </button>
                <button onClick={() => deleteNote(note.id)} className="p-0.5 rounded hover:bg-white/10">
                  <Trash2 size={10} className="text-red-400" />
                </button>
              </div>
            </div>
            {showColorPicker === note.id && (
              <div className="flex gap-1 mb-1">
                {COLORS.map(c => (
                  <button key={c} onClick={() => changeColor(note.id, c)} className="w-4 h-4 rounded-full" style={{ background: c }} />
                ))}
              </div>
            )}
            <textarea
              value={note.text}
              onChange={(e) => updateNote(note.id, e.target.value)}
              className="w-full bg-transparent outline-none text-sm resize-none h-16"
              placeholder="输入便签内容..."
              style={{ color: '#EEF4ED' }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
