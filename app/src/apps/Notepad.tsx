import { useState, useCallback, useEffect, useRef } from 'react';
import {
  Plus, Trash2, Save, FileText, Edit3, Download, Upload,
  Search, Bold, Italic, Strikethrough, Undo2, Redo2
} from 'lucide-react';

interface NoteFile {
  id: string;
  name: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  wordCount: number;
  charCount: number;
}

const STORAGE_KEY = 'notepad-files';

function loadFiles(): NoteFile[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  return [
    {
      id: 'welcome',
      name: '欢迎使用.txt',
      content: `# 欢迎使用 Arch 记事本

这是一个基于 Web 的文本编辑器，功能包括：

- 多标签页管理
- 自动保存到本地存储
- 导入/导出文本文件
- 字数统计
- 查找功能
- 撤销/重做

快捷键：
- Ctrl+N: 新建文件
- Ctrl+S: 保存文件
- Ctrl+Z: 撤销
- Ctrl+Y: 重做
- Ctrl+F: 查找
- Ctrl+O: 打开文件

开始编辑吧！`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      wordCount: 0,
      charCount: 0,
    },
  ];
}

function saveFiles(files: NoteFile[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
}

function genId() {
  return 'file-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);
}

function countStats(text: string) {
  const charCount = text.length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const lineCount = text ? text.split('\n').length : 0;
  return { charCount, wordCount, lineCount };
}

export default function Notepad() {
  const [files, setFiles] = useState<NoteFile[]>(loadFiles);
  const [activeFileId, setActiveFileId] = useState(files[0]?.id || '');
  const [showSidebar, setShowSidebar] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchReplace, setSearchReplace] = useState('');
  const [undoStack, setUndoStack] = useState<Map<string, string[]>>(new Map());
  const [redoStack, setRedoStack] = useState<Map<string, string[]>>(new Map());
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeFile = files.find(f => f.id === activeFileId);

  useEffect(() => {
    const interval = setInterval(() => {
      setFiles(prev => {
        saveFiles(prev);
        return prev;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'n') {
          e.preventDefault();
          handleNewFile();
        } else if (e.key === 's') {
          e.preventDefault();
          handleSave();
        } else if (e.key === 'f') {
          e.preventDefault();
          setShowSearch(v => !v);
        } else if (e.key === 'z') {
          e.preventDefault();
          handleUndo();
        } else if (e.key === 'y') {
          e.preventDefault();
          handleRedo();
        } else if (e.key === 'o') {
          e.preventDefault();
          fileInputRef.current?.click();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  },);

  const handleNewFile = useCallback(() => {
    const newFile: NoteFile = {
      id: genId(),
      name: `未命名 ${files.length + 1}.txt`,
      content: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      wordCount: 0,
      charCount: 0,
    };
    setFiles(prev => {
      const next = [...prev, newFile];
      saveFiles(next);
      return next;
    });
    setActiveFileId(newFile.id);
    setUndoStack(prev => {
      const next = new Map(prev);
      next.set(newFile.id, ['']);
      return next;
    });
  }, [files.length]);

  const handleDeleteFile = useCallback((id: string) => {
    setFiles(prev => {
      const next = prev.filter(f => f.id !== id);
      saveFiles(next);
      return next;
    });
    if (activeFileId === id) {
      setActiveFileId(files.find(f => f.id !== id)?.id || '');
    }
  }, [activeFileId, files]);

  const handleRenameFile = useCallback((id: string, newName: string) => {
    setFiles(prev => {
      const next = prev.map(f => f.id === id ? { ...f, name: newName, updatedAt: new Date().toISOString() } : f);
      saveFiles(next);
      return next;
    });
  }, []);

  const handleContentChange = useCallback((content: string) => {
    const stats = countStats(content);
    setFiles(prev => {
      const next = prev.map(f =>
        f.id === activeFileId
          ? { ...f, content, ...stats, updatedAt: new Date().toISOString() }
          : f
      );
      saveFiles(next);
      return next;
    });

    setUndoStack(prev => {
      const next = new Map(prev);
      const stack = next.get(activeFileId) || [''];
      if (stack[stack.length - 1] !== content) {
        const newStack = [...stack, content].slice(-50);
        next.set(activeFileId, newStack);
      }
      return next;
    });
  }, [activeFileId]);

  const handleUndo = useCallback(() => {
    const stack = undoStack.get(activeFileId) || [''];
    if (stack.length <= 1) return;

    const currentContent = stack[stack.length - 1];
    const previousContent = stack[stack.length - 2];
    const newStack = stack.slice(0, -1);

    setUndoStack(prev => {
      const next = new Map(prev);
      next.set(activeFileId, newStack);
      return next;
    });

    setRedoStack(prev => {
      const next = new Map(prev);
      const redo = next.get(activeFileId) || [];
      next.set(activeFileId, [...redo, currentContent].slice(-50));
      return next;
    });

    const stats = countStats(previousContent);
    setFiles(prev => {
      const next = prev.map(f =>
        f.id === activeFileId
          ? { ...f, content: previousContent, ...stats, updatedAt: new Date().toISOString() }
          : f
      );
      saveFiles(next);
      return next;
    });
  }, [activeFileId, undoStack]);

  const handleRedo = useCallback(() => {
    const redo = redoStack.get(activeFileId) || [];
    if (redo.length === 0) return;

    const nextContent = redo[redo.length - 1];
    const newRedo = redo.slice(0, -1);

    setRedoStack(prev => {
      const next = new Map(prev);
      next.set(activeFileId, newRedo);
      return next;
    });

    setUndoStack(prev => {
      const next = new Map(prev);
      const stack = next.get(activeFileId) || [''];
      next.set(activeFileId, [...stack, nextContent].slice(-50));
      return next;
    });

    const stats = countStats(nextContent);
    setFiles(prev => {
      const next = prev.map(f =>
        f.id === activeFileId
          ? { ...f, content: nextContent, ...stats, updatedAt: new Date().toISOString() }
          : f
      );
      saveFiles(next);
      return next;
    });
  }, [activeFileId, redoStack]);

  const handleSave = useCallback(() => {
    if (!activeFile) return;
    const blob = new Blob([activeFile.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeFile.name;
    a.click();
    URL.revokeObjectURL(url);
  }, [activeFile]);

  const handleImport = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string || '';
      const stats = countStats(content);
      const newFile: NoteFile = {
        id: genId(),
        name: file.name,
        content,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        wordCount: stats.wordCount,
        charCount: stats.charCount,
      };
      setFiles(prev => {
        const next = [...prev, newFile];
        saveFiles(next);
        return next;
      });
      setActiveFileId(newFile.id);
      setUndoStack(prev => {
        const next = new Map(prev);
        next.set(newFile.id, ['', content]);
        return next;
      });
    };
    reader.readAsText(file);
    e.target.value = '';
  }, []);

  const handleFindReplace = useCallback(() => {
    if (!activeFile || !searchQuery) return;
    const newContent = activeFile.content.replaceAll(searchQuery, searchReplace);
    handleContentChange(newContent);
  }, [activeFile, searchQuery, searchReplace, handleContentChange]);

  const insertAtCursor = useCallback((text: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const content = activeFile?.content || '';
    const newContent = content.slice(0, start) + text + content.slice(end);
    handleContentChange(newContent);
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + text.length;
      textarea.focus();
    }, 0);
  }, [activeFile, handleContentChange]);

  const stats = activeFile ? countStats(activeFile.content) : { charCount: 0, wordCount: 0, lineCount: 0 };

  return (
    <div className="w-full h-full flex flex-col" style={{ background: '#FAFAF8' }}>
      <input ref={fileInputRef} type="file" accept=".txt,.md,.js,.ts,.jsx,.tsx,.css,.html,.json,.py,.c,.cpp,.java,.rs,.go" className="hidden" onChange={handleImport} />

      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1 border-b border-gray-200 bg-white flex-shrink-0 overflow-x-auto">
        <button onClick={handleNewFile} className="p-1.5 rounded hover:bg-gray-100 transition-colors" title="新建 (Ctrl+N)">
          <Plus size={14} className="text-gray-600" />
        </button>
        <button onClick={handleSave} className="p-1.5 rounded hover:bg-gray-100 transition-colors" title="保存 (Ctrl+S)">
          <Save size={14} className="text-gray-600" />
        </button>
        <div className="w-px h-4 bg-gray-200 mx-1" />
        <button onClick={handleUndo} className="p-1.5 rounded hover:bg-gray-100 transition-colors" title="撤销 (Ctrl+Z)">
          <Undo2 size={14} className="text-gray-600" />
        </button>
        <button onClick={handleRedo} className="p-1.5 rounded hover:bg-gray-100 transition-colors" title="重做 (Ctrl+Y)">
          <Redo2 size={14} className="text-gray-600" />
        </button>
        <div className="w-px h-4 bg-gray-200 mx-1" />
        <button onClick={() => setShowSearch(v => !v)} className={`p-1.5 rounded transition-colors ${showSearch ? 'bg-blue-100' : 'hover:bg-gray-100'}`} title="查找 (Ctrl+F)">
          <Search size={14} className="text-gray-600" />
        </button>
        <div className="w-px h-4 bg-gray-200 mx-1" />
        <button onClick={() => insertAtCursor('**粗体**')} className="p-1.5 rounded hover:bg-gray-100 transition-colors" title="粗体">
          <Bold size={14} className="text-gray-600" />
        </button>
        <button onClick={() => insertAtCursor('*斜体*')} className="p-1.5 rounded hover:bg-gray-100 transition-colors" title="斜体">
          <Italic size={14} className="text-gray-600" />
        </button>
        <button onClick={() => insertAtCursor('~~删除线~~')} className="p-1.5 rounded hover:bg-gray-100 transition-colors" title="删除线">
          <Strikethrough size={14} className="text-gray-600" />
        </button>
        <div className="w-px h-4 bg-gray-200 mx-1" />
        <button onClick={() => fileInputRef.current?.click()} className="p-1.5 rounded hover:bg-gray-100 transition-colors" title="打开文件 (Ctrl+O)">
          <Upload size={14} className="text-gray-600" />
        </button>
        <button onClick={handleSave} className="p-1.5 rounded hover:bg-gray-100 transition-colors" title="下载">
          <Download size={14} className="text-gray-600" />
        </button>
        <div className="w-px h-4 bg-gray-200 mx-1" />
        <button onClick={() => setShowSidebar(v => !v)} className={`p-1.5 rounded transition-colors ${showSidebar ? 'bg-blue-100' : 'hover:bg-gray-100'}`} title="文件列表">
          <FileText size={14} className="text-gray-600" />
        </button>
      </div>

      {/* Search bar */}
      {showSearch && (
        <div className="flex items-center gap-2 px-3 py-1.5 border-b border-gray-200 bg-gray-50 flex-shrink-0">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="查找..."
            className="flex-1 bg-white border border-gray-200 rounded px-2 py-1 text-xs outline-none focus:border-blue-400"
          />
          <input
            type="text"
            value={searchReplace}
            onChange={e => setSearchReplace(e.target.value)}
            placeholder="替换为..."
            className="flex-1 bg-white border border-gray-200 rounded px-2 py-1 text-xs outline-none focus:border-blue-400"
          />
          <button onClick={handleFindReplace} className="px-2 py-1 rounded bg-blue-500 text-white text-xs hover:bg-blue-600 transition-colors">
            替换
          </button>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex min-h-0">
        {showSidebar && (
          <div className="w-48 border-r border-gray-200 bg-gray-50 flex flex-col flex-shrink-0">
            <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200">
              <span className="text-xs font-medium text-gray-500">文件列表</span>
              <button onClick={handleNewFile} className="p-0.5 rounded hover:bg-gray-200 transition-colors">
                <Plus size={12} className="text-gray-400" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {files.map(file => (
                <div
                  key={file.id}
                  className={`flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors group ${
                    activeFileId === file.id ? 'bg-blue-50 border-r-2 border-blue-400' : 'hover:bg-gray-100'
                  }`}
                  onClick={() => setActiveFileId(file.id)}
                >
                  <FileText size={14} className="text-gray-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      value={file.name}
                      onChange={e => handleRenameFile(file.id, e.target.value)}
                      onClick={e => e.stopPropagation()}
                      className={`w-full bg-transparent text-xs outline-none ${
                        activeFileId === file.id ? 'text-blue-600 font-medium' : 'text-gray-700'
                      }`}
                    />
                    <div className="text-[10px] text-gray-400">
                      {countStats(file.content).wordCount} 词 · {new Date(file.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); handleDeleteFile(file.id); }}
                    className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-red-100 transition-all"
                  >
                    <Trash2 size={10} className="text-red-400" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Editor */}
        <div className="flex-1 flex flex-col min-w-0">
          {activeFile ? (
            <>
              <textarea
                ref={textareaRef}
                value={activeFile.content}
                onChange={e => handleContentChange(e.target.value)}
                className="flex-1 w-full p-4 text-sm leading-relaxed resize-none outline-none bg-transparent font-mono"
                style={{ color: '#1F2937', tabSize: 2 }}
                spellCheck={false}
                placeholder="开始输入..."
              />
              <div className="flex items-center justify-between px-3 py-1 border-t border-gray-200 bg-gray-50 text-[10px] text-gray-400 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <span>{stats.wordCount} 词</span>
                  <span>{stats.charCount} 字符</span>
                  <span>{stats.lineCount} 行</span>
                </div>
                <div className="flex items-center gap-3">
                  <span>UTF-8</span>
                  <span>自动保存</span>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
              <div className="text-center">
                <Edit3 size={32} className="mx-auto mb-2 opacity-30" />
                <div>点击"新建"创建文件</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
