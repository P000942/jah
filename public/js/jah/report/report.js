/*====================Constantes==================*/
var Report = {};
Report.Util = function(){
    return {
        init:function(){
//                        //----- EstÃ¡ obtendo o parametro 'columns'
//                        urlColsDef = System.parameters('columns');
//                        //----- EstÃ¡ obtendo o parametro 'ds'
//                        if (urlColsDef)
//                           System.using(urlColsDef);
            urlDS = System.parameters('ds');
            if (urlDS)
               System.request(urlDS, imprime);
        },
        convertMMtoPT:function (vl){
           var vl_pol = vl / 25.4 //Convert para polegadas
           var vl_pt = vl_pol * 72;
           return Math.round( vl_pt * Math.pow( 10 , 2 ) ) / Math.pow( 10 , 2 );
        },
        convertPTtoMM: function (vl){
           var vl_pol = vl / 72 //Convert para polegadas
           var vl_mm = vl_pol * 25.4;
           return Math.round( vl_mm * Math.pow( 10 , 2 ) ) / Math.pow( 10 , 2 );
        },

        convertPXtoMM:function (vl){
           var vl_pol = vl / 94.5 //Convert para polegadas
           var vl_mm = vl_pol * 25.4;
           return Math.round( vl_mm * Math.pow( 10 , 2 ) ) / Math.pow( 10 , 2 );
        }
    }
}();
var MASK =  {DATE: 'dd/mm/yyyy',
             HOUR:'hh:mm:ss',
           NUMBER:{decimal:2, thousandSeparator:'.', decimalSeparator:','}};

var COLOR = {ON:'#F8F8FF', OFF:'#FFFFFF'};

// Medidas em milimetro 'mm'
var PAPER = {A4:{PORTRAIT:{height:'287', width:'202'}, LANDSCAPE:{height:'194', width:'289'}},
         LETTER:{PORTRAIT:{height:'269', width:'208'}, LANDSCAPE:{height:'206', width:'271'}},
          LEGAL:{PORTRAIT:{height:'345', width:'208'}, LANDSCAPE:{height:'206', width:'347'}}
            };


var DEFAULT = {DETAIL:{COLUMN:{FONT:{size:10, bold:false}}},
               HEADER:{COLUMN:{FONT:{size:10, bold:true }}},
               PAGE:{PAPER:PAPER.A4.PORTRAIT},
               MASK:MASK};
/*==================================================*/

var ReportFactory = function(){
    var reports = [];
    return{
        create:function(page, Fieldset, dataset, id_div){
            reports.push(new j$.Report(page, Fieldset, dataset, id_div, reports.length));
            return reports[reports.length -1];
        },
        reports:function(idx){return reports[idx]},
        restore:function(){
             return {
                  Dataset: self.opener[self.name].Resource.Dataset,
                 Fieldset: self.opener[self.name].Fieldset,
                  caption: self.opener[self.name].Interface.title
             }
        }
    }
}();


