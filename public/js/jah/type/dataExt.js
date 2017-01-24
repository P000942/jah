//console.log(['name','key'].indexOf('keys'));
//console.log(" Geraldo Gomes ".split(/\s/gi));
function i$(id) {
    return document.getElementById(id);
}

Element.prototype.content= function(value){
  if (value == undefined){
    var value = '';
    switch(dataExt.type(this)){
      case 'HTMLSelectElement':
        value = this.selectedIndex;
        break;
      case 'HTMLInputElement':
        if (this.type == "radio" || this.type == "checkbox")
          value = this.checked;
        if (this.type == "text" || this.type == "hidden")
          value = this.value;
          break;
      default:
        value= this.textContent;
    }
    return value;
  }else{
    switch(dataExt.type(this)){
      case 'HTMLSelectElement':
        this.value = value;
        break;
      case 'HTMLInputElement':
        if (this.type == "radio" || this.type == "checkbox")
          this.checked = value;
        if (this.type == "text" || this.type == "hidden")
          this.value = value;
          break;
      default:
        this.textContent=value;
    }
  }
}

String.prototype.trim = function(){
    return this.replace(/^\s*/, "").replace(/\s*$/, "");
}

// TESTE: '   tete  '.trim()
String.prototype.isEmpty = function(){
    if(this==null){return true;};
    if(this.trim().length==0){return true;};
    return false;
}
//Test.isEmpty(' ');Test.isEmpty(''); Test.isEmpty('_');

String.prototype.repeat = function (n){
  var r="";
  var s=this;
  for (var a=0;a<n;a++)
      r+=s;
  return r;
}
// TESTE: 'X'.repeat(10)

String.prototype.noAccent = function (){
  var r=this; var hash={a:'áàã', e:'éê', i:'í', o:'ÓÔ', u:'úü', c:'ç', n:'ñ'};
  for (var key in hash){
      //er = '(/[' +hash[key]+ ']/gi)';
      r = r.replace(eval('(/[' +hash[key]+ ']/g)'),key);
      r = r.replace(eval('(/[' +hash[key].toUpperCase()+ ']/g)'),key.toUpperCase());
  }
  return r;
};
// TESTE: 'X'.repeat(10)

String.prototype.toCapitalize = function (){
  var r=this.split(/\s/gi); var text='';
  for (var i=0; r.length>i;i++){
      text += r[i].trim().substr(0,1).toUpperCase() + r[i].trim().substr(1).toLowerCase() + ' ';
  }
  return text;
};
String.prototype.toFirstLower = function (){
   return this.replace(/^[A-Z]/,this[0].toLowerCase())
};
String.prototype.toFirstUpper = function (){
   return this.replace(/^[a-z]/,this[0].toUpperCase())
};
String.prototype.toSeparate = function (delimiters){
  var text='';
  if (dataExt.isArray(delimiters)){
      for (var i=0; delimiters.length > i;i++)
          text += delimiters[i];
  } else {
    text += delimiters;
  }
  return this.split(eval('(/['+ text +']/gi)'));
 // return r.join(' ');
};
//"jose_geraldo.gomes-final".r.toSeparate("_.-");

String.prototype.toCaption = function (delimiters){
   if (delimiters==undefined)
      delimiters = '_.-';
   var ar =  this.toSeparate(delimiters);
   for (var i=0; ar.length>i;i++)
       ar[i]=ar[i].stripChar('_.<>*!$&;:"\'@+#-%^)(').trim(); // Remove Caracteres
   return ar.join(' ').toCapitalize().trim();
};
//"jose_geraldo.gomes-final".r.toCaption("_.-");

String.prototype.toKey = function (){
  var r=this;
  r = r.stripChar('_.<>*!$&;:"\'@+#%^)(-'); //Remove Caracteres
  r = r.toCapitalize();
  r = r.replace(/\s/gi,''); // Remove espaços
  r = r.noAccent();  // Troca as Letras acentuadas
  return r;
};
//"id_nome&mt.for-da$xxx&".toKey()

String.prototype.stripChar = function (delimiters){
  var r =this; var text=''; var er='';
  if (dataExt.isArray(delimiters)){
      for (var i=0; delimiters.length > i;i++)
          text += delimiters[i];
  } else {
    text += delimiters;
  }

  if (delimiters==undefined || text.isEmpty())
     er = '(/[ ]/gi)';
  else
     er = '(/['+ text +']/gi)';
  r = r.replace(eval(er),'');
  return r;
};
//alert('04.150.945-5'.stripChar(['.','-'])); alert('04 150.945-5'.stripChar(['.','-', ' ']));
//alert('04.150.945-5'.stripChar('.-')); alert('04 150.94 55/0001-5'.stripChar('/. -'));
//alert('04 150.945-5'.replace(/\s|[.-]/gi, ''));
//console.log("José Geraldo Ferreira Gomes".replace(/\s|[' ']/gi, ''));


