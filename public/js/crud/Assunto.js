
    j$.Service.create("Assunto",
          {
              initialize: function(UpdateController) {console.log('initialize Assunto');}
            , onOpen: function(UpdateController) {
                   console.log('onOpen Assunto');
                   j$.$R.assunto.Requester.get();
                 }
            , beforeDelete: function(UpdateController) {console.log('beforeDelete: Não vai prosseguir'); return true;}
            , afterInsert: function(UpdateController) {console.log('afterInsert:');}
            // , onError: function(ACTION) {
            //      console.log('onError Assunto:'+ACTION.MESSAGE.ERROR);
            //      j$.Page.Alert.error(ACTION.MESSAGE.ERROR, this.Interface.Designer.alert)
            // }
            // , onSuccess: function(ACTION) {
            //      console.log('onSuccess Assunto:'+ACTION.MESSAGE.SUCCESS);
            //     // j$.Page.Alert.success(ACTION.MESSAGE.SUCCESS, this.Interface.Designer.alert)
            // }
            , validate: function(UpdateController, record, isNew) {
                 console.log('validate Assunto');
                 return true;
            }
            , init:function(idTarget, modal){
                if (idTarget)
                    this.Interface.container=idTarget;
                j$.Page.create(this, modal).init();
            }
            , autoRequest:false // padrão é fazer o carregamento automático do recurso
            , resource:{name:'assunto'
                        , id:'idAssunto'
                     , local:true // recurso local (não está no servidor)
                     , cache:true // pega os dados que estão no cache.
                   }
            , child:{   Tarefa:{caption:'Ver Tarefa'
                             , bindBy:"idAssunto"
                             //, modal:true
                             , fieldset:{idAssunto:TYPE.INTEGER(4,{label:'Assunto', readOnly:true, parentLegend:"txTitulo"})
                                        , idTarefa:TYPE.INTEGER(4,{label:'Código', readOnly:true})
                                        , txTarefa:TYPE.CHAR(30,{label:'Tarefa', mandatory:true})
                                        }
                        }
                      , Mensagem:{caption:'Ver Mensagem'}
                    }
        }); 
    with(j$.Service.c$){
        Assunto.Interface = {
           container:CONFIG.LAYOUT.CONTENT
              , id:'assunto'
              , title:'Assunto'
              , List:{maxline:4, maxpage:4}
              //, Buttons:CONFIG.CRUD.preset() // Obter o preset dos butoes
              //, Buttons:CONFIG.CRUD.BUTTONS // Pode ser feito das duas formas
        };

        Assunto.Fieldset= j$.Fieldset.create({  
                       idAssunto:TYPE.INTEGER(4,{label:'Código', readOnly:true})
             //,idCategoriaAssunto:TYPE.LIST({label:'Categoria', mandatory:true, list:{'1':'Sistema', '2':'Projeto', '3':'Manutencao'}})
             ,idCategoriaAssunto:TYPE.LIST({label:'Categoria', mandatory:true, resource:{name:'categoriaAssunto'}})
             ,          txTitulo:TYPE.CHAR(40,{label:'Assunto', mandatory:true, placeholder:"Informe o título"})
             ,           csAtivo:TYPE.BOOLEAN({label:'Ativo', list:{'true':{value:true, text:'Ativo'}, 'false': {value:false, text:'Cancelado'}}
                                              , evaluate:function(record){ return (record.idCategoriaAssunto==1)?true:false}
                                             })
             });
     }
