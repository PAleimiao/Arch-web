import { useState } from 'react';
import { FileText, Search, ZoomIn, ZoomOut } from 'lucide-react';

const PAGES = [
  { title: 'Arch Linux 安装指南 - 第1页', content: 'Arch Linux 安装指南\n\n1. 概述\n\nArch Linux 是一款轻量级、灵活的 Linux 发行版，遵循 KISS 原则（Keep It Simple, Stupid）。\n\n2. 系统要求\n\n- x86_64 处理器\n- 512MB RAM（推荐 1GB+）\n- 2GB 可用磁盘空间\n- 网络连接' },
  { title: 'Arch Linux 安装指南 - 第2页', content: '3. 准备安装介质\n\n下载 ISO 镜像后，使用以下命令创建启动盘：\n\ndd if=archlinux.iso of=/dev/sdX bs=4M status=progress\n\n4. 启动到 Live 环境\n\n从 USB 启动后，选择 \"Arch Linux install medium\" 进入 Live 环境。' },
];

export default function DocumentViewer() {
  const [page, setPage] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [search, setSearch] = useState('');

  return (
    <div className="w-full h-full flex flex-col" style={{ background: '#2D2D2D' }}>
      <div className="flex items-center gap-3 px-4 py-2 border-b border-white/5">
        <FileText size={16} className="text-orange-400" />
        <span className="text-sm">安装指南.pdf</span>
        <div className="flex-1" />
        <div className="flex items-center gap-1 glass-panel rounded-lg px-2 py-1">
          <Search size={12} className="text-muted-foreground" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索..." className="bg-transparent outline-none text-xs w-24" />
        </div>
        <button onClick={() => setZoom(z => Math.max(50, z - 10))} className="p-1 rounded hover:bg-white/10"><ZoomOut size={14} /></button>
        <span className="text-xs w-10 text-center">{zoom}%</span>
        <button onClick={() => setZoom(z => Math.min(200, z + 10))} className="p-1 rounded hover:bg-white/10"><ZoomIn size={14} /></button>
      </div>

      <div className="flex-1 flex">
        {/* Sidebar */}
        <div className="w-48 border-r border-white/5 p-2 overflow-y-auto">
          {PAGES.map((p, i) => (
            <button key={i} onClick={() => setPage(i)}
              className="w-full text-left px-2 py-1.5 rounded text-xs hover:bg-white/5 transition-colors"
              style={{ background: i === page ? 'rgba(0, 180, 216, 0.1)' : 'transparent' }}>
              {p.title}
            </button>
          ))}
        </div>

        {/* Page */}
        <div className="flex-1 overflow-y-auto p-6 flex justify-center">
          <div className="bg-white text-black p-8 rounded shadow-lg max-w-2xl w-full" style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center', minHeight: '800px' }}>
            <pre className="whitespace-pre-wrap text-sm leading-relaxed" style={{ fontFamily: '"Noto Sans SC", sans-serif' }}>
              {PAGES[page].content}
            </pre>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between px-4 py-1.5 border-t border-white/5 text-xs text-muted-foreground">
        <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="disabled:opacity-30">上一页</button>
        <span>{page + 1} / {PAGES.length}</span>
        <button onClick={() => setPage(p => Math.min(PAGES.length - 1, p + 1))} disabled={page === PAGES.length - 1} className="disabled:opacity-30">下一页</button>
      </div>
    </div>
  );
}
