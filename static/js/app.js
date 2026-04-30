'use strict';

const API_BASE = 'jd-matcher-api-production.up.railway.app';

/* ════════════════════════════════
   CURSOR
════════════════════════════════ */
const curEl = document.getElementById('cur');
document.addEventListener('mousemove', e => {
  curEl.style.left = e.clientX + 'px';
  curEl.style.top = e.clientY + 'px';
});
document.querySelectorAll('a,button,.fc,.hstat,.paper,.edu-card,.alink,.rt-card').forEach(el => {
  el.addEventListener('mouseenter', () => curEl.classList.add('big'));
  el.addEventListener('mouseleave', () => curEl.classList.remove('big'));
});

/* ════════════════════════════════
   SCROLL REVEAL
════════════════════════════════ */
const ro = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); });
}, { threshold: .08 });
document.querySelectorAll('.reveal').forEach((el, i) => {
  el.style.transitionDelay = `${(i % 4) * 0.07}s`;
  ro.observe(el);
});

/* ─── Skill bars animate on scroll ─── */
const skObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting)
      e.target.querySelectorAll('.sk-fill').forEach(b => { b.style.width = b.dataset.p + '%'; });
  });
}, { threshold: .15 });
const skillsSection = document.getElementById('skills');
if (skillsSection) skObs.observe(skillsSection);

/* ════════════════════════════════
   LOCAL CHATBOT
════════════════════════════════ */
const STOP = new Set(['the','a','an','is','are','was','were','be','been','have','has','had','do','does','did','will','would','could','should','may','might','i','me','my','you','your','he','she','it','we','they','and','or','but','in','on','at','to','for','of','with','by','from','as','this','that','these','those','not','no','so','what','how','when','where','who','which','tell','about','please']);

const KB = [
  { text: 'Ahmed Bendimered is an Applied AI and ML Engineer based in Liverpool UK open to remote or relocation actively seeking AI ML Engineer roles', tags: ['about', 'ahmed', 'profile', 'location'] },
  { text: 'Ahmed has two MSc degrees in Artificial Intelligence one from Liverpool John Moores University LJMU UK 2025 with Distinction and one from USTOMB Oran Algeria 2024 and a BSc Computer Systems from USTOMB 2022', tags: ['education', 'degree', 'msc', 'university'] },
  { text: 'Skills include Python TensorFlow PyTorch RAPIDS cuML CUDA Flask Django FastAPI Docker Keycloak Linux Angular TypeScript BERT HuggingFace RAG NLP Computer Vision', tags: ['skills', 'tech', 'stack', 'python', 'tensorflow'] },
  { text: 'Ahmed worked at Hexalogy 2023 2024 as Software Engineer building Angular frontends Flask Django backends DevOps on Linux Proxmox Portainer Keycloak Nginx and ML assisted scheduling optimisation', tags: ['experience', 'hexalogy', 'work', 'job'] },
  { text: 'Projects include Forensic Drone Analysis System LJMU MSc Distinction Wildlife Object Detection TF2 RAG Knowledge API TriageAI Backend Pressure Ulcer QA BERT RAG HIGGS RAPIDS ML Pipeline Dari Real Estate Platform', tags: ['projects', 'github', 'drone', 'wildlife', 'rag'] },
  { text: 'Research papers include Forensic Drone Analysis System LJMU Distinction 2025 Intelligent Adaptive Dashboard USTOMB 2024 Pressure Ulcer QA BERT RAG ML Scheduling Hexalogy', tags: ['research', 'paper', 'thesis', 'dissertation'] },
  { text: 'Ahmed speaks Arabic natively English at C1 level IELTS Academic and General certified and French at C1 level CCF certified trilingual', tags: ['language', 'arabic', 'english', 'french', 'trilingual'] },
  { text: 'Contact Ahmed on LinkedIn bendimered-ahmed-el-hadi or GitHub AhmedBenAI email totti312002@gmail.com based in Liverpool UK open to remote or relocation', tags: ['contact', 'linkedin', 'github', 'email'] },
];

function tok(t) { return t.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length > 1 && !STOP.has(w)); }

