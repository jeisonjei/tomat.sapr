import { a } from '../../shared/globalState/a';
import { t } from '../../shared/globalState/t.js';
import { s } from '../../shared/globalState/settings.mjs';
import { c } from '../../shared/globalState/c.js';
import jsPDF from 'jspdf';

import { font } from "../../fonts/GOST type A-normal.js"
import { Point } from '../../models/Point.mjs';


function handleSavePdfButtonClick() {

    const stamps = s.myDatabase.stamps;

    const doc = stamps.findOne({
        selector: {
            id: 'stamp1'
        }
    }).exec();

    doc.then((v) => {

        const designer = v.get('designer');
        const checker = v.get('checker');
        const normChecker = v.get('norm_checker');
        const gip = v.get('gip');

        const change_doc = v.get('change_doc');
        const change_sheet = v.get('change_sheet');
        const change = v.get('change');
        const date1 = v.get('date1');
        const date2 = v.get('date2');
        const date3 = v.get('date3');
        const date4 = v.get('date4');
        const qty_part = v.get('qty_part');
        const project_code = v.get('project_code');
        const address = v.get('address');
        const building = v.get('building');
        const sheetName = v.get('sheetName');
        const sheetNumber = v.get('sheetNumber');
        const sheets_qty = v.get('sheets_qty');
        const project_stage = v.get('project_stage');
        const company = v.get('company');



        const pdf = new jsPDF({
            unit: 'mm',
            format: s.format,
            orientation: "l",
        });

        const pdfMock = new jsPDF({
            unit: 'px',
            format: s.format,
            orientation: 'landscape'
        });

        const pdfMockWidth = pdfMock.internal.pageSize.getWidth();

        // draw shapes from a.shapes to canvas2d
        pdf.setDrawColor(0, 0, 0);
        pdf.setLineWidth(0.5);


        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const scaleX = c.canvas.width / pdfWidth;
        const scaleY = c.canvas.height / pdfHeight;

        const mmtopx = pdfMockWidth / pdfWidth;


        const filteredShapes = a.shapes.filter(shape => shape.type !== 'text');

        if (filteredShapes.length > 0) {
            filteredShapes.forEach(shape => {

                const verticesPixels = shape.getVerticesArray();
                switch (shape.type) {
                    case 'line':
                        pdf.line(verticesPixels[0] / scaleX, verticesPixels[1] / scaleX, verticesPixels[2] / scaleX, verticesPixels[3] / scaleX);
                        break;
                    case 'rectangle':
                        const width = (shape.p3.x - shape.p1.x) / scaleX;
                        const height = (shape.p1.y - shape.p4.y) / scaleX;
                        pdf.rect(verticesPixels[6] / scaleX, verticesPixels[7] / scaleX, width, height);

                        break;
                    case 'circle':
                        const center = shape.center;
                        const x = center.x / scaleX;
                        const y = center.y / scaleX;
                        const radius = shape.radius / scaleX;
                        pdf.circle(x, y, radius);

                        break;
                    default:
                        break;
                }
            });

        }


        pdf.setFont('GOST type A');

        const mmtopoints = 0.75

        const scaleYmm = (pdfWidth * mmtopx / c.canvas.width) / mmtopoints;
        const fontSizemm = t.fontSize * scaleYmm;
        pdf.setFontSize(fontSizemm);


        t.utext.forEach(t => {
            pdf.text(t.text, t.start.x / scaleX, t.start.y / scaleX);
        })
        // --- border
        pdf.setDrawColor(0, 0, 0);
        pdf.setLineWidth(0.75);
        pdf.setFontSize(12);

        const topX = pdfWidth - 190;
        const topY = pdfHeight - 60;
        const row = 5;
        const col = row * 2;
        const of = 0.5;

        // Define points for cells in rows 1 to 11 and columns 1 to 6
        const cellPoints = [];
        for (let i = 1; i <= 11; i++) {
            for (let j = 1; j <= 37; j++) {
                const cell = new Point(topX + col * (j - 1) + of, topY + row * i - of);
                cellPoints.push(cell);
                const cellVariable = `cell-${i}-${j}`;
                cellPoints[cellVariable] = cell;

            }
        }

        const designerValueCell = cellPoints['cell-6-3']
        const checkerValueCell = cellPoints['cell-7-3']
        const normCheckerValueCell = cellPoints['cell-8-3']
        const gipValueCell = cellPoints['cell-9-3']

        const changeDocValueCell = cellPoints['cell-4-4']
        const changeSheetValueCell = cellPoints['cell-4-3']
        const changeNumberValueCell = cellPoints['cell-4-1']

        const date1ValueCell = new Point(cellPoints['cell-6-7'].x - row, cellPoints['cell-6-7'].y);
        const date2ValueCell = new Point(cellPoints['cell-7-7'].x - row, cellPoints['cell-7-7'].y);
        const date3ValueCell = new Point(cellPoints['cell-8-7'].x - row, cellPoints['cell-8-7'].y);
        const date4Valuecell = new Point(cellPoints['cell-9-7'].x - row, cellPoints['cell-9-7'].y);

        const qtyPartValueCell = cellPoints['cell-4-2']

        const projectCodeValueCell = new Point(cellPoints['cell-2-7'].x + row, cellPoints['cell-2-7'].y);
        const addressValueCell = new Point(cellPoints['cell-5-7'].x + row, cellPoints['cell-5-7'].y);
        const buildingValueCell = new Point(cellPoints['cell-8-7'].x + row, cellPoints['cell-8-7'].y);
        const sheetNameValueCell = new Point(cellPoints['cell-11-7'].x + row, cellPoints['cell-11-7'].y);

        const projectStageCell = new Point(cellPoints['cell-6-15'].x - row, cellPoints['cell-6-15'].y);
        const sheetNumberCell = cellPoints['cell-6-16'];
        const sheetQtyCell = new Point(cellPoints['cell-6-17'].x + row, cellPoints['cell-6-17'].y);

        const projectStageValueCell = new Point(cellPoints['cell-8-15'].x - row, cellPoints['cell-8-15'].y);
        const sheetNumberValueCell = cellPoints['cell-8-16']
        const sheetsQtyValueCell = new Point(cellPoints['cell-8-17'].x + row, cellPoints['cell-8-17'].y);

        const companyValueCell = new Point(cellPoints['cell-11-15'].x - row, cellPoints['cell-11-15'].y);


        pdf.text('Разработал', cellPoints['cell-6-1'].x, cellPoints['cell-6-1'].y);
        pdf.text('Проверил', cellPoints['cell-7-1'].x, cellPoints['cell-7-1'].y);
        pdf.text('Н.контроль', cellPoints['cell-8-1'].x, cellPoints['cell-8-1'].y);
        pdf.text('ГИП', cellPoints['cell-9-1'].x, cellPoints['cell-9-1'].y);
        pdf.text('Изм.', cellPoints['cell-5-1'].x, cellPoints['cell-5-1'].y);
        pdf.text('Кол.уч.', cellPoints['cell-5-2'].x, cellPoints['cell-5-2'].y);
        pdf.text('Лист', cellPoints['cell-5-3'].x, cellPoints['cell-5-3'].y);
        pdf.text('№ док.', cellPoints['cell-5-4'].x, cellPoints['cell-5-4'].y);
        pdf.text('Подпись', cellPoints['cell-5-5'].x, cellPoints['cell-5-5'].y);
        pdf.text('Дата', cellPoints['cell-5-6'].x + row, cellPoints['cell-5-6'].y);
        pdf.text('Стадия', projectStageCell.x, projectStageCell.y);
        pdf.text('Лист', sheetNumberCell.x, sheetNumberCell.y);
        pdf.text('Листов', sheetQtyCell.x, sheetQtyCell.y);

        pdf.text(designer ?? '', designerValueCell.x, designerValueCell.y);
        pdf.text(checker ?? '', checkerValueCell.x, checkerValueCell.y);
        pdf.text(normChecker ?? '', normCheckerValueCell.x, normCheckerValueCell.y);
        pdf.text(gip ?? '', gipValueCell.x, gipValueCell.y);
        pdf.text(change_doc ?? '', changeDocValueCell.x, changeDocValueCell.y);
        pdf.text(change_sheet ?? '', changeSheetValueCell.x, changeSheetValueCell.y);
        pdf.text(change ?? '', changeNumberValueCell.x, changeNumberValueCell.y);
        pdf.text(date1 ?? '', date1ValueCell.x, date1ValueCell.y);
        pdf.text(date2 ?? '', date2ValueCell.x, date2ValueCell.y);
        pdf.text(date3 ?? '', date3ValueCell.x, date3ValueCell.y);
        pdf.text(date4 ?? '', date4Valuecell.x, date4Valuecell.y);
        pdf.text(qty_part ?? '', qtyPartValueCell.x, qtyPartValueCell.y);
        pdf.text(project_code ?? '', projectCodeValueCell.x, projectCodeValueCell.y);
        pdf.text(address ?? '', addressValueCell.x, addressValueCell.y);
        pdf.text(building ?? '', buildingValueCell.x, buildingValueCell.y);
        pdf.text(sheetName ?? '', sheetNameValueCell.x, sheetNameValueCell.y);
        pdf.text(sheetNumber ?? '', sheetNumberValueCell.x, sheetNumberValueCell.y);
        pdf.text(sheets_qty ?? '', sheetsQtyValueCell.x, sheetsQtyValueCell.y);
        pdf.text(project_stage ?? '', projectStageValueCell.x, projectStageValueCell.y);
        pdf.text(company ?? '', companyValueCell.x, companyValueCell.y);



        pdf.rect(0, 0, pdfWidth, pdfHeight, 'S');
        pdf.rect(20, 5, pdfWidth - 25, pdfHeight - 10, 'S');
        pdf.rect(topX, topY, 185, 55);
        // ---
        pdf.rect(topX, topY, 10, 5);
        pdf.rect(topX, topY + row, 10, 5);
        pdf.rect(topX, topY + row * 2, 10, 5);
        pdf.rect(topX, topY + row * 3, 10, 5);
        pdf.rect(topX, topY + row * 4, 10, 5);

        // ---
        pdf.rect(topX + row * 2, topY, 10, 5);
        pdf.rect(topX + row * 2, topY + row, 10, 5);
        pdf.rect(topX + row * 2, topY + row * 2, 10, 5);
        pdf.rect(topX + row * 2, topY + row * 3, 10, 5);
        pdf.rect(topX + row * 2, topY + row * 4, 10, 5);

        pdf.rect(topX + row * 4, topY, 10, 5);
        pdf.rect(topX + row * 4, topY + row, 10, 5);
        pdf.rect(topX + row * 4, topY + row * 2, 10, 5);
        pdf.rect(topX + row * 4, topY + row * 3, 10, 5);
        pdf.rect(topX + row * 4, topY + row * 4, 10, 5);

        pdf.rect(topX + row * 6, topY, 10, 5);
        pdf.rect(topX + row * 6, topY + row, 10, 5);
        pdf.rect(topX + row * 6, topY + row * 2, 10, 5);
        pdf.rect(topX + row * 6, topY + row * 3, 10, 5);
        pdf.rect(topX + row * 6, topY + row * 4, 10, 5);
        // --- 
        pdf.rect(topX, topY + row * 5, 20, 5);
        pdf.rect(topX, topY + row * 6, 20, 5);
        pdf.rect(topX, topY + row * 7, 20, 5);
        pdf.rect(topX, topY + row * 8, 20, 5);
        pdf.rect(topX, topY + row * 9, 20, 5);
        pdf.rect(topX, topY + row * 10, 20, 5);
        // ---
        pdf.rect(topX + row * 4, topY + row * 5, 20, 5);
        pdf.rect(topX + row * 4, topY + row * 6, 20, 5);
        pdf.rect(topX + row * 4, topY + row * 7, 20, 5);
        pdf.rect(topX + row * 4, topY + row * 8, 20, 5);
        pdf.rect(topX + row * 4, topY + row * 9, 20, 5);
        pdf.rect(topX + row * 4, topY + row * 10, 20, 5);
        // ---
        pdf.rect(topX + row * 8, topY, 15, 5);
        pdf.rect(topX + row * 8, topY + row, 15, 5);
        pdf.rect(topX + row * 8, topY + row * 2, 15, 5);
        pdf.rect(topX + row * 8, topY + row * 3, 15, 5);
        pdf.rect(topX + row * 8, topY + row * 4, 15, 5);
        pdf.rect(topX + row * 8, topY + row * 5, 15, 5);
        pdf.rect(topX + row * 8, topY + row * 6, 15, 5);
        pdf.rect(topX + row * 8, topY + row * 7, 15, 5);
        pdf.rect(topX + row * 8, topY + row * 8, 15, 5);
        pdf.rect(topX + row * 8, topY + row * 9, 15, 5);
        pdf.rect(topX + row * 8, topY + row * 10, 15, 5);
        // ---
        pdf.rect(topX + row * 11, topY, 10, 5);
        pdf.rect(topX + row * 11, topY + row, 10, 5);
        pdf.rect(topX + row * 11, topY + row * 2, 10, 5);
        pdf.rect(topX + row * 11, topY + row * 3, 10, 5);
        pdf.rect(topX + row * 11, topY + row * 4, 10, 5);
        pdf.rect(topX + row * 11, topY + row * 5, 10, 5);
        pdf.rect(topX + row * 11, topY + row * 6, 10, 5);
        pdf.rect(topX + row * 11, topY + row * 7, 10, 5);
        pdf.rect(topX + row * 11, topY + row * 8, 10, 5);
        pdf.rect(topX + row * 11, topY + row * 9, 10, 5);
        pdf.rect(topX + row * 11, topY + row * 10, 10, 5);
        // ---
        pdf.rect(topX + row * 13, topY, 120, 10);
        pdf.rect(topX + row * 13, topY + row * 2, 120, 15);
        pdf.rect(topX + row * 13, topY + row * 5, 70, 15);
        pdf.rect(topX + row * 13, topY + row * 8, 70, 15);
        // ---
        pdf.rect(topX + row * 27, topY + row * 5, 15, 5);
        pdf.rect(topX + row * 27, topY + row * 6, 15, 10);
        // --- 
        pdf.rect(topX + row * 30, topY + row * 5, 15, 5);
        pdf.rect(topX + row * 30, topY + row * 6, 15, 10);
        // ---
        pdf.rect(topX + row * 33, topY + row * 5, 20, 5);
        pdf.rect(topX + row * 33, topY + row * 6, 20, 10);




        // Save the PDF file
        pdf.save("download.pdf");

    })


}


function registerButtonSavePdfEvent() {
    const savePdfButton = document.getElementById('savePdf');
    savePdfButton.addEventListener('click', handleSavePdfButtonClick);
}

export { registerButtonSavePdfEvent }