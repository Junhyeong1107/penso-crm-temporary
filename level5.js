// ===== 카테고리 =====

const DOMAINS = ["도형","연산","규칙논리","측정"];
const SKILLS  = ["문제이해능력","논리전개력","집중력"];

// ===== 가중치 =====

const WEIGHTS = {
  "도형":     { "문제이해능력":0.45,"논리전개력":0.40,"집중력":0.15 },
  "연산":     { "문제이해능력":0.20,"논리전개력":0.15,"집중력":0.65 },
  "규칙논리": { "문제이해능력":0.20,"논리전개력":0.70,"집중력":0.10 },
  "측정":     { "문제이해능력":0.45,"논리전개력":0.30,"집중력":0.25 },
};

// ===== 기준 평균 =====

const BASE_AVG = {
  "도형":68,
  "연산":62,
  "규칙논리":58,
  "측정":54
};

// ===== 문항 하드코딩 =====

// ===== 문항 하드코딩 =====

const QUESTIONS = [

{pts:5,domains:["연산"], semester:1},           // 1
{pts:7,domains:["연산"], semester:1},           // 2
{pts:5,domains:["도형","연산"], semester:1},    // 3
{pts:6,domains:["도형","규칙논리"], semester:1},    // 4
{pts:7,domains:["연산","규칙논리"], semester:1},    // 5
{pts:5,domains:["연산"], semester:1},           // 6    
{pts:7,domains:["연산","도형","측정"], semester:1},   // 7
{pts:6,domains:["도형"], semester:1},               // 8
{pts:7,domains:["측정"], semester:1},               // 9
{pts:6,domains:["규칙논리"], semester:1},    // 10

{pts:7,domains:["연산"], semester:2},           // 11
{pts:5,domains:["연산"], semester:2},           // 12
{pts:7,domains:["도형"], semester:2},           // 13
{pts:7,domains:["연산"], semester:2},           // 14
{pts:6,domains:["도형","측정"], semester:2},     // 15
{pts:7,domains:["도형","규칙논리"], semester:2}  // 16

];

// ===== 유틸 =====

function skillLevel(p){
  if(p>=75) return "매우우수";
  if(p>=60) return "우수";
  if(p>=45) return "보통";
  if(p>=30) return "보완필요";
  return "집중보완";
}

function pensoGrade(p){
  if(p>=80) return "펜소 T";
  if(p>=60) return "펜소 D";
  if(p>=40) return "펜소 L";
  return "펜소 P";
}

// 기본 날짜
document.getElementById("testDate").valueAsDate = new Date();

function n(v){ return Number.isFinite(v)?v:0; }

// ===== 테이블 생성 =====

const tbody = document.querySelector("#qTable tbody");

QUESTIONS.forEach((q,i)=>{

const tr = document.createElement("tr");

tr.innerHTML=`

<td>${i+1}</td>

<td>${q.pts}</td>

<td>
<input type="number" class="score" data-q="${i}" value="0">
</td>

<td>
${q.domains.join(", ")}
</td>

`;

tbody.appendChild(tr);

});

// ===== 문제 읽기 =====

function getQuestions(){

const qs=[];

QUESTIONS.forEach((q,i)=>{

const sc = n(parseFloat(document.querySelector(`.score[data-q="${i}"]`).value));

qs.push({

pts:q.pts,
score: sc>0 ? q.pts : 0,   // 부분점수 없음
domains:q.domains

});

});

return qs;

}

// ===== 레이더 그리기(Canvas) =====
// values: [0..100], labels: string[]

