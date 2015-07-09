// initialize authentication
var JiraClient = require('jira-connector');
var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy
  , session = require('express-session');

passport.use('local', new LocalStrategy(
  function(username, password, done) {
    var jira = new JiraClient( {
      host: 'jira.qps.nl',
      basic_auth: {
        username: username,
        password: password
      }
    });
    
    jira.user.getUser({username: username}, function(error, user) {
      if(!error){
        user.password = password;
        console.log(user);
        return done(null, user);
      }else{
        return done(null, false, error);
      }
    });
  }
));
passport.serializeUser(function(user, done) {
  done(null, {key: user.key, password: user.password});
});

passport.deserializeUser(function(userCred, done) {
  var username = userCred.key;
  var password = userCred.password;

  var jira = new JiraClient( {
    host: 'jira.qps.nl',
    basic_auth: {
      username: username,
      password: password
    }
  });
  
  jira.user.getUser({username: username}, function(error, user) {
    if(!error){
      user.password = password;
    }
    return done(error, user);
  });
});

var authenticate = function(app){
  app.use(session({ secret: 'fsdaafsdfasdfdsa' }));
  app.use(passport.initialize());
  app.use(passport.session());

  app.post('/login',
    passport.authenticate('local', { successRedirect: '/',
                                     failureRedirect: '/' })
  );
  app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
  });
  
  app.use(function(req, res, next) {
    res.locals.user = req.user;
    next();
  });

  return passport;
};

module.exports = authenticate;