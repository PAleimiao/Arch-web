import { useState } from 'react';
import { Search, Send, Smile, Image as ImageIcon, Phone, Video } from 'lucide-react';

interface Chat {
  id: number;
  name: string;
  avatar: string;
  lastMsg: string;
  time: string;
  unread: number;
  online: boolean;
}

interface Message {
  id: number;
  sender: string;
  content: string;
  time: string;
  self: boolean;
}

const CHATS: Chat[] = [
  { id: 1, name: 'Arch Linux 交流群', avatar: 'A', lastMsg: '有人知道怎么配置 Hyprland 吗？', time: '10:23', unread: 5, online: true },
  { id: 2, name: '铁子', avatar: 'T', lastMsg: '晚上一起打游戏不？', time: '09:45', unread: 1, online: true },
  { id: 3, name: 'Linux 新手群', avatar: 'L', lastMsg: 'pacman 怎么用啊', time: '昨天', unread: 0, online: false },
  { id: 4, name: '文件传输助手', avatar: 'F', lastMsg: '[图片]', time: '昨天', unread: 0, online: true },
  { id: 5, name: 'Mom', avatar: 'M', lastMsg: '记得吃饭', time: '周二', unread: 0, online: false },
];

const MESSAGES: Record<number, Message[]> = {
  1: [
    { id: 1, sender: '用户A', content: '兄弟们，Hyprland 怎么配置多显示器啊？', time: '10:20', self: false },
    { id: 2, sender: '用户B', content: '在 config 里加 monitor 配置就行', time: '10:21', self: false },
    { id: 3, sender: '我', content: 'monitor=DP-1,1920x1080@144,0x0,1', time: '10:22', self: true },
    { id: 4, sender: '用户A', content: '有人知道怎么配置 Hyprland 吗？', time: '10:23', self: false },
    { id: 5, sender: '用户C', content: '推荐用 JaKooLit 的脚本，一键配置', time: '10:23', self: false },
  ],
  2: [
    { id: 1, sender: '铁子', content: '在不？', time: '09:40', self: false },
    { id: 2, sender: '铁子', content: '晚上一起打游戏不？', time: '09:45', self: false },
  ],
};

export default function QQ() {
  const [activeChat, setActiveChat] = useState(1);
  const [messages, setMessages] = useState<Record<number, Message[]>>(MESSAGES);
  const [input, setInput] = useState('');
  const chat = CHATS.find(c => c.id === activeChat);
  const currentMessages = messages[activeChat] || [];

  const sendMessage = () => {
    if (!input.trim()) return;
    const newMsg: Message = { id: Date.now(), sender: '我', content: input.trim(), time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }), self: true };
    setMessages({ ...messages, [activeChat]: [...currentMessages, newMsg] });
    setInput('');
    
    setTimeout(() => {
      const replies = ['666', '可以啊', '学到了', '确实', '哈哈哈', '厉害了'];
      const reply: Message = { id: Date.now() + 1, sender: chat?.name || '对方', content: replies[Math.floor(Math.random() * replies.length)], time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }), self: false };
      setMessages(prev => ({ ...prev, [activeChat]: [...(prev[activeChat] || []), reply] }));
    }, 1500);
  };

  return (
    <div className="w-full h-full flex" style={{ background: 'rgba(0, 18, 51, 0.95)' }}>
      {/* Sidebar */}
      <div className="w-56 border-r border-white/5 flex flex-col">
        <div className="p-3">
          <div className="flex items-center gap-2 glass-panel rounded-lg px-3 py-1.5">
            <Search size={14} className="text-muted-foreground" />
            <input type="text" placeholder="搜索" className="bg-transparent outline-none text-xs flex-1" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {CHATS.map(c => (
            <button
              key={c.id}
              onClick={() => setActiveChat(c.id)}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-white/5 transition-colors text-left"
              style={{ background: c.id === activeChat ? 'rgba(0, 180, 216, 0.1)' : 'transparent' }}
            >
              <div className="relative">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: `hsl(${c.id * 60}, 60%, 40%)` }}>
                  {c.avatar}
                </div>
                {c.online && <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2" style={{ borderColor: 'rgba(0,18,51,0.95)' }} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm truncate">{c.name}</span>
                  <span className="text-xs text-muted-foreground">{c.time}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground truncate">{c.lastMsg}</span>
                  {c.unread > 0 && <span className="min-w-[16px] h-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center px-1">{c.unread}</span>}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5">
          <div className="font-medium">{chat?.name}</div>
          <div className="flex items-center gap-2">
            <button className="p-1.5 rounded hover:bg-white/10"><Phone size={16} className="text-muted-foreground" /></button>
            <button className="p-1.5 rounded hover:bg-white/10"><Video size={16} className="text-muted-foreground" /></button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {currentMessages.map(msg => (
            <div key={msg.id} className={`flex ${msg.self ? 'justify-end' : 'justify-start'}`}>
              {!msg.self && (
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs mr-2 flex-shrink-0" style={{ background: `hsl(${activeChat * 60}, 60%, 40%)` }}>
                  {chat?.avatar}
                </div>
              )}
              <div className={`max-w-[70%] px-3 py-2 rounded-xl text-sm ${
                msg.self ? 'bg-cyan-400/20 text-cyan-100' : 'glass-panel'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="px-4 py-2 border-t border-white/5">
          <div className="flex items-center gap-2 mb-2">
            <button className="p-1 rounded hover:bg-white/10"><Smile size={16} className="text-muted-foreground" /></button>
            <button className="p-1 rounded hover:bg-white/10"><ImageIcon size={16} className="text-muted-foreground" /></button>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="输入消息..."
              className="flex-1 glass-panel rounded-lg px-3 py-2 text-sm outline-none"
            />
            <button onClick={sendMessage} className="p-2 rounded-lg bg-cyan-400/20 hover:bg-cyan-400/30 transition-colors">
              <Send size={16} className="text-cyan-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
