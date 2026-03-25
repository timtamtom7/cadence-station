// popup.js — Browser extension popup logic

let selectedDuration = 50;

// Duration selection
document.querySelectorAll('.duration-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.duration-btn').forEach((b) => b.classList.remove('selected'));
    btn.classList.add('selected');
    selectedDuration = parseInt(btn.dataset.mins, 10);
  });
});

// Check if a session is currently active
async function checkActiveSession() {
  try {
    const result = await chrome.storage.local.get(['cadence_active_session']);
    return result.cadence_active_session || null;
  } catch {
    return null;
  }
}

// Update UI based on active session state
async function updateStatus() {
  const session = await checkActiveSession();
  const dot = document.getElementById('statusDot');
  const text = document.getElementById('statusText');
  const btn = document.getElementById('startBtn');

  if (session) {
    dot.classList.add('active');
    const remaining = Math.max(0, Math.ceil((session.endsAt - Date.now()) / 60000));
    text.textContent = `Session active — ${remaining}m left`;
    btn.textContent = 'Open Session';
  } else {
    dot.classList.remove('active');
    text.textContent = 'Ready to focus';
    btn.textContent = 'Start Focus Session';
  }
}

// Start a new session
async function startSession(durationMins) {
  const endsAt = Date.now() + durationMins * 60 * 1000;
  await chrome.storage.local.set({
    cadence_active_session: {
      startedAt: Date.now(),
      endsAt,
      duration: durationMins,
    },
  });

  // Open the web app
  const url = chrome.runtime.getURL('/index.html');
  chrome.tabs.create({ url: `${url}#/app/session/new?duration=${durationMins}&from=extension` });

  // Notify background
  chrome.runtime.sendMessage({ type: 'SESSION_STARTED', session: { duration: durationMins } });
}

// Main
document.getElementById('startBtn').addEventListener('click', () => {
  startSession(selectedDuration);
});

updateStatus();