//window.document.write("<span id='w_len' style='display:none;'>X</span>");
/*Função que padroniza valor*/
function numberFormat( number, decimals, dec_point, thousands_sep ) {
    // %        nota 1: Para 1000.55 retorna com precisão 1
    //                 no FF/Opera é 1,000.5, mas no IE é 1,000.6
    // *     exemplo 1: number_format(1234.56);
    // *     retorno 1: '1,235'
    // *     exemplo 2: number_format(1234.56, 2, ',', ' ');
    // *     retorno 2: '1 234,56'
    // *     exemplo 3: number_format(1234.5678, 2, '.', '');
    // *     retorno 3: '1234.57'
    // *     exemplo 4: number_format(67, 2, ',', '.');
    // *     retorno 4: '67,00'
    // *     exemplo 5: number_format(1000);
    // *     retorno 5: '1,000'
    // *     exemplo 6: number_format(67.311, 2);
    // *     retorno 6: '67.31'

    var n = number, prec = decimals;
    n = !isFinite(+n) ? 0 : +n;
    prec = !isFinite(+prec) ? 0 : Math.abs(prec);
    var sep = (typeof thousands_sep == "undefined") ? '.' : thousands_sep;
    var dec = (typeof dec_point == "undefined") ? ',' : dec_point;

    var s = (prec > 0) ? n.toFixed(prec) : Math.round(n).toFixed(prec);
      //fix for IE parseFloat(0.55).toFixed(0) = 0;

    var abs = Math.abs(n).toFixed(prec);
    var _, i;

    if (abs >= 1000) {
        _ = abs.split(/\D/);
        i = _[0].length % 3 || 3;

        _[0] = s.slice(0,i + (n < 0)) +
              _[0].slice(i).replace(/(\d{3})/g, sep+'$1');

        s = _.join(dec);
    } else {
        s = s.replace('.', dec);
    }

    return s;
}

var dateFormat = function () {
	var	token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
		timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
		timezoneClip = /[^-+\dA-Z]/g,
		pad = function (val, len) {
			val = String(val);
			len = len || 2;
			while (val.length < len) val = "0" + val;
			return val;
		};

	// Regexes and supporting functions are cached through closure
	return function (date, mask, utc) {
		var dF = dateFormat;

		// You can't provide utc if you skip other args (use the "UTC:" mask prefix)
		if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
			mask = date;
			date = undefined;
		}

		// Passing date through Date applies Date.parse, if necessary
		date = date ? new Date(date) : new Date;
		if (isNaN(date)) throw SyntaxError("Data Inv�lida");

		mask = String(dF.masks[mask] || mask || dF.masks["default"]);

		// Allow setting the utc argument via the mask
		if (mask.slice(0, 4) == "UTC:") {
			mask = mask.slice(4);
			utc = true;
		}

		var	_ = utc ? "getUTC" : "get",
			d = date[_ + "Date"](),
			D = date[_ + "Day"](),
			m = date[_ + "Month"](),
			y = date[_ + "FullYear"](),
			H = date[_ + "Hours"](),
			M = date[_ + "Minutes"](),
			s = date[_ + "Seconds"](),
			L = date[_ + "Milliseconds"](),
			o = utc ? 0 : date.getTimezoneOffset(),
			flags = {
				d:    d,
				dd:   pad(d),
				ddd:  dF.i18n.dayNames[D],
				dddd: dF.i18n.dayNames[D + 7],
				m:    m + 1,
				mm:   pad(m + 1),
				mmm:  dF.i18n.monthNames[m],
				mmmm: dF.i18n.monthNames[m + 12],
				yy:   String(y).slice(2),
				yyyy: y,
				h:    H % 12 || 12,
				hh:   pad(H % 12 || 12),
				H:    H,
				HH:   pad(H),
				M:    M,
				MM:   pad(M),
				s:    s,
				ss:   pad(s),
				l:    pad(L, 3),
				L:    pad(L > 99 ? Math.round(L / 10) : L),
				t:    H < 12 ? "a"  : "p",
				tt:   H < 12 ? "am" : "pm",
				T:    H < 12 ? "A"  : "P",
				TT:   H < 12 ? "AM" : "PM",
				Z:    utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
				o:    (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
				S:    ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
			};

		return mask.replace(token, function ($0) {
			return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
		});
	};
}();

// Some common format strings
dateFormat.masks = {
	"default":      "dd/mm/yyyy",
	shortDate:      "d/m/yy",
	mediumDate:     "mmm d, yyyy",
	longDate:       "mmmm d, yyyy",
	fullDate:       "dddd, mmmm d, yyyy",
	shortTime:      "h:MM TT",
	mediumTime:     "h:MM:ss TT",
	longTime:       "h:MM:ss TT Z",
	isoDate:        "yyyy-mm-dd",
	isoTime:        "HH:MM:ss",
	isoDateTime:    "yyyy-mm-dd'T'HH:MM:ss",
	isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
};

// Internationalization strings
dateFormat.i18n = {
	dayNames: [
		"Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab",
		"Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "S�bado"
	],
	monthNames: [
		"Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dec",
		"Janeiro", "Fevereiro", "Mar�o", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
	]
};

// For convenience...
Date.prototype.format = function (mask, utc) {
	return dateFormat(this, mask, utc);
};

