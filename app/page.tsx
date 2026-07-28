"use client";

import { useEffect, useMemo, useState } from "react";
import ebookFindings from "./findings.json";
import { getThrallContext, thrallStudyGuides } from "./thrall-context";

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
  suggestedComment?: string;
  visual?: VisualReference;
  kind?: "pre-laudo" | "alteração";
};
type Draft = { id: string; title: string; region: string; fullText: string };

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

type NormalLine = { avoid: string[]; text: string };
const normalLinesByRegion: Record<string, NormalLine[]> = {
  "Crânio": [
    { avoid: ["nasal", "seio", "vômer", "rinite"], text: "Cavidades nasais e seios frontais simétricos, com radiopacidade e contornos preservados." },
    { avoid: ["temporomandibular", "mandíbula", "mandibular"], text: "Articulações temporomandibulares congruentes e coaptadas." },
    { avoid: ["otite", "bula", "auditivo"], text: "Bulas timpânicas e condutos auditivos com radiopacidade e contornos preservados." },
    { avoid: ["dent", "periodontal", "periapical", "maxilar"], text: "Dentes e alvéolos dentários avaliados sem alterações radiográficas adicionais." },
  ],
  "Cervical": [
    { avoid: ["palato", "faring", "laringe"], text: "Nasofaringe, orofaringe e laringe com lúmen e contornos preservados." },
    { avoid: ["traque"], text: "Traqueia cervical com diâmetro uniforme e trajeto preservado." },
    { avoid: ["esôfago", "esofág"], text: "Não há evidências de dilatação ou conteúdo radiopaco no trajeto esofágico cervical." },
    { avoid: ["hióide"], text: "Aparelho hioide com alinhamento e integridade preservados." },
  ],
  "Coluna": [
    { avoid: ["luxação", "listese", "instabilidade", "fratura"], text: "Alinhamento vertebral preservado nos demais segmentos avaliados." },
    { avoid: ["disco", "intervertebral", "espondil"], text: "Demais espaços intervertebrais com altura regular, sem sinais de colapso ou estreitamento." },
    { avoid: ["forame", "compress"], text: "Forames intervertebrais com dimensões e contornos preservados." },
    { avoid: ["processo", "osteofit", "espondil"], text: "Processos espinhosos, transversos e articulares sem alterações radiográficas adicionais." },
  ],
  "Membros": [
    { avoid: ["fratura", "luxação", "subluxação"], text: "Alinhamento ósseo e relações articulares preservados nas demais estruturas avaliadas." },
    { avoid: ["osteólise", "neopl", "tumor", "osteomiel"], text: "Corticais e cavidades medulares remanescentes com radiopacidade e contornos preservados." },
    { avoid: ["artrose", "osteoart", "artrite", "patelar"], text: "Demais superfícies articulares regulares, sem proliferações periarticulares significativas." },
    { avoid: ["edema", "tecido mole", "massa"], text: "Tecidos moles adjacentes sem alterações radiográficas dignas de nota." },
  ],
  "Coxal": [
    { avoid: ["sacroilíaca", "sacroiliaca"], text: "Articulações sacroilíacas simétricas e congruentes." },
    { avoid: ["coxofemoral", "quadril", "femoral"], text: "Articulações coxofemorais com congruência e cobertura acetabular preservadas." },
    { avoid: ["pelve", "pélv", "fratura"], text: "Ossos da pelve com corticais contínuas e trabeculado ósseo preservado." },
    { avoid: ["massa", "tecido mole"], text: "Tecidos moles da região pélvica sem alterações radiográficas adicionais." },
  ],
  "Tórax": [
    { avoid: ["traque", "brônqu", "bronqu"], text: "Traqueia com diâmetro uniforme e trajeto preservado." },
    { avoid: ["cardio", "coração", "pericárd"], text: "Silhueta cardíaca com dimensões e contornos preservados." },
    { avoid: ["mediast"], text: "Mediastino e estruturas hilares sem alterações radiográficas dignas de nota." },
    { avoid: ["pleural", "pneumotórax", "pneumotorax"], text: "Espaço pleural sem evidências de líquido ou gás livre." },
    { avoid: ["pulmon", "pneumonia", "bronco", "alveolar", "intersticial"], text: "Campos pulmonares remanescentes com radiopacidade preservada." },
  ],
  "Abdômen": [
    { avoid: ["efusão", "peritoneal"], text: "Detalhamento seroso abdominal preservado." },
    { avoid: ["hepato", "fígado", "espleno", "baço", "renal", "rim"], text: "Silhuetas hepática, esplênica e renais com dimensões e contornos preservados." },
    { avoid: ["gástr", "intestinal", "esôfago", "corpo estranho", "obstru"], text: "Estômago e alças intestinais com distribuição e conteúdo dentro do esperado." },
    { avoid: ["vesical", "bexiga", "cist", "uro"], text: "Bexiga urinária com contornos regulares e conteúdo homogêneo." },
  ],
  "Gestacional": [
    { avoid: [], text: "Demais estruturas abdominais passíveis de avaliação sem alterações radiográficas adicionais." },
  ],
  "Outros": [
    { avoid: [], text: "Demais estruturas avaliadas sem alterações radiográficas dignas de nota." },
  ],
};

