Error.stackTraceLimit = Infinity;

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
  * @protected {Array} crawlMemory
  * Current state of crawl/traversal.
  * @protected {Object} traverseState
  * Constant used as the maximum depth to id nodes under rootNode.
  * @constant {Number} layerMultiplier
  * Constant determening the wait in milliseconds after every interaction.
  * @constant {Number} traverseWait
  * Sets the amount of tests to run.
  * @protected {Array} tests
  */
  this.targetAddr = "http://localhost/";
  this.rootNode = 'body';
  this.crawlMemory = [];
  this.crawlCounter = {};
  this.traverseWait = 1000;
  this.traverseState = {state:null,arrayId:null,node:null};
  this.layerMultiplier = 100000;
  this.traversalStage = 0;
  this.tests = [];
  this.visual = new jsBotClient.visual();
  this.traversalActive = false;
  this.traverseComplete = false;
  /** Background script passing configs to client */
  jsBotClient.store.call('read',this.init.bind(this));
}
/**
 * jsBotClient#init
 * @param {Object} store object passed from background script.
 * @protected
 */
jsBotClient.prototype.init = function(store) {
  /** Update config loaded from jsBotStorage */
  this.targetAddr = store['targetAddr'];
  this.rootNode = store['rootNode'];
  this.crawlMemory = store['crawlMemory'];
  this.crawlCounter = store['crawlCounter'];
  this.traverseState = store['traverseState'];
  this.layerMultiplier = store['layerMultiplier'];
  this.traverseWait = store['traverseWait'];
  this.traversalStage = store['traversalStage'];
  this.traverseComplete = store['traverseComplete'];
  this.tests = store['tests'];
  /** Visual: init*/
  this.visual.display('init','jsBotClient initialized');
  /**
  * Check for errors:
  * Verifying that the rootNode has been defined.
  */
  if (this.rootNode == null || this.rootNode == undefined) {
    throw "No rootNode specified for traversal.";
  }
  /**
  * Inject Prevention Scripts:
  * Verifying that the rootNode has been defined.
  */
  window.open = function(a,b) {
    console.log(a,b);
  }
  console.log(window.open);

  async.series([
    function(callback) {
      if(this.crawlMemory.length <= 0) {
        this.traversalActive = true;
      }
      if(this.traverseComplete) {
        callback('complete');
      } else {
        callback();
      }
    }.bind(this),
    function(callback) {
      if(this.traversalActive && window.location.href != this.targetAddr) {
        callback('return');
      } else {
        if(window.location.href != this.targetAddr) {
          this.traverseRecover(function(){
            callback('return');
          });
        } else {
          callback();
        }
      }
    }.bind(this),
    function(callback) {
      jsBotClient.store.crawlCounter(
        'url',
        this.targetAddr,
        function() {
          callback();
        }
      );
    }.bind(this),
    function(callback) {
      this.genMap(jQuery(this.rootNode),0,0,this.traversalActive,function() {
        /** if crawlMemory is not initialized execute genMap for gathering & marking! */
        if(this.traversalActive) {
          jsBotClient.store.write(
            {
              id:'crawlMemory',
              content:this.crawlMemory
            },
            function() {
              this.traverse(function(){
                callback();
              });
            }.bind(this)
          );
          /** if crawlMemory is initialized genMap marking only! */
        } else {
          this.traverse(function(){
            callback();
          });
        }
      }.bind(this));
    }.bind(this)
  ],
  function(breaker) {
    var showComplete = function() {
      this.visual.display('End','crawling complete');
      this.visual.copyform(JSON.stringify(this.crawlCounter,null,' '),'left');
      this.visual.copyform(JSON.stringify(this.crawlMemory,null,' '),'right')
    }.bind(this);
    if(breaker == 'return') {
      window.setTimeout(function() {
        window.location.href = this.targetAddr;
      }.bind(this),1000);
    } else if(breaker == 'complete') {
      showComplete();
    } else {
      /** Visual: display finish*/
      jsBotClient.store.call(
        'traverseComplete',
        function(action) {
          console.log('action',action);
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
  }.bind(this));
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
jsBotClient.prototype.genMap = function(node,layer,childItr,save,callback) {
  /** Create ID and mark as class with prefix */
  var currentId = 'jsbot-'+((layer*this.layerMultiplier)+childItr);
  jQuery(node).addClass(currentId);
  /** Determin node values to be saved in crawlMemory */
  if(save) {
    var saveObj = {
      'id':currentId,
      'traversed':null,
      'tests':[],
      'links-html':[],
      'links-js':[]
    }
    this.crawlMemory.push(saveObj);
  }
  /** Visual: display mapping*/
  this.visual.display('Mapping',currentId);
  /** Collect counter information*/
  if(layer == 1) {
    jsBotClient.store.countNode(
      'htmlChars',
      jQuery(node).html(),
      function() {}
    );
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
jsBotClient.prototype.traverse = function(traverseMapCallback) {
  async.eachOfSeries(
    this.crawlMemory,
    function(node,key,callbackNode) {
      async.waterfall([
        function(callback) {
          var traverseState = {
            node:node,
            key:key,
            htmlPre:null,
            htmlPost:null,
            htmlDiff:null,
            skip:false
          }
          if(node.traversed == this.traversalStage) {
            traverseState.skip = true;
          }
          //console.log('traverse - '+node.id+' - '+traverseState.skip);
          callback(null,traverseState);
        }.bind(this),
        jsBotClient.traverse.links.bind(this),
        jsBotClient.traverse.pre.bind(this),
        jsBotClient.traverse.test.bind(this),
        jsBotClient.traverse.post.bind(this),
        jsBotClient.traverse.analyzeDiff.bind(this),
      ],function(res,err){
        callbackNode();
      });
    }.bind(this),
    function(err) {
      traverseMapCallback();
    }.bind(this)
  );
}
jsBotClient.prototype.traverseRecover = function(traverseMapCallback) {
  async.eachOfSeries(
    this.crawlMemory,
    function(node,key,callbackNode) {
      if(node.traversed != this.traversalStage) {
        jsBotClient.store.append([
          {
            'arrayId':key,
            'objKey':'traversed',
            'dat':(node.traversed++)
          }
        ],function() {
          jsBotClient.store.push([
            {
              'arrayId':key,
              'objKey':'links-js',
              'dat':{
                'test':this.tests[this.traversalStage],
                'link':window.location.href
              }
            }
          ],function() {
            jsBotClient.store.increment(
              'jsLinks',
              function() {
                traverseMapCallback();
              }
            );
            return false;
          }.bind(this));
        }.bind(this));
      } else {
        callbackNode();
      }
    }.bind(this),
    function() {
      traverseMapCallback();
    }.bind(this)
  );
}
jsBotClient.traverse = {
  'links':function(state,callback) {
    var node = document.getElementsByClassName(state.node.id)[0];
    if(jQuery(node).prop("tagName") == 'A') {
      var href = jQuery(node).attr('href');
      jsBotClient.store.push([
        {
          'arrayId':state.key,
          'objKey':'links-html',
          'dat':jQuery(node).attr('href')
        }
        ],function() {
          if(href != undefined) {
            jQuery(node).removeAttr('href');
            jQuery(node).removeAttr('target');
            jsBotClient.store.increment(
              'htmlLinks',
              function() {
                callback(null,state);
              }
            );
          } else {
            callback(null,state);
          }
        }.bind(this)
      );
    } else {
      callback(null,state);
    }
  },
  'pre':function(state,callback) {
    state.htmlPre = $(this.rootNode).html();
    callback(null,state);
  },
  'post':function(state,callback) {
    state.htmlPost = $(this.rootNode).html();
    callback(null,state);
  },
  'test':function(state,callback) {
    if(!state.skip) {
      var node = document.getElementsByClassName(state.node.id)[0];

      this.visual.display('Testing',
        'stage: '+this.traversalStage+
        ' - node: '+state.node.id
      );

      jsBotClient.testFunctions[this.tests[this.traversalStage]](node);

      window.setTimeout(function() {
        callback(null,state);
      }.bind(this),this.traverseWait);
    } else {
      callback(null,state);
    }
  },
  'analyzeDiff':function(state,callback) {
    if(!state.skip) {
      diff = this.diff(state.htmlPre,state.htmlPost);

      jsBotClient.store.append([
        {
          'arrayId':state.key,
          'objKey':'traversed',
          'dat':(state.node.traversed++)
        }
      ],function() {
        if(diff.length > 0) {
          jsBotClient.store.push([
            {
              'arrayId':state.key,
              'objKey':'tests',
              'dat':{
                'test':this.tests[this.traversalStage],
                'diff':diff
              }
            }
          ],function() {
            var html = '';
            for(idx in diff) {
              if(diff[idx].change == 'insert') {
                html += diff[idx].lines;
              }
            }
            jsBotClient.store.countNode(
              'jsChars',
              html,
              function() {
                callback(null,state);
              }
            );
          }.bind(this));
        } else {
          callback(null,state);
        }
      }.bind(this));
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
jsBotClient.store = {
  'crawlCounter':function(id,value,callback) {
    chrome.runtime.sendMessage(
      {crawlCounter:{
        id:id,
        value:value
      }},
      function(res) {
        callback(res);
      }
    );
  },
  'increment':function(incrementId,callback) {
    chrome.runtime.sendMessage(
      { increment:incrementId },
      function(res) {
        callback(res);
      }
    );
  },
  'countNode':function(id,html,callback) {
    chrome.runtime.sendMessage(
      {countNode:{
        id:id,
        html:html
      }},
      function(res) {
        callback(res);
      }
    );
  },
  'call':function(setData,callback) {
    chrome.runtime.sendMessage(
      setData,
      function(res) {
        callback(res);
      }
    );
  },
  'write':function(writeObject,callback) {
    chrome.runtime.sendMessage(
      { write:writeObject },
      function() {
        callback();
      }
    );
  },
  'append':function(appendArray,callback) {
    chrome.runtime.sendMessage(
      { append:appendArray },
      function() {
        callback();
      }
    );
  },
  'push':function(pushArray,callback) {
    chrome.runtime.sendMessage(
      { push:pushArray },
      function() {
        callback();
      }
    );
  }
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
  $('html').append('<textarea '+style+'>'+json+'</textarea>');
}
jsBotClient.visual.prototype.clear = function() {
  this.visual.html('');
}
jsBotClient.tests = {
  'click':function(node,callback) {
    node.click();
    callback();
  },
  'hover':function(node,callback) {
    //node.click();
    callback();
  }
}

/*
chrome.runtime.sendMessage(
  'read',
  function(store) {
    console.log('store',store);
    if(store.active) {
      new jsBotClient();
    } else {
      var r = confirm("Initiate jsBot?");
      if (r == true) {
        chrome.runtime.sendMessage(
          {write:{
            id:'active',
            content:true
          }},
          function() {
            new jsBotClient();
          }
        );
      }
    }
  }
);
*/
