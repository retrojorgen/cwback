var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/crewportalen', { useMongoClient: true });
mongoose.Promise = global.Promise;
var helpers = require('../bin/helpers.js');
var database = require('../bin/database.js');

var User = mongoose.model('User', 
  { 
    name: String,
    sub: String,
    userInfoBlob: Object
  }
);


let addUser = function (user, authorization, callback) {
  // we have a facebook user
  if(user.sub.indexOf('facebook') > -1) {
    console.log('facebook user', 'getting facebook info');

    helpers.getUserInfo(authorization, function (userInfo) {

      let user = new User({
        name: userInfo.name,
        sub: user.sub,
        userInfoBlob: userInfo
      });

      user.save(function (err) {
        if(err) {
          console.log(err);
        } else {
          console.log('meow');
        }
      }
    });
    

    
  };
}

let getUser = function (user, authorization, callback) {
  if(user.sub.indexOf('facebook') > -1) {
    User.findOne({
      sub: user.sub
    }, function (err, user) {
      if(!err) {
        // user was found
        if(err);
        
      } else {
        addUser(function (user) {
          if(user) {
            callback(user);  
          }
        });
        callback(false);
      }
        
    })
  }
  
}

module.exports = {
  addUser: addUser,
  getUser: getUser,
}