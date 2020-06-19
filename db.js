import fs        from "fs";
import path      from "path";
import Sequelize from "sequelize";
import config    from "./libs/config";
//import t$    from "./libs/t$";
import app from "./app";
//console.log("Teste DATABASE NAME...." + config.database.NAME);
let db = null;
module.exports = app => {
  if (!db) {
     const dbConfig = config.database; //app.libs.config.database;
     const sequelize = new Sequelize(
          dbConfig.NAME
        , dbConfig.USER
        , dbConfig.PWD
        , dbConfig.PARAMS
     );
     db = { sequelize
          , Sequelize
          , models: {}
        };
     const dir = path.join(__dirname, "models");
     fs.readdirSync(dir).forEach(file => {
        const modelDir = path.join(dir, file);
        const model = sequelize.import(modelDir);
        db.models[model.name] = model;
    });
    Object.keys(db.models).forEach(key => {
        if (db.models[key].associate){
           db.models[key].associate(db.models);
        }   
    });
  }
  return db;
};
