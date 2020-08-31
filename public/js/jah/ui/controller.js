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
    let items = {};
    return{
        create(service){
                 items[service.id] = new ActionController(new ResponseController(service));
             return items[service.id];
        }
      , get:key=>{return items[key];}
      , Items:items
      , c$:items
      , C$:key=>{return items[key];}
    };
}();
j$.$C=j$.ui.Controller.c$;
/* REVIEW:
   o ideal era incluir, atualizar e excluir no Dataset
   o Dataset deveria ser esperto para se manter atualizado com RESOURCE (fazer as chamadas para atualizar o recurso)
   Tipo: Alterou uma coluna de uma linha no Dataset, ele chamaria os métodos HTTP correspondes para atualizar no servidor.
       - Assim, ficaria mais simples porque o cliente passaria apenas a atualizar o Dataset
*/

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
        if (dataExt.isDefined(_me.service.resource)){
            if (dataExt.isString(_me.service.resource))
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
        }(_me.service.page.Buttons.Items);

        Object.preset(_me,{edit, insert, back, sort, print, UpdateController:null, child, filter});
        Object.setIfExist(_me,_me.service.page,'List');

        init();
        hide(['PRINT','INSERT','SAVE','CHILD']);
        return true;
    }()

   this.isNewRecord = ()=>{return NEW_RECORD};

   function print(){
      r3port=window.open("report.html", _me.service.id ,'toolbar=no,location=no,directories=no,status=no,menubar=yes,scrollbars=yes,resizable=yes, height=1024,width=1280, fullscreen=yes');
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
        if (!dataExt.isDefined(parent.UpdateController))
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
    , Resource  = service.Resource
    , Interface = service.Interface;

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
          , error  =false;
        for(let key in service.Fieldset.c$){
           let field = service.Fieldset.c$[key];
           if (field.validate){
              if (!field.validate())
                  error=true;
           }
        }
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
