var express = require('express');
var router = express.Router();
var Handlebars = require('handlebars');

var Promise = require('bluebird');
var Sandbox = require('sandbox')
  , sandbox = new Sandbox();

router.route('/')
  .get(function(req, res, next) {
    req.models.ResourceDefinition.findAll()
      .then(function(defs){
        res.render('resource_definition', { 'ResourceDefinitions': defs });
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
      'display': req.body.display,
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
        res.render('resource_definition_created');
      });
  });

var loadDefinition = function(req, res, next){
  req.models.ResourceDefinition.findOne({'where': {'name': req.params.name}, 'include':[req.models.PropertyDefinition]})
    .then(function(def){
      res.locals.ResourceDefinition = def;
      next();
    });
};

router.route('/:name/edit')
  .all(loadDefinition)
  .get(function(req, res, next){
    res.send('Under Construction');
  })
  .post(function(req, res, next){
    res.send('Under Construction');
  });

// Resource Routes
var getMappedProperties = function(definition){
  var propertyDefMap = {}
  for(propertyKey in definition.PropertyDefinitions){
    var propertyDef = definition.PropertyDefinitions[propertyKey];
    propertyDefMap[propertyDef.id] = propertyDef;
  }
  return propertyDefMap;
};

var computeResource = function(propertyMap, resource){
  var properties = resource.Properties;
  var values = {'id': resource.id, 'properties': [], 'namedProperties': {}};

  // populate values
  for(propertyKey in properties){
    var property = properties[propertyKey];
    if(property.definition in propertyMap)
    {
      var propertyDef = propertyMap[property.definition];
      values.namedProperties[propertyDef.name] = property.value;
      values.properties.push({
        'id': property.id,
        'name': propertyDef.name,
        'value': property.value,
        'definition': property.definition
      });
    }else{
      console.log('unknown property definition: ' + property.definition)
      //TODO: ERROR, unknown property definition
    }
  }
  return values;
}

router.route("/:name/")
  .all(loadDefinition)
  .get(function(req, res, next) {
    var definition = res.locals.ResourceDefinition;
    definition.getResources({'include':[req.models.Property]})
      .then(function(resources){
        var definitionTemplate = Handlebars.compile(definition.view);

        // map property definitions once
        var propertyMap = getMappedProperties(definition);

        var flatResources = [];
        for(resourceKey in resources){
          var resource = resources[resourceKey];
          var values = computeResource(propertyMap, resource);
          values.template = definitionTemplate(values.namedProperties);
          flatResources.push(values);
        }
        res.render('resource', { 'Resources': flatResources });
      });
  });

router.route('/:name/new')
  .all(loadDefinition)
  .get(function(req, res, next){
    res.render('resource_new');
  })
  .post(function(req, res, next){
    req.models.Resource.create({'definition': res.locals.ResourceDefinition.id})
      .then(function(resource){
        // compute properties
        return Promise.map(res.locals.ResourceDefinition.PropertyDefinitions, function(propertyDef){
          return new Promise(function (resolve, reject) {  
            var property = {'definition': propertyDef.id, 'resource': resource.id};
            if(!propertyDef.computed){
              if(propertyDef.name in req.body){
                property.value = req.body[propertyDef.name];
              }else{
                property.value =  propertyDef.default;
              }
              resolve(property);
            }else{
              sandbox.run(propertyDef.equation, function(output){
                property.value = output.result
                resolve(property);
              })
            }
          });
        });
      }).then(function(properties){
        return req.models.Property.bulkCreate(properties);
      }).then(function(){
        res.render('resource_created');
      });
  });

router.route('/:name/:id/')
  .all(loadDefinition)
  .get(function(req, res, next){
    var definition = res.locals.ResourceDefinition;
    req.models.Resource.findOne({'where': {'id': req.params.id}, 'include':[req.models.Property]})
      .then(function(resource){
        // map property definitions once
        var propertyMap = getMappedProperties(definition);

        var flatResources = [];
        var values = computeResource(propertyMap, resource);

        res.render('resource_item', { 'Resource': values });
      })
  })

router.route('/:name/:id/edit')
  .all(loadDefinition)
  .get(function(req, res, next){
    res.send('Under Construction');
  })
  .post(function(req, res, next){
    res.send('Under Construction');
  });

module.exports = router;