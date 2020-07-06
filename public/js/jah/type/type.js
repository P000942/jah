/*
 * To change this template, choose Tools 
 * and open the template in the editor.
 */
j$.ui.type={};
j$.ui.createFieldset = (fields)=>{return new Fieldset(fields)}
var DATATYPE = {NUMBER:{parse:value=>{return parseFloat(value);}},
                  DATE:{parse:value=>{return new Date(value);}},
                  CHAR:{parse:value=>{return value;}},
               BOOLEAN:{parse:value=>{return value;}},
                  LIST:{parse:value=>{return value;}}
               };

j$.ui.Render= function(){
      return {
          attributes:(attributes, exception)=>{
                //formata outros atributos de html do formulárioa para renderizar
                let result = ' ' 
                , ignore =att=>{
                    let go=false;
                    if (['key','caption','icon'].indexOf(att)>-1){
                       go= true;
                    } else if (exception){
                        if ((dataExt.isString(exception) && exception===att)
                        || (dataExt.isArray(exception) && exception.has(att)))
                            go= true;
                    }
                    return go;
                };
                for (let attribute in attributes){
                    let att = attribute.replace(/[$]/g,'s');
                    if (att.indexOf('data_')>-1)
                       att = att.replace('data_','data-');
                    else
                       att = att.replace(/\W|[_]/g,'');
                    if (attributes[attribute] && !ignore(att)){
                       result += att+"='" +attributes[attribute]+ "' " ;
                    }
                }
                return result;
          }
         , wrap:(wrap, id, clas$)=>{
              let id$ = j$.util.getId(clas$, id);
              if (!i$(id$))
                 wrap.insert(`<div id='${id$}' class='${clas$}'></div>`);
              return i$(id$);
          }
        , label: (wrap, label, inputId, clas$, mandatory)=>{
              let att={clas$:(clas$)?clas$:'input_label'
                       ,  id:(inputId)?inputId+ 'Label':j$.util.getId('Label')
                       , for:(inputId)? inputId:null
                      };
              label =(label)?label : att.id;
              if (!i$(att.id)){ // cria se não existir
                 let _att = j$.ui.Render.attributes(att,'label')
                 , required =(mandatory) ?'<span class="required">*</span>' :'';
                 wrap.insert(`<label ${_att} >${label}${required}:</label>`);
              }
              return i$(att.id);
        }
        , input:(wrap, id, inputType, maxlength, attributes)=>{
              if (!i$(id)){
                 let size =(maxlength)?" size='" +maxlength+ "'":""
                 ,   type = (inputType)?inputType:'text'
                 ,   _att = j$.ui.Render.attributes(attributes)
                 if (type==='select')
                    wrap.insert(`<${type} id='${id}' name='${id}' ${_att} ></${type}>`);
                 else
                    wrap.insert(`<input type='${type}' id='${id}' name='${id}' ${size} ${_att} >`);
              }
              return i$(id);
          }

        , hint:(parent, id, method)=>{
                 parent.insert({after:`<span id='${id}'></span>`});
                 $('#'+id).mouseover(method);
                 return i$(id);
         }
         , wrapperUl:(wrap, id, wrapStyle)=>{
               let wrapId =j$.util.getId(wrapStyle, id);
               $(wrap).append(`<div class='wrapperUl' id='${wrapId}_wrap'></div>`);
               $(`#${wrapId}_wrap`).append(`<ul class="${wrapStyle}" id="${wrapId}"></ul>`);
               return i$(wrapId);
           }
         , li:(wrap, properties)=>{
             wrap.insert('<li><a ' +j$.ui.Render.attributes({id:properties.id, onclick:properties.onclick})+' >' +properties.caption+ '</a></li>');
             return i$(properties.id);
         }
         , line:(section, id, wrapStyle, title)=>{
               let wrapId=j$.util.getId(wrapStyle, id)
                 , legend="", idLegend=`${wrapId}_legend`;
               if (title!=undefined){
                  if (dataExt.isString(title))
                     legend =`<legend class='${wrapStyle}_legend' id='${idLegend}'>${title}</legend>`;
                  else
                     legend =`<legend class='${wrapStyle}_legend' id='${idLegend}'>${title.text}</legend>`;
               }
               section.insert(`<fieldset class='${wrapStyle}' id='${wrapId}'>${legend}</fieldset>`);
               if (i$(idLegend)!=undefined && title.style!=undefined)
                   i$(idLegend).stylize(title.style);
               return i$(wrapId);
           }
         , button:(wrap, properties)=>{
             if (!properties.submenu)
                 wrap.insert(j$.ui.Render.formatButton(properties));
             else
                 wrap.insert(j$.ui.Render.formatButtonDropdown(properties));
             return i$(properties.id);
         }
         , formatButton:(properties)=>{
             //#todo: formata class 2x desnecessariamente
             return '<a' +j$.ui.Render.attributes(properties,['value', 'element'])+ '>'+j$.ui.Render.icon(properties)+properties.value+'</a>';
         }
         , formatButtonDropdown:(properties)=>{
             return '<div id="' +properties.id+ '"  class="btn-group">'
                   +'<a' +j$.ui.Render.attributes(properties,['value','onclick','submenu','id'])+ '>'+j$.ui.Render.icon(properties)+'</a>'
                   +'<button class="btn dropdown-toggle" data-toggle="dropdown"><span class="caret"></span></button>'
                   +'<ul id="'+properties.id+'Menu" class="dropdown-menu">'
                   +'</ul></div>';
         }
         , icon:(properties)=>{
            let iconClass
              , key = properties;
             if (dataExt.isString(properties))
                iconClass = CONFIG.icon(key);
             else if(dataExt.isObject(properties)){
                key = (properties.key)?properties.key:'';
                iconClass =(properties.icon) ?properties.icon :CONFIG.icon(key)
             }
             if (iconClass){
                let color = CONFIG.color(key);
                let txColor=(color)?`style="color:${color};" `  :'';
                return `<i class="${iconClass}" ${txColor}></i>`;
             }else
                return '';
         }
         , alert:(wrap, msg, clas$)=>{
             clas$ = (clas$)? `class='alert ${clas$}'`: "class='alert'";
             wrap.insert(`<div ${clas$}><button type="button" class="close" data-dismiss="alert">×</button>'${msg}</div>`);
         }
      };
}();

j$.ui.type.HintIcon= function(parent, id, hint, text){
    let element
      , id$ = j$.util.getId( (parent.id)?parent.id:'HintIcon', id);
    hint = (hint)?hint:CONFIG.ACTION.INFO.KEY;
    Object.preset(this, CONFIG.hint(hint));
    Object.preset(this, {
            on:msg=>{
                if (msg)
                this.text=msg;
                if (!i$(id$))
                    element=j$.ui.Render.hint(parent, id$, this.show);
                else
                    element=i$(id$);
                element.className = this.class;
            }
        ,   set:(msg)=>{this.text=msg}
        ,   get:()=>{return this.text}
        , reset:()=>{this.text=''}
        ,   off:()=>{if(i$(id$)) $('#'+id$).remove()}
        , hide:()=>{System.Hint.hide(this.Element)}
        , show:(event, msg=this.text)=>{System.Hint.show(this.text, element, event, "hint " + this.hint)}
        ,class: 'ikon-hint ' + this.icon
        , text: (text && dataExt.isString(text))?text:''
    });
    if (!this.text.isEmpty()){
        this.on()
    }
};

