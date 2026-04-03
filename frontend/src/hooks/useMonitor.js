import { useState, useEffect, useRef } from 'react';

const PERMISSION_TYPES = ['microphone', 'camera', 'location', 'clipboard', 'contacts', 'storage', 'notifications', 'network'];
const APPS = ['SocialShare', 'VoiceAssistant', 'Maps', 'Messenger', 'Notes', 'Analytics', 'News', 'Browser'];
const STATUSES = ['active', 'requested', 'blocked', 'idle'];

function randomPermissionEvent() {
  return {
    id: Date.now() + Math.random(),
    type: PERMISSION_TYPES[Math.floor(Math.random() * PERMISSION_TYPES.length)],
    status: STATUSES[Math.floor(Math.random() * STATUSES.length)],
    app: APPS[Math.floor(Math.random() * APPS.length)],
    timestamp: new Date().toLocaleTimeString(),
    pulse: Math.random() > 0.5,
  };
}

export function useMonitor(active = true) {
  const [permissions, setPermissions] = useState(() =>
    Array.from({ length: 5 }, randomPermissionEvent)
  );
  const [alerts, setAlerts] = useState([]);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!active) return;

    intervalRef.current = setInterval(() => {
      const event = randomPermissionEvent();
      setPermissions(prev => [event, ...prev.slice(0, 9)]);
      if (event.status === 'active') {
        setAlerts(prev => [
          { ...event, message: `${event.app} accessed your ${event.type}` },
          ...prev.slice(0, 4),
        ]);
      }
    }, 2500);

    return () => clearInterval(intervalRef.current);
  }, [active]);

  const blockPermission = (id) => {
    setPermissions(prev =>
      prev.map(p => p.id === id ? { ...p, status: 'blocked' } : p)
    );
  };

  return { permissions, alerts, blockPermission };
}
