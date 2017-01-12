// var express = require('express');
// var app = express();
import express   from 'express';
// import config    from './config/config';
const app = express();
// app.config = config;
app.use(express.static('public'));
// app.get('/', function (req, res) {
//   res.send('Hello World!');
// });
//
// app.listen(3000, function () {
//   console.log('Example app listening on port 3000!');
// });
// module.exports = app;
export default app;
