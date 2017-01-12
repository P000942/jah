/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
    j$.service.create("Tabela",
         {
                initialize: function(UpdateController) {console.log('initialize');}
           ,  beforeDelete: function(UpdateController) {
                 alert('beforeDelete: não vai prosseguir');
                 return false; //não vai excluir
           }
           , afterActionInsert: function(UpdateController) {console.log('afterActionInsert:');}
           , validate: function(UpdateController) {
                 console.log('validate');
                 return true;
           }
           , onError: function(ACTION){ j$.ui.Alert.error(this.Interface.Designer.alert, ACTION.MESSAGE.ERROR) }
           , onSuccess: function(ACTION) { console.log('onSuccess:'+ACTION.MESSAGE.SUCCESS);}            
           , init:function(idTarget){
               if (idTarget)
                   this.Interface.container=idTarget;              
               j$.ui.Page.create(this).init();      
            }        
        });
    with(j$.service.c$.Tabela){
        Tabela.Interface = {
           container:CONFIG.LAYOUT.CONTENT
           ,      id:Tabela.id.toLowerCase()
           ,   title:'Exemplo de Tabela'                
           ,    List:{limit:5, maxpage:5, Buttons:CONFIG.CRUD.GRID.BUTTONS}
           , Buttons:CONFIG.CRUD.preset()
        };   

        Tabela.Fieldset= new j$.ui.Fieldset({
                                 idTabela:TYPE.INTEGER(4,{label:'Código', readOnly:true, resource:{name:'categoriaAssunto', local:true}})
                                ,txTabela:TYPE.CHAR(30,{label:'Tabela', mandatory:true, hint:'Informe a descrição para o campo.'})                                        
                               });

        Tabela.resource = {
              context:CONFIG.RESOURCE.CONTEXT
              , name:Tabela.id.toLowerCase()
              , id:'idTabela'
              , local:true
        };
   }; 