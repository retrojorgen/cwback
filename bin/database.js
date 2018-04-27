var mongoose = require('mongoose');
var Schema = mongoose.Schema;
mongoose.connect('mongodb://localhost/crewportalen', { useMongoClient: true });
mongoose.Promise = global.Promise;
var helpers = require('../bin/helpers.js');
var database = require('../bin/database.js');

var User = mongoose.model('User', 
  { 
    sub: String,
    userInfoBlob: Object,
    authorization: String,
    nickname: String,
    birthday: Date,

    name: String,
    email: String,
    phone: String,

    address: {
      address1: String,
      address2: String,
      postNumber: Number,
      state: String,
      country: String
    },

    picture: String,
    pictureSmall: String,
    

    nextToKin: [
      {
        name: String,
        phone: String
      }
    ],

    hasDisease: Boolean,
    diseaseNote:String,

    food: [
      String
    ],
    foodNote: "",
    foodToggle: Boolean,

    religionFood: [
      String
    ],
    religionFoodNote: String,
    religionFoodToggle: Boolean,

    noFood: [
      String
    ],
    noFoodNote: "",
    noFoodToggle: Boolean,
    
    tShirtSize: "",


    verifiedSections: [String],
    /**
     * Sections:
     * profile, address, nexttokin, disease, food, tshirt
     */
    verified: Boolean,
    updated: Date,
    saved: Boolean
  }
);

var Event = mongoose.model('Event', 
  { 
    name: String,
    created: Date,
    from: Date,
    to: Date,
    members: [
      {
        userId: Schema.Types.ObjectId,
        membership: String   
      }
    ],
    pending: [
      {
        userId: Schema.Types.ObjectId,
        pending: String
      }
    ],
    crews: [
      {
        crewName: String,
        members: [
          {
            userId: Schema.Types.ObjectId,
            membership: String
          }
        ]
      }
    ]
  }
);

let mergeUserData = function (user, clientData, authorization, userInfo) {
  user.name = userInfo.name || '';
  user.nickname = userInfo.nickname || user.name;
  user.picture = userInfo.sub.includes("facebook") ? `https://graph.facebook.com/${userInfo.sub.replace("facebook|", "")}/picture?width=1000` : userInfo.picture;
  user.sub = userInfo.sub;
  user.userInfoBlob = userInfo;
  user.authorization = authorization;
  return user;
}


let addUser = function (clientUser, authorization, callback) {
  helpers.getUserInfo(authorization, function (userInfo) {
    let userObj = {};
    userObj = mergeUserData(user, clientData, authorization, userInfo);
    let user = new User(userObj);

    user.save(function (err) {
      if(err) {
        callback(false);
      } else {
        callback(user);
      }
    });
  });
}

let updateUser = function (id, section, update, callback) {
  User.findById(id, function (err, user) {
    if(!err) {
      switch(section) {
        case 'profile': user.name = update.name; user.phone = update.phone; user.email = update.email; break;
        default: callback(false); break;

      }
      
      if(user.verifiedSections && user.verifiedSections.indexOf(section) < 0) {
        user.verifiedSections.push(section);
      } else if(!user.verifiedSection) {
        user.verifiedSections = [section];
      }

      User.update(function (err) {
        if(!err)
          callback(user);
      });
    }
  })
  
}

let getUserFromId = function (userId, callback) {
  User.findById(userId, function (err, user) {
    if(!err)
      callback(user);
    else {
      callback(false);
    }  
  })
}

let getUsersFromListOfIds = function (userIds, callback) {
  
  User.find({"_id": {$in: userIds}}).sort('name').exec(function (err, members) {
    let membersList = {};
    console.log(members);
    
    if(!err) {
      members.forEach(function (member) {
        membersList[member._id] = member;
      })
      callback(membersList, members);
    } else {
      callback(false);
    }
  });
}

