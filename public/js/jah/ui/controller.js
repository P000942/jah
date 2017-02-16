/*
 * ActionController: faz a chamada aos métodos do recurso (RESOURCE)
  * ResponseController:
 *                    -> Recebe as respostats do servidor (callback dos métodos http enviados ao recurso)
 *                    -> Recebe os eventos para atualizar interface do usuário (filtro, sort, edit, etc...)
 *                    -> Controla o fluxo de saída para atualizar interface do usuário (repassa para -> UpdateController)
 * ResourceRequest: Faz requisição de serviços do servidor
 *                ResourceRequest: Chama uma URL
 *                LocalResourceRequest: Simula chamada remota
 * UpdateController:
 *                - Faz as interações entre o objetos FIELDSET, DATASET E INTERFACE.LIST para efetuar as atualizações dos mesmos.
 * Dataset: Mantém os dados do lado cliente
 *
 * Ponto de enrtada para a interface do usuário
 * FLUXO
 * UI -> ActionController ->
 *       :Se precisa fazer atualizações-> ResourceRequest -> ResponseController -> UpdateController
 *       :Se não precisa -> ResponseController -> UpdateController
 */

j$.ui.Controller = function(){
    var items = {};
    return{
        create:function(service){
             //if (!items[service.id])
                 items[service.id] = new ActionController(new ResponseController(service));
             return items[service.id];
        }
      , get:function(key){return items[key];}
      , Items:items
      , c$:items
      , C$:function(key){return items[key];}
    };
}();
j$.$C=j$.ui.Controller.c$;
/* REVIEW:
   o ideal era incluir, atualizar e excluir no Dataset
   o Dataset deveria ser esperto para se manter atualizado com RESOURCE (fazer as chamadas para atualizar o recurso)
*/