function recommendedComment(item: Reference) {
  if (item.suggestedComment) return item.suggestedComment;
  const title = item.title.toLowerCase();
  if (/hidrocef|occipital|vertebral|coluna|disco|wobbler|atlanto|neurol/.test(title)) return "A critério clínico, na presença de sinais neurológicos, sugere-se tomografia computadorizada e/ou ressonância magnética para melhor caracterização.";
  if (/fratura|luxação|subluxação|ruptura|instabilidade/.test(title)) return "A critério clínico, sugere-se avaliação ortopédica e controle por imagem após a instituição das medidas terapêuticas.";
  if (/neopl|tumor|massa|nódulo|nodulo/.test(title)) return "Sugere-se complementação diagnóstica para caracterização e estadiamento, conforme a localização do achado.";
  if (/cardio|pericárd|coração/.test(title)) return "A critério clínico, sugere-se avaliação ecocardiográfica para melhor caracterização.";
  if (/pneumotórax|pleural/.test(title)) return "Recomenda-se correlação imediata com a condição respiratória e avaliação complementar do espaço pleural conforme indicação clínica.";
  if (/pulmon|pneumonia|bronco|traque/.test(title)) return "Sugere-se correlação com histórico, ausculta, hemograma e acompanhamento radiográfico conforme evolução clínica.";
  if (/corpo estranho|obstrução|gástr|intestinal/.test(title)) return "A critério clínico, sugere-se ultrassonografia abdominal e avaliação cirúrgica conforme os sinais de obstrução.";
  if (/gesta|prenhez|fetal|feto/.test(title)) return "A estimativa radiográfica deve ser correlacionada com ultrassonografia e acompanhamento obstétrico.";
  return "A critério clínico, sugere-se correlação com histórico, exame físico e exames complementares pertinentes.";
}

function completeDescription(item: Reference) {
  if (item.kind === "pre-laudo") return item.model;
  const title = item.title.toLowerCase();
  const main = item.model.trim().replace(/[.;]$/, "");
  const normalLines = (normalLinesByRegion[item.region] || normalLinesByRegion["Outros"])
    .filter((line) => !line.avoid.some((term) => title.includes(term)))
    .map((line) => `- ${line.text}`);
  return [`- ${main}.`, ...normalLines, "- Demais estruturas passíveis de avaliação sem alterações radiográficas dignas de nota."].join("\n");
}

