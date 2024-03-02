import { mat3 } from "gl-matrix";
import { Point } from "../models/Point.mjs";
import { SelectBoundary } from "../models/frames/SelectBoundary.mjs";
import { s } from "./settings.mjs";

export function getCos(angleDeg) {
  const angleRad = (angleDeg * Math.PI) / 180;
  return function () {
    return Math.cos(angleRad);
  }
}
export function getSin(angleDeg) {
  const angleRad = (angleDeg * Math.PI) / 180;
  return function () {
    return Math.sin(angleRad);
  }
}
export function g(xOrPoint, y) {
  if (typeof xOrPoint === 'object') {
    return new Point(xOrPoint.x, xOrPoint.y);
  } else {
    return new Point(xOrPoint, y);
  }
}
export function getColor(red, green, blue, a) {
  const webglColor = [red / 255, green / 255, blue / 255, a];
  return webglColor;
}
export function getAngleRadians(angleDegrees) {
  return angleDegrees * (Math.PI / 180);
}

export function getAngleDegrees(angleRadians) {
  return angleRadians * (180 / Math.PI);
}
export function getEccentricity(k) {
  const e = Math.sqrt(1 - k ** 2);
  return e;
}
export function getRadius(b, e, phi) {
  const radius = b / (Math.sqrt(1 - (e ** 2) * (Math.cos(phi) ** 2)));
  return radius;
}
export function getB(radius, e, phi) {
  const b = radius * Math.sqrt(1 - (e ** 2) * (Math.cos(phi) ** 2));
  return b;
}
export function getMid(start, end) {
  const midX = (start.x + end.x) / 2;
  const midY = (start.y + end.y) / 2;
  return new Point(midX, midY);
}