function buildIdx() {
  const N = KB.length, df = {};
  const docs = KB.map(c => { const terms = tok(c.text), tf = {}; terms.forEach(t => { tf[t] = (tf[t] || 0) + 1; }); Object.keys(tf).forEach(t => { df[t] = (df[t] || 0) + 1; }); return { c, terms, tf }; });
  return docs.map(({ c, terms, tf }) => { const vec = {}; Object.keys(tf).forEach(t => { const idf = Math.log((N + 1) / (df[t] + 1)) + 1; vec[t] = (tf[t] / terms.length) * idf; }); return { c, vec }; });
}
function cos(a, b) { let d = 0, nA = 0, nB = 0; new Set([...Object.keys(a), ...Object.keys(b)]).forEach(k => { const av = a[k] || 0, bv = b[k] || 0; d += av * bv; nA += av * av; nB += bv * bv; }); return (!nA || !nB) ? 0 : d / (Math.sqrt(nA) * Math.sqrt(nB)); }
function qvec(q) { const ts = tok(q), tf = {}; ts.forEach(t => { tf[t] = (tf[t] || 0) + 1; }); const v = {}; Object.keys(tf).forEach(t => { v[t] = tf[t] / ts.length; }); return v; }

const IDX = buildIdx();

function retrieve(q, k = 3) {
  const qv = qvec(q), qt = new Set(tok(q));
  return IDX.map(({ c, vec }) => ({ c, s: cos(qv, vec) + c.tags.filter(tag => qt.has(tag)).length * .1 }))
    .sort((a, b) => b.s - a.s).slice(0, k).filter(x => x.s > .01).map(x => x.c);
}

function answer(q, chunks) {
  if (!chunks.length) return "I don't have info on that. Reach Ahmed on LinkedIn: linkedin.com/in/bendimered-ahmed-el-hadi or GitHub: github.com/AhmedBenAI";
  if (/contact|email|reach|linkedin|github|link|connect/i.test(q)) return "Reach Ahmed on LinkedIn: linkedin.com/in/bendimered-ahmed-el-hadi · GitHub: github.com/AhmedBenAI · Email: totti312002@gmail.com — based in Liverpool UK, open to remote or relocation.";
  if (/degree|education|study|university|msc|bsc|ljmu|liverpool|qualif/i.test(q)) return "Ahmed has three degrees: MSc AI from Liverpool John Moores UK (2025, Applied ML, Distinction), MSc AI from USTOMB Oran Algeria (2024), and BSc Computer Systems from USTOMB (2022).";
  if (/skill|know|language|framework|tech|stack|tool|python|pytorch|tensor|docker|flask/i.test(q)) return "Core stack: Python, TensorFlow 2, PyTorch, RAPIDS cuML, CUDA — plus Flask/Django/FastAPI for APIs, Docker for deployment, Keycloak for security, and Apache Superset for dashboards.";
  if (/vision|cv|detect|object|image|wildlife|drone|aerial|forensic/i.test(q)) return "Ahmed's LJMU MSc (Distinction) is on a Forensic Drone Analysis System — AI-driven aerial data acquisition and forensic CV. He also built a Wildlife Object Detection System (TF2 + production API).";
  if (/rag|retrieval|bert|nlp|llm|qa|triage|knowledge/i.test(q)) return "Ahmed built a RAG Knowledge API, a TriageAI Backend (healthcare decision support), and a Pressure Ulcer QA system using BERT+RAG. Strong hands-on RAG and NLP experience.";
  if (/gpu|cuda|rapids|cuml|accelerat/i.test(q)) return "Ahmed benchmarked RAPIDS cuML (GPU) vs scikit-learn (CPU) on the HIGGS boson dataset, showing major speedups. He has CUDA programming experience for ML acceleration.";
  if (/project|repo|github|built|dari|triage|rag|wildlife|drone|dashboard/i.test(q)) return "Projects: Dari real estate platform (Angular+Python), RAG Knowledge API, TriageAI Backend, Pressure Ulcer QA (BERT+RAG), Wildlife Object Detection (TF2 + API), HIGGS RAPIDS ML pipeline, Forensic Drone MSc (LJMU Distinction). All at github.com/AhmedBenAI";
  if (/experience|work|job|role|career|position|hexalogy/i.test(q)) return "Ahmed's professional experience is at Hexalogy (2023–2024) — building Angular frontends, DevOps on Linux/Proxmox/Portainer/Keycloak/Nginx, and co-building an AI capacity optimisation system for a confidential client.";
  if (/research|paper|thesis|dissertation|publish/i.test(q)) return "Research: 2025 LJMU dissertation (Forensic Drone CV, Distinction), 2024 USTOMB MSc (Adaptive Dashboards), Pressure Ulcer QA (BERT+RAG), ML Scheduling at Hexalogy.";
  if (/arabic|french|english|ielts|ccf|bilingual|multilingual|speak/i.test(q)) return "Ahmed speaks Arabic natively, English C1 (IELTS Academic and General certified), and French C1 (CCF certified). Trilingual — strong asset for international teams.";
  if (/where|location|remote|reloc|availab|hire/i.test(q)) return "Ahmed is in Liverpool UK, actively seeking AI Engineer / ML Engineer / Applied AI Engineer roles. Open to remote or relocation.";
  if (/who|about|introduce|yourself|ahmed/i.test(q)) return "Ahmed Bendimered — AI Engineer and Full-Stack Developer. MSc AI with Distinction from Liverpool John Moores UK. Projects span forensic drone CV, RAG APIs, adaptive dashboards, triage AI, and real estate platforms. Trilingual: Arabic / English C1 / French C1.";
  const s = chunks[0].text.match(/[^.!?]+[.!?]+/g) || [chunks[0].text];
  return s.slice(0, 2).join(' ').trim();
}

