const t$ = function(){    
    let designers={   
        accordion: function(){   
            function wrap(value, tag='p'){
                return `<${tag}>${value}</${tag}>`;
            }
            function bold(value, strong=true){
                return strong ?wrap(value,'strong') :value;
            }
            function show(value, tag='p', strong=false, cr=false){
                let res = cr ?"<br>" :""
                return wrap(bold(value,strong),tag)+res; 
            }
            function cr(){            
                return "<br>"; 
            }
            function descr(value){
                return wrap(wrap(bold(value),"i"),'h5')+"<br>"; 
            }
            function header(value, id){        
                return `<h2 class="accordion-header"><button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#${id}" aria-expanded="false" aria-controls="${id}">
                            <strong>${bold(value)}</strong></button></h2>`;
            }
            function body(value, id){        
                return  `<div id="${id}" class="accordion-collapse collapse" ><div class="accordion-body">${value}</div></div>`
            }
            function item(header, body){        
                return  `<div class="accordion-item">${header}${body}</div>`
            }     
            function create(content, id){        
                return  `<div class="accordion" id=${id}>${content}</div>`
            }             
            function card(text,  title="",subtitle="",link=""){                                
                return `<div class="card"><div class="card-body">
                            <h5 class="card-title">${title}</h5>
                            <h6 class="card-subtitle mb-2 text-muted">${subtitle}</h6>
                            <p class="card-text">${text}</p>
                            <a href="#" class="card-link">${link}</a>
                        </div></div><br>`; 
            }   
            function ftmCard(r$){
                let _c = "";
                if (j$.Ext.isDefined(r$))
                   _c = (j$.Ext.isString(r$))
                      ? r$
                      : card(r$.text, r$.title, r$.subtitle, r$.link) 
                return _c;           
            }          
            function add(r$){                                
                let tx = t$.item(t$.header(r$.header, r$.id)
                                ,t$.body(ftmCard(r$.card) + r$.body, r$.id)
                            )
                    return r$.parent ?tx :create(tx, `${r$.id}Root`);                  
            }             
            
            return {item, header, body, show, create, descr, cr, card, add}        
        }()
        , log: function(){   
            function show(value){
                console.log(value);
                return "";
            }
            function cr(){            
                console.log("");
                return ""; 
            }
            function item(header, body){return  show(header+body)}     
            function create(content){return show(content)}      
            function add(r$){        
                return show(r$.header)
                     + r$.card? show(r$.card) :""
                     + show(r$.body)
            }      

            return {item, header:show, body:show, show, create, descr:show, cr, card:show, add}        
        }()
    }
    
    function show(value, tag, strong, cr=false){
       return t$.show(value, tag, strong, cr);      
    }
    init = designer=>{
        Object.setIfExist(t$, designers[designer],['item', 'header', 'body', 'show', 'create', 'descr', 'card', 'add'])
        t$.cr = designers[designer].cr();
    }
    
    let vlr = (value, noDelimiter, strip)=>{
        if (j$.Ext.isDefined(value))
            if (j$.Ext.isString(value))      return (noDelimiter) ?value :`"${value}"`;
            else if (j$.Ext.isArray(value))  
                return strip ?JSON.stringify(value).replace(/[\[\]]/g,"") :JSON.stringify(value)
            else if (j$.Ext.isObject(value)) return JSON.stringify(value); 
            else if (j$.Ext.isDate(value))   return value.format("dd/mm/yyyy");            
            else                             return value;
        else 
            return value;    
    }
    , ve=(value, fn, result, parms="", noDelimiter=false)=>{
        let text=value;
        if (fn){
            if (parms && parms[0])
                text=`"${value}".${fn}(${vlr(parms, noDelimiter)})=> `.padStart(45,' ')+ vlr(result)
            else
                text=`"${value}".${fn}(${parms})=> `.padStart(45,' ')+ vlr(result);
        }
        return show(text);
    }
    , vt=value=>{return show(value,'h2',true)}
    , vd=value=>{return t$.descr(value)}    
    , v$=(value, fn, context="j$.Ext", strip=false)=>{ 
            let text=`${fn}(${vlr(value,false ,strip)})=> `.padStart(40,' ') + context;
            if (context=="j$.Ext")
                text =  `j$.Ext.${fn}(${vlr(value, false ,strip)})=> `.padStart(40,' ') + j$.Ext[fn](value) 
            return show( text);
    } 
    , v=(fn, result, values)=>{ 
        let text= `${fn}=> `.padStart(45,' ') + vlr(result);
        if (values)
            text= `${fn}(${vlr(values)})=> `.padStart(45,' ') + result;
        return show(text);
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
            let vl = join([receiver, provider, keys])
              ,tx=show(`Object.${fn}(${vl})=> `.padStart(50,' '))
                  +show(Object[fn](receiver, provider, keys));
            return tx;      
    }  
    return{    
        Test:{    
              Chk:{         
                    isDigit:value=>{return ve(value,"isDigit"  , value.isDigit()  )}    
            ,     isInteger:value=>{return ve(value,"isInteger", value.isInteger())}
            ,     isNumeric:value=>{return ve(value,"isNumeric", value.isNumeric())}
            ,       isMoney:value=>{return ve(value,"isMoney"  , value.isMoney()  )}    
            ,        isDate:value=>{return ve(value,"isDate"   , value.isDate()   )}
            ,        isHour:value=>{return ve(value,"isHour"   , value.isHour()   )}
            ,      isLetter:value=>{return ve(value,"isLetter" , value.isLetter() )}
            ,        isName:value=>{return ve(value,"isName"   , value.isName()   )}
            ,       isEmail:value=>{return ve(value,"isEmail"  , value.isEmail()  )}    
            ,       isEmpty:value=>{return ve(value,"isEmpty"  , value.isEmpty()  )}
            ,       isPhone:value=>{return ve(value,"isPhone"  , value.isPhone()  )}
            ,         ehCPF:value=>{return ve(value,"ehCPF"    , value.ehCpf()    )}
            ,        ehCNPJ:value=>{return ve(value,"ehCNPJ"   , value.ehCnpj()   )}
            ,         ehCCA:value=>{return ve(value,"ehCCA"    , value.ehCca()    )}
            ,         ehCEP:value=>{return ve(value,"ehCEP"    , value.ehCep()    )}
            ,       ehPlaca:value=>{return ve(value,"ehPlaca"  , value.ehPlaca()  )} 
            ,          type:value=>{
                return v$(value,"type")
            }    
            ,      isString:value=>{return v$(value,"isString")} 
            ,      isNumber:value=>{return v$(value,"isNumber")}
            ,       isArray:value=>{return v$(value,"isArray")} 
            ,      isObject:value=>{return v$(value,"isObject")} 
            ,    isFunction:value=>{return v$(value,"isFunction")} 
            ,       isValue:value=>{return v$(value,"isValue")} 
            ,     isDefined:value=>{return v$(value,"isDefined")} 
            ,   isUndefined:value=>{return v$(value,"isUndefined")} 
            , isValidInMask:(value,mask)=> {return ve(value,"isValidInMask", value.isValidInMask(mask),[mask])}
            }
            , Dig:{
                   module11:(value,dig,lim)=>{return ve(value,"module11", value.module11(dig,lim),((dig) ?[dig,lim].join() :""), true)}
            ,     digitoCpf:(value)=>{return ve(value,"digitoCpf" , value.digitoCpf())}
            ,    digitoCnpj:(value)=>{return ve(value,"digitoCnpj", value.digitoCnpj())}
            ,     digitoCca:(value)=>{return ve(value,"digitoCca" , value.digitoCca())}
            }    
            , Str:{
                               trim:(value)=>{return ve(value,"trim"        , value.trim())}
                    ,      noAccent:(value)=>{return ve(value,"noAccent"    , value.noAccent())}
                    ,  toCapitalize:(value)=>{return ve(value,"toCapitalize", value.toCapitalize())}
                    ,  toFirstLower:(value)=>{return ve(value,"toFirstLower", value.toFirstLower())}
                    ,  toFirstUpper:(value)=>{return ve(value,"toFirstUpper", value.toFirstUpper())}
                    ,         toKey:(value)=>{return ve(value,"toKey"       , value.toKey())}
                    ,        preset:(value, vlDefault)=>{return v$([value, vlDefault],"String.preset", String.preset(value, vlDefault),true)}
                    ,        repeat:(value,times)=>{return ve(value,"repeat"   , value.repeat(times),times)}
                    ,     toCaption:(value,del)  =>{return ve(value,"toCaption", value.toCaption(del),del)}
                    ,     stripChar:(value,del)  =>{return ve(value,"stripChar", value.stripChar(del),del)}
                    ,    startsWith:(value,del)  =>{return ve(value,"startsWith", value.startsWith(del),del)}
                    ,          Mask:(value,mask) =>{return ve(value,"mask", value.format(mask), mask)}
            }
            , Obj:{
                        preset  (receiver, provider, keys){return vo("preset", receiver, provider, keys)}
                    , setIfExist(receiver, provider, keys){return vo("setIfExist", receiver, provider, keys)}
                    , join      (receiver, provider, keys){return vo("join", receiver, provider, keys)} 
                    , merge     (receiver, provider, keys){return vo("merge", receiver, provider, keys)} 
                    , getByValue(source, value, attribute){return vo("getByValue", source, value, attribute)} 
                    , compare   (receiver, provider, keys){return vo("compare", receiver, provider, keys)} 
                    , contains  (receiver, provider, keys){return vo("contains", receiver, provider, keys)} 
                    , synonym   (receiver, keys)          {return vo("synonym", receiver, keys)} 
                    , exists    (receiver, keys)          {return vo("exists", receiver, keys)} 
                    , identify  (receiver, keys, labels)  {return vo("identify", receiver, keys, labels)} 
                    , label     (receiver, labels, keys)  {return vo("label", receiver, labels, keys)} 
            }
            , Arr:{
                        preset  (receiver, provider, keys){return vo("preset", receiver, provider, keys)}
                    , setIfExist(receiver, provider, keys){return vo("setIfExist", receiver, provider, keys)}     
            }    
        }            
        , ve
        , v
        , vt
        , vd                            
        , init
        //, designer:"accordion"         //log ou acoordion
    }
}();

