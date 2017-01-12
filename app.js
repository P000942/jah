// var express = require('express');
// var app = express();
import express   from 'express';
import config    from './libs/config';
const app = express();
app.config = config;
app.use(express.static('public'));

// module.exports = app;
export default app;
