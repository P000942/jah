/*
   Created by Geraldo Gomes

   j$.Resource         
     .Resource         => Contem todas as informacoes e objetos que tratam o recurso
     .ResponseHandler  => Trata as respostas HTTP
     .Resquester       => Faz as solitacoes HTTP
     .Dataset          => Um recordset, para posicionar e localizar os registros
     .Pager            => Um helper para controlar paginação
     .Parser           => Conversor dos dados do formato de origem para o do recordset
     .store            => É o repositório onde ficam os dados
 */

 j$.Requester = function(){ // É  uma instancia única
     let context = CONFIG.RESOURCE.CONTEXT;
     function URL(url, responseHandler){
       // console.log(`URL==>>${url}`);
        return (url) ?url
                     :responseHandler.Resource.url;
     };
     function cacheRequest(url, parameter, responseHandler){
        let response=null;
        //console.log(`cacheRequest==>>${url} / ${parameter}`);
        if (responseHandler.Resource.cache){ // vai no cache se permitido ir no cache, senao sempre vai no servidor
           response=j$.Resource.Store.restore(url);
           if (parameter && response)
              response=search(response, parameter, responseHandler.Resource.id);
        }
        return response;
     }
     function search(source, parameter, id) {
        //console.log(`search==>>${source} / ${parameter} / ${id}`);
          let response = null
          if (parameter){ //GET "http://localhost:3000/assunto com boby={idAssunto:1}
             if (dataExt.isObject(parameter)){
                response = source.select( record =>{
                      for (let key in parameter){
                          if (record[key]!=parameter[key])
                             return false;
                      }
                      return true; // todos os campos foram iguais
                  });
              }else{ // simula o GET "http://localhost:3000/assunto/1"
                  response = source.find(function(record){
                      if (record[id] == parameter)
                         return true;
                  });
              }
          }
          if (response && response.length==0)
             response=null;
          return response;
     }
     function request(http){
         //console.log(`request==>${http}`);
          new Ajax.Request(http.url, {
                parameters: http.parameters
          ,         method: http.method
          ,       postBody: http.postBody
          ,       evalJSON: true
          ,    contentType: 'application/json'
          ,      onSuccess: http.onSuccess
          ,      onFailure: http.onFailure
          ,    onException: function(a){console.log(a);}
           });
           return http;
     }
     return{
       get:function(url, parameter, responseHandler) {
            //console.log(`get==>${url}`);
            const http ={url: URL(url, responseHandler)
                     , method:'GET'
                     , onFailure: responseHandler.failure
                     , onSuccess:function(response){
                               responseHandler.get(response);
                       }
                    };

            const cached=cacheRequest(http.url, parameter, responseHandler);

            if (!cached) {// não resolveu no cache.
               if (responseHandler.Resource.local) { //Se não for recurso local, pede http
               // console.log(`get==>Resource.local`);
                  responseHandler.get(null);
                  responseHandler.failure (
                     j$.Resource.DefaultHandler.formatError(CONFIG.HTTP.STATUS.NOT_FOUND.VALUE, "Nenhum resultado foi encontrado para a solicitação")
                  );
               }else{
                  if (parameter){
                      if (dataExt.isObject(parameter))
                         http.parameters = JSON.stringify(parameter);
                      else
                         http.url += "/"+parameter;
                     console.log(`get==>${http.url} / ${http.parameters}`); 
                   }
                   request(http);
               }
            } else{
           //     console.log(`get==>vai resolver no cache`);
              if (responseHandler)
                  responseHandler.get(cached);
            }
            return http;
      }
     ,remove: function(url, id, responseHandler,  recordRow) {
          return request({url: URL(url, responseHandler)+"/"+id
                    , method:'DELETE'
                    , onFailure: responseHandler.failure
                    , onSuccess:function(response){
                              responseHandler.remove(response, recordRow);
                      }
                  });
     }
     ,post: function(url, record, responseHandler) {
          return request({url: URL(url, responseHandler)
                   , method:'POST'
                   , postBody:JSON.stringify(record)
                   , onFailure: responseHandler.failure
                   , onSuccess:function(response){
                               responseHandler.post(response);
                     }
                });

      }
      ,put: function(url, id, record, responseHandler, recordRow) {
           return request({url: URL(url, responseHandler)+"/"+id
                    , method:'PUT'
                    , postBody:JSON.stringify(record)
                    , onFailure: responseHandler.failure
                    , onSuccess:function(response){
                                responseHandler.put(response, id, recordRow);
                      }
                   });
       }
       ,request:request
       ,search:search
       ,cacheRequest:cacheRequest
       ,url:URL
   }
}(); //j$.Requester 

