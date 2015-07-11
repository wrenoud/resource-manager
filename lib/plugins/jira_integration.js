var express = require('express')
  , router = express.Router()
  , JiraClient = require('jira-connector')
  , LocalStrategy = require('passport-local').Strategy;

module.exports = function(interface){

  // setup plugin Authentication

  var strategy = new LocalStrategy(
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
  );

  var serializeUser = function(user, done) {
    done(null, {key: user.key, password: user.password});
  };

  var deserializeUser = function(userCred, done) {
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
        user.jira = jira;
      }
      return done(error, user);
    });
  };

  interface.registerAuthentication('jira', strategy, serializeUser, deserializeUser,
    { 
      successRedirect: '/',
      failureRedirect: '/'
    }
  );

  // setup plugin API

  router.use('/groups', function(req, res, next) {
    req.user.jira.groups.findGroups({query: req.query.query},function(error, groups){
      var options = [];
      if(!error){
        for(group in groups.groups) options.push({label: groups.groups[group].name, category: 'Group'});
        res.json(options);
      }
    })
  });

  router.use('/users', function(req, res, next) {
    req.user.jira.user.searchPicker({query: req.query.query},function(error, users){
      console.log(users);
      var options = [];
      if(!error){
        for(user in users.users) options.push({label: users.users[user].name, category: 'Group'});
        res.json(options);
      }
    })
  });
  
  var apiRoute = interface.registerAPI("jira", router);

}