
import fs        from "fs";
import path      from "path";
import Sequelize from "sequelize";
let db = null;

module.exports = app => {
  if (!db) {
     const config = app.libs.config.database;
     const sequelize = new Sequelize(
          config.NAME
        , config.USER
        , config.PWD
        , config.PARAMS
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
