const currentText = document.querySelector("#current");
const previousText = document.querySelector("#previous");
const buttons = document.querySelector(".buttons");

let currentNumber = "0";
let firstNumber = null;
let operator = null;
let replaceNumber = false;
let savedMessage = "";

function showNumbers() {
  currentText.textContent = currentNumber;

  if (savedMessage) {
    previousText.textContent = savedMessage;
  } else if (operator && firstNumber !== null) {
    previousText.textContent = `${format(firstNumber)} ${showOperator(operator)}`;
  } else {
    previousText.textContent = "Ready when you are";
  }
}

function format(number) {
  if (!Number.isFinite(number)) return "Error";
  return String(Number(number.toPrecision(10)));
}

function showOperator(value) {
  const symbols = { "+": "+", "-": "−", "*": "×", "/": "÷" };
  return symbols[value] || value;
}

function enterNumber(number) {
  if (replaceNumber || currentNumber === "Error") {
    currentNumber = number;
    replaceNumber = false;
  } else if (currentNumber === "0") {
    currentNumber = number;
  } else if (currentNumber.length < 16) {
    currentNumber += number;
  }

  savedMessage = "";
  showNumbers();
}

function enterDecimal() {
  if (replaceNumber || currentNumber === "Error") {
    currentNumber = "0.";
    replaceNumber = false;
  } else if (!currentNumber.includes(".")) {
    currentNumber += ".";
  }

  savedMessage = "";
  showNumbers();
}

function doMath(first, sign, second) {
  if (sign === "+") return first + second;
  if (sign === "-") return first - second;
  if (sign === "*") return first * second;
  if (sign === "/") return second === 0 ? null : first / second;
  return second;
}

function pickOperator(nextOperator) {
  if (currentNumber === "Error") return;

  const number = Number(currentNumber);

  // If an operator was already chosen, work out that part first.
  if (operator && !replaceNumber) {
    const answer = doMath(firstNumber, operator, number);

    if (answer === null || !Number.isFinite(answer)) {
      showError("Cannot divide by zero");
      return;
    }

    firstNumber = answer;
    currentNumber = format(answer);
  } else {
    firstNumber = number;
  }

  operator = nextOperator;
  replaceNumber = true;
  savedMessage = "";
  showNumbers();
}

function getAnswer() {
  if (operator === null || firstNumber === null || currentNumber === "Error") return;

  const secondNumber = Number(currentNumber);
  const oldExpression = `${format(firstNumber)} ${showOperator(operator)} ${format(secondNumber)} =`;
  const answer = doMath(firstNumber, operator, secondNumber);

  if (answer === null || !Number.isFinite(answer)) {
    showError("Cannot divide by zero");
    return;
  }

  currentNumber = format(answer);
  firstNumber = null;
  operator = null;
  replaceNumber = true;
  savedMessage = oldExpression;
  showNumbers();
}

function clearCalculator() {
  currentNumber = "0";
  firstNumber = null;
  operator = null;
  replaceNumber = false;
  savedMessage = "";
  showNumbers();
}

function removeLast() {
  if (replaceNumber || currentNumber === "Error") {
    currentNumber = "0";
    replaceNumber = false;
  } else if (currentNumber.length <= 1 ||
      (currentNumber.length === 2 && currentNumber.startsWith("-"))) {
    currentNumber = "0";
  } else {
    currentNumber = currentNumber.slice(0, -1);
  }

  savedMessage = "";
  showNumbers();
}

function changeSign() {
  if (currentNumber === "0" || currentNumber === "Error") return;

  currentNumber = currentNumber.startsWith("-")
    ? currentNumber.slice(1)
    : "-" + currentNumber;

  savedMessage = "";
  showNumbers();
}

function usePercent() {
  if (currentNumber === "Error") return;

  currentNumber = format(Number(currentNumber) / 100);
  savedMessage = "";
  showNumbers();
}

function showError(message) {
  currentNumber = "Error";
  firstNumber = null;
  operator = null;
  replaceNumber = true;
  savedMessage = message;
  showNumbers();
}

buttons.addEventListener("click", function (event) {
  const button = event.target.closest("button");
  if (!button) return;

  if (button.dataset.number !== undefined) {
    enterNumber(button.dataset.number);
    return;
  }

  if (button.dataset.operator) {
    pickOperator(button.dataset.operator);
    return;
  }

  const action = button.dataset.action;

  if (action === "clear") clearCalculator();
  if (action === "backspace") removeLast();
  if (action === "decimal") enterDecimal();
  if (action === "equals") getAnswer();
  if (action === "sign") changeSign();
  if (action === "percent") usePercent();
});

document.addEventListener("keydown", function (event) {
  const key = event.key;

  if (key >= "0" && key <= "9") enterNumber(key);
  else if (key === ".") enterDecimal();
  else if (["+", "-", "*", "/"].includes(key)) {
    event.preventDefault();
    pickOperator(key);
  } else if (key === "Enter" || key === "=") {
    event.preventDefault();
    getAnswer();
  } else if (key === "Backspace") {
    removeLast();
  } else if (key === "Escape" || key.toLowerCase() === "c") {
    clearCalculator();
  } else if (key === "%") {
    usePercent();
  }
});

showNumbers();
