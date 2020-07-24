/*
c$ => Atalho para uma coleção
C$ => Atalho para um item específico .C$(key)
j$.$C => Atalho para os controles ativos
j$.$P => Atalho para as páginas ativas
j$.$R => Atalho para os recursos ativos
j$.$S => Atalho para os servicos que foram definidos no adapater 
j$.$T => Atalho para os tabs que estao abertos. (j$.ui.Tabs.root.c$ - pq existe a possibiklidade ter mais de um grupo de tabs)
j$.$V() => Atalho para mostrar no log j$.$C, j$.$P, j$.$R, j$.$S
*/

const urlPartial   = CONFIG.SERVER.CONTEXT+ 'sample/partial.html';
const urlPartial_1 = CONFIG.SERVER.CONTEXT+ 'sample/partial_1.html';
const adapter={
    services:{
                 Papel:{caption:'Papel'    ,   crud:true, title:'Cadastro de Papel', onClick:openPapel}
          ,    Usuario:{caption:'Usuário'  ,   crud:true, title:'Cadastro de Usuário'}
          ,  Documento:{caption:'Documento',   crud:true, title:'Cadastro de Documento'}
          ,    Assunto:{caption:'Assunto'  ,   crud:true, title:'Cadastro de Assunto', modal:true}
  ,  SituacaoAtividade:{caption:'Situação' ,   crud:true, title:'Cadastro de Situações da Atividade'}
          ,    Partial:{partial:urlPartial ,              title:'Partial - Qual a razao disso aqui'}
          ,     Pessoa:{caption:'Pessoa'   ,  query:true, title:'Exemplo de consulta'}
          ,     Basico:{caption:'Básico'   ,  query:true, title:'Consulta Básica', resource:'pessoa'}
          ,     Tarefa:{caption:'Tarefa'   ,   crud:true, title:'Tarefa'         , resource:'tarefa'}
          ,   Mensagem:{caption:'Mensagem' ,   crud:true, title:'Mensagem' }//      , resource:'mensagem', modal:true}
        }
   , design:{ // Para montar os menus e sebmenus
             Tabelas:{caption:'Tabelas', items:['Papel','Usuario','Documento','Mensagem']}
         ,    Outros:['Assunto', 'SituacaoAtividade','Partial'] // key e caption serão igual a "Outros"
         ,  Consulta:['Pessoa','Basico']
       }
};
System.using("js/crud/modelo.js"); // Didatico para ver como carregar um arquivo javascript ou css

j$.ui.Page.createAdapter(adapter);

$(document).ready(function(){
    j$.Dashboard.init(j$.ui.Adapter);
    j$.ui.Page.Helper.init();
;});

//ERROR.init({callback:function(msg,field){alert(field.label+': '+msg);}});
ERROR.init({callback:(msg,field)=>{ERROR.on(msg, field);}});

j$.ui.Page.Helper = function(){
     const criarMenu = function(){
             let _path = CONFIG.SERVER.CONTEXT
               , {Menubar} = j$.Dashboard
               , _menu = Menubar.addMenu({caption:'Forms'});

             _menu.add([{caption:'Form basic' , url:_path+ 'sample/formBasic.html' , title:'Form com campos formatados e controller'}
                       ,{caption:'Form Inject', url:_path+ 'sample/formInject.html', title:'Maninuplar informações do form'}
                       ,{caption:'Form Design', url:_path+ 'sample/formDesign.html', title:'Sobre como estilizar uma página'}
                       , // se um item do array sem nada ou uma string, null - vai inserir uma linha
                       ,{caption:'Relatório'  , url:_path+ 'sample/reportTest.html', title:'Exemplo de relatório'}]);

             Menubar.addMenu({caption:'Link Externo'})
                                 .add([{caption:'Link 1 '   , url:urlPartial  , title:'Vai abri uma página web com a URL'}
                                      ,{caption:'Link 2'    , url:urlPartial_1, title:'Vai abri uma página web com a URL'}]);

             _menu = j$.Dashboard.Menubar.addMenu({caption:'Partial'});
             //_menu.add({caption:'Partial',   partial:urlPartial  , title:'Serah insedrido na tba'});
             _menu.add({caption:'Partial 2', partial:urlPartial_1, title:'Serah insedrido na tba'});
             _menu.add({caption:'Assunto',       title:'Assunto - exemplo colocar um  form na tab',
                  onClick:(menu, event)=>{
                      j$.Dashboard.Tabs.open({key:menu.key, caption:menu.caption
                          , onLoad: tab=>{
                               Assunto.init(tab.idContent)}
                              });
                  }
              });
             _menu.add({caption:'Partial', byPass:true,      partial:urlPartial
                    , onClick:j$.Dashboard.Tabs.openPartial
             });
             _menu.add(); // vai adicionar uma linha
             _menu.add({key:'Tabela', caption:'Tabela', icon:'icon-pencil', title:'Tabela de Exemplo'
                    , onClick:j$.Dashboard.Tabs.delegateTo
             });

//             _menu.add({key:'SituacaoAtividade', caption:'Situação',       title:'Cadastro de Situa��es da Atividade',
//                 onActivate:function(menu){openItem(menu);}
//             });
             j$.Dashboard.Menubar.render();
    };

    const criarTab= function (){
         j$.Dashboard.Tabs.open({key:"tab_inicial", caption:"Home", fixed:true
           , onLoad      (tab){tab.showURL("sample/partial_1.html", (r)=>{console.log("callback do load complete", r)})}
           , onActivate  (tab){console.log("onActivate."+tab.key)}
           , onDeactivate(tab){console.log("onDeactivate."+tab.key)}
             });
    // DID�TICO: Apenas para saber como para colocar num tab
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

//@note: Está presente aqui apenas para exemplificar o uso
$(document).ready(function(){
  j$.Message.show({
                 text: 'Texto de mensagem para fazer um teste de uma janela modal'
            , title: "Mensagem Modal"
            , fixed:true // indica que não terá o botão de fechar do modal
            , actionController:{
                cancelar:()=>{console.log("cancel")}
                ,     ok:()=>{console.log("ok"); return true;}
                ,  ajuda:()=>{console.log("Ajuda"); return true;}
              }
            , hide:true
        });
  //j$.Message.hide();
;});
