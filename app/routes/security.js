const express = require('express'),
      mongoose = require('mongoose');

module.exports = (app) => {
  let router = express.Router();

  router.get("/", app.locals.authorizeFor("administrateur"), (req, res, next) => {
    let SecuritySettings = mongoose.model("SecuritySettings");

    SecuritySettings.findOne({}).then((result) => {
      res.render('security', { 
        passwordRules: result.passwordRules,
        passwordChange: result.passwordChange,
        bruteforce: result.bruteforce,
        session: result.session
      });
    }).catch((err) => {
      res.render('index', { result: JSON.stringify(err) });
    });
  });

  router.post("/setting", app.locals.authorizeFor("administrateur"), (req, res, next) => {
    let SecuritySettings = mongoose.model("SecuritySettings");
    SecuritySettings.findOne({}).then((setting) => {
      setting.bruteforce.maxAttempt = req.body.maxAttempt;
      setting.bruteforce.delay = req.body.delay;
      setting.bruteforce.blockAccess = req.body.blockAccess;
      setting.passwordChange.onBruteForceMaxAttempt = req.body.onBruteForceMaxAttempt;
      setting.passwordChange.forgetPassword = req.body.forgetPassword;
      setting.passwordChange.strongAuthentication = req.body.strongAuthentication;
      setting.passwordChange.renewalDelay = req.body.renewalDelay;
      setting.passwordRules.minlength = req.body.minlength;
      setting.passwordRules.maxlength = req.body.maxlength;
      setting.passwordRules.upperlowercase = req.body.upperlowercase;
      setting.passwordRules.number = req.body.number;
      setting.passwordRules.specialChar = req.body.specialChar;
      setting.session.maxAge = req.body.maxAge;
      setting.save().then((setting) => {
        let Log = mongoose.model("Log");
        new Log({
          message: `Security settings updated`,
          user: req.user,
          ip: req.ip,
          user_agent: req.headers['user-agent']
        }).save();

        res.redirect('/security');
      }).catch((err) => {
        res.redirect('security', { result: JSON.stringify(err) });
      });
    }).catch((err) => {
      res.render('index', { result: JSON.stringify(err) });
    });
  });

  router.get('/unblockuser', app.locals.authorizeFor("administrateur"), (req, res, next) => {
    let User = mongoose.model("User");

    User.find({ $or:[ { 'block.expire_at': { $gt : new Date() } }, { 'block.deepBlock': true } ] }).then((users) => {
      res.render('unblockuser', { users: users });
    });
  })
  
  router.get('/unblockuser/:user_id', app.locals.authorizeFor("administrateur"), (req, res, next) => {
    let User = mongoose.model("User");

    User.findById(req.params.user_id).then((user) => {
      user.block.deepBlock = false;
      user.block.expire_at = null;
      user.save().then((u) => {
        res.redirect('/security/unblockuser');
      });
    });
  });

  router.get('/journal', app.locals.authorizeFor("administrateur"), (req, res, next) => {
    let Log = mongoose.model('Log');
    Log.find().populate('user').limit(20).sort({ created_at: 'desc' }).then((logs) => {
      res.render('logs', { title: 'Journal', logs: logs });
    })
  });

  return router;
}
