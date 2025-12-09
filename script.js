
// Mantive comentários em pt-br para facilitar manutenção.

/* ------------- Utilitários ------------- */
function normalize(text) {
  if (!text) return "";
  return String(text).normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();
}
function humanizeLabel(key) {
  return String(key).replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

/* ------------- Mapas de categorias ------------- */
const formaCategoriaMap = {
  oral_solida: ["comprimido", "comprimido_revestido", "capsula"],
  oral_liquida: ["xarope", "solucao_oral", "suspensao"],
  injetavel: ["ampola", "frasco_injetavel", "po_para_injecao", "po_injetavel"],
  topica: ["pomada","pomada_bisnaga","creme","gel","adesivo_transdermico"],
  oftalmica_otica: ["colirio"],
  retal_vaginal: ["supositorio","creme","vaginal"],
  outros: ["spray_nasal","spray_bucal","implante","solucao_inhalatoria"]
};
const viaCategoriaMap = {
  oral: ["oral", "sublingual"],
  parenteral: ["intravenosa","intramuscular","subcutanea","epidural","intratecal","intraarticular"],
  topica_transdermica: ["dermatologica","transdermica"],
  mucosas: ["nasal","oftalmica","otica","vaginal","retal"],
  inalatoria: ["inalatoria"]
};

/* ------------- Paleta e plugin ------------- */
const palette = ["#FF6384","#36A2EB","#FFCE56","#4BC0C0","#9966FF","#FF9F40","#C9CBCF","#8DD3C7","#BEBADA","#FB8072"];
const noDataPlugin = {
  id: 'noDataMessage',
  afterDraw: chart => {
    const ds = chart.data?.datasets?.[0];
    const labels = chart.data?.labels || [];
    const hasData = ds && ds.data && ds.data.some(v => Number(v) > 0);
    if (!hasData || labels.length === 0) {
      const { ctx, chartArea } = chart;
      if (!chartArea) return;
      ctx.save();
      ctx.font = "16px sans-serif";
      ctx.fillStyle = "rgba(100,100,100,0.75)";
      ctx.textAlign = "center";
      ctx.fillText("Dados não encontrados",
        (chartArea.left + chartArea.right) / 2,
        (chartArea.top + chartArea.bottom) / 2
      );
      ctx.restore();
    }
  }
};

/* ------------- Dados locais (localStorage) ------------- */
function loadMedicamentos() {
  const saved = localStorage.getItem('medicamentos');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.every(item => item.id && item.nome)) {
        // garante dataCadastro para itens antigos (padroniza YYYY-MM-DD)
        window.medicamentos = parsed.map(m => {
          if (!m.dataCadastro) m.dataCadastro = new Date().toISOString().split('T')[0];
          // normalize forma/via se existirem
          if (m.forma) m.forma = normalize(m.forma).replace(/\s+/g,'_');
          if (m.via) m.via = normalize(m.via).replace(/\s+/g,'_');
          return m;
        });
        return;
      }
    } catch (e) {
      console.warn('Dados salvos corrompidos, usando padrão.');
    }
  }

  // Exemplo inicial (com dataCadastro)
  window.medicamentos = [
  { id: 1, nome: "Paracetamol 500mg", ativos: "Paracetamol (500mg)", forma: "comprimido", via: "oral", controlado: false, dataCadastro: "2025-09-01T10:30:00.000Z" },
  { id: 2, nome: "Ibuprofeno Gel", ativos: "Ibuprofeno (5g/100g)", forma: "gel", via: "dermatologica", controlado: false, dataCadastro: "2025-09-05T14:15:00.000Z" },
  { id: 3, nome: "Morfina Inj.", ativos: "Morfina (10mg/ml)", forma: "ampola", via: "intravenosa", controlado: true, dataCadastro: "2025-09-10T21:00:00.000Z" },
  { id: 4, nome: "Aspirina 100mg", ativos: "Ácido acetilsalicílico (100mg)", forma: "comprimido_revestido", via: "oral", controlado: false, dataCadastro: "2025-09-12T09:00:00.000Z" },
  { id: 5, nome: "Amoxicilina 500mg", ativos: "Amoxicilina (500mg)", forma: "capsula", via: "oral", controlado: false, dataCadastro: "2025-09-13T10:45:00.000Z" },
  { id: 6, nome: "Insulina Humana", ativos: "Insulina (100UI/ml)", forma: "frasco_injetavel", via: "subcutanea", controlado: false, dataCadastro: "2025-09-14T11:30:00.000Z" },
  { id: 7, nome: "Dipirona Gotas", ativos: "Dipirona (500mg/ml)", forma: "solucao_oral", via: "oral", controlado: false, dataCadastro: "2025-09-15T12:15:00.000Z" },
  { id: 8, nome: "Xarope para Tosse", ativos: "Guaifenesina (100mg/5ml)", forma: "xarope", via: "oral", controlado: false, dataCadastro: "2025-09-16T13:00:00.000Z" },
  { id: 9, nome: "Suspensão Antibiótica", ativos: "Azitromicina (200mg/5ml)", forma: "suspensao", via: "oral", controlado: false, dataCadastro: "2025-09-17T14:45:00.000Z" },
  { id: 10, nome: "Spray Nasal Antialérgico", ativos: "Fluticasona (50mcg/dose)", forma: "spray_nasal", via: "nasal", controlado: false, dataCadastro: "2025-09-18T15:30:00.000Z" },
  { id: 11, nome: "Spray Bucal Analgésico", ativos: "Benzocaína (20mg/ml)", forma: "spray_bucal", via: "sublingual", controlado: false, dataCadastro: "2025-09-19T16:15:00.000Z" },
  { id: 12, nome: "Pomada Antifúngica", ativos: "Clotrimazol (1%)", forma: "pomada", via: "dermatologica", controlado: false, dataCadastro: "2025-09-20T17:00:00.000Z" },
  { id: 13, nome: "Creme Hidratante", ativos: "Ureia (10%)", forma: "creme", via: "dermatologica", controlado: false, dataCadastro: "2025-09-21T18:45:00.000Z" },
  { id: 14, nome: "Colírio Lubrificante", ativos: "Hialuronato de sódio (0.1%)", forma: "colirio", via: "oftalmica", controlado: false, dataCadastro: "2025-09-22T19:30:00.000Z" },
  { id: 15, nome: "Supositório Analgésico", ativos: "Paracetamol (125mg)", forma: "supositorio", via: "retal", controlado: false, dataCadastro: "2025-09-23T20:15:00.000Z" },
  { id: 16, nome: "Implante Contraceptivo", ativos: "Etonogestrel (68mg)", forma: "implante", via: "subcutanea", controlado: true, dataCadastro: "2025-09-24T21:00:00.000Z" },
  { id: 17, nome: "Adesivo Anticoncepcional", ativos: "Norelgestromina (6mg) + Etinilestradiol (0.6mg)", forma: "adesivo_transdermico", via: "transdermica", controlado: true, dataCadastro: "2025-09-25T22:45:00.000Z" },
  { id: 18, nome: "Pó para Injeção Antibiótica", ativos: "Ceftriaxona (1g)", forma: "po_injetavel", via: "intramuscular", controlado: false, dataCadastro: "2025-09-26T23:30:00.000Z" },
  { id: 19, nome: "Solução Inalatória para Asma", ativos: "Salbutamol (5mg/ml)", forma: "solucao_inhalatoria", via: "inalatoria", controlado: false, dataCadastro: "2025-09-27T00:15:00.000Z" },
  { id: 20, nome: "Anestésico Local", ativos: "Lidocaína (20mg/ml)", forma: "ampola", via: "epidural", controlado: true, dataCadastro: "2025-09-28T01:00:00.000Z" },
  { id: 21, nome: "Anti-inflamatório Injetável", ativos: "Dexametasona (4mg/ml)", forma: "frasco_injetavel", via: "intratecal", controlado: false, dataCadastro: "2025-09-29T02:45:00.000Z" },
  { id: 22, nome: "Analgésico para Articulações", ativos: "Diclofenaco (75mg/ml)", forma: "ampola", via: "intraarticular", controlado: false, dataCadastro: "2025-09-30T03:30:00.000Z" },
  { id: 23, nome: "Gotas Otológicas", ativos: "Ciprofloxacino (0.3%) + Dexametasona (0.1%)", forma: "colirio", via: "otica", controlado: false, dataCadastro: "2025-10-01T04:15:00.000Z" },
  { id: 24, nome: "Creme Vaginal", ativos: "Metronidazol (0.75%)", forma: "creme", via: "vaginal", controlado: false, dataCadastro: "2025-10-02T05:00:00.000Z" },
  { id: 25, nome: "Vacina Intramuscular", ativos: "Vacina contra Tétano (0.5ml)", forma: "ampola", via: "intramuscular", controlado: false, dataCadastro: "2025-10-03T06:45:00.000Z" },
  { id: 26, nome: "Anticoagulante", ativos: "Heparina (5000UI/ml)", forma: "frasco_injetavel", via: "subcutanea", controlado: true, dataCadastro: "2025-10-04T07:30:00.000Z" },
  { id: 27, nome: "Broncodilatador", ativos: "Formoterol (12mcg)", forma: "capsula", via: "inalatoria", controlado: false, dataCadastro: "2025-10-05T08:15:00.000Z" },
  { id: 28, nome: "Antifúngico Oral", ativos: "Fluconazol (150mg)", forma: "comprimido", via: "oral", controlado: false, dataCadastro: "2025-10-06T09:00:00.000Z" },
  { id: 29, nome: "Antihipertensivo", ativos: "Losartana (50mg)", forma: "comprimido_revestido", via: "oral", controlado: false, dataCadastro: "2025-10-07T10:45:00.000Z" },
  { id: 30, nome: "Antidepressivo", ativos: "Sertralina (50mg)", forma: "capsula", via: "oral", controlado: true, dataCadastro: "2025-10-08T11:30:00.000Z" },
  { id: 31, nome: "Anticonvulsivante", ativos: "Carbamazepina (200mg)", forma: "comprimido", via: "oral", controlado: true, dataCadastro: "2025-10-09T12:15:00.000Z" },
  { id: 32, nome: "Diurético", ativos: "Furosemida (40mg)", forma: "ampola", via: "intravenosa", controlado: false, dataCadastro: "2025-10-10T13:00:00.000Z" },
  { id: 33, nome: "Antibiótico Tópico", ativos: "Gentamicina (0.1%)", forma: "pomada", via: "dermatologica", controlado: false, dataCadastro: "2025-10-11T14:45:00.000Z" },
  { id: 34, nome: "Antiácido", ativos: "Omeprazol (20mg)", forma: "capsula", via: "oral", controlado: false, dataCadastro: "2025-10-12T15:30:00.000Z" },
  { id: 35, nome: "Antialérgico", ativos: "Loratadina (10mg)", forma: "comprimido", via: "oral", controlado: false, dataCadastro: "2025-10-13T16:15:00.000Z" },
  { id: 36, nome: "Analgésico Forte", ativos: "Tramadol (50mg)", forma: "capsula", via: "oral", controlado: true, dataCadastro: "2025-10-14T17:00:00.000Z" },
  { id: 37, nome: "Vitaminas", ativos: "Vitamina C (500mg)", forma: "comprimido_revestido", via: "oral", controlado: false, dataCadastro: "2025-10-15T18:45:00.000Z" },
  { id: 38, nome: "Antiviral", ativos: "Aciclovir (200mg)", forma: "comprimido", via: "oral", controlado: false, dataCadastro: "2025-10-16T19:30:00.000Z" },
  { id: 39, nome: "Corticosteroide Nasal", ativos: "Budesonida (64mcg/dose)", forma: "spray_nasal", via: "nasal", controlado: false, dataCadastro: "2025-10-17T20:15:00.000Z" },
  { id: 40, nome: "Laxante", ativos: "Lactulose (667mg/ml)", forma: "xarope", via: "oral", controlado: false, dataCadastro: "2025-10-18T21:00:00.000Z" },
  { id: 41, nome: "Antiemético", ativos: "Ondansetrona (4mg)", forma: "comprimido", via: "sublingual", controlado: false, dataCadastro: "2025-10-19T22:45:00.000Z" },
  { id: 42, nome: "Anticoagulante Oral", ativos: "Rivaroxabana (20mg)", forma: "comprimido_revestido", via: "oral", controlado: true, dataCadastro: "2025-10-20T23:30:00.000Z" },
  { id: 43, nome: "Broncodilatador Inalatório", ativos: "Tiotrópio (18mcg)", forma: "capsula", via: "inalatoria", controlado: false, dataCadastro: "2025-10-21T00:15:00.000Z" },
  { id: 44, nome: "Antifúngico Vaginal", ativos: "Clotrimazol (100mg)", forma: "supositorio", via: "vaginal", controlado: false, dataCadastro: "2025-10-22T01:00:00.000Z" },
  { id: 45, nome: "Anestésico Tópico", ativos: "Lidocaína (5%)", forma: "gel", via: "dermatologica", controlado: false, dataCadastro: "2025-10-23T02:45:00.000Z" },
  { id: 46, nome: "Antibiótico Otológico", ativos: "Neomicina (0.5%)", forma: "colirio", via: "otica", controlado: false, dataCadastro: "2025-10-24T03:30:00.000Z" },
  { id: 47, nome: "Analgésico Retal", ativos: "Ibuprofeno (200mg)", forma: "supositorio", via: "retal", controlado: false, dataCadastro: "2025-10-25T04:15:00.000Z" },
  { id: 48, nome: "Injetável para Dor", ativos: "Ketorolaco (30mg/ml)", forma: "ampola", via: "intramuscular", controlado: true, dataCadastro: "2025-10-26T05:00:00.000Z" },
  { id: 49, nome: "Sedativo", ativos: "Midazolam (5mg/ml)", forma: "frasco_injetavel", via: "intravenosa", controlado: true, dataCadastro: "2025-10-27T06:45:00.000Z" },
  { id: 50, nome: "Antinflamatório Tópico", ativos: "Hidrocortisona (1%)", forma: "creme", via: "dermatologica", controlado: false, dataCadastro: "2025-10-28T07:30:00.000Z" },
  { id: 51, nome: "Antihipertensivo Injetável", ativos: "Labetalol (5mg/ml)", forma: "ampola", via: "intravenosa", controlado: false, dataCadastro: "2025-10-29T08:15:00.000Z" },
  { id: 52, nome: "Anticonvulsivante Injetável", ativos: "Fenitoína (50mg/ml)", forma: "frasco_injetavel", via: "intravenosa", controlado: true, dataCadastro: "2025-10-30T09:00:00.000Z" },
  { id: 53, nome: "Relaxante Muscular", ativos: "Ciclobenzaprina (10mg)", forma: "comprimido", via: "oral", controlado: false, dataCadastro: "2025-10-31T10:45:00.000Z" }
];
  window.medicamentos.forEach(m => {
    if (m.forma) m.forma = normalize(m.forma).replace(/\s+/g,'_');
    if (m.via) m.via = normalize(m.via).replace(/\s+/g,'_');
  });
}
function saveMedicamentos() {
  localStorage.setItem('medicamentos', JSON.stringify(window.medicamentos));
}
function generateId() {
  return Math.max(0, ...window.medicamentos.map(m => m.id || 0)) + 1;
}

