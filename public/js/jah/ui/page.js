/* j$.service - Eh o template do serviço, comtém as informações a respeito de um serviço desejado
 *              pode ser do tipo: 'crud', 'query' ou 'user'(criado pelo usuário)
 * j$.ui.Page: Cria a página que expõe o serviço (os elementos html)
 *              pode ser do tipo: 'form' ou 'modal'
 * Adapter   : Contém informações declaradas na aplicaçaõ que são usadas no 'Menu', 'Tabs' e 'j$.service'. Útil para evitar redundância nas declarações
 *             Exmeplo: 'title', 'resouce' e outras informações serão aproveitadas em ambos.
 *
 * 1.Através de j$.service é criado o template do serviço
 * 2.Em algum ponto da interface(geralmente pelo menu) é solicitado a exposição desse serviço.
 * 3.O método '.init(idContainer, modal)' do serviço deve ser chamado
 * 4.Neste método (.init) é solicitado j$.ui.Page que cria a página através do método '.create(service,modal)'
 * 5.Atavés do paramametro 'modal' o método sabe se é para criar um form ou um modal. A página será criada segundo as informações do 'service'
 * 6.Na criação página também é criado o 'actionController' para receber as ações da página(ver o fluxo no controller.js)
 * service(crud, query,user) -> page(crud, modal) -> controller(external, standard)
 *
 design=[{type:'standard' , fields:[] [, id:'']}
       , {type:'column'   , fields:[[],[]]}
       , {type:'grid'     , fields:[[],[]]}
       , {type:'table'    , fields:[[],[]]}
       , {type:'fieldset' , design:[], id:'', title:''}
       , {type:'slideset' , design:[], id:'', title:''}
       , {type:'section'  , design:[], id:'', title:''}
       , {type:'line'     , design:{style}}
        ]
 */
'use strict';
j$.ui.Grid=function(page, btn_template=CONFIG.GRID.DEFAULT){
    let _grid = this;    
    _grid.index= c$.RC.NONE;
    let pager = null;

    Object.preset(_grid,{table:null, Designer:designer() });

    const initialized=function(){
        Object.preset(page.service.Interface,{List:{}});
        if (page.actionController)
           _grid.actionController = page.actionController;
        return true;
    }();

    this.Buttons = new j$.ui.Buttons(_grid.actionController, page.service.Interface.List.Buttons, CONFIG[btn_template].GRID.preset);

    this.init=(Resource)=>{
        _grid.index= c$.RC.NONE;
        pager = Resource.Dataset.createPager(page.service.Interface.List);
        if (pager){
           _grid.Designer.table();
           _grid.paginator = new j$.ui.Pager(page.form, pager , page.actionController+".List.Pager");
           _grid.Pager= _grid.paginator.Controller(_grid.Detail.populate);
           _grid.Pager.first();
        }
    };

    this.getPosition=cell=>{
        _grid.index= c$.RC.NONE; //REVIEW: Pode dá chabu
        if (cell)
           _grid.index= cell.parentNode.parentNode.rowIndex -1;
        return _grid.index;
    };

    function designer(){
        let ws={ clsRow:'even', ctCell:0, lastRow:null};
        ws.change= (field, create)=>{
            let column;
            if (field.persist){
                if (create){ // Quando está criando as colunas de uma nova linha da tabela
                    column = ws.lastRow.insertCell(ws.ctCell);
                    column.setAttribute("onmouseup", page.actionController+".filter(event, '"+field.key+"','"+field.Record.value+"')");
                }else  // Quando está atualizando as colunas
                    column = ws.lastRow.cells[ws.ctCell];
                column.innerHTML= field.Record.formattedValue;
                ws.ctCell++;
             }
             return column;
        };
        ws.getRow=row=>{
            ws.ctCell=0;
            if (row && row>-1)
               ws.lastRow=_grid.table.rows[row];
            else
               ws.lastRow = _grid.table.insertRow(_grid.table.rows.length);
            return ws.lastRow;
        };
        return{
           table:()=>{
              let idList =`${page.form.id}List`
                , idWrap =`${page.form.id}ListWrap`
                ,   html =`<div class='${CONFIG.GRID.CLASS.WRAP}' id='${idWrap}'>`
                         +`<table class='${CONFIG.GRID.CLASS.TABLE}' id='${idList}'></table>`
                         +`</div>`; 
              if (!i$(idList)){
                 //let tab = page.tabs.open({key:`${page.form.id}Detalhe`, caption:"Detalhes", fixed:true})
                 //tab.append(hmtl);
                 page.footer.insert(html);         
              }         
              _grid.table = i$(idList);
           }
         , clear:()=>{_grid.table.innerHTML='';}
         , getRow:row=>{return ws.getRow(row);}
         , addRow:()=>{
                ws.getRow();
                ws.lastRow.className=ws.clsRow;
                ws.clsRow=(ws.clsRow==='even')?ws.clsRow = 'odd':ws.clsRow = 'even';
                return ws.lastRow;
         }
         , deleteRow:row=>{_grid.table.deleteRow(row);}
         , addColumn:field=>{ws.change(field, true);}
         , changeColumn:field=>{ws.change(field, false);}
         , addButtons:()=>{
             let cell =ws.lastRow.insertCell(ws.ctCell);
             cell.innerHTML = _grid.Buttons.format();
         }
         , header:()=>{
             let header = _grid.table.createTHead();
             let headerDetail = header.insertRow(0);
                for(let key in page.service.Fieldset.c$){
                    let df = page.service.Fieldset.c$[key];
                    if (df.persist){
                        let idListHeader = _grid.table.id+"_header."+key;
                        let label = document.createElement("th");
                        let clas$ = (df.Header.clas$)?' class="' +df.Header.clas$+ '"':'';

                        // ---------------------- Retira os dois pontos do label
                        label.innerHTML="<div " +clas$+" id='"+ idListHeader +"'>"+ df.label.replace(/[:]/g,'') +"</div>";
                        label.setAttribute("onclick", page.actionController+".sort('"+key+"')");
                        headerDetail.appendChild(label);
                        df.Header.id = idListHeader;
                    }
                }
                // criar barra para navegar nas paginas
                let label = document.createElement("th");
                headerDetail.appendChild(label);
                _grid.paginator.createNavigator(label);
            }
        };
    };

    this.Detail=function(){
        return{
            update:function(row,Record){
                    _grid.Designer.getRow(row);
                    page.service.Fieldset.sweep(function(field){
                        _grid.Designer.changeColumn(field);
                    });
            }
          , remove:function(pos){
                   let row = _grid.getPosition(pos);
                   let pageNumber =pager.Control.number;
                   _grid.Designer.deleteRow(row);
                   pager.restart();
                   if (pageNumber>pager.Control.last)
                      _grid.Pager.last();
                   else
                      _grid.Pager.get(pageNumber);
                    return row;
            }
          , add:function(Record, populating){
                   _grid.Designer.addRow();
                   page.service.Fieldset.populate(Record, function(field){
                          _grid.Designer.addColumn(field);
                   });
                   _grid.Designer.addButtons();
                   if (!populating){ //*quando for um registro inserido pelo usuário, recalcula as páginas e posiciona na ultima
                       pager.restart();
                       _grid.Pager.last(); // Para posicionar na página onde foi inserido o novo registro
                   }
            }
          ,clear:()=>{
             _grid.Designer.clear();
          }
          , populate:function(){
                page.reset(); // o formulário
                 _grid.Detail.clear();
                if (pager.Record.count !=  c$.RC.NOT_FOUND){
                    pager.sweep(function(row, record){
                       _grid.Detail.add(record,true);
                    });
                    _grid.Designer.header();
                }
          }
         , populateAll:function(){ // preenche todos registros no grid, sem paginação
              _grid.table.innerHTML='';
              for (let row=0; row<pager.dataset.count;row++){
                   _grid.Detail.add(pager.dataset.get(row));
              }
              _grid.Designer.header();
           }
      };
    }();
}; //j$.ui.Grid