j$.Resource = function(){ // Factory: Criar os recursos
    let items = {}
      , properties=['name','context','source','local','cache','key','id','text', 'autoCharge','url']
      , context = CONFIG.RESOURCE.CONTEXT;
    DefaultHandler =function (){
       /* Um caminho padrao para tratar as respostas do servidor
          se tem algo comum a fazer, passa por aqui antes e já devolve algo mais elaborado.
       */
       return{
              handler: response => response
            , success: response => response
            , failure: response => {
                let error = Object.preset({},CONFIG.HTTP.STATUS.get(response.status))
                error.msg = error.TEXT;
                if (response.responseJSON)
                    Object.setIfExist(error,response.responseJSON,['msg'])

                return error;
            }
            , formatError: (cdStatus,message) => {
                return {
                  status:cdStatus
                 ,statusText:message
                 ,responseJSON:{msg:message}
                }
            }
        }
    }();
    return{
        getURL(recourseName){return context}
      ,   init($context){context=$context}
      , create(resource, externalResponseHandler){
            let Definition = j$.Resource.parse(resource);
            //#todo: verifica se resource jah existe para não recriar
            if (!j$.$R[Definition.name]){ // recurso não existe, será criado
               items[Definition.name] =new Resource(Definition, externalResponseHandler);
            } else {
                if (externalResponseHandler) // associa o externalResponseHandler ao recurso (ele pode ter sido criado por fora)
                   items[Definition.name].bind(externalResponseHandler);
                //items[Definition.name].externalResponseHandler = externalResponseHandler;
            }
            return items[Definition.name];
        }       
      , context:context
      , ResponseHandler:ResponseHandler
      , Requester:Requester
      , DefaultHandler:DefaultHandler
      , parse:parseDefinition
      , Dataset: Dataset
      ,  Local:function(){return{Requester:LocalRequester}}()
      , Parser: function(){return{init:function(){return true}}}()
      , get(key){return items[key]}
      , Items:items
      , c$:items
      , C$(key){return items[key]}
    };
    // resoucer:{name:'', [id]:'', [url]:'', [context]:'', unique:"true/false", source:[{record},{record},...]}
    function Resource(resource, external_responseHandler){
        let _r = this;

        initialize(resource);
        createResponder(external_responseHandler);
        createRequester();
        createDataset(resource)
        function bind(external_responseHandler){
            createResponder(external_responseHandler);
        }

        function initialize(resource){
           Object.preset(_r
                      ,{
                              recharge:recharge
                      ,           bind:bind
                      , handleResponse:j$.Resource.DefaultHandler.handler
                      ,        Dataset:null
                      ,         Parser:new j$.Resource.Parser.Default(_r)
                      ,          cache:true
           });

           Object.setIfExist(_r,resource,properties);// copia as definições para o Resource
        }

        function parseName(resource){return resource.name}

        function createResponder(externalResponseHandler){
           if  (externalResponseHandler)
               _r.externalResponseHandler = externalResponseHandler;
           if (!_r.ResponseHandler)    
              _r.ResponseHandler = new j$.Resource.ResponseHandler(_r);
        }
        function createRequester(){
              _r.Requester=(_r.local)
                                   ? new j$.Resource.Local.Requester(_r.ResponseHandler)
                                   : new j$.Resource.Requester(_r.ResponseHandler);
             // coloca os métodos do Resquester no Resource (Isso vai reduzir a necessidade de conhecimento da estrurua dos objetos do Resource)
             Object.setIfExist(_r,_r.Requester,['get','post','put','remove','search']);
        }
        function createDataset(resource){
            let Dataset = _r.Parser.toDataset(resource.source);

            if (Dataset)
                Object.setIfExist(_r,Dataset,['filter','unfilter','orderBy','find','findIndex']);
            return Dataset;
        }

        function recharge(response){ // recarrega Dataset apos um get
           return createDataset({source:j$.Resource.DefaultHandler.handler(response)})
        }
    } // Resource

    function ResponseHandler(Resource){
       /* ResponseHandler: responde internamente aos métodos do resource
        * external_responseHandler: será acionado depois que faz as atualizações internas (store)
        * naum informah-lo eh indicacao da necessidade de criar um REQUESTER que irah acionar este ResponseHandler
       */
       let _rh = this;
     
       const initialized=function(){
           Object.preset(_rh, {failure, get, post, put, remove, filter, sort, Resource});
           return true;
       }()
       function passForward(method, response, recordRow){
          let exists = (_rh.Resource.externalResponseHandler && _rh.Resource.externalResponseHandler[method]);
          //if (exists && response)
          if (exists)
             _rh.Resource.externalResponseHandler[method](response, recordRow);
          else
              show(response,  method);
          return exists;
       }
       function show(response, method){
          console.log(_rh.Resource.name+"." + method +":");
          console.log(response);
       }
       function sort(sort) { passForward("sort", sort)}
       function filter(criteria) { passForward("filter", criteria) }

       function get(response) {
            _rh.Resource.recharge(response);
            passForward("get", response);
            return _rh.Resource;
       }
       function remove(response, recordRow) {
            if (Resource.Dataset)
                Resource.Dataset.remove(recordRow);
            passForward("remove", response, recordRow);
       }

       function post(response) {
            let record = j$.Resource.DefaultHandler.handler(response);
            let recordRow = -1
            if (Resource.Dataset)
                recordRow = Resource.Dataset.insert(record);
            passForward("post", response, recordRow);
       }

       function put(response, id, recordRow) {
           let record = j$.Resource.DefaultHandler.handler(response);
           if (!dataExt.isDefined(recordRow)){
              recordRow=(dataExt.isDefined(id))
                           ?Resource.findIndex(id)
                           :Resource.Dataset.position;
           }
           if (Resource.Dataset)
               Resource.Dataset.update(recordRow, record);
           passForward("put", record, recordRow);
       }
       function failure(response) {
           let error = j$.Resource.DefaultHandler.failure(response);
           passForward("failure", error);
       }
    } //ResponseHandler
    /*
     *   Faz as chamadas ao servidor por AJAX
     */
    function Requester(responseHandler) {
       this.responseHandler = responseHandler;
       const url = responseHandler.Resource.url;
       this.remove = (id, row)=> {
            let recordRow=responseHandler.Resource.findIndex(id);
            return j$.Requester.remove(url, id, responseHandler, recordRow);
       }

       this.get= parameter=> {return j$.Requester.get(url, parameter,responseHandler)}

       this.search= this.get;

       this.post= record=>{return j$.Requester.post(url, record, responseHandler)}

       this.put= (id, record, recordRow)=> {
             return j$.Requester.put(url, id, record, responseHandler, recordRow);
       }
    }

    function LocalRequester(responseHandler) {
        this.ResponseHandler = responseHandler;
        const url = responseHandler.Resource.url;

        this.remove = (id, recordRow)=> {
             //var id=responseHandler.Resource.Dataset.id(recordRow);
             if (!recordRow)
                 recordRow=responseHandler.Resource.findIndex(id);
             responseHandler.remove(responseHandler.Resource.Dataset.get(recordRow),recordRow);
        }

        this.get = (parameter, handler=responseHandler) =>{ //handler provavelmente só vem preenchido quando o recurso é usado é um controle
             return j$.Requester.get(url, parameter,handler)
        }
        this.search = parameter=>{ return j$.Requester.get(url, parameter,responseHandler)}

        this.post =  record=> {request(record,responseHandler.post)}

        this.put= (id,record, recordRow) =>{ responseHandler.put(record,id, recordRow) }

        function request(response, callback){callback(response)}
    }

    function Dataset(DataSource, Resource){
       const _ds = this
           , ROW = {FIRST:0, LAST:0}
       let originalSource = null;

       const initialized= function init(){
           Object.preset(_ds,{Columns:null, get, update, insert, remove, find, findIndex, exists, id
            , DataSource, count:-1,position:0
            , createPager: page =>{return new j$.Resource.Pager(_ds, page)}
            });
           if (DataSource){
               // Quando soh tem registro na tabela, nao volta uma array e sim um objeto, por isso o tratamento
               if (dataExt.isArray(DataSource))
                   _ds.DataSource = DataSource;
               else
                   _ds.DataSource = [DataSource];
           }
           originalSource = _ds.DataSource;
           refresh();
           return true;
       }();

       function refresh(){
           if (_ds.DataSource && _ds.DataSource.length>0){
              _ds.Columns = _ds.DataSource[0];
              _ds.position = ROW.FIRST;
              _ds.count = _ds.DataSource.length;
              ROW.LAST = _ds.count -1;
              _ds.empty=false;
           }else{
              _ds.empty=true;
              _ds.DataSource=[];
           }
        }

        function get(row){
           if (row!=undefined)
              _ds.position = row;
           return _ds.DataSource[_ds.position];
        }
        function id (number){
            //REVIEW: (Para atender as chaves compostas)
            return this.get(number)[Resource.id];
        }

        function insert(record){
           const proceed = !(Resource.unique && _ds.exists(record));
           if (proceed){
              _ds.DataSource.push(record);
              refresh();
              _ds.position = ROW.LAST; 
              originalSource = _ds.DataSource; // SE DER BRONCA: Esse trecho estava inútil abaixo do return
              return ROW.LAST;  
           }
        }

        function update(row,record){
           const pos = (row) ?row :_ds.position
           _ds.DataSource[pos]=record;
           originalSource = _ds.DataSource;
        }

        function remove(row){
            const pos = _ds.position;
           _ds.DataSource.splice(row,1);
           refresh();
           if (pos != row)
               _ds.position=pos;
           originalSource = _ds.DataSource;
        }

        this.orderBy = sort=>{
            _ds.DataSource.sort(sort.orderBy());
            refresh();
            Resource.ResponseHandler.sort(sort);
            //return _ds.DataSource;
        };

        this.filter=criteria=>{
           _ds.DataSource = originalSource;
           if (criteria){
               _ds.DataSource = _ds.DataSource.select(
                   function(record){
                       for (let key in criteria){
                           if (record[key]!=criteria[key])
                              return false;
                       }
                       return true; // todos os campos foram iguais
                   });
           }
           refresh();
           Resource.ResponseHandler.filter(criteria)
           //return _ds.DataSource;
       };

       // métodos de navegacao
       this.isFirst = ()=>{return (_ds.position == ROW.FIRST)}
       this.isLast  = ()=>{return (_ds.position == ROW.LAST)}
        // Retorna o PROXIMO registro
       this.next = ()=>{
            if (_ds.position < ROW.LAST)
                _ds.position++;
            return _ds.get(_ds.position);
        };

        // Retorna o registro ANTERIOR
       this.previous = ()=>{
            if (_ds.position > ROW.FIRST)
                _ds.position--;
            return _ds.get(_ds.position);
        };
        // Retorna o PRIMEIRO registro
       this.first = ()=>{
            _ds.position = ROW.FIRST;
            return _ds.get(_ds.position);
       };
        // Retorna o ULTIMO registro
       this.last = ()=>{
            _ds.position = ROW.LAST;
            return _ds.get(_ds.position);
       };

        this.sweep=function(action){ // varre todo o arquivo sem guardar as posicoes, por isso, nao chama o metodo get()
            let record = null;
            for (let row=ROW.FIRST; row<=ROW.LAST; row++){
                record = _ds.DataSource[row];
                if (action)
                    action(row, record);
            }
        };

        function find(validator){//encontrar um registro específico
            let record = null;
            for (let row=ROW.FIRST; row<=ROW.LAST; row++){
                record = _ds.DataSource[row];
                if (validator){
                    if (validator(row, record)){
                        return record;
                    }
                }
            }
            return null;
        }
        function findIndex(criteria){//encontrar um registro específico
            for (let row=ROW.FIRST; row<=ROW.LAST; row++){
                if (Object.contains(_ds.DataSource[row],criteria,Resource.key))
                   return row;
            }
            return  c$.RC.NOT_FOUND;
        }

        function exists(record, key){ //verifica se um registro existe
            if (!key)
               key = Resource.key;
            let FOUND=false;
            for (let row=ROW.FIRST; row<=ROW.LAST; row++){
                _ds.DataSource[row];
                if (Object.compare(_ds.DataSource[row], record, key)) //compara os valores de uma instancia
                   return row;
            }
            return  c$.RCNOT_FOUND;
        }
    } //Dataset

    // Faz parse da definicao do resource
    function parseDefinition(resource){
         let res = {}
           , found=false;
         function parseUrl(resource){
             // recebendo: "http://localhost/jah/resources/estadoCivil"
             // vai separar em: context: "http://localhost/jah/resources/
             //                    name: estadoCivil
             let url=resource.split(/[/]/);
             if (url.length>1){
                 res.name=url[url.length-1];
                 url.pop();
                 res.context = url.join('/')+"/";
             }else{
                 res.name=url[0];
                 res.context = context;
             }
         }
         if (dataExt.isString(resource)){
            parseUrl(resource);
         }else{
             Object.setIfExist(res,resource,properties)
             if (resource.Dataset) //REVIEW: Não encontrei necessidade disso. parece que não acontece
                res.source = resource.Dataset.DataSource; // recupera o "source"
             if (!(res.name || res.source || res.context)){ // Nenhum das propriedades foram definidas
                 // provavelmente tem algo assim -> {tabela:[{id:1, text:'aaaa},{id:1, text:'aaaa}]}
                 for (let key in resource){
                     parseUrl(key);
                     res.source=resource[key];
                 }
             }
             if (res.source && !dataExt.isDefined(res.local))
                 res.local  = true;
         }
         if (!res.context)
               res.context=context;

         Object.preset(res, dataExt.format.record(res.name), ['id','text']);
         Object.preset(res,{key:res.id});
         res.url = res.context + res.name;

         return res;
    }
}(); //j$.Resource 
j$.$R =j$.Resource.c$;

