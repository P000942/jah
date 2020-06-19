// var express = require('express');
// var app = express();
import express   from 'express';
const app = express();
app.basePath = __dirname + '/public/';
app.use(express.static('public'));
export default app;
