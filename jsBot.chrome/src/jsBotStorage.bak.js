Error.stackTraceLimit = Infinity;

var jsBotStorage = function(target) {
  this.store = {
    active:false,
    rootNode:"body",
    targetAddr:"http://localhost/",
    layerMultiplier:100000,
    tests:['click','hover'],
    traverseWait:200,
    traverseComplete:false,
    traversalStage:0,
    crawlCounter:{
      "id":"page",
      "url":"",
      'htmlChars':0,
      'htmlLinks':0,
      'jsLinks':0,
      'jsChars':0
    },
    crawlMemory:[]
  }
  if(target != undefined) {
    this.store.targetAddr = targetAddr;
  }
  this.browser = {
    targetTab:null
  }
}
jsBotStorage.prototype.browserTabUpdate = function() {

}
jsBotStorage.prototype.read = function(request,sender,sendResponse) {
  sendResponse(this.store);
}
jsBotStorage.prototype.write = function(request,sender,sendResponse) {
  jsBotStorage[request.id] = request.content;
}
jsBotStorage.prototype.append = function(request,sender,sendResponse) {
  for(idx in request) {
    this.store.crawlMemory[request[idx].arrayId][request[idx].objKey] = request[idx].dat;
  }
}
jsBotStorage.prototype.push = function(request,sender,sendResponse) {
  for(idx in request) {
    this.store.crawlMemory[request[idx].arrayId][request[idx].objKey].push(request[idx].dat);
  }
}
jsBotStorage.prototype.writeCrawlCounter = function(request,sender,sendResponse) {
  this.store.crawlCounter[request.id] = request.value;
}
jsBotStorage.prototype.writeCountNode = function(request,sender,sendResponse) {
  this.store.crawlCounter[request.id] += request.html.replace(/\s/g,'').length;
}
jsBotStorage.prototype.increment = function(request,sender,sendResponse) {
  this.store.crawlCounter[request]++;
}
jsBotStorage.prototype.traverseComplete = function(request,sender,sendResponse) {
  if(this.store.traversalStage < this.store.tests.length) {
    this.store.traversalStage++;
  }
  if(this.store.traversalStage >= this.store.tests.length) {
    console.log('complete',this.store.traversalStage,this.store);
    this.store.traverseComplete = true;
    sendResponse('complete');
  } else {
    console.log('reload',this.store.traversalStage);
    sendResponse('reload');
  }
}

var session = new jsBotStorage();

chrome.runtime.onMessage.addListener(
  function(request,sender,sendResponse) {
    if(request == 'read') {
      session.read(request,sender,sendResponse);
    }
    if(request.write) {
      session.write(request.write,sender,sendResponse);
    }
    if(request.append) {
      session.write(request.append,sender,sendResponse);
    }
    if(request.push) {
      session.write(request.push,sender,sendResponse);
    }
    if(request.crawlCounter) {
      session.write(request.crawlCounter,sender,sendResponse);
    }
    if(request.countNode) {
      session.write(request.countNode,sender,sendResponse);
    }
    if(request.increment) {
      session.write(request.increment,sender,sendResponse);
    }
    if(request == 'traverseComplete') {
      session.write(request,sender,sendResponse);
    }
  }
);
