j$.service.createQuery("Basico"
           ,{fieldset:{
                           id:TYPE.INTEGER(4,{label:'Código'})
                      ,  data:TYPE.DATE({label:'Data'})
                      ,  nome:TYPE.CHAR(20,{label:'Nome'})
                      , ativo:TYPE.BOOLEAN({label:'Ativo', list:{'true':{value:true, text:'Ativo'}, 'false':{value:false, text:'Desativado'}}})
                      ,  sexo:TYPE.LIST({label:'Sexo', list:{M:'Masculino', F:'Feminino'}})
                      , valor:TYPE.MONEY(10,{label:'Valor'})
                      ,    vl:TYPE.MASK("999.99",{label:'Mask'})}
       //    , resource: 'pessoa'       
  
      //      ,resource:{
		    //       context:CONFIG.RESOURCE.CONTEXT
		    //       , name:'Pessoa'
		    //       , id:'idPessoa'
		    //       , local:true
		    // }  
});