function ActionController(ResponseController){
  // ActionController: faz a chamada aos métodos do recurso (RESOURCE)
  var SELF = this;
  var Resource = ResponseController.Resource;

  Object.preset(SELF, {remove:remove, save:update, get:get, filter:filter, sort:sort, search:search});
  Object.setIfExist(SELF, ResponseController,['edit','insert','back','print','List','child', 'refresh']);

  function filter(event, key, value){
        if (event.ctrlKey && event.button==MOUSE.BUTTON.LEFT){
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
      var parm;
      if (ResponseController.service)
         // pegar só os campos que foram preenchidos
         parm= ResponseController.service.Fieldset.filled();
      Resource.search(parm);
  }

  function remove(cell){
        var goAhead = true;

        if (ResponseController.service.beforeDelete){ // Há algum callback para executar antes da exclusao?
           goAhead=ResponseController.service.beforeDelete(ResponseController.UpdateController);
        }

        if (goAhead){
           let confirmed = confirm("Confirma solicitação de exclusão?");
           if (confirmed){
               let idxList = SELF.List.getPosition(cell); // Idenifica a posição(linha) no grid (table)
               let recordRow =(SELF.List.Pager.absolutePosition(idxList)); // Posicao no dataset(array)
               let id = Resource.Dataset.id(recordRow);
               Resource.remove(id, recordRow);
           }
        }
  }

  function update(){
      // pegar um 'record' com os campos da tela. Esse é o conteúdo que será enviado no body da requisi ao servidor
      var record=ResponseController.UpdateController.record();
      // fazer a validacao
      let newRecord = ResponseController.isNewRecord()
      if (ResponseController.UpdateController.validate(newRecord)){
         if (newRecord){
             Resource.post(record);
         }else{
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
}

function ResponseController($service){
   var SELF = this;
   this.service = $service;
   this.ResponseHandler = new ResponseHandler(SELF);
   if (dataExt.isDefined(SELF.service.resource)){
       if (dataExt.isString(SELF.service.resource))
          SELF.service.resource ={name: SELF.service.resource.toFirstLower() };
   }else
       SELF.service.resource ={name: SELF.service.id.toFirstLower()};

   SELF.Resource =  j$.Resource.create(SELF.service.resource, SELF.ResponseHandler);
   SELF.service.Resource =  SELF.Resource;

   var EDITED = false;
   var NEW_RECORD =false;

   var BUTTONS = function(buttons){
       // Carregar os elementos(button) para cria as constantes com o botões (Exemplo: BUTTONS.SAVE, BUTTONS.EDIT)
       var values={};
       for (var key in buttons)
           values[key.toUpperCase()]=buttons[key].element;
       return values;
   }(SELF.service.page.Buttons.Items);

   Object.preset(SELF,{edit:edit, insert:insert, back:back, sort:sort, print:print, UpdateController:null, child:child, filter:filter});
   Object.setIfExist(SELF,SELF.service.page,'List');

   this.isNewRecord = function(){return NEW_RECORD;};

   init();
   hide(['PRINT','INSERT','SAVE','CHILD']);

   function print(){
      r3port=window.open("report.html", SELF.service.id ,'toolbar=no,location=no,directories=no,status=no,menubar=yes,scrollbars=yes,resizable=yes, height=600,width=800, fullscreen=yes');
   }

  function sort(sort){
     SELF.service.Fieldset.sort.clear();
     init();
  }

  //criteria={idAssunto:2}
  function filter(criteria){
      SELF.service.Fieldset.filter.clear();
      if (criteria){
         for (let key in criteria){
            let field = SELF.service.Fieldset.Items[key];
            field.filterToggle(true); // exibir icone
         }
      }
      init();
  }

  function init(options){
      hide(['SAVE','CHILD']);
      EDITED = false;
      NEW_RECORD=false;
      if (SELF.UpdateController)
          SELF.UpdateController.refresh(options);
  }

  function edit(cell){
        SELF.service.updating=false;
        hide(['GET','INSERT']);
        NEW_RECORD=false;
        EDITED=true;
        SELF.UpdateController.reset();
        let idxListEdited = SELF.List.getPosition(cell);
        let recordRow = SELF.Resource.Dataset.Pager.absolutePosition(idxListEdited);
        SELF.UpdateController.edit(recordRow);
  }
  function child(key){ // key é o indicador da chave que contém o filho
      SELF.service.page.child.c$[key].open();
  }

  function back(){ (EDITED)?init():history.back();}

  function insert(){
        hide(['GET','INSERT','PRINT','CHILD']);
        EDITED=true;
        NEW_RECORD=true;
        SELF.UpdateController.reset();
        if (SELF.service.afterActionInsert)
            SELF.service.afterActionInsert(SELF.UpdateController);
        SELF.service.page.hideAlert().hideAlert();
  }

  function hide(buttons){
       for (var key in BUTTONS){
           (buttons.has(key))?BUTTONS[key].hide():BUTTONS[key].show();
       }
  };
  function ResponseHandler(parent){
      this.get = function(response) { // os recursos serao criados no primeiro GET
        if (!dataExt.isDefined(parent.UpdateController))
           parent.UpdateController = new UpdateController(parent.service);

        if (parent.service.initialize)
            parent.service.initialize(parent.UpdateController);
        if (response)
            init({});
        else
            init({hideAlert:true});
     };
     this.remove= function(response, recordRow) {
         let rowDeleted = parent.UpdateController.remove();
         if (SELF.List.index===rowDeleted)
            init();
         else if (SELF.List.index>rowDeleted) {
            SELF.List.index--;
         }

     };
     this.post= function(record, recordRow) {
         parent.UpdateController.insert(record, recordRow);
         NEW_RECORD=false;
         EDITED=true;
     };

     this.put= function(record, recordRow) {
         let idxListEdited=SELF.List.index;
         let pagEdited=SELF.List.Pager.number();

         let pos = SELF.Resource.Dataset.Pager.pagePosition(recordRow); // esse controle só faz sentido para uma atualização externa.
         if (pagEdited==pos.page){     // é a mesma página
            let rowEdit = (pos.index==idxListEdited && !SELF.service.updating) ?recordRow :null;
            if (pos.index!=idxListEdited) // Não é a mesma linha do grid que está sendo editada tb está sendo atualizado
               idxListEdited = pos.index
            parent.UpdateController.update(idxListEdited,record, rowEdit);
         } else {
             parent.UpdateController.update(RC.NONE,record);
         }
          NEW_RECORD=false;
          EDITED=true;
          SELF.service.updating=false;
     };

     this.filter= function(criteria) {
         parent.filter(criteria)
     };
     this.sort= function(sort) {
         parent.sort(sort);
     };

     this.failure= function(response) {
       if (parent.service.onFailure)
          parent.service.onFailure(response);
     };
   };
}

function UpdateController(service){
  var SELF = this;
  var Resource = service.Resource;
  var Interface = service.Interface;
  Object.preset(SELF, {remove:remove, update:update, edit:edit, insert:insert, validate:validate, record:createRecord, refresh:refresh, reset:reset, form:i$(service.Interface.id)});

  var initialized=function(){
      if (!Resource.Dataset.empty){
         service.Fieldset.bindColumns(Resource.Dataset.Columns);
      }
  }();

  // function hideAlert(){
  //    if (service.page.alert)
  //        j$.ui.Alert.hide(service.page.alert);
  // }

  function reset(){
      service.page.reset();
  }

  function refresh(options){
     if (service.page.List)
        service.page.List.init(Resource); // já faz o reset();
     else
        SELF.reset();
     if (options.hideAlert)
        service.page.hideAlert();
  }

  function edit(recordRow){
        let record = Resource.Dataset.get(recordRow);
        service.Fieldset.edit(record);
        if (service.page.child)
           service.page.child.notify({action:CONFIG.ACTION.EDIT.KEY, record:record});
        service.page.hideAlert();
        return record;
  }

  function remove(){
        let idxList = -1;
        if (service.page.List)
           //service.page.List.Detail.remove();
           idxList = service.page.List.Detail.remove();
        if (service.onSuccess)
            service.onSuccess(CONFIG.ACTION.REMOVE);
        return idxList;
  }

  function insert(record, recordRow){
     SELF.edit(recordRow);
     if (service.page.List)
         service.page.List.Detail.add(record);
     if (service.onSuccess)
        service.onSuccess(CONFIG.ACTION.NEW);
     return recordRow;
  }

  function update(idxList, record, recordRow){
      service.Fieldset.populate(record);
      if (service.page.List && idxList != RC.NONE)
          service.page.List.Detail.update(idxList+1, record);
      if (recordRow)
         edit(recordRow);
      if (service.onSuccess)
            service.onSuccess(CONFIG.ACTION.SAVE);
  }

 function validate(newRecord){
        var record = this.record();
        var error=false;
        for(key in service.Fieldset.Items){
           var field = service.Fieldset.Items[key];
           if (field.validate){
              if (!field.validate())
                  error=true;
           }
        }
        if (service.validate && !error)
            error=!service.validate(SELF);

        if (error && service.onError)
              service.onError( (newRecord) ?CONFIG.ACTION.NEW :CONFIG.ACTION.SAVE);
        return !error;
  }

  function createRecord(){
        return service.Fieldset.createRecord();
  }
}