function n(v){ return Number.isFinite(v) ? v : 0; }
function clamp(v,min,max){ return Math.max(min,Math.min(max,v)); }

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

  // ===== 배경 그리드 =====

  ctx.lineWidth = 1;
  ctx.strokeStyle = "#e5e7eb";

  for(let k=1;k<=5;k++){

    const rr = (r/5)*k;

    ctx.beginPath();

    for(let i=0;i<N;i++){

      const ang = (Math.PI*2/N)*i - Math.PI/2;

      const x = cx + Math.cos(ang)*rr;
      const y = cy + Math.sin(ang)*rr;

      if(i===0) ctx.moveTo(x,y);
      else ctx.lineTo(x,y);

    }

    ctx.closePath();
    ctx.stroke();
  }

  // ===== 축 =====

  ctx.strokeStyle = "#d1d5db";

  for(let i=0;i<N;i++){

    const ang = (Math.PI*2/N)*i - Math.PI/2;

    ctx.beginPath();
    ctx.moveTo(cx,cy);
    ctx.lineTo(cx + Math.cos(ang)*r, cy + Math.sin(ang)*r);
    ctx.stroke();

  }

  // ===== 라벨 =====

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

    if (x < cx - r*0.2) tx = x - w;
    if (x > cx + r*0.2) tx = x;
    if (y < cy - r*0.2) ty = y - 6;
    if (y > cy + r*0.2) ty = y + 14;

    ctx.fillText(text, tx, ty);

  }

  // ===== 값 폴리곤 =====

  const pts = values.map(v => clamp(n(v),0,100));

  ctx.beginPath();

  for(let i=0;i<N;i++){

    const ang = (Math.PI*2/N)*i - Math.PI/2;

    const rr = (pts[i]/100)*r;

    const x = cx + Math.cos(ang)*rr;
    const y = cy + Math.sin(ang)*rr;

    if(i===0) ctx.moveTo(x,y);
    else ctx.lineTo(x,y);

  }

  ctx.closePath();

  ctx.fillStyle = "rgba(37,99,235,0.18)";
  ctx.strokeStyle = "rgba(37,99,235,0.9)";
  ctx.lineWidth = 2;

  ctx.fill();
  ctx.stroke();

  // ===== 점 표시 =====

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

const qs=getQuestions();

// 총점

const totalPts=qs.reduce((a,q)=>a+q.pts,0);
const totalScore=qs.reduce((a,q)=>a+q.score,0);

const score100=(totalScore/totalPts)*100;
  // 상단 메타
  const name = (document.getElementById("studentName").value || "").trim();
  const cls  = (document.getElementById("studentClass").value || "").trim();
  const date = document.getElementById("testDate").value || "";
  document.getElementById("meta").innerText = [date, name, cls].filter(Boolean).join(" · ");

document.getElementById("totalScoreTxt").innerText=
`${totalScore} / ${totalPts}`;

document.getElementById("percentTxt").innerText=
pensoGrade(score100);

document.getElementById("progressFill").style.width=
score100+"%";

// ===== 영역 계산 (개수 기반)

const domainAgg={};
const domainTotal={};

DOMAINS.forEach(d=>{
domainAgg[d]=0;
domainTotal[d]=0;
});

qs.forEach(q=>{

const correct = q.score>0 ? 1:0;

q.domains.forEach(d=>{

domainTotal[d]+=1;
domainAgg[d]+=correct;

});

});

const domainPercents = DOMAINS.map(d=>
domainTotal[d] ? domainAgg[d]/domainTotal[d]*100 : 0
);

// ===== 영역표

const catBody = document.querySelector("#catTable tbody");
catBody.innerHTML = "";

DOMAINS.forEach((d)=>{

const percent = domainTotal[d]
? (domainAgg[d] / domainTotal[d]) * 100
: 0;

const level = skillLevel(percent);

const tr = document.createElement("tr");

tr.innerHTML = `
<td>${d}</td>

<td>
  <div class="bar">
    <div class="bar-fill" style="width:${percent}%"></div>
  </div>
</td>

<td class="level-${level}">
${level}
</td>
`;

catBody.appendChild(tr);

});

// ===== 역량 계산

const skillAgg={};
SKILLS.forEach(s=>skillAgg[s]={score:0,max:0});

qs.forEach(q=>{

const correct = q.score>0 ? 1:0;

q.domains.forEach(dom=>{

const w=WEIGHTS[dom];

SKILLS.forEach(sk=>{

skillAgg[sk].score+=correct*w[sk];
skillAgg[sk].max+=1*w[sk];

});

});

});

const skillPercents=SKILLS.map(sk=>
skillAgg[sk].max ? skillAgg[sk].score/skillAgg[sk].max*100 : 0
);

// ===== 역량표

const skillBody = document.querySelector("#skillTable tbody");
skillBody.innerHTML = "";

SKILLS.forEach((sk)=>{

const tr = document.createElement("tr");

const ws = skillAgg[sk].score;
const wm = skillAgg[sk].max;

const percent = wm ? (ws / wm) * 100 : 0;
const level = skillLevel(percent);

tr.innerHTML = `
<td>${sk}</td>

<td>
  <div class="bar">
    <div class="bar-fill" style="width:${percent}%"></div>
  </div>
</td>

<td class="level-${level}">
${level}
</td>
`;

skillBody.appendChild(tr);

});
// ===== 레이더

drawRadar("radarDomain",DOMAINS,domainPercents);
drawRadar("radarSkill",SKILLS,skillPercents);

// ===== 비교

const compareBody=document.getElementById("compareBody");
compareBody.innerHTML="";

