/*
c$ => Atalho para uma coleção
j$.$C => Atalho para os controles ativos
j$.$P => Atalho para as páginas ativas
j$.$R => Atalho para os recursos ativos
j$.$S => Atalho para os servicos que foram definidos no adapater 
j$.$T => Atalho para os tabs que estao abertos. (j$.ui.Tabs.root.c$ - pq existe a possibilidade ter mais de um grupo de tabs)
j$.$V() => Atalho para mostrar no log j$.$C, j$.$P, j$.$R, j$.$S
*/

const urlPartial   = CONFIG.SERVER.CONTEXT+ 'sample/partial.html';
const urlPartial_1 = CONFIG.SERVER.CONTEXT+ 'sample/partial_1.html';
const template={
    services:{ // Desclaração dos serviços
                 Papel:{caption:'Papel'    ,   crud:true, title:'Cadastro de Papel', onClick:openPapel}
          ,    Usuario:{caption:'Usuário'  ,   crud:true, title:'Cadastro de Usuário'}
          ,  Documento:{caption:'Documento',   crud:true, title:'Cadastro de Documento'}
          ,    Assunto:{caption:'Assunto'  ,   crud:true, title:'Cadastro de Assunto'}
  ,  SituacaoAtividade:{caption:'Situação' ,   crud:true, title:'Cadastro de Situações da Atividade'}
          ,    Partial:{partial:urlPartial ,              title:'Partial - Qual a razao disso aqui'}
          ,     Pessoa:{caption:'Pessoa'   ,  query:true, title:'Exemplo de consulta'}
          ,     Basico:{caption:'Básico'   ,  query:true, title:'Consulta Básica', resource:'pessoa'}
                // local:true é apenas para evitar a tentativa de carregar a URL (o que vai gerar um erro)
          ,     Tarefa:{caption:'Tarefa'   ,   crud:true, title:'Tarefa'         , resource:'tarefa', local:true}
          ,   Mensagem:{caption:'Mensagem' ,   crud:true, title:'Mensagem' , modal:true}//      , resource:'mensagem', modal:true}
       //   ,         Uf:{caption:'UF'       ,   crud:true, title:'Unidades da federacao', resource:'uf'}
        }
   , design: { 
       options:{ // Para montar os menus e sebmenus
             Tabelas:{caption:'Tabelas' //Possibilidade de add um caption no menu
                    ,   items:['Papel'
                              ,'Usuario'
                              ,'Documento'
                              ,'Mensagem'
                              //,'Uf'
                    ]}
         ,    Outros:['Assunto', 'SituacaoAtividade','Partial'] // key e caption serão igual a "Outros"
         ,  Consulta:['Pessoa','Basico']
       }
       //,menuAdapter: (pode escrever um adapter)
    }   
}
System.using("js/crud/modelo.js"); // Didatico para ver como carregar um arquivo javascript ou css
$(document).ready(function(){
    //j$.Adapter.init(template); // Vai carregar os serviços (.js)
    j$.Adapter.init(template);  
    t$.sample.init(j$.Adapter.Menu);
});

// => Essa é uma forma de você definir como quer mostrar os erros
// basta comentar para manter o padrão
//TYPE.Error.init({callback:function(msg,field){alert(field.label+': '+msg);}});
TYPE.Error.init({   show(field, msg,clas$){TYPE.Error.invalid(field, msg)} //qualquer msg
           ,invalid(field, msg)      {TYPE.Error.invalid(field, msg)}      //quando deu erro
           ,  valid(field, msg)      {TYPE.Error.valid  (field, msg)}      //quando ok
           ,   hide(field)           {TYPE.Error.hide   (field)}           //para remover o erro           
           });

