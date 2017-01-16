module.exports = app => {
   const Users = app.db.models.Users;
   app.get("/users"
         , (req, res) => {
           Users.findAll({}).then(users => {
              res.json({users: users});
            });
        });
};
