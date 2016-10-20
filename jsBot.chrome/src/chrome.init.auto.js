chrome.webNavigation.onCompleted.addListener(
  function(details) {
    chrome.tabs.executeScript(
      null,
      {
        file:"./src/chrome.inject.js"
      }
    );
  }
);
