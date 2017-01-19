let route = {};
module.exports = app => {
  route.createRouteCrudBasic = (nmModel, idName=`id${nmModel}`) => {
  const nmRoute = nmModel.toLowerCase();
  const dsModel = app.db.models[nmModel];
  app.route("/"+nmRoute)
     .get((req, res) => {
        dsModel.findAll({})
             .then(result => res.json(result))
             .catch(error => {
                 res.status(412).json({msg: error.message});
             });
      })
     .post((req, res) => {
        dsModel.create(req.body)
             .then(result => res.json(result))
             .catch(error => {
                res.status(412).json({msg: error.message});
            });
      });

  app.route(`/${nmRoute}/:${idName}`)
     .get((req, res) => {
         console.log(dsModel.describe);
         dsModel.findOne({where: req.params})
              .then(result => {
                 if (result) {
                    res.json(result);
                 } else {
                    //console.log("Bronca");
                    //res.sendStatus(404);
                    res.status(404).json({msg: `${nmModel} - Registro não encontrado.`});
                 }
              })
              .catch(error => {
                 res.status(412).json({msg: `${nmModel} - Registro não encontrado.`});
              });
     })
     .put((req, res) => {
         dsModel.update(req.body, {where: req.params})
              .then(result => res.sendStatus(204))
              .catch(error => {
                  res.status(412).json({msg: error.message});
              });
     })
     .delete((req, res) => {
          dsModel.destroy({where: req.params})
               .then(result => res.sendStatus(204))
               .catch(error => {
                   res.status(412).json({msg: error.message});
              });
     });
   }
   return route;
}
