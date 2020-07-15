module.exports = (sequelize, DataType) => {
    const Mensagem = sequelize.define(
                  "Mensagem"
                , {
                    idMensagem:{type:DataType.INTEGER, primaryKey:true, autoIncrement:true}
                  , txMensagem:{type:DataType.STRING , allowNull:false, unique:true, validate:{notEmpty:true}}
                  //,   idTarefa:{type:DataType.INTEGER, allowNull:false, validate:{notEmpty:true}}
                  }
         );
    Mensagem.isCrud = true;
    return Mensagem;
  };
  