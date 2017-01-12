// app.get('/', (req, res) =>
//         {res.send('Hello World!');}
//        );

module.exports = app => {
   app.get("/", (req, res) => {
       res.json({status: "Hello World!'"});
     });
};
