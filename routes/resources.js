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
        res.render('resource_definition_created', { 'ResourceDefinition': definition });
      });
  });

var loadDefinition = function(req, res, next){
  req.models.ResourceDefinition.findOne({'where': {'name': req.params.name}, 'include':[req.models.PropertyDefinition]})
    .then(function(def){
      res.locals.ResourceDefinition = def;
      next();
    });
};

var loadResource = function(req, res, next){
  req.models.Resource.findOne({'where': {'id': req.params.id}, 'include':[req.models.Property]})
    .then(function(def){
      res.locals.Resource = def;
      next();
    });
};

router.route('/:name/edit')
  .all(loadDefinition)
  .get(function(req, res, next){
    Promise.map(res.locals.ResourceDefinition.PropertyDefinitions, function(propertyDef){
      return propertyDef.getPropertyType()
        .then(function(type){
          propertyDef.PropertyType = type;
        });
    }).then(function(){
      res.render('resource_definition_edit');
    });
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
        res.render('resource_definition_created');
      });
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
  var values = {
    'id': resource.id,
    'text': resource.text,
    'properties': [],
    'namedProperties': {}
  };

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
        // map property definitions once
        var propertyMap = getMappedProperties(definition);

        var flatResources = [];
        for(resourceKey in resources){
          var resource = resources[resourceKey];
          var values = computeResource(propertyMap, resource);
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
    var resource;
    req.models.Resource.create({'definition': res.locals.ResourceDefinition.id})
      .then(function(new_resource){
        resource = new_resource;
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
        // generate resource text from template view
        var definition = res.locals.ResourceDefinition;
        var propertyMap = getMappedProperties(definition);

        var namedProperties = {};
        for(key in properties){
          property = propertyMap[properties[key].definition];
          namedProperties[property.name] = properties[key].value;
        }

        var definitionTemplate = Handlebars.compile(definition.view);
        resource.text = definitionTemplate(namedProperties);
        console.log(req.body);
        return req.models.Property.bulkCreate(properties);
      }).then(function(){
        return resource.save();
      }).then(function(){
        res.render('resource_created');
      });
  });

router.route('/:name/:id/')
  .all(loadDefinition, loadResource)
  .get(function(req, res, next){
    var definition = res.locals.ResourceDefinition;
    var resource = res.locals.Resource;

    var propertyMap = getMappedProperties(definition);
    var values = computeResource(propertyMap, resource);
    
    res.render('resource_item', { 'Resource': values });
  })

router.route('/:name/:id/edit')
  .all(loadDefinition, loadResource)
  .get(function(req, res, next){
    var definition = res.locals.ResourceDefinition;
    var resource = res.locals.Resource;

    var propertyMap = getMappedProperties(definition);
    var values = computeResource(propertyMap, resource);
    
    res.render('resource_edit', { 'Resource': values, 'PropertyDefinitions': propertyMap });
  })
  .post(function(req, res, next){
    var resource = res.locals.Resource;
    
    var propertyMap = {};
    for( key in resource.Properties ){
      propertyMap[resource.Properties[key].definition] = resource.Properties[key];
    }

    Promise.map(res.locals.ResourceDefinition.PropertyDefinitions, function(propertyDef){
      return new Promise(function (resolve, reject) {  
        var property = {'definition': propertyDef.id, 'resource': resource.id};
        if(!propertyDef.computed){
          if(propertyDef.name in req.body){
            property.value = req.body[propertyDef.name];
          }else{
            property.value = propertyDef.default;
          }
          resolve(property);
        }else{
          console.log(propertyDef.equation)
          sandbox.run(propertyDef.equation, function(output){
            property.value = output.result
            resolve(property);
          })
        }
      });
    }).then(function(properties){
        // generate resource text from template view
        var definition = res.locals.ResourceDefinition;
        var propertyMap = getMappedProperties(definition);

        var namedProperties = {};
        for(key in properties){
          property = propertyMap[properties[key].definition];
          namedProperties[property.name] = properties[key].value;
        }

        var definitionTemplate = Handlebars.compile(definition.view);
        resource.text = definitionTemplate(namedProperties);

        return properties;
    }).map(function(property){
      propertyMap[property.definition].value = property.value;
      return propertyMap[property.definition].save();
    }).then(function(){
        return resource.save();
    }).then(function(){
      res.render('resource_created');
    });
  });

router.route('/:name/:id/delete')
  .all(loadDefinition)
  .delete(function(req, res, next){
    req.models.Property.destroy({'where': {'resource': req.params.id}})
      .then(function(destroyed){
        return req.models.Resource.destroy({'where': {'id': req.params.id}})
      }).then(function(destroyed){
        res.json({'success': true, 'result': {'id': req.params.id}});
      });
  });

module.exports = router;