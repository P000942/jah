/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */


j$.service.createCrud("Papel"
           ,{fieldset:
           	   {idPapel:TYPE.INTEGER(4,{label:'Código', readOnly:true})
               ,txPapel:TYPE.CHAR(30,{label:'Papel', mandatory:true})}
            }   
       );