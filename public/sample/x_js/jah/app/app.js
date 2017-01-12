var urlPartial = CONFIG.SERVER.CONTEXT+ 'partial.html';
var adapter={
    services:{
               Papel:{caption:'Papel'   ,  crud:true, title:'Cadastro de Papel'  ,  onClick:openPapel}
          ,  Usuario:{caption:'Usuário' ,  crud:true, title:'Cadastro de Usuário'}
          ,  Assunto:{caption:'Assunto' ,  crud:true, title:'Cadastro de Assunto', modal:true}
  ,SituacaoAtividade:{caption:'Situação',  crud:true, title:'Cadastro de Situações da Atividade'}
          ,  Partial:{partial:urlPartial,             title:'Conheça a história e a caminhada da Comunidade'}
          ,   Pessoa:{caption:'Pessoa'  , query:true, title:'Exemplo de consulta'}
          ,   Basico:{caption:'Básico'  , query:true, title:'Consulta Básica', resource:'pessoa'}
          ,   Tarefa:{caption:'Tarefa'  ,  crud:true, title:'Tarefa', resource:'tarefa'}
          , Mensagem:{caption:'Mensagem', query:true, title:'Mensagem', resource:'mensagem', modal:true}
        }
   , design:{
           Tabelas:{caption:'Tabelas', items:['Papel','Usuario']}
         ,  Outros:['Assunto', 'SituacaoAtividade','Partial'] // key e caption serão igual a "Outros" 
         ,  Consulta:['Pessoa','Basico'] 
       }
};  
System.using("js/crud/modelo.js"); // Did�tico para ver como carregar um arquivo javascript ou css

j$.ui.Page.createAdapter(adapter);

google.setOnLoadCallback(function() {
    j$.Dashboard.init(j$.ui.Adapter);
    j$.ui.Page.Helper.init();
;});
     
//ERROR.init({callback:function(msg,field){alert(field.label+': '+msg);}});
ERROR.init({callback:function(msg,field){ERROR.on(msg, field);}});     

    

j$.ui.Page.Helper = function(){    
     var criarMenu = function(){
             var menu_view = j$.Dashboard.Menubar.addMenu({caption:'Link'});
             menu_view.add({caption:'Histórico',     url:CONFIG.SERVER.CONTEXT+ 'partial.html', title:'Conheça a história e a caminhada da Comunidade'});
             menu_view.add({caption:'Organização',   url:CONFIG.SERVER.CONTEXT+ 'partial.html', title:'Veja como estamos organizados'});
             menu_view.add({caption:'Álbum',         url:CONFIG.SERVER.CONTEXT+ 'partial.html', title:'Veja um Álbum de nosso trabalho de evagelização!'});

             menu_view = j$.Dashboard.Menubar.addMenu({caption:'Partial'});
             menu_view.add({caption:'Visão Geral',   partial:CONFIG.SERVER.CONTEXT+ 'partial.html', title:'Conheça a história e a caminhada da Comunidade'});
             menu_view.add({caption:'Semenentinha',  partial:CONFIG.SERVER.CONTEXT+ 'partial.html', title:'Veja como estamos organizados'});
             menu_view.add({caption:'Assunto',       title:'Veja um Álbum de nosso trabalho de evagelização!',
                  onClick:function(menu, event){
                      j$.Dashboard.Tabs.open({key:menu.key, caption:menu.caption
                          , onLoad: function(tab){Assunto.init(tab.idContent);}});
                  }
              });    
             menu_view.add({caption:'Partial', byPass:true,      partial:CONFIG.SERVER.CONTEXT+ 'partial.html'
                , onClick:j$.Dashboard.Tabs.openPartial
             }); 
              
             menu_view.add({key:'Tabela', caption:'Tabela', icon:'icon-pencil', title:'Tabela de Exemplo'
                , onClick:j$.Dashboard.Tabs.delegateTo
             });
                     
//             menu_view.addItem({key:'SituacaoAtividade', caption:'Situação',       title:'Cadastro de Situa��es da Atividade',
//                 onActivate:function(menu){openItem(menu);}
//             });
             j$.Dashboard.Menubar.render();            
    };

    var criarTab= function (){    
         j$.Dashboard.Tabs.open({key:"tab_inicial", caption:"Home", fixed:true 
           , onLoad      :function(tab){tab.showURL("http://localhost/jah/partial_1.html");}
           , onActivate  :function(tab){console.log("onActivate."+tab.key);}
           , onDeactivate:function(tab){console.log("onDeactivate."+tab.key);}                          
             });   
    // DID�TICO: Apenas para saber como fazer para colocar num tab
    //     tabs.add({key:"tab_Assunto", caption:"Assunto", 
    //                               onLoad: function(tab){ Assunto.init("tab_Assunto");},
    //                               onActivate:function(tab){console.log("onActivate."+tab.key);},
    //                               onDeactivate:function(tab){console.log("onDeactivate."+tab.key);}
    //                           });
         //tabs.open({key:"tab_papel", caption:"Papel", onLoad: function(tab){ Papel.init("tab_Papel");}});                           
    };        
    return{
        init:function(){
            criarMenu();
            criarTab();  
        }        
    };    
}();

// Didático
function openPapel(){    
    j$.Dashboard.Tabs.open({key:"Papel", caption:"Papel", onLoad: function(tab){Papel.init(tab.idContent);}});
}

google.setOnLoadCallback(function() {
  j$.Message.show({
                 text: 'Texto de mensagem para fazer um teste de uma janela modal'
            , title: "Mensagem Modal"
            , fixed:true // indica que não terá o botão de fechar do modal
            , actionController:{
                cancelar:function(){console.log("cancel");}                
                ,     ok:function(){console.log("ok"); return true;}
              }
            , hide:true  
        })
  j$.Message.hide();
;});
