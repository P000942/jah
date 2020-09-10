/* By Geraldo Gomes */
'use strict';
   
j$.Fieldset = function(){
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
            const keyType = dataExt.type(keys);
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
    };
     
    return {
        create(fields){return new Fieldset(fields)}
       , build(key){ // Método estático para criar um fieldset a partir da chave
            let rcd = dataExt.format.record(key)
              , fieldset = {};            
            fieldset[rcd.id]=TYPE.INTEGER(4,{label:'Código', readOnly:true});
            fieldset[rcd.text]=TYPE.CHAR(30,{label:key.toFirstUpper(), mandatory:true});
            return fieldset;
          }    
    }
}();

const TYPE = function() {
    Element.prototype.bind = function(field) {
        this.field =field;
        if (!field.binded){
            field.bind(this);
        }
    };    
    const DATATYPE = {NUMBER:{parse:value=>{return parseFloat(value);}},
                        DATE:{parse:value=>{return new Date(value);}},
                        CHAR:{parse:value=>{return value;}},
                    BOOLEAN:{parse:value=>{return value;}},
                        LIST:{parse:value=>{return value;}}
                    };                         
    let type = function(){         
        function superType(Type, Properties) {
            let SELF=this;
            Object.preset(SELF,{align:c$.ALIGN.LEFT, mandatory:false, autotab:false, label:''
                                , persist:true, defaultValue:'', type:'text'
                                , id:'', key:null, list:null, readOnly:false
                                , binded:false, order:c$.ORDER.NONE, disabled:false, onFilter:false
                                , inputField:false, dataType:DATATYPE.NUMBER, size:null
                                , maxlength:0, validator:null, mask:null
                                , Header:{clas$:null, id:null}
                                , Report:{}, Record:{value:'', formattedValue:''}, attributes:{}});
            /*   this.id  - Eh o identificador no form.
                this.key - eh como estah definido no dataset (column)
            */
            TYPE.HELPER.setProperties(SELF,Type, Properties);
            
            this.edit= value=>{
                    if (value == undefined)
                        value = this.Record.value;
                    i$(this.id).content(value);
                    i$(this.id).className = SELF.classDefault  
            };
            this.format= p_value=> {
                    return  (this.mask) ?this.mask.format(p_value) :this.value(p_value);
            };
            this.identify= (wrap, id, key)=>{
                SELF.id =j$.util.getId(SELF.type, id);
                SELF.key =(key)?key : SELF.id;
                //    if (!design) design={};
                //    SELF.design = design;
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
                    TYPE.HELPER.createLabel(SELF, wrapInput, design.label.clas$, design.label.style)          
                }else{   
                    TYPE.HELPER.createLabel(SELF, wrap, design.label.clas$, design.label.style);
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
                    if (SELF.mask){value = SELF.mask.unformat(value);}
                    return value.trim();
            };
            this.validate= p_value=>{
                    let value=SELF.value(p_value)
                    , valid=SELF.isValid(value);
                    if (!valid && ERROR)
                        ERROR.passForward.invalid(SELF, SELF.validator.error);
                    else
                        ERROR.passForward.valid(SELF,"");         
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
                        SELF.validator.error = ERROR.MESSAGE.Mandatory;
                    }    
                    return valid;
            };
            
            this.reset= ()=>{
                    ERROR.passForward.hide(SELF);
                    if (!SELF.defaultValue.isEmpty())
                        i$(SELF.id).value=SELF.defaultValue;
                    i$(SELF.id).className = SELF.classDefault; //CONFIG.INPUT.CLASS.DEFAULT;
            };
            
            this.bind = (_input)=>{TYPE.HELPER.bindField(SELF,_input)}
            
            this.filterToggle=showFilter=>{
                    SELF.onFilter = (dataExt.isDefined(showFilter))
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
                this.inherit({size:1, align:c$.ALIGN.RIGHT, validator:{handler:value=>{return value.isDigit();}, error:ERROR.MESSAGE.Digit}, mask:['#','_']}, Properties);
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
                this.inherit({size:_size, align:c$.ALIGN.RIGHT, validator:{handler:value=>{return value.isNumeric(decimal);}, error:ERROR.MESSAGE.Numeric}
                            , mask:{format:mask+"|"+mask.replace(/#/g,"_"), strip:decimalChar, empty:decimalChar, align:c$.ALIGN.RIGHT}}, Properties);
            }
        , Integer:function(size, Properties){
                this.inherit = superType;
                this.inherit({size, align:c$.ALIGN.RIGHT, validator:{handler:value=>{return value.isInteger();}, error:ERROR.MESSAGE.Integer}, mask:{format:'#'.repeat(size)}}, Properties);
            }
        ,   Money:function(size, Properties){
                this.inherit = superType;
                let decimalChar=c$.MASK.DecimalCharacter;
                let mask = '9'.repeat(size-3)+'0'+decimalChar+'00';
                this.inherit({size:size+1, align:c$.ALIGN.RIGHT, validator:{handler:value=>{return value.isDecimal(2);}, error:ERROR.MESSAGE.Money}
                            , mask:{format:mask+"|"+mask.replace(/[0|9]/g,"_"), strip:decimalChar, empty:decimalChar, align:c$.ALIGN.RIGHT}}, Properties);
                this.format= value=> {return dataExt.format.money(value); };
            }
        ,    Char:function(size, Properties){
                this.inherit = superType;
                this.inherit({size:size, dataType:DATATYPE.CHAR, validator:{error:ERROR.MESSAGE.Char}}, Properties);
            }
        ,  Letter:function(size, Properties){
                this.inherit = superType;
                this.inherit({size:size, dataType:DATATYPE.CHAR, validator:{handler:value=>{return value.isLetter();}, error:ERROR.MESSAGE.Letter}, mask:{format:'@'.repeat(size)}}, Properties);
            }
        , UpperCase:function(size, Properties){
                this.inherit = superType;
                this.inherit({size:size, dataType:DATATYPE.CHAR, validator:{handler:value=>{return value.isLetter();}, error:ERROR.MESSAGE.Letter}, mask:{format:'A'.repeat(size)}}, Properties);
            }
        , LowerCase:function(size, Properties){
                this.inherit = superType;
                this.inherit({size:size, dataType:DATATYPE.CHAR, validator:{handler:value=>{return value.isLetter();}, error:ERROR.MESSAGE.Letter}, mask:{format:'a'.repeat(size)}}, Properties);
            }
        ,    Name:function(size, Properties){
                this.inherit = superType;
                this.inherit({size:size, dataType:DATATYPE.CHAR, validator:{handler:value=>{return value.isName();}, error:ERROR.MESSAGE.Name}}, Properties);
            }
        ,   Email:function(size, Properties){
                this.inherit = superType;
                this.inherit({size:size, dataType:DATATYPE.CHAR, validator:{handler:value=>{return value.isEmail();}, error:ERROR.MESSAGE.Email}}, Properties);
            }
        ,   Date:function(Properties){
                this.inherit = superType;
                this.inherit({size:10, dataType:DATATYPE.DATE, validator:{handler:value=>{return value.isDate();}, error:ERROR.MESSAGE.Date}, mask:{format:'00/00/0000|__/__/____', strip:'_', empty:'//'}}, Properties);
            }
        ,  Date5:function(Properties){
                if (!Properties)
                    Properties={}
                Properties.type="date"; // para garantir que será usado o tipo date do html5
                this.inherit = superType;
                this.inherit({size:10, dataType:DATATYPE.DATE, validator:{handler:value=>{return value.isDate();}
                            , error:ERROR.MESSAGE.Date}}, Properties);
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
                            , error:ERROR.MESSAGE.Date}}, Properties);
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
                    , validator:{handler:value=>{return value.isColor();} , error:ERROR.MESSAGE.Date}}, Properties);
            }
        ,   Hour:function(Properties){
                this.inherit = superType;
                this.inherit({size:4, validator:{handler:value=>{return value.isHour();}, error:ERROR.MESSAGE.Hour}, mask:{format:'00:00|__:__',empty:':'}}, Properties);
            }
        ,  Phone:function(Properties){
                this.inherit = superType;
                this.inherit({size:11, validator:{handler:value=>{withoutMask=true;return value.isPhone(withoutMask);}, error:ERROR.MESSAGE.Phone}, mask:{format:'(000)0000-0000|(___)____-____', strip:'()-'}}, Properties);
            }
        ,  Range:function(size, Properties){
                let _me = this;
                if (!Properties)
                    Properties={}
                Object.preset(Properties, {min:1, max:9, step:1});    
                Properties.type="range"; // para garantir que será usado o tipo date do html5
                this.inherit = superType;
                this.inherit({size, dataType:DATATYPE.DATE
                    , validator:{handler:value=>{return value.isRange();} , error:ERROR.MESSAGE.Date}}, Properties);
                this.onChangeHandle=function(e){
                    _me.Legend.show(_me.value());
                } 
            }
        , Password:function(size, Properties){
                this.inherit = superType;
                this.inherit({size:size, type:'password', dataType:DATATYPE.CHAR, validator:{error:ERROR.MESSAGE.Password}}, Properties);
            }
        ,     Cpf:function(Properties){
                this.inherit = superType;
                this.inherit({size:11, validator:{handler:value=>{return value.ehCpf();}, error:ERROR.MESSAGE.Cpf}, mask:"cpf"}, Properties);
            }
        ,    Cnpj:function(Properties){
                this.inherit = superType;
                this.inherit({size:14, validator:{handler:value=>{return value.ehCnpj();}, error:ERROR.MESSAGE.Cnpj}, mask:"cnpj"}, Properties);
            }
        ,     Cca:function(Properties){
                this.inherit = superType;
                this.inherit({size:9, validator:{handler:value=>{return value.ehCca();}, error:ERROR.MESSAGE.Cca}, mask:"cca"}, Properties);
            }
        ,   Placa:function(Properties){
                this.inherit = superType;
                this.inherit({size:7, dataType:DATATYPE.CHAR, validator:{handler:value=>{return value.ehPlaca();}, error:ERROR.MESSAGE.Placa}, mask:"placa"}, Properties);
            }
        ,     Cep:function(Properties){
                this.inherit = superType;
                this.inherit({size:8, validator:{handler:value=>{return value.ehCep();}, error:ERROR.MESSAGE.Cep}, mask:"cep"}, Properties);
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

TYPE.HELPER = function(){
    class Ma$k{
        constructor(mask){
            Object.preset(this,{fmt:null, prompt:null, strip:null, mask:null, size:1, align:c$.ALIGN.LEFT});        
            this.parse(mask);
        };
        parse(parm){
            function interpret(mask){ 
                let _mask=mask;
                if (dataExt.isString(mask)){ // sendo strig, vai verificar se na calecao masks padrao
                    if (c$.MASKS[mask]) 
                    _mask = c$.MASKS[mask]; 
                }    
                return _mask;
            }
            let split = mask=>{ // separa as partes da definicao da mascara (format e prompt)
                let fmt=(mask && mask.format) ?mask.format :mask
                , values;
                if (dataExt.isArray(fmt))        
                    values= mask;               
                else if (dataExt.isString(fmt))  
                    values= fmt.split(c$.MASK.FieldDataSeparator);  
                this.mask   = values[0];                    // [0] é o formato da mascara
                this.prompt = (values.length>1) ?values[1] :null; // [1] é o prompt  da mascara
                                            
                this.strip = (values.length>2)  ?values[2] :null; // [2] são os caracters de strip
                                                                                            
                this.size   = this.mask.length;                
                return values;            
            }
            if (parm){             
                let mask=interpret(parm);            
                split(mask);

                if (dataExt.isObject(mask))        // copia as propriedades 
                    Object.setIfExist(this,mask,['strip','empty','align']);
            }    
        }
        format (value){return (this.mask)?value.mask(this.mask) :value}
        unformat (value){
            let vl = (this.strip) ?value.stripChar(this.strip) :value.trim();
            vl = vl.stripChar(c$.MASK.Prompt); // Remover o caracter de prompt
            if (this.empty && vl==this.empty)
            vl =''
            return vl;
        };
        render (inputField){
            let bind=()=>{
                if (this.mask){
                    inputField.setAttribute("data-mask", this.mask); 
                    if (this.prompt)
                    inputField.setAttribute("data-prompt", this.prompt);           
                    Typecast.Format(inputField, this);
                    return true;
                }             
                return false;
            }
            if (!bind()){
                // situacao que acontecerah qdo colocar data-mask='' direto no html e fizer o bind depois
                // seria ate incomum, visto que pode fazer direto pelo type.mask
                if (inputField.getAttribute("data-mask") && !this.mask){
                    this.parse(inputField.getAttribute("data-mask"));
                    bind();
                }    
            }       
        }
    } // ma$k

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
    
        hide=()      =>{j$.Feedback.hide(this.field)}
        show=text    =>{j$.Feedback.show(this.field, text,CONFIG.FEEDBACK.CLASS.LEGEND)}
        failure=error=>{j$.Feedback.invalid(this.field, error)}
    
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
                    ERROR.passForward.invalid(this.field, ERROR.MESSAGE.InvalidItem);
            } else if (response && dataExt.isString(response) && !response.isEmpty())
                this.show(response);
        }
        request=value =>{
            let fields = this.prepareToRequest(value);
            if (this.Resource && dataExt.isDefined(fields)){
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
        inputField.mask = new Ma$k(mask);
        if (!inputField.size)
            inputField.size = inputField.mask.size;

        inputField.maxlength = (inputField.size>inputField.mask.size) ?inputField.size :inputField.mask.size;
    }
    , bindField: function(inputField, _input){
        inputField.binded=true;
        inputField.Input=_input;
        inputField.Input.bind(inputField);
        inputField.id =_input.id;
        inputField.Error = j$.Feedback; 
        
        TYPE.HELPER.setLabel(inputField, _input); // definir o label
 
        Event.observe(_input, 'focus', TYPE.HANDLE.focus, false);
        if (inputField.validator)
            Event.observe(_input, 'blur',  (e)=>{TYPE.HANDLE.lostFocus(e,inputField.validate);});
        else
            Event.observe(_input, 'blur',  TYPE.HANDLE.lostFocus);
 
        switch(inputField.type){
             case 'text':
                inputField.Legend = new Legend(inputField);
                 if (inputField.autotab)
                     Event.observe(_input, 'keyup', ()=>{TYPE.HANDLE.autotab(_input,inputField.maxlength);});
                 inputField.mask.render(_input);
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
}();  // TYPE.HELPER

TYPE.HANDLE = {
    focus: e=>{
        this.className = CONFIG.INPUT.CLASS.FOCUS;
    }
//   , info: (obj,event, id)=>{
//         let field = i$(id).field;
//         System.Hint.show(field.hint,obj,event,"hint hint-info");
//     }
  , error: (obj,event, id)=>{
        let field = i$(id).field;
        //System.Hint.show(field.Error.get(),obj,event,"hint hint-error");
        j$.Feedback.invalid(field,field.Error.get());
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
// colaca os textos e estilos quando da validação dos campos
j$.Feedback =function (){
    let _msg=null
      , _markIfValid = true;
    function fmtMsg(msg=""){ 
        return dataExt.isString(msg) ?msg :msg.statusText;
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
    , wrap:(wrap, id, clas$, style)=>{
            let id$ = j$.util.getId(clas$, id);
            if (!i$(id$)){
            wrap.insert(`<div id='${id$}' class='${clas$}'></div>`);
            i$(id$).stylize(style);
            }   
            return i$(id$);
        }
    , label: (wrap, label, inputId, clas$=CONFIG.LABEL.CLASS.DEFAULT, mandatory)=>{
            let att={clas$
                    ,  id:(inputId) ?inputId+ '_label' :j$.util.getId('Label')
                    , for:(inputId) ?inputId :null
                    };
            label =(label)?label : att.id;
            if (!i$(att.id)){ // cria se não existir
            let _att = j$.ui.Render.attributes(att,'label')
            , required =(mandatory) ?`<span class="${CONFIG.INPUT.CLASS.REQUIRED}">*</span>` :'';
            $(wrap).append(`<label ${_att} >${label}${required}:</label>`);
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
                wrap.insert(`<input type='${type}' id='${id}' name='${id}' ${size} ${_att} />`);
            }
            return i$(id);
        }  
    , wrapperUl:(wrap, id, wrapStyle)=>{
            let wrapId =j$.util.getId(wrapStyle, id)
            , wrapNavId = `${wrapId}_wrap`;
            $(wrap).append(`<nav class='wrapperUl d-flex flex-row-reverse' id='${wrapNavId}'></nav>`);
            $(`#${wrapNavId}`).append(`<ul class="${wrapStyle}" id="${wrapId}"></ul>`);
            return i$(wrapId);
        }
    , li:(wrap, properties)=>{
        wrap.insert('<li><a ' +j$.ui.Render.attributes({id:properties.id, onclick:properties.onclick})+' >' +properties.caption+ '</a></li>');
        return i$(properties.id);
    }
    , menuItem:(wrap, properties)=>{
        wrap.insert('<a class="dropdown-item" href="#" ' +j$.ui.Render.attributes({id:properties.id, onclick:properties.onclick})+' >' +properties.caption+ '</a>');
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
        return '<a' +j$.ui.Render.attributes(properties,['value', 'element'])+ '>'+j$.ui.Render.icon(properties)+properties.value+'</a>';
    }
    , formatButtonDropdown:(properties)=>{
        return '<div id="' +properties.id+ '"  class="btn-group" role="group" aria-label="Button group with nested dropdown">'                 
                +  '<div class="btn-group" role="group">'                   
                +    '<button class="btn btn-default dropdown-toggle" data-toggle="dropdown" ' +j$.ui.Render.attributes(properties,['value','onclick','submenu','id'])+ '>'+j$.ui.Render.icon(properties)+'</button>'              
                +    '<div id="'+properties.id+'Menu" class="dropdown-menu"></div>'
                +    '</div>'
                +'</div>';
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
        wrap.insert(`<div ${clas$}><button type="button" class="close" data-dismiss="alert">×</button>${msg}</div>`);
    }
    };
}();    

// export {j$.Fieldset, TYPE, j$.Feedback, j$.ui};