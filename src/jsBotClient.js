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
var jsBotClient = function(tabId) {
  /**
  * Current url being targeted.
  * @protected {Sting} targetAddr
  */
  this.visual = new jsBotClient.visual();
  this.traversalActive = false;
  this.traverseComplete = false;
  this.tabId = tabId;

  async.series(
    [
      this.loadStore.bind(this),
      this.baseHTML.bind(this),
      this.initChecks.bind(this),
      this.initMap.bind(this),
      this.initTraverse.bind(this)
    ],
    this.finalize.bind(this)
  );
}
jsBotClient.prototype.loadStore = function(callback) {
  this.storeAPI(
    'getStore',undefined,
    function(storeObj) {
      console.log('storeObj: ',storeObj);
      this.rootNode = storeObj.rootNode;
      this.targetAddr = storeObj.targetAddr;
      this.nodes = storeObj.nodes;
      this.tests = storeObj.tests;
      this.traverseWait = storeObj.traverseWait;
      this.traversalStage = storeObj.traversalStage;
      this.traverseComplete = storeObj.traverseComplete;

      /**
      * Check for errors:
      * Verifying that the rootNode has been defined.
      */
      if (this.rootNode == null || this.rootNode == undefined) {
        throw "No rootNode specified for traversal.";
      }
      callback();
    }.bind(this)
  );
}
jsBotClient.prototype.baseHTML = function(callback) {
  this.storeAPI(
    'setBaseHTML',[jQuery(this.rootNode).html()],
    function() {
      callback();
    }
  );
}
jsBotClient.prototype.initChecks = function(callback) {
  if(Object.keys(this.nodes).length > 0) {
    /** Visual: init*/
    this.visual.display('init','Recovering after reload');

    this.traversalActive = true;
  } else {
    /** Visual: init*/
    this.visual.display('init','First initialization');
  }
  if(this.traverseComplete) {
    callback('complete');
  } else {
    callback();
  }
}
jsBotClient.prototype.initMap = function(callback) {
  this.genMap(jQuery(this.rootNode),'',0,0,function() {
    this.storeAPI(
      'getNodes',undefined,
      function(nodes) {
        this.nodes = nodes;
        this.visual.display('Mapping','complete');
        callback();
      }.bind(this)
    );
  }.bind(this));
}
jsBotClient.prototype.initTraverse = function(callback) {
  this.traverse(function(){
    this.visual.display('Traversal','complete');
    callback();
  }.bind(this));
}
jsBotClient.prototype.finalize = function(breaker) {
  var showComplete = function() {
    this.visual.display('End','crawling complete');
    this.storeAPI(
      'getStoreResults',undefined,
      function(results) {
        this.visual.copyform(JSON.stringify(results,null,' '));
      }.bind(this)
    );
  }.bind(this);

  if(breaker == 'complete') {
    showComplete();
  } else {
    /** Visual: display finish*/
    this.storeAPI(
      'callTraverseComplete',undefined,
      function(action) {
        if(action == 'complete') {
          /** Shows JSON after all test have been completed.*/
          showComplete();
        } else if(action == 'reload') {
          /** Reloads page at the end of every traversal stage.*/
          window.location.href = this.targetAddr;
        }
      }.bind(this)
    );
  }
}
/**
* jsBotClient#genMap
* This method is recursive!
* @param {object} node The current HTML node in recursion
* @param {number} layer Counter for depth of nodes
* @param {number} childItr Counter for child nodes visited
* @param {boolean} save Determines if data is saved to crawlMemory
* @param {Function} callback Recursive callback
* @constructor
*/
jsBotClient.prototype.genMap = function(node,itId,itLayer,itElement,callbackNode) {
  /** Create ID and mark as class with prefix */
  jQuery(node).addClass(itId);

  async.series(
    [
      function(callbackStoreNode) {
        if(itId != '') {
          this.storeAPI(
            'createNode',[itId],
            function() {
              callbackStoreNode();
            }
          );
        } else {
          callbackStoreNode();
        }
      }.bind(this)
    ],
    function() {
      /** Visual: display mapping*/
      this.visual.display('Mapping',itId);

      /** Increase layer after every layer recursion */
      itLayer++;
      itElement = 0;

      /** Gather child nodes via jQuery.children method */
      var children = jQuery(node).children();
      async.eachSeries(
        children,
        function(child,callbackChild){
          if(jQuery(child).prop("tagName") != 'SCRIPT') {
            itElement++;
            itId = 'jsb'+md5(itId+itLayer+itElement);
            this.genMap(child,itId,itLayer,itElement,function() {
              callbackChild();
            }.bind(this));
          } else {
            callbackChild();
          }
        }.bind(this),
        function(){
          callbackNode();
        }
      );
    }.bind(this)
  );
}
jsBotClient.prototype.traverse = function(traverseMapCallback) {
  async.eachOfSeries(
    this.nodes,
    function(node,key,callbackNode) {
      async.waterfall([
        function(callback) {
          var traverseState = {
            node:node,
            key:key,
            htmlPre:null,
            htmlPost:null,
            skip:false
          }
          if(node.traversed != undefined) {
            if(node.traversed == this.traversalStage) {
              /** Visual: init*/
              this.visual.display('Skipping',
                'stage: '+this.traversalStage+
                ' - node: '+traverseState.key
              );
              traverseState.skip = true;
            }
          }
          callback(null,traverseState);
        }.bind(this),
        jsBotClient.traverse.links.bind(this),
        jsBotClient.traverse.pre.bind(this),
        jsBotClient.traverse.test.bind(this),
        jsBotClient.traverse.post.bind(this),
        jsBotClient.traverse.markTraversal.bind(this),
        jsBotClient.traverse.analyzeDiff.bind(this)
      ],function(res,err){
        callbackNode();
      });
    }.bind(this),
    function(err) {
      traverseMapCallback();
    }.bind(this)
  );
}
jsBotClient.traverse = {
  'links':function(state,callback) {
    if(!state.skip) {
      var node = document.getElementsByClassName(state.key)[0];
      if(jQuery(node).prop("tagName") == 'A') {
        var href = jQuery(node).attr('href');
        this.storeAPI(
          'appendLinksHTML',[href],
          function() {
            if(href != undefined) {
              jQuery(node).removeAttr('href');
              jQuery(node).removeAttr('target');
            }
            callback(null,state);
          }.bind(this)
        );
      } else {
        callback(null,state);
      }
    } else {
      callback(null,state);
    }
  },
  'pre':function(state,callback) {
    if(!state.skip) {
      state.htmlPre = $(this.rootNode).html();
      callback(null,state);
    } else {
      callback(null,state);
    }
  },
  'post':function(state,callback) {
    if(!state.skip) {
      state.htmlPost = $(this.rootNode).html();
      callback(null,state);
    } else {
      callback(null,state);
    }
  },
  'test':function(state,callback) {
    if(!state.skip) {
      var node = document.getElementsByClassName(state.key)[0];

      this.visual.display('Testing',
        'stage: '+this.traversalStage+
        ' - node: '+state.key
      );

      jsBotClient.testFunctions[this.tests[this.traversalStage]](node);

      window.setTimeout(function() {
        callback(null,state);
      }.bind(this),this.traverseWait);
    } else {
      callback(null,state);
    }
  },
  'markTraversal':function(state,callback) {
    if(!state.skip) {
      this.storeAPI(
        'updateNode',[state.key,'traversed','increment'],
        function() {
          callback(null,state);
        }.bind(this)
      );
    } else {
      callback(null,state);
    }
  },
  'analyzeDiff':function(state,callback) {
    if(!state.skip) {
      diff = this.diff(state.htmlPre,state.htmlPost);

      if(diff.length > 0) {
        this.storeAPI(
          'appendHarvestHTML',[
            {
              'test':this.tests[this.traversalStage],
              'diff':diff
            }
          ],
          function() {
            callback(null,state);
          }.bind(this)
        );
      } else {
        callback(null,state);
      }
    } else {
      callback(null,state);
    }
  }
}
jsBotClient.testFunctions = {
  'click':function(node) {
    try {
      node.click();
    } catch(err) {}
  },
  'hover':function(node) {
    try {
      node.hover();
    } catch(err) {}
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
jsBotClient.prototype.storeAPI = function(method,params,callback) {
  var paramObj = {
    method:method,
    params:[],
    tabId:this.tabId
  }
  if(params != undefined) {
    paramObj.params = params;
  }
  chrome.runtime.sendMessage(
    paramObj,
    function(res) {
      callback(res);
    }
  );
}

jsBotClient.prototype.filterResults = function() {
  JSON.stringify(this.crawlMemory,null,' ')
}
jsBotClient.visual = function() {
  var style = 'style="'+
    'z-index: 10000000000;'+
    'width: 100%;'+
    'height: 30%;'+
    'overflow: scroll;'+
    'background-color: white;'+
    'position: absolute;'+
    'bottom: 0px;'+
    'right: 0px;'+
    'border: 1px gray solid;'+
    'padding: 0.3%;'+
    'font-size: 15px;'+
  '"';
  $('html').append('<div id="jsBot-visual" '+style+'></div>');
  this.visual = $('#jsBot-visual');
}
jsBotClient.visual.prototype.display = function(type,txt) {
  this.visual.html(
    '<div>'+type+': '+txt+'</div>'+
    this.visual.html()
  );
}
jsBotClient.visual.prototype.copyform = function(json,pos) {
  var posCss = ''+
  'left: 0px;'+
  'width: 100%;';

  if(pos == 'left') {
    posCss = ''+
    'left: 0px;'+
    'width: 50%;';
  }
  if(pos == 'right') {
    posCss = ''+
    'right: 0px;'+
    'width: 50%;';
  }
  var style = 'style="'+
    'z-index: 10000000000;'+
    'height: 20%;'+
    'background-color: white;'+
    'position: absolute;'+
    'bottom: 30%;'+
    'border: 1px gray solid;'+
    'padding: 0.3%;'+
    'font-size: 10px;'+
  posCss+'"';
  $('html').append(''+
    '<textarea id="jsbchoo6AehEiLoo0ohxeex0ohN" '+style+'>'+json+'</textarea>'+
    '<script type="text/javascript">'+
      'document.getElementById("jsbchoo6AehEiLoo0ohxeex0ohN").select();'+
      'document.execCommand("copy");'+
    '</script>'+
  '');

}
jsBotClient.visual.prototype.clear = function() {
  this.visual.html('');
}
