
//j$.Service.create("Usuario",
j$.Service.createCrud("Usuario",
   { resource:{name:'Users', id:'id'}
      // , Interface:{
      //      container:CONFIG.LAYOUT.ID
      //         , title:'Cadastro de Usuários'
      //         , List:true
      // }
      , fieldset: {
              id:TYPE.INTEGER(4,{label:'Código', readOnly:true}),
              name:TYPE.CHAR(30,{label:'Usuário'}),
              password:TYPE.PASSWORD(30,{label:'Senha'}),
         email:TYPE.EMAIL(50,{label:'Email'})
      }
    });
