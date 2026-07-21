import { useState, useEffect, useCallback } from 'react';
import { useDesktopStore } from '@/store/desktopStore';
import TopBar from '@/components/TopBar';
import Dock from '@/components/Dock';
import AppLauncher from '@/components/AppLauncher';
import WindowComponent from '@/components/Window';
import ContextMenu from '@/components/ContextMenu';
import LockScreen from '@/components/LockScreen';
import AppRenderer from '@/apps/AppRenderer';
import BootScreen from '@/components/BootScreen';
import ShutdownScreen from '@/components/ShutdownScreen';
import RestartScreen from '@/components/RestartScreen';

type PowerState = 'booting' | 'running' | 'locked' | 'shutting-down' | 'restarting' | 'off';

function App() {
  const { windows, setContextMenu, openWindow, setLauncherOpen, isLauncherOpen } = useDesktopStore();
  const [powerState, setPowerState] = useState<PowerState>('booting');
  const [bootKey, setBootKey] = useState(0);

  // After boot completes -> locked state
  const handleBootComplete = useCallback(() => {
    setPowerState('locked');
  }, []);

  // Unlock -> running
  const handleUnlock = useCallback(() => {
    setPowerState('running');
  }, []);

  // Shutdown flow
  const handleShutdown = useCallback(() => {
    setPowerState('shutting-down');
  }, []);

  // Restart flow
  const handleRestart = useCallback(() => {
    setPowerState('restarting');
  }, []);

  // After shutdown completes -> off
  const handleShutdownComplete = useCallback(() => {
    setPowerState('off');
  }, []);

  // After restart completes -> boot again
  const handleRestartComplete = useCallback(() => {
    setBootKey(k => k + 1);
    setPowerState('booting');
  }, []);

  // Power on from off state
  const handlePowerOn = useCallback(() => {
    setBootKey(k => k + 1);
    setPowerState('booting');
  }, []);

  // Auto-lock after 5 min inactivity
  useEffect(() => {
    if (powerState !== 'running') return;

    let timeout: ReturnType<typeof setTimeout>;
    const resetTimer = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => setPowerState('locked'), 5 * 60 * 1000);
    };
    const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach(e => document.addEventListener(e, resetTimer));
    resetTimer();
    return () => {
      clearTimeout(timeout);
      events.forEach(e => document.removeEventListener(e, resetTimer));
    };
  }, [powerState]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    if (powerState !== 'running') return;
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, visible: true });
  }, [setContextMenu, powerState]);

  const handleClick = useCallback(() => {
    setContextMenu(null);
  }, [setContextMenu]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (powerState !== 'running') return;
      if (e.ctrlKey && e.altKey && e.key === 't') {
        e.preventDefault();
        openWindow('terminal', '终端', 700, 450);
      }
      if (e.altKey && e.key === 'F4') {
        e.preventDefault();
        const { activeWindowId, closeWindow } = useDesktopStore.getState();
        if (activeWindowId) closeWindow(activeWindowId);
      }
      if (e.key === 'Meta' || e.key === 'Super') {
        e.preventDefault();
        setLauncherOpen(!isLauncherOpen);
      }
      if (e.key === 'l' && e.ctrlKey) {
        e.preventDefault();
        setPowerState('locked');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [powerState, openWindow, setLauncherOpen, isLauncherOpen]);

  // Boot screen
  if (powerState === 'booting') {
    return <BootScreen key={bootKey} onComplete={handleBootComplete} />;
  }

  // Lock screen
  if (powerState === 'locked') {
    return <LockScreen onUnlock={handleUnlock} />;
  }

  // Shutdown screen
  if (powerState === 'shutting-down') {
    return <ShutdownScreen onComplete={handleShutdownComplete} />;
  }

  // Restart screen
  if (powerState === 'restarting') {
    return <RestartScreen onComplete={handleRestartComplete} />;
  }

  // Power off screen (press to turn on)
  if (powerState === 'off') {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center cursor-pointer"
        onClick={handlePowerOn}>
        <img src="/icons/arch-logo.png" alt="Arch"
          className="w-16 h-16 mb-4 opacity-30 hover:opacity-60 transition-opacity"
          style={{ filter: 'drop-shadow(0 0 20px rgba(0,180,216,0.3))' }} />
        <div className="text-xs text-muted-foreground font-mono">Arch Linux Web Simulator</div>
        <div className="text-xs text-gray-600 mt-4 animate-pulse">点击开机</div>
      </div>
    );
  }

  // Main desktop
  return (
    <div className="fixed inset-0 overflow-hidden" onContextMenu={handleContextMenu} onClick={handleClick}>
      {/* Video Background */}
      <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover" style={{ zIndex: 0 }}>
        <source src="/videos/wallpaper.mp4" type="video/mp4" />
      </video>

      {/* Dark overlay vignette */}
      <div className="absolute inset-0 pointer-events-none" style={{
        zIndex: 1,
        background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0, 18, 51, 0.7) 100%)'
      }} />

      {/* Desktop Environment */}
      <div className="relative z-10 w-full h-full flex flex-col">
        <TopBar onShutdown={handleShutdown} onRestart={handleRestart} />

        <div className="flex-1 relative">
          {windows.map(win => (
            <WindowComponent key={win.id} window={win}>
              <AppRenderer appId={win.appId} windowId={win.id} />
            </WindowComponent>
          ))}

          <AppLauncher />
          <ContextMenu />
        </div>

        <Dock />
      </div>
    </div>
  );
}

export default App;
