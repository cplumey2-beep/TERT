// ===== Candado de acceso (deterrente, NO seguridad real — ver nota en el chat) =====
// Para cambiar la contraseña: calcula el SHA-256 en hex del nuevo valor y reemplaza
// LOCK_PASSWORD_HASH. Pídele a Claude que lo haga y publique el cambio si prefieres.
const LOCK_PASSWORD_HASH = "b841cc4653c031b8ef37f7418f93b053119de4dff29bae51e0efa694bf22acbc";
const LOCK_KEY = "tert_unlocked_at";
const LOCK_SESSION_MS = 7 * 24 * 60 * 60 * 1000; // sesión expira sola a los 7 días

async function sha256Hex(text) {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function logout() {
  localStorage.removeItem(LOCK_KEY);
  window.location.reload();
}

(function initLock() {
  const overlay = document.getElementById("lockOverlay");
  const unlockedAt = Number(localStorage.getItem(LOCK_KEY) || 0);
  if (unlockedAt && Date.now() - unlockedAt < LOCK_SESSION_MS) {
    overlay.classList.add("hidden");
    return;
  }
  localStorage.removeItem(LOCK_KEY);
  const input = document.getElementById("lockPasswordInput");
  const error = document.getElementById("lockError");
  async function tryUnlock() {
    const hash = await sha256Hex(input.value);
    if (hash === LOCK_PASSWORD_HASH) {
      localStorage.setItem(LOCK_KEY, String(Date.now()));
      overlay.classList.add("hidden");
    } else {
      error.textContent = "Contraseña incorrecta.";
      input.value = "";
      input.focus();
    }
  }
  document.getElementById("lockSubmit").addEventListener("click", tryUnlock);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") tryUnlock();
  });
  input.focus();
})();

document.getElementById("btnLogout").addEventListener("click", () => {
  if (confirm("¿Cerrar sesión? Vas a necesitar la contraseña para volver a entrar.")) logout();
});

