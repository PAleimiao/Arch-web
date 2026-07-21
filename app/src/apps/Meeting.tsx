import { Mic, MicOff, Camera, CameraOff, PhoneOff, MonitorUp } from 'lucide-react';
import { useState } from 'react';

export default function Meeting() {
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [screenOn, setScreenOn] = useState(false);

  return (
    <div className="w-full h-full flex flex-col" style={{ background: '#1A1A2E' }}>
      {/* Video Grid */}
      <div className="flex-1 grid grid-cols-2 gap-2 p-3">
        <div className="rounded-xl flex items-center justify-center relative" style={{ background: 'rgba(0,40,85,0.5)' }}>
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-2xl font-bold">我</div>
          {camOn && <div className="absolute inset-2 rounded-xl border border-cyan-400/20" />}
          <span className="absolute bottom-2 left-2 text-xs bg-black/50 px-2 py-0.5 rounded">我</span>
        </div>
        <div className="rounded-xl flex items-center justify-center relative" style={{ background: 'rgba(0,40,85,0.5)' }}>
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-2xl font-bold">A</div>
          <span className="absolute bottom-2 left-2 text-xs bg-black/50 px-2 py-0.5 rounded">Alice</span>
        </div>
        <div className="rounded-xl flex items-center justify-center relative" style={{ background: 'rgba(0,40,85,0.5)' }}>
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-2xl font-bold">B</div>
          <span className="absolute bottom-2 left-2 text-xs bg-black/50 px-2 py-0.5 rounded">Bob</span>
        </div>
        <div className="rounded-xl flex items-center justify-center relative" style={{ background: 'rgba(0,40,85,0.5)' }}>
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-2xl font-bold">C</div>
          <span className="absolute bottom-2 left-2 text-xs bg-black/50 px-2 py-0.5 rounded">Carol</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 py-4 border-t border-white/5">
        <button onClick={() => setMicOn(!micOn)} className={`p-3 rounded-full ${micOn ? 'bg-white/10 hover:bg-white/20' : 'bg-red-500/20 hover:bg-red-500/30'}`}>
          {micOn ? <Mic size={20} /> : <MicOff size={20} className="text-red-400" />}
        </button>
        <button onClick={() => setCamOn(!camOn)} className={`p-3 rounded-full ${camOn ? 'bg-white/10 hover:bg-white/20' : 'bg-red-500/20 hover:bg-red-500/30'}`}>
          {camOn ? <Camera size={20} /> : <CameraOff size={20} className="text-red-400" />}
        </button>
        <button onClick={() => setScreenOn(!screenOn)} className={`p-3 rounded-full ${screenOn ? 'bg-cyan-500/20' : 'bg-white/10 hover:bg-white/20'}`}>
          <MonitorUp size={20} className={screenOn ? 'text-cyan-400' : ''} />
        </button>
        <button className="p-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors">
          <PhoneOff size={20} className="text-white" />
        </button>
      </div>
    </div>
  );
}