var Test = function(){
    return{Date:function(value){console.log("isDate('"    +value+ "'):"+ value.isDate())},
          Digit:function(value){console.log("isDigit('"   +value+ "'):"+ value.isDigit())},
         Letter:function(value){console.log("isLetter('"  +value+ "'):"+ value.isLetter())},
        Integer:function(value){console.log("isInteger('" +value+ "'):"+ value.isInteger())},
        Numeric:function(value){console.log("isNumeric('" +value+ "'):"+ value.isNumeric())},
          Money:function(value){console.log("isMoney('"   +value+ "'):"+ value.isMoney())},
          Email:function(value){console.log("isMail('"    +value+ "'):"+ value.isEmail())},
           Hour:function(value){console.log("isHour('"    +value+ "'):"+ value.isHour())},
         isName:function(value){console.log('"' +value+ '".isName() -> '+ value.isName())},
          Phone:function(value){console.log("Phone('"     +value+ "'):"+ value.isPhone())},
           Mask:function(value,mask){console.log("'"+value+"'.mask("+mask+"):"+ value.mask(mask))},
  isValidInMask:function(value,mask){console.log("'"+value+"'.isValidInMask("+mask+"):"+ value.isValidInMask(mask))},
          Empty:function(value){console.log("isEmpty('"   +value+ "'):"+ value.isEmpty())}
    }
}();

var Testa = function(){
    return{CPF:function(value){console.log('ehCpf('     +value+ '):'+ value.ehCpf())},
          CNPJ:function(value){console.log('ehCnpj('    +value+ '):'+ value.ehCnpj())},
           CCA:function(value){console.log('ehCca('     +value+ '):'+ value.ehCca())},
           CEP:function(value){console.log('ehCep('     +value+ '):'+ value.ehCep())},
         Placa:function(value){console.log('ehPlaca('    +value+ '):'+ value.ehPlaca())},
          AIDF:function(value){console.log('ehAidf('    +value+ '):'+ value.ehAidf())},
          CNAE:function(value){console.log('ehCNAE('    +value+ '):'+ value.ehCNAE())},
      Processo:function(value){console.log('ehProcesso('+value+ '):'+ value.ehProcesso())},
digitoModule11:function(value,dig,lim){console.log('Module11('   +value+ '):'+ value.module11(dig,lim))},
     digitoCpf:function(value,dig,lim){console.log('digitoCpf('  +value+ '):'+ value.digitoCpf())},
    digitoCnpj:function(value,dig,lim){console.log('digitoCnpj(' +value+ '):'+ value.digitoCnpj())},
    digitoCca:function(value,dig,lim){console.log('digitoCca('   +value+ '):'+ value.digitoCca())}
    }
}();


String.prototype.regexValidate = function(regularExpression){
    if (this.isEmpty()){return false;}
    return (!this.match(regularExpression))?false:true;
}

String.prototype.module11 = function(nrDigit, limiteMult)  {
   var dig;
   var NumDig = (nrDigit)?nrDigit:1;
   var LimMult = (limiteMult)?limiteMult:this.length;
   var value = this;

   var Soma = 0;
   var Mult = 2;
      for(i=value.length-1; i>=0; i--)      {
         Soma += (Mult * parseInt(value.charAt(i)));
         if(++Mult > LimMult) Mult = 2;
      }
      dig =((Soma * 10) % 11) % 10;
      if (NumDig>1)
          dig += ''+(value+dig).module11(--NumDig,LimMult);

    return dig;
}
//Testa.digitoModule11('417660402',2,12); Testa.digitoModule11('04150945');Testa.digitoModule11('073114610001',2,9);

String.prototype.digitoCpf = function()  {
  return this.module11(2,12);
}
String.prototype.digitoCnpj = function()  {
  return this.module11(2,9);
}
String.prototype.digitoCca = function()  {
  return this.module11();
}
//Testa.digitoCpf('417660402'); Testa.digitoCca('04150945');Testa.digitoCnpj('073114610001');

String.prototype.ehCpf = function()  {
    var digito = this.substr(this.length-2,2);
    var num = this.substr(0,this.length-2);
    var digito_ok = num.digitoCpf();
    return (digito_ok == digito )?true:false;
}
//Testa.CPF('41766040268'); Testa.CPF('41766040267');
String.prototype.ehCnpj = function()  {
    var digito = this.substr(this.length-2,2);
    var num = this.substr(0,this.length-2);
    var digito_ok = num.digitoCnpj();
    return (digito_ok == digito )?true:false;
}
//Testa.CNPJ('07311461000125'); Testa.CNPJ('07311461000124');
String.prototype.ehCca = function()  {
    var digito = this.substr(this.length-1,1);
    var num = this.substr(0,this.length-1);
    var digito_ok = num.digitoCca();
    return (digito_ok == digito )?true:false;
}
//Testa.CCA('041509455'); Testa.CCA('041509456');

