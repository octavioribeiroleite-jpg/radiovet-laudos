"use client";

import { useMemo, useState } from "react";
import rawFindings from "./findings.json";

type Finding = { title: string; region: string; text: string; tags: string[] };

const stopWords = new Set(["da", "de", "do", "das", "dos", "e", "em"]);
const findings: Finding[] = rawFindings.map((finding) => ({
  ...finding,
  tags: finding.title
    .toLocaleLowerCase("pt-BR")
    .split(/[\s/()-]+/)
    .filter((word) => word.length > 3 && !stopWords.has(word))
    .slice(0, 2),
}));

const regions = ["Todos", ...Array.from(new Set(findings.map((f) => f.region)))];
const replaceTokens = (text: string) => text.replace(/\{lado\}/g, "esquerdo/direito").replace(/\{estrutura\}/g, "[estrutura]").replace(/\{segmento\}/g, "cervical/torácico").replace(/\{face\}/g, "dorsal/ventral").replace(/\{direção\}/g, "[direção]").replace(/\{lobo\}/g, "[lobo]").replace(/\{radiopacidade\}/g, "mineral/metal").replace(/\{quantidade\}/g, "[número]");

export default function Home() {
  const [query, setQuery] = useState(""); const [region, setRegion] = useState("Todos"); const [selected, setSelected] = useState<Finding[]>([]); const [patient, setPatient] = useState("");
  const filtered = useMemo(() => findings.filter((f) => (region === "Todos" || f.region === region) && `${f.title} ${f.region} ${f.text} ${f.tags.join(" ")}`.toLocaleLowerCase("pt-BR").includes(query.toLocaleLowerCase("pt-BR"))), [query, region]);
  const report = `LAUDO RADIOGRÁFICO${patient ? `\nPaciente: ${patient}` : ""}\n\nACHADOS:\n${selected.map((f, i) => `${i + 1}. ${replaceTokens(f.text)}`).join("\n\n") || "Selecione achados na biblioteca ao lado para iniciar o laudo."}\n\nImpressão diagnóstica: Correlacionar os achados aos dados clínicos e, quando indicado, a exames complementares.`;
  const toggle = (f: Finding) => setSelected((s) => s.some((x) => x.title === f.title) ? s.filter((x) => x.title !== f.title) : [...s, f]);
  const copy = async () => { await navigator.clipboard.writeText(report); alert("Laudo copiado para a área de transferência."); };
  return <main>
    <header><div className="brand"><span className="brand-mark">R</span><span>RADIO<span>VET</span></span></div><div className="header-note">Biblioteca clínica para apoio descritivo</div></header>
    <section className="hero"><div><p className="eyebrow">LAUDOS RADIOGRÁFICOS VETERINÁRIOS</p><h1>Do achado ao laudo,<br/><em>com clareza.</em></h1><p className="hero-copy">Pesquise modelos de descrição, selecione os achados e construa um texto clínico consistente em poucos passos.</p></div><div className="hero-card"><span>Biblioteca organizada</span><strong>{findings.length} modelos essenciais</strong><small>Crânio · Coluna · Tórax · Abdômen · Membros</small></div></section>
    <section className="workspace"><aside><p className="section-label">1. ENCONTRE O ACHADO</p><label className="search"><span>⌕</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por alteração, região..." /></label><div className="filters">{regions.map((r) => <button key={r} className={region === r ? "active" : ""} onClick={() => setRegion(r)}>{r}</button>)}</div><div className="result-count">{filtered.length} modelos encontrados</div><div className="cards">{filtered.map((f) => <article key={f.title} className={selected.some(x => x.title === f.title) ? "selected" : ""} onClick={() => toggle(f)}><div className="card-top"><span>{f.region}</span><b>{selected.some(x => x.title === f.title) ? "✓ ADICIONADO" : "+ ADICIONAR"}</b></div><h3>{f.title}</h3><p>{f.text}</p><div className="tags">{f.tags.map(t => <i key={t}>{t}</i>)}</div></article>)}</div></aside>
      <section className="report"><div className="report-top"><div><p className="section-label">2. MONTE O LAUDO</p><h2>Seu relatório</h2></div><button className="clear" onClick={() => setSelected([])}>Limpar</button></div><input className="patient" value={patient} onChange={(e) => setPatient(e.target.value)} placeholder="Paciente (opcional)" /><pre>{report}</pre><div className="report-actions"><button className="secondary" onClick={() => { const b=new Blob([report],{type:"text/plain"}); const a=document.createElement("a"); a.href=URL.createObjectURL(b); a.download="laudo-radiografico.txt"; a.click(); }}>Baixar .txt</button><button className="primary" onClick={copy}>Copiar laudo</button></div><p className="disclaimer">Ferramenta de apoio. A interpretação e responsabilidade técnica são exclusivas do médico-veterinário.</p></section>
    </section>
  </main>;
}
