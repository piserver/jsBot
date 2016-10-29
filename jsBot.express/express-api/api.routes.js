var express = require('express');
var router = express.Router();

var config = {
  active:false,
  rootNode:"body",
  targetAddr:null,
  layerMultiplier:100000,
  traverseWait:200,
  crawlMemory:[],
  traversalStage:0,
  tests:['click','hover']
}

var db = {
  'init':function(dbConnection,next,callback) {
    MongoClient.connect(dbConnection,function(errMongo,db) {
      if(errMongo)
        next(errMongo);
      } else {
        callback(db,next);
      }
    });
  }
  'getbyId':function(dbConnection,id,collection,next,callback) {
    db.init(function(dbConnection,next){
      var collectionLinks = db.collection(collection);
      collectionLinks.findOne({'_id':id},function(errMongo,dbObject) {
        if(errMongo) {
          next(errLink);
        } else {
          db.close();
          callback(dbObject);
        }
      });
    });
  }
}

router.get('/',function(req, res, next) {
  db.getbyId(function(db,){
    //res.render('root/'+req.args.page.template,req.args);
  });
});
router.post('/',function(req, res, next) {

});
router.put('/push',function(req, res, next) {

});
router.put('/append',function(req, res, next) {

});

module.exports = router;
