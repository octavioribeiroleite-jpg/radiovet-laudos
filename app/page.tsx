"use client";

import { useMemo, useState } from "react";
import ebookFindings from "./findings.json";

type VisualReference = { src: string; alt: string; caption: string; source: string };
type Reference = {
  id: string;
  title: string;
  region: string;
  model: string;
  impression: string;
  appearance: string[];
  readingGuide: string[];
  differentials: string[];
  source: string;
  visual?: VisualReference;
  kind?: "pre-laudo" | "alteração";
};
type Draft = { id: string; title: string; region: string; description: string; impression: string; comment: string };

const cranioPreLaudo = `- Calota craniana sem alterações radiográficas dignas de nota;\n- Cavidades nasais, seios frontais e osso vômer com adequada visibilização do padrão trabecular de conchas nasais e etmoturbinados;\n- Corpos mandibulares e ramos maxilares sem evidências radiográficas de alterações;\n- Arcos zigomáticos preservados;\n- Articulações temporomandibulares congruentes e coaptadas;\n- Bulas timpânicas e condutos auditivos preservados;\n- Dentes e alvéolos dentários habituais;\n- Demais estruturas passíveis de avaliação sem evidências radiográficas sugestivas de alterações pelas incidências realizadas.`;

const regionGuide: Record<string, string[]> = {
  "Crânio": ["Avalie simetria e contornos ósseos.", "Compare radiopacidade das cavidades e seios.", "Procure lise, proliferação e efeito de massa."],
  "Cervical": ["Siga o lúmen da faringe, laringe e traqueia.", "Avalie espessura e deslocamento de tecidos moles.", "Confirme a alteração em mais de uma projeção."],
  "Coluna": ["Identifique o segmento e a vértebra.", "Avalie alinhamento, espaço intervertebral e placas terminais.", "Procure proliferação, lise e possível comprometimento do canal."],
  "Membros": ["Defina osso, lado e terço acometido.", "Descreva cortical, medular, periósteo e tecidos moles.", "Classifique agressividade, alinhamento e extensão."],
  "Coxal": ["Compare congruência e simetria bilateral.", "Avalie acetábulo, cabeça e colo femoral.", "Procure remodelamento e osteófitos periarticulares."],
  "Tórax": ["Determine o padrão pulmonar predominante.", "Avalie distribuição e intensidade.", "Revise silhueta cardíaca, pleura, mediastino e vias aéreas."],
  "Abdômen": ["Localize a alteração por compartimento e órgão.", "Descreva tamanho, forma, margens e radiopacidade.", "Avalie deslocamentos e efeitos sobre estruturas vizinhas."],
  "Gestacional": ["Conte estruturas fetais individualizáveis.", "Avalie mineralização, posicionamento e vitalidade quando aplicável.", "Registre limitações da estimativa radiográfica."],
  "Outros": ["Localize a estrutura com precisão.", "Descreva forma, margens, radiopacidade e distribuição.", "Correlacione com histórico e incidências realizadas."],
};

const chapterByRegion: Record<string, string> = {
  "Crânio": "Thrall, Diagnóstico de Radiologia Veterinária, 6ª ed., cap. 8.",
  "Cervical": "Thrall, Diagnóstico de Radiologia Veterinária, 6ª ed., seções de cabeça, pescoço e vias aéreas.",
  "Coluna": "Thrall, Diagnóstico de Radiologia Veterinária, 6ª ed., cap. 11.",
  "Membros": "Thrall, Diagnóstico de Radiologia Veterinária, 6ª ed., seção do esqueleto apendicular.",
  "Coxal": "Thrall, Diagnóstico de Radiologia Veterinária, 6ª ed., seção do esqueleto apendicular.",
  "Tórax": "Thrall, Diagnóstico de Radiologia Veterinária, 6ª ed., seção do tórax.",
  "Abdômen": "Thrall, Diagnóstico de Radiologia Veterinária, 6ª ed., seção do abdômen.",
  "Gestacional": "Thrall, Diagnóstico de Radiologia Veterinária, 6ª ed., seção do trato reprodutivo.",
  "Outros": "Thrall, Diagnóstico de Radiologia Veterinária, 6ª ed.",
};

