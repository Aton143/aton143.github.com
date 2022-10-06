"use strict";

function makePoint(x, y) {
  return {x: x, y: y};
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
    } else {
      const elementMouseMoveEventListener = makeOnMouseMoveDraggableElementEventListener(element, elementDictionary);
      elementDictionary[element.id].mouseMoveEventListener = elementMouseMoveEventListener;
      document.addEventListener("mousemove", elementMouseMoveEventListener);

      const elementMouseUpEventListener = makeOnMouseUpDraggableElementEventListener(element, elementDictionary);
      elementDictionary[element.id].mouseUpEventListener = elementMouseUpEventListener;
      document.addEventListener("mouseup", elementMouseUpEventListener);
    }
  }
}

function makeOnMouseMoveDraggableElementEventListener(element, elementDictionary) {
  return function(event) {
    event.preventDefault();

    const currentMousePosition = makePoint(event.clientX, event.clientY);

    const startingMousePosition = elementDictionary[element.id].start;
    const endingMousePosition = firstMinusSecondPoint(startingMousePosition, currentMousePosition);

    elementDictionary[element.id].end = endingMousePosition;
    elementDictionary[element.id].start = currentMousePosition;

    const startElementPosition = makePoint(element.offsetLeft, element.offsetTop) 
    const calculatedElementPosition = firstMinusSecondPoint(startElementPosition, endingMousePosition);

    element.style.left = `${calculatedElementPosition.x}px`;
    element.style.top = `${calculatedElementPosition.y}px`;
  }
}

function makeOnMouseUpDraggableElementEventListener(element, elementDictionary) {
  return function(event) {
    document.removeEventListener("mousemove", elementDictionary[element.id].mouseMoveEventListener);
    document.removeEventListener("mouseup", elementDictionary[element.id].mouseUpEventListener);

    elementDictionary[element.id].mouseMoveEventListener = null;
    elementDictionary[element.id].mouseUpEventListener = null;
  }
}

window.onload = function(event) {
  // NOTE(antonio): the only requirement that the element has is that it must have a unique id
  const draggableElementsDictionary = {};

  const draggableElements = document.getElementsByClassName("my-draggable");
  for (let element of draggableElements) {
    draggableElementsDictionary[element.id] = {
      start: makePoint(0, 0),
      end: makePoint(0, 0),
      mouseMoveEventListener: null,
      elementMouseUpEventListener: null,
    };

    element.addEventListener("mousedown", makeOnMouseDownDraggableElementEventListener(element, draggableElementsDictionary));
  }
}