j$.Resource.Pager=function(dataset, page){
   _me = this;
   dataset.Pager = _me;
   _me.Dataset = null;
   this.restart=restart;
   this.sweep=sweep;
   // number  -> Nro da pagina
   // last    -> qtd de paginas
   // maxline -> qtd MÁXIMA de linhas na página
   // maxpage -> qtd MÁXIMA de paginas no navegador
   // first   -> constante que indica a primeira página
   this.Control ={number:0, last:0, maxline: CONFIG.GRID.MAXLINE, maxpage: CONFIG.GRID.MAXPAGE, first:1};
   // count   -> qtde de registros do dataset
   // first   -> indice do registro INICIAL da página solicitada
   // last    -> indice do registro FINAL da página solicitada
   this.Record ={count:0, first:-1, last:0};
   this.absolutePosition = position=>{return (_me.Record.first-1)+position}
   this.pagePosition = recordRow=>{
       let pos={};
       let row = recordRow+1
       pos.page = Math.round(row/_me.Control.maxline);
       if ((pos.page*_me.Control.maxline) < row)
          pos.page++;
       pos.index = ( row - ((pos.page-1)*_me.Control.maxline) -1);
       return pos;
   }

   if (page){
       Object.setIfExist(_me.Control, page,['maxline','maxpage']);
   }
   this.restart(dataset);

   function restart(dataset){
       if (dataset)
           _me.Dataset = dataset;

        _me.Record.count = _me.Dataset.count;
        _me.Control.number=0;
          // Calcula a quantidade de paginas
        _me.Control.last = parseInt(((_me.Record.count -1)  / _me.Control.maxline)) + 1;
   }
   function sweep(action){
        for (let row=_me.Record.first-1; row<_me.Record.last; row++){
            let record = _me.Dataset.get(row);
            if (action)
                action(row, record);
        }
   }
   this.first = ()=>{
           this.get(this.Control.first);
           return this.Control.number;
   };
   this.back = ()=>{
       if (this.Control.first<=this.Control.number-1){
           this.Control.number--;
           this.get();
           return this.Control.number;
       }else
           return false;
   };

   this.next = ()=>{
       if (this.Control.last>=(this.Control.number+1)){
           this.Control.number++;
           this.get();
           return this.Control.number;
       }else
           return false;
   };
   this.last = ()=>{
           this.get(this.Control.last);
           return this.Control.number;
   };
   this.get =number=>{
       if (number)
           this.Control.number=number;
       if (this.Control.number>this.Control.last)
           this.Control.number=this.Control.last;
       if (this.Control.number<this.Control.first)
           this.Control.number=this.Control.first;

       this.Record.first = ((this.Control.number-1) * this.Control.maxline)+1;
       this.Record.last  = (this.Control.number) * this.Control.maxline;

       if (this.Record.last > this.Record.count)
           this.Record.last = this.Record.count;
   };
   // dado 'limit' de paginas, calcula os limites iniciais e finais posiveis de navegar a partir sa posicao atual(Control.number)
   // util para mostrar as paginas navegaveis - uma barra de navegacao para paginar
   this.positions =limit=>{
        if (!limit)
            limit=_me.Control.maxpage;
        let ws={};
        let maxInitial=(_me.Control.last - limit)+1;
        if (maxInitial<1)
            maxInitial=1;
        ws.first=(_me.Control.number-2>maxInitial)?maxInitial:_me.Control.number-2;
        if (ws.first<1)
            ws.first=1;
        ws.last = (_me.Control.last>limit)?(ws.first + limit) -1 : _me.Control.last;

        return ws;
   };
   this.show = ()=>{
       console.log('Control.last:'+this.Control.last);
       console.log('Control.maxline:'+this.Control.maxline);
       console.log('Record.count:'+this.Record.count);
       while(this.next()){
             console.log('Number:'+this.Control.number + ' first:'+this.Record.first + ' last:'+this.Record.last);
       }
   };
} //j$.Resource.Pager
/*
    A proposta eh ter independencia em relacao ao parser dos recursos.
    Caso os recursos venham em XML ou outro formato.
    Tem que contruir um parser que farah a conversao e trocar o Parser do recurso.
    Resource.Parser = new j$.Resource.Parser.Xml(Resource);
    Se quer trocar para todos, troca o default.
    j$.Resource.Parser.Default = j$.Resource.Parser.Xml;
 */
