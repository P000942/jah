//import Request from 'express';
module.exports = app => {
  //  app.get("/", (req, res) => {
  //      res.json({status: "Hello World!'"});
  //    });
  app.route("/").get((req, res) => {
      //res.json({status: "Hello World by route"});
     // res.json( "Hello World by route: " +__dirname + '/public/x_index.html');
     // res.sendFile('C:\\git\\jah/public/x_index.html');
      res.sendFile(app.basePath + 'layout.html');
  });
};