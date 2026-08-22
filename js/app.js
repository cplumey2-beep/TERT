// ===== Configuración de contactos de marcado rápido =====
// Edita este arreglo para ajustar los números reales de tu localidad/estado.
const QUICK_DIAL = [
  { label: "🚨 Emergencias 911", number: "911" },
  { label: "👮 Policía Estatal", number: "911" },
  { label: "🏙️ Policía Municipal", number: "911" },
  { label: "🚒 Bomberos", number: "911" },
  { label: "🚑 Ambulancia / Cruz Roja", number: "065" },
  { label: "🚦 Tránsito y Vialidad", number: "911" },
  { label: "🛟 Protección Civil", number: "911" },
  { label: "📻 Base TERT", number: "" }
];

// ===== Configuración del tablero de unidades =====
// Edita este arreglo con los identificadores reales de tus unidades TERT.
const UNITS = [
  { id: "TERT-01", label: "TERT-01" },
  { id: "TERT-02", label: "TERT-02" },
  { id: "TERT-03", label: "TERT-03" },
  { id: "TERT-04", label: "TERT-04" },
  { id: "TERT-05", label: "TERT-05" },
];

const UNIT_STATUSES = ["Disponible", "En Ruta", "En Sitio", "Fuera de Servicio"];
const UNIT_STATUS_CLASS = {
  "Disponible": "status-disponible",
  "En Ruta": "status-enruta",
  "En Sitio": "status-ensitio",
  "Fuera de Servicio": "status-fuera",
};

const STORAGE_KEY = "tert_bitacora";
const NOTES_KEY = "tert_notas";
const UNIT_STATUS_KEY = "tert_unit_status";

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
function renderQuickDial() {
  const container = $("#quickDial");
  container.innerHTML = "";
  QUICK_DIAL.forEach((c) => {
    const btn = document.createElement("button");
    btn.textContent = c.label;
    btn.addEventListener("click", () => {
      if (!c.number) {
        alert("Configura el número de esta línea en QUICK_DIAL dentro de js/app.js");
        return;
      }
      window.location.href = `tel:${c.number}`;
    });
    container.appendChild(btn);
  });
}
renderQuickDial();

// ===== Tablero de unidades =====
function getUnitStatuses() {
  return JSON.parse(localStorage.getItem(UNIT_STATUS_KEY) || "{}");
}
function saveUnitStatuses(statuses) {
  localStorage.setItem(UNIT_STATUS_KEY, JSON.stringify(statuses));
}
function renderUnitBoard() {
  const statuses = getUnitStatuses();
  const container = $("#unitBoard");
  container.innerHTML = "";
  UNITS.forEach((u) => {
    const current = statuses[u.id] || "Disponible";
    const card = document.createElement("button");
    card.type = "button";
    card.className = "unit-card " + UNIT_STATUS_CLASS[current];
    card.innerHTML = `<span class="unit-label">${escapeHtml(u.label)}</span><span class="unit-status">${escapeHtml(current)}</span>`;
    card.addEventListener("click", () => cycleUnitStatus(u.id));
    container.appendChild(card);
  });
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
function initForm() {
  const logs = getLogs();
  $("#folio").value = nextFolio(logs);
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  $("#fecha").value = now.toISOString().slice(0, 16);
}
initForm();

$("#logForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const logs = getLogs();
  const entry = {
    folio: $("#folio").value,
    fecha: $("#fecha").value,
    tipo: $("#tipo").value,
    prioridad: $("#prioridad").value,
    ubicacion: $("#ubicacion").value,
    unidad: $("#unidad").value,
    descripcion: $("#descripcion").value,
    estatus: $("#estatus").value,
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
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${escapeHtml(log.folio)}</td>
      <td>${escapeHtml(log.fecha.replace("T", " "))}</td>
      <td>${escapeHtml(log.tipo)}</td>
      <td>${escapeHtml(log.ubicacion)}</td>
      <td>${escapeHtml(log.estatus)}</td>
      <td><button class="secondary-btn" data-del="${escapeHtml(log.folio)}">Eliminar</button></td>
    `;
    tbody.appendChild(tr);
  });
  tbody.querySelectorAll("[data-del]").forEach((btn) => {
    btn.addEventListener("click", () => deleteLog(btn.dataset.del));
  });
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
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${escapeHtml(log.folio)}</td>
      <td>${escapeHtml(log.fecha.replace("T", " "))}</td>
      <td>${escapeHtml(log.tipo)}</td>
      <td class="${prClass}">${escapeHtml(log.prioridad)}</td>
      <td>${escapeHtml(log.ubicacion)}</td>
      <td>${escapeHtml(log.unidad)}</td>
      <td>${escapeHtml(log.estatus)}</td>
      <td>${escapeHtml(log.descripcion)}</td>
    `;
    tbody.appendChild(tr);
  });
  $("#statLine").textContent = `Total de registros mostrados: ${logs.length}`;
  return logs;
}

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
  const headers = ["Folio", "Fecha", "Tipo", "Prioridad", "Ubicacion", "Unidad", "Estatus", "Descripcion"];
  const rows = logs.map((l) => [l.folio, l.fecha, l.tipo, l.prioridad, l.ubicacion, l.unidad, l.estatus, l.descripcion]);
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