j$.ui.Buttons=function(actionController, buttons, presetFunction){
    let _btn=this;
    let wrapButtons;
    let _wrap;
    Object.preset(_btn,{Items:getItems()});
    this.c$ = this.Items;
    presetFunction =(presetFunction)?presetFunction:()=>{};
    // Obter o grupos de buttons
    function getItems(){
        let values = (buttons)?buttons :presetFunction(null, actionController);
        return values;
    };
    // Colocar os valores default
    function preset(key,button, parent){
        let value = (button.VALUE) ?button.VALUE :key.toLowerCase().toFirstUpper();
        if (parent && parent.id)
            Object.preset(button, {id: parent.id +'_'+ key});
        Object.preset(button,{key:key, value, clas$:CONFIG.BUTTON.CLASS.DEFAULT});
        if (!button.onclick && actionController && dataExt.isString(actionController))
           button.onclick = actionController+'.' +key.toLowerCase()+'(this);';
        return button;
    };

    function submenu(button){
       if (button.submenu){
          let root  = $("#"+button.id+" > div > div")[0].id; // obtendo o root para os elementos
          for (let key in button.submenu.c$){
              let subitem = Object.merge({},button.submenu.c$[key],["key","caption", "onclick"]);
              preset(key,subitem, _wrap);
              subitem.caption = (subitem.caption) ?subitem.caption 
                                                  :subitem.value;
              subitem.id = button.id + subitem.key;
              subitem.element = j$.ui.Render.menuItem(i$(root),subitem);
          }
       }
    }

    this.create=wrap=>{
        _wrap = wrap;
        wrapButtons=j$.ui.Render.wrap(_wrap, _wrap.id+ '_button', CONFIG.CRUD.BUTTONS.WRAP);
        for (let key in _btn.Items){
            _btn.add(key,_btn.Items[key]);
        };
    };

    this.add=(key, button)=>{
         preset(key,button, _wrap);
         button.element = j$.ui.Render.button(wrapButtons, button);
         if (actionController && dataExt.isObject(actionController) && actionController[button.key])
             $(button.element).click(actionController[button.key]);
         submenu(button);
    };
    this.format=parent=>{
        let html='';
        for (let key in _btn.Items){
            let button=_btn.Items[key];
            preset(key.toLowerCase(),button, parent);
            html+=j$.ui.Render.formatButton(button);
        };
        return html;
    };
}; // j$.ui.Buttons

