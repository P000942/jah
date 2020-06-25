/*
 * To change this template, choose Tools 
 * and open the template in the editor.
 */
function i$(id) {
    return document.getElementById(id);
}
var NO_IE=document.getElementById&&!document.all;
var System = function(){
    let result = null;
    let _QueryString={};
    let importJS= file =>{
        var headTag = document.getElementsByTagName('head')[0];
        var script  = document.createElement("script");
        script.type ="text/javascript";
        script.src = file;
        headTag.appendChild(script);
    };
    let importCSS =  (file, media) =>{
       if (media == undefined)
           media = "screen";
        var headTag = document.getElementsByTagName('head')[0];
        var script  = document.createElement("link");
        script.type ="text/css";
        script.src = file;
        script.media =media;
        headTag.appendChild(script);
    };
    return{
        using: (url, media) =>{
            if (url.toUpperCase().indexOf('.CSS') > -1)
               importCSS(url, media);
            else if (url.toUpperCase().indexOf('.JS') > -1)
               importJS(url);
        }
      , parameters: key=>{return _QueryString[key]}
      , init:()=>{
            if (System.Browser.msie){
                MOUSE.BUTTON.LEFT = 1;
                MOUSE.BUTTON.CENTER = 4;
            }

            System.Hint.init();
            /* pegar os parametros passados na URL */
            var parms=location.search.replace(/\x3F/,"").replace(/\x2B/g," ").split("&");
            if (parms!=""){
                for(i=0;i<parms.length;i++){
                    nvar=parms[i].split("=");
                    _QueryString[nvar[0]]=unescape(nvar[1]);
                }
            }
            //return _QueryString;
        }
      , result:function(){return result;}
      , api:{prototype:false, jquery:false}
    };
}();
const j$={ui:{},sys:System,sample:{}};

