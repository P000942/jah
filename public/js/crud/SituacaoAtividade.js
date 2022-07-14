
j$.Service.create("SituacaoAtividade",
     {  resource:{name:'situacaoAtividade', id:'idSituacaoAtividade'}
     , Interface:{
           container:CONFIG.LAYOUT.ID
              , title:'Situação da Atividade'
              , List:true

      }
      , fieldset: {
                idSituacaoAtividade:TYPE.INTEGER(4,{label:'Código', readOnly:true}),
                txSituacaoAtividade:TYPE.CHAR(30,{label:'Situação', mandatory:true, title:'Informe a descrição para o campo.'})
        }
    });
