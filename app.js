/* Psalm 51 Spiral Explorer — Full Client-Side Build */
const rawPsalm = `חָנֵּנִי אֱלֹהִים כְּחַסְדֶּךָ כְּרֹב רַחֲמֶיךָ מְחֵה פְשָׁעָי׃
רַבָּה כַבְּסֵנִי מֵעֲוֺנִי וּמֵחַטָּאתִי טַהֲרֵנִי׃
כִּי פְשָׁעַי אֲנִי אֵדָע וְחַטָּאתִי נֶגְדִּי תָמִיד׃
לְךָ לְבַדְּךָ חָטָאתִי וְהָרַע בְּעֵינֶיךָ עָשִׂיתִי לְמַעַן תִּצְדַּק בְּדָבְרֶךָ תִּזְכֶּה בְשָׁפְטֶךָ׃
הֵן בְּעָוֺן חוֹלָלְתִּי וּבְחֵטְא יֶחֱמַתְנִי אִמִּי׃
הֵן אֱמֶת חָפַצְתָּ בַטֻּחוֹת וּבְסָתֻם חָכְמָה תוֹדִיעֵנִי׃
תְּחַטְּאֵנִי בְאֵזוֹב וְאֶטְהָר תְּכַבְּסֵנִי וּמִשֶּׁלֶג אַלְבִּין׃
תַּשְׁמִיעֵנִי שָׂשֹוֹן וְשִׂמְחָה תָּגֵלְנָה עֲצָמוֹת דִּכִּיתָ׃
הַסְתֵּר פָּנֶיךָ מֵחֲטָאָי וְכָל עֲוֺנֹתַי מְחֵה׃
לֵב טָהוֹר בְּרָא לִי אֱלֹהִים וְרוּחַ נָכוֹן חַדֵּשׁ בְּקִרְבִּי׃
אַל תַּשְׁלִיכֵנִי מִלְּפָנֶיךָ וְרוּחַ קָדְשְׁךָ אַל תִּקַּח מִמֶּנִּי׃
הָשִׁיבָה לִּי שְׂשֹוֹן יִשְׁעֶךָ וְרוּחַ נְדִיבָה תִסְמְכֵנִי׃
אַלַּמְּדָה פֹשְׁעִים דְּרָכֶיךָ וְחַטָּאִים אֵלֶיךָ יָשׁוּבוּ׃
הַצִּילֵנִי מִדָּמִים אֱלֹהִים אֱלֹהֵי תְשׁוּעָתִי תְּרַנֵּן לְשׁוֹנִי צִדְקָתֶךָ׃
אֲדֹנָי שְׂפָתַי תִּפְתָּח וּפִי יַגִּיד תְּהִלָּתֶךָ׃
כִּי לֹא תַחְפֹּץ זָבַח וְאֶתֵּנָה עוֹלָה לֹא תִרְצֶה׃
זִבְחֵי אֱלֹהִים רוּחַ נִשְׁבָּרָה לֵב נִשְׁבָּר וְנִדְכֶּה אֱלֹהִים לֹא תִבְזֶה׃
הֵיטִיבָה בִרְצוֹנְךָ אֶת צִיּוֹן תִּבְנֶה חוֹמוֹת יְרוּשָׁלָ͏ִם׃
אָז תַּחְפֹּץ זִבְחֵי צֶדֶק עוֹלָה וְכָלִיל אָז יַעֲלוּ עַל מִזְבַּחֲךָ פָּרִים׃`;
const verses = rawPsalm.split('׃').map(v => v.trim()).filter(v => v.length);
const words = rawPsalm.replace(/׃/g, '').split(/\s+/).filter(w => w.length);

// Verse index for each word
const verseWordIndices = [];
{
  let v = 0;
  for (const verse of verses) {
    const wcount = verse.split(/\s+/).filter(w => w.length).length;
    for (let i = 0; i < wcount; i++) verseWordIndices.push(v);
    v++;
  }
}

// Gematria
const gemap = {'א':1,'ב':2,'ג':3,'ד':4,'ה':5,'ו':6,'ז':7,'ח':8,'ט':9,'י':10,'כ':20,'ך':20,'ל':30,'מ':40,'ם':40,'נ':50,'ן':50,'ס':60,'ע':70,'פ':80,'ף':80,'צ':90,'ץ':90,'ק':100,'ר':200,'ש':300,'ת':400};
const gematria = w => [...w].reduce((s,ch)=> s + (gemap[ch]||0), 0);

// UI els
const verseSelect = document.getElementById('verseSelect');
const playBtn = document.getElementById('playBtn');
const stopBtn = document.getElementById('stopBtn');
const themeBtn = document.getElementById('themeBtn');
const tooltip = document.getElementById('tooltip');
const wordDisplay = document.getElementById('wordDisplay');
const gematriaDisplay = document.getElementById('gematriaDisplay');
const verseText = document.getElementById('verseText');
const hoverAudio = document.getElementById('hoverAudio');
const showSpiralGuides = document.getElementById('showSpiralGuides');

verses.forEach((v, i) => {
  const opt = document.createElement('option');
  opt.value = i;
  opt.textContent = `פסוק ${i+1}`;
  verseSelect.appendChild(opt);
});

// Theme
themeBtn.addEventListener('click', () => {
  document.body.classList.toggle('theme-night');
  document.body.classList.toggle('theme-parchment');
});

// SpeechSynthesis
let voiceHe = null;
function pickHebrewVoice() {
  const voices = window.speechSynthesis.getVoices();
  voiceHe = voices.find(v => /he|Hebrew|Israel/i.test((v.lang||'') + v.name)) || null;
}
window.speechSynthesis.onvoiceschanged = pickHebrewVoice;
pickHebrewVoice();

