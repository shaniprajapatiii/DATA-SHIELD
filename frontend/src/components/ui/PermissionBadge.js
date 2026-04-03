import React from 'react';
import { Mic, Camera, MapPin, Clipboard, Phone, HardDrive, Wifi, Bell } from 'lucide-react';

const iconMap = {
  microphone: Mic,
  camera: Camera,
  location: MapPin,
  clipboard: Clipboard,
  contacts: Phone,
  storage: HardDrive,
  network: Wifi,
  notifications: Bell,
};

const statusColors = {
  active: '#ff2d55',
  blocked: '#00ff88',
  requested: '#ff6b00',
  idle: '#475569',
};

export default function PermissionBadge({ type = 'camera', status = 'active', app = 'Unknown', pulse = false }) {
  const Icon = iconMap[type] || Camera;
  const color = statusColors[status] || statusColors.idle;

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-sm border transition-all duration-300"
      style={{
        borderColor: `${color}30`,
        background: `${color}08`,
        boxShadow: pulse ? `0 0 15px ${color}30` : 'none',
      }}
    >
      {/* Pulse dot */}
      <div className="relative flex-shrink-0">
        <div
          className="w-2 h-2 rounded-full"
          style={{ background: color }}
        />
        {pulse && status === 'active' && (
          <div
            className="absolute inset-0 w-2 h-2 rounded-full animate-ping"
            style={{ background: color, opacity: 0.5 }}
          />
        )}
      </div>

      <Icon size={14} style={{ color }} />

      <div className="flex-1 min-w-0">
        <p className="font-mono text-xs font-semibold text-white capitalize">{type}</p>
        <p className="font-mono text-xs text-slate-500 truncate">{app}</p>
      </div>

      <span
        className="font-mono text-xs uppercase tracking-wider flex-shrink-0"
        style={{ color }}
      >
        {status}
      </span>
    </div>
  );
}
