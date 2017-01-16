// var express = require('express');
// var app = express();
// var app = require('app');
// import app       from '../app'
// import consign   from 'consign';

//app.use(express.static('public'));
import express from "express";
import consign from "consign";
const app = express();

consign()
       .include("libs/config.js")
       .then("db.js")
       .then("libs/middlewares.js")
       .then("routes")
       .then("libs/boot.js")
       .into(app);
