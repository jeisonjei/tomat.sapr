import { mat3 } from "gl-matrix";
import { Point } from "../models/Point.mjs";
import { SelectBoundary } from "../models/frames/SelectBoundary.mjs";
import { s } from "./globalState/settings.mjs";
import { g as gl } from "./globalState/g.js"
import { a } from "./globalState/a.js";
import jsPDF from "jspdf";
import { cnv } from "../libs/canvas-text/src/shared/cnv.js";

function getCos(angleDeg) {
  const angleRad = (angleDeg * Math.PI) / 180;
  return function () {
    return Math.cos(angleRad);
  }
}
function getSin(angleDeg) {
  const angleRad = (angleDeg * Math.PI) / 180;
  return function () {
    return Math.sin(angleRad);
  }
}
function g(xOrPoint, y) {
  if (typeof xOrPoint === 'object') {
    return new Point(xOrPoint.x, xOrPoint.y);
  } else {
    return new Point(xOrPoint, y);
  }
}
function getColor(red, green, blue, a) {
  const webglColor = [red / 255, green / 255, blue / 255, a];
  return webglColor;
}
function getAngleRadians(angleDegrees) {
  return angleDegrees * (Math.PI / 180);
}

function getAngleDegrees(angleRadians) {
  return angleRadians * (180 / Math.PI);
}
function getEccentricity(k) {
  const e = Math.sqrt(1 - k ** 2);
  return e;
}
function getRadius(b, e, phi) {
  const radius = b / (Math.sqrt(1 - (e ** 2) * (Math.cos(phi) ** 2)));
  return radius;
}
function getB(radius, e, phi) {
  const b = radius * Math.sqrt(1 - (e ** 2) * (Math.cos(phi) ** 2));
  return b;
}
function getMid(start, end) {
  const midX = (start.x + end.x) / 2;
  const midY = (start.y + end.y) / 2;
  return new Point(midX, midY);
}

function transformPointByMatrix4(matrix, point) {
  if (point.x === 0 && point.y === 0) {
    return g(0, 0);
  }
  const transformedPoint = new Point(0, 0);

  const x = point.x;
  const y = point.y;
  const w = 1;

  transformedPoint.x = matrix[0] * x + matrix[1] * y + matrix[3] * w + matrix[12];
  transformedPoint.y = matrix[4] * x + matrix[5] * y + matrix[7] * w + matrix[13];

  return transformedPoint;
}

function convertMatrixToPixelCoordinates(matrix, canvasWidth, canvasHeight) {
  // Calculate the scaling factors for x and y axes
  const scaleX = canvasWidth / 2;
  const scaleY = canvasHeight / 2;

  // Create a translation matrix to align with pixel coordinates
  const translationMatrix = mat3.fromValues(
    1, 0, 0,
    0, -1, 0,
    0, 0, 1
  );

  // Scale the transformation matrix to pixel coordinates
  const scaledMatrix = mat3.scale(mat3.create(), matrix, [scaleX, scaleY, 1]);

  // Apply translation to align with pixel coordinates
  const pixelMatrix = mat3.multiply(mat3.create(), translationMatrix, scaledMatrix);

  return pixelMatrix;
}


function transformPointByMatrix3(matrix, p) {
  /**
   * В этой функции матрица остаётся той же - в webgl координатах.
   * Так как на полотне теперь используются пиксели, точка преобразуется сначала
   * к координатам webgl, а затем обратно в пиксели
   */
  if (p.x === 0 && p.y === 0) {
    return new Point(0, 0);
  }
  let transformedPoint = new Point(0, 0);

  const point = canvasGetWebglCoordinates(p, gl.canvas);

  const x = point.x;
  const y = point.y;
  const w = 1;

  transformedPoint.x = matrix[0] * x + matrix[1] * y + matrix[2] * w;
  transformedPoint.y = matrix[3] * x + matrix[4] * y + matrix[5] * w;

  transformedPoint = convertWebGLToCanvas2DPoint(transformedPoint, gl.canvas.width, gl.canvas.height);

  return transformedPoint;
}
function canvasGetMouseWebgl(event, canvas) {
  return new Point(
    (event.clientX - canvas.offsetLeft) / canvas.width * 2 - 1,
    -(event.clientY - canvas.offsetTop) / canvas.height * 2 + 1
  )
}

