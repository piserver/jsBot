/**
 * jsBotClient Class
 * Intened as content_scripts in a Google Chrome Extension.
 * All parameters are controlled by the background scripts and not passed directly to the object.
 * Dependencies:
 * Dependencies are packaged via Gulp in the original project.
 * - chrome.runtime | Chrome Browser Extension API - Copyright (c), Google Inc
 * - difflib | Diff library for identifying change - Copyright (c) 2007, Snowtide Informatics Systems, Inc.
 * - diffview | Modified Diff library view script - Copyright Michael Kuchner & (c) 2007, Snowtide Informatics Systems, Inc.
 * - jquery | jQuery library - Copyright jQuery Foundation and other contributors
 * @class
 */
var jsBotClient = function() {
  /**
  * Current url being targeted.
  * @protected {Sting} targetAddr
  * Root HTML tag to crawl/itterate over.
  * @protected {Sting} rootNode
  * Map of all marked nodes under rootNode and their collected information.
  * @protected {Array} mapArray
  * Current state of crawl/traversal.
  * @protected {Object} traverseState
  * Constant used as the maximum depth to id nodes under rootNode.
  * @constant {Number} layerMultiplier
  */
  this.targetAddr = "http://localhost/";
  this.rootNode = 'body';
  this.mapArray = [];
  this.traverseState = {state:null,arrayId:null,node:null};
  this.layerMultiplier = 100000;
  /** Background script passing configs to client */
  chrome.runtime.sendMessage({read:true},this.init.bind(this));
}
/**
 * jsBotClient#init
 * @param {Object} store object passed from background script.
 * @protected
 */
