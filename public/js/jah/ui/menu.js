/*
 * By Geraldo Gomes
 */
j$.ui.Menu = function(){ // factory
    let items = {};
    return{
       create (idContent){
             items[idContent] =new j$.ui.Menu.Navbar(idContent);//MENU.create(idContent);
             return items[idContent];
      }
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

///j$.ui.Menu.CONFIG =  {baseopacity:0, idContainerDefault:"content"};

j$.ui.Menu.formatLink = properties =>{
    let attLink = '';
    if (properties.url && !properties.byPass){
        attLink +=  'href=\'javascript:j$.ui.Open.url("'+ properties.url + '"';
        if (properties.idContainer) // Container é usado para quando for partial
            attLink += ',"'+ properties.idContainer + '"' ;
        attLink +=');';
    }
    attLink += "'";
    return attLink;
}

j$.ui.Menu.menubar =function(){
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
                       +'<a '  +attDropdown  + ' ' +j$.ui.Menu.formatLink(properties)+'>'+attIcon+properties.caption //+attCarret
                       +'</a>' +attDropdownUl+ '</li>';
              } else{ // os item do menu entram aqui        
                 return `<a id="${properties.id}" class="dropdown-item" ${attHint} ${j$.ui.Menu.formatLink(properties)}>`
                            +attIcon+properties.caption
                      + '</a>';
              }                
       }
    , createContainer(idContent){
         let id = idContent+'Root';
         $(`#${idContent}`).append(`<div class="container"></div>`);                
         $(`#${idContent} > .container`).append(`<div class="navbar-collapse collapse"> </div>`);
         $(`#${idContent} > .container > .navbar-collapse`).append(`<ul id='${id}' class='navbar-nav mr-auto'></ul>`);
         return id;
      }         
    }
}();

j$.ui.Menu.sidebar =function(){
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
                       +'<a ' +j$.ui.Menu.formatLink(properties)+'>'
                       +    attIcon+properties.caption
                       +    '<span class="arrow"></span>'
                       +'</a></li>'
                       +`<ul id="${properties.id}"  class="sub-menu collapse"></ul>`;
              } else{ // as opcoes do menu entram aqui        
                 return `<li><a id="${properties.id}" ${attHint} ${j$.ui.Menu.formatLink(properties)}>`
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
    } 
}();

j$.ui.Menu.Designer =j$.ui.Menu[CONFIG.MENU.PARSER]; 
_C$ = CONFIG[CONFIG.MENU.PARSER.toUpperCase()];

// definição do menu > herda de j$.node
j$.ui.Menu.Navbar =function(idContent){
    let _navbar = this;
    this.inherit=j$.Node;
    this.inherit({type:'Navbar', Root:_navbar, Parent:null},{key:idContent, id:create()});
    //menu={key:'', caption:'', url:'', title:'', active:false} ou caption
    this.addMenu = properties =>{
        let menu = new j$.ui.Menu.Item(_navbar, properties);
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
};

// herda de j$.node
j$.ui.Menu.Dropdown =function(idContent, caption){
    let _dropdown = this
      , wCaption=(caption)?caption:'';
    this.inherit=j$.Node;
    this.inherit({type:'Dropdown', Root:_dropdown, Parent:null},{key:idContent, id:create(), caption:wCaption});
    //menu={key:'', caption:'', url:'', title:'', active:false} ou caption
    this.addMenu = properties=>{
        let menu = new j$.ui.Menu.Item(_dropdown, properties);
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

// herda de j$.node
j$.ui.Menu.Base=function(inheritor, properties){
    let _base = this;
    this.inherit=j$.Node;
    this.inherit(inheritor, properties);
    this.render = ()=>{
        $('#'+_base.Parent.id).append(j$.ui.Menu.Designer.format(_base));
        if (_base.onClick)
           $("#"+_base.id).click(_base.onClick);
        _base.submenu.render();
    }
    let util = function(){
        return{
             formatLink: ()=>{
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
                  _base.url=util.formatLink();
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
                    _items=[]
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
                let lastItem = new j$.ui.Menu.Subitem(_base, items);
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
                  ct +=1;
                  _base.put('divider'+ct,divider);
                  return divider;
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
}; //j$.ui.Menu.Base

//properties={key:'', caption:'', url:'', partial:'', title:'', idContainer:'', byBass:false, onClick:function(){}}
j$.ui.Menu.Item =function (parent, properties){
          this.inherit = j$.ui.Menu.Base;
          this.inherit({type:'Menu', Root:parent, Parent:parent}, properties);
};
//properties={key:'', caption:'', url:'', partial:'', title:'', idContainer:'', icon:'' byBass:false, onClick:function(){}}
j$.ui.Menu.Subitem = function (parent, properties){
          this.inherit = j$.ui.Menu.Base;
          this.inherit({type:'Submenu', Root:parent.Root, Parent:parent}, properties);
};
