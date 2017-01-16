// import fs        from "fs";
// import path      from "path";
// import Sequelize from "sequelize";
// let db = null
// module.exports = app => {
//    if (!db) {
//       const db_conf = app.libs.config;
//       sequelize = new Sequelize( db_conf.NAME
//                                , db_conf.USER
//                                , db_conf.PWD
//                                , db_conf.PARAMS
//                              );
//        db = { sequelize, Sequelize, models: {} };
//        const dir = path.join(__dirname, "models");
//        fs.readdirSync(dir).forEach(file => {
//           const modelDir = path.join(dir, file);
//           const model = sequelize.import(modelDir);
//           db.models[model.name] = model;
//        });
//        Object.keys(db.models).forEach(key => {
//                    db.models[key].associate(db.models);
//              });
//     }
//  return db;
// };
import fs from "fs"; import path from "path"; import Sequelize from "sequelize";
let db = null;
module.exports = app => {
  if (!db) {
     const config = app.libs.config;
     const sequelize = new Sequelize(
         config.NAME
       , config.USER
       , config.PWD
       , config.PARAMS ); 
    db = { sequelize, Sequelize, models: {} };
    const dir = path.join(__dirname, "models");
    fs.readdirSync(dir).forEach(file => {
      const modelDir = path.join(dir, file);
      const model = sequelize.import(modelDir);
      db.models[model.name] = model; });
      Object.keys(db.models).forEach(key => { db.models[key].associate(db.models); });
}
return db;
};
