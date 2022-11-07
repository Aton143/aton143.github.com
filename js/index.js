"use strict";

// Digging at sand - using code by Stephen Lavelle
// https://github.com/increpare/Sandscratcher/blob/master/scratcher.js
let canvas = null;
let ctx = null;
let xAdjustment = 1;
let yAdjustment = 1;

let lastX = 0;
let lastY = 0;

// Constants
const BRUSH_BOTTOM = 0;
const BRUSH_TOP = 120;

const BRUSH_MAX_SLOPE = 1;
const ANGLE_OF_REPOSE = 34;

let CANVAS_WIDTH;
let CANVAS_HEIGHT;

const MAX_SAND_HEIGHT = 10;
const INITIAL_SAND_HEIGHT = 5;

let heightMap;
let heightMapOld;
let maxHeightMap;

let nibTrailX = 0;
let nibTrailY = 0;

let brushTiltAngle = 0;
let brushTiltAmount = 0;

function lerpColor(a, b, amount)
{
  let aFromHex = parseInt(a.replace(/#/g, ''), 16),
      aRed = aFromHex >> 16, aGreen = aFromHex >> 8 & 0xff, aBlue = aFromHex & 0xff,
      bFromHex = parseInt(b.replace(/#/g, ''), 16),
      bRed = bFromHex >> 16, bGreen = bFromHex >> 8 & 0xff, bBlue = bFromHex & 0xff,
      rRed = aRed + amount * (bRed - aRed),
      rGreen = aGreen + amount * (bGreen - aGreen),
      rBlue = aBlue + amount * (bBlue - aBlue);

  return '#' + ((1 << 24) + (rRed << 16) + (rGreen << 8) + rBlue | 0).toString(16).slice(1);
}

const colorRampShort = 
[
  "#663931",
  "#8f563b",
  "#d9a066",
  "#eec39a",
];

let colorRampLong = [];

for (let i = 0; i < colorRampShort.length - 1; i++)
{
  const INTERP_STEPS=4;

  for (let j = 0; j < INTERP_STEPS; j++)
  {
    colorRampLong.push(lerpColor(colorRampShort[i], colorRampShort[i + 1], j / INTERP_STEPS));
  }
}

colorRampLong.push(colorRampShort[colorRampShort.length]);

function renderBoard() {
  for (let i = 1; i < CANVAS_WIDTH - 1; i++)
  {
    for (let j = 1; j < CANVAS_HEIGHT - 1; j++)
    {
      if (heightMap[i + CANVAS_WIDTH * j] === heightMapOld[i + CANVAS_WIDTH * j])
      {
        continue;
      }

      let dx = heightMap[i + 1 + CANVAS_WIDTH * j] - heightMap[i - 1 + CANVAS_WIDTH * j];
      let dy = heightMap[i + CANVAS_WIDTH * (j + 1)] - heightMap[i + CANVAS_WIDTH * (j - 1)];

      // max brightness if dx && dy are 4
      // min brightness if dx && dy are -4
      const brightnessIndex = (-dx + dy +8);
      canvas.getContext('2d').fillStyle = colorRampLong[brightnessIndex];
      canvas.getContext('2d').fillRect(i, j, 1, 1);

      heightMapOld[i + CANVAS_WIDTH * j] = heightMap[i + CANVAS_WIDTH * j];
    }
  }

  //set heightmapold = heightmap
  for (let i = 0; i < CANVAS_WIDTH; i++)
  {
    heightMapOld[i + CANVAS_WIDTH * 0] = heightMap[i + CANVAS_WIDTH * 0];
    heightMapOld[i + CANVAS_WIDTH - 1] = heightMap[i + CANVAS_WIDTH - 1];
  }

  for (let i = 0; i < CANVAS_HEIGHT; i++)
  {
    heightMapOld[0 + CANVAS_WIDTH * i] = heightMap[0 + CANVAS_WIDTH * i];
    heightMapOld[CANVAS_WIDTH - 1 + CANVAS_WIDTH * i] = heightMap[CANVAS_WIDTH - 1 + CANVAS_WIDTH * i];
  }
}

const MAX_SAND_SLOPE = 1;

function moveSandGrain(i, j, nibX, nibY)
{
  let dx = i - nibX;
  let dy = j - nibY;
  const distanceFromNib = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));

  // pick a direction to distribute it in
  let distributionDirectionX;
  let distributionDirectionY;

  if (distanceFromNib < 1)
  {
    // pick random direction
    const distrubtionAngleRandom = Math.random() * 2 * Math.PI;
    distributionDirectionX = Math.cos(distrubtionAngleRandom);
    distributionDirectionY = Math.sin(distrubtionAngleRandom);
  }
  else
  {
    // find angle based on dx,dy
    const distributionAngle = Math.atan2(dy, dx);
    // jitter it a bit - say +/-10,
    const distributionAngleJittered = distributionAngle + (Math.random() - 0.5) * 20.0 * Math.PI / 180;
    distributionDirectionX = Math.cos(distributionAngleJittered);
    distributionDirectionY = Math.sin(distributionAngleJittered);                                                
  }

  // move in this direction until you find an unaffected pixel
  let iNew = i;
  let jNew = j;

  let iNewFloorD = Math.floor(iNew);
  let jNewFloorD = Math.floor(jNew);

  let ijHeightMapMax = maxHeightMap[i + CANVAS_WIDTH * j];

  let stepCount=0;

  const nextXCoordinateDiff = distributionDirectionX > 0 ? 1 : -1;
  const nextYCoordinateDiff = distributionDirectionY > 0 ? 1 : -1;

  let flatX = true;
  let flatY = true;

  while (heightMap[iNewFloorD + CANVAS_WIDTH * jNewFloorD] >= maxHeightMap[iNewFloorD + CANVAS_WIDTH * jNewFloorD] ||
         !flatX || !flatY)
  {
    stepCount++;
    iNew += distributionDirectionX;
    jNew += distributionDirectionY;
    iNewFloorD = Math.floor(iNew);
    jNewFloorD = Math.floor(jNew);

    if (iNewFloorD < 0 || iNewFloorD >= CANVAS_WIDTH || jNewFloorD < 0 || jNewFloorD >= CANVAS_HEIGHT)
    {
      return;
    }    

    let iHorizontAhead = iNewFloorD + nextXCoordinateDiff;
    let jVerticalAhead = jNewFloorD + nextYCoordinateDiff;

    if (iHorizontAhead >= 0 && iHorizontAhead < CANVAS_WIDTH)
    {
      flatX = !(heightMap[iHorizontAhead + CANVAS_WIDTH * jNewFloorD] + 1 < heightMap[iNewFloorD + CANVAS_WIDTH * jNewFloorD]);
    }
    else
    {
      flatX = true;
    }

    if (jVerticalAhead >= 0 && jVerticalAhead < CANVAS_HEIGHT)
    {
      flatY = !(heightMap[iNewFloorD + CANVAS_WIDTH * jVerticalAhead] + 1 < heightMap[iNewFloorD + CANVAS_WIDTH * jNewFloorD]);
    }
    else
    {
      flatY = true;
    }
  }

  heightMap[iNewFloorD + CANVAS_WIDTH * jNewFloorD]++;
  heightMap[i + CANVAS_WIDTH * j]--;     
}

function drawAt(x, y, pressure) {
  let nibX = x;
  let nibY = y;

  for (let i = 0; i < CANVAS_WIDTH; i++)
  {
    for (let j = 0; j < CANVAS_HEIGHT; j++)
    {
     let dx = i - nibX;
      let dy = j - nibY;

      if (dx > 0)
      {
        dx *= xAdjustment;
      }
      else
      {
        dx /= xAdjustment;
      }

      if (dy > 0)
      {
        dy *= yAdjustment;
      }
      else
      {
        dy /= yAdjustment;
      }

      const ijRadius = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
      const slopeHeightIJ = BRUSH_MAX_SLOPE * ijRadius + (1 - 2 * pressure) * INITIAL_SAND_HEIGHT;

      const maxHeight = Math.floor(Math.min(MAX_SAND_HEIGHT, slopeHeightIJ));
      maxHeightMap[i + CANVAS_WIDTH * j] = maxHeight;
    }
  }

  // loop through board

  for (let i = 0; i < CANVAS_WIDTH; i++)
  {
    for (let j = 0; j < CANVAS_HEIGHT; j++)
    {
      const sandHeight = heightMap[i + CANVAS_WIDTH * j];
      const dx = x - i;
      const dy = y - j;
      let distanceFromNib = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2)); 

      const dRadius = distanceFromNib;

      const MAX_HEIGHT_IJ = maxHeightMap[i + CANVAS_WIDTH * j];

      if (sandHeight > MAX_HEIGHT_IJ){
        let excess = sandHeight - MAX_HEIGHT_IJ;

        for (let excessI = 0; excessI < excess; excessI++){
          moveSandGrain(i, j, nibX, nibY);
        }
      }                        
    }
  }

  renderBoard();
}