String.prototype.ehCep = function(){
    var expReg =/^[0-9]{5}[-]{0,1}[0-9]{3}$/;
    return (!this.regexValidate(expReg))?false:true;
}
//Testa.CEP('69029-080'); Testa.CEP('6902-080'); Testa.CEP('69029-0801'); Testa.CEP('69029-80'); Testa.CEP('690219-080');


String.prototype.ehPlaca = function(){
    var expReg =/^[A-Z]{3}[-]{0,1}[0-9]{4}$/;
//    if (withoutMask)
//        expReg = /^[A-Z]{3}{0,1}[0-9]{4}$/;
    return (!this.regexValidate(expReg))?false:true;
}
//Testa.Placa('JXX-9999'); Testa.Placa('GG-1111'); Testa.Placa('JXG-10801'); Testa.Placa('JG1-1000'); Testa.Placa('JGG-G080');


// Esse � o script
String.prototype.isName = function(){
    var words = this.replace(/^\s*/, "").replace(/\s*$/, "").split(/\s/gi);
    var nameIsValid = (words.length>1);
    if (nameIsValid){
        for (var i=0; i<words.length; i++){
            nameIsValid = (words[i].length>1);
            if (!nameIsValid)
                break;
        }
    }
    return nameIsValid;
};

//// Aqui estão os testes
//// Observer que n�o estah considerando espacos em branco
//Test.isName(" Geraldo Gomes ");
//Test.isName(" Geraldo F. Gomes ");
//Test.isName(" Joseh Geraldo Gomes ");
//Test.isName(" Geraldo  ");
//Test.isName(" Geraldo A ");
//Test.isName(" A Gomes ");



String.prototype.isLetter = function(){
//    return (!this.regexValidate(/^[:alpha:]/))?false:true;
    if (this.isEmpty()){return false;}
    var alfabeto = "ABCDEFGHIJKLWMNOPQRSTUVXYZ�ÁÉÍÓÚÃÕÊÔ ";
    var campo_maiusculo = this.toUpperCase();
    for (cont = 0; cont < campo_maiusculo.length; cont++ ){
            var parte_campo = campo_maiusculo.charAt(cont);
            if ( alfabeto.indexOf(parte_campo) == -1 )
               return false;
    }
    return true;
}
//Test.Letter('A'); Test.Letter('1'); Test.Letter('a'); Test.Letter('�'); Test.Letter('�');


String.prototype.isDigit = function(){
    return (!this.regexValidate(/^[0-9]{1,1}$/))?false:true;
}
//Test.Digit(''); Test.Digit('23,59'); Test.Digit('00,00'); Test.Digit('24');Test.Digit('1'); Test.Digit('A'); Test.Digit('100000001,1'), Test.Digit('1,A');Test.Digit('A,1');

String.prototype.isNumeric = function(){
    var expReg =/(\d{1,}[,]{1}\d{1,})|(^\d+$)/;
    return (!this.regexValidate(expReg))?false:true;
}
//Test.Numeric('23,59'); Test.Numeric('00,00'); Test.Numeric('24'); Test.Numeric('1');Test.Numeric('12,132'); Test.Numeric('A'); Test.Numeric('100000001,1'), Test.Numeric('1,A');Test.Numeric('A,1');

String.prototype.isInteger = function(){
    return (!this.regexValidate(/^[0-9]{1,}$/))?false:true;
}
//Test.Integer(''); Test.Integer('23,59'); Test.Integer('00,00'); Test.Integer('24');Test.Integer('1'); Test.Integer('A'); Test.Integer('100000001,1'), Test.Integer('1,A');Test.Integer('A,1');

String.prototype.isMoney = function(){
    //var expReg =/^[0-9]{1,}[,]{0,1}[0-9]{1,2}$/;
    var expReg =/^(\d{1,}[,]{1}\d{1,2}$)|(^\d+$)/;
    return (!this.regexValidate(expReg))?false:true;
}
//Test.Money('23,59'); Test.Money('00,00'); Test.Money('24');Test.Money('12,132'); Test.Money('A'); Test.Money('100000001,1'), Test.Money('1,A');Test.Money('A,1');

String.prototype.isDate = function(){
    var expReg = /^((((0?[1-9]|[12]\d|3[01])[\.\-\/](0?[13578]|1[02])[\.\-\/]((1[6-9]|[2-9]\d)?\d{2}))|((0?[1-9]|[12]\d|30)[\.\-\/](0?[13456789]|1[012])[\.\-\/]((1[6-9]|[2-9]\d)?\d{2}))|((0?[1-9]|1\d|2[0-8])[\.\-\/]0?2[\.\-\/]((1[6-9]|[2-9]\d)?\d{2}))|(29[\.\-\/]0?2[\.\-\/]((1[6-9]|[2-9]\d)?(0[48]|[2468][048]|[13579][26])|((16|[2468][048]|[3579][26])00)|00)))|(((0[1-9]|[12]\d|3[01])(0[13578]|1[02])((1[6-9]|[2-9]\d)?\d{2}))|((0[1-9]|[12]\d|30)(0[13456789]|1[012])((1[6-9]|[2-9]\d)?\d{2}))|((0[1-9]|1\d|2[0-8])02((1[6-9]|[2-9]\d)?\d{2}))|(2902((1[6-9]|[2-9]\d)?(0[48]|[2468][048]|[13579][26])|((16|[2468][048]|[3579][26])00)|00))))$/;
    return (!this.regexValidate(expReg))?false:true;
}
//Test.Date('29/02/2011'); Test.Date('28/02/2011'); Test.Date('29/02/2008');Test.Date('31/04/2011'); Test.Date('31/05/2011'); Test.Date('31/08/2008');

