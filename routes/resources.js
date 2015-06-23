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
  req.models.ResourceDefinition.findOne({
    'where': {'name': req.params.name},
    'include':[{
      'model': req.models.PropertyDefinition,
      'include':[req.models.PropertyType]
    }]
  }).then(function(def){
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
        res.render('resource_definition_created');
      });
  });

// Resource Routes
var getMappedProperties = function(definition){
  var propertyDefMap = {}
  for(propertyKey in definition.PropertyDefinitions){
    var property_def = definition.PropertyDefinitions[propertyKey];
    propertyDefMap[property_def.id] = property_def;
  }
  return propertyDefMap;
};

var computeResource = function(property_map, resource){
  var properties = resource.Properties;
  var values = {
    'id': resource.id,
    'cache': resource.cache,
    'properties': [],
    'namedProperties': {}
  };

  // populate values
  for(propertyKey in properties){
    var property = properties[propertyKey];
    if(property.definition in property_map)
    {
      var property_def = property_map[property.definition];
      values.namedProperties[property_def.name] = property.value;
      values.properties.push({
        'id': property.id,
        'name': property_def.name,
        'value': property.value,
        'definition': property.definition,
        'cache': property.cache
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
        var property_map = getMappedProperties(definition);

        var flatResources = [];
        for(resourceKey in resources){
          var resource = resources[resourceKey];
          var values = computeResource(property_map, resource);
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

        var property_defs = res.locals.ResourceDefinition.PropertyDefinitions;

        // set properties
        var named_properties = {};
        for(key in property_defs){
          var property_def = property_defs[key];
          if(!property_def.computed){
            if(property_def.name in req.body){
              // TODO validation
              named_properties[property_def.name] = req.body[property_def.name];
            }else{
              // use default if not set
              named_properties[property_def.name] = property_def.default;
            }
          }
        }

        // compute properties
        return Promise.map(property_defs, function(property_def){
          return new Promise(function (resolve, reject) {  
            var property = {'definition': property_def.id, 'resource': resource.id};
            if(!property_def.computed){
              property.value = named_properties[property_def.name];

              var template = Handlebars.compile(property_def.PropertyType.view);
              property.cache = template({'value': property.value});

              resolve(property);
            }else{
              var template = Handlebars.compile(property_def.equation);
              sandbox.run(template(named_properties), function(output){
                property.value = output.result;
              
                var template = Handlebars.compile(property_def.PropertyType.view);
                property.cache = template({'value': property.value});
                
                resolve(property);
              })
            }
          });
        });
      }).then(function(properties){
        // generate resource text from template view
        var definition = res.locals.ResourceDefinition;
        var property_map = getMappedProperties(definition);

        var namedProperties = {};
        for(key in properties){
          property = property_map[properties[key].definition];
          namedProperties[property.name] = properties[key].value;
        }

        var definitionTemplate = Handlebars.compile(definition.view);
        resource.cache = definitionTemplate(namedProperties);
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

    var property_map = getMappedProperties(definition);
    var values = computeResource(property_map, resource);
    
    res.render('resource_item', { 'Resource': values });
  })

router.route('/:name/:id/edit')
  .all(loadDefinition, loadResource)
  .get(function(req, res, next){
    var definition = res.locals.ResourceDefinition;
    var resource = res.locals.Resource;

    var property_map = getMappedProperties(definition);
    var values = computeResource(property_map, resource);
    
    res.render('resource_edit', { 'Resource': values, 'PropertyDefinitions': property_map });
  })
  .post(function(req, res, next){
    var resource = res.locals.Resource;
    
    var property_map = {};
    for( key in resource.Properties ){
      property_map[resource.Properties[key].definition] = resource.Properties[key];
    }

    var property_defs = res.locals.ResourceDefinition.PropertyDefinitions;

    // set properties
    var named_properties = {};
    for(key in property_defs){
      var property_def = property_defs[key];
      if(!property_def.computed){
        if(property_def.name in req.body){
          // TODO validation
          named_properties[property_def.name] = req.body[property_def.name];
        }else{
          // use existing if not set
          named_properties[property_def.name] = property_map[property_def.id].value;
        }
      }
    }

    Promise.map(property_defs, function(property_def){
      // compute properties
      return new Promise(function (resolve, reject) {  
        var property = {'definition': property_def.id, 'resource': resource.id};
        if(!property_def.computed){
          property.value = named_properties[property_def.name];
          resolve(property);
        }else{
          var template = Handlebars.compile(property_def.equation)
          sandbox.run(template(named_properties), function(output){
            property.value = output.result;
            resolve(property);
          })
        }

      });
    }).then(function(properties){
        // generate resource cache from template view
        var definition = res.locals.ResourceDefinition;
        var property_def_map = getMappedProperties(definition);

        var namedProperties = {};
        for(key in properties){
          var property = properties[key];
          var property_def = property_def_map[property.definition];
          namedProperties[property_def.name] = property.value;

          // recompute property cache if value changed
          if(property_map[property.definition].value !== property.value){
            var template = Handlebars.compile(property_def.PropertyType.view);
            property.cache = template({'value': property.value});
          }
        }

        var definitionTemplate = Handlebars.compile(definition.view);
        resource.cache = definitionTemplate(namedProperties);

        return properties;
    }).map(function(property){
      // save property value and cache if value changed
      if(property_map[property.definition].value !== property.value){
        property_map[property.definition].value = property.value;
        property_map[property.definition].cache = property.cache;
        return property_map[property.definition].save();        
      }else{
        return;
      }
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