j$.Resource.Parser.Json= function(Resource){
      let _me = this;
      this.toListset=function(response){
        let Listset={list:{}, count:-1, maxlength:0};
        let json = j$.Resource.DefaultHandler.handler(response);
        let dataset =  _me.toDataset(json);
        Listset.count = dataset.count;
        dataset.sweep(function(row, record){
           try {
               if  (record[Resource.text]==undefined)
                   throw CONFIG.EXCEPTION.INVALID_COLUMN;
                let item = record[Resource.text];
                Listset.list[record[Resource.id]]=item;
                if (item.length > Listset.maxlength)
                        Listset.maxlength = item.length;
           } catch(exception){
               if (exception==CONFIG.EXCEPTION.INVALID_COLUMN)
                   console.log(exception.text +" '"+Resource.text+"'");
               throw exception.id;
           }
        });
        return Listset;
      };
      this.toDataset=response=>{
           //Resource.Dataset = null;
           //if (response){
              let data_source = _me.toDatasource(response);
              Resource.Dataset =   new j$.Resource.Dataset(data_source, Resource);
              j$.Resource.Store.save(Resource, data_source, Resource.local);
            //}
            return Resource.Dataset;
      };
      this.toDatasource=parse;
      function parse(response){
        let data_source = null;
        if (response){
             if (response[Resource.name]){
                 // RETORNOU UMA LISTA DE REGISTROS
                 data_source = response[Resource.name];
             }else{
                 data_source=response;
             }
        }
        return data_source;
     }
};