DOMAINS.forEach((d,i)=>{

const student=domainPercents[i];
const base=BASE_AVG[d];

const tr=document.createElement("tr");

tr.innerHTML=`
<td>${d}</td>
<td>${base}</td>
<td>${student.toFixed(1)}</td>
<td>
<div class="bar-wrap">
<div class="bar-base" style="width:${base}%"></div>
<div class="bar-student" style="width:${student}%"></div>
</div>
</td>
`;

compareBody.appendChild(tr);

});
// ===== 학기 성취도 계산 =====

const semesterAgg = {
  1:{score:0,max:0},
  2:{score:0,max:0}
};

qs.forEach((q,i)=>{

  const meta = QUESTIONS[i];

  const correct = q.score>0 ? 1:0;

  semesterAgg[meta.semester].score += correct;
  semesterAgg[meta.semester].max += 1;

});

const semester1Percent =
semesterAgg[1].max ? semesterAgg[1].score/semesterAgg[1].max*100 : 0;

const semester2Percent =
semesterAgg[2].max ? semesterAgg[2].score/semesterAgg[2].max*100 : 0;

const semesterTotalPercent =
(semester1Percent + semester2Percent) / 2;


// ===== 학년 평균 (임시값) =====

const avgSemester1 = 70;
const avgSemester2 = 68;
const avgTotal = (avgSemester1 + avgSemester2)/2;


// ===== 세로막대 그래프 출력 =====

drawSemesterBar("sem1Chart", semester1Percent, avgSemester1);

drawSemesterBar("sem2Chart", semester2Percent, avgSemester2);

drawSemesterBar("semTotalChart", semesterTotalPercent, avgTotal);

// ===== 학기 세로막대 그래프 =====

function drawSemesterBar(canvasId, student, avg){

const canvas = document.getElementById(canvasId);
if(!canvas) return;

const ctx = canvas.getContext("2d");

const width = canvas.clientWidth || 220;
const height = canvas.clientHeight || 180;

const dpr = window.devicePixelRatio || 1;

canvas.width = width * dpr;
canvas.height = height * dpr;

ctx.scale(dpr, dpr);
ctx.clearRect(0,0,width,height);

const base = height - 35;
const maxHeight = height - 60;

const studentHeight = maxHeight * (student/100);
const avgHeight = maxHeight * (avg/100);

const barWidth = 30;

const studentX = width*0.35;
const avgX = width*0.65;

ctx.font = "700 12px system-ui";
ctx.textAlign = "center";


// ===== 기준선 =====

ctx.strokeStyle = "#e5e7eb";
ctx.lineWidth = 1;

for(let i=0;i<=4;i++){

const y = base - (maxHeight/4)*i;

ctx.beginPath();
ctx.moveTo(width*0.15,y);
ctx.lineTo(width*0.85,y);
ctx.stroke();

}


// ===== 둥근 막대 함수 =====

function roundRect(x,y,w,h,r){

ctx.beginPath();

ctx.moveTo(x+r,y);
ctx.lineTo(x+w-r,y);
ctx.quadraticCurveTo(x+w,y,x+w,y+r);

ctx.lineTo(x+w,y+h);
ctx.lineTo(x,y+h);

ctx.lineTo(x,y+r);
ctx.quadraticCurveTo(x,y,x+r,y);

ctx.closePath();
ctx.fill();

}


// ===== 학생 막대 =====

const gradStudent = ctx.createLinearGradient(0,base-studentHeight,0,base);
gradStudent.addColorStop(0,"#3b82f6");
gradStudent.addColorStop(1,"#2563eb");

ctx.fillStyle = gradStudent;

roundRect(
studentX-barWidth/2,
base-studentHeight,
barWidth,
studentHeight,
6
);


// ===== 평균 막대 =====

const gradAvg = ctx.createLinearGradient(0,base-avgHeight,0,base);
gradAvg.addColorStop(0,"#cbd5f5");
gradAvg.addColorStop(1,"#9ca3af");

ctx.fillStyle = gradAvg;

roundRect(
avgX-barWidth/2,
base-avgHeight,
barWidth,
avgHeight,
6
);


// ===== 점수 표시 =====

ctx.fillStyle = "#111827";
ctx.font = "700 14px system-ui";

ctx.fillText(student.toFixed(0)+"%", studentX, base-studentHeight-6);
ctx.fillText(avg.toFixed(0)+"%", avgX, base-avgHeight-6);


// ===== 라벨 =====

ctx.font = "700 14px system-ui";
ctx.fillStyle = "#374151";

ctx.fillText("학생점수", studentX, height-10);
ctx.fillText("원생평균", avgX, height-10);

}
// 코멘트 출력
  document.getElementById("overallOut").innerText =
    (document.getElementById("commentOverall").value || "").trim();
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

calc();


