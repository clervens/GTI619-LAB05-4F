const express = require('express'),
      mongoose = require('mongoose');

module.exports = (app) => {

  let router = express.Router();

  router.get("/", (req, res, next) => {
    let users = mongoose.model("User");
    let Set = mongoose.model("SecuritySettings");
    users.find({}).populate(['role','card','info']).limit(5).then((result) => {
      res.render('index', { result: JSON.stringify(result, null, 2) });
    }).catch((err) => {
      res.render('index', { result: JSON.stringify(err) });
    });
    // Set.findOne().then((result) => {
    //   res.render('index', { result: JSON.stringify(result, null, 2) });
    // }).catch((err) => {
    //   res.render('index', { result: JSON.stringify(err) });
    // });
  });

  router.get('/about', (req, res, next) => {
    res.render('about');
  });

  router.get('/contact', (req, res, next) => {
    res.render('contact');
  });

  router.post('/contact', (req, res, next) => {
    req.flash('contact', 'Your message has been succesfully send. The administrator will contacts you.')
    res.render('contact');
  });

  return router;
}