function clearBoard()
{
  resetPage();
  renderBoard();
}

function queueLastPoints(x, y)
{
  let MOVE_SPEED = 3;

  // move nib_trail towards x,y
  let trailDx = x - nibTrailX;
  let trailDy = y - nibTrailY;

  // normalize trail
  let trailLength = Math.sqrt(Math.pow(trailDx, 2) + Math.pow(trailDy, 2));
  if (trailLength > MOVE_SPEED)
  {
    trailDx /= trailLength;
    trailDy /= trailLength;

    nibTrailX -= trailDx;
    nibTrailY -= trailDy;
  }
  else
  {
    nibTrailX = x;
    nibTrailY = y;
  }

  // distance from x,y
  const dx = nibTrailX - x;
  const dy = nibTrailY - y;

  const MAX_DIST = 20;
  const distance = Math.sqrt(dx * dx + dy * dy);
  if (distance > MAX_DIST){
    // move towards x,y so that it's MAX_DIST AWAY
    nibTrailX = x + dx * MAX_DIST / distance;
    nibTrailY = y + dy * MAX_DIST / distance;
  }
}

function calculateAdjustment(nibX, nibY, tiltX, tiltY)
{
  if (tiltX !== null && (tiltX !== 0 && tiltY !== 0))
  {
    // scale tiltX from -90,90 to -2,2
    tiltX = -tiltX * 2 / 90;
    tiltY = -tiltY * 2 / 90;
    xAdjustment = Math.pow(2, tiltX);
    yAdjustment = Math.pow(2, tiltY);
    return;
  }

  // use nib_trail_x/y to adjust x/y
  let trailDx = nibX - nibTrailX;
  let trailDy = nibY - nibTrailY;

  // normalize trail
  let trailLength = Math.sqrt(Math.pow(trailDx, 2) + Math.pow(trailDy , 2));
  if (trailLength > 0)
  {
    trailDx /= trailLength;
    trailDy /= trailLength;
  }
  else
  {
    trailDx = 0;
    trailDy = 0;
  }

  const LERP_AMOUNT = 0.1;
  xAdjustment = xAdjustment * (1 - LERP_AMOUNT) + Math.pow(2, -trailDx) * LERP_AMOUNT;
  yAdjustment = yAdjustment * (1 - LERP_AMOUNT) + Math.pow(2, trailDy) * LERP_AMOUNT;
}