j$.Resource.Parser.Default = j$.Resource.Parser.Json;

j$.Resource.Store= function(){
   let store={};
   let context = j$.Resource.context;
   store[context]={};
   return{
      add(resource, keep){j$.Resource.create(resource)}
    , save(Resource, source, keep){      // Keep -> para manter o conteúdo já existente
         assertContext(Resource.context)
         if (source && dataExt.isArray(source)) { // tem um recurso informado
            if (!keep || !store[Resource.context][Resource.name])
               store[Resource.context][Resource.name]=source;
         }
      }
    , restore(urlResource){
          //restore('resourceName') ou restore('http://localhost:8080/app/resourceName')
          //recupera um recurso que está armazenado
          let res = j$.Resource.parse(urlResource);
          let source = store[res.context][res.name];
          if (source == null){ // Procura em todos os contextos
             for (let urlContext in store)
                 source =getResourceInContext(urlContext, res.name);
          }
          return source;
      }
    , exists(urlResource){
          let res = j$.Resource.parse(urlResource);
          return !(store[res.context][res.name]==undefined);
      }
    , remove(urlResource){
          let res = j$.Resource.parse(urlResource);
          delete store[res.context][res.name];
      }
    , Source(name){
          if (name)
             return store[context][name]; // pega um recurso específico dentro do context padrao
          else
              return store[context] //Pega o recurso do contexto padrao
      }
    , Data: store
   }

   function assertContext(context){
      if (!store[context])
          store[context]={}; // Cria um contexto novo, caso não exista
   }

   function getResourceInContext(urlContext, resourceName){
        for (leturlContext in store){
            for (let key in store[urlContext]){
                if (key==resourceName){
                    return store[urlContext][key];
                }
            }
        }
        return null;
   }
}();