t$.sample = function(menuAdapter){ // Para adicionar mais menus e submenus
    const criarMenu = menuAdapter=>{
             let _path = CONFIG.SERVER.CONTEXT
               , _menu = menuAdapter.addMenu({caption:'Forms'});

             _menu.add([{caption:'Form basic' , url:_path+ 'sample/formBasic.html' , title:'Form com campos formatados e controller'}
                       ,{caption:'Form Inject', url:_path+ 'sample/formInject.html', title:'Maninuplar informações do form'}
                       ,{caption:'Form Design', url:_path+ 'sample/formDesign.html', title:'Sobre como estilizar uma página'}
                       , // se um item do array sem nada ou uma string, null - vai inserir uma linha
                       ,{caption:'Relatório'  , url:_path+ 'sample/reportTest.html', title:'Exemplo de relatório'}]);

             menuAdapter.addMenu({caption:'Link Externo'})
                                 .add([{caption:'Link 1 '   , url:urlPartial  , title:'Vai abri uma página web com a URL'}
                                      ,{caption:'Link 2'    , url:urlPartial_1, title:'Vai abri uma página web com a URL'}]);

             _menu = menuAdapter.addMenu({caption:'Partial'});
             //_menu.add({caption:'Partial',   partial:urlPartial  , title:'Serah insedrido na tba'});
             _menu.add({caption:'Partial 2', partial:urlPartial_1, title:'Serah insedrido na tba'});
             _menu.add({caption:'Assunto', icon:{CLASS:'bi bi-table', COLOR:'green'},    title:'Assunto - exemplo colocar um  form na tab',
                  onClick:(menu, event)=>{
                      j$.Adapter.Tabs.open({key:menu.key, caption:menu.caption
                          , onLoad: tab=>{
                               Assunto.init(tab.idContent)}
                              });
                  }
              });
             _menu.add({caption:'Partial', byPass:true,      partial:urlPartial
                    , onClick:j$.Adapter.Tabs.openPartial
             });
             _menu.add(); // vai adicionar uma linha
             _menu.add({key:'Tabela', caption:'Tabela', icon:'bi bi-table', title:'Tabela de Exemplo'
                    , onClick:j$.Adapter.Tabs.delegateTo
             });

//             _menu.add({key:'SituacaoAtividade', caption:'Situação',       title:'Cadastro de Situa��es da Atividade',
//                 onActivate:function(menu){openItem(menu);}
//             });
             menuAdapter.render();
    };

    const criarTab= ()=>{ // Criar uma tab inicial que já aperece quando inicia o dashboard
         let whenComplete = (htmlPartial, url)=>{console.log(`callback do load complete tab.showURL('${url}')`)};
         j$.Adapter.Tabs.open({key:"tab_inicial", caption:"Home", fixed:true
           , onLoad      (tab){tab.showURL("sample/partial_1.html", whenComplete)}
           , onActivate  (tab){console.log("onActivate."+tab.key)}
           , onDeactivate(tab){console.log("onDeactivate."+tab.key)}
             });
    // DIDÁTICO: Apenas para saber como para colocar num tab
    //     tabs.add({key:"tab_Assunto", caption:"Assunto",
    //                               onLoad: function(tab){ Assunto.init("tab_Assunto");},
    //                               onActivate:function(tab){console.log("onActivate."+tab.key);},
    //                               onDeactivate:function(tab){console.log("onDeactivate."+tab.key);}
    //                           });
         //tabs.open({key:"tab_papel", caption:"Papel", onLoad: function(tab){ Papel.init("tab_Papel");}});
    };
    return{
        init(menuAdapter){
            criarMenu(menuAdapter);
            criarTab();
        }
    };
}();

// Didático
function openPapel(){ 
    j$.Adapter.Tabs.open({key:"Papel", caption:"Papel", onLoad: function(tab){Papel.init(tab.idContent);}});
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


// j$.Service.createCrud("Uf"
//            ,{fieldset:{idUf:TYPE.INTEGER(4,{label:'Código', readOnly:true})
//                       ,sgUf:TYPE.UPPERCASE(2,{label:'UF', mandatory:true})
//                       ,txEstado:TYPE.CHAR(40,{label:'Estado', mandatory:true})
//                       }
//             }
//        );