const clinicalDetails: Record<string, Partial<Reference>> = {
  "Hidrocefalia": {
    impression: "Achados radiográficos sugestivos de hidrocefalia.",
    appearance: ["Abaulamento da calota craniana.", "Adelgaçamento das corticais.", "Aspecto homogêneo da calvária e fontanela persistente."],
    differentials: ["Variações conformacionais do crânio.", "Outras causas de aumento do volume craniano."],
    source: "Thrall, 6ª ed., cap. 8, pp. 269-270.",
    visual: { src: "/reference-images/hidrocefalia-thrall-p270.png", alt: "Radiografia lateral de crânio canino com hidrocefalia grave", caption: "A calvária apresenta aspecto homogêneo e perda das marcações normais.", source: "Thrall, 6ª ed., Fig. 8-4, p. 270." },
  },
  "Displasia do Occipital": {
    impression: "Achados compatíveis com displasia occipital.",
    appearance: ["Extensão dorsal do forame magno.", "Alteração de forma do osso occipital.", "A avaliação é mais precisa por TC do que por radiografia."],
    differentials: ["Variação morfológica em braquicefálicos.", "Malformação do tipo Chiari."],
    source: "Thrall, 6ª ed., cap. 8, p. 271.",
    visual: { src: "/reference-images/displasia-occipital-thrall-p271.png", alt: "Reconstrução tomográfica do osso occipital com extensão dorsal do forame magno", caption: "A imagem demonstra a extensão dorsal do forame magno e áreas displásicas do osso occipital.", source: "Thrall, 6ª ed., Fig. 8-6, p. 271." },
  },
  "Hiperostose da Calota Craniana": {
    impression: "Proliferação óssea lisa compatível com hiperostose da calota craniana.",
    appearance: ["Espessamento ósseo liso e progressivo.", "Acometimento variável e por vezes assimétrico.", "Possível redução dos seios frontais por hiperostose periférica."],
    differentials: ["Osteopatia craniomandibular.", "Processo proliferativo ósseo de outra origem."],
    source: "Thrall, 6ª ed., cap. 8, pp. 301-302.",
    visual: { src: "/reference-images/hiperostose-thrall-p302.png", alt: "Radiografia lateral de crânio canino com hiperostose", caption: "Há espessamento liso das corticais mandibular, nasal dorsal e da calota craniana.", source: "Thrall, 6ª ed., Fig. 8-33, p. 302." },
  },
  "Hemivértebra": {
    impression: "Alteração morfológica vertebral compatível com hemivértebra.",
    appearance: ["Corpo vertebral em cunha na projeção lateral.", "Aspecto de borboleta na projeção ventrodorsal.", "Pode ocorrer isoladamente ou em múltiplos níveis."],
    differentials: ["Vértebra em bloco.", "Outras malformações vertebrais congênitas."],
    source: "Thrall, 6ª ed., cap. 11, pp. 398-399.",
    visual: { src: "/reference-images/hemivertebra-thrall-p399.png", alt: "Radiografia e reconstrução tridimensional de coluna torácica com hemivértebras", caption: "Múltiplas hemivértebras torácicas alteram a morfologia e o alinhamento vertebral.", source: "Thrall, 6ª ed., Fig. 11-8, p. 399." },
  },
};

function directImpression(title: string, raw: string) {
  const lower = raw.toLowerCase();
  if (lower.startsWith("imagens que sugerem") || lower.startsWith("sugestivo de") || lower.startsWith("sugestiva de")) {
    return `Achados radiográficos sugestivos de ${title.toLowerCase()}.`;
  }
  if (lower.startsWith("relacionado a") || lower.startsWith("relacionada a") || lower.startsWith("compatível com")) {
    return `Achados radiográficos compatíveis com ${title.toLowerCase()}.`;
  }
  return raw;
}

