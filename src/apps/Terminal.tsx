import { useState, useEffect, useRef } from 'react';
import type { TerminalLine } from '@/types';

interface TerminalProps {
  windowId?: string;
}

const COMMANDS: Record<string, string[]> = {
  help: [
    'Available commands:',
    '  help        - Show this help message',
    '  neofetch    - Display system information',
    '  ls          - List files in current directory',
    '  pwd         - Print working directory',
    '  whoami      - Display current user',
    '  uname       - Print system information',
    '  date        - Display current date and time',
    '  clear       - Clear terminal screen',
    '  cat         - Display file contents',
    '  echo        - Print text to terminal',
    '  ps          - List running processes',
    '  free        - Display memory usage',
    '  df          - Display disk usage',
    '  ip          - Display network info',
    '  pacman      - Package manager',
    '  yay         - AUR helper',
    '  reboot      - Reboot system',
    '  shutdown    - Shutdown system',
    '  vim         - Open text editor',
    '  code        - Open VS Code',
  ],
  neofetch: [
    '\x1b[36m                   -`                    \x1b[32muser@arch-web\x1b[0m',
    '\x1b[36m                  .o+`                   \x1b[0m------------',
    '\x1b[36m                 `ooo/                   \x1b[33mOS:\x1b[0m Arch Linux Web',
    '\x1b[36m                `+oooo:                  \x1b[33mKernel:\x1b[0m web-6.8.0-arch1-1',
    '\x1b[36m               `+oooooo:                 \x1b[33mUptime:\x1b[0m 2h 34m',
    '\x1b[36m               -+oooooo+:                \x1b[33mPackages:\x1b[0m 1337',
    '\x1b[36m             `/:-:++oooo+:               \x1b[33mShell:\x1b[0m zsh 5.9',
    '\x1b[36m            `/++++/+++++++:              \x1b[33mDE:\x1b[0m Hyprland',
    '\x1b[36m           `/++++++++++++++:             \x1b[33mWM:\x1b[0m Hyprland',
    '\x1b[36m          `/+++ooooooooooooo/`            \x1b[33mTheme:\x1b[0m Catppuccin-Mocha',
    '\x1b[36m         ./ooosssso++osssssso+`          \x1b[33mIcons:\x1b[0m Papirus-Dark',
    '\x1b[36m        .oossssso-````/ossssss+`         \x1b[33mTerminal:\x1b[0m kitty',
    '\x1b[36m       -osssssso.      :ssssssso.        \x1b[33mCPU:\x1b[0m Web Virtual 8-Core',
    '\x1b[36m      :osssssss/        osssso+++.       \x1b[33mGPU:\x1b[0m WebRenderer',
    '\x1b[36m     /ossssssss/        +ssssooo/-       \x1b[33mMemory:\x1b[0m 4.2GiB / 16GiB',
  ],
  ls: [
    '\x1b[34mDesktop\x1b[0m  \x1b[34mDocuments\x1b[0m  \x1b[34mDownloads\x1b[0m  \x1b[34mMusic\x1b[0m  \x1b[34mPictures\x1b[0m  \x1b[34mVideos\x1b[0m  \x1b[32mscript.sh\x1b[0m  \x1b[0mREADME.md\x1b[0m',
  ],
  pwd: ['/home/user/workspace'],
  whoami: ['user'],
  uname: ['Linux arch-web 6.8.0-arch1-1 #1 SMP PREEMPT Web x86_64 GNU/Linux'],
  date: [new Date().toString()],
  cat: ['Usage: cat <file>'],
  echo: ['Usage: echo <text>'],
  ps: [
    '  PID TTY          TIME CMD',
    '    1 ?        00:00:01 systemd',
    '  420 ?        00:00:05 hyprland',
  '  666 ?        00:00:03 kitty',
    '  1337 pts/0    00:00:00 zsh',
    '  2048 pts/1    00:00:00 node',
    '  4096 pts/2    00:00:00 chrome',
    '  8192 pts/3    00:00:00 code',
  ],
  free: [
    '               total        used        free      shared  buff/cache   available',
    'Mem:           16Gi       4.2Gi       8.1Gi       512Mi       3.7Gi        11Gi',
    'Swap:         8.0Gi          0B       8.0Gi',
  ],
  df: [
    'Filesystem      Size  Used Avail Use% Mounted on',
    '/dev/nvme0n1p1  512G   89G  423G  18% /',
    '/dev/nvme0n1p2  1.0T  312G  688G  32% /home',
    'tmpfs            16G  512M   16G   4% /tmp',
  ],
  ip: [
    '1: lo: <LOOPBACK,UP> mtu 65536',
    '    inet 127.0.0.1/8 scope host lo',
    '2: wlan0: <BROADCAST,MULTICAST,UP> mtu 1500',
    '    inet 192.168.1.42/24 brd 192.168.1.255 scope global wlan0',
    '    inet6 fe80::1a2b:3c4d:5e6f:7g8h/64 scope link',
  ],
  pacman: [
    'usage:  pacman <operation> [...]',
    'operations:',
    '    pacman {-h --help}',
    '    pacman {-V --version}',
    '    pacman {-D --database} <options> <package(s)>',
    '    pacman {-Q --query}    [options] [package(s)]',
    '    pacman {-R --remove}   [options] <package(s)>',
    '    pacman {-S --sync}     [options] [package(s)]',
    '    pacman {-T --deptest}  [options] [package(s)]',
    '    pacman {-U --upgrade}  [options] <file(s)>',
  ],
  yay: [
    '\x1b[32m:: \x1b[0mSearching AUR for updates...',
    '\x1b[32m:: \x1b[0mNo AUR updates found.',
  ],
  reboot: ['System is going down for reboot NOW!'],
  shutdown: ['System is going down for power-off NOW!'],
  vim: ['Opening neovim... (Press :q to quit)'],
  code: ['Launching VS Code...'],
};

