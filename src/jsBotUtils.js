Error.stackTraceLimit = Infinity;

jsBotUtils = {
  traverseRecover:function(tabId,url,tab,traverseMapCallback) {
    store[tabId].appendHarvestLinksJS(url);
    async.eachOfSeries(
      store[tabId].nodes,
      function(node,key,callbackNode) {
        if(node.traversed != store[tabId].traversalStage) {
          if(tab) {
            callbackNode(true);
          } else {
            store[tabId].updateNode(key,'traversed','increment');
            callbackNode(true);
          }
        } else {
          callbackNode();
        }
      },
      function() {
        traverseMapCallback();
      }
    );
  }
}
