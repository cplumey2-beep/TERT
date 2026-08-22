// ===== Configuración de contactos de marcado rápido (sede TERT: Barceloneta, PR) =====
// Valores por defecto — el nombre y número de cada botón se pueden editar directamente
// desde la app (clic en el lápiz ✎). Los cambios se guardan en este navegador.
const QUICK_DIAL = [
  { id: "qd-911", label: "🚨 Emergencias 911", number: "911" },
  { id: "qd-policia-estatal-bc", label: "👮 Policía Estatal Barceloneta (sin confirmar)", number: "" },
  { id: "qd-policia-municipal-bc", label: "🏙️ Policía Municipal Barceloneta", number: "7878462915" },
  { id: "qd-bomberos-bc", label: "🚒 Bomberos Barceloneta (Carr. 2)", number: "7878462330" },
  { id: "qd-bomberos-arecibo", label: "🚒 Bomberos Arecibo", number: "7878782330" },
  { id: "qd-bomberos-manati", label: "🚒 Bomberos Manatí", number: "7878542330" },
  { id: "qd-rescate-omme-bc", label: "🚑 Rescate / Emergencias Barceloneta (OMME)", number: "7878463210" },
  { id: "qd-rescate-arecibo", label: "🚑 Rescate Arecibo (OMME, verificar)", number: "7878783454" },
  { id: "qd-rescate-manati", label: "🚑 Rescate Manatí (OMME)", number: "7878542297" },
  { id: "qd-cruz-roja", label: "🚑 Ambulancia / Cruz Roja (065 número Respaldo general)", number: "065" },
  { id: "qd-atenas-bc", label: "🚑 Atenas Ambulance — Barceloneta", number: "7878462220" },
  { id: "qd-continental-florida", label: "🚑 Continental EMT — Florida", number: "7879696444" },
  { id: "qd-harrison-arecibo", label: "🚑 Harrison Ramos Ambulance — Arecibo", number: "7872102128" },
  { id: "qd-health-manati", label: "🚑 Health Medical Ambulance — Manatí", number: "7879491024" },
  { id: "qd-comandancia-arecibo", label: "🚔 Comandancia PPR Arecibo", number: "7878784000" },
  { id: "qd-transito-arecibo", label: "🚦 Tránsito Arecibo (sin confirmar)", number: "" },
  { id: "qd-metro-pistas", label: "🛣️ Metro Pistas (Asistencia PR-22)", number: "7877058699" },
  { id: "qd-proteccion-civil", label: "🛟 Protección Civil", number: "911" },
  { id: "qd-base-tert", label: "📻 Base TERT", number: "" },
];

// ===== Configuración del tablero de unidades (miembros TERT por rango) =====
// El nombre de cada tarjeta se puede editar directamente en la app (clic en el nombre).
// Este arreglo solo define los rangos/slots por defecto y su orden inicial.
const UNITS = [
  { id: "unit-01", label: "Comandante - J. Rodríguez" },
  { id: "unit-02", label: "Capitán - Zapata" },
  { id: "unit-03", label: "Teniente 1 - Martí" },
  { id: "unit-04", label: "Teniente 2" },
  { id: "unit-05", label: "Sargento 1" },
  { id: "unit-06", label: "Sargento 2" },
  { id: "unit-07", label: "Sargento 3" },
  { id: "unit-08", label: "Inspector" },
  { id: "unit-09", label: "Miembro 09" },
  { id: "unit-10", label: "Miembro 10" },
  { id: "unit-11", label: "Miembro 11" },
  { id: "unit-12", label: "Miembro 12" },
  { id: "unit-13", label: "Miembro 13" },
  { id: "unit-14", label: "Miembro 14" },
  { id: "unit-15", label: "Miembro 15" },
  { id: "unit-16", label: "Miembro 16" },
  { id: "unit-17", label: "Miembro 17" },
  { id: "unit-18", label: "Miembro 18" },
];

const UNIT_STATUSES = ["Disponible", "En Ruta", "En Sitio", "Fuera de Servicio"];
const UNIT_STATUS_CLASS = {
  "Disponible": "status-disponible",
  "En Ruta": "status-enruta",
  "En Sitio": "status-ensitio",
  "Fuera de Servicio": "status-fuera",
};

// ===== Agencias de apoyo disponibles en el formulario de incidente =====
const AGENCIAS = [
  "Policía Estatal", "Policía Municipal", "Bomberos", "Emergencia Médica",
  "Rescate", "Tránsito", "Ambulancia / Cruz Roja", "Protección Civil", "Otro",
];

