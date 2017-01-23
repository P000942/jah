module.exports = app =>{
  // MONTA ROTA PADRÃO CRUD todos os models que estão assinalados como crud
   for (const key in app.db.models){
      if (app.db.models[key].isCrud)
         app.helper.route.createRouteCrudBasic(key);
   };
};
