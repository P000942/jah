/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
const SEFAZ ={Report:{}}
SEFAZ.Report.Page={
      Header:{Title: {secretaria:"SECRETARIA DE ESTADO DA FAZENDA",
		                        setor:"Departamento de Tecnologia da Informação",
		                       titulo:"Titulo de Teste da Rotina de Relatório"},
                    Font:CONFIG.REPORT.DEFAULT.HEADER.COLUMN.FONT,
                    Images:CONFIG.REPORT.DEFAULT.HEADER.IMAGES
                   }, 
      Detail:{Font:CONFIG.REPORT.DEFAULT.DETAIL.COLUMN.FONT, Header:{Font:CONFIG.REPORT.DEFAULT.HEADER.COLUMN.FONT}},
       Paper: CONFIG.REPORT.DEFAULT.PAGE.PAPER,
       RowsPerPage:0, 
      Footer:{note: 'Nota de roda-peh'}
};

SEFAZ.Report.init = function(){
    let helper = Report.restore();
    SEFAZ.Report.Page.Header.Title.Titulo = helper.caption;
    let report =  Report.create(SEFAZ.Report.Page, helper.Fieldset, helper.Dataset);
    report.start();
}
