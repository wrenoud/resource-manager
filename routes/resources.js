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
  var definition;
  req.models.ResourceDefinition.create({'name':req.body.name})
    .then(function(def){
      definition = def;
      var properties = req.body.properties;
      for(key in properties){
        properties[key]['ResourceDefinitionId'] = def.id
      }
      return req.models.PropertyDefinition.bulkCreate(properties);
    //}).then(function(properties){
    //  return definition.addPropertyDefinitions(properties);
    }).then(function(){
      return req.models.ResourceDefinition.findAll();
    }).then(function(defs){
      res.render('resources', { 'ResourceDefinitions': defs });
    });
});

router.get('/:id', function(req, res, next) {
  console.log(req.params);
  req.models.ResourceDefinition.findOne({'where': {'id': req.params.id}, 'include':[req.models.PropertyDefinition]})
    .then(function(def){
      console.log(def);
      return req.models.ResourceDefinition.findAll();
    }).then(function(defs){
      res.render('resources', { 'ResourceDefinitions': defs });
    });
});
module.exports = router;