function onPointerDown(event) {
  // call drawat
  let [x,y] = getXY(event);

  lastX = x;
  lastY = y;

  nibTrailX = x;
  nibTrailY = y;

  calculateAdjustment(x, y, event.pointerType === "pen" ? event.tiltX : 0, event.pointerType ==="pen" ? event.tiltY : 0);

  let pressure = event.pressure;
  if (pressure === 0)
  {
    pressure = 0.5;
  }

  drawAt(x, y, pressure);
}

function getXY(event){
  const bb = canvas.getBoundingClientRect();
  let clientX = event.clientX;
  let clientY = event.clientY;

  let x = Math.floor((clientX - bb.left) / bb.width  * canvas.width);
  let y = Math.floor((clientY - bb.top)  / bb.height * canvas.height);

  const visibleBoxRatio = bb.width / bb.height;
  if (visibleBoxRatio > CANVAS_WIDTH / CANVAS_HEIGHT)
  {
    const horizontalScale = visibleBoxRatio / (CANVAS_WIDTH / CANVAS_HEIGHT);
    x = CANVAS_WIDTH / 2 + (x -CANVAS_WIDTH / 2) * horizontalScale;
  }
  else
  {
    const verticalScale = (CANVAS_WIDTH / CANVAS_HEIGHT) / visibleBoxRatio;
    y = CANVAS_HEIGHT / 2 + (y - CANVAS_HEIGHT / 2) * verticalScale;
  }

  return[x,y];
}

