var path = require('path')
  , Promise = require("bluebird")
  , passport = require('passport')
  , session = require('express-session');

var pluginInterface = function(app, models){
  this.app = app;
  this.models = models;
  this.app.passport = passport;

  this.types = new Array();
  this.apis = new Array();
  this.authentications = {}
  
  // for permissions autocompletion
  this.userPickers = new Array();
  this.groupPickers = new Array();
}

pluginInterface.prototype.registerUserPicker = function(name, route){
  this.userPickers.push({name: name, route: route});
}
pluginInterface.prototype.registerGroupPicker = function(name, route){
  this.groupPickers.push({name: name, route: route});
}

pluginInterface.prototype.registerType = function(name, pattern, view, controller){
  this.types.push({name: name, pattern: pattern, view: view});
}
pluginInterface.prototype.initializeTypes = function(){
  console.log("Initializing Types");
  var self = this;
  return Promise.map(self.types, function(type){
    return self.models.PropertyType.upsert(type);
  });
}

pluginInterface.prototype.registerAPI = function(name, router){
  var route = "/plugin/" + encodeURIComponent(name);
  this.apis.push({name: name, route: route, router: router});
  return route;
}
pluginInterface.prototype.initializeAPIs = function(){
  var self = this;
  return Promise.map(self.apis, function(api){
    self.app.use(api.route, api.router);
  });
}

pluginInterface.prototype.registerAuthentication = function(name, strategy, serializeUser, deserializeUser, authenticate){
  this.authentications[name] = {
    name: name,
    strategy: strategy,
    serializeUser: serializeUser,
    deserializeUser: deserializeUser,
    authenticate: authenticate
  }
}

pluginInterface.prototype.initializeAuthentications = function(name, strategy){
  var self = this;

  // add strategies
  for(name in this.authentications){
    authentication = this.authentications[name];
    passport.use(name, authentication.strategy);
  }

  // set serialize/deserialize
  passport.serializeUser(function(user, done) {
    if(user.strategy in self.authentications){
      self.authentications[user.strategy].serializeUser(user, function(err, serializedUser){
        done(err, {strategy: user.strategy, data: serializedUser})
      })
    }else{
      done(null, null);
    }
  });
  passport.deserializeUser(function(serializedUser, done) {
    if(serializedUser.strategy in self.authentications){
      self.authentications[serializedUser.strategy].deserializeUser(serializedUser.data, done);
    }
  });

  // initialize session and passport
  this.app.use(session({ secret: 'fsdaafsdfasdfdsa' }));
  this.app.use(passport.initialize());
  this.app.use(passport.session());

  // add auth endpoints
  for(name in this.authentications){
    authentication = this.authentications[name];
    this.app.post(path.join('/login/', name),
      passport.authenticate(
        name,
        authentication.authenticate
      )
    );
  }

  // add logout
  this.app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
  });
  

  this.app.use(function(req, res, next) {
    res.locals.user = req.user;
    next();
  });
};

module.exports = function(app, models){
  return new pluginInterface(app, models);
};