// ===== Estatus de incidente (línea de tiempo) =====
const ESTADOS_INCIDENTE = ["Despachado", "En Ruta", "En Sitio", "Concluido", "Cancelado"];
const ESTADO_CLASS = {
  "Despachado": "estatus-despachado",
  "En Ruta": "estatus-en-ruta",
  "En Sitio": "estatus-en-sitio",
  "Concluido": "estatus-concluido",
  "Cancelado": "estatus-cancelado",
};

const STORAGE_KEY = "tert_bitacora";
const NOTES_KEY = "tert_notas";
const UNIT_STATUS_KEY = "tert_unit_status";
const UNIT_LABEL_KEY = "tert_unit_labels";
const QUICK_DIAL_OVERRIDES_KEY = "tert_quickdial_overrides";

// ===== Utilidades =====
const $ = (sel) => document.querySelector(sel);
const $all = (sel) => document.querySelectorAll(sel);

function getLogs() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
}
function saveLogs(logs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
}
function nextFolio(logs) {
  const n = logs.length + 1;
  const year = new Date().getFullYear();
  return `TERT-${year}-${String(n).padStart(4, "0")}`;
}
function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

// ===== Reloj =====
function tickClock() {
  const now = new Date();
  $("#clock").textContent = now.toLocaleTimeString("es-MX", { hour12: false });
}
setInterval(tickClock, 1000);
tickClock();

// ===== Tabs =====
$all(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    $all(".tab-btn").forEach((b) => b.classList.remove("active"));
    $all(".tab-panel").forEach((p) => p.classList.remove("active"));
    btn.classList.add("active");
    $("#" + btn.dataset.tab).classList.add("active");
    if (btn.dataset.tab === "reportes") renderReportTable();
    if (btn.dataset.tab === "bitacora") renderRecentTable();
  });
});

// ===== Marcado rápido =====
function getQuickDialOverrides() {
  return JSON.parse(localStorage.getItem(QUICK_DIAL_OVERRIDES_KEY) || "{}");
}
function saveQuickDialOverrides(overrides) {
  localStorage.setItem(QUICK_DIAL_OVERRIDES_KEY, JSON.stringify(overrides));
}
function renderQuickDial() {
  const overrides = getQuickDialOverrides();
  const container = $("#quickDial");
  container.innerHTML = "";
  QUICK_DIAL.forEach((c) => {
    const o = overrides[c.id] || {};
    const label = o.label || c.label;
    const number = o.number !== undefined ? o.number : c.number;

    const card = document.createElement("div");
    card.className = "quickdial-card";
    card.innerHTML = `
      <button type="button" class="quickdial-edit" title="Editar nombre y número">✎</button>
      <button type="button" class="quickdial-dial">${escapeHtml(label)}</button>
    `;
    card.querySelector(".quickdial-edit").addEventListener("click", () => openQdModal(c.id, label, number));
    card.querySelector(".quickdial-dial").addEventListener("click", () => {
      if (!number) {
        alert("Este botón no tiene número configurado. Clic en ✎ para agregarlo.");
        return;
      }
      window.location.href = `tel:${number}`;
    });
    container.appendChild(card);
  });
}

let qdEditingId = null;
function openQdModal(id, currentLabel, currentNumber) {
  qdEditingId = id;
  $("#qdModalLabel").value = currentLabel;
  $("#qdModalNumber").value = currentNumber;
  $("#qdModalOverlay").classList.add("open");
  $("#qdModalLabel").focus();
}
function closeQdModal() {
  $("#qdModalOverlay").classList.remove("open");
  qdEditingId = null;
}
$("#qdModalCancel").addEventListener("click", closeQdModal);
$("#qdModalOverlay").addEventListener("click", (e) => {
  if (e.target.id === "qdModalOverlay") closeQdModal();
});
$("#qdModalSave").addEventListener("click", () => {
  if (!qdEditingId) return;
  const newLabel = $("#qdModalLabel").value.trim();
  const newNumber = $("#qdModalNumber").value.replace(/[^0-9]/g, "");
  if (!newLabel) {
    alert("El nombre no puede quedar vacío.");
    return;
  }
  const overrides = getQuickDialOverrides();
  overrides[qdEditingId] = { label: newLabel, number: newNumber };
  saveQuickDialOverrides(overrides);
  closeQdModal();
  renderQuickDial();
});
renderQuickDial();