j$.ui.Alert= function(){
    let $alert = this;
    this.wrap = CONFIG.LAYOUT.ALERT_CONTENT;
    return {
       show:function(msg, alertClass, wrap=i$($alert.wrap)){
           this.hide(wrap);
           if (dataExt.isString(msg))
               j$.ui.Render.alert(wrap, msg, alertClass);
           else if (dataExt.isArray(msg) && msg.length === 1){
               j$.ui.Render.alert(wrap, msg[0], alertClass);
           }else{
               let html='<lu>'
               msg.each(function(text){html+=`<li>${text}</li>`});
               html+='</lu>'
               j$.ui.Render.alert(wrap, html , alertClass);
           }
       }
     ,   error:(msg, wrap)=>{
                  j$.ui.Alert.show(msg, CONFIG.ALERT.ERROR.CLASS, wrap)
               }
     ,    info:(msg, wrap)=>{
                  j$.ui.Alert.show(msg, CONFIG.ALERT.INFO.CLASS, wrap)
               }
     , success:(msg, wrap)=>{
                  j$.ui.Alert.show(msg, CONFIG.ALERT.SUCCESS.CLASS, wrap)
               }
     , hide:(wrap=i$($alert.wrap))=>{ wrap.innerHTML=''}
   }
}();
//j$.ui.Alert.error("Meu texto de erro", i$("assuntoAlert")) // assuntoAlert é o padrão da tabs "servico"+"Alert"
//j$.ui.Alert.info("Meu texto info"))                        // será exibido no padrão definido em CONFIG
//j$.ui.Alert.success("Meu texto bem sucedido"))
//j$.ui.Alert.show("Minha mensagem de alert", CLASS, idWrap) // CLASS: Veja em CONFIG
//j$.ui.Alert.hide(idWrap))                                  // Para desaparecer o Alert

var TYPE = function() {
    return {
        SLIDEBOX: properties=>{return new j$.ui.frame.slidebox(properties)}
   ,    FRAMEBOX: properties=>{return new j$.ui.frame.framebox(properties)}
   ,     DROPBOX: properties=>{return new j$.ui.frame.dropbox(properties)}
   ,       DIGIT: properties=>{return new j$.ui.type.Digit(properties)}
   ,     BOOLEAN: properties=>{return new j$.ui.type.Boolean(properties)}
   ,      LETTER: (size,properties)=>{return new j$.ui.type.Letter(size,properties)}
   ,   LOWERCASE: (size,properties)=>{return new j$.ui.type.LowerCase(size,properties)}
   ,   UPPERCASE: (size,properties)=>{return new j$.ui.type.UpperCase(size,properties)}
   ,        CHAR: (size,properties)=>{return new j$.ui.type.Char(size,properties)}
   ,        NAME: (size,properties)=>{return new j$.ui.type.Name(size,properties)}
   ,    PASSWORD: (size,properties)=>{return new j$.ui.type.Password(size,properties)}
   ,     INTEGER: (size,properties)=>{return new j$.ui.type.Integer(size,properties)}
   ,     NUMERIC: (size,decimal,properties)=>{return new j$.ui.type.Numeric(size,decimal,properties)}
   ,        MASK: (mask,properties)=>{return new j$.ui.type.Mask(mask,properties)}
   ,        LIST: properties=>{return new j$.ui.type.List(properties)}
   ,   TYPEAHEAD: properties=>{return new j$.ui.type.Typeahead(properties)}
   ,       MONEY: (size,properties)=>{return new j$.ui.type.Money(size,properties)}
   ,       EMAIL: (size,properties)=>{return new j$.ui.type.Email(size,properties)}
   ,        DATE: properties=>{return new j$.ui.type.Date(properties)}
   ,        HOUR: (size,properties)=>{return new j$.ui.type.Hour(size,properties)}
   ,       PHONE: (size,properties)=>{return new j$.ui.type.Phone(size,properties)}
   ,         CPF: properties=>{return new j$.ui.type.Cpf(properties)}
   ,        CNPJ: properties=>{return new j$.ui.type.Cnpj(properties)}
   ,         CCA: properties=>{return new j$.ui.type.Cca(properties)}
   ,         CEP: properties=>{return new j$.ui.type.Cep(properties)}
   ,       Placa: properties=>{return new j$.ui.type.Placa(properties)}
   ,         TEST:function(properties){return {
                   assert:function(obj, value){
                                console.log('assert('    +value+ '):');
                                console.log("\n Validate:" + obj.isValid(value)
                                           //+"\n unformat:" + obj.unformat(value)
                                           +"\n   format:" + obj.format(value)
                                           +"\n    value:" + obj.value(value)
                                           +"\n    align:" + obj.align
                                           +"\n     size:" + obj.size);
                       }
                };
            }()
    };
}();
TYPE.HELPER = {
    getElementIndex:function(obj) {
        let form = obj.form;
        for (let i=0; i<form.elements.length; i++) {
            if (obj.id == form.elements[i].id) 
                return i;
        }
        return -1;
    }
    , getLabel: function (inputField){ //Vai procurar no HTML o label que precede o input
        let labelField = {label:'', mandatory:false}
          , lbl="";
        if(inputField.parentNode){
          if(inputField.parentNode.tagName=='label')
            lbl=inputField.parentNode.innerHTML;
        }
        let labels=document.getElementsByTagName("label"),i;
        for( i=0; i<labels.length;i++ ){
           if(labels[i].htmlFor==inputField.id)
              lbl=labels[i].innerHTML;
        }
        lbl=lbl.replace(' *', "*");
        lbl=lbl.replace('* ', "*");
        if (lbl.indexOf('>*<')>-1)
           labelField.mandatory = true;

        lbl=lbl.replace('<span class="required">*</span>', "");
        lbl=lbl.replace('<span class="required"></span>', "");
        labelField.label = lbl.replace(/[:->]/g,"").trim();
        return labelField;
  }
  , setLabel: function (inputField, _input){
        if (inputField.label.isEmpty() || !inputField.mandatory){
            let labelField = TYPE.HELPER.getLabel(_input);
            if (inputField.label.isEmpty()){
                inputField.label=inputField.id;
            if (!labelField.label.isEmpty())
                inputField.label=labelField.label;
            }
            if (!inputField.mandatory)
               inputField.mandatory = labelField.mandatory;
        }
  }
  , createLabel: function(inputField, wrap){
        if (inputField.label.isEmpty()) // label é o texto que foi setado no construtor
            inputField.label=inputField.key;
        let wrapInput = j$.ui.Render.wrap(wrap,inputField.id+'_wrapLabel','wrap_label');

        j$.ui.Render.label(wrapInput, inputField.label, inputField.id, 'input_label' ,inputField.mandatory)
        wrapInput.stylize(inputField.design.labelStyle);
        return {label:inputField.label, mandatory:inputField.mandatory}
   }
};
// Helper={}
// Helper.Label = function(){
//    RETURN {

