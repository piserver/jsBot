var fs = require('fs');
var async = require('async');
var parseJson = require('parse-json');
var csv = require('csv');

var path = './results';
var results = [];
var chars = function(html) {
  return html.replace(/\s/g,'').length;
}
var filter = {
  linksReduce:function(linkArray) {
    var resultArray = [];
    for(idx in linkArray) {
      var found = false;
      for(idy in resultArray) {
        if(linkArray[idx] == resultArray[idy]) { found = true; }
      }
      if(!found) {
        resultArray.push(linkArray[idx]);
      }
    }
    return resultArray;
  },
  linksCanonical:function(array1,array2) {
    var counter = 0;
    for(idx in array1) {
      for(idy in array2) {
        if(array1[idx] == array2[idy]) { counter++; }
      }
    }
    return counter;
  },
  cleanHTML:function(txt) {
    var clean = '';
    clean = txt.replace(/<script(.*?)>(.*?)<\/script>/g,'');
    clean = clean.replace(/<!--(.*?)-->/g,'');
    return clean;
  },
  htmlRemoveSpaces:function(txt) {
    txt = txt.replace(/\n/g,'');
    return txt.replace(/\s/g,'');
  },
  countChars:function(txt) {
    txt = filter.htmlRemoveSpaces(txt);
    txt = filter.cleanHTML(txt);
    return txt.length;
  },
  diff:function(diffObj) {
    var html = '';
    for(idx in diffObj) {
      if(diffObj[idx].diff) {
        for(idy in diffObj[idx].diff) {
          if(diffObj[idx].diff[idy].change == 'insert') {
            html += diffObj[idx].diff[idy].lines;
          }
        }
      }
    }
    return html;
  },
  time:function(start,end) {
    if(typeof(start) == 'number' && typeof(end) == 'number') {
      var milliseconds = (end-start);
      var minutes = ((milliseconds/1000.00)/60);
      return minutes;
    } else {
      return false;
    }
  },
  bigCount:function(array) {
    var counter = 0;
    for(idx in array) {
      counter++;
    }
    return counter;
  }
}
var process = {
  readfile:function(data,callback) {
    if(data.filepath.search(/\.json$/g) > 0) {
      fs.readFile(data.filepath,{encoding:'utf8',flag:'r'},function(err,jsonStr){
        if(err) { throw err; }
        data.jsonObj = parseJson(jsonStr);
        callback(null,data);
      });
    } else {
      callback('file not found',null);
    }
  },
  filter:function(data,callback) {
    data.pageStats = {
      'url':null,
      'htmlLinks':null,
      'jsLinks':null,
      'canonicalLinks':null,
      'nodes':null,
      'nodesLeft':null,
      'htmlChars':0,
      'jsChars':0,
      'timeMin':0
    };

    data.pageStats.url = data.jsonObj.targetAddr;

    var filteredLinksHTML = filter.linksReduce(data.jsonObj.harvestLinksHTML);
    var filteredLinksJS = filter.linksReduce(data.jsonObj.harvestLinksJS);

    data.pageStats.jsLinks = filteredLinksJS.length;
    data.pageStats.htmlLinks = filteredLinksHTML.length;

    data.pageStats.canonicalLinks = filter.linksCanonical(
      data.pageStats.harvestLinksHTML,
      data.jsonObj.harvestLinksJS
    );

    data.pageStats.htmlChars = filter.countChars(data.jsonObj.baseHTML);
    var jsHTML = filter.diff(data.jsonObj.harvestHTML);
    data.pageStats.jsChars = filter.countChars(jsHTML);

    data.pageStats.timeMin = filter.time(data.jsonObj.timeStart,data.jsonObj.timeEnd);

    data.pageStats.nodes = filter.bigCount(data.jsonObj.nodes);
    data.pageStats.nodesLeft = filter.bigCount(data.jsonObj.nodesTraversed);

    console.log('data.pageStats: ',data.pageStats);

    callback(null,data);
  }
}

fs.readdir(
  path,
  function(err,files) {
    if(err) { throw err; }
    async.each(
      files,
      function(file,callback) {
        async.waterfall(
          [
            function(callback) {
              var data = {
                filepath:path+'/'+file,
                jsonObj:null
              }
              callback(null,data);
            },
            process.readfile,
            process.filter
          ],
          function(err,result) {
            results.push(result);
            callback();
          }
        )
      },
      function(err) {
        if(err) { throw err; }
        console.log('finished');
      }
    );
  }
);
