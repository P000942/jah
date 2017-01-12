/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
var SEFAZ ={Report:{}}
SEFAZ.Report.Page={
      Header:{Title: {secretaria:"SECRETARIA DE ESTADO DA FAZENDA",
		                        setor:"Departamento de Tecnologia da Informação",
		                       titulo:"Titulo de Teste da Rotina de Relatório"},
                    Font:DEFAULT.HEADER.COLUMN.FONT,
                    Images:DEFAULT.HEADER.IMAGES
                   }, 
      Detail:{Font:DEFAULT.DETAIL.COLUMN.FONT, Header:{Font:DEFAULT.HEADER.COLUMN.FONT}},
       Paper: DEFAULT.PAGE.PAPER,
       RowsPerPage:0, 
      Footer:{note: 'Nota de roda-peh'}
};

SEFAZ.Report.init = function(){
    var helper = ReportFactory.restore();
    SEFAZ.Report.Page.Header.Title.Titulo = helper.caption;
    var report =  ReportFactory.create(SEFAZ.Report.Page, helper.Fieldset, helper.Dataset);
    report.start();
}
