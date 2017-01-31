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
/* #Refactor:
   o ideal era incluir, atualizar e excluir no Dataset
   o Dataset deveria ser esperto para se manter atualizado com RESOURCE (fazer as chamadas para atualizar o recurso)
*/

function ActionController(ResponseController){
  // ActionController: faz a chamada aos métodos do recurso (RESOURCE)
  var SELF = this;
  var ResourceRequest = ResponseController.Resource.Requester;
  var Resource = ResponseController.Resource;

  Object.preset(SELF, {remove:remove, save:update, get:get});
  Object.setIfExist(SELF, ResponseController,['edit','insert','back','print','sort','filter','List','child']);

  function get(){
      if (ResponseController.service)
         //ResourceRequest.get(Resource.url);
         ResourceRequest.get();
  }

  function search(){
      var parm;
      if (ResponseController.service)
         // pegar só os campos que foram preenchidos
         parm= ResponseController.service.Fieldset.filled();
      //ResourceRequest.get(Resource.url, parm);
      ResourceRequest.get(parm);
  }

  function remove(cell){
        var goAhead = true;

        if (ResponseController.service.beforeDelete){ // Há algum callback para executar antes da exclusao?
           goAhead=ResponseController.service.beforeDelete(ResponseController.UpdateController);
        }

        if (goAhead){
           var confirmed = confirm("Confirma solicitação de exclusão?");
           if (confirmed){
               var row = SELF.List.getPosition(cell); // Idenifica a posição(linha) no grid (table)
               var recordRow =(SELF.List.Pager.absolutePosition(row)); // Posicao no dataset(array)
               var id=ResponseController.Resource.Dataset.get(recordRow)[Resource.id];
               //ResourceRequest.remove(Resource.url, id,row);
               ResourceRequest.remove(id,row);
           }
        }
  }

  function update(){
      // pegar um 'record' com os campos da tela. Esse é o conteúdo que será enviado no body da requisi ao servidor
      var record=ResponseController.UpdateController.record();
      // fazer a validacao
      if (ResponseController.UpdateController.validate()){
         if (ResponseController.isNewRecord()){
             //ResourceRequest.post(Resource.url, record);
             ResourceRequest.post(record);
         }else{
             var id = record[Resource.id];
             //ResourceRequest.put(Resource.url, id, record);
             ResourceRequest.put(id, record);
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
   this.ResponseHandler = new ResponseHandler(SELF);
   this.inherit=j$.Resource.ResponseHandler; // informa que ResponseHandler é o constructor de ResponseController
   this.inherit($service, SELF.ResponseHandler); // inicializa ResponseController
   var EDITED = false;
   var NEW_RECORD =false;
   var rowEdited= -1;

   var BUTTONS = function(buttons){
       // Carregar os elementos(button) para cria as constantes com o botões (Exemplo: BUTTONS.SAVE, BUTTONS.EDIT)
       var values={};
       for (var key in buttons)
           values[key.toUpperCase()]=buttons[key].element;
       return values;
   }(SELF.service.page.Buttons.Items);

   Object.preset(SELF,{edit:edit, insert:insert, back:back, sort:sort, print:print, filter:filter, UpdateController:null, child:child});
   Object.setIfExist(SELF,SELF.service.page,'List');

   this.isNewRecord = function(){return NEW_RECORD;};

   init();
   hide(['PRINT','INSERT','SAVE','CHILD']);

   function print(){
      r3port=window.open("report.html", SELF.service.id ,'toolbar=no,location=no,directories=no,status=no,menubar=yes,scrollbars=yes,resizable=yes, height=600,width=800, fullscreen=yes');
   }

  function sort(id){
     SELF.service.Fieldset.sortNone(id);
     var input = SELF.service.Fieldset.Items[id];
     SELF.Resource.Dataset.orderBy(input.sortOrder());
     init();
  }

  function filter(event, key, value){
     var field = SELF.service.Fieldset.Items[key];
     switch(event.button) {
       case MOUSE.BUTTON.CENTER:
          SELF.service.Fieldset.filterNone(key);
          SELF.Resource.Dataset.filter(field, field.value(value));
          init();
       case MOUSE.BUTTON.LEFT: break;
       case MOUSE.BUTTON.RIGHT:break;
     }
  }
  function init(){
      hide(['SAVE','CHILD']);
      EDITED = false;
      NEW_RECORD=false;
      rowEdited = -1;
      if (SELF.UpdateController)
          SELF.UpdateController.refresh();
  }

  function edit(cell){
        rowEdited=SELF.service.page.List.getPosition(cell);
        hide(['GET','INSERT']);
        NEW_RECORD=false;
        EDITED=true;
        SELF.UpdateController.edit(rowEdited);
  }
  function child(key){ // key é o indicador da chave que contém o filho
      SELF.service.page.child.c$[key].open();
  }

  function back(){ (EDITED)?init():history.back();}

  function insert(){
        hide(['GET','INSERT','PRINT','CHILD']);
        rowEdited = -1;
        EDITED=true;
        NEW_RECORD=true;
        SELF.UpdateController.reset();
        if (SELF.service.afterActionInsert)
            SELF.service.afterActionInsert(SELF.UpdateController);
  }

  function hide(buttons){
       for (var key in BUTTONS){
           (buttons.has(key))?BUTTONS[key].hide():BUTTONS[key].show();
       }
  };
  function ResponseHandler(parent){
      var $i = this;
      this.get = function(response) { // os recursos serao criados no primeiro GET
         $i.Resource.bind(response);
         $i.service.Resource = $i.Resource;
         parent.UpdateController = new UpdateController($i.service);

         if ($i.service.initialize)
             $i.service.initialize(parent.UpdateController);
         init();
         return $i.Resource.Dataset;
     };
     this.remove= function(response, row) {
         parent.UpdateController.remove(row);
         if (rowEdited===row){
            init();
        }
     };
     this.post= function(response) {
         var json = j$.Resource.Consumer.handler(response);
         rowEdited = parent.UpdateController.insert(json);
         NEW_RECORD=false;
         EDITED=true;
     };

     this.put= function(response) {
         var json = j$.Resource.Consumer.handler(response);
         parent.UpdateController.update(rowEdited,json);
         NEW_RECORD=false;
         EDITED=true;
     };
   };
}

function UpdateController(service){
  var SELF = this;
  var Resource = service.Resource;
  //var service = $service;
  var Interface=service.Interface;
  Object.preset(SELF, {remove:remove, update:update, edit:edit, insert:insert, validate:validate, record:createRecord, refresh:refresh, reset:reset, form:i$(service.Interface.id)});

  var initialized=function(){
      if (!Resource.Dataset.empty){
          service.Fieldset.sweep(function(field){
              if (Resource.Dataset.Columns[field.key]===undefined)
                  field.persist=false;
          });
      }
  }();

  function hideAlert(){
     if (service.page.alert)
         j$.ui.Alert.hide(service.page.alert);
  }

  function reset(){
       hideAlert()
       SELF.form.reset();
       service.Fieldset.sweep(function(field){
              field.reset();
       });
  }

  function refresh(){
     if (service.page.List)
         service.page.List.init(Resource.Dataset);
     SELF.reset();
  }

  function edit(row){
        reset();
        var recordRow = service.page.List.Pager.absolutePosition(row);
        var record = Resource.Dataset.get(recordRow);
        service.Fieldset.populate(record,
           function(field){
                field.edit();
        });
        if (service.page.child)
           service.page.child.notify({action:CONFIG.ACTION.EDIT.KEY, record:record});
  }

  function remove(row){
        var recordRow = service.page.List.Pager.absolutePosition(row);
        Resource.Dataset.remove(recordRow);
        if (service.page.List)
           service.page.List.Detail.remove(row+1);
        if (service.onSuccess)
            service.onSuccess(CONFIG.ACTION.REMOVE);
  }

  function insert(record){
     var idx = -1;
     idx = Resource.Dataset.insert(record);
     SELF.edit(idx);
     if (service.page.List)
         service.page.List.Detail.add(record);
     if (service.onSuccess)
        service.onSuccess(CONFIG.ACTION.NEW);
     return idx;
  }

  function update(row, record){
      service.Fieldset.populate(record);
      if (service.page.List)
          service.page.List.Detail.update(row+1, record);
      if (service.onSuccess)
         service.onSuccess(CONFIG.ACTION.SAVE);
      Resource.Dataset.update(row, record);
  }

 function validate(){
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
            service.onError(Resource.Requester.ResponseHandler.isNewRecord()?CONFIG.ACTION.NEW:CONFIG.ACTION.SAVE);
        return !error;
  }

  function createRecord(){
        return service.Fieldset.sweep();
  }
}
