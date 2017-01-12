// var express = require('express');
// var app = express();
// var app = require('app');
import app       from '../app'
import consign   from 'consign';
// const STD = app.config

//app.use(express.static('public'));

consign().include("models")
         .then("libs/middlewares.js")
         .then("routes")
         .then("libs/boot.js")
         .into(app);

// app.listen(STD.PORT, () => {
//   console.log('Server ON port ' + STD.PORT);
// });
