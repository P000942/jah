

// module.exports = app => {
//   const Tasks = app.models.tasks;
//   app.get("/tasks"
//         , (req, res) => {
//             Tasks.findAll({}
//                   , (tasks) => {
//                     res.json({tasks: tasks});
//              });
//      });
// };

// module.exports = app => {
//   const Tasks = app.db.models.Tasks;
//   app.get("/tasks", (req, res) => {
//     Tasks.findAll({}).then(tasks => {
//       res.json({tasks: tasks});
//     });
//   });
// };

module.exports = app => { const Tasks = app.db.models.Tasks; app.get("/tasks", (req, res) => { Tasks.findAll({}).then(tasks => { res.json({tasks: tasks}); }); }); };
