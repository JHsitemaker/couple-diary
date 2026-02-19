// 섹션 감지해서 메뉴 active 표시
const links = document.querySelectorAll(".navlink");
const sections = Array.from(document.querySelectorAll(".hero, .section"));

const setActive = (id) => {
  links.forEach(a => {
    a.classList.toggle("active", a.getAttribute("href") === `#${id}`);
  });
};

const observer = new IntersectionObserver((entries) => {
  // 화면에 가장 많이 들어온 섹션을 찾음
  const visible = entries
    .filter(e => e.isIntersecting)
    .sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];

  if (visible) setActive(visible.target.id);
}, { threshold: [0.25, 0.5, 0.75] });

sections.forEach(sec => observer.observe(sec));

/* D-DAY 예시(필요하면 날짜만 바꿔서 쓰기)
   이미 쓰고 있는 로직이 있으면 이 부분은 무시해도 됨 */
const dDayEl = document.getElementById("dDay");
if (dDayEl) {
  const start = new Date("2022-03-12"); // 시작일 예시
  const now = new Date();
  const diff = Math.floor((now - start) / (1000 * 60 * 60 * 24));
  dDayEl.textContent = `D DAY ${diff}일`;
}