j$.Report = function(page, Fieldset, dataset, id_div, idx){
   var $report = this;

   this.ops= function(a){alert(a);}
   this.newPage= function() {
            //this.preparePage();
            //var std_page = new Template("<div class='page' id='#{id}'></div>");
            //this.Page.id = "PG" + (this.Page.Control.number);
            $report.Page.id = "PG" + ($report.Page.Pager.Control.number);
            // Adiciona a pÃ¡gina ao hash de pÃ¡ginas
            $report.pages[$report.Page.id] ={page:$report.Page};
            //$report.pages.set($report.Page.id,{page:$report.Page});
            with ($report){
                // Inserir a div da pÃ¡gina no html
                let html = `<div class='page' id='${page.id}'></div>`;//std_page.evaluate(Page);
                $report.body.insert(html);
                // Define o tamanho da página
                let p_style =
                          {height: Page.Style.height  + 'mm', width: Page.Style.width  + 'mm',
                        marginTop: Page.Style.marginTop + 'mm',
                     marginBottom: Page.Style.marginBottom + 'mm',
                       marginLeft: Page.Style.marginLeft + 'mm',
                   marginBotRight: Page.Style.marginRight + 'mm'};
                i$(Page.id).stylize(p_style);
                // Imprime Cabeçalho
                if (Page.Header)
                    Header.write(Page);
                // Imprime Cabeçalho dos Detalhes
                HeaderDetail.write(Page);
                // Imprime Detalhes
                Detail.write(Page,$report.Dataset);
                // imprime o roda-peh
                if (Page.Footer)
                    Footer.write(Page);
            }
        }
        // Renderiza todas as páginas
  this.start= function(){
           with ($report.Page){
                while(Pager.next()){
                    $report.newPage();
                }
           }
        }
  this.sort=function(colName){
            $report.Columns.sortNone(colName);
            var field = $report.Columns.Items[colName];
            $report.Dataset.orderBy(field.sortOrder());
            $report.clear();
            $report.Page.Pager.restart($report.Dataset);
            $report.start();
        }
  this.filter=function(event, colName, value){
             var field = $report.Columns.Items[colName];
             switch(event.button) {
               case MOUSE.BUTTON.CENTER:
                  $report.Columns.filterNone(colName);
                  $report.Dataset.filter($report.Columns.Items[colName], field.value(value));
                  $report.clear();
                  $report.Page.Pager.restart($report.Dataset);
                  $report.start()
               case MOUSE.BUTTON.RIGHT: break;
               case MOUSE.BUTTON.LEFT:break;
             }
      }
  this.clear= function(){
            $report.body.innerHTML = "";
            if (!i$('w-len'))
                this.body.insert("<span id='w-len'></span>");
        }
  this.sumHeight = function(obj){
            return obj.height + obj.marginTop + obj.marginBottom;
        }

  var initialized = function(){
        $report.id = "body";
        if (id_div)
            $report.id = id_div;

        $report.body = i$($report.id);
        $report.clear();

        var std_Header = {Style:{height:12.4, marginTop: 0, marginBottom:4},
                            Font:DEFAULT.HEADER.COLUMN.FONT,
                             Title:{line1:"", line2:"",line3:""}};
        var std_Detail = {Style:{height:0, marginTop: 0.5, marginBottom:0.5},
                            Header:{Font:DEFAULT.HEADER.COLUMN.FONT},
                              Font:DEFAULT.DETAIL.COLUMN.FONT};
        var std_Footer = {Style:{height:3.45, marginTop: 0, marginBottom:0},
                             note: '', date: NOW.format(DEFAULT.MASK.DATE),
                             hour: NOW.format(DEFAULT.MASK.HOUR)};
        var std_Page   = {Style:{height:0, width:0, marginTop: 0, marginBottom:0.5, marginLeft:1, MarginRight:1}
                          ,  id:'', Paper: DEFAULT.PAGE.PAPER, RowsPerPage:0};
        //self = $report;
        $report.idx = idx;
        $report.pages = {};//new Hash();
        $report.Dataset = dataset;
        $report.Page = Object.preset(page, std_Page);
        //$report.Page = std_Page.merge(page).toObject();
        // $report.Page.Header = (page.Header ==null || page.Header == undefined || page.Header == false)
        //                  ? null : std_Header.merge(page.Header).toObject();
        $report.Page.Header = (page.Header ==null || page.Header == undefined || page.Header == false)
                         ? null :Object.preset(page.Header, std_Header);

        // $report.Page.Footer =(page.Footer ==null || page.Footer == undefined || page.Footer == false)
        //                  ? null : std_Footer.merge(page.Footer).toObject();
        $report.Page.Footer =(page.Footer ==null || page.Footer == undefined || page.Footer == false)
                         ? null : Object.preset(page.Footer, std_Footer);

        //$report.Page.Detail = std_Detail.merge(page.Detail).toObject();
        $report.Page.Detail = Object.preset(page.Detail, std_Detail);
        //$report.Page.Record ={count:0, first:0, last:0, height:$report.Page.Detail.Font.size +1};
        $report.Page.Control ={limit: 0, height:$report.Page.Detail.Font.size +1};

        // $report.Page.HeaderDetail ={Style:{height:Report.Util.convertPTtoMM($report.Page.Detail.Header.Font.size +2),
        //                      marginTop: 0, marginBottom:4.0}};
        $report.Page.HeaderDetail ={Style:{height:$report.Page.Detail.Header.Font.size +3, marginTop: 0, marginBottom:1.4}};
        // Define colunas do relatório
        $report.Columns = Columns($report.Page, Fieldset);

        with($report.Page){
            // Define o tamanho da página (exluindo tb as margens
            Style.height = parseInt(Paper.height) - (Style.marginTop + Style.marginBottom);
            Style.width = parseInt(Paper.width);

            // Calculo o espaço para as linhas de detalhe - tamanhos de cabeçalho, margens, etc...
            detailSpace =($report.sumHeight(Detail.Style)
                        + (($report.Page.Header == null) ? 0 : $report.sumHeight(Header.Style))
                        + (($report.Page.Footer == null) ? 0 : $report.sumHeight(Footer.Style))
                        + $report.sumHeight(HeaderDetail.Style))//+ convertPTtoMM($report.Page.HeaderDetail.Style.height))

            Detail.Style.height = (Style.height - detailSpace)-2;
    //            console.log(Style.height);
    //            console.log(detailSpace);
    //            console.log(Detail.Style.height);
    //            console.log(Header.Style);
    //            console.log(HeaderDetail.Style);
    //            console.log(Detail.Style);
    //            console.log(Footer.Style);



            // calcula a quatidade de registros que cabe na página
            Control.limit = ((Detail.Style.height) / Math.round(Report.Util.convertPTtoMM(Control.height)));
            if ((Control.limit * Report.Util.convertPTtoMM(Control.height)) > Detail.Style.height)
                --Control.limit

            //$report.calcDataPage();

        }
        //console.log($report.Page.Control);
        $report.Page.Pager = $report.Dataset.createPager($report.Page.Control);//($report.Dataset,$report.Page.Control);
        //$report.Pager.show();

        $report.Header = ($report.Page.Header == null) ? null : new Header();
        $report.Footer = ($report.Page.Footer == null) ? null : new Footer();
        $report.HeaderDetail = new HeaderDetail($report.Columns, $report);
        $report.Detail = new Detail($report.Columns, $report);
    }();
};