// ===== Tablero de unidades =====
function getUnitStatuses() {
  return JSON.parse(localStorage.getItem(UNIT_STATUS_KEY) || "{}");
}
function saveUnitStatuses(statuses) {
  localStorage.setItem(UNIT_STATUS_KEY, JSON.stringify(statuses));
}
function getUnitLabels() {
  return JSON.parse(localStorage.getItem(UNIT_LABEL_KEY) || "{}");
}
function saveUnitLabels(labels) {
  localStorage.setItem(UNIT_LABEL_KEY, JSON.stringify(labels));
}
function renderUnitBoard() {
  const statuses = getUnitStatuses();
  const labels = getUnitLabels();
  const container = $("#unitBoard");
  container.innerHTML = "";
  UNITS.forEach((u) => {
    const label = labels[u.id] || u.label;
    const current = statuses[u.id] || "Disponible";
    const card = document.createElement("div");
    card.className = "unit-card " + UNIT_STATUS_CLASS[current];
    card.innerHTML = `
      <button type="button" class="unit-label" title="Clic para editar nombre/cargo">${escapeHtml(label)}</button>
      <button type="button" class="unit-status" title="Clic para cambiar estatus">${escapeHtml(current)}</button>
    `;
    card.querySelector(".unit-label").addEventListener("click", () => editUnitLabel(u.id, label));
    card.querySelector(".unit-status").addEventListener("click", () => cycleUnitStatus(u.id));
    container.appendChild(card);
  });
}
function editUnitLabel(id, current) {
  const next = prompt("Nombre / cargo para esta unidad:", current);
  if (next === null) return;
  const labels = getUnitLabels();
  const trimmed = next.trim();
  if (trimmed) labels[id] = trimmed; else delete labels[id];
  saveUnitLabels(labels);
  renderUnitBoard();
}
function cycleUnitStatus(id) {
  const statuses = getUnitStatuses();
  const current = statuses[id] || "Disponible";
  const next = UNIT_STATUSES[(UNIT_STATUSES.indexOf(current) + 1) % UNIT_STATUSES.length];
  statuses[id] = next;
  saveUnitStatuses(statuses);
  renderUnitBoard();
}
renderUnitBoard();

// ===== Mapas y ubicación =====
$("#btnMyLocation").addEventListener("click", () => {
  const result = $("#locationResult");
  if (!navigator.geolocation) {
    result.textContent = "Geolocalización no disponible en este navegador.";
    return;
  }
  result.textContent = "Obteniendo ubicación...";
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords;
      result.innerHTML = `📍 Lat: ${latitude.toFixed(5)}, Lng: ${longitude.toFixed(5)} &mdash;
        <a href="https://www.google.com/maps?q=${latitude},${longitude}" target="_blank" style="color:var(--accent)">Ver en Google Maps</a>`;
    },
    (err) => {
      result.textContent = "No se pudo obtener la ubicación: " + err.message;
    }
  );
});

$("#btnGoogleMaps").addEventListener("click", () => {
  window.open("https://www.google.com/maps", "_blank");
});

$("#btnWaze").addEventListener("click", () => {
  window.open("https://www.waze.com/live-map", "_blank");
});

$("#btnCoordSearch").addEventListener("click", () => {
  const dir = prompt("Escribe la dirección o punto de referencia a buscar:");
  if (dir) {
    window.open(`https://www.google.com/maps/search/${encodeURIComponent(dir)}`, "_blank");
  }
});

$("#btnQuickIncident").addEventListener("click", () => {
  $('.tab-btn[data-tab="bitacora"]').click();
});

// ===== Bitácora =====
function renderAgenciaCheckboxes() {
  const container = $("#agenciaGrid");
  container.innerHTML = "";
  AGENCIAS.forEach((nombre) => {
    const label = document.createElement("label");
    const id = "agencia-" + nombre.replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase();
    label.innerHTML = `<input type="checkbox" class="agencia-check" value="${escapeHtml(nombre)}" id="${id}"> ${escapeHtml(nombre)}`;
    container.appendChild(label);
  });
}
renderAgenciaCheckboxes();

function initForm() {
  const logs = getLogs();
  $("#folio").value = nextFolio(logs);
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  $("#fecha").value = now.toISOString().slice(0, 16);
  $all(".agencia-check").forEach((cb) => (cb.checked = false));
}
initForm();

