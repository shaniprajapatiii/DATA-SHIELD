import { useState, useCallback } from 'react';

// Mock NLP risk analysis (replace with real API call)
function mockAnalyze(url) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const score = Math.floor(Math.random() * 100);
      const permissions = [
        { type: 'camera', status: score > 60 ? 'active' : 'idle', app: url },
        { type: 'location', status: score > 40 ? 'requested' : 'idle', app: url },
        { type: 'microphone', status: score > 70 ? 'active' : 'idle', app: url },
        { type: 'clipboard', status: score > 50 ? 'active' : 'idle', app: url },
        { type: 'storage', status: score > 30 ? 'requested' : 'idle', app: url },
      ];
      const redFlags = score > 70
        ? ['Sells data to 3rd parties', 'No data deletion mechanism', 'Unlimited retention period']
        : score > 40
        ? ['Shares data with partners', '12-month retention', 'Limited opt-out options']
        : ['Strong encryption', '90-day retention', 'Clear opt-out process'];

      resolve({
        url,
        score,
        sentiment: score > 60 ? 'Hostile' : score > 35 ? 'Neutral' : 'Protective',
        permissions,
        redFlags,
        summary: {
          collected: score > 60 ? 'Extensive: location, contacts, behavior, device ID' : 'Minimal: email, usage data',
          sharedWith: score > 60 ? '47 advertising partners, data brokers' : 'No third parties',
          retainedFor: score > 60 ? 'Indefinitely' : '90 days after account deletion',
        },
        trackers: score > 50 ? ['Google Analytics', 'Facebook Pixel', 'Hotjar'] : ['Google Analytics'],
        ssl: true,
        gdprCompliant: score < 50,
      });
    }, 2200);
  });
}

export function useScanner() {
  const [state, setState] = useState({
    loading: false,
    result: null,
    error: null,
    progress: 0,
  });

  const scan = useCallback(async (url) => {
    setState({ loading: true, result: null, error: null, progress: 0 });

    // Simulate progress
    const steps = [
      [300, 15, 'Connecting to target...'],
      [600, 35, 'Fetching privacy policy...'],
      [900, 55, 'Running NLP analysis...'],
      [1200, 75, 'Scanning permissions...'],
      [1600, 90, 'Calculating risk score...'],
    ];

    const timers = steps.map(([delay, prog]) =>
      setTimeout(() => setState(s => ({ ...s, progress: prog })), delay)
    );

    try {
      const result = await mockAnalyze(url);
      timers.forEach(clearTimeout);
      setState({ loading: false, result, error: null, progress: 100 });
    } catch (err) {
      timers.forEach(clearTimeout);
      setState({ loading: false, result: null, error: err.message, progress: 0 });
    }
  }, []);

  const reset = useCallback(() => {
    setState({ loading: false, result: null, error: null, progress: 0 });
  }, []);

  return { ...state, scan, reset };
}
