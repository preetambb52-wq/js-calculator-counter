/* ═══════════════════════════════════════════════
   CALCULATOR
═══════════════════════════════════════════════ */

let calcExpr   = '';
let justEvaled = false;

function calcInput(val) {
  const ops = ['+', '-', '*', '/'];
  const isOp = ops.includes(val);

  // After evaluation: if digit/dot → start fresh; if op → continue from result
  if (justEvaled) {
    if (isOp) {
      justEvaled = false;
      calcExpr += val;
    } else {
      justEvaled = false;
      calcExpr = val;
    }
    updateCalcDisplay();
    return;
  }

  // Prevent double operators
  if (isOp) {
    const last = calcExpr.slice(-1);
    if (ops.includes(last)) calcExpr = calcExpr.slice(0, -1);
  }

  // Prevent multiple dots in same number segment
  if (val === '.') {
    const parts = calcExpr.split(/[\+\-\*\/]/);
    const last = parts[parts.length - 1];
    if (last.includes('.')) return;
  }

  // Prevent leading zeros (e.g. "007")
  if (val !== '.' && !isOp) {
    const parts = calcExpr.split(/[\+\-\*\/]/);
    const last = parts[parts.length - 1];
    if (last === '0' && val !== '.') {
      calcExpr = calcExpr.slice(0, -1);
    }
  }

  calcExpr += val;
  updateCalcDisplay();
}

function calcEquals() {
  if (!calcExpr) return;
  try {
    const expr = calcExpr.replace(/×/g, '*').replace(/÷/g, '/');
    // Safe eval — only numbers and operators
    if (!/^[\d\+\-\*\/\.\s]+$/.test(expr)) throw new Error('Invalid');
    // eslint-disable-next-line no-new-func
    let result = Function('"use strict"; return (' + expr + ')')();
    // Round floating point noise
    result = parseFloat(result.toPrecision(12));
    document.getElementById('calc-expr').textContent = calcExpr + ' =';
    document.getElementById('calc-screen').textContent = result;
    calcExpr = String(result);
    justEvaled = true;
  } catch {
    document.getElementById('calc-screen').textContent = 'Error';
    calcExpr = '';
    justEvaled = false;
  }
}

function calcClear() {
  calcExpr = '';
  justEvaled = false;
  document.getElementById('calc-expr').textContent = '';
  document.getElementById('calc-screen').textContent = '0';
}

function calcDel() {
  if (justEvaled) { calcClear(); return; }
  calcExpr = calcExpr.slice(0, -1);
  updateCalcDisplay();
}

function updateCalcDisplay() {
  const screen = document.getElementById('calc-screen');
  const expr   = document.getElementById('calc-expr');
  if (!justEvaled) expr.textContent = '';
  const display = calcExpr || '0';
  // Pretty print operators for display
  screen.textContent = display
    .replace(/\*/g, ' × ')
    .replace(/\//g, ' ÷ ')
    .replace(/\+/g, ' + ')
    .replace(/-/g,  ' − ');
}

/* ═══════════════════════════════════════════════
   COUNTER
═══════════════════════════════════════════════ */

let counterVal = 0;
let stepSize   = 1;
let statMax    = 0;
let statMin    = 0;
let statOps    = 0;

function counterChange(direction) {
  counterVal += direction * stepSize;
  statOps++;
  if (counterVal > statMax) statMax = counterVal;
  if (counterVal < statMin) statMin = counterVal;
  renderCounter(direction);
}

function counterReset() {
  counterVal = 0;
  statMax    = 0;
  statMin    = 0;
  statOps    = 0;
  document.getElementById('counter-label').textContent = 'Reset';
  renderCounter(0);
}

function setStep(val, el) {
  stepSize = val;
  document.querySelectorAll('.sbtn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
}

function renderCounter(direction) {
  const valEl   = document.getElementById('counter-value');
  const labelEl = document.getElementById('counter-label');

  valEl.textContent = counterVal;

  // Color
  valEl.classList.remove('positive', 'negative', 'zero');
  if (counterVal > 0)      valEl.classList.add('positive');
  else if (counterVal < 0) valEl.classList.add('negative');
  else                     valEl.classList.add('zero');

  // Label
  if (direction > 0)      labelEl.textContent = `+${stepSize} incremented`;
  else if (direction < 0) labelEl.textContent = `−${stepSize} decremented`;
  else                    labelEl.textContent = 'Reset to zero';

  // Stats
  document.getElementById('stat-max').textContent = statMax;
  document.getElementById('stat-min').textContent = statMin;
  document.getElementById('stat-ops').textContent = statOps;
}

/* Keyboard support for calculator */
document.addEventListener('keydown', (e) => {
  const key = e.key;
  if ('0123456789'.includes(key))       calcInput(key);
  else if (['+','-','*','/'].includes(key)) calcInput(key);
  else if (key === '.')                 calcInput('.');
  else if (key === 'Enter' || key === '=') { e.preventDefault(); calcEquals(); }
  else if (key === 'Backspace')         calcDel();
  else if (key === 'Escape')            calcClear();
});
