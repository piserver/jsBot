/*


chrome.tabs.onActivated.addListener(function(activeInfo){
  console.log('onActivated',activeInfo);
  //alert('onActivated');
});
*/

var travel = function(node) {
  for(idx in node.children) {
    //node.children[idx].doDefault();
    if(node.children[idx].action != undefined) {
      console.log(
        'node',
        node.children[idx],node.children[idx].action,
        node.children[idx],node.children[idx]
      );
    }
    travel(node.children[idx]);
  }
}

chrome.tabs.onUpdated.addListener(function(tabId,info) {
  console.log(tabId,info,this);
  if (info.status == "complete") {
    console.log('chrome.automation.AutomationEvent',chrome.automation.AutomationEvent);
    chrome.automation.getTree(tabId, function(RootNode){
      //travel(RootNode);
    });
  }
});

chrome.webNavigation.onBeforeNavigate.addListener(function(details) {
  if(details.url!="http://localhost/") {
  }
});


var rule = {
conditions: [
  new chrome.declarativeWebRequest.RequestMatcher({
    url: { hostSuffix: 'piserver.at' } })
],
actions: [
  new chrome.declarativeWebRequest.CancelRequest()
]};
chrome.declarativeWebRequest.onRequest.addRules([rule]);
