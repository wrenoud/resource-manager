var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  req.models.ResourceDefinition.findAll()
    .then(function(defs){
      res.render('resources', { 'ResourceDefinitions': defs });
    });
});

router.post('/', function(req, res, next) {
  console.log(req.body);
  req.models.ResourceDefinition.create({'name':req.body.name})
    .then(function(def){
      var properties = req.body.properties;
      for( key in properties){
        console.log(properties[key]);
      }

      return req.models.ResourceDefinition.findAll();
    }).then(function(defs){
      res.render('resources', { 'ResourceDefinitions': defs });
    });
});

module.exports = router;