/* 
 by Geraldo Gomes
 */

j$.ui.Tabs = function(){
    let tabs = {}, _root=null;
    return{        
         C$:key=>{return tabs[key];}
      , open:(root,key)=>{tabs[root].open(key);}  
      , create: (idTabs, idContent)=>{
             tabs[idTabs] = new j$.ui.Tabs.Root(idTabs, idContent);
             if (!j$.ui.Tabs.root){
                j$.ui.Tabs.root = tabs[idTabs]
                j$.$T = j$.ui.Tabs.root.c$;
             }
             return tabs[idTabs];
      }
      //, items:tabs
      , c$:tabs
      , root: _root
    };   
}(); 
//j$.$T = j$.ui.Tabs.c$.root.c$;

j$.ui.Tabs.Root =function(idTab, idContent){ 
    let _root = this   
      , active_tab=null
      , idWrap = "wrap_"+idTab   
    this.inherit=j$.Node;
    this.inherit({type:'Tabroot', Root:_root, Parent:null}, {key:idTab, id:idContent});   
    Object.preset(_root, {add:add, getItem: _root.C$, open:open, toggle:toggle, activate:activate, close:close}); 

    const initialized=function(){
        if (!idContent){       
           throw  EXCEPTION.format(EXCEPTION.ITEM.INVALID_ELEMENT, "Impossível montar um objeto tabs sem indicar o 'ID' do elemento html onde será montado");
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
              j$.ui.Open.partial(url,_tab.idContent, complete);
              _tab.loaded = true;  		  
        } 		  
   } //tab 	
};

j$.ui.Tabs.HANDLE = {
    onmouseover: obj=>{
        if (obj.className.indexOf('active')>-1)
            obj.className = CONFIG.TAB.CLASS.HOVER_ACTIVE;
        else
            obj.className = CONFIG.TAB.CLASS.HOVER;
    },
    onmouseout: obj=>{
        if (obj.className.indexOf('active')>-1)
            obj.className = CONFIG.TAB.CLASS.ACTIVE;
        else        
            obj.className = CONFIG.TAB.CLASS.TITLE;
    }    
};