// Cria o navegar para fazer paginação
// pager (): é o que controla data, faz o calculos de pagina e devolve os registro para exibir na página
// j$.ui.Pager: É o componente que cria os elementos visuais de html para navegação e recebe a ações para o controller
j$.ui.Pager=function(parent, pager , actionController){
    let _pager=this;
    let _wrap;

    Object.preset(_pager,{clas$:CONFIG.PAGER.CLASS, pager:pager});
    function parse(values){
        let properties = values;
         if (dataExt.isString(properties))
             properties = {value:properties, key:properties};
         Object.preset(properties, {key:properties.value});

         properties.caption =properties.value;
         properties.method =CONFIG.synonym(properties.key.toLowerCase());
         if (properties.method===CONFIG.ACTION.BACK.KEY){
             properties.caption = '&laquo;';
         }else if (properties.method===CONFIG.ACTION.NEXT.KEY){
             properties.caption = '&raquo;';
         }else if (properties.method===CONFIG.ACTION.FIRST.KEY){
             properties.caption ='&iota;&lsaquo;';
         }else if (properties.method===CONFIG.ACTION.LAST.KEY){
             properties.caption = '&rsaquo;&iota;';
         }else
            properties.method ='get';
         return properties;
    }

    this.create=Wrap=>{
        if (!actionController)
            actionController = parent.id.toCapitalize().trim()+ ".actionController.List.Pager";
        if (i$(parent.id+ '_pager'))
            _wrap = i$(parent.id+ '_pager');
        else
            _wrap=j$.ui.Render.wrapperUl(Wrap, parent.id+ '_pager', _pager.clas$);
        _pager.clear();
    };
    this.clear=()=>{if (_wrap) _wrap.innerHTML='';};

    this.add= (values, active='')=>{        
         let clas$ = ` class="page-item ${active}"`;
         let properties = parse(values);
         let value = (properties.value.isNumeric())?properties.value:'';
         Object.preset(properties, {
               onclick:'javascript:'+actionController+'.' +properties.method+ '('+value+')'});
         _wrap.insert('<li' +clas$+ '><a class="page-link" ' +j$.ui.Render.attributes(properties,'value')+ '>'+properties.caption+'</a></li>');
    };
    this.createNavigator=wrap=>{
        _pager.create(wrap);
        _pager.add("first",(pager.Control.first===pager.Control.number)?'disabled':'');
        _pager.add("back" ,(pager.Control.first===pager.Control.number)?'disabled':'');
        let pagerPosition=pager.positions();
        for (let row=pagerPosition.first; row<=pagerPosition.last; row++){
            _pager.add(row.toString(),(row===pager.Control.number)?'active':'');
        }
        _pager.add("next" ,(pager.Control.last===pager.Control.number)?'disabled':'');
        _pager.add("last" ,(pager.Control.last===pager.Control.number)?'disabled':'');
    };
    this.Controller=function(callbackPopulate){
        let nbr =  c$.RC.NONE;
        let ws = {callback:callbackPopulate};
        let populate=number=>{
                nbr=number;
                if (number)
                    pager.get(number);
                ws.callback(pager);
        };
        return {
           first:()=>{populate(pager.Control.first)}
          , back:()=>{populate(pager.Control.number-1)}
          , next:()=>{populate(pager.Control.number+1)}
          , last:()=>{populate(pager.Control.last)}
          ,  get:number=>{populate(number)}
          , absolutePosition:row=>{return pager.absolutePosition(row)}
          , number:()=>nbr
          // , Control:pager.Con
        };
    };
};// j$.ui.Pager