//    }
// }()

class Ma$k{
    constructor(mask){
        Object.preset(this,{fmt:null, prompt:null, strip:null, mask:null, size:1, TCMask:null});
        if (mask){
            Object.setIfExist(this,mask,['strip','empty']);
            if (mask.format){
                this.TCMask = 'TCMask['+ mask.format +']';
                this.fmt = mask.format;
                let vMask = mask.format.split(CONFIG.MASK.FieldDataSeparator);
                this.mask = vMask[0];
                this.prompt = (vMask.length>1) ? vMask[1] : null;
                this.size = this.mask.length;
            }
        }
    };
    format (value){return (this.mask)?value.mask(this.mask) :value}
    unformat (value){
        let vl = (this.strip) ?value.stripChar(this.strip) :value.trim();
        vl = vl.stripChar("_"); // Remover o caracter de prompt
        if (this.empty && vl==this.empty)
           vl =''
        return vl;
    };
    render (inputField){
         if (this.TCMask){
             inputField.addClassName(this.TCMask);
             Typecast.Format(inputField);
         }
    }
}

// superMask=function(mask){
//     let SELF=this;
//     Object.preset(SELF,{format:null, prompt:null, strip:null, mask:null, size:1, TCMask:null});
//     let initialized = function(){
//         if (mask){
//             Object.setIfExist(SELF,mask,['strip','empty']);
//             if (mask.format){
//                 SELF.TCMask = 'TCMask['+ mask.format +']';
//                 SELF.format = mask.format;
//                 var vMask = mask.format.split(CONFIG.MASK.FieldDataSeparator);
//                 SELF.mask = vMask[0];
//                 SELF.prompt = (vMask.length>1) ? vMask[1] : null;
//                 SELF.size = SELF.mask.length;
//             }
//         }
//     }();
//     this.format = value=>{
//         return (SELF.mask)?value.mask(SELF.mask) :value;
//     };
//     this.unformat = value=>{
//         let vl = (SELF.strip) ?value.stripChar(SELF.strip) :value.trim();
//         vl = vl.stripChar("_"); // Remover o caracter de prompt
//         if (SELF.empty && vl==SELF.empty)
//            vl =''
//         return vl;
//     };
//     this.render = function(inputField){
//          if (SELF.TCMask){
//              inputField.addClassName(SELF.TCMask);
//              Typecast.Format(inputField);
//          }
//     }
// }
//TYPE.TEST.assert(TYPE.CCA(),'04.150.945-5');
//TYPE.TEST.assert(TYPE.PHONE(),'(092)8122-0122');
//TYPE.TEST.assert(TYPE.CNPJ(),'07.311.461/0001-24');
//TYPE.TEST.assert(TYPE.CPF(),'417.660.402-68');
//TYPE.TEST.assert(TYPE.Placa(),'JGG-1111');
//TYPE.TEST.assert(TYPE.CEP(),'69029-080');
//TYPE.TEST.assert(TYPE.DATE(),'30/10/2011');
//TYPE.TEST.assert(TYPE.NUMERIC(),'1');
//TYPE.TEST.assert(TYPE.BOOLEAN({list:{'true':{value:true, text:'Ativo'}, 'false':{value:false, text:'Desativado'}}}),true);
//TYPE.TEST.assert(TYPE.BOOLEAN({list:{'true':{value:1, text:'Ativo'}, 'false': {value:9, text:'Cancelado'}}}),1);
//TYPE.TEST.assert(TYPE.LIST({list:{'M':'Masculino', 'F':'Feminino'}}),'M');


Element.prototype.bind = function(field) {
    this.field =field;
    if (!field.binded){
        field.bind(this);
    }
};

class Legend{
    constructor(field){
        this.field = field;
        this.Resource = field.Resource;
        this.id =`${this.field.id}_legend`;
    }
    prepareToRequest= value=>{
        this.hide();
        value = (value)?value:this.field.value();
        return (value.isEmpty()) ?null
                                 :Object.build(this.field.resource.id,value);
    }

    hide=() =>{if(i$(this.id)) $(`#${this.id}`).remove()}
    show=text =>{
        if(!i$(this.id))
            $(this.field.inputField.parentElement).append(`<span class='${CONFIG.LEGEND.CLASS}' id='${this.id}'>${text}</span>`);
        else
            i$(this.id).content(text);
    }
    get =  response => {
        this.hide();
        let text='';
        if (this.Resource){
            let record = this.Resource.handleResponse(response);
            if (record){
                if (record[0][this.Resource.text]!=undefined){
                    text = record[0][this.Resource.text];
                    this.show(text)
                }
            }
            if (text.isEmpty()){
                this.field.Error.set(ERROR.MESSAGE.InvalidItem);
                ERROR.show(this.field.Error.get(),this.field);
            }else{
                ERROR.off(this.field);
            }
        } else if (response && dataExt.isString(response) && !response.isEmpty())
            this.show(response);
    }
    request=value =>{
        let fields = this.prepareToRequest(value);
        if (this.Resource && dataExt.isDefined(fields)){
            if (this.field.type=='text')
               this.Resource.get(fields, this); // this é o callback
        }
    }
};