/* ------------- Render da tabela (listagem) ------------- */
function renderTable(data, showDate = false) {  // Adicione parâmetro para controlar data
  const tableBody = document.getElementById("medicamentos-table");
  if (!tableBody) return;
  tableBody.innerHTML = "";
  data.forEach(med => {
    const displayForma = (med.forma || "").replace(/_/g, ' ');
    const displayVia = (med.via || "").replace(/_/g, ' ');
    let html = `
      <td>${med.nome}</td>
      <td>${med.ativos}</td>
      <td>${displayForma}</td>
      <td>${displayVia}</td>
      <td class="${med.controlado ? 'controlled' : ''}">${med.controlado ? 'Sim' : 'Não'}</td>
    `;
    if (showDate) {  // Só inclui data se solicitado (ex.: para relatórios)
      html += `<td>${med.dataCadastro || 'N/D'}</td>`;
    }
    html += `
      <td>
        <div class="action-buttons">
          <div class="edit-btn" onclick="editMedicamento(${med.id})"><img src="image/editar.png" alt="Editar"></div>
          <div class="delete-btn" onclick="deleteMedicamento(${med.id})"><img src="image/excluir.png" alt="Excluir"></div>
        </div>
      </td>
    `;
    const row = document.createElement("tr");
    row.innerHTML = html;
    tableBody.appendChild(row);
  });
}