//@note: Factory - para criar os servicos
j$.service = function(){
   let items = {};
   class CrudBase{
        constructor(adpater, service){
            let $i=this;
            this.id=adpater.key;
            this.Interface= {
                container:CONFIG.LAYOUT.CONTENT
                ,      id:$i.id.toFirstLower()
                , Buttons:CONFIG.CRUD.preset()
                ,    List:{limit:CONFIG.GRID.MAXLINE
                        , maxpage:CONFIG.GRID.MAXPAGE
                        , Buttons:CONFIG.CRUD.GRID.preset()
                    }
            };
            // DEFINIR O RESOURCE
            Object.setIfExist($i, adpater, ['resource']); // Primeiro procurar obter do serviço
            Object.setIfExist($i, service, ['resource','init','child','autoRequest','bindBy'
                                         , 'initialize','onOpen','afterInsert', "beforeDelete"
                                         , 'onSuccess','onError','validate']); // Em seguida das propriedades informadas (este prevalece)
            if (service.Interface)
               Object.setIfExist($i.Interface,service.Interface,['id','design','container','Buttons','List']);
            if (service.Parent && service.constructor.name == "Child") {
                Object.setIfExist($i,service,['Parent']);
                $i.Child = service; // bindBy
            }

            // DEFINIR O TÍTULO
            if (adpater.title) // se tiver o title no serviço usa-o como caption do form
                $i.Interface.title = adpater.title;
            Object.setIfExist($i.Interface,service,['title']); // vai prevaler como CAPTION do interface

            // DEFINIR O FIELDSET
            if (service.fieldset)
                $i.Fieldset = j$.ui.createFieldset(service.fieldset);
            else if (adpater.fieldset)
                $i.Fieldset = j$.ui.createFieldset(adpater.fieldset);
            else // cria um fieldset padrão com código e descrição
                $i.Fieldset = j$.ui.createFieldset(Fieldset.make($i.id));
            
            // DEFINIR os métodos default  
            if ($i.init==undefined){
                $i.init=function(idTarget, modal, param){
                if (idTarget)
                    $i.Interface.container=idTarget;
                j$.ui.Page.create($i, modal).init();
                };
            }
            if ($i.autoRequest==undefined  && dataExt.isCrud($i)){
                $i.autoRequest=function(parms){
                    $i.Resource.get(parms);
                };
            }      
        }
   }
   class Crud extends CrudBase{
        constructor(adpater, service){
            super(adpater, service);
        }
   }
   class Query extends CrudBase{
        constructor(adpater, service){
            super(adpater, service);
            this.Interface.Buttons = CONFIG.QUERY.preset();
            this.Interface.List.Buttons =CONFIG.QUERY.GRID.preset();
        }
   }

   class Child{
        constructor(key, parent, properties){
            Object.join(this, properties);
            this.Parent = parent; // Página que está criando os filhos
            let idService  = parent.service.id
              , txGetValue = `j$.$S.${idService}.Fieldset.c$.${parent.service.resource.id}.value()`;
            this.id = idService +''+key.toFirstUpper();
            Object.preset(this,j$.service.adapter.get(key)) // Vai copiar todas as propriedades do adapter.services que não exite no service
            this.onclick = this.Parent.actionController+'.child("'+key+'",' + txGetValue+ ')';
            if (dataExt.isUndefined(this.modal))
                this.modal = CONFIG.CHILD.MODAL;
            if (this.crud || this.query)
                this.service = j$.service.make(key,this);
        }    
        open(){
            let record = this.Parent.service.Fieldset.sweep();            
            j$.Dashboard.openItem(this, record);            
            // this.Parent.tabs.open({key:`tab_${this.id}`
            //                  , caption:this.caption
            //                  ,   title: this.title
            //                  ,  onLoad: tab=>{j$.service.c$[this.key].init(tab.idContent)}
            // });
        }
        refresh(){
            return  this.Parent.service.Fieldset.sweep();
        }
        //#TODO: O que fazer aqui?
        //Se tiver editado, tem que atualizar o registro
        //Se for um novo ou exclusão, pode fechar a form/tab/etc
        notify=function(notification){
            if (this.service.page){
                this.getBindFields();
                this.showLegends();
            }
            if (notification.action===CONFIG.ACTION.EDIT){
                console.log("#TODO:"+ this.key +" - "+ JSON.stringify(notification.record));
                if (this.service.page && this.service.autoRequest){
                    this.service.autoRequest(this.bindFields); 
                }
            }
        }
        //@note: retorna um Record com os campos que ligam filho e pai
        getBindFields(BindFields){ 
            this.bindFields = null;
            this.bindFields = this.Parent.service.Fieldset.RecordBy(this.bindBy);
            this.service.Fieldset.setDefaults(this.bindFields);
            return this.bindFields;
        }  
        //@note: exibe a descrição do serviço pai
        showLegends(BindFields){
            for (let key in this.service.Fieldset.c$){   
                let field = this.service.Fieldset.c$[key];
                if (field.parentLegend)
                    field.Legend.show(this.Parent.service.Fieldset.c$[field.parentLegend].value());
            };
        }      
    };  

   return {
       get:key=>{return items[key]}
     , Items:items
     , c$:items
     , C$:key=>{return items[key]}
     , createCrud: function(key, service){
           return this.create(key, new Crud(j$.service.adapter.get(key), service));
       }
     , createQuery: function(key, service){
           return this.create(key, new Query(j$.service.adapter.get(key), service));
       }
    , createChild: function(key, parent, service){
        return new Child(key, parent, service);
    }
    , create:(key, service)=>{
          if (!key)
              throw new TypeError(CONFIG.EXCEPTION.SERVICE_NULL.text);
          if (service.constructor.name=="Object"){ //para o servicos que sao criados manualmente
             items[key]=new CrudBase(j$.service.adapter.get(key),service);
          } else
             items[key]=service;
          window[key] = items[key];
          return items[key];
     }
     , make:function(key, adapter){
          let service = items[key];
          if (!service){
        //      service = items[key];
        //   else{
             if (adapter.crud)
                service = this.createCrud(key,adapter);
             else
                service = this.createQuery(key,adapter);
          }
          return service;
     }
     , adapter:function (){
          return{
             get:function(key){
                 if (j$.ui.Adapter)
                    return j$.ui.Adapter.getService(key);
                 else
                    return {key:key};
             }
          }
      }()
   }
}() //j$.service
j$.$S = j$.service.c$;

