/*
 by Geraldo Gomes
 */
'use strict'
const c$ = {
       NOW: new Date()
    ,   RC:{NOT_FOUND:-1, NONE:-1}
    ,ALIGN:{LEFT:'left', CENTER:'center', RIGHT:'right', JUSTIFY:'justify', TOP:'top', BOTTOM:'bottom'}
    ,MOUSE:{BUTTON:{LEFT:0,CENTER:1,RIGHT:2}}
    ,ORDER:{ASCENDING:'ASC', DESCENDING:'DESC', NONE:'NONE'}
    ,  KEY:{F1:112, F2:113, F3:114, F4:115, F5:116, F6:117,F7:118, F8:119, F9:120, F10:121, F11:122, F12:123
        , TAB:9, ENTER:13, ESC:27, COMMA:44, BACKSPACE:8, END:35, HOME:36, LEFT:37, UP:38, RIGHT:39, DOWN:40, INS:45, DEL:46, REFRESH:116}
    ,FILTER:{}
    ,  MENU:{TYPE:{SIDEBAR:'sidebar', MENUBAR:'menubar'}}
    ,  MASK:{
              SEPARATOR : "|"
            , PROMPT: "_"
            , DecimalCharacter : ","
            , ThousandsSeparator : "."
            , NUMBER:{FIXED:"0" // para manter o zero na formatação quando tem zeros a esquerda (exemplo: data)
                  ,   VALUE:"9"
                  , GENERIC:"#"}
            , ALPHA:{UPPER:"A"  
                ,   LOWER:"a"
                , GENERIC:"@"}                    
            //, AllowInsert : true
            //, DisplayMaskCharacters : false //Display mask characters when default text is not present                 
            , DATE :{
                  "default":      "dd/mm/yyyy"
                , shortDate:      "d/m/yy"
                , mediumDate:     "mmm d, yyyy"
                , longDate:       "mmmm d, yyyy"
                , fullDate:       "dddd, mmmm d, yyyy"
                , shortTime:      "HH:MM"//"h:MM TT",
                , mediumTime:     "h:MM:ss TT"
                , longTime:       "h:MM:ss TT Z"
                , isoDate:        "yyyy-mm-dd"
                , isoTime:        "HH:MM:ss"
                , isoDateTime:    "yyyy-mm-dd'T'HH:MM:ss"
                , isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
        }  
    }
    ,  MASKS: { // serah gerado uma propriedade do html data-mask e data-prompt: 
            fax: {format:"(###) ###-####,(   )    -    ", strip:',()'}
        ,   cpx: "###.###.###-##,___.___.___-__"
        ,   cpf: {format:'000.000.000-00|___.___.___-__', strip:'.-'}
        ,  cnpj: {format:'00.000.000/0000-00|__.___.___/____-__', strip:'-/.'}
        ,   cca: {format:'00.000.000-0|__.___.___-_', strip:'.-'}
        ,   cep: {format:'00000-000|_____-___', strip:'-'}
        , placa: {format:'AAA-0000|___-____', strip:'.-'}
    }    
    , COLOR:{ICON:'#51A351', ICON_FAIL:'#BD362F', BLACK:"#000000", WHITE:"#FFFFFF"}
}

