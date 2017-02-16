
    j$.service.create("Assunto",
          {
              initialize: function(UpdateController) {console.log('initialize Assunto');}
            , onOpen: function(UpdateController) {
                   console.log('onOpen Assunto');
                   j$.$R.assunto.Requester.get();
                 }
            , beforeDelete: function(UpdateController) {console.log('beforeDelete: Não vai prosseguir'); return true;}
            , afterActionInsert: function(UpdateController) {console.log('afterActionInsert:');}
            // , onError: function(ACTION) {
            //      console.log('onError Assunto:'+ACTION.MESSAGE.ERROR);
            //      j$.ui.Alert.error(this.Interface.Designer.alert, ACTION.MESSAGE.ERROR)
            // }
            // , onSuccess: function(ACTION) {
            //      console.log('onSuccess Assunto:'+ACTION.MESSAGE.SUCCESS);
            //     // j$.ui.Alert.success(this.Interface.Designer.alert, ACTION.MESSAGE.SUCCESS)
            // }
            , validate: function(UpdateController) {
                 console.log('validate Assunto');
                 return true;
            }
            , init:function(idTarget, modal){
                if (idTarget)
                    this.Interface.container=idTarget;
                j$.ui.Page.create(this, modal).init();
            }
            , resource:{name:'assunto'
                        , id:'idAssunto'
                     , local:true // recurso local (não está no servidor)
                     , cache:true // pega os dados que estão no cache.
                     , autoCharge:true // TODO: faz o carregamento automático do recurso
                   }
            , child:{   Tarefa:{caption:'Ver Tarefa'
                             , fieldset:{idTarefa:TYPE.INTEGER(4,{label:'Código', readOnly:true})
                                        ,txTarefa:TYPE.CHAR(30,{label:'Tarefa', mandatory:true})}}
                      , Mensagem:{caption:'Ver Mensagem'}
                    }
        });
    with(j$.service.c$){
        Assunto.Interface = {
           container:CONFIG.LAYOUT.CONTENT
              , id:'assunto'
              , title:'Assunto'
              , List:{maxline:4, maxpage:4}
              //, Buttons:CONFIG.CRUD.preset()
              //, Buttons:CONFIG.CRUD.BUTTONS // Pode ser feito das duas formas
        };

        Assunto.Fieldset= new j$.ui.Fieldset({
                       idAssunto:TYPE.INTEGER(4,{label:'Código', readOnly:true})
             //,idCategoriaAssunto:TYPE.LIST({label:'Categoria', mandatory:true, list:{'1':'Sistema', '2':'Projeto', '3':'Manutencao'}})
             ,idCategoriaAssunto:TYPE.LIST({label:'Categoria', mandatory:true, resource:{name:'categoriaAssunto'}})
             ,          txTitulo:TYPE.CHAR(40,{label:'Assunto', mandatory:true})
             ,           csAtivo:TYPE.BOOLEAN({label:'Ativo', list:{'true':{value:true, text:'Ativo'}, 'false': {value:false, text:'Cancelado'}}
                                              , evaluate:function(record){ return (record.idCategoriaAssunto==1)?true:false}
                                             })
             });
     }
