module.exports = (sequelize, DataType) => {
  const Papel = sequelize.define(
                "Papel"
              , {
                  idPapel:{type:DataType.INTEGER, primaryKey:true, autoIncrement:true}
                , txPapel:{type:DataType.STRING, allowNull:false, unique:true, validate:{notEmpty:true}}
                }
       );
   Papel.isCrud = true;
  return Papel;
};
