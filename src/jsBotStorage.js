Error.stackTraceLimit = Infinity;
/**
* jsBotStorage Class
* Intened as bacground_script in a Google Chrome Extension.
* Basic getter setter methods for data and state storage of
* jsBotClient.
*/

var jsBotStorage = function(targetAddr,tabId,callback) {
  this.rootNode = 'body';
  this.targetAddr = targetAddr;
  this.tabId = tabId;
  this.active = false;
  this.nodes = [];
  this.nodesTraversed = [];
  this.tests = ['click'];
  this.mappingState = false;
  this.traverseWait = 200;
  this.traversalStage = 0;
  this.traverseComplete = false;
  this.timeStart = null;
  this.timeEnd = null;

  this.baseHTML = '';
  this.harvestHTML = [];
  this.harvestLinksHTML = [];
  this.harvestLinksJS = [];

  callback();
}
jsBotStorage.prototype.getStore = function() {
  return {
    rootNode:this.rootNode,
    targetAddr:this.targetAddr,
    tabId:this.tabId,
    active:this.active,
    nodesTraversed:this.nodesTraversed,
    tests:this.tests,
    traverseWait:this.traverseWait,
    traversalStage:this.traversalStage,
    traverseComplete:this.traverseComplete,
  }
}
jsBotStorage.prototype.getStoreResults = function() {
  return {
    targetAddr:this.targetAddr,
    baseHTML:this.baseHTML,
    harvestHTML:this.harvestHTML,
    harvestLinksHTML:this.harvestLinksHTML,
    harvestLinksJS:this.harvestLinksJS
  }
}
jsBotStorage.prototype.setTimeEnd = function() {
  this.timeEnd = new Date().getTime();
}
jsBotStorage.prototype.setTimeStart = function() {
  this.timeStart = new Date().getTime();
}
jsBotStorage.prototype.setActive = function(state) {
  this.active = state;
}
jsBotStorage.prototype.setBaseHTML = function(html) {
  this.baseHTML = html;
}
jsBotStorage.prototype.appendBaseHTML = function(html) {
  if(this.baseHTML != undefined) {
    this.baseHTML += html;
    return true;
  } else {
    return false;
  }
}
jsBotStorage.prototype.appendHarvestHTML = function(diff) {
  this.harvestHTML.push(diff);
}
jsBotStorage.prototype.appendLinksHTML = function(url) {
  if(url != null && url != undefined && url != '') {
    this.harvestLinksHTML.push(url);
    return true;
  }
  return false;
}
jsBotStorage.prototype.appendHarvestLinksJS = function(url) {
  if(url != null && url != undefined && url != '') {
    this.harvestLinksJS.push(url);
  }
}
jsBotStorage.prototype.updateMappingState = function(state) {
  this.mappingState = state;
}
jsBotStorage.prototype.getMappingState = function() {
  return this.mappingState;
}
jsBotStorage.prototype.setActive = function(state) {
  if(this.active != undefined) {
    this.active = state;
    return true;
  } else {
    return false;
  }
}
jsBotStorage.prototype.getActive = function() {
  if(this.active != undefined) {
    return this.active;
  } else {
    return false;
  }
}
jsBotStorage.prototype.getTargetAddress = function() {
  if(this.targetAddr != undefined) {
    return targetAddr;
  } else {
    return false;
  }
}
jsBotStorage.prototype.getCrawlCounter = function(key,value) {
  if(this.crawlCounter[key] != undefined) {
    return value;
  } else {
    return false;
  }
}
jsBotStorage.prototype.updateCrawlCounter = function(key,value) {
  if(this.crawlCounter[key] != undefined) {
    if(value == 'increment') {
      this.crawlCounter[key] = this.crawlCounter[key]++;
    } else {
      this.crawlCounter[key] = value;
    }
    return true;
  } else {
    return false;
  }
}
jsBotStorage.prototype.callTraverseComplete = function() {
  if(this.traversalStage < this.tests.length) {
    this.traversalStage++;
  }
  if(this.traversalStage >= this.tests.length) {
    this.traverseComplete = true;
    return 'complete';
  } else {
    return 'reload';
  }
}
jsBotStorage.prototype.updateNodes = function(nodes) {
  this.nodes = nodes;
  return true;
}
jsBotStorage.prototype.pushNode = function(nodeId) {
  this.nodes.push(nodeId);
  return true;
}
jsBotStorage.prototype.createTraverseNodes = function() {
  this.nodesTraversed = this.nodes.slice();
}
jsBotStorage.prototype.popTraverseNode = function(nodeId) {
  return this.nodesTraversed.pop();
}
jsBotStorage.prototype.getNodes = function() {
  return this.nodes;
}
