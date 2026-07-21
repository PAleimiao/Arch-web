import { } from 'react';
import { Server, Folder, FileText, Upload, Download, Trash2 } from 'lucide-react';

interface FTPFile {
  name: string;
  type: 'folder' | 'file';
  size: string;
  date: string;
}

const LOCAL_FILES: FTPFile[] = [
  { name: 'Documents', type: 'folder', size: '--', date: '2026-07-01' },
  { name: 'Downloads', type: 'folder', size: '--', date: '2026-06-28' },
  { name: 'script.sh', type: 'file', size: '2.4KB', date: '2026-06-15' },
  { name: 'README.md', type: 'file', size: '4.5KB', date: '2026-06-10' },
];

const REMOTE_FILES: FTPFile[] = [
  { name: 'public_html', type: 'folder', size: '--', date: '2026-07-01' },
  { name: 'cgi-bin', type: 'folder', size: '--', date: '2026-06-28' },
  { name: 'index.html', type: 'file', size: '12KB', date: '2026-07-01' },
  { name: 'style.css', type: 'file', size: '8KB', date: '2026-06-30' },
  { name: 'script.js', type: 'file', size: '23KB', date: '2026-06-29' },
];

export default function FTPClient() {
  return (
    <div className="w-full h-full flex flex-col" style={{ background: 'rgba(0, 18, 51, 0.95)' }}>
      <div className="flex items-center gap-4 px-4 py-2 border-b border-white/5">
        <Server size={18} className="text-red-400" />
        <span className="font-bold">FileZilla</span>
        <span className="text-xs text-muted-foreground">ftp.arch-server.local:21</span>
        <span className="text-xs text-green-400 ml-auto">已连接</span>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Local */}
        <div className="flex-1 border-r border-white/5 flex flex-col">
          <div className="px-3 py-1.5 border-b border-white/5 text-xs text-muted-foreground flex items-center gap-1">
            <Folder size={12} /> 本地站点: /home/user
          </div>
          <div className="flex-1 overflow-y-auto">
            {LOCAL_FILES.map(f => (
              <div key={f.name} className="flex items-center gap-2 px-3 py-1.5 hover:bg-white/5 text-xs">
                {f.type === 'folder' ? <Folder size={12} className="text-yellow-400" /> : <FileText size={12} className="text-blue-400" />}
                <span className="flex-1">{f.name}</span>
                <span className="text-muted-foreground w-16 text-right">{f.size}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Transfer Buttons */}
        <div className="w-10 flex flex-col items-center justify-center gap-2 border-r border-white/5">
          <button className="p-1 rounded hover:bg-white/10"><Upload size={14} className="text-cyan-400" /></button>
          <button className="p-1 rounded hover:bg-white/10"><Download size={14} className="text-green-400" /></button>
          <button className="p-1 rounded hover:bg-white/10"><Trash2 size={14} className="text-red-400" /></button>
        </div>

        {/* Remote */}
        <div className="flex-1 flex flex-col">
          <div className="px-3 py-1.5 border-b border-white/5 text-xs text-muted-foreground flex items-center gap-1">
            <Server size={12} /> 远程站点: /var/www
          </div>
          <div className="flex-1 overflow-y-auto">
            {REMOTE_FILES.map(f => (
              <div key={f.name} className="flex items-center gap-2 px-3 py-1.5 hover:bg-white/5 text-xs">
                {f.type === 'folder' ? <Folder size={12} className="text-yellow-400" /> : <FileText size={12} className="text-blue-400" />}
                <span className="flex-1">{f.name}</span>
                <span className="text-muted-foreground w-16 text-right">{f.size}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
