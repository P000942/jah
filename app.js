// var express = require('express');
// var app = express();
import express   from 'express';
const app = express();
app.use(express.static('public'));
export default app;
