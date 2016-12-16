var mongoose = require('mongoose');

var Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId;


//Model to store the band details in the database

var bands = new Schema({

id:ObjectId,
name:{type:String,required:true,unique:true},
emerged_date: {type:Date,required:true},
last_active: Date,
Members: {type:String,required:true},
genres: {type:String,required:true}

});

//Model to store the album details where bands variable connect it to the band details of that album

var albums = new Schema(
{
id:ObjectId,
title: {type:String,required:true,unique:true},
release_date: {type:Date,required:true},
label: {type:String,required:true},
downloads: {type:Number,default:'0'},
bands:String

});



//Model to store the comments entered by the user

var comments = new Schema({

id:ObjectId,
userid: String,
Comment: String,
Rating: {type:Number,min:1,max:5}, //Rating value can only be between 1 to 5.
created_date: {type:Date,default:Date.now}, //Deafaults to the tie when the record is created
updated_date: Date, //Gets updated to the time whenever the record is edited.
album: String
});

var AlbumsModel = mongoose.model('Albums',albums);
var BandsModel = mongoose.model('Bands',bands);
var CommentsModel = mongoose.model('Comments',comments);


module.exports = {
	album:AlbumsModel,
	band:BandsModel,
	comment:CommentsModel
};