let chatOpen = false;
function toggleChat() {
  chatOpen = !chatOpen;
  document.getElementById('chatbot').classList.toggle('open', chatOpen);
  if (chatOpen) setTimeout(() => document.getElementById('cin').focus(), 240);
}
function useChip(b) { document.getElementById('cin').value = b.textContent; sendMsg(); }
function sendMsg() {
  const inp = document.getElementById('cin'), q = inp.value.trim(); if (!q) return;
  inp.value = ''; addMsg(q, 'u'); const d = mkDots();
  setTimeout(() => { d.remove(); addMsg(answer(q, retrieve(q)), 'b'); }, 300 + Math.random() * 250);
}
function addMsg(t, cls) {
  const b = document.getElementById('cmsgs'), d = document.createElement('div');
  d.className = 'cm ' + cls;
  d.innerHTML = t.replace(/\n/g, '<br>').replace(/(https?:\/\/[^\s<,]+)/g, '<a href="$1" target="_blank">$1</a>');
  b.appendChild(d); b.scrollTop = b.scrollHeight;
}
function mkDots() {
  const b = document.getElementById('cmsgs'), d = document.createElement('div');
  d.className = 'tdots'; d.innerHTML = '<span></span><span></span><span></span>';
  b.appendChild(d); b.scrollTop = b.scrollHeight; return d;
}

/* ════════════════════════════════
   JD MATCHER — powered by Claude
════════════════════════════════ */
function openJD() {
  document.getElementById('jd-panel').classList.add('open');
  document.getElementById('jd-btn').classList.add('open');
}
function closeJD() {
  document.getElementById('jd-panel').classList.remove('open');
  document.getElementById('jd-btn').classList.remove('open');
}

const dropEl = document.getElementById('jd-drop');
const fileIn = document.getElementById('jd-file-in');

dropEl.addEventListener('dragover', e => { e.preventDefault(); dropEl.classList.add('drag-over'); });
dropEl.addEventListener('dragleave', () => dropEl.classList.remove('drag-over'));
dropEl.addEventListener('drop', e => { e.preventDefault(); dropEl.classList.remove('drag-over'); handleFile(e.dataTransfer.files[0]); });
fileIn.addEventListener('change', () => handleFile(fileIn.files[0]));

function handleFile(file) {
  if (!file) return;
  const reader = new FileReader();
  if (file.type === 'application/pdf') {
    reader.readAsArrayBuffer(file);
    reader.onload = () => {
      const bytes = new Uint8Array(reader.result);
      let text = '';
      for (let i = 0; i < bytes.length - 1; i++)
        text += (bytes[i] >= 32 && bytes[i] < 127) ? String.fromCharCode(bytes[i]) : ' ';
      document.getElementById('jd-text').value = text.replace(/\s+/g, ' ').slice(0, 8000);
      dropEl.querySelector('.jd-drop-label').textContent = '✓ ' + file.name + ' loaded';
    };
  } else {
    reader.readAsText(file);
    reader.onload = () => {
      document.getElementById('jd-text').value = reader.result.slice(0, 8000);
      dropEl.querySelector('.jd-drop-label').textContent = '✓ ' + file.name + ' loaded';
    };
  }
}

