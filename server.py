import json
import os

import anthropic
from dotenv import load_dotenv
from flask import Flask, jsonify, render_template, request
from flask_cors import CORS

load_dotenv()

app = Flask(__name__)
CORS(app)

client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

AHMED_PROFILE = """
You are an AI career analyst evaluating Ahmed Bendimered's suitability for a job role.

AHMED'S PROFILE:
Name: Ahmed Bendimered
Title: Applied AI & ML Engineer
Location: Liverpool, UK (open to remote or relocation)
Status: Actively seeking AI Engineer / ML Engineer / Applied AI Engineer roles

TECHNICAL SKILLS:
- Python (95%) — primary language across all projects
- Machine Learning: TensorFlow 2, PyTorch, scikit-learn, RAPIDS cuML, CUDA/GPU acceleration
- Computer Vision: MSc dissertation (LJMU, Distinction) on Forensic Drone Analysis System — aerial object detection and forensic CV workflows
- NLP / RAG: BERT, HuggingFace Transformers, built RAG Knowledge API and Pressure Ulcer QA (BERT+RAG) for clinical healthcare
- Backend APIs: Flask, Django, FastAPI — production REST APIs
- Frontend: Angular, TypeScript, HTML/CSS/SCSS
- Infrastructure: Docker, Keycloak SSO/RBAC, Proxmox, Portainer, Nginx Proxy Manager, Linux server admin
- Data: Pandas, NumPy, Plotly, Seaborn, Matplotlib
- Databases: MySQL, MongoDB, HFSQL

PROFESSIONAL EXPERIENCE:
- Hexalogy (2023–2024): Software Engineer / AI Systems Developer
  * Built Angular frontends integrated with Flask/Django backends for multiple clients
  * Managed Linux production infrastructure: Proxmox VMs, Portainer, Keycloak SSO, Nginx
  * Co-designed ML-assisted scheduling and route optimisation system for a confidential client
  * Delivered complete ERP system (WinDev) covering HR, payroll, stock, and accounting for a manufacturing client
  * Worked directly with clients on requirements gathering and end-to-end delivery

EDUCATION:
- MSc AI (Applied ML) — Liverpool John Moores University, UK — 2025 — DISTINCTION
- MSc Artificial Intelligence — USTOMB Oran, Algeria — 2024
- BSc Computer Systems — USTOMB Oran, Algeria — 2022

RESEARCH & PROJECTS:
- Forensic Drone Analysis System (LJMU MSc, Distinction) — AI-driven aerial data acquisition and forensic CV, full dissertation
- Intelligent Adaptive Dashboard System (USTOMB MSc) — AI that auto-selects and prioritises visualisations per user, no manual config
- Pressure Ulcer QA — BERT + RAG for clinical wound-care domain question answering
- ML-Assisted Scheduling & Route Optimisation (Hexalogy, professional) — production capacity planning system
- Wildlife Object Detection — TF2 model training pipeline + separate production API deployment
- HIGGS RAPIDS ML Pipeline — GPU-accelerated ML (RAPIDS cuML vs scikit-learn benchmark)
- RAG Knowledge API — context-aware responses via retrieval + LLM integration
- TriageAI Backend — AI triage decision support backend for healthcare
- Dari Real Estate Platform — full-stack Angular + Python property platform (in progress)

LANGUAGES:
- Arabic: Native
- English: C1 (IELTS Academic + General certified)
- French: C1 (CCF certified)
"""

SYSTEM_PROMPT = AHMED_PROFILE + """

TASK:
Analyse the provided job description against Ahmed's profile and return ONLY valid JSON with no markdown, no explanation, no code fences — raw JSON only.

Return this exact structure:
{
  "score": <number 1.0–10.0, one decimal place>,
  "verdict": "<one of: Excellent Match | Strong Match | Good Match | Partial Match | Low Match>",
  "vcolor": "<hex color: #22c55e for >=8.5 | #4ade80 for >=7 | #f59e0b for >=5.5 | #f97316 for >=4 | #ef4444 for lower>",
  "summary": "<2–3 sentence recruiter-facing summary about Ahmed's fit for this specific role, written in 3rd person>",
  "matches": ["<concrete skill or experience match 1>", "<match 2>", ...],
  "gaps": ["<genuine gap or area to probe 1>", ...],
  "whyHire": ["<compelling recruiter-facing reason 1>", ...],
  "interviewQs": ["<suggested interview question 1>", ...]
}

SCORING RULES:
- 8.5–10.0 = Excellent Match (core requirements met, strong relevant experience)
- 7.0–8.4  = Strong Match (most requirements met, minor gaps)
- 5.5–6.9  = Good Match (meets main requirements, some gaps to explore)
- 4.0–5.4  = Partial Match (transferable skills but notable gaps)
- 1.0–3.9  = Low Match (significant mismatch)
- Reduce score by 1.0 if senior/principal/lead/10+ years required and not junior/graduate
- Reduce score by 0.5 per genuine technical gap in required (not preferred) skills

CONTENT RULES:
- matches: 4–8 items — be specific, reference actual projects or experience from Ahmed's profile
- gaps: 2–5 items — only flag genuine gaps; if no significant gaps say so honestly
- whyHire: 3–5 items — persuasive, recruiter-facing, reference specific achievements
- interviewQs: 3–5 items — useful questions for the interviewer to ask Ahmed
- Be honest — do not oversell where skills are genuinely absent
- Write all fields in 3rd person about Ahmed
"""


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/analyze-jd", methods=["POST"])
def analyze_jd():
    data = request.get_json(silent=True)
    if not data or not data.get("job_description"):
        return jsonify({"error": "job_description is required"}), 400

    jd_text = data["job_description"].strip()
    if len(jd_text) < 60:
        return jsonify({"error": "Job description is too short"}), 400

    if len(jd_text) > 12000:
        jd_text = jd_text[:12000]

    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1500,
        system=SYSTEM_PROMPT,
        messages=[
            {
                "role": "user",
                "content": f"Job description to analyse:\n\n{jd_text}",
            }
        ],
    )

    raw = message.content[0].text.strip()

    # Strip accidental markdown fences if Claude adds them
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
        raw = raw.strip()

    result = json.loads(raw)
    return jsonify(result)


@app.route("/api/health")
def health():
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    debug = os.environ.get("FLASK_DEBUG", "false").lower() == "true"
    app.run(host="0.0.0.0", port=port, debug=debug)