function canvasGetMouse(event, canvas) {
  return new Point(
    (event.clientX - canvas.offsetLeft), (event.clientY - canvas.offsetTop)
  )
}

function canvasGetWebglCoordinates(position, canvas) {
  return new Point((position.x) / canvas.width * 2 - 1, (-position.y) / canvas.height * 2 + 1);
}

function convertPixelToWebGLCoordinate(pixelValue, canvasSize, isXAxis) {
  const canvasSizeHalf = canvasSize / 2;
  const scaleFactor = 2 / canvasSize;

  // Normalize the pixel coordinate to WebGL coordinate
  let webglCoord = (pixelValue - canvasSizeHalf) * scaleFactor;

  // Adjust for y-axis inversion in WebGL
  if (!isXAxis) {
    webglCoord *= -1;
  }

  return webglCoord;
}

function canvasGetClientY(event, canvas) {
  return (canvas.height - (event.clientY - canvas.offsetTop)) / canvas.height * 2 - 1;
}

function canvasGetClientX(event, canvas) {
  return (event.clientX - canvas.offsetLeft) / canvas.width * 2 - 1;
}

function convertVerticesToPoints(vertices) {
  let points = [];
  for (let i = 0; i < vertices.length; i += 2) {
    let point = new Point(vertices[i], vertices[i + 1]);
    points.push(point);
  }
  return points;
}

function isPointInsideFrame(frame, x, y) {
  const { point1, point2, point3 } = frame;
  if (x > point1.x && x < point2.x && ((y > point3.y && y < point2.y) || (y > point2.y && y < point3.y))) {
    return true;
  }
  return false;
}

function resizeCanvasToDisplaySize(canvas) {
  // Lookup the size the browser is displaying the canvas in CSS pixels.
  const displayWidth = canvas.clientWidth;
  const displayHeight = canvas.clientHeight;

  // Check if the canvas is not the same size.
  const needResize = canvas.width !== displayWidth ||
    canvas.height !== displayHeight;

  if (needResize) {
    // Make the canvas the same size
    canvas.width = displayWidth;
    canvas.height = displayHeight;
  }

  return needResize;
}

function checkFunction(shape, functionName, mouse) {
  return typeof shape[functionName] === 'function' ? shape[functionName](mouse) : null;
}

function convertWebGLToCanvas2DPoint(point, canvas2DWidth, canvas2DHeight) {
  const canvas2DX = (point.x + 1) * canvas2DWidth / 2;
  const canvas2DY = (1 - point.y) * canvas2DHeight / 2;
  return new Point(canvas2DX, canvas2DY);

}

function convertCanvas2DToWebGLPoint(point, canvas2DWidth, canvas2DHeight) {
  const webGLX = (point.x - canvas2DWidth / 2) / (canvas2DWidth / 2) - 1;
  const webGLY = (canvas2DHeight / 2 - point.y) / (canvas2DHeight / 2) - 1;
  return new Point(webGLX, webGLY);
}

function applyTransformationToPoint(x, y, matrix) {
  const newX = matrix[0] * x + matrix[3] * y + matrix[6];
  const newY = matrix[1] * x + matrix[4] * y + matrix[7];
  return new Point(newX, newY);
}

function getLineSelectBoundary(start, end) {
  const angle = Math.atan2(end.y - start.y, end.x - start.x);
  const baseWidth = s.tolerance / 2;
  const baseOffset = 0;

  const width = baseOffset * Math.sin(angle) + baseOffset * Math.cos(angle);
  const offsetX = baseWidth * Math.sin(angle);
  const offsetY = baseWidth * Math.cos(angle);

  const selectBoundary = new SelectBoundary(s.aspectRatio, new Point(0, 0), new Point(0, 0), new Point(0, 0), new Point(0, 0));

  selectBoundary.p1 = new Point(start.x - offsetX + width * Math.cos(angle), start.y + offsetY + width * Math.sin(angle));
  selectBoundary.p2 = new Point(end.x - offsetX - width * Math.cos(angle), end.y + offsetY - width * Math.sin(angle));
  selectBoundary.p3 = new Point(end.x + offsetX - width * Math.cos(angle), end.y - offsetY - width * Math.sin(angle));
  selectBoundary.p4 = new Point(start.x + offsetX + width * Math.cos(angle), start.y - offsetY + width * Math.sin(angle));

  return selectBoundary
}