c$.ICON={
      BACK:{KEY:'back'     , COLOR:c$.COLOR.ICON     , CLASS:'bi bi-arrow-return-left'}
,   SEARCH:{KEY:'search'   , COLOR:c$.COLOR.ICON     , CLASS:'bi bi-search'          }
,      NEW:{KEY:'new'      , COLOR:c$.COLOR.ICON     , CLASS:'bi bi-plus-square'     }
,     SAVE:{KEY:'save'     , COLOR:c$.COLOR.ICON     , CLASS:'bi bi-save'            }
,    PRINT:{KEY:'print'    , COLOR:c$.COLOR.ICON     , CLASS:'bi bi-printer'         }
,     EDIT:{KEY:'edit'     , COLOR:c$.COLOR.ICON     , CLASS:'bi bi-pencil-square'   }
,   REMOVE:{KEY:'remove'   , COLOR:c$.COLOR.ICON_FAIL, CLASS:'bi bi-trash'           }
,    FIRST:{KEY:'first'    , COLOR:c$.COLOR.ICON     , CLASS:'bi bi-chevron-bar-left'}
,  PREVIUS:{KEY:'previus'  , COLOR:c$.COLOR.ICON     , CLASS:'bi bi-skip-start-fill'}  
,     NEXT:{KEY:'next'     , COLOR:c$.COLOR.ICON     , CLASS:'bi bi-skip-end-fill'}  
,     LAST:{KEY:'last'     , COLOR:c$.COLOR.ICON     , CLASS:'bi bi-chevron-bar-right'}
,    CLOSE:{KEY:'close'                              , CLASS:'bi bi-x-circle'}
,     HOME:{KEY:'home'     , COLOR:c$.COLOR.ICON     , CLASS:'bi bi-house-door-fill'}
,     UNDO:{KEY:'undo'     , COLOR:c$.COLOR.ICON     , CLASS:'bi bi-arrow-counterclockwise'}
,   FILTER:{KEY:'Filter'   , COLOR:c$.COLOR.ICON     , CLASS:'bi bi-filter'}
,     SORT:{KEY:'sort'     , COLOR:c$.COLOR.ICON_FAIL, CLASS:''}
,       OK:{KEY:'ok'       , COLOR:c$.COLOR.ICON     , CLASS:'bi bi-check-circle-fill'}   
,  SUCCESS:{KEY:'sucesso'  , COLOR:c$.COLOR.ICON     , CLASS:'bi bi-file-check-fill'  }  
,   CANCEL:{KEY:'cancel'   , COLOR:c$.COLOR.ICON_FAIL, CLASS:'bi bi-x-circle-fill'}
,    ERROR:{KEY:'error'    , COLOR:c$.COLOR.ICON_FAIL, CLASS:'bi bi-info-circle-fill' }
,     INFO:{KEY:'info'     , COLOR:c$.COLOR.ICON     , CLASS:'bi bi-info-circle-fill' }
,     HELP:{KEY:'help'     , COLOR:c$.COLOR.ICON     , CLASS:'bi bi-question-circle'  }
,      YES:{KEY:'yes'      , COLOR:c$.COLOR.ICON     , CLASS:'bi bi-check-circle-fill'}
,       NO:{KEY:'no'       , COLOR:c$.COLOR.ICON_FAIL, CLASS:'bi bi-x-circle-fill'    }
,  SHOWBOX:{KEY:'showbox'  , COLOR:c$.COLOR.BLACK    , CLASS:'bi bi-caret-up-fill'    }
,  HIDEBOX:{KEY:'hidebox'  , COLOR:c$.COLOR.BLACK    , CLASS:'bi bi-caret-right-fill'  }
,     INIT:{KEY:'init'     , COLOR:''                , CLASS:''}
,SUBVISION:{KEY:'subvision', COLOR:''                , CLASS:'bi bi-list'}
}    

c$.ORDER.CLASS =  order =>{
    let _class = "";
    switch(order) {
        case c$.ORDER.NONE:
                _class = null;
                break;
        case c$.ORDER.ASCENDING:
                _class = "list-ikon ikon-sort-asc";
                break;
        case c$.ORDER.DESCENDING:
                _class = "list-ikon ikon-sort-desc";
                break;
    }
    return _class;
};

c$.FILTER.CLASS =  filter =>{
    return (filter)?'list-ikon ikon-filter':null;
};

