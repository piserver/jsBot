var store = undefined;

function init(tab) {
  store = new jsBotStorage(tab.url,tab.id);

  var scanner = new jsBotScanner(store);
}

chrome.browserAction.onClicked.addListener(init);
chrome.contextMenus.onClicked.addListener(init);