function getSelectBoundaryRectangle(p1, p2, p3, p4) {
  const top = getLineSelectBoundary(p1, p2);
  const right = getLineSelectBoundary(p2, p3);
  const bottom = getLineSelectBoundary(p4, p3);
  const left = getLineSelectBoundary(p1, p4);

  const width = s.tolerance;

  const boundaryP1 = new Point(top.p1.x - width, top.p1.y - width);
  const boundaryP2 = new Point(top.p2.x + width, top.p2.y - width);
  const boundaryP3 = new Point(bottom.p3.x + width, bottom.p3.y + width);
  const boundaryP4 = new Point(bottom.p4.x - width, bottom.p4.y + width);

  return new SelectBoundary(s.aspectRatio, boundaryP1, boundaryP2, boundaryP3, boundaryP4);
}

function getSelectBoundaryCircle(p1, p2, p3, p4) {
  const top = getLineSelectBoundary(p1, p2);
  const right = getLineSelectBoundary(p2, p3);
  const bottom = getLineSelectBoundary(p4, p3);
  const left = getLineSelectBoundary(p1, p4);

  const width = s.tolerance;

  const boundaryP1 = new Point(top.p1.x - width, top.p1.y);
  const boundaryP2 = new Point(top.p2.x + width, top.p2.y);
  const boundaryP3 = new Point(bottom.p3.x + width, bottom.p3.y);
  const boundaryP4 = new Point(bottom.p4.x - width, bottom.p4.y);

  return new SelectBoundary(s.aspectRatio, boundaryP1, boundaryP2, boundaryP3, boundaryP4);
}

function isinSelectBoundaryLine(mouse, start, end) {
  const angle = Math.atan2(end.y - start.y, end.x - start.x);
  const baseWidth = s.tolerance / 2;
  const baseOffset = 0;

  const width = baseOffset * Math.sin(angle) + baseOffset * Math.cos(angle);
  const offsetX = baseWidth * Math.sin(angle);
  const offsetY = baseWidth * Math.cos(angle);

  const point1 = new Point(start.x - offsetX + width * Math.cos(angle), start.y + offsetY + width * Math.sin(angle));
  const point2 = new Point(end.x - offsetX - width * Math.cos(angle), end.y + offsetY - width * Math.sin(angle));
  const point3 = new Point(end.x + offsetX - width * Math.cos(angle), end.y - offsetY - width * Math.sin(angle));
  const point4 = new Point(start.x + offsetX + width * Math.cos(angle), start.y - offsetY + width * Math.sin(angle));

  const vertices = [
    point1.x, point1.y,
    point2.x, point2.y,
    point3.x, point3.y,
    point4.x, point4.y
  ];

  let isInside = false;
  let j = vertices.length - 2;

  for (let i = 0; i < vertices.length; i += 2) {
    const vertexX1 = vertices[i];
    const vertexY1 = vertices[i + 1];
    const vertexX2 = vertices[j];
    const vertexY2 = vertices[j + 1];

    if ((vertexY1 > mouse.y) !== (vertexY2 > mouse.y) &&
      mouse.x < ((vertexX2 - vertexX1) * (mouse.y - vertexY1)) / (vertexY2 - vertexY1) + vertexX1) {
      isInside = !isInside;
    }

    j = i;
  }
  return isInside;
}

function isHorizontal(line1, line2) {
  const deltaY1 = Math.abs(line1.start.y - line1.end.y);
  const deltaY2 = Math.abs(line2.start.y - line2.end.y);

  if (deltaY1 < deltaY2) {
    return line1;
  }
  else {
    return line2;
  }
}



const getSideOfMouse = (mouseCoords, lineCoords) => {
  const dx1 = mouseCoords.x - lineCoords.start.x;
  const dy1 = mouseCoords.y - lineCoords.start.y;
  const dx2 = lineCoords.end.x - lineCoords.start.x;
  const dy2 = lineCoords.end.y - lineCoords.start.y;

  const dotProduct = dx1 * dx2 + dy1 * dy2;
  if (dotProduct > 0) {
    return 'START';
  } else if (dotProduct < 0) {
    return 'END';
  } else {
    return null;
  };
};