$("#logForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const logs = getLogs();
  const estatusInicial = $("#estatus").value;
  const agencias = Array.from($all(".agencia-check")).filter((cb) => cb.checked).map((cb) => cb.value);
  const entry = {
    folio: $("#folio").value,
    fecha: $("#fecha").value,
    tipo: $("#tipo").value,
    prioridad: $("#prioridad").value,
    ubicacion: $("#ubicacion").value,
    unidad: $("#unidad").value,
    agencias,
    descripcion: $("#descripcion").value,
    estatus: estatusInicial,
    eventos: [{ estatus: estatusInicial, hora: new Date().toISOString() }],
  };
  logs.push(entry);
  saveLogs(logs);
  $("#logForm").reset();
  initForm();
  renderRecentTable();
  alert(`Registro guardado: ${entry.folio}`);
});

$("#btnClearForm").addEventListener("click", () => {
  $("#logForm").reset();
  initForm();
});

function renderRecentTable() {
  const logs = getLogs().slice(-8).reverse();
  const tbody = $("#recentTable tbody");
  tbody.innerHTML = "";
  logs.forEach((log) => {
    const eventos = log.eventos || [];
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${escapeHtml(log.folio)}</td>
      <td>${escapeHtml(log.fecha.replace("T", " "))}</td>
      <td>${escapeHtml(log.tipo)}</td>
      <td>${escapeHtml(log.ubicacion)}</td>
      <td><button class="estatus-btn ${ESTADO_CLASS[log.estatus] || ""}" data-avanzar="${escapeHtml(log.folio)}" title="Clic para avanzar estatus">${escapeHtml(log.estatus)}</button></td>
      <td class="row-actions">
        <button class="secondary-btn" data-timeline="${escapeHtml(log.folio)}">🕒 Línea de tiempo</button>
        <button class="secondary-btn" data-del="${escapeHtml(log.folio)}">Eliminar</button>
      </td>
    `;
    tbody.appendChild(tr);

    const timelineTr = document.createElement("tr");
    timelineTr.className = "timeline-row";
    timelineTr.dataset.timelineFor = log.folio;
    timelineTr.style.display = "none";
    const items = eventos
      .map((ev) => `<li><strong>${escapeHtml(ev.estatus)}</strong> &mdash; ${escapeHtml(new Date(ev.hora).toLocaleString("es-MX"))}</li>`)
      .join("");
    timelineTr.innerHTML = `<td colspan="6"><ul class="timeline-list">${items || "<li>Sin eventos registrados.</li>"}</ul></td>`;
    tbody.appendChild(timelineTr);
  });
  tbody.querySelectorAll("[data-del]").forEach((btn) => {
    btn.addEventListener("click", () => deleteLog(btn.dataset.del));
  });
  tbody.querySelectorAll("[data-avanzar]").forEach((btn) => {
    btn.addEventListener("click", () => advanceIncidentStatus(btn.dataset.avanzar));
  });
  tbody.querySelectorAll("[data-timeline]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const row = tbody.querySelector(`.timeline-row[data-timeline-for="${btn.dataset.timeline}"]`);
      if (row) row.style.display = row.style.display === "none" ? "" : "none";
    });
  });
}

function advanceIncidentStatus(folio) {
  const logs = getLogs();
  const log = logs.find((l) => l.folio === folio);
  if (!log) return;
  const next = ESTADOS_INCIDENTE[(ESTADOS_INCIDENTE.indexOf(log.estatus) + 1) % ESTADOS_INCIDENTE.length];
  log.estatus = next;
  log.eventos = log.eventos || [];
  log.eventos.push({ estatus: next, hora: new Date().toISOString() });
  saveLogs(logs);
  renderRecentTable();
  renderReportTable();
}

function deleteLog(folio) {
  if (!confirm(`¿Eliminar el registro ${folio}?`)) return;
  const logs = getLogs().filter((l) => l.folio !== folio);
  saveLogs(logs);
  renderRecentTable();
  renderReportTable();
}

// ===== Reportes =====
function renderReportTable() {
  let logs = getLogs();
  const desde = $("#filtroDesde").value;
  const hasta = $("#filtroHasta").value;
  const tipo = $("#filtroTipo").value;
  const estatus = $("#filtroEstatus").value;

  logs = logs.filter((l) => {
    const fecha = l.fecha.slice(0, 10);
    if (desde && fecha < desde) return false;
    if (hasta && fecha > hasta) return false;
    if (tipo && l.tipo !== tipo) return false;
    if (estatus && l.estatus !== estatus) return false;
    return true;
  });

  const tbody = $("#reportTable tbody");
  tbody.innerHTML = "";
  logs.slice().reverse().forEach((log) => {
    const prClass = log.prioridad === "Alta" ? "badge-alta" : log.prioridad === "Media" ? "badge-media" : "badge-baja";
    const agencias = (log.agencias || []).join(", ");
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${escapeHtml(log.folio)}</td>
      <td>${escapeHtml(log.fecha.replace("T", " "))}</td>
      <td>${escapeHtml(log.tipo)}</td>
      <td class="${prClass}">${escapeHtml(log.prioridad)}</td>
      <td>${escapeHtml(log.ubicacion)}</td>
      <td>${escapeHtml(log.unidad)}</td>
      <td>${escapeHtml(agencias)}</td>
      <td>${escapeHtml(log.estatus)}</td>
      <td>${escapeHtml(log.descripcion)}</td>
      <td><button class="secondary-btn" data-detalle="${escapeHtml(log.folio)}">🖨️ Detalle</button></td>
    `;
    tbody.appendChild(tr);
  });
  tbody.querySelectorAll("[data-detalle]").forEach((btn) => {
    btn.addEventListener("click", () => printIncidentReport(btn.dataset.detalle));
  });
  $("#statLine").textContent = `Total de registros mostrados: ${logs.length}`;
  return logs;
}

