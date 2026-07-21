import { useState, useRef, useCallback, useEffect } from 'react';
import {
  ArrowLeft, ArrowRight, RotateCw, Globe, Lock, Loader2,
  Star, Search, AlertTriangle, Home, Clock, ExternalLink,
  Shield, X, ChevronRight
} from 'lucide-react';

interface HistoryEntry {
  url: string;
  title: string;
  timestamp: number;
}

interface Bookmark {
  title: string;
  url: string;
  icon: string;
}

const DEFAULT_BOOKMARKS: Bookmark[] = [
  { title: 'GitHub', url: 'https://github.com', icon: '💻' },
  { title: 'Arch Wiki', url: 'https://wiki.archlinux.org', icon: '📖' },
  { title: 'Bilibili', url: 'https://bilibili.com', icon: '🎬' },
  { title: '知乎', url: 'https://zhihu.com', icon: '🤔' },
  { title: 'DuckDuckGo', url: 'https://duckduckgo.com', icon: '🦆' },
  { title: 'MDN', url: 'https://developer.mozilla.org', icon: '📚' },
  { title: 'StackOverflow', url: 'https://stackoverflow.com', icon: '💡' },
  { title: 'Wikipedia', url: 'https://wikipedia.org', icon: '🌐' },
];

// Known iframe-friendly sites
const IFRAME_FRIENDLY: Record<string, boolean> = {
  'wikipedia.org': true,
  'developer.mozilla.org': true,
  'duckduckgo.com': true,
  'bing.com': true,
};

function loadBookmarks(): Bookmark[] {
  try {
    const saved = localStorage.getItem('browser-bookmarks');
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  return DEFAULT_BOOKMARKS;
}

function saveBookmarks(bm: Bookmark[]) {
  localStorage.setItem('browser-bookmarks', JSON.stringify(bm));
}

function normalizeUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  if (trimmed.includes('.') && !trimmed.includes(' ')) return 'https://' + trimmed;
  return 'https://duckduckgo.com/?q=' + encodeURIComponent(trimmed);
}

function getDomain(url: string): string {
  try { return new URL(url).hostname; } catch { return url; }
}

function isIframeFriendly(url: string): boolean {
  try {
    const hostname = new URL(url).hostname;
    return Object.keys(IFRAME_FRIENDLY).some(d => hostname === d || hostname.endsWith('.' + d));
  } catch { return false; }
}

