// var express = require('express');
// var app = express();
// var app = require('app');
import app       from '../app'
import consign   from 'consign';

//app.use(express.static('public'));

consign()
         .include("db.js")
         .then("models")
         .then("libs/middlewares.js")
         .then("routes")
         .then("libs/boot.js")
         .into(app);
