function onClickHandler(tab) {
    chrome.tabs.executeScript(
      null,
      {
        file:"./src/chrome.inject.js"
      }
    );
}

chrome.browserAction.onClicked.addListener(onClickHandler);
chrome.contextMenus.onClicked.addListener(onClickHandler);
chrome.contextMenus.create({"title": "Visual Event"});