//são as colunas do relatório
function Columns(page, Fieldset){
    var totalWidth = 0;
    me = this;
    this.Fieldset = Fieldset;
    prepare(page, Fieldset);

    function calculeSize(size, fontSize){
         i$('w-len').innerHTML = "<label style='font-size: " + fontSize + "pt;'>"
                              + "X".repeat(size + 1) + "</label>";
         return Report.Util.convertPXtoMM($('#w-len').innerWidth());
    }
    function prepare(page, Fieldset){
       //Para definir as colunas segundo os padroes, caso nao sejam informados
       //var cols = new Hash();
       var leftPos = 0;
       var idx = 0;
       for(key in Fieldset.Items){
          var field = Fieldset.Items[key];
          field.type = 'column';
          field.Report = {identicalSupress:true, size:0,
	                bold:false, hide:false,  style:null,
                        leftPos:0, first:false, last:false
                        };
          if (field.label.length == 0)
              field.label = this.id;
          //var column = new Column(fld)
          idx++;
          if (idx == 1)
             field.Report.first=true;

          if (idx == Fieldset.Items.length)
             field.Report.last=true;

          var colSize = calculeSize(field.size, page.Detail.Font.size);
          var labelSize = calculeSize(field.label.length, page.Detail.Header.Font.size);

          field.Report.size = colSize;
          if (field.Report.size < labelSize) // Caso seja menor que o label, o tamanho serÃ¡ o do label
             field.Report.size = labelSize;

          totalWidth += field.Report.size;
          //console.log(page.Paper.width  + ' totalWidth' + totalWidth)
          // Calcula posicao para a coluna
          field.Report.leftPos = leftPos;
          leftPos += (field.Report.size + 0) ;
          //aux.show = function(){ alert($H(aux).inspect())};
          //aux.prototype.show = function(){};
          //cols.set(field.id, field);
      }
      totalWidth += (Fieldset.length * 0.5) // margens das colunas

      if (totalWidth > page.Paper.width){
             switch(page.Paper) {
                case PAPER.A4.PORTRAIT:
                     page.Paper = PAPER.A4.LANDSCAPE;
                    break;
                case PAPER.LETTER.PORTRAIT:
                     page.Paper = PAPER.LETTER.LANDSCAPE;
                    break;
                case PAPER.LEGAL.PORTRAIT:
                     page.Paper = PAPER.LEGAL.LANDSCAPE;
                    break;
             }
       }
      //return cols;
   }
   return Fieldset;
}

