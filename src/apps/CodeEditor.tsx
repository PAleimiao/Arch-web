import { useState, useCallback, useRef, useEffect } from 'react';
import { Play, Save, FileCode, Plus, Trash2, Copy, Check, Settings } from 'lucide-react';

interface EditorFile {
  id: string;
  name: string;
  content: string;
  language: string;
}

const DEFAULT_FILES: EditorFile[] = [
  {
    id: '1',
    name: 'hello.py',
    language: 'python',
    content: '#!/usr/bin/env python3\n# Hello World in Python\n\ndef main():\n    name = input("Enter your name: ")\n    print(f"Hello, {name}!")\n\nif __name__ == "__main__":\n    main()',
  },
  {
    id: '2',
    name: 'index.html',
    language: 'html',
    content: '<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <title>Hello World</title>\n</head>\n<body>\n    <h1>Hello, World!</h1>\n    <p>Welcome to my website.</p>\n</body>\n</html>',
  },
  {
    id: '3',
    name: 'app.js',
    language: 'javascript',
    content: '// Hello World in JavaScript\nconst greeting = "Hello, World!";\nconsole.log(greeting);\n\n// Function example\nfunction add(a, b) {\n    return a + b;\n}\n\nconsole.log(add(2, 3));',
  },
  {
    id: '4',
    name: 'style.css',
    language: 'css',
    content: '/* Basic styles */\nbody {\n    font-family: Arial, sans-serif;\n    margin: 0;\n    padding: 20px;\n    background: #f5f5f5;\n}\n\nh1 {\n    color: #333;\n    text-align: center;\n}',
  },
];

const LANG_COLORS: Record<string, string> = {
  python: '#3B82F6',
  javascript: '#F59E0B',
  typescript: '#3B82F6',
  html: '#EF4444',
  css: '#3B82F6',
  json: '#10B981',
  markdown: '#8B5CF6',
};

function getLangFromFilename(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase() || '';
  const map: Record<string, string> = {
    py: 'python', js: 'javascript', ts: 'typescript', tsx: 'typescript',
    html: 'html', htm: 'html', css: 'css', json: 'json', md: 'markdown',
    c: 'c', cpp: 'cpp', java: 'java', go: 'go', rs: 'rust',
  };
  return map[ext] || 'text';
}