function getSideOfMouseRelativeToLine(mouse, breakStart, selectedLine) {

  // Определяем координаты начала и конца выбранной линии
  const start = selectedLine.start;
  const end = selectedLine.end;

  // Определяем вектор, соединяющий начало и конец выбранной линии
  const lineVector = new Point(end.x - breakStart.x, end.y - breakStart.y);

  // Определяем вектор, соединяющий начало выбранной линии и точку мыши
  const mouseVector = new Point(mouse.x - breakStart.x, mouse.y - breakStart.y);

  // Вычисляем скалярное произведение векторов
  const scalarProduct = dot(lineVector, mouseVector);

  // Если скалярное произведение положительное, то точка мыши находится на одной стороне линии с началом
  if (scalarProduct > 0) {
    return 'end';
  }

  // Если скалярное произведение отрицательное, то точка мыши находится на одной стороне линии с концом
  if (scalarProduct < 0) {
    return 'start';
  }

  // Если скалярное произведение равно нулю, то точка мыши находится на самой линии
  return 'onLine';
}

function getProjection(mouse, line) {
  const lineVector = { x: line.end.x - line.start.x, y: line.end.y - line.start.y };
  const mouseVector = { x: mouse.x - line.start.x, y: mouse.y - line.start.y };

  const dotProduct = (mouseVector.x * lineVector.x + mouseVector.y * lineVector.y);
  const lineLengthSquared = lineVector.x * lineVector.x + lineVector.y * lineVector.y;

  const projectionScalar = dotProduct / lineLengthSquared;
  const projectionPoint = new Point(line.start.x + projectionScalar * lineVector.x, line.start.y + projectionScalar * lineVector.y);

  return projectionPoint;
}

function findClosestPoints(mouse, points) {
  const result = points.map(p => {
    const mouseVector = new Point(mouse.x - p.x, mouse.y - p.y);
    return { scalar: getScalar(mouse, mouseVector), point: p }
  });

  let firstNegativeScalar = null;
  let firstPositiveScalar = null;

  result.forEach(({ scalar, point }) => {
    if (scalar < 0 && (!firstNegativeScalar || scalar > firstNegativeScalar.scalar)) {
      firstNegativeScalar = { scalar, point };
    } else if (scalar > 0 && (!firstPositiveScalar || scalar < firstPositiveScalar.scalar)) {
      firstPositiveScalar = { scalar, point };
    }
  });

  let closestPoints = [];
  if (firstNegativeScalar && firstPositiveScalar) {
    closestPoints = [firstNegativeScalar.point, firstPositiveScalar.point];
  } else if (firstNegativeScalar) {
    closestPoints = [firstNegativeScalar.point];
  } else if (firstPositiveScalar) {
    closestPoints = [firstPositiveScalar.point];
  }

  return closestPoints;
}





const dot = (currentVector, otherVector) => {
  return currentVector.x * otherVector.x + currentVector.y * otherVector.y;
}

function getScalar(mouse, point) {

  const result = dot(mouse, point);
  return result;
}

function getDistance(mouse, point) {
  const result = Math.hypot(mouse.x - point.x, mouse.y - point.y)
  return result;
}
function isPointBetweenTwoPointsOnLine(point1, point2, selectedPoint) {
  const vector1 = { x: point1.x - selectedPoint.x, y: point1.y - selectedPoint.y };
  const vector2 = { x: point2.x - selectedPoint.x, y: point2.y - selectedPoint.y };

  const dotProduct = vector1.x * vector2.x + vector1.y * vector2.y;

  if (dotProduct > 0) {
    return true;
  } else if (dotProduct < 0) {
    return false;
  } else {
    return false;
  }
}
/**
 * Функция возвращает крайнюю левую нижнюю точку. 
 * Если никакую точку нельзя отнести к крайней левой, то вычисляется
 * новая точка на основе точки с крайней координатой x и крайней координатой y
 * @param {Object} selectBoundary - область объекта. Каждая фигура имеет поле "selectBoundary", этот объект содержит 4 точки p1, p2, p3, p4.
 * 
 */
function getLowerLeftPoint(selectBoundary) {
  var { p1, p2, p3, p4 } = selectBoundary;
  var minX = Math.min(p1.x, p2.x, p3.x, p4.x);
  var maxY = Math.max(p1.y, p2.y, p3.y, p4.y);
  return g(minX, maxY);
}