Task = j$.Resource.create("tasks");
Papel = j$.Resource.create("papel");
Papel.Requester.get();
// Mensagem = j$.Resource.create("mensagem");
// Mensagem.Requester.get();
Documento = j$.Resource.create("http://10.70.4.100:8080/documento");

j$.Resource.Store.add(
                    {"tabela":[
                            {"idTabela":"1","txTabela":"Descrição tabela 1"}
                           ,{"idTabela":"2","txTabela":"Descrição tabela 2"}
                    ]});
Uf = j$.Resource.create({name:'estadoCivil'
                    ,source:[
                        {"idEstadoCivil":"1","txEstadoCivil":"Solteiro"}
                        ,{"idEstadoCivil":"2","txEstadoCivil":"Casado"}
                        ,{"idEstadoCivil":"3","txEstadoCivil":"Divorciado"}
                        ,{"idEstadoCivil":"4","txEstadoCivil":"Viúvo"}
                  ]});
// j$.Resource.Store.add(
//                         {"http://localhost/jah/resources/estadoCivil":
//                           [
//                             {"idEstadoCivil":"1","txEstadoCivil":"Solteiro"}
//                            ,{"idEstadoCivil":"2","txEstadoCivil":"Casado"}
//                            ,{"idEstadoCivil":"3","txEstadoCivil":"Divorciado"}
//                            ,{"idEstadoCivil":"4","txEstadoCivil":"Viúvo"}
//                       ]});
// Vai adicionar direto no context default
Uf = j$.Resource.create({name:'uf'
                         ,text:'txEstado' //Importante para definir o campo que é usado para descrição quando foge do padrao (padrao: txUF)
                         ,source:[
                           {"idUf":"1","sgUf":"AM","txEstado":"Amazonas"}
                          ,{"idUf":"2","sgUf":"AC","txEstado":"Acre"}
                          ,{"idUf":"3","sgUf":"SP","txEstado":"São Paulo"}
                          ,{"idUf":"4","sgUf":"RJ","txEstado":"Rio de Janeiro"}
                          ,{"idUf":"5","sgUf":"PA","txEstado":"Pará"}
                          ,{"idUf":"6","sgUf":"PR","txEstado":"Paraná"}
                       ]});

j$.Resource.Store.add({name:"assunto"
                       //, context:CONFIG.RESOURCE.CONTEXT
                       , local:true
                       , source:[
                               {"idAssunto":"1","idCategoriaAssunto":"1","txTitulo":"GPX"}
                              ,{"idAssunto":"2","idCategoriaAssunto":"3","txTitulo":"SUAD"}
                              ,{"idAssunto":"3","idCategoriaAssunto":"3","txTitulo":"GEP"}
                              ,{"idAssunto":"4","idCategoriaAssunto":"3","txTitulo":"GPE"}
                              ,{"idAssunto":"5","idCategoriaAssunto":"1","txTitulo":"GDD"}
                              ,{"idAssunto":"6","idCategoriaAssunto":"2","txTitulo":"GCC"}
                              ,{"idAssunto":"7","idCategoriaAssunto":"1","txTitulo":"GLOG"}
                              ,{"idAssunto":"8","idCategoriaAssunto":"1","txTitulo":"CCEA"}
                              ,{"idAssunto":"9","idCategoriaAssunto":"2","txTitulo":"SUAD"}
                              ,{"idAssunto":"10","idCategoriaAssunto":"1","txTitulo":"SCEA"}
                              ,{"idAssunto":"11","idCategoriaAssunto":"2","txTitulo":"CCEA"}
                              ,{"idAssunto":"12","idCategoriaAssunto":"3","txTitulo":"CCOR"}
                              ,{"idAssunto":"13","idCategoriaAssunto":"1","txTitulo":"test"}
                              ,{"idAssunto":"14","idCategoriaAssunto":"3","txTitulo":"RSIM"}
                              ,{"idAssunto":"15","idCategoriaAssunto":"1","txTitulo":"GPAF"}
                              ,{"idAssunto":"16","idCategoriaAssunto":"2","txTitulo":"SPED"}
                              ,{"idAssunto":"17","idCategoriaAssunto":"1","txTitulo":"NFe"}
                              ,{"idAssunto":"18","idCategoriaAssunto":"2","txTitulo":"CADe"}
                              ,{"idAssunto":"19","idCategoriaAssunto":"3","txTitulo":"CFe"}
                              ,{"idAssunto":"20","idCategoriaAssunto":"1","txTitulo":"XPT"}
                              ,{"idAssunto":"21","idCategoriaAssunto":"3","txTitulo":"CAE"}
                              ,{"idAssunto":"22","idCategoriaAssunto":"3","txTitulo":"CNAE"}
                              ,{"idAssunto":"23","idCategoriaAssunto":"1","txTitulo":"GPE"}
                              ,{"idAssunto":"24","idCategoriaAssunto":"1","txTitulo":"SUAD"}
                              ,{"idAssunto":"25","idCategoriaAssunto":"3","txTitulo":"CCEA"}
                              ,{"idAssunto":"26","idCategoriaAssunto":"4","txTitulo":"GPE"}
                              ,{"idAssunto":"27","idCategoriaAssunto":"4","txTitulo":"SUAD"}
                              ,{"idAssunto":"28","idCategoriaAssunto":"4","txTitulo":"CCEA"}
                              ,{"idAssunto":"29","idCategoriaAssunto":"3","txTitulo":"GPE"}
                              ,{"idAssunto":"30","idCategoriaAssunto":"3","txTitulo":"SUAD"}
                              ,{"idAssunto":"31","idCategoriaAssunto":"3","txTitulo":"CCEA"}
                          ]});