t$.init("accordion"); //"log"

t$.apiExt = function(){              
   let p=true 
   ,  tx=t$.String(p)
        +t$.Digit(p)
        +t$.Date(p)
        +t$.Format(p)
   return t$.create(tx, 'sampleApi');     
}


t$.Object = function(){
return{
    all(){
        let p=true 
        ,  tx=t$.Object.preset(p)
             +t$.Object.setIfExist(p)
             +t$.Object.join(p)
             +t$.Object.merge(p)
             +t$.Object.getByValue(p)
             +t$.Object.compare(p)
             +t$.Object.contains(p)
             +t$.Object.synonym(p)
             +t$.Object.exists(p)
             +t$.Object.identify(p)   
             +t$.Object.label(p)                    
             //+t$.ve("Object.mixin() => execute t$.Object.mixin()  e veja melhor");
        return t$.create(tx, 'sampleObject');;
    }  
    , preset(parent){ 
        let tx = t$.Test.Obj.preset({a:1,b:2},'c',{x:1, y:2})
                +t$.Test.Obj.preset({a:1,b:2},{x:1, y:2})
                +t$.Test.Obj.preset({a:1,b:2,x:null,y:''},{x:1, y:2});                      
        return t$.add({id:'samplePreset'
                  ,header:'preset'
                  ,  card:{title:'PRESET OBJECT', subtitle: 'Predefinir atributos de um objeto(Só copia de properties, se não existir)', text:'Object.preset(receiver, properties, [defaultvalue])'}
                  ,  body:tx
                  ,parent
                });   
    }
    , setIfExist(parent){
        let tx=t$.Test.Obj.setIfExist({a:1,b:2},{a:2, c:4,d:'abc'},['a','c','d'])
              +t$.Test.Obj.setIfExist({a:1,b:2},{c:4,d:'abc'},'c')
              +t$.Test.Obj.setIfExist({a:1,b:2},{c:4,d:'abc'},['c','d','g'])
              +t$.Test.Obj.setIfExist({a:1,b:2},{c:4,d:'abc'},'z')
              +t$.Test.Obj.setIfExist({a:1,b:2},{c:4,d:'abc'})                  
        return t$.add({id:'sampleSetIfExist'
                  ,header:'setIfExist'
                  ,  card:{title:'SET SE EXISTE NO PROVIDER'
                      , subtitle: 'Garantir no receiver, as propriedades que existem no provider (sobrepõe o receiver se existir no provider)'
                      , text:'Object.setIfExist(receiver, provider, [properties])'}
                  ,  body:tx
                  ,parent
                });    
    }
    , join(parent){
        let tx =t$.Test.Obj.join({a:1,b:2},{a:2, c:4,d:'abc'},['a','c','d'])
               +t$.Test.Obj.join({a:1,b:2},{x:1, y:2})
               +t$.Test.Obj.join({a:1,b:2,x:null,y:''},{x:1, y:2});     
        return t$.add({  id:'sampleJoin'
                    ,header:'join'
                    ,  card:{title:'JUNTAR OBJETOS', subtitle: 'Junta o objeto provider ao objeto receiver (retorna o receiver)', text:'Object.join(receiver, provider, [properties])'}
                    ,  body:tx
                    ,parent
            });   
    }  
    , merge(parent){
        let tx = t$.Test.Obj.merge({a:1,b:2},{a:2, c:4,d:'abc'},['a','c','d'])
                +t$.Test.Obj.merge({a:1,b:2},{x:1, y:2})
                +t$.Test.Obj.merge({a:1,b:2,x:null,y:''},{x:1, y:2})
                +t$.Test.Obj.merge({},{a:1,b:2,x:null,y:''},['a','b']);         
        return t$.add({id:'sampleMerge'
                  ,header:'merge'
                  ,  card:{title:'JUNTAR OBJETOS', subtitle: 'Retorna um novo objeto com a junção de server e provider', text:'Object.merge(server, provider, [properties])'}
                  ,  body:tx
                  ,parent
                });   
    } 
    , getByValue(parent){
        let tx = t$.Test.Obj.getByValue({a:1,b:2,c:1},1)  
                +t$.Test.Obj.getByValue({a:{value:1},b:{value:2},c:{value:2}},2) 
                +t$.Test.Obj.getByValue({a:{key:1},b:{key:2},c:{key:2}},2) 
                +t$.Test.Obj.getByValue({a:{key:1},b:{key:2},c:{key:2}},2,"key")
                +t$.Test.Obj.getByValue({a:{key:1},b:{key:2},c:{key:2}},3,"key")         
        return t$.add({id:'sampleGetByValue'
                  ,header:'getByValue'
                  ,  card:{title:'PROCURAR POR VALOR NO OBJETO', subtitle: 'Procura por valor no objeto e retorna array com as propriedades que contêm este valor', text:'Object.getByValue(source, value, attribute="value") '}
                  ,  body:tx
                  ,parent
                });    
    }
    , compare(parent){
        let tx = t$.Test.Obj.compare({a:1, b:3, x:'A'}, {a:1, b:3, x:'B'},['a','b'])  
                +t$.Test.Obj.compare({a:1, b:3, x:'A'}, {a:1, b:2, x:'A'},'a')  
                +t$.Test.Obj.compare({a:1, b:3, x:'A'}, {a:1, b:3, x:'A'})  
                +t$.Test.Obj.compare({a:1, b:3, x:'A'}, {a:1, b:3, x:'B'}) 
                +t$.Test.Obj.compare({a:1, b:3, x:'A'}, {a:1, b:3})    
                +t$.Test.Obj.compare({a:1, b:3}, {a:1, b:3, x:'A'});   
        return t$.add({id:'sampleCompare'
                  ,header:'compare'
                  ,  card:{title:'COMPARA OBJETOS', subtitle: 'Comparar se as propriedades em target de são iguais em source', text:'Object.compare(source, target, properties) '}
                  ,  body:tx
                  ,parent
                });                    
    } 
    , contains(parent){
        let tx = t$.Test.Obj.contains({a:1, b:3, x:'A'}, {a:1, b:3, x:'A'})  
                +t$.Test.Obj.contains({a:1, b:3, x:'A'}, {a:1, b:3, y:'A'})  
                +t$.Test.Obj.contains({a:1, b:3, x:'A'}, {a:1, b:3, x:'B'}) 
                +t$.Test.Obj.contains({a:1, b:3, x:'A'}, {a:1, b:3}) 
                +t$.Test.Obj.contains({a:1, b:3, x:'A'}, {a:1, b:2}) 
                +t$.Test.Obj.contains({a:1, b:3, x:'A'}, 1,'a');        
        return t$.add({id:'sampleContains'
                  ,header:'contains'
                  ,  card:{title:'OBJETO CONTÉM OUTRO OBJETO', subtitle: 'Verifica se source contém target', text:'Object.contains(source, target, properties) '}
                  ,  body:tx
                  ,parent
                });    
    }  
    , exists(parent){
        let tx = t$.Test.Obj.exists({title:"titulo", key:"a"},["id","key"])
                +t$.Test.Obj.exists({title:"titulo", id:"a"},["id","key"]) 
                +t$.Test.Obj.exists({title:"titulo"},["id","key"]);         
        return t$.add({id:'sampleexists'
                  ,header:'exists'
                  ,  card:{title:'PROPRIEDADES NO OBJETO', subtitle: 'Retorna true se encontrar uma das propriedades no objeto', text:'Object.exists(source, properties)'}
                  ,  body:tx
                  ,parent
                });    
    }   
    , synonym(parent){
        let tx = t$.Test.Obj.synonym({title:"titulo", key:"a"},["id","key"])  
                +t$.Test.Obj.synonym({title:"titulo", id:"a"},["id","key"]) 
                +t$.Test.Obj.synonym({id:1, key:"a"}, ["key","id"]) 
                +t$.Test.Obj.synonym({id:1, key:"a"}, ["id", "key"]) 
                +t$.Test.Obj.synonym({title:"titulo"},["id","key"]);      
        return t$.add({id:'sampleSynonym'
                  ,header:'synonym'
                  ,  card:{title:'ENCONTRAR UMA DAS PROPRIEDADES', subtitle: 'Retorna a primeira proprieda que encontrar no objeto que estah no array "keys"', text:'Object.synonym(source, properties) '}
                  ,  body:tx
                  ,parent
                });    
    }  
    , identify(parent){
        let tx = t$.Test.Obj.identify({label:"a b"})  
                +t$.Test.Obj.identify({id:"1"}) 
                +t$.Test.Obj.identify({id:1, key:"a"}, ["key","id"]) 
                +t$.Test.Obj.identify({key:"a"}, ["id", "key"]) 
                +t$.Test.Obj.identify({title:"new titulo"},["id","key"],['title']) 
                +t$.Test.Obj.identify({title:"new titulo"},["id"],["key",'title'])       
                +t$.Test.Obj.identify({title:"new titulo",key:'ab'},["id"],["key",'title']);         
        return t$.add({id:'sampleidentify'
                  ,header:'identify'
                  ,  card:{title:'@TODO', subtitle: 'Formatar|garantir identificador definidos em keys(@todo)', text:'Object.identify(source, keys, labels) '}
                  ,  body:tx
                  ,parent
                });    
    }   
    , label(parent){
        let tx = t$.Test.Obj.label({caption:"titulo"})  
                +t$.Test.Obj.label({label:"titulo"}) 
                +t$.Test.Obj.label({title:"titulo"},["label","title"])       
                +t$.Test.Obj.label({title:"new titulo",key:'my_key'});    
        return t$.add({id:'sampleLabel'
                  ,header:'label'
                  ,  card:{title:'FORMATAR LABEL NO OBJETO', subtitle: 'Formatar|garantir  as propriedades em labels(@todo)', text:' Object.label(receicer, labels=["label", "caption"], keys=["key","id"])'}
                  ,  body:tx
                  ,parent
                });    
    }      
    , mixin(parent){
        let Car = function(modelo='Ford', cor='Blue'){this.modelo = modelo;  this.cor = cor}
          , carMixin = function(){};
      
        carMixin.prototype = {
            acelerar(){return 'acelera.'}
            ,parar:()=>'para.'
        }
        let tx =t$.ve(">>> Source: Car (veja abaixo)")  
               +t$.ve(Car)
               +t$.cr
               +t$.ve(">>> Mixin Provider: carMixin.prototype (veja abaixo)")               
               +t$.ve(carMixin.prototype)
               +t$.cr
               +t$.ve(">>> Fazendo o mixin:")
               +t$.ve("Object.mixin(Car,carMixin)")
               +t$.ve("ou... Object.mixin(Car,carMixin,['acelerar']) // para mixin apenas deste método");        
        Object.mixin(Car,carMixin);

            tx+=t$.cr
               +t$.ve(">>> Criando instancia do novo objeto:")
               +t$.ve("let fiat = new Car('Fiat','green')");
        let fiat = new Car('Fiat','green');
            tx+=t$.ve(`fiat.cor => ${fiat.cor}`)
               +t$.ve(`fiat.acelerar() => ${ fiat.acelerar()}`)
               +t$.ve(`fiat.parar() => ${ fiat.parar()}`)   
               +fiat.parar();     
        return t$.add({id:'sampleNew'
                  ,header:'SAMPLE NEW'
                  ,  card:{title:'MIXIN DE MÉTODOS', subtitle: 'Fazer mixin de métodos', text:'Object.mixin(receiver, provider, methods)'}
                  ,  body:tx
                  ,parent
                });             
    }                      
}}(); 