j$.ui.Page = function(){
   let items = {};
   const Modal =function(wrap,form, fixed){
       let _modal = this;
       //this.show = show;
       this.display=show;
       function show(){
           $("#"+_modal.form.id+"Modal").modal('show'); // exibe o modal
       }
       this.clear=function(){
           if (i$(form.id+ "Modal")) {$("#"+form.id+ "Modal").remove();}
       }
       this.hide=function(){
           $("#"+_modal.form.id+"Modal").modal('hide'); // exibe o modal
       }
       const create=function(){
          _modal.clear();
          let txFixed=(fixed)?'':"<button type='button' class='close'  data-dismiss='modal' aria-label='Close'>"
                     +"<span aria-hidden='true'>&times;</span>"
                     +"</button>";
          $(wrap).append("<div id='" +form.id+ "Modal' class='modal fade' role='dialog'>"
                        +  "<div class='modal-dialog modal-sm modal-lg'>"
                        +    "<div class='modal-content'>"
                        +      "<div id='" +form.id+ "Header' class='modal-header'>"                        
                        +              "<h4 class='modal-title' id='" +form.id+ "Caption' >" +form.title+ "</h4>"
                        +              txFixed
                        +      "</div>"
                        +      "<div id='" +form.id+ "Body' class='modal-body'> <div class='container'>"
                        +              "<form id='" +form.id+ "' name='" +form.id+ "'"+ j$.ui.Render.attributes(form.attributes)+ "></form>"
                        +      "</div></div>"
                        +      "<div id='" +form.id+ "Footer' class='modal-footer'>"
                                  //+"<button type='button' class='btn btn-default' data-dismiss='modal'>Fechar</button>"
                        +       "</div>"
                        +     "</div>"
                        +   "</div>"
                        + "</div>");
          $('#'+form.id).append("<div id='" +form.id+ "Alert'></div>");
          _modal.body     =i$(form.id+ "Body");
          _modal.form     =i$(form.id);
          _modal.fieldset =i$(form.id);
          _modal.caption  =i$(form.id+"Caption");
          _modal.header   =i$(form.id+"Header");
          _modal.footer   =i$(form.id+"Footer");
          _modal.alert    =i$(form.id+"Alert");
       }();
   }
   const Form =function(wrap,form){
       let _form = this;
       this.display=show;
       function show(){ _form.form.show()}
       this.clear=()=>{ wrap.innerHTML=""}
       this.hide=()=>{_form.form.hide()}
       const create=function(){
          _form.clear();
          $(wrap).append("<form id='" +form.id+ "' name='" +form.id+ "'"+ j$.ui.Render.attributes(form.attributes)+ "></form>");

          $('#'+form.id).append(`<div class='${CONFIG.CRUD.CLASS.HEADER}' id='${form.id}Header'>`
                               +`<div class='${CONFIG.CRUD.CLASS.TITLE}'  id='${form.id}Title'>${form.title}</div>`
                               +`<nav class='${CONFIG.CRUD.CLASS.MENU}'   id='${form.id}Menu'></nav>`
                               +"</div>");  

          $('#'+form.id).append("<fieldset class='crud' id='" +form.id+ "Fieldset'></fieldset>");
          $('#'+form.id+' > fieldset').append(`<div id='${form.id}Alert'></div>`);
          $('#'+form.id).append(`<div id='${form.id}Footer'></div>`);
          _form.body     =i$(form.id);
          _form.form     =i$(form.id);
          _form.fieldset =i$(form.id+"Fieldset");
          _form.caption  =i$(form.id+"Title");
          _form.header   =i$(form.id+"Header");
          _form.menu     =i$(form.id+"Menu");
          _form.footer   =i$(form.id+'Footer');
          _form.alert    =i$(form.id+"Alert");
       }();
   }

   return {
       create: function(service, modal){
           items[service.id] = new j$.ui.Form(service, modal);
           return items[service.id];
       }
     , get:key=>{return items[key]}
     , Items:items
     , c$:items
     , C$:key=>{return items[key]}
     , createAdapter: adapter=>{j$.ui.Adapter = new j$.ui.adapterFactory(adapter); return j$.ui.Adapter;}
     , Designer:function(){          
          let addField=(form, section, field, key, mixed, wrapRow)=>{
              if (field){
                 let id =   form.id +'_'+key;
                 if (!wrapRow)
                     wrapRow = j$.ui.Render.wrap(section, id+'_wrapRow', mixed.row.clas$, mixed.row.style);
                 field.create(wrapRow, id, key, mixed);
              }
              return wrapRow;
          }
          let addRow= (page, section, fieldset, design, reposit)=>{
                let fields = reposit.fields;                
                let blendSection =(reposit, idx)=>{
                    // combinar os atributos(clas$,  style) de todas a sections 
                    // combinar as 'definicoes de design do cliente'
                    //      com os 'padroes do designer' (classic, column,...) 
                    let sections={column:{}, label:{}, input:{}, row:{}} // a ideia eh garantir que essas sections tenham tds as props de att
                      ,      att={clas$:null,  style:null}               // isso eh para evitar ficar fazendo IFs mais adiante
                      , _section;                      
                    function setValue(section, prop){
                        let value;
                        if (dataExt.isObject(section)){
                           if (section[prop])              // existe o atributo
                               value = section[prop];                
                        }else if (dataExt.isString(section) && prop=="clas$") // é o atributo default para o caso de vir string
                           value = section;
                        return value;    
                    }                                                         
                    for (let key in sections){                
                        _section = sections[key]
                        for (let prop in att){
                            _section[prop] =att[prop]; // garantir a existes dos atributos de att em cada section
                            if (reposit[key]){
                               if (dataExt.isArray(reposit[key])) // existe a secao e a ocorrencia
                                  _section[prop] = setValue(reposit[key][idx], prop)
                               else
                                  _section[prop] = setValue(reposit[key], prop)      
                            }     
                        }  
                        // combinar os padroes do designer com as definicoes do cliente
                        _section.clas$ =(_section.clas$) ?design.clas$[key] +' '+ _section.clas$ :design.clas$[key]; 
                     }    
                     sections.labelInTheSameWrap=design.labelInTheSameWrap;   
                   return sections;      
                }                
              if (dataExt.isArray(fields)){
                 let wrapRow, key, mixed;
                 fields.forEach((key,i)=>{                                              
                     mixed = blendSection(reposit, i);   
                     wrapRow = addField(page.form, section, fieldset.c$[key], key, mixed, wrapRow);
                     if (!design.inLine)                                         
                         wrapRow = null;
                 })    
              }else{
                  addField(page.form, section, fieldset.c$[fields], fields, blendSection(reposit));
              }    
          };
          let addSection=(page, section, fieldset, design)=>{              
               let reposit={}
                 , wrapSection = (design.clas$.section) 
                               ?j$.ui.Render.wrap(section, null,design.clas$.section, design.style)
                               :section;              
               /* Eh necessario organizar as sections pq, para falicitar,
                  ...existem varias possibilidades de escreve o codigo de uma sessao
                  exemplo: label="col-sm-2" //vai assumir essa propriedade para todas as colunas e linhas da section
                              ou =["col-sm-2","col-sm-2"]  //assume essa propriedade para todas as linhas da section
                              ou =[["col-sm-2","col-sm-2"], ["col-sm-2","col-sm-2"]] 
               */                        
               function parseSection(fields, row){ 
                   let sections = ["label","column","input","row"];
                   reposit.fields =fields;
                   if (design.coupled){ // para configurar 'label' e 'column' de forma igual
                       design.label = design.coupled;
                       design.column = design.coupled;
                   }
                   function parse(section, key){
                        if (dataExt.isArray(section)){ 
                            if (dataExt.isArray(section[row])) // para section=[[],...,[]]
                                reposit[key] = section[row];
                            else
                                reposit[key] = section;        // para section=[]
                        }else 
                            reposit[key] = section             // String ou Object
                   }                     
                   sections.forEach(key=>{
                        if (design[key])                      // a section existe
                              parse(design[key], key);
                   })
               }                             
               if (dataExt.isArray(design.fields[0])){
                   design.fields.forEach((fieldS,idx)=>{
                       parseSection(fieldS, idx);
                       addRow(page, wrapSection, fieldset, design, reposit);
                   })    
               }else{
                   parseSection(design.fields)
                   addRow(page, wrapSection, fieldset, design, reposit) ;
               }
               return wrapSection;    
          };
          return{
              create:page=>{
                 if (page.service.Interface.design){ // Serah feito segundo o design
                     j$.ui.Page.Designer.design(page, page.fieldset, page.service.Interface.design);
                 }else{                              // Serah tudo no modo standard
                     //j$.ui.Page.Designer.standard(page, page.fieldset, page.service.Fieldset);
                     let design = {fields:Object.keys(page.service.Fieldset.c$)}
                     j$.ui.Page.Designer.classic(page, page.fieldset, page.service.Fieldset, design);
                 }
              }
            , design: (page, container, designs)=>{
                    for (let i=0; i<designs.length; i++){
                        let masterSection
                          , section = container
                          , design  = designs[i];
                        if (design.container != undefined)
                            section =i$(design.container);

                        if (design.frame != undefined){
                            if (j$.ui.frame.items[design.frame])
                               section = j$.ui.frame.items[design.frame].target;
                            else
                                try{
                                   throw CONFIG.EXCEPTION.INVALID_ELEMENT
                                } catch(exception){
                                    if (exception===CONFIG.EXCEPTION.INVALID_ELEMENT)
                                        console.log(exception.id +":"+  exception.text + "'['"+design.frame+"']");
                                }
                        }
                        let type=design.type.split(/[.]/g);
                        for (let k=0; k<type.length; k++){
                            section = j$.ui.Page.Designer[type[k]](page, section,  page.service.Fieldset, design);
                            if (!section)
                                section = container;
                            if (k==0)
                                masterSection = section;
                            design.id=null;
                        }
                        if (design.design)
                           j$.ui.Page.Designer.design(page, design.design, masterSection);
                    }
            }
            ,   classic:(page, section, fieldset, design)=>{
                    design.clas$=Object.toLowerCase(CONFIG.DESIGN.CLASSIC);                     
                    return addSection(page, section, fieldset, design);
              }
              , inLine:(page, section, fieldset, design)=>{
                    design.clas$=Object.toLowerCase(CONFIG.DESIGN.INLINE);                    
                    Object.preset(design,{inLine:true, labelInTheSameWrap:false});    
                    return addSection(page, section, fieldset, design);
              }              
            ,   column:(page, section, fieldset, design)=>{
                    Object.preset(design,{clas$:Object.toLowerCase(CONFIG.DESIGN.COLUMN)
                                         ,inLine:true, labelInTheSameWrap:true, design});                    
                    return addSection(page, section, fieldset, design);                   
              }
            , line:(page, section, fieldset, design)=>{
                let wrapLine = j$.ui.Render.line(section, design.id, 'wrap_line', design.title);
                    wrapLine.stylize(design.style);
              }
            , table:fields=>{}
            , section:fields=>{}
            , slidebox:(page, section, fieldset, design)=>{
                 return TYPE.SLIDEBOX({container:section, id:design.id, legend:design.title}).target;
              }
            , framebox:(page, section, fieldset, design)=>{
                 return TYPE.FRAMEBOX({container:section, id:design.id, legend:design.title}).target;
              }
            , dropbox:(page, section, fieldset, design)=>{
                 return TYPE.DROPBOX({container:section, id:design.id, legend:design.title}).target;
              }
            , form:Form
            , modal:Modal
          };
       }()
   };
}(); //j$.service
j$.$P = j$.ui.Page.c$;

