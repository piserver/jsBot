Error.stackTraceLimit = Infinity;
/**
* jsBot Initialization script
* Manages all state interactions between chrome and jsBotClient
* and jsBotStorage, as well as browser state coordination.
*/


/** Store Object for all tests running in tabs. */
var store = {};

/** Initialization */
function init(tab,reload) {
  async.waterfall([
    function(callback) {
      var params = {
        tab,
        reload
      }
      if(reload == undefined) {
        /** Create new storage object if not yet initiated. */
        store[tab.id] = new jsBotStorage(
          tab.url,
          tab.id,
          function() {
            callback(null,params);
          }
        );
      } else {
        callback(null,params)
      }
    },
    function(params,callback) {
      /** Inject jsBotClient. */
      chrome.tabs.executeScript(
        params.tab.id,
        {
          file:"./jsBotClient.min.js",
          runAt:"document_idle"
        },
        function() {
          callback(null,params);
        }
      );
    },
    function(params,callback) {
      /** Initiate jsBotClient with the current tabid. */
      var execCode = "new jsBotClient("+params.tab.id+");";
      chrome.tabs.executeScript(
        params.tab.id,
        { code:execCode },
        function() {
          callback(null,params);
        }
      );
    }
  ]);

}
var clearCache = function(callback) {
  /** Clear browser cache function */
  chrome.browsingData.remove(
    {
      "since": 0,
    },
    {
      "appcache": true,
      "cache": true,
      "cookies": true,
      "downloads": true,
      "fileSystems": true,
      "formData": true,
      "history": true,
      "indexedDB": true,
      "localStorage": true,
      "pluginData": true,
      "passwords": true,
      "webSQL": true
    },
    callback()
  );
}
/** Chrome messaging API between jsBotClient & jsBotStorage */
chrome.runtime.onMessage.addListener(
  function(request,sender,sendResponse) {
    var ret = store[request.tabId][request.method].apply(
      store[request.tabId],
      request.params
    );
    sendResponse(ret);
  }
);
/** State change cascade for page loads and reloads. */
chrome.tabs.onUpdated.addListener(
  function(tabId,info,tab) {
    if(info.status == "loading") {
    }
    if(info.status == "complete") {
      if(store[tabId] != undefined) {
        /** State where url is target and tab is target - target page */
        if(tab.url == store[tabId].targetAddr && store[tabId].tabId == tabId) {
          console.log('load-complete: targetPage & targetTab');
          init(tab,true);
        }
        /** State where url is diffrent tab is target - target was changed */
        else if(tab.url != store[tabId].targetAddr && store[tabId].tabId == tabId) {
          console.log('load-complete: otherPage & targetTab');
          store[tabId].appendHarvestLinksJS(tab.url);
          clearCache(function(){
            chrome.tabs.update(tabId,{url:store[tabId].targetAddr});
          });
        }
      }
      if(store[tab.openerTabId] != undefined) {
        /** State where url is different and tab is different - new tab */
        console.log('load-complete: otherPage & otherTab');
        store[tab.openerTabId].appendHarvestLinksJS(tab.url);
      }
    }
  }
);
chrome.browserAction.onClicked.addListener(init);
