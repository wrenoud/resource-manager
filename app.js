var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var uuid = require('node-uuid');

var index = require('./routes/index');
var resources = require('./routes/resources');

// start app
var app = express();

// load models
var models = require('./models');
if(false){
  models.sequelize.sync({ force: true }).then(function(){
    models.PropertyType.bulkCreate([
      {'name':'Number', 'pattern': '[-+]?[0-9]*[.,]?[0-9]+', 'view':'{{value}}'},
      {'name':'Text',   'pattern': '.*', 'view':'{{value}}'},
      {'name':'URL',    'pattern': 'https?://([a-zA-Z\d]+\.)+[a-zA-Z\d]{2,6}(/[/\w \.-]*)*', 'view':'<a target="_blank" href="{{value}}">{{value}}</a>'}
    ]);
  });  
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev', {
  skip: function (req, res) {
    if(req.originalUrl == "/reload") return true;
    return false;
  }
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req,res,next){
  req.models = models;
  next();
});

app.locals.APP_PATH = '/resources';
app.locals.appPath = function(){
  var args = Array.prototype.slice.call(arguments).map(String);
  args.unshift(app.locals.APP_PATH);
  return path.join.apply(null, args).replace(/\\/g,'/');
};
app.locals.path = function(){
  var args = Array.prototype.slice.call(arguments).map(String);
  return path.join.apply(null, args).replace(/\\/g,'/');
};

app.use('/', index);
app.use(app.locals.APP_PATH, resources);

app.locals.runid = uuid.v4();
app.get('/reload', function(req,res){
  res.json({'runid': app.locals.runid});
});

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
