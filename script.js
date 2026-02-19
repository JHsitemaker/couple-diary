// ===== 유틸 =====
const $ = (id) => document.getElementById(id);

function smoothTo(hash){
  const el = document.querySelector(hash);
  if(!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}

function setActiveNav(){
  const links = document.querySelectorAll(".navlink");
  links.forEach(a => a.classList.remove("active"));

  // 가장 가까운 섹션 기준으로 active
  const sections = ["#home","#story","#schedule","#photo"]
    .map(s => document.querySelector(s))
    .filter(Boolean);

  let current = "#home";
  const y = window.scrollY + 140;
  sections.forEach(sec => {
    if(sec.offsetTop <= y) current = "#" + sec.id;
  });

  const active = document.querySelector(`.navlink[href="${current}"]`);
  if(active) active.classList.add("active");
}

window.addEventListener("scroll", setActiveNav);
window.addEventListener("load", setActiveNav);

// ===== 메뉴 클릭: 부드럽게 이동 =====
document.querySelectorAll('a.navlink[href^="#"]').forEach(a=>{
  a.addEventListener("click", (e)=>{
    e.preventDefault();
    const hash = a.getAttribute("href");
    history.replaceState(null, "", hash);
    smoothTo(hash);
  });
});

// ===== 폼 열고 닫기 =====
function show(el){ el.style.display = "block"; }
function hide(el){ el.style.display = "none"; }

// 메인 CTA
$("goAddSchedule")?.addEventListener("click", ()=>{
  smoothTo("#schedule");
  show($("scheduleForm"));
  setTimeout(()=> $("schTitle")?.focus(), 300);
});

$("goUploadPhoto")?.addEventListener("click", ()=>{
  smoothTo("#photo");
  show($("photoForm"));
  setTimeout(()=> $("photoInput")?.click(), 300);
});

// 섹션 버튼
$("openScheduleForm")?.addEventListener("click", ()=> show($("scheduleForm")));
$("closeScheduleForm")?.addEventListener("click", ()=> hide($("scheduleForm")));

$("openPhotoUploader")?.addEventListener("click", ()=> {
  show($("photoForm"));
  $("photoInput")?.click();
});
$("closePhotoForm")?.addEventListener("click", ()=> hide($("photoForm")));

// ===== 일정 저장 (localStorage) =====
const SCH_KEY = "coupleSchedules_v1";

function loadSchedules(){
  try{
    return JSON.parse(localStorage.getItem(SCH_KEY) || "[]");
  }catch(e){
    return [];
  }
}

function saveSchedules(list){
  localStorage.setItem(SCH_KEY, JSON.stringify(list));
}

function renderSchedules(){
  const list = loadSchedules()
    .sort((a,b)=> (a.date+a.time).localeCompare(b.date+b.time));

  const wrap = $("scheduleList");
  const preview = $("schedulePreview");
  if(!wrap || !preview) return;

  wrap.innerHTML = "";
  preview.innerHTML = "";

  if(list.length === 0){
    wrap.innerHTML = `<div class="emptyHint">아직 등록된 일정이 없다잉</div>`;
    preview.innerHTML = `<div class="emptyHint">아직 등록된 일정이 없다잉</div>`;
    return;
  }

  // 전체 리스트
  list.forEach((it, idx)=>{
    const row = document.createElement("div");
    row.className = "itemRow";
    row.innerHTML = `
      <div class="itemLeft">
        <div class="itemTitle">${it.title}</div>
        <div class="itemMeta">${it.date}${it.time ? " · " + it.time : ""}${it.memo ? " · " + it.memo : ""}</div>
      </div>
      <button class="btn small ghost" data-del="${idx}">삭제</button>
    `;
    wrap.appendChild(row);
  });

  // 홈 미리보기 (최대 3개)
  list.slice(0,3).forEach((it)=>{
    const line = document.createElement("div");
    line.className = "itemRow";
    line.innerHTML = `
      <div class="itemLeft">
        <div class="itemTitle">${it.title}</div>
        <div class="itemMeta">${it.date}${it.time ? " · " + it.time : ""}</div>
      </div>
    `;
    preview.appendChild(line);
  });

  // 삭제
  wrap.querySelectorAll("[data-del]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const idx = Number(btn.getAttribute("data-del"));
      const next = loadSchedules();
      next.splice(idx, 1);
      saveSchedules(next);
      renderSchedules();
    });
  });
}

$("saveSchedule")?.addEventListener("click", ()=>{
  const title = $("schTitle")?.value?.trim();
  const date = $("schDate")?.value;
  const time = $("schTime")?.value;
  const memo = $("schMemo")?.value?.trim();

  if(!title || !date){
    alert("제목과 날짜는 꼭 넣어줘잉");
    return;
  }

  const list = loadSchedules();
  list.push({ title, date, time: time || "", memo: memo || "" });
  saveSchedules(list);

  $("schTitle").value = "";
  $("schDate").value = "";
  $("schTime").value = "";
  $("schMemo").value = "";

  hide($("scheduleForm"));
  renderSchedules();
});

// ===== 사진 업로드 (로컬 미리보기 + localStorage는 용량 제한 때문에 URL만 저장) =====
const PHOTO_KEY = "couplePhotos_v1";

function loadPhotos(){
  try{ return JSON.parse(localStorage.getItem(PHOTO_KEY) || "[]"); }
  catch(e){ return []; }
}
function savePhotos(arr){
  localStorage.setItem(PHOTO_KEY, JSON.stringify(arr));
}

function renderPhotos(){
  const gallery = $("photoGallery");
  const preview = $("photoPreview");
  if(!gallery || !preview) return;

  const list = loadPhotos(); // {url, t}
  gallery.innerHTML = "";
  preview.innerHTML = "";

  if(list.length === 0){
    gallery.innerHTML = `<div class="emptyHint">아직 업로드한 사진이 없다잉</div>`;
    preview.innerHTML = `<div class="emptyHint">아직 업로드한 사진이 없다잉</div>`;
    return;
  }

  // 최신순
  const sorted = [...list].sort((a,b)=> b.t - a.t);

  // 전체 갤러리(최대 24장만 보여주자잉)
  sorted.slice(0,24).forEach((it, idx)=>{
    const img = document.createElement("img");
    img.src = it.url;
    img.alt = "photo";
    img.loading = "lazy";
    gallery.appendChild(img);
  });

  // 홈 미리보기(최대 6장)
  sorted.slice(0,6).forEach((it)=>{
    const img = document.createElement("img");
    img.src = it.url;
    img.alt = "preview";
    img.loading = "lazy";
    preview.appendChild(img);
  });
}

$("photoInput")?.addEventListener("change", (e)=>{
  const files = Array.from(e.target.files || []);
  if(files.length === 0) return;

  // localStorage에 이미지 자체 저장은 용량 제한 때문에 위험해서
  // objectURL로 “현재 브라우저에서만” 보이게 만들고, URL을 저장
  const now = Date.now();
  const list = loadPhotos();

  files.forEach((f, i)=>{
    const url = URL.createObjectURL(f);
    list.push({ url, t: now + i });
  });

  savePhotos(list);
  renderPhotos();
  show($("photoForm"));
});

// 최초 렌더
window.addEventListener("load", ()=>{
  renderSchedules();
  renderPhotos();
});
