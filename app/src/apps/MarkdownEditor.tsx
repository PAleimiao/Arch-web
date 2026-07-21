import { useState, useCallback, useEffect } from 'react';
import { Eye, Edit3, Download, Copy, Check, FileText, Trash2 } from 'lucide-react';

const STORAGE_KEY = 'markdown-files';

interface MDFile {
  id: string;
  name: string;
  content: string;
}

function loadFiles(): MDFile[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  return [
    {
      id: 'welcome',
      name: '欢迎使用.md',
      content: `# 欢迎使用 Markdown 编辑器

这是一个支持实时预览的 **Markdown** 编辑器。

## 功能特性

- 实时预览
- 语法高亮
- 本地存储
- 导出 HTML

## 示例

### 代码块

\`\`\`javascript
const hello = () => {
    console.log("Hello, World!");
};
\`\`\`

### 表格

| 功能 | 状态 |
|------|------|
| 实时预览 | 支持 |
| 导出 | 支持 |

### 列表

1. 第一项
2. 第二项
3. 第三项

- 无序列表
- 另一个项

> 引用文本：这是一段引用

---

**加粗** *斜体* ~~删除线~~ \`行内代码\`

[链接示例](https://archlinux.org)
`,
    },
  ];
}

function saveFiles(files: MDFile[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
}

// Simple markdown to HTML converter
function mdToHtml(md: string): string {
  return md
    // Code blocks
    .replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => `<pre style="background:#2D2D2D;padding:12px;border-radius:6px;overflow-x:auto;margin:8px 0"><code style="font-size:11px">${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`)
    // Headers
    .replace(/^### (.*$)/gim, '<h3 style="font-size:14px;font-weight:bold;margin:12px 0 6px;color:#00B4D8">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 style="font-size:16px;font-weight:bold;margin:14px 0 8px;color:#00B4D8;border-bottom:1px solid rgba(255,255,255,0.1);padding-bottom:4px">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 style="font-size:20px;font-weight:bold;margin:16px 0 10px;color:#00B4D8;border-bottom:2px solid rgba(0,180,216,0.3);padding-bottom:6px">$1</h1>')
    // Bold & Italic
    .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#fff">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/~~(.*?)~~/g, '<del style="opacity:0.5">$1</del>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code style="background:rgba(255,255,255,0.1);padding:1px 4px;border-radius:3px;font-size:11px;color:#CE9178">$1</code>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" style="color:#00B4D8;text-decoration:underline">$1</a>')
    // Images
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width:100%;border-radius:4px;margin:8px 0" />')
    // Blockquote
    .replace(/^> (.*$)/gim, '<blockquote style="border-left:3px solid #00B4D8;padding-left:12px;margin:8px 0;color:#979DAC">$1</blockquote>')
    // Horizontal rule
    .replace(/^---$/gm, '<hr style="border:none;border-top:1px solid rgba(255,255,255,0.1);margin:12px 0" />')
    // Tables
    .replace(/\|(.+)\|\n\|[\s|:-]+\|\n((?:\|.+\|\n)+)/g, (_, header, rows) => {
      const ths = header.split('|').filter((c: string) => c.trim()).map((c: string) => `<th style="padding:4px 8px;border-bottom:2px solid rgba(255,255,255,0.2);text-align:left;font-size:11px">${c.trim()}</th>`).join('');
      const trs = rows.trim().split('\n').map((row: string) => {
        const tds = row.split('|').filter((c: string) => c.trim()).map((c: string) => `<td style="padding:4px 8px;border-bottom:1px solid rgba(255,255,255,0.05);font-size:11px">${c.trim()}</td>`).join('');
        return `<tr>${tds}</tr>`;
      }).join('');
      return `<table style="width:100%;border-collapse:collapse;margin:8px 0"><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table>`;
    })
    // Lists
    .replace(/^\d+\.\s+(.*$)/gim, '<li style="margin:2px 0;font-size:12px;list-style-type:decimal;margin-left:20px">$1</li>')
    .replace(/^[-*]\s+(.*$)/gim, '<li style="margin:2px 0;font-size:12px;list-style-type:disc;margin-left:20px">$1</li>')
    // Paragraphs (must be last)
    .replace(/^(?!<[a-z]|<li|<\/li|<block|<\/block|<hr|<pre|<table|<\/table)(.+)$/gim, '<p style="margin:4px 0;font-size:12px;line-height:1.6">$1</p>');
}

export default function MarkdownEditor() {
  const [files, setFiles] = useState<MDFile[]>(loadFiles);
  const [activeFileId, setActiveFileId] = useState('welcome');
  const [mode, setMode] = useState<'edit' | 'preview' | 'split'>('split');
  const [copied, setCopied] = useState(false);

  const activeFile = files.find(f => f.id === activeFileId) || files[0];

  useEffect(() => { saveFiles(files); }, [files]);

  const handleContentChange = useCallback((content: string) => {
    setFiles(prev => prev.map(f => f.id === activeFileId ? { ...f, content } : f));
  }, [activeFileId]);

  const addFile = useCallback(() => {
    const name = prompt('文件名:', '未命名.md');
    if (!name) return;
    const newFile: MDFile = { id: Date.now().toString(), name, content: '# 新文档\n\n开始写作...' };
    setFiles(prev => [...prev, newFile]);
    setActiveFileId(newFile.id);
  }, []);

  const deleteFile = useCallback((id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    if (activeFileId === id) setActiveFileId(files[0]?.id || '');
  }, [activeFileId, files]);

  const exportHtml = useCallback(() => {
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${activeFile.name}</title><style>body{font-family:sans-serif;max-width:800px;margin:40px auto;padding:20px;background:#1a1a2e;color:#e0e0e0}</style></head><body>${mdToHtml(activeFile.content)}</body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeFile.name.replace('.md', '.html');
    a.click();
    URL.revokeObjectURL(url);
  }, [activeFile]);

  const copyHtml = useCallback(() => {
    navigator.clipboard.writeText(mdToHtml(activeFile.content)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [activeFile]);

  const previewHtml = mdToHtml(activeFile.content);

  return (
    <div className="w-full h-full flex flex-col" style={{ background: '#1E1E1E' }}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-2 py-1 border-b border-white/5 bg-[#252526]">
        <div className="flex items-center gap-1">
          <button onClick={addFile} className="p-1.5 rounded hover:bg-white/10" title="新建"><FileText size={14} /></button>
          <div className="w-px h-4 bg-white/10 mx-1" />
          <button onClick={() => setMode('edit')} className={`p-1.5 rounded ${mode === 'edit' ? 'bg-white/10 text-cyan-400' : 'hover:bg-white/10'}`} title="编辑"><Edit3 size={14} /></button>
          <button onClick={() => setMode('preview')} className={`p-1.5 rounded ${mode === 'preview' ? 'bg-white/10 text-cyan-400' : 'hover:bg-white/10'}`} title="预览"><Eye size={14} /></button>
          <button onClick={() => setMode('split')} className={`p-1.5 rounded ${mode === 'split' ? 'bg-white/10 text-cyan-400' : 'hover:bg-white/10'}`} title="分屏">编辑/预览</button>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={copyHtml} className="p-1.5 rounded hover:bg-white/10" title="复制 HTML">{copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}</button>
          <button onClick={exportHtml} className="p-1.5 rounded hover:bg-white/10" title="导出 HTML"><Download size={14} /></button>
        </div>
      </div>

      <div className="flex-1 flex min-h-0">
        {/* File list */}
        <div className="w-32 border-r border-white/5 bg-[#252526] overflow-y-auto flex-shrink-0">
          {files.map(f => (
            <div key={f.id} onClick={() => setActiveFileId(f.id)}
              className={`flex items-center justify-between px-2 py-1.5 cursor-pointer group ${activeFileId === f.id ? 'bg-white/10 border-r-2 border-cyan-400' : 'hover:bg-white/5'}`}>
              <span className="text-[10px] truncate flex-1">{f.name}</span>
              <button onClick={(e) => { e.stopPropagation(); deleteFile(f.id); }}
                className="opacity-0 group-hover:opacity-100 p-0.5"><Trash2 size={8} className="text-red-400" /></button>
            </div>
          ))}
        </div>

        {/* Editor */}
        {(mode === 'edit' || mode === 'split') && (
          <div className={`${mode === 'split' ? 'flex-1' : 'flex-1'} flex flex-col min-w-0`}>
            <div className="px-2 py-0.5 bg-[#1E1E1E] text-[10px] text-muted-foreground border-b border-white/5">编辑</div>
            <textarea
              value={activeFile.content}
              onChange={e => handleContentChange(e.target.value)}
              className="flex-1 w-full p-3 bg-[#1E1E1E] text-xs font-mono resize-none outline-none text-gray-300"
              spellCheck={false}
              style={{ tabSize: 2 }}
            />
          </div>
        )}

        {/* Preview */}
        {(mode === 'preview' || mode === 'split') && (
          <div className={`${mode === 'split' ? 'flex-1' : 'flex-1'} flex flex-col min-w-0 border-l border-white/5`}>
            <div className="px-2 py-0.5 bg-[#1E1E1E] text-[10px] text-muted-foreground border-b border-white/5">预览</div>
            <div className="flex-1 overflow-auto p-3" dangerouslySetInnerHTML={{ __html: previewHtml }} />
          </div>
        )}
      </div>
    </div>
  );
}