j$.ui.Form=function(service, modal) {
    let $i = this;
    this.service = service;
    service.page = this;

    let DEFAULT_BUTTON_PRESET = CONFIG.CRUD.preset
      , alignButtons = (service.alignButton) ?service.alignButton :CONFIG.CRUD.BUTTONS.ALIGN;
    
    if (modal)
         alignButtons=c$.ALIGN.BOTTOM;

    if (service.constructor && service.constructor.name==="query")
        DEFAULT_BUTTON_PRESET = CONFIG.QUERY.preset;

    Object.preset($i, {
                       actionController:(service.id) ?'j$.service.c$.'+service.id+'.actionController' :''
                     , container:(service.Interface.container) ?i$(service.Interface.container) :i$(CONFIG.LAYOUT.CONTENT)
    });
    Object.preset(service.Interface,{Buttons:false});
    Object.preset(service,{
         onSuccess:  ACTION =>{j$.ui.Alert.success(ACTION.MESSAGE.SUCCESS, $i.Alert.id)}
       ,   onError:  ACTION =>{j$.ui.Alert.error(ACTION.MESSAGE.ERROR, $i.Alert.id)}
       , onFailure: response=>{j$.ui.Alert.error(response.msg, $i.Alert.id)}
    });
    if (!service.Interface.id)
        service.Interface.id = service.id.toFirstLower();
    // se for modal, herda de um template próprio para modal
    this.inherit = (modal) ?j$.ui.Page.Designer.modal 
                           :j$.ui.Page.Designer.form;

    $i.inherit($i.container, service.Interface);

    if (!service.Interface.Buttons)
        service.Interface.Buttons = DEFAULT_BUTTON_PRESET();

    if (service.child){
       $i.child = new j$.Observer($i);
      // $i.child={} // Contém os objetos filhos - no caso para a página
                     // no service.child tem os dados declarados para criar os filhos, no page.child, os objetos criados.
       for (let key in service.child){
           $i.child.add(key, new j$.service.createChild(key,$i, service.child[key]))
       }
       service.Interface.Buttons.CHILD = {value:CONFIG.ACTION.SUBVISION.VALUE}
       service.Interface.Buttons.CHILD.submenu=$i.child;
    }

    $i.Buttons = new j$.ui.Buttons($i.actionController, service.Interface.Buttons, DEFAULT_BUTTON_PRESET);
    this.init= function(externalController) {
        j$.ui.Page.Designer.create($i); // cria os fields
        let wrapButtons  = (alignButtons==c$.ALIGN.TOP) ?$i.menu :$i.footer;
        $i.Buttons.create(wrapButtons);   // cria os buttoes html  
        // if (service.Child || service.Interface.List) // cria um tab para comportar o list e|ou child
        //     $i.tabs = j$.ui.Tabs.create(`${$i.form.id}Tabs`, $i.footer.id); 
        // Typecast.Init(service.Interface);              // inicializa as máscaras (já é inicializado qdo a mask é redenrizado em cada input)
        if (service.Interface.List){
           if (service.Interface.List===true){service.Interface.List={};}
           $i.List = new j$.ui.Grid($i); // cria o grid
        }
        if (service.Resource)
           service.Resource=null;
        if (externalController)
           service.actionController = externalController
        else
           service.actionController =  j$.ui.Controller.create(service);
        $i.display();
        if (service.Child)
           service.Child.notify({action:CONFIG.ACTION.INIT});
        if (service.onOpen)
           service.onOpen();
        if (service.autoRequest){
           let parms = null;
           if (service.Child) // quando é Child formata os campos de vinculo
              parms = service.Child.bindFields;
           service.autoRequest(parms);
        }   
        if (service.Fieldset) {
            $i.c$ = service.Fieldset.c$;
            $i.C$ = service.Fieldset.C$;
        }    
    };
    $i.Alert = function(alert){
        return{
            show (msg,_class=CONFIG.ALERT.INFO.CLASS, inFocus){
                if (msg){
                   inFocus = (inFocus) ?`<strong>${inFocus}</strong> ` : "";
                   if (alert) 
                      j$.ui.Alert.show( [`${inFocus}${msg}`], _class, alert);
                }else
                     $i.Alert.hide();
            }
            , hide(){
                if (alert)
                   j$.ui.Alert.hide(alert);
            }
            ,id:alert
        } 
    }($i.alert);

    $i.reset = ()=>{
        $i.Alert.hide();
        $i.form.reset(); // inputs do form
        $i.service.Fieldset.reset(); // atributo dos fields (class, valor default, etc)
        if ($i.List)
           $i.List.index= c$.RC.NONE;
    }    
    $i.Header = function(){
        let element = $i.header
          , idTitle = `${$i.form.id}Title`
          , idMenu  = `${$i.form.id}Menu`;
        function title(text){
           if (text && dataExt.isString(text)) 
              i$(idTitle).innerHTML=text;
           else
              element.hide();    
           return  i$(idTitle).innerHTML; 
        }             
        return{
            title
          , menu:i$(idMenu)
          , show(){element.show()}
          , hide(){element.hide()}
        };
    }();    
};

