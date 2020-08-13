j$.service.create("Pessoa",
    {          
           
     // ,resource:{name:'usuuario'} 
      Interface:{
            container:CONFIG.LAYOUT.CONTENT    
              , title:'Exemplo de Consulta - Pessoas'
              , List:true 
              , Buttons:CONFIG.QUERY.preset()        
              , design:[
                {type:'classic'
                     , fields:['id','data']} 
              , {type:'line'
                     , style:{marginRight:'50px', borderColor:'green'}, title:'divisor de informação'}
              , {type:'inLine'
                     ,  fields:[['ativo','sexo'],['nome']]
                    }
              , {type:'line', title:'Números'}      
              , {type:'column'  , fields:['valor','vl']}      
                  ]       
      }
      , fieldset:{
                 id:TYPE.INTEGER(4,{label:'Código'})
            ,  data:TYPE.DATE({label:'Data'})
            ,  nome:TYPE.CHAR(20,{label:'Nome'})
            , ativo:TYPE.BOOLEAN({label:'Ativo', list:{'true':{value:true, text:'Ativo'}, 'false':{value:false, text:'Desativado'}}})
            ,  sexo:TYPE.LIST({label:'Sexo', list:{M:'Masculino', F:'Feminino'}})
            , valor:TYPE.MONEY(10,{label:'Valor'})
            ,    vl:TYPE.MASK("999.99",{label:'Mask'})                                  
      }
    });