import { a } from '../../shared/globalState/a';
import { t } from '../../shared/globalState/t.js';
import { s } from '../../shared/globalState/settings.mjs';
import jsPDF from 'jspdf';

import { font } from "../../fonts/GOST type A-normal.js"
import { Point } from '../../models/Point.mjs';

import { cnv } from '../../libs/canvas-text/src/shared/cnv.js';
import { textLinesCollection } from '../../libs/canvas-text/src/shared/state.js';
import { getRealScale } from '../../shared/common.mjs';


function handleSavePdfButtonClick() {



    const designerValue = localStorage.designerValue ?? '';
    const checkerValue = localStorage.checkerValue ?? '';
    const normCheckerValue = localStorage.normCheckerValue ?? '';
    const gipValue = localStorage.gipValue ?? '';
    const changeDocValue = localStorage.changeDocValue ?? '';
    const changeSheetValue = localStorage.changeSheetValue ?? '';
    const changeNumbValue = localStorage.changeNumbValue ?? '';
    const date1 = localStorage.date1 ?? '';
    const date2 = localStorage.date2 ?? '';
    const date3 = localStorage.date3 ?? '';
    const date4 = localStorage.date4 ?? '';
    const changeQtyPartsValue = localStorage.changeQtyPartsValue ?? '';
    const projectCodeValue = localStorage.projectCodeValue ?? '';
    const adressValue = localStorage.adressValue ?? '';
    const buildingValue = localStorage.buildingValue ?? '';
    const sheetNameValue = localStorage.sheetNameValue ?? '';
    const sheetNumberValue = localStorage.sheetNumberValue ?? '';
    const sheetsQtyValue = localStorage.sheetsQtyValue ?? '';
    const projectStageValue = localStorage.projectStageValue ?? '';
    const companyValue = localStorage.companyValue ?? '';


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
    
    pdf.setLineJoin('round'); // possible values are 'miter, round, bevel'
    pdf.setLineCap('round');


    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const scaleX = cnv.context.canvas.width / pdfWidth;
    const scaleY = cnv.context.canvas.height / pdfHeight;

    const mmtopx = pdfMockWidth / pdfWidth;


    const filteredShapes = a.shapes.filter(shape => shape.type !== 'text');
    const defaultLineThickness = 0.25;

    /**
     * Здесь можно легко сделать разные толщины линий для разных объектов. 
     * 
     */
    if (filteredShapes.length > 0) {
        filteredShapes.forEach(shape => {

            const verticesPixels = shape.getVerticesArray();
            switch (shape.type) {
                case 'line':
                    pdf.setLineWidth(shape.thickness*defaultLineThickness);
                    pdf.line(verticesPixels[0] / scaleX, verticesPixels[1] / scaleX, verticesPixels[2] / scaleX, verticesPixels[3] / scaleX);
                    break;
                case 'rectangle':
                    pdf.setLineWidth(defaultLineThickness);
                    const width = (shape.p3.x - shape.p1.x) / scaleX;
                    const height = (shape.p1.y - shape.p4.y) / scaleX;
                    pdf.rect(verticesPixels[6] / scaleX, verticesPixels[7] / scaleX, width, height);

                    break;
                case 'circle':
                    pdf.setLineWidth(defaultLineThickness);
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

    const mmtopoints = 0.73;

    const scaleYmm = (pdfWidth * mmtopx / cnv.context.canvas.width) / mmtopoints;

    textLinesCollection.forEach(line => {
        const x = line.start.x / scaleX;
        const y = line.start.y / scaleX;
        pdf.setFontSize(line.fontSize * scaleYmm);
        pdf.text(line.textArray.join(''), x, y, { baseline: 'bottom' });
    })
    // --- border
    if (a.isStampVisible) {
        pdf.setDrawColor(0, 0, 0);
        pdf.setLineWidth(0.75);
        pdf.setFontSize(12);

        const topX = pdfWidth - 190;
        const topY = pdfHeight - 60;
        const row = 5;
        const col = row * 2;
        const of = 1;

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
        const addressValueCell = new Point(cellPoints['cell-5-7'].x + row, cellPoints['cell-5-7'].y - 2 * row);
        const buildingValueCell = new Point(cellPoints['cell-8-7'].x + row, cellPoints['cell-8-7'].y - 2 * row);
        const sheetNameValueCell = new Point(cellPoints['cell-11-7'].x + row, cellPoints['cell-11-7'].y - 2 * row);

        const projectStageCell = new Point(cellPoints['cell-6-15'].x - row, cellPoints['cell-6-15'].y);
        const sheetNumberCell = cellPoints['cell-6-16'];
        const sheetQtyCell = new Point(cellPoints['cell-6-17'].x + row, cellPoints['cell-6-17'].y);

        const projectStageValueCell = new Point(cellPoints['cell-8-15'].x - row, cellPoints['cell-8-15'].y - row);
        const sheetNumberValueCell = new Point(cellPoints['cell-8-16'].x, cellPoints['cell-8-16'].y - row);
        const sheetsQtyValueCell = new Point(cellPoints['cell-8-17'].x + row, cellPoints['cell-8-17'].y - row);

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

        pdf.text(designerValue ?? '', designerValueCell.x, designerValueCell.y);
        pdf.text(checkerValue ?? '', checkerValueCell.x, checkerValueCell.y);
        pdf.text(normCheckerValue ?? '', normCheckerValueCell.x, normCheckerValueCell.y);
        pdf.text(gipValue ?? '', gipValueCell.x, gipValueCell.y);
        pdf.text(changeDocValue ?? '', changeDocValueCell.x, changeDocValueCell.y);
        pdf.text(changeSheetValue ?? '', changeSheetValueCell.x, changeSheetValueCell.y);
        pdf.text(changeNumbValue ?? '', changeNumberValueCell.x, changeNumberValueCell.y);
        pdf.text(date1 ?? '', date1ValueCell.x, date1ValueCell.y);
        pdf.text(date2 ?? '', date2ValueCell.x, date2ValueCell.y);
        pdf.text(date3 ?? '', date3ValueCell.x, date3ValueCell.y);
        pdf.text(date4 ?? '', date4Valuecell.x, date4Valuecell.y);
        pdf.text(changeQtyPartsValue ?? '', qtyPartValueCell.x, qtyPartValueCell.y);
        pdf.setFontSize(26);
        pdf.text(projectCodeValue ?? '', projectCodeValueCell.x + 60, projectCodeValueCell.y, 'center');

        // --- possible long strings
        pdf.setFontSize(12);
        const addressSplit = pdf.splitTextToSize(adressValue, 115);
        const buildingSplit = pdf.splitTextToSize(buildingValue, 65);
        const sheetNameSplit = pdf.splitTextToSize(sheetNameValue, 65);
        pdf.text(addressSplit ?? '', addressValueCell.x + 60, addressValueCell.y, 'center');
        pdf.text(buildingSplit ?? '', buildingValueCell.x + 35, buildingValueCell.y, 'center');
        pdf.text(sheetNameSplit ?? '', sheetNameValueCell.x + 35, sheetNameValueCell.y, 'center');
        pdf.setFontSize(26);
        pdf.text(projectStageValue ?? '', projectStageValueCell.x + 6, projectStageValueCell.y + row, 'center');
        pdf.text(sheetNumberValue ?? '', sheetNumberValueCell.x + 6, sheetNumberValueCell.y + row, 'center');
        pdf.text(sheetsQtyValue ?? '', sheetsQtyValueCell.x + 8, sheetsQtyValueCell.y + row, 'center');
        pdf.setFontSize(20);
        pdf.text(companyValue ?? '', companyValueCell.x, companyValueCell.y);





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
    }

    pdf.setFontSize(10);
    pdf.text(`масштаб 1:${getRealScale().toFixed(0)}`, pdfWidth - 25, 148);
    




    // Save the PDF file
    pdf.save("download.pdf");




}


function registerButtonSavePdfEvent() {
    const savePdfButton = document.getElementById('savePdf');
    savePdfButton.addEventListener('click', handleSavePdfButtonClick);
}

export { registerButtonSavePdfEvent }