function drawTo(x, y, pressure, tiltX, tiltY)
{
  // distance of x,y to last_x,last_y
  let dx = x - lastX;
  let dy = y - lastY;
  let distance = Math.sqrt(dx * dx + dy * dy);

  const MAX_DIST = 3;

  while (distance > MAX_DIST)
  {
    // move last_x,last_y MAX_DISTANCE units towards x,y
    lastX += dx * MAX_DIST / distance;
    lastY += dy * MAX_DIST / distance;

    calculateAdjustment(x, y, tiltX, tiltY);
    drawAt(lastX, lastY, pressure);
    queueLastPoints(lastX, lastY);

    dx = x - lastX;
    dy = y - lastY;
    distance = Math.sqrt(dx * dx + dy * dy);
  }

  calculateAdjustment(x, y, tiltX, tiltY);
  drawAt(x, y, pressure);
  queueLastPoints(x, y);

  lastX = x;
  lastY = y;
}

function onPointerMove(event) {
  // if mouse not held, return
  if (!event.buttons) {
    return;
  }

  let [x,y] = getXY(event);

  let pressure = event.pressure;
  if (pressure === 0){
    pressure = 0.5;
  }

  drawTo(x, y, pressure,
         event.pointerType === "pen" ? event.tiltX : 0,
         event.pointerType === "pen" ? event.tiltY : 0);

}

function onPointerUp(event) {
  let [x,y] = getXY(event);

  let pressure = event.pressure;
  if (pressure === 0){
    pressure = 0.5;
  }

  drawTo(x, y, event.pressure,
         event.pointerType === "pen" ? event.tiltX : 0,
         event.pointerType === "pen" ? event.tiltY : 0);
}

function resetPage()
{
  heightMap = new Uint8Array(CANVAS_WIDTH * CANVAS_HEIGHT);

  for (let i = 0; i < CANVAS_WIDTH; i++)
  {
    for (let j = 0; j < CANVAS_HEIGHT; j++)
    {
      // jitter is int from -1 to 1
      const jitter = Math.floor(Math.random() * 2) - 1;
      heightMap[i + CANVAS_WIDTH * j] = INITIAL_SAND_HEIGHT + jitter;
    }
  }

  heightMapOld = new Uint8Array(CANVAS_WIDTH * CANVAS_HEIGHT);
  for (let i = 0; i < CANVAS_WIDTH; i++)
  {
    for (let j = 0; j < CANVAS_HEIGHT; j++)
    {
      heightMapOld[i + CANVAS_WIDTH * j] = 255;
    }
  }

  maxHeightMap = new Uint8Array(CANVAS_WIDTH * CANVAS_HEIGHT);
  for (let i = 0; i < CANVAS_WIDTH; i++)
  {
    for (let j = 0; j < CANVAS_HEIGHT; j++)
    {
      maxHeightMap[i + CANVAS_WIDTH * j] = MAX_SAND_HEIGHT;
    }
  }
}

// the rest of the site
let circleTimer = null;

function getRandomIntInclusive(min, max)
{
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min); // The maximum is inclusive and the minimum is inclusive
}

let circleId = 0;

function createCircle()
{
  const randomColors = tinycolor.random().tetrad()
    .reduce((previous, current) => { return `${current.toHexString()}, ${previous}`; }, "")
    .slice(0, -2);

  const circleElement = document.createElement("div");

  circleElement.classList.add("circle");
  circleElement.style["background"] = `linear-gradient(-45deg, ${randomColors})`;
  circleElement.style["background-size"] = `400% 400%`;
  ///circleElement.style["background-size"] = `${getRandomIntInclusive(300, 500)}% ${getRandomIntInclusive(300, 500)}%`;

  circleElement.dataset.id = circleId;

  circleId = (circleId + 1) % 255;

  return circleElement;
}

