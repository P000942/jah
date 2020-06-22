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
               if (callback(this[i],i))
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