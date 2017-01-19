module.exports = app => {
  //  app.get("/", (req, res) => {
  //      res.json({status: "Hello World!'"});
  //    });
  app.route("/").get((req, res) => {
      res.json({status: "Hello World by route"});
  });
};
