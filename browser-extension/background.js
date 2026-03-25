// background.js — Browser extension service worker

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SESSION_STARTED') {
    // Schedule a notification when session ends
    const { duration } = message.session;
    const delayMs = duration * 60 * 1000;

    setTimeout(() => {
      chrome.storage.local.get(['cadence_active_session']).then((result) => {
        const session = result.cadence_active_session;
        if (session) {
          chrome.notifications?.create({
            type: 'basic',
            iconUrl: chrome.runtime.getURL('icon-192.png'),
            title: 'Focus session complete! 🎉',
            message: `Great work! You just completed a ${duration}-minute focus session.`,
            priority: 1,
          });
          chrome.storage.local.remove('cadence_active_session');
        }
      });
    }, delayMs);

    sendResponse({ ok: true });
  }

  if (message.type === 'GET_SESSION') {
    chrome.storage.local.get(['cadence_active_session']).then((result) => {
      sendResponse(result.cadence_active_session || null);
    });
    return true; // async response
  }

  if (message.type === 'END_SESSION') {
    chrome.storage.local.remove('cadence_active_session');
    sendResponse({ ok: true });
  }
});

// Clean up expired sessions on startup
chrome.runtime.onStartup.addListener(() => {
  chrome.storage.local.get(['cadence_active_session']).then((result) => {
    const session = result.cadence_active_session;
    if (session && session.endsAt < Date.now()) {
      chrome.storage.local.remove('cadence_active_session');
    }
  });
});
