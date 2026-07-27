"use client";

import { useMemo, useState } from "react";
import ebookFindings from "./findings.json";

type Finding = { id: string; region: string; title: string; tags: string[]; report: string; impression: string; normal?: string };

const coreLibrary: Finding[] = [
  { id: "pneumonia", region: "Tórax", title: "Pneumonia / padrão alveolar", tags: ["pulmão", "inflamação"], report: "Campos pulmonares com aumento de radiopacidade de padrão alveolar, mais evidente em [lobo/região], associado a broncogramas aéreos.", impression: "Achados radiográficos sugerem pneumonia em [lobo/região]." },
  { id: "bronquite", region: "Tórax", title: "Broncopneumopatia inflamatória", tags: ["pulmão", "crônico"], report: "Campos pulmonares discretamente opacificados por padrão intersticiobronquial.", impression: "Broncopneumopatia inflamatória crônica discreta, a correlacionar com os dados clínicos." },
  { id: "cardio", region: "Tórax", title: "Cardiomegalia", tags: ["coração"], report: "Silhueta cardíaca apresenta-se aumentada, com [câmara] mais evidente.", impression: "Cardiomegalia [discreta/moderada/acentuada]. A critério clínico, sugere-se ecodopplercardiograma para melhor caracterização." },
  { id: "pleural", region: "Tórax", title: "Efusão pleural", tags: ["pleura", "líquido"], report: "Espaço pleural evidenciado por conteúdo de radiopacidade água, com fissuras interlobares e retração parcial dos lobos pulmonares.", impression: "Efusão pleural [discreta/moderada/acentuada]." },
  { id: "fracture-rib", region: "Tórax", title: "Fratura de costela", tags: ["trauma", "osso"], report: "[Costela] apresenta fratura [simples/cominutiva], [com/sem] desalinhamento dos segmentos ósseos.", impression: "Fratura em [costela/lado]." },
  { id: "dch", region: "Pelve", title: "Displasia coxofemoral", tags: ["quadril", "degenerativo"], report: "Articulação coxofemoral [lado] incongruente, com remodelamento de cabeça e colo femoral, acetábulo raso e osteófitos periarticulares.", impression: "Displasia coxofemoral [grau] em [lado], associada a osteoartrose." },
  { id: "patella", region: "Joelho", title: "Luxação patelar", tags: ["joelho", "articulação"], report: "Patela apresentando desvio [medial/lateral] em relação ao sulco troclear, associada a [desvio/rotação] dos terços proximais tibiais.", impression: "Luxação patelar [unilateral/bilateral], [grau se aplicável]." },
  { id: "long-bone", region: "Membros", title: "Fratura em osso longo", tags: ["trauma", "osso"], report: "Fratura [completa/incompleta], [simples/cominutiva] em [osso/segmento], com desvio [direção] do segmento distal em relação ao proximal. Há aumento de volume de tecidos moles adjacentes.", impression: "Fratura em [osso/lado]." },
  { id: "osteo", region: "Membros", title: "Osteoartrose", tags: ["articulação", "degenerativo"], report: "Irregularidade das superfícies articulares, osteófitos periarticulares e discreta esclerose subcondral em [articulação].", impression: "Osteoartrose em [articulação], [grau]." },
  { id: "spondy", region: "Coluna", title: "Espondilose deformante", tags: ["coluna", "degenerativo"], report: "Proliferação óssea ventral nos corpos vertebrais de [segmentos], com formação de pontes ósseas em graus variáveis.", impression: "Espondilose deformante em [segmentos]." },
  { id: "disc", region: "Coluna", title: "Discopatia", tags: ["coluna", "disco"], report: "Redução do espaço intervertebral entre [segmentos], associada a esclerose dos platôs vertebrais e/ou mineralização discal.", impression: "Achados compatíveis com discopatia em [segmentos]." },
  { id: "hepa", region: "Abdômen", title: "Hepatomegalia", tags: ["fígado"], report: "Silhueta hepática aumentada, com extensão caudal além do arco costal e deslocamento caudal do eixo gástrico.", impression: "Hepatomegalia. Achado de caráter inespecífico." },
  { id: "uro", region: "Abdômen", title: "Urolitíase", tags: ["bexiga", "mineral"], report: "Bexiga urinária contendo estruturas arredondadas de radiopacidade mineral, a maior medindo aproximadamente [medida].", impression: "Urocistólitos." },
  { id: "foreign", region: "Abdômen", title: "Corpo estranho gastrointestinal", tags: ["obstrução", "gastrointestinal"], report: "Estrutura de radiopacidade [mineral/metálica] em topografia de [órgão], associada a [distensão/distribuição] das alças intestinais.", impression: "Achados sugestivos de corpo estranho gastrointestinal. Considerar obstrução, conforme correlação clínica." },
  { id: "nasal", region: "Crânio", title: "Lesão nasal agressiva", tags: ["nariz", "neoplasia"], report: "Aumento de radiopacidade em cavidade nasal [lado], associado a lise do osso vômer e perda da definição das conchas nasais.", impression: "Lesão nasal agressiva, podendo estar relacionada a processo neoplásico. Sugere-se complementação diagnóstica." },
  { id: "otitis", region: "Crânio", title: "Otite média", tags: ["bula timpânica"], report: "Aumento da radiopacidade e espessamento da bula timpânica [lado].", impression: "Achados sugestivos de otite média [unilateral/bilateral]." },
  { id: "pregnancy", region: "Gestacional", title: "Prenhez positiva", tags: ["feto", "gestação"], report: "Identificam-se esqueletos fetais mineralizados em cavidade abdominal, permitindo estimativa radiográfica de [número] concepto(s).", impression: "Prenhez positiva, com estimativa de [número] concepto(s)." },
];

