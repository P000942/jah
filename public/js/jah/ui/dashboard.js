'use strict';
// import {CONFIG, c$} from  "../config.js";
// import dataExt      from  "../api/dataExt.js"; 
// import System        from  "../api/system.js"; 
j$.Dashboard = function(){
    let idContent=CONFIG.LAYOUT.CONTENT
     // , idToolbar='toolbar';

    return{
        init: properties=>{
            j$.Dashboard.Factory = (properties.designer && properties.designer.factory) 
                                 ?j$.Dashboard[properties.designer.factory] 
                                 :j$.Dashboard.Menubar
            j$.Dashboard.Factory.create();
            j$.Dashboard.Service.init();
            j$.Dashboard.Factory.bindToTabs(properties.services, properties.designer.options);
        }
        , bindItem: item =>{
            if (!item.url && !item.onCLick){
                if (item.partial)
                    item.onClick=j$.Dashboard.Service.openPartial;
                else if (item.modal){
                    item.onClick=function(menu){
                        j$.Service.c$[menu.key].init(null, menu.modal);
                    }
                } else
                    item.onClick=j$.Dashboard.Service.delegateTo;
                item.byPass =true;
            }
        }
        , openItem: (item, record) => {
            if (!item.url && !item.onCLick){
                if (item.partial)
                    j$.Dashboard.Service.openPartial(item, null, record); //#Todo: passar o record
                else if (item.modal){
                    j$.Service.c$[item.key].init(null, item.modal, record);
                } else
                    j$.Dashboard.Service.delegateTo(item, null, record); //#Todo: passar o record
            }
    }
    , idContent:idContent
    }
}();

j$.Dashboard.Service=function(){
    let tabs
      , idContent='root'
      , ftmKey = (service) =>{return "tab_"+service.Parent.key+'_'+service.key}
    return{
          init: ()=>{ tabs = j$.ui.Tabs.create(j$.Dashboard.Service.idContent,j$.Dashboard.idContent) }
        , open: properties =>{return tabs.open(properties)}
        , delegateTo: (service, event, record)=>{
                j$.Dashboard.Service.open({key:ftmKey(service)
                    , caption:service.caption, title: service.title
                    ,  onLoad: function(tab){
                                j$.Service.c$[service.key].init(tab.idContent);
                            }
                });
        }
        , openPartial:(service, event, record)=>{
                j$.Dashboard.Service.open({key:ftmKey(service)
                    ,caption:service.caption
                    , onLoad:function(tab){
                            tab.showURL(service.url, tab.httpComplete); // httpComplete - callback quando acionado apos a carga
                            }
                });
        }
        , idContent:idContent
    };
}();