t$.Format = function(parent){              
    let id ='sampleFormat'
    , Date = c$.NOW
    ,  tx = t$.item(
                t$.header('FORMATAR DADOS', id)
               ,t$.body(t$.card('t$.Format()', 'FORMATAÇÃO', 'Para ver no log, pode executar o seguinte:')
                     +t$.vd("USAR MÁSCARA")       
                     +t$.Test.Str.Mask("1111222"   ,"9,99")
                     +t$.Test.Str.Mask("11222"     ,"99.990,00")
                     +t$.Test.Str.Mask("9281220911","(000)0000-0000")
                     +t$.Test.Str.Mask("jgg1111"   ,"AAA-0000")
                     +t$.Test.Str.Mask("JGG1111"   ,"aaa-0000")
                     +t$.Test.Str.Mask("jgG1111"   ,"@@@-0000")
                     +t$.Test.Str.Mask("11112011"  ,"##/##/####")
                     +t$.Test.Str.Mask("1"         ,"000.000")
                     +t$.Test.Str.Mask("jgg1111"   ,"AaA-0000")
                     +t$.cr    
                     +t$.vd("BOOLEAN") 
                     +t$.ve('[ BOOLEAN: Boolean.format() ]')
                     +t$.v('true.format()'            , true.format())
                     +t$.v('false.format()'           , false.format())
                     +t$.v('true.format("X")'         , true.format('X'))
                     +t$.v('false.format("X")'        , false.format('X'))
                     +t$.cr
                     +t$.vd('NÚMERO: j$.Ext.format(value, decimals, , decimals_char, separator) ]')
                     +t$.v('j$.Ext.format(1234.56)'              , j$.Ext.format(1234.56)) 
                     +t$.v("j$.Ext.format(1234.56, 2, ',', ' ')" , j$.Ext.format(1234.56, 2, ',', ' '))   
                     +t$.v("j$.Ext.format(1234.56, 2, ',', '')"  , j$.Ext.format(1234.56, 2, ',', ''))   
                     +t$.v("j$.Ext.format(1234.56, 2, ',', '.')" , j$.Ext.format(1234.56, 2, '.', ','))    
                     +t$.v('j$.Ext.format(1000)'                 , j$.Ext.format(1000))   
                     +t$.v('j$.Ext.format(1000,0)'               , j$.Ext.format(1000,0)) 
                     +t$.v('j$.Ext.format(1000,0,"","")'         , j$.Ext.format(1000,0,"",""))   
                     +t$.v('j$.Ext.format(67.311)'               , j$.Ext.format(67.311))    
                     +t$.cr
                     +t$.vd("DINHEIRO") 
                     +t$.ve("12","toMoney", "12".toMoney())
                     +t$.ve("12.1","toMoney", "12.1".toMoney())                                 
                    , id
                )
            )
    return parent ?tx :t$.create(tx, `${id}Root`);
}