const CONFIG = {
    ERROR:{
           MESSAGE:{
                 Mandatory: "'@{label}:' Campo de preenchimento obrigatório"
            ,        Digit: "Entre somente com número"
            ,      Numeric: "Entre somente com números"
            ,        Money: "Entre somente com valores numéricos"
            ,       Letter: "Entre somente com letras"
            ,         Char: ""
            ,         Name: "Informe um nome válido"
            ,     Password: "Senha inválida"
            ,      Integer: "Entre somente o número sem casas decimais"
            ,        Email: "Email com formatação inválida"
            ,        Phone: "Telefone com formatação inválida"
            ,         Date: "Data inválida"
            ,         Hour: "Hora inválida"
            ,          Cpf: "CPF inválido"
            ,         Cnpj: "CNPJ inválido"
            ,          Cca: "Inscrição estadual inválida"
            ,          Cep: "CEP inválido"
            ,         List: "Valor inválido. Não está dentro da lista de valores."
            ,        Placa: "Placa inválida"
            ,  InvalidItem: "'@label' inválido."
               }
          , SUBSCRIBE:['label','key','caption']  // Será substituído na mensagem
      }
     ,HTTP:{
             STATUS:{
                     BAD_REQUEST:{VALUE:400 , TEXT: "Requisição inválida"}
            ,       UNAUTHORIZED:{VALUE:401 , TEXT: "Recurso não auterizado"}
            ,          FORBIDDEN:{VALUE:403 , TEXT: "Acesso negado"}
            ,          NOT_FOUND:{VALUE:404 , TEXT: "Recurso não encontrado"}
            , METHOD_NOT_ALLOWED:{VALUE:405 , TEXT: "Método não autorizado"}
            ,            TIMEOUT:{VALUE:408 , TEXT: "Timeout - Tempo de espera pelo recurso esgotou"}
            ,                 OK:{VALUE:200 , TEXT: "Realizado com sucesso"}
            ,            CREATED:{VALUE:201 , TEXT: "Recurso criado"}
            ,         NO_CONTENT:{VALUE:204 , TEXT: "Realizado com sucesso"}
            ,            UNKNOWN:{VALUE:null, TEXT: "HTTP STATUS: Não reconhecido"}
             }
        }

   , EXCEPTION:{RECORD_NOT_FOUND:{id:'RECORD_NOT_FOUND' , text:"Registro não encontrado"}
              ,   INVALID_COLUMN:{id:'INVALID_COLUMN'   , text:"Coluna inválida. Não existe no recurso."}
              ,    INVALID_FIELD:{id:'INVALID_FIELD'    , text:"Compo inválida. Não existe no 'fieldset'."}
              ,  INVALID_ELEMENT:{id:'INVALID_ELEMENT'  , text:"Elemento inválido. Não encontrado o elemento solicitado"}
              ,     SERVICE_NULL:{id:'SERVICE_NULL'     , text:"Serviço não informado(key)."}
               }
   , RESOURCE:{CONTEXT:'http://localhost:3000/'}
   ,   SERVER:{CONTEXT:'http://localhost:3000/'}
    , BOOLEAN:{'true':{value:true, text:'sim'}, 'false':{value:false, text:'Não'}}
    , LAYOUT:{ID:'content'
         , ALERT:{ID:'wrapAlert'}
             }
    , ACTION:{ 
           NEW:{KEY:'new',    VALUE:'Incluir'    
                , MESSAGE:{
                  SUCCESS:'Inclusão realizada com sucesso.'
                  , ERROR:'<strong>ERRO NA INCLUSÃO!</strong>Verifique os erros assinalados e faça as correções'}
                }
      ,   SAVE:{KEY:'save',   VALUE:'Salvar'   
                , MESSAGE:{
                  SUCCESS:'Atualização realizada com sucesso.'
                  , ERROR:'<strong>ERRO NA ATUALIZAÇÃO!</strong> Verifique os erros assinalados e faça as correções'}
                }
    ,   REMOVE:{KEY:'remove',    VALUE:'Excluir', MESSAGE:{SUCCESS:'Exclusão realizada com sucesso.'}}     
    ,     BACK:{KEY:'back',      VALUE:'Voltar'     }
    ,   SEARCH:{KEY:'search',    VALUE:'Pesquisar'  }                
    ,    PRINT:{KEY:'print',     VALUE:'Imprimir' }
    ,     EDIT:{KEY:'edit',      VALUE:'Editar'   }    
    ,    FIRST:{KEY:'first',     VALUE:'Primeiro' }
    ,     NEXT:{KEY:'next',      VALUE:'Próximo'  }
    ,     LAST:{KEY:'last',      VALUE:'Último'   }
    ,    CLOSE:{KEY:'close',     VALUE:'Fechar'   }
    ,     HOME:{KEY:'home',      VALUE:'Início'   }
    ,     UNDO:{KEY:'undo',      VALUE:'Desfazer' }
    ,   FILTER:{KEY:'Filter',    VALUE:'Filtrar'  }
    ,     SORT:{KEY:'sort',      VALUE:'Ordenar'  }
    ,       OK:{KEY:'ok',        VALUE:'OK'       }  
    ,  SUCCESS:{KEY:'sucesso',   VALUE:'Sucesso'  }  
    ,   CANCEL:{KEY:'cancel',    VALUE:'Cancelar' }
    ,    ERROR:{KEY:'error',     VALUE:'Erro'     }
    ,     INFO:{KEY:'info',      VALUE:'Nota'     }
    ,     HELP:{KEY:'help',      VALUE:'Ajuda'    }
    ,      YES:{KEY:'yes',       VALUE:'Sim'      }
    ,       NO:{KEY:'no',        VALUE:'Não'      }
    ,     INIT:{KEY:'init',      VALUE:'Iniciar' }
    ,SUBVISION:{KEY:'subvision', VALUE:'Detalhes'}
    }
    , CRUD:{BUTTONS:{WRAP:'wrap_command', ALIGN: c$.ALIGN.BOTTOM}
          , GRID:{BUTTONS:{}}
          , CLASS:{HEADER:"tab_header"  
                  , TITLE:"tab_header_title"
                  ,  MENU:"tab_header_menu" }
          , CONTEXT: 'js/crud/'          
      }
    , CHILD:{MODAL: true}  
    , GRID:{
            MAXLINE:10        // Quantidade de registros na página
          , MAXPAGE:5         // Quantidade de páginas na barra de navegação
          , DEFAULT: 'CRUD'   // O template de GRID default
          ,   CLASS:{TABLE:"list"
                    , WRAP:"wrap_list"
                    }
    }
    , QUERY:{BUTTONS:{}
          , GRID:{BUTTONS:{}}
          , CONTEXT: 'js/query/'
            }
    , ALERT:{
          ERROR:{CLASS:'alert-danger' , ICON:"error"}
      , SUCCESS:{CLASS:'alert-success', ICON:"success"}
      ,    INFO:{CLASS:'alert-info'   , ICON:"info"}
    }
    ,FEEDBACK:{CLASS:{VALID:'valid-feedback', INVALID:'invalid-feedback', LEGEND:''}}
    ,   INPUT:{CLASS:'form-control form-control-sm space'
           ,   FOCUS:{CLASS:"input_focus"}
           ,   VALID:{CLASS:"form-control form-control-sm is-valid"}
           , INVALID:{CLASS:"form-control form-control-sm is-invalid"}
           ,REQUIRED:{CLASS:"required"}
       }      
    ,   LABEL:{  CLASS:"col-form-label col-form-label-sm col-3 col-sm-2 col-md-2 col-xl-2 inLine space"
              , INLINE:{CLASS:"col-form-label col-form-label-sm col-auto inLine"}
              , COLUMN:{CLASS:"col-auto space"}
            }        
    ,   TABS:{
            BUTTONS:{CLASS:"tabs_buttons"}        
        ,   CONTENT:{CLASS:"tab_content", WRAP:{CLASS:"tab_wrap"}}
        ,     CLASS:"tabs_wrap"
        ,      LINK:{
                        CLOSE:{CLASS:"link_tab_close"}
                ,       TITLE:{CLASS:"link_tab"}
                ,      ACTIVE:{CLASS:"active_link_tab"}
                ,       HOVER:{CLASS:"link_tab_hover"}
                ,HOVER_ACTIVE:{CLASS:"active_link_tab_hover"}
                }
        }                         
    //,    WRAP:{CLASS:{SECTION:"wrap_classic", ROW:"form-group row space", COLUMN:"col-auto space"}}                           
    ,    WRAP:{SECTION:{CLASS:"wrap_classic"}
              ,    ROW:{CLASS:"form-group row space"}
              , COLUMN:{CLASS:"col-auto space"}}                           
    ,  BUTTON:{CLASS:'btn btn-default'
            //  , GRID:{CLASS:'btn btn-sm'}
            }
    ,   PAGER:{CLASS:'pagination pagination-sm'}
    ,    MENU:{PARSER:c$.MENU.TYPE.SIDEBAR // "MENUBAR" ou 'SIDEBAR'
            , OPTIONS:{SIDEBAR:{CLASS:{WRAP:"col-md-10 ml-sm-auto col-lg-10 px-md-2"
                                     , MENU:"col-md-2 col-lg-2 d-md-block nav-side-menu"} //"col-md-2 col-lg-2 d-md-block nav-side-menu"
                            , ID:"sidebar"}
                     , MENUBAR:{CLASS:{WRAP:"col-md-12 ml-sm-auto col-lg-12 px-md-2"
                                     , MENU:"navbar navbar-expand-lg navbar-light bg-light menubar_space"}
                            , ID:"menubar"}
                      } 
        }                 
};
CONFIG.INPUT.TYPE={
     DEFAULT:{CLASS:'form-control form-control-sm space'
          ,   FOCUS:{CLASS:"input_focus"}
          ,   VALID:{CLASS:"form-control form-control-sm is-valid"}
          , INVALID:{CLASS:"form-control form-control-sm is-invalid"}
          ,REQUIRED:{CLASS:"required"}
             } 
   ,   COLOR:{CLASS:'form-color-control form-control-sm'}    
   ,CHECKBOX:{CLASS:'form-check-input'
            , COLUMN:{CLASS:"form-check"}  
            ,  LABEL:{CLASS:`${CONFIG.LABEL.CLASS} form-check-label`}  
            ,  ERROR:{CLASS:"form-check-input-check"}  
            ,  FOCUS:{CLASS:"form-check-input"}  
              }                                         
    }
