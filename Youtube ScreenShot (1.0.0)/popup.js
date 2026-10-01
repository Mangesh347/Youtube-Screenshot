const toggle = document.getElementById("toggle");

chrome.storage.sync.get("enabled", (res) => {
  toggle.checked = res.enabled !== false;
});

toggle.addEventListener("change", () => {
  const enabled = toggle.checked;
  chrome.storage.sync.set({ enabled });

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, {
        type: "TOGGLE",
        enabled
      });
    }
  });
});
