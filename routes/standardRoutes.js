const express = require('express')
const router = express.Router();
const helpers = require('../bin/helpers')
const database = require('../bin/database')

router.get('/user', helpers.authCheck, helpers.localAuth,  (req,res) => {
  database.getUser(req.user, req.headers.authorization, function (user) {
    res.json(user);
  });
});

router.get('/user/:id', helpers.authCheck, helpers.localAuth,  (req,res) => {
  let userId = req.params.id;
  database.getUserFromId(userId, function (user) {
    res.json(user);
  });
});


router.post('/user/update/profile', helpers.authCheck, helpers.localAuth,  (req,res) => {
  let update = req.body;
  database.updateUser('profile', userId, function (user) {
    res.json(user);
  });
});

router.get('/events', helpers.authCheck, helpers.localAuth,  (req,res) => {
  database.getEventsFromUserId(req.databaseUser._id, function (events, members, membersArray) {
    res.json({
      events: events,
      members: members,
      membersArray: membersArray
    });
  });
});

router.get('/event/:id', helpers.authCheck, helpers.localAuth,  (req,res) => {
  var eventId = req.params.id;
  database.getEventFromEventId(eventId, function (event, members, membersArray) {
    res.json({
      event: event,
      members: members,
      membersArray: membersArray
    });
  });
});

router.get('/events/other', helpers.authCheck, helpers.localAuth,  (req,res) => {
  database.getEventsWhereUserIdIsNotMember(req.databaseUser._id, function (events) {
    res.json(events);
  });
});

router.get('/events/pending', helpers.authCheck, helpers.localAuth,  (req,res) => {
  database.getPendingsEventsFromUserId(req.databaseUser._id, function (events) {
    res.json(events);
  });
});


router.post('/event/create', helpers.authCheck, helpers.localAuth,  (req,res) => {
  var event = req.body;
  database.createEvent(event, req.databaseUser._id, function (event) {
    res.json(event);
  });
});

router.put('/event/apply/:id', helpers.authCheck, helpers.localAuth,  (req, res) => {
  database.setPendingOnEventFromUserId(req.params.id, req.databaseUser._id, function (event) {
    res.json(event);
  });
});

module.exports = router;