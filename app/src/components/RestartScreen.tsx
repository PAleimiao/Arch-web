import { useState, useEffect, useRef } from 'react';

interface LogEntry {
  text: string;
  color?: string;
  delay?: number;
}

const RESTART_LOGS: LogEntry[] = [
  { text: '' },
  { text: '    >> Restarting system...', color: '#F59E0B' },
  { text: '' },
  { text: '[  OK  ] Stopped target Network.' },
  { text: '[  OK  ] Stopped target Remote File Systems.' },
  { text: '[  OK  ] Stopped target Network Online.' },
  { text: '[  OK  ] Stopped Network Time Synchronization.' },
  { text: '[  OK  ] Stopped Avahi mDNS/DNS-SD Stack.' },
  { text: '[  OK  ] Stopped WPA supplicant.' },
  { text: '', delay: 400 },
  { text: '    >> Unmounting filesystems...', color: '#F59E0B' },
  { text: '', delay: 300 },
  { text: '[  OK  ] Unmounted /dev/hugepages.' },
  { text: '[  OK  ] Unmounted /dev/shm.' },
  { text: '[  OK  ] Unmounted /run/user/1000.' },
  { text: '[  OK  ] Unmounted /tmp.' },
  { text: '[  OK  ] Unmounted /boot/efi.' },
  { text: '[  OK  ] Unmounted /home.' },
  { text: '[  OK  ] Unmounted /var/log.' },
  { text: '', delay: 500 },
  { text: '    >> Stopping services...', color: '#F59E0B' },
  { text: '', delay: 400 },
  { text: '[  OK  ] Stopped Hyprland Desktop Environment.' },
  { text: '[  OK  ] Stopped Session c1 of User user.' },
  { text: '[  OK  ] Removed slice User Sessions.' },
  { text: '[  OK  ] Stopped User Login Management.' },
  { text: '[  OK  ] Stopped D-Bus System Message Bus.' },
  { text: '[  OK  ] Stopped Network Manager.' },
  { text: '', delay: 300 },
  { text: '    >> Deactivating storage...', color: '#F59E0B' },
  { text: '', delay: 400 },
  { text: '[  OK  ] Stopped target Local File Systems.' },
  { text: '[  OK  ] Stopped target Local File Systems (Pre).' },
  { text: '[  OK  ] Stopped Monitoring of LVM2 mirrors...' },
  { text: '[  OK  ] Stopped Create Static Device Nodes in /dev.' },
  { text: '[  OK  ] Stopped Rule-based Manager for Device Events and Files.' },
  { text: '', delay: 500 },
  { text: '[  OK  ] Reached target System Shutdown.' },
  { text: '[  OK  ] Reached target Late Shutdown Services.' },
  { text: '[  OK  ] Finished System Reboot.' },
  { text: '[  OK  ] Reached target System Reboot.' },
  { text: '', delay: 400 },
  { text: 'systemd-shutdown[1]: Syncing filesystems and block devices.' },
  { text: 'systemd-shutdown[1]: Sending SIGTERM to remaining processes...' },
  { text: 'systemd-shutdown[1]: Sending SIGKILL to remaining processes...' },
  { text: '', delay: 600 },
  { text: '    >> Rebooting...', color: '#F59E0B' },
  { text: '' },
  { text: '[  OK  ] Hardware watchdog shutdown' },
  { text: 'reboot: Restarting system' },
  { text: '' },
];

export default function RestartScreen({ onComplete }: { onComplete: () => void }) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentIndex >= RESTART_LOGS.length) {
      setTimeout(onComplete, 500);
      return;
    }

    const log = RESTART_LOGS[currentIndex];
    const delay = log.delay || (log.text === '' ? 80 : Math.random() * 60 + 20);

    const timer = setTimeout(() => {
      setLogs(prev => [...prev, log]);
      setCurrentIndex(prev => prev + 1);
    }, delay);

    return () => clearTimeout(timer);
  }, [currentIndex, onComplete]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  const isDone = currentIndex >= RESTART_LOGS.length;

  return (
    <div className="fixed inset-0 bg-black z-[99999] font-mono text-xs select-none">
      <div ref={containerRef} className="absolute inset-0 overflow-auto p-4 pb-20">
        <div className="space-y-0 leading-5">
          {logs.map((log, i) => (
            <div
              key={i}
              className="whitespace-pre-wrap break-all"
              style={{ color: log.color || (log.text.startsWith('[') ? '#A0A0A0' : '#E0E0E0') }}
            >
              {log.text}
            </div>
          ))}
          {!isDone && (
            <span className="inline-block w-2 h-4 bg-yellow-400 animate-pulse align-middle" />
          )}
        </div>
      </div>

      {/* Flash to black effect for reboot */}
      {isDone && (
        <div className="absolute inset-0 animate-flash-black pointer-events-none" style={{
          animation: 'flashBlack 0.8s ease-out forwards',
        }} />
      )}
    </div>
  );
}
