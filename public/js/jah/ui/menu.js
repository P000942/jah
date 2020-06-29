/*
 * To change this template, choose Tools
 * and open the template in the editor.
 */
j$.ui.Menu = function(){
    var items = {};
    //var idMenu = 'submenu'
    return{
       create:  idContent =>{
             items[idContent] =new j$.ui.Menu.Navbar(idContent);//MENU.create(idContent);
             return items[idContent];
      }
      , get:function(key){return items[key];}
      , Items:items
      , c$:items
      , C$:function(key){return items[key];}
     // , id:idMenu
    };
}();
j$.ui.Dropdown = function(){
    var items = {};
    //var idMenu = 'submenu'
    return{
       create: (idContent, caption)=>{
             items[idContent] =new j$.ui.Menu.Dropdown(idContent, caption);//MENU.create(idContent);
             return items[idContent];
      }
      , get:key=>{return items[key];}
      , Items:items
      , c$:items
      , C$:key=>{return items[key];}
     // , id:idMenu
    };
}();

///j$.ui.Menu.CONFIG =  {baseopacity:0, idContainerDefault:"content"};


j$.ui.Menu.Designer =function(){
    let formatLink = properties =>{
              let attLink = 'href=\'javascript:';
              if (properties.url && !properties.byPass){
                 attLink +=  'j$.ui.Open.url("'+ properties.url + '"';
                 if (properties.idContainer) // Container é usado para quando for partial
                     attLink += ',"'+ properties.idContainer + '"' ;
                 attLink +=');';
              }
              attLink += "'";
              return attLink;
          };
    return{

       format: properties=>{
              let attClass = '', attDropdown = '', attCarret = '', attDropdownUl ='', attLi='', attIcon='';
              let attHint = (properties.title)? 'title="' + properties.title + '"' : '';
              if (properties.active){
                  attClass='class="active"';
                  properties.Root.active=true;
              }
              if (properties.icon){
                  attIcon='<i class="'+properties.icon+'"></i>';
              }
              if (properties.length>0){
                 attClass = (properties.type=='Menu')?'class="dropdown"':'class="dropdown-submenu"';
                 attDropdown = 'class="dropdown-toggle" data-toggle="dropdown"';
                 attDropdownUl = '<ul id="'+properties.id+'"  class="dropdown-menu"></ul>';
                 attCarret = '<b class="caret"></b>';
              } else {
                attLi='id="'+properties.id+'"';
              }

              return '<li ' +attLi        + ' ' +attClass+ ' ' +attHint+ '>'
                    +'<a '  +attDropdown  + ' ' +formatLink(properties)+'>'+attIcon+properties.caption+attCarret
                    +'</a>' +attDropdownUl+ '</li>';
       }
    };
}();

// definição do menu
j$.ui.Menu.Navbar =function(idContent){
    var self_navbar = this;
    this.inherit=j$.Node;
    this.inherit({type:'Navbar', Root:self_navbar, Parent:null},{key:idContent, id:create()});
    this.addMenu = addMenu;
    this.render = render;

    function create(){
        let id = idContent+'Root';
        // $("#"+idContent).append('<div class="navbar-inner"></div>');
        // $("#"+idContent+" > .navbar-inner").append('<div class="container"> </div>');
        // $("#"+idContent+" > .navbar-inner > .container").append('<ul id="' +id+'" class="nav inline"></ul>');
        $("#"+idContent).append(`<div class="container"></div>`);
        $("#"+idContent+" > .container").append(`<div class="navbar-collapse collapse"> </div>`);
        $("#"+idContent+" > .container > .navbar-collapse").append('<ul id="' +id+'" class="nav navbar-nav"></ul>');
        return id;
    };

    //menu={key:'', caption:'', url:'', title:'', active:false} ou caption
    function addMenu(properties){
        let menu = new j$.ui.Menu.Item(self_navbar, properties);
        self_navbar.addItem(menu.key,menu);
	return menu;
    }

    function render(){
        for (let key in self_navbar.c$)
            self_navbar.c$[key].render();
    }
};

j$.ui.Menu.Dropdown =function(idContent, caption){
    var self_dropdown = this;
    let wCaption=(caption)?caption:'';
    this.inherit=j$.Node;
    this.inherit({type:'Dropdown', Root:self_dropdown, Parent:null},{key:idContent, id:create(), caption:wCaption});
    this.addMenu = addMenu;
    this.render = render;

    function create(){
        let id = idContent+'Root';
        $("#"+idContent).append('<ul id="' +id+'" class="dropdown inline"></ul>');
        return id;
    };

    //menu={key:'', caption:'', url:'', title:'', active:false} ou caption
    function addMenu(properties){
        let menu = new j$.ui.Menu.Item(self_dropdown, properties);
        self_dropdown.addItem(menu.key,menu);
      	return menu;
    }

    function render(){
        for (let key in self_dropdown.c$)
            self_dropdown.c$[key].render();
    }
};

j$.ui.Menu.Base=function(inheritor, properties){
    var self_base = this;
    this.inherit=j$.Node;
    this.inherit(inheritor, properties);
    this.render = render;
    var util = function(){
        return{
             formatLink: ()=>{
                let url=false;
                if (properties.url){
                    url = properties.url;
                     self_base.idContainer=null;
                }
                else if (properties.partial)
                    url= properties.partial;
                // Se tem um LINK e tem container irá se comportar como partial
                return url;
           }
           , checkActive: ()=>{
                 return (properties.active !=undefined && !self_base.Root.active && self_base.type=='Menu')?properties.active:false;
           }
        };
    }();

    var initialized = function(){
              if (dataExt.isString(properties)){ // veio apenas o caption
                 Object.preset(self_base, {idContainer:CONFIG.LAYOUT.CONTENT});
              } else {
                  if (!properties){properties={}};
                  self_base.idContainer = (properties.idContainer)?properties.idContainer:CONFIG.LAYOUT.CONTENT;
                  Object.setIfExist(self_base, properties, ['icon','title','byPass','modal']);
                  self_base.url=util.formatLink();
                  //self_base.byPass=> para não formatar o evento padrão que chama o url. É útil para qdo o o próprio cliente vai realizar uma ação após a escolha da opção
                  self_base.active=util.checkActive();
              }
              return true;
    }();

    this.submenu = function(){
       return{
          add:properties=>{
              let submenu = new j$.ui.Menu.Subitem(self_base, properties);
              self_base.addItem(submenu.key, submenu);
              return submenu;
           }
         , render:menu=>{
             for (let key in self_base.c$){
                 $('#'+self_base.id).append(self_base.c$[key].render());
             }
         }
       };
    }();
    this.add=self_base.submenu.add;
    this.divider = function(){
          let ct = 0;
          return{
              add:()=>{
                  ct +=1;
                  self_base.addItem('divider'+ct,divider);
                  return divider;
              }
          };
    }();

    var divider=function(){
          let format=function(){return '<li class="divider"></li>';};
          return {
              render:()=>{
                  $('#'+self_base.id).append(format());
              }
          };
    }();

    function render(){
          $('#'+self_base.Parent.id).append(j$.ui.Menu.Designer.format(self_base));
          if (self_base.onClick)
             $("#"+self_base.id).click(self_base.onClick);
          self_base.submenu.render();
    };
};

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
