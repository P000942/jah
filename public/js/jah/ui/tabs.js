/* 
 by Geraldo Gomes
 */

j$.ui.Tabs = function(){
    let tabs = {}, _root=null;
    return{        
         get:key=>{return tabs[key];}
      , open:(root,key)=>{tabs[root].open(key);}  
      , create: (idTabs, idContent)=>{
             tabs[idTabs] = new j$.ui.Tabs.Root(idTabs, idContent);
             if (!j$.ui.Tabs.root){
                j$.ui.Tabs.root = tabs[idTabs]
                j$.$T = j$.ui.Tabs.root.c$;
             }
             return tabs[idTabs];
      }
      , items:tabs
      , c$:tabs
      , root: _root
    };   
}(); 
//j$.$T = j$.ui.Tabs.c$.root.c$;

j$.ui.Tabs.Root =function(idTab, idContent){ 
    let _root = this;    
    let active_tab=null;
    let idWrap = "wrap_"+idTab;    
    this.inherit=j$.Node;
    this.inherit({type:'Tabroot', Root:_root, Parent:null}, {key:idTab, id:idContent});   
    Object.preset(_root, {add:add, getItem: _root.C$, open:open, toggle:toggle, activate:activate, close:close}); 

    const initialized=function(){
        if (!idContent){       
           throw  EXCEPTION.format(EXCEPTION.ITEM.INVALID_ELEMENT, "Impossível montar um objeto tabs sem indicar o 'ID' do elemento html onde será montado");
        }else{
           i$(idContent).insert({top: "<div id='"+idWrap+"' class='tabs_wrap' />"}); //wrap geral do tab
           i$(idWrap).insert({top: "<div id='" +idTab+ "' class='tabs' />"});        //wrap das tab-link
        }
    }();
    function add(oTab){            
        let tab = new Tab(_root, oTab);   
        _root.addItem(tab.key,tab);
	    return tab;
    }  
    function open(oTab){
        let tab= _root.getItem(oTab.key);
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
        let tab=_root.getItem(key);	       
        if (active_tab)  // Verifica se há uma TAB ativa e desativa a mesma
            active_tab.deactivate();
        active_tab=tab;	
        _root.active=tab;	
        tab.activate();
    }	

    // fecha a tab indica(key) 
    function close(key){	
        let tab=_root.getItem(key);
    	if (active_tab){             
            if (active_tab.key==key)
                active_tab=null;
        }
        tab.close();
        _root.removeItem(key);        
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
         this.title = title=>{ 
              return false;
              if (title != undefined)                  
                 _tab.Header.title.innerHTML=title;
              else  
                 return _tab.Header.title.innerHTML;
         };                  
         
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
                                      "<div class='tab_wrap' id='" + _tab.id + "'>" 
                                      +"<div class='tab_header' id='" + _tab.id + "_header'>"
                                      +   "<span class='tab_header_title' id='" + _tab.id + "_header_title'></span>"
                                      +   "<span class='tab_header_menu' id='" + _tab.id + "_header_menu'></span>"
                                      +"</div>"
                                      +"<div class='tab' id='" + _tab.idContent + "'>" + html + "</div>"
                                      +"</div>\n"
                              }); // cria o container da tab               
         };          
         this.Header = function(){
             let element = i$(_tab.id + "_header");
             let titleElement = i$(_tab.id + "_header_title");
             let create=function(){                     
                     if (tab.title == undefined)
                         element.hide();
                     else
                         titleElement.innerHTML=tab.title;
                     element.hide();  
             }();                 
             return{
                 title:titleElement                
               , menu:i$(_tab.id + "_header_menu")
             };
         }();	

         //_tab.Header.create();
         this.Menu = function(){            
             let menubar;
             let create=function(){                     
                 menubar=j$.ui.Dropdown.create(_tab.Header.menu.id);
             }();             
             return{
                 add:(menu, Items)=>{                     
                     var menuBase = menubar.addMenu(menu);
                     if (Items){
                         for (let idx=0; idx<Items.length;  idx++){
                            let item = Items[idx];    
                            menuBase.add(item);                  
                         }                             
                     }                     
                 }
               , bindToMenu: (Items, design)=>{
                            for (let key in design){
                                let menu = design[key];
                                if (dataExt.isArray(menu))
                                    menu = {items:design[key]};
                                Object.preset(menu, {key:key, caption:key});                    
                                _tab.Menu.add(menu, Items);                                                          
                            }

                 } 
                , render: menubar.render 
             };
         }();         
         
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
              let linkClose =(_tab.fixed)?'':"<a class='link_tab_close' href=\"javascript:j$.ui.Tabs.c$." + _tab.parent.key 
                            + ".close('" + _tab.key + "');\" >&nbsp;&nbsp;</a>";              
              return "<span class='link_tab' onmouseover='j$.ui.Tabs.HANDLE.onmouseover(this);' onmouseout='j$.ui.Tabs.HANDLE.onmouseout(this);' id='tab_link_"+ this.key+"'>"
                   +"<a class='link_tab' id='link_" + _tab.key +  "' " 
		           + "href=\"javascript:j$.ui.Tabs.c$." + _tab.parent.key + ".activate('" + _tab.key + "');\" >"
                   + _tab.caption + "</a>"
                   + linkClose +"</span>";
          }
		  
         function addContent(html){			 
                _tab.idContent.insert({bottom:html}); 
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
              j$.ui.Open.partial(url,_tab.idContent, complete);
              _tab.loaded = true;  		  
        } 		  
   } //tab 	
};

j$.ui.Tabs.HANDLE = {
    onmouseover: obj=>{
        if (obj.className.indexOf('active')>-1)
            obj.className = "active_link_tab_hover";
        else
            obj.className = "link_tab_hover";
    },
    onmouseout: obj=>{
        if (obj.className.indexOf('active')>-1)
            obj.className = "active_link_tab";
        else        
        obj.className = "link_tab";
    }    
};