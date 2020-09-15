/*====================Constantes==================*/
'use strict';
const Report = function(){
    let reports = []
      , activeService  
      , Designer = function(page, Fieldset, dataset, id_div, idx){
            const $report = this;
            const rep ={
                Columns:function (page, Fieldset){
                   let totalWidth = 0
                   , me = this;
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
                        let leftPos = 0;
                        let idx = 0;
                        for(let key in Fieldset.c$){
                            let field = Fieldset.c$[key];
                            if (!field.key) {field.key=key}
                            if (!field.id) {field.id=key}
                            field.type = 'column';
                            field.Report = {identicalSupress:true, size:0,
                                            bold:false, hide:false, style:null,
                                            leftPos:0, first:false, last:false
                                            };
                            if (field.label.length == 0) 
                                field.label = this.id;
                            idx++;
                            if (idx == 1) 
                                field.Report.first=true;
                            if (idx == Fieldset.c$.length)
                                field.Report.last=true;
                            let colSize = calculeSize(field.size, page.Detail.Font.size)
                              , labelSize = calculeSize(field.label.length, page.Detail.Header.Font.size);

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
                                    case CONFIG.REPORT.PAPER.A4.PORTRAIT:
                                        page.Paper = CONFIG.REPORT.PAPER.A4.LANDSCAPE;
                                        break;
                                    case CONFIG.REPORT.PAPER.LETTER.PORTRAIT:
                                        page.Paper = CONFIG.REPORT.PAPER.LETTER.LANDSCAPE;
                                        break;
                                    case CONFIG.REPORT.PAPER.LEGAL.PORTRAIT:
                                        page.Paper = CONFIG.REPORT.PAPER.LEGAL.LANDSCAPE;
                                        break;
                                }
                        }
                   } // prepare
                   return Fieldset;
                }           
               ,HeaderDetail:function (columns, report){
                    let $this=this;
                    const initialize=function(){
                       $this.id = "";
                       $this.sortFunction = "Report.reports(" + report.idx + ").sort";
                       $this.Page = null;
                       $this.Columns = columns;
                       return true;
                    }();
                    this.write= page => {                   
                       $this.id = "headerDetail-" + page.id;
                       $this.Page = page;
                       let html = `<div class='header-detail-wrap' id='headerDetail-${page.id}'><ul></ul></div>`;
                       i$($this.Page.id).insert(html);           
                       let p_style = {height: (page.HeaderDetail.Style.height)  + 'pt',
                                  lineHeight: (page.HeaderDetail.Style.height)  + 'pt',
                                marginBottom: page.HeaderDetail.Style.marginBottom + 'mm'}           
                       i$($this.id).stylize(p_style);           
                       $this.writeColumns();
                    }
                    this.writeColumns= () => {
                        for (let key in $this.Columns.c$)
                           $this.writeColumn(this.Columns.c$[key]);
                    };
                    this.writeColumn=function(column) {
                        if (!column.persist) return false;
                        let clas$ = "header-detail-column ";
                        if (column.Header.clas$)
                           clas$ += column.Header.clas$;           
                        let id = column.id + "-" + $this.id
                        , html = "<li onclick='" +$this.sortFunction+ "(\"" + column.key + "\")' id='" + id + "'>"
                               + "<a>" +column.label+ "</a>"
                               + "</li>";           
                       $('#'+$this.id+' > ul').append(html);           
                       let p_left =  column.Report.leftPos + "mm"
                         , p_width = column.Report.size + "mm"
                         , p_fontSize = $this.Page.Detail.Header.Font.size + 'pt'           
                         , p_style = { width: p_width, left: p_left,
                                       fontSize:p_fontSize,
                                       textAlign: column.align
                                   }           
                       i$(id).stylize(p_style);
                    }
                }           
               ,Detail: function(Columns, report){
                    let SELF = this;
                    this.id = "";
                    this.Page = null;
                    this.rpt = "Report.reports(" + report.idx + ")";
                    this.filterFunction = this.rpt + ".filter";
                    this.report = report;
                    this.Dataset = null;
                    this.Columns = Columns;           
                    this.write= function(Page, dataset) {
                        this.Dataset = dataset;
                        this.id = "detail-" + Page.id;
                        this.Page = Page;
                        let html = `<div class='detail' id='detail-${Page.id}'></div>`;
                        i$(Page.id).insert(html);
                        // Para definir o tamanho para as linhas de detalhe
                        // Depende da propriedade de Page.Detail.height
                        let p_style = {height: Page.Detail.Style.height  + 'mm',
                                    marginTop: Page.Detail.Style.marginTop + 'mm',
                                 marginBottom: Page.Detail.Style.marginBottom + 'mm'}
                        i$(this.id).stylize(p_style);
                        this.writeLines();
                    }
                    this.writeLines= function() {
                       let off = true;
                       SELF.Page.Pager.read(function(row, record){
                           let id = SELF.id + "L" + (row+1)
                           , html = 	"<div class='detail-column-wrap' id='" + id + "'><ul></ul></div>"           
                           i$(SELF.id).insert(html);
                           let p_style = {height: SELF.Page.Control.height+2  + 'pt',
                                      lineHeight: SELF.Page.Control.height+2  + 'pt',
                                 backgroundColor:(off)?CONFIG.REPORT.COLOR.OFF:CONFIG.REPORT.COLOR.ON}
                           i$(id).stylize(p_style);           
                           off = (!off);           
                           SELF.Columns.populate(record, function(column){
                               if (column.persist)
                                   SELF.writeColumn(column,row, id);
                           });
                       });
                    }           
                    this.writeColumn= function(column, line, id_line) {
                        let id = column.id + "-" + id_line           
                        , html = '<li onclick="Report.DetailMouseUp(event,\''  +column.key+ '\',\'' + column.Record.value + '\','
                               + line + ',' + this.report.idx + ')" id="' +id+ '">'
                               + '<a id="vl-' + id + '">' +column.Record.formattedValue+ '</a>'
                               + '</li>';                                  
                        $('#'+id_line+' > ul').append(html);
           
                        let p_left =  column.Report.leftPos + "mm"
                         , p_width = column.Report.size + "mm"
                         , p_borderRight = (column.Report.last)?'0':'1px solid transparent'
                         , p_fontSize = this.Page.Detail.Font.size + 'pt'
                         , p_style = {width: p_width, left: p_left, textAlign: column.align,
                                   fontSize:p_fontSize,
                                 lineHeight: SELF.Page.Control.height+2  + 'pt',
                                borderRight:p_borderRight
                                   }
                         i$(id).stylize(p_style);
                         if (column.Report.style)
                            i$(id).stylize(column.Report.style);
                   }
                }           
               ,Header: function (){
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
                        
                        let html = `<div class='header' id='${$this.id}'>`
                                   + "<div class='header-logo-left'><img /></div>"
                                   + `<div class='header-title'  id='${idHeaderTitle}'>`
                                   + `<label class='header-title1'>${page.Header.Title.line1}</label><br />`
                                   + `<label class='header-title2'>${page.Header.Title.line2}</label><br />`
                                   + `<label class='header-title3'>${page.Header.Title.line3}</label>`
                                   + "</div>"
                                   + "<div class='header-logo-right'><img /></div>"
                               + "</div>";                       
                        i$(page.id).insert(html);
                        // Para definir o centro do Header - centralizar as linhas de tÃ­tulo
                        // Depende da propriedade de Page.Header.width
                        i$(idHeaderTitle).stylize({width: this.titleWidth + 'mm'});
                        // Definir altura do cabecalho
                        let p_style = {height: page.Header.Style.height + 'mm',
                                    marginTop: page.Header.Style.marginTop + 'mm',
                                 marginBottom: page.Header.Style.marginBottom + 'mm'}
                        i$($this.id).stylize(p_style);
                   };
                   // O objeto de titulos pode ter qualquer nome, desde que tenha 3 colunas
                   // Isso facilitarÃ¡ o desenvolvimento, pois, as linhas de cabeÃ§alho poderÃ£o ter tÃ­tulos como:
                   // secretaria, setor, etc
                   // Essa funcÃ§Ã£o adequa esses nomes, transformando o objeto de tÃ­tulo em um array com os valores
                   this.prepareTitle= title =>{
                       let titles = [];//$H(title).values();
                       for (let key in title)
                           titles.push(title[key]);
                       if (titles.length < 3)
                           titles.length = 3
                       return {line1:titles[0], line2: titles[1], line3: titles[2]};
                   }
                }           
               ,Footer: function (){
                    let $this=this;
                    let initialize=function(){
                        $this.id = "";
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
                        i$(page.id).insert(html);
                
                        let p_style = {height: page.Footer.Style.height + 'mm',
                                        marginTop: page.Footer.Style.marginTop + 'mm',
                                    marginBottom: page.Footer.Style.marginBottom + 'mm'};
                        i$(this.id).stylize(p_style);
                    }
                }
            }        
            this.ops= function(a){alert(a);}
            this.newPage= function() {
                $report.Page.id = "PG" + ($report.Page.Pager.Control.number);
                // Adiciona a pÃ¡gina ao hash de pÃ¡ginas
                $report.pages[$report.Page.id] ={page:$report.Page};
                //$report.pages.set($report.Page.id,{page:$report.Page});
                let {Page, Header, Footer, HeaderDetail, Detail} =  $report;
                // Inserir a div da pÃ¡gina no html
                let html = `<div class='page' id='${page.id}'></div>`;//std_page.evaluate(Page);
                $report.body.insert(html);
                // Define o tamanho da página
                let p_style ={height: Page.Style.height       + 'mm', 
                               width: Page.Style.width        + 'mm',
                           marginTop: Page.Style.marginTop    + 'mm',
                        marginBottom: Page.Style.marginBottom + 'mm',
                          marginLeft: Page.Style.marginLeft   + 'mm',
                      marginBotRight: Page.Style.marginRight  + 'mm'}
                i$(Page.id).stylize(p_style);
                
                if (Page.Header) 
                    Header.write(Page);             // Imprime Cabeçalho
                
                HeaderDetail.write(Page);           // Imprime Cabeçalho dos Detalhes
                
                Detail.write(Page,$report.Dataset); // Imprime Detalhes
               
                if (Page.Footer)
                    Footer.write(Page);             // imprime o roda-peh
            }
            // Renderiza todas as páginas
            this.start= function(){
                let {Pager} = $report.Page;
                while(Pager.next()){
                    $report.newPage();
                }
            }
            this.sort=function(colName){
                $report.Columns.sortNone(colName);
                let field = $report.Columns.c$[colName];
                $report.Dataset.orderBy(field.sortOrder());
                $report.clear();
                $report.Page.Pager.restart($report.Dataset);
                $report.start();
            }
            this.filter=function(event, colName, value){
                let field = $report.Columns.c$[colName];
                switch(event.button) {
                case c$.MOUSE.BUTTON.CENTER:
                    $report.Columns.filterNone(colName);
                    $report.Dataset.filter($report.Columns.c$[colName], field.value(value));
                    $report.clear();
                    $report.Page.Pager.restart($report.Dataset);
                    $report.start()
                case c$.MOUSE.BUTTON.RIGHT: break;
                case c$.MOUSE.BUTTON.LEFT:break;
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
        
            const initialized = function(){
                $report.id = "body";
                if (id_div)
                    $report.id = id_div;
        
                $report.body = i$($report.id);
                $report.clear();
        
                let std_Header = {Style:{height:12.4, marginTop: 0, marginBottom:4},
                                    Font:CONFIG.REPORT.DEFAULT.HEADER.COLUMN.FONT,
                                    Title:{line1:"", line2:"",line3:""}}
                , std_Detail = {Style:{height:0, marginTop: 0.5, marginBottom:0.5},
                                    Header:{Font:CONFIG.REPORT.DEFAULT.HEADER.COLUMN.FONT},
                                    Font:CONFIG.REPORT.DEFAULT.DETAIL.COLUMN.FONT}
                , std_Footer = {Style:{height:3.45, marginTop: 0, marginBottom:0},
                                    note: '', date: c$.NOW.format(c$.MASK.DATE.default),
                                    hour: c$.NOW.format(c$.MASK.DATE.isoTime)}
                , std_Page   = {Style:{height:0, width:0, marginTop: 0, marginBottom:0.5, marginLeft:1, MarginRight:1}
                                ,  id:'', Paper: CONFIG.REPORT.DEFAULT.PAGE.PAPER, RowsPerPage:0};
                $report.idx = idx;
                $report.pages = {};//new Hash();
                $report.Dataset = dataset;
                $report.Page = Object.preset(page, std_Page);      
                $report.Page.Header = (page.Header ==null || page.Header == undefined || page.Header == false)
                                    ? null :Object.preset(page.Header, std_Header);
                $report.Page.Footer =(page.Footer ==null || page.Footer == undefined || page.Footer == false)
                                    ? null : Object.preset(page.Footer, std_Footer);
                $report.Page.Detail = Object.preset(page.Detail, std_Detail);
                //$report.Page.Record ={count:0, first:0, last:0, height:$report.Page.Detail.Font.size +1};
                $report.Page.Control ={limit: 0, height:$report.Page.Detail.Font.size +1};
        
                $report.Page.HeaderDetail ={Style:{height:$report.Page.Detail.Header.Font.size +3, marginTop: 0, marginBottom:1.4}};
                // Define colunas do relatório
                $report.Columns = rep.Columns($report.Page, Fieldset);
                let {Style, Paper, Control, Header, Footer, Detail, HeaderDetail} = $report.Page;
                // Define o tamanho da página (exluindo tb as margens
                Style.height = parseInt(Paper.height) - (Style.marginTop + Style.marginBottom);
                Style.width = parseInt(Paper.width);
        
                // Calculo o espaço para as linhas de detalhe - tamanhos de cabeçalho, margens, etc...
                let detailSpace = ($report.sumHeight(Detail.Style)
                            + (($report.Page.Header == null) ? 0 : $report.sumHeight(Header.Style))
                            + (($report.Page.Footer == null) ? 0 : $report.sumHeight(Footer.Style))
                            + $report.sumHeight(HeaderDetail.Style))//+ convertPTtoMM($report.Page.HeaderDetail.Style.height))
                Detail.Style.height = (Style.height - detailSpace)-2;
                // console.log(Style.height);
                // console.log(detailSpace);
                // console.log(Detail.Style.height);
                // console.log(Header.Style);
                // console.log(HeaderDetail.Style);
                // console.log(Detail.Style);
                // console.log(Footer.Style);     
                // calcula a quatidade de registros que cabe na página
                Control.limit = ((Detail.Style.height) / Math.round(Report.Util.convertPTtoMM(Control.height)));
                if ((Control.limit * Report.Util.convertPTtoMM(Control.height)) > Detail.Style.height)
                    --Control.limit
        
                //console.log($report.Page.Control);
                $report.Page.Pager = $report.Dataset.createPager($report.Page.Control);//($report.Dataset,$report.Page.Control);
                //$report.Pager.show();
                $report.Header = ($report.Page.Header == null) ? null : new rep.Header();
                $report.Footer = ($report.Page.Footer == null) ? null : new rep.Footer();
                $report.HeaderDetail = new rep.HeaderDetail($report.Columns, $report);
                $report.Detail = new rep.Detail($report.Columns, $report);
            }();
        }; 
//são as colunas do relatório             
    return{
        create:function(page, Fieldset, dataset, id_div){
            reports.push(new Designer(page, Fieldset, dataset, id_div, reports.length));            
            return reports[reports.length -1];
        }
        , reports:function(idx){return reports[idx]}
        , restore:function(){
            activeService=window.opener[window.name]; //self.opener[self.name]
            return{
                 Dataset: activeService.Resource.Dataset,
                Fieldset: activeService.Fieldset,
                 caption: activeService.Interface.title
                }
        }      
   }
}();
Report.Util = function(){
    return {
        init(){
            urlDS = System.parameters('ds');
            if (urlDS)
               System.request(urlDS, imprime);
        }
        , convertMMtoPT(vl){
           let vl_pol = vl / 25.4 //Convert para polegadas
             , vl_pt = vl_pol * 72;
           return Math.round( vl_pt * Math.pow( 10 , 2 ) ) / Math.pow( 10 , 2 );
        }
        , convertPTtoMM(vl){
           let vl_pol = vl / 72 //Convert para polegadas
             , vl_mm = vl_pol * 25.4;
           return Math.round( vl_mm * Math.pow( 10 , 2 ) ) / Math.pow( 10 , 2 );
        }
        ,convertPXtoMM(vl){
           let vl_pol = vl / 94.5 //Convert para polegadas
             , vl_mm = vl_pol * 25.4;
           return Math.round( vl_mm * Math.pow( 10 , 2 ) ) / Math.pow( 10 , 2 );
        }
    }
}();

//------------Littener
Report.DetailMouseUp=function(event, colName, colValue, line, reportIdx){
    let rpt = Report.reports(reportIdx);
    rpt.filter(event, colName, colValue);
}



//export default Report;