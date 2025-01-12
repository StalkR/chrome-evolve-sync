chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.create({url: "https://pmotschmann.github.io/Evolve/"});
});