j$.Dashboard.Menubar=function(){
    let menubar
      , _c$ = CONFIG.MENU.OPTIONS[CONFIG.MENU.PARSER.toUpperCase()];
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

j$.Dashboard.Open = function(){
    return{
        url: (url, idContent)=>{
            if (idContent)
                j$.Dashboard.Open.partial(url, idContent);
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

j$.ui.Tabs = function(){
    let tabs = {}, _root=null
      , Root=function(idTab, idContent){ 
            let _root = this   
            , active_tab=null
            , idWrap = "wrap_"+idTab;
            this.inherit=System.Node;
            this.inherit({type:'Tabroot', Root:_root, Parent:null}, {key:idTab, id:idContent});   
            Object.preset(_root, {add:add, getItem: _root.C$, open:open, toggle:toggle, activate:activate, close:close}); 
        
            const initialized=function(){
                if (!idContent){       
                throw  System.EXCEPTION.format(EXCEPTION.ITEM.INVALID_ELEMENT, "Impossível montar um objeto tabs sem indicar o 'ID' do elemento html onde será montado");
                }else{
                i$(idContent).insert(`<div id='${idWrap}' class='${CONFIG.TAB.CLASS.CONTAINER}' />`); //wrap geral do tab
                i$(idWrap).insert(`<div id='${idTab}' class='${CONFIG.TAB.CLASS.BUTTONS}' />`);       //Wrap das tab-link
                }
                return true;
            }();
            function add(oTab){            
                let tab = new Tab(_root, oTab);   
                _root.put(tab.key,tab);
                return tab;
            }  
            function open(oTab){
                let tab= _root.C$(oTab.key);
                if (!tab)
                tab=_root.add(oTab);   	
                _root.activate(tab.key);
                return tab;
            }        
            // Exibe o TAB (ativo) se tiver escondido, e ESCONDE se tiver ativo   
            function toggle(){
            if (active_tab){
                if (active_tab.active) 
                    active_tab.hide();
                else
                    active_tab.show();
            } 
            }        
            // Coloca a tab indica(key) como ativa
            function activate(key){	
                let tab=_root.C$(key);	       
                if (active_tab)  // Verifica se há uma TAB ativa e desativa a mesma
                    active_tab.deactivate();
                active_tab=tab;	
                _root.active=tab;	
                tab.activate();
            }	
            // fecha a tab indica(key) 
            function close(key){	
                let tab=_root.C$(key);
                if (active_tab){             
                    if (active_tab.key==key)
                        active_tab=null;
                }
                tab.close();
                _root.remove(key);        
                if (_root.length>0) {
                    _root.activate(_root.first().key);
                };
            }	  
            //tab={key:'' caption:''[, fixed:false, onLoad:function(){}, onActivate:function(){}, onDeactivate:function(){}]}
            function Tab(_parent, tab){   
                let _tab = this;  
                Object.preset(_tab,{append:addContent, update:updContent,clear:clearContent, showURL:showURL, render:render
                                , show:show, load:load, hide:hide, activate:activate, close:close, deactivate:deactivate 
                                , fixed:false, loaded:false, active:false, parent: _parent
                                , caption:tab.caption, id:tab.key, key:tab.key, idContent:tab.key+"_Content" 
                            });		  
        
                //this.title =text=>{return _tab.Header.title(text)}                  
                
                const initialized=function(){
                    Object.setIfExist(_tab, tab, ['onLoad','onActivate','onDeactivate', 'onClose', 'fixed','url']);
                    if (!_tab.onLoad && _tab.url){
                        _tab.onLoad=function(tab){tab.showURL();};
                    }
                    createBase();   
                    return true;           
                }();
                
                function createBase(){
                    let html = ""; 
                    if (i$(_tab.id)) { // Quando jah existe, remove
                        html = i$(_tab.id).innerHTML;
                        i$(i$(_tab.id).parentNode).removeChild(i$(_tab.id));  	
                        i$(_tab.id);
                    }             
                    i$(idTab).insert({bottom: _tab.render() + "\n"}); // cria o link da tab
                    i$(idWrap).insert({bottom: 
                                            `<div class='${CONFIG.TAB.CLASS.WRAP}' id='${_tab.id}'>` 
                                            +`<div class='${CONFIG.TAB.CLASS.CONTENT}' id='${_tab.idContent}'>${html}</div>`
                                            +"</div>\n"
                                    }); // cria o container da tab               
                };             
                // executar a ação associada a TAB indica(key)
                function load(){              
                    if (!_tab.loaded && _tab.onLoad)                  
                        _tab.onLoad(_tab);
                        //_tab.onLoad.execute(_tab);                                          
                    this.loaded=true;
                }
                function activate(){   
                    _tab.load();
                    _tab.show();
                    //_tab.onActivate.execute(_tab); 
                    if (_tab.onActivate)
                        _tab.onActivate(_tab);  
                    this.active =true;
                }
                function deactivate(){                                             
                    if (_tab.onDeactivate)
                        _tab.onDeactivate(_tab);  
                    _tab.hide();
                    this.active =false;
                }
                function close(){    
                    if (_tab.onClose)
                        _tab.onClose(_tab);
                    _tab.hide();
                    i$("tab_link_"+_tab.key).remove(); 
                    i$(_tab.id).remove();               
                }
                function hide(){	                
                        i$("tab_link_"+_tab.key).className="link_tab";  
                        i$(_tab.id).hide();
                }
                function show(){
                    i$("tab_link_"+_tab.key).className="active_link_tab";               
                    i$(_tab.id).show();		
                }
                function render(){			 
                    let linkClose =(_tab.fixed)?'':`<a class='${CONFIG.TAB.CLASS.CLOSE}' href=\"javascript:j$.ui.Tabs.c$.` + _tab.parent.key 
                                    + ".close('" + _tab.key + "');\" >&nbsp;&nbsp;</a>";              
                    return `<span class='${CONFIG.TAB.CLASS.TITLE}' onmouseover='j$.ui.Tabs.HANDLE.onmouseover(this);' onmouseout='j$.ui.Tabs.HANDLE.onmouseout(this);' id='tab_link_`+ this.key+"'>"
                        +`<a class='${CONFIG.TAB.CLASS.TITLE}' id='link_` + _tab.key +  "' " 
                        + "href=\"javascript:j$.ui.Tabs.c$." + _tab.parent.key + ".activate('" + _tab.key + "');\" >"
                        + _tab.caption + "</a>"
                        + linkClose +"</span>";
                }
                function addContent(html){			 
                        i$(_tab.idContent).insert({bottom:html}); 
                }
                function updContent(html){			 
                        i$(_tab.idContent).innerHTML = html;
                }
                function clearContent(html){			 
                        i$(_tab.idContent).innerHTML = "";
                }
                function showURL(url, complete){
                    if (!url)
                        url=_tab.url;
                    j$.Dashboard.Open.partial(url,_tab.idContent, complete);
                    _tab.loaded = true;  		  
                } 		  
            } //tab 	
    } // Root;
    return{        
         C$:key=>{return tabs[key]}
      , open:(root,key)=>{tabs[root].open(key)}  
      , create: (idTabs, idContent)=>{
             tabs[idTabs] = new Root(idTabs, idContent);
             if (!j$.ui.Tabs.root){
                j$.ui.Tabs.root = tabs[idTabs]
                j$.$T = j$.ui.Tabs.root.c$;
             }
             return tabs[idTabs];
      }
      , HANDLE:{
                onmouseover: obj=>{
                    if (obj.className.indexOf('active')>-1)
                        obj.className = CONFIG.TAB.CLASS.HOVER_ACTIVE;
                    else
                        obj.className = CONFIG.TAB.CLASS.HOVER;
                }
               , onmouseout: obj=>{
                    if (obj.className.indexOf('active')>-1)
                        obj.className = CONFIG.TAB.CLASS.ACTIVE;
                    else        
                        obj.className = CONFIG.TAB.CLASS.TITLE;
                }    
        }  
      , c$:tabs
      , root: _root
    };   
}(); 
j$.ui.Menu = function(){ // factory
    let items = {}
      , _parser = CONFIG.MENU.PARSER
      , _option = CONFIG.MENU.OPTIONS[_parser.toUpperCase()]
      , Designers={
            menubar:function(){
                return{
                format (properties){
                        let attClass = '', attDropdown = '', attDropdownUl ='', attIcon='';  
                        let attHint = (properties.title)? 'title="' + properties.title + '"' : '';
                        if (properties.active){
                            attClass='class="active"';
                            properties.Root.active=true;
                        }
                        if (properties.icon)
                            attIcon='<i class="'+properties.icon+'"></i>';
                        
                        if (properties.length>0){
                            attClass  = 'class="nav-item dropdown"';
                            attDropdown = 'class="nav-link dropdown-toggle" data-toggle="dropdown" '
                                        + 'role="button" aria-haspopup="true" aria-expanded="false"';
                            attDropdownUl = '<div id="'+properties.id+'"  class="dropdown-menu" aria-labelledby="navbarDropdown"></div>';  
                            if (properties.type=='Submenu') { 
                                attClass  ='class="dropdown-submenu"';
                            }
                            return '<li '  +attClass+ ' ' +attHint+ '>'
                                +'<a '  +attDropdown  + ' ' +formatLink(properties)+'>'+attIcon+properties.caption //+attCarret
                                +'</a>' +attDropdownUl+ '</li>';
                        } else{ // os item do menu entram aqui        
                            return `<a id="${properties.id}" class="dropdown-item" ${attHint} ${formatLink(properties)}>`
                                        +attIcon+properties.caption
                                + '</a>';
                        }                
                }
                , createContainer(idContent){
                    let id = idContent+'Root';
                    $(`#${idContent}`).append(`<div class="container"></div>`);                
                    $(`#${idContent} > .container`).append(`<div class="navbar-collapse"> </div>`);
                    $(`#${idContent} > .container > .navbar-collapse`).append(`<ul id='${id}' class='navbar-nav mr-auto'></ul>`);
                    return id;
                }         
                } //return
            }()  //menubar
        ,  sidebar:function(){
                return{
                format (properties){
                        let attIcon=''  , attClass = 'collapsed'
                            , attHint = (properties.title)? 'title="' + properties.title + '"' : '';
                        if (properties.active){
                            attClass += ' active';
                            properties.Root.active=true;
                        }
                        if (properties.icon)
                            attIcon='<i class="'+properties.icon+'"></i>';
                        
                        if (properties.length>0){ //menu      
                            return `<li data-toggle="collapse" class="${attClass}" data-target="#${properties.id}" ${attHint}>`
                                +'<a ' +formatLink(properties)+'>'
                                +    attIcon+properties.caption
                                +    '<span class="arrow"></span>'
                                +'</a></li>'
                                +`<ul id="${properties.id}"  class="sub-menu collapse"></ul>`;
                        } else{ // as opcoes do menu entram aqui        
                            return `<li><a id="${properties.id}" ${attHint} ${formatLink(properties)}>`
                                        +attIcon+properties.caption
                                + '</a></li>';
                        }                
                }
                , createContainer(idContent){
                    let id = idContent+'Root';
                    $(`#${idContent}`).append(`<div class="brand">Sistema
                                                <i class="icon-reorder icon-large toggle-btn" data-toggle="collapse" data-target="#${id}"></i>
                                            </div>`);  
                    $(`#${idContent}`).append(`<div class="menu-list"></div>`);                                              
                    $(`#${idContent} > .menu-list`).append(`<ul id='${id}' class="menu-content collapse out">`);        
                    return id;
                }  
                } //return
            }()   //sidebar
    }
    , formatLink= properties =>{
        let attLink = '';
        if (properties.url && !properties.byPass){
            attLink +=  'href=\'javascript:j$.Dashboard.Open.url("'+ properties.url + '"';
            if (properties.idContainer) // Container é usado para quando for partial
                attLink += ',"'+ properties.idContainer + '"' ;
            attLink +=');';
        }
        attLink += "'";
        return attLink;
    }
    , Base=function(inheritor, properties){
        let _base = this;
        this.inherit=System.Node;
        this.inherit(inheritor, properties);
        this.render = ()=>{
            $('#'+_base.Parent.id).append(j$.ui.Menu.Designer.format(_base));
            if (_base.onClick)
            $("#"+_base.id).click(_base.onClick);
            _base.submenu.render();
        }
        let util = function(){
            return{
                getUrl: ()=>{
                    let url=false;
                    if (properties.url){
                        url = properties.url;
                        _base.idContainer=null;
                    }
                    else if (properties.partial)
                        url= properties.partial;
                    // Se tem um LINK e tem container serah injetado neste como partial
                    return url;
            }
            , checkActive: ()=>{
                    return (properties.active !=undefined && !_base.Root.active && _base.type=='Menu')?properties.active:false;
            }
            };
        }();
    
        let initialized = function(){
                if (dataExt.isString(properties)){ // veio apenas o caption
                    Object.preset(_base, {idContainer:CONFIG.LAYOUT.CONTENT});
                } else {
                    if (!properties){properties={}};
                    _base.idContainer = (properties.idContainer)?properties.idContainer:CONFIG.LAYOUT.CONTENT;
                    Object.setIfExist(_base, properties, ['icon','title','byPass','modal']);
                    _base.url=util.getUrl();
                    //_base.byPass=> para não formatar o evento padrão que chama o url. É útil para qdo o o próprio cliente vai realizar uma ação após a escolha da opção
                    _base.active=util.checkActive();
                }
                return true;
        }();
    
        this.submenu = function(){
            return{
                add:items=>{
                    if (dataExt.isObject(items) || (dataExt.isString(items) && !items.isEmpty())){
                        if (items.items)
                        return _base.submenu.addMenu(items)   //adiciona o menu
                                            .add(items.items);//adiciona o submenu
                        else
                        return _base.submenu.addMenu(items);                  
                    }else if (dataExt.isArray(items)){
                        let _items=[]
                        for (let idx=0; idx<items.length;idx++)
                        //items.forEach((item,idx)=>{
                            _items[idx]=_base.submenu.add(items[idx]); 
                        //})
                        return _items;
                    }else 
                        return _base.divider.add(items);         
                }
                , addMenu(items){
                    if (dataExt.isObject(items))
                        j$.Dashboard.bindItem(items); // fazer a ligacao com o caminho de abertudo do item (tab, url)
                    let lastItem = new Subitem(_base, items);
                    _base.put(lastItem.key, lastItem);
                    return lastItem;
                }  
                , render:menu=>{
                    for (let key in _base.c$)
                        $('#'+_base.id).append(_base.c$[key].render());
                }
        };
        }();
        this.add=_base.submenu.add;
        this.addMenu=_base.submenu.addMenu;
        this.divider = function(){
            let ct = 0;
            return{
                add:()=>{
                    if (_base.Root.key==c$.MENU.TYPE.MENUBAR){
                        ct +=1;
                        _base.put('divider'+ct,divider);
                        return divider;
                    }   
                }
            };
        }();
    
        let divider=function(){
            let format=function(){return '<div class="dropdown-divider"></div>';};
            return {
                render:()=>{
                    $('#'+_base.id).append(format());
                }
            };
        }();
    
        function render(){
            $('#'+_base.Parent.id).append(j$.ui.Menu.Designer.format(_base));
            if (_base.onClick)
                $("#"+_base.id).click(_base.onClick);
            _base.submenu.render();
        };
    } //Base    
      //properties={key:'', caption:'', url:'', partial:'', title:'', idContainer:'', byBass:false, onClick:function(){}}
    ,    Item=function (parent, properties){
        this.inherit = Base;
        this.inherit({type:'Menu', Root:parent, Parent:parent}, properties);
    }  
    //properties={key:'', caption:'', url:'', partial:'', title:'', idContainer:'', icon:'' byBass:false, onClick:function(){}}
    ,  Subitem = function (parent, properties){
        this.inherit = Base;
        this.inherit({type:'Submenu', Root:parent.Root, Parent:parent}, properties);
    }
    ,  Navbar=function(idContent){
        let _navbar = this;
        this.inherit=System.Node;
        this.inherit({type:'Navbar', Root:_navbar, Parent:null},{key:idContent, id:create()});
        //menu={key:'', caption:'', url:'', title:'', active:false} ou caption
        this.addMenu = properties =>{
            let menu = new Item(_navbar, properties);
            _navbar.put(menu.key,menu);
            return menu;
        }
        this.render = ()=>{
            for (let key in _navbar.c$)
                _navbar.c$[key].render();
        }
    
        function create(){
            return j$.ui.Menu.Designer.createContainer(idContent);
        };
    }   
    //#todo: está sem uso no framework - mas é interessante para a criação de um menu
    , Dropdown=function(idContent, caption){  
        let _dropdown = this
        , wCaption=(caption)?caption:'';
        this.inherit=System.Node;
        this.inherit({type:'Dropdown', Root:_dropdown, Parent:null},{key:idContent, id:create(), caption:wCaption});
        //menu={key:'', caption:'', url:'', title:'', active:false} ou caption
        this.addMenu = properties=>{
            let menu = new Item(_dropdown, properties);
            _dropdown.put(menu.key,menu);
            return menu;
        }
        this.render = ()=>{
            for (let key in _dropdown.c$)
                _dropdown.c$[key].render();
        }
    
        function create(){
            let id = idContent+'Root';
            $(`#${idContent}`).append(`<ul id='${id}' class="dropdown inline"></ul>`);
            return id;
        }
    } 
    return{
       create (idContent){
           items[idContent] =new Navbar(idContent);
           return items[idContent];
      }      
      , menubar: Designers.menubar
      , sidebar: Designers.sidebar            
      , Designer: Designers[_parser]
      , c$:items
      , C$:key=>{return items[key]}      
    };
}();
// j$.ui.Dropdown = function(){ // factory
//     let items = {};
//     return{
//       create(idContent, caption){
//              items[idContent] =new j$.ui.Menu.Dropdown(idContent, caption);//MENU.create(idContent);
//              return items[idContent];
//       }
//       , c$:items
//       , C$:key=>{return items[key]}
//     }
// }();

// export {j$.ui.Tabs, j$.ui.Menu} ;