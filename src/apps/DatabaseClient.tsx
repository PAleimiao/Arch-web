import { useState } from 'react';
import { Database, Table, Play } from 'lucide-react';

const TABLES = ['users', 'posts', 'comments', 'categories', 'tags'];
const SAMPLE_DATA = [
  { id: 1, username: 'arch_user', email: 'user@archlinux.org', created: '2026-01-15', role: 'admin' },
  { id: 2, username: 'hypr_fan', email: 'hypr@example.com', created: '2026-02-20', role: 'user' },
  { id: 3, username: 'neovimer', email: 'nvim@example.com', created: '2026-03-10', role: 'user' },
  { id: 4, username: 'wayland_dev', email: 'wl@example.com', created: '2026-04-05', role: 'moderator' },
  { id: 5, username: 'pacman_user', email: 'pac@example.com', created: '2026-05-01', role: 'user' },
];

export default function DatabaseClient() {
  const [activeTable, setActiveTable] = useState('users');
  const [query, setQuery] = useState('SELECT * FROM users LIMIT 10;');
  const [results, setResults] = useState(SAMPLE_DATA);

  const runQuery = () => {
    if (query.toLowerCase().includes('select')) {
      setResults(SAMPLE_DATA);
    } else {
      setResults([]);
    }
  };

  return (
    <div className="w-full h-full flex flex-col" style={{ background: 'rgba(0, 18, 51, 0.95)' }}>
      <div className="flex items-center gap-4 px-4 py-2 border-b border-white/5">
        <Database size={18} className="text-purple-400" />
        <span className="font-bold">DBeaver</span>
        <span className="text-xs text-muted-foreground">localhost:3306/arch_db</span>
      </div>
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-40 border-r border-white/5 p-2">
          <div className="text-xs text-muted-foreground mb-2 px-2">表</div>
          {TABLES.map(t => (
            <button key={t} onClick={() => setActiveTable(t)}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm hover:bg-white/5 transition-colors text-left"
              style={{ background: t === activeTable ? 'rgba(0, 180, 216, 0.1)' : 'transparent' }}>
              <Table size={12} /> {t}
            </button>
          ))}
        </div>
        {/* Main */}
        <div className="flex-1 flex flex-col">
          <div className="p-2 border-b border-white/5">
            <div className="flex gap-2">
              <input value={query} onChange={e => setQuery(e.target.value)} className="flex-1 glass-panel rounded-lg px-3 py-1.5 text-sm font-mono outline-none" />
              <button onClick={runQuery} className="p-1.5 rounded bg-green-500/20 text-green-400 hover:bg-green-500/30"><Play size={14} /></button>
            </div>
          </div>
          <div className="flex-1 overflow-auto p-2">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/5">
                  {Object.keys(results[0] || {}).map(k => <th key={k} className="text-left px-2 py-1.5 text-muted-foreground font-medium">{k}</th>)}
                </tr>
              </thead>
              <tbody>
                {results.map((row, i) => (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                    {Object.values(row).map((v, j) => <td key={j} className="px-2 py-1.5">{String(v)}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-3 py-1.5 border-t border-white/5 text-xs text-muted-foreground">
            {results.length} 行 · MySQL 8.0
          </div>
        </div>
      </div>
    </div>
  );
}
