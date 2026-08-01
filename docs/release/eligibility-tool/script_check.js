
function num(id){
  const v = document.getElementById(id).value;
  return v === "" ? null : parseFloat(v);
}
function checked(id){
  return document.getElementById(id).checked;
}
function setDot(id, state){
  const el = document.getElementById(id);
  el.classList.remove('pass','fail');
  if(state === true) el.classList.add('pass');
  else if(state === false) el.classList.add('fail');
}
function setCriterion(dotId, cardId, msgId, state, passText, failText, pendingText){
  setDot(dotId, state);
  const card = document.getElementById(cardId);
  const msg = document.getElementById(msgId);
  card.classList.remove('pass','fail');
  msg.classList.remove('pass','fail','pending');
  if(state === true){
    card.classList.add('pass');
    msg.classList.add('pass');
    msg.textContent = '✓ ' + passText;
  } else if(state === false){
    msg.classList.add('fail');
    msg.textContent = '✗ ' + failText + '.';
  } else {
    msg.classList.add('pending');
    msg.textContent = pendingText;
  }
}

function setYesNo(prefix, val){
  document.getElementById(prefix + 'Val').value = val ? 'y' : 'n';
  document.getElementById(prefix + 'BtnY').classList.toggle('active', val === true);
  document.getElementById(prefix + 'BtnN').classList.toggle('active', val === false);
  evaluate();
}
function yesNoVal(prefix){
  const v = document.getElementById(prefix + 'Val').value;
  return v === 'y' ? true : (v === 'n' ? false : null);
}

function hoursSinceImvStart(){
  const dateStr = document.getElementById('imvDate').value;
  const timeStr = document.getElementById('imvTime').value;
  if(!dateStr || !timeStr) return null;
  const started = new Date(dateStr + 'T' + timeStr);
  if(isNaN(started.getTime())) return null;
  const diffHours = (Date.now() - started.getTime()) / (1000 * 60 * 60);
  return diffHours;
}

function setSub(id, state, text){
  const el = document.getElementById(id);
  el.classList.remove('pass','fail','pending');
  el.classList.add(state === true ? 'pass' : (state === false ? 'fail' : 'pending'));
  el.textContent = (state === true ? '✓ ' : state === false ? '✗ ' : '') + text;
}