CONFIG.REPORT={
      COLOR:{ON:'#F8F8FF', OFF:'#FFFFFF'}
    // Medidas em milimetro 'mm'
    , PAPER:{
             A4:{PORTRAIT:{height:'287', width:'202'}, LANDSCAPE:{height:'194', width:'289'}}
        ,LETTER:{PORTRAIT:{height:'269', width:'208'}, LANDSCAPE:{height:'206', width:'271'}}
        , LEGAL:{PORTRAIT:{height:'345', width:'208'}, LANDSCAPE:{height:'206', width:'347'}}
      } 
}  
CONFIG.REPORT.DEFAULT={
    DETAIL:{COLUMN:{FONT:{size:10, bold:false}}}
  , HEADER:{COLUMN:{FONT:{size:10, bold:true }}}
  ,   PAGE:{PAPER:CONFIG.REPORT.PAPER.A4.PORTRAIT}
}
  
CONFIG.DESIGN={
   CLASSIC:{SECTION:{CLASS:CONFIG.WRAP.SECTION.CLASS}
          ,     ROW:{CLASS:CONFIG.WRAP.ROW.CLASS}
          ,  COLUMN:{CLASS:CONFIG.WRAP.COLUMN.CLASS}
          ,   INPUT:{CLASS:CONFIG.INPUT.CLASS}
          ,   LABEL:{CLASS:CONFIG.LABEL.CLASS}  }
,   COLUMN:{SECTION:{CLASS:CONFIG.WRAP.SECTION.CLASS}
          ,     ROW:{CLASS:"form-row space pb-1"}
          ,  COLUMN:{CLASS:"form-group space"}
          ,   INPUT:{CLASS:CONFIG.INPUT.CLASS}
          ,   LABEL:{CLASS:CONFIG.LABEL.COLUMN.CLASS}} 
,   INLINE:{SECTION:{CLASS:CONFIG.WRAP.SECTION.CLASS}
          ,     ROW:{CLASS:CONFIG.WRAP.ROW.CLASS}
          ,  COLUMN:{CLASS:CONFIG.WRAP.COLUMN.CLASS}
          ,   INPUT:{CLASS:CONFIG.INPUT.CLASS}
          ,   LABEL:{CLASS:CONFIG.LABEL.INLINE.CLASS}}                                          
} 
//@note: Retorna o objeto com o status http
CONFIG.HTTP.STATUS.get = status =>{
          let res = Object.getByValue(CONFIG.HTTP.STATUS, status,'VALUE');
          if (res){
             let key=res[0];
                return CONFIG.HTTP.STATUS[key]
          }
          CONFIG.HTTP.STATUS.UNKNOWN.VALUE = status;
          return CONFIG.HTTP.STATUS.UNKNOWN;
       }

