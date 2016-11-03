Error.stackTraceLimit = Infinity;

jsBotUtils = {
  traverseRecover:function(url,tab,traverseMapCallback) {
    store.appendHarvestLinksJS(url);
    async.eachOfSeries(
      store.nodes,
      function(node,key,callbackNode) {
        if(node.traversed != store.traversalStage) {
          if(tab) {
            callbackNode(true);
          } else {
            store.updateNode(key,'traversed','increment');
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