function evaluate(){
  // ---- Inclusion 1: age ----
  const age = num('age');
  const ind1 = age === null ? null : age >= 18;
  setCriterion('ind1-dot', 'card-ind1', 'ind1-msg', ind1,
    'Meets criterion (adult)', 'Does not meet criterion (age <18)', 'Enter age to check');

  // ---- Inclusion 2: receiving IMV ----
  const imv = yesNoVal('imv');
  setCriterion('ind2-dot', 'card-ind2', 'ind2-msg', imv,
    'Meets criterion (receiving IMV)', 'Does not meet criterion (not receiving IMV)', 'Select Yes/No to check');

  // ---- Inclusion 3: P:F ratio ----
  const pao2 = num('pao2');
  const pao2Unit = document.getElementById('pao2Unit').value;
  const fio2 = num('fio2');
  const peep = num('peep');
  const hoursRaw = hoursSinceImvStart();
  const hoursFuture = hoursRaw !== null && hoursRaw < 0;
  const hours = hoursFuture ? null : hoursRaw;

  // FiO₂ fraction read-out (staff learning aid — not editable)
  const fio2FractionEl = document.getElementById('fio2Fraction');
  fio2FractionEl.value = fio2 !== null ? (fio2 / 100).toFixed(2) : '';

  let ratioKpa = null;
  if(pao2 !== null && fio2 !== null && fio2 > 0){
    const pao2Kpa = pao2Unit === 'mmHg' ? pao2 / 7.5 : pao2;
    ratioKpa = pao2Kpa / (fio2 / 100);
  }
  const pfValueEl = document.getElementById('pf-value');
  if(ratioKpa !== null){
    pfValueEl.innerHTML = 'P:F ratio: <span class="big">' + ratioKpa.toFixed(1) + ' kPa</span>' +
      (pao2Unit === 'mmHg' ? ' (PaO₂ converted from ' + pao2 + ' mmHg)' : '');
  } else {
    pfValueEl.textContent = 'Enter PaO₂ and FiO₂ to calculate the P:F ratio.';
  }

  const ratioMet = ratioKpa === null ? null : ratioKpa < 20;
  setSub('pf-check-ratio', ratioMet, ratioKpa === null ? 'P:F ratio <20 kPa (enter PaO₂ and FiO₂)' :
    'P:F ratio ' + ratioKpa.toFixed(1) + ' kPa ' + (ratioMet ? '(<20 kPa)' : '(not <20 kPa)'));

  const peepMet = peep === null ? null : peep >= 5;
  setSub('pf-check-peep', peepMet, peep === null ? 'PEEP ≥5 cmH₂O (enter PEEP)' :
    'PEEP ' + peep + ' cmH₂O ' + (peepMet ? '(≥5)' : '(<5 — required PEEP not met)'));

  const timingMet = hours === null ? null : hours <= 60;
  if(hoursFuture){
    setSub('pf-check-timing', null, 'IMV start date/time is in the future — check entry');
  } else {
    setSub('pf-check-timing', timingMet, hours === null ? 'Measured within 60h of IMV start (enter IMV start date and time)' :
      hours.toFixed(1) + ' hours since IMV start ' + (timingMet ? '(≤60h)' : '(>60h — outside eligibility window)'));
  }

  let ind3 = null;
  if(ratioMet !== null && peepMet !== null && timingMet !== null){
    ind3 = (ratioMet && peepMet && timingMet);
  }
  setCriterion('ind3-dot', 'card-ind3', 'ind3-msg', ind3,
    'Meets criterion (P:F <20 kPa, PEEP ≥5, within 60h of IMV start)',
    'Does not meet criterion (P:F ratio, PEEP, and/or timing not satisfied)',
    'Enter PaO₂, FiO₂, PEEP and IMV start date/time to check');

  // ---- Inclusion 4: expected >48h ----
  const exp = yesNoVal('exp');
  setCriterion('ind4-dot', 'card-ind4', 'ind4-msg', exp,
    'Meets criterion (expected IMV >48h)', 'Does not meet criterion (not expected to need IMV >48h)', 'Select Yes/No to check');

  // ---- Step gating ----
  const inclusionComplete = (ind1 === true && imv === true && ind3 === true && exp === true);
  const inclusionFailed = (ind1 === false || imv === false || ind3 === false || exp === false);
  const step2El = document.getElementById('step2');
  const gateIncompleteEl = document.getElementById('gate-incomplete');
  const gateIneligibleEl = document.getElementById('gate-ineligible');
  const gateIneligibleTextEl = document.getElementById('gate-ineligible-text');
  const gateCompleteEl = document.getElementById('gate-complete');
  const resultEl0 = document.getElementById('result');
  const titleEl0 = document.getElementById('result-title');
  const detailEl0 = document.getElementById('result-detail');

  if(inclusionFailed){
    step2Opened = false;
    step2El.style.display = 'none';
    gateIncompleteEl.style.display = 'none';
    gateCompleteEl.style.display = 'none';
    gateIneligibleEl.style.display = 'block';
    let reasons = [];
    if(ind1 === false) reasons.push('age &lt;18');
    if(imv === false) reasons.push('not receiving IMV');
    if(ind3 === false) reasons.push('P:F ratio / PEEP / timing criteria not met');
    if(exp === false) reasons.push('not expected to remain on IMV &gt;48h');
    gateIneligibleTextEl.innerHTML = '<strong>Not eligible &mdash; inclusion criteria not met</strong> (' + reasons.join('; ') + '). Exclusion criteria are not applicable; screening stops here.';
    resultEl0.classList.remove('status-eligible','status-ineligible','status-incomplete');
    resultEl0.classList.add('status-ineligible');
    titleEl0.textContent = 'Currently NOT ELIGIBLE — inclusion criteria not met';
    detailEl0.innerHTML = '<ul>' + reasons.map(r => `<li>${r.charAt(0).toUpperCase()+r.slice(1)}</li>`).join('') + '</ul>';
    return;
  }

  gateIneligibleEl.style.display = 'none';

  if(!inclusionComplete){
    step2Opened = false;
    step2El.style.display = 'none';
    gateCompleteEl.style.display = 'none';
    gateIncompleteEl.style.display = 'block';
    resultEl0.classList.remove('status-eligible','status-ineligible','status-incomplete');
    resultEl0.classList.add('status-incomplete');
    titleEl0.textContent = 'Step 1 in progress — enter remaining inclusion values';
    detailEl0.innerHTML = '';
    return;
  }

  gateIncompleteEl.style.display = 'none';

  if(!step2Opened){
    step2El.style.display = 'none';
    gateCompleteEl.style.display = 'block';
    resultEl0.classList.remove('status-eligible','status-ineligible','status-incomplete');
    resultEl0.classList.add('status-eligible');
    titleEl0.textContent = 'Meets inclusion criteria — POTENTIALLY ELIGIBLE (exclusion criteria not yet checked)';
    detailEl0.innerHTML = '<p style="font-size:0.85rem;">Click "Continue to exclusion criteria" below to complete screening.</p>';
    return;
  }

  // step2Opened is true — show exclusion criteria and compute the full result
  gateCompleteEl.style.display = 'none';
  step2El.style.display = 'block';

  // ---- Auto exclusion 1: derived from IMV start date/time entered above ----
  const ex1 = hours !== null ? hours >= 60 : null;
  document.getElementById('ex1').checked = !!ex1;

  // ---- Auto exclusion 4: derived from pH ----
  const ph = num('ph');
  const ex4 = ph !== null ? ph < 7.20 : null;
  document.getElementById('ex4').checked = !!ex4;

  // ---- Exclusion 2 (a-d) ----
  const ex2Sub = ['ex2a','ex2b','ex2c','ex2d'].some(id => checked(id));
  document.getElementById('ex2').checked = ex2Sub;

  const manualExclIds = ['ex3','ex5','ex6','ex7','ex8','ex9'];
  const manualExclLabels = {
    ex3:'Refractory shock (SBP <90 mmHg despite fluids/vasoactive drugs)',
    ex5:'Ongoing air leak (e.g. unresolved pneumothorax)',
    ex6:'Traumatic brain injury with uncontrolled intracranial hypertension',
    ex7:'Likely death or treatment withdrawal in next 24 hours',
    ex8:'Home ventilation or home oxygen therapy prior to admission',
    ex9:'Receiving, or decision to commence, ECMO in next 24 hours'
  };
  const ex2Labels = {
    ex2a:'Primary reason for IMV: Asthma', ex2b:'Primary reason for IMV: Severe COPD',
    ex2c:'Primary reason for IMV: Pulmonary embolism (massive/sub-massive)',
    ex2d:'Primary reason for IMV: Existing neuromuscular disease'
  };

  const activeManual = manualExclIds.filter(id => checked(id)).map(id => manualExclLabels[id]);
  const activeEx2 = ['ex2a','ex2b','ex2c','ex2d'].filter(id => checked(id)).map(id => ex2Labels[id]);
  const activeAuto = [];
  if(ex1) activeAuto.push('Receiving IMV ≥60 hours at time of screening');
  if(ex4) activeAuto.push('Severe hypercapnic respiratory acidosis (pH ' + ph + ' <7.20)');

  const allActive = activeManual.concat(activeEx2, activeAuto);

  resultEl0.classList.remove('status-eligible','status-ineligible','status-incomplete');

  if(allActive.length > 0){
    resultEl0.classList.add('status-ineligible');
    titleEl0.textContent = 'Currently NOT ELIGIBLE — exclusion criteria present';
    let html = '<ul>' + allActive.map(e => `<li>${e}</li>`).join('') + '</ul>';
    const resolvableTriggered = activeManual.some(l => l.startsWith('Refractory shock') || l.startsWith('Ongoing air leak') || l.startsWith('Traumatic brain injury')) ||
      activeAuto.some(l => l.startsWith('Severe hypercapnic'));
    if(resolvableTriggered){
      html += '<p style="font-size:0.82rem;">Some of these criteria may resolve (protocol section 2.5.2 footnote) — the patient may be reconsidered if resolved and still within the eligibility window (&lt;60h of IMV).</p>';
    }
    detailEl0.innerHTML = html;
    return;
  }

  resultEl0.classList.add('status-eligible');
  titleEl0.textContent = 'Meets inclusion criteria, no exclusions ticked — POTENTIALLY ELIGIBLE';
  detailEl0.innerHTML =
    '<div class="advisory">' +
    '<p style="font-weight:600; margin:10px 0 6px 0;">If proceeding:</p>' +
    '<ul>' +
    '<li>Confirm eligibility and obtain consent/consultee agreement per protocol section 2.7.</li>' +
    '<li>Randomise via the trial\'s web-based randomisation system before starting either study arm.</li>' +
    '<li>Document the screening/eligibility assessment in the medical notes and the trial Screening Log.</li>' +
    '<li>Confirm that whoever is consenting/randomising is GCP trained and on the site delegation log.</li>' +
    '</ul>' +
    '</div>';
}