function redrawCircles()
{
  const circleRows = document.querySelectorAll(".circle-row");

  const circleRow = circleRows[0];

  for (let row of circleRows)
  {
    row.querySelectorAll(".circle").forEach((element) => element.remove());
  }

  if (circleTimer !== null)
  {
    clearInterval(circleTimer);
  }

  circleTimer = setInterval(() =>
  {
    const circleElement = createCircle();

    const rightBoundary = circleRow.querySelector(".title").getBoundingClientRect().left - 10;

    let circles = circleRow.querySelectorAll(".circle");
    if (circles && (circles.length > 0))
    {
      const lastCircle = circles[circles.length - 1];
      lastCircle.after(circleElement);
    }
    else
    {
      circleRow.prepend(circleElement);
    }

    const circleBoundingRect = circleElement.getBoundingClientRect();
    const style = circleElement.currentStyle || window.getComputedStyle(circleElement);
    const margin = parseFloat(style.marginLeft) + parseFloat(style.marginRight);

    circles = circleRow.querySelectorAll(".circle");

    const circleWidth = circleBoundingRect.width + margin;
    const circlesRight = circles.length * circleWidth;

    if (circlesRight >= rightBoundary)
    {
      circleElement.remove();
      clearInterval(circleTimer);
      circleTimer = null;
    }

    const restCircleRows = Array.from(circleRows).slice(1);
    let desiredLength = Math.floor(rightBoundary / circleWidth);

    for (let row of restCircleRows) {
      const rowChildrenLength = row.children.length;
      const rowTitle = row.querySelector(".title");

      if ((desiredLength > 0) && (rowChildrenLength !== desiredLength))
      {
        row.insertBefore(createCircle(), rowTitle);
      }

      desiredLength--;
    }


  }, 1000 * 0.0625);
}

window.onresize = function()
{
  redrawCircles();
}

const circleDictionary = {};

window.onload = function()
{
  redrawCircles();

  document.querySelector("header").addEventListener("mousemove", (event) => {
    const element = event.target;

    if (element.classList.contains("circle"))
    {
      const clientRect = element.getBoundingClientRect();
      const centerX = (clientRect.left + clientRect.right) / 2;
      const centerY = (clientRect.top + clientRect.bottom) / 2;

      const mouseX = event.clientX;
      const mouseY = event.clientY;

      const mouseToCenterX = mouseX - centerX;
      const mouseToCenterY = mouseY - centerY;

      if (!circleDictionary[element.dataset.id])
      {
        const sign = (Math.random() > 0.5) ? 1 : -1;
        const keyframes =
          [{
            transform: `rotate(${sign * getRandomIntInclusive(30, 300)}deg) translate(${mouseToCenterX}px, ${mouseToCenterY}px)`,
          },
            {
              transform: `rotate(0deg) translate(0px, 0px)`,
            }];

        const options =
          {
            duration: getRandomIntInclusive(1000, 1500),
            easing: "ease",
            iterations: 1,
          };

        circleDictionary[element.dataset.id] = element.animate(keyframes, options).finished
          .then(() => {
            circleDictionary[element.dataset.id] = null;
          });
      }
    }
  });

  for (let projectCard of document.querySelectorAll(".project-card")) 
  {
    if (projectCard.classList.contains("no-turn"))
    {
      continue;
    }

    const keyframesCCW =
    [{
      transform: "rotate3d(0, 1, 0, 0deg)",
    },
    {
      transform: "rotate3d(0, 1, 0, 45deg)",
    },
    {
      transform: "rotate3d(0, 1, 0, 0deg)",
    }];

    const keyframesCW =
    [{
      transform: "rotate3d(0, 1, 0, 0deg)",
    },
    {
      transform: "rotate3d(0, 1, 0, -90deg)",
    },
    {
      transform: "rotate3d(0, 1, 0, 0deg)",
    }];

    const options =
    {
      duration: 1000,
      easing: "ease",
      iterations: 1,
    };

    projectCard.addEventListener("click", (event) => {
      const clientRect = projectCard.getBoundingClientRect();
      const centerX = (clientRect.left + clientRect.right) / 2;

      if (event.clientX < centerX)
      {
        projectCard.animate(keyframesCW, options);
      }
      else
      {
        projectCard.animate(keyframesCCW, options);
      }
    });
  }

  document.querySelector(".about-me-card-row").addEventListener("click", (event) => {
    const element = event.target;
    if (element.classList.contains("about-me-circle"))
    {
      for (let aboutMeCircle of document.querySelectorAll(".about-me-circle"))
      {
        aboutMeCircle.classList.toggle("yellow");
        aboutMeCircle.classList.toggle("blue");
      }
    }
  });

  canvas = document.querySelector('canvas');
  ctx = canvas.getContext('2d');

  CANVAS_WIDTH = canvas.width;
  CANVAS_HEIGHT = canvas.height;

  ctx.canvas.style.width  = window.innerWidth;
  ctx.canvas.style.height = window.innerHeight;

  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup',   onPointerUp);

  resetPage();
  renderBoard();
}