function HeaderDetail(columns, report){
   let $this=this;
   let initialize=function(){
        $this.id = "";
        $this.sortFunction = "ReportFactory.reports(" + report.idx + ").sort";
        $this.Page = null;
        $this.Columns = columns;//.Array;
        //$this.height = 0;
    }();
    this.write= page => {
       // $this.height = page.HeaderDetail.Style.height
        $this.id = "headerDetail-" + page.id;
        $this.Page = page;
        let html = `<div class='header-detail-wrap' id='headerDetail-${page.id}'><ul></ul></div>`;
	    //var html = std.evaluate($this.Page);
	    i$($this.Page.id).insert(html);

        let p_style = {height: (page.HeaderDetail.Style.height)  + 'pt',
                      lineHeight: (page.HeaderDetail.Style.height)  + 'pt',
                      marginBottom: page.HeaderDetail.Style.marginBottom + 'mm'};

        i$($this.id).stylize(p_style);

        $this.writeColumns();
    };
    this.writeColumns= () => {
        for (key in $this.Columns.Items)
            $this.writeColumn(this.Columns.Items[key])
    };
    this.writeColumn=function(column) {
        if (!column.persist) return false;
        let clas$ = "header-detail-column "
        if (column.Header.clas$)
            clas$ += column.Header.clas$;

        id = column.id + "-" + $this.id;
        let html = "<li onclick='" +$this.sortFunction+ "(\"" + column.key + "\")' id='" + id + "'>"
                + "<a>" +column.label+ "</a>"
                + "</li>";

	    $('#'+$this.id+' > ul').append(html);

        let p_left =  column.Report.leftPos + "mm";
        let p_width = column.Report.size + "mm";
        let p_fontSize = $this.Page.Detail.Header.Font.size + 'pt';

        let p_style = { width: p_width, left: p_left,
                        fontSize:p_fontSize,
                        textAlign: column.align
                      };

        i$(id).stylize(p_style);
    }
};

var Detail = function(Columns, report){
    var SELF = this;
    this.id = "";
    this.Page = null;
    this.rpt = "ReportFactory.reports(" + report.idx + ")";
    this.filterFunction = this.rpt + ".filter";
    this.report = report;
    this.Dataset = null;
    this.Columns = Columns;

    this.write= function(Page, dataset) {
        this.Dataset = dataset;
        this.id = "detail-" + Page.id;
        this.Page = Page;
        let html = `<div class='detail' id='detail-${Page.id}'></div>`;
        // var std = new Template("<div class='detail' id='detail-#{id}'></div>");
        // var html = std.evaluate(Page);
        i$(Page.id).insert(html);
        // Para definir o tamanho para as linhas de detalhe
        // Depende da propriedade de Page.Detail.height
        var p_style = {height: Page.Detail.Style.height  + 'mm',
                    marginTop: Page.Detail.Style.marginTop + 'mm',
                 marginBottom: Page.Detail.Style.marginBottom + 'mm'};
        i$(this.id).stylize(p_style);
        this.writeLines();
    }
    this.writeLines= function() {
        var off = true;
        SELF.Page.Pager.sweep(function(row, record){
            var id = SELF.id + "L" + (row+1);
            var html = 	"<div class='detail-column-wrap' id='" + id + "'><ul></ul></div>"

	     i$(SELF.id).insert(html);
             var p_style = {height: SELF.Page.Control.height+2  + 'pt',
                            lineHeight: SELF.Page.Control.height+2  + 'pt',
                            backgroundColor:(off)?COLOR.OFF:COLOR.ON};
             i$(id).stylize(p_style);

             off = (!off);

             SELF.Columns.populate(record, function(column){
                if (column.persist)
                    SELF.writeColumn(column,row, id);
             });
        });
    }

    this.writeColumn= function(column, line, id_line) {
        id = column.id + "-" + id_line;

        var html = '<li onclick="DetailMouseUp(event,\''  +column.key+ '\',\'' + column.Record.value + '\','
                 + line + ',' + this.report.idx + ')" id="' +id+ '">'
                 + '<a id="vl-' + id + '">' +column.Record.formattedValue+ '</a>'
                 + '</li>';

      	//i$(id_line).insert(html);
        $('#'+id_line+' > ul').append(html);

        var p_left =  column.Report.leftPos + "mm";
        var p_width = column.Report.size + "mm";

        var p_borderRight = (column.Report.last)?'0':'1px solid transparent';
        var p_fontSize = this.Page.Detail.Font.size + 'pt';
        var p_style = {width: p_width, left: p_left, textAlign: column.align,
                       fontSize:p_fontSize,
                       lineHeight: SELF.Page.Control.height+2  + 'pt',
                       borderRight:p_borderRight
                       };
        i$(id).stylize(p_style);
        if (column.Report.style)
            i$(id).stylize(column.Report.style);
    }
};

