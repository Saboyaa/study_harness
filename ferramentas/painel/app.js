"use strict";
/* Painel do study_harness: só leitura. Rotas no hash:
   #/                         tópicos
   #/t/<slug>                 visão geral (TOPICO.md)
   #/t/<slug>/mapa            mapa.md com Mermaid; nós clicáveis abrem a lição
   #/t/<slug>/grafo?n=<id>    grafo de proposições e cadeias
   #/t/<slug>/doc/<arquivo>?a=<âncora>   lição, sessão, sondagem…
   #/t/<slug>/fontes          fontes registradas
   #/terminal                 claude no terminal web enjaulado (ferramentas/servidor/)
   A cada 2,5 s pergunta /api/versao e redesenha a tela se algo mudou. */

const $ = (s, el = document) => el.querySelector(s);
const view = $("#view");
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const h = (html) => { const t = document.createElement("template"); t.innerHTML = html.trim(); return t.content.firstElementChild; };
const enc = (p) => p.split("/").map(encodeURIComponent).join("/");

async function api(p) {
  const r = await fetch("/api/" + p, { cache: "no-store" });
  if (!r.ok) throw new Error(`${r.status} em /api/${p}`);
  return (r.headers.get("content-type") || "").includes("json") ? r.json() : r.text();
}
const fileUrl = (slug, path) => `/api/arquivo/${encodeURIComponent(slug)}/${enc(path)}`;
const docHref = (slug, path, a) => `#/t/${encodeURIComponent(slug)}/doc/${enc(path)}${a ? "?a=" + encodeURIComponent(a) : ""}`;
const state = { topicos: [], ver: null };
let current = null; // tela ativa com ciclo de vida próprio (o grafo)
let renderToken = 0;

/* ─── Markdown + LaTeX + Mermaid ─────────────────────────────────── */

function tex(s, display) {
  try { return katex.renderToString(s, { displayMode: display, throwOnError: false, output: "html" }); }
  catch { return `<code>${esc(s)}</code>`; }
}
marked.use({
  gfm: true,
  extensions: [
    {
      name: "mathBlock", level: "block",
      start(src) { const i = src.indexOf("$$"); return i < 0 ? undefined : i; },
      tokenizer(src) {
        const m = /^ {0,3}\$\$([\s\S]+?)\$\$[ \t]*(?:\n+|$)/.exec(src);
        if (m) return { type: "mathBlock", raw: m[0], text: m[1].trim() };
      },
      renderer(t) { return tex(t.text, true); },
    },
    {
      name: "mathInline", level: "inline",
      start(src) { const i = src.indexOf("$"); return i < 0 ? undefined : i; },
      tokenizer(src) {
        let m = /^\$\$([\s\S]+?)\$\$/.exec(src);
        if (m) return { type: "mathInline", raw: m[0], text: m[1].trim(), display: true };
        m = /^\$((?:\\[\s\S]|[^\\$\n])+?)\$/.exec(src);
        if (m && !/^\s|\s$/.test(m[1])) return { type: "mathInline", raw: m[0], text: m[1], display: false };
      },
      renderer(t) { return tex(t.text, t.display); },
    },
  ],
  renderer: {
    code(code, lang) {
      if ((lang || "").trim() === "mermaid") return `<div class="mermaid" data-src="${encodeURIComponent(code)}"></div>`;
      return false;
    },
  },
});
const md = (s) => DOMPurify.sanitize(marked.parse(s || ""), { ADD_ATTR: ["target"] });
const mdInline = (s) => DOMPurify.sanitize(marked.parseInline(s || ""));

mermaid.initialize({
  startOnLoad: false,
  theme: "base",
  fontFamily: "Source Sans 3, sans-serif",
  flowchart: { curve: "basis", htmlLabels: true, padding: 12 },
  themeVariables: {
    darkMode: true, background: "#1c1c1c", fontSize: "15px",
    primaryColor: "#242424", primaryTextColor: "#e6e6e6", primaryBorderColor: "#5a5a5a",
    lineColor: "#6b6b6b", secondaryColor: "#242424", tertiaryColor: "#1c1c1c",
    edgeLabelBackground: "#1c1c1c", clusterBkg: "#1c1c1c", clusterBorder: "#434343",
  },
});
// As classes do mapa (/planejar) têm cores claras; aqui viram tons escuros equivalentes.
const MAPA_CLASSES = {
  visto: "fill:#1d3024,stroke:#5fae6e,color:#e6e6e6",
  atual: "fill:#3a3214,stroke:#e0b84a,stroke-width:3px,color:#ffffff",
  reparo: "fill:#3a1d20,stroke:#e06c75,color:#e6e6e6",
  jasabe: "fill:#1a1a1a,stroke:#6b6b6b,stroke-dasharray:4,color:#8d8d8d",
};
let mmCount = 0;
async function renderMermaid(root) {
  for (const el of root.querySelectorAll(".mermaid[data-src]")) {
    const src = decodeURIComponent(el.dataset.src).replace(/^(\s*classDef\s+(\w+))\s+.*$/gm,
      (m, head, name) => (MAPA_CLASSES[name] ? `${head} ${MAPA_CLASSES[name]}` : m));
    const id = "mm" + ++mmCount;
    try {
      el.innerHTML = (await mermaid.render(id, src)).svg;
    } catch (e) {
      document.getElementById("d" + id)?.remove();
      el.innerHTML = `<div class="err">Mermaid: ${esc(e.message || e)}</div><pre><code>${esc(src)}</code></pre>`;
    }
    el.removeAttribute("data-src");
  }
}

const CITE = /\(fonte:[^)]*\)|\[derivado\]|\[sem fonte[^\]]*\]/g;
function citeChips(root) {
  const alvos = [];
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  while (w.nextNode()) {
    const n = w.currentNode;
    if (n.parentElement.closest("code,pre,.katex,.mermaid,.cite")) continue;
    if (n.data.match(CITE)) alvos.push(n);
  }
  for (const n of alvos) {
    const frag = document.createDocumentFragment();
    let last = 0;
    for (const m of n.data.matchAll(CITE)) {
      frag.append(n.data.slice(last, m.index));
      const s = document.createElement("span");
      const t = m[0];
      s.className = "cite " + (t.startsWith("(fonte") ? "fonte" : t === "[derivado]" ? "derivado" : "semfonte");
      const c = /(\d+)\s*%/.exec(t);
      if (s.classList.contains("semfonte") && c && +c[1] < 70) s.classList.add("baixa");
      s.textContent = t.startsWith("(") ? t.slice(1, -1) : t.slice(1, -1);
      frag.append(s);
      last = m.index + t.length;
    }
    frag.append(n.data.slice(last));
    n.replaceWith(frag);
  }
}

