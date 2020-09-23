
const t$ = function(){
    let vlr = (value, noDelimiter)=>{
        if (value)
            if (j$.Ext.isString(value))        
            return (noDelimiter) ?value :`"${value}"`;
        // else if (j$.Ext.isNumber(value))   return value;
            else if (j$.Ext.isArray(value))    
                return JSON.stringify(value);      
                //return `[${value.toString()}]`;              
            else if (j$.Ext.isObject(value))   return JSON.stringify(value); 
            else if (j$.Ext.isDate(value))     return value.format("dd/mm/yyyy");            
            else                               return value;
        else
            return "";    
    }
    , ve=(value, fn, result, parms, noDelimiter=false)=>{
        if (fn)
            if (parms && parms[0])
                console.log(`"${value}".${fn}(${vlr(parms, noDelimiter)})=> `.padStart(45,' ')+ vlr(result));
            else
                console.log(`"${value}".${fn}()=> `.padStart(45,' ')+ vlr(result));
        else
            console.log(value);
    }
     , v$=(value, fn, context="j$.Ext")=>{ 
            let text="";
            if (context=="j$.Ext")
                text =  `j$.Ext.${fn}(${vlr(value)})=> `.padStart(40,' ') + j$.Ext[fn](value)
            else  
                text =  `${fn}(${vlr(value)})=> `.padStart(40,' ') + context;
            console.log( text);
    } 
    , v=(fn, result, values)=>{ 
        if (values)
            console.log( `${fn}(${vlr(values)})=> `.padStart(45,' ') + result);
        else    
            console.log( `${fn}=> `.padStart(45,' ') + vlr(result));
    }    
    , join = values=>{
        let res="", del="";
        values.forEach(value=>{
            if (value){
               res = res + del + vlr(value);
               del = ", "
            }    
        })
        return res;
    }
    ,   vo=(fn, receiver, provider, keys)=>{ 
            let vl = join([ receiver, provider, keys]);
            console.log(`Object.${fn}(${vl})=> `.padStart(50,' '));
            console.log(Object[fn](receiver, provider, keys));
    }  
    return{             
            isDigit:value=>{ve(value,"isDigit"  , value.isDigit())}    
    ,     isInteger:value=>{ve(value,"isInteger", value.isInteger())}
    ,     isNumeric:value=>{ve(value,"isNumeric", value.isNumeric())}
    ,       isMoney:value=>{ve(value,"isMoney"  , value.isMoney())}    
    ,        isDate:value=>{ve(value,"isDate"   , value.isDate())}
    ,        isHour:value=>{ve(value,"isHour"   , value.isHour())}
    ,      isLetter:value=>{ve(value,"isLetter" , value.isLetter())}
    ,        isName:value=>{ve(value,"isName"   , value.isName())}
    ,       isEmail:value=>{ve(value,"isEmail"  , value.isEmail())}    
    ,       isEmpty:value=>{ve(value,"isEmpty"  , value.isEmpty())}
    ,       isPhone:value=>{ve(value,"isPhone"  , value.isPhone())}
    ,         ehCPF:value=>{ve(value,"ehCPF"    , value.ehCpf())}
    ,        ehCNPJ:value=>{ve(value,"ehCNPJ"   , value.ehCnpj())}
    ,         ehCCA:value=>{ve(value,"ehCCA"    , value.ehCca())}
    ,         ehCEP:value=>{ve(value,"ehCEP"    , value.ehCep())}
    ,       ehPlaca:value=>{ve(value,"ehPlaca"  , value.ehPlaca())} 
    ,          type:value=>{v$(value,"type")}    
    ,      isString:value=>{v$(value,"isString")} 
    ,      isNumber:value=>{v$(value,"isNumber")}
    ,       isArray:value=>{v$(value,"isArray")} 
    ,      isObject:value=>{v$(value,"isObject")} 
    ,    isFunction:value=>{v$(value,"isFunction")} 
    ,       isValue:value=>{v$(value,"isValue")} 
    ,     isDefined:value=>{v$(value,"isDefined")} 
    ,   isUndefined:value=>{v$(value,"isUndefined")} 
    , isValidInMask:(value,mask)=>{ve(value,"isValidInMask", value.isValidInMask(mask),[mask])}
    ,          Mask:(value,mask)=>{console.log("'"+value+"'.mask("+mask+") => "+ value.mask(mask))}
    ,      module11:(value,dig,lim)=>{ve(value,"module11", value.module11(dig,lim),((dig) ?[dig,lim].join() :""), true)}
    ,     digitoCpf:(value)=>{ve(value,"digitoCpf", value.digitoCpf())}
    ,    digitoCnpj:(value)=>{ve(value,"digitoCnpj", value.digitoCnpj())}
    ,     digitoCca:(value)=>{ve(value,"digitoCca", value.digitoCca())}
    ,        Str:{
                       trim:(value)=>{ve(value,"trim", value.trim())}
            ,      noAccent:(value)=>{ve(value,"noAccent", value.noAccent())}
            ,  toCapitalize:(value)=>{ve(value,"toCapitalize", value.toCapitalize())}
            ,  toFirstLower:(value)=>{ve(value,"toFirstLower", value.toFirstLower())}
            ,  toFirstUpper:(value)=>{ve(value,"toFirstUpper", value.toFirstUpper())}
            ,         toKey:(value)=>{ve(value,"toKey", value.toKey())}
            ,  stringPreset:(value, vlDefault)=>{v$([value, vlDefault],"String.preset", String.preset(value, vlDefault))}
            ,    toSeparate:(value,del)=>{ve(value,"toSeparate", value.toSeparate(del),del)}    
            ,        repeat:(value,times)=>{ve(value,"repeat", value.repeat(times),times)}
            ,     toCaption:(value,del)=>{ve(value,"toCaption", value.toCaption(del),del)}
            ,     stripChar:(value,del)=>{ve(value,"stripChar", value.stripChar(del),del)}
            ,    startsWith:(value,del)=>{ve(value,"startsWith", value.startsWith(del),del)}
        }
    ,       Obj:{
                preset(receiver, provider, keys){vo("preset", receiver, provider, keys)}
              , setIfExist(receiver, provider, keys){vo("setIfExist", receiver, provider, keys)}
              , join(receiver, provider, keys){vo("join", receiver, provider, keys)} 
              , merge(receiver, provider, keys){vo("merge", receiver, provider, keys)} 
              , getByValue(source, value, attribute){vo("getByValue", source, value, attribute)} 
              , compare(receiver, provider, keys){vo("compare", receiver, provider, keys)} 
              , contains(receiver, provider, keys){vo("contains", receiver, provider, keys)} 
              , synonym(receiver, keys){vo("synonym", receiver, keys)} 
              , exists(receiver, keys){vo("exists", receiver, keys)} 
              , identify(receiver, keys, labels){vo("identify", receiver, keys, labels)} 
            }
    ,       Arr:{
                preset(receiver, provider, keys){vo("preset", receiver, provider, keys)}
              , setIfExist(receiver, provider, keys){vo("setIfExist", receiver, provider, keys)}     
        }            
    , ve
    , v
    }
}();

