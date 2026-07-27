"use client";

import { useMemo, useState } from "react";
import ebookFindings from "./findings.json";

type Reference = { id: string; title: string; region: string; model: string; impression: string; kind?: "pre-laudo" | "alteração" };
type Draft = { id: string; title: string; region: string; description: string; impression: string; comment: string };

const cranioPreLaudo = `- Calota craniana sem alterações radiográficas dignas de nota;\n- Cavidades nasais, seios frontais e osso vômer com adequada visibilização do padrão trabecular de conchas nasais e etmoturbinados;\n- Corpos mandibulares e ramos maxilares sem evidências radiográficas de alterações;\n- Arcos zigomáticos preservados;\n- Articulações temporomandibulares congruentes e coaptadas;\n- Bulas timpânicas e condutos auditivos preservados;\n- Dentes e alvéolos dentários habituais;\n- Demais estruturas passíveis de avaliação sem evidências radiográficas sugestivas de alterações pelas incidências realizadas.`;

const references: Reference[] = [
  { id: "pre-laudo-cranio", title: "Pré-laudo Crânio", region: "Crânio", kind: "pre-laudo", model: cranioPreLaudo, impression: "Estruturas cranianas avaliadas sem alterações radiográficas dignas de nota." },
  ...ebookFindings.map((item, index) => {
    const parts = item.text.split(/\s+[–-]\s+(?=[A-ZÀ-Ú])/);
    const last = parts.at(-1)?.trim() || item.text;
    return { id: `ebook-${index}`, title: item.title, region: item.region, kind: "alteração" as const, model: item.text, impression: last };
  }),
];

const regionOrder = ["Crânio", "Cervical", "Coluna", "Membros", "Coxal", "Tórax", "Abdômen", "Gestacional", "Outros"];