j$.Resource.Store.add({name:"categoriaAssunto"
                       //, context:CONFIG.RESOURCE.CONTEXT
                       , source:[
                               {"idCategoriaAssunto":"1","txCategoriaAssunto":"Sistema"}
                              ,{"idCategoriaAssunto":"2","txCategoriaAssunto":"Projeto"}
                              ,{"idCategoriaAssunto":"3","txCategoriaAssunto":"Manutenção"}
                              ,{"idCategoriaAssunto":"4","txCategoriaAssunto":"Inovação"}
                          ]});

// j$.Resource.Store.add({name:"papel"
//                        //, context:CONFIG.RESOURCE.CONTEXT
//                        , source:[
//                                {"idPapel":"1","txPapel":"Programador"}
//                               ,{"idPapel":"2","txPapel":"Analista"}
//                               ,{"idPapel":"3","txPapel":"Arquiteto"}
//                           ]});
j$.Resource.Store.add({name:"tarefa"
                       //, context:CONFIG.RESOURCE.CONTEXT
                       , source:[
                               {"idAssunto":"1","idTarefa":"1","txTarefa":"Desenhar Projeto"}
                              ,{"idAssunto":"1","idTarefa":"2","txTarefa":"Desenvolver Projeto"}
                              ,{"idAssunto":"1","idTarefa":"3","txTarefa":"Testar Projeto"}
                              ,{"idAssunto":"2","idTarefa":"2","txTarefa":"Desenvolver Projeto"}
                              ,{"idAssunto":"2","idTarefa":"3","txTarefa":"Testar Projeto"}
                          ]});

j$.Resource.Store.add({name:"situacaoAtividade"
                       //, context:CONFIG.RESOURCE.CONTEXT
                       , source:[
                               {"idSituacaoAtividade":"1","txSituacaoAtividade":"Em aberto"}
                              ,{"idSituacaoAtividade":"2","txSituacaoAtividade":"Designada"}
                              ,{"idSituacaoAtividade":"3","txSituacaoAtividade":"Concluida"}
                          ]});

