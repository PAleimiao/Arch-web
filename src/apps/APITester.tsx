import { useState } from 'react';
import { Send, Plus } from 'lucide-react';

interface Request {
  method: string;
  url: string;
  status?: number;
  response?: string;
}

export default function APITester() {
  const [requests, setRequests] = useState<Request[]>([
    { method: 'GET', url: 'https://api.github.com/users/archlinux', status: 200, response: '{\n  "login": "archlinux",\n  "id": 4674428,\n  "node_id": "MDEyOk9yZ2FuaXphdGlvbjQ2NzQ0Mjg=",\n  "avatar_url": "https://avatars.githubusercontent.com/u/4674428?v=4",\n  "type": "Organization",\n  "site_admin": false,\n  "name": "Arch Linux",\n  "company": null,\n  "blog": "https://www.archlinux.org",\n  "location": "Worldwide",\n  "email": null,\n  "bio": "A lightweight and flexible Linux distribution that tries to Keep It Simple.",\n  "public_repos": 42,\n  "public_gists": 0,\n  "followers": 0,\n  "following": 0,\n  "created_at": "2013-06-09T02:42:03Z",\n  "updated_at": "2024-01-15T08:22:17Z"\n}' },
  ]);
  const [activeReq, setActiveReq] = useState(0);
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('https://api.github.com/users/archlinux');

  const send = () => {
    const responses: Record<string, string> = {
      'github': '{\n  "status": "ok",\n  "message": "API rate limit remaining: 4999"\n}',
      'arch': '{\n  "distro": "Arch Linux",\n  "version": "rolling",\n  "packages": 133742,\n  "users": "too many to count"\n}',
      'weather': '{\n  "city": "Chengdu",\n  "temp": 28,\n  "condition": "Sunny",\n  "humidity": 45\n}',
    };
    
    const key = Object.keys(responses).find(k => url.toLowerCase().includes(k));
    const res = key ? responses[key] : `{\n  "error": "Cannot reach ${url}",\n  "status": 404\n}`;
    const status = key ? 200 : 404;
    
    const newReqs = [...requests];
    newReqs[activeReq] = { ...newReqs[activeReq], method, url, status, response: res };
    setRequests(newReqs);
  };

  const addReq = () => {
    setRequests([...requests, { method: 'GET', url: '' }]);
    setActiveReq(requests.length);
  };

  return (
    <div className="w-full h-full flex" style={{ background: 'rgba(0, 18, 51, 0.95)' }}>
      {/* Sidebar */}
      <div className="w-48 border-r border-white/5 flex flex-col">
        <div className="flex items-center justify-between p-2 border-b border-white/5">
          <span className="text-xs font-medium">请求历史</span>
          <button onClick={addReq} className="p-1 rounded hover:bg-white/10"><Plus size={12} /></button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {requests.map((req, i) => (
            <button key={i} onClick={() => { setActiveReq(i); setMethod(req.method); setUrl(req.url); }}
              className="w-full text-left px-3 py-2 text-xs hover:bg-white/5 transition-colors"
              style={{ background: i === activeReq ? 'rgba(0, 180, 216, 0.1)' : 'transparent' }}>
              <span className={`px-1 rounded text-xs ${req.method === 'GET' ? 'bg-green-500/20 text-green-400' : req.method === 'POST' ? 'bg-blue-500/20 text-blue-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{req.method}</span>
              <div className="truncate mt-1 text-muted-foreground">{req.url || '新请求'}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-center gap-2 p-3 border-b border-white/5">
          <select value={method} onChange={e => setMethod(e.target.value)} className="glass-panel rounded-lg px-2 py-1.5 text-sm outline-none">
            {['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <input value={url} onChange={e => setUrl(e.target.value)} placeholder="输入 URL..." className="flex-1 glass-panel rounded-lg px-3 py-1.5 text-sm outline-none" />
          <button onClick={send} className="px-4 py-1.5 rounded-lg bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 flex items-center gap-1.5 text-sm">
            <Send size={14} /> 发送
          </button>
        </div>
        {requests[activeReq]?.response && (
          <div className="flex-1 overflow-y-auto p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-xs px-2 py-0.5 rounded ${(requests[activeReq].status || 0) < 400 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {requests[activeReq].status}
              </span>
            </div>
            <pre className="text-xs font-mono p-3 rounded-lg overflow-x-auto" style={{ background: 'rgba(0,40,85,0.5)' }}>
              {requests[activeReq].response}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
