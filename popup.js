
const toggle = document.getElementById('showBadgeCheckbox');

// Load state
chrome.storage.sync.get('showBadge', (res) => {
    toggle.checked = res.showBadge !== false;
});

// Toggle instantly
toggle.addEventListener('change', () => {
    const show = toggle.checked;

    chrome.storage.sync.set({ showBadge: show });

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs || !tabs[0]) return;

        chrome.tabs.sendMessage(
            tabs[0].id,
            { type: 'TOGGLE_BADGE', show },
            () => {
                if (chrome.runtime.lastError) return;
            }
        );
    });
});
document.getElementById('privacyLink').addEventListener('click', () => {
    chrome.tabs.create({
        url: chrome.runtime.getURL('privacy.html')
    });
});
