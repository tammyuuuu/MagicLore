import { calculateBaziWithPatterns as calculateBazi } from '../services/analyzeBazi.js';
import { STEM_BY_NAME, BRANCH_BY_NAME } from '../data/fundamentals.js';
import { getHiddenStems } from '../data/hiddenStems.js';
import { getTenGod } from '../rules/tenGods.js';
import { getSexagenary } from '../data/sexagenary.js';
import lunar from 'lunar-javascript';
const import_lunar_javascript={default:lunar};
  if (new URLSearchParams(location.search).get("embed") === "1") document.body.classList.add("embedded");
  var MVP_SAMPLE = { gender: "male", date: "2000-01-01", time: "05:30", place: "\u6B66\u6C49", timezoneId: "Asia/Shanghai", longitude: "114.3055", latitude: "30.5928" };
  for (const [name, value] of Object.entries(MVP_SAMPLE)) {
    const field = document.querySelector(`[name="${name}"]`);
    if (field) field.value = value;
  }
  function resultFromCurrentForm() {
    // A selected luck/year never changes the birth input. Preserve object
    // identity so natal judgment and report caches survive timeline selection.
    if(activeResult&&JSON.stringify(inputSnapshot())===activeInputSignature)return activeResult;
    const d = new FormData(document.getElementById("form"));
    return calculateBazi({ gender: d.get("gender"), date: d.get("date"), time: d.get("time"), place: d.get("place"), timezoneId: d.get("timezoneId"), longitude: +d.get("longitude"), latitude: +d.get("latitude"), trueSolarTime: d.get("trueSolarTime") === "on", dayBoundaryRule: d.get("dayBoundaryRule") });
  }
  var detailStyle = document.createElement("style");
  detailStyle.textContent = ".luck-row{gap:4px}.luck-row>div{cursor:pointer;min-width:68px;padding:6px 3px}.luck-row>div:hover,.fortune-card:hover,.fortune-card.active{border-color:var(--gold);background:#12251f}.annual-detail{margin-top:12px;overflow:hidden;border-top:1px solid var(--line)}.annual-detail h3{color:var(--gold);margin-bottom:2px}.fortune-scroll{overflow:auto;padding-bottom:5px}.fortune-grid{display:grid;grid-auto-flow:column;grid-auto-columns:minmax(68px,1fr);gap:4px;min-width:max-content}.fortune-card{appearance:none;width:auto;min-width:0;margin:0;padding:6px 3px;text-align:center;border:1px solid var(--line);border-radius:6px;background:#071310;color:var(--ink);cursor:pointer}.fortune-card b{display:block;font-size:14px;color:var(--gold);white-space:nowrap}.fortune-card .age,.fortune-card .date{display:block;color:var(--muted);font-size:9px;white-space:nowrap}.fortune-card .pair{display:grid;grid-template-columns:1fr 1fr;margin-top:4px}.fortune-card .pair strong{font-size:17px}.fortune-card small{font-size:8px;white-space:nowrap}.fortune-card .minor{margin-top:4px;padding-top:3px;border-top:1px solid var(--line)}.fortune-card .minor>strong{display:block;font-size:15px}.month-panel{margin-top:12px}.embedded header{display:none}.embedded .layout{padding:9px;grid-template-columns:250px minmax(0,1fr);gap:10px}.embedded .panel{padding:13px}.embedded{background:#07110f}@media(max-width:800px){.embedded .layout{grid-template-columns:1fr}.fortune-grid{grid-auto-columns:64px}}";
  document.head.appendChild(detailStyle);
  document.getElementById("luck").addEventListener("click", (e) => {
    const monthCard=e.target.closest('[data-month-pillar]');
    if(monthCard){selectedMonthPillar=monthCard.dataset.monthPillar;renderExtendedChart(activeResult);document.querySelectorAll('[data-month-pillar]').forEach(x=>x.classList.toggle('active',x===monthCard));return;}
    const annualCard = e.target.closest(".annual-card");
    if (annualCard) {
      const result2 = resultFromCurrentForm(), cycleIndex2 = +annualCard.dataset.cycle, yearIndex = +annualCard.dataset.year, cycle2 = result2.luckCycles.cycles[cycleIndex2], year = cycle2.years[yearIndex];
      selectedCycleIndex = cycleIndex2;
      selectedYearIndex = yearIndex;
      selectedMonthPillar = null;
      renderExtendedChart(result2);
      document.querySelectorAll(".annual-card").forEach((x) => x.classList.toggle("active", x === annualCard));
      let month = document.getElementById("monthPanel");
      if (!month) {
        month = document.createElement("section");
        month.id = "monthPanel";
        month.className = "month-panel";
        document.getElementById("annualDetail").appendChild(month);
      }
      month.innerHTML = `<h3>${year.year} \u6D41\u6708</h3><div class="fortune-scroll"><div class="fortune-grid">${year.months.map((m) => `<div class="fortune-card" role="button" tabindex="0" data-month-pillar="${m.pillar}"><span class="date">${m.term}</span><b>${m.date}</b><div class="pair"><span><strong>${m.pillar[0]}</strong><small>${m.stemTenGod}</small></span><span><strong>${m.pillar[1]}</strong><small>${m.branchTenGod}</small></span></div></div>`).join("")}</div></div>`;
      return;
    }
    const card = e.target.closest(".luck-row>div");
    if (!card) return;
    const result = resultFromCurrentForm(), cards = [...card.parentElement.children], cycleIndex = cards.indexOf(card), cycle = result.luckCycles.cycles[cycleIndex];
    selectedCycleIndex = cycleIndex;
    selectedYearIndex = null;
    selectedMonthPillar = null;
    renderExtendedChart(result);
    cards.forEach((x) => x.classList.toggle("active", x === card));
    let detail2 = document.getElementById("annualDetail");
    if (!detail2) {
      detail2 = document.createElement("div");
      detail2.id = "annualDetail";
      detail2.className = "annual-detail";
      document.getElementById("luck").appendChild(detail2);
    }
    detail2.innerHTML = `<h3>${cycle.pillar}\u5927\u8FD0 \xB7 \u6D41\u5E74\uFF0F\u5C0F\u8FD0</h3><p>\u70B9\u51FB\u4EFB\u4E00\u5E74\u67E5\u770B\u6D41\u6708\u3002\u5C0F\u8FD0\u6309\u5F53\u524D\u89C4\u5219\u63A8\u79FB\uFF0C\u72B6\u6001\u5F85\u4EBA\u5DE5\u9A8C\u8BC1\u3002</p><div class="fortune-scroll"><div class="fortune-grid">${cycle.years.map((y, i) => `<button type="button" class="fortune-card annual-card" data-cycle="${cycleIndex}" data-year="${i}"><span class="date">${y.year}</span><b>${y.nominalAge}\u5C81</b><div class="pair"><span><strong>${y.annual.pillar[0]}</strong><small>${y.annual.stemTenGod}</small></span><span><strong>${y.annual.pillar[1]}</strong><small>${y.annual.branchTenGod}</small></span></div><div class="minor"><small>\u5C0F\u8FD0</small><strong>${y.minorLuck.pillar}</strong><small>${y.minorLuck.stemTenGod} \xB7 ${y.minorLuck.branchTenGod}</small></div></button>`).join("")}</div></div>`;
  });
  document.getElementById('luck').addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches('[data-month-pillar]')){e.preventDefault();e.target.click();}});
  var luckObserver = new MutationObserver(() => {
    const row = document.querySelector(".luck-row"), cards = [...document.querySelectorAll(".luck-row>div:not([data-enhanced])")];
    if (!cards.length) return;
    row.style.setProperty("--luck-count", cards.length);
    row.style.setProperty("--luck-min-width", `${cards.length * 74}px`);
    const result = resultFromCurrentForm();
    cards.forEach((card, i) => {
      const x = result.luckCycles.cycles[i];
      if (!x) return;
      card.dataset.enhanced = "1";
      card.innerHTML = `<span class="date">${x.startYear}</span><b>${x.ageStart.toFixed(1)}\u5C81</b><div class="pair"><span><strong class="element-${STEM_BY_NAME[x.pillar[0]].element}">${x.pillar[0]}</strong><small>${x.stemTenGod}</small></span><span><strong class="element-${BRANCH_BY_NAME[x.pillar[1]].element}">${x.pillar[1]}</strong><small>${x.branchTenGod}</small></span></div><small>${x.startYear}\u2013${x.endYear}</small>`;
      card.classList.add("fortune-card");
    });
  });
  luckObserver.observe(document.getElementById("luck"), { childList: true, subtree: true });
  var $ = (id) => document.getElementById(id);
  var esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  var labels = { year: "\u5E74\u67F1", month: "\u6708\u67F1", day: "\u65E5\u67F1", hour: "\u65F6\u67F1" };
  var order = ["year", "month", "day", "hour"];
  var f = (n) => Number(n).toFixed(2);
  function render(r) {
    if(window.renderBaziReading)window.renderBaziReading(r);
    $("timeSummary").innerHTML = `<div><b>\u516C\u5386</b>${esc(r.calendar.gregorian)}</div><div><b>\u519C\u5386</b>${esc(r.calendar.lunar)}</div><div><b>\u6807\u51C6\u65F6\u95F4</b>${esc(r.normalizedTime.civil)} \xB7 UTC${r.normalizedTime.utcOffsetSeconds / 3600 >= 0 ? "+" : ""}${r.normalizedTime.utcOffsetSeconds / 3600}</div><div><b>\u771F\u592A\u9633\u65F6</b>${esc(r.normalizedTime.trueSolarTime)} ${r.options.trueSolarTime ? "\uFF08\u5F53\u524D\u91C7\u7528\uFF09" : "\uFF08\u672A\u91C7\u7528\uFF09"}</div><div><b>\u4FEE\u6B63</b>\u7ECF\u5EA6 ${f(r.normalizedTime.longitudeCorrectionMinutes)} \u5206 + \u5747\u65F6\u5DEE ${f(r.normalizedTime.equationOfTimeMinutes)} \u5206</div>`;
    const row = (n, fn) => `<tr><th>${n}</th>${order.map((k) => `<td>${fn(r.calculatedResult[k], k)}</td>`).join("")}</tr>`;
    $("chart").innerHTML = `<thead><tr><th></th>${order.map((k) => `<th>${labels[k]}</th>`).join("")}</tr></thead><tbody>${row("\u5341\u795E", (p, k) => k === "day" ? "<em>\u65E5\u4E3B</em>" : esc(p.tenGod))}${row("\u5929\u5E72", (p) => `<strong class="stem element-${p.stemAttributes.element}">${p.stem}</strong><small>${p.stemAttributes.polarity}${p.stemAttributes.element}</small>`)}${row("\u5730\u652F", (p) => `<strong class="branch element-${p.branchAttributes.element}">${p.branch}</strong><small>${p.branchAttributes.polarity}${p.branchAttributes.element}</small>`)}${row("\u85CF\u5E72", (p) => p.hiddenStems.map((x) => `<span class="element-${x.element}">${x.stem}</span><small>${x.tenGod}</small>`).join("<br>"))}${row("\u7EB3\u97F3", (p) => esc(p.nayin))}</tbody>`;
    const ours = order.map((k) => r.calculatedResult[k].name).join(" / "), ref = order.map((k) => r.referenceResult.pillars[k]).join(" / ");
    $("compare").innerHTML = `<div><b>\u672C\u9879\u76EE\u7ED3\u679C</b><span>${ours}</span></div><div><b>lunar-javascript \u5BF9\u7167</b><span>${ref}</span></div><p class="${r.differences.length ? "bad" : "good"}">${r.differences.length ? "\u26A0 " + r.differences.map((d) => `${labels[d.pillar]}\uFF1A${d.calculated} \u2260 ${d.reference}`).join("\uFF1B") : "\u2713 \u56DB\u67F1\u4E00\u81F4"}</p>`;
    $("luck").innerHTML = `<p>\u987A\u9006\uFF1A${r.luckCycles.direction === "forward" ? "\u987A\u6392" : "\u9006\u6392"}\u3000\u8D77\u8FD0\u7EA6 ${r.luckCycles.startAgeYears.toFixed(2)} \u5C81\u3000\u8D77\u8FD0\u65E5\u671F ${r.luckCycles.startDate.slice(0, 10)}\u3000<mark>\u5F85\u4EBA\u5DE5\u9A8C\u8BC1</mark></p><div class="luck-row">${r.luckCycles.cycles.map((x) => `<div><strong>${x.pillar}</strong><span>${x.ageStart.toFixed(1)}\u2013${x.ageEnd.toFixed(1)} \u5C81</span><small>${x.startYear}\u2013${x.endYear}</small></div>`).join("")}</div>`;
    $("debug").innerHTML = r.audit.map((x, i) => `<details ${i < 2 ? "open" : ""}><summary>${i + 1}. ${esc(x.stage)}\uFF1A${esc(x.output)}</summary><p><b>\u8F93\u5165\uFF1A</b>${esc(x.input || "\u2014")}</p><p><b>\u89C4\u5219\uFF1A</b>${esc(x.rule)}</p><pre>${esc(JSON.stringify(x.details || {}, null, 2))}</pre></details>`).join("");
  }
  var baziForm = $("form");
  var layout = document.querySelector(".layout");
  var moduleRail = layout.querySelector("aside");
  var workspace = layout.querySelector("section.panel");
  var resultArea = document.createElement("div");
  var archivePane = document.createElement("div");
  var pendingPane = document.createElement("div");
  var saveButton = document.createElement("button");
  var pageHead = document.createElement("header");
  while (workspace.firstChild) resultArea.appendChild(workspace.firstChild);
  baziForm.classList.remove("panel");
  pageHead.className = "work-head";
  pageHead.innerHTML = '<span class="work-seal">\u672F<br>\u6570</span><div><small>\u5929\u5DE5\u9601 \xB7 \u672F\u6570\u6848\u5E93</small><h1 id="moduleTitle">\u516B\u5B57\u6392\u76D8</h1><p id="moduleNote">\u5F55\u5165\u51FA\u751F\u8D44\u6599\uFF0C\u751F\u6210\u53EF\u8FFD\u6EAF\u7684\u56DB\u67F1\u547D\u76D8\u3002</p></div><mark>\u4EBA\u5DE5\u9A8C\u76D8</mark>';
  workspace.append(pageHead, baziForm, resultArea, archivePane, pendingPane);
  resultArea.hidden = true;
  archivePane.hidden = true;
  pendingPane.hidden = true;
  saveButton.type = "button";
  saveButton.textContent = "\u4FDD\u5B58\u5230\u547D\u76D8\u6863\u6848";
  saveButton.className = "save-chart";
  resultArea.append(saveButton);
  moduleRail.innerHTML = '<div class="module-rail"><div class="rail-records"><button data-module="chart" class="active"><b>\u516B\u5B57\u6392\u76D8</b><small>\u8F93\u5165\u8D44\u6599 \xB7 \u751F\u6210\u547D\u76D8</small><i>\u203A</i></button><button data-module="archive"><b>\u547D\u76D8\u6863\u6848</b><small>\u547D\u76D8 \xB7 \u7814\u6790 \xB7 \u590D\u76D8</small><i>\u203A</i></button><button data-module="notes"><b>\u672F\u7406\u624B\u672D</b><small>\u77E5\u8BC6\u70B9 \xB7 \u6D41\u6D3E \xB7 \u6848\u4F8B\u7D22\u5F15</small><i>\u203A</i></button></div></div>';
  var shellStyle = document.createElement("style");
  shellStyle.textContent = ".embedded{overflow:hidden}.embedded .layout{height:100vh;padding:0;gap:0;grid-template-columns:28% minmax(0,72%);background:linear-gradient(90deg,#081713,#10231d 28%,#0a1714 28%)}.embedded .layout>aside{padding:22px 18px;border-right:1px solid var(--line);overflow:auto;background:linear-gradient(90deg,#071511,#10251e,#071511)}.embedded .layout>section.panel{height:100vh;overflow:auto;margin:0;padding:20px 22px 50px;border:0;border-radius:0;background:linear-gradient(145deg,#10231e,#091612 70%);box-shadow:inset 12px 0 28px #0004}.module-rail{display:grid;gap:8px}.rail-kicker{text-align:center;padding:3px 8px 13px;border-bottom:1px solid var(--line);color:var(--gold);font-size:12px;letter-spacing:6px}.rail-note{margin:3px 2px 9px;color:var(--muted);font-size:10px}.module-rail button{position:relative;display:grid;grid-template-columns:24px 1fr 12px;align-items:center;gap:6px;margin:0;padding:11px 8px;text-align:left;background:#0b1815;color:var(--ink);border-color:var(--line);box-shadow:inset 0 0 12px #0003}.module-rail button.active{border-color:var(--gold);background:linear-gradient(90deg,#1a3027,#11231d)}.module-rail button>span{color:var(--gold);font-size:10px}.module-rail button b,.module-rail button small{display:block;grid-column:2}.module-rail button b{font-size:13px}.module-rail button small{color:var(--muted);font-size:8px}.module-rail button i{grid-column:3;grid-row:1/3;color:var(--gold);font-style:normal}.work-head{position:static;display:grid;grid-template-columns:42px 1fr auto;align-items:center;gap:12px;padding:0 0 14px;margin-bottom:14px;border-bottom:1px solid var(--line)}.work-head h1{margin:0;color:var(--ink);font-size:21px}.work-head p,.work-head small{margin:0;color:var(--muted);font-size:10px}.work-seal{display:grid;place-items:center;width:38px;height:38px;border:1px solid var(--red);color:#e8b1a6;font-size:11px;line-height:1.2}.embedded form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 12px}.embedded form button,.embedded form .error,.embedded form details{grid-column:1/-1}.save-chart{width:auto;padding:8px 20px;float:right}.archive-list{display:grid;gap:8px}.archive-card{padding:12px;border:1px solid var(--line);border-radius:5px;background:#071310}.archive-card button{width:auto;margin:8px 0 0}.pending-module{padding:38px;text-align:center;color:var(--muted)}@media(max-width:800px){.embedded{overflow:auto}.embedded .layout{height:auto;grid-template-columns:1fr}.embedded .layout>aside{padding:12px;border-right:0;border-bottom:1px solid var(--line)}.module-rail{grid-template-columns:repeat(2,1fr)}.rail-kicker,.rail-note{grid-column:1/-1}.embedded .layout>section.panel{height:auto;min-height:70vh}.embedded form{grid-template-columns:1fr}}";
  document.head.appendChild(shellStyle);
  var nativeStyle = document.createElement("style");
  nativeStyle.textContent = '.embedded{--ink:#d8cfb6;--muted:#82998f;--jade:#83b6a1;--bronze:#a98a50;--gold:#d8c491;--gold2:#f0dca0;--red:#a94f42;--line:rgba(178,151,88,.28);--soft:rgba(178,151,88,.12);font-family:"Noto Serif SC","Songti SC",serif;font-size:11px;color:var(--ink)}.embedded .layout>aside{padding:24px 20px}.embedded .rail-kicker{padding:0 0 9px;text-align:left;border:0;color:var(--jade);font-size:9px;letter-spacing:4px}.embedded .rail-note{min-height:37px;margin:0;color:var(--muted);font-size:10px;line-height:1.8;letter-spacing:1px}.embedded .module-rail{gap:0;margin-top:0}.embedded .module-rail button{position:relative;display:grid;grid-template-columns:24px 1fr 20px;gap:4px;margin:0;padding:13px 8px 13px 14px;border:0;border-left:2px solid transparent;border-radius:0;background:transparent;box-shadow:none;color:var(--muted);transition:.2s}.embedded .module-rail button:after{content:"";position:absolute;left:0;right:0;bottom:0;height:1px;background:linear-gradient(90deg,var(--line),transparent)}.embedded .module-rail button.active{color:var(--gold2);border-left-color:var(--bronze);background:linear-gradient(90deg,#a98a5012,transparent)}.embedded .module-rail button>span{color:var(--bronze);font-size:9px}.embedded .module-rail button b{color:inherit;font-weight:400;font-size:13px;letter-spacing:2px}.embedded .module-rail button small{margin-top:3px;color:var(--muted);font-size:9px;letter-spacing:1px}.embedded .module-rail button i{right:8px;color:var(--bronze)}.embedded .layout>section.panel{padding:24px 27px 78px 34px}.embedded .work-head{grid-template-columns:48px 1fr auto;gap:14px;padding-bottom:13px;margin-bottom:16px}.embedded .work-seal{width:48px;height:48px;border-radius:7px;color:#d77b66;font-size:11px;transform:rotate(-3deg)}.embedded .work-head h1{margin:0 0 7px;color:var(--gold2);font-weight:400;font-size:19px;letter-spacing:5px}.embedded .work-head p{color:var(--muted);font-size:10px;letter-spacing:2px}.embedded .work-head>div>small{display:none}.embedded .work-head mark{margin-left:auto;border:1px solid var(--line);border-radius:10px;padding:3px 7px;background:transparent;color:var(--bronze);font-size:8px;letter-spacing:2px;white-space:nowrap}.embedded label{margin:8px 0;color:var(--muted);font-size:10px;letter-spacing:1px}.embedded input,.embedded select{padding:8px 9px;border:1px solid var(--soft);border-radius:6px;background:#081611;color:var(--ink);font-family:inherit;font-size:11px}.embedded button{font-family:inherit}.embedded form>button,.embedded .save-chart,.embedded .archive-card button{border:1px solid var(--bronze);border-radius:20px;background:#a98a5014;color:var(--gold2);font-size:11px;letter-spacing:3px}.embedded h2{margin:16px 0 11px;color:var(--gold);font-size:13px;font-weight:400;letter-spacing:4px}.embedded .time-grid div,.embedded .compare div,.embedded .archive-card{border:1px solid var(--soft);border-radius:7px;background:#081611}.embedded table{font-size:10px}.embedded th{color:var(--muted);font-weight:400;letter-spacing:1px}.embedded strong.stem,.embedded strong.branch{font-size:24px;font-weight:400}.embedded details{font-size:10px}.embedded summary{color:var(--gold);letter-spacing:1px}.embedded .fortune-card{font-family:inherit}.embedded .pending-module h2{font-size:19px;color:var(--gold2)}@media(max-width:800px){.embedded .layout>section.panel{padding:18px 16px 92px}.embedded .layout>aside{padding:18px 15px}}';
  document.head.appendChild(nativeStyle);
  var titleStyle = document.createElement("style");
  titleStyle.textContent = ".embedded .module-rail{display:block}.embedded .rail-title{margin:8px 0 5px;color:var(--gold2);font-size:23px;font-weight:400;letter-spacing:8px}.embedded .rail-records{display:grid;gap:0;margin-top:19px}@media(max-width:800px){.embedded .rail-title{font-size:18px}.embedded .rail-records{grid-template-columns:repeat(2,minmax(0,1fr));margin-top:10px}}";
  document.head.appendChild(titleStyle);
  var visibilityStyle = document.createElement("style");
  visibilityStyle.textContent = ".embedded [hidden]{display:none!important}.embedded .edit-chart{width:auto;margin-right:8px;padding:8px 20px;border:1px solid var(--line);border-radius:20px;background:transparent;color:var(--muted);font-family:inherit;font-size:11px;letter-spacing:3px}";
  document.head.appendChild(visibilityStyle);
  var resultStyle = document.createElement("style");
  resultStyle.textContent = ".embedded #compare,.embedded #debug,.embedded h2:has(+ #compare),.embedded h2:has(+ #debug){display:none!important}.embedded .luck-row,.embedded .fortune-scroll{scrollbar-width:none;-ms-overflow-style:none}.embedded .luck-row::-webkit-scrollbar,.embedded .fortune-scroll::-webkit-scrollbar{display:none}.embedded .luck-row{gap:3px}.embedded .luck-row>div,.embedded .fortune-card{min-width:58px;padding:5px 2px}.embedded .fortune-grid{grid-auto-columns:58px;gap:3px}.embedded .layout>section.panel{scrollbar-width:thin;scrollbar-color:rgba(216,196,145,.55) rgba(7,17,15,.35)}.embedded .layout>section.panel::-webkit-scrollbar{width:7px}.embedded .layout>section.panel::-webkit-scrollbar-track{background:rgba(7,17,15,.35)}.embedded .layout>section.panel::-webkit-scrollbar-thumb{border:2px solid transparent;border-radius:8px;background:linear-gradient(#83b6a1,#a98a50);background-clip:padding-box}.embedded .layout>section.panel::-webkit-scrollbar-thumb:hover{background:linear-gradient(#a8d1bf,#d8c491);background-clip:padding-box}";
  document.head.appendChild(resultStyle);
  var archiveStyle = document.createElement("style");
  archiveStyle.textContent = ".embedded .archive-actions{display:flex;gap:7px;flex-wrap:wrap}.embedded .archive-actions .delete-archive{margin-left:auto;border-color:rgba(169,79,66,.55);background:rgba(169,79,66,.08);color:#d78a7d}.embedded .archive-analysis{margin-top:12px;padding-top:12px;border-top:1px solid var(--line)}.embedded .archive-analysis textarea{width:100%;min-height:180px;padding:12px;resize:vertical;border:1px solid var(--soft);border-radius:7px;background:#06120f;color:var(--ink);font:inherit;line-height:1.8}.embedded .archive-analysis button{float:right}.embedded .archive-card>small{margin-top:4px}";
  document.head.appendChild(archiveStyle);
  var catalogueStyle = document.createElement("style");
  catalogueStyle.textContent = ".embedded .rail-records .door-number{display:none}.embedded .rail-records button{display:block;padding:13px 32px 13px 14px}.embedded .rail-records button b{display:block;font-weight:400;font-size:13px;line-height:1.6;letter-spacing:2px}.embedded .rail-records button small{display:block;margin-top:7px;font-size:9px;line-height:1.6;letter-spacing:1px}.embedded .rail-records button i{position:absolute;right:8px;top:18px}";
  document.head.appendChild(catalogueStyle);
  var relationStyle = document.createElement("style");
  relationStyle.textContent = ".embedded .relation-chart{width:auto;margin-right:8px;padding:8px 20px;border:1px solid var(--bronze);border-radius:20px;background:#a98a5014;color:var(--gold2);font-family:inherit;letter-spacing:3px}.embedded .relation-head{display:flex;align-items:center;justify-content:space-between;gap:12px}.embedded .relation-head button{width:auto;margin:0}.embedded .relation-pillars{display:grid;grid-template-columns:repeat(auto-fit,minmax(74px,1fr));gap:5px;margin:16px 0}.embedded .relation-pillar{padding:10px 5px;text-align:center;border:1px solid var(--soft);border-radius:7px;background:#081611}.embedded .relation-pillar strong{display:block;color:var(--gold2);font-size:23px;letter-spacing:5px}.embedded .relation-list{display:grid;gap:8px}.embedded .relation-item{padding:11px 13px;border-left:2px solid var(--bronze);background:#081611}.embedded .relation-item.clash{border-color:#a94f42}.embedded .relation-item.harm{border-color:#9a669e}.embedded .relation-item b{color:var(--gold);font-weight:400;letter-spacing:2px}.embedded .relation-item span,.embedded .relation-item small{display:block;margin-top:4px}.embedded .transit-pillar{background:#a98a5008}";
  document.head.appendChild(relationStyle);
  var elementStyle = document.createElement("style");
  elementStyle.textContent = ".embedded .chart-wrap{overflow:auto;border:1px solid var(--line);border-radius:10px;background:#081611;isolation:isolate}.embedded #chart{table-layout:fixed;margin:-1px;width:calc(100% + 2px)}.embedded #chart th,.embedded #chart td{width:auto}.embedded .element-\u6728{color:#4fa86b!important}.embedded .element-\u706B{color:#d95755!important}.embedded .element-\u571F{color:#b88a55!important}.embedded .element-\u91D1{color:#d8c982!important}.embedded .element-\u6C34{color:#5d8fd0!important}";
  document.head.appendChild(elementStyle);
  var narrowRailStyle = document.createElement("style");
  narrowRailStyle.textContent = "@media(min-width:801px){.embedded .layout{grid-template-columns:minmax(180px,23%) minmax(0,1fr);background:linear-gradient(90deg,#081713,#10231d 23%,#0a1714 23%)}.embedded .layout>aside{padding-left:16px;padding-right:16px}}";
  document.head.appendChild(narrowRailStyle);
  var responsiveFortuneStyle = document.createElement("style");
  responsiveFortuneStyle.textContent = ".embedded .luck-row{display:grid;grid-template-columns:repeat(var(--luck-count,8),minmax(74px,1fr));width:100%;min-width:min(100%,var(--luck-min-width,592px));overflow-x:auto}.embedded .luck-row .pair{min-width:0;margin-top:4px;padding:0;border:0;border-radius:0;background:transparent}.embedded .fortune-grid{width:100%;min-width:100%;grid-auto-columns:minmax(58px,1fr)}@media(max-width:1050px){.embedded .fortune-grid{min-width:max-content}}";
  document.head.appendChild(responsiveFortuneStyle);
  var activeResult = null;
  var activeInputSignature = null;
  var selectedCycleIndex = null;
  var selectedYearIndex = null;
  var selectedMonthPillar = null;
  var currentRelationColumns = [];
  function dynamicPillar(name, title, tenGod) {
    const stem = name[0], branch = name[1], hidden = Object.entries(getHiddenStems(branch)).filter(([, v]) => v).map(([role, s]) => ({ role, stem: s, tenGod: getTenGod(activeResult.calculatedResult.day.stem, s), element: STEM_BY_NAME[s].element }));
    return { title, name, stem, branch, tenGod: tenGod || getTenGod(activeResult.calculatedResult.day.stem, stem), stemAttributes: STEM_BY_NAME[stem], branchAttributes: BRANCH_BY_NAME[branch], hiddenStems: hidden, nayin: getSexagenary(name).nayin };
  }
  function renderExtendedChart(r) {
    const chart = $("chart");
    if (!chart) return;
    chart.querySelectorAll(".transit-pillar").forEach((x) => x.remove());
    const extras = [], cycle = selectedCycleIndex === null ? null : r.luckCycles.cycles[selectedCycleIndex];
    if (cycle) {
      extras.push(dynamicPillar(cycle.pillar, "\u5927\u8FD0", cycle.stemTenGod));
      if (selectedYearIndex !== null) {
        const year = cycle.years[selectedYearIndex];
        extras.push(dynamicPillar(year.annual.pillar, `\u6D41\u5E74 ${year.year}`, year.annual.stemTenGod));
      }
    }
    currentRelationColumns = [...order.map((k) => ({ ...r.calculatedResult[k], title: labels[k] })), ...extras];
    if(window.renderBaziPlate){
      if(selectedMonthPillar)currentRelationColumns.push(dynamicPillar(selectedMonthPillar,'流月'));
      window.renderBaziPlate(r,currentRelationColumns,import_lunar_javascript.default.LunarUtil);
      return;
    }
    extras.forEach((p) => {
      chart.tHead.rows[0].insertAdjacentHTML("beforeend", `<th class="transit-pillar">${esc(p.title)}</th>`);
      const cells = [esc(p.tenGod), `<strong class="stem element-${p.stemAttributes.element}">${p.stem}</strong><small>${p.stemAttributes.polarity}${p.stemAttributes.element}</small>`, `<strong class="branch element-${p.branchAttributes.element}">${p.branch}</strong><small>${p.branchAttributes.polarity}${p.branchAttributes.element}</small>`, p.hiddenStems.map((x) => `<span class="element-${x.element}">${x.stem}</span><small>${x.tenGod}</small>`).join("<br>"), esc(p.nayin)];
      [...chart.tBodies[0].rows].forEach((row, i) => row.insertAdjacentHTML("beforeend", `<td class="transit-pillar">${cells[i]}</td>`));
    });
  }
  function inputSnapshot() {
    const d = new FormData(baziForm);
    return { gender: d.get("gender"), date: d.get("date"), time: d.get("time"), place: d.get("place"), timezoneId: d.get("timezoneId"), longitude: +d.get("longitude"), latitude: +d.get("latitude"), trueSolarTime: d.get("trueSolarTime") === "on", dayBoundaryRule: d.get("dayBoundaryRule") };
  }
  function submit(e) {
    e?.preventDefault();
    $("error").textContent = "";
    try {
      activeResult = calculateBazi(inputSnapshot());
      activeInputSignature=JSON.stringify(inputSnapshot());
      selectedCycleIndex = null;
      selectedYearIndex = null;
    selectedMonthPillar = null;
      render(activeResult);
      renderExtendedChart(activeResult);
      baziForm.hidden = true;
      resultArea.hidden = false;
    } catch (err) {
      $("error").textContent = err.message;
    }
  }
  function archives() {
    try {
      return JSON.parse(localStorage.getItem("tiangong_bazi_archives_v1") || "[]");
    } catch {
      return [];
    }
  }
  function renderArchive() {
    const list = archives();
    archivePane.innerHTML = '<h2>\u547D\u76D8\u6863\u6848</h2><p>\u6BCF\u4EFD\u6863\u6848\u5305\u542B\u547D\u76D8\u4E0E\u4E2A\u6848\u7814\u6790\uFF0C\u4FDD\u5B58\u5728\u5F53\u524D\u6D4F\u89C8\u5668\u4E2D\u3002</p><div class="archive-list">' + (list.length ? list.map((item, i) => `<article class="archive-card"><b>${esc(item.input.place)} \xB7 ${esc(item.input.date)} ${esc(item.input.time)}</b><small>${item.input.gender === "male" ? "\u7537" : "\u5973"}\u3000${esc(item.summary)}</small><div class="archive-actions"><button type="button" data-open-archive="${i}">\u6253\u5F00\u547D\u76D8</button><button type="button" data-analyse-archive="${i}">\u7814\u6790\u8BB0\u5F55</button><button type="button" class="delete-archive" data-delete-archive="${i}">\u5220\u9664\u6863\u6848</button></div></article>`).join("") : '<div class="pending-module">\u5C1A\u672A\u4FDD\u5B58\u547D\u76D8</div>') + "</div>";
  }
  function showModule(key) {
    const meta = { chart: ["\u516B\u5B57\u6392\u76D8", "\u5F55\u5165\u51FA\u751F\u8D44\u6599\uFF0C\u751F\u6210\u53EF\u8FFD\u6EAF\u7684\u56DB\u67F1\u547D\u76D8\u3002"], archive: ["\u547D\u76D8\u6863\u6848", "\u6536\u85CF\u547D\u76D8\uFF0C\u5E76\u5728\u6863\u6848\u5185\u6301\u7EED\u7814\u6790\u4E0E\u590D\u76D8\u3002"], notes: ["\u672F\u7406\u624B\u672D", "\u6574\u7406\u53EF\u8DE8\u547D\u76D8\u590D\u7528\u7684\u77E5\u8BC6\u70B9\u3001\u6D41\u6D3E\u5DEE\u5F02\u4E0E\u6848\u4F8B\u7D22\u5F15\u3002"] }[key];
    document.getElementById("moduleTitle").textContent = meta[0];
    document.getElementById("moduleNote").textContent = meta[1];
    moduleRail.querySelectorAll("[data-module]").forEach((x) => x.classList.toggle("active", x.dataset.module === key));
    baziForm.hidden = key !== "chart" || !!activeResult;
    resultArea.hidden = key !== "chart" || !activeResult;
    archivePane.hidden = key !== "archive";
    pendingPane.hidden = key !== "notes";
    if (key === "archive") renderArchive();
    if (key === "notes") pendingPane.innerHTML = '<div class="pending-module"><h2>\u672F\u7406\u624B\u672D</h2><p>\u7528\u4E8E\u6574\u7406\u5341\u795E\u3001\u683C\u5C40\u3001\u6D41\u6D3E\u89C2\u70B9\u53CA\u5173\u8054\u547D\u4F8B\uFF0C\u5F85\u5F00\u53D1\u3002</p></div>';
  }
  moduleRail.addEventListener("click", (e) => {
    const b = e.target.closest("[data-module]");
    if (b) showModule(b.dataset.module);
  });
  archivePane.addEventListener("click", (e) => {
    const deleteButton = e.target.closest("[data-delete-archive]");
    if (deleteButton) {
      const index = +deleteButton.dataset.deleteArchive, list = archives(), item2 = list[index];
      if (!item2) return;
      if (!confirm(`\u786E\u5B9A\u5220\u9664 ${item2.input.place} \xB7 ${item2.input.date} \u7684\u547D\u76D8\u6863\u6848\u5417\uFF1F
\u8BE5\u6863\u6848\u4E2D\u7684\u7814\u6790\u8BB0\u5F55\u4E5F\u4F1A\u4E00\u5E76\u5220\u9664\u3002`)) return;
      list.splice(index, 1);
      localStorage.setItem("tiangong_bazi_archives_v1", JSON.stringify(list));
      renderArchive();
      return;
    }
    const analysisButton = e.target.closest("[data-analyse-archive]");
    if (analysisButton) {
      const index = +analysisButton.dataset.analyseArchive, item2 = archives()[index], card = analysisButton.closest(".archive-card");
      if (!item2 || !card) return;
      document.querySelectorAll(".archive-analysis").forEach((x) => x.remove());
      card.insertAdjacentHTML("beforeend", `<div class="archive-analysis"><h2>\u547D\u4F8B\u7814\u6790</h2><p>${esc(item2.input.place)} \xB7 ${esc(item2.input.date)}\u3000${esc(item2.summary)}</p><textarea data-analysis-text="${index}" placeholder="\u8BB0\u5F55\u539F\u5C40\u5224\u65AD\u3001\u5927\u8FD0\u6D41\u5E74\u3001\u5DF2\u53D1\u751F\u4E8B\u4EF6\u3001\u5F85\u9A8C\u8BC1\u89C2\u70B9\u53CA\u590D\u76D8\u2026\u2026">${esc(item2.analysis || "")}</textarea><button type="button" data-save-analysis="${index}">\u4FDD\u5B58\u7814\u6790</button></div>`);
      return;
    }
    const saveAnalysis = e.target.closest("[data-save-analysis]");
    if (saveAnalysis) {
      const index = +saveAnalysis.dataset.saveAnalysis, list = archives(), textarea = archivePane.querySelector(`[data-analysis-text="${index}"]`);
      if (!list[index] || !textarea) return;
      list[index].analysis = textarea.value;
      list[index].analysisUpdatedAt = (/* @__PURE__ */ new Date()).toISOString();
      localStorage.setItem("tiangong_bazi_archives_v1", JSON.stringify(list));
      saveAnalysis.textContent = "\u5DF2\u4FDD\u5B58";
      setTimeout(() => saveAnalysis.textContent = "\u4FDD\u5B58\u7814\u6790", 1200);
      return;
    }
    const b = e.target.closest("[data-open-archive]");
    if (!b) return;
    const item = archives()[+b.dataset.openArchive];
    if (!item) return;
    for (const [name, value] of Object.entries(item.input)) {
      const field = baziForm.querySelector(`[name="${name}"]`);
      if (!field) continue;
      if (field.type === "checkbox") field.checked = !!value;
      else field.value = value;
    }
    window.dispatchEvent(new Event("magiccat-place-restored"));
    showModule("chart");
    submit();
  });
  saveButton.addEventListener("click", () => {
    if (!activeResult) return;
    const list = archives(), input = inputSnapshot(), summary = ["year", "month", "day", "hour"].map((k) => activeResult.calculatedResult[k].name).join(" / ");
    list.unshift({ savedAt: (/* @__PURE__ */ new Date()).toISOString(), input, summary });
    localStorage.setItem("tiangong_bazi_archives_v1", JSON.stringify(list));
    saveButton.textContent = "\u5DF2\u4FDD\u5B58\u5230\u547D\u76D8\u6863\u6848";
    setTimeout(() => saveButton.textContent = "\u4FDD\u5B58\u5230\u547D\u76D8\u6863\u6848", 1600);
  });
  baziForm.addEventListener("submit", submit);
  baziForm.addEventListener("change", (e) => {
    if (activeResult && ["trueSolarTime", "dayBoundaryRule"].includes(e.target.name)) submit();
  });
  showModule("chart");

// UI integration only: keep calculation and rule modules unchanged.
window.magicLoreBazi={restore(input){
  if(!input)throw Error('缺少出生资料');
  for(const [name,value] of Object.entries(input)){const field=baziForm.elements.namedItem(name);if(!field)continue;if(field.type==='checkbox')field.checked=!!value;else field.value=value;}
  window.dispatchEvent(new Event('magiccat-place-restored'));
  showModule('chart');submit();
},getInput:inputSnapshot,getResult:()=>activeResult};
