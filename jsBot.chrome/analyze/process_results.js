var fs = require('fs');
var async = require('async');

var path = './results';
var results = [];
var chars = function(html) {
  return html.replace(/\s/g,'').length;
}
var process = {
  'readfile':function(filepath,callback) {
    fs.readFile(filepath,{encoding:'utf8',flag:'r'},function(err,data){
      if(err) { throw err; }
      var jsonFileObj = JSON.parse(data);
      callback(null,jsonFileObj);
    });
  },
  'filter':function(data,callback) {
    var page = {
      'url':null,
      'htmlChars':0,
      'htmlLinks':0,
      'jsLinks':0,
      'jsChars':0
    };
    for(idz in data) {
      if(data[idz].id == 'page') {
        page.url = data[idz].url;
        page.htmlChars = data[idz].html;
        page.htmlLinks = data[idz].htmlLinks;
      } else {
        if(data[idz].tests.length > 0) {
          for(idy in data[idz].tests) {
            if(data[idz].tests[idy]['links-js'].length > 0) {
              for(idx in data[idz].tests[idy]['links-js']) {
                if(data[idz].tests[idy]['links-js'][idx].link) {
                  page.jsLinks++;
                }
              }
            }
            if(data[idz].tests[idy].diff.length > 0) {
              for(idx in data[idz].tests[idy].diff) {
                if(data[idz].tests[idy].diff[idx].change == 'insert') {
                  page.jsChars += chars(data[idz].tests[idy].diff[idx].lines);
                }
              }
            }
          }
        }
      }
    }
    callback(null,page);
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
              var filepath = path+'/'+file;
              console.log('filepath: ',filepath);
              callback(null,filepath);
            },
            process.readfile,
            process.filter
          ],
          function(err,result) {
            if(err) { throw err; }
            results.push(result);
            callback();
          }
        )
      },
      function(err) {
        if(err) { throw err; }
        console.log('results',results);
      }
    );
  }
);
