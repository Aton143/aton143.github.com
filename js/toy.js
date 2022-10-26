"use strict";

window.onload = function(event) {
  const draggableElementsDictionary = {};

  const draggableElements = document.getElementById("my-draggable-list").children;
  let draggableElementIndex = 0;

  for (let element of draggableElements) {
    element.id = `draggable-${draggableElementIndex}`;

    draggableElementsDictionary[element.id] = {
      element: element,
      start: makePoint(0, 0),
      end: makePoint(0, 0),
      originalPosition: makePoint(0, 0),
      mouseMoveEventListener: null,
      elementMouseUpEventListener: null,
      index: draggableElementIndex,
    };

    element.addEventListener("mousedown", makeOnMouseDownDraggableElementEventListener(element, draggableElementsDictionary));
    element.addEventListener("touchstart", makeOnMouseDownDraggableElementEventListener(element, draggableElementsDictionary));

    draggableElementIndex++;
  }
}

function makePoint(x, y) {
  return {x: x, y: y};
}

function addPoints(first, second) {
  return makePoint(first.x + second.x, first.y + second.y);
}

// NOTE(antonio): first - second 
function firstMinusSecondPoint(first, second) {
  return makePoint(first.x - second.x, first.y - second.y);
}

function makeOnMouseDownDraggableElementEventListener(element, elementDictionary) {
  return function(event) {
    elementDictionary[element.id].start = makePoint(event.clientX, event.clientY);

    if ((elementDictionary[element.id].mouseMoveEventListener !== null) &&
        (elementDictionary[element.id].mouseUpEventListener !== null)) {
      elementDictionary[element.id].mouseUpEventListener(null);
      element.style.cursor = "grab";
    } else {
      const elementMouseMoveEventListener = makeOnMouseMoveDraggableElementEventListener(element, elementDictionary);
      elementDictionary[element.id].mouseMoveEventListener = elementMouseMoveEventListener;
      document.addEventListener("mousemove", elementMouseMoveEventListener);
      document.addEventListener("touchmove", elementMouseMoveEventListener);

      const elementMouseUpEventListener = makeOnMouseUpDraggableElementEventListener(element, elementDictionary);
      elementDictionary[element.id].mouseUpEventListener = elementMouseUpEventListener;
      document.addEventListener("mouseup", elementMouseUpEventListener);
      document.addEventListener("touchend", elementMouseUpEventListener);

      element.style.position = "relative";
      element.style.cursor = "grabbing";

      elementDictionary[element.id].originalPosition =
        makePoint(element.offsetLeft, element.offsetTop);
    }
  }
}

function makeOnMouseMoveDraggableElementEventListener(element, elementDictionary) {
  return function(event) {
    event.preventDefault();

    // NOTE(antonio): need to check this
    const currentMousePosition = makePoint(event.clientX, event.clientY);
    const calculatedElementPosition = firstMinusSecondPoint(currentMousePosition, elementDictionary[element.id].originalPosition);

    element.style.transform = `translate(${calculatedElementPosition.x}px, ${calculatedElementPosition.y}px)`;

    const mouseMoveDraggableElementIndex = elementDictionary[element.id].index;
    const mouseMoveDraggableElementClienRect = element.getBoundingClientRect();

    for (let elementKey in elementDictionary) {
      const currentElementIndex = elementDictionary[elementKey].index;
      const currentElementClientRect = elementDictionary[elementKey].element.getBoundingClientRect();

      if ((currentElementIndex < mouseMoveDraggableElementIndex) &&
          (mouseMoveDraggableElementClienRect.top < currentElementClientRect.top)) {
        elementDictionary[elementKey].element.style["border-top-color"] = "black";

        elementDictionary[element.id].index = currentElementIndex;
        elementDictionary[elementKey].index = mouseMoveDraggableElementIndex;
      }
      if ((currentElementIndex > mouseMoveDraggableElementIndex) &&
          (mouseMoveDraggableElementClienRect.top > currentElementClientRect.top)) {
        elementDictionary[elementKey].element.style["border-bottom-color"] = "black";

        elementDictionary[element.id].index = currentElementIndex;
        elementDictionary[elementKey].index = mouseMoveDraggableElementIndex;
      }
    }
  }
}

function makeOnMouseUpDraggableElementEventListener(element, elementDictionary) {
  return function(event) {
    document.removeEventListener("mousemove", elementDictionary[element.id].mouseMoveEventListener);
    document.removeEventListener("mouseup", elementDictionary[element.id].mouseUpEventListener);

    document.removeEventListener("touchmove", elementDictionary[element.id].mouseMoveEventListener);
    document.removeEventListener("touchend", elementDictionary[element.id].mouseUpEventListener);

    elementDictionary[element.id].mouseMoveEventListener = null;
    elementDictionary[element.id].mouseUpEventListener = null;

    element.style.cursor = "grab";
    
    const elementIndexArray = [];
    for (let elementKey in elementDictionary) {
      elementIndexArray.push({
        index: elementDictionary[elementKey].index,
        element: elementDictionary[elementKey].element
      });
    }

    elementIndexArray.sort((a, b) => {
      return a.index > b.index;
    });

    const listElement = element.parentNode;
    while (listElement.firstChild) {
      listElement.removeChild(listElement.firstChild);
    }

    for (let elementIndex of elementIndexArray) {
      listElement.appendChild(elementIndex.element);
      elementIndex.element.style.position = "static";
      element.style.transform = "";
      element.style["border-bottom-color"] = "transparent";
      element.style["border-top-color"] = "transparent";
    }
  }
}
