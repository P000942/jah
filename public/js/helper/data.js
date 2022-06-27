const [cep, optCep] 
    = [69036800
    , {method:'GET'}];
const urlCep = `https://viacep.com.br/ws/${cep}/json`;

/* fetch(urlCep, optCep)
     .then(response=> {
         response.json()
         .then(data=> console.log(data))
     })
     .catch(err    => 
        console.log('erro:'+err,messge)
        )
;     */ 
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
j$.Resource.create({name:'estadoCivil'
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
