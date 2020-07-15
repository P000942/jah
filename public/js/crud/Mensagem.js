j$.service.createCrud("Mensagem"
           ,{fieldset:
           	   {idMensagem:TYPE.INTEGER(4,{label:'Código', readOnly:true})
               ,txMensagem:TYPE.CHAR(30,{label:'Mensagem', mandatory:true})}
            }
       );