j$.Resource.Store.add({
      name:"pessoa"
  , source: [
    {id:01, nome: 'Coxinha',    data:'1971/10/10', ativo:false, valor:12,      sexo:'M', vl:1101},
    {id:02, nome: 'Doquinha',   data:'1971/11/20', ativo:false, valor:991001,  sexo:'F', vl:112},
    {id:03, nome: 'Marinelson', data:'1980/11/20', ativo:true,  valor:'10,10', sexo:'M', vl:113},
    {id:04, nome: 'ShumbLET',   data:'1971/11/30', ativo:true,  valor:1001.2,  sexo:'F', vl:114},
    {id:05, nome: 'Lyo',        data:'1971/12/20', ativo:false, valor:991001,  sexo:'F', vl:115},
    {id:07, nome: 'Seu Jose',   data:'1971/10/21', ativo:false, valor:991001,  sexo:'F', vl:117},
    {id:08, nome: 'Tadeu',      data:'1971/10/10', ativo:true,  valor:10.10,   sexo:'M', vl:118},
    {id:09, nome: 'Numvouw',    data:'1971/10/11', ativo:true,  valor:1001.2,  sexo:'F', vl:119},
    {id:10, nome: 'Vovó',       data:'1971/10/12', ativo:true,  valor:1001.2,  sexo:'F', vl:211},
    {id:11, nome: 'Foca',       data:'1971/10/01', ativo:true,  valor:1001.50, sexo:'M', vl:212},
    {id:12, nome: 'Negão    ',  data:'1971/10/02', ativo:false, valor:991001,  sexo:'F', vl:213},
    {id:13, nome: 'Robinho   ', data:'1971/10/03', ativo:true,  valor:10.10,   sexo:'M', vl:214},
    {id:14, nome: 'Papai Noel', data:'1971/10/04', ativo:true,  valor:1001.2,  sexo:'F', vl:215},
    {id:15, nome: 'Puf',        data:'1971/10/05', ativo:false, valor:991001,  sexo:'F', vl:216},
    {id:16, nome: 'Ursão',      data:'1971/10/06', ativo:true,  valor:10.10,   sexo:'M', vl:217},
    {id:17, nome: 'Chimbinha',  data:'1971/10/07', ativo:false, valor:991001,  sexo:'F', vl:218},
    {id:18, nome: 'Taputo',     data:'1971/10/08', ativo:true,  valor:10.10,   sexo:'M', vl:219},
    {id:19, nome: 'Tin Loren',  data:'1971/10/09', ativo:true,  valor:1001.2,  sexo:'F', vl:311},
    {id:20, nome: 'Tia lid',    data:'1971/10/15', ativo:true,  valor:1001.2,  sexo:'F', vl:312},
    {id:21, nome: 'Moca',       data:'1971/10/16', ativo:true,  valor:1001.50, sexo:'M', vl:313},
    {id:22, nome: 'Curaca  ',   data:'1971/10/17', ativo:false, valor:991001,  sexo:'F', vl:314},
    {id:23, nome: 'Coronel   ', data:'1971/10/18', ativo:true,  valor:10.10,   sexo:'M', vl:315},
    {id:24, nome: 'Lacraudio',  data:'1971/10/19', ativo:true,  valor:1001.2,  sexo:'F', vl:316},
    {id:25, nome: 'Baiano',     data:'1971/11/20', ativo:false, valor:991001,  sexo:'F', vl:317},
    {id:26, nome: 'Salsicha',   data:'1971/11/10', ativo:true,  valor:10.10,   sexo:'M', vl:318},
    {id:27, nome: 'Chimbinha',  data:'1971/11/11', ativo:false, valor:991001,  sexo:'F', vl:319},
    {id:28, nome: 'Barney',     data:'1971/11/12', ativo:true,  valor:10.10,   sexo:'M', vl:410},
    {id:29, nome: 'Pescoço',    data:'1971/11/13', ativo:true,  valor:1001.2,  sexo:'F', vl:411},
    {id:30, nome: 'Madruga',    data:'1971/11/14', ativo:true,  valor:1001.2,  sexo:'F', vl:412},
    {id:31, nome: 'Capim',      data:'1971/11/15', ativo:true,  valor:1001.50, sexo:'M', vl:413},
    {id:32, nome: 'Curaca  ',   data:'1971/11/16', ativo:false, valor:991001,  sexo:'F', vl:414},
    {id:33, nome: 'Coronel   ', data:'1971/11/17', ativo:true,  valor:10.10,   sexo:'M', vl:415},
    {id:34, nome: 'SantolÃ­dio', data:'1971/11/18', ativo:true,  valor:1001.2,  sexo:'F', vl:516},
    {id:35, nome: 'General',    data:'1971/11/19', ativo:false, valor:991001,  sexo:'F', vl:517},
    {id:36, nome: 'Salsicha',   data:'1971/11/20', ativo:true,  valor:10.10,   sexo:'M', vl:518},
    {id:37, nome: 'Chimbinha',  data:'1971/12/01', ativo:false, valor:991001,  sexo:'F', vl:519},
    {id:38, nome: 'Barney',     data:'1971/12/02', ativo:true,  valor:10.10,   sexo:'M', vl:611},
    {id:39, nome: 'PescoÃ§o',    data:'1971/12/03', ativo:true,  valor:1001.2,  sexo:'F', vl:612},
    {id:40, nome: 'Madruga',    data:'1971/12/04', ativo:true,  valor:1001.2,  sexo:'F', vl:613}
]});

//j$.Resource.Store.show({resource:{name:'papel'}, record:{idPapel:1}, responseHandler:function(json){console.log(json)}});
//console.log(j$.Resource.Store.exists('uf'));
//console.log(j$.Resource.Store.exists(CONFIG.RESOURCE.CONTEXT +'uf'));
//console.log(j$.Resource.Store.exists('ufs'));



// j$.$R.assunto.filter({txTitulo:'SUAD', idCategoriaAssunto:3})
// Assunto.actionController.refresh(criteria, {filter:true})

// sortDemo = function(currentRow, nextRow){
//     var currentVal = DATATYPE.NUMBER.parse(currentRow.idCategoriaAssunto);
//     var nextVal    = DATATYPE.NUMBER.parse(nextRow.idCategoriaAssunto);
//     var r = 0;
//     if (currentVal < nextVal)
//         r = -1;
//     else if (currentVal > nextVal)
//         r = 1;
//     return r;
// };
// j$.$R.assunto.orderBy(sortDemo,"idCategoriaAssunto")
// j$.$R.assunto.orderBy(j$.$S.Assunto.Fieldset.c$.idCategoriaAssunto.sortOrder(),"idCategoriaAssunto")
//j$.$R.assunto.put(13,{idAssunto: "13", idCategoriaAssunto: "1", txTitulo: "TesteW"})