function superType(Type, Properties) {
   let SELF=this;
   Object.preset(SELF,{align:c$.ALIGN.LEFT, mandatory:false, autotab:false, label:''
                     , hint:null, persist:true, defaultValue:'', type:'text'
                     , id:'', key:null, list:null, readOnly:false
                     , binded:false, order:c$.ORDER.NONE, disabled:false, onFilter:false
                     , inputField:false, dataType:DATATYPE.NUMBER, size:null
                     , maxlength:0, validator:null, mask:null
                     , Header:{clas$:null, id:null}
                     , Report:{}, Record:{value:'', formattedValue:''}, attributes:null});
/*   this.id  - Eh o identificador no form.
   this.key - eh como estah definido no dataset (column)
*/
   defineProperties(Type, Properties);

//    this.Label= function(){
//        return {
//               create:function(wrap, id,  key, design){
//                    if (SELF.label.isEmpty())
//                        SELF.label=(key) ?key :id;
//                    let wrapInput = j$.ui.Render.wrap(wrap,id+'_wrapLabel','wrap_label');

//                    j$.ui.Render.label(wrapInput, SELF.label, id, 'input_label' ,SELF.mandatory)
//                    wrapInput.stylize(design.labelStyle);
//               }
//       };
//    }();

   this.edit= value=>{
        if (value == undefined)
            value = SELF.Record.value;
        i$(SELF.id).content(value);
        i$(SELF.id).className = CONFIG.INPUT.CLASS.DEFAULT; //"input_text";
   };
   this.format= p_value=> {
        return  (SELF.mask) ?SELF.mask.format(p_value) :SELF.value(p_value);
   };
   this.identify= (wrap, id, key, design)=>{
       SELF.id =j$.util.getId(SELF.type, id);
       SELF.key =(key)?key : SELF.id;
       if (!design) design={};
       SELF.design = design;
      // SELF.Label.create(wrap, SELF.id, key, SELF.design);
   }
   this.create= (wrap, id, key, design) =>{
       SELF.identify(wrap, id, key, design);
       TYPE.HELPER.createLabel(SELF, wrap)
       let wrapInput = j$.ui.Render.wrap(wrap,SELF.id+'_wrapInput','wrap_input');
       j$.ui.Render.input(wrapInput, SELF.id, SELF.type, SELF.maxlength, SELF.attributes);
       wrapInput.stylize(SELF.design.inputStyle);
       SELF.bind(i$(SELF.id));
   };
   this.text =p_value=>{return SELF.value(p_value);}; // Se tem um texto associado ou uma lista (pode ser usado para um AJAX)
   this.value =p_value=>{ // Retorna o valor sem m�scara (caso haja)
          let value;
          if (p_value)
              value=p_value;
          else{
              if (SELF.inputField)
                  value = SELF.inputField.value;
          }
          if (SELF.mask){value = SELF.mask.unformat(value);}
          return value.trim();
   };
   this.validate= p_value=>{
        let value=SELF.value(p_value)
          , valid=SELF.isValid(value);
        if (!valid && ERROR){
            SELF.Error.set((value.isEmpty()?ERROR.MESSAGE.Mandatory:SELF.validator.error));
            ERROR.show(SELF.Error.get(),SELF);
        }else{
            ERROR.off(SELF);
        }
        SELF.inputField.className = (valid)?CONFIG.INPUT.CLASS.DEFAULT:CONFIG.INPUT.CLASS.ERROR;
        return valid;
   };
   this.isValid= p_value=>{
        let value = SELF.value(p_value)
          , valid=true;
        if (!value.isEmpty()){ // se tem valor, assume o memso como verdadeiro
           if (SELF.validator.handler) // se tem handle, v�lida
              valid=SELF.validator.handler(value);
        }else
            valid=SELF.mandatory?false:true;
        return valid;
   };

   this.reset= ()=>{
        ERROR.off(SELF);
        if (!SELF.defaultValue.isEmpty())
            i$(SELF.id).value=SELF.defaultValue;
        i$(SELF.id).className = CONFIG.INPUT.CLASS.DEFAULT;
   };

   this.bind = inputField=>{
       SELF.binded=true;
       SELF.inputField=inputField;
       SELF.inputField.bind(SELF);
       SELF.id =inputField.id;
       if (!SELF.key)
           SELF.key =SELF.id;
       let hint = "";

       SELF.Error = new j$.ui.type.HintIcon(inputField, inputField.id+'_error', CONFIG.ACTION.ERROR.KEY);
       if (SELF.hint)
          SELF.Hint = new j$.ui.type.HintIcon(inputField, inputField.id+'_info', CONFIG.ACTION.INFO.KEY, SELF.hint);
       
       TYPE.HELPER.setLabel(SELF, inputField); // definir o label

       Event.observe(inputField, 'focus', TYPE.HANDLE.focus, false);
       if (SELF.validator)
           Event.observe(inputField, 'blur',  (e)=>{TYPE.HANDLE.lostFocus(e,SELF.validate);});
       else
           Event.observe(inputField, 'blur',  TYPE.HANDLE.lostFocus);

       switch(SELF.type){
            case 'text':
                this.Legend = new Legend(this);
                if (SELF.autotab)
                    Event.observe(inputField, 'keyup', ()=>{TYPE.HANDLE.autotab(inputField,SELF.maxlength);});
                SELF.mask.render(inputField);
                //inputField.className = inputField.className + " " + CONFIG.INPUT.CLASS.DEFAULT;
                if (inputField.maxlength)
                    inputField.maxlength = SELF.maxlength;
                break;
            case 'select':
                SELF.popule();
                break;
            default:
                break
       }
       Object.setIfExist(inputField, SELF,['readOnly','disabled','defaultValue'])
       inputField.className   = inputField.className + " " + CONFIG.INPUT.CLASS.DEFAULT;
   };

    this.filterToggle=showFilter=>{
        SELF.onFilter = (dataExt.isDefined(showFilter))
                    ?showFilter
                    :!SELF.onFilter
        SELF.Header.clas$ = c$.FILTER.CLASS(SELF.onFilter);
    };
    // Ver DATATYPE - � fazer um parse para um valor correto.
    function parseValue(value){
        SELF.dataType.parse(value);
    }
   function defineProperties(Type, Properties) {
        //var properties={autotab:false, label:'', mandatory:false, locked:false, defaultValue:'', align:c$.ALIGN.LEFT, size:null, validator:null, mask:null}
        let mask = null;
        // Primeiro verifica/seta o que vem do no Type, que são o valores que já vem por padrão
        if (Type){
            Object.setIfExist(SELF, Type, ['align','size','validator','mask','autotab'
                                          ,'type','label','dataType','list','attributes']);
            if (Type.mask)
                mask=Type.mask;
        }
        // Depois verifica/seta o que vem em Porperties, que é o que vem do usuário;
        if (Properties){
            Object.setIfExist(SELF, Properties,
                             ['evaluate','autotab', 'label','mandatory', 'align', 'parentLegend'
                            , 'readOnly', 'disabled', 'defaultValue', 'type'
                            , 'dataType', 'list', 'hint','attributes', 'resource']);
            if (Properties.resource){
                // SELF.AdapterResource = j$.Resource.ResponseHandler;  // Quando tiver RESOURCE
                // SELF.AdapterResource(Properties, SELF);
                 SELF.Resource =  j$.Resource.create(SELF.resource, SELF);
            }
        }
        SELF.mask = new Ma$k(mask);
        if (!SELF.size)
            SELF.size = SELF.mask.size;

        SELF.maxlength = (SELF.size>SELF.mask.size)?SELF.size:SELF.mask.size;
    }
}

j$.ui.type.Digit=function(Properties) {
   this.inherit = superType;
   this.inherit({size:1, align:c$.ALIGN.RIGHT, validator:{handler:value=>{return value.isDigit();}, error:ERROR.MESSAGE.Digit}, mask:{format:'#|_', strip:'_'}}, Properties);
}

j$.ui.type.Numeric=function(size,decimal, Properties){
   this.inherit = superType;
   let mask = '#'.repeat(size);
   let _size = size;
   if (decimal){
      mask += ','+'#'.repeat(decimal);
      //mask += '|'+'_'.repeat(size)+','+'_'.repeat(decimal);
      _size = size+decimal+1;
   }
   this.inherit({size:_size, align:c$.ALIGN.RIGHT, validator:{handler:value=>{return value.isNumeric();}, error:ERROR.MESSAGE.Numeric}, mask:{format:mask}}, Properties);
}
j$.ui.type.Integer=function(size, Properties){
   this.inherit = superType;
   this.inherit({size:size, align:c$.ALIGN.RIGHT, validator:{handler:value=>{return value.isInteger();}, error:ERROR.MESSAGE.Integer}, mask:{format:'#'.repeat(size)}}, Properties);
}

j$.ui.type.Money=function(size, Properties){
   this.inherit = superType;
   var mask = '9'.repeat(size-3)+'0,'+'00';
   this.inherit({size:size+1, align:c$.ALIGN.RIGHT, validator:{handler:value=>{return value.isNumeric();}, error:ERROR.MESSAGE.Money}, mask:{format:mask, empty:','}}, Properties);
   this.format= value=> {return dataExt.format.money(value); };
}

