"use client";

import { useMemo, useState } from "react";
import ebookFindings from "./findings.json";

type Suggestion = {
  id: string;
  title: string;
  region: string;
  source: "Minha biblioteca" | "Ebook" | "Essencial";
  text: string;
  tags: string[];
};

type SelectedItem = Pick<Suggestion, "id" | "title" | "source" | "text">;

const essentials: Suggestion[] = [
  { id: "pneumonia", title: "Pneumonia / padrão alveolar", region: "Tórax", source: "Essencial", tags: ["pulmão", "inflamação"], text: "Achados radiográficos sugerem pneumonia em [lobo/região]." },
  { id: "bronquite", title: "Broncopneumopatia inflamatória", region: "Tórax", source: "Essencial", tags: ["pulmão", "crônico"], text: "Broncopneumopatia inflamatória crônica discreta, a correlacionar com os dados clínicos." },
  { id: "cardio", title: "Cardiomegalia", region: "Tórax", source: "Essencial", tags: ["coração"], text: "Cardiomegalia [discreta/moderada/acentuada]. A critério clínico, sugere-se ecodopplercardiograma para melhor caracterização." },
  { id: "pleural", title: "Efusão pleural", region: "Tórax", source: "Essencial", tags: ["pleura", "líquido"], text: "Efusão pleural [discreta/moderada/acentuada]." },
  { id: "dch", title: "Displasia coxofemoral", region: "Pelve", source: "Essencial", tags: ["quadril", "degenerativo"], text: "Displasia coxofemoral [grau] em [lado], associada a osteoartrose." },
  { id: "patella", title: "Luxação patelar", region: "Joelho", source: "Essencial", tags: ["joelho", "articulação"], text: "Luxação patelar [unilateral/bilateral], [grau se aplicável]." },
  { id: "fracture", title: "Fratura em osso longo", region: "Membros", source: "Essencial", tags: ["trauma", "osso"], text: "Fratura em [osso/lado]." },
  { id: "osteo", title: "Osteoartrose", region: "Membros", source: "Essencial", tags: ["articulação", "degenerativo"], text: "Osteoartrose em [articulação], [grau]." },
  { id: "disc", title: "Discopatia", region: "Coluna", source: "Essencial", tags: ["coluna", "disco"], text: "Achados compatíveis com discopatia em [segmentos]." },
  { id: "uro", title: "Urolitíase", region: "Abdômen", source: "Essencial", tags: ["bexiga", "mineral"], text: "Urocistólitos." },
];

const personalModels: Suggestion[] = [
  {
    id: "modelo-torax-drive",
    title: "Modelo de relatorios radiograficos cavidade toracica .pdf",
    region: "Tórax",
    source: "Minha biblioteca",
    tags: ["tórax", "modelo", "drive"],
    text: "Não foram identificadas alterações radiográficas torácicas agudas. Correlacionar os achados com o quadro clínico e exames complementares, se indicados.",
  },
  {
    id: "modelo-esqueleto-drive",
    title: "Laudos Esqueleto apendicular (Combinado).pdf",
    region: "Membros",
    source: "Minha biblioteca",
    tags: ["esqueleto", "membros", "modelo", "drive"],
    text: "Achados radiográficos compatíveis com alteração em [estrutura/lado]. Considerar correlação com exame ortopédico e acompanhamento radiográfico conforme indicação clínica.",
  },
];

const ebookSuggestions: Suggestion[] = ebookFindings.map((item, index) => ({
  id: `ebook-${index}`,
  title: item.title,
  region: item.region,
  source: "Ebook",
  tags: [item.region, "referência"],
  text: item.text,
}));

const library = [...personalModels, ...essentials, ...ebookSuggestions];

