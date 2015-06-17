var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  var definitions;

  req.models.ResourceDefinition.findAll()
    .then(function(defs){
      definitions = defs;
      return req.models.PropertyType.findAll();
    }).then(function(types){
      res.render('resources', { 'ResourceDefinitions': definitions, "PropertyTypes": types });
    });
});

router.post('/', function(req, res, next) {
  console.log(req.body);
  var definition;
  var propertyTypes;

  // create resource
  req.models.ResourceDefinition.create({'name':req.body.name})
    .then(function(def){
      definition = def;
      var properties = req.body.properties;
      for(key in properties)
      {
        properties[key]['ResourceDefinitionId'] = def.id
      }
      // create properties with relationship
      return req.models.PropertyDefinition.bulkCreate(properties);
    //}).then(function(properties){
    //  return definition.addPropertyDefinitions(properties);
    }).then(function(){
      return req.models.PropertyType.findAll();
    }).then(function(types){
      propertyTypes = types;
      // find resources to list
      return req.models.ResourceDefinition.findAll();
    }).then(function(defs){
      res.render('resources', { 'ResourceDefinitions': defs, "PropertyTypes": propertyTypes });
    });
});

router.get('/:id', function(req, res, next) {
  var propertyTypes;

  console.log(req.params);
  req.models.ResourceDefinition.findOne({'where': {'id': req.params.id}, 'include':[req.models.PropertyDefinition]})
    .then(function(def){
      console.log(def);
      return req.models.PropertyType.findAll();
    }).then(function(types){
      propertyTypes = types;
      return req.models.ResourceDefinition.findAll();
    }).then(function(defs){
      res.render('resources', { 'ResourceDefinitions': defs, "PropertyTypes": propertyTypes });
    });
});
module.exports = router;