j$.ui.type.Char=function(size, Properties){
   this.inherit = superType;
   this.inherit({size:size, dataType:DATATYPE.CHAR, validator:{error:ERROR.MESSAGE.Char}}, Properties);
}
j$.ui.type.Letter=function(size, Properties){
   this.inherit = superType;
   this.inherit({size:size, dataType:DATATYPE.CHAR, validator:{handler:value=>{return value.isLetter();}, error:ERROR.MESSAGE.Letter}, mask:{format:'@'.repeat(size)}}, Properties);
}
j$.ui.type.UpperCase=function(size, Properties){
   this.inherit = superType;
   this.inherit({size:size, dataType:DATATYPE.CHAR, validator:{handler:value=>{return value.isLetter();}, error:ERROR.MESSAGE.Letter}, mask:{format:'A'.repeat(size)}}, Properties);
}
j$.ui.type.LowerCase=function(size, Properties){
   this.inherit = superType;
   this.inherit({size:size, dataType:DATATYPE.CHAR, validator:{handler:value=>{return value.isLetter();}, error:ERROR.MESSAGE.Letter}, mask:{format:'a'.repeat(size)}}, Properties);
}

j$.ui.type.Name=function(size, Properties){
   this.inherit = superType;
   this.inherit({size:size, dataType:DATATYPE.CHAR, validator:{handler:value=>{return value.isName();}, error:ERROR.MESSAGE.Name}}, Properties);
}

j$.ui.type.Email=function(size, Properties){
   this.inherit = superType;
   this.inherit({size:size, dataType:DATATYPE.CHAR, validator:{handler:value=>{return value.isEmail();}, error:ERROR.MESSAGE.Email}}, Properties);
}

j$.ui.type.Date=function(Properties){
   this.inherit = superType;
   this.inherit({size:10, dataType:DATATYPE.DATE, validator:{handler:value=>{return value.isDate();}, error:ERROR.MESSAGE.Date}, mask:{format:'00/00/0000|__/__/____', strip:'_', empty:'//'}}, Properties);
}

j$.ui.type.Hour=function(Properties){
   this.inherit = superType;
   this.inherit({size:4, validator:{handler:value=>{return value.isHour();}, error:ERROR.MESSAGE.Hour}, mask:{format:'00:00|__:__',empty:':'}}, Properties);
}

j$.ui.type.Phone=function(Properties){
   this.inherit = superType;
   this.inherit({size:11, validator:{handler:value=>{withoutMask=true;return value.isPhone(withoutMask);}, error:ERROR.MESSAGE.Phone}, mask:{format:'(000)0000-0000|(___)____-____', strip:'()-'}}, Properties);
}


j$.ui.type.Password=function(size, Properties){
   this.inherit = superType;
   this.inherit({size:size, type:'password', dataType:DATATYPE.CHAR, validator:{error:ERROR.MESSAGE.Password}}, Properties);
}

j$.ui.type.Cpf=function(Properties){
   this.inherit = superType;
   this.inherit({size:11, validator:{handler:value=>{return value.ehCpf();}, error:ERROR.MESSAGE.Cpf}, mask:{format:'000.000.000-00|___.___.___-__', strip:'.-'}}, Properties);
}

j$.ui.type.Cnpj=function(Properties){
   this.inherit = superType;
   this.inherit({size:14, validator:{handler:value=>{return value.ehCnpj();}, error:ERROR.MESSAGE.Cnpj}, mask:{format:'00.000.000/0000-00|__.___.___/____-__', strip:'-/.'}}, Properties);
}

j$.ui.type.Cca=function(Properties){
   this.inherit = superType;
   this.inherit({size:9, validator:{handler:value=>{return value.ehCca();}, error:ERROR.MESSAGE.Cca}, mask:{format:'00.000.000-0|__.___.___-_', strip:'.-'}}, Properties);
}

j$.ui.type.Placa=function(Properties){
   this.inherit = superType;
   this.inherit({size:7, dataType:DATATYPE.CHAR, validator:{handler:value=>{return value.ehPlaca();}, error:ERROR.MESSAGE.Placa}, mask:{format:'AAA-0000|___-____', strip:'.-'}}, Properties);
}

j$.ui.type.Cep=function(Properties){
   this.inherit = superType;
   this.inherit({size:8, validator:{handler:value=>{return value.ehCep();}, error:ERROR.MESSAGE.Cep}, mask:{format:'00000-000|_____-___', strip:'-'}}, Properties);
}

