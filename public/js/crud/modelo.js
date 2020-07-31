
    j$.service.create("Tabela",
         {
                initialize: function(UpdateController) {console.log('initialize');}
           ,  beforeDelete: function(UpdateController) {
                 alert('beforeDelete: não vai prosseguir');
                 return false; //não vai excluir
           }
           , afterInsert: function(UpdateController) {console.log('afterInsert:');}
           , validate(UpdateController, record, isNew){
                // j$.ui.Alert.show( ['<strong>INFORMAÇÃO!</strong> ATENÇAO? Vai atualizar o objeto!'], CONFIG.ALERT.INFO.CLASS, this.page.Alert.id);
                //this.page.Alert.show('<strong>INFORMAÇÃO!</strong> ATENÇAO? Vai atualizar o objeto!')
                 console.log('validate');
                 return true;
           }
           , onError: function(ACTION){ 
                j$.ui.Alert.error(ACTION.MESSAGE.ERROR, this.page.Alert.id)
             }
           //, onSuccess: function(ACTION) { console.log('onSuccess:'+ACTION.MESSAGE.SUCCESS);}
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
           ,    List:{limit:5, maxpage:5, Buttons:CONFIG.CRUD.GRID.preset()}
           , Buttons:CONFIG.CRUD.preset()
        };

        Tabela.Fieldset= j$.ui.createFieldset({
                                 idTabela:TYPE.INTEGER(4,{label:'Código', readOnly:true, resource:{name:'categoriaAssunto', local:true}})
                                ,txTabela:TYPE.CHAR(30,{label:'Tabela', mandatory:true, title:'Informe a descrição para o campo.'})
                               });

        Tabela.resource = {
              context:CONFIG.RESOURCE.CONTEXT
              , name:Tabela.id.toLowerCase()
              , id:'idTabela'
              , local:true
        };
   };
