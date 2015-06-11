var request = require('request');
var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');
var util = require('../lib/utility');
// var Promise = require('bluebird');

var db = require('../app/config');
var mongoUser = require('../app/models/mongoUser');
var mongoLink = require('../app/models/mongoLink');
var User = require('../app/models/user');
var Link = require('../app/models/link');
var Users = require('../app/collections/users');
var Links = require('../app/collections/links');
// Promise.promisifyAll(mongoose)

exports.renderIndex = function(req, res) {
  res.render('index');
};

exports.signupUserForm = function(req, res) {
  res.render('signup');
};

exports.loginUserForm = function(req, res) {
  res.render('login');
};

exports.logoutUser = function(req, res) {
  req.session.destroy(function(){
    res.redirect('/login');
  });
};

exports.fetchLinks = function(req, res) {

  mongoLink.find(function(err, links) {
    if(err) throw err;
    res.send(200, links);
  });
};

exports.saveLink = function(req, res) {
  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.send(404);
  }

  mongoLink.findOne({ 'url': uri }, function(err, link) {
    if(err) throw err;
    if (link) {
      res.send(200, link);
    } else {
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.send(404);
        }

        var link = new mongoLink({
          'url': uri,
          'title': title,
          'base_url': req.headers.origin
        });

        link.save(function(err, newLink) {
          if(err) {
            res.send(500, err);
          }
          res.send(200, newLink);
        });
      });
    }
  });
};

exports.loginUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  mongoUser.findOne({'username': username}).exec(function(err, user) {
      if (err) throw err;
      if (!user) {
        res.redirect('/login');
      } else {
        user.verifyPassword(password, function(err, valid) {
          if(err) throw err;
          if (valid) {
            util.createSession(req, res, user);
          } else {
            res.redirect('/login');
          }
        })
      }
  });
};

exports.signupUser = function(req, res) {
  console.log('Gets to correct API endpoint', req.body);
  var username = req.body.username;
  var password = req.body.password;

  mongoUser.findOne({'username': username}).exec(function(err, user) {
    console.log(user);
    if(!user) {
      var newUser = new mongoUser({
        'username': username,
        'password': password
      });

      newUser.save(function(err, newUser){
        if(err) {
          res.send(500, err);
        }
        util.createSession(req, res, this);
      });
    } else {
      console.log('Account already exists');
      res.redirect('/signup');
    }
  });
};

exports.navToLink = function(req, res) {
  mongoLink.findOne({'code': req.params[0] }).exec(function(err, link) {
    if(err) throw err;
    if (!link) {
      res.redirect('/');
    } else {
      link.visits++;
      link.save(function(err, link) {
        if(err) throw err;
        return res.redirect(link.url);
      });
    }
  });
};