//@note: util apenas em dsv para ver os objetos/colecoes e seus respectivos shortcut - que estão instanciados
//j$.$V() ou j$.$V("$R")
j$.$V= key =>{
   let shortCut = {"$C":"Controller:","$P":"Page:","$R":"Resource:","$S":"Service:"};
   for (id in shortCut){
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

if (window['jQuery'] != undefined)
   System.api.jquery=true;

// Extender UI
if (System.api.jquery){
    Element.prototype.stylize = function(properties) {
        if (properties){
            if (typeof properties =='string'){
               if (properties.match(/[:;]/gi)==null) //Se tem ':' eh uma string com style
                   this.className = properties;
               else                             //senao, pode ser o nome de uma class
                   this.style.cssText = properties;
            }else{
                for (var att in properties){
                    if (att.trim().toLowerCase() == 'clas$')
                        this.className = properties[att];
                    else
                       this.style[att]=properties[att];
                }
            }
        }
    }
    Element.prototype.insert = function(content) {
        var id = "#" + this.id;
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
    }
    Element.prototype.remove = function() {
        $("#" + this.id).remove();
    }
    Element.prototype.addClassName = function(className) {
        $("#" + this.id).addClass(className);
    }
    Element.prototype.hide = function() {
        $("#" + this.id).hide();
    }
    Element.prototype.show = function() {
        $("#" + this.id).show();
    }
    Element.prototype.toggle = function() {
        $("#" + this.id).toggle();
    }
    Event.observe = function(node, event, callback) {
        var element = null;
        if (dataExt.isString(node))
            element = $("#" + node);
        else
            element = $("#" + node.id);
        element.bind(event, callback);
     }
    Event.element=function(event){return event.target}

    window['Ajax']={
        Request:function(url, properties){
            var options={url:url};
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
}

Element.prototype.content= function(value){
    if (value == undefined){
      var value = '';
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


// google.setOnLoadCallback(function(a,b) {
//executa quando abre a pagina web
 $(document).ready(function(){
    System.Browser = function(){
        return {
            getPosOffSet: (what, offsettype)=>{
                    let totaloffset=(offsettype=="left")? what.offsetLeft : what.offsetTop;
                    let parentEl=what.offsetParent;
                    while (parentEl!=null){
                        totaloffset=(offsettype=="left")? totaloffset+parentEl.offsetLeft : totaloffset+parentEl.offsetTop;
                        parentEl=parentEl.offsetParent;
                }
                return totaloffset;
            }
        ,clearEdge: (obj, whichedge, target)=>{
                        let edgeoffset=0;
                        let windowedge=null;
                        if (target == undefined)
                            target = dropmenuobj;
                        if (whichedge=="rightedge"){
                                windowedge=System.Browser.msie && !window.opera? System.Browser.body.scrollLeft+System.Browser.body.clientWidth-15 : window.pageXOffset+window.innerWidth-15;
                                target.contentmeasure=target.offsetWidth;
                                if (windowedge-target.x < target.contentmeasure)
                                        edgeoffset=target.contentmeasure-obj.offsetWidth;
                        }else{
                                windowedge=System.Browser.msie && !window.opera? System.Browser.body.scrollTop+System.Browser.body.clientHeight-15 : window.pageYOffset+window.innerHeight-18;
                                target.contentmeasure=target.offsetHeight;
                                if (windowedge-target.y < target.contentmeasure)
                                        edgeoffset=target.contentmeasure+obj.offsetHeight;
                        }
                        return edgeoffset;
            }
            , compatible:()=>{return (System.Browser.msie||System.Browser.gecko||System.Browser.webkit||System.Browser.opera||System.Browser.safari)?true:false;}
//            , msie:(System.api.prototype)?Prototype.Browser.IE:$.browser.msie
//            , gecko:(System.api.prototype)?Prototype.Browser.Gecko:$.browser.mozilla
//            , opera:(System.api.prototype)?Prototype.Browser.Opera:$.browser.opera
//            , webkit:(System.api.prototype)?Prototype.Browser.WebKit:$.browser.webkit
//            , safari:(System.api.prototype)?Prototype.Browser.MobileSafari:$.browser.safari
            , body:(document.compatMode && document.compatMode!="BackCompat")? document.documentElement : document.body
        };
    }();

    System.Hint = function(){
        let idHint="hintbox";
        return{
            init:()=>{
                // cria o container para montar o elemento hint
                if (i$(idHint)==undefined){
                    var divblock=document.createElement("div");
                    divblock.setAttribute("id", idHint);
                    document.body.appendChild(divblock);
                }
            },
            show:(hintText, obj, e, clas$, tipwidth)=>{
                if ((System.Browser.msie||NO_IE) && i$(idHint)){
                    var hintBox=i$(idHint);
                    hintBox.style.height='';
                    hintBox.innerHTML=hintText;
                    if (clas$==undefined)
                        clas$='hint-info';
                    hintBox.className = 'hint ' + clas$;

                    hintBox.style.left=hintBox.style.top=-500 ;
                    if (tipwidth!=""){
                        hintBox.widthobj=hintBox.style;
                        hintBox.widthobj.width=tipwidth;
                    }
                    hintBox.x=System.Browser.getPosOffSet(obj, "left");
                    hintBox.y=System.Browser.getPosOffSet(obj, "top");
                    obj.onmouseout=System.Hint.hide;
                    if (hintBox.offsetHeight<34)
                        hintBox.style.height='34px';
                    hintBox.style.left=(hintBox.x - System.Browser.clearEdge(obj, "rightedge", hintBox)+obj.offsetWidth +5) + "px";
                    hintBox.style.top =(hintBox.y - System.Browser.clearEdge(obj, "bottomedge", hintBox)) +"px";
                    hintBox.style.visibility="visible";
                    if ((hintBox.offsetHeight - obj.offsetHeight)>0)
                       hintBox.style.top = ((hintBox.y - System.Browser.clearEdge(obj, "bottomedge", hintBox))
                                         -  ((hintBox.offsetHeight - obj.offsetHeight)/2)-2) + 'px';
                }
            },
            hide: e =>{
                i$(idHint).style.visibility="hidden";
                i$(idHint).style.left="-500px";
            }
        };
    }();
    System.init();
    //alert('ops');
});
System.Action = ()=>{ 
   let self = this;
   this.actions = col_actions = [];

   this.addAction = function(action){ 
      self.actions.push(action);
   };
   this.execute = o =>{
      let result = false;
      for (var i=0; i < this.actions.length; i++){
          result=self.actions[i](o);
      }
      return result;
   };
   this.clear = ()=>{
       self.actions = [];
   };
};
const NOW = new Date();
const KEY = {F1:112, F2:113, F3:114, F4:115, F5:116, F6:117,F7:118, F8:119, F9:120, F10:121, F11:122, F12:123,
           ENTER:13, ESC:27, COMMA:44, BACKSPACE:8, TAB:9, END:35, HOME:36, LEFT:37, UP:38, RIGHT:39, DOWN:40, INS:45, DEL:46, REFRESH:116};
const ALIGN = {LEFT:'left', CENTER:'center', RIGHT:'right', JUSTIFY:'justify'};

const MOUSE = {BUTTON:{LEFT:0,CENTER:1,RIGHT:2}};

const ORDER = {ASCENDING:'ASC', DESCENDING:'DESC', NONE:'NONE'};
ORDER.CLASS =  order =>{
    let _class = "";
     switch(order) {
       case ORDER.NONE:
            _class = null;
            break;
       case ORDER.ASCENDING:
            _class = "list-ikon ikon-sort-asc";
            break;
       case ORDER.DESCENDING:
            _class = "list-ikon ikon-sort-desc";
            break;
     }
    return _class;
};
const FILTER ={};
FILTER.CLASS =  filter =>{
    return (filter)?'list-ikon ikon-filter':null;
};

j$.util = function(){
    let sequence = {};
    let getId = function(key, id){
            if (id!=undefined){
                if (!id.isEmpty())
                    return id;
            }
            if (key==undefined)
                key = 'SequenceId';
            if (sequence[key]==undefined)
                sequence[key]=0;
            sequence[key]=sequence[key]+1;
            return key + "_" + sequence[key];
    };
    return{
        getId:getId
    };
}();


j$.Dashboard = function(){
    let idContent=CONFIG.LAYOUT.CONTENT;
    let idToolbar='toolbar';

    return{
        init: properties=>{
            //menubar = j$.ui.Menu.create("menubar");
            j$.Dashboard.Menubar.create();
            j$.Dashboard.Tabs.create();
            j$.Dashboard.Sidebar.create();
            j$.Dashboard.Menubar.bindToTabs(properties.services, properties.design);
            j$.Dashboard.Sidebar.bindToTabs(properties.services, properties.design);
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
      , idToolbar:idToolbar
    };
}();

j$.Dashboard.Tabs=function(){
    let tabs;
    let idContent='tabs';
    let ftmKey = (service) =>{ return "tab_"+service.Parent.key+'_'+service.key}
    return{
       create: ()=>{ tabs = j$.ui.Tabs.create(j$.Dashboard.Tabs.idContent,j$.Dashboard.idContent) }
       , open: properties =>{
          return tabs.open(properties);
       }
       , delegateTo: (service, event, record)=>{
            j$.Dashboard.Tabs.open({key:ftmKey(service),
                   caption:service.caption, title: service.title
                  , onLoad: function(tab){
                         j$.service.c$[service.key].init(tab.idContent);
                    }
            });
       }
       , openPartial:(service, event, record)=>{
            j$.Dashboard.Tabs.open({key:ftmKey(service),
                   caption:service.caption,
                    onLoad:function(tab){
                        tab.showURL(service.url);
                    }
            });
       }
       , getTab: (menu_key, item_key) =>{ return tabs.getItem("tab_"+menu_key+'_'+item_key) }
       , idContent:idContent
    };
}();
j$.Dashboard.Menubar=function(){
    let menubar;
    let idContent='menubar';
    return{
          //menu={key:'', caption:'', url:'', hint:'', items:[]}
         bindItems: function(menu, Items){
            let menuBase = menubar.addMenu(menu);
             for (let idx=0; idx<menu.items.length;  idx++){
                let item = Items[menu.items[idx]];
                 j$.Dashboard.bindItem(item);
                 menuBase.add(item);
             }
         }
       ,  bindToTabs: function(Items, design){
                for (let key in design){
                    let menu = design[key];
                    if (dataExt.isArray(menu))
                        menu = {items:design[key]};
                    Object.preset(menu, {key:key, caption:key});
                    j$.Dashboard.Menubar.bindItems(menu, Items);
                }
         }
       , create: function(){
           menubar = j$.ui.Menu.create(j$.Dashboard.Menubar.idContent);
       }

       , addMenu:function(menu){
          return menubar.addMenu(menu);
       }
       , getMenu:function(menu_key){
          return menubar.getMenu(menu_key);
       }
//       , getSubmenu:function(menu_key, item_key){
//          return menubar.getMenuItem(item_key, menu_key);
//       }
       , render:function(menu){
           menubar.render();
       }
       , idContent:idContent
    };
}();

j$.Dashboard.Sidebar=function(){
    let menubar;
    let idContent='sidebar';
    let items={};
    return{
          //menu={key:'', caption:'', url:'', hint:'', items:[]}
         bindItems: function(menu, Items){
             //var menuBase = menubar.addMenu(menu);
             for (let idx=0; idx<menu.items.length;  idx++){
                 let item = Items[menu.items[idx]];
                 if (item.partial && !item.url)
                     item.url = item.partial;
                 item.Parent=menu;
                 if (!menu.Items){menu.Items={};}
                 menu.Items[item.key]=item;

                 j$.Dashboard.Sidebar.Items[menu.key]=menu;

                 let onClick ="href='javascript:"
                 +"j$.Dashboard.Sidebar.Items."+menu.key+".Items."+item.key+".open(\""+menu.key+"\",\""+item.key +"\")' ";
                 let clas$ =" class='sidebar_link' ";
                 menu.dropbox.target.insert('<div class="wrap_sidebar_link"><a '+ onClick + clas$ + '>' +item.caption+ '</a></div>');

                 if (item.partial)
                    item.open=function(menu_key, item_key){
                        let menu_item=j$.Dashboard.Sidebar.Items[menu_key].Items[item_key];
                        j$.Dashboard.Tabs.openPartial(menu_item);
                    };
                 else
                    item.open=function(menu_key, item_key){
                        let menu_item=j$.Dashboard.Sidebar.Items[menu_key].Items[item_key];
                        j$.Dashboard.Tabs.delegateTo(menu_item);
                    };
             }
         }
       ,  bindToTabs: function(Items, design){
                for (let key in design){
                    let menu = design[key];
                    if (dataExt.isArray(menu))
                        menu = {items:design[key]};
                    Object.preset(menu, {key:key, caption:key});
                    menu.dropbox= TYPE.DROPBOX({container:i$(j$.Dashboard.Sidebar.idContent), id:"sidebar_"+key, legend:menu.caption, hide:true
                                                });
                   j$.Dashboard.Sidebar.bindItems(menu, Items);
                }
         }
       , create: function(){
           return true;
       }
       , idContent:idContent
       , Items:items
    };
}();

j$.Node=function(inheritor, properties){
    let self_node = this;
    this.Items={};
    this.length = 0;
    this.c$ = this.Items;
    this.C$ = Items;
    this.type = inheritor.type;
    this.Root = inheritor.Root;
    this.Parent = inheritor.Parent;
    let util = function(){
        return{
             formatKey:function(){
                let key='';
                 if (dataExt.type(properties)=='String')
                     key=properties.toKey();
                 else if (properties.key)
                     key= properties.key;
                 else if (properties.caption)
                     key=properties.caption.toKey();

                 if (key.isEmpty())
                     key=j$.util.getId(self_node.Parent.key + "_" + self_node.type);

                 if (properties.caption==undefined)
                    properties.caption=key.toCaption();

                  return key;
             }
           ,  formatId:function(){return (properties.id)?properties.id:self_node.Parent.id +'_'+self_node.key;}
           , checkHandler: function(){
                 if (properties.onClick) {self_node.onClick =function(event){return properties.onClick(self_node, event);};}
           }
        };
    }();
    this.id = function(){
          if (dataExt.isString(properties)){ // veio apenas o caption
             Object.preset(self_node, {caption:properties, key:util.formatKey()});
          } else {
              if (!properties){properties={}};
              self_node.key=util.formatKey();
              self_node.caption = properties.caption;
              util.checkHandler();
          }
          return util.formatId();
    }();
    function Items(key){
         return self_node.Items[key];
    }
    this.addItem = (key, item)=>{
        self_node.length +=1;
        self_node.Items[key]=item;
    };
    this.removeItem = key=>{
        self_node.length -=1;
        self_node.Items[key]=null;
    };
    this.show =()=>{
        console.log(self_node.key +"."+ self_node.caption);
        for (let key in self_node.c$)
               self_node.c$[key].show();
    };
    this.first = ()=>{
        for (let key in self_node.c$)
            return self_node.c$[key];
    };
};

j$.ui.Open = function(){
    return{
        url: (url, idContent)=>{
            if (idContent)
               j$.ui.Open.partial(url, CONFIG.LAYOUT.CONTENT);
            else
               window.location = url;
        },
        partial:(url, idContent, complete)=>{
                if (!idContent)
                     idContent = CONFIG.LAYOUT.CONTENT;

                let pars = '';
                if (!url.isEmpty()) {
                    let myAjax = new Ajax.Updater( idContent, url, {method: 'get', parameters: pars, onComplete:complete});
                }
       }
    };
}();