export default function Home() {
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState("Todos");
  const [source, setSource] = useState("Todos");
  const [selected, setSelected] = useState<SelectedItem[]>([]);
  const [newImpression, setNewImpression] = useState("");
  const [comments, setComments] = useState("");
  const [copied, setCopied] = useState(false);

  const options = useMemo(() => library.filter((item) => {
    const searchable = `${item.title} ${item.region} ${item.tags.join(" ")} ${item.text}`.toLowerCase();
    return searchable.includes(search.toLowerCase()) && (region === "Todos" || item.region === region) && (source === "Todos" || item.source === source);
  }), [search, region, source]);
  const regions = useMemo(() => ["Todos", ...Array.from(new Set(library.map((item) => item.region)))], []);
  const output = `IMPRESSÕES DIAGNÓSTICAS\n${selected.length ? selected.map((item) => `- ${item.text.trim()}`).join("\n") : "- [Adicione uma impressão diagnóstica]"}${comments.trim() ? `\n\nCOMENTÁRIOS\n${comments.trim()}` : ""}`;

  const addSuggestion = (item: Suggestion) => {
    if (!selected.some((selectedItem) => selectedItem.id === item.id)) {
      setSelected((current) => [...current, { id: item.id, title: item.title, source: item.source, text: item.text }]);
    }
  };
  const addFreeText = () => {
    const text = newImpression.trim();
    if (!text) return;
    setSelected((current) => [...current, { id: `manual-${Date.now()}`, title: "Impressão livre", source: "Essencial", text }]);
    setNewImpression("");
  };
  const updateSelected = (id: string, text: string) => setSelected((current) => current.map((item) => item.id === id ? { ...item, text } : item));
  const copy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return <main>
    <header>
      <div className="brand"><span className="brand-mark">R</span><span>RADIO<span>VET</span></span></div>
      <p>Auxiliador de laudos radiográficos</p>
      <span className="header-note">Impressões primeiro. Texto sempre editável.</span>
    </header>

    <section className="intro">
      <p className="eyebrow">BIBLIOTECA DE APOIO</p>
      <h1>Um ponto de partida para<br/><em>o seu raciocínio clínico.</em></h1>
      <p>Escolha uma referência, ajuste a linguagem e copie somente o que precisa. Sem dados de paciente, cabeçalho ou assinatura.</p>
    </section>

    <section className="workspace">
      <section className="library-panel" aria-label="Biblioteca de referências">
        <div className="panel-heading"><div><p className="section-label">REFERÊNCIAS</p><h2>Encontre uma base</h2></div><span>{options.length} opções</span></div>
        <label className="search"><span>⌕</span><input aria-label="Buscar referência" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar alteração, estrutura ou região" /></label>
        <div className="filter-row" aria-label="Filtrar por origem">
          {["Todos", "Minha biblioteca", "Essencial", "Ebook"].map((item) => <button type="button" className={source === item ? "active" : ""} key={item} onClick={() => setSource(item)}>{item}</button>)}
        </div>
        <div className="filter-row regions" aria-label="Filtrar por região">
          {regions.map((item) => <button type="button" className={region === item ? "active" : ""} key={item} onClick={() => setRegion(item)}>{item}</button>)}
        </div>
        <div className="reference-list">
          {options.map((item) => {
            const isAdded = selected.some((selectedItem) => selectedItem.id === item.id);
            return <article className="reference" key={item.id}>
              <div><span>{item.source} · {item.region}</span><h3>{item.title}</h3><p>{item.text}</p></div>
              <button type="button" disabled={isAdded} onClick={() => addSuggestion(item)}>{isAdded ? "Adicionado" : "Adicionar"}</button>
            </article>;
          })}
        </div>
      </section>

      <section className="composer" aria-label="Compositor de impressões">
        <div className="panel-heading"><div><p className="section-label">RASCUNHO</p><h2>Impressões diagnósticas</h2></div><span>{selected.length} item(ns)</span></div>
        <p className="composer-help">As referências entram como sugestões. Edite cada uma antes de copiar.</p>
        <label className="free-entry">Adicionar uma impressão livre<textarea value={newImpression} onChange={(event) => setNewImpression(event.target.value)} placeholder="Ex.: Achados compatíveis com..." /><button type="button" onClick={addFreeText}>Adicionar ao rascunho</button></label>
        <div className="selected-list">
          {selected.length === 0 ? <div className="empty"><b>Comece pela biblioteca.</b><p>Selecione um modelo ou escreva uma impressão livre.</p></div> : selected.map((item, index) => <article className="selected-item" key={item.id}>
            <div className="selected-title"><span>{String(index + 1).padStart(2, "0")}</span><p>{item.title}<small>{item.source}</small></p><button type="button" aria-label={`Remover ${item.title}`} onClick={() => setSelected((current) => current.filter((selectedItem) => selectedItem.id !== item.id))}>×</button></div>
            <textarea aria-label={`Texto de ${item.title}`} value={item.text} onChange={(event) => updateSelected(item.id, event.target.value)} />
          </article>)}
        </div>
        <label className="comments">Comentários <span>opcional, aparece abaixo das impressões</span><textarea value={comments} onChange={(event) => setComments(event.target.value)} placeholder="Recomendações, limitações ou acompanhamento quando pertinentes." /></label>
      </section>

      <section className="preview" aria-label="Prévia do texto">
        <div className="panel-heading"><div><p className="section-label">PRÉVIA</p><h2>Pronto para revisar</h2></div></div>
        <pre>{output}</pre>
        <div className="actions"><button type="button" className="secondary" onClick={() => { const blob = new Blob([output], { type: "text/plain" }); const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = "impressoes-diagnosticas.txt"; link.click(); URL.revokeObjectURL(link.href); }}>Baixar .txt</button><button type="button" className="primary" onClick={copy}>{copied ? "Copiado" : "Copiar texto"}</button></div>
        <p className="disclaimer">Ferramenta de apoio à redação. A interpretação e a responsabilidade técnica permanecem com o médico-veterinário.</p>
      </section>
    </section>
  </main>;
}
