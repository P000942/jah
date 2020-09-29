/* By Geraldo Gomes */
'use strict';

// import j$.Ext      from  "../api/dataExt.js"; 
// import {CONFIG, c$} from  "../config.js";
// import {CONFIG, c$} from  "../api/system.js";

const TYPE = function() {
    Element.prototype.bind = function(field) {
        this.field =field;
        if (!field.binded){
            field.bind(this);
        }
    };    
    const DATATYPE = {NUMBER:{parse:value=>{return parseFloat(value)}},
                        DATE:{parse:value=>{return new Date(value)}},
                        CHAR:{parse:value=>{return value}},
                     BOOLEAN:{parse:value=>{return value}},
                        LIST:{parse:value=>{return value}}
                    };                         
    let type = function(){         
        function superType(Type, Properties) {
            let SELF=this;
            Object.preset(SELF,{align:c$.ALIGN.LEFT, mandatory:false, autotab:false, label:''
                                , persist:true, defaultValue:'', type:'text'
                                , id:'', key:null, list:null, readOnly:false
                                , binded:false, order:c$.ORDER.NONE, disabled:false, onFilter:false
                                , inputField:false, dataType:DATATYPE.NUMBER, size:null
                                , maxlength:0, validator:null, maskAdapter:null
                                , Header:{clas$:null, id:null}
                                , Report:{}, Record:{value:'', formattedValue:''}, attributes:{}});
            /*   this.id  - Eh o identificador no form.
                this.key - eh como estah definido no dataset (column)
            */
            TYPE.Helper.setProperties(SELF,Type, Properties);
            
            this.edit= value=>{
                    if (value == undefined)
                        value = this.Record.value;
                    i$(this.id).content(value);
                    i$(this.id).className = SELF.classDefault  
            };
            this.format= p_value=> {
                    return  (this.maskAdapter) ?this.maskAdapter.format(p_value) :this.value(p_value);
            };
            this.identify= (wrap, id, key)=>{
                SELF.id =System.util.getId(SELF.type, id);
                SELF.key =(key)?key : SELF.id;
            }
            function parseDesign(design){
                if (!design){
                    design ={
                            input:{clas$: CONFIG.INPUT.CLASS.DEFAULT}
                        , column:{clas$: CONFIG.WRAP.CLASS.COLUMN}
                        ,  label:{clas$: CONFIG.LABEL.CLASS.DEFAULT}              
                    }     
                }
                if (SELF.type=='checkbox'){
                    design.input.clas$  = CONFIG.CHECK.CLASS.DEFAULT;
                    design.column.clas$ = CONFIG.CHECK.CLASS.COLUMN;
                    design.label.clas$ += " "+CONFIG.CHECK.CLASS.LABEL;
                }  
                return design;    
            }
            this.create= (wrap, id, key,  design) =>{              
                let wrapInput;
                SELF.identify(wrap, id, key);
                design = parseDesign(design);
                SELF.classDefault = design.input.clas$;
                if (design.labelInTheSameWrap){
                    wrapInput = j$.ui.Render.wrap(wrap,SELF.id+'_wrapInput',design.column.clas$, design.column.style);
                    TYPE.Helper.createLabel(SELF, wrapInput, design.label.clas$, design.label.style)          
                }else{   
                    TYPE.Helper.createLabel(SELF, wrap, design.label.clas$, design.label.style);
                    wrapInput = j$.ui.Render.wrap(wrap,SELF.id+'_wrapInput',design.column.clas$, design.column.style);
                }   
                    
                let input = j$.ui.Render.input(wrapInput, SELF.id, SELF.type, SELF.maxlength, SELF.attributes);
                if (SELF.onChangeHandle)
                    input.onchange = SELF.onChangeHandle;
                SELF.bind(input); 
            };
            this.text  =p_value=>{return SELF.value(p_value);}; // Se tem um texto associado ou uma lista (pode ser usado para um AJAX)
            this.value =p_value=>{ // Retorna o valor sem m�scara (caso haja)
                    let value;
                    if (p_value)
                        value=p_value;
                    else{
                        if (SELF.Input)
                            value = SELF.Input.value;
                    }
                    if (SELF.maskAdapter){value = SELF.maskAdapter.unformat(value)}
                    return value.trim();
            };
            this.validate= p_value=>{
                    let value=SELF.value(p_value)
                    , valid=SELF.isValid(value);
                    if (!valid && TYPE.Error)
                        TYPE.Error.passForward.invalid(SELF, SELF.validator.error);
                    else
                        TYPE.Error.passForward.valid(SELF,"");         
                    return valid;
            }
            this.isValid= p_value=>{
                    let value = SELF.value(p_value)
                    , valid=true;
                    if (!value.isEmpty()){ // se tem valor, assume o memso como verdadeiro
                    if (SELF.validator.handler) // se tem handle, v�lida
                        valid=SELF.validator.handler(value);
                    }else if (SELF.mandatory){
                        valid=false;
                        SELF.validator.error = TYPE.Error.MESSAGE.Mandatory;
                    }    
                    return valid;
            };
            
            this.reset= ()=>{
                    TYPE.Error.passForward.hide(SELF);
                    if (!SELF.defaultValue.isEmpty())
                        i$(SELF.id).value=SELF.defaultValue;
                    i$(SELF.id).className = SELF.classDefault; //CONFIG.INPUT.CLASS.DEFAULT;
            };
            
            this.bind = (_input)=>{TYPE.Helper.bindField(SELF,_input)}
            
            this.filterToggle=showFilter=>{
                    SELF.onFilter = (j$.Ext.isDefined(showFilter))
                                ?showFilter
                                :!SELF.onFilter
                    SELF.Header.clas$ = c$.FILTER.CLASS(SELF.onFilter);
                };
                // Ver DATATYPE - � fazer um parse para um valor correto.
            function parseValue(value){SELF.dataType.parse(value)}
        }
                        
        return {
            Digit:function(Properties) {
                this.inherit = superType;
                this.inherit({size:1, align:c$.ALIGN.RIGHT, validator:{handler:value=>{return value.isDigit();}, error:TYPE.Error.MESSAGE.Digit}, mask:['#','_']}, Properties);
            }
        , Numeric:function(size,decimal, Properties){
                this.inherit = superType;
                let mask = '#'.repeat(size)
                    , decimalChar=c$.MASK.DecimalCharacter
                    , _size = size;
                if (decimal){
                    mask += decimalChar+'#'.repeat(decimal);
                    //mask += '|'+'_'.repeat(size)+','+'_'.repeat(decimal);
                    _size = size+decimal+1;
                }
                this.inherit({size:_size, align:c$.ALIGN.RIGHT, validator:{handler:value=>{return value.isNumeric(decimal);}, error:TYPE.Error.MESSAGE.Numeric}
                            , mask:{format:mask+"|"+mask.replace(/#/g,"_"), strip:decimalChar, empty:decimalChar, align:c$.ALIGN.RIGHT}}, Properties);
            }
        , Integer:function(size, Properties){
                this.inherit = superType;
                this.inherit({size, align:c$.ALIGN.RIGHT, validator:{handler:value=>{return value.isInteger();}, error:TYPE.Error.MESSAGE.Integer}, mask:{format:'#'.repeat(size)}}, Properties);
            }
        ,   Money:function(size, Properties){
                this.inherit = superType;
                let decimalChar=c$.MASK.DecimalCharacter;
                let mask = '9'.repeat(size-3)+'0'+decimalChar+'00';
                this.inherit({size:size+1, align:c$.ALIGN.RIGHT, validator:{handler:value=>{return value.isDecimal(2);}, error:TYPE.Error.MESSAGE.Money}
                            , mask:{format:mask+"|"+mask.replace(/[0|9]/g,"_"), strip:decimalChar, empty:decimalChar, align:c$.ALIGN.RIGHT}}, Properties);
                this.format= value=> {return value.toMoney() };
            }
        ,    Char:function(size, Properties){
                this.inherit = superType;
                this.inherit({size:size, dataType:DATATYPE.CHAR, validator:{error:TYPE.Error.MESSAGE.Char}}, Properties);
            }
        ,  Letter:function(size, Properties){
                this.inherit = superType;
                this.inherit({size:size, dataType:DATATYPE.CHAR, validator:{handler:value=>{return value.isLetter();}, error:TYPE.Error.MESSAGE.Letter}, mask:{format:'@'.repeat(size)}}, Properties);
            }
        , UpperCase:function(size, Properties){
                this.inherit = superType;
                this.inherit({size:size, dataType:DATATYPE.CHAR, validator:{handler:value=>{return value.isLetter();}, error:TYPE.Error.MESSAGE.Letter}, mask:{format:'A'.repeat(size)}}, Properties);
            }
        , LowerCase:function(size, Properties){
                this.inherit = superType;
                this.inherit({size:size, dataType:DATATYPE.CHAR, validator:{handler:value=>{return value.isLetter();}, error:TYPE.Error.MESSAGE.Letter}, mask:{format:'a'.repeat(size)}}, Properties);
            }
        ,    Name:function(size, Properties){
                this.inherit = superType;
                this.inherit({size:size, dataType:DATATYPE.CHAR, validator:{handler:value=>{return value.isName();}, error:TYPE.Error.MESSAGE.Name}}, Properties);
            }
        ,   Email:function(size, Properties){
                this.inherit = superType;
                this.inherit({size:size, dataType:DATATYPE.CHAR, validator:{handler:value=>{return value.isEmail();}, error:TYPE.Error.MESSAGE.Email}}, Properties);
            }
        ,   Date:function(Properties){
                this.inherit = superType;
                this.inherit({size:10, dataType:DATATYPE.DATE, validator:{handler:value=>{return value.isDate();}, error:TYPE.Error.MESSAGE.Date}, mask:{format:'00/00/0000|__/__/____', strip:'_', empty:'//'}}, Properties);
            }
        ,  Date5:function(Properties){
                if (!Properties)
                    Properties={}
                Properties.type="date"; // para garantir que será usado o tipo date do html5
                this.inherit = superType;
                this.inherit({size:10, dataType:DATATYPE.DATE, validator:{handler:value=>{return value.isDate();}
                            , error:TYPE.Error.MESSAGE.Date}}, Properties);
                this.value = p_value=>{
                    let value;
                    if (p_value)
                        value=p_value;
                    else{
                        if (this.Input){
                            try{ // invert do padrao yyyy-mm-dd para ddmmyyyy
                            value = this.Input.value.split("-").reverse().join("")
                            } catch (e)  {
                            console.error("erro ao fazer parse do valor de type=date", e.message);
                            }
                        }
                    }
                    return value.trim();
                };
            }
        , DateTime:function(Properties){
                if (!Properties)
                    Properties={}
                Properties.type="datetime-local"; // para garantir que será usado o tipo date do html5
                this.inherit = superType;
                this.inherit({size:10, dataType:DATATYPE.DATE, validator:{handler:value=>{return value.isDateTime();}
                            , error:TYPE.Error.MESSAGE.Date}}, Properties);
                this.value = p_value=>{
                    let value;
                    if (p_value)
                        value=p_value;
                    else{
                        if (this.Input){
                            try{
                            value = this.Input.value.stripChar("-T:");
                            } catch (e)  {
                            console.error("erro ao fazer parse do valor de type=datetime-local", e.message);
                            }
                        }
                    }
                    return value.trim();
                };
            }
        ,   Color:function(Properties){
                if (!Properties)
                    Properties={}
                Properties.type="color"; // para garantir que será usado o tipo date do html5
                this.inherit = superType;
                this.inherit({size:10, dataType:DATATYPE.DATE
                    , validator:{handler:value=>{return value.isColor();} , error:TYPE.Error.MESSAGE.Date}}, Properties);
            }
        ,   Hour:function(Properties){
                this.inherit = superType;
                this.inherit({size:4, validator:{handler:value=>{return value.isHour();}, error:TYPE.Error.MESSAGE.Hour}, mask:{format:'00:00|__:__',empty:':'}}, Properties);
            }
        ,  Phone:function(Properties){
                this.inherit = superType;
                this.inherit({size:11, validator:{handler:value=>{withoutMask=true;return value.isPhone(withoutMask);}, error:TYPE.Error.MESSAGE.Phone}, mask:{format:'(000)0000-0000|(___)____-____', strip:'()-'}}, Properties);
            }
        ,  Range:function(size, Properties){
                let _me = this;
                if (!Properties)
                    Properties={}
                Object.preset(Properties, {min:1, max:9, step:1});    
                Properties.type="range"; // para garantir que será usado o tipo date do html5
                this.inherit = superType;
                this.inherit({size, dataType:DATATYPE.DATE
                    , validator:{handler:value=>{return value.isRange();} , error:TYPE.Error.MESSAGE.Date}}, Properties);
                this.onChangeHandle=function(e){
                    _me.Legend.show(_me.value());
                } 
            }
        , Password:function(size, Properties){
                this.inherit = superType;
                this.inherit({size:size, type:'password', dataType:DATATYPE.CHAR, validator:{error:TYPE.Error.MESSAGE.Password}}, Properties);
            }
        ,     Cpf:function(Properties){
                this.inherit = superType;
                this.inherit({size:11, validator:{handler:value=>{return value.ehCpf();}, error:TYPE.Error.MESSAGE.Cpf}, mask:"cpf"}, Properties);
            }
        ,    Cnpj:function(Properties){
                this.inherit = superType;
                this.inherit({size:14, validator:{handler:value=>{return value.ehCnpj();}, error:TYPE.Error.MESSAGE.Cnpj}, mask:"cnpj"}, Properties);
            }
        ,     Cca:function(Properties){
                this.inherit = superType;
                this.inherit({size:9, validator:{handler:value=>{return value.ehCca();}, error:TYPE.Error.MESSAGE.Cca}, mask:"cca"}, Properties);
            }
        ,   Placa:function(Properties){
                this.inherit = superType;
                this.inherit({size:7, dataType:DATATYPE.CHAR, validator:{handler:value=>{return value.ehPlaca();}, error:TYPE.Error.MESSAGE.Placa}, mask:"placa"}, Properties);
            }
        ,     Cep:function(Properties){
                this.inherit = superType;
                this.inherit({size:8, validator:{handler:value=>{return value.ehCep();}, error:TYPE.Error.MESSAGE.Cep}, mask:"cep"}, Properties);
            }
        ,    Mask:function(mask, Properties={}){
                let strip=mask.replace(/\w|[@]|[#]/g,""); // Pega somente caracteres especiais;
                let prompt='|'+mask.replace(/\w|[@]|[#]/g,"_"); //Montar prompt para entrada de dados;
                let dataType = (mask.replace(c$.MASK.DecimalCharacter,"").replace(/\d|[#]/g,"").length>0)? DATATYPE.CHAR : DATATYPE.NUMBER;
                let validator = {handler:value=>{return value.isValidInMask(mask);},error: "campo preenchido com formato inválido"};
                if (!Properties.align)
                    Properties.align = (dataType==DATATYPE.CHAR) ?c$.ALIGN.LEFT : c$.ALIGN.RIGHT;
                this.inherit = superType;
                this.inherit({validator:validator, dataType:dataType, mask:{format:mask+prompt, strip:strip}}, Properties);    
        }
        ,    List:function(Properties){
                let SELF = this
                  , list = null
                this.inherit = superType;
                this.inherit({type:'select',  dataType:DATATYPE.LIST, validator:{handler:SELF.exists, error:TYPE.Error.MESSAGE.List}}, Properties);
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
                        SELF.size = maxlen(list);
                }
                this.text = function(p_value){
                        let value=SELF.value(p_value);
                        let item = (list[value])?list[value]:"";
                        return item;
                };
                this.format = this.text;
                
                this.value = p_value=>{
                        let value='';
                        if (p_value)
                            value=p_value;
                        else{
                            if (SELF.Input){
                                let index=SELF.Input.selectedIndex;
                                let options= SELF.Input.options;
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
                    for(let key in list){
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
                        for(let key in list){
                        let item = list[key];
                        if (item.length > max)
                                max = item.length;
                        }
                        return max;
                }
                init();
            }
        , Typeahead:function(Properties){
                this.inherit = type.List;
                this.inherit(Properties);
                this.attributes={data_provide:'typeahead', data_items:'4'};
            }
        , Boolean:function(Properties){
                let SELF = this
                , list = CONFIG.BOOLEAN
                , text = '';
                if (Properties)
                    if (Properties.list)
                        list = Properties.list;        
                this.inherit = superType;
                this.inherit({type:'checkbox',  dataType:DATATYPE.BOOLEAN}, Properties);
                this.text = p_value=>{
                        let value='';
                        if (p_value != undefined)
                            value=p_value;
                        else{
                            if (SELF.Input)
                                value =SELF.Input.checked;
                        }
                        return SELF.local.text(value);
                };
                this.format = this.text;
                this.value = p_value=>{
                        let value='';
                        if (p_value != undefined)
                            value=p_value;
                        else{
                            if (SELF.Input)
                                value =SELF.Input.checked;
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
                            for (let key in list){
                                let item = list[key];
                                if (item.text.length > max)
                                    max = item.text.length;
                            }
    
                            return max;
                        }
                    };
                }();
                this.size = this.local.maxlen();
            }
        } // return
    }(); // end .type    
    return {
           DIGIT: properties=>{return new type.Digit(properties)}
   ,     BOOLEAN: properties=>{return new type.Boolean(properties)}
   ,      LETTER: (size,properties)=>{return new type.Letter(size,properties)}
   ,   LOWERCASE: (size,properties)=>{return new type.LowerCase(size,properties)}
   ,   UPPERCASE: (size,properties)=>{return new type.UpperCase(size,properties)}
   ,        CHAR: (size,properties)=>{return new type.Char(size,properties)}
   ,        NAME: (size,properties)=>{return new type.Name(size,properties)}
   ,    PASSWORD: (size,properties)=>{return new type.Password(size,properties)}
   ,     INTEGER: (size,properties)=>{return new type.Integer(size,properties)}
   ,     NUMERIC: (size,decimal,properties)=>{return new type.Numeric(size,decimal,properties)}
   ,        MASK: (mask,properties)=>{return new type.Mask(mask,properties)}
   ,        LIST: properties=>{return new type.List(properties)}
   ,   TYPEAHEAD: properties=>{return new type.Typeahead(properties)}
   ,       MONEY: (size,properties)=>{return new type.Money(size,properties)}
   ,       EMAIL: (size,properties)=>{return new type.Email(size,properties)}
   ,        DATE: properties=>{return new type.Date(properties)}
   ,       DATE5: properties=>{return new type.Date5(properties)}
   ,    DATETIME: properties=>{return new type.DateTime(properties)}
   ,       COLOR: properties=>{return new type.Color(properties)}
   ,       RANGE: (size,properties)=>{return new type.Range(size,properties)}
   ,        HOUR: (size,properties)=>{return new type.Hour(size,properties)}
   ,       PHONE: (size,properties)=>{return new type.Phone(size,properties)}
   ,         CPF: properties=>{return new type.Cpf(properties)}
   ,        CNPJ: properties=>{return new type.Cnpj(properties)}
   ,         CCA: properties=>{return new type.Cca(properties)}
   ,         CEP: properties=>{return new type.Cep(properties)}
   ,       Placa: properties=>{return new type.Placa(properties)}
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
}();

TYPE.Fieldset = function(){
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
            //this.Items=fields;
            this.c$=fields;
            this.length=0;
            this.filter= function(){
                let criteria={};
                return {
                  clear: ()=>{
                     for(let key in _fs.c$){
                        _fs.c$[key].filterToggle(false);
                     }
                  }
                  ,toggle: (key,value) => {
                      let field= _fs.c$[key];
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
    
        C$ = key=>{
            try {
                if (this.c$[key]==undefined)
                    throw CONFIG.EXCEPTION.INVALID_FIELD;
                else
                    return this.c$[key];
            } catch(exception){
                   if (exception==CONFIG.EXCEPTION.INVALID_FIELD)
                       console.log(exception.text +" '"+key+"'");
                   return false;
            }
        }
    
        // varre fieldset devolve um registro dos campos que estão preenchidos
        // útil para consultas
        filled = action=>{
            let record = {};
            for(let key in this.c$){
                let value = this.c$[key].value();
                let use = !value.toString().isEmpty();
                if (use && action)
                    use = action(this.c$[key]);
                if (use)
                    record[key]= value;
            }
            return record;
        };
        // Monta um Record com os campos que vem em Keys
        RecordBy = keys=>{
            let record = {};
            const keyType = j$.Ext.type(keys);
            switch (keyType) {
                case "String": record[keys]= this.c$[keys].value();
                     break; 
                case "Array": 
                    keys.forEach(key => {record[key]= this.c$[key].value()})
                    break;
                default:
                    console.log(`"${keyType}" não é um tipo reconhecido em "Fieldset.RecordBy"`);
            } 
            return record;
        };   
        // preenche os valores default para os campos
        setDefaults = provider=>{  
            for (let key in provider){
                if (this.c$[key])
                    this.c$[key].defaultValue=provider[key];
            }
        }; 
         // varre as campos e devolve um registro com o conteúdo dos campos
        sweep (action){
            let record = {};
            for(let key in this.c$){
                let field = this.c$[key];
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
            for(let key in this.c$){
                let field = this.c$[key];
    
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
              this.sort = new Sort(key, this.c$)
            return this.sort;
        }
        //varre o Fieldset e executa uma função para cada Field (ver o método show)
        execute (action){ 
            for(let key in this.c$){
               let field = this.c$[key];
               action(field,key);
            }
        };
    
        show (){this.execute((field, key)=>{console.log(key); console.log(input);});};
    }
     
    return {
        create(fields){return new Fieldset(fields)}
       , build(key){ // Método para criar um fieldset a partir da chave
            let rcd = j$.Ext.toRecord(key)
              , fieldset = {};            
            fieldset[rcd.id]=TYPE.INTEGER(4,{label:'Código', readOnly:true});
            fieldset[rcd.text]=TYPE.CHAR(30,{label:key.toFirstUpper(), mandatory:true});
            return fieldset;
          }    
    }
}();

TYPE.Helper = function(){
    class Legend{
        constructor(field){
            this.field = field;
            this.Resource = field.Resource;
        }
        prepareToRequest= value=>{
            value = (value)?value:this.field.value();
            return (value.isEmpty()) ?null
                                     :Object.build(this.field.resource.id,value);
        }
    
        hide=()      =>{TYPE.Feedback.hide(this.field)}
        show=text    =>{TYPE.Feedback.show(this.field, text,CONFIG.FEEDBACK.CLASS.LEGEND)}
        failure=error=>{TYPE.Feedback.invalid(this.field, error)}
    
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
                if (text.isEmpty())
                    TYPE.Error.passForward.invalid(this.field, TYPE.Error.MESSAGE.InvalidItem);
            } else if (response && j$.Ext.isString(response) && !response.isEmpty())
                this.show(response);
        }
        request=value =>{
            let fields = this.prepareToRequest(value);
            if (this.Resource && j$.Ext.isDefined(fields)){
                if (this.field.type=='text')
                   this.Resource.get(fields, this); // 'this' é o 'callback'
            }
        }
    }; //Legend   

    return{
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
            for(let i=0; i<labels.length;i++ ){
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
                let labelField = TYPE.Helper.getLabel(_input);
                if (inputField.label.isEmpty()){
                    inputField.label=inputField.id;
                if (!labelField.label.isEmpty())
                    inputField.label=labelField.label;
                }
                if (!inputField.mandatory)
                inputField.mandatory = labelField.mandatory;
            }
        }
        , createLabel: function(inputField, wrap, clas$, style){
            if (inputField.label.isEmpty()) // label é o texto que foi setado no construtor
                inputField.label=inputField.key;

            let lbl = j$.ui.Render.label(wrap, inputField.label, inputField.id, clas$ ,inputField.mandatory)
            lbl.stylize(style);
            return {label:inputField.label, mandatory:inputField.mandatory}
        }
        , setProperties: function(inputField, Type, Properties) {
            //properties={autotab:false, label:'', mandatory:false, locked:false, defaultValue:'', align:c$.ALIGN.LEFT, size:null, validator:null, mask:null}
            let mask = null;
            // Primeiro verifica/seta o que vem do no Type, que são o valores que já vem por padrão
            if (Type){
                Object.setIfExist(inputField, Type
                                , ['align','size','validator','mask','autotab', 'title'
                                ,'type','label','dataType','list','attributes']);
                if (Type.mask)
                    mask=Type.mask;
            }
            // Depois verifica/seta o que vem em Porperties, que é o que vem do usuário;
            if (Properties){
                Object.setIfExist(inputField, Properties,
                                ['evaluate','autotab', 'label','mandatory', 'align', 'parentLegend'
                                , 'readOnly', 'disabled', 'defaultValue', 'type'
                                , 'dataType', 'list','attributes', 'resource']);
                Object.setIfExist(inputField.attributes, Properties,['min', 'max', 'step', 'pattern', 'placeholder']);                            
                if (Properties.resource)
                    inputField.Resource =  j$.Resource.create(inputField.resource, inputField);
            }
            inputField.maskAdapter = TYPE.Formatter.createAdapter(inputField, mask);
            if (!inputField.size)
                inputField.size = inputField.maskAdapter.size;

            inputField.maxlength = (inputField.size>inputField.maskAdapter.size) ?inputField.size :inputField.maskAdapter.size;
        }
        , bindField: function(inputField, _input){
            inputField.binded=true;
            inputField.Input=_input;
            inputField.Input.bind(inputField);
            inputField.id =_input.id;
            inputField.Error = TYPE.Feedback; 
            
            TYPE.Helper.setLabel(inputField, _input); // definir o label
    
            Event.observe(_input, 'focus', TYPE.Handle.focus, false);
            if (inputField.validator)
                Event.observe(_input, 'blur',  (e)=>{TYPE.Handle.lostFocus(e,inputField.validate);});
            else
                Event.observe(_input, 'blur',  TYPE.Handle.lostFocus);
    
            switch(inputField.type){
                case 'text':
                    inputField.Legend = new Legend(inputField);
                    if (inputField.autotab)
                        Event.observe(_input, 'keyup', ()=>{TYPE.Handle.autotab(_input,inputField.maxlength);});
                    inputField.maskAdapter.bind(_input);
                    if (_input.maxlength)
                        _input.maxlength = inputField.maxlength;
                    break;
                case 'range':
                        inputField.Legend = new Legend(inputField);
                        break;
                case 'select':
                    inputField.popule();
                    break;           
                default:
                    break
            }
            Object.setIfExist(_input, inputField,['readOnly','disabled','defaultValue'])
            _input.className   = _input.className + " " + inputField.classDefault;
        }
    } // return
}();  // TYPE.Helper

TYPE.Handle = {
    focus: e=>{
        this.className = CONFIG.INPUT.CLASS.FOCUS;
    }
  , error: (obj,event, id)=>{
        let field = i$(id).field;
        //System.Hint.show(field.Error.get(),obj,event,"hint hint-error");
        TYPE.Feedback.invalid(field,field.Error.get());
    }
  , lostFocus: (e, validate)=>{
       let inputField = Event.element(e)
         , valid=true
         , value = (inputField.field!=undefined) ?inputField.field.value() 
                                                 :inputField.value;
       if (validate)
           valid=validate(value);
    //    inputField.className = (valid) ?inputField.field.classDefault
    //                                   :CONFIG.INPUT.CLASS.INVALID;
       if (inputField.field.Resource && inputField.field.Legend)
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
		let i = TYPE.Helper.getElementIndex(obj);
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
TYPE.Error = function() {
    let handle =null;
    function subscribe(message, field){
        CONFIG.ERROR.SUBSCRIBE.forEach(key=>{
            if (field[key])
               message = message.replace(`@{${key}}`, field[key]);
            else   
               message = message.replace(`@{${key}}`, '');
        })
        return message;
    }
    function forward(method, field, msg,clas$){
        if (field){
            if (method!="hide")
               msg=subscribe(msg,field);
            if (handle && handle[method])
                handle[method](field, msg,clas$);
            else
                TYPE.Error[method](field, msg,clas$);
        }        
    }    
    return {  //Retorna a chamado do erro para o proprio campo de onde veio a chamado - vai seguir o comportamento padrao
	        init:errorHandle=>{handle=errorHandle} // para definir um callback externo que trata as msgs
        ,  valid:(field,msg)       =>{field.Error.valid(field, msg)}
        ,invalid:(field,msg)       =>{field.Error.invalid(field, msg)}        
        ,   show:(field,msg,clas$) =>{field.Error.show(field, msg, clas$)}
        ,     on:(field,msg,clas$) =>{field.Error.show(field, msg, clas$)} // sinonimo de show        
        ,    off:(field)           =>{field.Error.hide(field)} // sinonimo de hide
        ,   hide:(field)           =>{field.Error.hide(field)}
        ,noMarkIfValid(mark)         {TYPE.Feedback.noMarkIfValid(mark)} 
        ,MESSAGE:CONFIG.ERROR.MESSAGE    
        , passForward:{ // => O componetes do framework fazem essa chamada
                    // => Se tem um handle externo, serah passado adiante
                    // => Se nao tem um handle externo, executa os metodos do proprio error
               valid:(field,msg)      =>{forward('valid', field, msg)}
            ,invalid:(field,msg)      =>{forward('invalid'  , field, msg)}
            ,   show:(field,msg,clas$)=>{forward('show'   , field, msg, clas$)}
            ,     on:(field,msg,clas$)=>{forward('show'   , field, msg, clas$)} // sinonimo de show
            ,    off:(field)          =>{forward('hide'  , field)} // sinonimo de hide
            ,   hide:(field)          =>{forward('hide'  , field)}
        }       
    };
}();
// colaca os textos e estilos quando da validação dos campos
TYPE.Feedback =function (){
    let _msg=null
      , _markIfValid = true;
    function fmtMsg(msg=""){ 
        return j$.Ext.isString(msg) ?msg :msg.statusText;
    }      
    function fmtId(field, msg=""){ 
        let fb = i$(`${field.id}_legend`);
        _msg=fmtMsg(msg);
        if (!fb){
           $(field.Input.parentElement).append(`<div id='${field.id}_legend'></div >`);
           fb = i$(`${field.id}_legend`);
        }  
        fb.content(_msg);   
        return fb;
    }
    function hide(field){
        if (field)
           fmtId(field).hide();    
    }
    function show(field,msg,clas$=CONFIG.FEEDBACK.CLASS.INVALID){
        let fb = fmtId(field,msg); 
        fb.className = clas$  
        fb.show();
    }
    return {
         hide
        ,show
        , on:show
        ,off:hide
        ,valid  (field, msg){
                     let isValidClass = (_markIfValid) 
                                      ? CONFIG.INPUT.CLASS.VALID
                                      : field.classDefault
                     show(field,msg, CONFIG.FEEDBACK.CLASS.VALID)                     
                     field.Input.className = (field.value().isEmpty()) 
                                           ? field.classDefault
                                           : isValidClass;  
                } 
        ,invalid(field, msg){
                     show(field,msg, CONFIG.FEEDBACK.CLASS.INVALID)
                     field.Input.className = CONFIG.INPUT.CLASS.INVALID;
                } 
        ,set(msg){_msg=msg}
        ,get(){return _msg}
        ,noMarkIfValid(mark=false){_markIfValid=mark}
    }   
}();

TYPE.Formatter = function(){
   let maskCharacters = c$.MASK.CHARS // juntas os caracteres de mascara em uma string
   //Object.values(c$.MASK.Chars).join("") // juntas os caracteres de mascara em uma string
    , bind = function(field){ //inicializa as máscaras dos inputs
            if(field.type=="text" && j$.Ext.isDefined(field.getAttribute("data-mask"))  
                                  && j$.Ext.isDefined(field.Mask)==false){
                if(!field.id) Utils.GenerateID(field);
                        
                Parser.initField(field);

                field.onfocus    = Handle.onFocus;
                field.onkeyup    = Handle.keyUp;
                field.onkeypress = Handle.keyPress;
                field.onblur     = Handle.lostFocus;
                field.onmouseup  = Handle.mouseUp;
            }            
        }
    , Utils= {
        GenerateID : function(obj){
            dt = new Date();
            obj.id = "GenID" + dt.getTime();
            return obj
        }
        ,PartialSelect : function(field, startIdx, endIdx){
            if(field.createTextRange){
                let fld= field.createTextRange();
                fld.moveStart("character", startIdx);
                fld.moveEnd("character", endIdx - field.value.length);
                fld.select();
            }else if(field.setSelectionRange){
                field.setSelectionRange(startIdx, endIdx);
            }
        }
        ,getKey: e=>{
            let code=(window.event)?parseInt(e.keyCode) :e.which
            code=(code==0) ?parseInt(e.which) :code;            
            let char= String.fromCharCode(code)
              , isChar= (e.charCode==0) ?true :false
              , isDigit = false
              , isLetter = false
              , isDecimalCharacter = false
              , isHandleKey = false;

            if (isChar){
                if ([c$.KEY.INS, c$.KEY.DEL, c$.KEY.BACKSPACE, c$.KEY.END
                   , c$.KEY.HOME, c$.KEY.UP, c$.KEY.DOWN, c$.KEY.LEFT, c$.KEY.RIGHT].includes(code)) 
                isHandleKey = true;
                char = null;
            }else{
                if (char.isDigit())       isDigit =true
                else if (char.isLetter()) isLetter=true 
                else if (char==c$.MASK.DecimalCharacter) 
                    isDecimalCharacter=true;
            }
            return {code, char, isChar, isDigit, isLetter, isDecimalCharacter, isHandleKey
                  , isValidChar: (isDigit || isLetter || isDecimalCharacter)}
        }	
    } 
    , Handle={
        onFocus : (e=window.event)=>{
            if (e.target.isAlignRight)
            Parser.CursorManager.Reposition(e.target);
        },
        
        lostFocus : ()=>{},
        
        keyUp : function(e=window.event){
            let key = Utils.getKey(e);
            if (!key.isHandleKey) return;

            if(key.code==c$.KEY.DEL){
                if(this.InsertActive)
                    Parser.DataManager.RemoveCharacterByShiftLeft(this);
                else
                    Parser.DataManager.RemoveCharacterByOverwrite(this);
                Parser.Render(this);
                if(this.isAlignRight)
                    Parser.CursorManager.Reposition(this);
            } else if (key.code==c$.KEY.BACKSPACE && (this.AllowInsert || this.isAlignRight)){
                if (this.isAlignRight){
                    Parser.DataManager.shiftRight(this);
                }else if (this.AllowInsert){
                    let preBackspaceCursorPosition = Parser.CursorManager.GetPosition(this)[0];
                    Parser.CursorManager.Move(this, -1);
                    let postBackspaceCursorPosition = Parser.CursorManager.GetPosition(this)[0]-1;

                    if(preBackspaceCursorPosition != postBackspaceCursorPosition) 
                        Parser.DataManager.RemoveCharacterByShiftLeft(this,1);
                }
                Parser.Render(this);
                Parser.CursorManager.Reposition(this);
            }else if(key.code==c$.KEY.END){
                let startIdx = Parser.MaskManager.FindNearestMaskCharacter(this, this.DataIndex[this.DataIndex.length-1], 1);
                Parser.CursorManager.SetPosition(this, startIdx);
            }else if(key.code==c$.KEY.HOME){
                Parser.CursorManager.SetPosition(this, this.MaskIndex[0]);
            }else if(key.code==c$.KEY.LEFT || (key.code==c$.KEY.UP && this.isAlignRight==false)){
                Parser.CursorManager.Move(this, -1);
            }else if(key.code==c$.KEY.UP && this.isAlignRight){
                Parser.CursorManager.Reposition(this);
            }else if(key.code==c$.KEY.RIGHT  || key.code==c$.KEY.DOWN){
                Parser.CursorManager.Move(this, 1);
            }else if(key.code==c$.KEY.INS && this.AllowInsert)
                Parser.CursorManager.ToggleInsert(this);
            return false;
        },
        keyPress : function(e= window.event){
            let render=false, key = Utils.getKey(e);
            if (key.isValidChar) {             
                Parser.CursorManager.TabbedInSetPosition(this);
                let maskCurrent=Parser.MaskManager.CurrentMaskCharacter(this);				

                //Numeric Characters
                if (((c$.MASK.NUMBER.exists(maskCurrent)) && key.isDigit) ||
                    ((key.isDecimalCharacter) && this.value.includes(c$.MASK.DecimalCharacter)==false && 
                    this.value.trim().length>0 && this.hasDecimalCharInMask)) {                                        
                    render=true;
                }else if(key.isLetter){ //Alpha Characters 65 - 90
                    if (c$.MASK.ALPHA.exists(maskCurrent)){
                        if (maskCurrent==c$.MASK.ALPHA.LOWER)//.LowerCaseChar)
                            key.char=key.char.toLowerCase()
                        else if (maskCurrent==c$.MASK.ALPHA.UPPER)//.UpperCaseChar)
                            key.char=key.char.toUpperCase()                                                      
                        render=true;
                    } else if (this.isAlignRight)
                        Parser.CursorManager.Reposition(this);
                }
            } else if (key.isChar){
                Parser.Render(this);
                Parser.CursorManager.Reposition(this);
            }
            if (render){
                Parser.DataManager.AddData(this, key.char);
                Parser.Render(this);
                Parser.CursorManager.Reposition(this);
            }
            
            //Refresh
            // else if(key.code==c$.KEY.REFRESH){ return}
            // else{}
            return false;
        },
        mouseUp : function(e=window.event){
            if (this.isAlignRight)
                Parser.CursorManager.Reposition(this);
            else{
                let cursorPosition = Parser.CursorManager.GetPosition(this)[0];
                let startIdx = Parser.MaskManager.FindNearestMaskCharacter(this, cursorPosition, 0);
                Parser.CursorManager.SetPosition(this, startIdx);
            }	
        }
    }
    , Parser={
        initField : (input)=>{ //inicializa as máscaras
            Parser.ParseFieldData(input);
            input.value = (input.DefaultText.length>0) ?input.DefaultText.join("") :input.DefaultText;           
            if (!input.isAlignRight)
                input.isAlignRight = false;
        },
        ParseFieldData : function(input){ //inicializa os valores de dados
            let adapter= input.field.maskAdapter;
            input.CursorPosition= [];
            input.Data          = [];
            input.DataIndex     = [];
            input.DefaultText   = (input.getAttribute("data-prompt")) ?input.getAttribute("data-prompt").split("") :"";

            input.Mask          = this.MaskManager.ParseMask(input);
            input.MaskIndex     = this.MaskManager.ParseMaskIndex(input.Mask);
            
            let IsComplexMask   = this.MaskManager.IsComplexMask(input);
            input.InsertActive  = (IsComplexMask) ? false : true;
            input.HighlightChar = (IsComplexMask) ? true  : false;
            input.AllowInsert   = (IsComplexMask) ? false : true;
        },      
        MaskManager : {
            ParseMask : function(input){                                        
                let arr =[]
                  , mask=input.getAttribute("data-mask")         
                mask.split("").forEach((item,idx)=>{
                                                    if (maskCharacters.includes(item)) 
                                                        arr[idx]=item;
                                                })
                input.hasDecimalCharInMask=mask.includes(c$.MASK.DecimalCharacter);
                return arr;
            }            
            , ParseMaskIndex : function(mask){
                let arr = [];
                for(let i=0; i<mask.length; i++){
                    if(mask[i] != null) 
                        arr[arr.length] = i;
                }
                return arr;
            }
            ,CurrentMaskCharacter : function(input){
                let adapter= input.field.maskAdapter
                  , cursorPosition = Parser.CursorManager.GetPosition(input)[0];
                return input.Mask[cursorPosition];
            }
            ,FindNearestMaskCharacter : function(input, cursorPosition, dir){
                let adapter= input.field.maskAdapter
                  , nearestMaskCharacter = (input.DataIndex.length > 0) ? cursorPosition : input.MaskIndex[0];                
                switch(dir){
                    case -1:
                        for(let i=input.DataIndex.length-1; i>-1; i--){
                            if(input.DataIndex[i] < cursorPosition){
                                nearestMaskCharacter = input.DataIndex[i];
                                break;
                            }
                        }
                    break;
                    case 0:
                        for(let i=0; i<input.DataIndex.length; i++){
                            if(input.MaskIndex[i] >= cursorPosition){
                                nearestMaskCharacter = input.MaskIndex[i];
                                break;
                            }else{
                                nearestMaskCharacter = input.MaskIndex[input.DataIndex.length];
                            }
                        }							
                    break;
                    case 1:
                        for(let i=0; i<input.DataIndex.length; i++){
                            if(input.DataIndex[i] > cursorPosition){
                                nearestMaskCharacter = input.DataIndex[i];
                                break;
                            }
                        }
                        if(cursorPosition == input.MaskIndex[input.MaskIndex.length-1]) nearestMaskCharacter = cursorPosition + 1;
                        else if(cursorPosition == input.DataIndex[input.DataIndex.length-1]) nearestMaskCharacter = input.MaskIndex[input.DataIndex.length];
                    break;
                }
                return nearestMaskCharacter
            }
            ,IsComplexMask : function(input){
                //Quando a mask contem tipos diferentes de caracteres - não deceverá permitir insert;
                let adapter= input.field.maskAdapter
                  , previousChar= ""
                  , isComplex = input.MaskIndex.some((cur,i)=>{
                        const currentChar = input.Mask[cur];
                        const res =  (currentChar != previousChar && previousChar != "")
                        previousChar = currentChar;
                        return 	res;
                    });
                return isComplex;
            }
        },   
        CursorManager : {
            Move : function(input, dir){
                let adapter= input.field.maskAdapter
                  , cursorPosition = this.GetPosition(input)[0];
                if (!input.isAlignRight || (input.isAlignRight && input.Data.length>0)){
                    let startIdx = Parser.MaskManager.FindNearestMaskCharacter(input, cursorPosition, dir);
                    this.SetPosition(input, startIdx);
                }else{
                    this.SetPosition(input, cursorPosition);
                }
            },
            GetPosition : function(input){
                let adapter= input.field.maskAdapter
                  , arr = [0,0];
                if(input.selectionStart && input.selectionEnd){
                    arr[0] = input.selectionStart;
                    arr[1] = input.selectionEnd;
                }
                else if(document.selection){
                    let range = input.createTextRange();
                    range.setEndPoint("EndToStart", document.selection.createRange());
                    arr[0] = range.text.length;
                    arr[1] = document.selection.createRange().text.length;
                }
                return arr
            },
            SetPosition : function(input, startIdx){
                let endIdx = startIdx + ((input.HighlightChar) ? 1 : 0);
                Utils.PartialSelect(input, startIdx, endIdx);
            },
            TabbedInSetPosition : function(input){//onde será posicionado o cursor para inserir o valor
                if(Parser.MaskManager.CurrentMaskCharacter(input) == undefined){
                    let startIdx=0
                      , adapter= input.field.maskAdapter;
                    if (input.isAlignRight){
                        startIdx =input.MaskIndex.length;
                    }else{
                        if(input.DataIndex.length > 0 && input.DataIndex.length != input.MaskIndex.length){
                            startIdx = input.MaskIndex[input.DataIndex.length];
                        }
                        else if(input.DataIndex.length == input.MaskIndex.length){
                            startIdx = input.DataIndex[input.DataIndex.length-1] + 1;
                        }
                    }
                    this.SetPosition(input, startIdx);
                }
            },
            PersistPosition : function(input){
                input.CursorPosition = this.GetPosition(input);
            },
            RestorePosition : function(input){
                this.SetPosition(input, input.CursorPosition[0]);
            },
            Reposition: function(input){
                let adapter= input.field.maskAdapter;
                if (input.isAlignRight){
                    let pos = (input.Mask.length);//(input.Data.join("").length +(input.hasDecimalCharInMask ?1 :0))
                    this.SetPosition(input, pos);
                }else{
                    this.Move(input, 1);
                }
            },
            ToggleInsert : function(input){
                if(input.InsertActive){
                    input.InsertActive = false;
                    input.HighlightChar = true;
                }else{
                    input.InsertActive = true;
                    input.HighlightChar = false;
                }
                let startIdx = this.GetPosition(input)[0];
                this.SetPosition(input, startIdx);
            }
        },
        DataManager : {
            AddData : function(input, char){
                //(input.alignToReposiotion==c$.ALIGN.RIGHT)
                let cursorPosition = Parser.CursorManager.GetPosition(input)[0];
                if (input.isAlignRight){
                    if (cursorPosition ==input.MaskIndex.length)
                    this.InsertCharacter(input, char);
                    else
                    this.OverwriteCharacter(input, char, cursorPosition);
                }else{
                    if(input.InsertActive)
                        this.InsertCharacter(input, char);
                    else
                        this.OverwriteCharacter(input, char, cursorPosition);
                }
                this.UpdateDataIndex(input);
            }
            ,shiftLeft: (input) =>{ // move todos para esquerda uma posicao
                if (input.Data.length>0){
                    for(let i=0;i<input.MaskIndex.length;i++){
                        input.Data[input.MaskIndex[i]] = input.Data[input.MaskIndex[i+1]];
                    }
                }
            }
            ,shift: (input,start=0, ct=1) =>{ // move todos para direita uma posicao
                if (input.Data.length>0){
                    for(let i=start; i<start-ct; i--){
                        input.Data[input.MaskIndex[i+1]] = input.Data[input.MaskIndex[i]];
                    }
                }
            }
            ,shiftRight: (input,start=input.MaskIndex.length-1) =>{ // move todos para direita uma posicao
                if (input.Data.length>0){
                    for(let i=start; i>-1; i--){
                        input.Data[input.MaskIndex[i]] = input.Data[input.MaskIndex[i-1]];
                    }
                }
            }
            ,InsertCharacter :function(input, char){
                let lastCharacterPosition = input.MaskIndex[input.MaskIndex.length-1]
                  , currentCharacterPosition = this.CurrentDataIndexPosition(input);
                if (input.isAlignRight)
                    this.shiftLeft(input);
                else
                    this.shift(input,lastCharacterPosition, (lastCharacterPosition-currentCharacterPosition));			
                input.Data[input.MaskIndex[currentCharacterPosition]] = char;
            }
            ,OverwriteCharacter : function(input, char, cursorPosition){
                input.Data[cursorPosition] = char;
            }
            ,RemoveCharacterByOverwrite : function(input){
                let currentCharacterPosition = this.CurrentDataIndexPosition(input);
                if(currentCharacterPosition != null){
                    if (input.isAlignRight)
                        this.shiftRight(input,currentCharacterPosition)
                    else
                    input.Data[input.DataIndex[currentCharacterPosition]] = "";
                }
            }
            ,RemoveCharacterByShiftLeft : function(input, pos=0){
                let lastCharacterPosition = input.DataIndex[input.DataIndex.length-1]
                , currentCharacterPosition = this.CurrentDataIndexPosition(input)
                , cursorPosition = Parser.CursorManager.GetPosition(input)[0];
                
                if(currentCharacterPosition != null && (lastCharacterPosition >= cursorPosition || (lastCharacterPosition ==0  && lastCharacterPosition == cursorPosition))){
                    if (lastCharacterPosition ==0)
                        input.Data[input.DataIndex[0]] = input.Data[input.DataIndex[1]];
                    else{
                        for(let i=(currentCharacterPosition+pos); i<=lastCharacterPosition; i++){
                            input.Data[input.DataIndex[i]] = input.Data[input.DataIndex[i+1]];
                        }
                    }	
                    input.Data.length = input.Data.length-1;
                    this.UpdateDataIndex(input);
                }
            }
            ,UpdateDataIndex : function(input){
                input.DataIndex.length = 0;
                for(let i=0; i<input.Data.length; i++){
                    if(input.Data[i] != undefined) input.DataIndex[input.DataIndex.length] = i;
                }
            }
            ,CurrentDataIndexPosition : function(input){
                let cursorPosition = Parser.CursorManager.GetPosition(input)[0]
                  , currentDataIndexPosition = null;
                for(let i=0; i<input.MaskIndex.length; i++){
                    if(input.MaskIndex[i] == cursorPosition){
                        currentDataIndexPosition = i;
                        break;
                    }
                }
                return currentDataIndexPosition
            }				
        },
        Render : function(input){
            this.CursorManager.PersistPosition(input);
            let composite = [];
            const Pos = index =>({
                index
                , get:()=> ++index					    
            })
            const pos=Pos(-1);
            for(let i=0; i<input.Mask.length; i++){
                let k = pos.get();
                if (input.DefaultText.length>0){
                    composite[i] = input.Mask[i];
                    if (input.DefaultText[i]) 
                        composite[i] = input.DefaultText[i];
                }
                if (input.Data[k]) 
                composite[i] = input.Data[k];
            }
            input.value = composite.join("")
            
            this.CursorManager.RestorePosition(input);
        }
    }
    class Adapter{
        constructor(field, mask){
            //Object.preset(this,{prompt:null, strip:null, mask:null, size:1, align:c$.ALIGN.LEFT});        
            this.parse(field, mask);
        };
        parse(field, parm){
            function interpret(mask){ // obter a mascara
                let _mask=mask;
                if (j$.Ext.isString(mask)){ 
                    if (c$.MASKS[mask])     // sendo string, vai verificar se estah na calecao de masks padrao
                        _mask = c$.MASKS[mask]; 
                }    
                return _mask;
            }
            let split = mask=>{       // separa as partes da definicao da mascara (format e prompt)
                let fmt=(mask && j$.Ext.isObject(mask)) ?mask.format :mask
                 , values;
                if (j$.Ext.isArray(fmt))        
                    values= fmt;               
                else if (j$.Ext.isString(fmt))  
                    values= fmt.split(c$.MASK.SEPARATOR);  
                this.align  =c$.ALIGN.LEFT;                
                this.mask   = values[0];                          // [0] é o formato da mascara
                this.prompt = (values.length>1) ?values[1] :null; // [1] é o prompt  da mascara
                                            
                this.strip = (values.length>2)  ?values[2] :null; // [2] são os caracters de strip
                                                                                            
                this.size   = this.mask.length;                
                return values;            
            }
            if (parm){             
                let mask=interpret(parm);            
                split(mask);

                if (j$.Ext.isObject(mask))        // copia as propriedades 
                    Object.setIfExist(this,mask,['strip','empty','align']);
            }    
        }
        format (value){return (this.mask)?value.format(this.mask) :value}
        unformat (value){
            let vl = (this.strip) ?value.stripChar(this.strip) :value.trim();
            vl = vl.stripChar(c$.MASK.PROMPT); // Remover o caracter de prompt
            if (this.empty && vl==this.empty)  // #todo: para que serve?
                vl =''
            return vl;
        };
        bind (input){
            let adapte=()=>{ // coloca as propriedades da mascara no elemento html
                if (this.mask){
                    input.setAttribute("data-mask", this.mask); 
                    if (this.prompt)
                        input.setAttribute("data-prompt", this.prompt);      
                    input.isAlignRight = (this.align==c$.ALIGN.RIGHT) ?true :false;   
                    this.isAlignRight = input.isAlignRight;      
                    TYPE.Formatter.bind(input);
                    return true;
                }             
                return false;
            }
            if (!adapte()){
                // situacao que acontecerah qdo colocar data-mask='' direto no html e fizer o bind depois
                // seria ate incomum, visto que pode fazer direto pelo type.mask
                if (input.getAttribute("data-mask") && !this.mask){
                    this.parse(input, input.getAttribute("data-mask"));
                    adapte();
                }    
            }       
        }
    } // Adapter   
   return{ 	
        init(formId){
            let inputs = (formId) ?$(`#${formId}`).find("input") :$("input") ;
            for(let i=0; i<inputs.length; i++){
                bind(inputs[i]);	
            }
        }
        , bind
        , createAdapter(field, mask){
            return new Adapter(field, mask);
        }
     }    
}()   
// export {TYPE};