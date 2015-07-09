var express = require('express');
var router = express.Router();

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
module.exports = router;