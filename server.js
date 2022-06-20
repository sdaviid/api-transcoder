var child_process = require('child_process');
var express = require('express');
const Promise = require('bluebird')
const AppDAO = require('./core/dao')
const videosRepository = require('./models/videos');
const videosDetailRepository = require('./models/videosDetail');

const dao = new AppDAO('./database.sqlite3');


const videosRepo = new videosRepository(dao);
const videosDetailRepo = new videosDetailRepository(dao);

var app = express();

try{
	videosRepo.createTable();
}catch(err){
	console.log(`create table videosRepo exception ${err}`);
}

try{
	videosDetailRepo.createTable();
}catch(err){
	console.log(`create table videosDetailRepository exception ${err}`);
}




var running = false;

var last_message = false;

var id_doing = false;
var id_doing_video = false;

function handbrake_run(){
	videosRepo.findByStatus(0).then(function(response){
		if((running === false) && (response)){
			let item = response[0];
			running = true;
			console.log(`initianting - ${item.id} - ${item.origin}`);
			videosRepo.update_status(item.id, 1);
			videosDetailRepo.create(item.id, 1, 0).then(function(response_video_detail){
				id_doing = item.id;
				id_doing_video = response_video_detail.id;
				let origin = item.origin;
				run_script("HandBrakeCLI", ["-i",origin,"-o",origin.replace('mkv', 'mp4')], function(output, exit_code) {
				    videosRepo.update_status(id_doing, 2);
				    console.log('acabou');
				});
			})
		}else{
			if(id_doing != false){
				let temp = last_message.substring(last_message.indexOf(',')+1).trim();
				temp = temp.substring(0, temp.indexOf('%')).trim();
				videosDetailRepo.update_percentage(id_doing, temp);
			}
		}
	})
}


setInterval( function() { handbrake_run() }, 5000 );


app.get('/video/add', function(req, res){
	let origin = req.query.origin;
	videosRepo.create(origin).then(function(response){
		res.send({id: response.id, origin: response.origin})
	});
});


app.get('/video/get', function(req, res){
	let id = req.query.id;
	videosRepo.getById(id).then(function(response){
		res.send({id: response.id, origin: response.origin});
	});
});


app.get('/video/update-status', function(req, res){
	let id = req.query.id;
	let status = req.query.status;
	videosRepo.update_status(id, status).then(function(response){
		videosRepo.getById(response.id).then(function(response2){
			console.log(response);
			console.log(response2);
			res.send({id: response.id, status: response2.status});
		})
	});
});

app.get('/video/status', function(req, res){
	let id = req.query.id;
	videosDetailRepo.getByIdVideo(id).then(function(response){
		res.send({id: response.id, percentage: response.percentage});
	});
});


var server = app.listen(8081, function () {
   var host = server.address().address
   var port = server.address().port
   
   console.log("server on http://%s:%s", host, port)
});



function run_script(command, args, callback) {
    console.log("Starting Process.");
    var child = child_process.spawn(command, args);

    var scriptOutput = "";

    child.stdout.setEncoding('utf8');
    child.stdout.on('data', function(data) {
    	last_message = data;

        console.log('stdout: ' + data);

        data=data.toString();
        scriptOutput+=data;
    });

    child.stderr.setEncoding('utf8');
    child.stderr.on('data', function(data) {
        console.log('stderr: ' + data);

        data=data.toString();
        scriptOutput+=data;
    });

    child.on('close', function(code) {
        callback(scriptOutput,code);
    });
}