CONFIG.CRUD.BUTTONS={
       BACK:{value:CONFIG.ACTION.BACK.VALUE}
   ,    GET:{value:CONFIG.ACTION.SEARCH.VALUE}
   , INSERT:{value:CONFIG.ACTION.NEW.VALUE}
   ,   SAVE:{value:CONFIG.ACTION.SAVE.VALUE}
   ,  PRINT:{value:CONFIG.ACTION.PRINT.VALUE}
};

CONFIG.QUERY.BUTTONS={
       BACK:{value:CONFIG.ACTION.BACK.VALUE}
   , SEARCH:{value:CONFIG.ACTION.SEARCH.VALUE}
   ,  PRINT:{value:CONFIG.ACTION.PRINT.VALUE}
};
// CONFIG.CONFIRM.BUTTONS={
//        CANCEL:{value:CONFIG.ACTION.CANCEL.VALUE}
//    ,       OK:{value:CONFIG.ACTION.OK.VALUE}
// };
CONFIG.CRUD.GRID.BUTTONS={
       EDIT:{value:'Detalhar'                , clas$:CONFIG.BUTTON.CLASS, icon:CONFIG.ACTION.EDIT.ICON}
   , REMOVE:{value:CONFIG.ACTION.REMOVE.VALUE, clas$:CONFIG.BUTTON.CLASS, icon:CONFIG.ACTION.REMOVE.ICON}
};
CONFIG.QUERY.GRID.BUTTONS={
       EDIT:{value:'Detalhar',  clas$:CONFIG.BUTTON.CLASS, icon:CONFIG.ACTION.EDIT.ICON}
};

