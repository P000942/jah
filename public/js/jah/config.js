/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
var RC = {NOT_FOUND:-1, NONE:-1}
var CONFIG = {
    ERROR:{
           MESSAGE:{
                 Mandatory: "Campo de preenchimento obrigatório"
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
          , SUBSCRIBE:['label','key']  // Será substituído na mensagem
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
            ,            UNKNOWN:{VALUE:null, TEXT: "HTTP STATUS: Não reconhecido"}
             }
        }

   , EXCEPTION:{RECORD_NOT_FOUND:{id:'RECORD_NOT_FOUND'    , text:"Registro não encontrado"}
              ,   INVALID_COLUMN:{id:'INVALID_COLUMN'      , text:"Coluna inválida. Não existe no recurso."}
              ,    INVALID_FIELD:{id:'INVALID_FIELD'       , text:"Compo inválida. Não existe no 'fieldset'."}
              ,  INVALID_ELEMENT:{id:'INVALID_ELEMENT'     , text:"Elemento inválido. Não encontrado o elemento solicitado"}
              ,     SERVICE_NULL:{id:'SERVICE_NULL'        , text:"Serviço não informado(key)."}
               }
   , RESOURCE:{CONTEXT:'http://localhost:3000/'}
    //, RESOURCE:{CONTEXT:'http://localhost/jah/resources/'}
   ,   SERVER:{CONTEXT:'http://localhost:3000/'}
   // , ADAPTER:{TYPE:{DEFAULT:0
   //                     LINK:1
   //                 ,PARTIAL:2
   //                 ,  MODAL:3
   //                 }
   // }
   , MASK:{
                FieldDataSeparator : "|",
                DecimalCharacter : ",",
                MaskCharacters : {
                        Numeric : "#90",
                        Alpha : "@aA"
                },
                AllowInsert : true,
                LowerCaseCharacter:'a',
                UpperCaseCharacter:'A',
                DisplayMaskCharacters : false, //Display mask characters when default text is not present
                MASKS : {
                        fax: "(###) ###-####,(   )    -    ",
                        cpx: "###.###.###-##,___.___.___-__"
                }

         }
    , BOOLEAN:{'true':{value:true, text:'sim'}, 'false':{value:false, text:'Não'}}
    , LAYOUT:{CONTENT:'content', ALERT_CONTENT:'wrapAlert'}
    , ACTION:{
           BACK:{KEY:'back',   VALUE:'Voltar'   , ICON:'icon-arrow-left'}
       , SEARCH:{KEY:'search', VALUE:'Pesquisar', ICON:'icon-search'}
       ,    NEW:{KEY:'new',    VALUE:'Incluir'  , ICON:'icon-plus'
                , MESSAGE:{
                  SUCCESS:'Inclusão realizada com sucesso.'
                  , ERROR:'<strong>ERRO NA INCLUSÃO!</strong>Verifique os erros assinalados e faça as correções'}
                }
       ,   SAVE:{KEY:'save',   VALUE:'Salvar'   , ICON:'icon-save'
                , MESSAGE:{
                  SUCCESS:'Atualização realizada com sucesso.'
                  , ERROR:'<strong>ERRO NA ATUALIZAÇÂO!</strong> Verifique os erros assinalados e faça as correções'}
                }
       ,  PRINT:{KEY:'print',  VALUE:'Imprimir' , ICON:'icon-print'}
       ,   EDIT:{KEY:'edit',   VALUE:'Editar'   , ICON:'icon-edit'}
       , REMOVE:{KEY:'remove', VALUE:'Excluir'  , ICON:'icon-trash'    , MESSAGE:{SUCCESS:'Exclusão realizada com sucesso.'}}
       ,  FIRST:{KEY:'first',  VALUE:'Primeiro' , ICON:''}
       ,   NEXT:{KEY:'next',   VALUE:'Próximo'  , ICON:'icon-arrow-right'}
       ,   LAST:{KEY:'last',   VALUE:'Último'   , ICON:''}
       ,  CLOSE:{KEY:'close',  VALUE:'Fechar'   , ICON:'icon-remove-circle'}
       ,   HOME:{KEY:'home',   VALUE:'Início'   , ICON:'icon-home'}
       ,   UNDO:{KEY:'undo',   VALUE:'Desfazer' , ICON:'icon-undo'}
       , FILTER:{KEY:'Filter', VALUE:'Filtrar'  , ICON:'icon-filter'}
       ,   SORT:{KEY:'sort',   VALUE:'Ordenar'  , ICON:''}
       ,     OK:{KEY:'ok',     VALUE:'OK'       , ICON:'icon-check', COLOR:'#51A351'}
       , CANCEL:{KEY:'cancel', VALUE:'Cancelar' , ICON:'icon-arrow-left', COLOR:'#BD362F'}
       ,  ERROR:{KEY:'error',  VALUE:'Erro'     , ICON:'ikon-error'}
       ,   INFO:{KEY:'info',   VALUE:'Nota'     , ICON:'ikon-info'}
       ,    YES:{KEY:'yes',    VALUE:'Sim'      , ICON:'icon-check', COLOR:'#51A351'}
       ,     NO:{KEY:'no',     VALUE:'Não'      , ICON:'icon-arrow-left', COLOR:'#BD362F'}
     ,SUBVISION:{KEY:'subvision', VALUE:'Detalhes', ICON:'icon-list'}
    }
    , CRUD:{BUTTONS:{}
          , GRID:{BUTTONS:{}}
          , CONTEXT: 'js/crud/'
      }
    , GRID:{
            MAXLINE:10        // Quantidade de registros na página
          , MAXPAGE:5         // Quantidade de páginas na barra de navegação
          , DEFAULT: 'CRUD'   // O template de GRID default
    }
    , QUERY:{BUTTONS:{}
              , GRID:{BUTTONS:{}}
           , CONTEXT: 'js/query/'
            }
    , HINT:{
         ERROR:{CLASS:'hint-error'}
        , INFO:{CLASS:'hint-info'}
    }
    , ALERT:{
          ERROR:{CLASS:'alert-danger'}
      , SUCCESS:{CLASS:'alert-success'}
      ,    INFO:{CLASS:'alert-info'}
    }
    , LEGEND:{CLASS:'text-legend'}
    , INPUT:{CLASS:{DEFAULT:'input_text', ERROR:'input_error',FOCUS:'input_focus'}}
    , BUTTON:{CLASS:{DEFAULT:'btn btn-default', GRID:'btn btn-sm'}}
    , PAGER:{CLASS:'pagination pagination-sm'}
};
//
//CONFIG.ICON ={new:'icon-o-plus' , search:'icon-search',   edit:'icon-edit'  , save:'icon-o-check'
//          , print:'icon-print'    ,  trash:'icon-trash' , filter:'icon-filter', back:'icon-o-arrow-left', next:'icon-o-arrow-right'
//          ,    ok:'icon-o-check',  close:'icon-o-x',    home:'icon-home', undo:'icon-undo'};