function highlightCode(code: string, lang: string): string {
  // Simple syntax highlighting with regex replacements
  let html = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  if (lang === 'python') {
    html = html
      .replace(/(#.*$)/gm, '<span style="color:#6A9955">$1</span>')
      .replace(/\b(def|class|import|from|if|else|elif|for|while|return|try|except|with|as|pass|break|continue|lambda|yield|raise|finally|del|global|nonlocal|assert|print|input|True|False|None|and|or|not|in|is)\b/g, '<span style="color:#569CD6">$1</span>')
      .replace(/\b(\d+)\b/g, '<span style="color:#B5CEA8">$1</span>')
      .replace(/(".*?"|'.*?')/g, '<span style="color:#CE9178">$1</span>');
  } else if (lang === 'javascript' || lang === 'typescript') {
    html = html
      .replace(/(\/\/.*$)/gm, '<span style="color:#6A9955">$1</span>')
      .replace(/\b(const|let|var|function|return|if|else|for|while|class|import|export|from|default|async|await|new|this|try|catch|throw|typeof|instanceof|true|false|null|undefined)\b/g, '<span style="color:#569CD6">$1</span>')
      .replace(/\b(\d+)\b/g, '<span style="color:#B5CEA8">$1</span>')
      .replace(/(".*?"|'.*?'|`.*?`)/g, '<span style="color:#CE9178">$1</span>');
  } else if (lang === 'html') {
    html = html
      .replace(/(&lt;!--.*?--&gt;)/g, '<span style="color:#6A9955">$1</span>')
      .replace(/(&lt;\/?)([\w-]+)/g, '$1<span style="color:#569CD6">$2</span>')
      .replace(/(\s)([\w-]+)(=)/g, '$1<span style="color:#9CDCFE">$2</span>$3')
      .replace(/(".*?")/g, '<span style="color:#CE9178">$1</span>');
  } else if (lang === 'css') {
    html = html
      .replace(/(\/\*.*?\*\/)/gs, '<span style="color:#6A9955">$1</span>')
      .replace(/([\w-]+)\s*\{/g, '<span style="color:#DCDCAA">$1</span> {')
      .replace(/\b(color|background|font|margin|padding|border|display|width|height|position|top|left|right|bottom|flex|grid|align|justify|text|overflow|cursor|opacity|transform|transition|animation|z-index)\b/g, '<span style="color:#9CDCFE">$1</span>')
      .replace(/(:\s*)([^;{}]+)/g, '$1<span style="color:#CE9178">$2</span>');
  } else if (lang === 'json') {
    html = html
      .replace(/(".*?")(\s*:)/g, '<span style="color:#9CDCFE">$1</span>$2')
      .replace(/: (".*?")/g, ': <span style="color:#CE9178">$1</span>')
      .replace(/\b(true|false|null)\b/g, '<span style="color:#569CD6">$1</span>')
      .replace(/\b(\d+)\b/g, '<span style="color:#B5CEA8">$1</span>');
  }

  return html;
}

export default function CodeEditor() {
  const [files, setFiles] = useState<EditorFile[]>(DEFAULT_FILES);
  const [activeFileId, setActiveFileId] = useState('1');
  const [showOutput, setShowOutput] = useState(false);
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);

  const activeFile = files.find(f => f.id === activeFileId) || files[0];

  const handleContentChange = useCallback((content: string) => {
    setFiles(prev => prev.map(f => f.id === activeFileId ? { ...f, content } : f));
  }, [activeFileId]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = activeFile.content.substring(0, start) + '    ' + activeFile.content.substring(end);
      handleContentChange(newContent);
      setTimeout(() => { textarea.selectionStart = textarea.selectionEnd = start + 4; }, 0);
    }
  }, [activeFile, handleContentChange]);

  const runCode = useCallback(() => {
    setShowOutput(true);
    const lang = activeFile.language;
    if (lang === 'javascript') {
      const logs: string[] = [];
      const mockConsole = { log: (...args: any[]) => logs.push(args.join(' ')), error: (...args: any[]) => logs.push('Error: ' + args.join(' ')) };
      try {
        const fn = new Function('console', activeFile.content);
        fn(mockConsole);
        setOutput(logs.join('\n') || '(程序执行完成，无输出)');
      } catch (e: any) {
        setOutput(`Error: ${e.message}`);
      }
    } else if (lang === 'python') {
      setOutput(`Python 3.12.3\n>>> (代码已提交到解释器)\n\n${activeFile.content.split('\n').map((l, i) => `    ${l}`).join('\n')}\n\n(注意：浏览器中无法直接执行 Python 代码)`);
    } else if (lang === 'html') {
      setOutput('HTML 代码预览:\n\n(请在浏览器中打开 HTML 文件以查看效果)');
    } else {
      setOutput(`${lang.toUpperCase()} 代码:\n\n(当前仅支持 JavaScript 直接运行)`);
    }
  }, [activeFile]);

  const copyCode = useCallback(() => {
    navigator.clipboard.writeText(activeFile.content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [activeFile]);

  const addFile = useCallback(() => {
    const name = prompt('文件名:', 'untitled.js');
    if (!name) return;
    const newFile: EditorFile = { id: Date.now().toString(), name, content: '', language: getLangFromFilename(name) };
    setFiles(prev => [...prev, newFile]);
    setActiveFileId(newFile.id);
  }, []);

  const deleteFile = useCallback((id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    if (activeFileId === id) setActiveFileId(files[0]?.id || '');
  }, [activeFileId, files]);

  // Sync scroll between textarea and pre
  useEffect(() => {
    const textarea = textareaRef.current;
    const pre = preRef.current;
    if (!textarea || !pre) return;
    const handleScroll = () => { pre.scrollTop = textarea.scrollTop; pre.scrollLeft = textarea.scrollLeft; };
    textarea.addEventListener('scroll', handleScroll);
    return () => textarea.removeEventListener('scroll', handleScroll);
  }, [activeFileId]);

  const highlightedCode = highlightCode(activeFile.content, activeFile.language);

  return (
    <div className="w-full h-full flex flex-col" style={{ background: '#1E1E1E' }}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-2 py-1 border-b border-white/5 bg-[#252526]">
        <button onClick={addFile} className="p-1.5 rounded hover:bg-white/10 transition-colors" title="新建文件"><Plus size={14} /></button>
        <button onClick={runCode} className="p-1.5 rounded hover:bg-white/10 transition-colors text-green-400" title="运行"><Play size={14} /></button>
        <button onClick={copyCode} className="p-1.5 rounded hover:bg-white/10 transition-colors" title="复制">{copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}</button>
        <button onClick={() => setShowOutput(!showOutput)} className={`p-1.5 rounded hover:bg-white/10 transition-colors ${showOutput ? 'text-cyan-400' : ''}`} title="输出"><FileCode size={14} /></button>
        <div className="w-px h-4 bg-white/10 mx-1" />
        <span className="text-[10px] text-muted-foreground font-mono">{activeFile.language.toUpperCase()}</span>
      </div>

      <div className="flex-1 flex min-h-0">
        {/* File tabs */}
        <div className="w-10 border-r border-white/5 bg-[#252526] flex flex-col items-center py-1 overflow-y-auto flex-shrink-0">
          {files.map(f => (
            <button key={f.id} onClick={() => setActiveFileId(f.id)}
              className={`w-full py-1.5 flex items-center justify-center transition-colors group relative ${activeFileId === f.id ? 'bg-white/10' : 'hover:bg-white/5'}`}
              title={f.name}>
              <div className="w-2 h-2 rounded-full" style={{ background: LANG_COLORS[f.language] || '#666' }} />
              {activeFileId === f.id && (
                <button onClick={(e) => { e.stopPropagation(); deleteFile(f.id); }}
                  className="absolute top-0 right-0 p-0.5 opacity-0 group-hover:opacity-100">
                  <Trash2 size={8} className="text-red-400" />
                </button>
              )}
            </button>
          ))}
        </div>

        {/* Editor */}
        <div className="flex-1 relative min-w-0">
          <div className="absolute top-0 left-0 right-0 h-6 bg-[#252526] flex items-center px-2 text-[10px] text-muted-foreground border-b border-white/5">
            {activeFile.name}
          </div>
          <div className="absolute top-6 left-0 right-0 bottom-0 overflow-auto">
            {/* Highlighted code background */}
            <pre ref={preRef} className="absolute inset-0 m-0 p-3 font-mono text-xs leading-5 pointer-events-none overflow-hidden" style={{ background: 'transparent' }}>
              <code dangerouslySetInnerHTML={{ __html: highlightedCode || '<br>' }} />
            </pre>
            {/* Transparent textarea for input */}
            <textarea
              ref={textareaRef}
              value={activeFile.content}
              onChange={e => handleContentChange(e.target.value)}
              onKeyDown={handleKeyDown}
              className="absolute inset-0 w-full h-full p-3 font-mono text-xs leading-5 resize-none outline-none bg-transparent text-transparent caret-white"
              spellCheck={false}
              style={{ tabSize: 4 }}
            />
          </div>
        </div>

        {/* Output panel */}
        {showOutput && (
          <div className="w-48 border-l border-white/5 bg-[#1A1A1A] flex flex-col flex-shrink-0">
            <div className="px-2 py-1 border-b border-white/5 text-[10px] text-muted-foreground">输出</div>
            <pre className="flex-1 p-2 font-mono text-[10px] overflow-auto whitespace-pre-wrap">{output}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
