chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get({ installCount: 0 }, (result) => {
    chrome.storage.local.set({ installCount: result.installCount + 1 });
  });
});
