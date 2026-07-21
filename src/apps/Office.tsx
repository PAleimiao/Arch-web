import { useState } from 'react';
import { FileText, FileSpreadsheet, Presentation, Plus } from 'lucide-react';

const FILES = [
  { name: '文档1.docx', type: 'doc', date: '2026-07-01' },
  { name: '预算表.xlsx', type: 'sheet', date: '2026-06-28' },
  { name: '演示.pptx', type: 'ppt', date: '2026-06-25' },
  { name: '报告.docx', type: 'doc', date: '2026-06-20' },
];

export default function Office() {
  const [activeFile, setActiveFile] = useState<string | null>(null);

  if (activeFile) {
    return (
      <div className="w-full h-full flex flex-col" style={{ background: '#FAFAFA' }}>
        <div className="flex items-center gap-2 px-3 py-2 border-b bg-white">
          <button onClick={() => setActiveFile(null)} className="text-xs text-blue-600 hover:underline">← 返回</button>
          <span className="text-sm font-medium text-gray-800">{activeFile}</span>
        </div>
        <div className="flex-1 p-6 bg-white m-4 rounded shadow-sm">
          <div className="text-gray-800 text-sm leading-relaxed">
            <h1 className="text-2xl font-bold mb-4 text-gray-900">{activeFile.replace(/\.\w+$/, '')}</h1>
            <p className="mb-3">这是一份使用 WPS Office 创建的文档示例。Arch Linux 上的办公套件包括：</p>
            <ul className="list-disc ml-6 mb-3 space-y-1">
              <li>WPS Office - 兼容 Microsoft Office 格式</li>
              <li>LibreOffice - 开源办公套件</li>
              <li>OnlyOffice - 在线协作办公</li>
            </ul>
            <p>Arch Linux 提供了丰富的办公软件选择，满足不同用户的需求。</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col p-4" style={{ background: 'rgba(0, 18, 51, 0.95)' }}>
      <div className="flex items-center gap-3 mb-4">
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 text-sm">
          <Plus size={16} /> 新建
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {FILES.map(f => (
          <button key={f.name} onClick={() => setActiveFile(f.name)}
            className="glass-panel rounded-xl p-4 flex items-center gap-3 hover:border-cyan-400/30 transition-colors text-left">
            {f.type === 'doc' && <FileText size={24} className="text-blue-400" />}
            {f.type === 'sheet' && <FileSpreadsheet size={24} className="text-green-400" />}
            {f.type === 'ppt' && <Presentation size={24} className="text-orange-400" />}
            <div>
              <div className="text-sm font-medium">{f.name}</div>
              <div className="text-xs text-muted-foreground">{f.date}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