CONFIG.HTTP.STATUS.get = status =>{
          var res = Object.getByValue(CONFIG.HTTP.STATUS, status,'VALUE');
          if (res){
             var key=res[0];
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
   ,    SEARCH:{value:CONFIG.ACTION.SEARCH.VALUE}
   ,  PRINT:{value:CONFIG.ACTION.PRINT.VALUE}
};
// CONFIG.CONFIRM.BUTTONS={
//        CANCEL:{value:CONFIG.ACTION.CANCEL.VALUE}
//    ,       OK:{value:CONFIG.ACTION.OK.VALUE}
// };
CONFIG.CRUD.GRID.BUTTONS={
       EDIT:{value:'Detalhar'                , clas$:CONFIG.BUTTON.CLASS.DEFAULT, icon:CONFIG.ACTION.EDIT.ICON}
   , REMOVE:{value:CONFIG.ACTION.REMOVE.VALUE, clas$:CONFIG.BUTTON.CLASS.DEFAULT, icon:CONFIG.ACTION.REMOVE.ICON}
};
CONFIG.QUERY.GRID.BUTTONS={
       EDIT:{value:'Detalhar',  clas$:CONFIG.BUTTON.CLASS.DEFAULT, icon:CONFIG.ACTION.EDIT.ICON}
};

// Faz cópias dos presets(CONFIG.CRUD.BUTTONS, CONFIG.GRID.BUTTONS)
//CONFIG.preset(CONFIG.CRUD.GRID.BUTTONS, 'edit', actionController);
//CONFIG.preset(CONFIG.CRUD.GRID.BUTTONS, ['edit','remove'], actionController);
//CONFIG.preset(CONFIG.CRUD.GRID.BUTTONS, null, actionController);
//QUESTION: Será que o ideal não fazer 'mixin' ou 'inheritsFrom'?
CONFIG.preset=function(PRESET, keys, actionController){
    var values={};
    if (dataExt.isString(keys))
       values[keys.toUpperCase()]=set(keys);
    else if (dataExt.isArray(keys)){
       for(var i=0; i<keys.length;i++)
           values[keys[i].toUpperCase()]=set(keys[i]);
    }else{
        for (var key in PRESET) // Carrega tds as actions do preset
            values[key]=set(key);
    }

    return values;

    function set(key){
        key = key.toUpperCase();
        if (PRESET[key]){
            var properties=PRESET[key];
            var property={};
            Object.preset(property,properties);
            if (actionController)
                Object.preset(property,{onclick:'javascript:'+actionController+'.' +key.toLowerCase()+'(this);'});
            return property;
        }
    }
};

// Copia o preset dos buttons de um CRUD
CONFIG.CRUD.preset=function(keys, actionController){
    return CONFIG.preset(CONFIG.CRUD.BUTTONS, keys, actionController);
};
CONFIG.QUERY.preset=function(keys, actionController){
    return CONFIG.preset(CONFIG.QUERY.BUTTONS, keys, actionController);
};
// CONFIG.CONFIRM.preset=function(keys, actionController){
//     return CONFIG.preset(CONFIG.CONFIRM.BUTTONS, keys, actionController);
// };
// Copia o preset dos buttons do GRID de um CRUD
CONFIG.CRUD.GRID.preset=function(keys, actionController){
    return CONFIG.preset(CONFIG.CRUD.GRID.BUTTONS, keys, actionController);
};



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
      ,   cancel:['cancel','cancelar']
      ,    close:['close','fechar']
      ,     home:['home']
      ,     undo:['undo','desfazer']
      ,    error:['error','erro','err']
      ,     info:['information', 'info']
      ,      yes:['yes', 'sim']
      ,       no:['no', 'not','não']
      ,subvision:['subvision','child', 'details','filhos', 'detalhes']
};

