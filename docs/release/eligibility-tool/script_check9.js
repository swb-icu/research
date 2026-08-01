
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
  runScreening();
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

// Live, per-field feedback only — updates the individual criterion checkmarks,
// P:F/FiO2/hours read-outs, and the auto-derived exclusion checkboxes.
// Does NOT touch the colored verdict (gate cards / #result) — that only
// changes when checkEligibility() is explicitly run.
function updateCriteria(){
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
  const fio2 = num('fio2');
  const peep = num('peep');
  const hoursRaw = hoursSinceImvStart();
  const hoursFuture = hoursRaw !== null && hoursRaw < 0;
  const hours = hoursFuture ? null : hoursRaw;

  // Hours-since-intubation read-out (not editable)
  const imvHoursEl = document.getElementById('imvHours');
  if(hoursRaw === null){
    imvHoursEl.value = '';
  } else if(hoursFuture){
    imvHoursEl.value = 'future date/time';
  } else {
    imvHoursEl.value = hoursRaw.toFixed(1) + 'h';
  }

  // FiO₂ fraction read-out (staff learning aid — not editable)
  const fio2FractionEl = document.getElementById('fio2Fraction');
  fio2FractionEl.value = fio2 !== null ? (fio2 / 100).toFixed(2) : '';

  let ratioKpa = null;
  if(pao2 !== null && fio2 !== null && fio2 > 0){
    ratioKpa = pao2 / (fio2 / 100);
  }
  const pfValueEl = document.getElementById('pf-value');
  if(ratioKpa !== null){
    pfValueEl.innerHTML = 'P:F ratio: <span class="big">' + ratioKpa.toFixed(1) + ' kPa</span>';
  } else {
    pfValueEl.textContent = 'Enter PaO₂ and % oxygen administered to calculate the P:F ratio.';
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

  // ---- Auto-derived exclusion checkboxes (bookkeeping only, not a verdict) ----
  const ex1 = hours !== null ? hours >= 60 : null;
  document.getElementById('ex1').checked = !!ex1;
  const ph = num('ph');
  const ex4 = ph !== null ? ph < 7.20 : null;
  document.getElementById('ex4').checked = !!ex4;
  const ex2Sub = ['ex2a','ex2b','ex2c','ex2d'].some(id => checked(id));
  document.getElementById('ex2').checked = ex2Sub;

  return { ind1, imv, ind3, exp, hours, ph, ex1, ex4 };
}

function setResult(statusClass, title, detailHtml){
  const resultEl0 = document.getElementById('result');
  const titleEl0 = document.getElementById('result-title');
  const detailEl0 = document.getElementById('result-detail');
  resultEl0.classList.remove('status-eligible','status-ineligible','status-incomplete');
  resultEl0.classList.add(statusClass);
  titleEl0.textContent = title;
  detailEl0.innerHTML = detailHtml;
}

// Called by every STEP 1 field (age, IMV, PaO2/FiO2/PEEP/IMV start, expected>48h).
// Editing any of these after a check invalidates it — collapses back to step 1
// and resets the verdict to neutral, so it can never show a stale green/red.
function runScreening(){
  const c = updateCriteria();
  step2Opened = false;
  document.getElementById('step2').style.display = 'none';
  document.getElementById('gate-ineligible').style.display = 'none';
  document.getElementById('gate-complete').style.display = 'none';
  document.getElementById('gate-incomplete').style.display = 'block';
  const allTouched = (c.ind1 !== null || c.imv !== null || c.ind3 !== null || c.exp !== null);
  document.getElementById('gate-incomplete-text').textContent = allTouched
    ? 'Values entered/changed — press "Check eligibility" to see the current result.'
    : 'Complete the four inclusion criteria above, then press "Check eligibility".';
  setResult('status-incomplete',
    allTouched ? 'Not yet checked — press "Check eligibility" above' : 'Enter values above, then press "Check eligibility"',
    '');
}

// Called by STEP 2 fields (pH, exclusion checkboxes) — keeps the checklist and
// step 2 visible (no point re-hiding it every tick), just clears the verdict
// back to neutral until "Check eligibility" is pressed again.
function updateStep2Live(){
  updateCriteria();
  setResult('status-incomplete', 'Values changed — press "Check eligibility" to update the result.', '');
}

// Explicit verdict — only this function is allowed to show green/red.
function checkEligibility(){
  const c = updateCriteria();
  const { ind1, imv, ind3, exp, hours, ph, ex1, ex4 } = c;

  const inclusionComplete = (ind1 === true && imv === true && ind3 === true && exp === true);
  const inclusionFailed = (ind1 === false || imv === false || ind3 === false || exp === false);
  const step2El = document.getElementById('step2');
  const gateIncompleteEl = document.getElementById('gate-incomplete');
  const gateIneligibleEl = document.getElementById('gate-ineligible');
  const gateIneligibleTextEl = document.getElementById('gate-ineligible-text');
  const gateCompleteEl = document.getElementById('gate-complete');

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
    setResult('status-ineligible', 'Currently NOT ELIGIBLE — inclusion criteria not met',
      '<ul>' + reasons.map(r => `<li>${r.charAt(0).toUpperCase()+r.slice(1)}</li>`).join('') + '</ul>');
    return;
  }

  gateIneligibleEl.style.display = 'none';

  if(!inclusionComplete){
    step2Opened = false;
    step2El.style.display = 'none';
    gateCompleteEl.style.display = 'none';
    gateIncompleteEl.style.display = 'block';
    document.getElementById('gate-incomplete-text').textContent = 'Complete the four inclusion criteria above, then press "Check eligibility".';
    setResult('status-incomplete', 'Step 1 in progress — enter remaining inclusion values', '');
    return;
  }

  gateIncompleteEl.style.display = 'none';

  if(!step2Opened){
    step2El.style.display = 'none';
    gateCompleteEl.style.display = 'block';
    setResult('status-eligible', 'Meets inclusion criteria — POTENTIALLY ELIGIBLE (exclusion criteria not yet checked)',
      '<p style="font-size:0.85rem;">Click "Continue to exclusion criteria" below to complete screening.</p>');
    return;
  }

  // step2Opened is true — show exclusion criteria and compute the full result
  gateCompleteEl.style.display = 'none';
  step2El.style.display = 'block';

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

  if(allActive.length > 0){
    let html = '<ul>' + allActive.map(e => `<li>${e}</li>`).join('') + '</ul>';
    const resolvableTriggered = activeManual.some(l => l.startsWith('Refractory shock') || l.startsWith('Ongoing air leak') || l.startsWith('Traumatic brain injury')) ||
      activeAuto.some(l => l.startsWith('Severe hypercapnic'));
    if(resolvableTriggered){
      html += '<p style="font-size:0.82rem;">Some of these criteria may resolve (protocol section 2.5.2 footnote) — the patient may be reconsidered if resolved and still within the eligibility window (&lt;60h of IMV).</p>';
    }
    setResult('status-ineligible', 'Currently NOT ELIGIBLE — exclusion criteria present', html);
    return;
  }

  setResult('status-eligible', 'Meets inclusion criteria, no exclusions ticked — POTENTIALLY ELIGIBLE',
    '<div class="advisory">' +
    '<p style="font-weight:600; margin:10px 0 6px 0;">If proceeding:</p>' +
    '<ul>' +
    '<li>Confirm eligibility and obtain consent/consultee agreement per protocol section 2.7.</li>' +
    '<li>Randomise via the trial\'s web-based randomisation system before starting either study arm.</li>' +
    '<li>Document the screening/eligibility assessment in the medical notes and the trial Screening Log.</li>' +
    '<li>Confirm that whoever is consenting/randomising is GCP trained and on the site delegation log.</li>' +
    '</ul>' +
    '<button type="button" class="secondary" onclick="alertResearchTeam()">Alert research team by email</button>' +
    '<span class="hint" style="display:block; margin-top:6px;">Opens your email client with the research team pre-addressed. No patient-identifiable details are pre-filled — add them yourself before sending.</span>' +
    '</div>');
}

