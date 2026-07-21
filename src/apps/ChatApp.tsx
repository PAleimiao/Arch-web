import { useState, useEffect, useRef } from 'react';
import { Send, User, Clock, Trash2, Smile } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: string;
  avatar: string;
  content: string;
  time: string;
  self: boolean;
}

const STORAGE_KEY = 'chat-messages';

const INITIAL_MESSAGES: ChatMessage[] = [
  { id: '1', sender: 'Arch Bot', avatar: 'A', content: '你好！欢迎来到 Arch Linux Web Simulator 聊天室。\n\n你可以在这里发送消息，所有消息会保存在浏览器本地存储中。\n\n快捷键：\n- Enter 发送\n- Ctrl+Enter 换行', time: '09:00', self: false },
  { id: '2', sender: 'System', avatar: 'S', content: '系统提示：消息仅保存在本地，刷新页面后依然可见。', time: '09:01', self: false },
];

function loadMessages(): ChatMessage[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  return INITIAL_MESSAGES;
}

function saveMessages(msgs: ChatMessage[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs));
}

export default function ChatApp() {
  const [messages, setMessages] = useState<ChatMessage[]>(loadMessages);
  const [input, setInput] = useState('');
  const [username, setUsername] = useState('User');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { saveMessages(messages); }, [messages]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMessage = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: username,
      avatar: username.charAt(0).toUpperCase(),
      content: trimmed,
      time: timeStr,
      self: true,
    };
    setMessages(prev => [...prev, newMsg]);
    setInput('');

    // Auto reply
    setTimeout(() => {
      const replies = [
        '收到！',
        ' interesting...',
        '好的，了解了。',
        '哈哈，确实如此。',
        '这是一个不错的想法。',
        '我需要思考一下这个问题。',
        '完全同意！',
        '有道理。',
      ];
      const reply: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'Arch Bot',
        avatar: 'A',
        content: replies[Math.floor(Math.random() * replies.length)],
        time: `${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`,
        self: false,
      };
      setMessages(prev => [...prev, reply]);
    }, 1000 + Math.random() * 2000);
  };

  const clearChat = () => {
    if (confirm('确定要清空所有聊天记录吗？')) {
      setMessages(INITIAL_MESSAGES);
    }
  };

  return (
    <div className="w-full h-full flex flex-col" style={{ background: '#1E1E1E' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-[#252526]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-cyan-400/20 flex items-center justify-center text-xs text-cyan-400">#</div>
          <div>
            <div className="text-xs font-medium">Arch 聊天室</div>
            <div className="text-[9px] text-muted-foreground">{messages.length} 条消息</div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="w-16 bg-white/5 border border-white/10 rounded px-1.5 py-0.5 text-[10px] outline-none"
            placeholder="昵称"
          />
          <button onClick={clearChat} className="p-1 rounded hover:bg-white/10 transition-colors" title="清空">
            <Trash2 size={12} className="text-red-400" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
        {messages.map(msg => (
          <div key={msg.id} className={`flex gap-2 ${msg.self ? 'flex-row-reverse' : ''}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] flex-shrink-0 ${
              msg.self ? 'bg-cyan-400/20 text-cyan-400' : 'bg-purple-400/20 text-purple-400'
            }`}>
              {msg.avatar}
            </div>
            <div className={`max-w-[70%] ${msg.self ? 'items-end' : 'items-start'}`}>
              <div className="flex items-center gap-1 mb-0.5">
                <span className="text-[10px] font-medium">{msg.sender}</span>
                <span className="text-[9px] text-muted-foreground">{msg.time}</span>
              </div>
              <div className={`px-2.5 py-1.5 rounded-xl text-xs whitespace-pre-wrap ${
                msg.self
                  ? 'bg-cyan-400/20 text-cyan-100 rounded-tr-sm'
                  : 'bg-white/5 text-gray-200 rounded-tl-sm'
              }`}>
                {msg.content}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-2 border-t border-white/5 bg-[#252526]">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.ctrlKey && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="输入消息... (Enter 发送, Ctrl+Enter 换行)"
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs outline-none resize-none focus:border-cyan-400/50"
            rows={1}
            style={{ minHeight: 32, maxHeight: 80 }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim()}
            className="px-3 py-2 rounded-lg bg-cyan-400/20 text-cyan-400 hover:bg-cyan-400/30 transition-colors disabled:opacity-50 flex items-center self-end"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