j$.Observer=function(Parent){
    let $i = this;
    $i.Items={};
    $i.length = 0;
    $i.c$ =  $i.Items;
    $i.C$ = getItem;
    $i.Parent = Parent;
    function getItem(key){
       return $i.Items[key];
    }
    $i.add = (key, item)=>{
       $i.length +=1;
       if (!item.Parent && $i.Parent)
          item.Parent = $i.Parent;
       if (!item.key)
          item.key = key
       $i.Items[key]=item;
    };
    $i.remove = key=>{
       $i.length -=1;
       $i.Items[key]=null;
    };
    $i.notify =notification =>{
       for (let key in $i.c$)
           $i.c$[key].notify(notification);
    };
    $i.first =()=>{
       for (let key in $i.c$)
           return $i.c$[key];
    };
    $i.sweep = (action, param)=>{
        for(let key in $i.c$){
           action($i.c$[key], param);
        }
    };
    $i.each = this.sweep;
};

j$.ui.Modal=function(id, service, actionCallback) {
    let $this = this;
    if (service)
       Object.preset($this, service);
       //this.properties=(helper)?helper:{fixed:false};
    this.callback = actionCallback;
    //this.fixed = fixed(helper);
    $this.inherit = j$.ui.Page.Designer.modal;
    let ws ={buttons:{}, controller:{}}
    let callback=function(key, action){
        this.execute=function(){
           if (!action())
              $this.hide();
           if ($this.callback)
              $this.callback(key)
        }
    }
    function footer(actionController){
        $this.footer.hide();
        if (actionController){
           $this.footer.innerHTML ='';
           for(let key in actionController){
               ws.buttons[key]=CONFIG.action(key);
               let action=new callback(key, actionController[key]);
               ws.controller[key]=action.execute;
           }
           $this.Buttons = new j$.ui.Buttons(ws.controller, ws.buttons);
           $this.Buttons.create($this.footer);   // cria os buttoes
           $this.footer.show();
        }
    }
    function fixed(){
       if ($this.actionController)
          return ($this.fixed)?true:false;
       else
          return false;
    }
    function text(){
        if ($this.text)
            $this.body.innerHTML =$this.text;
    }
    function title(){
        $this.caption.innerHTML = '';
        if ($this.title)
            $this.caption.innerHTML = $this.title;
        if ($this.caption.innerHTML.isEmpty())
           $this.caption.hide();
        else
           $this.caption.show();
    }

    this.show= (service, actionCallback) =>{
        if (service)
             Object.setIfExist($this, service, ['text','title','actionController','fixed']);
        if (actionCallback)
           $this.callback =actionCallback;

        $this.inherit(i$(CONFIG.LAYOUT.CONTENT), {id:id}, fixed());

        title();
        text();
        footer($this.actionController);
        if (service && service.hide)
           return false
        else
           $this.display();
    };
};