const references: Reference[] = [
  { id: "pre-laudo-cranio", title: "Pré-laudo Crânio", region: "Crânio", kind: "pre-laudo", model: cranioPreLaudo, impression: "Estruturas cranianas avaliadas sem alterações radiográficas dignas de nota.", appearance: ["Calota e estruturas ósseas preservadas.", "Cavidades, seios e bulas sem alterações.", "Articulações e estruturas dentárias habituais."], readingGuide: regionGuide["Crânio"], differentials: [], source: "Ebook 200 Descrições de Alterações Radiográficas, seção Pré-laudos." },
  ...ebookFindings.map((item, index) => {
    const parts = item.text.split(/\s+[–-]\s+(?=[A-ZÀ-Ú])/);
    const last = parts.at(-1)?.trim() || item.text;
    const description = parts[0]?.trim() || item.text;
    const detail = clinicalDetails[item.title] || {};
    const appearance = description.split(/,\s+/).map((part) => part.trim().replace(/[.;]$/, "")).filter(Boolean).slice(0, 4);
    return {
      id: `ebook-${index}`,
      title: item.title,
      region: item.region,
      kind: "alteração" as const,
      model: description,
      impression: directImpression(item.title, last),
      appearance,
      readingGuide: regionGuide[item.region] || regionGuide["Outros"],
      differentials: ["Correlacionar com sinais clínicos, histórico e exames complementares."],
      source: chapterByRegion[item.region] || chapterByRegion["Outros"],
      ...detail,
    };
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
    <header><div className="brand"><span className="brand-mark">R</span><span>RADIO<span>VET</span></span></div><p>Ficha de consulta</p><button className="back" type="button" onClick={() => setActive(null)}>← Voltar à biblioteca</button></header>
    <section className="writing-head"><p className="eyebrow">{active.kind === "pre-laudo" ? "MODELO PRONTO" : "ALTERAÇÃO RADIOGRÁFICA"} · {active.region.toUpperCase()}</p><h1>{active.title}</h1><p>Veja como a alteração aparece, consulte uma descrição completa e leve uma impressão diagnóstica direta para o seu rascunho.</p></section>
    <section className="clinical-grid">
      <section className="clinical-reference">
        <article className="ready-texts">
          <div className="ready-block"><p className="section-label">DESCRIÇÃO COMPLETA</p><p>{active.model}</p></div>
          <div className="ready-block impression-ready"><p className="section-label">IMPRESSÃO DIRETA</p><p>{active.impression}</p></div>
        </article>
        <article className="recognition-card"><p className="section-label">COMO ESSA ALTERAÇÃO APARECE</p><h2>O que procurar na imagem</h2><ul>{active.appearance.map((item) => <li key={item}>{item}</li>)}</ul></article>
        {active.visual && <figure className="visual-reference"><img src={active.visual.src} alt={active.visual.alt} /><figcaption><b>{active.visual.caption}</b><span>{active.visual.source}</span></figcaption></figure>}
        <article className="consult-card"><div><p className="section-label">ROTEIRO DE LEITURA</p><ul>{active.readingGuide.map((item) => <li key={item}>{item}</li>)}</ul></div><div><p className="section-label">DIFERENCIAIS E CUIDADOS</p><ul>{active.differentials.length ? active.differentials.map((item) => <li key={item}>{item}</li>) : <li>Não se aplica ao modelo de normalidade.</li>}</ul></div><p className="source-line">Fonte de consulta: {active.source}</p></article>
      </section>
      <article className="editor-card clinical-editor"><p className="section-label">ADAPTE PARA O SEU CASO</p><h2>Seu texto</h2><p className="editor-help">A descrição e a impressão já estão completas. Ajuste apenas localização, lateralidade, intensidade e particularidades do exame.</p><label>Descrição radiográfica<textarea value={description} onChange={(event) => setDescription(event.target.value)} /></label><label>Impressão diagnóstica<textarea value={impression} onChange={(event) => setImpression(event.target.value)} /></label><label>Comentário <small>opcional</small><textarea value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Sugestão de exame complementar, controle ou ressalva." /></label><div className="writing-actions"><button type="button" className="secondary" onClick={() => setActive(null)}>Cancelar</button><button type="button" className="primary" onClick={saveDraft}>Salvar no rascunho</button></div></article>
    </section>
  </main>;

  return <main>
    <header><div className="brand"><span className="brand-mark">R</span><span>RADIO<span>VET</span></span></div><p>Biblioteca de aprendizado</p><span className="header-note">Leia um modelo, abra e escreva por etapas.</span></header>
    <section className="intro"><p className="eyebrow">200 FICHAS RADIOGRÁFICAS</p><h1>Reconheça a alteração.<br/><em>Descreva com segurança.</em></h1><p>Cada ficha reúne descrição completa, impressão direta, sinais para procurar e um roteiro de leitura. As referências visuais do Thrall estão sendo integradas às alterações correspondentes.</p></section>
    <section className="learning-layout">
      <aside className="region-nav"><p className="section-label">NAVEGAR POR REGIÃO</p>{["Todos", ...regionOrder.filter((item) => references.some((reference) => reference.region === item))].map((item) => <button type="button" className={region === item ? "active" : ""} onClick={() => setRegion(item)} key={item}>{item}<span>{item === "Todos" ? references.length : references.filter((reference) => reference.region === item).length}</span></button>)}</aside>
      <section className="library"><div className="library-head"><div><p className="section-label">FICHAS PARA CONSULTA</p><h2>{region === "Todos" ? "Escolha uma região" : region}</h2></div><label className="search"><span>⌕</span><input aria-label="Buscar modelo" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar alteração ou estrutura" /></label></div><div className="reference-grid">{visible.map((item) => <article className={`learning-card ${item.kind === "pre-laudo" ? "ready-model" : ""}`} key={item.id}>{item.visual && <div className="card-image"><img src={item.visual.src} alt="" /><span>Referência visual</span></div>}<div className="card-meta"><span>{item.kind === "pre-laudo" ? "PRÉ-LAUDO" : item.region.toUpperCase()}</span><small>{item.region}</small></div><h3>{item.title}</h3><p>{item.model}</p><div className="card-impression"><b>Impressão direta</b><span>{item.impression}</span></div><button type="button" onClick={() => openWriter(item)}>Consultar ficha e adaptar <span>→</span></button></article>)}</div></section>
      <aside className="draft-panel"><p className="section-label">MEU RASCUNHO</p><h2>Impressões</h2>{drafts.length ? <div className="draft-list">{drafts.map((draft) => <button type="button" key={draft.id} onClick={() => { const item = references.find((reference) => reference.id === draft.id); if (item) openWriter(item); }}><span>{draft.region}</span>{draft.title}</button>)}</div> : <div className="draft-empty"><b>Ainda vazio.</b><p>Abra um modelo e salve sua versão aqui.</p></div>}<pre>{output}</pre><div className="draft-actions"><button type="button" className="secondary" onClick={() => setDrafts([])} disabled={!drafts.length}>Limpar</button><button type="button" className="primary" onClick={copy}>{copied ? "Copiado" : "Copiar texto"}</button></div><p className="disclaimer">Ferramenta de estudo e apoio à redação. A interpretação e responsabilidade técnica são do médico-veterinário.</p></aside>
    </section>
  </main>;
}
