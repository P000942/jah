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
    var self_grid = this;
    TEMPLATE =(TEMPLATE) ?TEMPLATE :CONFIG.GRID.DEFAULT;
    var pager = null;

    Object.preset(self_grid,{table:null, Designer:designer() });

    var initialized=function(){
        Object.preset(page.service.Interface,{List:{}});
        if (page.actionController)
           self_grid.actionController = page.actionController;
        return true;
    }();

    this.Buttons = new j$.ui.Buttons(self_grid.actionController, page.service.Interface.List.Buttons, CONFIG[TEMPLATE].GRID.preset);

    this.init=function(dataset, wrapGrid){
        pager = dataset.Pager.create(page.service.Interface.List);
        if (!wrapGrid)
            wrapGrid=wrap;
        if (wrapGrid && dataset){
           self_grid.Designer.table(wrapGrid);
           self_grid.paginator = new j$.ui.Pager(wrapGrid, pager , page.actionController+".List.Pager");
           self_grid.Pager= self_grid.paginator.Controller(self_grid.Detail.populate);
           self_grid.Pager.first();
        }
    };

    this.getPosition=function(cell){
         return cell.parentNode.parentNode.rowIndex -1;
    };

    function designer(){
        var ws={ clsRow:'even', ctCell:0, lastRow:null};
        ws.change=function(field, create){
            var column;
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
        ws.getRow=function(row){
            ws.ctCell=0;
            if (row && row>-1)
               ws.lastRow=self_grid.table.rows[row];
            else
               ws.lastRow = self_grid.table.insertRow(self_grid.table.rows.length);
            return ws.lastRow;
        };
        return{
           table:function(wrap){
              if (!i$(wrap.id+'_list')){
                wrap.insert("<div class='wrap_list' id='" +wrap.id+ "ListWrap'></div>");
                var wrapList = i$(wrap.id+"ListWrap");
                wrapList.insert("<table class='list' id='"+wrap.id+ "_list'></table>");
              }
              self_grid.table =i$(wrap.id+'_list');
           }
         , clear:function(){self_grid.table.innerHTML='';}
         , getRow:function(row){return ws.getRow(row);}
         , addRow:function(){
                ws.getRow();
                ws.lastRow.className=ws.clsRow;
                ws.clsRow=(ws.clsRow==='even')?ws.clsRow = 'odd':ws.clsRow = 'even';
                return ws.lastRow;
         }
         , deleteRow:function(row){self_grid.table.deleteRow(row);}
         , addColumn:function(field){ws.change(field, true);}
         , changeColumn:function(field){ws.change(field, false);}
         , addButtons:function(){
             var cell =ws.lastRow.insertCell(ws.ctCell);
             cell.innerHTML = self_grid.Buttons.format();
         }
         , header:function(){
                var header = self_grid.table.createTHead();
                var headerDetail = header.insertRow(0);
                for(var key in page.service.Fieldset.Items){
                    var df = page.service.Fieldset.Items[key];
                    if (df.persist){
                        var idListHeader = self_grid.table.id+"_header."+key;
                        var label = document.createElement("th");
                        var clas$ = (df.Header.clas$)?' class="' +df.Header.clas$+ '"':'';

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
          , remove:function(row){
                   var pageNumber =pager.Control.number;
                   self_grid.Designer.deleteRow(row);
                   pager.restart();
                   if (pageNumber>pager.Control.last)
                      self_grid.Pager.last();
                   else
                      self_grid.Pager.get(pageNumber);
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
          , populate:function(){
                self_grid.Designer.clear();
                pager.sweep(function(row, record){
                   self_grid.Detail.add(record,true);
                });
                self_grid.Designer.header();
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
};

j$.ui.Buttons=function(actionController, buttons, presetFunction){
    var self_button=this;
    var wrapButtons;
    var wrap;
    Object.preset(self_button,{Items:getItems()});
    presetFunction =(presetFunction)?presetFunction:function(){return{};};
    // Obter o grupos de buttons
    function getItems(){
        var values = (buttons)?buttons :presetFunction(null, actionController);
        return values;
    };
    // Colocar os valores default
    function preset(key,button, parent){
        if (parent && parent.id)
            Object.preset(button, {id: parent.id +'_'+ key});
        Object.preset(button,{key:key, value:key, clas$:CONFIG.BUTTON.CLASS.DEFAULT});
        if (actionController && dataExt.isString(actionController))
           button.onclick = actionController+'.' +key+'(this);';
        return button;
    };

    function submenu(button){
       if (button.submenu){
          var root  = $("#"+button.id+" > ul")[0].id; // obtendo o root para os elementos
          for (var key in button.submenu.c$){
             var subitem = Object.merge({},button.submenu.c$[key]);
             subitem.id = button.id + subitem.key;
             j$.ui.Render.li(i$(root),subitem);
          }
       }
    }

    this.create=function(Wrap){
        wrap = Wrap;
        wrapButtons=j$.ui.Render.wrap(wrap, wrap.id+ '_button', 'wrap_command');
        for (var key in self_button.Items){
            self_button.add(key,self_button.Items[key]);
        };
    };

    this.add=function(key, button){
         preset(key.toLowerCase(),button, wrap);
         button['element'] = j$.ui.Render.button(wrapButtons, button);
         if (actionController && dataExt.isObject(actionController) && actionController[button.key])
             $(button['element']).click(actionController[button.key]);
         submenu(button);
    };
    this.format=function(parent){
        var html='';
        for (var key in self_button.Items){
            var button=self_button.Items[key];
            preset(key.toLowerCase(),button, parent);
            html+=j$.ui.Render.formatButton(button);
        };
        return html;
    };
};

// Cria o navegar para fazer paginação
// pager (): é o que controla data, faz o calculos de pagina e devolve os registro para exibir na página
// j$.ui.Pager: É o componente que cria os elementos visuais de html para navegação e recebe a ações para o controller
j$.ui.Pager=function(parent, pager , actionController){
    var self_pager=this;
    var wrap;

    Object.preset(self_pager,{clas$:CONFIG.PAGER.CLASS, pager:pager});
    function parse(values){
         var properties = values;
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

    this.create=function(Wrap){
        if (!actionController)
            actionController = parent.id.toCapitalize().trim()+ ".actionController.List.Pager";
        if (i$(parent.id+ '_pager'))
            wrap = i$(parent.id+ '_pager');
        else
            wrap=j$.ui.Render.wrapperUl(Wrap, parent.id+ '_pager', self_pager.clas$);
        self_pager.clear();
    };
    this.clear=function(){if (wrap) wrap.innerHTML='';};

    this.add=function(values, clas$){
         clas$ = (clas$)?' class="' +clas$+ '"':'';
         var properties = parse(values);
         var value = (properties.value.isNumeric())?properties.value:'';
         Object.preset(properties, {
               onclick:'javascript:'+actionController+'.' +properties.method+ '('+value+')'});
         wrap.insert('<li' +clas$+ '><a' +j$.ui.Render.attributes(properties,'value')+ '>'+properties.caption+'</a></li>');
    };
    this.createNavigator=function(wrap){
        self_pager.create(wrap);
        self_pager.add("first",(pager.Control.first===pager.Control.number)?'disabled':'');
        self_pager.add("back",(pager.Control.first===pager.Control.number)?'disabled':'');
        var pagerPosition=pager.positions();
        for (var row=pagerPosition.first; row<=pagerPosition.last; row++){
            self_pager.add(row.toString(),(row===pager.Control.number)?'active':'');
        }
        self_pager.add("next",(pager.Control.last===pager.Control.number)?'disabled':'');
        self_pager.add("last",(pager.Control.last===pager.Control.number)?'disabled':'');
    };
    this.Controller=function(callbackPopulate){
        var ws = {callback:callbackPopulate};
        var populate=function(number){
                if (number)
                    pager.get(number);
                ws.callback(pager);
        };
        return {
           first:function(){populate(pager.Control.first);}
          , back:function(){populate(pager.Control.number-1);}
          , next:function(){populate(pager.Control.number+1);}
          , last:function(){populate(pager.Control.last);}
          ,  get:function(number){populate(number);}
          , absolutePosition:function(row){return pager.absolutePosition(row);}
        };
    };
};
j$.service = function(){
   var items = {};
   function base(adpater, service){
        var $i=this;
        this.id=adpater.key;
        //this.Page;
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
        Object.setIfExist($i,adpater,['resource']); // Primeiro procurar obter do serviço
        Object.setIfExist($i,service,['resource','init',,'child']); // Em seguida das propriedades informadas (este prevalece)
        if (service.Interface)
           Object.setIfExist($i.Interface,service.Interface,['id','design','container','Buttons','List']);

        // DEFINIR O TÍTULO
        if (adpater.title) // se tiver o title no serviço usa-o como caption do form
           $i.Interface.title = adpater.title;
        Object.setIfExist($i.Interface,service,['title']); // vai prevaler como CAPTION do interface

        // DEFINIR O FIELDSET
        if (service.fieldset)
           $i.Fieldset = new j$.ui.Fieldset(service.fieldset);
        else if (adpater.fieldset)
           $i.Fieldset = new j$.ui.Fieldset(adpater.fieldset);
        else // cria um fieldset padrão com código e descrição
           $i.Fieldset = new j$.ui.Fieldset(j$.ui.Fieldset.make($i.id));
        if ($i.init==undefined){
            $i.init=function(idTarget, modal, param){
               if (idTarget)
                  $i.Interface.container=idTarget;
               j$.ui.Page.create($i, modal).init();
            };
        }
    }
    function crud(adpater, service){
       this.inherit = base;
       this.inherit(adpater, service);
    }
    function query(adpater, service){
       this.inherit = base;
       this.inherit(adpater, service);
       with(this.Interface){
          Buttons = CONFIG.QUERY.preset();
          List.Buttons =CONFIG.QUERY.GRID.BUTTONS;
       }
    }

   return {
       get:function(key){return items[key];}
     , Items:items
     , c$:items
     , C$:function(key){return items[key];}
     , createCrud: function(key, service){
           return this.create(key, new crud(j$.service.adapter.get(key),service));
       }
     , createQuery: function(key, service){
           return this.create(key, new query(j$.service.adapter.get(key),service));
       }
     , create:function(key, service){
          if (!key)
              throw new TypeError(CONFIG.EXCEPTION.SERVICE_NULL.text);
          if (service.constructor.name=="Object"){
             items[key]=new base(j$.service.adapter.get(key),service);
          } else
             items[key]=service;
          window[key] = items[key];
          return items[key];
     }
     , make:function(key, adapter){
          var service = items[key];
          if (service)
             service = items[key];
          else{
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
}()
j$.$S = j$.service.c$;

j$.ui.Page = function(){
   var items = {};
   var modal =function(wrap,form, fixed){
       var SELF = this;
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
       var create=function(){
          SELF.clear();
          var txFixed=(fixed)?'':"<button type='button' class='close'  data-dismiss='modal'>&times;</button>";
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
          SELF.body = i$(form.id+ "Body");
          SELF.form = i$(form.id);
          SELF.fieldset =i$(form.id);
          SELF.caption = i$(form.id+"Caption");
          SELF.header =i$(form.id+"Header");
          SELF.footer =i$(form.id+"Footer");
          SELF.alert = i$(form.id+"Alert")
       }();
   }
   var form =function(wrap,form){
       var SELF = this;
       //this.show = show;
       this.display=show;
       function show(){
           SELF.form.show();
       }
       this.clear=function(){
           wrap.innerHTML="";
       }
       this.hide=function(){
           SELF.form.hide();
       }
       var create=function(){
          SELF.clear();
          $(wrap).append("<form id='" +form.id+ "' name='" +form.id+ "'"+ j$.ui.Render.attributes(form.attributes)+ "></form>");
          $('#'+form.id).append("<fieldset class='crud' id='" +form.id+ "Fieldset'><legend id='" +form.id+ "Header' class='crud'>" +form.title+ "</legend></fieldset>");
          $('#'+form.id+' > fieldset').append("<div id='" +form.id+ "Alert'></div>");
          $('#'+form.id).append("<div id='" +form.id+ "Footer'></div>");
          SELF.body = i$(form.id);
          SELF.form = i$(form.id);
          SELF.fieldset =i$(form.id+"Fieldset");
          SELF.caption = i$(form.id+"Header");
          SELF.header =i$(form.id+"Header");
          SELF.footer =i$(form.id+'Footer');
          SELF.alert = i$(form.id+"Alert")
       }();
   }
   return {
       create: function(service, modal){
           items[service.id] = new j$.ui.Form(service, modal);
           return items[service.id];
       }
     , get:function(key){return items[key];}
     , Items:items
     , c$:items
     , C$:function(key){return items[key];}
     , createAdapter: function(adapter){j$.ui.Adapter = new j$.ui.adapterFactory(adapter); return j$.ui.Adapter;}
     , Designer:function(){
          var addField=function(form, section, fieldset, design, key){
              if (fieldset.item(key)){
                  var id =   form.id +'_'+key;
                  var wrap = j$.ui.Render.wrap(section, id+'_'+ design.clas$.column, design.clas$.column);
                  fieldset.item(key).create(wrap, id, key, design);
                  wrap.stylize(design.columnStyle);
              }
          };
          var addRow=function(page, section, fieldset, fields, design){
              var wrapRow = j$.ui.Render.wrap(section, null,design.clas$.row);
              if (dataExt.isArray(fields)){
                  for (var i=0; i<fields.length; i++)
                      addField(page.form, wrapRow, fieldset, design, fields[i]) ;
              }else
                  addField(page.form, wrapRow, fieldset, design, fields);
              wrapRow.stylize(design.lineStyle);
              return wrapRow;
          };
          var addSection=function(page, section, fieldset, design){
                section.stylize(design.style);
                if (dataExt.isArray(design.fields[0])){
                    for (var k=0; k<design.fields.length; k++)
                        addRow(page, section, fieldset, design.fields[k], design);
                }else{
                    addRow(page, section, fieldset, design.fields, design) ;
                }
          };
          return{
              create:function(page){
                 if (page.service.Interface.design){ // Serah feito segundo o design
                     j$.ui.Page.Designer.design(page, page.service.Interface.design, page.fieldset);
                 }else{            // Serah tudo no modo standard
                     j$.ui.Page.Designer.standard(page, page.fieldset, page.service.Fieldset);
                 }
              }
            , design: function(page, designs, container){
                    for (var i=0; i<designs.length; i++){
                        var section = container;
                        var design=designs[i];
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
                        var type=design.type.split(/[.]/g);
                        for (var k=0; k<type.length; k++){
                            section = j$.ui.Page.Designer[type[k]](page, section,  page.service.Fieldset, design);
                            if (!section)
                                section = container;
                            if (k===0)
                               var masterSection = section;
                            design.id=null;
                        }
                        if (design.design)
                           j$.ui.Page.Designer.design(page, design.design, masterSection);
                    }
            }
            , standard:function(page, section, fieldset){
                  if (fieldset){
                     for (var key in fieldset.Items){
                        var design={labelStyle:{width:'140px'}, clas$:{row:'wrap_classic_section',column:'wrap_classic_field'}};
                        addField(page.form, section, fieldset, design, key);
                     }
                  }
              }
            ,   classic:function(page, section, fieldset, design){
                    design.clas$={row:'wrap_classic_section',column:'wrap_classic_field'};
                    var wrapRow = addRow(page, section, fieldset, design.fields, design);
                    wrapRow.stylize(design.style);
                    return wrapRow;
              }
            ,   inLine:function(page, section, fieldset, design){
                    design.clas$={row:'wrap_inLine_row',column:'wrap_inLine_field', design:design};
                    var wrapSection = j$.ui.Render.wrap(section, design.id, 'wrap_inLine_section');
                    addSection(page, wrapSection, fieldset, design);
                    return wrapSection;
              }
            ,   column:function(page, section, fieldset, design){
                    if (!design.labelStyle)
                        design.labelStyle='input_column_label';
                    else
                        design.labelStyle.clas$='input_column_label';
                    design.clas$={row:'wrap_column_row',column:'wrap_column_field'};
                    var wrapSection = j$.ui.Render.wrap(section, design.id, 'wrap_column_section');
                    wrapSection.style.width='0px';
                    addSection(page, wrapSection, fieldset, design);
                    return wrapSection;
              }
            , line:function(page, section, fieldset, design){
                    var wrapLine = j$.ui.Render.line(section, design.id, 'wrap_line', design.title);
                    wrapLine.stylize(design.style);
              }
            , table:function(fields){}
            , section:function(fields){}
            , slidebox:function(page, section, fieldset, design){
                 return TYPE.SLIDEBOX({container:section, id:design.id, legend:design.title}).target;
              }
            , framebox:function(page, section, fieldset, design){
                 return TYPE.FRAMEBOX({container:section, id:design.id, legend:design.title}).target;
              }
            , dropbox:function(page, section, fieldset, design){
                 return TYPE.DROPBOX({container:section, id:design.id, legend:design.title}).target;
              }
            , form:form
            , modal:modal
          };
       }()
   };
}();
j$.$P = j$.ui.Page.c$;

j$.ui.Form=function(service, modal) {
    var $i = this;
    this.service = service;
    service.page = this;

    var DEFAULT_BUTTON_PRESET = CONFIG.CRUD.preset;

    if (service.constructor && service.constructor.name==="query")
        DEFAULT_BUTTON_PRESET = CONFIG.QUERY.preset;

    Object.preset($i, {
                       actionController:(service.id) ?'j$.service.c$.'+service.id+'.actionController' :''
                     , container:(service.Interface.container) ?i$(service.Interface.container) :i$(CONFIG.LAYOUT.CONTENT)
    });
    Object.preset(service.Interface,{Buttons:false});
    Object.preset(service,{
         onSuccess:function(ACTION){
          j$.ui.Alert.success($i.alert, ACTION.MESSAGE.SUCCESS);}
       ,   onError:function(ACTION){j$.ui.Alert.error($i.alert, ACTION.MESSAGE.ERROR);}
    });
    if (!service.Interface.id)
        service.Interface.id = service.id.toFirstLower();
    // se for modal, herda de um template próprio para modal
    this.inherit = (modal) ?j$.ui.Page.Designer.modal :j$.ui.Page.Designer.form
    $i.inherit($i.container, service.Interface);

    if (!service.Interface.Buttons)
        service.Interface.Buttons = DEFAULT_BUTTON_PRESET();

    if (service.child){
       $i.child = new j$.Observer($i);
      // $i.child={} // Contém os objetos filhos - no caso para a página
                   // no service.child tem os dados declarados para criar os filhos, no page.child, os objetos criados.
       for (var key in service.child){
           $i.child.add(key, new j$.ui.Child(key,$i, service.child[key]))
           //$i.child[key] = new j$.ui.Child(key,$i, service.child[key])
       }
       service.Interface.Buttons.CHILD = {value:CONFIG.ACTION.SUBVISION.VALUE}
       service.Interface.Buttons.CHILD.submenu=$i.child;
    }

    $i.Buttons = new j$.ui.Buttons($i.actionController, service.Interface.Buttons, DEFAULT_BUTTON_PRESET);
    this.init= function(externalController) {
        j$.ui.Page.Designer.create($i); // cria os fields
        $i.Buttons.create($i.footer);   // cria os buttoes
        Typecast.Init();                // inicializa as máscaras
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
    };
};

j$.ui.Child=function(key, parent, properties){
   var $i = this;
   $i.Parent = parent; // Página que está criando os filhos
   Object.join($i, properties);
   var initialized = function(){
       $i.id = $i.Parent.service.id +''+key.toFirstUpper();
       Object.preset($i,j$.service.adapter.get(key)) // Vai copiar todas as propriedades do adapter.services que não exite no service
       $i.onclick = $i.Parent.actionController+'.child("'+key+'")';
       if ($i.crud || $i.query){
          $i.service = j$.service.make(key,$i);
       }
   }();
   $i.open=function(){
      var record =  $i.Parent.service.Fieldset.sweep();
      j$.Dashboard.openItem($i, record);
   }
   $i.refresh=function(){
      var record =  $i.Parent.service.Fieldset.sweep();
//      j$.Dashboard.openItem($i, record);
   }
   //TODO: O que fazer aqui?
   $i.notify=function(notification){
      if (notification.action==CONFIG.ACTION.EDIT.KEY)
         console.log("#TODO:"+ $i.key +" - "+ JSON.stringify(notification.record));
   }
};

j$.Observer=function(Parent){
    var $i = this;
    $i.Items={};
    $i.length = 0;
    $i.c$ =  $i.Items;
    $i.C$ = getItem;
    $i.Parent = Parent;
    function getItem(key){
       return $i.Items[key];
    }
    $i.add = function(key, item){
       $i.length +=1;
       if (!item.Parent && $i.Parent)
          item.Parent = $i.Parent;
       if (!item.key)
          item.key = key
       $i.Items[key]=item;
    };
    $i.remove = function(key){
       $i.length -=1;
       $i.Items[key]=null;
    };
    $i.notify =function (notification){
       for (var key in $i.c$)
           $i.c$[key].notify(notification);
    };
    $i.first =function (){
       for (var key in $i.c$)
           return $i.c$[key];
    };
    $i.sweep = function(action, param){
        for(var key in $i.c$){
           action($i.c$[key], param);
        }
    };
    $i.each = this.sweep;
};

j$.ui.Modal=function(id, service, actionCallback) {
    var $this = this;
    if (service)
       Object.preset($this, service);
       //this.properties=(helper)?helper:{fixed:false};
    this.callback = actionCallback;
    //this.fixed = fixed(helper);
    $this.inherit = j$.ui.Page.Designer.modal;
    var ws ={buttons:{}, controller:{}}
    var callback=function(key, action){
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
           for(var key in actionController){
               ws.buttons[key]=CONFIG.action(key);
               var action=new callback(key, actionController[key]);
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

    this.show= function(service, actionCallback) {
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

j$.Message =  new j$.ui.Modal("Message");
j$.Confirme = new j$.ui.Modal("Confirme",{
                 text: '<p><strong>MUDAR O TEXTO:</strong></p>j$.Confirme.text</br>ou</br>{text:"Meu texto"} no método show</p></br>'
                      +'<p><strong>MUDAR O TÍTULO:</strong></p>j$.Confirme.title</br>ou</br>{title:"Meu texto"} no método show</p></br>'
                      +'<p><strong>Experimente:</strong></p>j$.Confirme.show({title:"Meu texto", text:"Meu texto"}, function(action){alert(action);})</p></br>'
              , title: "Título- Mude em j$.Confirme.title"
              , fixed:true // indica que não terá o botão de fechar do modal
            , actionController:{
                   no:function(){return false;}
                , yes:function(){return false;}
              }
});

j$.Alert = new j$.ui.Modal("Alert",{
                 text: '<p><strong>MUDAR O TEXTO:</strong></p>j$.Alert.text</br>ou</br>{text:"Meu texto"} no método show</p></br>'
                      +'<p><strong>MUDAR O TÍTULO:</strong></p>j$.Alert.title</br>ou</br>{title:"Meu texto"} no método show</p></br>'
                      +'<p><strong>Experimente:</strong></p>j$.Alert.show({title:"Meu texto", text:"Meu texto"}, function(action){alert(action);})</p></br>'
              , title: "Título- Mude em j$.Alert.title"
            , actionController:{
                     ok:function(){return false;}
              }
});

j$.ui.adapterFactory = function(adapter){
   var $this=this;
   this.services=adapter.services;
   this.design=adapter.design;
   this.load = function(){ // Fazer carga dos JS
       for (var key in adapter.services){
           var item = adapter.services[key];
           item.key = key;
           if (!item.partial && !item.url){
              if (item.crud)
                 System.using(CONFIG.CRUD.CONTEXT+key+".js");
              else if (item.query)
                 System.using(CONFIG.QUERY.CONTEXT+key+".js");
           }
       }
   }
   this.getService=function(key){
      if ($this.services[key])
         return $this.services[key];
      else
         return {key:key};
   }
   this.load();
};
