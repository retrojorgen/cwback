const jwt = require('express-jwt');
const jwks = require('jwks-rsa');

const request = require("request");


const getUserInfo = function (authorization, callback) {

  var options = { method: 'GET',
  url: 'https://crewportal.eu.auth0.com/userinfo',
  headers: { authorization: authorization } };

  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    callback(JSON.parse(body));
  });

};

const authCheck = jwt({
  secret: jwks.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        // YOUR-AUTH0-DOMAIN name e.g https://prosper.auth0.com
        jwksUri: "https://crewportal.eu.auth0.com/.well-known/jwks.json"
    }),
    // This is the identifier we set when we created the API
    audience: 'http://crewportalen.io',
    issuer: "https://crewportal.eu.auth0.com/",
    algorithms: ['RS256']
});

module.exports = {
  getUserInfo: getUserInfo,
  authCheck: authCheck
}