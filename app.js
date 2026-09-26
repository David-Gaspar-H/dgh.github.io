(() => {
  const ROOT = document.documentElement.dataset.root || "";
  const PAGE = document.documentElement.dataset.page || "home";
  const LOCAL = location.protocol === "file:";          // opened by double-clicking, no server
  const dirLink = p => LOCAL ? p + "index.html" : p;     // "drawings/" → "drawings/index.html" locally

  const MONTHS = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];
  const fmt = d => { const [y, m, dd] = d.split("-").map(Number); return `${MONTHS[m - 1]} ${dd}, ${y}`; };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const pad = n => String(n).padStart(3, "0");
  const $ = s => document.querySelector(s);

  const drawerInfo = {};
  CABINETS.forEach(c => c.drawers.forEach(d => (drawerInfo[d.id] = { ...d, cabinet: c.name })));
  const entriesFor = id => ENTRIES.filter(e => e.drawer === id);

  document.title = SITE_TITLE;

  /* =============================== HOME =============================== */
  if (PAGE === "home") {
    $("#site").textContent = SITE_TITLE;
    $("#cabinets").innerHTML = CABINETS.map(c => `
      <section class="cabinet">
        <h2>${esc(c.name)}</h2>
        <div class="lid"></div>
        <div class="body">
          ${c.drawers.map(d => {
            const n = entriesFor(d.id).length;
            return `<a class="drawer" href="${dirLink(ROOT + d.id + "/")}" aria-label="${esc(d.label)}, ${n} files">
              <span class="plate">${esc(d.label)}</span><span class="handle"></span>
              <span class="count">${n || ""}</span></a>`;
          }).join("")}
        </div>
        <div class="feet"><i></i><i></i></div>
      </section>`).join("");
    return;
  }

  /* ============================ DRAWER PAGE ============================ */
  const segs = location.pathname.split("/").filter(Boolean);
  if (segs[segs.length - 1] === "index.html") segs.pop();
  const id = decodeURIComponent(segs[segs.length - 1] || "");
  const info = drawerInfo[id] || { id, label: id, cabinet: "" };

  // newest at the top (back) of the drawer; numbers count up from the oldest
  const list = entriesFor(id).slice().sort((a, b) => b.date.localeCompare(a.date))
    .map((e, j, arr) => ({ ...e, num: arr.length - j }));
  if (!list.length) list.push({ title: "empty", date: "", num: 0, empty: true,
    text: `<p>Nothing in this drawer yet. Add an entry with <em>drawer: "${esc(id)}"</em> in content.js.</p>` });

  $("#site").textContent = SITE_TITLE;
  $("#site").href = dirLink(ROOT);
  $("#crumb").innerHTML = `${esc(info.cabinet)} / <b>${esc(info.label)}</b>`;
  $("#meta").textContent = list[0].empty ? "0 files" : `${list.length} file${list.length > 1 ? "s" : ""}`;
  document.title = `${info.label} / ${SITE_TITLE}`;

  const TAB = 28, GAP = 19, FRONT = 64;
  const stage = $("#stage");

  // stack order, back to front: a month divider card, then that month's files
  const groups = {};
  list.forEach(e => { if (e.date) { const g = e.date.slice(0, 7); groups[g] = (groups[g] || 0) + 1; } });
  const items = [];
  let lastGroup = null, k = 0;
  list.forEach(e => {
    const g = e.date ? e.date.slice(0, 7) : null;
    if (g && g !== lastGroup) {
      const [y, m] = g.split("-").map(Number);
      items.push({ divider: true, label: `${MONTHS[m - 1]} ${String(y).slice(2)}`, count: groups[g] });
    }
    lastGroup = g;
    items.push({ ...e, col: k++ % 2 });
  });
  const entryIdx = items.map((it, i) => it.divider ? -1 : i).filter(i => i >= 0);

  const folders = items.map((e, j) => {
    const el = document.createElement("div");
    el.className = "folder" + (e.divider ? " divider" : "");
    el.style.zIndex = j + 1;
    el.innerHTML = e.divider
      ? `<svg aria-hidden="true"><path class="outline"/><path class="divtab"/></svg>
         <div class="dlabel"><span>${esc(e.label)}</span><span>${pad(e.count)}</span></div>`
      : `<svg aria-hidden="true"><path class="outline"/></svg>
         <button class="tab" aria-label="${esc(e.title)}${e.date ? ", " + fmt(e.date) : ""}">
           <span class="num">${e.empty ? "000" : pad(e.num)}</span><span class="name">${esc(e.title)}</span></button>
         <div class="face"></div>`;
    if (!e.divider) el.querySelector(".tab").addEventListener("click", () => select(j));
    stage.appendChild(el);
    return el;
  });

  const front = document.createElement("div");
  front.className = "front";
  front.innerHTML = `<span class="plate">${esc(info.label)}</span>`;
  stage.appendChild(front);

  const frameH = () => Math.round(Math.max(320, Math.min(540, innerHeight * 0.6)));

  function tabPath(x, w, s) {
    return `M${x},${TAB} L${x + s},3 Q${x + s + 1.5},0 ${x + s + 5},0 L${x + w - s - 5},0 Q${x + w - s - 1.5},0 ${x + w - s},3 L${x + w},${TAB}`;
  }

  let sel = 0;
  function layout() {
    const W = stage.clientWidth, n = items.length, FH = frameH();
    const F = (n - 1) * GAP + FH + 12;
    const H = F + FRONT;
    stage.style.height = H + "px";
    front.style.top = F + "px";
    const narrow = W < 540;
    const step = Math.min(3, 40 / n);

    folders.forEach((el, j) => {
      const e = items[j];
      const w = Math.round(W - 24 - (n - 1 - j) * step);
      const x = Math.round((W - w) / 2);
      const y = j <= sel ? j * GAP : sel * GAP + FH + (j - sel - 1) * GAP;
      el.style.left = x + "px";
      el.style.width = w + "px";
      el.style.height = H + "px";
      el.style.setProperty("--fy", y + "px");

      // file tabs alternate between two columns; month dividers sit on the far left
      const r = 9, s = 9;
      const colA = narrow ? [0.25, 0.37] : [0.29, 0.34];
      const colB = narrow ? [0.62, 0.36] : [0.64, 0.34];
      const [cl, cw] = e.divider ? (narrow ? [0.02, 0.21] : [0.03, 0.2]) : (e.col ? colB : colA);
      const tx = Math.round(w * cl), tw = Math.round(w * cw);
      const svg = el.querySelector("svg");
      svg.setAttribute("width", w); svg.setAttribute("height", H);
      el.querySelector(".outline").setAttribute("d",
        `M0,${H + 2} L0,${TAB + r} Q0,${TAB} ${r},${TAB} L${tx},${TAB} ` +
        tabPath(tx, tw, s).replace(/^M[^L]+/, "") +
        ` L${w - r},${TAB} Q${w},${TAB} ${w},${TAB + r} L${w},${H + 2}`);
      if (e.divider) {
        el.querySelector(".divtab").setAttribute("d", tabPath(tx, tw, s) + " Z");
        const dl = el.querySelector(".dlabel");
        dl.style.left = tx + "px"; dl.style.width = tw + "px";
        return;
      }
      const tab = el.querySelector(".tab");
      tab.style.left = tx + "px"; tab.style.width = tw + "px";
      const face = el.querySelector(".face");
      face.style.height = (FH - TAB) + "px";
    });
  }

  /* ---------- the frame: things brought in and out ---------- */
  const isVideo = m => /\.(mp4|webm|mov)(\?|$)/i.test(m);
  const src = m => /^(https?:)?\/\//.test(m) || m.startsWith("/") ? m : ROOT + m;

  function faceHTML(e) {
    if (!e.media) {
      return `
        <div class="head"><div class="title">${esc(e.title)}</div>${e.date ? `<div class="sub">${fmt(e.date)}</div>` : ""}</div>
        <div class="media render"><div class="text">${e.text || ""}</div></div>`;
    }
    const m = isVideo(e.media)
      ? `<video src="${esc(src(e.media))}" autoplay muted loop playsinline></video>`
      : `<img src="${esc(src(e.media))}" alt="${esc(e.title)}">`;
    return `
      <div class="head"><div class="title">${esc(e.title)}</div><button class="sub details" aria-expanded="false">details</button></div>
      <div class="media render">${m}</div>
      <div class="panel" hidden><div class="date">${e.date ? fmt(e.date) : ""}</div>${e.text || ""}</div>`;
  }

  function bringIn(j, delay) {
    const face = folders[j].querySelector(".face");
    face.innerHTML = faceHTML(items[j]);
    const r = face.querySelector(".render");
    const btn = face.querySelector(".details");
    if (btn) btn.addEventListener("click", () => {
      const p = face.querySelector(".panel");
      p.hidden = !p.hidden;
      btn.setAttribute("aria-expanded", String(!p.hidden));
      btn.textContent = p.hidden ? "details" : "close details";
    });
    setTimeout(() => requestAnimationFrame(() => r && r.classList.add("in")), delay);
  }

  function takeOut(j) {
    const face = folders[j].querySelector(".face");
    const r = face.querySelector(".render");
    if (r) { r.classList.remove("in"); r.classList.add("out"); }
    const p = face.querySelector(".panel"); if (p) p.hidden = true;
    const stamp = face.dataset.stamp = String(Date.now());
    setTimeout(() => { if (face.dataset.stamp === stamp && j !== sel) face.innerHTML = ""; }, 420);
  }

  function select(j, first) {
    if (!items[j] || items[j].divider) return;
    if (j === sel && !first) return;
    const prev = sel;
    if (!first) takeOut(prev);
    folders[prev].classList.remove("sel");
    sel = j;
    folders[j].classList.add("sel");
    layout();
    bringIn(j, first ? 80 : 380);
    if (!items[j].empty) history.replaceState(null, "", "#" + pad(items[j].num));

    // keep the frame in view
    const top = stage.getBoundingClientRect().top + scrollY + j * GAP - 70;
    if (!first && (top < scrollY || top + frameH() > scrollY + innerHeight)) scrollTo({ top, behavior: "smooth" });
  }

  const step = d => {
    const at = entryIdx.indexOf(sel), next = entryIdx[at + d];
    if (next === undefined) return;
    select(next); folders[sel].querySelector(".tab").focus({ preventScroll: true });
  };
  addEventListener("keydown", e => {
    if (e.target.closest("input, textarea")) return;
    if (e.key === "ArrowDown") { e.preventDefault(); step(1); }
    if (e.key === "ArrowUp")   { e.preventDefault(); step(-1); }
  });
  let rt; addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(layout, 60); });

  // yoursite.com/drawings/#004 opens file 004
  const want = parseInt(location.hash.slice(1), 10);
  const hit = items.findIndex(e => !e.divider && e.num === want);
  const start = hit >= 0 ? hit : entryIdx[0];
  sel = start;
  folders[start].classList.add("sel");
  layout();
  select(start, true);
  if (start > entryIdx[0]) scrollTo({ top: stage.getBoundingClientRect().top + scrollY + start * GAP - 70 });
})();