j$.Message = new j$.ui.Modal("Message");
//@Teste: j$.Message.show({title:"Meu Titulo", text: "Conteudoi da mensagem"});

j$.Confirm = new j$.ui.Modal("Confirme",{
                 text: '<p><strong>MUDAR O TEXTO:</strong></p>j$.Confirme.text</br>ou</br>{text:"Meu texto"} no método show</p></br>'
                      +'<p><strong>MUDAR O TÍTULO:</strong></p>j$.Confirme.title</br>ou</br>{title:"Meu texto"} no método show</p></br>'
                      +'<p><strong>Experimente:</strong></p>j$.Confirme.show({title:"Meu texto", text:"Meu texto"}, function(action){alert(action);})</p></br>'
              , title: "Título- Mude em j$.Confirme.title"
              , fixed:true // indica que não terá o botão de fechar do modal
            , actionController:{
                   no:()=>{return false;}
                , yes:()=>{return false;} //é false porque informa que a janela será fechada
              }
});
//@Teste:  j$.Confirm.show();

j$.Alert = new j$.ui.Modal("Alert",{
                 text: '<p><strong>MUDAR O TEXTO:</strong></p>j$.Alert.text</br>ou</br>{text:"Meu texto"} no método show</p></br>'
                      +'<p><strong>MUDAR O TÍTULO:</strong></p>j$.Alert.title</br>ou</br>{title:"Meu texto"} no método show</p></br>'
                      +'<p><strong>Experimente:</strong></p>j$.Alert.show({title:"Meu texto", text:"Meu texto"}, function(action){alert(action);})</p></br>'
              , title: "Título- Mude em j$.Alert.title"
            , actionController:{
                     ok:()=>{return false;}
              }
});
//@Teste: j$.Alert.show()

j$.ui.adapterFactory = function(adapter){
   let $this=this;
   Object.preset(this, adapter);
//    this.services=adapter.services;
//    this.design=adapter.design;
   this.load = ()=>{ // Fazer carga dos JS
       for (let key in adapter.services){
           let item = adapter.services[key];
           item.key = key;
           if (!item.partial && !item.url){
              if (item.crud)
                 System.using(CONFIG.CRUD.CONTEXT+key+".js");
              else if (item.query)
                 System.using(CONFIG.QUERY.CONTEXT+key+".js");
           }
       }
   }
   this.getService=key=>{
      if ($this.services[key])
         return $this.services[key];
      else
         return {key:key};
   }
   this.load();
};
