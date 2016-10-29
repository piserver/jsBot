/*


chrome.tabs.onActivated.addListener(function(activeInfo){
  console.log('onActivated',activeInfo);
  //alert('onActivated');
});
*/

var travel = function(node) {
  for(idx in node.children) {
    //node.children[idx].doDefault();
    console.log('node',node.children[idx].htmlTag);
    travel(node.children[idx]);
  }
}

chrome.tabs.onUpdated.addListener(function(tabId,info) {
  console.log(tabId,info,this);
  if (info.status == "complete") {
    chrome.automation.getTree(tabId, function(RootNode){
      travel(RootNode);
    });
  }
});