j$.ui.type.Mask=function(mask, Properties){
    let strip=mask.replace(/\w|[@]|[#]/g,""); // Pega somente caracteres especiais;
    let prompt='|'+mask.replace(/\w|[@]|[#]/g,"_"); //Montar prompt para entrada de dados;
    let dataType = (mask.replace(/\d|[#]/g,"").length>0)? DATATYPE.CHAR : DATATYPE.NUMBER;
    let validator = {handler:value=>{return value.isValidInMask(mask);},error: "campo preenchido com formato inválido"};
    this.inherit = superType;
    this.inherit({validator:validator, dataType:dataType, mask:{format:mask+prompt, strip:strip}}, Properties);
}

j$.ui.type.List=function(Properties){
    let SELF = this;
    let list = null;
    this.inherit = superType;
    this.inherit({type:'select',  dataType:DATATYPE.LIST, validator:{handler:SELF.exists, error:ERROR.MESSAGE.List}}, Properties);
   function init(){
        if (Properties){
            if (Properties.list)
                list = Properties.list;
            else{
                if (Properties.resource){
                    SELF.Resource.Requester.get();
                }
            }
        }
   }
   this.text = function(p_value){
        let value=SELF.value(p_value);
        let item = (list[value])?list[value]:"";
        return item;
   };
   this.format = this.text;
   this.size = maxlen(list);
   this.value = p_value=>{
        let value='';
          if (p_value)
              value=p_value;
          else{
              if (SELF.inputField){
                  var index=SELF.inputField.selectedIndex;
                  var options= SELF.inputField.options;
                  value=options[index].value;
              }
          }
          return value.trim();
   };

   this.exists = value=>{ return (list[value])?true:false};

   this.popule=$list=>{
       if ($list)
           list=$list;
       SELF.clear();
       for(key in list){
            let option=document.createElement("option");
            option.text = list[key];
            option.value = key;
            if (key==SELF.defaultValue)
                option.selected=true;
            i$(SELF.id).add(option,i$(SELF.id).options[null]);
       }
   };
   this.clear=()=>{i$(SELF.id).innerHTML=""}
   this.add=record=>{ console.log(record)}
   //response para o resource
   this.get=response=>{
        let listset = SELF.Resource.Parser.toListset(response);
        list = listset.list;
        this.size = listset.maxlength;
   };

   function maxlen(list){
        let max = 0;
        for(key in list){
           let item = list[key];
           if (item.length > max)
                max = item.length;
        }
        return max;
   }
   init();
}

j$.ui.type.Typeahead=function(Properties){
   this.inherit = j$.ui.type.List;
   this.inherit(Properties);
   this.attributes={data_provide:'typeahead', data_items:'4'};
}

j$.ui.type.Boolean=function(Properties){
    let SELF = this;
    let list = CONFIG.BOOLEAN;
   if (Properties)
       if (Properties.list)
           list = Properties.list;
   let text = '';
   this.inherit = superType;
   this.inherit({type:'checkbox',  dataType:DATATYPE.BOOLEAN}, Properties);
   this.text = p_value=>{
          let value='';
          if (p_value != undefined)
              value=p_value;
          else{
              if (SELF.inputField){
                  value =SELF.inputField.checked;
              }
          }
          return SELF.local.text(value);
   };
   this.format = this.text;
   this.value = p_value=>{
          let value='';
          if (p_value != undefined)
              value=p_value;
          else{
              if (SELF.inputField){
                  value =SELF.inputField.checked;
              }
          }
          return SELF.local.value(value);
   }
   this.isValid= p_value=>{return true}
   this.local= function(){
       return{
           item:value=>{
               if (typeof value == "string")
                   return list[value];
               else
                   return list[(value)?'true':'false'];
           },
           text:value=>{
                let item = SELF.local.item(value);
                return item.text;
           },
           value:value=>{
                let item = SELF.local.item(value);
                return item.value;
           },
           maxlen:function(){
               let max=0;
               for (key in list){
                   var item = list[key];
                   if (item.text.length > max)
                       max = item.text.length;
               }

               return max;
           }
       };
   }();
   this.size = this.local.maxlen();
}

// j$.ui.Fieldset = function(fields) {
//     let SELF = this;
//     this.Items=fields;
//     this.length=0;
//     init();

//     function init(){
//         for(let key in SELF.Items){
//             SELF.Items[key].id=key;
//             SELF.length++;
//         }
//     }
//     this.item = key=>{
//         try {
//             if (SELF.Items[key]==undefined)
//                 throw CONFIG.EXCEPTION.INVALID_FIELD;
//             else
//                 return SELF.Items[key];
//         } catch(exception){
//                if (exception==CONFIG.EXCEPTION.INVALID_FIELD)
//                    console.log(exception.text +" '"+key+"'");
//                return false;
//         }
//     }
//     //this.get = SELF.item;
//     // varre fieldset devolve um registro dos campos que estão preenchidos
//     // útil para consultas
//     this.filled = action=>{
//         let record = {};
//         for(let key in SELF.Items){
//             let value = SELF.Items[key].value();
//             let use = !value.toString().isEmpty();
//             if (use && action)
//                 use = action(SELF.Items[key]);
//             if (use)
//                 record[key]= value;
//         }
//         return record;
//     };
//     this.RecordBy = keys=>{
//         let record = {};
//         const keyType = dataExt.type(keys);
//         switch (keyType) {
//             case "String": record[keys]= SELF.Items[keys].value();
//                  break; 
//             case "Array": 
//                 keys.forEach(key => {record[key]= SELF.Items[key].value()})
//                 break;
//             default:
//                 console.log(`"${keyType}" não é um tipo reconhecido em "Fieldset.RecordBy"`);
//         } 
//         return record;
//     };   
//     this.setDefaults = provider=>{
//         for (let key in provider){
//             if (this.Items[key])
//                 this.Items[key].defaultValue=provider[key];
//         }
//     }; 
//      // varre as campos e devolve um registro com o conteúdo dos campos
//     this.sweep = action=>{
//         let record = {};
//         for(let key in SELF.Items){
//             let field = SELF.Items[key];
//             if (field.persist)
//                record[key]= field.value();
//             if (action)
//                 action(field);
//         }
//         return record;
//     };
//     this.createRecord = ()=>{
//        return SELF.sweep();
//     };
//     this.each = this.sweep;
//     this.reset = ()=>{
//        SELF.sweep(field=>{
//             field.reset();
//        });
//     };
//     this.bindColumns = Columns=>{
//        SELF.sweep(field=>{
//            if (Columns[field.key]===undefined)
//                field.persist=false;
//        });
//     };
//     // recebe um registro e popula conteúdo dos campos no Fieldset
//     this.populate = (record, action)=>{
//         for(let key in SELF.Items){
//             let field = SELF.Items[key];

//             if (field.evaluate)
//                record[key] = field.evaluate(record);

//             if (record[key] != undefined){
//                field.Record.value=record[key];
//                field.Record.formattedValue=field.format(field.Record.value.toString());
//             }else{
//                field.Record.value=null;
//                field.Record.formattedValue=null;
//             }
//             if (action)
//                 action(field);
//         }
//     };
//     // atualiza no form
//     this.edit = record=>{ SELF.populate(record, field=>{field.edit()})}

//     this.toQueryString = action=>{
//         return "?"+jQuery.param(SELF.filled(action));
//     };

//     this.orderBy= key =>{ // forma semantica de criar o Sort
//        if (!SELF.sort)
//           SELF.sort = new Sort(key)
//        else
//           SELF.sort.init(key)
//         return SELF.sort;
//     }

//     function Sort(key){ // Sort está no Fieldset e não no field para consumir menos recurso (não precisará uma instancia por field)
//         let $ORT = this;
//         let field =  null;
//         $ORT.init = init;
//         init(key);

//         function init(key){
//             if (key && key != $ORT.key) {
//                $ORT.key =  key;
//                $ORT.field =  SELF.Items[key];
//                $ORT.order =  c$.ORDER.NONE;
//                field = $ORT.field;
//             }
//         }
//         $ORT.clear = ()=>{
//             for(let key in SELF.Items){
//                 if (key != $ORT.key)
//                    SELF.Items[key].Header.clas$ = c$.ORDER.CLASS(c$.ORDER.NONE);
//             }
//         }
//         $ORT.asc=(currentRow, nextRow)=>{
//             let currentVal = field.dataType.parse(currentRow[$ORT.key]);
//             let nextVal = field.dataType.parse(nextRow[$ORT.key]);
//             let r = 0;
//               if (currentVal < nextVal)
//                   r = -1;
//               else if (currentVal > nextVal)
//                   r = 1;
//               return r;
//           }
//         $ORT.desc=(currentRow, nextRow)=>{
//             let currentVal = field.dataType.parse(currentRow[$ORT.key]);
//             let nextVal = field.dataType.parse(nextRow[$ORT.key]);
//             let r = 0;
//               if (currentVal > nextVal)
//                  r = -1;
//               else if (currentVal < nextVal)
//                  r = 1;
//               return r;
//           }
//         $ORT.orderBy= order => {
//               if ($ORT.toggle(order) != c$.ORDER.NONE)
//                  return ($ORT.order == c$.ORDER.DESCENDING) ? $ORT.desc : $ORT.asc;
//               else
//                  return null;
//            }
//         $ORT.toggle= order => {
//                  // Quando indicar que não há classificação, passa order=ORDER.NONE
//                  if (!order){
//                     if ($ORT.order == c$.ORDER.NONE || $ORT.order == c$.ORDER.DESCENDING)
//                         order = c$.ORDER.ASCENDING;
//                     else
//                         order = c$.ORDER.DESCENDING;
//                  }
//                  $ORT.order = order;
//                  field.Header.clas$ = c$.ORDER.CLASS(order);
//                  return order;
//               }
//     };

//     this.filter = function(){
//         let criteria={};
//         return {
//           clear: ()=>{
//              for(key in SELF.Items){
//                  SELF.Items[key].filterToggle(false);
//              }
//           }
//           ,toggle: (key,value) => {
//               let field= SELF.Items[key];
//               if (field.onFilter){ // já tem filtro, tem que remover
//                   delete criteria[field.key];
//               }else{
//                   criteria[field.key]= field.value(value);
//               }
//               return ($.isEmptyObject(criteria))
//                     ? null
//                     : criteria;
//           }
//         };
//     }();

//     this.execute = action=>{
//         for(let key in SELF.Items){
//            let field = this.Items[key];
//            action(field,key);
//         }
//     };

//     this.show = ()=>{SELF.execute((field, key)=>{console.log(key); console.log(input);});};
// };
class Sort{
    constructor(key, items){ // Sort está no Fieldset e não no field para consumir menos recurso (não precisará uma instancia por field)
        let $ORT = this;
        var _sort = this;
        //let field =  null;
        this.Items = items;
       // $ORT.init = init;
     //  if (key && key != $ORT.key) {
            this.key =  key;
            this.field = items[key];
            this.order =  c$.ORDER.NONE;
            let field = this.field;
      //  }
    }    
    clear= ()=>{
        for(let key in this.Items){
            if (key != this.key)
               this.Items[key].Header.clas$ = c$.ORDER.CLASS(c$.ORDER.NONE);
        }
    }
    asc =(currentRow, nextRow)=>{
        let currentVal = this.field.dataType.parse(currentRow[this.key]);
        let nextVal =  this.field.dataType.parse(nextRow[this.key]);
        let r = 0;
          if (currentVal < nextVal)
              r = -1;
          else if (currentVal > nextVal)
              r = 1;
          return r;
      }
    desc=(currentRow, nextRow)=>{
        let currentVal =  this.field.dataType.parse(currentRow[this.key]);
        let nextVal =  this.field.dataType.parse(nextRow[this.key]);
        let r = 0;
          if (currentVal > nextVal)
             r = -1;
          else if (currentVal < nextVal)
             r = 1;
          return r;
      }
    orderBy=(order)=> {
       if (this.toggle(order) != c$.ORDER.NONE)
             return (this.order == c$.ORDER.DESCENDING) ? this.desc : this.asc;
          else
             return null;
       }
    toggle (order){
             // Quando indicar que não há classificação, passa order=ORDER.NONE
             if (!order){
                if (this.order == c$.ORDER.NONE || this.order == c$.ORDER.DESCENDING)
                    order = c$.ORDER.ASCENDING;
                else
                    order = c$.ORDER.DESCENDING;
             }
             this.order = order;
             this.field.Header.clas$ = c$.ORDER.CLASS(order);
             return order;
          }
};
class Fieldset{
    constructor (fields) {
        function init(){
            for(let key in _fs.Items){
                _fs.Items[key].id=key;
                _fs.length++;
            }
        }
        let _fs = this;
        this.Items=fields;
        this.length=0;
        this.filter= function(){
            let criteria={};
            return {
              clear: ()=>{
                 for(key in _fs.Items){
                    _fs.Items[key].filterToggle(false);
                 }
              }
              ,toggle: (key,value) => {
                  let field= _fs.Items[key];
                  if (field.onFilter){ // já tem filtro, tem que remover
                      delete criteria[field.key];
                  }else{
                      criteria[field.key]= field.value(value);
                  }
                  return ($.isEmptyObject(criteria))
                        ? null
                        : criteria;
              }
            };
        }();
        init();
    }

    item = key=>{
        try {
            if (this.Items[key]==undefined)
                throw CONFIG.EXCEPTION.INVALID_FIELD;
            else
                return this.Items[key];
        } catch(exception){
               if (exception==CONFIG.EXCEPTION.INVALID_FIELD)
                   console.log(exception.text +" '"+key+"'");
               return false;
        }
    }
    //this.get = this.item;
    // varre fieldset devolve um registro dos campos que estão preenchidos
    // útil para consultas
    filled = action=>{
        let record = {};
        for(let key in this.Items){
            let value = this.Items[key].value();
            let use = !value.toString().isEmpty();
            if (use && action)
                use = action(this.Items[key]);
            if (use)
                record[key]= value;
        }
        return record;
    };
    RecordBy = keys=>{
        let record = {};
        const keyType = dataExt.type(keys);
        switch (keyType) {
            case "String": record[keys]= this.Items[keys].value();
                 break; 
            case "Array": 
                keys.forEach(key => {record[key]= this.Items[key].value()})
                break;
            default:
                console.log(`"${keyType}" não é um tipo reconhecido em "Fieldset.RecordBy"`);
        } 
        return record;
    };   
    setDefaults = provider=>{
        for (let key in provider){
            if (this.Items[key])
                this.Items[key].defaultValue=provider[key];
        }
    }; 
     // varre as campos e devolve um registro com o conteúdo dos campos
    sweep (action){
        let record = {};
        for(let key in this.Items){
            let field = this.Items[key];
            if (field.persist)
               record[key]= field.value();
            if (action)
                action(field);
        }
        return record;
    };
    createRecord = ()=>{
       return this.sweep();
    };
    each = this.sweep;
    reset (){
       this.sweep(field=>{
            field.reset();
       });
    };
    bindColumns (Columns){
       this.sweep(field=>{
           if (Columns[field.key]===undefined)
               field.persist=false;
       });
    };
    // recebe um registro e popula conteúdo dos campos no Fieldset
    populate (record, action){
        for(let key in this.Items){
            let field = this.Items[key];

            if (field.evaluate)
               record[key] = field.evaluate(record);

            if (record[key] != undefined){
               field.Record.value=record[key];
               field.Record.formattedValue=field.format(field.Record.value.toString());
            }else{
               field.Record.value=null;
               field.Record.formattedValue=null;
            }
            if (action)
                action(field);
        }
    };
    // atualiza no form
    edit(record){ this.populate(record, field=>{field.edit()})}

    toQueryString(action){
        return "?"+jQuery.param(this.filled(action));
    };

    orderBy(key){ // forma semantica de criar o Sort
       if (!this.sort)
          this.sort = new Sort(key, this.Items)
    //    else
    //       this.sort.init(key)
        return this.sort;
    }

    execute (action){
        for(let key in this.Items){
           let field = this.Items[key];
           action(field,key);
        }
    };

    show (){this.execute((field, key)=>{console.log(key); console.log(input);});};
};

Fieldset.make=function(key){ // Método estático para criar um fieldset a partir
  let rcd = dataExt.format.record(key);
  let fieldset = {};
  // fieldset['id'+key.toFirstUpper()]=TYPE.INTEGER(4,{label:'Código', readOnly:true});
  // fieldset['tx'+key.toFirstUpper()]=TYPE.CHAR(30,{label:key.toFirstUpper(), mandatory:true});
  fieldset[rcd.id]=TYPE.INTEGER(4,{label:'Código', readOnly:true});
  fieldset[rcd.text]=TYPE.CHAR(30,{label:key.toFirstUpper(), mandatory:true});
  return fieldset;
}

j$.ui.frame=function(){
   let me = this;
   let items={};
   function slidebox(properties){
        let self = this;
        Object.preset(properties, {container:i$('content'), style:'slidebox_show'});
        properties.id =j$.util.getId(properties.style, properties.id);
        Object.preset(self, properties);
        let create=function(){
            let idFieldset =properties.id + "_slidebox";
            self.container.insert("<fieldset id='" +idFieldset+ "'>"
                        +"<legend class='slidebox_legend' id='" +self.id+ "_slidebox_legend'>"
                        +"<span title='Esconder' onclick='j$.ui.frame.toggle(\""+self.id+"\")' class='showbox' id='" +self.id+ "_button'></span>"
                        + self.legend+"</legend>"
                        + "<div id='" +self.id+ "'></div>"
                        +"</fieldset>");
            self.source = i$(idFieldset);
            self.source.stylize(self.style);
            self.target = i$(self.id);
            self.legend = i$(self.id+ "_slidebox_legend");
            self.button = i$(self.id+ "_button");
        }();
        items[self.id]=self;
        Object.preset(self,{toggle:()=>{j$.ui.frame.toggle(self.id)}
                          , show  :()=>{j$.ui.frame.show(self.id)}});
        self.hide=()=>{j$.ui.frame.hide(self.id)};
        if (properties.hide){self.hide();}
        return self;
   }
   function framebox(properties){
        let self = this;
        Object.preset(properties, {container:i$('content'), style:'wrap_framebox'});
        properties.id =j$.util.getId(properties.style, properties.id);
        Object.preset(self, properties);
        let create=function(){
            let idFieldset =properties.id + "_framebox";
            self.container.insert("<div id='" +idFieldset+ "'>"
                        +"<div class='wrap_framebox_legend' id='" +self.id+ "_framebox_legend'>"
                        +"<span title='Esconder' onclick='j$.ui.frame.toggle(\""+self.id+"\")' class='showbox' id='" +self.id+ "_button'></span>"
                        + self.legend+"</div>"
                        + "<div class='wrap_box' id='" +self.id+ "'></div>"
                        +"</div>");
            self.source = i$(idFieldset);
            self.source.stylize(self.style);
            self.target = i$(self.id);
            self.legend = i$(self.id+ "_framebox_legend");
            self.button = i$(self.id+ "_button");
        }();
        items[self.id]=self;
        Object.preset(self,{toggle:()=>{j$.ui.frame.toggle(self.id)}
                          , show  :()=>{j$.ui.frame.show(self.id)}});
        self.hide=()=>{j$.ui.frame.hide(self.id)};
        if (properties.hide){self.hide();}
        return self;
   }
   function dropbox(properties){
        let self = this;
        Object.preset(properties, {container:i$('content'), style:'wrap_dropbox'});
        properties.id =j$.util.getId(properties.style, properties.id);
        Object.preset(self, properties);
        let create=function(){
            let idFieldset =properties.id + "_dropbox";
            self.container.insert("<div id='" +idFieldset+ "'>"
                        +"<div class='wrap_dropbox_legend' id='" +self.id+ "_dropbox_legend'>"
                        +"<span title='Esconder' onclick='j$.ui.frame.toggle(\""+self.id+"\")' class='showbox' id='" +self.id+ "_button'></span>"
                        + self.legend+"</div>"
                        + "<div class='wrap_target_dropbox' id='" +self.id+ "'></div>"
                        +"</div>");
            self.source = i$(idFieldset);
            self.source.stylize(self.style);
            self.target = i$(self.id);
            self.target.stylize(self.targetStyle);
            self.legend = i$(self.id+ "_dropbox_legend");
            self.legend.stylize(self.legendStyle);
            self.button = i$(self.id+ "_button");
        }();
        items[self.id]=self;
        Object.preset(self,{toggle:()=>{j$.ui.frame.toggle(self.id)}
                          , show  :()=>{j$.ui.frame.show(self.id)}});
        self.hide=()=>{j$.ui.frame.hide(self.id)};
        if (properties.hide){self.hide();}

        return self;
   }
   let toggle=function(id){
        let frame = this.items[id];
        if (frame.button.className == "showbox"){
            this.hide(id);
        } else {
            this.show(id);
        }
   };
   let hide=function(id){
       let frame = this.items[id];
           frame.button.className =  "hidebox";
           frame.button.title = "esconder";
           if (frame.constructor.name=='slidebox')
              frame.source.className = "slidebox_hide";
           frame.target.hide();
   };
   let show=function(id){
       let frame = this.items[id];
           frame.button.className =  "showbox";
           frame.button.title = "Exibir";
           if (frame.constructor.name=='slidebox')
              frame.source.className = "slidebox_show";

           frame.target.show();
   };
   return{
       // properties={container:'', id:'', style:'', legend:''}
       slidebox:function(properties){return new slidebox(properties);}
     , framebox:function(properties){return new framebox(properties);}
     , dropbox:function(properties){return new dropbox(properties);}
     , toggle:toggle
     , show:show
     , hide:hide
     , items:items
   };
}();

TYPE.HANDLE = {
    focus: e=>{
        this.className = CONFIG.INPUT.CLASS.FOCUS;
    }
  , info: (obj,event, id)=>{
        let field = i$(id).field;
        System.Hint.show(field.hint,obj,event,"hint hint-info");
    }
  , error: (obj,event, id)=>{
        let field = i$(id).field;
        System.Hint.show(field.Error.get(),obj,event,"hint hint-error");
    }
  , lostFocus: (e, validate)=>{
       let inputField = Event.element(e);
       let valid=true;
       let value = (inputField.field!=undefined)?inputField.field.value():inputField.value;
       if (validate)
           valid=validate(value);
       inputField.className = (valid)?CONFIG.INPUT.CLASS.DEFAULT:CONFIG.INPUT.CLASS.ERROR;
       if (inputField.field.Resource)
           inputField.field.Legend.request();
    }
  , autotab:(obj,len)=>{
        let autotab = false;
        let nextObj = null;
        if (len==0 || typeof len=="undefined"){
           len = obj.getAttribute('maxlength');
           if (len==0 || typeof len=="undefined"){
              return autotab;
           }
        }
	if (obj.value.length == len || len==0) {
		let form = obj.form;
		let i = TYPE.HELPER.getElementIndex(obj);
		let j=i+1;                              /* ==> pega index do pr�ximo elemento */
		if (j >= form.elements.length) {j=0;} /* ==> se for o �ltimo posiciona no primeiro */
		if (i == -1) {return autotab;}
		while (j != i) {                        /* ==> procura o proximo elemento que pode receber foco */
		    nextObj = form.elements[j];
			if ((nextObj.type!="hidden") && (nextObj.id != obj.id) && (!nextObj.disabled)) {
			    nextObj.focus();
                            autotab=true;
			    break;
			}
			j++;
			if (j >= form.elements.length) {j=0;}
		}
	}
        return autotab;
    }
};
