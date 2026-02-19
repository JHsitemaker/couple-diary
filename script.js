const startDate = new Date("2022-03-12"); //
const today = new Date();

const diffTime = today - startDate;
const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

document.getElementById("dDay").innerText =
  `D DAY ${diffDays}일 `;
