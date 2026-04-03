// popup.js — DataShield Extension

const RISK_COLORS = {
  low: '#00ff88',
  medium: '#ff6b00',
  high: '#ff2d55',
};

function getRiskLevel(score) {
  if (score <= 30) return { level: 'low', label: 'LOW RISK', color: RISK_COLORS.low, desc: 'This site appears privacy-friendly.' };
  if (score <= 65) return { level: 'medium', label: 'MEDIUM RISK', color: RISK_COLORS.medium, desc: 'Some data-sharing practices detected.' };
  return { level: 'high', label: 'HIGH RISK', color: RISK_COLORS.high, desc: 'Significant privacy violations detected!' };
}

function setScore(score) {
  const circumference = 175.9;
  const offset = circumference - (score / 100) * circumference;
  const risk = getRiskLevel(score);

  document.getElementById('scoreNum').textContent = score;
  document.getElementById('scoreNum').style.color = risk.color;
  document.getElementById('scoreArc').style.strokeDashoffset = offset;
  document.getElementById('scoreArc').style.stroke = risk.color;
  document.getElementById('scoreArc').style.filter = `drop-shadow(0 0 4px ${risk.color})`;

  const badge = document.getElementById('riskBadge');
  badge.textContent = risk.label;
  badge.style.color = risk.color;
  badge.style.background = risk.color + '18';
  badge.style.border = `1px solid ${risk.color}40`;

  document.getElementById('riskDesc').textContent = risk.desc;
}

function renderPermissions(permissions) {
  const list = document.getElementById('permList');
  if (!permissions || permissions.length === 0) {
    list.innerHTML = '<div style="color:#475569; font-size:11px; padding:8px 0;">No permissions detected.</div>';
    return;
  }

  list.innerHTML = permissions.map(p => {
    const colors = { active: '#ff2d55', blocked: '#00ff88', idle: '#475569', requested: '#ff6b00' };
    const color = colors[p.status] || '#475569';
    return `
      <div class="perm-item">
        <div class="perm-dot" style="background:${color}; box-shadow: 0 0 4px ${color}"></div>
        <span class="perm-name">${p.type}</span>
        <span class="perm-status ${p.status}">${p.status.toUpperCase()}</span>
      </div>
    `;
  }).join('');
}

async function triggerScan() {
  const btn = document.getElementById('scanBtn');
  btn.disabled = true;
  btn.textContent = '⏳ SCANNING...';

  // Get current tab URL
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const url = tab?.url || '';

  document.getElementById('currentUrl').textContent = url;
  document.getElementById('riskDesc').textContent = 'Running NLP analysis...';

  // Simulate scan (replace with real API call to your Node backend)
  setTimeout(() => {
    const mockScore = Math.floor(Math.random() * 100);
    const mockPerms = [
      { type: 'Camera', status: mockScore > 60 ? 'active' : 'idle' },
      { type: 'Microphone', status: mockScore > 70 ? 'active' : 'idle' },
      { type: 'Location', status: mockScore > 40 ? 'requested' : 'idle' },
      { type: 'Clipboard', status: mockScore > 50 ? 'active' : 'idle' },
      { type: 'Storage', status: 'requested' },
    ];

    setScore(mockScore);
    renderPermissions(mockPerms);

    btn.disabled = false;
    btn.textContent = '⚡ RE-SCAN';

    // Save to storage
    chrome.storage.local.set({ lastScan: { url, score: mockScore, permissions: mockPerms, timestamp: Date.now() } });

    // Notify if high risk
    if (mockScore > 70) {
      chrome.runtime.sendMessage({
        type: 'HIGH_RISK_ALERT',
        url,
        score: mockScore,
      });
    }
  }, 2000);
}

// On load
document.addEventListener('DOMContentLoaded', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  document.getElementById('currentUrl').textContent = tab?.url || 'Unknown';

  // Load cached scan
  chrome.storage.local.get(['lastScan'], (result) => {
    if (result.lastScan && result.lastScan.url === tab?.url) {
      setScore(result.lastScan.score);
      renderPermissions(result.lastScan.permissions);
    }
  });
});