t$.String = function(parent){              
    let id = 'sampleString'
    ,  tx =t$.item(
                t$.header('MANIPULAR STRING', id)
               ,t$.body(t$.card('t$.String()', 'TEXTO', 'Para ver no log, pode executar o seguinte:')
                    +t$.vd('trim')         +t$.Test.Str.trim("   Geraldo    ")       
                    +t$.vd('noAccent')     +t$.Test.Str.noAccent("José Mané Baré") 
                    +t$.vd('toCapitalize') +t$.Test.Str.toCapitalize("José Mané Baré") 
                    +t$.vd('toFirstLower') +t$.Test.Str.toFirstLower("José Mané Baré") 
                    +t$.vd('toFirstUpper') +t$.Test.Str.toFirstUpper("josé mané baré") 
                    +t$.vd('toKey')        +t$.Test.Str.toKey("id_nome&mt.for-da$xxx&")  
                    +t$.vd('String.preset')+t$.Test.Str.preset(null,1) 
                                           +t$.Test.Str.preset("A","vlDefault") 
                    +t$.vd('repeat')       +t$.Test.Str.repeat("0",5)  
                    +t$.vd('toCaption')    +t$.Test.Str.toCaption("jose_geraldo.gomes-final","_.-")  
                                           +t$.Test.Str.toCaption("José-Mané Baré",'-') 
                    +t$.vd('stripChar')    +t$.Test.Str.stripChar("04.150.945-5",['.','-']) 
                                           +t$.Test.Str.stripChar("04 150.945-5",'.-') 
                    +t$.vd('startsWith')   +t$.Test.Str.startsWith("geraldo","G")  
                                           +t$.Test.Str.startsWith("Geraldo",'G')  
                                           +t$.Test.Str.startsWith("Geraldo",'e')
                    , id
                )
            )
    return parent ?tx :t$.create(tx, `${id}Root`);
}

