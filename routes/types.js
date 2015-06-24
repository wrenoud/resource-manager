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
    res.render("type_new");
  })
  .post(function(req, res, next) {
    res.render("construction");
  });

router.route('/:id')
  .get(function(req, res, next) {
    res.render("construction");
  })

router.route('/:id/edit')
  .get(function(req, res, next) {
    res.render("type_edit");
  })
  .post(function(req, res, next) {
    res.render("construction");
  });

router.route('/:id/delete')
  .delete(function(req, res, next) {
    res.json({'success': false, 'message': 'Under Construction'});
  })

module.exports = router;
