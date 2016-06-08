var express = require('express');
var path = require('path');
//var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var app = express();
var server = require('http').createServer(app);
var io=require('socket.io').listen(server);
server.listen(process.env.PORT || 3000);
users=[];
connections=[];


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));



app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", 'GET, POST, PUT, PATCH, DELETE');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


//io.configure(function () {
//io.set('transports', ['xhr-polling']);
//io.set('polling duration', 10);
//});

app.get('/', function(req,res){
   // res.sendFile(__dirname+'/index.html');
   res.send('ESRI chat');
});




io.sockets.on('connection', function(socket){
  connections.push(socket);
  console.log("Connected: " + connections.length + " socket(s) connected");

//Disconnect
  socket.on('disconnect', function(){   //disconnect is a key word
    users.splice(users.indexOf(socket.username,1));
    updateUsernames();
    connections.splice(connections.indexOf(socket),1);
    console.log("Disconnected: " + connections.length + " socket(s) connected");
  });

//SEND MESSAGE
  socket.on('send message', function(data){
    io.sockets.emit('new message', {msg: data, user:socket.username, for:data.for});
  });

//NEW USER LOGS IN
  socket.on('new user', function(data,callback){
    callback(true);
    socket.username=data;  ///******************** every socket is unique, therefore socket.username is unique
    users.push(socket.username);
    updateUsernames();
  });
  
//socket.on('new namespace', function (data, callback) {
//    var nsp = io.of(data);
//    nsp.on('connection', function (socket) {

//    });
//    io.sockets.emit('send namespace', data);

//});

  function updateUsernames(){
    io.sockets.emit('get users',users);
  }


});



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));


app.use(logger('dev'));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));




//app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});



// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
