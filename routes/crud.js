module.exports = app =>{
   //app.helper.route.createRouteCrudBasic("Papel");
   for (const key in app.db.models){
      //console.log(key + ":" + app.db.models[key].isCrud);
      if (app.db.models[key].isCrud)
         app.helper.route.createRouteCrudBasic(key);
   };
};