/* ------------- Filtragem (tabela e dashboard) ------------- */
function filterTable() {
  const tableElement = document.getElementById("medicamentos-table");
  const search = document.getElementById("input-pesquisa")?.value.toLowerCase() || "";
  const forma = document.getElementById("apresentacao")?.value || "";
  const via = document.getElementById("via")?.value || "";
  const controlado = document.getElementById("controlado")?.value || "";

  const filtered = window.medicamentos.filter(med => {
    return (
      (search === "" || med.nome.toLowerCase().includes(search) || (med.ativos && med.ativos.toLowerCase().includes(search))) &&
      (forma === "" || med.forma === normalize(forma).replace(/\s+/g, '_')) &&
      (via === "" || med.via === normalize(via).replace(/\s+/g, '_')) &&
      (controlado === "" || (controlado === "sim" && med.controlado) || (controlado === "nao" && !med.controlado))
    );
  });

  if (tableElement) renderTable(filtered);
  else updateCharts(); // se não está na página de listagem, atualiza gráficos (dashboard)
}

/* ------------- Modal / CRUD ------------- */
function openCadastroModal() {
  const modal = document.createElement("div");
  modal.className = "modal";
  modal.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 2000;`;
  modal.innerHTML = `
    <div style="background: #fff; padding: 20px; border-radius: 6px; width: 360px; max-width: 95vw;">
      <h2>Novo Medicamento</h2>
      <input id="modal-nome" class="modal-input" placeholder="Ex: Insulina NPH">
      <input id="modal-ativos" class="modal-input" placeholder="Ex: Amoxicilina (1g/2ml)">
      <label>Forma:</label>
      <input list="formas" id="modal-forma" class="modal-input" placeholder="Ex: Comprimido">
      <datalist id="formas">
        <option value="Comprimido"></option><option value="Comprimido Revestido"></option><option value="Cápsula"></option>
        <option value="Ampola"></option><option value="Frasco Injetável"></option><option value="Xarope"></option>
        <option value="Solução Oral"></option><option value="Suspensão"></option><option value="Spray Nasal"></option>
        <option value="Spray Bucal"></option><option value="Pomada/Bisnaga"></option><option value="Creme"></option>
        <option value="Gel"></option><option value="Colírio"></option><option value="Supositório"></option>
        <option value="Implante"></option><option value="Adesivo Transdérmico"></option><option value="Pó para Injeção"></option>
        <option value="Solução Inalatória"></option>
      </datalist>
      <label>Via:</label>
      <input list="vias" id="modal-via" class="modal-input" placeholder="Ex: Oral">
      <datalist id="vias">
        <option value="Oral"></option><option value="Intravenosa"></option><option value="Intramuscular"></option>
        <option value="Subcutânea"></option><option value="Dermatológica (tópica)"></option><option value="Nasal"></option>
        <option value="Inalatória (pulmonar)"></option><option value="Retal"></option><option value="Oftálmica"></option>
        <option value="Otica"></option><option value="Vaginal"></option><option value="Sublingual"></option>
        <option value="Transdérmica"></option><option value="Epidural"></option><option value="Intratecal"></option>
        <option value="Intra-articular"></option>
      </datalist>
      <label>Controlado:</label>
      <select id="modal-controlado" class="modal-input">
        <option value="false">Não</option>
        <option value="true">Sim</option>
      </select>
      <button onclick="saveMedicamento()" style="margin-top:10px;padding:8px;background:#4CAF50;color:white;border:none;border-radius:4px;cursor:pointer;">Salvar</button>
      <button class="close-modal" style="margin-top:10px;padding:8px;background:#f44336;color:white;border:none;border-radius:4px;cursor:pointer;">Cancelar</button>
    </div>
  `;
  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden'; // Prevent scrolling behind modal

  // Close on cancel button or overlay click
  modal.querySelector('.close-modal').addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  function closeModal() {
    modal.remove();
    document.body.style.overflow = ''; // Restore scrolling
  }
}
function saveMedicamento() {
  const nomeEl = document.getElementById("modal-nome");
  const ativosEl = document.getElementById("modal-ativos");
  const formaEl = document.getElementById("modal-forma");
  const viaEl = document.getElementById("modal-via");
  const controladoEl = document.getElementById("modal-controlado");
  const controlado = controladoEl ? controladoEl.value === "true" : false; // Ajustado para select em vez de checkbox

  let valido = true;
  [nomeEl, ativosEl, formaEl, viaEl].forEach(i => {
    if (!i || !i.value.trim()) {
      i && i.classList.add('input-error');
      valido = false;
    } else {
      i && i.classList.remove('input-error');
    }
  });
  if (!valido) {
    alert("Preencha todos os campos obrigatórios!");
    return;
  }

  const newMed = {
    id: generateId(),
    nome: nomeEl.value.trim(),
    ativos: ativosEl.value.trim(),
    forma: normalize(formaEl.value).replace(/\s+/g, '_'),
    via: normalize(viaEl.value).replace(/\s+/g, '_'),
    controlado: controlado,
    dataCadastro: new Date().toISOString()
  };
  window.medicamentos.push(newMed);
  saveMedicamentos();
  filterTable();
  updateCharts();
  gerarRelatorio();

  // Fechar o modal
  const modal = document.querySelector('.modal');
  if (modal) {
    modal.remove();
    document.body.style.overflow = ''; // Restaura o scroll
  }
}

function editMedicamento(id) {
  const med = window.medicamentos.find(m => m.id === id);
  if (!med) return;
  const modal = document.createElement("div");
  modal.className = "modal";
  modal.style.cssText = `position: fixed; top: 0; left: 0; width:100%; height:100%; background:rgba(0,0,0,0.5); display:flex; justify-content:center; align-items:center; z-index:1000;`;
  modal.innerHTML = `
    <div style="background:#fff;padding:20px;border-radius:6px;width:360px;max-width:95vw;">
      <h2>Editar Medicamento</h2>
      <input id="modal-nome" class="modal-input" value="${med.nome}">
      <input id="modal-ativos" class="modal-input" value="${med.ativos}">
      <label>Forma:</label>
      <input list="formas" id="modal-forma" class="modal-input" value="${(med.forma||'').replace(/_/g,' ')}">
      <label>Via:</label>
      <input list="vias" id="modal-via" class="modal-input" value="${(med.via||'').replace(/_/g,' ')}">
      <label><input type="checkbox" id="modal-controlado" ${med.controlado ? 'checked' : ''}> Controlado</label>
      <div style="margin-top:12px;">
        <button id="modal-save" style="padding:6px 10px;">Salvar</button>
        <button id="modal-cancel" style="padding:6px 10px;margin-left:8px;">Cancelar</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  document.getElementById('modal-cancel').addEventListener('click', closeModal);
  document.getElementById('modal-save').addEventListener('click', () => {
    updateMedicamento(id);
  });
}