function findThirdPoint(point1, point2, length) {
  let xDiff = point2.x - point1.x;
  let yDiff = point2.y - point1.y;

  let distance = Math.sqrt(xDiff * xDiff + yDiff * yDiff);

  let ratio = length / distance;

  let x3 = point1.x + ratio * xDiff;
  let y3 = point1.y + ratio * yDiff;

  return new Point(x3, y3);
}
/**
 * Функция возвращает текущий настоящий масштаб чертежа, то есть тот, который будет при печати в pdf
 */
function getRealScale() {
  const pdf = new jsPDF({
    unit: 'mm',
    format: s.format,
    orientation: "l",
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  const scaleX = cnv.context.canvas.width / pdfWidth;
  var pxScale = 1 / a.zlc;
  var realScale = pxScale * scaleX;
  return realScale;

}

function calcNewZlc(realScale) {

  const pdf = new jsPDF({
    unit: 'mm',
    format: s.format,
    orientation: "l",
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  const scaleX = cnv.context.canvas.width / pdfWidth;

  var pxScale = realScale / scaleX;
  var zlc = 1 / pxScale;
  return zlc;

}
function hexToNormalizedRGBA(hex) {
  // Remove '#' from the beginning of the hex color
  hex = hex.replace('#', '');

  // Convert hex to RGB
  let r = parseInt(hex.substring(0, 2), 16) / 255;
  let g = parseInt(hex.substring(2, 4), 16) / 255;
  let b = parseInt(hex.substring(4, 6), 16) / 255;

  return [r, g, b, 1.0]; // Return normalized RGBA values
}

function normalizedRGBAToRGBA(normalizedRGBA) {
  // Convert normalized RGBA values to 0-255 range
  let r = Math.round(normalizedRGBA[0] * 255);
  let g = Math.round(normalizedRGBA[1] * 255);
  let b = Math.round(normalizedRGBA[2] * 255);
  let a = normalizedRGBA[3]; // Alpha value remains unchanged

  return [r, g, b]; // Return RGBA color string
}

function getTriangulatedVerticesByTwoPoints(start, end, width) {

  // Calculate the vector along the line segment
  let dx = end.x - start.x;
  let dy = end.y - start.y;

  // Calculate the normalized perpendicular vector
  let length = Math.hypot(dx, dy);
  let nx = dy / length;  // Normalized perpendicular vector x
  let ny = -dx / length; // Normalized perpendicular vector y

  // Calculate the offset points for the rectangle corners
  let offsetX = nx * width / 2;
  let offsetY = ny * width / 2;

  // Calculate the four corners of the rectangle
  let corner1 = { x: start.x + offsetX, y: start.y + offsetY };
  let corner2 = { x: end.x + offsetX, y: end.y + offsetY };
  let corner3 = { x: end.x - offsetX, y: end.y - offsetY };
  let corner4 = { x: start.x - offsetX, y: start.y - offsetY };

  // Return the coordinates of the rectangle corners as two triangles
  return [
    corner1.x, corner1.y,
    corner2.x, corner2.y,
    corner3.x, corner3.y,
    corner1.x, corner1.y,
    corner3.x, corner3.y,
    corner4.x, corner4.y
  ];




}
/**
 * Функция определяет, находится ли точка внутри прямоугольника
 * @param {Point} p - точка, которую нужно проверить
 * @param {Point} p1 - вершина прямоугольника
 * @param {Point} p2 - вершина прямоугольника
 * @param {Point} p3 - вершина прямоугольника
 * @param {Point} p4 - вершина прямоугольника
 */
function pointInsideRectangle(p, p1, p2, p3, p4) {
  // Calculate vectors from the point to each corner of the rectangle
  let vec1 = { x: p1.x - p.x, y: p1.y - p.y };
  let vec2 = { x: p2.x - p.x, y: p2.y - p.y };
  let vec3 = { x: p3.x - p.x, y: p3.y - p.y };
  let vec4 = { x: p4.x - p.x, y: p4.y - p.y };

  // Calculate the cross product of consecutive vectors
  function crossProduct(v1, v2) {
    return v1.x * v2.y - v1.y * v2.x;
  }

  let cross1 = crossProduct(vec1, vec2);
  let cross2 = crossProduct(vec2, vec3);
  let cross3 = crossProduct(vec3, vec4);
  let cross4 = crossProduct(vec4, vec1);

  // Check if all cross products have the same sign
  return (cross1 > 0 && cross2 > 0 && cross3 > 0 && cross4 > 0) || (cross1 < 0 && cross2 < 0 && cross3 < 0 && cross4 < 0);
}
/**
 * Функция возвращает точки пересечения прямоугольника и линии, если такие имеются.
 * @param {Point} p1 - вершина прямоугольника
 * @param {Point} p2 - вершина прямоугольника
 * @param {Point} p3 - вершина прямоугольника
 * @param {Point} p4 - вершина прямоугольника
 * @param {Point} start - начальная точка линии
 * @param {Point} end - конечная точка линии
 */
function findRectangleAndLineIntersectionPoints(p1, p2, p3, p4, start, end) {
  function lineIntersection(x1, y1, x2, y2, x3, y3, x4, y4) {
    let ua, ub, denom;
    denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
    if (denom === 0) {
      return null; // Lines are parallel
    }
    ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denom;
    ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denom;
    if (ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1) {
      let x = x1 + ua * (x2 - x1);
      let y = y1 + ua * (y2 - y1);
      return { x, y };
    } else {
      return null; // Intersection point is outside the line segments
    }
  }

  let intersections = [];

  // Check for intersection with each side of the rectangle
  let sides = [
    [p1, p2],
    [p2, p3],
    [p3, p4],
    [p4, p1]
  ];

  for (let side of sides) {
    let intersection = lineIntersection(side[0].x, side[0].y, side[1].x, side[1].y, start.x, start.y, end.x, end.y);
    if (intersection) {
      intersections.push(intersection);
    }
  }

  return intersections;
}

function groupPairs(arr) {
  var result = [];
  for (let i = 0; i < arr.length; i += 2) {
    if (i + 1 < arr.length) {
      result.push([arr[i], arr[i + 1]]);
    }
  }
}

/**
 * Функция возвращает массив вершин единичной фигуры
 */
function getUnitShape(type) {
  console.log(`** type: ${type}`);
  if (['line', 'symline'].includes(type)) {
    return new Float32Array([
      // first triangle
      -0.0, .5,
      -0.0, -.5,
      1.0, -.5,
      // second triangle
      1.0, .5,
      1.0, -.5,
      -0.0, .5,
    ]);

  }
  else if (type === 'circle') {
    const points = [];
    for (let i = 0; i <= numSegments; i++) {
      const angle = i * Math.PI / 180;
      const x = center.x + radius * Math.cos(angle);
      const y = center.y + radius * Math.sin(angle);
      points.push(p.g(x, y));
    }
    var triangulated = [];
    for (let i = 0; i < points.length; i += 1) {
      if (i + 1 < points.length) {
        const point1 = points[i];
        const point2 = points[i + 1];
        const triangulatedVertices = getTriangulatedVerticesByTwoPoints(point1, point2, lineWidth);
        triangulated.push(...triangulatedVertices);
      }
    }

    return new Float32Array(triangulated);
  }
  else if (['rectangle', 'square'].includes(type)) {

  }
}



export {
  getCos,
  getSin,
  g,
  getColor,
  getAngleRadians,
  getAngleDegrees,
  getEccentricity,
  getRadius,
  getB,
  getMid,
  transformPointByMatrix4,
  transformPointByMatrix3,
  canvasGetMouseWebgl,
  canvasGetMouse,
  canvasGetWebglCoordinates,
  convertPixelToWebGLCoordinate,
  canvasGetClientY,
  canvasGetClientX,
  convertVerticesToPoints,
  isPointInsideFrame,
  resizeCanvasToDisplaySize,
  checkFunction,
  convertWebGLToCanvas2DPoint,
  convertCanvas2DToWebGLPoint,
  applyTransformationToPoint,
  getLineSelectBoundary,
  getSelectBoundaryRectangle,
  getSelectBoundaryCircle,
  isinSelectBoundaryLine,
  isHorizontal,
  getSideOfMouse,
  getSideOfMouseRelativeToLine,
  getProjection,
  findClosestPoints,
  getScalar,
  getDistance,
  isPointBetweenTwoPointsOnLine,
  getLowerLeftPoint,
  findThirdPoint,
  getRealScale,
  calcNewZlc as setRealScale,
  hexToNormalizedRGBA,
  normalizedRGBAToRGBA,
  getTriangulatedVerticesByTwoPoints,
  pointInsideRectangle,
  findRectangleAndLineIntersectionPoints,
  groupPairs,
  getUnitShape
};
