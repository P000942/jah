import Sequelize from "sequelize";
import dataExt  from '../public/js/jah/type/dataExt'
//export default    {NAME: "tarefa" , USER: ""   };
var t$ = function() {
   return {
          DIGIT: function(properties)     {return new t$.Digit(properties);}
  ,     BOOLEAN: function(properties)     {return new t$.Boolean(properties);}
  ,      LETTER: function(size,properties){return new t$.Letter(size,properties);}
  ,   LOWERCASE: function(size,properties){return new t$.LowerCase(size,properties);}
  ,   UPPERCASE: function(size,properties){return new t$.UpperCase(size,properties);}
  ,        CHAR: function(size,properties){return new t$.Char(size,properties);}
  ,        NAME: function(size,properties){return new t$.Name(size,properties);}
  ,    PASSWORD: function(size,properties){return new t$.Password(size,properties);}
  ,     INTEGER: function(size,properties){return new t$.Integer(size,properties);}
  ,     NUMERIC: function(size,decimal,properties)
                                          {return new t$.Numeric(size,decimal,properties);}
  ,        MASK: function(mask,properties){return new t$.Mask(mask,properties);}
  ,        LIST: function(properties)     {return new t$.List(properties);}
  ,       MONEY: function(size,properties){return new t$.Money(size,properties);}
  ,       EMAIL: function(size,properties){return new t$.Email(size,properties);}
  ,        DATE: function(properties)     {return new t$.Date(properties);}
  ,        HOUR: function(size,properties){return new t$.Hour(size,properties);}
  ,       PHONE: function(size,properties){return new t$.Phone(size,properties);}
  ,         CPF: function(properties)     {return new t$.Cpf(properties);}
  ,        CNPJ: function(properties)     {return new t$.Cnpj(properties);}
  ,         CCA: function(properties)     {return new t$.Cca(properties);}
  ,         CEP: function(properties)     {return new t$.Cep(properties);}
  ,       Placa: function(properties)     {return new t$.Placa(properties);}
   };
}();

t$.Char = (size,properties) => { 
     Object.preset(properties,{type:Sequelize.DataTypes.STRING,size:size});
     return properties;
}
console.log('t$ TESTE INIT =====>');
//  var aux = {a:1,b:2};
//   console.log(Object.preset(aux,{x:1, y:2}));
//console.log(t$.Char(30, {allowNull: false}));
console.log('t$ TESTE FIM =====>');