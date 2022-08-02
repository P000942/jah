/*
 by Geraldo Gomes
 */
'use strict';
// import {CONFIG, c$} from  "../config.js";
// import j$.Ext from  "../api/dataExt.js"; 
function i$(id) {
    if (id instanceof HTMLElement)
       return id;
    return document.getElementById(id);
}

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
            Element.prototype.addInput = function(input, id) {
                let name ="";
                if (input.constructor && input.constructor.name)
                   name = input.constructor.name.toUpperCase();
                if (input.create && TYPE[name])
                    input.create(this, id)
            }
            Element.prototype.addLabel = function(label, inputId, properties) {
                j$.ui.Render.label(this, label, inputId, properties);    
            }     
            Element.prototype.alertShow = function(msg, clas$) {
                j$.Page.Alert.show(msg, clas$, this)  
            }  
            Element.prototype.alertSuccess = function(msg) {
                j$.Page.Alert.success(msg, this)  
            }   
            Element.prototype.alertError = function(msg) {
                j$.Page.Alert.error(msg, this)   
            }            
            Element.prototype.alertInfo = function(msg) {
                j$.Page.Alert.info(msg, this)   
            }                             
            Element.prototype.stylize = function(properties) {
                if (properties){
                    if (typeof properties =='string'){
                        if (properties.match(/[:;]/gi)==null) //Se tem ':' eh uma string com style
                            this.className = properties;
                        else                                  //senao, pode ser o nome de uma class
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
                if (j$.Ext.isString(content)){
                    $(id).append(content);
                }else{
                    if (content.after)
                        $(id).after(content.after);
                    if (content.bottom || content.append)
                        $(id).append((content.append) ?content.append :content.bottom);
                    if (content.before)
                        $(id).before(content.before);
                    if (content.top || content.prepend)
                        $(id).prepend((content.prepend)?content.prepend :content.top);                    
                }
                return (idInner) ?i$(idInner) :null;
            }
/*             Element.prototype.retire = function() {
                if (!this.id.isEmpty())
                    $("#" + this.id).remove();
            } */
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
                if (j$.Ext.isString(node))
                    element = $("#" + node);
                else
                    element = $("#" + node.id);
                element.bind(event, callback);
            }
            Event.element=function(event){return event.target}
        
            window['Ajax']={
                Request:function(url, properties){
                    properties.method = properties.method ?properties.method.toUpperCase()
                                                              :properties.method = 'GET';
                    if (properties.postBody && (properties.method == 'POST' || properties.method == 'PUT')){
                        properties.processData = false;
                        properties.data = properties.postBody; 
                    }else     
                        properties.data = properties.parameters;
                                                                                      
                    //let options=Ajax.Adapter.jquery(url, properties);
                   // let options=Ajax.Adapter.native(url, properties);
                    let options = Object.map(properties, {data:"body", method :"method"});
                    options.headers = {'content-type':properties.contentType};    
                    options.mode = "cors";     
                    fetch(url, options)
                        .then(response=> {
                            if (!response.ok){                        
                                if (properties.onFailure)
                                    propertiesonFailure(data); 
                            }else{
                                if (response.status == CONFIG.HTTP.STATUS.NO_CONTENT.VALUE)
                                    properties.onSuccess(response);
                                else{
                                    response.json()
                                    .then(data=> {
                                        if (properties.onSuccess)
                                            properties.onSuccess(data);
                                    })
                                }   
                            } 
                        })
                        .catch((err)    => 
                            console.log('erro:'+err.message)
                            )
                }
            , Updater:function(idContent, url, parm){                   
                    fetch(url)
                        .then(response =>{return response.text()})
                            .then(html=>{
                                if (parm.onComplete)
                                    parm.onComplete(html, url);
                                $("#"+idContent).append(html);
                            })
                        .catch(err => 
                            console.log('ERRO>> Ajax.Updater:' + err.message)
                        )     
                }
            };
    
        /* pega o valor de um elemento */
            Element.prototype.get= function(){
                let value = '';
                switch(j$.Ext.type(this)){
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
                    switch(j$.Ext.type(this)){
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
                    switch(j$.Ext.type(this)){
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
                switch(j$.Ext.type(this)){
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

System.EXCEPTION = function() {
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
               System.EXCEPTION.on(exception,text);
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
     }
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
     show =()=>{
        //console.log(_node.key +"."+ _node.caption);
        for (let key in _node.c$)
            _node.c$[key].show();
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




System.Node=function(inheritor, properties){
    let _node = this;
    this.length = 0;
    this.c$ = {};
    Object.preset(_node, inheritor,["type","Root","Parent"])
    let util = function(){
        return{
            formatKey:function(){
                let key='';
                properties = j$.Ext.toObject(properties,'key');
                if (properties.key)
                    key= properties.key;
                else if (properties.caption)
                    key = properties.caption.toKey();

                if (key.isEmpty())
                    key=System.util.getId(_node.Parent.key + "_" + _node.type);

                if (properties.caption==undefined)
                    properties.caption=key.toCaption();

                return key;
            }
        ,  formatId:function(){return (properties.id)?properties.id:_node.Parent.id +'_'+_node.key;}
        , checkHandler: function(){
                if (properties.onClick) {_node.onClick =function(event){return properties.onClick(_node, event);};}
        }
        };
    }()
    this.id = function(){
        if (j$.Ext.isString(properties)){ // veio apenas o caption
            Object.preset(_node, {caption:properties, key:util.formatKey()});
        } else {
            if (!properties){properties={}};
            _node.key=util.formatKey();
            _node.caption = properties.caption;
            util.checkHandler();
        }
        return util.formatId();
    }()

    let addItem=(key, item)=>{
        _node.length +=1;
        _node.c$[key]=item;
    }
    // this.add = addItem;
    this.put = addItem;
    this.remove = key=>{
        _node.length -=1;
        _node.c$[key]=null;
    }
    this.show =()=>{
        //console.log(_node.key +"."+ _node.caption);
        for (let key in _node.c$)
            _node.c$[key].show();
    }
    this.first = ()=>{
        for (let key in _node.c$)
            return _node.c$[key];
    }
}


System.util = function(){
    let sequence = {};
    let getId = function(key, id){
        let _k =(j$.Ext.isString(key)) ? key.split(" ")[0] :'SequenceId';
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

j$.ui.Render= function(){
    return {
        attributes:(attributes, exception)=>{
            //formata outros atributos de html do formulárioa para renderizar
            let result = ' ' 
            ,   ignore =att=>{
                    let go=false;
                    if (['key','caption','icon'].indexOf(att)>-1)
                        go= true;
                    else if (exception){
                        if ((j$.Ext.isString(exception) && exception===att)
                        || (j$.Ext.isArray(exception) && exception.has(att)))
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
            let id$ = System.util.getId(clas$, id);
            if (!i$(id$)){
            wrap.insert(`<div id='${id$}' class='${clas$}'></div>`);
            i$(id$).stylize(style);
            }   
            return i$(id$);
        }
    , label: (wrap, label, inputId, att$)=>{
            let att = {clas$:CONFIG.LABEL.CLASS
                    , mandatory:false
                    , position:'append'
                    , id:System.util.getId('Label')
                    , for:null}
            Object.setIfExist(att,att$);
            let fmt_pos=(position, html)=>{
                if (position==='append')
                    return html;
                let _pos = {};
                _pos[position]=html;
                return _pos;
            }                         
            if (inputId) {
                att['id'] =inputId+ '_label' ;
                att['for']=inputId;
            }                
            label =(label)?label : att.id;
            if (!i$(att.id)){ // cria se não existir
                let _att = j$.ui.Render.attributes(att,'label')
                , required =(att.mandatory) ?`<span class="${CONFIG.INPUT.REQUIRED.CLASS}">*</span>` :'';
                i$(wrap).insert(fmt_pos(att.position, `<label ${_att} >${label}${required}:</label>`));   
            }
            let lbl = i$(att.id);
            lbl.stylize(att.style);
            return lbl;
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
            let wrapId =System.util.getId(wrapStyle, id)
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
            let wrapId=System.util.getId(wrapStyle, id)
            , legend="", idLegend=`${wrapId}_legend`;
            if (title!=undefined){
                if (j$.Ext.isString(title))
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
        let icon = (properties.icon) ?properties.icon :c$.ICON.get(properties.key);  
        return '<a' +j$.ui.Render.attributes(properties,['value', 'element'])+ '>'
             +j$.ui.Render.icon(icon) +properties.value+'</a>';
    }
    , formatClose:(dismiss)=>{        
        return `<button type="button" class="btn-close text-reset" data-bs-dismiss="${dismiss}" aria-label="Fechar"></button>`;
    }
    , formatButtonDropdown:(properties)=>{
        let icon = (properties.icon) ?properties.icon :c$.ICON.get(properties.key); 
        return '<div id="' +properties.id+ '"  class="btn-group" role="group" aria-label="Button group with nested dropdown">'                 
                +  '<div class="btn-group" role="group">'                   
                +    '<button class="btn btn-default dropdown-toggle" data-bs-toggle="dropdown" ' +j$.ui.Render.attributes(properties,['value','onclick','submenu','id'])+ '>'+j$.ui.Render.icon(icon)+'</button>'              
                +    '<div id="'+properties.id+'Menu" class="dropdown-menu"></div>'
                +    '</div>'
                +'</div>';
    }
    , color: value=> {return (value) ?`style="color:${value};" `  :'' }
    , style: value=> {return (value) ?`style="${value}" `  :'' }
    //@note: j$.ui.Render.icon('bi bi-table') ou j$.ui.Render.icon({CLASS:'bi bi-table', COLOR:'green'})
    , icon:(properties)=>{
        if (j$.Ext.hasAnyValue(properties)){
            let ICON = j$.Ext.toObject(properties, 'CLASS') 
            ,  color = j$.ui.Render.color(ICON.COLOR)              
            ,  style = j$.ui.Render.style(ICON.STYLE);               
            return `<i class="${ICON.CLASS}" ${color}${style}></i>`;
        } else 
            return "";    
    }
    , alert:(wrap, msg, clas$=CONFIG.ALERT.INFO.CLASS)=>{
        let alert = j$.Ext.toObject(clas$, 'CLASS')
        , iconClass = (alert.ICON)?j$.ui.Render.icon(alert.ICON):"";
        alert.CLASS = (alert.CLASS)? `class='alert ${alert.CLASS} alert-dismissible fade show'`: "class='alert alert-dismissible fade show'";
        wrap.insert(`<div ${alert.CLASS} role="alert">                    
                    ${iconClass}
                    ${msg}
                    ${j$.ui.Render.formatClose("alert")}                    
                     </div>`);                    
    }
    };
}();    

System.Init = function(){
    let sequence = {};
    return{
        menu:parserDefault=>{  
            let parsers = j$.Dom.exists([c$.MENU.TYPE.MENUBAR, c$.MENU.TYPE.SIDEBAR,c$.MENU.TYPE.OFFCANVAS]);    
            if (CONFIG.MENU.PARSER.isEmpty())
               CONFIG.MENU.PARSER = parserDefault; // para garantir o parser
            if (parsers.length>1)                  // vai permanecer apenas o parserDefault 
               j$.Dom.keep(CONFIG.MENU.PARSER, parsers) 
            else                                   // vai prevalecer o id=parser que está declarado no html
                CONFIG.MENU.PARSER = parsers[0];
        }
    }
}();

$(document).ready(function(){
    System.Init.menu(c$.MENU.TYPE.SIDEBAR);
});

// export {i$, System};
