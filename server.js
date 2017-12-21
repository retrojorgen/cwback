'use strict';

const express = require('express');
const app = express();

const jwt = require('express-jwt');
const jwks = require('jwks-rsa');
const cors = require('cors');
const bodyParser = require('body-parser');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

var standardRoutes = require('./routes/standardRoutes');

app.use('/api', standardRoutes);

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

app.listen(3333);
console.log('Listening on localhost:3333');