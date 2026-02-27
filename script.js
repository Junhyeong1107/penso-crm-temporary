// ===== 카테고리(4) & 역량(3) =====
const DOMAINS = ["도형", "연산", "규칙논리", "측정"];
const SKILLS  = ["문제이해능력", "논리전개력", "집중력"];

// 4영역 -> 3역량 가중치 매트릭스 (원하면 수치 조정하면 됨)
const WEIGHTS = {
  "도형":     { "문제이해능력": 0.45, "논리전개력": 0.40, "집중력": 0.15 },
  "연산":     { "문제이해능력": 0.20, "논리전개력": 0.15, "집중력": 0.65 },
  "규칙논리": { "문제이해능력": 0.20, "논리전개력": 0.70, "집중력": 0.10 },
  "측정":     { "문제이해능력": 0.45, "논리전개력": 0.30, "집중력": 0.25 },
};

function skillLevel(scorePercent){
  if (scorePercent >= 75) return "매우우수";
  if (scorePercent >= 60) return "우수";
  if (scorePercent >= 45) return "보통";
  if (scorePercent >= 30) return "보완필요";
  return "집중보완";
}

const BASE_AVG = {
  "도형": 58,
  "연산": 52,
  "규칙논리": 48,
  "측정": 44
};

function pensoGrade(score100){
  if (score100 >= 80) return "펜소 T";
  if (score100 >= 60) return "펜소 D";
  if (score100 >= 40) return "펜소 L";
  return "펜소 P";
}

const tbody = document.querySelector("#qTable tbody");