function updateMedicamento(id) {
  const med = window.medicamentos.find(m => m.id === id);
  if (!med) return;
  const nomeEl = document.getElementById("modal-nome");
  const ativosEl = document.getElementById("modal-ativos");
  const formaEl = document.getElementById("modal-forma");
  const viaEl = document.getElementById("modal-via");
  const controlado = document.getElementById("modal-controlado")?.checked || false;

  let valido = true;
  [nomeEl, ativosEl, formaEl, viaEl].forEach(i => {
    if (!i || !i.value.trim()) { i && i.classList.add('input-error'); valido = false; } else { i && i.classList.remove('input-error'); }
  });
  if (!valido) { alert("Preencha todos os campos obrigatórios!"); return; }

  med.nome = nomeEl.value.trim();
  med.ativos = ativosEl.value.trim();
  med.forma = normalize(formaEl.value).replace(/\s+/g,'_');
  med.via = normalize(viaEl.value).replace(/\s+/g,'_');
  med.controlado = !!controlado;
  // manter dataCadastro original

  saveMedicamentos();
  closeModal();
  filterTable();
  updateCharts();
  gerarRelatorio(); // Adicionado para refrescar relatório após editar
}

function deleteMedicamento(id) {
  if (!confirm("Confirmar exclusão?")) return;
  window.medicamentos = window.medicamentos.filter(m => m.id !== id);
  saveMedicamentos();
  filterTable();
  updateCharts();
  gerarRelatorio(); // Adicionado para refrescar relatório após excluir
}

