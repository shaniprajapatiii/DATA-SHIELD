/**
 * DataShield – popup.js
 * Popup script logic for the extension
 */

let currentResult = null;

// ── Initialize Popup ──────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  await populateCurrentUrl();
  await loadAndDisplayResult();
  setupTabSwitching();
  setupButtonHandlers();
});

// ── Get current tab URL and display it ─────────────────────────────────────────
async function populateCurrentUrl() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.url) {
    document.getElementById('currentUrl').textContent = new URL(tab.url).hostname;
  }
}

// ── Load and display the latest scan result ────────────────────────────────────
async function loadAndDisplayResult() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.url) {
      showAuthPrompt();
      return;
    }

    // Get cached result or trigger new scan
    chrome.runtime.sendMessage(
      { type: 'GET_CACHED_RESULT', url: tab.url },
      (result) => {
        if (result && result.risk_score != null) {
          displayResult(result);
        } else {
          showAuthPrompt();
        }
      }
    );
  } catch (err) {
    showAuthPrompt();
  }
}

// ── Display scan result in popup ───────────────────────────────────────────────
function displayResult(result) {
  currentResult = result;

  // Hide loading, show results
  document.getElementById('loadingState').style.display = 'none';
  document.getElementById('authPrompt').style.display = 'none';
  document.getElementById('resultsState').style.display = 'block';

  // Update score ring
  const score = result.risk_score || 0;
  const label = result.risk_label || 'moderate';
  const colors = {
    safe:     '#22c55e',
    low:      '#84cc16',
    moderate: '#eab308',
    high:     '#f97316',
    critical: '#ef4444',
  };
  const color = colors[label] || '#38bdf8';

  document.getElementById('scoreNumber').textContent = Math.round(score);
  document.getElementById('scoreRingFill').style.stroke = color;

  const circumference = 314;
  const offset = ((100 - score) / 100) * circumference;
  document.getElementById('scoreRingFill').style.strokeDashoffset = offset;

  // Update badge
  const badgeEl = document.getElementById('riskBadge');
  badgeEl.textContent = label.toUpperCase();
  badgeEl.style.background = color + '22';
  badgeEl.style.color = color;
  badgeEl.style.border = `1px solid ${color}`;

  // Populate permissions
  populatePermissions(result.permissions || []);

  // Populate red flags
  populateRedFlags(result.redFlags || []);

  // Populate summary
  populateSummary(result.summary || {});
}

// ── Populate permission list ───────────────────────────────────────────────────
function populatePermissions(permissions) {
  const container = document.getElementById('permissionList');
  container.innerHTML = '';

  if (permissions.length === 0) {
    container.innerHTML = '<div style="color:#64748b;font-size:12px;">No permissions detected</div>';
    return;
  }

  const icons = {
    microphone:    '🎤',
    camera:        '📹',
    location:      '📍',
    clipboard:     '📋',
    notifications: '🔔',
    sensors:       '📊',
    bluetooth:     '🔵',
    usb:           '🔌',
  };

  permissions.forEach((perm) => {
    const el = document.createElement('div');
    el.className = 'permission-item';
    el.innerHTML = `
      <div class="perm-icon">${icons[perm.name] || '⚙'}</div>
      <div class="perm-name">${perm.name}</div>
      <div class="perm-risk risk-${perm.risk || 'low'}">${perm.risk || 'N/A'}</div>
    `;
    container.appendChild(el);
  });
}

// ── Populate red flags list ────────────────────────────────────────────────────
function populateRedFlags(redFlags) {
  const container = document.getElementById('redFlagList');
  container.innerHTML = '';

  if (redFlags.length === 0) {
    container.innerHTML = '<div style="color:#64748b;font-size:12px;">No red flags detected</div>';
    return;
  }

  redFlags.forEach((flag) => {
    const el = document.createElement('div');
    el.className = `red-flag-item flag-${flag.severity || 'info'}`;
    el.innerHTML = `
      <div class="flag-category">${flag.category || 'General'}</div>
      <div class="flag-explanation">${flag.explanation || flag.clause || ''}</div>
    `;
    container.appendChild(el);
  });
}

// ── Populate summary section ───────────────────────────────────────────────────
function populateSummary(summary) {
  if (summary.tldr) {
    document.getElementById('tldrText').textContent = summary.tldr;
  }

  const bulletList = document.getElementById('bulletList');
  bulletList.innerHTML = '';

  if (summary.bullets && summary.bullets.length > 0) {
    summary.bullets.forEach((bullet) => {
      const li = document.createElement('li');
      li.textContent = bullet;
      bulletList.appendChild(li);
    });
  } else {
    bulletList.innerHTML = '<li>No summary available</li>';
  }
}

// ── Show auth prompt ───────────────────────────────────────────────────────────
function showAuthPrompt() {
  document.getElementById('loadingState').style.display = 'none';
  document.getElementById('resultsState').style.display = 'none';
  document.getElementById('authPrompt').style.display = 'block';
}

// ── Tab switching ──────────────────────────────────────────────────────────────
function setupTabSwitching() {
  document.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      // Deactivate all tabs
      document.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach((c) => c.classList.remove('active'));

      // Activate selected tab
      btn.classList.add('active');
      const tabName = btn.dataset.tab;
      document.getElementById(`tab-${tabName}`).classList.add('active');
    });
  });
}

// ── Button handlers ────────────────────────────────────────────────────────────
function setupButtonHandlers() {
  // Login button
  document.getElementById('loginBtn')?.addEventListener('click', () => {
    chrome.tabs.create({ url: 'http://localhost:3000/login' });
  });

  // Scan button
  document.getElementById('scanBtn').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
      chrome.runtime.sendMessage(
        { type: 'SCAN_REQUEST', url: tab.url },
        (result) => {
          if (result && !result.error) {
            displayResult(result);
          } else {
            alert('Scan failed: ' + (result?.error || 'Unknown error'));
          }
        }
      );
    }
  });

  // Dashboard button
  document.getElementById('dashBtn').addEventListener('click', () => {
    chrome.tabs.create({ url: 'http://localhost:3000/dashboard' });
  });
}