// ===== Configuración de contactos de marcado rápido (sede TERT: Barceloneta, PR) =====
// Valores por defecto — el nombre y número de cada botón se pueden editar directamente
// desde la app (clic en el lápiz ✎). Los cambios se guardan en este navegador.
// Agrupados por tipo de servicio; cada nombre termina con el pueblo entre paréntesis.
const QUICK_DIAL_CATEGORIES = ["General", "Policía Estatal", "Policía Municipal", "Bomberos", "Rescate", "Ambulancia", "Otros"];
const QUICK_DIAL = [
  { id: "qd-911", category: "General", label: "🚨 Emergencias 911", number: "911" },

  { id: "qd-policia-estatal-bc", category: "Policía Estatal", label: "👮 Policía Estatal (Barceloneta, sin confirmar)", number: "" },
  { id: "qd-policia-estatal-florida", category: "Policía Estatal", label: "👮 Policía Estatal (Florida)", number: "7878222020" },
  { id: "qd-comandancia-arecibo", category: "Policía Estatal", label: "🚔 Comandancia PPR (Arecibo)", number: "7878784000" },
  { id: "qd-transito-arecibo", category: "Policía Estatal", label: "🚦 Policía Estatal — Tránsito (Arecibo, vía Comandancia)", number: "7878784000" },

  { id: "qd-policia-municipal-bc", category: "Policía Municipal", label: "🏙️ Policía Municipal (Barceloneta)", number: "7878462915" },
  { id: "qd-policia-municipal-florida", category: "Policía Municipal", label: "🏙️ Policía Municipal (Florida, línea gral. municipio)", number: "7878222600" },
  { id: "qd-policia-municipal-arecibo", category: "Policía Municipal", label: "🏙️ Policía Municipal (Arecibo)", number: "7879302949" },
  { id: "qd-policia-municipal-manati", category: "Policía Municipal", label: "🏙️ Policía Municipal (Manatí)", number: "7878546720" },

  { id: "qd-bomberos-bc", category: "Bomberos", label: "🚒 Bomberos (Barceloneta, Carr. 2)", number: "7878462330" },
  { id: "qd-bomberos-arecibo", category: "Bomberos", label: "🚒 Bomberos (Arecibo)", number: "7878782330" },
  { id: "qd-bomberos-manati", category: "Bomberos", label: "🚒 Bomberos (Manatí)", number: "7878542330" },
  { id: "qd-bomberos-florida", category: "Bomberos", label: "🚒 Bomberos (Florida)", number: "7878222330" },

  { id: "qd-rescate-omme-bc", category: "Rescate", label: "🆘 Rescate / OMME (Barceloneta)", number: "7878463210" },
  { id: "qd-rescate-arecibo", category: "Rescate", label: "🆘 Rescate / OMME (Arecibo, verificar)", number: "7878783454" },
  { id: "qd-rescate-manati", category: "Rescate", label: "🆘 Rescate / OMME (Manatí)", number: "7878542297" },

  { id: "qd-cruz-roja", category: "Ambulancia", label: "🚑 Cruz Roja (065, respaldo general)", number: "065" },
  { id: "qd-atenas-bc", category: "Ambulancia", label: "🚑 Atenas Ambulance (Barceloneta)", number: "7878462220" },
  { id: "qd-continental-florida", category: "Ambulancia", label: "🚑 Continental EMT (Florida)", number: "7879696444" },
  { id: "qd-harrison-arecibo", category: "Ambulancia", label: "🚑 Harrison Ramos Ambulance (Arecibo)", number: "7872102128" },
  { id: "qd-health-manati", category: "Ambulancia", label: "🚑 Health Medical Ambulance (Manatí)", number: "7879491024" },

  { id: "qd-drna-arecibo", category: "Otros", label: "🌊 DRNA Oficina Regional (Arecibo)", number: "7878787279" },
  { id: "qd-metro-pistas", category: "Otros", label: "🛣️ Metro Pistas (Asistencia PR-22)", number: "7877058699" },
  { id: "qd-proteccion-civil", category: "Otros", label: "🛟 Protección Civil", number: "911" },
  { id: "qd-base-tert", category: "Otros", label: "📻 Base TERT", number: "" },
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
const TURNO_KEY = "tert_turno_actual";
const TURNOS_HISTORIAL_KEY = "tert_turnos_historial";

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
function formatFechaLarga(iso) {
  return new Date(iso).toLocaleString("es-MX", {
    weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
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

// ===== Despachador en Turno (documentación / responsabilidad legal) =====
function getTurnoActual() {
  return JSON.parse(localStorage.getItem(TURNO_KEY) || "null");
}
function saveTurnoActual(turno) {
  if (turno) localStorage.setItem(TURNO_KEY, JSON.stringify(turno));
  else localStorage.removeItem(TURNO_KEY);
}
function getTurnosHistorial() {
  return JSON.parse(localStorage.getItem(TURNOS_HISTORIAL_KEY) || "[]");
}
function saveTurnosHistorial(historial) {
  localStorage.setItem(TURNOS_HISTORIAL_KEY, JSON.stringify(historial));
}

function renderTurnoBar() {
  const turno = getTurnoActual();
  const bar = $("#turnoBar");
  if (turno) {
    bar.textContent = `Despachador en Turno: ${turno.nombre} — desde ${formatFechaLarga(turno.inicio)}`;
    bar.className = "turno-bar turno-activo";
  } else {
    bar.textContent = "⚠️ Sin despachador en turno registrado — configúralo en Información";
    bar.className = "turno-bar turno-vacio";
  }
}

function renderTurnoInfo() {
  renderTurnoBar();
  const turno = getTurnoActual();
  $("#turnoActualBox").innerHTML = turno
    ? `<strong>${escapeHtml(turno.nombre)}</strong> en turno desde ${escapeHtml(formatFechaLarga(turno.inicio))}`
    : "Nadie tiene un turno activo registrado.";

  const historial = getTurnosHistorial();
  const tbody = $("#turnoHistorialTable tbody");
  tbody.innerHTML = "";
  historial.slice().reverse().forEach((t) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${escapeHtml(t.nombre)}</td>
      <td>${escapeHtml(formatFechaLarga(t.inicio))}</td>
      <td>${escapeHtml(formatFechaLarga(t.fin))}</td>
    `;
    tbody.appendChild(tr);
  });
}

function iniciarTurno() {
  const nombre = $("#turnoNombreInput").value.trim();
  if (!nombre) {
    alert("Escribe el nombre del despachador antes de iniciar el turno.");
    return;
  }
  const actual = getTurnoActual();
  if (actual) {
    if (!confirm(`Ya hay un turno activo de ${actual.nombre} desde ${formatFechaLarga(actual.inicio)}. ¿Cerrarlo y comenzar el turno de ${nombre}?`)) return;
    const historial = getTurnosHistorial();
    historial.push({ nombre: actual.nombre, inicio: actual.inicio, fin: new Date().toISOString() });
    saveTurnosHistorial(historial);
  }
  saveTurnoActual({ nombre, inicio: new Date().toISOString() });
  $("#turnoNombreInput").value = "";
  renderTurnoInfo();
}

function terminarTurno() {
  const actual = getTurnoActual();
  if (!actual) {
    alert("No hay ningún turno activo.");
    return;
  }
  if (!confirm(`¿Terminar el turno de ${actual.nombre}?`)) return;
  const historial = getTurnosHistorial();
  historial.push({ nombre: actual.nombre, inicio: actual.inicio, fin: new Date().toISOString() });
  saveTurnosHistorial(historial);
  saveTurnoActual(null);
  renderTurnoInfo();
}

$("#btnIniciarTurno").addEventListener("click", iniciarTurno);
$("#btnTerminarTurno").addEventListener("click", terminarTurno);
renderTurnoInfo();

// ===== Marcado rápido =====
function getQuickDialOverrides() {
  return JSON.parse(localStorage.getItem(QUICK_DIAL_OVERRIDES_KEY) || "{}");
}
function saveQuickDialOverrides(overrides) {
  localStorage.setItem(QUICK_DIAL_OVERRIDES_KEY, JSON.stringify(overrides));
}
function buildQuickDialCard(c, overrides) {
  const o = overrides[c.id] || {};
  const label = o.label || c.label;
  const number = o.number !== undefined ? o.number : c.number;

  const card = document.createElement("div");
  card.className = "quickdial-card";
  card.innerHTML = `
    <button type="button" class="quickdial-edit" title="Editar nombre y número">✎</button>
    <button type="button" class="quickdial-dial">${escapeHtml(label)}</button>
  `;
  const editBtn = card.querySelector(".quickdial-edit");
  const dialBtn = card.querySelector(".quickdial-dial");
  editBtn.addEventListener("click", () => withPressed(editBtn, () => openContactModal("quickdial", c.id, label, number)));
  dialBtn.addEventListener("click", () => withPressed(dialBtn, () => {
    if (!number) {
      alert("Este botón no tiene número configurado. Clic en ✎ para agregarlo.");
      return;
    }
    window.location.href = `tel:${number}`;
  }));
  return card;
}

function renderQuickDial() {
  const overrides = getQuickDialOverrides();
  const container = $("#quickDial");
  container.innerHTML = "";

  const byCategory = {};
  QUICK_DIAL.forEach((c) => {
    (byCategory[c.category] = byCategory[c.category] || []).push(c);
  });

  QUICK_DIAL_CATEGORIES.forEach((cat) => {
    const items = byCategory[cat];
    if (!items || !items.length) return;

    const title = document.createElement("h3");
    title.className = "quickdial-group-title";
    title.textContent = cat;
    container.appendChild(title);

    const grid = document.createElement("div");
    grid.className = "grid-buttons quickdial-grid";
    items.forEach((c) => grid.appendChild(buildQuickDialCard(c, overrides)));
    container.appendChild(grid);
  });
}

// Modal compartido entre Marcado Rápido y Tablero de Unidades (nombre + número).
let qdEditContext = null; // { type: "quickdial" | "unit", id }
function openContactModal(type, id, currentLabel, currentNumber) {
  qdEditContext = { type, id };
  if (type === "unit") {
    $("#qdModalTitle").textContent = "Editar Unidad";
    $("#qdModalLabelWrap").firstChild.textContent = "Nombre / cargo";
    $("#qdModalNumberWrap").firstChild.textContent = "Celular (para difusión SMS, solo dígitos)";
  } else {
    $("#qdModalTitle").textContent = "Editar Botón de Marcado Rápido";
    $("#qdModalLabelWrap").firstChild.textContent = "Nombre / descripción";
    $("#qdModalNumberWrap").firstChild.textContent = "Número de teléfono (solo dígitos)";
  }
  $("#qdModalLabel").value = currentLabel;
  $("#qdModalNumber").value = currentNumber;
  $("#qdModalOverlay").classList.add("open");
  $("#qdModalLabel").focus();
}
function closeQdModal() {
  $("#qdModalOverlay").classList.remove("open");
  qdEditContext = null;
}
$("#qdModalCancel").addEventListener("click", closeQdModal);
$("#qdModalOverlay").addEventListener("click", (e) => {
  if (e.target.id === "qdModalOverlay") closeQdModal();
});
$("#qdModalSave").addEventListener("click", () => {
  if (!qdEditContext) return;
  const newLabel = $("#qdModalLabel").value.trim();
  const newNumber = $("#qdModalNumber").value.replace(/[^0-9]/g, "");
  if (!newLabel) {
    alert("El nombre no puede quedar vacío.");
    return;
  }
  if (qdEditContext.type === "unit") {
    const labels = getUnitLabels();
    labels[qdEditContext.id] = { label: newLabel, phone: newNumber };
    saveUnitLabels(labels);
    renderUnitBoard();
  } else {
    const overrides = getQuickDialOverrides();
    overrides[qdEditContext.id] = { label: newLabel, number: newNumber };
    saveQuickDialOverrides(overrides);
    renderQuickDial();
  }
  closeQdModal();
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
function normalizeUnitOverride(raw) {
  if (!raw) return { label: "", phone: "" };
  if (typeof raw === "string") return { label: raw, phone: "" }; // formato anterior
  return { label: raw.label || "", phone: raw.phone || "" };
}
function renderUnitBoard() {
  const statuses = getUnitStatuses();
  const labels = getUnitLabels();
  const container = $("#unitBoard");
  container.innerHTML = "";
  UNITS.forEach((u) => {
    const o = normalizeUnitOverride(labels[u.id]);
    const label = o.label || u.label;
    const phone = o.phone;
    const current = statuses[u.id] || "Disponible";
    const card = document.createElement("div");
    card.className = "unit-card " + UNIT_STATUS_CLASS[current];
    card.innerHTML = `
      <button type="button" class="unit-edit" title="Editar nombre/cargo y celular">✎</button>
      <span class="unit-label">${escapeHtml(label)}</span>
      <button type="button" class="unit-status" title="Clic para cambiar estatus">${escapeHtml(current)}</button>
    `;
    card.querySelector(".unit-edit").addEventListener("click", () => openContactModal("unit", u.id, label, phone));
    card.querySelector(".unit-status").addEventListener("click", () => cycleUnitStatus(u.id));
    container.appendChild(card);
  });
}
function getMemberPhones(onlyDisponibles) {
  const labels = getUnitLabels();
  const statuses = getUnitStatuses();
  return UNITS
    .filter((u) => !onlyDisponibles || (statuses[u.id] || "Disponible") === "Disponible")
    .map((u) => normalizeUnitOverride(labels[u.id]).phone)
    .filter((phone) => phone);
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

$("#btnResetAllUnits").addEventListener("click", () => {
  if (!confirm("¿Marcar TODAS las unidades como Disponible?")) return;
  const statuses = getUnitStatuses();
  UNITS.forEach((u) => (statuses[u.id] = "Disponible"));
  saveUnitStatuses(statuses);
  renderUnitBoard();
});

// ===== Difusión a miembros (SMS) =====
// Círculo de color al inicio del mensaje para identificar el tipo de un vistazo:
// 🔴 = 10-50 emergencia (sirenas) · 🟢 = NO 10-50 (sin sirenas) · 🟡 = prueba del sistema
function sendBroadcast(body, onlyDisponibles) {
  const phones = getMemberPhones(onlyDisponibles);
  if (!phones.length) {
    const msg = onlyDisponibles
      ? "No hay unidades con estatus Disponible que tengan celular configurado en este momento."
      : "No hay celulares configurados. Clic en ✎ en cada miembro del Tablero de Unidades para agregar su número.";
    alert(msg);
    return;
  }
  window.location.href = `sms:${phones.join(",")}?body=${encodeURIComponent(body)}`;
}

function broadcastIncidente(codigo, descripcion, emergencia) {
  const direccion = prompt("Dirección del incidente, incluye el pueblo (ej. Carretera #2 KM 60, Barceloneta):", "");
  if (direccion === null || !direccion.trim()) return;

  const circulo = emergencia ? "🔴" : "🟢";
  const cierre = emergencia
    ? "Proceda en 10-50 a la zona con precaución. Debidamente autorizado."
    : "Proceda a la zona con precaución de manera regular. Debidamente autorizado.";
  const recordatorio = "Favor de reportar su participación a través de Zello o por aquí por texto para activarlo y para récord. Gracias.";
  sendBroadcast(`${circulo} A todas las unidades Disponibles, se reporta ${descripcion} (${codigo}), ${direccion.trim()}. ${cierre} ${recordatorio}`, true);
}

function broadcastCustom() {
  const mensaje = prompt("Escribe el mensaje a difundir a las unidades Disponibles:", "");
  if (mensaje === null || !mensaje.trim()) return;
  sendBroadcast(`⚪ A todas las unidades Disponibles: ${mensaje.trim()}`, true);
}

function broadcastPrueba() {
  const mensaje = "🟡 >>> Esto es una prueba del nuevo sistema de difusión automatizada inteligente de despacho de TERT. Si recibe este mensaje, por favor conteste. Gracias. Mensaje de prueba enviado por Ing. Plumey. <<< 🟡";
  sendBroadcast(mensaje, false);
}

// Pinta el botón de naranja mientras el prompt()/confirm() está abierto y lo
// apaga apenas el usuario responde (Aceptar o Cancelar) — feedback intencional,
// no el "hover pegado" del navegador. El prompt()/confirm() congela el hilo
// principal y en Android puede detener el ciclo de animación (requestAnimationFrame)
// antes de llegar a pintar, así que se usa setTimeout — obliga a un ciclo completo
// de renderizado normal del navegador antes de abrir el diálogo.
function withPressed(btn, fn) {
  btn.classList.add("btn-pressed");
  setTimeout(() => {
    try {
      fn();
    } finally {
      btn.classList.remove("btn-pressed");
    }
  }, 60);
}
function onPressed(id, fn) {
  $(id).addEventListener("click", (e) => withPressed(e.currentTarget, fn));
}

onPressed("#btnBroadcast1042_1050", () => broadcastIncidente("10-42", "Accidente", true));
onPressed("#btnBroadcast1042_no1050", () => broadcastIncidente("10-42", "Accidente", false));
onPressed("#btnBroadcast1044_1050", () => broadcastIncidente("10-44", "Fuego", true));
onPressed("#btnBroadcast1044_no1050", () => broadcastIncidente("10-44", "Fuego", false));
onPressed("#btnBroadcast1043_1050", () => broadcastIncidente("10-43", "Accidente Aéreo", true));
onPressed("#btnBroadcast1043_no1050", () => broadcastIncidente("10-43", "Accidente Aéreo", false));
onPressed("#btnBroadcast1045_1050", () => broadcastIncidente("10-45", "Explosión", true));
onPressed("#btnBroadcast1045_no1050", () => broadcastIncidente("10-45", "Explosión", false));
onPressed("#btnBroadcast1046_1050", () => broadcastIncidente("10-46", "Naufragio / Ahogamiento", true));
onPressed("#btnBroadcast1046_no1050", () => broadcastIncidente("10-46", "Naufragio / Ahogamiento", false));
onPressed("#btnBroadcastInundacion", () => broadcastIncidente("10-47", "Inundación", false));
onPressed("#btnBroadcast1049_1050", () => broadcastIncidente("10-49", "Deslizamiento", true));
onPressed("#btnBroadcast1049_no1050", () => broadcastIncidente("10-49", "Deslizamiento", false));
onPressed("#btnBroadcastCustom", broadcastCustom);
onPressed("#btnBroadcastPrueba", broadcastPrueba);

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
    despachador: (getTurnoActual() || {}).nombre || "Sin turno registrado",
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
      <td>${escapeHtml(log.despachador || "-")}</td>
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
      <tr><td class="label">Despachador en Turno</td><td>${escapeHtml(log.despachador || "-")}</td></tr>
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
  const headers = ["Folio", "Fecha", "Tipo", "Prioridad", "Ubicacion", "Unidad", "Agencias", "Estatus", "Despachador", "Descripcion"];
  const rows = logs.map((l) => [l.folio, l.fecha, l.tipo, l.prioridad, l.ubicacion, l.unidad, (l.agencias || []).join("; "), l.estatus, l.despachador || "-", l.descripcion]);
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

// ===== Exportar / Importar configuración (nombres, celulares, marcado rápido, notas) =====
$("#btnExportConfig").addEventListener("click", () => {
  const config = {
    tipo: "tert_config",
    version: 1,
    exportado: new Date().toISOString(),
    unitLabels: getUnitLabels(),
    quickDialOverrides: getQuickDialOverrides(),
    notas: localStorage.getItem(NOTES_KEY) || "",
  };
  const blob = new Blob([JSON.stringify(config, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `TERT_config_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
});

$("#btnImportConfig").addEventListener("click", () => $("#importConfigFile").click());
$("#importConfigFile").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    let config;
    try {
      config = JSON.parse(reader.result);
    } catch (err) {
      alert("Archivo inválido: no es un JSON de configuración de TERT.");
      e.target.value = "";
      return;
    }
    if (config.tipo !== "tert_config") {
      alert("Archivo inválido: no es un archivo de configuración de TERT.");
      e.target.value = "";
      return;
    }
    if (!confirm("Esto reemplazará los nombres, celulares, marcado rápido y notas de este dispositivo con los del archivo. ¿Continuar?")) {
      e.target.value = "";
      return;
    }
    saveUnitLabels(config.unitLabels || {});
    saveQuickDialOverrides(config.quickDialOverrides || {});
    localStorage.setItem(NOTES_KEY, config.notas || "");
    renderUnitBoard();
    renderQuickDial();
    loadNotes();
    e.target.value = "";
    alert("Configuración importada correctamente.");
  };
  reader.readAsText(file);
});

// ===== Forzar actualización (recargar sin usar copia guardada) =====
$("#btnForceRefresh").addEventListener("click", async () => {
  if ("caches" in window) {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => caches.delete(k)));
  }
  window.location.href = window.location.pathname + "?_refresh=" + Date.now();
});

// ===== Acerca de / Términos y Condiciones =====
$("#btnOpenAcerca").addEventListener("click", () => $("#acercaModalOverlay").classList.add("open"));
$("#acercaModalClose").addEventListener("click", () => $("#acercaModalOverlay").classList.remove("open"));
$("#acercaModalOverlay").addEventListener("click", (e) => {
  if (e.target.id === "acercaModalOverlay") $("#acercaModalOverlay").classList.remove("open");
});

$("#btnOpenTerminos").addEventListener("click", () => $("#terminosModalOverlay").classList.add("open"));
$("#terminosModalClose").addEventListener("click", () => $("#terminosModalOverlay").classList.remove("open"));
$("#terminosModalOverlay").addEventListener("click", (e) => {
  if (e.target.id === "terminosModalOverlay") $("#terminosModalOverlay").classList.remove("open");
});

// ===== Inicialización general =====
renderRecentTable();
renderReportTable();
