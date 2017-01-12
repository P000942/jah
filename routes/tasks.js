
// app.get("/tasks"
//        ,(req, res) => {
//          res.json({ tasks: [ {title: "Fazer compras"}
//                            , {title: "Consertar o pc"} ]
//                   });
//        });

// module.exports = app => { app.get("/tasks", (req, res) => {
//         res.json({
//           tasks: [ {title: "Fazer compras"}
//                   , {title: "Consertar o pc"} ]
//                 });
//           });
//        };

module.exports = app => {
  const Tasks = app.models.tasks;
  app.get("/tasks"
        , (req, res) => {
            Tasks.findAll({}
                  , (tasks) => {
                    res.json({tasks: tasks});
             });
     });
};
