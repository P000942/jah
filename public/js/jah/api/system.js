/*
 by Geraldo Gomes
 */
'use strict';
// import {CONFIG, c$} from  "../config.js";
// import dataExt from  "../api/dataExt.js"; 
function i$(id) {
    return document.getElementById(id);
}

const ERROR = function() {
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
                ERROR[method](field, msg,clas$);
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
        ,noMarkIfValid(mark)         {j$.Feedback.noMarkIfValid(mark)} 
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

const EXCEPTION = function() {
    let handle =null;
    let formatMessage=(exception, text)=>{
        let message=exception.id +":"+ exception.text;
        if (text != undefined)
           message += "\n"+ text;
    };
    return {
	init: objectHandle =>{handle=objectHandle}
      , show:(exception,text) => {
            if (handle)
               handle.callback(exception,text);
            else
               EXCEPTION.on(exception,text);
        }
      ,   on: (exception,text)=>{
            console.log(formatMessage(exception,text));
        }
      , format: (exception,text)=>{
            return formatMessage(exception,text);
        }
//        off:function(field){
//            field.Error.off();
//        },
     , ITEM:CONFIG.EXCEPTION
    };
}();

const System = function(){
    let result = null
      , _QueryString={}
      , importJS= file =>{
            let headTag = document.getElementsByTagName('head')[0];
            let script  = document.createElement("script");
            script.type ="text/javascript";
            script.src = file;
            headTag.appendChild(script);
        }
      , importCSS =  (file, media) =>{
            if (media == undefined)
                media = "screen";
                let headTag = document.getElementsByTagName('head')[0];
                let script  = document.createElement("link");
                script.type ="text/css";
                script.src = file;
                script.media =media;
                headTag.appendChild(script);
        }
      , initialized=function(){
            Element.prototype.stylize = function(properties) {
                if (properties){
                    if (typeof properties =='string'){
                    if (properties.match(/[:;]/gi)==null) //Se tem ':' eh uma string com style
                        this.className = properties;
                    else                             //senao, pode ser o nome de uma class
                        this.style.cssText = properties;
                    }else{
                        for (let att in properties){
                            if (att.trim().toLowerCase() == 'clas$')
                                this.className = properties[att];
                            else
                            this.style[att]=properties[att];
                        }
                    }
                }
            }
            Element.prototype.insert = function(content, idInner) {
                let id = "#" + this.id;
                if (dataExt.isString(content)){
                    $(id).append(content);
                }else{
                    if (content.after)
                    $(id).after(content.after);
                    if (content.bottom)
                    $(id).append(content.bottom);
                    if (content.before)
                    $(id).before(content.before);
                    if (content.top)
                    $(id).prepend(content.top);
                }
                return (idInner) ?i$(idInner) :null;
            }
            Element.prototype.remove = function() {
                if (!this.id.isEmpty())
                $("#" + this.id).remove();
            }
            Element.prototype.addClassName = function(className) {
                if (!this.id.isEmpty())
                $("#" + this.id).addClass(className);
            }
            Element.prototype.hide = function() {
                if (!this.id.isEmpty())
                $("#" + this.id).hide();
            }
            Element.prototype.show = function() {
                if (!this.id.isEmpty())
                    $("#" + this.id).show();
            }
            Element.prototype.toggle = function() {
                if (!this.id.isEmpty())
                    $("#" + this.id).toggle();
            }
            Event.observe = function(node, event, callback) {
                let element = null;
                if (dataExt.isString(node))
                    element = $("#" + node);
                else
                    element = $("#" + node.id);
                element.bind(event, callback);
            }
            Event.element=function(event){return event.target}
        
            window['Ajax']={
                Request:function(url, properties){
                    let options={url:url};
                    if (properties.parameters)
                        options.data = properties.parameters;
                    if (properties.method)
                        options.type = properties.method.toUpperCase();
                    else
                        options.type = 'GET';
                    if (properties.asynchronous)
                        options.async = properties.asynchronous;
                    if (properties.encoding)
                        options.scriptCharset = properties.encoding;
                    if (properties.evalJSON)
                        options.dataType = 'json';
                    if (properties.contentType)
                            options.contentType = properties.contentType;
                    if (properties.onSuccess)
                        options.success = properties.onSuccess;
                    if (properties.onFailure)
                        options.error = properties.onFailure;
                    if (properties.onComplete)
                        options.complete = properties.onComplete;
                    if (properties.postBody && (options.type == 'POST' || options.type == 'PUT')){
                        options.processData = false;
                        options.data = properties.postBody;
                    }
                    $.ajax(options);
                }
            , Updater:function(idContent, url, parm){
                    $.ajax({
                    url: url,
                    cache: false,
                    data: parm.parameters,
                    complete:parm.onComplete
                    }).done(function( html ) {
                        $("#"+idContent).append(html);
                    });
                }
            };
    
        /* pega o valor de um elemento */
            Element.prototype.get= function(){
                let value = '';
                switch(dataExt.type(this)){
                    case 'HTMLSelectElement':
                        if (this.selectedIndex > -1)
                            value = this.options[this.selectedIndex];
                        break;
                    case 'HTMLInputElement':
                        value = this.value;
                        break;
                    default:
                        value= this.textContent;
                }
                return value;
            }
            Element.prototype.content= function(value){
                if (value == undefined){
                let value = '';
                switch(dataExt.type(this)){
                    case 'HTMLSelectElement':
                        value = this.selectedIndex;
                        break;
                    case 'HTMLInputElement':
                        if (this.type == "radio" || this.type == "checkbox")
                            value = this.checked;
                        if (this.type == "text" || this.type == "hidden")
                            value = this.value;
                            break;
                    default:
                        value= this.textContent;
                }
                return value;
                }else{
                    switch(dataExt.type(this)){
                        case 'HTMLSelectElement':
                            this.value = value;
                            break;
                        case 'HTMLInputElement':
                            if (this.type == "radio" || this.type == "checkbox")
                                this.checked = value;
                            if (this.type == "text" || this.type == "hidden")
                                this.value = value;
                                break;
                        default:
                            this.textContent=value;
                    }
                }
            }
    
            Element.prototype.reset= function(){
                switch(dataExt.type(this)){
                    case 'HTMLSelectElement':
                        this.selectedIndex=-1;
                        break;
                    case 'HTMLInputElement':
                        if (this.type == "radio" || this.type == "checkbox")
                            this.checked = false;
                        if (this.type == "text" || this.type == "hidden")
                            this.value = "";
                        break;
                    default:
                        this.textContent="";
                }
            }
        
            String.prototype.pixel = function(fontSize){
                i$('w_len').style.fontSize=fontSize + "px";
                i$('w_len').innerHTML = "X".repeat(this.length + 1);
                return {width:i$('w_len').getWidth(), height:i$('w_len').getHeight()};
            }
            //alert("123451234512".pixel(10).width);
            //alert("123451234512".pixel(10).height);
            String.prototype.point = function(fontSize){
                i$('w_len').style.fontSize=fontSize + "pt";
                i$('w_len').innerHTML = "X".repeat(this.length + 1);
                return {width:i$('w_len').getWidth(), height:i$('w_len').getHeight()};
            }
            //alert("123451234512".point(10).width);
            //alert("123451234512".point(10).height);
            //===> fim
            return true;
        }();

    return{
        using: (url, media) =>{
            if (url.toUpperCase().indexOf('.CSS') > -1)
               importCSS(url, media);
            else if (url.toUpperCase().indexOf('.JS') > -1)
               importJS(url);
        }
      , parameters: key=>{return _QueryString[key]}
      , queryString:()=>{
            let parms=location.search.replace(/\x3F/,"").replace(/\x2B/g," ").split("&");
            if (parms!=""){
                for(let i=0;i<parms.length;i++){
                    nvar=parms[i].split("=");
                    _QueryString[nvar[0]]=unescape(nvar[1]);
                }
            }
            return _QueryString;
        }
      , result:function(){return result;}
      , api:{prototype:false, jquery:false}
    };
}();

const j$={ui:{},sample:{}};
//@note: util apenas em dsv para ver os objetos/colecoes e seus respectivos shortcut - que estão instanciados
//j$.$V() ou j$.$V("$R")
j$.$V= key =>{
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

j$.Dashboard = function(){
    let idContent=CONFIG.LAYOUT.CONTENT
     // , idToolbar='toolbar';

    return{
        init: properties=>{
            j$.Dashboard.Factory = (properties.designer && properties.designer.factory) 
                                 ?j$.Dashboard[properties.designer.factory] 
                                 :j$.Dashboard.Menubar
            j$.Dashboard.Factory.create();
            j$.Dashboard.Tabs.create();
            j$.Dashboard.Factory.bindToTabs(properties.services, properties.designer.options);
        }
        , bindItem: item =>{
            if (!item.url && !item.onCLick){
                if (item.partial)
                    item.onClick=j$.Dashboard.Tabs.openPartial;
                else if (item.modal){
                    item.onClick=function(menu){
                        j$.service.c$[menu.key].init(null, menu.modal);
                    }
                } else
                    item.onClick=j$.Dashboard.Tabs.delegateTo;
                item.byPass =true;
            }
        }
        , openItem: (item, record) => {
            if (!item.url && !item.onCLick){
                if (item.partial)
                    j$.Dashboard.Tabs.openPartial(item, null, record); //#Todo: passar o record
                else if (item.modal){
                    j$.service.c$[item.key].init(null, item.modal, record);
                } else
                    j$.Dashboard.Tabs.delegateTo(item, null, record); //#Todo: passar o record
            }
    }
    , idContent:idContent
    }
}();

j$.Dashboard.Tabs=function(){
    let tabs
      , idContent='root'
      , ftmKey = (service) =>{return "tab_"+service.Parent.key+'_'+service.key}
    return{
        create: ()=>{ tabs = j$.ui.Tabs.create(j$.Dashboard.Tabs.idContent,j$.Dashboard.idContent) }
        , open: properties =>{return tabs.open(properties)}
        , delegateTo: (service, event, record)=>{
                j$.Dashboard.Tabs.open({key:ftmKey(service)
                    , caption:service.caption, title: service.title
                    ,  onLoad: function(tab){
                                j$.service.c$[service.key].init(tab.idContent);
                            }
                });
        }
        , openPartial:(service, event, record)=>{
                j$.Dashboard.Tabs.open({key:ftmKey(service)
                    ,caption:service.caption
                    , onLoad:function(tab){
                            tab.showURL(service.url, tab.httpComplete); // httpComplete - callback quando acionado apos a carga
                            }
                });
        }
        , getTab: (menu_key, item_key) =>{ return tabs.C$("tab_"+menu_key+'_'+item_key) }
        , idContent:idContent
    };
}();

j$.Dashboard.Menubar=function(){
    let menubar, _c$ = CONFIG.MENU.OPTIONS[CONFIG.MENU.PARSER.toUpperCase()];
    //let idContent=_c$.CONTENT;

    const initialized = function(){
        i$(j$.Dashboard.idContent).className =_c$.CLASS.CONTENT;
        i$(_c$.CONTENT).className = _c$.CLASS.MENU;
        for (let key in CONFIG.MENU.OPTIONS){
            let option =  CONFIG.MENU.OPTIONS[key]
            if (key != CONFIG.MENU.PARSER.toUpperCase()){             
                i$(option.CONTENT).remove();
            }
        }
        return true;
    };    

    return{
        //menu={key:'', caption:'', url:'', title:'', items:[]}
      bindItems: function(menu, Services){
            let menuBase = menubar.addMenu(menu);
            for (let idx=0; idx<menu.items.length;  idx++){
                let item = Services[menu.items[idx]];
                menuBase.add(item);
            }
       }
    , bindToTabs: function(Services, design){
                for (let key in design){
                    let menu = design[key];
                    if (dataExt.isArray(menu))
                        menu = {items:design[key]};
                    Object.preset(menu, {key:key, caption:key});
                    j$.Dashboard.Menubar.bindItems(menu, Services);
                }
        }
    ,  create:function(){
               initialized();
               menubar = j$.ui.Menu.create(_c$.CONTENT)
            }
    , addMenu:function(menu){return menubar.addMenu(menu)}
    , getMenu:function(menu_key){ return menubar.getMenu(menu_key)}
    ,  render:function(menu){ menubar.render()}
    , idContent:_c$.CONTENT
    }
}();

j$.ui.Open = function(){
    return{
        url: (url, idContent)=>{
            if (idContent)
                j$.ui.Open.partial(url, idContent);
            else
                window.location = url;
        },
        partial:(url, idContent, complete)=>{
            if (!idContent)
                idContent = CONFIG.LAYOUT.CONTENT;
             //let pars = '';
            if (!url.isEmpty()) {
                let myAjax = new Ajax.Updater( idContent, url, {method: 'get', parameters: '', onComplete:complete});
            }
        }
    };
}();

j$.Node=function(inheritor, properties){
    let _node = this;
    this.length = 0;
    this.c$ = {};
    this.C$ = getItem;
    Object.preset(_node, inheritor,["type","Root","Parent"])
    let util = function(){
        return{
            formatKey:function(){
                let key='';
                if (dataExt.type(properties)=='String')
                    key=properties.toKey();
                else if (properties.key)
                    key= properties.key;
                else if (properties.caption)
                    key = properties.caption.toKey();
                  //  key = _node.Parent.key + "_" + properties.caption.toKey();

                if (key.isEmpty())
                    key=j$.util.getId(_node.Parent.key + "_" + _node.type);

                if (properties.caption==undefined)
                    properties.caption=key.toCaption();

                return key;
            }
        ,  formatId:function(){return (properties.id)?properties.id:_node.Parent.id +'_'+_node.key;}
        , checkHandler: function(){
                if (properties.onClick) {_node.onClick =function(event){return properties.onClick(_node, event);};}
        }
        };
    }();
    this.id = function(){
        if (dataExt.isString(properties)){ // veio apenas o caption
            Object.preset(_node, {caption:properties, key:util.formatKey()});
        } else {
            if (!properties){properties={}};
            _node.key=util.formatKey();
            _node.caption = properties.caption;
            util.checkHandler();
        }
        return util.formatId();
    }();
    function getItem(key){
        return _node.c$[key];
    }
    let addItem=(key, item)=>{
        _node.length +=1;
        _node.c$[key]=item;
    };
    // this.add = addItem;
    this.put = addItem;
    this.remove = key=>{
        _node.length -=1;
        _node.c$[key]=null;
    };
    this.show =()=>{
        console.log(_node.key +"."+ _node.caption);
        for (let key in _node.c$)
            _node.c$[key].show();
    };
    this.first = ()=>{
        for (let key in _node.c$)
            return _node.c$[key];
    };
};

System.Action = ()=>{ 
    let self = this;
    this.actions = col_actions = [];

    this.addAction = function(action){ 
        self.actions.push(action);
    };
    this.execute = o =>{
        let result = false;
        for (let i=0; i < this.actions.length; i++){
            result=self.actions[i](o);
        }
        return result;
    };
    this.clear = ()=>{
        self.actions = [];
    };
};


class Collection {
    constructor() {
        this.Items={};
        this.length = 0;
        this.c$ = this.Items;
        //this.C$ = getItem;
     }
     getItem(key){
        return this.Items[key];
     }
     C$ = this.getItem;
     add = (key, item)=>{
        this.length +=1;
        if (!item.Parent && this.Parent)
           item.Parent = this.Parent;
        if (!item.key)
           item.key = key
        this.Items[key]=item;
     }
     remove = key=>{
        this.length -=1;
        this.Items[key]=null;
     }
     
     first =()=>{
        for (let key in this.c$)
            return this.c$[key];
     }

     last =()=>{
        let item; 
        for (let key in this.c$)
        item = this.c$[key];
        return item;
     }

     sweep = (action, param)=>{
         for(let key in this.c$){
            action(this.c$[key], param);
         }
     }  
     each = this.sweep;  
}
System.Collection = Collection;
class Observer extends System.Collection{
    constructor(Parent){
        super(); 
        this.Parent = Parent;               
    }
    notify =notification =>{
        for (let key in this.c$)
            this.c$[key].notify(notification);
    }
}
System.Observer = Observer;

j$.util = function(){
    let sequence = {};
    let getId = function(key, id){
        let _k =(dataExt.isString(key)) ? key.split(" ")[0] :'SequenceId';
        if (id!=undefined){
            if (!id.isEmpty())
                return id;
        }

        if (sequence[_k]==undefined)
            sequence[_k]=0;
        sequence[key]=sequence[_k]+1;
        return _k + "_" + sequence[_k];
    };
    return{
        getId:getId
    };
}();



// export {i$, ERROR, EXCEPTION, System, j$};