export default function Browser() {
  const [url, setUrl] = useState('');
  const [displayUrl, setDisplayUrl] = useState('');
  const [iframeUrl, setIframeUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorDetail, setErrorDetail] = useState('');
  const [showHome, setShowHome] = useState(true);
  const [bookmarks, setBookmarks] = useState(loadBookmarks);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [blockNotice, setBlockNotice] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const loadTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { saveBookmarks(bookmarks); }, [bookmarks]);

  const navigate = useCallback((target: string) => {
    const normalized = normalizeUrl(target);
    if (!normalized) return;

    setUrl(target);
    setDisplayUrl(normalized);
    setIframeUrl(normalized);
    setLoading(true);
    setError(null);
    setErrorDetail('');
    setShowHome(false);
    setShowBookmarks(false);
    setBlockNotice(false);

    // Check if iframe-friendly
    if (!isIframeFriendly(normalized)) {
      setBlockNotice(true);
    }

    if (loadTimeoutRef.current) clearTimeout(loadTimeoutRef.current);
    loadTimeoutRef.current = setTimeout(() => {
      setLoading(false);
    }, 10000);

    setHistory(prev => {
      const newHistory = [...prev.slice(0, historyIndex + 1), { url: normalized, title: getDomain(normalized), timestamp: Date.now() }];
      if (newHistory.length > 50) newHistory.shift();
      return newHistory;
    });
    setHistoryIndex(prev => Math.min(prev + 1, 49));
  }, [historyIndex]);

  const handleIframeLoad = useCallback(() => {
    setLoading(false);
    setBlockNotice(false);
    if (loadTimeoutRef.current) clearTimeout(loadTimeoutRef.current);
  }, []);

  const handleIframeError = useCallback(() => {
    setLoading(false);
    setError('该网站禁止在 iframe 中嵌入');
    setErrorDetail('网站设置了 X-Frame-Options 或 CSP 安全策略，这是浏览器安全限制，无法绕过。');
    if (loadTimeoutRef.current) clearTimeout(loadTimeoutRef.current);
  }, []);

  const handleGoBack = useCallback(() => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      setUrl(prev.url);
      setDisplayUrl(prev.url);
      setIframeUrl(prev.url);
      setLoading(true);
      setError(null);
      setShowHome(false);
      setBlockNotice(!isIframeFriendly(prev.url));
    }
  }, [historyIndex, history]);

  const handleGoForward = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      setUrl(next.url);
      setDisplayUrl(next.url);
      setIframeUrl(next.url);
      setLoading(true);
      setError(null);
      setShowHome(false);
      setBlockNotice(!isIframeFriendly(next.url));
    }
  }, [historyIndex, history]);

  const handleRefresh = useCallback(() => {
    if (iframeUrl) {
      setLoading(true);
      setError(null);
      const current = iframeUrl;
      setIframeUrl('');
      requestAnimationFrame(() => setIframeUrl(current));
    }
  }, [iframeUrl]);

  const addBookmark = useCallback(() => {
    if (!displayUrl) return;
    const domain = getDomain(displayUrl);
    if (bookmarks.some(b => b.url === displayUrl)) return;
    setBookmarks(prev => [...prev, { title: domain, url: displayUrl, icon: '🔖' }]);
  }, [displayUrl, bookmarks]);

  const removeBookmark = useCallback((urlToRemove: string) => {
    setBookmarks(prev => prev.filter(b => b.url !== urlToRemove));
  }, []);

  const goHome = useCallback(() => {
    setShowHome(true);
    setIframeUrl('');
    setLoading(false);
    setError(null);
    setBlockNotice(false);
    setUrl('');
  }, []);

  const openExternal = useCallback(() => {
    if (displayUrl) window.open(displayUrl, '_blank', 'noopener,noreferrer');
  }, [displayUrl]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
        e.preventDefault();
        (document.querySelector('[data-browser-url]') as HTMLInputElement)?.focus();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        handleRefresh();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleRefresh]);

  return (
    <div className="w-full h-full flex flex-col" style={{ background: '#0a0a1a' }}>
      {/* Toolbar */}
      <div className="flex items-center gap-1.5 px-2 py-1.5 border-b border-white/5 bg-[#0d0d2a]">
        <button onClick={handleGoBack} disabled={historyIndex <= 0}
          className="p-1.5 rounded hover:bg-white/10 disabled:opacity-30 transition-colors">
          <ArrowLeft size={14} />
        </button>
        <button onClick={handleGoForward} disabled={historyIndex >= history.length - 1}
          className="p-1.5 rounded hover:bg-white/10 disabled:opacity-30 transition-colors">
          <ArrowRight size={14} />
        </button>
        <button onClick={handleRefresh}
          className="p-1.5 rounded hover:bg-white/10 transition-colors">
          <RotateCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
        <button onClick={goHome}
          className="p-1.5 rounded hover:bg-white/10 transition-colors">
          <Home size={14} />
        </button>

        {/* Address bar */}
        <div className="flex-1 flex items-center gap-2 rounded-lg px-3 py-1 relative"
          style={{ background: 'rgba(0, 40, 85, 0.4)', border: '1px solid rgba(0, 180, 216, 0.1)' }}>
          {loading ? (
            <Loader2 size={12} className="text-cyan-400 animate-spin flex-shrink-0" />
          ) : displayUrl ? (
            <Lock size={12} className="text-green-400 flex-shrink-0" />
          ) : (
            <Globe size={12} className="text-muted-foreground flex-shrink-0" />
          )}
          <input
            data-browser-url
            type="text"
            value={url}
            onChange={e => setUrl(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') navigate(url); }}
            onFocus={e => e.target.select()}
            placeholder="输入网址或搜索关键词..."
            className="flex-1 bg-transparent outline-none text-xs"
          />
          {displayUrl && (
            <>
              <button onClick={openExternal} title="外部浏览器打开"
                className="p-0.5 rounded hover:bg-white/10 transition-colors flex-shrink-0">
                <ExternalLink size={12} className="text-cyan-400" />
              </button>
              <button onClick={addBookmark} title="添加收藏"
                className="p-0.5 rounded hover:bg-white/10 transition-colors flex-shrink-0">
                <Star size={12} className={bookmarks.some(b => b.url === displayUrl) ? 'text-yellow-400' : 'text-muted-foreground'} />
              </button>
            </>
          )}
        </div>

        <button onClick={() => setShowBookmarks(!showBookmarks)}
          className={`p-1.5 rounded transition-colors ${showBookmarks ? 'bg-white/10' : 'hover:bg-white/10'}`}>
          <Star size={14} />
        </button>
      </div>

      {/* Iframe sandbox notice */}
      {blockNotice && !error && !loading && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 border-b border-yellow-500/20 text-[10px]">
          <Shield size={12} className="text-yellow-400 flex-shrink-0" />
          <span className="text-yellow-400/80">
            沙盒模式：该网站可能限制了部分功能，如遇跳转异常请点击
          </span>
          <button onClick={openExternal} className="text-cyan-400 hover:underline flex items-center gap-0.5">
            外部打开 <ExternalLink size={10} />
          </button>
          <button onClick={() => setBlockNotice(false)} className="ml-auto p-0.5 hover:bg-white/10 rounded">
            <X size={10} className="text-muted-foreground" />
          </button>
        </div>
      )}

      {/* Bookmarks bar */}
      {showBookmarks && (
        <div className="flex items-center gap-1 px-2 py-1 border-b border-white/5 bg-[#0d0d2a] overflow-x-auto">
          {bookmarks.map(bm => (
            <button key={bm.url} onClick={() => navigate(bm.url)}
              className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-white/5 transition-colors text-xs whitespace-nowrap group">
              <span>{bm.icon}</span>
              <span className="max-w-[100px] truncate">{bm.title}</span>
              <span onClick={e => { e.stopPropagation(); removeBookmark(bm.url); }}
                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-400 ml-0.5">×</span>
            </button>
          ))}
          {bookmarks.length === 0 && (
            <span className="text-xs text-muted-foreground">暂无收藏，访问网页后点击地址栏右侧星号添加</span>
          )}
        </div>
      )}

      {/* Content area */}
      <div className="flex-1 relative min-h-0">
        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center" style={{ background: 'rgba(0, 18, 51, 0.8)' }}>
            <div className="text-center">
              <Loader2 size={32} className="animate-spin text-cyan-400 mx-auto mb-2" />
              <div className="text-sm text-muted-foreground">正在加载...</div>
              <div className="text-xs text-muted-foreground mt-1 max-w-xs truncate">{displayUrl}</div>
              <div className="text-[10px] text-muted-foreground mt-2 px-3">
                部分网站可能限制嵌入，10秒后自动停止
              </div>
            </div>
          </div>
        )}

        {/* Error overlay */}
        {error && (
          <div className="absolute inset-0 z-10 flex items-center justify-center" style={{ background: 'rgba(0, 18, 51, 0.9)' }}>
            <div className="text-center max-w-sm px-6">
              <AlertTriangle size={40} className="text-yellow-400 mx-auto mb-3" />
              <h3 className="text-base font-medium mb-2">页面加载受限</h3>
              <p className="text-sm text-muted-foreground mb-1">{error}</p>
              {errorDetail && (
                <p className="text-xs text-muted-foreground mb-4">{errorDetail}</p>
              )}
              <div className="text-xs text-muted-foreground mb-4 p-2 rounded bg-white/5 break-all">
                {displayUrl}
              </div>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <button onClick={handleRefresh}
                  className="px-3 py-1.5 rounded-lg bg-cyan-400/20 text-cyan-400 text-xs hover:bg-cyan-400/30 transition-colors">
                  重试
                </button>
                <button onClick={openExternal}
                  className="px-3 py-1.5 rounded-lg bg-white/10 text-xs hover:bg-white/20 transition-colors flex items-center gap-1">
                  <ExternalLink size={12} /> 外部浏览器打开
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Iframe - key change: removed allow-popups to keep navigation inside */}
        {iframeUrl && !showHome && (
          <iframe
            ref={iframeRef}
            src={iframeUrl}
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin allow-forms allow-downloads allow-modals"
            title="Browser"
          />
        )}

        {/* Home page */}
        {showHome && (
          <div className="w-full h-full overflow-auto p-6">
            <div className="max-w-lg mx-auto mt-12 mb-8">
              <div className="text-center mb-6">
                <Globe size={48} className="text-cyan-400 mx-auto mb-3" />
                <h1 className="text-xl font-medium">Arch Web Browser</h1>
                <p className="text-xs text-muted-foreground mt-1">iframe 沙盒网页浏览器</p>
              </div>
              <div className="flex items-center gap-2 rounded-xl px-4 py-3"
                style={{ background: 'rgba(0, 40, 85, 0.4)', border: '1px solid rgba(0, 180, 216, 0.15)' }}>
                <Search size={16} className="text-muted-foreground flex-shrink-0" />
                <input
                  type="text"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') navigate(url); }}
                  placeholder="输入网址或搜索关键词..."
                  className="flex-1 bg-transparent outline-none text-sm"
                  autoFocus
                />
                <button onClick={() => navigate(url)}
                  className="px-3 py-1 rounded-lg bg-cyan-400/20 text-cyan-400 text-xs hover:bg-cyan-400/30 transition-colors">
                  前往
                </button>
              </div>
            </div>

            {/* Quick access */}
            <div className="max-w-2xl mx-auto">
              <h2 className="text-sm text-muted-foreground mb-3 flex items-center gap-1">
                <Star size={12} /> 快速访问
              </h2>
              <div className="grid grid-cols-4 gap-2">
                {bookmarks.slice(0, 8).map(bm => (
                  <button key={bm.url} onClick={() => navigate(bm.url)}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-white/5 transition-colors group">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                      style={{ background: 'rgba(0, 40, 85, 0.4)' }}>
                      {bm.icon}
                    </div>
                    <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors truncate max-w-full">
                      {bm.title}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* History */}
            {history.length > 0 && (
              <div className="max-w-2xl mx-auto mt-6">
                <h2 className="text-sm text-muted-foreground mb-3 flex items-center gap-1">
                  <Clock size={12} /> 最近访问
                </h2>
                <div className="space-y-1">
                  {history.slice(-10).reverse().map((entry, i) => (
                    <button key={`${entry.url}-${i}`} onClick={() => navigate(entry.url)}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-left">
                      <Globe size={12} className="text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm truncate">{entry.title}</div>
                        <div className="text-xs text-muted-foreground truncate">{entry.url}</div>
                      </div>
                      <ChevronRight size={12} className="text-muted-foreground" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tips */}
            <div className="max-w-2xl mx-auto mt-6 space-y-2">
              <div className="p-3 rounded-lg bg-yellow-400/10 border border-yellow-400/20">
                <div className="flex items-start gap-2">
                  <AlertTriangle size={14} className="text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-muted-foreground">
                    <strong className="text-yellow-400">安全说明：</strong>
                    浏览器使用 iframe 沙盒模式运行。已移除弹出窗口权限，防止链接在主浏览器中跳转。
                    部分网站（GitHub、知乎、B站等）可能禁止嵌入，如遇加载失败请使用「外部浏览器打开」。
                  </div>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-cyan-400/10 border border-cyan-400/20">
                <div className="flex items-start gap-2">
                  <Shield size={14} className="text-cyan-400 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-muted-foreground">
                    <strong className="text-cyan-400">已知可嵌入：</strong>
                    Wikipedia、MDN文档、DuckDuckGo搜索 等网站支持 iframe 嵌入，推荐访问。
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
