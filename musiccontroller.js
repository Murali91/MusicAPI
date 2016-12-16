var helper = require('./usercontroller.js'); //functions to handle the reponse messages
var music = require('../model/musicmodel.js'); //MongoDB model for the Music database


module.exports = function(server,restify)
{

server.use(restify.authorizationParser());

//GET req handler to list all the albums in the database
//Usage: http://localhost:8080/album/list

server.get('/album/list',function(req,res,next){
	music.album.find({}).select({_id:0,__v:0}).exec(function(err,list){
		if (err)
		{
			helper.failure(res,next,500,err);
		}
		helper.success(res,next,200,list);
		return next;
	})

});


//GET req handler to list the requested album from the database along with details of the band who released that album
//Usage: http://localhost:8080/album/name/Dark Side of the Moon

server.get('/album/name/:name',function(req,res,next){

	music.album.find({title:req.params.name}).select({_id:0,__v:0}).exec(function(err,album){
		if(err)
		{
			helper.failure(res,next,'500',err);
		}
		music.band.find({name:album[0].bands}).select({_id:0,__v:0}).exec(function(err,list){
		if(err)
		{
			helper.failure(res,next,'500',err);
		}
		var finalObj = album.concat(list);
		//var output = JSON.parse((JSON.stringify(album) + JSON.stringify(list)).replace(/}{/g,","));
		helper.success(res,next,'200',finalObj);
		return next();
		});

	});
});


//GET req handler to list all the comments pertaining to any single album
//Usage: http://localhost:8080/album/comments/Dark Side of the Moon

server.get('/album/comments/:name',function(req,res,next){

music.comment.find({album:req.params.name}).select({_id:0,__v:0}).exec(function(err,list){
	if (err)
	{
		helper.failure(res,next,500,err);
	}
	helper.success(res,next,200,list);
	return next;
})

});

//GET req handler to list all the albums with rating greater than the requested number
//Usage: http://localhost:8080/album/ratings/3

server.get('/album/ratings/:number',function(req,res,next){

music.comment.find({Rating:{$gt:req.params.number}}).distinct('album').exec(function(err,list){
if (err)
	{
		helper.failure(res,next,500,err);
	}
	helper.success(res,next,200,list);
	return next;
});

});

//GET req handler to list all the comments posted by the currently logged in user
//Usage: http://localhost:8080/comment/user

server.get('/comment/user', function(req,res,next){

music.comment.find({userid:req.authorization.basic.username}).select({_id:0,__v:0}).exec(function(err,comments){

if(err){
	helper.failure(res,next,500,err);
}
helper.success(res,next,200,comments);
return next();

});

});

//PUT req handler to update the comments posted by the currently logged in user
//Comments are filtered using 'created_date' and 'album_name' field
//Usage: http://localhost:8080/comment/update
//Comment,Rating, album_name and created_date values to be passed as parameters in the body of request.

server.put('/comment/update', function(req,res,next){

music.comment.findOne({userid:req.authorization.basic.username,created_date:req.params.created_date,album:req.params.album_name},function(err,list){

if(list == null){
	helper.failure(res,next,404,"Could not find the requested comment to update")
}

else if(err){
	helper.failure(res,next,500,err);
}

list.Rating = req.params.Rating;
list.Comment = req.params.comment;
list.updated_date = Date.now();
list.save(function(err)
{
	if(err){
	helper.failure(res,next,500,err);
	return next();
}
helper.success(res,next,'200',list);

});


});

});

//DELETE req handler to delete the comments posted by the currently logged in user
//Comments are filtered using 'created_date' field
//Usage: http://localhost:8080/delete/2016-12-16T07:17:14.531Z


server.del('/delete/:date', function(req,res,next){

	music.comment.findOne({userid:req.authorization.basic.username, created_date:req.params.date}, function(err,comment){
	if (comment === null){
		helper.failure(res,next,'404',"Could find the comment to delete");
		return next;
	}
	else if(err)
	{
		helper.failure(res,next,'500',err);	
		return next;
	}
	comment.remove(function(err){
		if(err){
			helper.failure(res,next,'500',err);
			return next;
		}

	});
	helper.success(res,next,'200',"Comment has been successfully deleted.");
	});
});

//POST req handler to add album and band details in to the database
// This API call can be only be perfromed by ADMIN account and only from a particular IP as stated below
//Usage: http://localhost:8080/album/add
// band_name, emerged_date, last_active, Members, genres, title, release_date, label, downloads are the values to be passed in BODY of POST req.


server.post('/album/add',function(req,res,next){

var api=
	{
		'admin':'2h3nt9wsenljjn898'
	};

	if (typeof(req.authorization.basic) === 'undefined' || !api[req.authorization.basic.username] || req.authorization.basic.password !== api[req.authorization.basic.username])
	{
		helper.failure(res,next,'403','Forbidden User');
		
	}

var adminIP=['111.222.333.444'];
	var sysIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	if (adminIP.indexOf(sysIP) === -1)
	{
		status.failure(res,next,'403','Invalid IP address');
		return next();
	}

var nband = new music.band();
nband.name = req.params.band_name;
nband.emerged_date = req.params.emerged_date;
nband.last_active = req.params.last_active;
nband.Members = req.params.Members;
nband.genres = req.params.genres;

nband.save(function(err,band){
	if(err)
	{
		helper.failure(res,next,500,err);
	}
	var nalbum = new music.album();
	nalbum.title = req.params.title;
	nalbum.release_date = req.params.release_date;
	nalbum.label = req.params.label;
	nalbum.downloads = req.params.downloads;
	nalbum.bands = nband.name;


	nalbum.save(function(err,album){
		if(err)
		{
			helper.failure(res,next,500,err);
		}
		var output = JSON.parse((JSON.stringify(album) + JSON.stringify(band)).replace(/}{/g,","));
		helper.success(res,next,200,output);
		return next();
});

});



});


//POST req handler to add band details in to the database
// This API call can be only be perfromed by ADMIN account and only from a particular IP as stated below
//Usage: http://localhost:8080/band/add
// band_name, emerged_date, last_active, Members and genres are the values to be passed in BODY of POST req.


server.post('/band/add',function(req,res,next){

var api=
	{
		'admin':'2h3nt9wsenljjn898'
	};

	if (typeof(req.authorization.basic) === 'undefined' || !api[req.authorization.basic.username] || req.authorization.basic.password !== api[req.authorization.basic.username])
	{
		helper.failure(res,next,'403','Forbidden User');
		
	}

var adminIP=['111.222.333.444'];
	var sysIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	if (adminIP.indexOf(sysIP) === -1)
	{
		status.failure(res,next,'403','Invalid IP address');
		return next();
	}

var nband = new music.band();
nband.name = req.params.band_name;
nband.emerged_date = req.params.emerged_date;
nband.last_active = req.params.last_active;
nband.Members = req.params.Members;
nband.genres = req.params.genres;

nband.save(function(err,band){
	if(err)
	{
		helper.failure(res,next,500,err);
	}

	helper.success(res,next,200,band);
	return next();
});


});

//POST req handler to add comments and rating to any particular album available in the database
//Comment,Rating and album_name values to be passed as parameters in the body of request.
//Usage: http://localhost:8080/album/comments

server.post('/album/comments',function(req,res,next){

var comment = new music.comment();

comment.userid = req.authorization.basic.username;
comment.Comment = req.params.comment;
comment.Rating = req.params.Rating;

music.album.findOne({title:req.params.album_name},function(err,users){
	if (users === null){
	helper.failure(res,next,'404','Could not find a record with the mentioned album name');
	}	

	comment.album = users.title;
	comment.save(function(err,data){
	if (err){
		helper.failure(res,next,'500',err);

	}
	helper.success(res,next,'200',data);
	return next();
	});
	});
	
});

}