function onClickHandler(tab) {
    chrome.tabs.executeScript(
      null,
      {
        script:"console.log('hello');"
      },
      function() {
        console.log('jsBotClient: intitialized');
      }
    );
}
chrome.browserAction.onClicked.addListener(onClickHandler);
chrome.contextMenus.onClicked.addListener(onClickHandler);