let getEventFromEventId = function (eventId, callback) {
  Event.findById(eventId, function (err, event) {
    if(!err) {
      let users = [];
      
      event.members.forEach(function (member) {
        if(users.indexOf(member.userId) === -1) {
          users.push(member.userId);
        }
      });

      getUsersFromListOfIds(users, 
        function (members, membersArray) {
          callback(event, members, membersArray);
      });
    } else {
      callback(false, false);
    }
  });
}

let getEventsFromUserId = function (userId, callback) {
  Event.find({
    $query: { "members.userId": userId},
    $orderby: {from: -1}
  }, function (err, events) {
    if(!err) {
      let users = [];
      if(events.length) {

        events.forEach(function (event) {
          event.members.forEach(function (member) {
            if(users.indexOf(member.userId) === -1) {
              users.push(member.userId);
            }
          });
        });

        getUsersFromListOfIds(users, 
          function (members, membersArray) {
            callback(events, members, membersArray);
        });

      } else {
        callback(events, []);
      }
    } else {
      callback(false, false);
    }
  });
}

let getPendingsEventsFromUserId = function (userId, callback) {
  Event.find({
    $query: { "pending.userId": userId},
    $orderby: {from: -1}
  }, function (err, events) {
    if(!err) {
      callback(events);
    } else {
      callback([]);
    }
  });
}

let setPendingOnEventFromUserId = function (eventId, userId, callback) {
  Event.findById(eventId, function(err, event) {
    if(!err) {
      let newPendingUser = {
        userId: userId,
        pending: 'waiting'
      };
  
      if(event.pending) {
        event.pending = [newPendingUser];
      } else {
        let applied = false;
        event.pending.forEach((pending) => {
          if(pending.userId == userId)
            applied = true;
        });
        if(!applied) // our user has not applied before
          event.pending.push(newPendingUser);
      }
  
      event.save(function () {
          callback(event);
      });
    } else {
      callback({});
    }
    
  });
}

let getEventsWhereUserIdIsNotMember = function (userId, callback) {
  console.log('yo mustafa', userId);
  Event.find({
    $query: { "members.userId": {$nin: [userId]}, "pending.userId": {$nin: [userId]}},
    $orderby: {from: -1}
  }, function (err, events) {
    console.log(err, events);
    if(!err) {
      callback(events);
    } else {
      callback([]);
    }
  });
}

let createEvent = function (eventData, userId, callback) {
  let event = new Event({
    name: eventData.name,
    from: eventData.from,
    to: eventData.to,
    members: [
      {
        userId: userId,
        membership: "admin"
      }
    ]
  });

  event.save(function (err) {
    if(err) {
      callback(false);
    } else {
      callback(event);
    }
  });
}

let getUserFromSub = function (sub, callback) {

  User.findOne({
    sub: sub
  }, function (err, foundUser) {
    if(!err && foundUser) {
      callback(foundUser);
    } else {
      callback(false);
    }
  })
}

let getUser = function (clientUser, authorization, callback) {
  User.findOne({
    sub: clientUser.sub
  }, function (err, foundUser) {
    if(!err && foundUser) {
      if(err) {
        callback(false);
      } else {
        callback(foundUser);
      }
    } else {
      addUser(clientUser, authorization, function (newUser) {
        if(newUser) {
          callback(newUser);  
        } else {
          callback(false);
        }
      });
    } 
  });
}

module.exports = {
  addUser: addUser,
  getUser: getUser,
  getUserFromSub: getUserFromSub,
  createEvent: createEvent,
  getEventsFromUserId: getEventsFromUserId,
  getEventsWhereUserIdIsNotMember: getEventsWhereUserIdIsNotMember,
  getPendingsEventsFromUserId: getPendingsEventsFromUserId,
  setPendingOnEventFromUserId: setPendingOnEventFromUserId,
  getEventFromEventId: getEventFromEventId,
  getUserFromId: getUserFromId
}