String.prototype.isHour = function(){
    var expReg =/^([0-1][0-9]|[2][0-3]):[0-5][0-9]$/;
    return (!this.regexValidate(expReg))?false:true;
}
//Test.Hour('23:59'); Test.Hour('00:00'); Test.Hour('24:00');Test.Hour('12:00'); Test.Hour('25:00'); Test.Hour('12:60');

String.prototype.isPhone = function(withoutMask){
    var expReg =/\(?\d{3}\)?\d{4}-\d{4}/;
    if (withoutMask)
        expReg = /\d{11}/;
    return (!this.regexValidate(expReg))?false:true;
}
//Test.Phone('(092)8122-0911'); Test.Phone('(092)81220911'); Test.Phone('(092) 8122-0911');Test.Phone('(92)8122-0911'); Test.Phone('8122-0911'); Test.Phone('12:60');

String.prototype.isEmail = function(){
    var expReg = /^[A-Za-z0-9_\-\.]+@[A-Za-z0-9_\-\.]{2,}\.[A-Za-z0-9]{2,}(\.[A-Za-z0-9])?/;
    return (!this.regexValidate(expReg))?false:true;
}
Boolean.prototype.isEmpty = function(){
    return false;
}
//Test.Email('abc@xiba.com'); Test.Email('abc@xiba'); Test.Email('abc_xiba');

