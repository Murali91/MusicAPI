

//Private function to print the status and message in a pretty format

function _response(res,next,status,code,data){
	var response={
		'status':status,
		'Data':data
	};
	res.setHeader('Content-Type','application/json');
	res.writeHead(code);
	res.end(JSON.stringify(response));
}

//Public function used to display success msgs which in turn calls the _response function

module.exports.success = function (res,next,code,data){
	var status = "Success";
	_response (res,next,status,code,data);
}

//Public function used to display failure msgs which in turn calls the _response function

module.exports.failure = function(res,next,code,data){
	var status = "Failure";
	_response (res,next,status,code,data);
}