/* ------------- Gráficos (Dashboard + Relatórios) ------------- */
const charts = { grafico1: null, grafico2: null, grafico3: null, grafico4: null };

function updateCharts() {
  // normaliza (garantia)
  window.medicamentos.forEach(m => {
    if (m.forma) m.forma = normalize(m.forma).replace(/\s+/g,'_');
    if (m.via) m.via = normalize(m.via).replace(/\s+/g,'_');
  });

  const tipo = document.getElementById("tipoGrafico")?.value || "bar";
  const filtroForma = document.getElementById("apresentacaoCategoria")?.value || "";
  const filtroVia = document.getElementById("viaCategoria")?.value || "";
  const filtroCtrl = document.getElementById("controlado")?.value || "";

  const filtered = window.medicamentos.filter(m => {
    const okForma = !filtroForma || (formaCategoriaMap[filtroForma] && formaCategoriaMap[filtroForma].includes(m.forma));
    const okVia = !filtroVia || (viaCategoriaMap[filtroVia] && viaCategoriaMap[filtroVia].includes(m.via));
    const okCtrl = !filtroCtrl || (filtroCtrl === "sim" && m.controlado) || (filtroCtrl === "nao" && !m.controlado);
    return okForma && okVia && okCtrl;
  });

  const count = (arr, fn) => arr.reduce((acc, i) => { const k = fn(i); acc[k] = (acc[k]||0)+1; return acc; }, {});
  const formaCounts = count(filtered, m => m.forma || "outros");
  const viaCounts = count(filtered, m => m.via || "outros");
  const catCounts = Object.fromEntries(Object.keys(formaCategoriaMap).map(k => [k,0]));
  catCounts.outros = 0;
  filtered.forEach(m => {
    let found = false;
    for (const [cat, formas] of Object.entries(formaCategoriaMap)) {
      if (formas.includes(m.forma)) { catCounts[cat]++; found = true; break; }
    }
    if (!found) catCounts.outros++;
  });
  const ctrlCounts = { "Sim": 0, "Não": 0 };
  filtered.forEach(m => ctrlCounts[m.controlado ? "Sim" : "Não"]++);

  // destruir antigos
  Object.keys(charts).forEach(id => { if (charts[id]) { charts[id].destroy(); charts[id] = null; } });

  function filterZeros(labels, values) {
    const pairs = labels.map((l,i) => ({ label: l, value: values[i] }));
    const filteredPairs = pairs.filter(p => Number(p.value) > 0);
    return { labels: filteredPairs.map(p => p.label), values: filteredPairs.map(p => p.value) };
  }
  const fForma = filterZeros(Object.keys(formaCounts), Object.values(formaCounts));
  const fVia   = filterZeros(Object.keys(viaCounts), Object.values(viaCounts));
  const fCat   = filterZeros(Object.keys(catCounts), Object.values(catCounts));
  const fCtrl  = { labels: Object.keys(ctrlCounts), values: Object.values(ctrlCounts) };

  function createChart(canvasId, labels, data, title) {
    const ctxEl = document.getElementById(canvasId);
    if (!ctxEl) return;
    const total = data.reduce((a,b)=>a+b,0);
    const effectiveColors = labels.length > 0 ? palette.slice(0, labels.length) : [];
    const cfg = {
      type: tipo,
      data: { labels: labels.map(humanizeLabel), datasets: [{ label: "Quantidade", data: data, backgroundColor: effectiveColors, borderColor: effectiveColors, borderWidth: 1 }]},
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: "top" }, title: { display: true, text: title, font: { size: 18 } } }
      },
      plugins: [noDataPlugin]
    };

    if (tipo === "pie") {
      const dynamicOffset = labels.length > 10 ? -35 : -60;
      cfg.options.plugins.datalabels = {
        color: "#000",
        font: { weight: "bold" },
        anchor: "end",
        align: "end",
        offset: dynamicOffset,
        formatter: (value) => { if (!total || value === 0) return ""; return ((value/total)*100).toFixed(1) + "%"; }
      };
      if (window.ChartDataLabels) cfg.plugins.push(ChartDataLabels);
    }

    if (tipo === "bar" || tipo === "line") cfg.options.scales = { y: { beginAtZero: true } };

    return new Chart(ctxEl.getContext("2d"), cfg);
  }

  charts.grafico1 = createChart("grafico1", fForma.labels, fForma.values, "Distribuição por Forma");
  charts.grafico2 = createChart("grafico2", fVia.labels, fVia.values, "Distribuição por Via");
  charts.grafico3 = createChart("grafico3", fCat.labels, fCat.values, "Categorias de Forma");
  charts.grafico4 = createChart("grafico4", fCtrl.labels, fCtrl.values, "Controlados");
}

