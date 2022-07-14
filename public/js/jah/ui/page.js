/* j$.Service - Eh o template do serviço, comtém as informações a respeito de um serviço desejado
                pode ser do tipo: 'crud', 'query' ou 'user'(criado pelo usuário)
   j$.Page: Cria a página que expõe o serviço (os elementos html)
                pode ser do tipo: 'form' ou 'modal'
   Adapter   : Contém informações declaradas na aplicação que são usadas no 'Menu', 'Tabs' e 'j$.Service'. Útil para evitar redundância nas declarações
               Exmeplo: 'title', 'resouce' e outras informações serão aproveitadas em ambos.
 
   1.Através de j$.Service é criado o template do serviço
   2.Em algum ponto da interface(geralmente pelo menu) é solicitado a exposição desse serviço.
   3.O método '.init(idContainer, modal)' do serviço deve ser chamado
   4.Neste método (.init) é solicitado j$.Page que cria a página através do método '.create(service,modal)'
   5.Atavés do paramametro 'modal' o método sabe se é para criar um form ou um modal. A página será criada segundo as informações do 'service'
   6.Na criação página também é criado o 'actionController' para receber as ações da página(ver o fluxo no controller.js)
   service(crud, query,user) -> page(crud, modal) -> controller(external, standard)
 
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

        //@note: Factory - para criar os servicos
        j$.Service = function(){
           let items = {}
            ,  Adapter = function(adapter){
                    // Este é o adapter default do Page
                    // o cliente pode criar um próprio com a mesma assinatura 
                    let $this=this;
                    Object.preset(this, adapter);
                    this.load = ()=>{ // Fazer carga dos JS
                        for (let key in adapter.services){
                            let item = adapter.services[key];
                            item.key = key;
                            if (!item.partial && !item.url && !item.local){
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
                        $i.Fieldset = TYPE.Fieldset.create(service.fieldset);
                    else if (adpater.fieldset)
                        $i.Fieldset = TYPE.Fieldset.create(adpater.fieldset);
                    else // cria um fieldset padrão com código e descrição
                        $i.Fieldset = TYPE.Fieldset.create(TYPE.Fieldset.build($i.id));
                    
                    // DEFINIR os métodos default  
                    if ($i.init==undefined){
                        $i.init=function(idTarget, modal, param){
                            if (idTarget)
                                $i.Interface.container=idTarget;
                            j$.Page.create($i, modal).init();
                        };
                    }
                    if ($i.autoRequest==undefined  && j$.Ext.isCrud($i)){
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
                    Object.preset(this,j$.Service.adapter.get(key)) // Vai copiar todas as propriedades do adapter.services que não exite no service
                    this.onclick = this.Parent.actionController+'.child("'+key+'",' + txGetValue+ ')';
                    if (j$.Ext.isUndefined(this.modal))
                        this.modal = CONFIG.CHILD.MODAL;
                    if (this.crud || this.query)
                        this.service = j$.Service.build(key,this);
                }    
                open(){
                    let record = this.Parent.service.Fieldset.sweep();            
                    j$.Dashboard.openItem(this, record);            
                    // this.Parent.tabs.open({key:`tab_${this.id}`
                    //                  , caption:this.caption
                    //                  ,   title: this.title
                    //                  ,  onLoad: tab=>{j$.Service.c$[this.key].init(tab.idContent)}
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
            //, Items:items
            , c$:items
            , C$:key=>{return items[key]}
            , createCrud: function(key, service){
                   return this.create(key, new Crud(j$.Service.adapter.get(key), service));
               }
            , createQuery: function(key, service){
                   return this.create(key, new Query(j$.Service.adapter.get(key), service));
               }
            , createChild: function(key, parent, service){
                    return new Child(key, parent, service);
               }
            , createAdapter: (source, adapter=Adapter)=>{ // o cliente pode informador o adapter
                    j$.Page.Adapter = new adapter(source); 
                    return j$.Page.Adapter;
               }   
            , create:(key, service)=>{
                  if (!key)
                      throw new TypeError(CONFIG.EXCEPTION.SERVICE_NULL.text);
                  if (service.constructor.name=="Object"){ //para o servicos que sao criados manualmente
                     items[key]=new CrudBase(j$.Service.adapter.get(key),service);
                  } else
                     items[key]=service;
                  window[key] = items[key];
                  return items[key];
             }
            , build:function(key, adapter){
                  let service = items[key];
                  if (!service){
                     service = (adapter.crud)
                             ? this.createCrud(key,adapter)
                             : this.createQuery(key,adapter);
                  }
                  return service;
             }
            , adapter:function (){
                  return{
                     get:function(key){
                        return (j$.Page.Adapter)
                              ? j$.Page.Adapter.getService(key)
                              :{key:key};
                     }
                  }
              }()
           }
        }() //j$.Service
        j$.$S = j$.Service.c$;
        
        j$.Page = function(){
           let items = {}
           , frame=function(){
                let me = this
                  , items={}
                  , showbox_class=c$.ICON.SHOWBOX.CLASS //'bi bi-caret-up-fill'
                  , hidebox_class=c$.ICON.HIDEBOX.CLASS; //'bi bi-caret-right-fill';
                function slidebox(properties){
                    let self = this;
                    Object.preset(properties, {container:i$('content'), style:'slidebox_show'});
                    properties.id =System.util.getId(properties.style, properties.id);
                    Object.preset(self, properties);
                    let create=function(){
                        let idFieldset =properties.id + "_slidebox";
                        self.container.insert(`<fieldset id='${idFieldset}'>`
                                    +`<legend class='slidebox_legend' id='${self.id}_slidebox_legend'>`
                                    +`<span title='Esconder' onclick='j$.Page.Frame.toggle("${self.id}")' class='${showbox_class}' id= '${self.id}_button'></span>`
                                    + self.legend+"</legend>"
                                    + `<div id='${self.id}'></div>`
                                    +"</fieldset>");
                        self.source = i$(idFieldset);
                        self.source.stylize(self.style);
                        self.target = i$(self.id);
                        self.legend = i$(self.id+ "_slidebox_legend");
                        self.button = i$(self.id+ "_button");
                    }();
                    items[self.id]=self;
                    Object.preset(self,{toggle:()=>{j$.Page.Frame.toggle(self.id)}
                                    , show  :()=>{j$.Page.Frame.show(self.id)}});
                    self.hide=()=>{j$.Page.Frame.hide(self.id)};
                    if (properties.hide){self.hide();}
                    return self;
                }
                function framebox(properties){
                    let self = this;
                    Object.preset(properties, {container:i$('content'), style:'wrap_framebox'});
                    properties.id =System.util.getId(properties.style, properties.id);
                    Object.preset(self, properties);
                    let create=function(){
                        let idFieldset =properties.id + "_framebox";
                        self.container.insert(`<div id='${idFieldset}'>`
                                    +`<div class='wrap_framebox_legend' id='${self.id}_framebox_legend'>`
                                    +`<span title='Esconder' onclick='j$.Page.Frame.toggle("${self.id}")' class='${showbox_class}' id= '${self.id}_button'></span>`
                                    + self.legend+"</div>"
                                    + `<div class='wrap_box' id='${self.id}'></div>`
                                    +"</div>");
                        self.source = i$(idFieldset);
                        self.source.stylize(self.style);
                        self.target = i$(self.id);
                        self.legend = i$(self.id+ "_framebox_legend");
                        self.button = i$(self.id+ "_button");
                    }();
                    items[self.id]=self;
                    Object.preset(self,{toggle:()=>{j$.Page.Frame.toggle(self.id)}
                                      , show  :()=>{j$ui.Page.Frame.show(self.id)}});
                    self.hide=()=>{j$.Page.Frame.hide(self.id)};
                    if (properties.hide){self.hide();}
                    return self;
                }
                let toggle=function(id){
                    let frame = this.items[id];
                    if (frame.button.title === "Esconder")
                        this.hide(id);
                    else 
                        this.show(id);                    
                };
                let hide=function(id){
                    let frame = this.items[id];
                    frame.button.className =  hidebox_class;
                    frame.button.title = "Exibir";
                    if (frame.constructor.name=='slidebox')
                        frame.source.className = "slidebox_hide";
                    frame.target.hide();
                };
                let show=function(id){
                    let frame = this.items[id];
                        frame.button.className =  showbox_class;
                        frame.button.title = "Esconder";
                        if (frame.constructor.name=='slidebox')
                            frame.source.className = "slidebox_show";
                        frame.target.show();
                };
                return{
                      slidebox:function(properties){return new slidebox(properties)}
                    , framebox:function(properties){return new framebox(properties)}
                    , toggle:toggle
                    , show:show
                    , hide:hide
                    , items:items
                };
            }()
           ,designer= function (){          
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
                            if (j$.Ext.isObject(section)){
                                if (section[prop])              // existe o atributo
                                    value = section[prop];                
                            }else if (j$.Ext.isString(section) && prop=="clas$") // é o atributo default para o caso de vir string
                                value = section;
                            return value;    
                        }                                                         
                        for (let key in sections){                
                            _section = sections[key]
                            for (let prop in att){
                                _section[prop] =att[prop]; // garantir a existes dos atributos de att em cada section
                                if (reposit[key]){
                                    if (j$.Ext.isArray(reposit[key])) // existe a secao e a ocorrencia
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
                    if (j$.Ext.isArray(fields)){
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
                            if (j$.Ext.isArray(section)){ 
                                if (j$.Ext.isArray(section[row])) // para section=[[],...,[]]
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
                    if (j$.Ext.isArray(design.fields[0])){
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
                const Modal =function(wrap,form, fixed){
                    let _modal = this;
                    this.show = show;
                    // TODO: this.display=show;
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
                       let txFixed=(fixed)?'':"<button type='button' class='btn-close'  data-bs-dismiss='modal' aria-label='Close'>"
                                  /* +"<span aria-hidden='true'>&times;</span>" */
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
                                     +      "<div id='" +form.id+ "Footer' class='modal-footer'></div>"
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
                    this.show = show;
                     
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
                return{
                    create:page=>{
                        if (page.service.Interface.design){ // Serah feito segundo o design
                            j$.Page.Designer.design(page, page.fieldset, page.service.Interface.design);
                        }else{                              // Serah tudo no modo standard
                            //j$.Page.Designer.standard(page, page.fieldset, page.service.Fieldset);
                            let design = {fields:Object.keys(page.service.Fieldset.c$)}
                            j$.Page.Designer.classic(page, page.fieldset, page.service.Fieldset, design);
                        }
                    }
                    ,  design: (page, container, designs)=>{
                        for (let i=0; i<designs.length; i++){
                            let masterSection
                                , section = container
                                , design  = designs[i];
                            if (design.container != undefined)
                                section =i$(design.container);
        
                            if (design.frame != undefined){
                                if (frame.items[design.frame])
                                    section = frame.items[design.frame].target;
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
                                section = j$.Page.Designer[type[k]](page, section,  page.service.Fieldset, design);
                                if (!section)
                                    section = container;
                                if (k==0)
                                    masterSection = section;
                                design.id=null;
                            }
                            if (design.design)
                                j$.Page.Designer.design(page, design.design, masterSection);
                        }
                        }
                    ,  classic:(page, section, fieldset, design)=>{
                            design.clas$=Object.toLowerCase(CONFIG.DESIGN.CLASSIC);                     
                            return addSection(page, section, fieldset, design);
                        }
                    ,   inLine:(page, section, fieldset, design)=>{
                            design.clas$=Object.toLowerCase(CONFIG.DESIGN.INLINE);                    
                            Object.preset(design,{inLine:true, labelInTheSameWrap:false});    
                            return addSection(page, section, fieldset, design);
                        }              
                    ,   column:(page, section, fieldset, design)=>{
                            Object.preset(design,{clas$:Object.toLowerCase(CONFIG.DESIGN.COLUMN)
                                                ,inLine:true, labelInTheSameWrap:true, design});                    
                            return addSection(page, section, fieldset, design);                   
                        }
                    ,   line:(page, section, fieldset, design)=>{
                            let wrapLine = j$.ui.Render.line(section, design.id, 'wrap_line', design.title);
                                wrapLine.stylize(design.style);
                        }
                    , table:fields=>{}
                    , section:fields=>{}
                    , slidebox:(page, section, fieldset, design)=>{
                            return frame.slidebox({container:section, id:design.id, legend:design.title}).target;
                        }
                    , framebox:(page, section, fieldset, design)=>{
                            return frame.framebox({container:section, id:design.id, legend:design.title}).target;
                        }
                    , form:Form
                    , modal:Modal
                };
            }()
           return {
               create: function(service, modal){
                   items[service.id] = new j$.Page.Form(service, modal);
                   Object.setIfExist(service, items[service.id], ['Buttons','Alert','reset','hide','show'])
                   return items[service.id];
               }
             , c$:items
             , C$:key=>{return items[key]}
             , Designer:designer
             , Frame:frame
           };
        }(); //j$.Page
        j$.$P = j$.Page.c$;
        
        // Esse alert é da página
        j$.Page.Alert= function(){
            //let $alert = this;
            let _wrap = CONFIG.LAYOUT.ALERT_CONTENT;
            return {
                show:function(msg, alertClass, wrap=i$(_wrap)){
                    this.hide(wrap);
                    if (j$.Ext.isString(msg))
                        j$.ui.Render.alert(wrap, msg, alertClass);
                    else if (j$.Ext.isArray(msg) && msg.length === 1){
                        j$.ui.Render.alert(wrap, msg[0], alertClass);
                    }else{
                        let html='<lu>'
                        msg.forEach(function(text){html+=`<li>${text}</li>`});
                        html+='</lu>'
                        j$.ui.Render.alert(wrap, html , alertClass);
                    }
                }
            ,   error:(msg, wrap)=>{
                        j$.Page.Alert.show(msg, CONFIG.ALERT.ERROR, wrap)
                    }
            ,    info:(msg, wrap)=>{
                        j$.Page.Alert.show(msg, CONFIG.ALERT.INFO, wrap)
                    }
            , success:(msg, wrap)=>{
                        j$.Page.Alert.show(msg, CONFIG.ALERT.SUCCESS, wrap)
                    }
            ,    hide:(wrap=i$(_wrap))=>{ if (wrap) wrap.innerHTML=''}
            }
            //j$.Page.Alert.error("Meu texto de erro", i$("assuntoAlert")) // assuntoAlert é o padrão da tabs "servico"+"Alert"
            //j$.Page.Alert.info("Meu texto info"))                        // será exibido no padrão definido em CONFIG
            //j$.Page.Alert.success("Meu texto bem sucedido"))
            //j$.Page.Alert.show("Minha mensagem de alert", CLASS, idWrap) // CLASS: Veja em CONFIG
            //j$.Page.Alert.hide(idWrap))                                  // Para desaparecer o Alert    
        }(); // j$.Page.Alert
        
        j$.Page.Form=function(service, modal) {
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
                               actionController:(service.id) ?'j$.Service.c$.'+service.id+'.actionController' :''
                             , container:(service.Interface.container) ?i$(service.Interface.container) :i$(CONFIG.LAYOUT.CONTENT)
            });
            Object.preset(service.Interface,{Buttons:false});
            Object.preset(service,{
                 onSuccess:  ACTION =>{j$.Page.Alert.success(ACTION.MESSAGE.SUCCESS, $i.Alert.id)}
               ,   onError:  ACTION =>{j$.Page.Alert.error(ACTION.MESSAGE.ERROR, $i.Alert.id)}
               , onFailure: response=>{j$.Page.Alert.error(response.msg, $i.Alert.id)}
            });
            if (!service.Interface.id)
                service.Interface.id = service.id.toFirstLower();
            // se for modal, herda de um template próprio para modal
            this.inherit = (modal) ?j$.Page.Designer.modal 
                                   :j$.Page.Designer.form;
        
            $i.inherit($i.container, service.Interface);
        
            if (!service.Interface.Buttons)
                service.Interface.Buttons = DEFAULT_BUTTON_PRESET();
        
            if (service.child){
               $i.child = new System.Observer($i);
              // $i.child={} // Contém os objetos filhos - no caso para a página
                             // no service.child tem os dados declarados para criar os filhos, no page.child, os objetos criados.
               for (let key in service.child){
                   $i.child.add(key, new j$.Service.createChild(key,$i, service.child[key]))
               }
               service.Interface.Buttons.CHILD = {value:CONFIG.ACTION.SUBVISION.VALUE}
               service.Interface.Buttons.CHILD.submenu=$i.child;
            }
        
            $i.Buttons = new j$.Page.Buttons($i.actionController, service.Interface.Buttons, DEFAULT_BUTTON_PRESET);
            this.init= function(externalController) {
                j$.Page.Designer.create($i); // cria os fields
                let wrapButtons  = (alignButtons==c$.ALIGN.TOP) ?$i.menu :$i.footer;
                $i.Buttons.create(wrapButtons);   // cria os buttoes html  
                // if (service.Child || service.Interface.List) // cria um tab para comportar o list e|ou child
                //     $i.tabs = j$.Dashboard.Tabs.create(`${$i.form.id}Tabs`, $i.footer.id); 
                // TYPE.Formatter.Init(service.Interface);              // inicializa as máscaras (já é inicializado qdo a mask é redenrizado em cada input)
                if (service.Interface.List){
                   if (service.Interface.List===true){service.Interface.List={};}
                   $i.List = new j$.Page.Grid($i); // cria o grid
                }
                if (service.Resource)
                   service.Resource=null;
                if (externalController)
                   service.actionController = externalController
                else
                   service.actionController =  j$.Controller.create(service);
                $i.show();   
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
                          // if (alert) 
                           j$.Page.Alert.show( [`${inFocus}${msg}`], _class, alert);
                        }else
                             $i.Alert.hide();
                    }
                    ,success(msg, inFocus){$i.Alert.show(msg, CONFIG.ALERT.SUCCESS.CLASS, inFocus)}
                    ,error(msg, inFocus){$i.Alert.show(msg, CONFIG.ALERT.ERROR.CLASS, inFocus)}
                    ,hide(){j$.Page.Alert.hide(alert)}
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
                   if (text && j$.Ext.isString(text)) 
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
        }; // j$.Page.Form
        
        j$.Page.Modal=function(id, service, actionCallback) {
            let $this = this;
            if (service)
               Object.preset($this, service);
               //this.properties=(helper)?helper:{fixed:false};
            this.callback = actionCallback;
            //this.fixed = fixed(helper);
            $this.inherit = j$.Page.Designer.modal;
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
                   $this.Buttons = new j$.Page.Buttons(ws.controller, ws.buttons);
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
                   $this.show();  
            };
        }; // $.Page.Modal
        j$.Page.Grid=function(page, btn_template=CONFIG.GRID.DEFAULT){
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
        
            this.Buttons = new j$.Page.Buttons(_grid.actionController, page.service.Interface.List.Buttons, CONFIG[btn_template].GRID.preset);
        
            this.init=(Resource)=>{
                _grid.index= c$.RC.NONE;
                pager = Resource.Dataset.createPager(page.service.Interface.List);
                if (pager){
                   _grid.Designer.table();
                   _grid.paginator = new j$.Page.Navigator(page.form, pager , page.actionController+".List.Pager");
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
                            pager.read(function(record, row){
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
        }; //j$.Page.Grid
        
        j$.Page.Buttons=function(actionController, buttons, presetFunction){
            let _btn=this
              , wrapButtons
              , _wrap;
            Object.preset(_btn,{c$:getItems()});
           // this.c$ = this.Items;
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
                if (!button.onclick && actionController && j$.Ext.isString(actionController))
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
                for (let key in _btn.c$){
                    _btn.add(key,_btn.c$[key]);
                };
            };
        
            this.add=(key, button)=>{
                 preset(key,button, _wrap);
                 button.element = j$.ui.Render.button(wrapButtons, button);
                 if (actionController && j$.Ext.isObject(actionController) && actionController[button.key])
                     $(button.element).click(actionController[button.key]);
                 submenu(button);
            };
            this.button = key=>{
                let b$ =_btn.c$[key];
                return {
                      show: ()=>{b$.element.show()}                    
                   ,  hide: ()=>{b$.element.hide()}
                   ,toggle: ()=>{b$.element.toggle()}
                   ,   get: ()=>{return b$.element.get()}                    
                   ,   set: value=>{
                            b$.value=value;
                            b$.element.innerText=value;
                        }
                }
            }
            this.format=parent=>{
                let html='';
                for (let key in _btn.c$){
                    let button=_btn.c$[key];
                    preset(key.toLowerCase(),button, parent);
                    html+=j$.ui.Render.formatButton(button);
                };
                return html;
            };
        }; // j$.Page.Buttons
        
        // Cria o egar para fazer paginação
        // pager (): é o que controla data, faz o calculos de pagina e devolve os registro para exibir na página
        // j$.Page.Navigator: É o componente que cria os elementos visuais de html para navegação e recebe a ações para o controller
        j$.Page.Navigator=function(parent, pager , actionController){
            let _pager=this;
            let _wrap;
        
            Object.preset(_pager,{clas$:CONFIG.PAGER.CLASS, pager:pager});
            function parse(values){
                let properties = values;
                 if (j$.Ext.isString(properties))
                     properties = {value:properties, key:properties};
                 Object.preset(properties, {key:properties.value});
        
                 properties.caption =properties.value;
                 properties.method =CONFIG.synonym(properties.key.toLowerCase());
                 if (properties.method===CONFIG.ACTION.BACK.KEY){
                     properties.caption =  j$.ui.Render.icon(c$.ICON.PREVIUS); 
                 }else if (properties.method===CONFIG.ACTION.NEXT.KEY){
                     properties.caption = j$.ui.Render.icon(c$.ICON.NEXT);
                 }else if (properties.method===CONFIG.ACTION.FIRST.KEY){
                     properties.caption =j$.ui.Render.icon(c$.ICON.FIRST);
                 }else if (properties.method===CONFIG.ACTION.LAST.KEY){
                     properties.caption = j$.ui.Render.icon(c$.ICON.LAST);
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
        };// j$.Page.Navigator
        j$.Message = new j$.Page.Modal("Message");
        //@Teste: j$.Message.show({title:"Meu Titulo", text: "Conteudoi da mensagem"});
        
        j$.Confirm = new j$.Page.Modal("Confirme",{
                         text: '<p><strong>MUDAR O TEXTO:</strong></p>j$.Confirme.text</br>ou</br>{text:"Meu texto"} no método show</p></br>'
                              +'<p><strong>MUDAR O TÍTULO:</strong></p>j$.Confirme.title</br>ou</br>{title:"Meu texto"} no método show</p></br>'
                              +'<p><strong>Experimente:</strong></p>j$.Confirme.show({title:"Meu texto", text:"Meu texto"}, function(action){alert(action);})</p></br>'
                      , title: "Título- Mude em j$.Confirme.title"
                      , fixed:true // indica que não terá o botão de fechar do modal
                    , actionController:{
                           no:()=>{return false;}
                        , yes:()=>{return false;} //é false porque informa que a janela será fechada
                      }
        }); // j$.Confirm 
        //@Teste:  j$.Confirm.show();
        
        // Esse é o alert como modal
        j$.Alert = new j$.Page.Modal("Alert",{
                         text: '<p><strong>MUDAR O TEXTO:</strong></p>j$.Alert.text</br>ou</br>{text:"Meu texto"} no método show</p></br>'
                              +'<p><strong>MUDAR O TÍTULO:</strong></p>j$.Alert.title</br>ou</br>{title:"Meu texto"} no método show</p></br>'
                              +'<p><strong>Experimente:</strong></p>j$.Alert.show({title:"Meu texto", text:"Meu texto"}, function(action){alert(action);})</p></br>'
                      , title: "Título- Mude em j$.Alert.title"
                    , actionController:{
                             ok:()=>{return false;}
                      }
        }); // j$.Alert 
        //@Teste: j$.Alert.show()
        
        
        /*@note: 
            ActionController: faz a chamada aos métodos do recurso (RESOURCE)
            ResponseController:
                               -> Recebe as respostats do servidor (callback dos métodos http enviados ao recurso)
                               -> Recebe os eventos para atualizar interface do usuário (filtro, sort, edit, etc...)
                               -> Controla o fluxo de saída para atualizar interface do usuário (repassa para -> UpdateController)
            ResourceRequest: Faz requisição de serviços do servidor
                           ResourceRequest: Chama uma URL
                           LocalResourceRequest: Simula chamada remota
            UpdateController:
                           - Faz as interações entre o objetos FIELDSET, DATASET E INTERFACE.LIST para efetuar as atualizações dos mesmos.
            Dataset: Mantém os dados do lado cliente
         
            Ponto de enrtada para a interface do usuário
            FLUXO
            UI -> ActionController ->
                  :Se precisa fazer atualizações-> ResourceRequest -> ResponseController -> UpdateController
                  :Se não precisa -> ResponseController -> UpdateController
         */
        j$.Controller = function(){
            let items = {};
            //@note: ActionController: faz a chamada aos métodos do recurso (RESOURCE)
            function ActionController(ResponseController){
                let _me = this;
                let Resource = ResponseController.Resource;
            
                Object.preset(_me, {remove, save:update, get, filter, sort, search});
                Object.setIfExist(_me, ResponseController,['edit','insert','back','print','List','child', 'refresh']);
            
                function filter(event, key, value){
                    if (event.ctrlKey && event.button==c$.MOUSE.BUTTON.LEFT){
                        let criteria = ResponseController.service.Fieldset.filter.toggle(key, value)
                        Resource.filter(criteria);
                    }
                }
            
                function sort(key){
                Resource.orderBy(ResponseController.service.Fieldset.orderBy(key));
                }
            
                function get(){
                    if (ResponseController.service)
                    Resource.get();
                }
            
                function search(){
                    let parm;
                    if (ResponseController.service)
                    // pegar só os campos que foram preenchidos
                    parm= ResponseController.service.Fieldset.filled();
                    Resource.search(parm);
                }
            
                function remove(cell){
                    let goAhead = true;
            
                    if (ResponseController.service.beforeDelete) // Há algum callback para executar antes da exclusao?
                        goAhead=ResponseController.service.beforeDelete(ResponseController.UpdateController);
            
                    if (goAhead){
                        let confirmed=false;
                        j$.Confirm.show({title:"Exclusão de Registro", text:"Confirma a exclusão de registro?"}
                                , action =>{
                                    if (action=="yes"){
                                        let idxList = _me.List.getPosition(cell); // Idenifica a posição(linha) no grid (table)
                                        let recordRow =(_me.List.Pager.absolutePosition(idxList)); // Posicao no dataset(array)
                                        let id = Resource.Dataset.id(recordRow);
                                        Resource.remove(id, recordRow);
                                    }
                                });
                    }
                }
            
                function update(){
                    // pegar um 'record' com os campos da tela. Esse é o conteúdo que será enviado no body da requisicao ao servidor
                    let record    = ResponseController.UpdateController.record() 
                    , newRecord = ResponseController.isNewRecord()
                    if (ResponseController.UpdateController.validate(newRecord)){ // fazer a validacao
                    if (newRecord)
                        Resource.post(record);
                    else{
                        ResponseController.service.updating=true;
                        let id = Resource.Dataset.id(Resource.Dataset.position);
                        Resource.put(id, record, Resource.Dataset.position);
                    }
                    }
                    // else {
                    //     if (ResponseController.service.onError)
                    //         ResponseController.service.onError(ResponseController.isNewRecord()?CONFIG.ACTION.NEW:CONFIG.ACTION.SAVE);
                    // }
                }
            } //ActionController    
            function ResponseController($service){
                let _me = this
                  , EDITED = false
                  , NEW_RECORD =false
                  , BUTTONS;
                const initialized = function(){
                     _me.service = $service;
                     _me.ResponseHandler = new ResponseHandler(_me);
                     if (j$.Ext.isDefined(_me.service.resource)){
                         if (j$.Ext.isString(_me.service.resource))
                             _me.service.resource ={name: _me.service.resource.toFirstLower() };
                     }else
                         _me.service.resource ={name: _me.service.id.toFirstLower()};
             
                     _me.Resource =  j$.Resource.create(_me.service.resource, _me.ResponseHandler);
                     _me.service.Resource =  _me.Resource;
             
                     BUTTONS = function(buttons){
                         // Carregar os elementos(button) para cria as constantes com o botões (Exemplo: BUTTONS.SAVE, BUTTONS.EDIT)
                         let values={};
                         for (let key in buttons)
                             values[key.toUpperCase()]=buttons[key].element;
                         return values;
                     }(_me.service.page.Buttons.c$);
             
                     Object.preset(_me,{edit, insert, back, sort, print, UpdateController:null, child, filter});
                     Object.setIfExist(_me,_me.service.page,'List');
             
                     init();
                     hide(['PRINT','INSERT','SAVE','CHILD']);
                     return true;
                 }()
             
                this.isNewRecord = ()=>{return NEW_RECORD};
             
                function print(){
                   let r3port=window.open("report.html", _me.service.id ,'toolbar=no,location=no,directories=no,status=no,menubar=yes,scrollbars=yes,resizable=yes, height=1024,width=1280, fullscreen=yes');
                }
             
               function sort(sort){
                  _me.service.Fieldset.sort.clear();
                  init();
               }
             
               //@example: criteria={idAssunto:2}
               function filter(criteria){
                   _me.service.Fieldset.filter.clear();
                   if (criteria){
                      for (let key in criteria){
                         let field = _me.service.Fieldset.c$[key];
                         field.filterToggle(true); // exibir icone
                      }
                   }
                   init();
               }
             
               function init(){
                   hide(['BACK', 'SAVE','CHILD']);
                   EDITED    = false;
                   NEW_RECORD=false;
                   if (_me.UpdateController)
                       _me.UpdateController.refresh();
               }
             
               function edit(cell){
                     _me.service.updating=false;
                     hide(['GET','INSERT']);
                     NEW_RECORD=false;
                     EDITED    =true;
                     _me.UpdateController.reset();
                     let idxListEdited = _me.List.getPosition(cell);
                     let recordRow = _me.Resource.Dataset.Pager.absolutePosition(idxListEdited);
                     _me.UpdateController.edit(recordRow);
               }
               function child(key){ // key é o indicador da chave que contém o filho
                   _me.service.page.child.c$[key].open();
               }
             
               function back(){ (EDITED)?init():history.back();}
             
               function insert(){
                     hide(['GET','INSERT','PRINT','CHILD']);
                     EDITED    =true;
                     NEW_RECORD=true;
                     _me.UpdateController.reset();
                     if (_me.service.afterInsert)
                         _me.service.afterInsert(_me.UpdateController);
               }
             
               function hide(buttons){
                    for (let key in BUTTONS)
                        (buttons.has(key))?BUTTONS[key].hide():BUTTONS[key].show();
               };
               function ResponseHandler(parent){
                   this.get = function(response) { // os recursos serao criados no primeiro GET
                     if (!j$.Ext.isDefined(parent.UpdateController))
                        parent.UpdateController = new UpdateController(parent.service);
             
                     if (parent.service.initialize)
                         parent.service.initialize(parent.UpdateController);
                     init();
                     // if (response)
                     //     init({});
                     // else
                     //     init({hideAlert:true});
                  };
                  this.remove= function(response, recordRow) {
                      let rowDeleted = parent.UpdateController.remove();
                      if (_me.List.index===rowDeleted)
                         init();
                      else if (_me.List.index>rowDeleted) 
                         _me.List.index--;
                  };
                  this.post= function(record, recordRow) {
                      parent.UpdateController.insert(record, recordRow);
                      NEW_RECORD=false;
                      EDITED    =true;
                  };
             
                  this.put= function(record, recordRow) {
                      let idxListEdited=_me.List.index;
                      let pagEdited=_me.List.Pager.number();
             
                      let pos = _me.Resource.Dataset.Pager.pagePosition(recordRow); // esse controle só faz sentido para uma atualização externa.
                      if (pagEdited==pos.page){     // é a mesma página
                         let rowEdit = (pos.index==idxListEdited && !_me.service.updating) ?recordRow :null;
                         if (pos.index!=idxListEdited) // Não é a mesma linha do grid que está sendo editada tb está sendo atualizado
                            idxListEdited = pos.index
                         parent.UpdateController.update(idxListEdited,record, rowEdit);
                      } else 
                          parent.UpdateController.update( c$.RC.NONE,record);
             
                      NEW_RECORD=false;
                      EDITED    =true;
                      _me.service.updating=false;
                  };
             
                  this.filter= function(criteria) {parent.filter(criteria)}
                  this.sort  = function(sort) { parent.sort(sort)}
             
                  this.failure= function(response) {
                    if (parent.service.onFailure)
                       parent.service.onFailure(response);
                  };
                };
            } //ResponseController   
            function UpdateController(service){
                let _me = this
                  , Resource  = service.Resource;
                  // , Interface = service.Interface;
              
                const initialized=function(){
                    Object.preset(_me, {remove, update, edit, insert, validate, record:createRecord, refresh, reset, form:i$(service.Interface.id)});
                    if (!Resource.Dataset.empty)
                       service.Fieldset.bindColumns(Resource.Dataset.Columns);
                    return true;
                }();
              
                function reset(){service.page.reset()}
              
                function refresh(){
                   if (service.page.List)
                      service.page.List.init(Resource);
                   else
                      _me.reset();
                }
              
                function edit(recordRow, record){
                      if (!record)
                         record = Resource.Dataset.get(recordRow);
                      service.Fieldset.edit(record);
                      if (service.page.child)
                         service.page.child.notify({action:CONFIG.ACTION.EDIT, record:record});
                      return record;
                }
              
                function remove(){
                      let idxList = -1;
                      if (service.page.List)
                         idxList = service.page.List.Detail.remove();
                      if (service.onSuccess)
                          service.onSuccess(CONFIG.ACTION.REMOVE);
                      return idxList;
                }
              
                function insert(record, recordRow){
                   _me.edit(recordRow, record);
                   if (service.page.List)
                       service.page.List.Detail.add(record);
                   if (service.onSuccess)
                      service.onSuccess(CONFIG.ACTION.NEW);
                   return recordRow;
                }
              
                function update(idxList, record, recordRow){
                    service.Fieldset.populate(record);
                    if (service.page.List && idxList !=  c$.RC.NONE)
                        service.page.List.Detail.update(idxList+1, record);
                    if (recordRow)
                       edit(recordRow);
                    if (service.onSuccess)
                          service.onSuccess(CONFIG.ACTION.SAVE);
                }
              
                function validate(newRecord){
                      let record = this.record()
                        , error  =!service.Fieldset.validate();
                      if (service.validate && !error)
                          error=!service.validate(_me, record, newRecord);
              
                      if (error && service.onError)
                            service.onError( (newRecord) ?CONFIG.ACTION.NEW :CONFIG.ACTION.SAVE);
                      return !error;
                }
              
                function createRecord(){
                      return service.Fieldset.createRecord();
                }
            } //UpdateController      
            return{
                create(service){
                         items[service.id] = new ActionController(new ResponseController(service));
                     return items[service.id];
                }
              , get:key=>{return items[key];}
              //, Items:items
              , c$:items
              , C$:key=>{return items[key];}
            };
        }(); // j$.Controller
        j$.$C=j$.Controller.c$;
        
        /* @REVIEW:
           o ideal era incluir, atualizar e excluir no Dataset
           o Dataset deveria ser esperto para se manter atualizado com RESOURCE (fazer as chamadas para atualizar o recurso)
           Tipo: Alterou uma coluna de uma linha no Dataset, ele chamaria os métodos HTTP correspondes para atualizar no servidor.
               - Assim, ficaria mais simples porque o cliente passaria apenas a atualizar o Dataset
        */
        
        j$.Dashboard = function(){
            let idContent=CONFIG.LAYOUT.CONTENT
             // , idToolbar='toolbar';
        
            return{
                init: properties=>{
                    j$.Dashboard.Factory = (properties.designer && properties.designer.factory) 
                                         ? j$.Dashboard[properties.designer.factory] 
                                         : j$.Dashboard.Menubar
                    j$.Dashboard.Factory.create();
                    j$.Dashboard.Service.init();
                    if (properties.services && properties.designer)
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
                            j$.Dashboard.Service.openPartial(item, null, record);  
                        else if (item.modal){
                            j$.Service.c$[item.key].init(null, item.modal, record);
                        } else
                            j$.Dashboard.Service.delegateTo(item, null, record); 
                    }
            }
            , idContent:idContent
            }
        }(); // j$.Dashboard
        
        j$.Dashboard.Service=function(){
            let tabs
              , idContent='root'
              , ftmKey = (service) =>{return "tab_"+service.Parent.key+'_'+service.key}
            return{
                  init: ()=>{ tabs = j$.Dashboard.Tabs.create(j$.Dashboard.Service.idContent,j$.Dashboard.idContent) }
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
        }(); // j$.Dashboard.Service
      
        j$.Dashboard.Menubar=function(){
            let menubar
              , _c$ = CONFIG.MENU.OPTIONS[CONFIG.MENU.PARSER.toUpperCase()] // design 
              , _idContent= _c$.ID
            const initialized = function(){
                i$(j$.Dashboard.idContent).className =_c$.CLASS.WRAP;
                i$(_idContent).className = _c$.CLASS.MENU;
             /*    for (let key in CONFIG.MENU.OPTIONS){ 
                    let option =  CONFIG.MENU.OPTIONS[key]
                    if (key != CONFIG.MENU.PARSER.toUpperCase())          
                        i$(option.ID).remove();                    
                } */
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
                    if (Services && design){
                        for (let key in design){
                            let menu = design[key];
                            if (j$.Ext.isArray(menu))
                                menu = {items:design[key]};
                            Object.preset(menu, {key:key, caption:key});
                            j$.Dashboard.Menubar.bindItems(menu, Services);
                        }
                    }
                }
            ,  create:function(content=_idContent){
                       initialized();
                       menubar = j$.Dashboard.Menu.create(content)
                    }
            , addMenu:function(menu){return menubar.addMenu(menu)}
            , getMenu:function(menu_key){ return menubar.getMenu(menu_key)}
            ,  render:function(menu){ menubar.render()}
            , idContent:function(id){
                    if (id)
                        _idContent=id
                    return _idContent    
                } 
            }
        }(); // j$.Dashboard.Menubar
        
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
                        Ajax.Updater( idContent, url, {method: 'get', parameters: '', onComplete:complete});
                    }
                }
            };
        }(); // j$.Dashboard.Open
        
        j$.Dashboard.Tabs = function(){
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
                            let linkClose =(_tab.fixed)?''
                                          :`<a class='${CONFIG.TAB.CLASS.CLOSE}' href="javascript:j$.Dashboard.Tabs.c$.` 
                                          + `${_tab.parent.key}.close('${_tab.key}');">`
                                          +j$.ui.Render.icon(c$.ICON.CLOSE)                                          
                                          +"</a>";              
                            return `<span class='${CONFIG.TAB.CLASS.TITLE}' onmouseover='j$.Dashboard.Tabs.HANDLE.onmouseover(this);' onmouseout='j$.Dashboard.Tabs.HANDLE.onmouseout(this);' id='tab_link_`+ this.key+"'>"
                                +`<a class='${CONFIG.TAB.CLASS.TITLE}' id='link_` + _tab.key +  "' " 
                                + "href=\"javascript:j$.Dashboard.Tabs.c$." + _tab.parent.key + ".activate('" + _tab.key + "');\" >"
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
                    if (idTabs && idContent){
                        tabs[idTabs] = new Root(idTabs, idContent);
                        if (!j$.Dashboard.Tabs.root){
                            j$.Dashboard.Tabs.root = tabs[idTabs]
                            j$.$T = j$.Dashboard.Tabs.root.c$;
                        }
                        return tabs[idTabs];
                    }    
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
        }(); // j$.Dashboard.Tabs 
        
        j$.Dashboard.Menu = function(){ // factory
            let items = {}
              , _parser = CONFIG.MENU.PARSER
              , _option = CONFIG.MENU.OPTIONS[_parser.toUpperCase()]
              , Designers={
                    menubar:function(){
                        return{
                        format (properties){
                                let attClass = '', attDropdown = '', attDropdownUl =''
                                  , attIcon = j$.ui.Render.icon(properties.icon)  
                                  , attHint = (properties.title)? 'title="' + properties.title + '"' : '';
                                if (properties.active){
                                    attClass='class="active"';
                                    properties.Root.active=true;
                                }
                                if (properties.length>0){
                                    attClass  = 'class="nav-item dropdown"';
                                    attDropdown = 'class="nav-link dropdown-toggle" data-bs-toggle="dropdown" '
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
                                let attIcon=j$.ui.Render.icon(properties.icon)
                                  , attClass = 'menu mb-0'  
                                  , attHint = (properties.title)? 'title="' + properties.title + '"' : '';
                                if (properties.active){
                                    attClass += ' active';
                                    properties.Root.active=true;
                                }                               
                                if (properties.length>0){ //o menu      
                                    return `<li class="${attClass}"  ${attHint}>`
                                        +`<a class="btn btn-toggle dropdown-toggle collapsed" ` 
                                        + formatLink(properties)
                                        +` data-bs-toggle="collapse" data-bs-target="#${properties.id}_target" aria-expanded="false">`
                                        +    attIcon+properties.caption
                                        +'</a>'
                                        +`<div id="${properties.id}_target" class="collapse" style=""><ul id="${properties.id}"  class="sub-menu"></ul></div>` //sub-menu collapse
                                        + '</li>';
                                } else{ // as opcoes do menu entram aqui   
                                    if (attIcon.isEmpty() && properties.Parent.Parent)
                                        attIcon='<i class="bi bi-chevron-right"></i>';
                                    return `<li class="sub-menu"><a id="${properties.id}" ${attHint} ${formatLink(properties)}>`
                                                +attIcon                                               
                                                +properties.caption
                                        + '</a></li>';
                                }                
                        }
                        , createContainer(idContent){
                            let id = idContent+'Root';
                            $(`#${idContent}`).append(`<a id="brand" >
                                                        <span class="fs-5 fw-semibold ms-1">Sistema</span>
                                                        <i class="bi bi-list" style="font-size: 1.5rem; color: black;" data-bs-toggle="collapse" data-bs-target="#${id}"></i>
                                                      </a>`);     
                            $(`#${idContent}`).append(`<ul id='${id}' class="list-unstyled ps-0 collapse show">`);
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
                    attLink += "'";
                }                
                return attLink;
            }
            , Base=function(inheritor, properties){
                let _base = this;
                this.inherit=System.Node;
                this.inherit(inheritor, properties);
                this.render = ()=>{
                    $('#'+_base.Parent.id).append(j$.Dashboard.Menu.Designer.format(_base));
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
                        if (j$.Ext.isString(properties)){ // veio apenas o caption
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
                            if (j$.Ext.isObject(items) || (j$.Ext.isString(items) && !items.isEmpty())){
                                if (items.items)
                                return _base.submenu.addMenu(items)   //adiciona o menu
                                                    .add(items.items);//adiciona o submenu
                                else
                                return _base.submenu.addMenu(items);                  
                            }else if (j$.Ext.isArray(items)){
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
                            if (j$.Ext.isObject(items))
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
                    $('#'+_base.Parent.id).append(j$.Dashboard.Menu.Designer.format(_base));
                    if (_base.onClick)
                        $("#"+_base.id).click(_base.onClick);
                    _base.submenu.render();
                };
            } // Base    
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
                    return j$.Dashboard.Menu.Designer.createContainer(idContent);
                };
            }   
            // TODO: está sem uso no framework - mas é interessante para a criação de um menu
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
        }(); //j$.Dashboard.Menu  
        
        //export {j$.Service, j$.Page, j$.Message, j$.Confirm, j$.Alert, j$.Controller, j$.Dashboard};