export default function Home() {
  const [region, setRegion] = useState("Todos");
  const [search, setSearch] = useState("");
  const [active, setActive] = useState<Reference | null>(null);
  const [description, setDescription] = useState("");
  const [impression, setImpression] = useState("");
  const [comment, setComment] = useState("");
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [copied, setCopied] = useState(false);

  const visible = useMemo(() => references.filter((item) => {
    const text = `${item.title} ${item.region} ${item.model}`.toLowerCase();
    return (region === "Todos" || item.region === region) && text.includes(search.toLowerCase());
  }), [region, search]);
  const output = `IMPRESSÕES DIAGNÓSTICAS\n${drafts.length ? drafts.map((draft) => `- ${draft.impression.trim()}`).join("\n") : "- [Adicione uma impressão diagnóstica]"}${drafts.some((draft) => draft.comment.trim()) ? `\n\nCOMENTÁRIOS\n${drafts.filter((draft) => draft.comment.trim()).map((draft) => draft.comment.trim()).join("\n")}` : ""}`;
  const openWriter = (item: Reference) => {
    const existing = drafts.find((draft) => draft.id === item.id);
    setActive(item); setDescription(existing?.description ?? item.model); setImpression(existing?.impression ?? item.impression); setComment(existing?.comment ?? "");
  };
  const saveDraft = () => {
    if (!active || !impression.trim()) return;
    const draft = { id: active.id, title: active.title, region: active.region, description: description.trim(), impression: impression.trim(), comment: comment.trim() };
    setDrafts((current) => current.some((item) => item.id === draft.id) ? current.map((item) => item.id === draft.id ? draft : item) : [...current, draft]);
    setActive(null);
  };
  const copy = async () => { await navigator.clipboard.writeText(output); setCopied(true); window.setTimeout(() => setCopied(false), 1800); };

  if (active) return <main className="writing-mode">
    <header><div className="brand"><span className="brand-mark">R</span><span>RADIO<span>VET</span></span></div><p>Modo de escrita</p><button className="back" type="button" onClick={() => setActive(null)}>← Voltar à biblioteca</button></header>
    <section className="writing-head"><p className="eyebrow">{active.kind === "pre-laudo" ? "MODELO PRONTO" : "ALTERAÇÃO RADIOGRÁFICA"} · {active.region.toUpperCase()}</p><h1>{active.title}</h1><p>Leia o modelo ao lado e transforme-o no seu próprio texto. O rascunho final continua começando pelas impressões diagnósticas.</p></section>
    <section className="writing-grid">
      <article className="study-card"><p className="section-label">01 · LEIA O MODELO</p><h2>Como o achado é descrito</h2><p className="study-copy">{active.model}</p><div className="learning-note"><b>Para aprender</b><span>Localize a estrutura, descreva o padrão e só então conclua o que ele sugere.</span></div></article>
      <article className="editor-card"><p className="section-label">02 · ESCREVA A SUA VERSÃO</p><h2>Faça por partes</h2><label>Descrição radiográfica<textarea value={description} onChange={(event) => setDescription(event.target.value)} /></label><label>Impressão diagnóstica<textarea value={impression} onChange={(event) => setImpression(event.target.value)} /></label><label>Comentário <small>opcional</small><textarea value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Sugestão de exame complementar, controle ou ressalva." /></label><div className="writing-actions"><button type="button" className="secondary" onClick={() => setActive(null)}>Cancelar</button><button type="button" className="primary" onClick={saveDraft}>Salvar no rascunho</button></div></article>
      <aside className="writing-tip"><span>✦</span><h3>Como usar</h3><ol><li>Leia a descrição pronta.</li><li>Adapte lateralidade, intensidade e localização.</li><li>Revise a impressão antes de salvar.</li></ol></aside>
    </section>
  </main>;

  return <main>
    <header><div className="brand"><span className="brand-mark">R</span><span>RADIO<span>VET</span></span></div><p>Biblioteca de aprendizado</p><span className="header-note">Leia um modelo, abra e escreva por etapas.</span></header>
    <section className="intro"><p className="eyebrow">200 DESCRIÇÕES RADIOGRÁFICAS</p><h1>Leia o modelo.<br/><em>Depois, escreva o seu.</em></h1><p>Uma biblioteca de alterações e pré-laudos para estudo. Ao abrir uma referência, você recebe um modo de escrita simples para adaptar a descrição e a impressão diagnóstica.</p></section>
    <section className="learning-layout">
      <aside className="region-nav"><p className="section-label">NAVEGAR POR REGIÃO</p>{["Todos", ...regionOrder.filter((item) => references.some((reference) => reference.region === item))].map((item) => <button type="button" className={region === item ? "active" : ""} onClick={() => setRegion(item)} key={item}>{item}<span>{item === "Todos" ? references.length : references.filter((reference) => reference.region === item).length}</span></button>)}</aside>
      <section className="library"><div className="library-head"><div><p className="section-label">MODELOS PARA ESTUDO</p><h2>{region === "Todos" ? "Escolha uma região" : region}</h2></div><label className="search"><span>⌕</span><input aria-label="Buscar modelo" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar alteração ou estrutura" /></label></div><div className="reference-grid">{visible.map((item) => <article className={`learning-card ${item.kind === "pre-laudo" ? "ready-model" : ""}`} key={item.id}><div className="card-meta"><span>{item.kind === "pre-laudo" ? "PRÉ-LAUDO" : item.region.toUpperCase()}</span><small>{item.region}</small></div><h3>{item.title}</h3><p>{item.model}</p><button type="button" onClick={() => openWriter(item)}>Abrir modo de escrita <span>→</span></button></article>)}</div></section>
      <aside className="draft-panel"><p className="section-label">MEU RASCUNHO</p><h2>Impressões</h2>{drafts.length ? <div className="draft-list">{drafts.map((draft) => <button type="button" key={draft.id} onClick={() => { const item = references.find((reference) => reference.id === draft.id); if (item) openWriter(item); }}><span>{draft.region}</span>{draft.title}</button>)}</div> : <div className="draft-empty"><b>Ainda vazio.</b><p>Abra um modelo e salve sua versão aqui.</p></div>}<pre>{output}</pre><div className="draft-actions"><button type="button" className="secondary" onClick={() => setDrafts([])} disabled={!drafts.length}>Limpar</button><button type="button" className="primary" onClick={copy}>{copied ? "Copiado" : "Copiar texto"}</button></div><p className="disclaimer">Ferramenta de estudo e apoio à redação. A interpretação e responsabilidade técnica são do médico-veterinário.</p></aside>
    </section>
  </main>;
}
