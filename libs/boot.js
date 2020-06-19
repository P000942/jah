module.exports = app => {
  app.db.sequelize.sync().done(() => {
    app.listen(app.get("port"), () => {
       console.log(`http://localhost:${app.get("port")}/layout.html`);
    });
  });
}