// Faz cópias dos presets(CONFIG.CRUD.BUTTONS, CONFIG.GRID.BUTTONS)
//CONFIG.preset(CONFIG.CRUD.GRID.BUTTONS, 'edit', actionController);
//CONFIG.preset(CONFIG.CRUD.GRID.BUTTONS, ['edit','remove'], actionController);
//CONFIG.preset(CONFIG.CRUD.GRID.BUTTONS, null, actionController);
//QUESTION: Será que o ideal não fazer 'mixin' ou 'inheritsFrom'?
CONFIG.preset=(PRESET, keys, actionController)=>{
    let values={};
    for (let key in PRESET) // Carrega tds as actions do preset
        values[key]=set(key);
    return values;

    function set(key){
        key = key.toUpperCase();
        if (PRESET[key]){
            let properties=PRESET[key]
              , property={};
            Object.preset(property,properties);
            if (actionController)
                Object.preset(property,{onclick:'javascript:'+actionController+'.' +key.toLowerCase()+'(this);'});
            return property;
        }
    }
};

// Copia o preset dos buttons de um CRUD
CONFIG.CRUD.preset=(keys, actionController)=>{
    return CONFIG.preset(CONFIG.CRUD.BUTTONS, keys, actionController);
};
CONFIG.QUERY.preset=(keys, actionController)=>{
    return CONFIG.preset(CONFIG.QUERY.BUTTONS, keys, actionController);
};
// CONFIG.CONFIRM.preset=function(keys, actionController){
//     return CONFIG.preset(CONFIG.CONFIRM.BUTTONS, keys, actionController);
// };
// Copia o preset dos buttons do GRID de um CRUD
CONFIG.CRUD.GRID.preset=(keys, actionController)=>{
    return CONFIG.preset(CONFIG.CRUD.GRID.BUTTONS, keys, actionController);
}
CONFIG.QUERY.GRID.preset=(keys, actionController)=>{
    return CONFIG.preset(CONFIG.QUERY.GRID.BUTTONS, keys, actionController);
}
CONFIG.SYNONYM={
             new:['new', 'insert', 'novo', 'inserir', 'incluir']
      ,   remove:['remove','delete','del','excluir','trash']
      ,     save:['save','update','atualizar','salvar','salva']
      ,     back:['back','voltar','return','prev','previous']
      ,     next:['next','proximo','avancar','forward']
      ,     last:['last','ultimo']
      ,     first:['first','primeiro']
      ,   search:['search','pesquisar','get','pesquisa']
      ,    print:['print','imprimir']
      ,   filter:['filter','filtro']
      ,     edit:['edit','detalhar','edite','editar']
      ,       ok:['ok']
      ,  success:['sucesso', 'success']
      ,   cancel:['cancel','cancelar']
      ,    close:['close','fechar']
      ,     home:['home']
      ,     undo:['undo','desfazer']
      ,    error:['error','erro','err']
      ,     info:['information', 'info']
      ,     help:['Help','ajuda']
      ,      yes:['yes', 'sim']
      ,       no:['no', 'not','não']
      ,subvision:['subvision','child', 'details','filhos', 'detalhes']
};