/* ------------- Filtrar por data para relatórios ------------- */
function filterByDate(medicamentos, startDate, endDate) {
  if (!startDate && !endDate) return medicamentos;
  const start = startDate ? new Date(startDate) : new Date(0);
  const end = endDate ? new Date(endDate + 'T23:59:59') : new Date();
  return medicamentos.filter(med => {
    const medDate = med.dataCadastro ? new Date(med.dataCadastro) : new Date(0);
    return medDate >= start && medDate <= end;
  });
}

/* ------------- Geração de relatório (preview e conteúdo) ------------- */
function gerarRelatorio( ) {
  const tipo = document.getElementById('relatorio')?.value || 'completo';
  const startDate = document.getElementById('start-date')?.value || '';
  const endDate = document.getElementById('end-date')?.value || '';
  const contentEl = document.getElementById('relatorio-content');

  if (!contentEl) return;

  loadMedicamentos();
  let filteredMeds = filterByDate(window.medicamentos, startDate, endDate);

  if (filteredMeds.length === 0) {
    contentEl.innerHTML = '<p>Nenhum dado encontrado no período selecionado.</p>';
    contentEl.style.display = 'block';
    return;
  }

  if (tipo === 'completo') {
    // Tabela do período
    let html = `
  <h2>Relatório Completo — Período: ${startDate || '—'} a ${endDate || '—'}</h2>
  <div class="table-wrap">
    <table class="relatorio-tabela">
      <thead>
        <tr style="background-color: #f0f0f0;" ">
          <th>Nome Comercial</th>
          <th>Princípios Ativos</th>
          <th>Forma</th>
          <th>Via</th>
          <th>Controlado</th>
          <th>Data de Cadastro</th>
        </tr>
      </thead>
      <tbody>
`;
filteredMeds.forEach(m => {
  html += `<tr>
    <td>${m.nome}</td>
    <td>${m.ativos}</td>
    <td>${(m.forma||'').replace(/_/g,' ')}</td>
    <td>${(m.via||'').replace(/_/g,' ')}</td>
    <td>${m.controlado ? 'Sim' : 'Não'}</td>
    <td>${m.dataCadastro ? new Date(m.dataCadastro).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }) : 'N/D'}</td>
  </tr>`;
});
html += '</tbody></table></div>';
contentEl.innerHTML = html;

    contentEl.style.display = 'block';
  } else if (tipo === 'tendencias') {
    // Tendências: montamos gráficos (inline) e exibimos
    contentEl.innerHTML = `
      <h2>Tendências de Cadastros (${startDate || 'Início'} a ${endDate || 'Atual'})</h2>
      <div class="container-tabela-Graph" style="grid-template-columns: 1fr; grid-auto-rows: 360px;">
        <div class="divGraph"><canvas id="tendencia-grafico1"></canvas></div>
        <div class="divGraph"><canvas id="tendencia-grafico2"></canvas></div>
      </div>
    `;
    contentEl.style.display = 'block';

    // Determinar granularidade: por dia se período <60 dias, senão por mês
    const start = startDate ? new Date(startDate) : new Date(0);
    const end = endDate ? new Date(endDate + 'T23:59:59') : new Date();
    const spanDays = (end - start) / (1000 * 60 * 60 * 24);
    const isDayGranularity = spanDays < 60;
    const keyLength = isDayGranularity ? 10 : 7; // YYYY-MM-DD ou YYYY-MM

    const periodCounts = {};
    filteredMeds.forEach(med => {
      const key = (med.dataCadastro || '').substring(0, keyLength) || 'SemData';
      periodCounts[key] = (periodCounts[key] || 0) + 1;
    });

    // gráfico 1 (linha)
    const sortedKeys = Object.keys(periodCounts).sort();
    const ctx1 = document.getElementById('tendencia-grafico1').getContext('2d');
    new Chart(ctx1, {
      type: 'line',
      data: { labels: sortedKeys, datasets: [{ label: 'Cadastros', data: sortedKeys.map(k => periodCounts[k]), borderColor: '#36A2EB', fill: false }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { title: { display: true, text: `Cadastros por ${isDayGranularity ? 'Dia' : 'Mês'}` } } }
    });

    // gráfico 2 (pizza por forma, com % e labels fora)
    const formaCounts = filteredMeds.reduce((acc, m) => { acc[m.forma || 'outros'] = (acc[m.forma || 'outros'] || 0) + 1; return acc; }, {});
    const labelsForma = Object.keys(formaCounts);
    const dataForma = Object.values(formaCounts);
    const totalForma = dataForma.reduce((a, b) => a + b, 0);
    const ctx2 = document.getElementById('tendencia-grafico2').getContext('2d');
    const cfg2 = {
      type: 'pie',
      data: { labels: labelsForma.map(humanizeLabel), datasets: [{ data: dataForma, backgroundColor: palette.slice(0, labelsForma.length) }] },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top' },
          title: { display: true, text: 'Distribuição por Forma no Período' },
          datalabels: {
            color: "#000",
            font: { weight: "bold" },
            anchor: "end",
            align: "end",
            offset: labelsForma.length > 10 ? -35 : -60,
            formatter: (value) => { if (!totalForma || value === 0) return ""; return ((value / totalForma) * 100).toFixed(1) + "%"; }
          }
        }
      },
      plugins: window.ChartDataLabels ? [ChartDataLabels, noDataPlugin] : [noDataPlugin]
    };
    new Chart(ctx2, cfg2);
  }
}

