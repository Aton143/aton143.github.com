"use strict";

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
}
