import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Search, StickyNote, Clock, Palette } from 'lucide-react';

interface Note {
  id: string;
  title: string;
  content: string;
  color: string;
  createdAt: string;
  updatedAt: string;
  pinned: boolean;
}

const COLORS = [
  { bg: '#FEF3C7', text: '#92400E' }, // yellow
  { bg: '#DBEAFE', text: '#1E40AF' }, // blue
  { bg: '#D1FAE5', text: '#065F46' }, // green
  { bg: '#FCE7F3', text: '#9D174D' }, // pink
  { bg: '#E9D5FF', text: '#6B21A8' }, // purple
  { bg: '#FEE2E2', text: '#991B1B' }, // red
  { bg: '#E5E7EB', text: '#374151' }, // gray
];

const STORAGE_KEY = 'sticky-notes';

function loadNotes(): Note[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  return [
    { id: '1', title: '待办事项', content: '- 更新系统\n- 备份文件\n- 清理缓存', color: '#FEF3C7', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), pinned: true },
    { id: '2', title: '快捷键备忘', content: 'Super - 打开启动器\nCtrl+Alt+T - 终端\nAlt+F4 - 关闭窗口\nCtrl+L - 锁屏', color: '#DBEAFE', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), pinned: false },
    { id: '3', title: '灵感笔记', content: '可以把这里当作临时记事本，所有内容自动保存到本地。', color: '#D1FAE5', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), pinned: false },
  ];
}

function saveNotes(notes: Note[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

export default function Notes() {
  const [notes, setNotes] = useState<Note[]>(loadNotes);
  const [search, setSearch] = useState('');
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);

  useEffect(() => { saveNotes(notes); }, [notes]);

  const addNote = useCallback(() => {
    const color = COLORS[Math.floor(Math.random() * COLORS.length)].bg;
    const newNote: Note = {
      id: Date.now().toString(),
      title: '新便签',
      content: '',
      color,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      pinned: false,
    };
    setNotes(prev => [newNote, ...prev]);
    setActiveNoteId(newNote.id);
  }, []);

  const updateNote = useCallback((id: string, updates: Partial<Note>) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n));
  }, []);

  const deleteNote = useCallback((id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    if (activeNoteId === id) setActiveNoteId(null);
  }, [activeNoteId]);

  const togglePin = useCallback((id: string) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n));
  }, []);

  const filteredNotes = notes.filter(n =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.content.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  const activeNote = notes.find(n => n.id === activeNoteId);

  const colorInfo = COLORS.find(c => c.bg === activeNote?.color) || COLORS[0];

  return (
    <div className="w-full h-full flex flex-col" style={{ background: '#1E1E1E' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/5">
        <div className="flex items-center gap-2">
          <StickyNote size={16} className="text-yellow-400" />
          <span className="text-sm font-medium">便签</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="搜索..."
              className="pl-7 pr-2 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] outline-none focus:border-cyan-400/50 w-28"
            />
          </div>
          <button onClick={addNote} className="p-1.5 rounded-lg bg-yellow-400/20 text-yellow-400 hover:bg-yellow-400/30 transition-colors">
            <Plus size={14} />
          </button>
        </div>
      </div>

      <div className="flex-1 flex min-h-0">
        {/* Notes grid */}
        <div className={`${activeNote ? 'w-48' : 'flex-1'} overflow-y-auto p-2 ${activeNote ? 'border-r border-white/5' : ''} flex-shrink-0`}>
          <div className={`grid gap-2 ${activeNote ? 'grid-cols-1' : 'grid-cols-2 sm:grid-cols-3'} auto-rows-min`}>
            {filteredNotes.map(note => (
              <button
                key={note.id}
                onClick={() => setActiveNoteId(note.id)}
                className={`text-left p-2.5 rounded-xl transition-all hover:scale-[1.02] ${activeNoteId === note.id ? 'ring-2 ring-cyan-400' : ''}`}
                style={{ background: note.color }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold truncate" style={{ color: COLORS.find(c => c.bg === note.color)?.text }}>{note.title}</span>
                  {note.pinned && <span className="text-[8px]">📌</span>}
                </div>
                <div className="text-[9px] line-clamp-3" style={{ color: COLORS.find(c => c.bg === note.color)?.text, opacity: 0.8 }}>
                  {note.content || '(空)'}
                </div>
                <div className="text-[8px] mt-1 opacity-50" style={{ color: COLORS.find(c => c.bg === note.color)?.text }}>
                  {new Date(note.updatedAt).toLocaleDateString()}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Editor */}
        {activeNote && (
          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex items-center justify-between px-3 py-2 border-b border-white/5">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={activeNote.title}
                  onChange={e => updateNote(activeNote.id, { title: e.target.value })}
                  className="bg-transparent text-sm font-medium outline-none border-none"
                  style={{ color: colorInfo.text }}
                />
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => togglePin(activeNote.id)} className="p-1 rounded hover:bg-white/10 text-[10px]" title="置顶">
                  📌
                </button>
                <div className="flex gap-0.5">
                  {COLORS.map((c, i) => (
                    <button key={i} onClick={() => updateNote(activeNote.id, { color: c.bg })}
                      className={`w-3 h-3 rounded-full border ${activeNote.color === c.bg ? 'border-white' : 'border-transparent'}`}
                      style={{ background: c.bg }} />
                  ))}
                </div>
                <button onClick={() => deleteNote(activeNote.id)} className="p-1 rounded hover:bg-white/10">
                  <Trash2 size={12} className="text-red-400" />
                </button>
              </div>
            </div>
            <textarea
              value={activeNote.content}
              onChange={e => updateNote(activeNote.id, { content: e.target.value })}
              className="flex-1 w-full p-3 resize-none outline-none text-xs"
              style={{ background: activeNote.color, color: colorInfo.text }}
              placeholder="输入内容..."
            />
          </div>
        )}
      </div>
    </div>
  );
}