function Header(){
    let $this=this;
    let initialized= function(){
        $this.id = "";
        $this.titleWidth = 0;
    }();
    this.write= page => {
        $this.id = "header-" + page.id;
        let idHeaderTitle = "header-title-" + page.id;
            // Calcula o centro da página para colocar os tÃ­tulos
            // 31 é a medida das imagens laterais
        $this.titleWidth = (page.Style.width - 31);
        page.Header.Title = $this.prepareTitle(page.Header.Title);
        //var std = new Template(
        let html = `<div class='header' id='${$this.id}'>`
                	+ "<div class='header-logo-left'><img /></div>"
			        + `<div class='header-title'  id='${idHeaderTitle}'>`
			          + `<label class='header-title1'>${page.Header.Title.line1}</label><br />`
			          + `<label class='header-title2'>${page.Header.Title.line2}</label><br />`
			          + `<label class='header-title3'>${page.Header.Title.line3}</label>`
			        + "</div>"
			        + "<div class='header-logo-right'><img /></div>"
                 + "</div>";
    	 //var html = std.evaluate(page);
    	 i$(page.id).insert(html);
        // Para definir o centro do Header - centralizar as linhas de tÃ­tulo
        // Depende da propriedade de Page.Header.width
       i$(idHeaderTitle).stylize({width: this.titleWidth + 'mm'});
        // Definir altura do cabecalho
       var p_style = {height: page.Header.Style.height + 'mm',
                    marginTop: page.Header.Style.marginTop + 'mm',
                 marginBottom: page.Header.Style.marginBottom + 'mm'};
       i$($this.id).stylize(p_style);
    };
    // O objeto de titulos pode ter qualquer nome, desde que tenha 3 colunas
    // Isso facilitarÃ¡ o desenvolvimento, pois, as linhas de cabeÃ§alho poderÃ£o ter tÃ­tulos como:
    // secretaria, setor, etc
    // Essa funcÃ§Ã£o adequa esses nomes, transformando o objeto de tÃ­tulo em um array com os valores
    this.prepareTitle= title =>{
        var titles = [];//$H(title).values();
        for (var key in title)
            titles.push(title[key]);
        if (titles.length < 3)
            titles.length = 3
        return {line1:titles[0], line2: titles[1], line3: titles[2]};
    }
};

function Footer(){
  let $this=this;
  let initialize=function(){
        this.id = "";
  }();
  this.write= function(page) {
        this.id = "footer-" + page.id;
        let html = `<div class='footer' id='${this.id}'>`
                   + `<div class='footer-date'>${page.Footer.date}</div>`
			       + `<div class='footer-hour'>${page.Footer.hour}</div>`
			       + `<div class='footer-note'>${page.Footer.note}</div>`
			       + "<div class='footer-position'>"
                                + (page.Pager.Record.first) + "/"
                                + (page.Pager.Record.last)  + "-"
                                + (page.Pager.Record.count)
                        + "</div>"
			       + `div class='footer-page'>${page.Pager.Control.number}/${page.Pager.Control.last}</div>`
                + "</div>";
	    //var html = std.evaluate(page);
    	i$(page.id).insert(html);

      var p_style = {height: page.Footer.Style.height + 'mm',
                    marginTop: page.Footer.Style.marginTop + 'mm',
                 marginBottom: page.Footer.Style.marginBottom + 'mm'};
      i$(this.id).stylize(p_style);
  }
};

//------------Littener
function DetailMouseUp(event, colName, colValue, line, reportIdx){
    var rpt = ReportFactory.reports(reportIdx);
    rpt.filter(event, colName, colValue);
}
