var jsBotStore = {
  rootNode:"body",
  targetAddr:"http://derstandard.at/",
  layerMultiplier:100000,
  mapArray:[],
  traverseState:{state:null,arrayId:null,node:null}
}
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if(request.write) {
      jsBotStore[request.write.id] = request.write.content;
    }
    if(request.read) {
      sendResponse(jsBotStore);
    }
    if(request.append) {
      for(idx in request.append) {
        jsBotStore.mapArray[request.append[idx].arrayId][request.append[idx].objKey] = request.append[idx].dat;
      }
    }
    if(request.traverseState) {
      if(request.traverseState == 'get') {
        sendResponse(jsBotStore.traverseState);
      } else {
        jsBotStore.traverseState = request.traverseState;
      }
    }
    //console.log('jsBotStore: ',jsBotStore);
  }
);
