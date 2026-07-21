import { useState } from 'react';
import { Search, Send, Smile, Phone } from 'lucide-react';

interface Chat {
  id: number;
  name: string;
  avatar: string;
  lastMsg: string;
  time: string;
  unread: number;
}

interface Message {
  id: number;
  content: string;
  self: boolean;
}

const CHATS: Chat[] = [
  { id: 1, name: '文件传输助手', avatar: '文', lastMsg: '[图片]', time: '10:30', unread: 0 },
  { id: 2, name: 'Linux 技术交流群', avatar: 'L', lastMsg: 'Arch 真的好用', time: '10:15', unread: 12 },
  { id: 3, name: '小明', avatar: '明', lastMsg: '晚上吃啥？', time: '09:50', unread: 0 },
  { id: 4, name: '相亲相爱一家人', avatar: '家', lastMsg: '妈: 记得多穿点', time: '昨天', unread: 0 },
  { id: 5, name: '公司群', avatar: '公', lastMsg: '本周五开会', time: '昨天', unread: 0 },
];

const INITIAL_MESSAGES: Record<number, Message[]> = {
  1: [
    { id: 1, content: '[图片] arch-screenshot.png', self: false },
  ],
  2: [
    { id: 1, content: '有人推荐下 Arch 的桌面环境吗？', self: false },
    { id: 2, content: '推荐 Hyprland，贼好看', self: true },
    { id: 3, content: 'Arch 真的好用', self: false },
  ],
  3: [
    { id: 1, content: '在不？', self: false },
    { id: 2, content: '晚上吃啥？', self: false },
  ],
};

export default function WeChat() {
  const [activeChat, setActiveChat] = useState(2);
  const [messages, setMessages] = useState<Record<number, Message[]>>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const chat = CHATS.find(c => c.id === activeChat);
  const currentMessages = messages[activeChat] || [];

  const sendMessage = () => {
    if (!input.trim()) return;
    const newMsg: Message = { id: Date.now(), content: input.trim(), self: true };
    setMessages({ ...messages, [activeChat]: [...currentMessages, newMsg] });
    setInput('');
    setTimeout(() => {
      const reply: Message = { id: Date.now() + 1, content: ['好的', '收到', 'OK', '哈哈'][Math.floor(Math.random() * 4)], self: false };
      setMessages(prev => ({ ...prev, [activeChat]: [...(prev[activeChat] || []), reply] }));
    }, 1200);
  };

  return (
    <div className="w-full h-full flex" style={{ background: '#1A1A1A' }}>
      {/* Sidebar */}
      <div className="w-56 border-r border-white/5 flex flex-col" style={{ background: '#111111' }}>
        <div className="p-3 flex items-center justify-between">
          <div className="flex items-center gap-2 glass-panel rounded-lg px-3 py-1.5 flex-1">
            <Search size={14} className="text-muted-foreground" />
            <input type="text" placeholder="搜索" className="bg-transparent outline-none text-xs flex-1" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {CHATS.map(c => (
            <button
              key={c.id}
              onClick={() => setActiveChat(c.id)}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 transition-colors text-left"
              style={{ background: c.id === activeChat ? '#2A2A2A' : 'transparent' }}
            >
              <div className="relative">
                <div className="w-9 h-9 rounded-md flex items-center justify-center text-xs" style={{ background: `hsl(${c.id * 70}, 50%, 35%)` }}>
                  {c.avatar}
                </div>
                {c.unread > 0 && <div className="absolute -top-1 -right-1 min-w-[16px] h-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center px-1">{c.unread}</div>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm truncate">{c.name}</span>
                  <span className="text-xs text-muted-foreground">{c.time}</span>
                </div>
                <div className="text-xs text-muted-foreground truncate">{c.lastMsg}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat */}
      <div className="flex-1 flex flex-col" style={{ background: '#1A1A1A' }}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
          <div className="font-medium">{chat?.name}</div>
          <button className="p-1.5 rounded hover:bg-white/10"><Phone size={16} className="text-muted-foreground" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {currentMessages.map(msg => (
            <div key={msg.id} className={`flex ${msg.self ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] px-3 py-2 rounded-lg text-sm ${
                msg.self ? 'bg-green-600 text-white' : 'bg-white/10'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
        </div>
        <div className="px-4 py-3 border-t border-white/5">
          <div className="flex items-center gap-2 mb-2">
            <button className="p-1 rounded hover:bg-white/10"><Smile size={18} className="text-muted-foreground" /></button>
          </div>
          <div className="flex items-center gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }}}
              placeholder="输入消息..."
              className="flex-1 bg-white/5 rounded-lg px-3 py-2 text-sm outline-none resize-none h-10"
            />
            <button onClick={sendMessage} className="p-2 rounded-lg bg-green-600 hover:bg-green-500 transition-colors">
              <Send size={16} className="text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
