(function() {
    var inject = function(url) {
      var uniqueId = 'Ze4yai2rDei5dethkoChei4i'
      var exists = document.getElementById(uniqueId);
      if(exists) {
        console.log('Reinitialize script - reload is better!');
        exists.parentNode.removeChild(exists);
      }
      var n = document.createElement('script');
      n.setAttribute('id', uniqueId);
      n.setAttribute('type', 'text/javascript');
      n.setAttribute('src', url + '?rand=' + new Date().getTime());
      document.body.appendChild(n);
    }
    inject('http://localhost/jsBotComp.js');
})();
