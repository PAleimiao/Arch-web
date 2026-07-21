import { useState, useEffect, useRef } from 'react';

interface LogEntry {
  text: string;
  color?: string;
  delay?: number;
}

const SHUTDOWN_LOGS: LogEntry[] = [
  { text: '' },
  { text: '    >> Stopping services...', color: '#EF4444' },
  { text: '' },
  { text: '[  OK  ] Stopped target Network.' },
  { text: '[  OK  ] Stopped target Remote File Systems.' },
  { text: '[  OK  ] Stopped target Network Online.' },
  { text: '[  OK  ] Stopped Network Time Synchronization.' },
  { text: '[  OK  ] Stopped Avahi mDNS/DNS-SD Stack.' },
  { text: '[  OK  ] Stopped WPA supplicant.' },
  { text: '[  OK  ] Stopped dhcpcd on all interfaces.' },
  { text: '', delay: 400 },
  { text: '    >> Unmounting filesystems...', color: '#EF4444' },
  { text: '', delay: 300 },
  { text: '[  OK  ] Unmounted /dev/hugepages.' },
  { text: '[  OK  ] Unmounted /dev/shm.' },
  { text: '[  OK  ] Unmounted /run/user/1000.' },
  { text: '[  OK  ] Unmounted /tmp.' },
  { text: '[  OK  ] Unmounted /boot/efi.' },
  { text: '[  OK  ] Unmounted /home.' },
  { text: '[  OK  ] Unmounted /var/log.' },
  { text: '[  OK  ] Stopped Remount Root and Kernel File Systems.' },
  { text: '', delay: 500 },
  { text: '    >> Stopping remaining processes...', color: '#EF4444' },
  { text: '', delay: 400 },
  { text: '[  OK  ] Removed slice User Slice of UID 1000.' },
  { text: '[  OK  ] Removed slice system-modprobe.slice.' },
  { text: '[  OK  ] Removed slice system-getty.slice.' },
  { text: '[  OK  ] Stopped Hyprland Desktop Environment.' },
  { text: '[  OK  ] Stopped Session c1 of User user.' },
  { text: '[  OK  ] Removed slice User Sessions.' },
  { text: '', delay: 300 },
  { text: '[  OK  ] Stopped target Timer Units.' },
  { text: '[  OK  ] Stopped Daily Cleanup of Temporary Directories.' },
  { text: '[  OK  ] Stopped Periodic Pacman Cache Cleanup.' },
  { text: '[  OK  ] Stopped Daily rotation of log files.' },
  { text: '[  OK  ] Stopped Daily man-db regeneration.' },
  { text: '', delay: 400 },
  { text: '    >> Deactivating swap...', color: '#EF4444' },
  { text: '', delay: 300 },
  { text: '[  OK  ] Stopped target Swap.' },
  { text: '[  OK  ] Deactivated swap /dev/zram0.' },
  { text: '[  OK  ] Deactivated swap /dev/nvme0n1p3.' },
  { text: '', delay: 500 },
  { text: '    >> Stopping storage...', color: '#EF4444' },
  { text: '', delay: 400 },
  { text: '[  OK  ] Stopped Monitoring of LVM2 mirrors, snapshots etc. using dmeventd or progress polling.' },
  { text: '[  OK  ] Stopped target Local File Systems (Pre).' },
  { text: '[  OK  ] Stopped Remount Root and Kernel File Systems.' },
  { text: '[  OK  ] Stopped Create Static Device Nodes in /dev.' },
  { text: '[  OK  ] Stopped Rule-based Manager for Device Events and Files.' },
  { text: '', delay: 600 },
  { text: '    >> Unmounting root filesystem...', color: '#EF4444' },
  { text: '', delay: 500 },
  { text: '[  OK  ] Unmounted /dev/nvme0n1p2.' },
  { text: '[  OK  ] Reached target Unmount All Filesystems.' },
  { text: '[  OK  ] Stopped target Local File Systems.' },
  { text: '', delay: 400 },
  { text: '    >> Final shutdown...', color: '#EF4444' },
  { text: '', delay: 500 },
  { text: '[  OK  ] Reached target System Shutdown.' },
  { text: '[  OK  ] Reached target Late Shutdown Services.' },
  { text: '[  OK  ] Finished System Power Off.' },
  { text: '[  OK  ] Reached target System Power Off.' },
  { text: '', delay: 300 },
  { text: 'systemd-shutdown[1]: Syncing filesystems and block devices.' },
  { text: 'systemd-shutdown[1]: Sending SIGTERM to remaining processes...' },
  { text: 'systemd-journald[342]: Received SIGTERM from PID 1 (systemd-shutdow).' },
  { text: 'systemd-shutdown[1]: Sending SIGKILL to remaining processes...' },
  { text: '', delay: 600 },
  { text: '    >> Powering off...', color: '#EF4444' },
  { text: '' },
];

export default function ShutdownScreen({ onComplete }: { onComplete: () => void }) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentIndex >= SHUTDOWN_LOGS.length) {
      setTimeout(onComplete, 1000);
      return;
    }

    const log = SHUTDOWN_LOGS[currentIndex];
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

  const isDone = currentIndex >= SHUTDOWN_LOGS.length;

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
            <span className="inline-block w-2 h-4 bg-red-400 animate-pulse align-middle" />
          )}
        </div>
      </div>

      {/* CRT power off effect */}
      {isDone && (
        <div className="absolute inset-0 animate-crtOff pointer-events-none" style={{
          background: 'white',
          animation: 'crtOff 0.5s ease-in forwards',
        }} />
      )}
    </div>
  );
}
