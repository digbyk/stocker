"use strict";

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');

var app = express();

var passport = require('passport');
var GoogleStrategy = require('passport-google').Strategy;

passport.serializeUser(function (user, done) {
	done(null, user.identifier);
	console.log(user);
});
passport.deserializeUser(function (id, done) {
	done(null, {
		identifier: id
	});
	console.log(id);
});

passport.use(new GoogleStrategy({
	returnURL: 'http://localhost:3000/auth/google/return',
	realm: 'http://localhost:3000/'
}, function (identifier, profile, done) {
	profile.identifier = identifier;
	return done(null, profile);
}));

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.session({
	secret: 'wibble'
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' === app.get('env')) {
	app.use(express.errorHandler());
}

app.get('/auth/google/:return?', passport.authenticate('google', {
	successRedirect: '/'
}));

app.get('/auth/logout', function (req, res) {
	req.logout();
	res.redirect('/');
});

app.get('/', routes.index);

var server = http.createServer(app).listen(app.get('port'), function () {
	console.log('Express server listening on port ' + app.get('port'));
});

var io = require('socket.io').listen(server);

io.sockets.on('connection', function (socket) {
	console.log("Connected");
	socket.emit('tick', {
		ticker: 'world',
		value: 111.1
	});
});

var queueSocket = "amqp://localhost";
var queueName = "stocker";
var encoding = "utf8";
var context = require("rabbit.js").createContext(queueSocket);
var sub = context.socket("SUB");

context.on("ready", function () {
	console.log(" [x] Context is ready");
	sub.connect(queueName, function (socket) {
		console.log(" [x] Connected");
	});
});

sub.on("data", function (data) {
	console.log(" [x] Received data: %s", data);
	var buff = new Buffer(data);
	console.log(buff.toString('utf8'));
	io.sockets.emit('tick', JSON.parse(buff.toString('utf8')));
});