t$.Format = function(){             
return{
        all(){
            t$.ve(" "); t$.Array.preset();        
            return "";
        }  
        , preset(){ 
            t$.ve('<<< Object.preset(receiver, properties, defaultvalue) >>>') 
            t$.ve('Garantir a existencia dos atributos de properties no objeto receiver') 
            t$.Obj.preset({a:1,b:2},'c',{x:1, y:2});    
            t$.Obj.preset({a:1,b:2},{x:1, y:2}); t$.Obj.preset({a:1,b:2,x:null,y:''},{x:1, y:2});                 
        }
}}();
    //t$.Mask("1111222","9,99"); t$.Mask("11112011","##/##/####"); t$.Mask("11222","99.990,00"); t$.Mask("1","000.000");t$.Mask("9281220911","(000)0000-0000");
    //t$.Mask("jgg1111","AAA-0000"); t$.Mask("JGG1111","aaa-0000");t$.Mask("jgG1111","@@@-0000");
    //t$.Mask("jgg1111","AaA-0000");

t$.Object = function(){
return{
    all(){
        t$.ve(" "); t$.Object.preset();
        t$.ve(" "); t$.Object.setIfExist();
        t$.ve(" "); t$.Object.join();
        t$.ve(" "); t$.Object.merge();
        t$.ve(" "); t$.Object.getByValue();
        t$.ve(" "); t$.Object.compare();
        t$.ve(" "); t$.Object.contains();
        t$.ve(" "); t$.Object.synonym();
        t$.ve(" "); t$.Object.exists();
        t$.ve(" "); t$.Object.identify();       
        t$.ve("Object.mixin() => execute t$.Object.mixin()  e veja melhor");
        return "";
    }  
    , preset(){ 
        t$.ve('<<< Object.preset(receiver, properties, defaultvalue) >>>') 
        t$.ve('Garantir a existencia dos atributos de properties no objeto receiver') 
        t$.ve('Só copia de properties, se não existir') 
        t$.Obj.preset({a:1,b:2},'c',{x:1, y:2});    
        t$.Obj.preset({a:1,b:2},{x:1, y:2}); t$.Obj.preset({a:1,b:2,x:null,y:''},{x:1, y:2});                 
    }
    , setIfExist(){
        t$.ve('<<< Object.setIfExist(receiver, provider, properties) >>>') 
        t$.ve('Definir as propriedades no receiver, se existirem no provider') 
        t$.Obj.setIfExist({a:1,b:2},{a:2, c:4,d:'abc'},['a','c','d']);    
        t$.Obj.setIfExist({a:1,b:2},{c:4,d:'abc'},'c'); t$.Obj.setIfExist({a:1,b:2},{c:4,d:'abc'},['c','d','g']);  
        t$.Obj.setIfExist({a:1,b:2},{c:4,d:'abc'},'z'); t$.Obj.setIfExist({a:1,b:2},{c:4,d:'abc'})                
    }
    , join(){
        t$.ve('<<< Object.join(receiver, provider, properties) >>>') 
        t$.ve('Junta o objeto provider ao objeto receiver (retorna o receiver)') 
        t$.Obj.join({a:1,b:2},{a:2, c:4,d:'abc'},['a','c','d']);  
        t$.Obj.join({a:1,b:2},{x:1, y:2});  t$.Obj.join({a:1,b:2,x:null,y:''},{x:1, y:2});     
    }  
    , merge(){
        t$.ve('<<< Object.merge(server, provider, properties) >>>') 
        t$.ve('Retorna a junção de server e provider (retorna um novo objeto)') 
        t$.Obj.merge({a:1,b:2},{a:2, c:4,d:'abc'},['a','c','d']);  
        t$.Obj.merge({a:1,b:2},{x:1, y:2});  t$.Obj.merge({a:1,b:2,x:null,y:''},{x:1, y:2});  
        t$.Obj.merge({},{a:1,b:2,x:null,y:''},['a','b']);      
    } 
    , getByValue(){
        t$.ve('<<< Object.getByValue(source, value, attribute="value") >>>') 
        t$.ve('procura por valor no objeto e retorna array com as propriedades que contem o valor') 
        t$.Obj.getByValue({a:1,b:2,c:1},1);  
        t$.Obj.getByValue({a:{value:1},b:{value:2},c:{value:2}},2); 
        t$.Obj.getByValue({a:{key:1},b:{key:2},c:{key:2}},2); 
        t$.Obj.getByValue({a:{key:1},b:{key:2},c:{key:2}},2,"key");
        t$.Obj.getByValue({a:{key:1},b:{key:2},c:{key:2}},3,"key");       
    }
    , compare(){
        t$.ve('<<< Object.compare(source, target, properties) >>>') 
        t$.ve('Comparar se as propriedades em target de são iguais em source)') 
        t$.Obj.compare({a:1, b:3, x:'A'}, {a:1, b:3, x:'B'},['a','b']);  
        t$.Obj.compare({a:1, b:3, x:'A'}, {a:1, b:2, x:'A'},'a');  
        t$.Obj.compare({a:1, b:3, x:'A'}, {a:1, b:3, x:'A'});  
        t$.Obj.compare({a:1, b:3, x:'A'}, {a:1, b:3, x:'B'}); 
        t$.Obj.compare({a:1, b:3, x:'A'}, {a:1, b:3});    
        t$.Obj.compare({a:1, b:3}, {a:1, b:3, x:'A'}); 
    } 
    , contains(){
        t$.ve('<<< Object.contains(source, target, properties) >>>') 
        t$.ve('Verifica se source contém target') 
        t$.Obj.contains({a:1, b:3, x:'A'}, {a:1, b:3, x:'A'});  
        t$.Obj.contains({a:1, b:3, x:'A'}, {a:1, b:3, y:'A'});  
        t$.Obj.contains({a:1, b:3, x:'A'}, {a:1, b:3, x:'B'}); 
        t$.Obj.contains({a:1, b:3, x:'A'}, {a:1, b:3}); 
        t$.Obj.contains({a:1, b:3, x:'A'}, {a:1, b:2}); 
        t$.Obj.contains({a:1, b:3, x:'A'}, 1,'a');      
    }  
    , exists(){
        t$.ve('<<< Object.exists(source, properties) >>>') 
        t$.ve('retorna true se encontrar uma das propriedades no objeto') 
        t$.Obj.exists({title:"titulo", key:"a"},["id","key"]);  
        t$.Obj.exists({title:"titulo", id:"a"},["id","key"]); 
        t$.Obj.exists({title:"titulo"},["id","key"]);       
    }   
    , synonym(){
        t$.ve('<<< Object.synonym(source, properties) >>>') 
        t$.ve('retorna a primeira proprieda que encontrar no objeto que estah no array "keys"') 
        t$.Obj.synonym({title:"titulo", key:"a"},["id","key"]);  
        t$.Obj.synonym({title:"titulo", id:"a"},["id","key"]); 
        t$.Obj.synonym({id:1, key:"a"}, ["key","id"]); 
        t$.Obj.synonym({id:1, key:"a"}, ["id", "key"]); 
        t$.Obj.synonym({title:"titulo"},["id","key"]);    
    }  
    , identify(){
        t$.ve('<<< Object.identify(source, keys, labels) >>>') 
        t$.ve('Formatar|garantir identificador definidos em keys') 
        t$.Obj.identify({label:"a b"});  
        t$.Obj.identify({id:"1"}); 
        t$.Obj.identify({id:1, key:"a"}, ["key","id"]); 
        t$.Obj.identify({key:"a"}, ["id", "key"]); 
        t$.Obj.identify({title:"new titulo"},["id","key"],['title']); 
        t$.Obj.identify({title:"new titulo"},["id"],["key",'title']);       
        t$.Obj.identify({title:"new titulo",key:'ab'},["id"],["key",'title']);       
    }   
    , mixin(){
        t$.ve('<<< Object.mixin(receiver, provider, methods) >>>') 
        t$.ve('Formatar|garantir identificador definidos em keys');t$.ve("");
        let Car = function(modelo='Ford', cor='Blue'){this.modelo = modelo;  this.cor = cor}
          , carMixin = function(){};
        
        carMixin.prototype = {
          acelerar(){return 'acelera.'}
            ,parar:()=>'para.'
        }
        t$.ve(">>> Source: Car (veja abaixo)")  
        t$.ve(Car); t$.ve("");
        t$.ve(">>> Mixin Provider: carMixin.prototype (veja abaixo)")               
        t$.ve(carMixin.prototype); t$.ve("");

        t$.ve(">>> Fazendo o mixin:"); 
        t$.ve("Object.mixin(Car,carMixin)"); 
        t$.ve("ou... Object.mixin(Car,carMixin,['acelerar']) // para mixin apenas deste método");        
        Object.mixin(Car,carMixin);

        t$.ve("");t$.ve(">>> Criando instancia do novo objeto:"); 
        t$.ve("let fiat = new Car('Fiat','green')");
        let fiat = new Car('Fiat','green');
        t$.ve(`fiat.cor => ${fiat.cor}`);  
        t$.ve(`fiat.acelerar() => ${ fiat.acelerar()}`);  
        t$.ve(`fiat.parar() => ${ fiat.parar()}`);   
        fiat.parar();   
        return "";             
    }                      
}}(); 

