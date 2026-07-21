import { HardDrive, Folder, FileText } from 'lucide-react';
import { useState } from 'react';

interface DiskItem {
  name: string;
  size: number;
  children?: DiskItem[];
}

const DISK_DATA: DiskItem[] = [
  { name: '/', size: 89, children: [
    { name: 'usr', size: 35, children: [
      { name: 'bin', size: 8 },
      { name: 'lib', size: 12 },
      { name: 'share', size: 15 },
    ]},
    { name: 'var', size: 12, children: [
      { name: 'log', size: 5 },
      { name: 'cache', size: 7 },
    ]},
    { name: 'etc', size: 3 },
    { name: 'opt', size: 18 },
    { name: 'tmp', size: 8 },
    { name: 'boot', size: 5 },
    { name: 'root', size: 8 },
  ]},
  { name: '/home', size: 312, children: [
    { name: 'user', size: 298, children: [
      { name: 'Documents', size: 25 },
      { name: 'Downloads', size: 156 },
      { name: 'Music', size: 34 },
      { name: 'Pictures', size: 45 },
      { name: 'Videos', size: 38 },
    ]},
  ]},
];

export default function DiskUsage() {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['/', '/home']));

  const toggleExpanded = (path: string) => {
    const next = new Set(expanded);
    if (next.has(path)) next.delete(path);
    else next.add(path);
    setExpanded(next);
  };

  const renderItem = (item: DiskItem, path: string, depth: number) => {
    const isExpanded = expanded.has(path);
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div key={path}>
        <button
          onClick={() => hasChildren && toggleExpanded(path)}
          className="w-full flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-white/5 transition-colors"
          style={{ paddingLeft: `${12 + depth * 16}px` }}
        >
          {hasChildren ? (
            <Folder size={14} className="text-yellow-500 flex-shrink-0" />
          ) : (
            <FileText size={14} className="text-blue-400 flex-shrink-0" />
          )}
          <span className="flex-1 text-left">{item.name}</span>
          <span className="text-xs text-muted-foreground">{item.size}GB</span>
          <div className="w-16 h-1.5 bg-white/10 rounded-full flex-shrink-0">
            <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${Math.min(item.size / 5, 100)}%` }} />
          </div>
        </button>
        {isExpanded && item.children?.map((child) => renderItem(child, `${path}/${child.name}`, depth + 1))}
      </div>
    );
  };

  return (
    <div className="w-full h-full flex flex-col" style={{ background: 'rgba(0, 18, 51, 0.9)' }}>
      <div className="flex items-center gap-2 px-3 py-2 border-b border-white/5">
        <HardDrive size={14} className="text-cyan-400" />
        <span className="text-sm font-medium">磁盘使用分析</span>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        <div className="glass-panel rounded-lg overflow-hidden">
          {DISK_DATA.map((item) => renderItem(item, item.name, 0))}
        </div>
      </div>
      <div className="px-3 py-2 border-t border-white/5 text-xs text-muted-foreground">
        总计: 512GB / 已用: 401GB (78%)
      </div>
    </div>
  );
}