export function transformPointByMatrix4(matrix, point) {
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


export function transformPointByMatrix3(matrix, p) {
  /**
   * В этой функции матрица остаётся той же - в webgl координатах.
   * Так как на полотне теперь используются пиксели, точка преобразуется сначала
   * к координатам webgl, а затем обратно в пиксели
   */
  if (p.x === 0 && p.y === 0) {
    return new Point(0, 0);
  }
  let transformedPoint = new Point(0, 0);

  const point = canvasGetWebglCoordinates(p,s.webglContext.canvas);

  const x = point.x;
  const y = point.y;
  const w = 1;

  transformedPoint.x = matrix[0] * x + matrix[1] * y  + matrix[2] * w;
  transformedPoint.y = matrix[3] * x + matrix[4] * y  + matrix[5] * w;

  transformedPoint = convertWebGLToCanvas2DPoint(transformedPoint,s.canvasWidth,s.canvasHeight);

  return transformedPoint;
}
export function canvasGetMouseWebgl(event, canvas) {
  return new Point(
    (event.clientX - canvas.offsetLeft) / canvas.width * 2 - 1,
    -(event.clientY - canvas.offsetTop) / canvas.height * 2 + 1
  )
}

export function canvasGetMouse(event, canvas) {
  return new Point(
    (event.clientX - canvas.offsetLeft), (event.clientY - canvas.offsetTop)
  )
}

export function canvasGetWebglCoordinates(position, canvas) {
  return new Point((position.x) / canvas.width * 2 - 1, (-position.y) / canvas.height * 2 + 1);
}

export function convertPixelToWebGLCoordinate(pixelValue, canvasSize, isXAxis) {
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

export function canvasGetClientY(event, canvas) {
  return (canvas.height - (event.clientY - canvas.offsetTop)) / canvas.height * 2 - 1;
}

export function canvasGetClientX(event, canvas) {
  return (event.clientX - canvas.offsetLeft) / canvas.width * 2 - 1;
}

export function convertVerticesToPoints(vertices) {
  let points = [];
  for (let i = 0; i < vertices.length; i += 2) {
    let point = new Point(vertices[i], vertices[i + 1]);
    points.push(point);
  }
  return points;
}

export function isPointInsideFrame(frame, x, y) {
  const { point1, point2, point3 } = frame;
  if (x > point1.x && x < point2.x && ((y > point3.y && y < point2.y) || (y > point2.y && y < point3.y))) {
    return true;
  }
  return false;
}

export function resizeCanvasToDisplaySize(canvas) {
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

export function checkFunction(shape, functionName, mouse) {
  return typeof shape[functionName] === 'function' ? shape[functionName](mouse) : null;
}

export function convertWebGLToCanvas2DPoint(point, canvas2DWidth, canvas2DHeight) {
  const canvas2DX = (point.x + 1) * canvas2DWidth / 2;
  const canvas2DY = (1 - point.y) * canvas2DHeight / 2;
  return new Point(canvas2DX, canvas2DY);

}

export function convertCanvas2DToWebGLPoint(point, canvas2DWidth, canvas2DHeight) {
  const webGLX = (point.x - canvas2DWidth / 2) / (canvas2DWidth / 2) - 1;
  const webGLY = (canvas2DHeight / 2 - point.y) / (canvas2DHeight / 2) - 1;
  return new Point(webGLX, webGLY);
}

export function applyTransformationToPoint(x, y, matrix) {
  const newX = matrix[0] * x + matrix[3] * y + matrix[6];
  const newY = matrix[1] * x + matrix[4] * y + matrix[7];
  return new Point(newX, newY);
}

export function getLineSelectBoundary(start, end) {
  const width = s.tolerance / 2;
  const angle = Math.atan2(end.y - start.y, end.x - start.x);
  const offsetX = width * Math.sin(angle);
  const offsetY = width * Math.cos(angle);

  const selectBoundary = new SelectBoundary(s.aspectRatio, new Point(0, 0), new Point(0, 0), new Point(0, 0), new Point(0, 0));

  selectBoundary.p1 = new Point(start.x - offsetX + width * Math.cos(angle), start.y + offsetY + width * Math.sin(angle));
  selectBoundary.p2 = new Point(end.x - offsetX - width * Math.cos(angle), end.y + offsetY - width * Math.sin(angle));
  selectBoundary.p3 = new Point(end.x + offsetX - width * Math.cos(angle), end.y - offsetY - width * Math.sin(angle));
  selectBoundary.p4 = new Point(start.x + offsetX + width * Math.cos(angle), start.y - offsetY + width * Math.sin(angle));

  return selectBoundary
}

export function getSelectBoundaryRectangle(p1, p2, p3, p4) {
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

export function isinSelectBoundaryLine(mouse, start, end) {
  const width = s.tolerance / 2;
  const angle = Math.atan2(end.y - start.y, end.x - start.x);
  const offsetX = width * Math.sin(angle);
  const offsetY = width * Math.cos(angle);

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

export function isHorizontal(line1, line2) {
  const deltaY1 = Math.abs(line1.start.y - line1.end.y);
  const deltaY2 = Math.abs(line2.start.y - line2.end.y);

  if (deltaY1 < deltaY2) {
    return line1;
  }
  else {
    return line2;
  }
}



export const getSideOfMouse = (mouseCoords, lineCoords) => {
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
    console.log('On the line');
    return null;
  };
};


export function getSideOfMouseRelativeToLine(mouse, breakStart, selectedLine) {

  // Определяем координаты начала и конца выбранной линии
  const start = selectedLine.start;
  const end = selectedLine.end;

  // Определяем вектор, соединяющий начало и конец выбранной линии
  const lineVector = end.subtract(breakStart);

  // Определяем вектор, соединяющий начало выбранной линии и точку мыши
  const mouseVector = mouse.subtract(breakStart);

  // Вычисляем скалярное произведение векторов
  const scalarProduct = lineVector.dot(mouseVector);

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

export function getProjection(mouse, line) {
  const lineVector = { x: line.end.x - line.start.x, y: line.end.y - line.start.y };
  const mouseVector = { x: mouse.x - line.start.x, y: mouse.y - line.start.y };

  const dotProduct = (mouseVector.x * lineVector.x + mouseVector.y * lineVector.y);
  const lineLengthSquared = lineVector.x * lineVector.x + lineVector.y * lineVector.y;

  const projectionScalar = dotProduct / lineLengthSquared;
  const projectionPoint = new Point(line.start.x + projectionScalar * lineVector.x, line.start.y + projectionScalar * lineVector.y);

  return projectionPoint;
}

export function findClosestPoints(mouse, points) {
  const result = points.map(p => {
    const mouseVector = mouse.subtract(p);
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






export function getScalar(mouse, point) {
  const result = mouse.dot(point);
  return result;
}

export function getDistance(mouse, point) {
  const result = Math.hypot(mouse.x - point.x, mouse.y - point.y)
  return result;
}
export function isPointBetweenTwoPointsOnLine(point1, point2, selectedPoint) {
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