t$.String = function(){             
    t$.ve('<<< trim >>>') ;t$.Str.trim("   Geraldo    ");      
    t$.ve('<<< noAccent >>>') ;t$.Str.noAccent("José Mané Baré");
    t$.ve('<<< toCapitalize >>>') ;t$.Str.toCapitalize("José Mané Baré");
    t$.ve('<<< toFirstLower >>>') ;t$.Str.toFirstLower("José Mané Baré");
    t$.ve('<<< toFirstUpper >>>') ;t$.Str.toFirstUpper("josé mané baré");
    t$.ve('<<< toSeparate >>>') ;t$.Str.toSeparate("José Mané Baré"); t$.Str.toSeparate("José-Mané Baré",'-'); t$.Str.toSeparate("José-Mané Baré.Fé",'-. ');
    t$.ve('<<< toKey >>>') ;t$.Str.toKey("id_nome&mt.for-da$xxx&"); 
    t$.ve('<<< String.preset >>>') ;t$.Str.stringPreset(null,1);t$.Str.stringPreset("A","vlDefault");
    t$.ve('<<< repeat >>>') ;t$.Str.repeat("0",5); 
    t$.ve('<<< toCaption >>>') ;t$.Str.toCaption("jose_geraldo.gomes-final","_.-"); t$.Str.toCaption("José-Mané Baré",'-');
    t$.ve('<<< stripChar >>>') ;t$.Str.stripChar("04.150.945-5",['.','-']); t$.Str.stripChar("04 150.945-5",'.-');
    t$.ve('<<< startsWith >>>') ;t$.Str.startsWith("geraldo","G"); t$.Str.startsWith("Geraldo",'G'); t$.Str.startsWith("Geraldo",'e');  
}
t$.Date = function(){              
    let _Date = c$.NOW;
    t$.ve('<<< DATE: Date.format() >>>');
    t$.v('Date.format()'            , _Date.format());
    t$.v('Date.format("dd/mm/yyyy")', _Date.format("dd/mm/yyyy"));
    t$.v('Date.format("yyyymmdd")'  , _Date.format("yyyymmdd"));
    t$.v('Date.format("HH:MM:ss")'  , _Date.format("HH:MM:ss"));
    t$.v('Date.format("ddd mmm")'   , _Date.format("ddd mmm"));
    t$.v('Date.format("dddd mmmm")' , _Date.format("dddd mmmm"));
    t$.v('Date.format(c$.MASK.DATE.shortDate)'     , _Date.format(c$.MASK.DATE.shortDate));
    t$.v('Date.format(c$.MASK.DATE.mediumDate)'    , _Date.format(c$.MASK.DATE.mediumDate));
    t$.v('Date.format(c$.MASK.DATE.longDate)'      , _Date.format(c$.MASK.DATE.longDate));
    t$.v('Date.format(c$.MASK.DATE.fullDate)'      , _Date.format(c$.MASK.DATE.fullDate));
    t$.v('Date.format(c$.MASK.DATE.shortTime)'     , _Date.format(c$.MASK.DATE.shortTime));
    t$.v('Date.format(c$.MASK.DATE.mediumTime)'    , _Date.format(c$.MASK.DATE.mediumTime));
    t$.v('Date.format(c$.MASK.DATE.longTime)'      , _Date.format(c$.MASK.DATE.longTime));
    t$.v('Date.format(c$.MASK.DATE.isoTime)'       , _Date.format(c$.MASK.DATE.isoTime));
    t$.v('Date.format(c$.MASK.DATE.isoDateTime)'   , _Date.format(c$.MASK.DATE.isoDateTime));
    t$.v('Date.format(c$.MASK.DATE.isoUtcDateTime)', _Date.format(c$.MASK.DATE.isoUtcDateTime));
    t$.ve('<<< Validate: String.isDate() >>>');
    t$.Type.date();
}
t$.Digit = function(){             
    t$.ve('<<< CalcDigit >>>') ;t$.module11("04150945");t$.module11('417660402',2,12);t$.module11('073114610001',2,9);
    t$.ve('<<< digitoCpf >>>') ;t$.digitoCpf("417660402");     
    t$.ve('<<< digitoCnpj >>>');t$.digitoCnpj("073114610001");
    t$.ve('<<< digitoCca >>>') ;t$.digitoCca("04150945");
}
t$.Type = function(){             
return{
    all(){
        t$.ve(" "); t$.Type.numbers();        
        t$.ve(" "); t$.Type.date();        
        t$.ve(" "); t$.Type.text();        
        t$.ve(" "); t$.Type.specials();        
        t$.ve(" "); t$.Type.mask();        
        t$.ve(" "); t$.Type.types();        
        return "";
    }  
    , numbers(){ 
        t$.ve('NUMÉRICOS: t$.Type.numbers() >>>')            
        t$.ve('<<< isDigit   >>>');t$.isDigit(''); t$.isDigit('A'); t$.isDigit('1');
        t$.ve('<<< isInteger >>>');t$.isInteger(''); t$.isInteger('A'); t$.isInteger('1');t$.isInteger('1,2'); t$.isInteger('1.2');
        t$.ve('<<< isNumeric >>>');t$.isNumeric(''); t$.isNumeric('A'); t$.isNumeric('1');t$.isNumeric('1,2'); t$.isNumeric('1.2');
        t$.ve('<<< isMoney   >>>');t$.isMoney(''); t$.isMoney('A'); t$.isMoney('1');t$.isMoney('1,2'); t$.isMoney('1.2');                 
    }
    , date(){                   
        t$.ve('DATE | TIME: t$.Type.date() >>>')            
        t$.ve('<<< isDate   >>>');t$.isDate('29/02/2011'); t$.isDate('28/02/2011'); t$.isDate('29/02/2008');
        t$.isDate('31/04/2011'); t$.isDate('31/05/2011'); t$.isDate('31/08/2008');
        t$.ve('<<< isHour >>>');t$.isHour('23:59'); t$.isHour('00:00'); t$.isHour('24:00');t$.isHour('12:00'); t$.isHour('12:60');
    }        
    , text(){    
        t$.ve('TEXTOS: t$.Type.alfa() >>>')            
        t$.ve('<<< isLetter  >>>');t$.isLetter(' A '); t$.isLetter('1'); t$.isLetter('a'); t$.isLetter('�');t$.isLetter(' ');
        // Obsert$.ver que n�o estah considerando espacos em branco
        t$.ve('<<< isName    >>>');t$.isName(' Geraldo '); t$.isName(' Geraldo Gomes '); t$.isName(' Geraldo F. Gomes ');
        t$.isName(' Joseh Geraldo Gomes '); t$.isName(' Geraldo A '); t$.isName(' A Gomes ');            
        t$.ve('<<< isEmail   >>>');t$.isEmail('abc@xiba.com'); t$.isEmail('abc@xiba'); t$.isEmail('abc_xiba');               
    }  
    , specials(){   
        t$.ve('ESPECIAIS: t$.Type.specials() >>>')            
        t$.ve('<<< isPhone   >>>');t$.isPhone('(092)8122-0911'); t$.isPhone('(092)81220911'); 
        t$.isPhone('(092) 8122-0911');t$.isPhone('8122-0911'); t$.isPhone('12:60');
    
        t$.ve('<<< ehCPF     >>>');t$.ehCPF('41766040268'); t$.ehCPF('41766040267');  
        t$.ve('<<< ehCNPJ    >>>');t$.ehCNPJ(''); t$.ehCNPJ('07311461000125'); t$.ehCNPJ('07311461000124');
        t$.ve('<<< ehCCA     >>>');t$.ehCCA(''); t$.ehCCA('041509455'); t$.ehCCA('041509456');t$.ehCCA('1');
        t$.ve('<<< ehCEP     >>>');t$.ehCEP('69029-80'); t$.ehCEP('69029-080'); t$.ehCEP('6902-080'); t$.ehCEP('69029-0801'); t$.ehCEP('690219-080');
        t$.ve('<<< ehPlaca   >>>');t$.ehPlaca('JXX-9999'); t$.ehPlaca('GG-1111'); t$.ehPlaca('JXG-10801');
        t$.ehPlaca('JG1-1000'); t$.ehPlaca('JGG-G080');
    }  
    , mask(){  
        t$.ve('MASK: t$.Type.mask() >>>')                        
        t$.ve('<<< isValidInMask >>>');t$.isValidInMask("1111","####");t$.isValidInMask("(92)111-abc","(99)999-aaa"); 
        t$.isValidInMask("92111abc","(99)999-aaa");t$.isValidInMask("(92)111-a1c","(99)999-aaa");
        t$.isValidInMask("1111","@###");t$.isValidInMask("A111","@###");         
    }    
    , types(){  
        t$.ve('DATA TYPES: t$.Type.types() >>>')     
        t$.ve('<<< type >>>');t$.type("");t$.type("Nome");t$.type(1);t$.type();t$.type(null);
        t$.type(["Nome",2]);t$.type({a:"alf", b:50});t$.type(()=>{});                    
        t$.type(c$.NOW);t$.type(true);
        t$.ve('<<< isString >>>');t$.isString("");t$.isString("Nome");t$.isString(1);t$.isString();t$.isString(null);
        t$.isString(["Nome",2]);t$.isString({a:"alf", b:50});t$.isString(()=>{}); 
        t$.ve('<<< isNumber >>>');t$.isNumber("12");t$.isNumber(123);
        t$.ve('<<< isObject >>>');t$.isObject("123");t$.isObject({a:"alf", b:50});
        t$.ve('<<< isFunction >>>');t$.isFunction("123");t$.isFunction(()=>{});
        t$.ve('<<< isArray >>>');t$.isArray("123");t$.isArray(["Nome",2]);
        t$.ve('<<< isValue >>>');t$.isValue();t$.isValue(null);t$.isValue("1");t$.isValue(1);t$.isValue(["Nome",2]);t$.isValue("Resource");
        t$.ve('<<< isUndefined >>>');t$.isUndefined();t$.isUndefined(null);t$.isUndefined("1");t$.isUndefined(1);
        t$.isUndefined(["Nome",2]);t$.isUndefined({a:"alf", b:50});t$.isUndefined(()=>{});
        t$.ve('<<< isDefined >>>');t$.isDefined();t$.isDefined(null);t$.isDefined("1");t$.isDefined(1);
        t$.isDefined(["Nome",2]);t$.isDefined({a:"alf", b:50});t$.isDefined(()=>{});       
        t$.ve('<<< isEmpty >>>');t$.isEmpty('');t$.isEmpty(' '); t$.isEmpty('A');
    }
}}();