function fullModelText(item: Reference) {
  return `RELATÓRIO RADIOGRÁFICO
${completeDescription(item)}

IMPRESSÕES DIAGNÓSTICAS
- ${item.impression}

COMENTÁRIOS
- ${recommendedComment(item)}`;
}

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
  "Displasia Coxofemoral": {
    impression: "Achados radiográficos compatíveis com displasia coxofemoral.",
    appearance: ["Subluxação ou incongruência coxofemoral.", "Cobertura acetabular reduzida da cabeça femoral.", "Remodelamento da cabeça e do colo femoral quando há doença degenerativa associada."],
    differentials: ["Frouxidão articular sem osteoartrose.", "Posicionamento inadequado simulando incongruência."],
    source: "Thrall, 6ª ed., cap. 18, pp. 729-730.",
    visual: { src: "/reference-images/displasia-coxofemoral-thrall-p730.png", alt: "Estudo radiográfico PennHIP de articulações coxofemorais", caption: "As projeções em compressão e distração evidenciam e quantificam a subluxação coxofemoral.", source: "Thrall, 6ª ed., Fig. 18-35, p. 730." },
  },
  "Luxação Patelar": {
    impression: "Deslocamento patelar compatível com luxação patelar.",
    appearance: ["Patela fora do sulco troclear.", "Deslocamento e rotação em relação ao eixo normal do membro.", "Aumento aparente da dimensão craniocaudal da patela na projeção lateral."],
    differentials: ["Posicionamento ou rotação inadequados.", "Subluxação patelar intermitente."],
    source: "Thrall, 6ª ed., cap. 19, pp. 772-773.",
    visual: { src: "/reference-images/luxacao-patelar-thrall-p773.png", alt: "Radiografia de joelho com luxação patelar lateral", caption: "A patela está deslocada lateralmente e sobreposta à tróclea femoral.", source: "Thrall, 6ª ed., Fig. 19-6, p. 773." },
  },
  "Efusão/ Derrame Pleural": {
    impression: "Achados radiográficos compatíveis com efusão pleural.",
    appearance: ["Alargamento das fissuras interlobares.", "Retração das margens pulmonares.", "Aumento difuso da radiopacidade torácica e perda variável do contorno cardíaco."],
    differentials: ["Espessamento pleural.", "Artefato conformacional da parede torácica.", "Massa pleural ou extrapleural."],
    source: "Thrall, 6ª ed., cap. 31, pp. 1222-1235.",
    visual: { src: "/reference-images/efusao-pleural-thrall-p1227.png", alt: "Radiografias torácicas de cão com efusão pleural moderada", caption: "Fissuras interlobares, retração pulmonar e aumento da radiopacidade variam conforme a projeção.", source: "Thrall, 6ª ed., Fig. 31-6, p. 1227." },
  },
  "Pneumotórax": {
    impression: "Achados radiográficos compatíveis com pneumotórax.",
    appearance: ["Ar livre no espaço pleural.", "Retração dos lobos pulmonares em relação à parede torácica.", "Separação entre coração e esterno e aumento da radiotransparência pleural."],
    differentials: ["Dobras cutâneas.", "Tórax muito profundo ou hipovolemia simulando elevação cardíaca.", "Bolhas ou cistos pulmonares."],
    source: "Thrall, 6ª ed., cap. 31, pp. 1236-1245.",
    visual: { src: "/reference-images/pneumotorax-thrall-p1238.png", alt: "Radiografias torácicas de cão com pneumotórax moderado", caption: "O ar pleural causa retração pulmonar dorsocaudal e separação entre coração e esterno.", source: "Thrall, 6ª ed., Fig. 31-16, p. 1238." },
  },
  "Corpo Estranho Intestinal": {
    impression: "Achados radiográficos sugestivos de corpo estranho gastrointestinal com possível obstrução.",
    appearance: ["Dilatação focal ou segmentar de alças intestinais.", "Conteúdo gasoso e de tecido mole com aspecto mosqueado.", "Plicatura intestinal quando há componente linear."],
    differentials: ["Íleo funcional.", "Enterite focal.", "Massa ou estenose intestinal."],
    source: "Thrall, 6ª ed., cap. 44, p. 1700.",
    visual: { src: "/reference-images/corpo-estranho-thrall-p1700.png", alt: "Radiografias abdominais com corpo estranho gastrointestinal linear", caption: "A redistribuição do gás evidencia corpo estranho e plicatura do duodeno proximal.", source: "Thrall, 6ª ed., Fig. 44-7, p. 1700." },
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
  const [fullText, setFullText] = useState("");
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [draftsLoaded, setDraftsLoaded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem("radiovet-drafts");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) setDrafts(parsed.filter((draft) => draft?.id && draft?.fullText));
      }
    } catch {
      window.localStorage.removeItem("radiovet-drafts");
    } finally {
      setDraftsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (draftsLoaded) window.localStorage.setItem("radiovet-drafts", JSON.stringify(drafts));
  }, [drafts, draftsLoaded]);

  const visible = useMemo(() => references.filter((item) => {
    const text = `${item.title} ${item.region} ${item.model}`.toLowerCase();
    return (region === "Todos" || item.region === region) && text.includes(search.toLowerCase());
  }), [region, search]);
  const output = drafts.length ? drafts.map((draft) => draft.fullText.trim()).join("\n\n") : `RELATÓRIO RADIOGRÁFICO
- [Adicione um modelo da biblioteca]

IMPRESSÕES DIAGNÓSTICAS
- [Impressão diagnóstica]

COMENTÁRIOS
- [Comentário]`;
  const activeContext = active ? getThrallContext(active.title, active.region) : null;
  const openWriter = (item: Reference) => {
    const existing = drafts.find((draft) => draft.id === item.id);
    setSaved(false);
    setActive(item); setFullText(existing?.fullText ?? fullModelText(item));
  };
  const saveDraft = () => {
    if (!active || !fullText.trim()) return;
    const draft = { id: active.id, title: active.title, region: active.region, fullText: fullText.trim() };
    const nextDrafts = drafts.some((item) => item.id === draft.id) ? drafts.map((item) => item.id === draft.id ? draft : item) : [...drafts, draft];
    window.localStorage.setItem("radiovet-drafts", JSON.stringify(nextDrafts));
    setDrafts(nextDrafts);
    setActive(null);
    setSaved(true);
  };
  const copy = async () => { await navigator.clipboard.writeText(output); setCopied(true); window.setTimeout(() => setCopied(false), 1800); };

  if (guideOpen) return <main className="thrall-guide-page">
    <header><div className="brand"><span className="brand-mark">R</span><span>RADIO<span>VET</span></span></div><p>Guia de interpretação</p><button className="back" type="button" onClick={() => setGuideOpen(false)}>← Voltar à biblioteca</button></header>
    <section className="guide-hero"><p className="eyebrow">THRALL · 6ª EDIÇÃO · SÍNTESE APLICADA</p><h1>Entenda o sinal antes de concluir.</h1><p>Um roteiro prático para transformar a observação radiográfica em descrição, impressão e recomendação. O conteúdo foi organizado para consulta rápida e não substitui a leitura integral da obra.</p><div className="guide-stats"><span><b>{references.length}</b> fichas relacionadas</span><span><b>{thrallStudyGuides.length}</b> módulos de leitura</span><span><b>45</b> capítulos revisados</span></div></section>
    <section className="guide-shell">
      <aside className="guide-index"><p className="section-label">NESTE GUIA</p>{thrallStudyGuides.map((guide, index) => <a href={`#${guide.id}`} key={guide.id}><span>{String(index + 1).padStart(2, "0")}</span>{guide.title}</a>)}</aside>
      <section className="guide-modules">{thrallStudyGuides.map((guide, index) => <article className="guide-module" id={guide.id} key={guide.id}><div className="guide-module-head"><span>{String(index + 1).padStart(2, "0")}</span><div><p>{guide.chapters}</p><h2>{guide.title}</h2></div></div><p className="guide-introduction">{guide.introduction}</p><div className="guide-essentials"><p className="section-label">IDEIAS ESSENCIAIS</p><ul>{guide.essentials.map((item) => <li key={item}>{item}</li>)}</ul></div><details><summary>Ver passo a passo e armadilhas</summary><div className="guide-details"><div><p className="section-label">SEQUÊNCIA DE LEITURA</p><ol>{guide.sequence.map((item) => <li key={item}>{item}</li>)}</ol></div><div><p className="section-label">ARMADILHAS</p><ul>{guide.traps.map((item) => <li key={item}>{item}</li>)}</ul></div></div></details></article>)}</section>
    </section>
  </main>;

  if (active) return <main className="writing-mode">
    <header><div className="brand"><span className="brand-mark">R</span><span>RADIO<span>VET</span></span></div><p>Ficha de consulta</p><button className="back" type="button" onClick={() => setActive(null)}>← Voltar à biblioteca</button></header>
    <section className="writing-head"><p className="eyebrow">{active.kind === "pre-laudo" ? "MODELO PRONTO" : "ALTERAÇÃO RADIOGRÁFICA"} · {active.region.toUpperCase()}</p><h1>{active.title}</h1><p>Veja como a alteração aparece, consulte uma descrição completa e leve uma impressão diagnóstica direta para o seu rascunho.</p></section>
    <section className="clinical-grid">
      <section className="clinical-reference">
        <article className="ready-texts">
          <div className="ready-block"><p className="section-label">MODELO COMPLETO</p><p>{fullModelText(active)}</p></div>
        </article>
        <article className="recognition-card"><p className="section-label">COMO ESSA ALTERAÇÃO APARECE</p><h2>O que procurar na imagem</h2><ul>{active.appearance.map((item) => <li key={item}>{item}</li>)}</ul></article>
        {active.visual && <figure className="visual-reference"><img src={active.visual.src} alt={active.visual.alt} /><figcaption><b>{active.visual.caption}</b><span>{active.visual.source}</span></figcaption></figure>}
        {activeContext && <article className="thrall-context-card"><div className="thrall-context-head"><div><p className="section-label">CONTEXTO THRALL</p><h2>{activeContext.chapterTitle}</h2></div><span>{activeContext.chapter}</span></div><p className="thrall-summary">{activeContext.summary}</p><div className="thrall-explain"><div><p className="section-label">POR QUE APARECE ASSIM</p><p>{activeContext.mechanism}</p></div><div><p className="section-label">QUANDO OUTRO EXAME AJUDA</p><p>{activeContext.nextStep}</p></div></div><details open><summary>O que confirmar antes de concluir</summary><ul>{activeContext.confirm.map((item) => <li key={item}>{item}</li>)}</ul></details><details><summary>Armadilhas e limitações</summary><ul>{activeContext.pitfalls.map((item) => <li key={item}>{item}</li>)}</ul></details><p className="context-source">{activeContext.evidence}</p></article>}
        <article className="consult-card"><div><p className="section-label">ROTEIRO DE LEITURA</p><ul>{active.readingGuide.map((item) => <li key={item}>{item}</li>)}</ul></div><div><p className="section-label">DIFERENCIAIS E CUIDADOS</p><ul>{active.differentials.length ? active.differentials.map((item) => <li key={item}>{item}</li>) : <li>Não se aplica ao modelo de normalidade.</li>}</ul></div><p className="source-line">Fonte de consulta: {active.source}</p></article>
      </section>
      <article className="editor-card clinical-editor"><p className="section-label">ADAPTE PARA O SEU CASO</p><h2>Modelo completo</h2><p className="editor-help">Todo o conteúdo está dentro de uma única caixa. Ajuste o texto livremente e salve o conjunto completo.</p><label>Relatório, impressões e comentários<textarea className="full-model-editor" value={fullText} onChange={(event) => setFullText(event.target.value)} /></label><div className="writing-actions"><button type="button" className="secondary" onClick={() => setActive(null)}>Cancelar</button><button type="button" className="primary" onClick={saveDraft}>Salvar modelo completo</button></div></article>
    </section>
  </main>;

  return <main>
    <header><div className="brand"><span className="brand-mark">R</span><span>RADIO<span>VET</span></span></div><p>Biblioteca de aprendizado</p><span className="header-note">Leia um modelo, entenda o sinal e adapte o texto.</span><button className="header-guide-button" type="button" onClick={() => setGuideOpen(true)}>Guia Thrall</button></header>
    {saved && <div className="save-notice" role="status">Modelo salvo no seu rascunho.</div>}
    <section className="intro"><p className="eyebrow">218 FICHAS + CONTEXTO THRALL</p><h1>Reconheça a alteração.<br/><em>Entenda por que aparece.</em></h1><p>Cada ficha reúne descrição completa, impressão direta, sinais para procurar, mecanismo radiográfico, limitações, armadilhas e indicação de exames complementares.</p><button className="intro-guide-button" type="button" onClick={() => setGuideOpen(true)}>Abrir guia de interpretação <span>→</span></button></section>
    <section className="learning-layout">
      <aside className="region-nav"><p className="section-label">NAVEGAR POR REGIÃO</p>{["Todos", ...regionOrder.filter((item) => references.some((reference) => reference.region === item))].map((item) => <button type="button" className={region === item ? "active" : ""} onClick={() => setRegion(item)} key={item}>{item}<span>{item === "Todos" ? references.length : references.filter((reference) => reference.region === item).length}</span></button>)}</aside>
      <section className="library"><div className="library-head"><div><p className="section-label">FICHAS PARA CONSULTA</p><h2>{region === "Todos" ? "Escolha uma região" : region}</h2></div><label className="search"><span>⌕</span><input aria-label="Buscar modelo" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar alteração ou estrutura" /></label></div><div className="reference-grid">{visible.map((item) => <article className={`learning-card ${item.kind === "pre-laudo" ? "ready-model" : ""}`} key={item.id}>{item.visual && <div className="card-image"><img src={item.visual.src} alt="" /><span>Referência visual</span></div>}<div className="card-meta"><span>{item.kind === "pre-laudo" ? "PRÉ-LAUDO" : item.region.toUpperCase()}</span><small>Modelo + contexto Thrall</small></div><h3>{item.title}</h3><p>{item.model}</p><div className="card-impression"><b>Impressão direta</b><span>{item.impression}</span></div><div className="thrall-badge">THRALL · {getThrallContext(item.title, item.region).chapter}</div><button type="button" onClick={() => openWriter(item)}>Abrir ficha completa <span>→</span></button></article>)}</div></section>
      <aside className="draft-panel"><p className="section-label">MEU RASCUNHO</p><h2>Modelo completo</h2>{drafts.length ? <div className="draft-list">{drafts.map((draft) => <button type="button" key={draft.id} onClick={() => { const item = references.find((reference) => reference.id === draft.id); if (item) openWriter(item); }}><span>{draft.region}</span>{draft.title}</button>)}</div> : <div className="draft-empty"><b>Ainda vazio.</b><p>Abra uma ficha e salve o modelo completo aqui.</p></div>}<pre>{output}</pre><div className="draft-actions"><button type="button" className="secondary" onClick={() => setDrafts([])} disabled={!drafts.length}>Limpar</button><button type="button" className="primary" onClick={copy}>{copied ? "Copiado" : "Copiar modelo"}</button></div><p className="disclaimer">Ferramenta de estudo e apoio à redação. A interpretação e responsabilidade técnica são do médico-veterinário.</p></aside>
    </section>
  </main>;
}
