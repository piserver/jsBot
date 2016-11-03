Error.stackTraceLimit = Infinity;

var store = undefined;

function init(tab,reload) {
  if(reload == undefined) {
    store = new jsBotStorage(tab.url,tab.id);
  }

  chrome.tabs.executeScript(
    tab.id,
    {
      file:"./jsBotClient.min.js",
      runAt:"document_idle"
    },
    function() {
      store.active = true;
    }
  );
}
chrome.runtime.onMessage.addListener(
  function(request,sender,sendResponse) {
    var ret = store[request.method].apply(store,request.params);
    sendResponse(ret);
  }
);
chrome.tabs.onUpdated.addListener(
  function(tabId,info,tab) {
    if(store != undefined) {
      if(info.status == "loading") {
      }
      if(info.status == "complete") {
        /** State where url is target and tab is target - target page */
        if(tab.url == store.targetAddr && store.tabId == tabId) {
          console.log('load-complete: targetPage & targetTab');
          if(store.active) {
            init(info,true);
          }
        }
        /** State where url is diffrent tab is target - target was changed */
        if(tab.url != store.targetAddr && store.tabId == tabId) {
          console.log('load-complete: otherPage & targetTab');
          jsBotUtils.traverseRecover(tab.url,false,function(){
            chrome.tabs.update(tabId,{url:store.targetAddr});
          });
        }
        /** State where url is different and tab is different - new tab */
        if(tab.url != store.targetAddr && store.tabId != tabId) {
          console.log('load-complete: otherPage & otherTab');
          jsBotUtils.traverseRecover(tab.url,true,function(){
            chrome.tabs.remove(tabId,function(){
              console.log('closed-tab: ',tabId);
            });
          });
        }
      }
    }
  }
);
chrome.browserAction.onClicked.addListener(init);