function normPath(base, rel) {
  const out = base ? base.split("/").slice(0, -1) : [];
  for (const p of rel.split("/")) {
    if (p === "..") out.pop();
    else if (p && p !== ".") out.push(p);
  }
  return out.join("/");
}

// Callouts, citações, links internos, caminhos em `código` viram links, Mermaid.
async function enhance(root, slug, docPath = "") {
  for (const bq of root.querySelectorAll("blockquote")) {
    const p = bq.firstElementChild;
    const m = p && /^\[!(\w+)\]\s*/.exec(p.innerHTML);
    if (!m) continue;
    const tipo = m[1].toLowerCase();
    p.innerHTML = p.innerHTML.slice(m[0].length);
    if (!p.textContent.trim() && !p.querySelector(".katex")) p.remove();
    bq.classList.add("callout", tipo);
    bq.prepend(h(`<div class="callout-h">${esc(m[1])}</div>`));
  }
  citeChips(root);
  const t = state.topicos.find((x) => x.slug === slug);
  const existe = new Set(t ? Object.values(t.arquivos).flat().concat(["TOPICO.md", "mapa.md", t.sondagem ? "sondagem.md" : ""]) : []);
  for (const c of root.querySelectorAll("code")) {
    if (c.closest("pre,a")) continue;
    const m = /^([\w./-]+\.md)(#[\w-]+)?$/.exec(c.textContent.trim());
    if (!m) continue;
    const p = normPath(docPath, m[1]);
    if (!existe.has(p) && !existe.has(m[1])) continue;
    const a = document.createElement("a");
    a.href = docHref(slug, existe.has(p) ? p : m[1], m[2]?.slice(1));
    c.replaceWith(a);
    a.append(c);
  }
  // Referências em texto corrido: licoes/01-x.md#m-01-2, sessoes/…md#p3.
  const REF = /\b((?:licoes|sessoes)\/[\w.-]+\.md)(?:#([\w-]+))?/g;
  const textos = [];
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  while (w.nextNode()) {
    const n = w.currentNode;
    if (!n.parentElement.closest("a,code,pre,.katex,.mermaid") && n.data.match(REF)) textos.push(n);
  }
  for (const n of textos) {
    const frag = document.createDocumentFragment();
    let last = 0;
    for (const m of n.data.matchAll(REF)) {
      if (!existe.has(m[1])) continue;
      frag.append(n.data.slice(last, m.index));
      const a = document.createElement("a");
      a.href = docHref(slug, m[1], m[2]);
      a.textContent = m[0];
      frag.append(a);
      last = m.index + m[0].length;
    }
    frag.append(n.data.slice(last));
    n.replaceWith(frag);
  }
  for (const a of root.querySelectorAll("a[href]")) {
    const href = a.getAttribute("href");
    if (/^[a-z]+:|^\/\//i.test(href)) { a.target = "_blank"; a.rel = "noopener"; continue; }
    if (href.startsWith("#/")) continue;
    if (href.startsWith("#")) {
      a.addEventListener("click", (e) => { e.preventDefault(); flashAnchor(root, decodeURIComponent(href.slice(1))); });
      continue;
    }
    const [p, anc] = href.split("#");
    const full = normPath(docPath, decodeURIComponent(p));
    if (/\.md$/i.test(full)) a.href = docHref(slug, full, anc);
    else { a.href = fileUrl(slug, full) + (anc ? "#" + anc : ""); a.target = "_blank"; }
  }
  await renderMermaid(root);
}

function flashAnchor(root, id) {
  const el = root.querySelector(`[id="${CSS.escape(id)}"]`);
  if (!el) return;
  const alvo = el.textContent.trim() ? el : el.closest("h1,h2,h3,h4,p,li,tr") || el.parentElement;
  alvo.scrollIntoView({ block: "start" });
  alvo.classList.remove("anchor-hit");
  void alvo.offsetWidth;
  alvo.classList.add("anchor-hit");
}

/* ─── Rotas e navegação ──────────────────────────────────────────── */

function parseRoute() {
  const [path, qs] = (location.hash.slice(1) || "/").split("?");
  const p = path.split("/").filter(Boolean).map(decodeURIComponent);
  const q = new URLSearchParams(qs || "");
  if (p[0] === "terminal") return { view: "terminal", q };
  if (p[0] !== "t" || !p[1]) return { view: "home", q };
  if (p[2] === "doc") return { view: "doc", slug: p[1], file: p.slice(3).join("/"), q };
  return { view: p[2] || "topico", slug: p[1], q };
}

const lessonLabel = (f) => f.replace(/^licoes\//, "").replace(/\.md$/, "").replace(/^(\d+)-/, "$1 · ");
const sessionLabel = (f) => f.replace(/^sessoes\//, "").replace(/\.md$/, "").replace(/^(\d{4}-\d{2}-\d{2})-/, "$1 · ");
const isMd = (f) => f.endsWith(".md");

function renderNav(r) {
  const nav = $("#nav");
  const ativo = (cond) => (cond ? " on" : "");
  let html = `<a class="nav-i${ativo(r.view === "terminal")}" href="#/terminal">⌨ Terminal</a><div class="nav-h">Tópicos</div>`;
  if (!state.topicos.length) html += `<div class="nav-i">nenhum ainda</div>`;
  for (const t of state.topicos) {
    const aberto = t.slug === r.slug;
    html += `<a class="nav-i topic${ativo(aberto && r.view === "topico")}" href="#/t/${encodeURIComponent(t.slug)}">${esc(t.titulo)}<span class="n">${esc(t.fase)}</span></a>`;
    if (!aberto) continue;
    const base = `#/t/${encodeURIComponent(t.slug)}`;
    const lic = t.arquivos.licoes.filter(isMd);
    const ses = t.arquivos.sessoes.filter(isMd).reverse();
    html += `<div class="nav-sub">
      <a class="nav-i${ativo(r.view === "mapa")}" href="${base}/mapa">◇ Mapa</a>
      <a class="nav-i${ativo(r.view === "grafo")}" href="${base}/grafo">∴ Grafo<span class="n">${t.nos}</span></a>
      ${t.sondagem ? `<a class="nav-i${ativo(r.file === "sondagem.md")}" href="${docHref(t.slug, "sondagem.md")}">⌕ Sondagem</a>` : ""}
      <a class="nav-i${ativo(r.view === "fontes")}" href="${base}/fontes">❏ Fontes<span class="n">${t.arquivos.fontes.filter((f) => !/LEIA-ME/.test(f)).length}</span></a>
    </div>`;
    if (lic.length) {
      html += `<div class="nav-h">Lições</div><div class="nav-sub">` +
        lic.map((f) => `<a class="nav-i${ativo(r.file === f)}" href="${docHref(t.slug, f)}">${esc(lessonLabel(f))}</a>`).join("") + `</div>`;
    }
    if (ses.length) {
      html += `<div class="nav-h">Sessões</div><div class="nav-sub">` +
        ses.map((f) => `<a class="nav-i${ativo(r.file === f)}" href="${docHref(t.slug, f)}">${esc(sessionLabel(f))}</a>`).join("") + `</div>`;
    }
  }
  nav.innerHTML = html;
}

function renderCrumbs(r) {
  const t = state.topicos.find((x) => x.slug === r.slug);
  const parts = [`<a href="#/">tópicos</a>`];
  if (r.slug) parts.push(`<a href="#/t/${encodeURIComponent(r.slug)}">${esc(t?.titulo || r.slug)}</a>`);
  const nome = { mapa: "mapa", grafo: "grafo", fontes: "fontes", terminal: "terminal" }[r.view] || (r.view === "doc" ? r.file : "");
  if (nome) parts.push(`<span class="cur">${esc(nome)}</span>`);
  $("#crumbs").innerHTML = parts.join(`<span class="sep">/</span>`) +
    (r.view === "terminal" ? `<a class="ext" href="${esc(terminalUrl())}" target="_blank" rel="noopener">abrir em nova aba ↗</a>` : "");
  document.title = [nome, t?.titulo, "Study Harness"].filter(Boolean).join(" · ");
}

// Pela tailnet o terminal fica em :8443 (tailscale serve); localmente, direto no ttyd.
const terminalUrl = () => (location.protocol === "https:"
  ? `https://${location.hostname}:8443/` : `http://${location.hostname}:7681/`);

// O iframe é criado na primeira visita e só escondido depois: trocar de aba não derruba a conexão.
async function showTerminal(on) {
  const term = $("#term");
  term.hidden = !on;
  view.hidden = on;
  if (!on || term.querySelector("iframe")) return term.querySelector("iframe")?.focus();
  try {
    await fetch(terminalUrl(), { mode: "no-cors", cache: "no-store" });
    term.innerHTML = `<iframe src="${esc(terminalUrl())}" allow="clipboard-read; clipboard-write" title="terminal"></iframe>`;
    term.firstChild.focus();
  } catch {
    term.innerHTML = `<div class="page"><div class="empty">O terminal não está rodando.<br><br>
      No PC: <code>sudo bash ferramentas/servidor/instalar-terminal.sh</code><br><br>
      <a href="#/terminal" onclick="document.querySelector('#term').innerHTML='';location.reload()">tentar de novo</a></div></div>`;
  }
}

const closeNav = () => document.body.classList.remove("nav-open");
$("#menu").onclick = () => document.body.classList.toggle("nav-open");
$("#scrim").onclick = closeNav;

/* ─── Telas ──────────────────────────────────────────────────────── */

const PROXIMO = {
  nova: ["/sondar", "medir o que você já sabe"],
  sondado: ["/planejar", "montar o mapa de lições"],
  planejado: ["/ensinar", "primeira lição"],
  ensinando: ["/ensinar", "próxima lição"],
  praticando: ["/praticar", "bloco de prática"],
};

const VIEWS = {
  async home() {
    const ts = state.topicos;
    if (!ts.length) {
      return h(`<div class="page"><h1 class="ttl">Tópicos</h1>
        <div class="empty">Nenhum tópico ainda.<br><br>No Claude Code, rode <code>/novo-topico &lt;nome&gt;</code>.</div></div>`);
    }
    return h(`<div class="page wide"><h1 class="ttl">Tópicos</h1><p class="sub">${ts.length} em estudo</p><div class="grid">${ts.map((t) => `
      <a class="card" href="#/t/${encodeURIComponent(t.slug)}">
        <h3>${esc(t.titulo)}</h3>
        <div class="meta">
          <span class="pill">${esc(t.fase)}</span>
          ${t.confusoes.length ? `<span class="pill bad">${t.confusoes.length} confusão${t.confusoes.length > 1 ? "ões" : ""} aberta${t.confusoes.length > 1 ? "s" : ""}</span>` : ""}
          ${t.pendencias.length ? `<span class="pill warn">${t.pendencias.length} sem fonte</span>` : ""}
        </div>
        <div class="meta" style="margin-top:12px">
          <span>${t.nos} nós</span><span>${t.cadeias} cadeias</span><span>${t.arquivos.licoes.filter(isMd).length} lições</span>
        </div>
        ${t.proxima && t.proxima !== "—" ? `<div class="meta" style="margin-top:8px">próxima: ${esc(t.proxima)}</div>` : ""}
      </a>`).join("")}</div></div>`);
  },

  async topico(r) {
    const t = await api(`topico/${encodeURIComponent(r.slug)}`);
    const raw = await api(`arquivo/${encodeURIComponent(r.slug)}/TOPICO.md`);
    const mostrados = ["Estado", "Confusões em aberto", "Pendências sem fonte", "Retestes pendentes"];
    const resto = raw.replace(/<!--[\s\S]*?-->/g, "").replace(/^# .*\n?/m, "").split(/^(?=## )/m)
      .filter((s) => s.startsWith("## ") && !mostrados.some((n) => s.startsWith("## " + n)) && s.split("\n").slice(1).join("").trim())
      .join("\n");
    const [cmd, oque] = PROXIMO[t.fase] || [];
    const lista = (cls, titulo, itens) => itens.length
      ? `<div class="alert ${cls}"><h4>${titulo}</h4><ul>${itens.map((i) => `<li>${mdInline(i)}</li>`).join("")}</ul></div>` : "";
    const el = h(`<div class="page">
      <h1 class="ttl">${esc(t.titulo)}</h1><p class="sub">${esc(t.slug)}</p>
      <div class="stats">
        <div class="stat"><div class="k">fase</div><div class="v">${esc(t.fase)}</div></div>
        <div class="stat"><div class="k">nós</div><div class="v"><a href="#/t/${encodeURIComponent(t.slug)}/grafo">${t.nos}</a></div></div>
        <div class="stat"><div class="k">cadeias</div><div class="v">${t.cadeias}</div></div>
        <div class="stat"><div class="k">lições</div><div class="v">${t.arquivos.licoes.filter(isMd).length}</div></div>
        <div class="stat"><div class="k">última sessão</div><div class="v">${esc(t.ultima || "—")}</div></div>
      </div>
      ${cmd ? `<div class="next"><code>${cmd} ${esc(t.slug)}</code><span class="muted">${t.proxima && t.proxima !== "—" ? "próxima lição: " + esc(t.proxima) : oque}</span></div>` : ""}
      ${lista("bad", "Confusões em aberto", t.confusoes)}
      ${lista("warn", "Pendências sem fonte", t.pendencias)}
      ${lista("info", "Retestes pendentes", t.retestes)}
      <div class="md">${md(resto)}</div>
    </div>`);
    await enhance(el, r.slug, "TOPICO.md");
    return el;
  },

  async mapa(r) {
    const raw = await api(`arquivo/${encodeURIComponent(r.slug)}/mapa.md`);
    const el = h(`<div class="page wide"><div class="md">${md(raw)}</div></div>`);
    const h1 = el.querySelector("h1");
    const legenda = h(`<div class="legend">
      <span><i style="background:#3a3214;border-color:#e0b84a"></i>atual</span>
      <span><i style="background:#1d3024;border-color:#5fae6e"></i>visto</span>
      <span><i style="background:#3a1d20;border-color:#e06c75"></i>reparo</span>
      <span><i style="background:#1a1a1a;border-color:#6b6b6b;border-style:dashed"></i>já sabe</span>
      <span>clique num nó para abrir a lição</span></div>`);
    h1 ? h1.after(legenda) : el.prepend(legenda);
    await enhance(el, r.slug, "mapa.md");
    // Tabela de lições do mapa: | NN | slug-a, slug-b | licoes/NN-x.md |
    const t = state.topicos.find((x) => x.slug === r.slug);
    const licao = new Map();
    for (const linha of raw.split("\n")) {
      const cel = linha.split("|").map((c) => c.trim().replace(/`/g, ""));
      const i = cel.findIndex((c) => /^licoes\/.+\.md$/.test(c));
      if (i > 0) for (const s of cel[i - 1].split(/[,\s]+/).filter(Boolean)) licao.set(s, cel[i]);
    }
    for (const g of el.querySelectorAll(".mermaid g.node")) {
      const slug = g.dataset.id || /^flowchart-(.+)-\d+$/.exec(g.id)?.[1];
      const f = slug && licao.get(slug);
      if (!f) continue;
      if (t?.arquivos.licoes.includes(f)) {
        g.classList.add("clickable");
        g.addEventListener("click", () => (location.hash = docHref(r.slug, f).slice(1)));
      } else {
        g.insertAdjacentHTML("afterbegin", `<title>${esc(f)} ainda não foi dada</title>`);
      }
    }
    return el;
  },

  async doc(r) {
    const raw = await api(`arquivo/${encodeURIComponent(r.slug)}/${enc(r.file)}`);
    const el = h(`<div class="page"><div class="md">${md(raw)}</div></div>`);
    await enhance(el, r.slug, r.file);
    return el;
  },

  async fontes(r) {
    const [t, g] = await Promise.all([api(`topico/${encodeURIComponent(r.slug)}`), api(`grafo/${encodeURIComponent(r.slug)}`)]);
    const porArq = new Map(Object.values(g.fontes).map((s) => [s.filePath, s]));
    const citam = (sid) => g.nos.filter((n) => (n.fonte || "").split(" ")[0] === sid).length;
    const arqs = t.arquivos.fontes.filter((f) => !/LEIA-ME/.test(f));
    const urls = Object.values(g.fontes).filter((s) => !arqs.includes(s.filePath));
    const linhas = arqs.concat(urls.map((s) => s.filePath)).map((f) => {
      const s = porArq.get(f);
      const local = arqs.includes(f);
      const link = local ? fileUrl(r.slug, f) : /^https?:/.test(f) ? f : "";
      return `<tr><td>${link ? `<a href="${esc(link)}" target="_blank" rel="noopener">${esc(f.replace(/^fontes\//, ""))}</a>` : esc(f)}</td>
        <td class="muted">${s ? esc(s.id) : "não registrada"}</td><td>${s ? citam(s.id) : "—"}</td></tr>`;
    });
    return h(`<div class="page wide"><h1 class="ttl">Fontes</h1>
      <p class="sub">A verdade do tópico. Cada nó do grafo cita uma delas, é derivado ou é marcado sem fonte.</p>
      ${linhas.length ? `<table class="files"><tr><th>arquivo</th><th>id</th><th>nós que citam</th></tr>${linhas.join("")}</table>`
        : `<div class="empty">Nenhuma fonte. Coloque PDFs ou capítulos em <code>${esc(r.slug)}/fontes/</code>.</div>`}</div>`);
  },

  async grafo(r) {
    const g = await api(`grafo/${encodeURIComponent(r.slug)}`);
    current = new GraphView(r.slug, g, r.q.get("n"));
    return current.el;
  },
};

/* ─── Grafo ──────────────────────────────────────────────────────── */

const COR = { fonte: "#cfcfcf", derivado: "#7aa2f7", semfonte: "#e0af68", nenhum: "#6b6b6b" };
const tipoFonte = (n) => (n.fonte === "derivado" ? "derivado" : n.fonte === "sem fonte" ? "semfonte" : n.fonte ? "fonte" : "nenhum");
const GREGO = {
  alpha: "α", beta: "β", gamma: "γ", delta: "δ", epsilon: "ε", varepsilon: "ε", theta: "θ", lambda: "λ", mu: "μ",
  pi: "π", rho: "ρ", sigma: "σ", tau: "τ", phi: "φ", varphi: "φ", omega: "ω", Delta: "Δ", Sigma: "Σ", Omega: "Ω",
  infty: "∞", to: "→", cdot: "·", leq: "≤", le: "≤", geq: "≥", ge: "≥", neq: "≠", in: "∈", subset: "⊂", subseteq: "⊆",
  sum: "Σ", int: "∫", partial: "∂", nabla: "∇", times: "×", Rightarrow: "⇒", forall: "∀", exists: "∃", sqrt: "√", approx: "≈",
};
const SOBRE = { 0: "⁰", 1: "¹", 2: "²", 3: "³", 4: "⁴", 5: "⁵", 6: "⁶", 7: "⁷", 8: "⁸", 9: "⁹", n: "ⁿ", "-": "⁻", "+": "⁺", i: "ⁱ" };
const SOB = { 0: "₀", 1: "₁", 2: "₂", 3: "₃", 4: "₄", 5: "₅", 6: "₆", 7: "₇", 8: "₈", 9: "₉", n: "ₙ", i: "ᵢ", k: "ₖ" };
const indice = (mapa) => (m, a, b) => [...(a ?? b)].map((c) => mapa[c] ?? c).join("");
// LaTeX → texto aproximado, só para os rótulos do canvas.
const plain = (s) => (s || "").replace(/\$+([^$]*)\$+/g, (m, x) => x
  .replace(/\\(?:mathbb|mathrm|mathbf|mathcal|text|operatorname)\{([^}]*)\}/g, "$1")
  .replace(/\\([a-zA-Z]+)/g, (m2, c) => GREGO[c] ?? c)
  .replace(/\^\{([^}]*)\}|\^(.)/g, indice(SOBRE)).replace(/_\{([^}]*)\}|_(.)/g, indice(SOB))
  .replace(/[{}]/g, "").replace(/\\,/g, " "));

class GraphView {
  constructor(slug, g, sel) {
    this.kind = "grafo";
    this.slug = slug;
    this.t = d3.zoomIdentity;
    this.hover = null;
    this.selected = null;
    this.match = null;
    this.modo = "grafo";
    this.el = h(`<div class="graph-wrap">
      <canvas id="canvas"></canvas>
      <div class="list" hidden></div>
      <div class="g-tools">
        <input class="g-search" placeholder="buscar proposição  ( / )" spellcheck="false">
        <div class="seg"><button data-m="grafo" class="on">grafo</button><button data-m="lista">lista</button></div>
      </div>
      <div class="g-stats"></div>
      <button class="g-fit" title="enquadrar tudo">⤢</button>
      <aside class="panel" hidden><div class="panel-h"><h2></h2><button class="panel-x" aria-label="fechar">✕</button></div><div class="panel-b"></div></aside>
      <div class="g-empty" hidden>O grafo ainda está vazio.<br>Ele cresce no fim de cada sessão, com /revisar-grafo.</div>
    </div>`);
    this.canvas = $("canvas", this.el);
    this.ctx = this.canvas.getContext("2d");
    this.panel = $(".panel", this.el);
    this.listEl = $(".list", this.el);
    this.search = $(".g-search", this.el);
    this.bind();
    this.setData(g, true);
    requestAnimationFrame(() => {
      this.resize();
      this.fit(false);
      if (sel) this.select(sel, true);
    });
  }

  bind() {
    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(this.el);
    this.zoom = d3.zoom().scaleExtent([0.05, 8]).on("zoom", (e) => { this.t = e.transform; this.dirty(); });
    const drag = d3.drag()
      .container(this.canvas)
      .subject((e) => { const n = this.pick(e.x, e.y); return n && { x: this.t.applyX(n.x), y: this.t.applyY(n.y), n }; })
      .on("start", (e) => { if (!e.active) this.sim.alphaTarget(0.25).restart(); })
      .on("drag", (e) => { const n = e.subject.n; n.fx = this.t.invertX(e.x); n.fy = this.t.invertY(e.y); })
      .on("end", (e) => { if (!e.active) this.sim.alphaTarget(0); const n = e.subject.n; n.fx = n.fy = null; });
    d3.select(this.canvas).call(drag).call(this.zoom).on("dblclick.zoom", null);
    this.canvas.addEventListener("mousemove", (e) => {
      const [x, y] = d3.pointer(e, this.canvas);
      const n = this.pick(x, y);
      if (n !== this.hover) { this.hover = n; this.canvas.classList.toggle("hovering", !!n); this.dirty(); }
    });
    this.canvas.addEventListener("mouseleave", () => { this.hover = null; this.dirty(); });
    this.canvas.addEventListener("click", (e) => {
      const [x, y] = d3.pointer(e, this.canvas);
      const n = this.pick(x, y);
      n ? this.select(n.id) : this.select(null);
    });
    $(".panel-x", this.el).onclick = () => this.select(null);
    $(".g-fit", this.el).onclick = () => this.fit(true);
    for (const b of this.el.querySelectorAll(".seg button")) b.onclick = () => this.setModo(b.dataset.m);
    this.search.addEventListener("input", () => this.filtrar());
    this.search.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && this.match?.size) { this.setModo("grafo"); this.select([...this.match][0], true); }
      if (e.key === "Escape") { this.search.value = ""; this.filtrar(); this.search.blur(); }
    });
    this.onKey = (e) => {
      if (e.target.closest("input,textarea")) return;
      if (e.key === "/") { e.preventDefault(); this.search.focus(); }
      if (e.key === "Escape") this.select(null);
    };
    window.addEventListener("keydown", this.onKey);
    this.panel.addEventListener("click", (e) => {
      const b = e.target.closest("[data-n]");
      if (b && b.dataset.n !== this.selected?.id) this.select(b.dataset.n, true);
    });
    this.listEl.addEventListener("click", (e) => {
      const it = e.target.closest("[data-n]");
      if (!it || e.target.closest("a")) return;
      this.setModo("grafo");
      this.select(it.dataset.n, true);
    });
  }

  destroy() {
    this.sim?.stop();
    this.ro.disconnect();
    window.removeEventListener("keydown", this.onKey);
  }

  setData(g, inicial) {
    this.g = g;
    const antigos = new Map((this.all || []).map((n) => [n.id, n]));
    const nodes = g.nos.map((n) => ({ ...n, kind: "n" }));
    const byId = new Map(nodes.map((n) => [n.id, n]));
    const links = [];
    const imps = [];
    this.nbr = new Map(nodes.map((n) => [n.id, new Set()]));
    this.porConclusao = new Map();
    this.porPremissa = new Map();
    for (const c of g.cadeias) {
      const prem = c.premises.filter((p) => byId.has(p));
      if (!byId.has(c.conclusion) || !prem.length) continue;
      (this.porConclusao.get(c.conclusion) || this.porConclusao.set(c.conclusion, []).get(c.conclusion)).push(c);
      for (const p of prem) (this.porPremissa.get(p) || this.porPremissa.set(p, []).get(p)).push(c);
      const membros = [...prem, c.conclusion];
      for (const a of membros) for (const b of membros) if (a !== b) this.nbr.get(a).add(b);
      if (prem.length === 1) {
        links.push({ source: prem[0], target: c.conclusion, arrow: true });
      } else {
        imps.push({ id: c.id, kind: "imp", chain: c });
        for (const a of membros) this.nbr.get(a).add(c.id);
        for (const p of prem) links.push({ source: p, target: c.id, arrow: false });
        links.push({ source: c.id, target: c.conclusion, arrow: true });
      }
    }
    // Profundidade = maior cadeia desde uma raiz; fundamentos embaixo, conclusões em cima.
    const memo = new Map();
    const depth = (id, vis = new Set()) => {
      if (memo.has(id)) return memo.get(id);
      if (vis.has(id)) return 0;
      vis.add(id);
      let d = 0;
      for (const c of this.porConclusao.get(id) || []) for (const p of c.premises) if (byId.has(p)) d = Math.max(d, depth(p, vis) + 1);
      vis.delete(id);
      memo.set(id, d);
      return d;
    };
    for (const n of nodes) {
      n.depth = depth(n.id);
      n.grau = (this.porConclusao.get(n.id)?.length || 0) + (this.porPremissa.get(n.id)?.length || 0);
      n.r = 5 + Math.sqrt(n.grau) * 2.2;
      n.cor = COR[tipoFonte(n)];
      n.alphaCor = n.fonte === "sem fonte" ? 0.45 + 0.55 * ((n.confianca ?? 50) / 100) : 1;
      n.lines = quebra(plain(n.name || n.id), 24);
    }
    for (const i of imps) { i.depth = byId.get(i.chain.conclusion).depth - 0.5; i.r = 0; }
    this.nodes = nodes;
    this.byId = byId;
    this.imps = imps;
    this.all = [...nodes, ...imps];
    for (const n of this.all) {
      const o = antigos.get(n.id);
      if (o) Object.assign(n, { x: o.x, y: o.y, vx: o.vx, vy: o.vy });
      else if (!inicial) {
        const viz = [...(this.nbr.get(n.id) || [])].map((v) => antigos.get(v)).find(Boolean);
        if (viz) Object.assign(n, { x: viz.x + (Math.random() - 0.5) * 40, y: viz.y + (Math.random() - 0.5) * 40 });
      }
    }
    this.links = links;
    this.sim?.stop();
    this.sim = d3.forceSimulation(this.all)
      .force("link", d3.forceLink(links).id((d) => d.id)
        .distance((l) => (l.source.kind === "imp" || l.target.kind === "imp" ? 36 : 80)).strength(0.8))
      .force("charge", d3.forceManyBody().strength((d) => (d.kind === "imp" ? -30 : -320)).distanceMax(700))
      .force("y", d3.forceY((d) => -d.depth * 95).strength(0.1))
      .force("x", d3.forceX(0).strength(0.03))
      .force("collide", d3.forceCollide((d) => (d.kind === "imp" ? 4 : d.r + 14)))
      .on("tick", () => this.dirty())
      .stop();
    if (inicial) this.sim.tick(300);
    else this.sim.alpha(0.4).restart();
    if (this.selected) this.selected = byId.get(this.selected.id) || null;
    this.hover = null;
    $(".g-empty", this.el).hidden = nodes.length > 0;
    this.renderStats();
    this.filtrar();
    if (this.modo === "lista") this.renderLista();
    if (this.selected) this.renderPanel(); else this.panel.hidden = true;
  }

  renderStats() {
    const c = { fonte: 0, derivado: 0, semfonte: 0, nenhum: 0 };
    for (const n of this.nodes) c[tipoFonte(n)]++;
    const erros = this.g.erros.length;
    $(".g-stats", this.el).innerHTML = `<span><b>${this.nodes.length}</b> nós</span><span><b>${this.g.cadeias.length}</b> cadeias</span>
      <span><i class="dot" style="background:${COR.fonte}"></i>fonte ${c.fonte}</span>
      <span><i class="dot" style="background:${COR.derivado}"></i>derivado ${c.derivado}</span>
      <span><i class="dot" style="background:${COR.semfonte}"></i>sem fonte ${c.semfonte}</span>
      ${c.nenhum ? `<span><i class="dot" style="background:${COR.nenhum}"></i>sem campo ${c.nenhum}</span>` : ""}
      ${erros ? `<span style="color:var(--bad)" title="${esc(this.g.erros.join("\n"))}">${erros} linha(s) inválida(s)</span>` : ""}`;
  }

  resize() {
    const r = this.el.getBoundingClientRect();
    if (!r.width) return;
    this.dpr = window.devicePixelRatio || 1;
    this.w = r.width;
    this.h = r.height;
    this.canvas.width = Math.round(r.width * this.dpr);
    this.canvas.height = Math.round(r.height * this.dpr);
    this.dirty();
  }

  dirty() {
    if (this.raf) return;
    this.raf = requestAnimationFrame(() => { this.raf = 0; this.draw(); });
  }

  pick(sx, sy) {
    const [wx, wy] = this.t.invert([sx, sy]);
    let best = null, bd = Infinity;
    for (const n of this.nodes) {
      const d = (n.x - wx) ** 2 + (n.y - wy) ** 2;
      const R = n.r + 8 / this.t.k;
      if (d < R * R && d < bd) { bd = d; best = n; }
    }
    return best;
  }

  visivel() {
    const foco = this.hover || this.selected;
    if (foco) { const v = this.nbr.get(foco.id); return (n) => n === foco || v.has(n.id); }
    if (this.match) {
      const m = this.match;
      return (n) => (n.kind === "imp" ? m.has(n.chain.conclusion) || n.chain.premises.some((p) => m.has(p)) : m.has(n.id));
    }
    return () => true;
  }

  draw() {
    const { ctx, t } = this;
    if (!this.w) return;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, this.w, this.h);
    ctx.translate(t.x, t.y);
    ctx.scale(t.k, t.k);
    const k = t.k;
    const foco = this.hover || this.selected;
    const vis = this.visivel();
    const filtrando = !!(foco || this.match);

    // Arestas: premissas convergem sem ponta no ponto de implicação; uma seta sai dele.
    ctx.lineCap = "round";
    for (const l of this.links) {
      const s = l.source, d = l.target;
      const on = vis(s) && vis(d);
      ctx.globalAlpha = on ? (filtrando ? 0.95 : 0.6) : 0.06;
      ctx.strokeStyle = on && filtrando ? "#a8a8a8" : "#5e5e5e";
      ctx.fillStyle = ctx.strokeStyle;
      ctx.lineWidth = Math.max(1.1, 0.7 / k);
      const dx = d.x - s.x, dy = d.y - s.y, len = Math.hypot(dx, dy) || 1;
      const ux = dx / len, uy = dy / len;
      const x0 = s.x + ux * (s.r + 1), y0 = s.y + uy * (s.r + 1);
      const fim = d.r + (l.arrow ? 2 : 0);
      const x1 = d.x - ux * fim, y1 = d.y - uy * fim;
      const seta = l.arrow ? Math.max(9, 7 / k) : 0;
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1 - ux * seta * 0.8, y1 - uy * seta * 0.8);
      ctx.stroke();
      if (l.arrow) {
        const w = seta * 0.55;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x1 - ux * seta - uy * w, y1 - uy * seta + ux * w);
        ctx.lineTo(x1 - ux * seta + uy * w, y1 - uy * seta - ux * w);
        ctx.closePath();
        ctx.fill();
      }
    }

    // Halo do foco.
    for (const n of [this.selected, this.hover]) {
      if (!n) continue;
      const g = ctx.createRadialGradient(n.x, n.y, n.r * 0.6, n.x, n.y, n.r * 3);
      g.addColorStop(0, hexA(n.cor, 0.45));
      g.addColorStop(1, hexA(n.cor, 0));
      ctx.globalAlpha = 1;
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r * 3, 0, Math.PI * 2);
      ctx.fill();
    }

    for (const n of this.nodes) {
      ctx.globalAlpha = (vis(n) ? 1 : 0.12) * n.alphaCor;
      ctx.fillStyle = n.cor;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
      if (n.fonte === "sem fonte" && (n.confianca ?? 0) < 70) {
        ctx.strokeStyle = "#e06c75";
        ctx.lineWidth = Math.max(1.5, 1 / k);
        ctx.stroke();
      }
    }
    if (this.selected) {
      const n = this.selected;
      ctx.globalAlpha = 1;
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = Math.max(1.5, 1.2 / k);
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r + 4, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Rótulos aparecem com o zoom (todos juntos); os do foco e vizinhos, sempre.
    const gate = Math.min(1, Math.max(0, (k - 0.5) / 0.35));
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.lineJoin = "round";
    for (const n of this.nodes) {
      const destaque = filtrando && vis(n);
      const a = destaque ? 1 : filtrando ? gate * 0.12 : gate * 0.85;
      if (a < 0.02) continue;
      const fs = destaque ? Math.max(12, 12 / k) : 12;
      ctx.font = `600 ${fs}px "Source Sans 3", sans-serif`;
      ctx.globalAlpha = a;
      let y = n.y + n.r + 4 / Math.min(k, 1);
      for (const linha of n.lines) {
        ctx.strokeStyle = "#141414";
        ctx.lineWidth = fs * 0.32;
        ctx.strokeText(linha, n.x, y);
        ctx.fillStyle = n === foco ? "#ffffff" : "#d0d0d0";
        ctx.fillText(linha, n.x, y);
        y += fs * 1.15;
      }
    }
    ctx.globalAlpha = 1;
  }

  fit(animar) {
    if (!this.nodes.length || !this.w) return;
    const xs = this.nodes.map((n) => n.x), ys = this.nodes.map((n) => n.y);
    const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
    const pad = 80;
    const k = Math.min(this.w / (x1 - x0 + pad * 2), this.h / (y1 - y0 + pad * 2), 1.6);
    const tr = d3.zoomIdentity.translate(this.w / 2, this.h / 2).scale(k).translate(-(x0 + x1) / 2, -(y0 + y1) / 2);
    const s = d3.select(this.canvas);
    animar ? s.transition().duration(450).call(this.zoom.transform, tr) : s.call(this.zoom.transform, tr);
  }

  centrar(n) {
    const k = Math.max(this.t.k, 1.1);
    const painel = !this.panel.hidden && this.w > 860 ? 412 : 0;
    const movel = this.w <= 860 && !this.panel.hidden ? this.h * 0.28 : 0;
    const tr = d3.zoomIdentity.translate((this.w - painel) / 2, this.h / 2 - movel).scale(k).translate(-n.x, -n.y);
    d3.select(this.canvas).transition().duration(450).call(this.zoom.transform, tr);
  }

  select(id, centrar) {
    const n = id ? this.byId.get(id) : null;
    this.selected = n;
    history.replaceState(null, "", `#/t/${encodeURIComponent(this.slug)}/grafo${n ? "?n=" + encodeURIComponent(n.id) : ""}`);
    if (n) this.renderPanel(); else this.panel.hidden = true;
    if (n && centrar) this.centrar(n);
    this.dirty();
  }

  selectFromRoute(id) {
    if (id !== (this.selected?.id ?? null)) this.select(id, true);
  }

  nref(id) {
    const n = this.byId.get(id);
    if (!n) return `<span class="nref">${esc(id)}</span>`;
    const self = id === this.selected?.id;
    return `<button class="nref${self ? " self" : ""}" data-n="${esc(id)}"><i class="dot" style="background:${n.cor}"></i>${mdInline(n.name)}</button>`;
  }

  badge(n) {
    const f = n.fonte;
    if (!f) return `<span class="cite">sem campo fonte</span>`;
    if (f === "derivado") return `<span class="cite derivado">derivado</span>`;
    if (f === "sem fonte") return `<span class="cite semfonte${(n.confianca ?? 0) < 70 ? " baixa" : ""}">sem fonte · ${n.confianca ?? "?"}%</span>`;
    const [sid, ...resto] = f.split(" ");
    const s = this.g.fontes[sid];
    const loc = resto.join(" ");
    const pag = /p\.?\s*(\d+)/.exec(loc);
    const nome = s ? s.filePath.split("/").pop() : sid;
    const href = s ? (/^https?:/.test(s.filePath) ? s.filePath : fileUrl(this.slug, s.filePath)) + (pag && /\.pdf$/i.test(s.filePath) ? `#page=${pag[1]}` : "") : "";
    const txt = esc(nome + (loc ? " · " + loc : ""));
    return href ? `<a class="cite fonte" href="${esc(href)}" target="_blank" rel="noopener">${txt}</a>` : `<span class="cite fonte">${txt}</span>`;
  }

  renderPanel() {
    const n = this.selected;
    this.panel.hidden = false;
    $(".panel-h h2", this.panel).innerHTML = mdInline(n.name);
    const porque = this.porConclusao.get(n.id) || [];
    const leva = this.porPremissa.get(n.id) || [];
    const prov = n.provenance.map((p) => {
      const href = p.messageId ? docHref(this.slug, p.messageId.split("#")[0], p.messageId.split("#")[1]) : "";
      const rot = p.messageId || this.g.fontes[p.chatId]?.filePath || p.chatId;
      return href ? `<a class="prov" href="${esc(href)}">${esc(rot)}<span class="c">${esc(p.chatId)}</span></a>`
        : `<div class="prov">${esc(rot)}<span class="c">${esc(p.chatId)}</span></div>`;
    }).join("");
    const b = $(".panel-b", this.panel);
    b.innerHTML = `
      <div class="row">${this.badge(n)}<span class="idt">${esc(n.id)}</span></div>
      <div class="stmt md">${md(n.statement)}</div>
      ${porque.length ? `<div class="sec-h">Por que é verdade</div>${porque.map((c) => `<div class="chain">
          ${c.premises.map((p) => this.nref(p)).join("")}<div class="arrow">${c.premises.length > 1 ? "juntas ⇒" : "⇒"}</div>${this.nref(c.conclusion)}</div>`).join("")}` : ""}
      ${leva.length ? `<div class="sec-h">Leva a</div>${leva.map((c) => `<div class="chain">
          ${c.premises.map((p) => this.nref(p)).join("")}<div class="arrow">⇒</div>${this.nref(c.conclusion)}</div>`).join("")}` : ""}
      ${n.aliases.length ? `<div class="sec-h">Outras formulações</div>${n.aliases.map((a) => `<div class="alias">${mdInline(a)}</div>`).join("")}` : ""}
      ${prov ? `<div class="sec-h">Onde apareceu</div>${prov}` : ""}`;
    citeChips(b);
    b.scrollTop = 0;
  }

  filtrar() {
    const q = this.search.value.trim().toLowerCase();
    this.match = q ? new Set(this.nodes.filter((n) => [n.name, n.statement, ...n.aliases, plain(n.name), plain(n.statement)]
      .join(" ").toLowerCase().includes(q)).map((n) => n.id)) : null;
    if (this.modo === "lista") this.renderLista();
    this.dirty();
  }

  setModo(m) {
    this.modo = m;
    for (const b of this.el.querySelectorAll(".seg button")) b.classList.toggle("on", b.dataset.m === m);
    this.listEl.hidden = m !== "lista";
    if (m === "lista") this.renderLista();
  }

  renderLista() {
    const ns = this.nodes.filter((n) => !this.match || this.match.has(n.id))
      .sort((a, b) => a.depth - b.depth || plain(a.name).localeCompare(plain(b.name)));
    this.listEl.innerHTML = ns.length ? ns.map((n) => `<div class="item" data-n="${esc(n.id)}">
        <h4><i class="dot" style="background:${n.cor}"></i>${mdInline(n.name)}<span class="idt">${this.badge(n)}</span></h4>
        <div class="stmt">${md(n.statement)}</div></div>`).join("")
      : `<div class="empty">Nada encontrado.</div>`;
  }

  async reload() {
    this.setData(await api(`grafo/${encodeURIComponent(this.slug)}`), false);
  }
}

// Rótulo do canvas em no máximo duas linhas de ~max caracteres.
function quebra(s, max) {
  const linhas = [""];
  for (const w of s.split(/\s+/).filter(Boolean)) {
    const i = linhas.length - 1;
    if (!linhas[i] || (linhas[i] + " " + w).length <= max) linhas[i] = (linhas[i] + " " + w).trim();
    else if (linhas.length < 2) linhas.push(w);
    else { linhas[i] = linhas[i].replace(/\s*\S?$/, "…"); break; }
  }
  return linhas;
}
const hexA = (hex, a) => `rgba(${parseInt(hex.slice(1, 3), 16)},${parseInt(hex.slice(3, 5), 16)},${parseInt(hex.slice(5, 7), 16)},${a})`;

/* ─── Ciclo ──────────────────────────────────────────────────────── */

async function render(soft = false) {
  const r = parseRoute();
  closeNav();
  renderNav(r);
  renderCrumbs(r);
  showTerminal(r.view === "terminal");
  if (r.view === "terminal") return;
  if (r.view === "grafo" && current?.kind === "grafo" && current.slug === r.slug) {
    if (soft) await current.reload(); else current.selectFromRoute(r.q.get("n"));
    return;
  }
  const token = ++renderToken;
  const scroll = soft ? view.scrollTop : 0;
  let el;
  try {
    if (r.slug && !state.topicos.some((t) => t.slug === r.slug)) throw new Error(`O tópico "${r.slug}" não existe.`);
    const fn = VIEWS[r.view];
    if (!fn) throw new Error("Página desconhecida.");
    const antigo = current;
    current = null;
    el = await fn(r);
    if (token !== renderToken) { current?.destroy?.(); current = antigo; return; }
    antigo?.destroy?.();
  } catch (e) {
    if (token !== renderToken) return;
    el = h(`<div class="page"><div class="empty">${esc(e.message.startsWith("404") ? "Arquivo ainda não existe." : e.message)}</div></div>`);
  }
  view.replaceChildren(el);
  view.scrollTop = scroll;
  const a = r.q.get("a");
  if (a && !soft) flashAnchor(view, a);
}

function setLive(ok) {
  $("#live").className = "live " + (ok ? "on" : "off");
  $("#live-txt").textContent = ok ? "ao vivo" : "sem conexão";
}

async function poll() {
  try {
    const { versao } = await api("versao");
    setLive(true);
    if (state.ver && versao !== state.ver) {
      state.ver = versao;
      state.topicos = await api("topicos");
      await render(true);
    }
    state.ver = versao;
  } catch {
    setLive(false);
  }
  setTimeout(poll, 2500);
}

window.addEventListener("hashchange", () => render());
(async () => {
  try { state.topicos = await api("topicos"); } catch { setLive(false); }
  await render();
  poll();
})();