let step2Opened = false;

function checkEligibility(){
  evaluate();
  const resultEl = document.getElementById('result');
  resultEl.scrollIntoView({behavior:'smooth', block:'center'});
  resultEl.classList.remove('flash');
  void resultEl.offsetWidth;
  resultEl.classList.add('flash');
}

function continueToStep2(){
  step2Opened = true;
  evaluate();
  const step2El = document.getElementById('step2');
  step2El.scrollIntoView({behavior:'smooth', block:'start'});
}

function backToStep1(){
  step2Opened = false;
  evaluate();
  document.getElementById('step1').scrollIntoView({behavior:'smooth'});
}

function resetForm(){
  step2Opened = false;
  document.querySelectorAll('input[type=number]').forEach(el => el.value = '');
  document.querySelectorAll('input[type=checkbox]:not([disabled])').forEach(el => el.checked = false);
  document.getElementById('imvDate').value = '';
  document.getElementById('imvTime').value = '';
  document.getElementById('pao2Unit').value = 'kPa';
  document.getElementById('imvVal').value = '';
  document.getElementById('expVal').value = '';
  document.getElementById('imvBtnY').classList.remove('active');
  document.getElementById('imvBtnN').classList.remove('active');
  document.getElementById('expBtnY').classList.remove('active');
  document.getElementById('expBtnN').classList.remove('active');
  evaluate();
}

evaluate();
setInterval(evaluate, 60000); // keep elapsed-hours-since-IMV live while the page is open