CONFIG.synonym=function(value){
    for (var key in CONFIG.SYNONYM){
        if (CONFIG.SYNONYM[key].has(value.toLowerCase()))
            return key;
    }
};

CONFIG.icon=function(vl_key, source){
    source=(source)?source.toUpperCase():'ACTION';
    var key =CONFIG.synonym(vl_key); // Obtém a chave correta considerando os sinônimos
    return (key)?CONFIG[source][key.toUpperCase()].ICON:null;    // Retorna o icone
};
CONFIG.color=function(vl_key, source){
    source=(source)?source.toUpperCase():'ACTION';
    var key =CONFIG.synonym(vl_key);
    return (key)?CONFIG[source][key.toUpperCase()].COLOR:null;    // Retorna o icone
};
//
CONFIG.class=function(vl_key, source){
    source=(source)?source.toUpperCase():'ACTION';
    var key =CONFIG.synonym(vl_key); // Obtém a chave correta considerando os sinônimos
    return (key)?CONFIG[source][key.toUpperCase()].CLASS:null;
};

CONFIG.action=function(vl_key){
    var key =CONFIG.synonym(vl_key); // Obtém a chave correta considerando os sinônimos
    var action={}
    if (key)
        Object.preset(action, CONFIG.ACTION[key.toUpperCase()])

    return (key)?action:null;
};
//CONFIG.action(CONFIG.ACTION.SAVE.KEY);
CONFIG.hint=function(vl_key){
    return {icon:CONFIG.icon(vl_key), hint:CONFIG.class(vl_key,'hint')}
};
//CONFIG.hint(CONFIG.ACTION.INFO.KEY);
//CONFIG.hint(CONFIG.ACTION.ERROR.KEY);

var ERROR = function() {
    var handle =null;
    function subscribe(message, field){
        for (var i=0; i < CONFIG.ERROR.SUBSCRIBE.length; i++){
            if (field[CONFIG.ERROR.SUBSCRIBE[i]])
               message = message.replace("@"+CONFIG.ERROR.SUBSCRIBE[i],field[CONFIG.ERROR.SUBSCRIBE[i]]);
        }
        return message;
    }
    return {
	init:function(objectHandle){handle=objectHandle;},
        show:function(message,field) {
            message=subscribe(message,field);
            if (handle)
               handle.callback(message,field);
            else
               ERROR.on(message, field);
        },
        on:function(msg, field){
            field.Error.on(msg);
        },
        off:function(field){
            field.Error.off();
        },
        MESSAGE:CONFIG.ERROR.MESSAGE
    };
}();

var EXCEPTION = function() {
    var handle =null;
    var formatMessage=function(exception, text){
        var message=exception.id +":"+ exception.text;
        if (text != undefined)
           message += "\n"+ text;
    };
    return {
	init:function(objectHandle){handle=objectHandle;}
      , show:function(exception,text) {
            if (handle)
               handle.callback(exception,text);
            else
               EXCEPTION.on(exception,text);
        }
      , on:function(exception,text){
            console.log(formatMessage(exception,text));
        }
      , format:function(exception,text){
            return formatMessage(exception,text);
        }
//        off:function(field){
//            field.Error.off();
//        },
     , ITEM:CONFIG.EXCEPTION
    };
}();
