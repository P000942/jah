j$.service.createCrud("Papel"
           ,{fieldset:
           	   {idPapel:TYPE.INTEGER(4,{label:'Código', readOnly:true})
               ,txPapel:TYPE.CHAR(30,{label:'Papel', mandatory:true})}
            }
       );
