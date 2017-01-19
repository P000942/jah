import app       from '../app'
import consign   from 'consign';

consign()
   .include("libs/config.js")
   .then("db.js")
   .then("libs/middlewares.js")
   .then("helper/route.js")
   .then("routes")
   .then("libs/boot.js")
   .into(app);
