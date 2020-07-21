


Element.prototype.isEqual= function(valueCompare){
    // esta funcao soh existe para compatibilizar os valores de entrada dos selects
    // inicialmente tem valor = -1, mas por padrao ter�o valor (0="Selecionar")
    // -> Aqui eh compatibilizado o valor 0 ou -1 s�o considerados sem valor selecionado
    let value= this.state();
    // if (dataExt.type(this)== 'HTMLSelectElement' && value==0)
    //   value=-1;
    return (value == valueCompare);
}



  function $elect(Properties){
        let SELF = this
          , list = null
          , dataSource = {};
        this.populate=populate;
        this.clear=clear;
        this.select = null;
        function initilize(){
            if (Properties){
                if (Properties.id != undefined)
                    SELF.select = i$(Properties.id);
                if (Properties.list){
                    list = Properties.list;
                    if (Properties.list.dataSource){
                        // montar o registro de uma forma que facilite o acesso
                        for (let idx=0;idx<Properties.list.dataSource.length;idx++){
                            let record = Properties.list.dataSource[idx];
                            dataSource[record[Properties.list.id]] = record;
                        }
                        if (Properties.populate)
                            SELF.populate();
                    }
                }/*else{
                    if (Properties.callback)
                        Properties.callback(SELF);
                }  */
            }
            this.size = maxlen(dataSource);
         }
         this.create=function(id, wrap) {
              wrap.insert("<select id='" +id+ "' name='" +id+ "'></select>");
              SELF.select = i$(id);
         }
         this.text = function(p_value){
              let value=SELF.value(p_value)
              , record = dataSource[value]
              ,   item = (record[list.text])?record[list.text]:"";
              return item;
         }
         
         this.value = function(p_value){
                let value='';
                if (p_value != undefined)
                    value=p_value;
                else{
                    if (SELF.select != undefined){
                        let index=SELF.select.selectedIndex;
                        let options= SELF.select.options;
                        value=options[index].value;
                    }
                }
                return value.trim();
         }

         this.exists = function(value){
             return (dataSource[value])?true:false;
         }
         function populate(parm){
             let create = false;
             if (parm==undefined)
                 parm={};
             SELF.clear();
             if (parm.dataSource!=undefined)
                 dataSource=parm.dataSource
             for(key in dataSource){
                 create = true;
                 let record = dataSource[key]
                 if (parm.callback) // checa alguma condicao para ver se cria ou nao o objeto
                     create=parm.callback(key,record);
                 if (Properties.callback) // checa alguma condicao para ver se cria ou nao o objeto
                     create=Properties.callback(key,record);
                 if (create)
                     SELF.option.add(key,record[list.text]);
             }
         }
         function clear(){
             SELF.select.innerHTML="";
         }
         this.add=function(record){
             console.log(record);
         }
         this.option=function option(){
            return{
                hide:function(index){
                    let option=SELF.select.options[index];
                    option.style.display = 'none';
                }
              , add:function(value, text){
                     let option=document.createElement("option");
                     option.text = text;
                     option.value = value;
                     if (Properties.defaultValue != undefined){
                        if (key==Properties.defaultValue)
                           option.selected=true;
                     }
                     SELF.select.add(option,SELF.select.options[null])
              }
              , show:function(index){
                    let option=SELF.select.options[index];
                    option.style.display = 'block';
                }
              , each:function(callback){
                  for (let idx=0;idx<SELF.select.options.length;idx++){
                  let option = SELF.select.options[idx];
                  let record = dataSource[option.value];
                      if (callback)
                          callback(idx, option, record);
                  }
              }
            }
         }()
         function maxlen(dataSource){
              let max = 0;
              for(key in dataSource){
                 let record =dataSource[key];
                 let item = record[list.text];
                 if (item.length > max)
                      max = item.length;
              }
              return max;
         }
         initilize();
  }
