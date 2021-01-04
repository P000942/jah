import j$               from  "./jah/api/dataExt.js";  
import {CONFIG, c$}     from  "./jah/config.js";
//import {i$, System, j$} from  "./jah/api/system.js";
// import TYPE             from  "./jah/ui/type.js";  
console.log('MAIN>> Passei aqui');
ver(j$.Ext, 'j$.Ext');
ver(c$, 'c$');
ver(CONFIG, 'CONFIG');
// ver(System, 'System');
// ver(j$.ui, 'j$.ui');
// console.log(TYPE);
function ver(obj, key){
    console.log(`${key} >>`);    
    console.log(obj);    
}