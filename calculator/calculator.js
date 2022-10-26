"use strict";

window.onload = (event) => {
  const calculatorDisplay = document.querySelector(".calc-display");
  calculatorDisplay.value = "";

  const calculator = {
    displayStrings:  ["", ""],
    currentOperator: null,
  };

  const calculatorButtons = document.querySelectorAll(".calc");
  for (let button of calculatorButtons) {
    let typeStartIndex = button.id.indexOf("-");
    if (typeStartIndex >= 0) {
      typeStartIndex++;
      const buttonType = button.id.slice(typeStartIndex);

      const convertedButtonType = Number(buttonType);
      if (!isNaN(convertedButtonType)) {
        const numberButtonListener =
          createNumberButtonListener(convertedButtonType, calculatorDisplay, calculator);
        button.addEventListener("click", numberButtonListener);
      } else {
        const operatorButtonListener =
          createOperatorButtonListener(buttonType, calculatorDisplay, calculator);
        button.addEventListener("click", operatorButtonListener);
      }
    }
  }
};

// TODO(antonio): Deal with large numbers
// TODO(antonio): Deal with the case of zero being inputted correctly
function createNumberButtonListener(number, calculatorDisplay, calculator) {
  return function(event) {
    const calculatorStrings = calculator.displayStrings;
    if (!((calculatorStrings[0].length === 0) && (number === 0))) {
      calculatorStrings[0] = calculatorStrings[0] + String(number);
      calculatorDisplay.value = calculatorStrings[0];
    }
  }
}

function mod(n, m) {
  return ((n % m) + m) % m;
}

// NOTE(antonio): This makes a copy of the array
function leftRotateArray(array, rotationAmount) {
  if (!(array instanceof Array) || (array.length === 0)) {
    return;
  }

  rotationAmount = mod(rotationAmount, array.length);
  const firstNItems = array.slice(0, rotationAmount);
  const lastNItems = array.slice(rotationAmount);

  const result = lastNItems.concat(firstNItems);
  return result;
}

function createOperatorButtonListener(operator, calculatorDisplay, calculator) {
  return function(event) {
    const calculatorStrings = calculator.displayStrings;

    const numbers = [];
    numbers.push(calculatorStrings[0].length !== 0 ? BigInt(calculatorStrings[0]) : 0n);
    numbers.push(calculatorStrings[1].length !== 1 ? BigInt(calculatorStrings[1]) : 1n);

    if ((operator === "=") && (calculator.currentOperator)) {
      let result;
      switch(calculator.currentOperator) {
      case "+":
        console.log("add");
        result = numbers[0] + numbers[1];
        console.log(result);
        break;
      case "-":
        result = numbers[0] - numbers[1];
        break;
      case "*":
        result = numbers[0] * numbers[1];
        break;
      case "+":
        // TODO(antonio): Handle division correctly
        if (numbers[1] !== 0) {
          result = numbers[0] / numbers[1];
        }
        break;
      }

      const stringifiedResult = result.toString();

      calculatorDisplay.value = stringifiedResult;

      calculatorStrings[1] = stringifiedResult;
      calculatorStrings[0] = "";

      calculator.currentOperator = null;

      console.log(calculator);
    } else if (operator !== "=") {
      calculator.currentOperator = operator;

      calculatorStrings[1] = calculatorStrings[0];
      calculatorStrings[0] = "";

      calculatorDisplay.value = calculatorStrings[0];
    }
  }
}