String.prototype.mask = function(mask){
    mask =mask.replace(/[#]/g,'9'); // para adequar as m�scaras usadas na edi��o
    mask =mask.replace(/[@]/g,'X'); // para evitar que retira quando da remo��o de todos os caracteres especiais;
    mask = (mask=='9,99')?'999.999.999.999,99':mask;
    var value=this.stripChar(mask.replace(/\w|[@]/g,"")); // Retira os separadores, caso estejam no valor;
    value=stuff(value.trim(), mask.replace(/\W/g,""));
    var masks=mask.replace(/\W/g," ").split(' '); // monta um array  com as m�scaras - sem os separadores
    var separators=$A(mask.replace(/\w/g,"")); // monta um array  com os separadores
    var startSeparator = (mask[0].match(/\W/))?mask[0]:''; // Pega o separador, quando tem na primeira posi��o
    var formattedText="";
    var initPosition = 0;
    for (i=0;i<masks.length;i++){
        var separator=separators[i]?separators[i]:'';
        var maskSplit =  masks[i].trim()// pegar parte da m�scara para a formata��o
        var part = value.substr(initPosition, maskSplit.length);  // pega a parte que indicada na m�scara, segunda separador
        var maskedText = '';
        for (k=0;k<part.length;k++){
            var character = part[k];
            if (character==' ' && maskSplit[k]=='0')
                character=character.replace(character,'0');
            else if (maskSplit[k]=='A')
                character=character.toUpperCase();
            else if (maskSplit[k]=='a')
                character=character.toLowerCase();
            maskedText += character;
        }
        formattedText +=  maskedText + ((maskedText.isEmpty())?'':separator);
        initPosition += maskSplit.length;
    }
    return startSeparator + formattedText;
    // Completa com zeros a esquerda o valor informado;
    function stuff(value, mask){
        rest = mask.trim().length - value.length;
        return " ".repeat(rest) + value;
    }
};
//Test.Mask("1111222","9,99"); Test.Mask("11112011","##/##/####"); Test.Mask("11222","99.990,00"); Test.Mask("1","000.000");Test.Mask("9281220911","(000)0000-0000");
//Test.Mask("jgg1111","AAA-0000"); Test.Mask("JGG1111","aaa-0000");Test.Mask("jgG1111","@@@-0000");
//Test.Mask("jgg1111","AaA-0000");

String.prototype.isValidInMask = function(mask){
    mask =mask.replace(/[#]/g,'9'); // para adequar as m�scaras usadas na edi��o
    mask =mask.replace(/[@]/g,'X'); // para evitar que retira quando da remo��o de todos os caracteres especiais;
    var value=this.stripChar(mask.replace(/\w|[@]/g,"")).trim(); // Retira os separadores, caso estejam no valor;
    var masks=mask.replace(/\W/g,""); // remove os separadores
    var valid=false;
    for (i=0;i<masks.length;i++){
        var character = value[i];
        var maskChar=masks[i];

        if ('09'.indexOf(maskChar)!=-1){ //Valida se eh numero
            valid = character.isDigit();
        }else if('XAa'.indexOf(maskChar)!=-1){ //Valida letras
            valid = character.isLetter();
            if (valid){
                if ((maskChar=='A' && character!=character.toUpperCase())
                ||  (maskChar=='a' && character!=character.toLowerCase())){valida=false}
            }
        }
        if (!valid){return false}
    }
    return valid;
};
//Test.isValidInMask("1111","####");
//Test.isValidInMask("(92)111-abc","(99)999-aaa"); Test.isValidInMask("92111abc","(99)999-aaa"); Test.isValidInMask("(92)111-a1c","(99)999-aaa");
//Test.isValidInMask("1111","@###");
//Test.isValidInMask("A111","@###");


String.prototype.pixel = function(fontSize){
       i$('w_len').style.fontSize=fontSize + "px";
       i$('w_len').innerHTML = "X".repeat(this.length + 1);
       return {width:i$('w_len').getWidth(), height:i$('w_len').getHeight()};
}
//alert("123451234512".pixel(10).width);
//alert("123451234512".pixel(10).height);
String.prototype.point = function(fontSize){
	   i$('w_len').style.fontSize=fontSize + "pt";
       i$('w_len').innerHTML = "X".repeat(this.length + 1);
       return {width:i$('w_len').getWidth(), height:i$('w_len').getHeight()};
}
//alert("123451234512".point(10).width);
//alert("123451234512".point(10).height);

var dataExt = function(){
    return {
        init:function(){return true;}
      , type:function(obj){
             return Object.prototype.toString.call(obj).match(/^\[object (.*)\]$/)[1];
        }
      ,    isArray:function(obj){ return (dataExt.type(obj)==='Array');}
      ,   isString:function(obj){ return (dataExt.type(obj)==='String');}
      ,   isNumber:function(obj){ return (dataExt.type(obj)==='Number');}
      ,   isObject:function(obj){ return (dataExt.type(obj)==='Object');}
      , isFunction:function(obj){ return (dataExt.type(obj)==='Function');}
      ,  isDefined:function(obj){ return true;}
    };
}();
//if (dataExt.type('resource') == 'String')
//alert(dataExt.type({a:'1', b:'2'}))
//alert(dataExt.type(['1''2'))
//alert(dataExt.type(function(){return false}))

dataExt.format = function(){
    return {
        money:function(p_value){
           var decimal =2;
           var value = p_value.toString().replace(/[',']/gi,'.');
           return numberFormat(value, decimal);
        }
      ,record:function(name, parent){
          if (parent){
             parent.id   = 'id' +name.toFirstUpper();
             parent.text = 'tx' +name.toFirstUpper();
             return parent;
          } else {
             return {id: 'id'+name.toFirstUpper()
                 , text: 'tx'+name.toFirstUpper()};
          }
        }
    };
}();
//console.log(dataExt.type({a:1, b:2}))
//console.log(dataExt.type('a'))
//console.log(dataExt.type([1, 2]))
//console.log(dataExt.type(1))
// definir um valor para uma propriedade de um método, caso a mesma n�o seja informada;
Object.preset = function(object, propertie, defaultvalue){
    ///if (dataExt.type(propertie)=='Object'){
    if (dataExt.isObject(propertie)){
       for (var key in propertie){
           Object.preset(object, key, propertie[key]);
       }
    }else{
        if (object[propertie] == undefined){
            object[propertie] = defaultvalue;
        }else{
           if (object[propertie]==null)
              object[propertie] = defaultvalue;
           if (dataExt.isString(object[propertie]) && object[propertie].isEmpty())
              object[propertie] = defaultvalue;
        }
    }
    return object;
};
//var aux = {a:1,b:2}
//Object.preset(aux,'c',{x:1, y:2})
//aux = Object.preset({a:1,b:2},{x:1, y:2});
//aux = Object.preset({a:1,b:2,x:null,y:''},{x:1, y:2});
Object.join = function(receiver,provider, properties){
// Junta o objeto provider ao objeto receiver
    if (properties) { // Um Join apenas com algumas propriedades
       for(var i=0; i<properties.length; i++)
          Object.preset(receiver, properties[i], provider[properties[i]]);
    } else { // Um Join com todas as propriedades
       for (var key in provider){
           Object.preset(receiver, key, provider[key]);
       }
    }
    return receiver;
};
//var aux = {a:1,b:2}
//Object.join(aux,{x:1, y:2},['x'])
//aux = Object.join({a:1,b:2},{x:1, y:2});
//aux = Object.join({a:1,b:2,x:null,y:''},{x:1, y:2});
Object.merge = function(server,provider, properties){
// Junta o objeto server e provider em objeto receiver
    var receiver={};

    if (properties) { // Um Merge apenas com algumas propriedades
       for(var i=0; i<properties.length; i++){
          Object.preset(receiver, properties[i], server[properties[i]]);
          Object.preset(receiver, properties[i], provider[properties[i]]);
       }
    } else { // Um Merge com todas as propriedades
       for (var key in server){ // copia todas as propriedades do SERVER para o RECEIVER
           receiver[key]= server[key];
       }
       Object.join(receiver,provider);
       // for (var key in provider){//
       //     Object.preset(receiver, key, provider[key]);
       // }
    }
    return receiver;
};
//var aux = {a:1,b:2}
//Object.merge(aux,{x:1, y:2},['x'])
//aux = Object.merge({a:1,b:2},{x:1, y:2});
//aux = Object.merge({a:1,b:2,x:null,y:''},{x:1, y:2});
Object.setIfExist = function(receiver, provider, properties){
    //SE EXISTIR NO PROVIDER,sobrescreve ou adiciona atributos definidos em Properties no RECEIVER
    if (dataExt.isArray(properties)){
       for (var idx=0; properties.length>idx;idx++){
           Object.setIfExist(receiver, provider, properties[idx]);
       }
    }else{
        if (provider[properties]!=undefined && provider[properties]!=null)
            receiver[properties] = provider[properties];
    }
    return receiver;
};
//var aux = {a:1,b:2}
//Object.setIfExist(aux,{c:4,d:'abc'},['c','d'])
//Object.setIfExist(aux,{c:4,d:'abc'},'c')
//Object.setIfExist(aux,{c:4,d:'abc'},['c','d','g'])
//Object.setIfExist(aux,{c:4,d:'abc'},'z')
Object.mixin=function(receiver,provider, methods){
    if (methods) { // Um Mixin fornecendo alguns métodos
       for (var i=0; i<methods.length; i++)
         receiver.prototype[methods[i]] = provider.prototype[methods[i]];
    } else { // Um Mixin fornecendo todos os métodos
      for (var method in provider.prototype) { // verificando se a classe receptora já possui tal método do loop...
        if (receiver.prototype[method]==undefined)
           receiver.prototype[method] = provider.prototype[method];
      }
    }
    return receiver;
}
// var Car = function(modelo, cor){this.modelo = modelo || 'Ford';  this.cor = cor || 'Yello'; };
// var carMixin = function(){};
// carMixin.prototype = {
//   acelerar: function(){console.log('acelera.'); }
//  ,parar: function(){console.log('parando o carro.');}
//  };
// Object.mixin(Car,carMixin,['acelerar']);
// Object.mixin(Car,carMixin);
// var fiat = new Car('Fiat','azul');
// fiat.acelerar();fiat.parar();

Object.compare = function(source, target, key){
// compara se conteúdo do literal target existe em source
    var r = true;
    if (key) { // compara por uma chave
        if (dataExt.isString(key)) // a chave de comparação é simples
           r = (source[key] == target[key])?true:false;
        else{ // a chave de comparação é composta por mais de um atributo
           for(var i=0; i<key.length;i++){
              if (source[key[i]] != target[key[i]])
                 return false;
           }
        }
    } else { // compara com todas as propriedades existente no objeto de comparação(target)
       for (var fld in target){
           if (source[fld] != target[fld])
              return false;
       }
    }
    return r;
};
// Object.compare({a:1, b:3, x:'A'}, {a:1, b:3, x:'A'},['a','b'])
// Object.compare({a:1, b:3, x:'A'}, {a:1, b:2, x:'A'},'a')
// Object.compare({a:1, b:3, x:'A'}, {a:1, b:3, x:'A'})
// Object.compare({a:1, b:3, x:'A'}, {a:1, b:3, y:'B'})
// Object.compare({a:1, b:3, x:'A'}, {a:1, b:3})

Function.prototype.inheritsFrom = function(parentClassOrObject){
  	if ( parentClassOrObject.constructor == Function ) 	{
		   //Normal Inheritance
		   this.prototype = new parentClassOrObject;
		   this.prototype.constructor = this;
		   this.prototype.parent = parentClassOrObject.prototype;
	  }else{
		   //Pure Virtual Inheritance
		   this.prototype = parentClassOrObject;
		   this.prototype.constructor = this;
	     this.prototype.parent = parentClassOrObject;
	  }
  	return this;
}
// function animal(nome){
// 	this.nome=nome;
//   this.grite=function(){console.log(this.nome+" Miau.......");};
// }
// function Gato( nome ){
// 	this.nome=nome;
// }
// Gato.inheritsFrom( animal );
// var felix = new Gato( "Felix" );
// felix.grite();

Array.prototype.each = function(callback /*, parms*/){
    var len = this.length;
    if (typeof callback != "function")
       throw new TypeError();

    //var parms = arguments[1];
    for (var i = 0; i < len; i++){
      if (i in this)
    	  callback(this[i]);
    	  //callback.call(parms, this[i], i, this);
    }
};

Array.prototype.has = function(value){
   return (this.indexOf(value)>-1)?true:false;
};
// var aux = [1,'test',2]; aux.has(1);aux.has('test');aux.has(4)
// Alias para o each
Array.prototype.sweep = Array.prototype.each

Array.prototype.exists = function(item, callback){
    var len = this.length;
    if (typeof callback != "function")
       throw new TypeError();

    for (var i = 0; i < len; i++){
        if (i in this){
    	   if (callback(item, this[i]))
    	      return true;
        }
    }
    return false;
};

if (System.api.jquery){
    function $A(iterable) {
        if (!iterable) return [];
        //if ('toArray' in Object(iterable)) return iterable.toArray();
        var length = iterable.length || 0, results = new Array(length);
        while (length--) results[length] = iterable[length];
        return results;
    }

    Element.prototype.stylize = function(properties) {
        if (properties){
            if (typeof properties =='string'){
               if (properties.match(/[:;]/gi)==null) //Se tem ':' eh uma string com style
                   this.className = properties;
               else                             //senao, pode ser o nome de uma class
                   this.style.cssText = properties;
            }else{
                for (var att in properties){
                    if (att.trim().toLowerCase() == 'clas$')
                        this.className = properties[att];
                    else
                       this.style[att]=properties[att];
                }
            }
        }
    }
    Element.prototype.insert = function(content) {
        var id = "#" + this.id;
        if (dataExt.isString(content)){
            $(id).append(content);
        }else{
            if (content.after)
               $(id).after(content.after);
            if (content.bottom)
               $(id).append(content.bottom);
            if (content.before)
               $(id).before(content.before);
            if (content.top)
               $(id).prepend(content.top);
        }
    }
    Element.prototype.remove = function() {
        $("#" + this.id).remove();

    }
    Element.prototype.addClassName = function(className) {
        $("#" + this.id).addClass(className);
    }
    Element.prototype.hide = function() {
        $("#" + this.id).hide();
    }
    Element.prototype.show = function() {
        $("#" + this.id).show();
    }
    Element.prototype.toggle = function() {
        $("#" + this.id).toggle();
    }
    Event.observe = function(node, event, callback) {
        var element = null;
        if (dataExt.isString(node))
            element = $("#" + node);
        else
            element = $("#" + node.id);
        element.bind(event, callback);
     }
    Event.element=function(event){return event.target}
    // Object.toJSON = function(object){
    //     return $.toJSON(object);
    // }
    //   var aux=[1, 2,3];
    //   console.log(aux.collect( function(item){ return (item*2);} ));
    Array.prototype.collect = function(callback){
        var results = [];
        if (typeof callback != "function")
            throw new TypeError();

        for (var i = 0; i < this.length; i++){
            if (i in this){
                   results.push(callback(this[i]));
            }
        }
        return results;
    };

   //var aux=[{a:1, b:2},{a:2, b:2},{a:3, b:2},{a:4, b:2}]
   //console.log(aux.select( function(item){ return (item.a<3);} ));
    Array.prototype.select = function(callback /*, parms*/){
        var results = [];
        if (typeof callback != "function")
        throw new TypeError();

        for (var i = 0; i < this.length; i++){
            if (i in this){
               if (callback(this[i]))
                   results.push(this[i]);
            }
        }
        return results;
    };
    Array.prototype.find = function(callback){
        if (typeof callback != "function")
            throw new TypeError();
        for (var i = 0; i < this.length; i++){
            if (i in this){
               if (callback(this[i]))
                   return this[i];
            }
        }
    };
}

  function prepareReplacement(replacement) {
    if (dataExt.isFunction(replacement)) return replacement;
    var template = new Template(replacement);
    return function(match) { return template.evaluate(match) };
  }
String.prototype.startsWith=function(pattern) {
    return this.lastIndexOf(pattern, 0) === 0;
  }
 String.interpret= function(value) {
    return value == null ? '' : String(value);
  }
String.prototype.gsub=function(pattern, replacement) {
    var result = '', source = this, match;
    replacement = prepareReplacement(replacement);

    if (dataExt.isString(pattern))
      pattern = RegExp.escape(pattern);

    if (!(pattern.length || pattern.source)) {
      replacement = replacement('');
      return replacement + source.split('').join(replacement) + replacement;
    }

    while (source.length > 0) {
      if (match = source.match(pattern)) {
        result += source.slice(0, match.index);
        result += String.interpret(replacement(match));
        source  = source.slice(match.index + match[0].length);
      } else {
        result += source, source = '';
      }
    }
    return result;
  }


function Template(template, pattern) {
  var $this=this;
  var initialized= function() {
    $this.template = template.toString();
    $this.pattern = pattern || Template.Pattern;
  }();

  this.evaluate= function(object) {
    // if (object && dataExt.isFunction(object.toTemplateReplacements))
    //    object = object.toTemplateReplacements();

    return $this.template.gsub($this.pattern, function(match) {
       if (object == null) return (match[1] + '');

       var before = match[1] || '';
       if (before == '\\') return match[2];

       var ctx = object, expr = match[3],
          pattern = /^([^.[]+|\[((?:.*?[^\\])?)\])(\.|\[|$)/;

       match = pattern.exec(expr);
       if (match == null) return before;

       while (match != null) {
         var comp = match[1].startsWith('[') ? match[2].replace(/\\\\]/g, ']') : match[1];
         ctx = ctx[comp];
         if (null == ctx || '' == match[3]) break;
         expr = expr.substring('[' == match[3] ? match[1].length : match[0].length);
         match = pattern.exec(expr);
      }
      return before + String.interpret(ctx);
    });
  }
};
Template.Pattern = /(^|.|\r|\n)(#\{(.*?)\})/;
// var myDiv = new Template("<div class='page' id='#{id}'></div>");
// myDiv.evaluate({id:'id.999'});
