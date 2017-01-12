import Sequelize from "sequelize";
import app       from './app'
const db = app.config.database;
let sequelize = null;
module.exports = () => {
   if (!sequelize) {
      sequelize = new Sequelize( db.NAME
                               , db.USER
                               , db.PWD
                               , db.PARAMS
                             );
   }
   return sequelize;
};
//
// import Sequelize from "sequelize";
// // const config = require("./libs/config.js");
// const config = app.config;
// let sequelize = null;
// module.exports = () => { if (!sequelize) { sequelize = new Sequelize( config.name, config.username, config.password, config.params ); } return sequelize; };