jsBotClient.prototype.init = function(store) {
  this.rootNode = store['rootNode'];
  this.mapArray = store['mapArray'];
  this.traverseState = store['traverseState'];
  this.layerMultiplier = store['layerMultiplier'];

  /**
  * Check for errors:
  * Verifying that the rootNode has been defined.
  */
  if (this.rootNode == null || this.rootNode == undefined) {
    throw "No rootNode specified for traversal.";
  }

  /** REMOVE: console */
  console.log('this.traverseState',this.traverseState);

  /**
  * Initiate recursive traversal:
  * @param {Array<Function>}
  * @constructor
  */
  async.series([
    /**
    * Verify the current state of the window.location.
    * @param {Function} callback
    * @constructor
    */
    function(callback) {
      if(this.traverseState.state == 'running' && window.location.href != this.targetAddr) {
        /**
        * The current node will be marked as a link, since it was responsible
        * for the action.
        */
        chrome.runtime.sendMessage(
          {
            append:[
              {
                'arrayId':this.traverseState.arrayId,
                'objKey':'traversed',
                'dat':true
              },
              {
                'arrayId':this.traverseState.arrayId,
                'objKey':'link',
                'dat':window.location.href
              }
            ]
          },
          /**
          * Verify the current state of the window.location.
          * The function will trigger a redirect back the original location.
          */
          /** The Traversal state will be shifted forward, to prevent loop. */
          /** TODO: node is is lost after shift */
          function() {
            this.putTraverseState(
              'running',
              this.traverseState.arrayId++,
              null,
              /**
              * After save the function will trigger a redirect back the
              * original target location.
              */
              function() {
                /** REMOVE: alert */
                alert('goback');
                window.location.href = this.targetAddr;
              }.bind(this)
            );
          }.bind(this)
        );
      } else {
        callback();
      }
    }.bind(this)
    /**
    * Initiates genMap to create mapArray & mark all HTML nodes.
    * @constructor
    */
  ],function() { /** TODO: parameters ??? */
    /** if mapArray is not initialized execute genMap for gathering & marking! */
    if(this.mapArray.length <= 0) {
      this.genMap(jQuery(this.rootNode),0,0,true,function(){
        chrome.runtime.sendMessage(
          {
            write:{
              id:'mapArray',
              content:this.mapArray
            }
          },
          function() {
            this.traverseMap();
          }.bind(this)
        );
      }.bind(this));
    /** if mapArray is initialized genMap marking only! */
    } else {
      this.genMap(jQuery(this.rootNode),0,0,false,function(){
        this.traverseMap();
      }.bind(this));
    }
  }.bind(this));
}
/**
* jsBotClient#genMap
* This method is recursive!
* @param {object} node The current HTML node in recursion
* @param {number} layer Counter for depth of nodes
* @param {number} childItr Counter for child nodes visited
* @param {boolean} save Determines if data is saved to mapArray
* @param {Function} callback Recursive callback
* @constructor
*/
jsBotClient.prototype.genMap = function(node,layer,childItr,save,callback) {
  /** Create ID and mark as class with prefix */
  var currentId = 'jsbot-'+((layer*this.layerMultiplier)+childItr);
  jQuery(node).addClass(currentId);
  /** Determin node values to be saved in mapArray */
  if(save) {
    var saveObj = {
      'id':currentId,
      'traversed':false,
      'node':node,
      'diff':null
    }
    this.mapArray.push(saveObj);
  }
  /** Increase layer after every layer recursion */
  layer++;
  /** Gather child nodes via jQuery.children method */
  var children = jQuery(node).children();
  async.eachSeries(
    children,
    function(child,callback){
      if(jQuery(child).prop("tagName") != 'SCRIPT') {
        this.genMap(child,layer,childItr++,save,function(){
          callback();
        }.bind(this));
      } else {
        callback();
      }
    }.bind(this),
    function(){ /** TODO: parameters ??? */
      /** TODO: response ??? */
    }
  );
  callback();
}
jsBotClient.prototype.traverseMap = function() {
  if(this.traverseState.state != 'complete') {
    console.log('traverseMap - this.mapArray: ',this.mapArray);
    async.eachOfSeries(
      this.mapArray,
      function(nodeElement,key,callback) {
        var stateCurrent = null;
        var statePassed = null;
        var diff = null;
        async.series([
          function(callback) {
            async.series([
              function(callback) {
                this.putTraverseState('running',key,nodeElement.id,function() {
                  callback();
                });
              }.bind(this),
              function(callback) {
                if(!nodeElement.traversed) {
                  //Find current node
                  var node = document.getElementsByClassName(nodeElement.id)[0];
                  //Save HTML states inderact & get diff
                  stateCurrent = $(this.rootNode).html();
                  console.log('traverseMap - node: ',node);
                  this.interact(node);
                  setTimeout(function(){
                    callback();
                  },1000);
                } else {
                  callback();
                }
              }.bind(this)
            ],
            function(res,err){
              callback();
            });
          }.bind(this),
          function(callback) {
            if(!nodeElement.traversed) {
              statePassed = $(this.rootNode).html();
              diff = this.diff(stateCurrent,statePassed);
              //Save diff to chrome extension
              if(diff.length > 0) {
                chrome.runtime.sendMessage({append:[
                  {
                    'arrayId':key,
                    'objKey':'traversed',
                    'dat':true
                  },
                  {
                    'arrayId':key,
                    'objKey':'diff',
                    'dat':diff
                  }
                  ]},function() {
                    callback();
                  }
                );
              } else {
                chrome.runtime.sendMessage({append:[
                  {
                    'arrayId':key,
                    'objKey':'traversed',
                    'dat':true
                  }
                  ]},function() {
                    callback();
                  }
                );
              }
            } else {
              callback();
            }
          }.bind(this)
        ],function(res,err){
          callback();
        });
      }.bind(this),
      function(err) {
        this.putTraverseState('complete',null,null,function(){
          console.log('jsBotClient - mapTraversed:complete');
        });
      }.bind(this)
    );
  }
}
jsBotClient.prototype.interact = function(node) {
  if(jQuery(node).prop("tagName") == 'A') {
    var href = jQuery(node).attr('href');
    if(href != undefined) {
      jQuery(node).removeAttr('href');
    }
  }
  try {
    node.click();
  } catch(err) {
    //console.log(err);
  }
}
jsBotClient.prototype.diff = function(current,change) {
  var currentDiff = difflib.stringAsLines(current);
  var changeDiff = difflib.stringAsLines(change);

  var sm = new difflib.SequenceMatcher(currentDiff,changeDiff);
  var opcodes = sm.get_opcodes();

  return diffview.buildView({
      baseTextLines: currentDiff,
      newTextLines: changeDiff,
      opcodes: opcodes
  });
}
jsBotClient.prototype.putTraverseState = function(state,arrayId,node,callback) {
  this.traverseState = {
    state:state,
    arrayId:arrayId,
    node:node
  };
  chrome.runtime.sendMessage(
    {'traverseState':this.traverseState},
    function() { callback(); }
  );
}

new jsBotClient();
