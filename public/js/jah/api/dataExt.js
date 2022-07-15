'use strict'
const j$ = function(){
    String.prototype.trim = function(){
        return this.replace(/^\s*/, "").replace(/\s*$/, "");
    }

    String.prototype.isEmpty = function(){
        if(this==null){return true;};
        if(this.trim().length==0){return true;};
        return false;
    }

    String.prototype.repeat = function (n){
        let r="";
        let s=this;
        for (let a=0;a<n;a++)
            r+=s;
        return r;
    }
    String.prototype.noAccent = function (){
        let r=this; var hash={a:'áàã', e:'éê', i:'í', o:'ÓÔ', u:'úü', c:'ç', n:'ñ'};
        for (let key in hash){
            //er = '(/[' +hash[key]+ ']/gi)';
            r = r.replace(eval('(/[' +hash[key]+ ']/g)'),key);
            r = r.replace(eval('(/[' +hash[key].toUpperCase()+ ']/g)'),key.toUpperCase());
        }
        return r;
    };

    String.prototype.toCapitalize = function (){
        let r=this.split(/\s/gi); var text='';
        for (let i=0; r.length>i;i++){
           text += r[i].trim().substr(0,1).toUpperCase() + r[i].trim().substr(1).toLowerCase() + ' ';
        }
        return text;
    };
    String.prototype.toFirstLower = function (){
        return this.replace(/^[A-Z]/,this[0].toLowerCase())
    };
    String.prototype.toFirstUpper = function (){
        return this.replace(/^[a-z]/,this[0].toUpperCase())
    };
    String.prototype.toSeparate = function (delimiters){
        let text='';
        if (j$.Ext.isArray(delimiters)){
            for (let i=0; delimiters.length > i;i++)
                text += delimiters[i];
        } else {
            text += delimiters;
        }
        return this.split(eval('(/['+ text +']/gi)'));
        // return r.join(' ');
    };
    String.prototype.toCaption = function (delimiters){
        if (delimiters==undefined)
            delimiters = '_.-';
        let ar =  this.toSeparate(delimiters);
        for (let i=0; ar.length>i;i++)
            ar[i]=ar[i].stripChar('_.<>*!$&;:"\'@+#-%^)(').trim(); // Remove Caracteres
        return ar.join(' ').toCapitalize().trim();
    };    
    String.prototype.toKey = function (){
        let r=this;
        r = r.stripChar('_.<>*!$&;:"\'@+#%^)(-'); //Remove Caracteres
        r = r.toCapitalize();
        r = r.replace(/\s/gi,''); // Remove espaços
        r = r.noAccent();  // Troca as Letras acentuadas
        return r;
    };    
    String.prototype.stripChar = function (delimiters){
        let r =this, text='', er='';
        if (j$.Ext.isArray(delimiters)){
            for (let i=0; delimiters.length > i;i++)
                text += delimiters[i];
        } else {
            text += delimiters;
        }

        if (delimiters==undefined || text.isEmpty())
            er = '(/[ ]/gi)';
        else
            er = '(/['+ text +']/gi)';
        r = r.replace(eval(er),'');
        return r;
    };
    String.prototype.startsWith=function(pattern) {
        return this.lastIndexOf(pattern, 0) === 0;
    }
    String.prototype.regexValidate = function(regularExpression){
        if (this.isEmpty())
            return false;
        return (!this.match(regularExpression))?false:true;
    }
    String.prototype.module11 = function(nrDigit, limiteMult)  {
        let dig;
        let NumDig = (nrDigit)?nrDigit:1;
        let LimMult = (limiteMult)?limiteMult:this.length;
        let value = this;

        let Soma = 0;
        let Mult = 2;
        for(let i=value.length-1; i>=0; i--)      {
            Soma += (Mult * parseInt(value.charAt(i)));
            if(++Mult > LimMult) Mult = 2;
        }
        dig =((Soma * 10) % 11) % 10;
        if (NumDig>1)
            dig += ''+(value+dig).module11(--NumDig,LimMult);

        return dig;
    }
    String.prototype.digitoCpf = function()  {
        return this.module11(2,12);
    }
    String.prototype.digitoCnpj = function()  {
        return this.module11(2,9);
    }
    String.prototype.digitoCca = function()  {
        return this.module11();
    }
    String.prototype.ehCpf = function()  {
        let digito = this.substr(this.length-2,2);
        let num = this.substr(0,this.length-2);
        let digito_ok = num.digitoCpf();
        return (digito_ok == digito )?true:false;
    }
    String.prototype.ehCnpj = function()  {
        let digito = this.substr(this.length-2,2);
        let num = this.substr(0,this.length-2);
        let digito_ok = num.digitoCnpj();
        return (digito_ok == digito )?true:false;
    }
    String.prototype.ehCca = function()  {
        let digito = this.substr(this.length-1,1)
          , num = this.substr(0,this.length-1)
          , digito_ok = num.digitoCca();
        return (digito_ok == digito )?true:false;
    }
    String.prototype.ehCep = function(){
        let expReg =/^[0-9]{5}[-]{0,1}[0-9]{3}$/;
        return (!this.regexValidate(expReg))?false:true;
    }
    String.prototype.ehPlaca = function(){
        let expReg =/^[A-Z]{3}[-]{0,1}[0-9]{4}$/;
    //    if (withoutMask)
    //        expReg = /^[A-Z]{3}{0,1}[0-9]{4}$/;
        return (!this.regexValidate(expReg))?false:true;
    }
    // Esse � o script
    String.prototype.isName = function(){
        let words = this.replace(/^\s*/, "").replace(/\s*$/, "").split(/\s/gi)
          , nameIsValid = (words.length>1);
        if (nameIsValid){
            for (let i=0; i<words.length; i++){
                nameIsValid = (words[i].length>1);
                if (!nameIsValid)
                    break;
            }
        }
        return nameIsValid;
    };
    String.prototype.isLetter = function(){
    //    return (!this.regexValidate(/^[:alpha:]/))?false:true;
        if (this.isEmpty()){return false;}
        let alfabeto = "ABCDEFGHIJKLWMNOPQRSTUVXYZÁÉÍÓÚÃÕÊÔ ";
        let campo_maiusculo = this.toUpperCase();
        for (let cont = 0; cont < campo_maiusculo.length; cont++ ){
                let parte_campo = campo_maiusculo.charAt(cont);
                if ( alfabeto.indexOf(parte_campo) == -1 )
                return false;
        }
        return true;
    }
    String.prototype.isDigit = function(){
        return (!this.regexValidate(/^[0-9]{1,1}$/))?false:true;
    }   
    String.prototype.isNumeric = function(decimal=0){
        let expReg =/(\d{1,}[,]{1}\d{1,})|(^\d+$)/;
        return (!this.regexValidate(expReg))?false:true;
    }
    String.prototype.isDecimal = function(decimal=0){
        let expReg =/(\d{1,}[,]{1}\d{1,})|(^\d+$)/;
        return (!this.regexValidate(expReg))?false:true;
    }
    String.prototype.isInteger = function(){
        return (!this.regexValidate(/^[0-9]{1,}$/))?false:true;
    }
    String.prototype.isMoney = function(){
        let expReg =/^(\d{1,}[,]{1}\d{1,2}$)|(^\d+$)/;
        return (!this.regexValidate(expReg))?false:true;
    }
    String.prototype.isDate = function(){
        let expReg = /^((((0?[1-9]|[12]\d|3[01])[\.\-\/](0?[13578]|1[02])[\.\-\/]((1[6-9]|[2-9]\d)?\d{2}))|((0?[1-9]|[12]\d|30)[\.\-\/](0?[13456789]|1[012])[\.\-\/]((1[6-9]|[2-9]\d)?\d{2}))|((0?[1-9]|1\d|2[0-8])[\.\-\/]0?2[\.\-\/]((1[6-9]|[2-9]\d)?\d{2}))|(29[\.\-\/]0?2[\.\-\/]((1[6-9]|[2-9]\d)?(0[48]|[2468][048]|[13579][26])|((16|[2468][048]|[3579][26])00)|00)))|(((0[1-9]|[12]\d|3[01])(0[13578]|1[02])((1[6-9]|[2-9]\d)?\d{2}))|((0[1-9]|[12]\d|30)(0[13456789]|1[012])((1[6-9]|[2-9]\d)?\d{2}))|((0[1-9]|1\d|2[0-8])02((1[6-9]|[2-9]\d)?\d{2}))|(2902((1[6-9]|[2-9]\d)?(0[48]|[2468][048]|[13579][26])|((16|[2468][048]|[3579][26])00)|00))))$/;
        return (!this.regexValidate(expReg))?false:true;
    }
    String.prototype.isDateTime = function(){ return true}
    String.prototype.isColor = function(){ return true}
    String.prototype.isRange = function(){return true}
    String.prototype.isHour = function(){
        let expReg =/^([0-1][0-9]|[2][0-3]):[0-5][0-9]$/;
        return (!this.regexValidate(expReg))?false:true;
    }
    String.prototype.isPhone = function(withoutMask){
        let expReg =/\(?\d{3}\)?\d{4}-\d{4}/;
        if (withoutMask)
            expReg = /\d{11}/;
        return (!this.regexValidate(expReg))?false:true;
    }
    String.prototype.isEmail = function(){
        let expReg = /^[A-Za-z0-9_\-\.]+@[A-Za-z0-9_\-\.]{2,}\.[A-Za-z0-9]{2,}(\.[A-Za-z0-9])?/;
        return (!this.regexValidate(expReg))?false:true;
    }
    String.prototype.format = function(mask){
        return j$.Ext.format(this, mask);       
    };    
    String.prototype.isValidInMask = function(mask){
        mask =mask.replace(/[#]/g,'9'); // para adequar as mascaras usadas na edicaoo
        mask =mask.replace(/[@]/g,'X'); // para evitar que retira quando da remoca de todos os caracteres especiais;
        let value=this.stripChar(mask.replace(/\w|[@]/g,"")).trim() // Retira os separadores, caso estejam no valor;
          , masks=mask.replace(/\W/g,"") // remove os separadores
          , valid=false;
        for (let i=0;i<masks.length;i++){
            let character = value[i]
              , maskChar=masks[i];
            //#todo: Usar os valores de  config
            if ('09'.indexOf(maskChar)!=-1){ //Valida se eh numero
                valid = character.isDigit();
            }else if('XAa'.indexOf(maskChar)!=-1){ //Valida letras
                valid = character.isLetter();
                if (valid){
                    if ((maskChar=='A' && character!=character.toUpperCase())
                    ||  (maskChar=='a' && character!=character.toLowerCase())){valid=false}
                }
            }
            if (!valid){return false}
        }
        return valid;
    };
    String.prototype.toMoney=function(decimals){
        let value = this.toString().replace(",",'.');
        return j$.Ext.moneyFormat(value,decimals);
     } 
    //@note: procura por valor no objeto e retorna array com as propriedades que contem o valor
    String.prototype.toggle = function(values){
        return (this === values[1]) ?values[0] :values[1]       
    }      
    String.preset= function(value, vlDefault='') {
        return (value == null) ?vlDefault :String(value);
    }
    Boolean.prototype.isEmpty = function(){ return false}
    Boolean.prototype.format = function(){
        return j$.Ext.format(this);       
    };
    // For convenience...
    Date.prototype.format = function (mask, utc) {return j$.Ext.dateFormat(this, mask, utc)}

    //@note: procura por valor no objeto e retorna array com as propriedades que contem o valor
    Object.isEmpty = function(source){
        for (let key in source)
            return false;
        return true;
    }

    //@note: procura por valor no objeto e retorna array com as propriedades que contem o valor
    Object.getByValue = function(source, value, attribute="value"){
        let items=[]
        for (let key in source){
            if (j$.Ext.isObject(source[key])){
                if (source[key][attribute]){// objeto tem uma propriedade value
                    if (source[key][attribute] == value)
                        items.push(key);
                }
            }else{
                if (source[key] == value)
                    items.push(key);
            }
        }
        return (items.length>0) ?items :null;
    }

    //@note: definir um valor para uma propriedade de um método, caso a mesma nao seja informada;
    // é uma forma de garantir que certa propriedade estará presente no objeto
    Object.preset = (receiver={}, propertie, defaultvalue)=>{
        if (j$.Ext.isObject(propertie)){ // copia propriedades do objeto
        for (let key in propertie)
            Object.preset(receiver, key, propertie[key]);
        }else{
            if (j$.Ext.isDefined(receiver[propertie]) == false){ // cria caso não exista
                receiver[propertie] = defaultvalue;
            }else{
            if (j$.Ext.isString(receiver[propertie]) && receiver[propertie].isEmpty())
                receiver[propertie] = defaultvalue; // garante o valor caso exista a propriedade sem valor
            }
        }
        return receiver;
    };
    Object.toLowerCase = (propertie)=>{
        let receiver ={};
        if (j$.Ext.isObject(propertie)){ // copia propriedades do objeto
            for (let key in propertie){
                let value = propertie[key]
                if (j$.Ext.isObject(value))  
                    value=Object.toLowerCase(value)
                receiver[key.toLowerCase()] = value
            }
        }
        return receiver;
    };
    //@note: Junta o objeto provider ao objeto receiver
    Object.join = function(receiver,provider, properties){
        if (properties) { // Um Join apenas com algumas propriedades
            for(let i=0; i<properties.length; i++)
                Object.preset(receiver, properties[i], provider[properties[i]]);
        } else {          // Um Join com todas as propriedades
            for (let key in provider)
                Object.preset(receiver, key, provider[key]);
        }
        return receiver;
    };

    //@note: Junta o objeto server e provider em objeto receiver(novo objeto)
    Object.merge = function(server,provider, properties){
        let receiver={};
        if (properties) { // Um Merge apenas com algumas propriedades
            for(let i=0; i<properties.length; i++){
                Object.preset(receiver, properties[i], server[properties[i]]);
                Object.preset(receiver, properties[i], provider[properties[i]]);
            }
        } else {         // Um Merge com todas as propriedades
            for (let key in server) // copia todas as propriedades do SERVER para o RECEIVER
                receiver[key]= server[key];
            Object.join(receiver,provider);
        }
        return receiver;
    };

    //@note: SE EXISTIR NO PROVIDER,sobrescreve ou adiciona atributos definidos em Properties no RECEIVER
    Object.setIfExist = function(receiver, provider, properties){
        if (properties){
            if (j$.Ext.isArray(properties)){
                for (let idx=0; properties.length>idx;idx++)
                    Object.setIfExist(receiver, provider, properties[idx]);
            }else{
                if (provider[properties]!=undefined && provider[properties]!=null)
                    receiver[properties] = provider[properties];
            }
        }else // irá copiar tudo o que existe no provider
            Object.setIfExist(receiver, provider, Object.keys(provider));
        return receiver;
    };
    //@note: retorna um objeto mapeado(de-para) conforme o objeto mapTo com os campos que existem no primeiro objeto
    // Se exitir no provider, mapeia com o novo nome, se não existir, não irá no objeto
    Object.map = function(provider,  mapTo){
        let receiver = {};       
        for (let key in mapTo){           
            if (provider[key]!=undefined)
                receiver[mapTo[key]] = provider[key];       
        }    
        return receiver;
    };
    // let aux = Object.map({a:1, b:2, c:"Eu", d:4},{a:"a1", b:"b", c:"nome", f:"f"})

    Object.show = source=>{
        for (let key in source){
            //let _t = source[key].constructor.name[0].toLowerCase();
            console.log(`${key}:`,source[key]);
        }
    }
    // let aux = {text:"texto", nro: 1, ar:[1,2], obj:{nm:1, nr:2}, fn:()=>"2", dt:c$.NOW, fnc: function(){}}
    // Object.show(aux)

    //@note: copia metodos ou props de um objeto para outro
    Object.mixin=function(receiver, provider, methods){
        if (methods) { // Um Mixin fornecendo alguns métodos
            for (let i=0; i<methods.length; i++)
                receiver.prototype[methods[i]] = provider.prototype[methods[i]];
        } else {       // Um Mixin fornecendo todos os métodos
            for (let method in provider.prototype) { // verificando se a classe receptora já possui tal método do loop...
                if (receiver.prototype[method]==undefined)
                receiver.prototype[method] = provider.prototype[method];
            }
        }
        return receiver;
    }

    Object.compare = function(source, target, key){
    // compara se conteúdo do literal target existe em source
        let r = true;
        if (key) { // compara por uma chave
            if (j$.Ext.isString(key)) // a chave de comparação é simples
                r = (source[key] == target[key])?true:false;
            else{ // a chave de comparação é composta por mais de um atributo
                for(let i=0; i<key.length;i++){
                    if (source[key[i]] != target[key[i]])
                        return false;
                }
            }
        } else { // compara com todas as propriedades existente no objeto de comparação(target)
            for (let fld in target){
                if (source[fld] != target[fld])
                    return false;
            }
        }
        return r;
    };

    //@note: verifica se source contains target
    Object.contains = function(source, target, key){
        let r = true;
        if (j$.Ext.isObject(target)) {
            for (let key in target){
                if (!j$.Ext.isDefined(source[key]) || source[key]!=target[key])
                    return false;
            }
        }else{ // a chave de comparação é composta por mais de um atributo
            return (j$.Ext.isDefined(source[key]) && source[key] == target)?true:false;
        }
        return r;
    };

    Object.build = (key, value)=>{
        let obj ={}
        obj[key]=value;
        return obj;
    }
    // console.log(Object.build("A",4))
    // ->Object {A: 4}

    // retorna a primeira proprieda que encontrar no objeto que estah no array 'keys'
    Object.synonym = function(source, keys){
        let key = keys.find(key => {return (source[key])});
        return (key) ?source[key] :null;
    }

    // retorna true proprieda se encontrar uma das propriedades no objeto 
    Object.exists = function(source, keys){
        let key = keys.find(key => {return (source[key])});
        return (key) ?true :false;
    }
    // retorna a primeira das chaves(keys) que encontrar  no objeto 
    Object.firstKey = function(source, keys){
        return keys.find(key => {return (source[key])});
    }
    // retorna a primeiro valor entre as chaves(key) que encontrar  no objeto 
    Object.firstValue = function(source, keys){
        let key = keys.find(key => {return (source[key])});
        return (key) ?source[key] :null;
    }

    Object.identify = (receicer, keys=['key','id'], labels=["label", "caption"])=>{
        function search(key, values){
            let vl = Object.synonym(receicer,values);
            if (vl) // para evitar um null
                receicer[key] = vl.toString().stripChar(" "); 
        }   
        function each(values) {
            keys.forEach(key=>{
                if (!receicer[key])
                search(key, values)       
            })
            return Object.exists(receicer,keys);
        }
        if (!each(keys))
            each(labels)
        return receicer;
    }

    // label serah o default e que deve ser garantido
    // se tem caption nao tem label, serah criado label=caption
    Object.label = (receicer, labels=["label", "caption"], keys=['key','id'])=>{
        let key = labels[0];
        function search(values){
            let vl = Object.synonym(receicer,values);
            if (vl) // para evitar um null
                receicer[key] = vl;
            return vl   
        }
        if (!receicer[key]){
            if (!search(labels))          
                search(keys)       
        }
        return receicer;
    }

    Function.prototype.inheritsFrom = function(parentClassOrObject){
        if ( parentClassOrObject.constructor == Function ) 	{
            //Normal Inheritance
            this.prototype = new parentClassOrObject;
            this.prototype.constructor = this;
            this.prototype.parent = parentClassOrObject.prototype;
        }else{
            //Pure Virtual Inheritance
            this.prototype = parentClassOrObject;
            this.prototype.constructor = this;
            this.prototype.parent = parentClassOrObject;
        }
        return this;
    }
    // function animal(nome){
    // 	this.nome=nome;
    //   this.grite=function(){console.log(this.nome+" Miau.......");};
    // }
    // function Gato( nome ){
    // 	this.nome=nome;
    // }
    // Gato.inheritsFrom( animal );
    // var felix = new Gato( "Felix" );
    // felix.grite();

    //Array.prototype.each = Array.prototype.forEach;

    Array.prototype.has = Array.prototype.includes;
    // var aux = [1,'test',2]; aux.has(1);aux.has('test');aux.has(4)
    // Alias para o each
    // #todo: remover sweep de todo o framework
    Array.prototype.sweep = Array.prototype.forEach;

    //var aux=[{a:1, b:2},{a:2, b:2},{a:3, b:2},{a:4, b:2}]
    //console.log(aux.select(item=>{ return (item.a<3)} ));
    Array.prototype.select = function(callback /*, parms*/){
        let results = [];
        if (typeof callback != "function")
            throw new TypeError();

        for (let i = 0; i < this.length; i++){
            if (i in this){
                if (callback(this[i]))
                    results.push(this[i]);
            }
        }
        return results;
    }; 
    return {
         ui:{}
        ,sample:{}
        ,$V:key =>{ //Exemplo: j$.$V() ou j$.$V("$R")
            //@note: util apenas em dsv para ver os objetos/colecoes e seus respectivos shortcut - que estão instanciados
            let shortCut = {"$C":"Controller:","$P":"Page:","$R":"Resource:","$S":"Service:", "$T":"Tabs:"};
            for (let id in shortCut){
                if (j$[id]){
                    if (key){
                        if (id==key)
                        console.log(j$[id]);
                    }else{
                        console.log(shortCut[id]+id);
                        console.log(j$[id]);
                    }
                }
            }
        }
    }
}();

j$.Ext = function(){
    const toRecord=(name, parent)=>{
        if (parent){
            parent.id   = 'id' +name.toFirstUpper();
            parent.text = 'tx' +name.toFirstUpper();
            return parent;
        } else {
            return {id: 'id'+name.toFirstUpper()
                , text: 'tx'+name.toFirstUpper()}
        }
    }
    const toObject=(source, key="key")=>{
        if (j$.Ext.isObject(source))
           return source;
        else {
           let obj={}
           obj[key]=source;
           return obj;
        }
    }    
    // j$.Ext.toObject({a:'1', nome:"Eu"}); j$.Ext.toObject("Eu", 'class'); j$.Ext.toObject("Eu");
    //, toMoney=value=>{}
        // value = value.toString().replace(",",'.');
        // return moneyFormat(value, 2);
     
    const maskFormat = function(value,mask){
        mask =mask.replace(/[#]/g,'9'); // para adequar as mascaras usadas na edicao
        mask =mask.replace(/[@]/g,'X'); // para evitar que retira quando da remocao de todos os caracteres especiais;
        mask = (mask=='9,99')?'999.999.999.999,99':mask;
        value=value.stripChar(mask.replace(/\w|[@]/g,""));    // Retira os separadores, caso estejam no valor;
        value=stuff(value.trim(), mask.replace(/\W/g,""));
        let masks=mask.replace(/\W/g," ").split(' ')          // monta um array  com as mascaras - sem os separadores
          , separators=$A(mask.replace(/\w/g,""))             // monta um array  com os separadores
          , startSeparator = (mask[0].match(/\W/))?mask[0]:'' // Pega o separador, quando tem na primeira posicao
          , formattedText=""
          , initPosition = 0;
        for (let i=0;i<masks.length;i++){
            let separator=separators[i]?separators[i]:''
              , maskSplit =  masks[i].trim()// pegar parte da mascara para a formatacao
              , part = value.substr(initPosition, maskSplit.length)  // pega a parte que indicada na mascara, segunda separador
              , maskedText = '';
            for (let k=0;k<part.length;k++){
                let character = part[k];
                if (character==' ' && maskSplit[k]==c$.MASK.NUMBER.FIXED)
                    character=character.replace(character,c$.MASK.NUMBER.FIXED);
                else if (maskSplit[k]=='A')
                    character=character.toUpperCase();
                else if (maskSplit[k]=='a')
                    character=character.toLowerCase();
                maskedText += character;
            }
            formattedText +=  maskedText + ((maskedText.isEmpty())?'':separator);
            initPosition += maskSplit.length;
        }        
        // Completa com zeros a esquerda o valor informado;
        function stuff(value, mask){
            let rest = mask.trim().length - value.length;
            return " ".repeat(rest) + value;
        }
        function $A(iterable) {
            if (!iterable) return [];
            return iterable.split("");
        }
        return startSeparator + formattedText;
    }
    /*Função que padroniza valor*/
    const moneyFormat = function ( value, decimals=2, dec=c$.MASK.DecimalCharacter, sep=c$.MASK.ThousandsSeparator ) {    
        value = !isFinite(+value) ? 0 : +value;
        decimals = !isFinite(+decimals) ? 0 : Math.abs(decimals);

        let s = (decimals > 0) ? value.toFixed(decimals) : Math.round(value).toFixed(decimals)
        , abs = Math.abs(value).toFixed(decimals)
        , _, i;

        if (abs >= 1000) {
            _ = abs.split(/\D/);
            i = _[0].length % 3 || 3;

            _[0] = s.slice(0,i + (value < 0)) +
                _[0].slice(i).replace(/(\d{3})/g, sep+'$1');

            s = _.join(dec);
        } else 
            s = s.replace('.', dec);

        return s;
    }

    const dateFormat = function () {
        let	token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
            timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
            timezoneClip = /[^-+\dA-Z]/g,
            pad = function (val, len) {
                val = String(val);
                len = len || 2;
                while (val.length < len) val = "0" + val;
                return val;
            };

        // Regexes and supporting functions are cached through closure
        return function (date, mask, utc) {
            let dF = dateFormat;

            // You can't provide utc if you skip other args (use the "UTC:" mask prefix)
            if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
                mask = date;
                date = undefined;
            }

            // Passing date through Date applies Date.parse, if necessary
            date = date ? new Date(date) : new Date;
            if (isNaN(date)) throw SyntaxError("Data Invalida");

            mask = String(c$.MASK.DATE[mask] || mask || c$.MASK.DATE["default"]);

            // Allow setting the utc argument via the mask
            if (mask.slice(0, 4) == "UTC:") {
                mask = mask.slice(4);
                utc = true;
            }

            let	_ = utc ? "getUTC" : "get",
                d = date[_ + "Date"](),
                D = date[_ + "Day"](),
                m = date[_ + "Month"](),
                y = date[_ + "FullYear"](),
                H = date[_ + "Hours"](),
                M = date[_ + "Minutes"](),
                s = date[_ + "Seconds"](),
                L = date[_ + "Milliseconds"](),
                o = utc ? 0 : date.getTimezoneOffset(),
                flags = {
                    d:    d,
                    dd:   pad(d),
                    ddd:  dF.i18n.dayNames[D],
                    dddd: dF.i18n.dayNames[D + 7],
                    m:    m + 1,
                    mm:   pad(m + 1),
                    mmm:  dF.i18n.monthNames[m],
                    mmmm: dF.i18n.monthNames[m + 12],
                    yy:   String(y).slice(2),
                    yyyy: y,
                    h:    H % 12 || 12,
                    hh:   pad(H % 12 || 12),
                    H:    H,
                    HH:   pad(H),
                    M:    M,
                    MM:   pad(M),
                    s:    s,
                    ss:   pad(s),
                    l:    pad(L, 3),
                    L:    pad(L > 99 ? Math.round(L / 10) : L),
                    t:    H < 12 ? "a"  : "p",
                    tt:   H < 12 ? "am" : "pm",
                    T:    H < 12 ? "A"  : "P",
                    TT:   H < 12 ? "AM" : "PM",
                    Z:    utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
                    o:    (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
                    S:    ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
                };

            return mask.replace(token, function ($0) {
                return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
            });
        };
    }();

    // Internationalization strings
    dateFormat.i18n = {
        dayNames: [
            "Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab",
            "Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "S�bado"
        ],
        monthNames: [
            "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dec",
            "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
        ]
    };    

    const format = function(value, mask, utc_decChar, sep){
        let result;
        switch (j$.Ext.type(value)) {
            case 'String':
                result=maskFormat(value,mask);
                break;
            case 'Number':
                //result=maskFormat(String(value),mask);
                result=moneyFormat(value, mask, utc_decChar, sep); // mask = decimals
                break;
            case 'Date':              
                result=j$.Ext.dateFormat(value, mask, utc_decChar) // decChar or utc
                break;
            case 'Boolean':      
                result = CONFIG.BOOLEAN[String(value)].text;        
                break;
            case 'Array':                            
                break;    
            default:
              console.log(`O que fazer com o tipo ${j$.Ext.type(value)}?`);
          }
        return result;  
    };       
    return{
        dateFormat
      , moneyFormat 
      , format
      , toRecord
      , toObject
      ,       init:()=>true
      ,       type:obj=>{return Object.prototype.toString.call(obj).match(/^\[object (.*)\]$/)[1]}
      ,    isArray:obj=>{return (j$.Ext.type(obj)==='Array')}
      ,   isString:obj=>{return (j$.Ext.type(obj)==='String')}
      ,     isDate:obj=>{return (j$.Ext.type(obj)==='Date')}
      ,    isValue:obj=>{return (j$.Ext.type(obj)==='String' || j$.Ext.type(obj)==='Number')}
      ,   isNumber:obj=>{return (j$.Ext.type(obj)==='Number')}
      ,   isObject:obj=>{return (j$.Ext.type(obj)==='Object')}
      ,     isCrud:obj=>{return (j$.Ext.isDefined(obj)) ?(obj.constructor.name==='Crud') :false}
      , isFunction:obj=>{return (j$.Ext.type(obj)==='Function')}
      ,isUndefined:obj=>{return !j$.Ext.isDefined(obj)}
      ,  isDefined:obj=>{return (obj==null || obj==undefined) ?false :true}
      ,hasAnyValue:obj=>{ 
                            if  (j$.Ext.isDefined(obj)){
                                if (j$.Ext.isNumber(obj) ||
                                   (j$.Ext.isString(obj) && !obj.isEmpty()) ||
                                   (j$.Ext.isArray (obj) && obj.length()>0) ||
                                   (j$.Ext.isObject(obj) && !Object.isEmpty(obj)))
                                return true; 
                            }                            
                             return false;                            
                        }
    }
}();

String.prototype.gsub=function(pattern, replacement) {
    let result = '', source = this, match;
    function prepareReplacement(replacement) {
        if (j$.Ext.isFunction(replacement)) return replacement;
        let template = new Template(replacement);
        return function(match) { return template.evaluate(match) };
    }
    replacement = prepareReplacement(replacement);

    if (j$.Ext.isString(pattern))
        pattern = RegExp.escape(pattern);

    if (!(pattern.length || pattern.source)) {
        replacement = replacement('');
        return replacement + source.split('').join(replacement) + replacement;
    }

    while (source.length > 0) {
        if (match = source.match(pattern)) {
        result += source.slice(0, match.index);
        result += String.preset(replacement(match));
        source  = source.slice(match.index + match[0].length);
        } else {
        result += source, source = '';
        }
    }
    return result;
}

function Template(template, pattern) {
    let $this=this;
    let initialized= function() {
        $this.template = template.toString();
        $this.pattern = pattern || Template.Pattern;
    }();
    
    this.evaluate= function(object) {
        return $this.template.gsub($this.pattern
            , function(match) {
                    if (object == null) return (match[1] + '');
                    let before = match[1] || '';
                    if (before == '\\') return match[2];
            
                    let ctx = object, expr = match[3],
                        pattern = /^([^.[]+|\[((?:.*?[^\\])?)\])(\.|\[|$)/;
            
                    match = pattern.exec(expr);
                    if (match == null) return before;
            
                    while (match != null) {
                    var comp = match[1].startsWith('[') ? match[2].replace(/\\\\]/g, ']') : match[1];
                    ctx = ctx[comp];
                    if (null == ctx || '' == match[3]) break;
                    expr = expr.substring('[' == match[3] ? match[1].length : match[0].length);
                    match = pattern.exec(expr);
                    }
                    return before + String.preset(ctx);
        });
    }
};
    Template.Pattern = /(^|.|\r|\n)(#\{(.*?)\})/;
    // var myDiv = new Template("<div class='page' id='#{id}'></div>"); ou var myDiv = new Template("<div class='page' id='#[id]'></div>",/(^|.|\r|\n)($\[(.*?)\])/);
    // myDiv.evaluate({id:'id.999'});

// export default j$.Ext;