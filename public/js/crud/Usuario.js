
j$.service.create("Usuario",
   {
      Interface:{
           container:CONFIG.LAYOUT.CONTENT
              , title:'Cadastro de Usuários'
              , List:true
      }
      , fieldset: {
              idUsuario:TYPE.INTEGER(4,{label:'Código', readOnly:true}),
              nmUsuario:TYPE.CHAR(30,{label:'Usuário'}),
         txSenhaUsuario:TYPE.PASSWORD(30,{label:'Senha'}),
         txEmailUsuario:TYPE.EMAIL(50,{label:'Email'})
      }
    });
