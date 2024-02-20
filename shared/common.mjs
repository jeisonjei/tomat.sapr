import { Point } from "../models/Point.mjs";

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

export function transformPointByMatrix3(matrix, point) {
  if (point.x === 0 && point.y === 0) {
    return new Point(0, 0);
  }
  const transformedPoint = new Point(0, 0);

  const x = point.x;
  const y = point.y;
  const w = 1;

  transformedPoint.x = matrix[0] * x + matrix[1] * y + matrix[2] * w;
  transformedPoint.y = matrix[3] * x + matrix[4] * y + matrix[5] * w;

  return transformedPoint;
}
export function canvasGetMouse(event, canvas) {
  return new Point(
    (event.clientX - canvas.offsetLeft) / canvas.width * 2 - 1,
    -(event.clientY - canvas.offsetTop) / canvas.height * 2 + 1
  )
}

export function canvasGetWebglCoordinates(position, canvas) {
  return new Point((position.x) / canvas.width * 2 - 1, (-position.y) / canvas.height * 2 + 1);
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
