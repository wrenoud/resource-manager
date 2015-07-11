var express = require('express')
  , path = require('path')
  , favicon = require('serve-favicon')
  , logger = require('morgan')
  , cookieParser = require('cookie-parser')
  , bodyParser = require('body-parser');

var uuid = require('node-uuid');

// start app
var app = express();

// load models
var models = require('./models');

// load plugins
var pluginsInterface = app.interface = require('./lib/plugin_interface')(app, models);
require('./lib/plugins/base_types')(pluginsInterface);
require('./lib/plugins/jira_integration')(pluginsInterface);

pluginsInterface.initializeTypes();

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

// make models accessable to routes
app.use(function(req,res,next){
  req.models = models;
  next();
});

app.locals.runid = uuid.v4();
app.get('/reload', function(req,res){
  res.json({'runid': app.locals.runid});
});

// configure authentication
pluginsInterface.initializeAuthentications();

// routes
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

app.use('/',                  require('./routes/index'));
app.use(app.locals.APP_PATH,  require('./routes/resource_definition'));
pluginsInterface.initializeAPIs();

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
