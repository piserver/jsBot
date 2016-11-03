Error.stackTraceLimit = Infinity;

var jsBotStorage = function(targetAddr,tabId) {
  this.rootNode = 'body';
  this.targetAddr = targetAddr;
  this.tabId = tabId;
  this.active = false;
  this.nodes = {};
  this.tests = ['click'];
  this.mappingState = false;
  this.traverseWait = 200;
  this.traversalStage = 0;
  this.traverseComplete = false;

  this.baseHTML = '';
  this.harvestHTML = [];
  this.harvestLinksHTML = [];
  this.harvestLinksJS = [];
}
jsBotStorage.prototype.getStore = function() {
  return {
    rootNode:this.rootNode,
    targetAddr:this.targetAddr,
    tabId:this.tabId,
    active:this.active,
    nodes:this.nodes,
    eventsWait:this.eventsWait,
    tests:this.tests,
    traverseWait:this.traverseWait,
    traversalStage:this.traversalStage,
    traverseComplete:this.traverseComplete,
    crawlCounter:this.crawlCounter
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
jsBotStorage.prototype.setBaseHTML = function(html) {
  this.baseHTML = html;
}
jsBotStorage.prototype.appendBaseHTML = function(html) {
  if(this.baseHTML != undefined) {
    //var htmlProcess = html.replace(/\s/g,'');
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
jsBotStorage.prototype.createNode = function(nodeId) {
  if(this.nodes[nodeId] == undefined) {
    this.nodes[nodeId] = {};
    return true;
  } else {
    return false;
  }
}
jsBotStorage.prototype.updateNode = function(nodeId,key,value) {
  if(this.nodes[nodeId] != undefined) {
    if(value == 'increment') {
      if(typeof(this.nodes[nodeId][key]) == 'number') {
        this.nodes[nodeId][key]++;
      } else {
        this.nodes[nodeId][key] = 0;
      }
    } else {
      this.nodes[nodeId][key] = value;
    }
    return true;
  } else {
    return false;
  }
}
jsBotStorage.prototype.getNodes = function() {
  return this.nodes;
}
jsBotStorage.prototype.getNode = function(nodeId) {
  if(this.nodes[nodeId]) {
    return this.nodes[nodeId];
  } else {
    return false;
  }
}
