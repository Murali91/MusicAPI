var status = require('../controller/usercontroller.js');

module.exports=function(server,restify){

//necessary modules to be used to perfrom the parsing operation

	server.use(restify.acceptParser(server.acceptable));
	server.use(restify.bodyParser());
	server.use(restify.queryParser());
	

	server.use(restify.authorizationParser());

//list of usernames and password allowed to access the API


	server.use(function(req,res,next){
	var api_keys={
		'admin':'2h3nt9wsenljjn898',
		'normaluser1':'23423kj4bkjbsf97',
		'normaluser2':'2430823ujrfioewf'
	};
	if (typeof(req.authorization.basic) === 'undefined' || !api_keys[req.authorization.basic.username] || req.authorization.basic.password !== api_keys[req.authorization.basic.username])
	{
		status.failure(res,next,'403','Forbidden User');
		return next();
	}

	return next();


	});

//List of IP address from where the connection will be accepted by the API

	server.use(function(req,res,next){
	var whiteIP=['111.222.333.444','123.345.456.789','222.333.444.555'];

//It checks if the user is behind any proxy using 'x-forwarded-for' else takes the standard IP address
																					
	var sysIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress; 
	if (whiteIP.indexOf(sysIP) === -1)
	{
		status.failure(res,next,'403','Invalid IP address');
		return next();
	}

	return next();


	});

//function to control API throttling

	server.use(restify.throttle(
	{
		rate:1, //no.of requests/s
		burst:2, //max allowed
		xff:true //to check x-forwarded-for


	}));

}


