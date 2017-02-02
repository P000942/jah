/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
j$.ui.type={};
var DATATYPE = {NUMBER:{parse:function(value){return parseFloat(value);}},
                  DATE:{parse:function(value){return new Date(value);}},
                  CHAR:{parse:function(value){return value;}},
               BOOLEAN:{parse:function(value){return value;}},
                  LIST:{parse:function(value){return value;}}
               };

j$.ui.Render= function(){
      return {
          attributes:function(attributes, exception){
                //formata outros atributos de html do formulárioa para renderizar
                var result = ' ';
                var ignore=function(att){
                    var go=false;
                    if (['key','caption','icon'].indexOf(att)>-1){
                       go= true;
                    } else if (exception){
                        if ((dataExt.isString(exception) && exception===att)
                        || (dataExt.isArray(exception) && exception.has(att)))
                            go= true;
                    }
                    return go;
                };
                for (var attribute in attributes){
                    var att = attribute.replace(/[$]/g,'s');
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
         , wrap:function(wrap, id, clas$){
              var id = j$.util.getId(clas$, id);
              if (!i$(id))
                 wrap.insert("<div id='" +id+ "' class='" +clas$+ "'></div>");
              return i$(id);
          }
        , label: function(wrap, label, inputId, clas$, mandatory){
             var att={id:(inputId)?inputId+ 'Label':j$.util.getId('Label')
                   , for:(inputId)? inputId:null
                   , clas$:(clas$)?clas$:'input_label'
               };
               label =(label)?label : att.id;
             if (!i$(att.id)){
                 var required =(mandatory) ?'<span class="required">*</span>' :'';
                 wrap.insert("<label " +j$.ui.Render.attributes(att,'label')+ "'>" +label+required+ ":</label>");
             }
             return i$(att.id);
        }
        , input:function(wrap, id, inputType, maxlength, attributes){
              if (!i$(id)){
                 var size =(maxlength)?" size='" +maxlength+ "'":"";
                 var type = (inputType)?inputType:'text';
                 if (type==='select')
                    wrap.insert("<"+type+ " id='" +id+ "' name='" +id+ "' " +j$.ui.Render.attributes(attributes)+ " ></" +type+ ">");
                 else
                    wrap.insert("<input type='" +type+ "' id='" +id+ "' name='"+id+"'" +size+ " "+j$.ui.Render.attributes(attributes)+ " >");
              }
              return i$(id);
          }

        , hint:function(parent, id, method){
                 parent.insert({after:"<span id='" +id+ "'></span>"});
                 $('#'+id).mouseover(method);
                 return i$(id);
         }
         , wrapperUl:function(wrap, id, wrapStyle){
               var wrapId =j$.util.getId(wrapStyle, id);
               $(wrap).append("<div class='wrapperUl' id='" +wrapId+ "_wrap'></div>");
               $("#"+wrapId+"_wrap").append('<ul class="' +wrapStyle+ '" id="' +wrapId+'"></ul>');
               return i$(wrapId);
           }
         , li:function(wrap, properties){
             wrap.insert('<li><a ' +j$.ui.Render.attributes({id:properties.id, onclick:properties.onclick})+' >' +properties.caption+ '</a></li>');
             return i$(properties.id);
         }
         , line:function(section, id, wrapStyle, title){
               var wrapId =j$.util.getId(wrapStyle, id);
               var legend="";
               if (title!=undefined){
                  if (dataExt.isString(title))
                     legend ="<legend class='" +wrapStyle+ "_legend' id='" +wrapId+ "_legend'>"+ title+"</legend>";
                  else
                     legend ="<legend class='" +wrapStyle+ "_legend' id='" +wrapId+ "_legend'>"+ title.text+"</legend>";
               }
               section.insert("<fieldset class='" +wrapStyle+ "' id='" +wrapId +"'>"+legend+"</fieldset>");
               if (i$(wrapId+ "_legend")!=undefined && title.style!=undefined)
                   i$(wrapId+ "_legend").stylize(title.style);
               return i$(wrapId);
           }
         , button:function(wrap, properties){
             if (!properties.submenu)
                 wrap.insert(j$.ui.Render.formatButton(properties));
             else
                 wrap.insert(j$.ui.Render.formatButtonDropdown(properties));
             return i$(properties.id);
         }
         , formatButton:function(properties){
             return '<a' +j$.ui.Render.attributes(properties,['value', 'element'])+ '>'+j$.ui.Render.icon(properties)+properties.value+'</a>';
         }
         , formatButtonDropdown:function(properties){
             return '<div id="' +properties.id+ '"  class="btn-group">'
                   +'<a' +j$.ui.Render.attributes(properties,['value','onclick','submenu','id'])+ '>'+j$.ui.Render.icon(properties)+'</a>'
                   +'<button class="btn dropdown-toggle" data-toggle="dropdown"><span class="caret"></span></button>'
                   +'<ul id="'+properties.id+'Menu" class="dropdown-menu">'
                   +'</ul></div>';
         }
         , icon:function(properties){
             var iconClass;
             var key = properties;
             if (dataExt.isString(properties))
                iconClass = CONFIG.icon(key);
             else if(dataExt.isObject(properties)){
                key = (properties.key)?properties.key:'';
                iconClass =(properties.icon) ?properties.icon :CONFIG.icon(key)
             }
             if (iconClass){
                var color = CONFIG.color(key);
                var txColor=(color)?' style="color:' +color+ ';" '  :'';
                return '<i class="' +iconClass+ '"' +txColor+ '></i>';
             }else
                return '';
         }
         , alert:function(wrap, msg, clas$){
             clas$ = (clas$)? "class='alert " +clas$+ "'": "class='alert'";
             var html= '<div '+clas$+ '>'
                     + '<button type="button" class="close" data-dismiss="alert">×</button>'
                     + msg +    '</div>';
             wrap.insert(html);
         }
      };
}();

j$.ui.type.HintIcon= function(parent, id, hint, text){
       var SELF = this;
       var element;
       hint = (hint)?hint:CONFIG.ACTION.INFO.KEY;
       Object.preset(SELF, CONFIG.hint(hint));
       var id = j$.util.getId( (parent.id)?parent.id:'HintIcon', id);
       Object.preset(this, {
              on:function(msg){
                  if (msg)
                      SELF.text=msg;
                  if (!i$(id))
                     element=j$.ui.Render.hint(parent, id, SELF.show);
                  element.className = SELF.class;
              }
            , set:function(msg){SELF.text=msg; }
            , get:function(){return SELF.text;}
            , reset:function(){SELF.text='';}
            , off:function(){if(i$(id)) $('#'+id).remove(); }
            , hide:function(){System.Hint.hide(SELF.Element);  }
            , class: 'ikon-hint ' + SELF.icon
            , text: (text && dataExt.isString(text))?text:''
        });
        this.show=function(event, msg){
             if (msg)
                 SELF.text=msg;
                 System.Hint.show(SELF.text, element, event, "hint " + SELF.hint);
             }
        if (!SELF.text.isEmpty()){
           SELF.on()
        }
};

j$.ui.Alert= function(){
    var $alert = this;
    this.wrap = CONFIG.LAYOUT.ALERT_CONTENT;
    return {
       show:function(wrap, msg, alertClass){
           if (!wrap) wrap=$alert.wrap;
           wrap.innerHTML='';
           if (dataExt.isString(msg))
               j$.ui.Render.alert(wrap, msg, alertClass);
           else if (dataExt.isArray(msg) && msg.length === 1){
               j$.ui.Render.alert(wrap, msg[0], alertClass);
           }else{
               var html='<lu>'
               msg.each(function(text){html+='<li>' +text +'</li>'});
               html+='</lu>'
               j$.ui.Render.alert(wrap, html , alertClass);
           }
       }
     ,   error:function(wrap, msg){j$.ui.Alert.show(wrap, msg, CONFIG.ALERT.ERROR.CLASS)}
     ,    info:function(wrap, msg){j$.ui.Alert.show(wrap, msg, CONFIG.ALERT.INFO.CLASS)}
     , success:function(wrap, msg){j$.ui.Alert.show(wrap, msg, CONFIG.ALERT.SUCCESS.CLASS)}
     , hide:function(wrap){
         if (!wrap) wrap=$alert.wrap;
             wrap.innerHTML='';
     }
   }
}();

var TYPE = function() {
    return {
        SLIDEBOX: function(properties){return new j$.ui.frame.slidebox(properties);}
   ,    FRAMEBOX: function(properties){return new j$.ui.frame.framebox(properties);}
   ,     DROPBOX: function(properties){return new j$.ui.frame.dropbox(properties);}
   ,       DIGIT: function(properties){return new j$.ui.type.Digit(properties);}
   ,     BOOLEAN: function(properties){return new j$.ui.type.Boolean(properties);}
   ,      LETTER: function(size,properties){return new j$.ui.type.Letter(size,properties);}
   ,   LOWERCASE: function(size,properties){return new j$.ui.type.LowerCase(size,properties);}
   ,   UPPERCASE: function(size,properties){return new j$.ui.type.UpperCase(size,properties);}
   ,        CHAR: function(size,properties){return new j$.ui.type.Char(size,properties);}
   ,    PASSWORD: function(size,properties){return new j$.ui.type.Password(size,properties);}
   ,     INTEGER: function(size,properties){return new j$.ui.type.Integer(size,properties);}
   ,     NUMERIC: function(size,decimal,properties){return new j$.ui.type.Numeric(size,decimal,properties);}
   ,        MASK: function(mask,properties){return new j$.ui.type.Mask(mask,properties);}
   ,        LIST: function(properties){return new j$.ui.type.List(properties);}
   ,   TYPEAHEAD: function(properties){return new j$.ui.type.Typeahead(properties);}
   ,       MONEY: function(size,properties){return new j$.ui.type.Money(size,properties);}
   ,       EMAIL: function(size,properties){return new j$.ui.type.Email(size,properties);}
   ,        DATE: function(properties){return new j$.ui.type.Date(properties);}
   ,        HOUR: function(size,properties){return new j$.ui.type.Hour(size,properties);}
   ,       PHONE: function(size,properties){return new j$.ui.type.Phone(size,properties);}
   ,         CPF: function(properties){return new j$.ui.type.Cpf(properties);}
   ,        CNPJ: function(properties){return new j$.ui.type.Cnpj(properties);}
   ,         CCA: function(properties){return new j$.ui.type.Cca(properties);}
   ,         CEP: function(properties){return new j$.ui.type.Cep(properties);}
   ,       Placa: function(properties){return new j$.ui.type.Placa(properties);}
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
	var form = obj.form;
	for (var i=0; i<form.elements.length; i++) {
		if (obj.id == form.elements[i].id) {
			return i;
			}
		}
	return -1;
    },
    getLabel: function (inputField){
        var labelField = {label:'', mandatory:false};
        var lbl="";
        if(inputField.parentNode){
          if(inputField.parentNode.tagName=='label'){
            lbl=inputField.parentNode.innerHTML;
          }
        }
        var labels=document.getElementsByTagName("label"),i;
        for( i=0; i<labels.length;i++ ){
           if(labels[i].htmlFor==inputField.id){
              lbl=labels[i].innerHTML;
           }
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
};

superMask=function(mask){
    var SELF=this;
    Object.preset(SELF,{format:null, prompt:null, strip:null, mask:null, size:1, TCMask:null});
    var initialized = function(){
        if (mask){
            Object.setIfExist(SELF,mask,['strip','empty']);
            if (mask.format){
                SELF.TCMask = 'TCMask['+ mask.format +']';
                SELF.format = mask.format;
                var vMask = mask.format.split(CONFIG.MASK.FieldDataSeparator);
                SELF.mask = vMask[0];
                SELF.prompt = (vMask.length>1) ? vMask[1] : null;
                SELF.size = SELF.mask.length;
            }
        }
    }();
    this.format = function(value){
        return (SELF.mask)?value.mask(SELF.mask) :value;
    };
    this.unformat = function(value){
        var vl = (SELF.strip) ?value.stripChar(SELF.strip) :value.trim();
        var vl = vl.stripChar("_"); // Remover o caracter de prompt
        if (SELF.empty && vl==SELF.empty)
           vl =''
        return vl;
    };
    this.render = function(inputField){
         if (SELF.TCMask){
             inputField.addClassName(SELF.TCMask);
             Typecast.Format(inputField);
         }
    }
}
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

function superType(Type, Properties) {
   var SELF=this;
   Object.preset(SELF,{align:ALIGN.LEFT, mandatory:false, autotab:false, label:'', hint:null, persist:true, defaultValue:'', type:'text'
                     ,id:'', key:null, list:null, readOnly:false, binded:false, order:ORDER.NONE, disabled:false, filter:false
                     ,inputField:false, dataType:DATATYPE.NUMBER, size:null, maxlength:0, validator:null, mask:null
                     ,Header:{clas$:null, id:null}, Report:{}, Record:{value:'', formattedValue:''}, attributes:null});
/*   this.id  - Eh o identificador no form.
   this.key - eh como estah definido no dataset (column)
*/
   defineProperties(Type, Properties);

   this.Label= function(){
       return {
              create:function(wrap, id,  key, design){
                   if (SELF.label.isEmpty())
                       SELF.label=(key) ?key :id;
                   var wrapInput = j$.ui.Render.wrap(wrap,id+'_wrapLabel','wrap_label');

                   j$.ui.Render.label(wrapInput, SELF.label, id, 'input_label' ,SELF.mandatory)
                   wrapInput.stylize(design.labelStyle);
              }
      };
   }();
   this.Legend= function(){
       //var element=null;
       var id;
       return {
              init:function(){ id = SELF.id +'_legend'; }
            , hide:function(){if(i$(id)) $('#'+id).remove();}
            , show:function(text){
                 if(!i$(id))
                    $(SELF.inputField.parentElement).append("<span class='" +CONFIG.LEGEND.CLASS+ "' id='" +id+ "'>"+text+"</span>");
            }
            , set:function(response){
                  SELF.Legend.hide();
                  var text='';
                  if (SELF.Resource){
                      var record = SELF.Resource.handleResponse(response);
                      if (record){
                          if (record[SELF.Resource.text]!=undefined){
                              text = record[SELF.Resource.text];
                              SELF.Legend.show(text)
                          }
                      }
                      if (text.isEmpty()){
                         SELF.Error.set(ERROR.MESSAGE.InvalidItem);
                         ERROR.show(SELF.Error.get(),SELF);
                      }else{
                         ERROR.off(SELF);
                      }
                  } else if (response && dataExt.isString(response) && !response.isEmpty())
                     SELF.Legend.show(response);
              }
            , request:function(value){
                   SELF.Legend.hide();
                   value = (value)?value:SELF.value();
                   if (SELF.Resource && !value.isEmpty()){
                       if (SELF.type==='text')
                          // SELF.Resource.Requester.get(SELF.Resource.url, value);
                           SELF.Resource.Requester.get(value);
                   }
            }
      };
   }();

   //response para o resource
   this.get=function(response){
       SELF.Legend.set(response);
   };
   this.edit= function(value){
       if (value == undefined)
           value = SELF.Record.value;
        i$(SELF.id).content(value);
        i$(SELF.id).className = CONFIG.INPUT.CLASS.DEFAULT; //"input_text";
   };
   this.format= function(p_value) {
        return  (SELF.mask) ?SELF.mask.format(p_value) :SELF.value(p_value);
   };
   this.identify=function (wrap, id, key, design){
       SELF.id =j$.util.getId(SELF.type, id);
       SELF.key =(key)?key : SELF.id;
       if (!design) design={};
       SELF.design = design;
       SELF.Label.create(wrap, SELF.id, key, SELF.design);
   }
   this.create= function(wrap, id, key, design) {
       SELF.identify(wrap, id, key, design);
       var wrapInput = j$.ui.Render.wrap(wrap,SELF.id+'_wrapInput','wrap_input');
       j$.ui.Render.input(wrapInput, SELF.id, SELF.type, SELF.maxlength, SELF.attributes);
       wrapInput.stylize(SELF.design.inputStyle);
       SELF.bind(i$(SELF.id));
   };
   this.text =function(p_value){return SELF.value(p_value);}; // Se tem um texto associado ou uma lista (pode ser usado para um AJAX)
   this.value =function(p_value){ // Retorna o valor sem m�scara (caso haja)
          var value;
          if (p_value)
              value=p_value;
          else{
              if (SELF.inputField)
                  value = SELF.inputField.value;
          }
          if (SELF.mask){value = SELF.mask.unformat(value);}
          return value.trim();
   };
   this.validate= function(p_value){
        var value = SELF.value(p_value);
        var valid=SELF.isValid(value);
        if (!valid && ERROR){
            SELF.Error.set((value.isEmpty()?ERROR.MESSAGE.Mandatory:SELF.validator.error));
            ERROR.show(SELF.Error.get(),SELF);
        }else{
            ERROR.off(SELF);
        }
        SELF.inputField.className = (valid)?CONFIG.INPUT.CLASS.DEFAULT:CONFIG.INPUT.CLASS.ERROR;
        return valid;
   };
   this.isValid= function(p_value){
        var value = SELF.value(p_value);
        var valid=true;
        if (!value.isEmpty()){ // se tem valor, assume o memso como verdadeiro
           if (SELF.validator.handler) // se tem handle, v�lida
              valid=SELF.validator.handler(value);
        }else
            valid=SELF.mandatory?false:true;
        return valid;
   };

   this.reset= function(){
      ERROR.off(SELF);
           if (!SELF.defaultValue.isEmpty())
              i$(SELF.id).value=SELF.defaultValue;
           i$(SELF.id).className = CONFIG.INPUT.CLASS.DEFAULT;
   };

   this.bind = function(inputField){
       SELF.binded=true;
       SELF.inputField=inputField;
       SELF.inputField.bind(SELF);
       SELF.id =inputField.id;
       if (!SELF.key)
           SELF.key =SELF.id;
       var hint = "";

       SELF.Error = new j$.ui.type.HintIcon(inputField, inputField.id+'_error', CONFIG.ACTION.ERROR.KEY);
       if (SELF.hint)
          SELF.Hint = new j$.ui.type.HintIcon(inputField, inputField.id+'_info', CONFIG.ACTION.INFO.KEY, SELF.hint);

       var labelField = TYPE.HELPER.getLabel(inputField);
       if (SELF.label.isEmpty()){
           SELF.label=inputField.id;
           if (!labelField.label.isEmpty())
               SELF.label=labelField.label;
       }
       if (!SELF.mandatory)
           SELF.mandatory = labelField.mandatory;

       if (SELF.validator)
           Event.observe(inputField, 'blur',  function(e){TYPE.HANDLE.lostFocus(e,SELF.validate);});
       else
           Event.observe(inputField, 'blur',  TYPE.HANDLE.lostFocus);

       switch(SELF.type){
        case 'text':
           SELF.Legend.init();
           if (SELF.autotab)
               Event.observe(inputField, 'keyup', function(){TYPE.HANDLE.autotab(inputField,SELF.maxlength);});

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

       inputField.readOnly = SELF.readOnly;
       inputField.disabled = SELF.disabled;
       inputField.defaultValue=SELF.defaultValue;
       inputField.className = inputField.className + " " + CONFIG.INPUT.CLASS.DEFAULT;

       Event.observe(inputField, 'focus', TYPE.HANDLE.focus, false);
   };
    this.sortAsc = function(currentRow, nextRow){
        //SELF.order = ORDER.ASCENDING;
        var currentVal = SELF.dataType.parse(currentRow[SELF.key]);
        var nextVal = SELF.dataType.parse(nextRow[SELF.key]);
        var r = 0;
        if (currentVal < nextVal)
            r = -1;
        else if (currentVal > nextVal)
            r = 1;
        return r;
    };
    this.sortDesc = function(currentRow, nextRow){
        //SELF.order = ORDER.DESCENDING;
        var currentVal = SELF.dataType.parse(currentRow[SELF.key]);
        var nextVal = SELF.dataType.parse(nextRow[SELF.key]);
        var r = 0;
        if (currentVal > nextVal)
            r = -1;
        else if (currentVal < nextVal)
            r = 1;
        return r;
    };
    this.sortOrder=function(order){
        // Quando indicar que não há classificação, passa order=ORDER.NONE
        if (!order){
           if (SELF.order == ORDER.NONE || SELF.order == ORDER.DESCENDING)
               order = ORDER.ASCENDING;
           else
               order = ORDER.DESCENDING;
        }
        SELF.order = order;
        SELF.Header.clas$ = ORDER.CLASS(order);
        if (order != ORDER.NONE){
           return (order == ORDER.DESCENDING) ? SELF.sortDesc : SELF.sortAsc;
        }else{
           return null;
        }
    };
    this.doFilter=function(){
        SELF.Header.clas$ = FILTER.CLASS(SELF.filter);
    };
    // Ver DATATYPE - � fazer um parse para um valor correto.
    function parseValue(value){
        SELF.dataType.parse(value);
    }
   function defineProperties(Type, Properties) {
        //var properties={autotab:false, label:'', mandatory:false, locked:false, defaultValue:'', align:ALIGN.LEFT, size:null, validator:null, mask:null}
        var mask = null;
        // Primeiro verifica o que vem do no Type, que são o valores que já vem por padrão
        if (Type){
            Object.setIfExist(SELF, Type, ['align','size','validator','mask','autotab','type','label','dataType','list','attributes']);
            if (Type.mask)
                mask=Type.mask;
        }
        // Depois verifica o que vem em Porperties, que é o que vem do usuário;
        if (Properties){
            Object.setIfExist(SELF, Properties,
                             ['evaluate','autotab', 'label','mandatory', 'align', 'readOnly', 'disabled', 'defaultValue', 'type', 'dataType', 'list', 'hint','attributes']);
            if (Properties.resource){
                // SELF.AdapterResource = j$.Resource.ResponseHandler;  // Quando tiver RESOURCE
                // SELF.AdapterResource(Properties, SELF);
                 SELF.Resource =  j$.Resource.create(Properties.resource, SELF);
            }
        }
        SELF.mask = new superMask(mask);
        if (!SELF.size)
            SELF.size = SELF.mask.size;

        SELF.maxlength = (SELF.size>SELF.mask.size)?SELF.size:SELF.mask.size;
    }
}

j$.ui.type.Digit=function(Properties) {
   this.inherit = superType;
   this.inherit({size:1, align:ALIGN.RIGHT, validator:{handler:function(value){return value.isDigit();}, error:ERROR.MESSAGE.Digit}, mask:{format:'#|_', strip:'_'}}, Properties);
}

j$.ui.type.Numeric=function(size,decimal, Properties){
   this.inherit = superType;
   var mask = '#'.repeat(size);
   var _size = size;
   if (decimal){
      mask += ','+'#'.repeat(decimal);
      //mask += '|'+'_'.repeat(size)+','+'_'.repeat(decimal);
      _size = size+decimal+1;
   }
   this.inherit({size:_size, align:ALIGN.RIGHT, validator:{handler:function(value){return value.isNumeric();}, error:ERROR.MESSAGE.Numeric}, mask:{format:mask}}, Properties);
}
j$.ui.type.Integer=function(size, Properties){
   this.inherit = superType;
   this.inherit({size:size, align:ALIGN.RIGHT, validator:{handler:function(value){return value.isInteger();}, error:ERROR.MESSAGE.Integer}, mask:{format:'#'.repeat(size)}}, Properties);
}

j$.ui.type.Money=function(size, Properties){
   this.inherit = superType;
   var mask = '9'.repeat(size-3)+'0,'+'00';
   this.inherit({size:size+1, align:ALIGN.RIGHT, validator:{handler:function(value){return value.isNumeric();}, error:ERROR.MESSAGE.Money}, mask:{format:mask, empty:','}}, Properties);
   this.format= function(value) {return dataExt.format.money(value); };
}

j$.ui.type.Letter=function(size, Properties){
   this.inherit = superType;
   this.inherit({size:size, dataType:DATATYPE.CHAR, validator:{handler:function(value){return value.isLetter();}, error:ERROR.MESSAGE.Letter}, mask:{format:'@'.repeat(size)}}, Properties);
}
j$.ui.type.UpperCase=function(size, Properties){
   this.inherit = superType;
   this.inherit({size:size, dataType:DATATYPE.CHAR, validator:{handler:function(value){return value.isLetter();}, error:ERROR.MESSAGE.Letter}, mask:{format:'A'.repeat(size)}}, Properties);
}
j$.ui.type.LowerCase=function(size, Properties){
   this.inherit = superType;
   this.inherit({size:size, dataType:DATATYPE.CHAR, validator:{handler:function(value){return value.isLetter();}, error:ERROR.MESSAGE.Letter}, mask:{format:'a'.repeat(size)}}, Properties);
}

j$.ui.type.Date=function(Properties){
   this.inherit = superType;
   this.inherit({size:10, dataType:DATATYPE.DATE, validator:{handler:function(value){return value.isDate();}, error:ERROR.MESSAGE.Date}, mask:{format:'00/00/0000|__/__/____', strip:'_', empty:'//'}}, Properties);
}

j$.ui.type.Hour=function(Properties){
   this.inherit = superType;
   this.inherit({size:4, validator:{handler:function(value){return value.isHour();}, error:ERROR.MESSAGE.Hour}, mask:{format:'00:00|__:__',empty:':'}}, Properties);
}

j$.ui.type.Phone=function(Properties){
   this.inherit = superType;
   this.inherit({size:11, validator:{handler:function(value){withoutMask=true;return value.isPhone(withoutMask);}, error:ERROR.MESSAGE.Phone}, mask:{format:'(000)0000-0000|(___)____-____', strip:'()-'}}, Properties);
}

j$.ui.type.Email=function(size, Properties){
   this.inherit = superType;
   this.inherit({size:size, dataType:DATATYPE.CHAR, validator:{handler:function(value){return value.isEmail();}, error:ERROR.MESSAGE.Email}}, Properties);
}

j$.ui.type.Char=function(size, Properties){
   this.inherit = superType;
   this.inherit({size:size, dataType:DATATYPE.CHAR, validator:{error:ERROR.MESSAGE.Char}}, Properties);
}
j$.ui.type.Password=function(size, Properties){
   this.inherit = superType;
   this.inherit({size:size, type:'password', dataType:DATATYPE.CHAR, validator:{error:ERROR.MESSAGE.Password}}, Properties);
}

j$.ui.type.Cpf=function(Properties){
   this.inherit = superType;
   this.inherit({size:11, validator:{handler:function(value){return value.ehCpf();}, error:ERROR.MESSAGE.Cpf}, mask:{format:'000.000.000-00|___.___.___-__', strip:'.-'}}, Properties);
}

j$.ui.type.Cnpj=function(Properties){
   this.inherit = superType;
   this.inherit({size:14, validator:{handler:function(value){return value.ehCnpj();}, error:ERROR.MESSAGE.Cnpj}, mask:{format:'00.000.000/0000-00|__.___.___/____-__', strip:'-/.'}}, Properties);
}

j$.ui.type.Cca=function(Properties){
   this.inherit = superType;
   this.inherit({size:9, validator:{handler:function(value){return value.ehCca();}, error:ERROR.MESSAGE.Cca}, mask:{format:'00.000.000-0|__.___.___-_', strip:'.-'}}, Properties);
}

j$.ui.type.Placa=function(Properties){
   this.inherit = superType;
   this.inherit({size:7, dataType:DATATYPE.CHAR, validator:{handler:function(value){return value.ehPlaca();}, error:ERROR.MESSAGE.Placa}, mask:{format:'AAA-0000|___-____', strip:'.-'}}, Properties);
}

j$.ui.type.Cep=function(Properties){
   this.inherit = superType;
   this.inherit({size:8, validator:{handler:function(value){return value.ehCep();}, error:ERROR.MESSAGE.Cep}, mask:{format:'00000-000|_____-___', strip:'-'}}, Properties);
}

j$.ui.type.Mask=function(mask, Properties){
   var strip=mask.replace(/\w|[@]|[#]/g,""); // Pega somente caracteres especiais;
   var prompt='|'+mask.replace(/\w|[@]|[#]/g,"_"); //Montar prompt para entrada de dados;
   var dataType = (mask.replace(/\d|[#]/g,"").length>0)? DATATYPE.CHAR : DATATYPE.NUMBER;
   var validator = {handler:function(value){return value.isValidInMask(mask);},error: "campo preenchido com formato inválido"};
   this.inherit = superType;
   this.inherit({validator:validator, dataType:dataType, mask:{format:mask+prompt, strip:strip}}, Properties);
}

j$.ui.type.List=function(Properties){
   var SELF = this;
   var list = null;
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
        var value=SELF.value(p_value);
        var item = (list[value])?list[value]:"";
        return item;
   };
   this.format = this.text;
   this.size = maxlen(list);
   this.value = function(p_value){
          var value='';
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

   this.exists = function(value){
       return (list[value])?true:false;
   };

   this.popule=function($list){
       if ($list)
           list=$list;
       SELF.clear();
       for(key in list){
            var option=document.createElement("option");
            option.text = list[key];
            option.value = key;
            if (key==SELF.defaultValue)
                option.selected=true;
            i$(SELF.id).add(option,i$(SELF.id).options[null]);
       }
   };
   this.clear=function(){i$(SELF.id).innerHTML="";};
   this.add=function(record){
       console.log(record);
   };
   //response para o resource
   this.get=function(response){
        var listset = SELF.Resource.Parser.toListset(response);
        list = listset.list;
        this.size = listset.maxlength;
   };

   function maxlen(list){
        var max = 0;
        for(key in list){
           var item = list[key];
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
   var SELF = this;
   var list = CONFIG.BOOLEAN;
   if (Properties)
       if (Properties.list)
           list = Properties.list;
   var text = '';
   this.inherit = superType;
   this.inherit({type:'checkbox',  dataType:DATATYPE.BOOLEAN}, Properties);
   this.text = function(p_value){
          var value='';
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
   this.value = function(p_value){
          var value='';
          if (p_value != undefined)
              value=p_value;
          else{
              if (SELF.inputField){
                  value =SELF.inputField.checked;
              }
          }
          return SELF.local.value(value);
   }
   this.isValid= function(p_value){return true;};
   this.local= function(){
       return{
           item:function(value){
               if (typeof value == "string")
                   return list[value];
               else
                   return list[(value)?'true':'false'];
           },
           text:function(value){
                var item = SELF.local.item(value);
                return item.text;
           },
           value:function(value){
                var item = SELF.local.item(value);
                return item.value;
           },
           maxlen:function(){
               var max=0;
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

j$.ui.Fieldset = function(fields) {
    var SELF = this;
    this.Items=fields;
    this.length=0;
    init();

    function init(){
        for(var key in SELF.Items){
            SELF.Items[key].id=key;
            SELF.length++;
        }
    }
    this.item = function(key){
        try {
            if (SELF.Items[key]==undefined)
                throw CONFIG.EXCEPTION.INVALID_FIELD;
            else
                return SELF.Items[key];
        } catch(exception){
               if (exception==CONFIG.EXCEPTION.INVALID_FIELD)
                   console.log(exception.text +" '"+key+"'");
               return false;
        }
    }
    //this.get = SELF.item;
    // varre fieldset devolve um registro dos campos que estão preenchidos
    // útil para consultas
    this.filled = function(action){
        var record = {};
        for(var key in SELF.Items){
            var value = SELF.Items[key].value();
            var use = !value.toString().isEmpty();
            if (use && action)
                use = action(SELF.Items[key]);
            if (use)
                record[key]= value;
        }
        return record;
    };
     // varre as campos e devolve um registro com o conteúdo dos campos
    this.sweep = function(action){
        var record = {};
        for(var key in SELF.Items){
            var field = SELF.Items[key];
            if (field.persist)
               record[key]= field.value();
            if (action)
                action(field);
        }
        return record;
    };
    this.each = this.sweep;
    // recebe um registro e popula conteúdo dos campos
    this.populate = function(record, action){
        for(var key in SELF.Items){
            var field = SELF.Items[key];

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

    this.toQueryString = function(action){
        return "?"+jQuery.param(SELF.filled(action));
    };

    this.filterNone = function(id){
        for(key in SELF.Items){
            if (key != id){
               var field = SELF.Items[key];
               field.filter=FILTER.NONE;
               field.doFilter();
            }
        }
    };
    this.execute = function(action){
        for(key in SELF.Items){
           var field = this.Items[key];
           action(field,key);
        }
    };
    this.sortNone = function(id){
        for(key in SELF.Items){
            if (key != id){
               var field = SELF.Items[key];
               field.sortOrder(ORDER.NONE);
            }
        }
    };
    this.show = function(){SELF.execute(function(field, key){console.log(key); console.log(input);});};
};

j$.ui.Fieldset.make=function(key){ // Método estático para criar um fieldset a partir
  var rcd = dataExt.format.record(key);
  var fieldset = {};
  // fieldset['id'+key.toFirstUpper()]=TYPE.INTEGER(4,{label:'Código', readOnly:true});
  // fieldset['tx'+key.toFirstUpper()]=TYPE.CHAR(30,{label:key.toFirstUpper(), mandatory:true});
  fieldset[rcd.id]=TYPE.INTEGER(4,{label:'Código', readOnly:true});
  fieldset[rcd.text]=TYPE.CHAR(30,{label:key.toFirstUpper(), mandatory:true});
  return fieldset;
}

j$.ui.frame=function(){
   var items={};
   function slidebox(properties){
        var self = this;
        Object.preset(properties, {container:i$('content'), style:'slidebox_show'});
        properties.id =j$.util.getId(properties.style, properties.id);
        Object.preset(self, properties);
        var create=function(){
            var idFieldset =properties.id + "_slidebox";
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
        Object.preset(self,{toggle:function(){j$.ui.frame.toggle(self.id);}
                          , show  :function(){j$.ui.frame.show(self.id);}});
        self.hide=function(){j$.ui.frame.hide(self.id);};
        if (properties.hide){self.hide();}
        return self;
   }
   function framebox(properties){
        var self = this;
        Object.preset(properties, {container:i$('content'), style:'wrap_framebox'});
        properties.id =j$.util.getId(properties.style, properties.id);
        Object.preset(self, properties);
        var create=function(){
            var idFieldset =properties.id + "_framebox";
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
        Object.preset(self,{toggle:function(){j$.ui.frame.toggle(self.id);}
                          , show  :function(){j$.ui.frame.show(self.id);}});
        self.hide=function(){j$.ui.frame.hide(self.id);};
        if (properties.hide){self.hide();}
        return self;
   }
   function dropbox(properties){
        var self = this;
        Object.preset(properties, {container:i$('content'), style:'wrap_dropbox'});
        properties.id =j$.util.getId(properties.style, properties.id);
        Object.preset(self, properties);
        var create=function(){
            var idFieldset =properties.id + "_dropbox";
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
        Object.preset(self,{toggle:function(){j$.ui.frame.toggle(self.id);}
                          , show  :function(){j$.ui.frame.show(self.id);}});
        self.hide=function(){j$.ui.frame.hide(self.id);};
        if (properties.hide){self.hide();}

        return self;
   }
   var toggle=function(id){
        var frame = this.items[id];
        if (frame.button.className == "showbox"){
            this.hide(id);
        } else {
            this.show(id);
        }
   };
   var hide=function(id){
       var frame = this.items[id];
           frame.button.className =  "hidebox";
           frame.button.title = "esconder";
           if (frame.constructor.name=='slidebox')
              frame.source.className = "slidebox_hide";
           frame.target.hide();
   };
   var show=function(id){
       var frame = this.items[id];
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
    focus: function(e){
        this.className = CONFIG.INPUT.CLASS.FOCUS;
    }
  , info: function(obj,event, id){
        var field = i$(id).field;
        System.Hint.show(field.hint,obj,event,"hint hint-info");
    }
  , error: function(obj,event, id){
        var field = i$(id).field;
        System.Hint.show(field.Error.get(),obj,event,"hint hint-error");
    }
  , lostFocus: function(e, validate){
       var inputField = Event.element(e);
       var valid=true;
       var value = (inputField.field!=undefined)?inputField.field.value():inputField.value;
       if (validate)
           valid=validate(value);
       inputField.className = (valid)?CONFIG.INPUT.CLASS.DEFAULT:CONFIG.INPUT.CLASS.ERROR;
       if (inputField.field.Resource)
           inputField.field.Legend.request();
    }
  , autotab:function(obj,len){
        var autotab = false;
        var nextObj = null;
        if (len==0 || typeof len=="undefined"){
           len = obj.getAttribute('maxlength');
           if (len==0 || typeof len=="undefined"){
              return autotab;
           }
        }
	if (obj.value.length == len || len==0) {
		var form = obj.form;
		var i = TYPE.HELPER.getElementIndex(obj);
		var j=i+1;                              /* ==> pega index do pr�ximo elemento */
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
