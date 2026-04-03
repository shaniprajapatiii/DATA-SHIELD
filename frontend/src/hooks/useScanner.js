import { useState, useCallback } from 'react';
import { scanPermissionsOnly, scanWebsite } from '../utils/api';

function hashString(input) {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = ((hash << 5) - hash) + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function buildMockFallbackResult(url, reason = 'Unable to fetch live data') {
  const seed = hashString(`${url}-${reason}`);
  const baseScore = 40 + (seed % 45); // 40..84
  const riskLabel = baseScore > 80 ? 'critical' : baseScore > 60 ? 'high' : baseScore > 40 ? 'moderate' : 'low';

  const permissions = [
    { type: 'camera',       status: baseScore > 68 ? 'active' : 'requested' },
    { type: 'location',     status: baseScore > 55 ? 'active' : 'requested' },
    { type: 'microphone',   status: baseScore > 72 ? 'active' : 'requested' },
    { type: 'clipboard',    status: baseScore > 50 ? 'requested' : 'idle' },
    { type: 'storage',      status: 'requested' },
    { type: 'notifications',status: baseScore > 45 ? 'requested' : 'idle' },
    { type: 'contacts',     status: baseScore > 75 ? 'active' : 'idle' },
    { type: 'bluetooth',    status: baseScore > 70 ? 'requested' : 'idle' },
    { type: 'usb',          status: baseScore > 78 ? 'requested' : 'idle' },
    { type: 'sensors',      status: baseScore > 58 ? 'requested' : 'idle' },
  ].map((perm) => ({ ...perm, app: url }));

  const redFlags = [
    'Mock analysis enabled due to unavailable live fetch data.',
    'Permission/API patterns indicate potential data collection behavior.',
    'Run a live scan again when policy/URL is reachable for verified findings.',
  ];

  return {
    url,
    score: baseScore,
    riskLabel,
    partial: true,
    fallbackReason: 'mock_fallback',
    targetUrl: url,
    pageTitle: 'Mock Risk Analysis',
    policyUrl: '',
    engineVersion: 'mock-1.0.0',
    scanDurationMs: null,
    sentiment: baseScore > 65 ? 'Hostile' : baseScore > 45 ? 'Neutral' : 'Protective',
    permissions,
    redFlags,
    policyFindings: [
      `fetch_status: ${reason}`,
      'analysis_mode: mock_nlp_permission_risk',
    ],
    scoreBreakdown: [
      { label: 'permission score', value: Math.min(100, baseScore + 8) },
      { label: 'sentiment score', value: baseScore },
      { label: 'red flag score', value: Math.max(30, baseScore - 5) },
      { label: 'transparency score', value: Math.max(10, 100 - baseScore) },
    ],
    summary: {
      tldr: `Live policy/URL fetch failed. Showing mock NLP permission-risk estimate (${baseScore}/100).`,
      bullets: [
        'Includes camera, location, microphone, clipboard, storage, and related permission signals.',
        'This is a fallback estimate and not a verified policy extraction result.',
      ],
      collected: 'Estimated from mock permission profile',
      sharedWith: 'Unknown (live policy unavailable)',
      retainedFor: 'Unknown (live policy unavailable)',
    },
    trackers: permissions.map((p) => p.type),
    ssl: false,
    gdprCompliant: false,
  };
}

function normalizePermission(permission) {
  const type = permission?.name || permission?.type || 'unknown';
  const rawRisk = permission?.risk || 'medium';
  const statusMap = {
    critical: 'active',
    high: 'active',
    medium: 'requested',
    low: 'idle',
    safe: 'blocked',
  };

  return {
    type,
    status: permission?.status || statusMap[rawRisk] || 'requested',
    app: permission?.app || permission?.url || '',
  };
}

function normalizePolicyFindings(findings) {
  if (!findings || typeof findings !== 'object') return [];

  return Object.entries(findings)
    .flatMap(([key, value]) => {
      if (Array.isArray(value)) {
        return value.map((item) => `${key}: ${typeof item === 'string' ? item : JSON.stringify(item)}`);
      }

      if (value && typeof value === 'object') {
        return [`${key}: ${JSON.stringify(value)}`];
      }

      if (value != null && value !== '') {
        return [`${key}: ${String(value)}`];
      }

      return [];
    })
    .filter(Boolean);
}

function normalizeBreakdown(breakdown) {
  if (!breakdown || typeof breakdown !== 'object') return [];

  return Object.entries(breakdown).map(([key, value]) => ({
    label: key.replace(/_/g, ' '),
    value: typeof value === 'number' ? value : String(value),
  }));
}

function normalizeResult(url, data) {
  const score = Number(data?.risk_score ?? data?.score ?? 0);
  const label = data?.risk_label || (score > 60 ? 'high' : score > 35 ? 'moderate' : 'low');
  const sentimentValue = data?.sentiment?.overall || data?.sentiment || (score > 60 ? 'Hostile' : score > 35 ? 'Neutral' : 'Protective');
  const sentiment = typeof sentimentValue === 'string'
    ? sentimentValue.charAt(0).toUpperCase() + sentimentValue.slice(1)
    : 'Neutral';

  const redFlags = Array.isArray(data?.red_flags)
    ? data.red_flags.map((flag) => flag?.explanation || flag?.clause || flag?.category || String(flag)).filter(Boolean)
    : Array.isArray(data?.redFlags)
      ? data.redFlags
      : [];

  const summary = data?.summary || {};
  const trackers = Array.isArray(data?.trackers)
    ? data.trackers
    : Array.isArray(data?.permissions)
      ? data.permissions.map((perm) => perm?.name || perm?.type).filter(Boolean)
      : [];

  return {
    url,
    score,
    riskLabel: label,
    partial: Boolean(data?.partial),
    fallbackReason: data?.fallback_reason || null,
    targetUrl: data?.target_url || url,
    pageTitle: data?.page_title || '',
    policyUrl: data?.policy_url || '',
    engineVersion: data?.engine_version || '',
    scanDurationMs: data?.scan_duration_ms ?? null,
    sentiment,
    permissions: Array.isArray(data?.permissions) ? data.permissions.map(normalizePermission) : [],
    redFlags,
    policyFindings: normalizePolicyFindings(data?.policy_findings),
    scoreBreakdown: normalizeBreakdown(data?.score_breakdown),
    summary: {
      tldr: summary.tldr || summary.summary || 'No summary available',
      bullets: Array.isArray(summary.bullets) ? summary.bullets : [],
      collected: summary.collected || 'Unknown',
      sharedWith: summary.sharedWith || 'Unknown',
      retainedFor: summary.retainedFor || 'Unknown',
    },
    trackers,
    ssl: data?.ssl ?? true,
    gdprCompliant: data?.gdprCompliant ?? score < 50,
  };
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
      const { data } = await scanWebsite(url);
      const result = normalizeResult(url, data);
      timers.forEach(clearTimeout);
      setState({ loading: false, result, error: null, progress: 100 });
    } catch (err) {
      const rawMessage = err?.response?.data?.detail || err?.response?.data?.error || err?.message || 'Scan failed';
      const isPolicyMissing = typeof rawMessage === 'string' && rawMessage.toLowerCase().includes('could not extract policy text');

      if (isPolicyMissing) {
        try {
          const { data } = await scanPermissionsOnly(url);
          const fallbackResult = normalizeResult(url, data);
          timers.forEach(clearTimeout);
          setState({ loading: false, result: fallbackResult, error: null, progress: 100 });
          return;
        } catch (fallbackErr) {
          const fallbackMessage = fallbackErr?.response?.data?.detail || fallbackErr?.response?.data?.error || fallbackErr?.message || rawMessage;
          timers.forEach(clearTimeout);
          setState({
            loading: false,
            result: buildMockFallbackResult(url, fallbackMessage),
            error: null,
            progress: 100,
          });
          return;
        }
      }

      timers.forEach(clearTimeout);
      setState({
        loading: false,
        result: buildMockFallbackResult(url, rawMessage),
        error: null,
        progress: 100,
      });
    }
  }, []);

  const reset = useCallback(() => {
    setState({ loading: false, result: null, error: null, progress: 0 });
  }, []);

  return { ...state, scan, reset };
}
