var restify = require('restify');
var server = restify.createServer();
var mongoose = require('mongoose');

mongoose.connect('mongodb://xxxxxxxxxxxxxx'); // You have to paste your mongoDB connector here


//Perfroms the authorization, IP Whitelisting and API throttling

var setup = require('./config/serverconfig.js');
setup(server,restify);


//Handles the GET, PUT, POST amd DELETE request

var musiccontroller = require('./controller/musiccontroller.js');
musiccontroller(server,restify);

//Server to lksten on the port 8080

server.listen(8080,function(){
console.log('%s listening at url %s',server.name,server.url);

});



