//setup Dependencies
var connect = require('connect')
    , express = require('express')
    , http = require('http')
    , socketio = require('socket.io')
    , pg = require('pg')
    , config = require('./conf/config')
    , randomname = require('./src/randomname')
    , port = (process.env.PORT || 8081);

//Setup Express
var app = express();
app.set('views', __dirname + '/views');
app.set('view options', { layout: false });
app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.session({ secret: "shhhhhhhhh!"}));
app.use(connect.static(__dirname + '/static'));
app.use(app.router);
app.use(express.errorHandler());

var server = app.listen(port);

//Setup Socket.IO
var io = socketio.listen(server);
io.sockets.on('connection', function (socket) {
    console.log('Client Connected');
    socket.on('create_db', function (data) {
        var dbData = {
            url: 'postgres://username:password@host:5432/database',
            name: config.db.database,
            username: config.db.username,
            password: config.db.password,
            host: config.db.host,
            port: '5432'
        };

        socket.broadcast.emit('database_created', dbData);
        socket.emit('database_created', dbData);
    });
    socket.on('disconnect', function () {
        console.log('Client Disconnected.');
    });
});

app.get('/', function (req, res) {
    res.render('index.jade', {
        title: 'Your Page Title',
        description: 'Your Page Description',
        author: 'Your Name'
    });
});

var pgClient = new pg.Client(config.db.url);
pgClient.connect();
app.get('/api', function (req, res) {
    var databaseName = randomname(8);
    var createDbString = 'CREATE DATABASE ' + databaseName + ' WITH OWNER = postgres';
    if(config.db.tablespace) {
        createDbString += ' TABLESPACE ' + config.db.tablespace;
    }
    var query = pgClient.query(createDbString);
    query.on('end', function () {
        var dbUrl = 'postgres://username:password@host:5432/' + databaseName;
        var dbData = {
            url: dbUrl,
            name: databaseName,
            username: config.db.username,
            password: config.db.password,
            host: config.db.host,
            port: '5432'
        };

        io.sockets.emit('database_created', dbData);
        res.send(dbUrl);
    });
});

app.get('*', function (req, res) {
    res.status(404);
    res.render('404.jade', {
            title: '404 - Not Found',
            description: '',
            author: ''
        }
    );
});

console.log('Listening on http://0.0.0.0:' + port);
