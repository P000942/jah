j$.service.createCrud("Mensagem"
           ,{fieldset:
           	   {idMensagem:TYPE.INTEGER(4,{label:'Código', readOnly:true})
               ,txMensagem:TYPE.CHAR(30,{label:'Mensagem', mandatory:true})}
            ,validate: function(UpdateController, record, isNew) {
               //j$.ui.Alert.show( ['<strong>INFORMAÇÃO!</strong> ATENÇAO? Vai atualizar o objeto!'], CONFIG.ALERT.INFO.CLASS, this.page.Alert.id);
               this.page.Alert.show('<strong>INFORMAÇÃO!</strong> ATENÇAO? Vai atualizar o objeto!')
               console.log('Mensagem > validate');
               return true;
            }   
            }
       );