function speakHeb(text) {
  if (!text) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = (voiceHe && voiceHe.lang) || 'he-IL';
  u.rate = 0.9;
  u.pitch = 1.0;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

// Spiral
let phi = 1.61803398875;
let angleStep = 0.45;
let baseRadius = 8;
let growth = 0.06;
let positions = [];
let hoverIndex = -1;
let activeIndex = -1;

function computePositions() {
  positions = [];
  for (let i = 0; i < words.length; i++) {
    const strand = i % 2;
    const a = i * angleStep + (strand ? Math.PI : 0);
    const r = baseRadius * Math.pow(phi, i * growth);
    const x = r * Math.cos(a);
    const y = r * Math.sin(a);
    positions.push({x, y, a});
  }
}
computePositions();

// p5
let cnv, centerX=0, centerY=0, zoom=1;
let autoScroll = false;
let timer = 0, intervalMs = 900;

function setup() {
  cnv = createCanvas(window.innerWidth - 340, Math.max(360, window.innerHeight - 130));
  cnv.parent('canvasWrap');
  textAlign(CENTER, CENTER);
  textSize(16);
  noStroke();
}

function windowResized() {
  resizeCanvas(window.innerWidth - 340, Math.max(360, window.innerHeight - 130));
}

function draw() {
  clear();
  const cx = width/2, cy = height/2;

  push();
  translate(cx, cy);
  scale(zoom);
  translate(centerX, centerY);

  if (showSpiralGuides.checked) drawGuides();

  for (let i = 0; i < words.length; i++) {
    const p = positions[i];
    const d = dist((mouseX-cx)/zoom - centerX, (mouseY-cy)/zoom - centerY, p.x, p.y);
    const hovered = d < 22;
    const active = (i === activeIndex);
    const glow = active ? 1 : hovered ? .65 : .25;
    const col = active ? color(255, 215, 120) : hovered ? color(140, 220, 255) : color(230, 235, 255, 180);

    push();
    translate(p.x, p.y);
    drawingContext.shadowColor = `rgba(255,240,180,${glow})`;
    drawingContext.shadowBlur = active ? 28 : hovered ? 18 : 8;
    fill(col);
    rotate(p.a + HALF_PI);
    text(words[i], 0, 0);
    pop();

    if (hovered) hoverIndex = i;
  }
  pop();

  // Tooltip & side panel
  if (hoverIndex >= 0) {
    const sp = screenPos(positions[hoverIndex]);
    tooltip.style.display = 'block';
    tooltip.style.left = sp.x + 'px';
    tooltip.style.top = sp.y + 'px';
    const g = gematria(words[hoverIndex]);
    tooltip.innerHTML = `<b>${words[hoverIndex]}</b> · ${g}`;
    wordDisplay.textContent = words[hoverIndex];
    gematriaDisplay.textContent = g;
    const vIdx = verseWordIndices[hoverIndex];
    verseText.textContent = verses[vIdx];
    if (hoverAudio.checked) speakHeb(words[hoverIndex]);
  } else {
    tooltip.style.display = 'none';
  }
  hoverIndex = -1;

  // Auto-scroll playback
  if (autoScroll) {
    if (millis() - timer > intervalMs) {
      timer = millis();
      activeIndex = (activeIndex + 1) % words.length;
      const p = positions[activeIndex];
      centerX = lerp(centerX, -p.x, 0.35);
      centerY = lerp(centerY, -p.y, 0.35);
      speakHeb(words[activeIndex]);
    }
  }
}

function drawGuides() {
  stroke(255,255,255,40);
  noFill();
  for (let i=0; i<words.length; i+=6) {
    const a = i*angleStep; const r = baseRadius * Math.pow(phi, i*growth);
    const x = r*Math.cos(a), y=r*Math.sin(a);
    circle(x,y, 2);
  }
  noStroke();
}

function screenPos(pos) {
  const cx = width/2, cy = height/2;
  const x = cx + (pos.x + centerX) * zoom;
  const y = cy + (pos.y + centerY) * zoom;
  return {x, y};
}

// Controls
playBtn.addEventListener('click', ()=>{ autoScroll = true; playBtn.disabled=true; stopBtn.disabled=false; timer = (typeof millis==='function')? millis(): 0; activeIndex = Math.max(0, activeIndex); });
stopBtn.addEventListener('click', ()=>{ autoScroll = false; playBtn.disabled=false; stopBtn.disabled=true; });

verseSelect.addEventListener('change', (e)=> {
  const vIdx = parseInt(e.target.value,10);
  let idx = verseWordIndices.findIndex(v => v === vIdx);
  if (idx < 0) idx = 0;
  activeIndex = idx;
  const p = positions[idx];
  centerX = -p.x; centerY = -p.y;
  speakHeb(words[idx]);
});

// Zoom wheel
document.getElementById('canvasWrap').addEventListener('wheel', (ev)=>{
  ev.preventDefault();
  const delta = Math.sign(ev.deltaY);
  zoom *= (delta > 0 ? 0.92 : 1.08);
  zoom = Math.max(0.2, Math.min(2.8, zoom));
}, {passive:false});

// Drag pan
let dragging=false, lastX=0, lastY=0;
function mousePressed() { dragging = true; lastX = mouseX; lastY = mouseY; }
function mouseReleased() { dragging = false; }
function mouseDragged() {
  if (!dragging) return;
  const dx = (mouseX - lastX)/zoom;
  const dy = (mouseY - lastY)/zoom;
  centerX += dx; centerY += dy;
  lastX = mouseX; lastY = mouseY;
}
