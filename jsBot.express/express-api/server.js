var express = require('express');
var path = require('path');
var app = express();
var morgan = require('morgan');
var bodyParser = require('body-parser');
var fs = require('fs');
var cluster = require('cluster');
var numCPUs = require('os').cpus().length;

var application = function(environment) {
	app.set('env',environment);
	app.set('secret','Phah5AhtYai6ahtiShaegh8dooBael0ac');
	app.disable('etag');

	//TimeZone
	process.env.TZ = 'Europe/Vienna';

  //Configuration
	var config = {};
	config['development'] = {
		'mongodb':'mongodb://localhost:27017/hme-web'
	};
	config['production'] = {
		'mongodb':'mongodb://hme-web-mongodb:27017/hme-web'
	};
	config['testing'] = {
		'mongodb':'mongodb://localhost:27017/hme-web'
	};
	app.set('config',config[environment]);

	app.use(function(req, res, next){
		req.config = config[environment];
		next();
	});

	//Logging
	if(environment == 'development' || environment == 'testing') {
		app.use(morgan('dev'));
	}

	//Body Parser
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended:true }));
	//app.use(express.static(path.join(__dirname,'public')));
	//app.use(express.static(path.join(__dirname,'bower_modules')));

	//Routing
	app.use('/',require('./api-routes.js'));

	//Error Managment
	app.use(function(err, req, res, next) {
		if(environment == 'development' || environment == 'testing') {
			throw err;
		}
		res.status(500).render('500');
	});

	//Deployment Type
	var port = 8080;
	if(environment == 'development') {
		app.listen(port);
	} else if(environment == 'testing') {
		app.listen(port);
	} else if(environment == 'production') {
		if (cluster.isMaster) {
			// Fork workers.
			for (var i = 0; i < numCPUs; i++) {
				cluster.fork();
			}
			cluster.on('fork', function(worker) {
				console.log('worker ' + worker.process.pid + ' forked');
			});
			cluster.on('exit', function(worker, code, signal) {
				console.log('worker ' + worker.process.pid + ' died');
			});
		} else {
			// Workers can share any TCP connection
			// In this case it is an HTTP server
			app.listen(port);
		}
	}
	console.log('#### Server running port: '+port+' #####');
}

//Init scripting
process.argv.forEach(function (val, index, array) {
	if(val == 'production') {
		application('production');
	} else if(val == 'testing') {
		application('testing');
	} else if(val == 'development') {
		application('development');
	}
});
