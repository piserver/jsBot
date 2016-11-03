Error.stackTraceLimit = Infinity;

var jsBotStorage = function() {
  this.targetAddress = null;
  this.tabId = null;
  this.nodes = {};
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
    this.nodes[nodeId][key] = value;
    return true;
  } else {
    return false;
  }
}
jsBotStorage.prototype.getNode = function(nodeId) {
  if(this.nodes[nodeId]) {
    return this.nodes[nodeId];
  } else {
    return false;
  }
}
