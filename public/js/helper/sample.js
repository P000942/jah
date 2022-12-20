
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
                function ftmText(value){
                    if (j$.Ext.isArray(value)){   
                        let tx=""
                        value.forEach(text=>{ tx +=`<p class="card-text">${text}</p>`})
                        return tx;
                    }
                    return `<p class="card-text">${value}</p>`;                    
                }                           
                return `<div class="card"><div class="card-body">
                            <h5 class="card-title">${title}</h5>
                            <h6 class="card-subtitle mb-2 text-muted">${subtitle}</h6>
                            ${ftmText(text)}
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
                console.log(value.replace(/<strong>|<\/strong>|<i>|<\/i>|<p>|<\/p>|<br>/g,""));
                return "";
            }
            function cr(){            
                return show("");
            }
            function item(header, body){return show(header+body)}     
            function create(content)   {return show(content)}      
            function add(r$){        
                return show(r$.header)
                     + r$.card? show(r$.card) :""
                     + show(r$.body)
            }      

            return {item, header:show, body:show, show, create, descr:show, cr, card:show, add}        
        }()
    }
    Object.render = (source, title)=>{  
        let html = (title) ?`<h2>${title}</h2>` :"";
        html += `<div>`;
        for (let key in source){
            html += `<h3><strong>${key}:</strong>${source[key]}</h3></br>`;            
        }
        return html+`</div>`;
    }
    Object.show = source=>{
        for (let key in source){
            //let _t = source[key].constructor.name[0].toLowerCase();
            console.log(`${key}:`,source[key]);
        }
    }
    // let aux = {text:"texto", nro: 1, ar:[1,2], obj:{nm:1, nr:2}, fn:()=>"2", dt:c$.NOW, fnc: function(){}}
    // Object.show(aux)
    
    init = designer=>{
        Object.setIfExist(t$, designers[designer],['item', 'header', 'body', 'show', 'create', 'descr', 'card', 'add'])
        t$.cr = designers[designer].cr();
        Object.setIfExist(t$, V,['v', 've', 'vd'])
    }
    
    let V={
        show(value, tag, strong, cr=false){
            return t$.show(value, tag, strong, cr);      
         }
        ,vlr(value, noDelimiter, strip){
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
        , ve(value, fn, result, parms="", noDelimiter=false){
            let text=value;
            if (fn){
                if (parms && parms[0])
                    text=`"${value}".${fn}(${V.vlr(parms, noDelimiter)})=> `.padStart(45,' ')+ V.vlr(result)
                else
                    text=`"${value}".${fn}(${parms})=> `.padStart(45,' ')+ V.vlr(result);
            }
            return V.show(text);
        }
        , vd(value){return t$.descr(value)}    
        , v$(value, fn, context="j$.Ext", strip=false){ 
                let text=`${fn}(${V.vlr(value,false ,strip)})=> `.padStart(40,' ') + context;
                if (context=="j$.Ext")
                    text =  `j$.Ext.${fn}(${V.vlr(value, false ,strip)})=> `.padStart(40,' ') + j$.Ext[fn](value) 
                return V.show( text);
        } 
        , v(fn, result, values){ 
            let text= `${fn}=> `.padStart(45,' ') + V.vlr(result);
            if (values)
                text= `${fn}(${V.vlr(values)})=> `.padStart(45,' ') + result;
            return V.show(text);
        }    
        , join(values){
            let res="", del="";
            values.forEach(value=>{
                if (value){
                res = res + del + V.vlr(value);
                del = ", "
                }    
            })
            return res;
        }
        ,   vo(fn, receiver, provider, keys){ 
                let vl = V.join([receiver, provider, keys])
                ,tx= V.show(`Object.${fn}(${vl})=> `.padStart(50,' '))
                   + V.show(V.vlr(Object[fn](receiver, provider, keys)));
                return tx;      
        }  
    }
    return{    
        T:{    
              Chk:{         
                    isDigit:value=>{return V.ve(value,"isDigit"  , value.isDigit()  )}    
            ,     isInteger:value=>{return V.ve(value,"isInteger", value.isInteger())}
            ,     isNumeric:value=>{return V.ve(value,"isNumeric", value.isNumeric())}
            ,       isMoney:value=>{return V.ve(value,"isMoney"  , value.isMoney()  )}    
            ,        isDate:value=>{return V.ve(value,"isDate"   , value.isDate()   )}
            ,        isHour:value=>{return V.ve(value,"isHour"   , value.isHour()   )}
            ,      isLetter:value=>{return V.ve(value,"isLetter" , value.isLetter() )}
            ,        isName:value=>{return V.ve(value,"isName"   , value.isName()   )}
            ,       isEmail:value=>{return V.ve(value,"isEmail"  , value.isEmail()  )}    
            ,       isEmpty:value=>{return V.ve(value,"isEmpty"  , value.isEmpty()  )}
            ,       isPhone:value=>{return V.ve(value,"isPhone"  , value.isPhone()  )}
            ,         ehCPF:value=>{return V.ve(value,"ehCPF"    , value.ehCpf()    )}
            ,        ehCNPJ:value=>{return V.ve(value,"ehCNPJ"   , value.ehCnpj()   )}
            ,         ehCCA:value=>{return V.ve(value,"ehCCA"    , value.ehCca()    )}
            ,         ehCEP:value=>{return V.ve(value,"ehCEP"    , value.ehCep()    )}
            ,       ehPlaca:value=>{return V.ve(value,"ehPlaca"  , value.ehPlaca()  )} 
            ,          type:value=>{return V.v$(value,"type")}    
            ,      isString:value=>{return V.v$(value,"isString")} 
            ,      isNumber:value=>{return V.v$(value,"isNumber")}
            ,       isArray:value=>{return V.v$(value,"isArray")} 
            ,      isObject:value=>{return V.v$(value,"isObject")} 
            ,    isFunction:value=>{return V.v$(value,"isFunction")} 
            ,       isValue:value=>{return V.v$(value,"isValue")} 
            ,     isDefined:value=>{return V.v$(value,"isDefined")} 
            ,   isUndefined:value=>{return V.v$(value,"isUndefined")} 
            ,   hasAnyValue:value=>{return V.v$(value,"hasAnyValue")} 
            ,       isMatch:(value,mask)=> {return V.ve(value,"isMatch", value.isMatch(mask),[mask])}
            }
            , Dig:{
                   module11:(value,dig,lim)=>{return V.ve(value,"module11", value.module11(dig,lim),((dig) ?[dig,lim].join() :""), true)}
            ,     digitoCpf:(value)        =>{return V.ve(value,"digitoCpf" , value.digitoCpf())}
            ,    digitoCnpj:(value)        =>{return V.ve(value,"digitoCnpj", value.digitoCnpj())}
            ,     digitoCca:(value)        =>{return V.ve(value,"digitoCca" , value.digitoCca())}
            }    
            , Str:{
                               trim:(value)=>{return V.ve(value,"trim"        , value.trim())}
                    ,      noAccent:(value)=>{return V.ve(value,"noAccent"    , value.noAccent())}
                    ,  toCapitalize:(value)=>{return V.ve(value,"toCapitalize", value.toCapitalize())}
                    ,  toFirstLower:(value)=>{return V.ve(value,"toFirstLower", value.toFirstLower())}
                    ,  toFirstUpper:(value)=>{return V.ve(value,"toFirstUpper", value.toFirstUpper())}
                    ,         toKey:(value)=>{return V.ve(value,"toKey"       , value.toKey())}                   
                    ,        preset:(value, vlDefault)=>{return V.v$([value, vlDefault],"String.preset", String.preset(value, vlDefault),true)}
                    ,        repeat:(value,times)     =>{return V.ve(value,"repeat"    , value.repeat(times)  ,times)}
                    ,     toCaption:(value,del)       =>{return V.ve(value,"toCaption" , value.toCaption(del) ,del)}
                    ,     stripChar:(value,del)       =>{return V.ve(value,"stripChar" , value.stripChar(del) ,del)}
                    ,    startsWith:(value,del)       =>{return V.ve(value,"startsWith", value.startsWith(del),del)}
                    ,          Mask:(value,mask)      =>{return V.ve(value,"mask"      , value.format(mask)   ,mask)}                    
                    ,        toggle:(value,values)    =>{return V.ve(value,"toggle"    , value.toggle(values) ,values)}
            }
            , Obj:{
                        preset  (receiver, provider, keys){return V.vo("preset"    , receiver, provider, keys)}
                    , setIfExist(receiver, provider, keys){return V.vo("setIfExist", receiver, provider, keys)}
                    , join      (receiver, provider, keys){return V.vo("join"      , receiver, provider, keys)} 
                    , merge     (receiver, provider, keys){return V.vo("merge"     , receiver, provider, keys)} 
                    , getByValue(source, value, attribute){return V.vo("getByValue", source, value, attribute)} 
                    , compare   (receiver, provider, keys){return V.vo("compare"   , receiver, provider, keys)} 
                    , contains  (receiver, provider, keys){return V.vo("contains"  , receiver, provider, keys)} 
                    , isEmpty   (source)                  {return V.vo("isEmpty"   , source)} 
                    , synonym   (receiver, keys)          {return V.vo("synonym"   , receiver, keys)} 
                    , exists    (receiver, keys)          {return V.vo("exists"    , receiver, keys)} 
                    , identify  (receiver, keys, labels)  {return V.vo("identify"  , receiver, keys, labels)} 
                    , label     (receiver, labels, keys)  {return V.vo("label"     , receiver, labels, keys)} 
                    , map       (provider, mapTo)         {return V.vo("map"       , provider, mapTo)}  
            }
            , Arr:{
                        select  (receiver, provider, keys){return V.vo("preset", receiver, provider, keys)}                    
            }             
        }                                      
        , init
    }
}();

t$.init("accordion"); //"log"

t$.apiExt = function(){              
    const 
    Format = function(parent){              
        let id ='sampleFormat'
            tx = t$.item(
                    t$.header('FORMATAR DADOS', id)
                ,t$.body(t$.card('t$.apiExt.Format()', 'FORMATAÇÃO', 'Para ver no log, pode executar o seguinte:')
                        +t$.vd("USAR MÁSCARA")       
                        +t$.T.Str.Mask("1111222"   ,"9,99")
                        +t$.T.Str.Mask("11222"     ,"99.990,00")
                        +t$.T.Str.Mask("9281220911","(000)0000-0000")
                        +t$.T.Str.Mask("jgg1111"   ,"AAA-0000")
                        +t$.T.Str.Mask("JGG1111"   ,"aaa-0000")
                        +t$.T.Str.Mask("jgG1111"   ,"@@@-0000")
                        +t$.T.Str.Mask("11112011"  ,"##/##/####")
                        +t$.T.Str.Mask("1"         ,"000.000")
                        +t$.T.Str.Mask("jgg1111"   ,"AaA-0000")
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
   ,String = function(parent){              
        let id = 'sampleString'
         ,  tx =t$.item(
                    t$.header('MANIPULAR STRING', id)
                   ,t$.body(t$.card('t$.apiExt.String()', 'TEXTO', 'Para ver no log, pode executar o seguinte:')
                        +t$.vd('trim')         +t$.T.Str.trim("   Geraldo    ")       
                        +t$.vd('noAccent')     +t$.T.Str.noAccent("José Mané Baré") 
                        +t$.vd('toCapitalize') +t$.T.Str.toCapitalize("José Mané Baré") 
                        +t$.vd('toFirstLower') +t$.T.Str.toFirstLower("José Mané Baré") 
                        +t$.vd('toFirstUpper') +t$.T.Str.toFirstUpper("josé mané baré") 
                        +t$.vd('toKey')        +t$.T.Str.toKey("id_nome&mt.for-da$xxx&")  
                        +t$.vd('String.preset')+t$.T.Str.preset(null,1) 
                                               +t$.T.Str.preset("A","vlDefault") 
                        +t$.vd('repeat')       +t$.T.Str.repeat("0",5)  
                        +t$.vd('toCaption')    +t$.T.Str.toCaption("jose_geraldo.gomes-final","_.-")  
                                               +t$.T.Str.toCaption("José-Mané Baré",'-') 
                        +t$.vd('stripChar')    +t$.T.Str.stripChar("04.150.945-5",['.','-']) 
                                               +t$.T.Str.stripChar("04 150.945-5",'.-') 
                        +t$.vd('startsWith')   +t$.T.Str.startsWith("geraldo","G")  
                                               +t$.T.Str.startsWith("Geraldo",'G')  
                                               +t$.T.Str.startsWith("Geraldo",'e')
                        +t$.vd('toggle')       +t$.T.Str.toggle("A",["A","B"])
                                               +t$.T.Str.toggle("B",["A","B"])
                        , id
                    )
                )
        return parent ?tx :t$.create(tx, `${id}Root`);
    }
   ,Date = function(parent){              
        let _date = c$.NOW
        , id = 'sampleDate'
        , tx =t$.item(
                    t$.header('FORMATAR DATA', id)
                ,t$.body(t$.card(['t$.apiExt.Date()','<br><strong>Alternativamente, pode-se usar:</strong><br> j$.Ext.format(date, mask)'], 'DATA', 'Para ver no log, pode executar o seguinte:')                                        
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
                        , id
                    )
                )
        return parent ?tx :t$.create(tx, `${id}Root`);
    }
   ,Digit = function(parent){              
        let id = 'sampleDigit'
        ,  tx =t$.item(
                    t$.header('CALCULAR DIGITO', id)
                ,t$.body(t$.card('t$.apiExt.Digit()', 'DÍGITO', 'Para ver no log, pode executar o seguinte:')   
                    +t$.vd("Móudulo 11:")
                        +t$.T.Dig.module11("04150945")
                        +t$.T.Dig.module11('417660402',2,12)
                        +t$.T.Dig.module11('073114610001',2,9)
                    +t$.vd("CPF")
                    +t$.T.Dig.digitoCpf("417660402")
                    +t$.vd("CNPJ")
                    +t$.T.Dig.digitoCnpj("073114610001")
                    +t$.vd("Inscrição Estadual")           
                    +t$.T.Dig.digitoCca("04150945")      
                    , id
                    )
                )
        return parent ?tx :t$.create(tx, `${id}Root`);
    }   
   return{
        all(){
            let p=true 
            ,  tx=String(p)
                 +Digit(p)
                 +Date(p)
                 +Format(p);        
            return t$.create(tx, 'sampleApi');
        }
        , Digit, String, Format, Date
    }   
}()


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
             +t$.Object.isEmpty(p)                    
             +t$.Object.map(p)                    
             //+t$.ve("Object.mixin() => execute t$.Object.mixin()  e veja melhor");
        return t$.create(tx, 'sampleObject');;
    }  
    , isEmpty(parent){              
        return t$.add({    id:'sampleisEmpty'
                      ,header:'isEmpty'
                      ,  card:{title:'OBEJTO VAZIO', subtitle: 'Verifica se tem alguma propriedade no objeto', text:' '}
                      ,  body:t$.T.Obj.isEmpty()
                             +t$.T.Obj.isEmpty({})
                             +t$.T.Obj.isEmpty({a:1})
                      ,parent
                    });
    }
    , preset(parent){ 
        let tx = t$.T.Obj.preset({a:1,b:2},'c',{x:1, y:2})
                +t$.T.Obj.preset({a:1,b:2},{x:1, y:2})
                +t$.T.Obj.preset({a:1,b:2,x:null,y:''},{x:1, y:2});                      
        return t$.add({id:'samplePreset'
                  ,header:'preset'
                  ,  card:{title:'PRESET OBJECT', subtitle: 'Predefinir atributos de um objeto(Só copia de properties, se não existir)', text:'Object.preset(receiver, properties, [defaultvalue])'}
                  ,  body:tx
                  ,parent
                });   
    }
    , setIfExist(parent){
        let tx=t$.T.Obj.setIfExist({a:1,b:2},{a:2, c:4,d:'abc'},['a','c','d'])
              +t$.T.Obj.setIfExist({a:1,b:2},{c:4,d:'abc'},'c')
              +t$.T.Obj.setIfExist({a:1,b:2},{c:4,d:'abc'},['c','d','g'])
              +t$.T.Obj.setIfExist({a:1,b:2},{c:4,d:'abc'},'z')
              +t$.T.Obj.setIfExist({a:1,b:2},{c:4,d:'abc'})                  
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
        let tx =t$.T.Obj.join({a:1,b:2},{a:2, c:4,d:'abc'},['a','c','d'])
               +t$.T.Obj.join({a:1,b:2},{x:1, y:2})
               +t$.T.Obj.join({a:1,b:2,x:null,y:''},{x:1, y:2});     
        return t$.add({  id:'sampleJoin'
                    ,header:'join'
                    ,  card:{title:'JUNTAR OBJETOS', subtitle: 'Junta o objeto provider ao objeto receiver (retorna o receiver)', text:'Object.join(receiver, provider, [properties])'}
                    ,  body:tx
                    ,parent
            });   
    }  
    , merge(parent){
        let tx = t$.T.Obj.merge({a:1,b:2},{a:2, c:4,d:'abc'},['a','c','d'])
                +t$.T.Obj.merge({a:1,b:2},{x:1, y:2})
                +t$.T.Obj.merge({a:1,b:2,x:null,y:''},{x:1, y:2})
                +t$.T.Obj.merge({},{a:1,b:2,x:null,y:''},['a','b']);         
        return t$.add({id:'sampleMerge'
                  ,header:'merge'
                  ,  card:{title:'JUNTAR OBJETOS', subtitle: 'Retorna um novo objeto com a junção de server e provider', text:'Object.merge(server, provider, [properties])'}
                  ,  body:tx
                  ,parent
                });   
    } 
    , getByValue(parent){
        let tx = t$.T.Obj.getByValue({a:1,b:2,c:1},1)  
                +t$.T.Obj.getByValue({a:{value:1},b:{value:2},c:{value:2}},2) 
                +t$.T.Obj.getByValue({a:{key:1},b:{key:2},c:{key:2}},2) 
                +t$.T.Obj.getByValue({a:{key:1},b:{key:2},c:{key:2}},2,"key")
                +t$.T.Obj.getByValue({a:{key:1},b:{key:2},c:{key:2}},3,"key")         
        return t$.add({id:'sampleGetByValue'
                  ,header:'getByValue'
                  ,  card:{title:'PROCURAR POR VALOR NO OBJETO', subtitle: 'Procura por valor no objeto e retorna array com as propriedades que contêm este valor', text:'Object.getByValue(source, value, attribute="value") '}
                  ,  body:tx
                  ,parent
                });    
    }
    , compare(parent){
        let tx = t$.T.Obj.compare({a:1, b:3, x:'A'}, {a:1, b:3, x:'B'},['a','b'])  
                +t$.T.Obj.compare({a:1, b:3, x:'A'}, {a:1, b:2, x:'A'},'a')  
                +t$.T.Obj.compare({a:1, b:3, x:'A'}, {a:1, b:3, x:'A'})  
                +t$.T.Obj.compare({a:1, b:3, x:'A'}, {a:1, b:3, x:'B'}) 
                +t$.T.Obj.compare({a:1, b:3, x:'A'}, {a:1, b:3})    
                +t$.T.Obj.compare({a:1, b:3}, {a:1, b:3, x:'A'});   
        return t$.add({id:'sampleCompare'
                  ,header:'compare'
                  ,  card:{title:'COMPARA OBJETOS', subtitle: 'Comparar se as propriedades em target de são iguais em source', text:'Object.compare(source, target, properties) '}
                  ,  body:tx
                  ,parent
                });                    
    } 
    , contains(parent){
        let tx = t$.T.Obj.contains({a:1, b:3, x:'A'}, {a:1, b:3, x:'A'})  
                +t$.T.Obj.contains({a:1, b:3, x:'A'}, {a:1, b:3, y:'A'})  
                +t$.T.Obj.contains({a:1, b:3, x:'A'}, {a:1, b:3, x:'B'}) 
                +t$.T.Obj.contains({a:1, b:3, x:'A'}, {a:1, b:3}) 
                +t$.T.Obj.contains({a:1, b:3, x:'A'}, {a:1, b:2}) 
                +t$.T.Obj.contains({a:1, b:3, x:'A'}, 1,'a');        
        return t$.add({id:'sampleContains'
                  ,header:'contains'
                  ,  card:{title:'OBJETO CONTÉM OUTRO OBJETO', subtitle: 'Verifica se source contém target', text:'Object.contains(source, target, properties) '}
                  ,  body:tx
                  ,parent
                });    
    }  
    , exists(parent){
        let tx = t$.T.Obj.exists({title:"titulo", key:"a"},["id","key"])
                +t$.T.Obj.exists({title:"titulo", id:"a"},["id","key"]) 
                +t$.T.Obj.exists({title:"titulo"},["id","key"]);         
        return t$.add({id:'sampleexists'
                  ,header:'exists'
                  ,  card:{title:'PROPRIEDADES NO OBJETO', subtitle: 'Retorna true se encontrar uma das propriedades no objeto', text:'Object.exists(source, properties)'}
                  ,  body:tx
                  ,parent
                });    
    }   
    , synonym(parent){
        let tx = t$.T.Obj.synonym({title:"titulo", key:"a"},["id","key"])  
                +t$.T.Obj.synonym({title:"titulo", id:"a"},["id","key"]) 
                +t$.T.Obj.synonym({id:1, key:"a"}, ["key","id"]) 
                +t$.T.Obj.synonym({id:1, key:"a"}, ["id", "key"]) 
                +t$.T.Obj.synonym({title:"titulo"},["id","key"]);      
        return t$.add({id:'sampleSynonym'
                  ,header:'synonym'
                  ,  card:{title:'ENCONTRAR UMA DAS PROPRIEDADES', subtitle: 'Retorna a primeira proprieda que encontrar no objeto que estah no array "keys"', text:'Object.synonym(source, properties) '}
                  ,  body:tx
                  ,parent
                });    
    }  
    , identify(parent){
        let tx = t$.T.Obj.identify({label:"a b"})  
                +t$.T.Obj.identify({id:"1"}) 
                +t$.T.Obj.identify({id:1, key:"a"}, ["key","id"]) 
                +t$.T.Obj.identify({key:"a"}, ["id", "key"]) 
                +t$.T.Obj.identify({title:"new titulo"},["id","key"],['title']) 
                +t$.T.Obj.identify({title:"new titulo"},["id"],["key",'title'])       
                +t$.T.Obj.identify({title:"new titulo",key:'ab'},["id"],["key",'title']);         
        return t$.add({id:'sampleIdentify'
                  ,header:'identify'
                  ,  card:{title:'IDENTIFY', subtitle: 'Formatar|garantir os campos de identificação definidos(id, key)', text:'Object.identify(source, keys, labels) '}
                  ,  body:tx
                  ,parent
                });    
    }   
    , label(parent){
        let tx = t$.T.Obj.label({caption:"titulo"})  
                +t$.T.Obj.label({label:"titulo"}) 
                +t$.T.Obj.label({title:"titulo"},["label","title"])       
                +t$.T.Obj.label({title:"new titulo",key:'my_key'});    
        return t$.add({id:'sampleLabel'
                  ,header:'label'
                  ,  card:{title:'FORMATAR LABEL NO OBJETO', subtitle: 'Formatar|garantir  as propriedades em labels', text:' Object.label(receicer, labels=["label", "caption"], keys=["key","id"])'}
                  ,  body:tx
                  ,parent
                });    
    }      
    , map(parent){
        let tx = t$.T.Obj.map({a:1, b:'F', c:"Eu", d:40},{a:"cod", b:"sexo", c:"nome", f:"f"})  
                ;                    
        return t$.add({id:'sampleMap'
                  ,header:'map'
                  ,  card:{title:'RETORNAR NOVO OBJETO MAPEADO', subtitle: 'Retorna um novo objeto mapeado(de-para) conforme o objeto mapTo com os campos que existem no provider'
                          , text:'Object.map(provider, MapTo)'}
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


/* t$.e$ = function(parent){              
    return t$.add({    id:'sampleNew'
                  ,header:'SAMPLE NEW'
                  ,  card:{title:'Card Title', subtitle: 'Card subtitle', text:'Card Text', link:'card link'}
                  ,  body:'Body sample New'
                  ,parent
                });
} */
t$.Validate = function(){             
return{
    all(){
        let p=true 
        ,  tx=t$.Validate.numbers(p)        
             +t$.Validate.date(p)        
             +t$.Validate.text(p)        
             +t$.Validate.specials(p)        
             +t$.Validate.mask(p)        
             +t$.Validate.types();        
        return t$.create(tx, 'sampleType');
    }  
    , numbers(parent){              
        let id = 'sampleTypeNumbers'
        ,  tx =t$.item(
                    t$.header('NÚMEROS', id)
                   ,t$.body(t$.card('t$.Validate.numbers()', 'DADOS NUMÈRICOS', 'Para ver no log, pode executar o seguinte:')       
                        +t$.vd('isDigit  ')+t$.T.Chk.isDigit('')  +t$.T.Chk.isDigit('A')  +t$.T.Chk.isDigit('1') +t$.cr 
                        +t$.vd('isInteger')+t$.T.Chk.isInteger('')+t$.T.Chk.isInteger('A')+t$.T.Chk.isInteger('1')+t$.T.Chk.isInteger('1,2')+t$.T.Chk.isInteger('1.2') +t$.cr
                        +t$.vd('isNumeric')+t$.T.Chk.isNumeric('')+t$.T.Chk.isNumeric('A')+t$.T.Chk.isNumeric('1')+t$.T.Chk.isNumeric('1,2')+t$.T.Chk.isNumeric('1.2') +t$.cr
                        +t$.vd('isMoney  ')+t$.T.Chk.isMoney('')  +t$.T.Chk.isMoney('A')  +t$.T.Chk.isMoney('1')  +t$.T.Chk.isMoney('1,2')  +t$.T.Chk.isMoney('1.2')   +t$.cr                
                        ,id
                    )
            )
        return parent ?tx :t$.create(tx, `${id}Root`);
    }
    , date(parent){              
        let id = 'sampleTypeDate'
        ,  tx = t$.item(
                t$.header('DATA', id)
                , t$.body(   t$.card('t$.Validate.date()', 'DADOS TIPO DATA', 'Para ver no log, pode executar o seguinte:')         
                            +t$.vd('isDate') +t$.T.Chk.isDate('29/02/2011') +t$.T.Chk.isDate('28/02/2011') +t$.T.Chk.isDate('29/02/2008')
                                            +t$.T.Chk.isDate('31/04/2011') +t$.T.Chk.isDate('31/05/2011') +t$.T.Chk.isDate('31/08/2008') +t$.cr
                            +t$.vd('isHour') +t$.T.Chk.isHour('23:59') +t$.T.Chk.isHour('00:00') +t$.T.Chk.isHour('24:00')+t$.T.Chk.isHour('12:00') +t$.T.Chk.isHour('12:60')
                            , id
                        )
                )
        return parent ?tx :t$.create(tx, `${id}Root`);
    }        
    , text(parent){              
        let id = 'sampleTypeText'
        ,  tx =t$.item(
                    t$.header('TEXTO', id)
                   ,t$.body( t$.card('t$.Validate.text()', 'DADOS TIPO TEXTO', 'Para ver no log, pode executar o seguinte:')    
                        +t$.vd('isLetter')+t$.T.Chk.isLetter(' A ')+t$.T.Chk.isLetter('1')+t$.T.Chk.isLetter('a')+t$.T.Chk.isLetter('�')+t$.T.Chk.isLetter(' ')
                        +t$.cr 
                        +t$.vd('isName  ')+t$.T.Chk.isName(' Geraldo ')+t$.T.Chk.isName(' Geraldo Gomes ')+t$.T.Chk.isName(' Geraldo F. Gomes ')
                                          +t$.T.Chk.isName(' Joseh Geraldo Gomes ')+t$.T.Chk.isName(' Geraldo A ')+t$.T.Chk.isName(' A Gomes ')
                        +t$.cr                  
                        +t$.vd('isEmail ')+t$.T.Chk.isEmail('abc@xiba.com')+t$.T.Chk.isEmail('abc@xiba')+t$.T.Chk.isEmail('abc_xiba')
                       , id
                    )
                )
        return parent ?tx :t$.create(tx, `${id}Root`);
    }  
    , specials(parent){              
        let id = 'sampleTypeSpecials'
        ,  tx =t$.item(
                    t$.header('ESPECÍFICOS', id)
                   ,t$.body(  t$.card('t$.Validate.specials()', 'DADOS ESPECÍFICOS', 'Para ver no log, pode executar o seguinte:')
                        +t$.vd('Phone') +t$.T.Chk.isPhone('(092)8122-0911') +t$.T.Chk.isPhone('(092)81220911')
                                          +t$.T.Chk.isPhone('(092) 8122-0911')+t$.T.Chk.isPhone('8122-0911') +t$.T.Chk.isPhone('12:60')    
                        +t$.cr
                        +t$.vd('CPF  ') +t$.T.Chk.ehCPF('41766040268') +t$.T.Chk.ehCPF('41766040267')
                        +t$.cr                        
                        +t$.vd('CNPJ ') +t$.T.Chk.ehCNPJ('') +t$.T.Chk.ehCNPJ('07311461000125') +t$.T.Chk.ehCNPJ('07311461000124')
                        +t$.cr
                        +t$.vd('CCA  ') +t$.T.Chk.ehCCA('') +t$.T.Chk.ehCCA('041509455') +t$.T.Chk.ehCCA('041509456')+t$.T.Chk.ehCCA('1')
                        +t$.cr
                        +t$.vd('CEP  ') +t$.T.Chk.ehCEP('69029-80') +t$.T.Chk.ehCEP('69029-080') +t$.T.Chk.ehCEP('6902-080') +t$.T.Chk.ehCEP('69029-0801') +t$.T.Chk.ehCEP('690219-080')
                        +t$.cr
                        +t$.vd('Placa') +t$.T.Chk.ehPlaca('JXX-9999') +t$.T.Chk.ehPlaca('GG-1111') +t$.T.Chk.ehPlaca('JXG-10801')
                                          +t$.T.Chk.ehPlaca('JG1-1000') +t$.T.Chk.ehPlaca('JGG-G080')
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
                         t$.card('t$.Validate.mask()', 'VALIDAR POR MÁSCARA', 'Para ver no log, pode executar o seguinte:')                         
                        +t$.vd('isMatch') +t$.T.Chk.isMatch("1111","####")+t$.T.Chk.isMatch("(92)111-abc","(99)999-aaa")
                        +t$.T.Chk.isMatch("92111abc","(99)999-aaa")+t$.T.Chk.isMatch("(92)111-a1c","(99)999-aaa")
                        +t$.T.Chk.isMatch("1111","@###")+t$.T.Chk.isMatch("A111","@###")
                       , id
                    )
            )
        return parent ?tx :t$.create(tx, `${id}Root`);
    }    
    , types(parent){              
        let id = 'sampleTypeTypes'
        ,  tx =t$.item(
                    t$.header('TIPOS DE DADOS', id)
                   ,t$.body(t$.card('t$.Validate.types()', 'DATA TYPES', 'Para ver no log, pode executar o seguinte:')     
                        +t$.vd('type '      )+t$.T.Chk.type("")+t$.T.Chk.type("Nome")+t$.T.Chk.type(1)+t$.T.Chk.type()+t$.T.Chk.type(null)
                                             +t$.T.Chk.type(["Nome",2])+t$.T.Chk.type({a:"alf", b:50})+t$.T.Chk.type(()=>{return true})                    
                                             +t$.T.Chk.type(c$.NOW)+t$.T.Chk.type(true)
                        +t$.cr
                        +t$.vd('isString'   )+t$.T.Chk.isString("")+t$.T.Chk.isString("Nome")+t$.T.Chk.isString(1)+t$.T.Chk.isString()+t$.T.Chk.isString(null)
                                             +t$.T.Chk.isString(["Nome",2])+t$.T.Chk.isString({a:"alf", b:50})+t$.T.Chk.isString(()=>{}) 
                        +t$.cr
                        +t$.vd('isNumber'   )+t$.T.Chk.isNumber("12")+t$.T.Chk.isNumber(123)
                        +t$.cr
                        +t$.vd('isObject'   )+t$.T.Chk.isObject("123")+t$.T.Chk.isObject({a:"alf", b:50})
                        +t$.cr
                        +t$.vd('isFunction' )+t$.T.Chk.isFunction("123")+t$.T.Chk.isFunction(()=>{})
                        +t$.cr
                        +t$.vd('isArray'    )+t$.T.Chk.isArray("123")+t$.T.Chk.isArray(["Nome",2])
                        +t$.cr
                        +t$.vd('isValue'    )+t$.T.Chk.isValue()+t$.T.Chk.isValue(null)+t$.T.Chk.isValue("1")+t$.T.Chk.isValue(1)+t$.T.Chk.isValue(["Nome",2])+t$.T.Chk.isValue("Resource")
                        +t$.cr
                        +t$.vd('isUndefined')+t$.T.Chk.isUndefined()+t$.T.Chk.isUndefined(null)+t$.T.Chk.isUndefined("1")+t$.T.Chk.isUndefined(1)
                                             +t$.T.Chk.isUndefined(["Nome",2])+t$.T.Chk.isUndefined({a:"alf", b:50})+t$.T.Chk.isUndefined(()=>{})
                        +t$.cr
                        +t$.vd('isDefined'  )+t$.T.Chk.isDefined()+t$.T.Chk.isDefined(null)+t$.T.Chk.isDefined("1")+t$.T.Chk.isDefined(1)
                                             +t$.T.Chk.isDefined(["Nome",2])+t$.T.Chk.isDefined({a:"alf", b:50})+t$.T.Chk.isDefined(()=>{})       
                        +t$.vd('hasAnyValue') 
                        +t$.T.Chk.hasAnyValue()
                                             +t$.T.Chk.hasAnyValue(null)
                                             +t$.T.Chk.hasAnyValue("")
                                             +t$.T.Chk.hasAnyValue(1)
                                             +t$.T.Chk.hasAnyValue(["Nome",2])
                                             +t$.T.Chk.hasAnyValue({a:"alf", b:50})
                                             +t$.T.Chk.hasAnyValue(()=>{})       
                        +t$.cr
                        +t$.vd('isEmpty'    )+t$.T.Chk.isEmpty('')+t$.T.Chk.isEmpty(' ')+t$.T.Chk.isEmpty('A')
                        ,id
                    )
            )
        return parent ?tx :t$.create(tx, `${id}Root`);
    }
}}();

const w$={
    template:{services:{               
                Assunto:{caption:'Assunto'  ,   crud:true, title:'Cadastro de Assunto'}
            ,     Tarefa:{caption:'Tarefa'   ,   crud:true, title:'Tarefa'         , resource:'tarefa', local:true}
            ,   Mensagem:{caption:'Mensagem' ,   crud:true, title:'Mensagem' , modal:true}
    }} 
, urlPartial: CONFIG.SERVER.CONTEXT + 'sample/partial.html'
,urlPartial1: CONFIG.SERVER.CONTEXT + 'sample/partial_1.html'    
}

t$.Tabs = function(){
    const 
    C$={
             api:{key:"apiExt" , caption:'Api Ext'      , content:t$.apiExt.all()}  
        ,   type:{key:"Type"   , caption:'Data Validate', content:t$.Validate.all()}  
        , object:{key:"Object" , caption:'Object'       , content:t$.Object.all()}   
        ,partial:{key:"partialOption", caption:'Partial', url:w$.urlPartial, title:'Title Partial Tab'
                , onClick(opt, e){ tabs.open(opt)}}
        
    }
    
    return{
         C$
    }
}();
t$.Menu = function( _menu, _tab){
    const
    addFramework=()=>{
        _menu.add("Framework")    
            .add([
                 {caption:'API Extend', onClick(menu, event){_tab.add (t$.Tabs.C$.api)}} //t$.Tabs.addExt(tab)
                ,{caption:'Type'      , onClick(menu, event){_tab.open(t$.Tabs.C$.type)}}
                ,{caption:'Object'    , onClick(menu, event){_tab.open(t$.Tabs.C$.object)}}
            ]) 
    }
    ,abrirURL=()=>{
        _menu.add("Abrir URL")    
            .add([
                 {partial:{key:"partialOption", caption:'Partial', url:w$.urlPartial, title:'Title Partial Tab'
                        , onClick(menu, event){_tab.open(menu)}}
                 }
                ,{caption:'Link Externo',  url:w$.urlPartial}
                ,  // separador
                ,{caption:'Abrir Partial no evento', url:w$.urlPartial1,
                        onClick(menu, event){
                            _tab.open(
                                    {key:"tab_"+menu.id
                                , caption:menu.caption
                                ,  onLoad(tab){
                                    tab.showURL(menu.url)
                                }
                            })
                        }
                }
            ]) 
    }
    return{
        addFramework
        , init(menu, tab){
            _menu=menu;
            _tab=tab;
        }
    }
}(j$.Adapter.Menu, j$.Adapter.Tabs);
 