export default function Terminal({  }: TerminalProps = {}) {
  const [lines, setLines] = useState<TerminalLine[]>([
    { type: 'info', content: 'Arch Linux Web Simulator v1.0.0' },
    { type: 'info', content: 'Kernel: web-6.8.0-arch1-1' },
    { type: 'info', content: 'Type "help" for available commands.' },
  ]);
  const [input, setInput] = useState('');
  const [currentDir, setCurrentDir] = useState('~/workspace');
  const [gitBranch] = useState('master*');
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [lines]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmedInput = input.trim();
      
      setLines(prev => [...prev, { type: 'prompt', content: `➜ ${currentDir} ${gitBranch} ${trimmedInput}` }]);
      
      if (trimmedInput) {
        const [cmd, ...args] = trimmedInput.split(' ');
        
        if (cmd === 'clear') {
          setLines([]);
        } else if (cmd === 'cd') {
          const target = args[0] || '~';
          if (target === '..') {
            setCurrentDir('~');
          } else if (target === '~' || target === 'home') {
            setCurrentDir('~');
          } else {
            setCurrentDir(`~/${target}`);
          }
        } else if (cmd === 'cat' && args[0]) {
          setLines(prev => [...prev, { type: 'output', content: `Contents of ${args[0]}:` }, { type: 'output', content: 'This is a sample file content...' }]);
        } else if (cmd === 'echo') {
          setLines(prev => [...prev, { type: 'output', content: args.join(' ') }]);
        } else if (COMMANDS[cmd]) {
          COMMANDS[cmd].forEach(line => {
            setLines(prev => [...prev, { type: 'output', content: line }]);
          });
        } else if (cmd) {
          setLines(prev => [...prev, { type: 'error', content: `zsh: command not found: ${cmd}` }]);
        }
      }
      
      setInput('');
    }
  };

  const parseContent = (content: string) => {
    if (!content.includes('\x1b[')) return <span>{content}</span>;
    
    const parts = content.split(/(\x1b\[[0-9;]*m)/g);
    let currentColor = '#EEF4ED';
    const result: React.ReactNode[] = [];
    let keyIdx = 0;
    
    parts.forEach((part) => {
      if (part.startsWith('\x1b[')) {
        const code = part.replace('\x1b[', '').replace('m', '');
        switch (code) {
          case '30': currentColor = '#000000'; break;
          case '31': currentColor = '#EF233C'; break;
          case '32': currentColor = '#2DC653'; break;
          case '33': currentColor = '#F4D03F'; break;
          case '34': currentColor = '#00B4D8'; break;
          case '35': currentColor = '#7B2CBF'; break;
          case '36': currentColor = '#00B4D8'; break;
          case '37': currentColor = '#EEF4ED'; break;
          case '0': currentColor = '#EEF4ED'; break;
          default: break;
        }
      } else if (part) {
        result.push(<span key={keyIdx++} style={{ color: currentColor }}>{part}</span>);
      }
    });
    
    return <>{result}</>;
  };

  return (
    <div className="w-full h-full flex flex-col" style={{ background: 'rgba(0, 18, 51, 0.75)' }}>
      <div className="terminal-body flex-1 overflow-y-auto" ref={bodyRef}>
        {lines.map((line, i) => (
          <div key={i} className="mb-0.5 whitespace-pre-wrap break-all" style={{
            color: line.type === 'error' ? '#EF233C' : line.type === 'info' ? '#5C677D' : '#EEF4ED',
          }}>
            {line.type === 'prompt' ? (
              <>
                <span className="text-cyan">➜</span>{' '}
                <span className="text-green">{currentDir}</span>{' '}
                <span className="text-purple">{gitBranch}</span>{' '}
                {line.content.split(' ').slice(3).join(' ')}
              </>
            ) : (
              parseContent(line.content)
            )}
          </div>
        ))}
        <div className="flex items-center">
          <span className="text-cyan">➜</span>{' '}
          <span className="text-green">{currentDir}</span>{' '}
          <span className="text-purple">{gitBranch}</span>{' '}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="bg-transparent outline-none flex-1 ml-1"
            style={{ 
              color: '#EEF4ED', 
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: 14,
              caretColor: '#00B4D8',
            }}
            autoFocus
            spellCheck={false}
          />
          <span className="cursor" />
        </div>
      </div>
    </div>
  );
}