function alertResearchTeam(){
  const to = 'm.lukose@nhs.net,eleanor.higgs@nhs.net';
  const subject = 'RELEASE — potentially eligible patient identified';
  const body = 'A potentially eligible patient for RELEASE has been screened as meeting inclusion criteria with no exclusions ticked on the local eligibility aid.\n\n' +
    'Please attend to review and, if appropriate, support consent and randomisation.\n\n' +
    '[Add patient identifiers / location here]\n\n' +
    '(This message was generated by the local eligibility aid and deliberately contains no patient-identifiable details.)';
  window.location.href = 'mailto:' + to + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
}

let step2Opened = false;

function continueToStep2(){
  step2Opened = true;
  document.getElementById('gate-complete').style.display = 'none';
  document.getElementById('step2').style.display = 'block';
  updateCriteria();
  setResult('status-incomplete', 'Press "Check eligibility" below to complete screening.', '');
  document.getElementById('step2').scrollIntoView({behavior:'smooth', block:'start'});
}

function backToStep1(){
  step2Opened = false;
  document.getElementById('step2').style.display = 'none';
  updateCriteria();
  document.getElementById('gate-incomplete').style.display = 'none';
  document.getElementById('gate-ineligible').style.display = 'none';
  document.getElementById('gate-complete').style.display = 'block';
  setResult('status-incomplete', 'Not yet checked — press "Check eligibility" above', '');
  document.getElementById('step1').scrollIntoView({behavior:'smooth'});
}

function resetForm(){
  step2Opened = false;
  document.querySelectorAll('input[type=number]').forEach(el => el.value = '');
  document.querySelectorAll('input[type=checkbox]:not([disabled])').forEach(el => el.checked = false);
  document.getElementById('imvDate').value = '';
  document.getElementById('imvTime').value = '';
  document.getElementById('imvVal').value = '';
  document.getElementById('expVal').value = '';
  document.getElementById('imvBtnY').classList.remove('active');
  document.getElementById('imvBtnN').classList.remove('active');
  document.getElementById('expBtnY').classList.remove('active');
  document.getElementById('expBtnN').classList.remove('active');
  document.getElementById('step2').style.display = 'none';
  runScreening();
}

runScreening();
setInterval(updateCriteria, 60000); // keep elapsed-hours-since-IMV ticking without disturbing a confirmed check
