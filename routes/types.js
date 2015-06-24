var express = require('express');
var router = express.Router();

router.route('/')
  .get(function(req, res, next) {
    req.models.PropertyType.findAll()
    .then(function(types){
      res.render("type_list", { 'PropertyTypes': types });
    });
  });

router.route('/new')
  .get(function(req, res, next) {
    res.render("construction");
  })
  .post(function(req, res, next) {
    res.render("construction");
  });

router.route('/:id/edit')
  .get(function(req, res, next) {
    res.render("construction");
  })
  .post(function(req, res, next) {
    res.render("construction");
  });

module.exports = router;
