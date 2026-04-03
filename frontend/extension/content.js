// content.js — DataShield Content Script
// Injected into every page to detect permission requests and trackers

(function () {
  'use strict';

  const TRACKER_PATTERNS = [
    'google-analytics.com', 'facebook.net', 'doubleclick.net',
    'hotjar.com', 'mixpanel.com', 'segment.com', 'amplitude.com',
    'clarity.ms', 'mouseflow.com', 'fullstory.com',
  ];

  const detected = {
    trackers: [],
    permissions: [],
    timestamp: Date.now(),
    url: window.location.href,
  };

  // Detect trackers via script src
  const detectTrackers = () => {
    document.querySelectorAll('script[src]').forEach(script => {
      const src = script.src;
      TRACKER_PATTERNS.forEach(pattern => {
        if (src.includes(pattern) && !detected.trackers.includes(pattern)) {
          detected.trackers.push(pattern);
        }
      });
    });
  };

  // Intercept getUserMedia (camera/mic)
  const originalGetUserMedia = navigator.mediaDevices?.getUserMedia?.bind(navigator.mediaDevices);
  if (originalGetUserMedia) {
    navigator.mediaDevices.getUserMedia = async function (constraints) {
      if (constraints.video) {
        detected.permissions.push({ type: 'camera', status: 'requested', timestamp: Date.now() });
        chrome.runtime.sendMessage({ type: 'PERMISSION_DETECTED', permission: 'camera', url: window.location.href });
      }
      if (constraints.audio) {
        detected.permissions.push({ type: 'microphone', status: 'requested', timestamp: Date.now() });
        chrome.runtime.sendMessage({ type: 'PERMISSION_DETECTED', permission: 'microphone', url: window.location.href });
      }
      return originalGetUserMedia(constraints);
    };
  }

  // Intercept Clipboard API
  const originalReadText = navigator.clipboard?.readText?.bind(navigator.clipboard);
  if (originalReadText) {
    navigator.clipboard.readText = async function () {
      detected.permissions.push({ type: 'clipboard', status: 'active', timestamp: Date.now() });
      chrome.runtime.sendMessage({ type: 'PERMISSION_DETECTED', permission: 'clipboard', url: window.location.href });
      return originalReadText();
    };
  }

  // Intercept Geolocation
  const originalGetCurrentPosition = navigator.geolocation?.getCurrentPosition?.bind(navigator.geolocation);
  if (originalGetCurrentPosition) {
    navigator.geolocation.getCurrentPosition = function (success, error, options) {
      detected.permissions.push({ type: 'location', status: 'requested', timestamp: Date.now() });
      chrome.runtime.sendMessage({ type: 'PERMISSION_DETECTED', permission: 'location', url: window.location.href });
      return originalGetCurrentPosition(success, error, options);
    };
  }

  // Run detection
  detectTrackers();
  const observer = new MutationObserver(detectTrackers);
  observer.observe(document.body || document.documentElement, { childList: true, subtree: true });

  // Send results to background
  setTimeout(() => {
    chrome.runtime.sendMessage({ type: 'PAGE_SCAN_RESULT', data: detected });
  }, 3000);

  // Listen for popup requests
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === 'GET_PAGE_DATA') {
      sendResponse(detected);
    }
  });
})();
