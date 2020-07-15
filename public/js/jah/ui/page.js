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

j$.ui.Grid=function(page, wrap, TEMPLATE){
    let self_grid = this;
    TEMPLATE =(TEMPLATE) ?TEMPLATE :CONFIG.GRID.DEFAULT;
    self_grid.index= c$.RC.NONE;
    let pager = null;

    Object.preset(self_grid,{table:null, Designer:designer() });

    const initialized=function(){
        Object.preset(page.service.Interface,{List:{}});
        if (page.actionController)
           self_grid.actionController = page.actionController;
        return true;
    }();

    this.Buttons = new j$.ui.Buttons(self_grid.actionController, page.service.Interface.List.Buttons, CONFIG[TEMPLATE].GRID.preset);

    this.init=(Resource, wrapGrid)=>{
        self_grid.index= c$.RC.NONE;
        pager = Resource.Dataset.createPager(page.service.Interface.List);
        if (!wrapGrid)
            wrapGrid=wrap;
        if (wrapGrid && pager){
           self_grid.Designer.table(wrapGrid);
           self_grid.paginator = new j$.ui.Pager(wrapGrid, pager , page.actionController+".List.Pager");
           self_grid.Pager= self_grid.paginator.Controller(self_grid.Detail.populate);
           self_grid.Pager.first();
        }
    };

    this.getPosition=cell=>{
        self_grid.index= c$.RC.NONE; //REVIEW: Pode dá chabu
        if (cell)
           self_grid.index= cell.parentNode.parentNode.rowIndex -1;
        return self_grid.index;
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
               ws.lastRow=self_grid.table.rows[row];
            else
               ws.lastRow = self_grid.table.insertRow(self_grid.table.rows.length);
            return ws.lastRow;
        };
        return{
           table:wrap=>{
              if (!i$(wrap.id+'_list')){
                wrap.insert("<div class='wrap_list' id='" +wrap.id+ "ListWrap'></div>");
                let wrapList = i$(wrap.id+"ListWrap");
                wrapList.insert("<table class='list' id='"+wrap.id+ "_list'></table>");
              }
              self_grid.table =i$(wrap.id+'_list');
           }
         , clear:()=>{self_grid.table.innerHTML='';}
         , getRow:row=>{return ws.getRow(row);}
         , addRow:()=>{
                ws.getRow();
                ws.lastRow.className=ws.clsRow;
                ws.clsRow=(ws.clsRow==='even')?ws.clsRow = 'odd':ws.clsRow = 'even';
                return ws.lastRow;
         }
         , deleteRow:row=>{self_grid.table.deleteRow(row);}
         , addColumn:field=>{ws.change(field, true);}
         , changeColumn:field=>{ws.change(field, false);}
         , addButtons:()=>{
             let cell =ws.lastRow.insertCell(ws.ctCell);
             cell.innerHTML = self_grid.Buttons.format();
         }
         , header:()=>{
             let header = self_grid.table.createTHead();
             let headerDetail = header.insertRow(0);
                for(let key in page.service.Fieldset.Items){
                    let df = page.service.Fieldset.Items[key];
                    if (df.persist){
                        let idListHeader = self_grid.table.id+"_header."+key;
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
                label = document.createElement("th");
                headerDetail.appendChild(label);
                self_grid.paginator.createNavigator(label);
            }
        };
    };

    this.Detail=function(){
        return{
            update:function(row,Record){
                    self_grid.Designer.getRow(row);
                    page.service.Fieldset.sweep(function(field){
                        self_grid.Designer.changeColumn(field);
                    });
            }
          , remove:function(pos){
                   let row = self_grid.getPosition(pos);
                   let pageNumber =pager.Control.number;
                   self_grid.Designer.deleteRow(row);
                   pager.restart();
                   if (pageNumber>pager.Control.last)
                      self_grid.Pager.last();
                   else
                      self_grid.Pager.get(pageNumber);
                    return row;
            }
          , add:function(Record, populating){
                   self_grid.Designer.addRow();
                   page.service.Fieldset.populate(Record, function(field){
                          self_grid.Designer.addColumn(field);
                   });
                   self_grid.Designer.addButtons();
                   if (!populating){ //*quando for um registro inserido pelo usuário, recalcula as páginas e posiciona na ultima
                       pager.restart();
                        self_grid.Pager.last();
                   }
            }
          ,clear:()=>{
             self_grid.Designer.clear();
          }
          , populate:function(){
                page.reset(); // o formulário
                 self_grid.Detail.clear();
                if (pager.Record.count !=  c$.RC.NOT_FOUND){
                    pager.sweep(function(row, record){
                       self_grid.Detail.add(record,true);
                    });
                    self_grid.Designer.header();
                }
          }
         , populateAll:function(){ // preenche todos registros no grid, sem paginação
              self_grid.table.innerHTML='';
              for (row=0; row<pager.dataset.count;row++){
                   self_grid.Detail.add(pager.dataset.get(row));
              }
              self_grid.Designer.header();
           }
      };
    }();
}; //j$.ui.Grid

j$.ui.Buttons=function(actionController, buttons, presetFunction){
    let self_button=this;
    let wrapButtons;
    let _wrap;
    Object.preset(self_button,{Items:getItems()});
    presetFunction =(presetFunction)?presetFunction:()=>{};
    // Obter o grupos de buttons
    function getItems(){
        let values = (buttons)?buttons :presetFunction(null, actionController);
        return values;
    };
    // Colocar os valores default
    function preset(key,button, parent){
        if (parent && parent.id)
            Object.preset(button, {id: parent.id +'_'+ key});
        Object.preset(button,{key:key, value:button.VALUE, clas$:CONFIG.BUTTON.CLASS.DEFAULT});
        if (actionController && dataExt.isString(actionController))
           button.onclick = actionController+'.' +key+'(this);';
        return button;
    };

    function submenu(button){
       if (button.submenu){
          let root  = $("#"+button.id+" > ul")[0].id; // obtendo o root para os elementos
          for (let key in button.submenu.c$){
             let subitem = Object.merge({},button.submenu.c$[key]);
             subitem.id = button.id + subitem.key;
             j$.ui.Render.li(i$(root),subitem);
          }
       }
    }

    this.create=wrap=>{
        _wrap = wrap;
        wrapButtons=j$.ui.Render.wrap(_wrap, _wrap.id+ '_button', 'wrap_command');
        for (let key in self_button.Items){
            self_button.add(key,self_button.Items[key]);
        };
    };

    this.add=(key, button)=>{
         preset(key.toLowerCase(),button, _wrap);
         button['element'] = j$.ui.Render.button(wrapButtons, button);
         if (actionController && dataExt.isObject(actionController) && actionController[button.key])
             $(button['element']).click(actionController[button.key]);
         submenu(button);
    };
    this.format=parent=>{
        let html='';
        for (let key in self_button.Items){
            let button=self_button.Items[key];
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
    let self_pager=this;
    let _wrap;

    Object.preset(self_pager,{clas$:CONFIG.PAGER.CLASS, pager:pager});
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
            _wrap=j$.ui.Render.wrapperUl(Wrap, parent.id+ '_pager', self_pager.clas$);
        self_pager.clear();
    };
    this.clear=()=>{if (_wrap) _wrap.innerHTML='';};

    this.add= (values, clas$)=>{
         clas$ = (clas$)?' class="' +clas$+ '"':'';
         let properties = parse(values);
         let value = (properties.value.isNumeric())?properties.value:'';
         Object.preset(properties, {
               onclick:'javascript:'+actionController+'.' +properties.method+ '('+value+')'});
         _wrap.insert('<li' +clas$+ '><a' +j$.ui.Render.attributes(properties,'value')+ '>'+properties.caption+'</a></li>');
    };
    this.createNavigator=wrap=>{
        self_pager.create(wrap);
        self_pager.add("first",(pager.Control.first===pager.Control.number)?'disabled':'');
        self_pager.add("back",(pager.Control.first===pager.Control.number)?'disabled':'');
        let pagerPosition=pager.positions();
        for (let row=pagerPosition.first; row<=pagerPosition.last; row++){
            self_pager.add(row.toString(),(row===pager.Control.number)?'active':'');
        }
        self_pager.add("next",(pager.Control.last===pager.Control.number)?'disabled':'');
        self_pager.add("last",(pager.Control.last===pager.Control.number)?'disabled':'');
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
                        , Buttons:CONFIG.CRUD.GRID.BUTTONS
                    }
            };
            // DEFINIR O RESOURCE
            Object.setIfExist($i, adpater, ['resource']); // Primeiro procurar obter do serviço
            Object.setIfExist($i, service, ['resource','init','child','autoRequest','bindBy'
                                         , 'initialize','onOpen','afterActionInsert'
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
            this.Interface.List.Buttons =CONFIG.QUERY.GRID.BUTTONS;
        }
   }

   class Child{
        constructor(key, parent, properties){
            Object.join(this, properties);
            this.Parent = parent; // Página que está criando os filhos
           // let initialized = function(){
                let idService  = parent.service.id;
                let txGetValue = `j$.$S.${idService}.Fieldset.Items.${parent.service.resource.id}.value()`;
                this.id = idService +''+key.toFirstUpper();
                Object.preset(this,j$.service.adapter.get(key)) // Vai copiar todas as propriedades do adapter.services que não exite no service
                this.onclick = this.Parent.actionController+'.child("'+key+'",' + txGetValue+ ')';
                if (this.crud || this.query)
                    this.service = j$.service.make(key,this);
           // }();
        }    
        open(){
            let record =  this.Parent.service.Fieldset.sweep();
            j$.Dashboard.openItem(this, record);
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
            for (let key in this.service.Fieldset.Items){   
                let field = this.service.Fieldset.Items[key];
                if (field.parentLegend)
                    field.Legend.show(this.Parent.service.Fieldset.Items[field.parentLegend].value());
            };
        }      
    };  

   return {
       get:key=>{return items[key];}
     , Items:items
     , c$:items
     , C$:key=>{return items[key];}
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
   const modal =function(wrap,form, fixed){
       let SELF = this;
       //this.show = show;
       this.display=show;
       function show(){
           $("#"+SELF.form.id+"Modal").modal('show'); // exibe o modal
       }
       this.clear=function(){
           if (i$(form.id+ "Modal")) {$("#"+form.id+ "Modal").remove();}
       }
       this.hide=function(){
           $("#"+SELF.form.id+"Modal").modal('hide'); // exibe o modal
       }
       const create=function(){
          SELF.clear();
          let txFixed=(fixed)?'':"<button type='button' class='close'  data-dismiss='modal'>&times;</button>";
          $(wrap).append("<div id='" +form.id+ "Modal' class='modal fade' role='dialog'>"
                        +  "<div class='modal-dialog'>"
                        +    "<div class='modal-content'>"
                        +      "<div id='" +form.id+ "Header' class='modal-header'>"
                        +              txFixed
                        +              "<h4 class='modal-title' id='" +form.id+ "Caption' >" +form.title+ "</h4>"
                        +      "</div>"
                        +      "<div id='" +form.id+ "Body' class='modal-body'>"
                        +              "<form id='" +form.id+ "' name='" +form.id+ "'"+ j$.ui.Render.attributes(form.attributes)+ "></form>"
                        +      "</div>"
                        +      "<div id='" +form.id+ "Footer' class='modal-footer'>"
                                  //+"<button type='button' class='btn btn-default' data-dismiss='modal'>Fechar</button>"
                        +       "</div>"
                        +     "</div>"
                        +   "</div>"
                        + "</div>");
          $('#'+form.id).append("<div id='" +form.id+ "Alert'></div>");
          SELF.body     =i$(form.id+ "Body");
          SELF.form     =i$(form.id);
          SELF.fieldset =i$(form.id);
          SELF.caption  =i$(form.id+"Caption");
          SELF.header   =i$(form.id+"Header");
          SELF.footer   =i$(form.id+"Footer");
          SELF.alert    =i$(form.id+"Alert")
       }();
   }
   const form =function(wrap,form){
       let _form = this;
       this.display=show;
       function show(){ _form.form.show()}
       this.clear=()=>{ wrap.innerHTML=""}
       this.hide=()=>{_form.form.hide()}
       const create=function(){
          _form.clear();
          $(wrap).append("<form id='" +form.id+ "' name='" +form.id+ "'"+ j$.ui.Render.attributes(form.attributes)+ "></form>");
          $('#'+form.id).append("<fieldset class='crud' id='" +form.id+ "Fieldset'><legend id='" +form.id+ "Header' class='crud'>" +form.title+ "</legend></fieldset>");
          $('#'+form.id+' > fieldset').append("<div id='" +form.id+ "Alert'></div>");
          $('#'+form.id).append("<div id='" +form.id+ "Footer'></div>");
          _form.body     = i$(form.id);
          _form.form     =i$(form.id);
          _form.fieldset =i$(form.id+"Fieldset");
          _form.caption  =i$(form.id+"Header");
          _form.header   =i$(form.id+"Header");
          _form.footer   =i$(form.id+'Footer');
          _form.alert    =i$(form.id+"Alert")
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
          let addField=(form, section, fieldset, design, key)=>{
              if (fieldset.item(key)){
                 let id =   form.id +'_'+key;
                 let wrap = j$.ui.Render.wrap(section, id+'_'+ design.clas$.column, design.clas$.column);
                 fieldset.item(key).create(wrap, id, key, design);
                 wrap.stylize(design.columnStyle);
              }
          };
          let addRow= (page, section, fieldset, fields, design)=>{
              let wrapRow = j$.ui.Render.wrap(section, null,design.clas$.row);
              if (dataExt.isArray(fields)){
                  for (let i=0; i<fields.length; i++)
                      addField(page.form, wrapRow, fieldset, design, fields[i]) ;
              }else
                  addField(page.form, wrapRow, fieldset, design, fields);
              wrapRow.stylize(design.lineStyle);
              return wrapRow;
          };
          let addSection=(page, section, fieldset, design)=>{
                section.stylize(design.style);
                if (dataExt.isArray(design.fields[0])){
                    for (let k=0; k<design.fields.length; k++)
                        addRow(page, section, fieldset, design.fields[k], design);
                }else{
                    addRow(page, section, fieldset, design.fields, design) ;
                }
          };
          return{
              create:page=>{
                 if (page.service.Interface.design){ // Serah feito segundo o design
                     j$.ui.Page.Designer.design(page, page.service.Interface.design, page.fieldset);
                 }else{            // Serah tudo no modo standard
                     j$.ui.Page.Designer.standard(page, page.fieldset, page.service.Fieldset);
                 }
              }
            , design: (page, designs, container)=>{
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
            , standard:(page, section, fieldset)=>{
                  if (fieldset){
                     for (let key in fieldset.Items){
                        let design={labelStyle:{width:'140px'}, clas$:{row:'wrap_classic_section',column:'wrap_classic_field'}};
                        addField(page.form, section, fieldset, design, key);
                     }
                  }
              }
            ,   classic:(page, section, fieldset, design)=>{
                    design.clas$={row:'wrap_classic_section',column:'wrap_classic_field'};
                    let wrapRow = addRow(page, section, fieldset, design.fields, design);
                    wrapRow.stylize(design.style);
                    return wrapRow;
              }
            ,   inLine:(page, section, fieldset, design)=>{
                    design.clas$={row:'wrap_inLine_row',column:'wrap_inLine_field', design:design};
                    let wrapSection = j$.ui.Render.wrap(section, design.id, 'wrap_inLine_section');
                    addSection(page, wrapSection, fieldset, design);
                    return wrapSection;
              }
            ,   column:(page, section, fieldset, design)=>{
                    if (!design.labelStyle)
                        design.labelStyle='input_column_label';
                    else
                        design.labelStyle.clas$='input_column_label';
                    design.clas$={row:'wrap_column_row',column:'wrap_column_field'};
                    let wrapSection = j$.ui.Render.wrap(section, design.id, 'wrap_column_section');
                    wrapSection.style.width='0px';
                    addSection(page, wrapSection, fieldset, design);
                    return wrapSection;
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
            , form:form
            , modal:modal
          };
       }()
   };
}(); //j$.service
j$.$P = j$.ui.Page.c$;

j$.ui.Form=function(service, modal) {
    let $i = this;
    this.service = service;
    service.page = this;

    let DEFAULT_BUTTON_PRESET = CONFIG.CRUD.preset;

    if (service.constructor && service.constructor.name==="query")
        DEFAULT_BUTTON_PRESET = CONFIG.QUERY.preset;

    Object.preset($i, {
                       actionController:(service.id) ?'j$.service.c$.'+service.id+'.actionController' :''
                     , container:(service.Interface.container) ?i$(service.Interface.container) :i$(CONFIG.LAYOUT.CONTENT)
    });
    Object.preset(service.Interface,{Buttons:false});
    Object.preset(service,{
         onSuccess:  ACTION =>{j$.ui.Alert.success(ACTION.MESSAGE.SUCCESS, $i.alert)}
       ,   onError:  ACTION =>{j$.ui.Alert.error(ACTION.MESSAGE.ERROR, $i.alert)}
       , onFailure: response=>{j$.ui.Alert.error(response.msg, $i.alert)}
    });
    if (!service.Interface.id)
        service.Interface.id = service.id.toFirstLower();
    // se for modal, herda de um template próprio para modal
    this.inherit = (modal) ?j$.ui.Page.Designer.modal :j$.ui.Page.Designer.form
    $i.inherit($i.container, service.Interface);
    $i.hideAlert=()=>{
       if ($i.alert)
           j$.ui.Alert.hide($i.alert);
    }
    $i.reset = ()=>{
        $i.hideAlert();
        $i.form.reset(); // inputs do form
        $i.service.Fieldset.reset(); // atributo dos fields (class, valor default, etc)
        if ($i.List)
           $i.List.index= c$.RC.NONE;
    }
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
        $i.Buttons.create($i.footer);   // cria os buttoes
       // Typecast.Init(service.Interface);              // inicializa as máscaras (já é inicializado qdo a mask é redenrizado em cada input)
        if (service.Interface.List){
           if (service.Interface.List===true){service.Interface.List={};}
           $i.List = new j$.ui.Grid($i, $i.footer); // cria o grid
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
    };
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
   this.services=adapter.services;
   this.design=adapter.design;
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