function printIncidentReport(folio) {
  const log = getLogs().find((l) => l.folio === folio);
  if (!log) return;
  const eventos = log.eventos || [];
  const timelineHtml = eventos.length
    ? `<ul>${eventos.map((ev) => `<li><strong>${escapeHtml(ev.estatus)}</strong> &mdash; ${escapeHtml(new Date(ev.hora).toLocaleString("es-MX"))}</li>`).join("")}</ul>`
    : "<p>Sin eventos registrados.</p>";
  const agenciasHtml = (log.agencias || []).length ? (log.agencias || []).join(", ") : "Ninguna registrada";

  $("#printSingle").innerHTML = `
    <h2>Reporte de Incidente &mdash; ${escapeHtml(log.folio)}</h2>
    <table>
      <tr><td class="label">Fecha / Hora</td><td>${escapeHtml(log.fecha.replace("T", " "))}</td></tr>
      <tr><td class="label">Tipo de Incidente</td><td>${escapeHtml(log.tipo)}</td></tr>
      <tr><td class="label">Prioridad</td><td>${escapeHtml(log.prioridad)}</td></tr>
      <tr><td class="label">Ubicación</td><td>${escapeHtml(log.ubicacion)}</td></tr>
      <tr><td class="label">Unidad Asignada</td><td>${escapeHtml(log.unidad || "-")}</td></tr>
      <tr><td class="label">Agencias de Apoyo</td><td>${escapeHtml(agenciasHtml)}</td></tr>
      <tr><td class="label">Estatus Actual</td><td>${escapeHtml(log.estatus)}</td></tr>
      <tr><td class="label">Descripción</td><td>${escapeHtml(log.descripcion)}</td></tr>
      <tr><td class="label">Línea de Tiempo</td><td>${timelineHtml}</td></tr>
    </table>
  `;
  document.body.classList.add("printing-single");
  window.print();
}
window.addEventListener("afterprint", () => {
  document.body.classList.remove("printing-single");
});

$("#btnFiltrar").addEventListener("click", renderReportTable);
$("#btnLimpiarFiltro").addEventListener("click", () => {
  $("#filtroDesde").value = "";
  $("#filtroHasta").value = "";
  $("#filtroTipo").value = "";
  $("#filtroEstatus").value = "";
  renderReportTable();
});

$("#btnExportCSV").addEventListener("click", () => {
  const logs = renderReportTable();
  if (logs.length === 0) {
    alert("No hay registros para exportar.");
    return;
  }
  const headers = ["Folio", "Fecha", "Tipo", "Prioridad", "Ubicacion", "Unidad", "Agencias", "Estatus", "Descripcion"];
  const rows = logs.map((l) => [l.folio, l.fecha, l.tipo, l.prioridad, l.ubicacion, l.unidad, (l.agencias || []).join("; "), l.estatus, l.descripcion]);
  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `TERT_reporte_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
});

$("#btnPrint").addEventListener("click", () => window.print());

$("#btnBorrarTodo").addEventListener("click", () => {
  if (confirm("Esto eliminará TODOS los registros de bitácora de este navegador. ¿Continuar?")) {
    saveLogs([]);
    renderReportTable();
    renderRecentTable();
    initForm();
  }
});

// ===== Info / Notas =====
function loadNotes() {
  $("#notasInternas").value = localStorage.getItem(NOTES_KEY) || "";
}
$("#btnGuardarNotas").addEventListener("click", () => {
  localStorage.setItem(NOTES_KEY, $("#notasInternas").value);
  alert("Notas guardadas.");
});
loadNotes();

// ===== Inicialización general =====
renderRecentTable();
renderReportTable();