const library: Finding[] = [
  ...coreLibrary,
  ...ebookFindings
    .filter((item) => !coreLibrary.some((finding) => finding.title.toLowerCase() === item.title.toLowerCase()))
    .map((item, index) => ({
      id: `ebook-${index}`,
      region: item.region,
      title: item.title,
      tags: [item.region.toLowerCase(), "biblioteca"],
      report: item.text,
      impression: `Achados radiográficos relacionados a ${item.title.toLowerCase()}.`,
    })),
];

const normalByRegion: Record<string, string> = {
  "Tórax": "Silhueta traqueal de diâmetro e contorno preservados. Silhueta cardíaca de tamanho e formato preservados. Mediastino cranial normoespesso e de radiopacidade ideal.",
  "Abdômen": "Silhuetas renal, hepática e esplênica de tamanho, contorno e radiopacidade preservados.",
  "Pelve": "Demais estruturas ósseas avaliadas sem alterações radiográficas dignas de nota.",
  "Coluna": "Demais corpos vertebrais, forames e espaços intervertebrais avaliados sem alterações radiográficas dignas de nota.",
};

export default function Home() {
  const [search, setSearch] = useState(""); const [selected, setSelected] = useState<Finding[]>([]); const [region, setRegion] = useState("Tórax");
  const [data, setData] = useState({ patient: "", species: "Canino", breed: "", age: "", sex: "", clinic: "", vet: "", projections: "LLD e VD", history: "", quality: "" });
  const [includeNormals, setIncludeNormals] = useState(true); const [comments, setComments] = useState(""); const [showChecks, setShowChecks] = useState(false);
  const options = useMemo(() => library.filter(f => `${f.title} ${f.region} ${f.tags.join(" ")}`.toLowerCase().includes(search.toLowerCase()) && (region === "Todos" || f.region === region)), [search, region]);
  const groups = useMemo(() => selected.reduce<Record<string, Finding[]>>((a, f) => ({ ...a, [f.region]: [...(a[f.region] || []), f] }), {}), [selected]);
  const checks = [!data.patient && "Informe o paciente.", !data.projections && "Informe as projeções.", !data.history && "Inclua histórico ou suspeita clínica.", selected.length === 0 && "Selecione ao menos um achado ou modelo de normalidade.", selected.some(f => /\[.*\]/.test(f.report + f.impression)) && "Há campos entre colchetes para completar antes de finalizar.", !data.quality && "Registre limitações técnicas apenas se elas existirem."] .filter(Boolean) as string[];
  const report = `LAUDO RADIOGRÁFICO\n\nPaciente: ${data.patient || "[paciente]"}${data.age ? `  Idade: ${data.age}` : ""}${data.sex ? `  Sexo: ${data.sex}` : ""}\nEspécie/Raça: ${data.species}${data.breed ? ` / ${data.breed}` : ""}\nClínica: ${data.clinic || "[clínica]"}${data.vet ? `  Médico-veterinário solicitante: ${data.vet}` : ""}\nProjeções: ${data.projections || "[projeções]"}\nRegião de estudo: ${Object.keys(groups).join(", ") || region}\n${data.history ? `\nHISTÓRICO / SUSPEITA CLÍNICA\n${data.history}\n` : ""}${data.quality ? `\nCOMENTÁRIOS DO EXAME\n${data.quality}\n` : ""}\nRELATÓRIO RADIOGRÁFICO\n${Object.entries(groups).map(([key, list]) => `\n${key.toUpperCase()}\n${list.map(f => `- ${f.report}`).join("\n")}${includeNormals && normalByRegion[key] ? `\n- ${normalByRegion[key]}` : ""}\n- Demais estruturas sem alterações radiográficas dignas de nota.`).join("\n") || "\n[Selecione os achados na biblioteca.]"}\n\nIMPRESSÕES DIAGNÓSTICAS\n${selected.map(f => `- ${f.impression}`).join("\n") || "- [Impressão diagnóstica]"}${comments ? `\n\nCOMENTÁRIOS\n${comments}` : ""}\n\nLaudado por\nOctávio Ribeiro Leite - Médico-veterinário - CRMV ES 4456`;
  const toggle = (f: Finding) => setSelected(s => s.some(x => x.id === f.id) ? s.filter(x => x.id !== f.id) : [...s, f]);
  const update = (key: keyof typeof data, value: string) => setData(d => ({ ...d, [key]: value }));
  const copy = async () => { await navigator.clipboard.writeText(report); alert("Laudo copiado."); };
  const regions = ["Todos", ...Array.from(new Set(library.map(f => f.region)))];
  return <main>
    <header><div className="brand"><span className="brand-mark">R</span><span>RADIO<span>VET</span></span></div><div className="header-note">Montador estruturado de laudos</div><div className="status"><i /> Rascunho salvo neste dispositivo</div></header>
    <section className="intro"><div><p className="eyebrow">FLUXO CLÍNICO ESTRUTURADO</p><h1>Seu raciocínio.<br/><em>Seu padrão de laudo.</em></h1><p>Da história à impressão diagnóstica, em um formato pronto para revisar e assinar.</p></div><ol><li><b>01</b><span>Contexto clínico</span></li><li><b>02</b><span>Achados por região</span></li><li><b>03</b><span>Impressão e revisão</span></li></ol></section>
    <section className="app-shell">
      <aside className="steps"><p className="section-label">DADOS DO EXAME</p><div className="field-grid"><label>Paciente<input value={data.patient} onChange={e=>update("patient",e.target.value)} placeholder="Nome" /></label><label>Espécie<select value={data.species} onChange={e=>update("species",e.target.value)}><option>Canino</option><option>Felino</option><option>Outro</option></select></label><label>Raça<input value={data.breed} onChange={e=>update("breed",e.target.value)} placeholder="Raça" /></label><label>Idade<input value={data.age} onChange={e=>update("age",e.target.value)} placeholder="Ex.: 8 anos" /></label><label>Sexo<input value={data.sex} onChange={e=>update("sex",e.target.value)} placeholder="Macho/Fêmea" /></label><label>Projeções<input value={data.projections} onChange={e=>update("projections",e.target.value)} /></label></div><label>Clínica<input value={data.clinic} onChange={e=>update("clinic",e.target.value)} placeholder="Clínica" /></label><label>Solicitante<input value={data.vet} onChange={e=>update("vet",e.target.value)} placeholder="Médico-veterinário" /></label><label>Histórico / suspeita clínica<textarea value={data.history} onChange={e=>update("history",e.target.value)} placeholder="O que o exame precisa responder?" /></label><label>Limitação técnica (se houver)<textarea value={data.quality} onChange={e=>update("quality",e.target.value)} placeholder="Ex.: taquipneia, posicionamento limitado..." /></label><div className="check"><input id="normals" type="checkbox" checked={includeNormals} onChange={e=>setIncludeNormals(e.target.checked)} /><label htmlFor="normals">Incluir normalidades relevantes</label></div></aside>
      <section className="finder"><div className="finder-head"><div><p className="section-label">ACHADOS E MODELOS</p><h2>Monte o relatório</h2></div><span>{selected.length} selecionado(s)</span></div><label className="search"><span>⌕</span><input aria-label="Buscar achado" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar alteração, estrutura ou região" /></label><div className="chips">{regions.map(r=><button key={r} className={region===r?"active":""} onClick={()=>setRegion(r)}>{r}</button>)}</div><div className="finding-list">{options.map(f=><button type="button" className={`finding ${selected.some(x=>x.id===f.id)?"selected":""}`} aria-pressed={selected.some(x=>x.id===f.id)} key={f.id} onClick={()=>toggle(f)}><div><span>{f.region}</span><h3>{f.title}</h3><p>{f.report}</p></div><b>{selected.some(x=>x.id===f.id)?"✓":"+"}</b></button>)}</div></section>
      <section className="report-panel"><div className="report-head"><div><p className="section-label">LAUDO EM CONSTRUÇÃO</p><h2>Revisão clínica</h2></div><button className="review" onClick={()=>setShowChecks(!showChecks)}>✓ Revisar {checks.length ? `(${checks.length})` : ""}</button></div>{showChecks&&<div className={`checks ${checks.length?"warn":"ok"}`}>{checks.length?checks.map(c=><p key={c}>• {c}</p>):<p>✓ Estrutura pronta para revisão final.</p>}</div>}<pre>{report}</pre><label className="comments">Comentários finais<textarea value={comments} onChange={e=>setComments(e.target.value)} placeholder="Recomendações, ressalvas e acompanhamento quando pertinentes." /></label><div className="actions"><button className="secondary" onClick={()=>{const b=new Blob([report],{type:"text/plain"});const a=document.createElement("a");a.href=URL.createObjectURL(b);a.download="laudo-radiografico.txt";a.click();}}>Baixar .txt</button><button className="primary" onClick={copy}>Copiar laudo</button></div><p className="disclaimer">Ferramenta de apoio à redação. A interpretação e responsabilidade técnica são exclusivas do médico-veterinário.</p></section>
    </section>
  </main>;
}