function generateReportPreview() {
  // pega filtros e metadados
  const start = document.getElementById('start-date')?.value || '';
  const end = document.getElementById('end-date')?.value || '';
  const tipo = document.getElementById('relatorio')?.value || 'completo';
  const autor = document.getElementById('autor')?.value || '—';
  const unidade = document.getElementById('unidade')?.value || '—';
  const emissao = document.getElementById('emissao')?.value || new Date().toISOString().split('T')[0];

  loadMedicamentos();
  const items = filterByDate(window.medicamentos, start, end);

  // monta modal de preview
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:2000;';
  modal.innerHTML = `
    <div style="background:#fff;width:92%;max-width:1100px;height:90%;overflow:auto;border-radius:8px;padding:18px;box-sizing:border-box;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
        <div>
          <h2>Relatório — ${humanizeLabel(tipo)}</h2>
          <div><strong>Período:</strong> ${start || '—'} a ${end || '—'}</div>
          <div><strong>Data de emissão:</strong> ${emissao}</div>
          <div><strong>Autor:</strong> ${autor} &nbsp; | &nbsp; <strong>Unidade:</strong> ${unidade}</div>
        </div>
        <div>
          <button id="print-report" style="margin-right:8px;padding:6px 10px;">Imprimir / Exportar</button>
          <button id="close-report" style="padding:6px 10px;">Fechar</button>
        </div>
      </div>

      <section id="report-summary" style="margin-bottom:12px;">
        <strong>Total de registros:</strong> ${items.length}
        <p id="exec-summary" style="margin-top:8px;">Resumo executivo: ...</p>
      </section>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;">
        <div style="background:#f9f9f9;padding:8px;border-radius:6px;">
          <canvas id="preview-chart-forma" style="height:260px;"></canvas>
        </div>
        <div style="background:#f9f9f9;padding:8px;border-radius:6px;">
          <canvas id="preview-chart-via" style="height:260px;"></canvas>
        </div>
      </div>

      <section style="margin-top:6px;">
        <h3>Lista de medicamentos (anexo)</h3>
        <div style="max-height:220px;overflow:auto;border:1px solid #eee;padding:6px;background:#fff;">
          <table style="width:100%;border-collapse:collapse;">
            <thead style="background:#f0f0f0;">
              <tr><th style="padding:6px">Nome</th><th style="padding:6px">Ativos</th><th style="padding:6px">Forma</th><th style="padding:6px">Via</th><th style="padding:6px">Controlado</th><th style="padding:6px">Data</th></tr>
            </thead>
            <tbody id="report-table-body"></tbody>
          </table>
        </div>
      </section>
    </div>
  `;
  document.body.appendChild(modal);

  // preencher tabela do modal
  const tbody = modal.querySelector('#report-table-body');
  items.forEach(m => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td style="padding:6px;border-bottom:1px solid #eee;">${m.nome}</td>
                    <td style="padding:6px;border-bottom:1px solid #eee;">${m.ativos}</td>
                    <td style="padding:6px;border-bottom:1px solid #eee;">${(m.forma||'').replace(/_/g,' ')}</td>
                    <td style="padding:6px;border-bottom:1px solid #eee;">${(m.via||'').replace(/_/g,' ')}</td>
                    <td style="padding:6px;border-bottom:1px solid #eee;">${m.controlado ? 'Sim' : 'Não'}</td>
                    <td>${m.dataCadastro ? new Date(m.dataCadastro).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }) : '—'}</td>`;
    tbody.appendChild(tr);
  });

  // resumo executivo simples
  const formaCounts = items.reduce((acc,m)=>{ acc[m.forma||'outros']=(acc[m.forma||'outros']||0)+1; return acc; }, {});
  const viaCounts = items.reduce((acc,m)=>{ acc[m.via||'outros']=(acc[m.via||'outros']||0)+1; return acc; }, {});
  const formaMaisComum = Object.entries(formaCounts).sort((a,b)=>b[1]-a[1])[0]||['—',0];
  const viaMaisComum = Object.entries(viaCounts).sort((a,b)=>b[1]-a[1])[0]||['—',0];
  modal.querySelector('#exec-summary').innerText = `Maior concentração na forma "${(formaMaisComum[0]||'—').replace(/_/g,' ')}" e via "${(viaMaisComum[0]||'—').replace(/_/g,' ')}".`;

  // charts do preview
  function simpleChart(canvasId, countsObj, title) {
    const labels = Object.keys(countsObj).map(l => humanizeLabel(l));
    const data = Object.values(countsObj);
    const ctx = modal.querySelector('#'+canvasId).getContext('2d');
    const cfg = {
      type: 'bar',
      data: { labels, datasets: [{ label: 'Quantidade', data, backgroundColor: palette.slice(0, labels.length) }]},
      options: { responsive:true, maintainAspectRatio:false, plugins: { title: { display:true, text: title } }, scales: { y:{ beginAtZero:true } } }
    };
    return new Chart(ctx, cfg);
  }
  const c1 = simpleChart('preview-chart-forma', formaCounts, 'Distribuição por Forma');
  const c2 = simpleChart('preview-chart-via', viaCounts, 'Distribuição por Via');

  modal.querySelector('#close-report').addEventListener('click', ()=>{ modal.remove(); c1.destroy(); c2.destroy(); });
  modal.querySelector('#print-report').addEventListener('click', ()=> window.print());
}

/* ------------- Inicialização e eventos ------------- */
document.addEventListener("DOMContentLoaded", () => {
  loadMedicamentos();

  // Se estivermos na página de listagem (container-tabela)
  if (document.getElementById("medicamentos-table")) {
    renderTable(window.medicamentos);
    const searchInput = document.getElementById("input-pesquisa");
    if (searchInput) searchInput.addEventListener("input", filterTable);
    const selectApresentacao = document.getElementById("apresentacao");
    if (selectApresentacao) selectApresentacao.addEventListener("change", filterTable);
    const selectVia = document.getElementById("via");
    if (selectVia) selectVia.addEventListener("change", filterTable);
    const controladoEl = document.getElementById("controlado");
    if (controladoEl) controladoEl.addEventListener("change", filterTable);
    document.getElementById("filtro")?.addEventListener('click', () => {
    document.getElementById("filtro")?.addEventListener('click', () => {
    document.getElementById("apresentacao") && (document.getElementById("apresentacao").value = "");
    document.getElementById("via") && (document.getElementById("via").value = "");
    document.getElementById("controlado") && (document.getElementById("controlado").value = "");
    filterTable();  // Changed from updateCharts() to filterTable()
});
    });
  } else {
    // provavelmente estamos no dashboard (gráficos)
    ["apresentacaoCategoria","viaCategoria","controlado","tipoGrafico"].forEach(id=>{
      document.getElementById(id)?.addEventListener("change", updateCharts);
    });
    document.getElementById("filtro")?.addEventListener("click", () => {
      document.getElementById("apresentacaoCategoria") && (document.getElementById("apresentacaoCategoria").value = "");
      document.getElementById("viaCategoria") && (document.getElementById("viaCategoria").value = "");
      document.getElementById("controlado") && (document.getElementById("controlado").value = "");
      document.getElementById("tipoGrafico") && (document.getElementById("tipoGrafico").value = "bar");
      updateCharts();
    });
    updateCharts();
  }

  // Se estivermos na página de relatórios: preencher datas e ligar botões
  if (document.getElementById('generate-preview')) {
    gerarRelatorio(); // já renderiza o relatório no corpo da página

    // preencher datas padrão (últimos 30 dias)
    const today = new Date();
    const endStr = new Date().toISOString().split('T')[0];
    const lastMonth = new Date(); 
    lastMonth.setDate(lastMonth.getDate()-30);
    const startStr = lastMonth.toISOString().split('T')[0];
    document.getElementById('start-date').value = startStr;
    document.getElementById('end-date').value = endStr;
    document.getElementById('emissao').value = endStr;

    // ligar botões
    document.getElementById('generate-preview').addEventListener('click', (e) => {
      e.preventDefault();
      gerarRelatorio();       
      generateReportPreview(); 
    });

    // se mudar período, esconder conteúdo antigo e regenerar
    document.getElementById('relatorio').addEventListener('change', () => {
      document.getElementById('relatorio-content').style.display = 'none';
      gerarRelatorio();
    });
    document.getElementById('start-date').addEventListener('input', () => {
      document.getElementById('relatorio-content').style.display = 'none';
      gerarRelatorio();
    });
    document.getElementById('end-date').addEventListener('input', () => {
      document.getElementById('emissao').value = new Date().toISOString().split('T')[0]; // atualiza emissão para hoje
      document.getElementById('relatorio-content').style.display = 'none';
      gerarRelatorio();
    });
  }

  // sincronizar entre abas
  window.addEventListener('storage', (e) => {
    if (e.key === 'medicamentos') {
      loadMedicamentos();
      filterTable();
      updateCharts();
      gerarRelatorio(); // Adicionado para refrescar relatório em sync
    }
  });

  // Funcionalidade do menu mobile
  const menuBtn = document.getElementById('menu');
  const closeBtn = document.getElementById('fechar');
  const aside = document.querySelector('aside');

  if (menuBtn && closeBtn && aside) {
    menuBtn.addEventListener('click', openSidebar);
    closeBtn.addEventListener('click', closeSidebar);
  }

  function openSidebar() {
    aside.classList.add('open');
    const overlay = document.createElement('div');
    overlay.classList.add('overlay');
    overlay.style.display = 'block';
    overlay.addEventListener('click', closeSidebar);
    document.body.appendChild(overlay);
  }

  function closeSidebar() {
    aside.classList.remove('open');
    const overlay = document.querySelector('.overlay');
    if (overlay) {
      overlay.remove();
    }
  }

});