CONFIG.synonym= value=>{
    if (!j$.Ext.hasAnyValue(value))
       return null;
    for (let key in CONFIG.SYNONYM){
        if (CONFIG.SYNONYM[key].has(value.toLowerCase()))
            return key;
    }
};
c$.ICON.get=(value)=>{
    let sinon =CONFIG.synonym(value)  // Obtém a chave correta considerando os sinônimos
      , key = (sinon) ? sinon :value 
      , icon ={}
    if (j$.Ext.hasAnyValue(key) && c$.ICON[key.toUpperCase()])
       icon = c$.ICON[key.toUpperCase()];    // Retorna o icone
    return icon;
};

CONFIG.class=(vl_key, source)=>{
    source=(source)?source.toUpperCase():'ACTION';
    let key =CONFIG.synonym(vl_key); // Obtém a chave correta considerando os sinônimos
    return (key)?CONFIG[source][key.toUpperCase()].CLASS:null;
};

CONFIG.action= vl_key =>{
    let key =CONFIG.synonym(vl_key) // Obtém a chave correta considerando os sinônimos
     , action={}
    if (key)
        Object.preset(action, CONFIG.ACTION[key.toUpperCase()])

    return (key)?action:null;
};

c$.MASK.ALPHA.CHARS=Object.values(c$.MASK.ALPHA).join().replaceAll(",","");
c$.MASK.ALPHA.exists=function(value){
    return c$.MASK.ALPHA.CHARS.includes(value);
}

c$.MASK.NUMBER.CHARS=Object.values(c$.MASK.NUMBER).join().replaceAll(",","");
c$.MASK.NUMBER.exists=function(value){
    return c$.MASK.NUMBER.CHARS.includes(value);
}
c$.MASK.CHARS = c$.MASK.NUMBER.CHARS + c$.MASK.ALPHA.CHARS;
// export {CONFIG, c$};