t$.Date = function(parent){              
    let _date = c$.NOW
      , id = 'sampleDate'
      , tx =t$.item(
                t$.header('FORMATAR DATA', id)
               ,t$.body(t$.card('t$.Date()', 'DATA', 'Para ver no log, pode executar o seguinte:')                
                    +t$.vd('DATE: Date.format()] OR [j$.Ext.format(date, mask)')
                    +t$.v('Date.format()'            , _date.format())
                    +t$.v('Date.format("dd/mm/yyyy")', _date.format("dd/mm/yyyy"))
                    +t$.v('Date.format("yyyymmdd")'  , _date.format("yyyymmdd"))
                    +t$.v('Date.format("HH:MM:ss")'  , _date.format("HH:MM:ss"))
                    +t$.v('Date.format("ddd mmm")'   , _date.format("ddd mmm"))
                    +t$.v('Date.format("dddd mmmm")' , _date.format("dddd mmmm"))
                    +t$.v('Date.format(c$.MASK.DATE.shortDate)'     , _date.format(c$.MASK.DATE.shortDate))
                    +t$.v('Date.format(c$.MASK.DATE.mediumDate)'    , _date.format(c$.MASK.DATE.mediumDate))
                    +t$.v('Date.format(c$.MASK.DATE.longDate)'      , _date.format(c$.MASK.DATE.longDate))
                    +t$.v('Date.format(c$.MASK.DATE.fullDate)'      , _date.format(c$.MASK.DATE.fullDate))
                    +t$.v('Date.format(c$.MASK.DATE.shortTime)'     , _date.format(c$.MASK.DATE.shortTime))
                    +t$.v('Date.format(c$.MASK.DATE.mediumTime)'    , _date.format(c$.MASK.DATE.mediumTime))
                    +t$.v('Date.format(c$.MASK.DATE.longTime)'      , _date.format(c$.MASK.DATE.longTime))
                    +t$.v('Date.format(c$.MASK.DATE.isoTime)'       , _date.format(c$.MASK.DATE.isoTime))
                    +t$.v('Date.format(c$.MASK.DATE.isoDateTime)'   , _date.format(c$.MASK.DATE.isoDateTime))
                    +t$.v('Date.format(c$.MASK.DATE.isoUtcDateTime)', _date.format(c$.MASK.DATE.isoUtcDateTime))
                    //+t$.ve(' Validate: String.isDate() ')
                    //+t$.Type.date()  
                    , id
                )
            )
    return parent ?tx :t$.create(tx, `${id}Root`);
}
t$.Digit = function(parent){              
    let id = 'sampleDigit'
    ,  tx =t$.item(
                t$.header('CALCULAR DIGITO', id)
               ,t$.body(t$.card('t$.Digit()', 'DÍGITO', 'Para ver no log, pode executar o seguinte:')   
                   +t$.vd("Móudulo 11:")
                    +t$.Test.Dig.module11("04150945")
                    +t$.Test.Dig.module11('417660402',2,12)
                    +t$.Test.Dig.module11('073114610001',2,9)
                   +t$.vd("CPF")
                   +t$.Test.Dig.digitoCpf("417660402")
                   +t$.vd("CNPJ")
                   +t$.Test.Dig.digitoCnpj("073114610001")
                   +t$.vd("Inscrição Estadual")           
                   +t$.Test.Dig.digitoCca("04150945")      
                   , id
                )
            )
    return parent ?tx :t$.create(tx, `${id}Root`);
}
t$.e$ = function(parent){              
    return t$.add({    id:'sampleNew'
                  ,header:'SAMPLE NEW'
                  ,  card:{title:'Card Title', subtitle: 'Card subtitle', text:'Card Text', link:'card link'}
                  ,  body:'Body sample New'
                  ,parent
                });
}
t$.Type = function(){             
return{
    all(){
        let p=true 
        ,  tx=t$.Type.numbers(p)        
             +t$.Type.date(p)        
             +t$.Type.text(p)        
             +t$.Type.specials(p)        
             +t$.Type.mask(p)        
             +t$.Type.types();        
        return t$.create(tx, 'sampleType');
    }  
    , numbers(parent){              
        let id = 'sampleTypeNumbers'
        ,  tx =t$.item(
                    t$.header('NÚMEROS', id)
                   ,t$.body(t$.card('t$.Type.numbers()', 'DADOS NUMÈRICOS', 'Para ver no log, pode executar o seguinte:')       
                        +t$.vd('isDigit  ')+t$.Test.Chk.isDigit('')  +t$.Test.Chk.isDigit('A')  +t$.Test.Chk.isDigit('1') +t$.cr 
                        +t$.vd('isInteger')+t$.Test.Chk.isInteger('')+t$.Test.Chk.isInteger('A')+t$.Test.Chk.isInteger('1')+t$.Test.Chk.isInteger('1,2')+t$.Test.Chk.isInteger('1.2') +t$.cr
                        +t$.vd('isNumeric')+t$.Test.Chk.isNumeric('')+t$.Test.Chk.isNumeric('A')+t$.Test.Chk.isNumeric('1')+t$.Test.Chk.isNumeric('1,2')+t$.Test.Chk.isNumeric('1.2') +t$.cr
                        +t$.vd('isMoney  ')+t$.Test.Chk.isMoney('')  +t$.Test.Chk.isMoney('A')  +t$.Test.Chk.isMoney('1')  +t$.Test.Chk.isMoney('1,2')  +t$.Test.Chk.isMoney('1.2')   +t$.cr                
                        ,id
                    )
            )
        return parent ?tx :t$.create(tx, `${id}Root`);
    }
    , date(parent){              
        let id = 'sampleTypeDate'
        ,  tx = t$.item(
                t$.header('DATA', id)
                , t$.body(   t$.card('t$.Type.date()', 'DADOS TIPO DATA', 'Para ver no log, pode executar o seguinte:')         
                            +t$.vd('isDate') +t$.Test.Chk.isDate('29/02/2011') +t$.Test.Chk.isDate('28/02/2011') +t$.Test.Chk.isDate('29/02/2008')
                                            +t$.Test.Chk.isDate('31/04/2011') +t$.Test.Chk.isDate('31/05/2011') +t$.Test.Chk.isDate('31/08/2008') +t$.cr
                            +t$.vd('isHour') +t$.Test.Chk.isHour('23:59') +t$.Test.Chk.isHour('00:00') +t$.Test.Chk.isHour('24:00')+t$.Test.Chk.isHour('12:00') +t$.Test.Chk.isHour('12:60')
                            , id
                        )
                )
        return parent ?tx :t$.create(tx, `${id}Root`);
    }        
    , text(parent){              
        let id = 'sampleTypeText'
        ,  tx =t$.item(
                    t$.header('TEXTO', id)
                   ,t$.body( t$.card('t$.Type.text()', 'DADOS TIPO TEXTO', 'Para ver no log, pode executar o seguinte:')    
                        +t$.vd('isLetter')+t$.Test.Chk.isLetter(' A ')+t$.Test.Chk.isLetter('1')+t$.Test.Chk.isLetter('a')+t$.Test.Chk.isLetter('�')+t$.Test.Chk.isLetter(' ')
                        +t$.cr 
                        +t$.vd('isName  ')+t$.Test.Chk.isName(' Geraldo ')+t$.Test.Chk.isName(' Geraldo Gomes ')+t$.Test.Chk.isName(' Geraldo F. Gomes ')
                                          +t$.Test.Chk.isName(' Joseh Geraldo Gomes ')+t$.Test.Chk.isName(' Geraldo A ')+t$.Test.Chk.isName(' A Gomes ')
                        +t$.cr                  
                        +t$.vd('isEmail ')+t$.Test.Chk.isEmail('abc@xiba.com')+t$.Test.Chk.isEmail('abc@xiba')+t$.Test.Chk.isEmail('abc_xiba')
                       , id
                    )
                )
        return parent ?tx :t$.create(tx, `${id}Root`);
    }  
    , specials(parent){              
        let id = 'sampleTypeSpecials'
        ,  tx =t$.item(
                    t$.header('ESPECÍFICOS', id)
                   ,t$.body(  t$.card('t$.Type.specials()', 'DADOS ESPECÍFICOS', 'Para ver no log, pode executar o seguinte:')
                        +t$.vd('Phone') +t$.Test.Chk.isPhone('(092)8122-0911') +t$.Test.Chk.isPhone('(092)81220911')
                                          +t$.Test.Chk.isPhone('(092) 8122-0911')+t$.Test.Chk.isPhone('8122-0911') +t$.Test.Chk.isPhone('12:60')    
                        +t$.cr
                        +t$.vd('CPF  ') +t$.Test.Chk.ehCPF('41766040268') +t$.Test.Chk.ehCPF('41766040267')
                        +t$.cr                        
                        +t$.vd('CNPJ ') +t$.Test.Chk.ehCNPJ('') +t$.Test.Chk.ehCNPJ('07311461000125') +t$.Test.Chk.ehCNPJ('07311461000124')
                        +t$.cr
                        +t$.vd('CCA  ') +t$.Test.Chk.ehCCA('') +t$.Test.Chk.ehCCA('041509455') +t$.Test.Chk.ehCCA('041509456')+t$.Test.Chk.ehCCA('1')
                        +t$.cr
                        +t$.vd('CEP  ') +t$.Test.Chk.ehCEP('69029-80') +t$.Test.Chk.ehCEP('69029-080') +t$.Test.Chk.ehCEP('6902-080') +t$.Test.Chk.ehCEP('69029-0801') +t$.Test.Chk.ehCEP('690219-080')
                        +t$.cr
                        +t$.vd('Placa') +t$.Test.Chk.ehPlaca('JXX-9999') +t$.Test.Chk.ehPlaca('GG-1111') +t$.Test.Chk.ehPlaca('JXG-10801')
                                          +t$.Test.Chk.ehPlaca('JG1-1000') +t$.Test.Chk.ehPlaca('JGG-G080')
                       , id
                    )
                )
        return parent ?tx :t$.create(tx, `${id}Root`);
    }  
    , mask(parent){              
        let id = 'sampleTypeMask'
        ,  tx =t$.item(
                    t$.header('MÁSCARA', id)
                   ,t$.body(   
                         t$.card('t$.Type.mask()', 'MASK', 'Para ver no log, pode executar o seguinte:')                         
                        +t$.vd('isValidInMask') +t$.Test.Chk.isValidInMask("1111","####")+t$.Test.Chk.isValidInMask("(92)111-abc","(99)999-aaa")
                        +t$.Test.Chk.isValidInMask("92111abc","(99)999-aaa")+t$.Test.Chk.isValidInMask("(92)111-a1c","(99)999-aaa")
                        +t$.Test.Chk.isValidInMask("1111","@###")+t$.Test.Chk.isValidInMask("A111","@###")
                       , id
                    )
            )
        return parent ?tx :t$.create(tx, `${id}Root`);
    }    
    , types(parent){              
        let id = 'sampleTypeTypes'
        ,  tx =t$.item(
                    t$.header('TIPOS DE DADOS', id)
                   ,t$.body(t$.card('t$.Type.types()', 'DATA TYPES', 'Para ver no log, pode executar o seguinte:')     
                        +t$.vd('type '      )+t$.Test.Chk.type("")+t$.Test.Chk.type("Nome")+t$.Test.Chk.type(1)+t$.Test.Chk.type()+t$.Test.Chk.type(null)
                                             +t$.Test.Chk.type(["Nome",2])+t$.Test.Chk.type({a:"alf", b:50})+t$.Test.Chk.type(()=>{return true})                    
                                             +t$.Test.Chk.type(c$.NOW)+t$.Test.Chk.type(true)
                        +t$.cr
                        +t$.vd('isString'   )+t$.Test.Chk.isString("")+t$.Test.Chk.isString("Nome")+t$.Test.Chk.isString(1)+t$.Test.Chk.isString()+t$.Test.Chk.isString(null)
                                             +t$.Test.Chk.isString(["Nome",2])+t$.Test.Chk.isString({a:"alf", b:50})+t$.Test.Chk.isString(()=>{}) 
                        +t$.cr
                        +t$.vd('isNumber'   )+t$.Test.Chk.isNumber("12")+t$.Test.Chk.isNumber(123)
                        +t$.cr
                        +t$.vd('isObject'   )+t$.Test.Chk.isObject("123")+t$.Test.Chk.isObject({a:"alf", b:50})
                        +t$.cr
                        +t$.vd('isFunction' )+t$.Test.Chk.isFunction("123")+t$.Test.Chk.isFunction(()=>{})
                        +t$.cr
                        +t$.vd('isArray'    )+t$.Test.Chk.isArray("123")+t$.Test.Chk.isArray(["Nome",2])
                        +t$.cr
                        +t$.vd('isValue'    )+t$.Test.Chk.isValue()+t$.Test.Chk.isValue(null)+t$.Test.Chk.isValue("1")+t$.Test.Chk.isValue(1)+t$.Test.Chk.isValue(["Nome",2])+t$.Test.Chk.isValue("Resource")
                        +t$.cr
                        +t$.vd('isUndefined')+t$.Test.Chk.isUndefined()+t$.Test.Chk.isUndefined(null)+t$.Test.Chk.isUndefined("1")+t$.Test.Chk.isUndefined(1)
                                             +t$.Test.Chk.isUndefined(["Nome",2])+t$.Test.Chk.isUndefined({a:"alf", b:50})+t$.Test.Chk.isUndefined(()=>{})
                        +t$.cr
                        +t$.vd('isDefined'  )+t$.Test.Chk.isDefined()+t$.Test.Chk.isDefined(null)+t$.Test.Chk.isDefined("1")+t$.Test.Chk.isDefined(1)
                                             +t$.Test.Chk.isDefined(["Nome",2])+t$.Test.Chk.isDefined({a:"alf", b:50})+t$.Test.Chk.isDefined(()=>{})       
                        +t$.cr
                        +t$.vd('isEmpty'    )+t$.Test.Chk.isEmpty('')+t$.Test.Chk.isEmpty(' ')+t$.Test.Chk.isEmpty('A')
                        ,id
                    )
            )
        return parent ?tx :t$.create(tx, `${id}Root`);
    }
}}();

const w$={urlPartial: CONFIG.SERVER.CONTEXT + 'sample/partial.html'
        }
