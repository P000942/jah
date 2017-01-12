/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
//j$.ui.Tabs = function() {
//    return {
//	init:function(){return true}
//    }
//}();
j$.ui.Tabs = function(){
    var tabs = {};
    return{        
         get:function(key){return tabs[key];}
      , open:function(root,key){tabs[root].open(key);}  
      , create: function(idTabs, idContent){
             tabs[idTabs] = new j$.ui.Tabs.Root(idTabs, idContent);
             return tabs[idTabs];
      }
      , items:tabs
      , c$:tabs
    };   
}(); 

j$.ui.Tabs.Root =function(idTab, idContent){ 
    var SELF = this;    
    var active_tab=null;
    var idWrap = "wrap_"+idTab;    
    this.inherit=j$.Node;
    this.inherit({type:'Tabroot', Root:SELF, Parent:null}, {key:idTab, id:idContent});   
    Object.preset(SELF, {add:add, getItem: SELF.C$, open:open, toggle:toggle, activate:activate, close:close}); 

    var initialized=function(){
        if (!idContent){       
           throw  EXCEPTION.format(EXCEPTION.ITEM.INVALID_ELEMENT, "Impossível montar um objeto tabs sem indicar o 'ID' do elemento html onde será montado");
        }else{
           i$(idContent).insert({top: "<div id='"+idWrap+"' class='tabs_wrap' />"}); //wrap geral do tab
           i$(idWrap).insert({top: "<div id='" +idTab+ "' class='tabs' />"});        //wrap das tab-link
        }
    }();
    function add(oTab){            
        var tab = new Tab(SELF, oTab);   
        SELF.addItem(tab.key,tab);
	return tab;
    }  

    function open(oTab){
        var tab= SELF.getItem(oTab.key);
        if (!tab)
           tab=SELF.add(oTab);   	
        SELF.activate(tab.key);
	return tab;
    }

   // Exibe o TAB (ativo) se tiver escondido, e ESCONDE se tiver escondido (antigo onOff())
   function toggle(){
       if (active_tab){
	  if (active_tab.active) 
	     active_tab.hide();
	  else
	     active_tab.show();
       } 
   }
   
   // Coloca a tab indica(key) como ativa
   function activate(key)
   {	
        var tab=SELF.getItem(key);	       
        if (active_tab)  // Verifica se há uma TAB ativa e desativa a mesma
           active_tab.deactivate();
	
        active_tab=tab;		
        tab.activate();
    }	

   // fecha a tab indica(key) 
   function close(key)
   {	
        var tab=SELF.getItem(key);
   	if (active_tab){             
            if (active_tab.key==key)
                active_tab=null;
        }
        tab.close();
        SELF.removeItem(key);        
        if (SELF.length>0) {
            SELF.activate(SELF.first().key);
        };
    }	
        
    //tab={key:'' caption:''[, fixed:false, onLoad:function(){}, onActivate:function(){}, onDeactivate:function(){}]}
    function Tab(_parent, tab){   
         var SELF_TAB = this;  
         Object.preset(SELF_TAB,{append:addContent, update:updContent,clear:clearContent, showURL:showURL, render:render
                               , show:show, load:load, hide:hide, activate:activate, close:close, deactivate:deactivate 
                               , fixed:false, loaded:false, active:false, parent: _parent
                               , caption:tab.caption, id:tab.key, key:tab.key, idContent:tab.key+"_Content" 
                      });		  
         //col=[];

         this.title = function(title){ 
              return false;
              if (title != undefined)                  
                 SELF_TAB.Header.title.innerHTML=title;
              else  
                 return SELF_TAB.Header.title.innerHTML;
         };                  
         
         var initialized=function(){
              Object.setIfExist(SELF_TAB, tab, ['onLoad','onActivate','onDeactivate', 'onClose', 'fixed','url']);
              if (!SELF_TAB.onLoad && SELF_TAB.url){
                  SELF_TAB.onLoad=function(tab){tab.showURL();};
              }
              createBase();              
         }();
         
         function createBase(){
             var html = ""; 
             if (i$(SELF_TAB.id)) { // Quando jah existe, remove
                 html = i$(SELF_TAB.id).innerHTML;
                 i$(i$(SELF_TAB.id).parentNode).removeChild(i$(SELF_TAB.id));  	
                 i$(SELF_TAB.id);
             }             
             i$(idTab).insert({bottom: SELF_TAB.render() + "\n"}); // cria o link da tab

             i$(idWrap).insert({bottom: 
                                      "<div class='tab_wrap' id='" + SELF_TAB.id + "'>" 
                                      +"<div class='tab_header' id='" + SELF_TAB.id + "_header'>"
                                      +   "<span class='tab_header_title' id='" + SELF_TAB.id + "_header_title'></span>"
                                      +   "<span class='tab_header_menu' id='" + SELF_TAB.id + "_header_menu'></span>"
                                      +"</div>"
                                      +"<div class='tab' id='" + SELF_TAB.idContent + "'>" + html + "</div>"
                                      +"</div>\n"
                              }); // cria o container da tab               
         }; 
                
         this.Header = function(){
             var element = i$(SELF_TAB.id + "_header");
             var titleElement = i$(SELF_TAB.id + "_header_title");
             var create=function(){                     
                     if (tab.title == undefined)
                         element.hide();
                     else
                         titleElement.innerHTML=tab.title;
                     element.hide();  
             }();                 
             return{
                 title:titleElement                
               , menu:i$(SELF_TAB.id + "_header_menu")
             };
         }();	

         //SELF_TAB.Header.create();
         this.Menu = function(){            
             var menubar;
             var create=function(){                     
                 menubar=j$.ui.Dropdown.create(SELF_TAB.Header.menu.id);
             }();             
             return{
                 add:function(menu, Items){                     
                     var menuBase = menubar.addMenu(menu);
                     if (Items){
                         for (var idx=0; idx<Items.length;  idx++){
                            var item = Items[idx];    
                            menuBase.add(item);                  
                         }   
//                         for (var idx=0; idx<menu.items.length;  idx++){
//                            var item = Items[menu.items[idx]];    
//                            menuBase.add(item);                  
//                         }                           
                     }                     
                 }
               , bindToMenu: function(Items, design){
                            for (var key in design){
                                var menu = design[key];
                                if (dataExt.isArray(menu))
                                    menu = {items:design[key]};
                                Object.preset(menu, {key:key, caption:key});                    
                                SELF_TAB.Menu.add(menu, Items);                                                          
                            }

                 } 
                , render: menubar.render 
             };
         }();         
         
          // executar a ação associada a TAB indica(key)
          function load(){              
              if (!SELF_TAB.loaded && SELF_TAB.onLoad)                  
                  SELF_TAB.onLoad(SELF_TAB);
                  //SELF_TAB.onLoad.execute(SELF_TAB);                                          
              this.loaded=true;
          }

          function activate(){   
              SELF_TAB.load();
              SELF_TAB.show();
              //SELF_TAB.onActivate.execute(SELF_TAB); 
              if (SELF_TAB.onActivate)
                  SELF_TAB.onActivate(SELF_TAB);  
              this.active =true;
          }
          
          function deactivate(){                                             
              if (SELF_TAB.onDeactivate)
                  SELF_TAB.onDeactivate(SELF_TAB);  
              SELF_TAB.hide();
              this.active =false;
          }

          function close(){    
              if (SELF_TAB.onClose)
                  SELF_TAB.onClose(SELF_TAB);
              SELF_TAB.hide();
              i$("tab_link_"+SELF_TAB.key).remove(); 
              i$(SELF_TAB.id).remove();               
          }

          function hide(){	                
                i$("tab_link_"+SELF_TAB.key).className="link_tab";  
                i$(SELF_TAB.id).hide();
          }
	  function show(){
		i$("tab_link_"+SELF_TAB.key).className="active_link_tab";               
		i$(SELF_TAB.id).show();		
	  }
		  
	  function render(){			 
              var linkClose =(SELF_TAB.fixed)?'':"<a class='link_tab_close' href=\"javascript:j$.ui.Tabs.c$." + SELF_TAB.parent.key 
                            + ".close('" + SELF_TAB.key + "');\" >&nbsp;&nbsp;</a>";              
              return "<span class='link_tab' onmouseover='j$.ui.Tabs.HANDLE.onmouseover(this);' onmouseout='j$.ui.Tabs.HANDLE.onmouseout(this);' id='tab_link_"+ this.key+"'>"
                   +"<a class='link_tab' id='link_" + SELF_TAB.key +  "' " 
		   + "href=\"javascript:j$.ui.Tabs.c$." + SELF_TAB.parent.key + ".activate('" + SELF_TAB.key + "');\" >"
                   + SELF_TAB.caption + "</a>"
                   + linkClose +"</span>";
          }
		  
	  function addContent(html){			 
	           SELF_TAB.idContent.insert({bottom:html}); 
	  }
	  function updContent(html){			 
	           i$(SELF_TAB.idContent).innerHTML = html;
	  }
	  function clearContent(html){			 
	           i$(SELF_TAB.idContent).innerHTML = "";
	  }
		  
	  function showURL(url, complete){
              if (!url)
                  url=SELF_TAB.url;
              j$.ui.Open.partial(url,SELF_TAB.idContent, complete);
              SELF_TAB.loaded = true;  		  
          } 		  
   } //tab 	
};

j$.ui.Tabs.HANDLE = {
    onmouseover: function(obj){
        if (obj.className.indexOf('active')>-1)
            obj.className = "active_link_tab_hover";
        else
            obj.className = "link_tab_hover";
    },
    onmouseout: function(obj){
        if (obj.className.indexOf('active')>-1)
            obj.className = "active_link_tab";
        else        
        obj.className = "link_tab";
    }    
};