async function analyzeJD() {
  const jdText = document.getElementById('jd-text').value.trim();
  if (jdText.length < 60) { alert('Please paste a job description (at least a few sentences).'); return; }

  const btn = document.getElementById('jd-go');
  btn.disabled = true; btn.textContent = 'Analysing…';

  const res = document.getElementById('jd-result');
  res.style.display = 'flex';
  res.innerHTML = '<div class="analyzing"><div class="spin"></div><p>Claude is reading the job requirements…</p></div>';

  try {
    const response = await fetch(`${API_BASE}/api/analyze-jd`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ job_description: jdText }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || `Server error (${response.status})`);
    }

    const r = await response.json();
    btn.disabled = false; btn.textContent = 'Analyse Job Fit →';

    const circ = 2 * Math.PI * 32;
    const filled = circ * (1 - (r.score / 10));

    res.innerHTML = `
      <div style="font-family:var(--M);font-size:.58rem;letter-spacing:.18em;text-transform:uppercase;color:var(--muted);margin-bottom:.6rem;">// Recruiter Match Report — Ahmed Bendimered · Claude AI</div>

      <div class="score-block">
        <div class="score-circle">
          <svg class="score-ring" viewBox="0 0 80 80">
            <circle class="score-track" cx="40" cy="40" r="32"/>
            <circle class="score-arc" cx="40" cy="40" r="32"
              stroke="${r.vcolor}"
              stroke-dasharray="${circ}"
              stroke-dashoffset="${circ}"
              id="score-arc-el"/>
          </svg>
          <div style="position:relative;text-align:center;">
            <div class="score-num" style="color:${r.vcolor}">${r.score}</div>
            <div class="score-denom">/10</div>
          </div>
        </div>
        <div class="score-info">
          <div class="score-verdict" style="color:${r.vcolor}">${r.verdict}</div>
          <div class="score-one-line">${r.summary}</div>
        </div>
      </div>

      <div>
        <div class="jd-section-title">// Matching Skills & Experience</div>
        <div class="match-list">${r.matches.map(m => '<div class="match-item">' + m + '</div>').join('')}</div>
      </div>

      ${r.whyHire && r.whyHire.length ? `<div>
        <div class="jd-section-title">// Why Consider Ahmed</div>
        <div class="tip-list">${r.whyHire.map(t => '<div class="tip-item">' + t + '</div>').join('')}</div>
      </div>` : ''}

      <div>
        <div class="jd-section-title">// Gaps to Probe at Interview</div>
        <div class="gap-list">${r.gaps.map(g => '<div class="gap-item">' + g + '</div>').join('')}</div>
      </div>

      ${r.interviewQs && r.interviewQs.length ? `<div>
        <div class="jd-section-title">// Suggested Interview Questions</div>
        <div class="gap-list">${r.interviewQs.map(q => '<div class="gap-item" style="border-left:1px solid var(--orange);padding-left:6px;margin-bottom:4px;">' + q + '</div>').join('')}</div>
      </div>` : ''}

      <button class="jd-reset" onclick="resetJD()">← Analyse Another Role</button>
    `;

    setTimeout(() => {
      const arc = document.getElementById('score-arc-el');
      if (arc) arc.style.strokeDashoffset = filled;
    }, 100);

  } catch (err) {
    btn.disabled = false; btn.textContent = 'Analyse Job Fit →';
    res.innerHTML = `<div class="jd-error">⚠ ${err.message || 'Something went wrong. Please try again.'}</div>`;
  }
}

function resetJD() {
  document.getElementById('jd-result').style.display = 'none';
  document.getElementById('jd-result').innerHTML = '';
  document.getElementById('jd-text').value = '';
  document.getElementById('jd-go').disabled = false;
  document.getElementById('jd-go').textContent = 'Analyse Job Fit →';
  document.querySelector('.jd-drop-label').textContent = 'Drop a file here';
}
