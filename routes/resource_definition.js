var express = require('express');
var router = express.Router();

var Promise = require('bluebird');

router.route('/')
  .get(function(req, res, next) {
    req.models.ResourceDefinition.findAll()
      .then(function(defs){
        res.render('resource_definition_list', { 'ResourceDefinitions': defs });
      });
  });

router.route('/new')
  .get(function(req, res, next){
    req.models.PropertyType.findAll()
      .then(function(types){
        console.log("Here");
        res.render('resource_definition_new', { "PropertyTypes": types });
      });
  })
  .post(function(req, res, next) {
    // create resource
    var definition = {
      'name': req.body.name,
      'urn': req.body.urn,
      'description': req.body.description,
      'view': req.body.view
    }
    req.models.ResourceDefinition.create(definition)
      .then(function(def){
        definition = def;
        var properties = req.body.properties;
        for(key in properties)
        {
          properties[key]['definition'] = def.id
        }
        // create properties with relationship
        return req.models.PropertyDefinition.bulkCreate(properties);
      }).then(function(){
        res.redirect('./' + definition.urn + '/');
      });
  });

var loadDefinition = function(req, res, next){
  req.models.ResourceDefinition.findOne({
    'where': {'urn': req.params.resource},
    'include':[{
      'model': req.models.PropertyDefinition,
      'include':[req.models.PropertyType]
    }]
  }).then(function(def){
      res.locals.ResourceDefinition = def;
      next();
    });
};

router.route('/:resource/edit')
  .all(loadDefinition)
  .get(function(req, res, next){
    res.render('resource_definition_edit');
  })
  .post(function(req, res, next){
    var definition = {
      'name': req.body.name,
      'display': req.body.display,
      'description': req.body.description,
      'view': req.body.view
    }
    res.locals.ResourceDefinition.updateAttributes(definition)
      .then(function(){
        res.redirect('./');
      });
  });

router.route('/:resource/delete')
  .all(loadDefinition)
  .delete(function(req, res, next){
    var definition = res.locals.ResourceDefinition;
    console.log(definition.PropertyDefinitions);

    Promise.map(definition.PropertyDefinitions, function(property_def){
      return req.models.Property.destroy({'where': {'definition': property_def.id}})
    }).then(function(destroyed){
      return req.models.PropertyDefinition.destroy({'where': {'definition': definition.id}});
    }).then(function(destroyed){
      return req.models.Resource.destroy({'where': {'definition': definition.id}});
    }).then(function(destroyed){
      return req.models.ResourceDefinition.destroy({'where': {'id': definition.id}});
    }).then(function(destroyed){
      res.json({'success': true, 'result': {'id':  definition.id}});
    });
  });

// sub routers
// 
var types = require('./types');
router.use('/types', types);

var resources = require('./resources');
router.use('/:resource', loadDefinition, resources)

module.exports = router;