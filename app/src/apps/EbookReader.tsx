import { useState } from 'react';
import { ChevronLeft, ChevronRight, List, Moon } from 'lucide-react';

const CHAPTERS = [
  '第一章：Arch Linux 简介',
  '第二章：安装前准备',
  '第三章：分区与格式化',
  '第四章：基础系统安装',
  '第五章：配置引导加载器',
  '第六章：网络配置',
  '第七章：桌面环境',
  '第八章：常用软件',
  '第九章：系统维护',
  '第十章：故障排除',
];

const CONTENT = `Arch Linux 是一款独立开发的 x86-64 通用 GNU/Linux 发行版，由加拿大程序员 Judd Vinet 于 2002 年创建。

它致力于提供最新稳定的软件版本，采用滚动更新模式。Arch Linux 以其简洁、现代、实用、以用户为中心的设计理念而闻名。

安装 Arch Linux 需要手动配置每一步，这虽然对新手有一定门槛，但也让用户能够完全掌控自己的系统。

本指南将带领你完成从空白硬盘到完整桌面环境的全部过程。`;

export default function EbookReader() {
  const [chapter, setChapter] = useState(0);
  const [showToc, setShowToc] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [fontSize, setFontSize] = useState(16);

  return (
    <div className="w-full h-full flex" style={{ background: darkMode ? 'rgba(0, 18, 51, 0.95)' : '#F5F0E8' }}>
      {/* TOC */}
      {showToc && (
        <div className="w-56 border-r border-white/5 p-3 overflow-y-auto">
          <div className="text-xs text-muted-foreground mb-2">目录</div>
          {CHAPTERS.map((c, i) => (
            <button key={i} onClick={() => { setChapter(i); setShowToc(false); }}
              className="w-full text-left px-2 py-1.5 rounded text-sm hover:bg-white/5 transition-colors"
              style={{ color: i === chapter ? '#00B4D8' : darkMode ? '#979DAC' : '#555' }}>
              {c}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between px-4 py-2 border-b border-white/5">
          <div className="flex items-center gap-2">
            <button onClick={() => setShowToc(!showToc)} className="p-1.5 rounded hover:bg-white/10"><List size={14} /></button>
            <span className="text-sm font-medium">{CHAPTERS[chapter]}</span>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setFontSize(s => Math.max(12, s - 1))} className="p-1.5 rounded hover:bg-white/10 text-xs">A-</button>
            <button onClick={() => setFontSize(s => Math.min(24, s + 1))} className="p-1.5 rounded hover:bg-white/10 text-xs">A+</button>
            <button onClick={() => setDarkMode(!darkMode)} className="p-1.5 rounded hover:bg-white/10"><Moon size={14} /></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6" style={{ color: darkMode ? '#EEF4ED' : '#333' }}>
          <div style={{ fontSize, lineHeight: 1.8, maxWidth: '600px', margin: '0 auto' }}>
            <h1 className="text-2xl font-bold mb-6">{CHAPTERS[chapter]}</h1>
            <div className="whitespace-pre-wrap">{CONTENT}</div>
          </div>
        </div>

        <div className="flex items-center justify-between px-4 py-2 border-t border-white/5">
          <button onClick={() => setChapter(c => Math.max(0, c - 1))} disabled={chapter === 0} className="flex items-center gap-1 text-sm disabled:opacity-30">
            <ChevronLeft size={14} /> 上一章
          </button>
          <span className="text-xs text-muted-foreground">{chapter + 1} / {CHAPTERS.length}</span>
          <button onClick={() => setChapter(c => Math.min(CHAPTERS.length - 1, c + 1))} disabled={chapter === CHAPTERS.length - 1} className="flex items-center gap-1 text-sm disabled:opacity-30">
            下一章 <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
