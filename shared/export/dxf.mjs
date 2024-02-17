import { a } from '../../main.js';
import { t } from '../../main.js';
import {s} from '../settings.mjs';
import { canvas } from '../../main.js';
import { canvasGetWebglCoordinates } from '../common.mjs';
import { Point } from '../../models/Point.mjs';

export function generateDXFContent() {
    // let dxfContent = `0\nSECTION\n2\nENTITIES\n`; // DXF header
    let dxfContent = `0\nSECTION\n2\nHEADER\n0\nENDSEC\n0\nSECTION\n2\nTABLES\n0\nENDSEC\n0\nSECTION\n2\nBLOCKS\n0\nENDSEC\n0\nSECTION\n2\nENTITIES\n`;

    const canvasHeight = canvas.height;
    const canvasWidth = canvas.width;

    a.shapes.forEach((shape) => {
        switch (shape.type) {
            case 'rectangle':
                const rectangle = shape;
                const { p1, p2, p3, p4 } = rectangle;
                const scaledP1 = scalePoint(p1, canvasHeight, canvasWidth);
                const scaledP2 = scalePoint(p2, canvasHeight, canvasWidth);
                const scaledP3 = scalePoint(p3, canvasHeight, canvasWidth);
                const scaledP4 = scalePoint(p4, canvasHeight, canvasWidth);
                dxfContent += `0\nLWPOLYLINE\n8\nLayer1\n90\n4\n70\n1\n`;
                dxfContent += `10\n${scaledP1.x}\n20\n${scaledP1.y}\n`;
                dxfContent += `10\n${scaledP2.x}\n20\n${scaledP2.y}\n`;
                dxfContent += `10\n${scaledP3.x}\n20\n${scaledP3.y}\n`;
                dxfContent += `10\n${scaledP4.x}\n20\n${scaledP4.y}\n`;
                dxfContent += `10\n${scaledP1.x}\n20\n${scaledP1.y}\n`;
                break;
            case 'circle':
                const circle = shape;
                const { center, radius } = circle;
                const scaledCenter = scalePoint(center, canvasHeight, canvasWidth);
                const scaledRadius = scaleLength(radius, canvasWidth, canvasWidth);
                dxfContent += `0\nCIRCLE\n8\nLayer1\n10\n${scaledCenter.x}\n20\n${scaledCenter.y}\n40\n${scaledRadius}\n`;
                break;
            case 'line':
                const line = shape;
                const { start: lineStart, end: lineEnd } = line;
                const scaledLineStart = scalePoint(lineStart, canvasHeight, canvasWidth);
                const scaledLineEnd = scalePoint(lineEnd, canvasHeight, canvasWidth);
                dxfContent += `0\nLINE\n8\nLayer1\n10\n${scaledLineStart.x}\n20\n${scaledLineStart.y}\n11\n${scaledLineEnd.x}\n21\n${scaledLineEnd.y}\n`;
                break;
            // Add cases for other shape types here
            default:
                // Handle unknown shape types
                break;
        }
    });

    const scaleY = 1 / canvas.height;
    
    t.text.forEach((textInput, index) => {
        const { position, text } = textInput;
        const textString = text.join('');
        const size = (parseInt(t.fontSize));
        const x = (position.x);
        const y = (position.y);
        const webglCoord = canvasGetWebglCoordinates(new Point(x, y), canvas);

        const a = scalePoint(webglCoord, canvasHeight, canvasWidth);

        dxfContent += `0\nTEXT\n8\n${index}\n10\n${a.x}\n20\n${a.y}\n40\n${size*scaleY*0.1}\n1\n${textString}\n`;
    });

    dxfContent += `0\nENDSEC\n0\nEOF`; // DXF footer

    saveDXFFile(dxfContent, 'drawing.dxf');
}

function saveDXFFile(dxfContent, fileName) {
    const blob = new Blob([dxfContent], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
}

function scalePoint(point, canvasWidth, canvasHeight) {
    const scaledX = (point.x / canvasWidth) * 100; // Scale x-coordinate to fit within 100 units
    const scaledY = (point.y / canvasHeight) * 100; // Scale y-coordinate to fit within 100 units
    return { x: scaledX, y: scaledY };
}

function scaleLength(length, canvasWidth, canvasHeight) {
    const aspectRatio = canvasWidth / canvasHeight;
    const scaledLength = length / Math.max(canvasWidth, canvasHeight) * 100; // Scale length to fit within 100 units
    return scaledLength * aspectRatio; // Adjust length based on aspect ratio
}