// ===== 16문항 생성(배점/득점/카테고리) =====
for (let i = 1; i <= 16; i++) {
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td>${i}</td>
    <td><input type="number" class="pts" data-q="${i}" value="6.25" min="0" step="0.01"></td>
    <td><input type="number" class="score" data-q="${i}" value="0" min="0" step="0.01"></td>
    <td>
      <select class="domain" data-q="${i}">
        ${DOMAINS.map(d => `<option value="${d}">${d}</option>`).join("")}
      </select>
    </td>
  `;
  tbody.appendChild(tr);
}

// 기본 날짜
document.getElementById("testDate").valueAsDate = new Date();

// ===== 유틸 =====
function n(v){ return Number.isFinite(v) ? v : 0; }
function clamp(v, min, max){ return Math.max(min, Math.min(max, v)); }

function getQuestions(){
  const qs = [];
  for(let i=1;i<=16;i++){
    const pts = n(parseFloat(document.querySelector(`.pts[data-q="${i}"]`).value));
    const sc  = n(parseFloat(document.querySelector(`.score[data-q="${i}"]`).value));
    const dom = document.querySelector(`.domain[data-q="${i}"]`).value;

    const p = Math.max(0, pts);
    const s = clamp(Math.max(0, sc), 0, p); // 득점이 배점 넘으면 자동 제한
    qs.push({i, pts:p, score:s, domain:dom});
  }
  return qs;
}

// ===== 레이더 그리기(Canvas) =====
// values: [0..100], labels: string[]
function drawRadar(canvasId, labels, values){
  const canvas = document.getElementById(canvasId);
  const ctx = canvas.getContext("2d");

  // 레티나 대응
  const cssW = canvas.clientWidth || canvas.width;
  const cssH = canvas.clientHeight || canvas.height;
  const dpr = window.devicePixelRatio || 1;
  canvas.width  = Math.round(cssW * dpr);
  canvas.height = Math.round(cssH * dpr);
  ctx.setTransform(dpr,0,0,dpr,0,0);

  ctx.clearRect(0,0,cssW,cssH);

  const cx = cssW/2;
  const cy = cssH/2;
  const r  = Math.min(cssW, cssH) * 0.33;
  const N  = labels.length;

  // 배경 그리드(5단)
  ctx.lineWidth = 1;
  ctx.strokeStyle = "#e5e7eb";
  for(let k=1;k<=5;k++){
    const rr = (r/5)*k;
    ctx.beginPath();
    for(let i=0;i<N;i++){
      const ang = (Math.PI*2/N)*i - Math.PI/2;
      const x = cx + Math.cos(ang)*rr;
      const y = cy + Math.sin(ang)*rr;
      if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    }
    ctx.closePath();
    ctx.stroke();
  }

  // 축
  ctx.strokeStyle = "#d1d5db";
  for(let i=0;i<N;i++){
    const ang = (Math.PI*2/N)*i - Math.PI/2;
    ctx.beginPath();
    ctx.moveTo(cx,cy);
    ctx.lineTo(cx + Math.cos(ang)*r, cy + Math.sin(ang)*r);
    ctx.stroke();
  }

  // 라벨
  ctx.fillStyle = "#374151";
  ctx.font = "700 12px system-ui, -apple-system, 'Noto Sans KR', sans-serif";
  for(let i=0;i<N;i++){
    const ang = (Math.PI*2/N)*i - Math.PI/2;
    const x = cx + Math.cos(ang)*(r + 18);
    const y = cy + Math.sin(ang)*(r + 18);

    const text = labels[i];
    const w = ctx.measureText(text).width;

    let tx = x - w/2;
    let ty = y + 4;

    if (x < cx - r*0.2) tx = x - w;   // 왼쪽
    if (x > cx + r*0.2) tx = x;       // 오른쪽
    if (y < cy - r*0.2) ty = y - 6;   // 위
    if (y > cy + r*0.2) ty = y + 14;  // 아래

    ctx.fillText(text, tx, ty);
  }

  // 값 폴리곤
  const pts = values.map(v => clamp(n(v),0,100));
  ctx.beginPath();
  for(let i=0;i<N;i++){
    const ang = (Math.PI*2/N)*i - Math.PI/2;
    const rr = (pts[i]/100)*r;
    const x = cx + Math.cos(ang)*rr;
    const y = cy + Math.sin(ang)*rr;
    if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
  }
  ctx.closePath();

  // 채우기
  ctx.fillStyle = "rgba(37,99,235,0.18)";
  ctx.strokeStyle = "rgba(37,99,235,0.9)";
  ctx.lineWidth = 2;
  ctx.fill();
  ctx.stroke();

  // 점
  ctx.fillStyle = "rgba(37,99,235,0.95)";
  for(let i=0;i<N;i++){
    const ang = (Math.PI*2/N)*i - Math.PI/2;
    const rr = (pts[i]/100)*r;
    const x = cx + Math.cos(ang)*rr;
    const y = cy + Math.sin(ang)*rr;
    ctx.beginPath();
    ctx.arc(x,y,3,0,Math.PI*2);
    ctx.fill();
  }
}

// ===== 계산 =====
function calc(){
  const qs = getQuestions();

  // 총점(배점 기준)
  const totalPts = qs.reduce((a,q)=>a+q.pts,0);
  const totalScore = qs.reduce((a,q)=>a+q.score,0);

  const score100 = totalPts > 0 ? (totalScore/totalPts)*100 : 0;

  // 상단 메타
  const name = (document.getElementById("studentName").value || "").trim();
  const cls  = (document.getElementById("studentClass").value || "").trim();
  const date = document.getElementById("testDate").value || "";
  document.getElementById("meta").innerText = [date, name, cls].filter(Boolean).join(" · ");

  document.getElementById("totalScoreTxt").innerText =
  `${totalScore.toFixed(1)} / ${totalPts.toFixed(1)}`;

document.getElementById("percentTxt").innerText =
  pensoGrade(score100);

document.getElementById("progressFill").style.width =
  clamp(score100,0,100) + "%";

  // ===== 영역 집계 (4) =====
  const domainAgg = {};
  DOMAINS.forEach(d => domainAgg[d] = {score:0, pts:0});

  qs.forEach(q=>{
    domainAgg[q.domain].score += q.score;
    domainAgg[q.domain].pts   += q.pts;
  });

  const domainPercents = DOMAINS.map(d=>{
    const p = domainAgg[d].pts;
    return p>0 ? (domainAgg[d].score/p)*100 : 0;
  });

  // 영역 표
  const catBody = document.querySelector("#catTable tbody");
  catBody.innerHTML = "";
  DOMAINS.forEach((d, idx)=>{
    const s = domainAgg[d].score;
    const p = domainAgg[d].pts;
    const pc = domainPercents[idx];
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${d}</td><td>${Math.round(s)}</td><td>${Math.round(p)}</td><td>${pc.toFixed(1)}%</td>`;
    catBody.appendChild(tr);
  });

  // ===== 역량 집계 (3) : 가중치 계산 =====
  const skillAgg = {};
  SKILLS.forEach(s => skillAgg[s] = {weightedScore:0, weightedMax:0});

  qs.forEach(q=>{
    const w = WEIGHTS[q.domain];
    SKILLS.forEach(sk=>{
      const ww = w[sk] || 0;
      skillAgg[sk].weightedScore += q.score * ww;
      skillAgg[sk].weightedMax   += q.pts   * ww;
    });
  });

  const skillPercents = SKILLS.map(sk=>{
    const mx = skillAgg[sk].weightedMax;
    return mx>0 ? (skillAgg[sk].weightedScore/mx)*100 : 0;
  });

  // 역량 표
  const skillBody = document.querySelector("#skillTable tbody");
  skillBody.innerHTML = "";
  SKILLS.forEach((sk, idx)=>{
    const ws = skillAgg[sk].weightedScore;
    const wm = skillAgg[sk].weightedMax;
    const pc = skillPercents[idx];
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${sk}</td>
      <td>${ws.toFixed(1)} / ${wm.toFixed(1)}</td>
      <td class="level-${skillLevel(pc)}">
        ${skillLevel(pc)}
      </td>
    `;
    skillBody.appendChild(tr);
  });

  // 코멘트 출력
  document.getElementById("overallOut").innerText =
    (document.getElementById("commentOverall").value || "").trim();


  // ===== 레이더 2개 그리기 =====
  drawRadar("radarDomain", DOMAINS, domainPercents);
  drawRadar("radarSkill",  SKILLS,  skillPercents);

  const compareBody = document.getElementById("compareBody");
compareBody.innerHTML = "";

DOMAINS.forEach((d, idx) => {

  const studentAvg = domainPercents[idx];
  const baseAvg = BASE_AVG[d] || 0;

  const tr = document.createElement("tr");

  tr.innerHTML = `
    <td>${d}</td>
    <td>${baseAvg}</td>
    <td>${studentAvg.toFixed(1)}</td>
    <td>
      <div class="bar-wrap">
        <div class="bar-base" style="width:${baseAvg}%"></div>
        <div class="bar-student" style="width:${studentAvg}%"></div>
      </div>
    </td>
  `;

  compareBody.appendChild(tr);
});
}

// ===== 버튼 =====
document.getElementById("btnCalc").addEventListener("click", () => {
  calc();
  document.getElementById("reportArea").scrollIntoView({behavior:"smooth", block:"start"});
});

document.getElementById("btnPrint").addEventListener("click", () => {
  calc();
  window.print();
});

document.getElementById("btnReset").addEventListener("click", () => {
  document.getElementById("studentName").value = "";
  document.getElementById("studentClass").value = "";
  document.getElementById("testDate").valueAsDate = new Date();
  document.getElementById("commentOverall").value = "";

  for(let i=1;i<=16;i++){
    document.querySelector(`.pts[data-q="${i}"]`).value = "1";
    document.querySelector(`.score[data-q="${i}"]`).value = "0";
    document.querySelector(`.domain[data-q="${i}"]`).value = DOMAINS[0];
  }
  calc();
});

// 인쇄 직전 캔버스 재렌더(레이아웃 바뀔 수 있어서)
window.addEventListener("resize", () => calc());

// 최초 1회

calc();


