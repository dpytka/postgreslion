//setup Dependencies
var connect = require('connect')
  , express = require('express')
  , io = require('socket.io')
  , port = (process.env.PORT || 8081);

//Setup Express
var server = express.createServer();
server.configure(function () {
  server.set('views', __dirname + '/views');
  server.set('view options', { layout: false });
  server.use(connect.bodyParser());
  server.use(express.cookieParser());
  server.use(express.session({ secret: "shhhhhhhhh!"}));
  server.use(connect.static(__dirname + '/static'));
  server.use(server.router);
});

//setup the errors
server.error(function (err, req, res, next) {
  if (err instanceof NotFound) {
    res.render('404.jade', {
      locals: {
        title: '404 - Not Found',
        description: '',
        author: '',
        analyticssiteid: 'XXXXXXX'
      },
      status: 404
    });
  } else {
    res.render('500.jade', {
      locals: {
        title: 'The Server Encountered an Error',
        description: '',
        author: '',
        analyticssiteid: 'XXXXXXX',
        error: err
      },
      status: 500
    });
  }
});
server.listen(port);

//Setup Socket.IO
var io = io.listen(server);
io.sockets.on('connection', function (socket) {
  console.log('Client Connected');
  socket.on('create_db', function (data) {
    var dbData = {
      url: 'postgres://username:password@host:5432/database',
        name: 'database',
      username: 'username',
      password: 'password',
      host: 'host',
      port:'5432'
    }

    socket.broadcast.emit('database_created', dbData);
    socket.emit('database_created', dbData);
  });
  socket.on('disconnect', function () {
    console.log('Client Disconnected.');
  });
});


///////////////////////////////////////////
//              Routes                   //
///////////////////////////////////////////

/////// ADD ALL YOUR ROUTES HERE  /////////

server.get('/', function (req, res) {
  res.render('index.jade', {
    locals: {
      title: 'Your Page Title',
      description: 'Your Page Description',
      author: 'Your Name',
      analyticssiteid: 'XXXXXXX'
    }
  });
});

server.get('/api', function (req, res) {
  res.send('postgres://username:password@host:5432/database');
  io.sockets.emit('database_created', {
    url: 'postgres://username:password@host:5432/database',
    name: 'database',
    username: 'username',
    password: 'password',
    host: 'host',
    port:'5432'
  });
});


//A Route for Creating a 500 Error (Useful to keep around)
server.get('/500', function (req, res) {
  throw new Error('This is a 500 Error');
});

//The 404 Route (ALWAYS Keep this as the last route)
server.get('/*', function (req, res) {
  throw new NotFound;
});

function NotFound(msg) {
  this.name = 'NotFound';
  Error.call(this, msg);
  Error.captureStackTrace(this, arguments.callee);
}


console.log('Listening on http://0.0.0.0:' + port);
