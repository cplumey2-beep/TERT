// ===== Candado de acceso (deterrente, NO seguridad real — ver nota en el chat) =====
// Para cambiar la contraseña: calcula el SHA-256 en hex del nuevo valor y reemplaza
// LOCK_PASSWORD_HASH. Pídele a Claude que lo haga y publique el cambio si prefieres.
const LOCK_PASSWORD_HASH = "b841cc4653c031b8ef37f7418f93b053119de4dff29bae51e0efa694bf22acbc";
const LOCK_KEY = "tert_unlocked_at";
const LOCK_SESSION_MS = 7 * 24 * 60 * 60 * 1000; // sesión expira sola a los 7 días

// ===== Modo Mantenimiento y Prueba (override sin Despachador en Turno) =====
// Contraseña maestra: "Master1234" — para cambiarla, calcula el SHA-256 en hex
// del nuevo valor y reemplaza MASTER_PASSWORD_HASH.
const MASTER_PASSWORD_HASH = "9fda2311081823727c5de41f8a6413fd030e6978685902a654c72d9a20155e51";
const MAINTENANCE_KEY = "tert_mantenimiento";

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
  { id: "qd-general-02", category: "General", label: "➕ Agregar Contacto", number: "" },
  { id: "qd-general-03", category: "General", label: "➕ Agregar Contacto", number: "" },
  { id: "qd-general-04", category: "General", label: "➕ Agregar Contacto", number: "" },
  { id: "qd-general-05", category: "General", label: "➕ Agregar Contacto", number: "" },
  { id: "qd-general-06", category: "General", label: "➕ Agregar Contacto", number: "" },

  { id: "qd-policia-estatal-bc", category: "Policía Estatal", label: "👮 Policía Estatal (Barceloneta, sin confirmar)", number: "" },
  { id: "qd-policia-estatal-florida", category: "Policía Estatal", label: "👮 Policía Estatal (Florida)", number: "7878222020" },
  { id: "qd-comandancia-arecibo", category: "Policía Estatal", label: "🚔 Comandancia PPR (Arecibo)", number: "7878784000" },
  { id: "qd-transito-arecibo", category: "Policía Estatal", label: "🚦 Policía Estatal — Tránsito (Arecibo, vía Comandancia)", number: "7878784000" },
  { id: "qd-policia-estatal-05", category: "Policía Estatal", label: "➕ Agregar Contacto", number: "" },
  { id: "qd-policia-estatal-06", category: "Policía Estatal", label: "➕ Agregar Contacto", number: "" },

  { id: "qd-policia-municipal-bc", category: "Policía Municipal", label: "🏙️ Policía Municipal (Barceloneta)", number: "7878462915" },
  { id: "qd-policia-municipal-florida", category: "Policía Municipal", label: "🏙️ Policía Municipal (Florida, línea gral. municipio)", number: "7878222600" },
  { id: "qd-policia-municipal-arecibo", category: "Policía Municipal", label: "🏙️ Policía Municipal (Arecibo)", number: "7879302949" },
  { id: "qd-policia-municipal-manati", category: "Policía Municipal", label: "🏙️ Policía Municipal (Manatí)", number: "7878546720" },
  { id: "qd-policia-municipal-05", category: "Policía Municipal", label: "➕ Agregar Contacto", number: "" },
  { id: "qd-policia-municipal-06", category: "Policía Municipal", label: "➕ Agregar Contacto", number: "" },

  { id: "qd-bomberos-bc", category: "Bomberos", label: "🚒 Bomberos (Barceloneta, Carr. 2)", number: "7878462330" },
  { id: "qd-bomberos-arecibo", category: "Bomberos", label: "🚒 Bomberos (Arecibo)", number: "7878782330" },
  { id: "qd-bomberos-manati", category: "Bomberos", label: "🚒 Bomberos (Manatí)", number: "7878542330" },
  { id: "qd-bomberos-florida", category: "Bomberos", label: "🚒 Bomberos (Florida)", number: "7878222330" },
  { id: "qd-bomberos-05", category: "Bomberos", label: "➕ Agregar Contacto", number: "" },
  { id: "qd-bomberos-06", category: "Bomberos", label: "➕ Agregar Contacto", number: "" },

  { id: "qd-rescate-omme-bc", category: "Rescate", label: "🆘 Rescate / OMEAD (Barceloneta)", number: "7878006329" },
  { id: "qd-rescate-arecibo", category: "Rescate", label: "🆘 Rescate / OMEAD (Arecibo, verificar)", number: "7878783454" },
  { id: "qd-rescate-manati", category: "Rescate", label: "🆘 Rescate / OMEAD (Manatí) (OSCAR)", number: "7878542297" },
  { id: "qd-rescate-04", category: "Rescate", label: "➕ Agregar Contacto", number: "" },
  { id: "qd-rescate-05", category: "Rescate", label: "➕ Agregar Contacto", number: "" },
  { id: "qd-rescate-06", category: "Rescate", label: "➕ Agregar Contacto", number: "" },

  { id: "qd-cruz-roja", category: "Ambulancia", label: "🚑 Cruz Roja (065, respaldo general)", number: "065" },
  { id: "qd-atenas-bc", category: "Ambulancia", label: "🚑 Atenas Ambulance (Barceloneta)", number: "7878462220" },
  { id: "qd-gonzalez-bc", category: "Ambulancia", label: "🚑 Gonzalez Ambulance (Barceloneta)", number: "7879041711" },
  { id: "qd-continental-florida", category: "Ambulancia", label: "🚑 Continental EMT (Florida)", number: "7879696444" },
  { id: "qd-harrison-arecibo", category: "Ambulancia", label: "🚑 Harrison Ramos Ambulance (Arecibo)", number: "7872102128" },
  { id: "qd-health-manati", category: "Ambulancia", label: "🚑 Health Medical Ambulance (Manatí)", number: "7879491024" },

  { id: "qd-drna-arecibo", category: "Otros", label: "🌊 DRNA Oficina Regional (Arecibo)", number: "7878787279" },
  { id: "qd-metro-pistas", category: "Otros", label: "🛣️ Metro Pistas (Asistencia PR-22)", number: "7877058699" },
  { id: "qd-proteccion-civil", category: "Otros", label: "🛟 Protección Civil", number: "911" },
  { id: "qd-base-tert", category: "Otros", label: "📻 Base TERT", number: "" },
  { id: "qd-otros-05", category: "Otros", label: "➕ Agregar Contacto", number: "" },
  { id: "qd-otros-06", category: "Otros", label: "➕ Agregar Contacto", number: "" },
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
  { id: "unit-19", label: "Miembro 19" },
  { id: "unit-20", label: "Miembro 20" },
  { id: "unit-21", label: "Miembro 21" },
  { id: "unit-22", label: "Miembro 22" },
  { id: "unit-23", label: "Miembro 23" },
  { id: "unit-24", label: "Miembro 24" },
  { id: "unit-25", label: "Miembro 25" },
  { id: "unit-26", label: "Miembro 26" },
  { id: "unit-27", label: "Miembro 27" },
  { id: "unit-28", label: "Miembro 28" },
];

const UNIT_STATUSES = ["Disponible", "En Ruta", "En Escena", "Personal", "Fuera de Servicio"];
const UNIT_STATUS_CLASS = {
  "Disponible": "status-disponible",
  "En Ruta": "status-enruta",
  "En Escena": "status-enescena",
  "Personal": "status-personal",
  "Fuera de Servicio": "status-fuera",
};

// ===== Agencias de apoyo disponibles en el formulario de incidente =====
const AGENCIAS = [
  "Policía Estatal", "Policía Municipal", "Bomberos", "Emergencia Médica",
  "Rescate", "Tránsito", "Ambulancia / Cruz Roja", "Protección Civil", "Otro",
];

// ===== Estatus de incidente (línea de tiempo) =====
const ESTADOS_INCIDENTE = ["Despachado", "En Ruta", "En Escena", "Concluido", "Cancelado"];
const ESTADO_CLASS = {
  "Despachado": "estatus-despachado",
  "En Ruta": "estatus-en-ruta",
  "En Escena": "estatus-en-escena",
  "Concluido": "estatus-concluido",
  "Cancelado": "estatus-cancelado",
};

const STORAGE_KEY = "tert_bitacora";
const ASISTENCIA_KEY = "tert_asistencia";
const ASISTENCIA_FIRMANTES_KEY = "tert_asistencia_firmantes";
const ASISTENCIA_ULTIMO_FIRMANTE_KEY = "tert_asistencia_ultimo_firmante";
const ASISTENCIA_NOMBRES_KEY = "tert_asistencia_nombres";
const RESPALDO_ULTIMO_KEY = "tert_respaldo_ultimo";
const RESPALDO_RECORDATORIO_DIAS = 14;
const UNIT_ALERT_MINUTES_KEY = "tert_alerta_minutos";
const ESCENA_MIN_MINUTOS_KEY = "tert_escena_min_minutos";
const ESCENA_TOPE_HORAS_KEY = "tert_escena_tope_horas";
const ESCENA_HISTORIAL_KEY = "tert_escena_historial";
function getUnitAlertMinutes() {
  return Number(localStorage.getItem(UNIT_ALERT_MINUTES_KEY)) || 15;
}
function getEscenaMinMinutos() {
  return Number(localStorage.getItem(ESCENA_MIN_MINUTOS_KEY)) || 15;
}
function getEscenaTopeHoras() {
  return Number(localStorage.getItem(ESCENA_TOPE_HORAS_KEY)) || 8;
}
function getEscenaHistorial() {
  return JSON.parse(localStorage.getItem(ESCENA_HISTORIAL_KEY) || "[]");
}
function saveEscenaHistorial(lista) {
  localStorage.setItem(ESCENA_HISTORIAL_KEY, JSON.stringify(lista));
}
// Solo cuenta como visita real si duró el mínimo configurado (filtra clics
// accidentales y los pasos obligados del ciclo del botón de estatus hacia
// "Personal"/"Fuera de Servicio", que pasan por "En Escena" sin ser una
// visita real). La duración se limita al tope configurado para que a
// alguien se le olvide actualizar el estatus por horas no infle el dato.
function registrarVisitaEscenaSiAplica(nombre, enEscenaDesde) {
  if (!enEscenaDesde) return;
  const minutos = Math.round((Date.now() - new Date(enEscenaDesde).getTime()) / 60000);
  if (minutos < getEscenaMinMinutos()) return;
  const topeMinutos = getEscenaTopeHoras() * 60;
  const historial = getEscenaHistorial();
  historial.push({ nombre, fecha: localISOString().slice(0, 10), minutos: Math.min(minutos, topeMinutos) });
  saveEscenaHistorial(historial);
}
const NOTES_KEY = "tert_notas";
const THEME_KEY = "tert_theme";
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
  // Usa el número de folio más alto ya usado este año (no logs.length), para
  // que borrar un registro de en medio no genere un folio duplicado.
  const year = new Date().getFullYear();
  const prefix = `TERT-${year}-`;
  let maxN = 0;
  logs.forEach((l) => {
    if (l.folio && l.folio.startsWith(prefix)) {
      const n = parseInt(l.folio.slice(prefix.length), 10);
      if (!isNaN(n) && n > maxN) maxN = n;
    }
  });
  return `${prefix}${String(maxN + 1).padStart(4, "0")}`;
}
function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}
// new Date().toISOString() usa UTC — en Puerto Rico (UTC-4) eso marca el día
// SIGUIENTE entre las 8pm y medianoche hora local. Esta función corrige el
// desfase para obtener la fecha/hora LOCAL en formato ISO.
function localISOString() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString();
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
    if (btn.dataset.tab === "metricas") renderMetricas();
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

function isMaintenanceMode() {
  return localStorage.getItem(MAINTENANCE_KEY) === "1";
}
function setMaintenanceMode(on) {
  if (on) localStorage.setItem(MAINTENANCE_KEY, "1");
  else localStorage.removeItem(MAINTENANCE_KEY);
}
function isDespachoBlocked() {
  return !getTurnoActual() && !isMaintenanceMode();
}
async function activarMantenimiento() {
  const pass = prompt("Contraseña maestra para activar Modo Mantenimiento y Prueba:");
  if (pass === null) return;
  const hash = await sha256Hex(pass);
  if (hash !== MASTER_PASSWORD_HASH) {
    alert("Contraseña incorrecta.");
    return;
  }
  setMaintenanceMode(true);
  renderTurnoBar();
}
function salirMantenimiento() {
  setMaintenanceMode(false);
  renderTurnoBar();
}
function renderMantenimientoInfo() {
  const box = $("#mantenimientoBox");
  if (isMaintenanceMode()) {
    box.innerHTML = `<button type="button" class="danger-btn" id="btnSalirMantenimientoInfo">🚪 Salir del Modo Mantenimiento</button>`;
    $("#btnSalirMantenimientoInfo").addEventListener("click", () => {
      salirMantenimiento();
      renderMantenimientoInfo();
    });
  } else {
    box.innerHTML = `<button type="button" class="secondary-btn" id="btnActivarMantenimientoInfo">🔧 Activar Modo Mantenimiento y Prueba</button>`;
    $("#btnActivarMantenimientoInfo").addEventListener("click", async () => {
      await activarMantenimiento();
      renderMantenimientoInfo();
    });
  }
}
function renderConfigTiempos() {
  $("#cfgAlertaMinutos").value = getUnitAlertMinutes();
  $("#cfgEscenaMinMinutos").value = getEscenaMinMinutos();
  $("#cfgEscenaTopeHoras").value = getEscenaTopeHoras();
  const editable = isMaintenanceMode();
  $("#cfgAlertaMinutos").disabled = !editable;
  $("#cfgEscenaMinMinutos").disabled = !editable;
  $("#cfgEscenaTopeHoras").disabled = !editable;
  $("#btnGuardarConfigTiempos").disabled = !editable;
}
onPressed("#btnGuardarConfigTiempos", () => {
  const alerta = Math.max(1, Math.min(180, Number($("#cfgAlertaMinutos").value) || 15));
  const escenaMin = Math.max(1, Math.min(180, Number($("#cfgEscenaMinMinutos").value) || 15));
  const escenaTope = Math.max(1, Math.min(48, Number($("#cfgEscenaTopeHoras").value) || 8));
  localStorage.setItem(UNIT_ALERT_MINUTES_KEY, String(alerta));
  localStorage.setItem(ESCENA_MIN_MINUTOS_KEY, String(escenaMin));
  localStorage.setItem(ESCENA_TOPE_HORAS_KEY, String(escenaTope));
  renderConfigTiempos();
  renderUnitBoard();
  alert("Configuración de tiempos guardada.");
});
function renderEscenaAdminBox() {
  const box = $("#escenaAdminBox");
  if (!box) return;
  if (!isMaintenanceMode()) {
    box.innerHTML = "";
    return;
  }
  box.innerHTML = `<button type="button" class="danger-btn" id="btnReiniciarEscena">🗑️ Reiniciar Contador de Escenas</button>`;
  $("#btnReiniciarEscena").addEventListener("click", () => {
    if (!confirm("¿Borrar TODO el historial de Asistencia a Escenas de todo el equipo? Esta acción no se puede deshacer.")) return;
    saveEscenaHistorial([]);
    renderMetricas();
    renderEscenaAdminBox();
  });
}

// Aplica/quita el bloqueo de Tablero de Unidades, Difusión, Crear Incidente y
// Reportes cuando no hay Despachador en Turno ni Modo Mantenimiento activo.
// Marcado Rápido y la navegación entre pestañas nunca se bloquean (911 no espera).
function applyDespachoLock() {
  const blocked = isDespachoBlocked();

  $("#lockBannerUnidades").classList.toggle("show", blocked);
  $("#btnResetAllUnits").disabled = blocked;
  $all("#unitBoard .unit-edit, #unitBoard .unit-status").forEach((b) => (b.disabled = blocked));

  $("#lockBannerDifusion").classList.toggle("show", blocked);
  $all('[id^="btnBroadcast"]').forEach((b) => (b.disabled = blocked));
  $("#cancelCodigoSelect").disabled = blocked;

  $("#lockBannerFuego").classList.toggle("show", blocked);
  $all(".fire-sms-btn").forEach((b) => (b.disabled = blocked));

  $("#lockBannerIncidente").classList.toggle("show", blocked);
  $all("#logForm input, #logForm select, #logForm textarea, #logForm button").forEach((el) => (el.disabled = blocked));

  $("#lockBannerReportes").classList.toggle("show", blocked);
  $all("#reportes input, #reportes select, #reportes button").forEach((el) => {
    if (el.closest("#pasarListaSection")) return; // Pasar Lista Diaria nunca se bloquea
    el.disabled = blocked;
  });
  // Borrar Todos los Registros: además del bloqueo normal, requiere Modo
  // Mantenimiento específicamente (no basta con tener un despachador de turno).
  $("#btnBorrarTodo").disabled = blocked || !isMaintenanceMode();
}

function renderTurnoBar() {
  const turno = getTurnoActual();
  const bar = $("#turnoBar");
  if (turno) {
    bar.textContent = `Despachador en Turno: ${turno.nombre} — desde ${formatFechaLarga(turno.inicio)}`;
    bar.className = "turno-bar turno-activo";
  } else if (isMaintenanceMode()) {
    bar.innerHTML = `🔧 Modo Mantenimiento y Prueba Activado <button type="button" class="secondary-btn turno-bar-btn" id="btnSalirMantenimientoBar">Salir</button>`;
    bar.className = "turno-bar turno-mantenimiento";
    $("#btnSalirMantenimientoBar").addEventListener("click", () => {
      salirMantenimiento();
      renderMantenimientoInfo();
    });
  } else {
    bar.textContent = "⚠️ Sin despachador en turno registrado — configúralo en Información";
    bar.className = "turno-bar turno-vacio";
  }
  applyDespachoLock();
  renderConfigTiempos();
  renderEscenaAdminBox();
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
renderMantenimientoInfo();

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
// Estatus que se consideran "en algo activo" — si pasan getUnitAlertMinutes()
// sin cambiar, la tarjeta se resalta para recordar pedir actualización.
const UNIT_ALERT_STATUSES = ["En Ruta", "En Escena"];
function normalizeUnitStatus(raw) {
  // "En Sitio" es el nombre anterior de "En Escena" (renombrado 2026-08-26) —
  // se traduce aquí para no perder el estatus de unidades ya guardadas.
  if (!raw) return { estado: "Disponible", desde: null, activoDesde: null, enEscenaDesde: null };
  if (typeof raw === "string") return { estado: raw === "En Sitio" ? "En Escena" : raw, desde: null, activoDesde: null, enEscenaDesde: null }; // formato anterior, sin hora
  return {
    estado: raw.estado === "En Sitio" ? "En Escena" : (raw.estado || "Disponible"),
    desde: raw.desde || null,
    activoDesde: raw.activoDesde || null,
    enEscenaDesde: raw.enEscenaDesde || null,
  };
}
function renderUnitBoard() {
  const statuses = getUnitStatuses();
  const labels = getUnitLabels();
  const container = $("#unitBoard");
  const blocked = isDespachoBlocked();
  container.innerHTML = "";
  UNITS.forEach((u) => {
    const o = normalizeUnitOverride(labels[u.id]);
    const label = o.label || u.label;
    const phone = o.phone;
    const st = normalizeUnitStatus(statuses[u.id]);
    const current = st.estado;
    const minutos = st.desde ? Math.round((Date.now() - new Date(st.desde).getTime()) / 60000) : null;
    const isStale = UNIT_ALERT_STATUSES.includes(current) && minutos !== null && minutos >= getUnitAlertMinutes();
    const minutosActivo = st.activoDesde ? Math.round((Date.now() - new Date(st.activoDesde).getTime()) / 60000) : null;
    const showActivo = UNIT_ALERT_STATUSES.includes(current) && minutosActivo !== null;
    const card = document.createElement("div");
    card.className = "unit-card " + UNIT_STATUS_CLASS[current] + (isStale ? " unit-stale" : "");
    card.innerHTML = `
      <button type="button" class="unit-edit" title="Editar nombre/cargo y celular">✎</button>
      ${isStale ? `<span class="unit-alert-badge" title="Sin actualizar hace ${minutos} min">⚠️</span>` : ""}
      <span class="unit-label">${escapeHtml(label)}</span>
      <button type="button" class="unit-status" title="Clic para cambiar estatus">${escapeHtml(current)}</button>
      ${showActivo ? `<span class="unit-activo-timer" title="Tiempo activo desde que salió de Disponible">⏱ ${minutosActivo} min</span>` : ""}
    `;
    card.querySelector(".unit-edit").disabled = blocked;
    card.querySelector(".unit-status").disabled = blocked;
    card.querySelector(".unit-edit").addEventListener("click", () => openContactModal("unit", u.id, label, phone));
    card.querySelector(".unit-status").addEventListener("click", () => cycleUnitStatus(u.id));
    container.appendChild(card);
  });
  renderUnidadesGauge(statuses);
}
// Franja de medidores debajo de la barra superior: cuántas unidades hay en
// cada estatus ahora mismo, sin tener que entrar al Tablero a contarlas.
function renderUnidadesGauge(statuses) {
  const total = UNITS.length;
  const estados = UNITS.map((u) => normalizeUnitStatus(statuses[u.id]).estado);
  const contar = (estado) => estados.filter((e) => e === estado).length;
  const disponibles = contar("Disponible");
  const ratio = total ? disponibles / total : 0;
  const gauge = $("#unidadesGauge");
  $("#unidadesGaugeNum").textContent = `${disponibles}/${total}`;
  gauge.classList.toggle("gauge-warn", ratio > 0 && ratio < 0.5);
  gauge.classList.toggle("gauge-bad", ratio === 0);

  $("#gaugeEnRutaNum").textContent = contar("En Ruta");
  $("#gaugeEnEscenaNum").textContent = contar("En Escena");
  $("#gaugePersonalNum").textContent = contar("Personal");
  $("#gaugeFueraNum").textContent = contar("Fuera de Servicio");
}
function getMemberPhones(onlyDisponibles) {
  const labels = getUnitLabels();
  const statuses = getUnitStatuses();
  const phones = UNITS
    .filter((u) => !onlyDisponibles || normalizeUnitStatus(statuses[u.id]).estado === "Disponible")
    .map((u) => normalizeUnitOverride(labels[u.id]).phone)
    .filter((phone) => phone);
  return [...new Set(phones)];
}
function getMemberPhonesByEstados(estados) {
  const labels = getUnitLabels();
  const statuses = getUnitStatuses();
  const phones = UNITS
    .filter((u) => estados.includes(normalizeUnitStatus(statuses[u.id]).estado))
    .map((u) => normalizeUnitOverride(labels[u.id]).phone)
    .filter((phone) => phone);
  return [...new Set(phones)];
}
function cycleUnitStatus(id) {
  const statuses = getUnitStatuses();
  const prev = normalizeUnitStatus(statuses[id]);
  const next = UNIT_STATUSES[(UNIT_STATUSES.indexOf(prev.estado) + 1) % UNIT_STATUSES.length];
  const wasActivo = UNIT_ALERT_STATUSES.includes(prev.estado);
  const isActivo = UNIT_ALERT_STATUSES.includes(next);
  let activoDesde = null;
  if (isActivo) activoDesde = wasActivo ? prev.activoDesde : new Date().toISOString();

  let enEscenaDesde = prev.enEscenaDesde;
  if (prev.estado === "En Escena" && next !== "En Escena") {
    const labels = getUnitLabels();
    const u = UNITS.find((x) => x.id === id);
    const nombre = normalizeUnitOverride(labels[id]).label || (u ? u.label : id);
    registrarVisitaEscenaSiAplica(nombre, prev.enEscenaDesde);
    enEscenaDesde = null;
  } else if (next === "En Escena" && prev.estado !== "En Escena") {
    enEscenaDesde = new Date().toISOString();
  }

  statuses[id] = { estado: next, desde: new Date().toISOString(), activoDesde, enEscenaDesde };
  saveUnitStatuses(statuses);
  renderUnitBoard();
}
renderUnitBoard();
setInterval(renderUnitBoard, 30000); // revisa cada 30s si alguna tarjeta ya paso getUnitAlertMinutes()

onPressed("#btnResetAllUnits", () => {
  if (!confirm("¿Marcar TODAS las unidades como Disponible?")) return;
  const statuses = getUnitStatuses();
  const labels = getUnitLabels();
  const ahora = new Date().toISOString();
  UNITS.forEach((u) => {
    const prev = normalizeUnitStatus(statuses[u.id]);
    if (prev.estado === "En Escena") {
      const nombre = normalizeUnitOverride(labels[u.id]).label || u.label;
      registrarVisitaEscenaSiAplica(nombre, prev.enEscenaDesde);
    }
    statuses[u.id] = { estado: "Disponible", desde: ahora, activoDesde: null, enEscenaDesde: null };
  });
  saveUnitStatuses(statuses);
  renderUnitBoard();
});

// ===== Difusión a miembros (SMS) =====
// Círculo de color al inicio del mensaje para identificar el tipo de un vistazo:
// 🔴 = 10-50 emergencia (sirenas) · 🟢 = NO 10-50 (sin sirenas) · 🟡 = prueba del sistema
function sendSms(phones, body, emptyMsg) {
  if (!phones.length) {
    alert(emptyMsg);
    return;
  }
  window.location.href = `sms:${phones.join(",")}?body=${encodeURIComponent(body)}`;
}
function sendBroadcast(body, onlyDisponibles) {
  const phones = getMemberPhones(onlyDisponibles);
  const emptyMsg = onlyDisponibles
    ? "No hay unidades con estatus Disponible que tengan celular configurado en este momento."
    : "No hay celulares configurados. Clic en ✎ en cada miembro del Tablero de Unidades para agregar su número.";
  sendSms(phones, body, emptyMsg);
}

function broadcastIncidente(codigo, descripcion, emergencia) {
  const direccion = prompt("Dirección del incidente, incluye el pueblo (ej. Carretera #2 KM 60, Barceloneta):", "");
  if (direccion === null || !direccion.trim()) return;

  // Mensaje corto sin acentos ni emojis a propósito: los acentos/emoji fuerzan
  // codificación Unicode en SMS (70 caracteres por fragmento en vez de 160),
  // lo que partía este mensaje en 5 fragmentos y causaba fallos de envío
  // grupal. Así queda en GSM-7 y cabe en 1-2 fragmentos.
  const cierre = emergencia
    ? "Proceda en 10-50 a la zona con precaucion."
    : "Proceda a la zona con precaucion de manera regular.";
  sendBroadcast(`Unidades Disponibles: (${codigo}), ${direccion.trim()}. ${cierre} Reporte su participacion.`, true);
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

function broadcastCancelacion() {
  const codigo = $("#cancelCodigoSelect").value;
  const phones = getMemberPhonesByEstados(["Disponible", "En Ruta", "En Escena"]);
  const body = `CANCELE (${codigo}): el mensaje anterior queda SIN EFECTO. Disculpen la confusion.`;
  sendSms(phones, body, "No hay unidades en estatus Disponible, En Ruta o En Escena que tengan celular configurado.");
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
onPressed("#btnBroadcast1062_1050", () => broadcastIncidente("10-62", "Desastre", true));
onPressed("#btnBroadcast1062_no1050", () => broadcastIncidente("10-62", "Desastre", false));
onPressed("#btnBroadcast1065_1050", () => broadcastIncidente("10-65", "Emergencia Tóxica", true));
onPressed("#btnBroadcast1065_no1050", () => broadcastIncidente("10-65", "Emergencia Tóxica", false));
onPressed("#btnBroadcastCustom", broadcastCustom);
onPressed("#btnBroadcastPrueba", broadcastPrueba);
onPressed("#btnBroadcastCancelar", broadcastCancelacion);

// ===== Mapas y ubicación =====
onPressed("#btnMyLocation", () => {
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

onPressed("#btnGoogleMaps", () => {
  window.open("https://www.google.com/maps", "_blank");
});

onPressed("#btnWaze", () => {
  window.open("https://www.waze.com/live-map", "_blank");
});

onPressed("#btnCoordSearch", () => {
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
  $("#fecha").value = localISOString().slice(0, 16);
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

onPressed("#btnClearForm", () => {
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

// ===== Pasar Lista Diaria (no requiere Despachador en Turno) =====
function getAsistencia() {
  return JSON.parse(localStorage.getItem(ASISTENCIA_KEY) || "[]");
}
function saveAsistencia(lista) {
  localStorage.setItem(ASISTENCIA_KEY, JSON.stringify(lista));
}
function getFirmantes() {
  return JSON.parse(localStorage.getItem(ASISTENCIA_FIRMANTES_KEY) || "[]");
}
function saveFirmantes(lista) {
  localStorage.setItem(ASISTENCIA_FIRMANTES_KEY, JSON.stringify(lista));
}
function getUltimoFirmante() {
  return localStorage.getItem(ASISTENCIA_ULTIMO_FIRMANTE_KEY) || "";
}
function saveUltimoFirmante(nombre) {
  localStorage.setItem(ASISTENCIA_ULTIMO_FIRMANTE_KEY, nombre);
}
function registrarFirmante(nombre) {
  if (!nombre) return;
  const firmantes = getFirmantes();
  if (!firmantes.includes(nombre)) {
    firmantes.push(nombre);
    saveFirmantes(firmantes);
  }
  saveUltimoFirmante(nombre);
}
function getNombresConocidos() {
  return JSON.parse(localStorage.getItem(ASISTENCIA_NOMBRES_KEY) || "[]");
}
function saveNombresConocidos(lista) {
  localStorage.setItem(ASISTENCIA_NOMBRES_KEY, JSON.stringify(lista));
}
function registrarNombreConocido(nombre) {
  if (!nombre) return;
  const nombres = getNombresConocidos();
  if (!nombres.includes(nombre)) {
    nombres.push(nombre);
    saveNombresConocidos(nombres);
  }
}
function getDiaAsistencia(fecha) {
  return getAsistencia().find((d) => d.fecha === fecha);
}
function getOrCreateDiaAsistencia(fecha) {
  const lista = getAsistencia();
  let dia = lista.find((d) => d.fecha === fecha);
  if (!dia) {
    dia = { fecha, firmante: "", anotaciones: "", entradas: [] };
    lista.push(dia);
    saveAsistencia(lista);
  }
  return dia;
}
function saveDiaAsistencia(dia) {
  const lista = getAsistencia();
  const idx = lista.findIndex((d) => d.fecha === dia.fecha);
  if (idx >= 0) lista[idx] = dia;
  else lista.push(dia);
  saveAsistencia(lista);
}
function renderFirmantesDatalist() {
  $("#firmantesList").innerHTML = getFirmantes().map((n) => `<option value="${escapeHtml(n)}"></option>`).join("");
}
function renderNombresSugeridos() {
  const labels = getUnitLabels();
  const nombresUnidades = UNITS.map((u) => normalizeUnitOverride(labels[u.id]).label || u.label);
  const nombres = [...new Set([...nombresUnidades, ...getNombresConocidos()])];
  $("#listaNombresSugeridos").innerHTML = nombres.map((n) => `<option value="${escapeHtml(n)}"></option>`).join("");
}
function renderNombresAdmin() {
  $("#nombresConocidosSelect").innerHTML = getNombresConocidos().map((n) => `<option value="${escapeHtml(n)}">${escapeHtml(n)}</option>`).join("");
  $("#firmantesSelect").innerHTML = getFirmantes().map((n) => `<option value="${escapeHtml(n)}">${escapeHtml(n)}</option>`).join("");
}
function renderAsistenciaTable() {
  const fecha = $("#listaFecha").value;
  const dia = getDiaAsistencia(fecha);
  const tbody = $("#asistenciaTable tbody");
  tbody.innerHTML = "";
  const entradas = dia ? dia.entradas : [];
  entradas.forEach((e, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${escapeHtml(e.nombre)}</td>
      <td>${escapeHtml(e.tipo || "Miembro")}</td>
      <td>${escapeHtml(e.hora)}</td>
      <td>${escapeHtml(e.medio)}</td>
      <td><button type="button" class="secondary-btn" data-del-asistencia="${i}">Eliminar</button></td>
    `;
    tbody.appendChild(tr);
  });
  tbody.querySelectorAll("[data-del-asistencia]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!confirm("¿Eliminar esta entrada de asistencia?")) return;
      const d = getDiaAsistencia(fecha);
      if (!d) return;
      d.entradas.splice(Number(btn.dataset.delAsistencia), 1);
      saveDiaAsistencia(d);
      renderAsistenciaTable();
    });
  });
  $("#listaAnotaciones").value = dia ? (dia.anotaciones || "") : "";
  // Muestra el firmante REAL de este día (si ya tiene uno guardado) en vez de
  // dejar el último usado en otra fecha — si no, se navegaba a un día pasado
  // y el campo seguía mostrando el nombre de otro día sin avisar.
  $("#listaFirmante").value = (dia && dia.firmante) || getUltimoFirmante();
  renderHistorialAsistencia();
}
function initPasarLista() {
  $("#listaFecha").value = localISOString().slice(0, 10);
  $("#listaFirmante").value = getUltimoFirmante();
  renderFirmantesDatalist();
  renderNombresSugeridos();
  renderNombresAdmin();
  renderAsistenciaTable();
}
$("#listaFecha").addEventListener("change", renderAsistenciaTable);
function esNombreDeUnidad(nombre) {
  const labels = getUnitLabels();
  const nombresUnidades = UNITS.map((u) => normalizeUnitOverride(labels[u.id]).label || u.label);
  return nombresUnidades.includes(nombre);
}
$("#listaNombre").addEventListener("input", () => {
  $("#listaTipo").value = esNombreDeUnidad($("#listaNombre").value.trim()) ? "Miembro" : "Aliado";
});
onPressed("#btnHoraAhora", () => {
  const now = new Date();
  $("#listaHora").value = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
});
onPressed("#btnLimpiarCamposAsistencia", () => {
  $("#listaNombre").value = "";
  $("#listaTipo").value = "Miembro";
  $("#listaMedio").selectedIndex = 0;
  $("#listaHora").value = "";
});
onPressed("#btnGuardarFirmante", () => {
  const fecha = $("#listaFecha").value;
  if (!fecha) { alert("Selecciona una fecha."); return; }
  const firmante = $("#listaFirmante").value.trim();
  if (!firmante) { alert("Escribe el nombre de quien está pasando lista."); return; }
  const dia = getOrCreateDiaAsistencia(fecha);
  dia.firmante = firmante;
  saveDiaAsistencia(dia);
  registrarFirmante(firmante);
  renderFirmantesDatalist();
  renderNombresAdmin();
  renderHistorialAsistencia();
  alert("Nombre guardado — aparecerá como firma del reporte de este día.");
});
onPressed("#btnAgregarAsistencia", () => {
  const fecha = $("#listaFecha").value;
  if (!fecha) { alert("Selecciona una fecha."); return; }
  const nombre = $("#listaNombre").value.trim();
  if (!nombre) { alert("Escribe el nombre de la persona."); return; }
  const hora = $("#listaHora").value;
  if (!hora) { alert("Selecciona la hora (o toca 'Reportado Ahora')."); return; }
  const tipo = $("#listaTipo").value;
  const medio = $("#listaMedio").value;
  const firmante = $("#listaFirmante").value.trim();

  const dia = getOrCreateDiaAsistencia(fecha);
  if (firmante) dia.firmante = firmante;
  dia.entradas.push({ nombre, tipo, medio, hora });
  saveDiaAsistencia(dia);
  if (firmante) registrarFirmante(firmante);
  registrarNombreConocido(nombre);
  renderFirmantesDatalist();
  renderNombresSugeridos();
  renderNombresAdmin();

  $("#listaNombre").value = "";
  $("#listaTipo").value = "Miembro";
  $("#listaHora").value = "";
  renderAsistenciaTable();
});
onPressed("#btnGuardarAnotaciones", () => {
  const fecha = $("#listaFecha").value;
  const dia = getOrCreateDiaAsistencia(fecha);
  dia.anotaciones = $("#listaAnotaciones").value;
  saveDiaAsistencia(dia);
  alert("Anotaciones guardadas.");
});
onPressed("#btnImprimirLista", () => {
  const fecha = $("#listaFecha").value;
  const dia = getDiaAsistencia(fecha) || { fecha, firmante: "", anotaciones: $("#listaAnotaciones").value, entradas: [] };
  // Respaldo: si el día no tiene firmante guardado, usa lo que esté escrito
  // en el campo ahora mismo, para no imprimir "Pasó lista: -" sin necesidad.
  const firmante = dia.firmante || $("#listaFirmante").value.trim();
  const fechaFmt = fecha ? new Date(fecha + "T00:00:00").toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" }) : "-";
  const filas = dia.entradas.length
    ? dia.entradas.map((e) => `<tr><td>${escapeHtml(e.nombre)}</td><td>${escapeHtml(e.tipo || "Miembro")}</td><td>${escapeHtml(e.hora)}</td><td>${escapeHtml(e.medio)}</td></tr>`).join("")
    : `<tr><td colspan="4">Sin reportes registrados.</td></tr>`;

  $("#printSingle").innerHTML = `
    <div class="asistencia-print">
      <img class="asistencia-watermark" id="asistenciaWatermarkImg" src="assets/tert-seal.jpg" alt="">
      <div class="asistencia-header">
        <h2>TACTICAL EMERGENCY RESPONSE TEAM CORP.</h2>
        <p>Calle Aguja # 190, Urb. Estancias de Barceloneta, Barceloneta PR 00617</p>
        <p>Teléfono: (939) 350 &ndash; 8068 / E-mail: jose2007miguel@gmail.com</p>
      </div>
      <div class="asistencia-titlebar">
        <strong>Reporte Diario (Personal T.E.R.T.)</strong>
        <span>Fecha: ${escapeHtml(fechaFmt)}</span>
      </div>
      <table class="asistencia-print-table">
        <thead><tr><th>Nombre del Integrante, Aliado o Miembro</th><th>Tipo</th><th>Hora del Reporte</th><th>Medio de Comunicación Utilizado</th></tr></thead>
        <tbody>${filas}</tbody>
      </table>
      <div class="asistencia-footer">
        <div class="asistencia-anotaciones">
          <strong>Anotaciones:</strong>
          <p>${escapeHtml(dia.anotaciones || "")}</p>
          <div class="asistencia-anotaciones-blanco"></div>
        </div>
      </div>
      <p class="asistencia-firma">Pasó lista: <strong>${firmante ? `${escapeHtml(firmante)} &mdash; Personal Administrativo` : "-"}</strong></p>
      <div class="asistencia-page-footer">Rev. 26 enero 2025, Cap: 1 Art. 4.0 Pág #12</div>
    </div>
  `;
  document.body.classList.add("printing-single");
  document.title = "TERT asistencia diaria";
  // Espera a que la marca de agua termine de cargar antes de imprimir — si
  // window.print() se llama de inmediato, el navegador puede renderizar el
  // PDF/impresión ANTES de que la imagen recién insertada esté lista, y sale
  // en blanco (sobre todo la primera vez, sin caché de esa imagen).
  const watermarkImg = $("#asistenciaWatermarkImg");
  if (watermarkImg.complete) {
    window.print();
  } else {
    watermarkImg.addEventListener("load", () => window.print(), { once: true });
    watermarkImg.addEventListener("error", () => window.print(), { once: true });
  }
});
onPressed("#btnEliminarNombreConocido", () => {
  const nombre = $("#nombresConocidosSelect").value;
  if (!nombre) return;
  if (!confirm(`¿Quitar "${nombre}" de las sugerencias de nombre? Los reportes ya guardados no cambian.`)) return;
  saveNombresConocidos(getNombresConocidos().filter((n) => n !== nombre));
  renderNombresSugeridos();
  renderNombresAdmin();
});
onPressed("#btnEliminarFirmante", () => {
  const nombre = $("#firmantesSelect").value;
  if (!nombre) return;
  if (!confirm(`¿Quitar "${nombre}" de las sugerencias de "quién pasa lista"? Los reportes ya guardados no cambian.`)) return;
  saveFirmantes(getFirmantes().filter((n) => n !== nombre));
  if (getUltimoFirmante() === nombre) {
    saveUltimoFirmante("");
    if ($("#listaFirmante").value === nombre) $("#listaFirmante").value = "";
  }
  renderFirmantesDatalist();
  renderNombresAdmin();
});

// ===== Historial de Asistencia (buscar días anteriores) =====
function renderHistorialAsistencia() {
  const desde = $("#historialAsistDesde").value;
  const hasta = $("#historialAsistHasta").value;
  let dias = getAsistencia().filter((d) => (!desde || d.fecha >= desde) && (!hasta || d.fecha <= hasta));
  dias = dias.slice().sort((a, b) => (a.fecha < b.fecha ? 1 : -1));
  const tbody = $("#historialAsistTable tbody");
  tbody.innerHTML = dias.length
    ? ""
    : `<tr><td colspan="4">No hay días guardados en ese rango.</td></tr>`;
  dias.forEach((d) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${escapeHtml(d.fecha)}</td>
      <td>${escapeHtml(d.firmante || "-")}</td>
      <td>${d.entradas.length}</td>
      <td class="row-actions">
        <button type="button" class="secondary-btn" data-ver-fecha="${escapeHtml(d.fecha)}">Ver / Imprimir</button>
        <button type="button" class="danger-btn" data-del-fecha="${escapeHtml(d.fecha)}">Eliminar</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
  tbody.querySelectorAll("[data-ver-fecha]").forEach((btn) => {
    btn.addEventListener("click", () => {
      $("#listaFecha").value = btn.dataset.verFecha;
      renderAsistenciaTable();
      $("#listaFecha").scrollIntoView({ behavior: "smooth", block: "center" });
    });
  });
  tbody.querySelectorAll("[data-del-fecha]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const fecha = btn.dataset.delFecha;
      if (!confirm(`¿Eliminar TODO el reporte de asistencia del ${fecha}? Esta acción no se puede deshacer.`)) return;
      saveAsistencia(getAsistencia().filter((d) => d.fecha !== fecha));
      if ($("#listaFecha").value === fecha) renderAsistenciaTable();
      else renderHistorialAsistencia();
    });
  });
}
onPressed("#btnHistorialAsistBuscar", renderHistorialAsistencia);
onPressed("#btnHistorialAsistLimpiar", () => {
  $("#historialAsistDesde").value = "";
  $("#historialAsistHasta").value = "";
  renderHistorialAsistencia();
});

initPasarLista();
renderHistorialAsistencia();

// ===== Métricas (gráficos SVG hechos a mano, sin librerías externas —
// esta app debe funcionar sin internet, y una librería de gráficos desde un
// CDN se rompería justo cuando más se necesita) =====
function svgBarChart(data, opts = {}) {
  const { barHeight = 24, gap = 8, labelWidth = 140, chartWidth = 200, color = "var(--accent)", maxItems = 25 } = opts;
  if (!data.length) return `<p class="chart-empty">Sin datos en este período.</p>`;
  const rows = data.slice(0, maxItems);
  const max = Math.max(1, ...rows.map((r) => r[1]));
  const totalWidth = labelWidth + chartWidth + 50;
  const height = rows.length * (barHeight + gap);
  const bars = rows.map(([label, value], i) => {
    const y = i * (barHeight + gap);
    const barW = Math.max(2, (value / max) * chartWidth);
    const raw = String(label);
    const labelText = escapeHtml(raw.length > 24 ? raw.slice(0, 22) + "…" : raw);
    return `
      <text x="0" y="${y + barHeight / 2}" dy="0.35em" font-size="11" style="fill:var(--text)">${labelText}</text>
      <rect x="${labelWidth}" y="${y}" width="${barW}" height="${barHeight - 4}" rx="4" style="fill:${color}"></rect>
      <text x="${labelWidth + barW + 6}" y="${y + barHeight / 2}" dy="0.35em" font-size="11" style="fill:var(--text)">${value}</text>
    `;
  }).join("");
  return `<svg viewBox="0 0 ${totalWidth} ${height}" width="100%" height="${height}">${bars}</svg>`;
}
function contarPor(arr, keyFn) {
  const counts = {};
  arr.forEach((item) => {
    const k = keyFn(item);
    if (!k) return;
    counts[k] = (counts[k] || 0) + 1;
  });
  return Object.entries(counts).sort((a, b) => b[1] - a[1]);
}
function formatMesCorto(yyyyMm) {
  const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const [y, m] = yyyyMm.split("-");
  return `${meses[parseInt(m, 10) - 1] || "?"} ${y}`;
}
function formatFechaCorta(yyyyMmDd) {
  return new Date(yyyyMmDd + "T00:00:00").toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" });
}
function renderMetricas() {
  renderEscenaAdminBox();
  const desde = $("#metricasDesde").value;
  const hasta = $("#metricasHasta").value;

  const dias = getAsistencia().filter((d) => (!desde || d.fecha >= desde) && (!hasta || d.fecha <= hasta));
  const entradas = dias.flatMap((d) => d.entradas);
  const logs = getLogs().filter((l) => {
    const f = (l.fecha || "").slice(0, 10);
    return (!desde || f >= desde) && (!hasta || f <= hasta);
  });

  $("#chartParticipacion").innerHTML = svgBarChart(contarPor(entradas, (e) => e.nombre), { maxItems: 25 });
  $("#chartTipo").innerHTML = svgBarChart(contarPor(entradas, (e) => e.tipo || "Miembro"), { labelWidth: 80, chartWidth: 130 });
  $("#chartMedios").innerHTML = svgBarChart(contarPor(entradas, (e) => e.medio), { labelWidth: 100, chartWidth: 120 });

  const porMes = contarPor(logs, (l) => (l.fecha || "").slice(0, 7))
    .slice()
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .map(([mes, count]) => [formatMesCorto(mes), count]);
  $("#chartIncidentesMes").innerHTML = svgBarChart(porMes, { labelWidth: 70, chartWidth: 190, color: "var(--blue)" });
  $("#chartIncidentesTipo").innerHTML = svgBarChart(contarPor(logs, (l) => l.tipo), { labelWidth: 110, chartWidth: 120, color: "var(--blue)" });
  $("#chartIncidentesPrioridad").innerHTML = svgBarChart(contarPor(logs, (l) => l.prioridad), { labelWidth: 60, chartWidth: 140, color: "var(--blue)" });

  const escenaHistorial = getEscenaHistorial().filter((v) => (!desde || v.fecha >= desde) && (!hasta || v.fecha <= hasta));
  $("#chartEscena").innerHTML = svgBarChart(contarPor(escenaHistorial, (v) => v.nombre), { maxItems: 25, color: "var(--green)" });
  $("#hintEscenaMinimo").textContent = `Cuántas veces confirmadas (${getEscenaMinMinutos()}+ min, sin importar el tipo de incidente) ha estado cada persona en estatus "En Escena".`;

  const porNombre = contarPor(entradas, (e) => e.nombre);
  const top4 = porNombre.slice(0, 4);
  const diasConAsistencia = dias.filter((d) => d.entradas.length > 0).length;
  const top4Html = top4.length
    ? `<ol class="metricas-top-list">${top4.map(([nombre, count]) => `<li>${escapeHtml(nombre)} <strong>&mdash; ${count}</strong></li>`).join("")}</ol>`
    : `<p class="chart-empty">Sin datos en este período.</p>`;

  // Texto claro de a qué rango de fechas corresponde todo lo de arriba —
  // si no hay filtro, se calcula el rango real de los datos disponibles
  // (primera y última fecha encontrada), no un período fijo tipo "30 días".
  let periodoTexto;
  if (desde || hasta) {
    periodoTexto = `Del ${desde ? formatFechaCorta(desde) : "inicio del historial"} al ${hasta ? formatFechaCorta(hasta) : "hoy"}`;
  } else {
    const todasFechas = [...dias.map((d) => d.fecha), ...logs.map((l) => (l.fecha || "").slice(0, 10))].filter(Boolean).sort();
    periodoTexto = todasFechas.length
      ? `Todo el historial disponible — del ${formatFechaCorta(todasFechas[0])} al ${formatFechaCorta(todasFechas[todasFechas.length - 1])}`
      : "Todavía no hay datos guardados.";
  }

  $("#metricasResumen").innerHTML = `
    <p class="metricas-periodo">📅 <strong>Período mostrado:</strong> ${escapeHtml(periodoTexto)}</p>
    <div class="metricas-resumen-grid">
      <div class="metricas-stat"><span class="num">${entradas.length}</span><span class="lbl">Reportes de asistencia</span></div>
      <div class="metricas-stat"><span class="num">${diasConAsistencia}</span><span class="lbl">Días con asistencia</span></div>
      <div class="metricas-stat"><span class="num">${logs.length}</span><span class="lbl">Incidentes en Bitácora</span></div>
    </div>
    <h4 class="metricas-top-title">🏅 Top 4 en Participación</h4>
    ${top4Html}
  `;
}
onPressed("#btnMetricasFiltrar", renderMetricas);
onPressed("#btnMetricasLimpiar", () => {
  $("#metricasDesde").value = "";
  $("#metricasHasta").value = "";
  renderMetricas();
});

// ===== Reportes =====
function calcularTiempoRespuesta(log) {
  const eventos = log.eventos || [];
  if (!eventos.length) return "-";
  const inicio = new Date(eventos[0].hora).getTime();
  const enEscena = eventos.find((e) => e.estatus === "En Escena");
  if (!enEscena) return "-";
  const minutos = Math.round((new Date(enEscena.hora).getTime() - inicio) / 60000);
  if (minutos < 60) return `${minutos} min`;
  return `${Math.floor(minutos / 60)}h ${minutos % 60}min`;
}

function renderReportTable() {
  let logs = getLogs();
  const desde = $("#filtroDesde").value;
  const hasta = $("#filtroHasta").value;
  const tipo = $("#filtroTipo").value;
  const estatus = $("#filtroEstatus").value;
  const texto = $("#filtroTexto").value.trim().toLowerCase();

  logs = logs.filter((l) => {
    const fecha = l.fecha.slice(0, 10);
    if (desde && fecha < desde) return false;
    if (hasta && fecha > hasta) return false;
    if (tipo && l.tipo !== tipo) return false;
    if (estatus && l.estatus !== estatus) return false;
    if (texto) {
      const enUbicacion = (l.ubicacion || "").toLowerCase().includes(texto);
      const enDescripcion = (l.descripcion || "").toLowerCase().includes(texto);
      if (!enUbicacion && !enDescripcion) return false;
    }
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
      <td>${escapeHtml(calcularTiempoRespuesta(log))}</td>
      <td>${escapeHtml(log.descripcion)}</td>
      <td><button class="secondary-btn" data-detalle="${escapeHtml(log.folio)}">🖨️ Detalle</button></td>
    `;
    tbody.appendChild(tr);
  });
  tbody.querySelectorAll("[data-detalle]").forEach((btn) => {
    btn.addEventListener("click", () => printIncidentReport(btn.dataset.detalle));
  });
  $("#statLine").textContent = `Total de registros mostrados: ${logs.length}`;
  applyDespachoLock();
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
      <tr><td class="label">Tiempo de Respuesta</td><td>${escapeHtml(calcularTiempoRespuesta(log))}</td></tr>
      <tr><td class="label">Descripción</td><td>${escapeHtml(log.descripcion)}</td></tr>
      <tr><td class="label">Línea de Tiempo</td><td>${timelineHtml}</td></tr>
    </table>
  `;
  document.body.classList.add("printing-single");
  window.print();
}
// El navegador usa document.title como nombre sugerido al "Guardar como PDF"
// — se cambia justo antes de imprimir un reporte específico y se restaura
// aquí, para no afectar el título de la pestaña/app el resto del tiempo.
const ORIGINAL_DOCUMENT_TITLE = document.title;
window.addEventListener("afterprint", () => {
  document.body.classList.remove("printing-single");
  document.title = ORIGINAL_DOCUMENT_TITLE;
});

onPressed("#btnFiltrar", renderReportTable);
$("#filtroTexto").addEventListener("input", renderReportTable);
onPressed("#btnLimpiarFiltro", () => {
  $("#filtroDesde").value = "";
  $("#filtroHasta").value = "";
  $("#filtroTipo").value = "";
  $("#filtroEstatus").value = "";
  $("#filtroTexto").value = "";
  renderReportTable();
});

$("#btnExportCSV").addEventListener("click", () => {
  const logs = renderReportTable();
  if (logs.length === 0) {
    alert("No hay registros para exportar.");
    return;
  }
  const headers = ["Folio", "Fecha", "Tipo", "Prioridad", "Ubicacion", "Unidad", "Agencias", "Estatus", "Despachador", "Tiempo Respuesta", "Descripcion"];
  const rows = logs.map((l) => [l.folio, l.fecha, l.tipo, l.prioridad, l.ubicacion, l.unidad, (l.agencias || []).join("; "), l.estatus, l.despachador || "-", calcularTiempoRespuesta(l), l.descripcion]);
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
$("#btnLimpiarNotas").addEventListener("click", () => {
  if (!confirm("¿Borrar todas las notas internas? Esta acción no se puede deshacer.")) return;
  localStorage.removeItem(NOTES_KEY);
  loadNotes();
});
loadNotes();

// ===== Tema de color =====
function setActiveThemeButton(theme) {
  $all(".theme-btn").forEach((b) => b.classList.toggle("active", b.dataset.themeId === theme));
}
function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem(THEME_KEY, theme);
  setActiveThemeButton(theme);
}
$all(".theme-btn").forEach((btn) => {
  btn.addEventListener("click", () => applyTheme(btn.dataset.themeId));
});
setActiveThemeButton(localStorage.getItem(THEME_KEY) || "naranja");

// ===== Exportar / Importar respaldo completo (nombres, celulares, marcado rápido, notas, bitácora, turnos) =====
function renderBackupReminder() {
  const el = $("#backupReminder");
  const ultimo = localStorage.getItem(RESPALDO_ULTIMO_KEY);
  if (!ultimo) {
    el.textContent = "⚠️ Nunca has exportado un respaldo en este dispositivo. Hazlo para no perder la información si algo le pasa al teléfono.";
    el.classList.add("show");
    return;
  }
  const dias = Math.floor((Date.now() - new Date(ultimo).getTime()) / (24 * 60 * 60 * 1000));
  if (dias >= RESPALDO_RECORDATORIO_DIAS) {
    el.textContent = `⚠️ Hace ${dias} días que no exportas un respaldo. Considera hacerlo ahora.`;
    el.classList.add("show");
  } else {
    el.classList.remove("show");
  }
}
renderBackupReminder();

$("#btnExportConfig").addEventListener("click", () => {
  const config = {
    tipo: "tert_config",
    version: 4,
    exportado: new Date().toISOString(),
    unitLabels: getUnitLabels(),
    unitStatuses: getUnitStatuses(),
    quickDialOverrides: getQuickDialOverrides(),
    notas: localStorage.getItem(NOTES_KEY) || "",
    logs: getLogs(),
    turnoActual: getTurnoActual(),
    turnosHistorial: getTurnosHistorial(),
    asistencia: getAsistencia(),
    asistenciaFirmantes: getFirmantes(),
    asistenciaUltimoFirmante: getUltimoFirmante(),
    asistenciaNombresConocidos: getNombresConocidos(),
    escenaHistorial: getEscenaHistorial(),
    configTiempos: {
      alertaMinutos: getUnitAlertMinutes(),
      escenaMinMinutos: getEscenaMinMinutos(),
      escenaTopeHoras: getEscenaTopeHoras(),
    },
  };
  const blob = new Blob([JSON.stringify(config, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `TERT_respaldo_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  localStorage.setItem(RESPALDO_ULTIMO_KEY, new Date().toISOString());
  renderBackupReminder();
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
      alert("Archivo inválido: no es un JSON de respaldo de TERT.");
      e.target.value = "";
      return;
    }
    if (config.tipo !== "tert_config") {
      alert("Archivo inválido: no es un archivo de respaldo de TERT.");
      e.target.value = "";
      return;
    }

    // Aviso (no bloquea) si el archivo trae datos más viejos que lo que ya
    // hay en este dispositivo — compara la fecha real más reciente de
    // Bitácora + Asistencia en cada lado, no solo cuándo se exportó el archivo.
    const fechaMasReciente = (logs, asistencia) => {
      const fechas = [
        ...(logs || []).map((l) => (l.fecha || "").slice(0, 10)),
        ...(asistencia || []).map((d) => d.fecha),
      ].filter(Boolean).sort();
      return fechas.length ? fechas[fechas.length - 1] : null;
    };
    const fechaActual = fechaMasReciente(getLogs(), getAsistencia());
    const fechaArchivo = fechaMasReciente(config.logs, config.asistencia);
    if (fechaActual && fechaArchivo && fechaArchivo < fechaActual) {
      if (!confirm(`⚠️ El archivo que vas a importar llega hasta el ${fechaArchivo}, pero ya tienes información en este dispositivo hasta el ${fechaActual}. Si continúas, vas a reemplazar datos más nuevos con datos más viejos.\n\n¿Aún así quieres continuar?`)) {
        e.target.value = "";
        return;
      }
    }

    if (!confirm("Esto reemplazará nombres, celulares, marcado rápido, notas, bitácora, turnos, asistencia y métricas de escena de este dispositivo con los del archivo. ¿Continuar?")) {
      e.target.value = "";
      return;
    }
    saveUnitLabels(config.unitLabels || {});
    saveUnitStatuses(config.unitStatuses || {});
    saveQuickDialOverrides(config.quickDialOverrides || {});
    localStorage.setItem(NOTES_KEY, config.notas || "");
    saveLogs(config.logs || []);
    saveTurnoActual(config.turnoActual || null);
    saveTurnosHistorial(config.turnosHistorial || []);
    saveAsistencia(config.asistencia || []);
    saveFirmantes(config.asistenciaFirmantes || []);
    saveUltimoFirmante(config.asistenciaUltimoFirmante || "");
    saveNombresConocidos(config.asistenciaNombresConocidos || []);
    saveEscenaHistorial(config.escenaHistorial || []);
    if (config.configTiempos) {
      localStorage.setItem(UNIT_ALERT_MINUTES_KEY, String(config.configTiempos.alertaMinutos || 15));
      localStorage.setItem(ESCENA_MIN_MINUTOS_KEY, String(config.configTiempos.escenaMinMinutos || 15));
      localStorage.setItem(ESCENA_TOPE_HORAS_KEY, String(config.configTiempos.escenaTopeHoras || 8));
    }
    renderConfigTiempos();
    renderUnitBoard();
    renderQuickDial();
    loadNotes();
    initPasarLista();
    renderReportTable();
    renderRecentTable();
    renderTurnoInfo();
    renderMetricas();
    e.target.value = "";
    alert("Respaldo importado correctamente.");
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

// ===== Alerta de Incendios (NASA FIRMS) =====
// Mismo patrón de fetch client-side (sin backend) que WeatherCenterPR/KWINT:
// consulta directa a NASA FIRMS desde el navegador, clustering <1km para no
// inflar el conteo por múltiples pasadas de satélite, mapeo a municipio por
// distancia. TERT no tiene servidor propio, así que esto corre 100% en el cliente.
const FIRMS_KEY = "989b65a4765645802d73c69a782f2b74";
const FIRMS_BBOX = "-67.27,17.88,-65.22,18.52";
const FIRMS_SOURCES = ["VIIRS_NOAA20_NRT", "VIIRS_NOAA21_NRT", "VIIRS_SNPP_NRT", "MODIS_NRT"];
const PR_MUNIS = {
  "Adjuntas": [18.1627, -66.7224], "Aguada": [18.3824, -67.1887], "Aguadilla": [18.4274, -67.1541],
  "Aguas Buenas": [18.2569, -66.1028], "Aibonito": [18.14, -66.266], "Anasco": [18.2828, -67.1396],
  "Arecibo": [18.4725, -66.7156], "Arroyo": [17.966, -66.0614], "Barceloneta": [18.4505, -66.5385],
  "Barranquitas": [18.1866, -66.3063], "Bayamon": [18.3985, -66.1554], "Cabo Rojo": [18.0866, -67.1457],
  "Caguas": [18.2341, -66.0485], "Camuy": [18.4837, -66.8449], "Canovanas": [18.379, -65.9014],
  "Carolina": [18.3808, -65.9573], "Catano": [18.4413, -66.1174], "Cayey": [18.1119, -66.166],
  "Ceiba": [18.2636, -65.6486], "Ciales": [18.336, -66.4689], "Cidra": [18.176, -66.1614],
  "Coamo": [18.08, -66.358], "Comerio": [18.2192, -66.2256], "Corozal": [18.3414, -66.3168],
  "Culebra": [18.3108, -65.3028], "Dorado": [18.4589, -66.2677], "Fajardo": [18.3258, -65.6524],
  "Florida": [18.3632, -66.5617], "Guanica": [17.9714, -66.908], "Guayama": [17.9843, -66.1137],
  "Guayanilla": [18.0191, -66.7918], "Guaynabo": [18.3567, -66.1108], "Gurabo": [18.2544, -65.973],
  "Hatillo": [18.4867, -66.8254], "Hormigueros": [18.1397, -67.1275], "Humacao": [18.1498, -65.8197],
  "Isabela": [18.5006, -67.0243], "Jayuya": [18.2186, -66.5916], "Juana Diaz": [18.0535, -66.5066],
  "Juncos": [18.2275, -65.9211], "Lajas": [18.0498, -67.0591], "Lares": [18.2949, -66.8778],
  "Las Marias": [18.2508, -66.9904], "Las Piedras": [18.1831, -65.8722], "Loiza": [18.4313, -65.8783],
  "Luquillo": [18.3726, -65.7165], "Manati": [18.4314, -66.4837], "Maricao": [18.1808, -66.9796],
  "Maunabo": [18.0072, -65.8993], "Mayaguez": [18.2011, -67.1396], "Moca": [18.3946, -67.1131],
  "Morovis": [18.3257, -66.4079], "Naguabo": [18.2117, -65.7349], "Naranjito": [18.3009, -66.2449],
  "Orocovis": [18.2269, -66.391], "Patillas": [18.0038, -66.0136], "Penuelas": [18.0563, -66.726],
  "Ponce": [18.0111, -66.6141], "Quebradillas": [18.4735, -66.9388], "Rincon": [18.3403, -67.25],
  "Rio Grande": [18.3803, -65.8314], "Sabana Grande": [18.0777, -66.9607], "Salinas": [17.9772, -66.2987],
  "San German": [18.0826, -67.0353], "San Juan": [18.4655, -66.1057], "San Lorenzo": [18.1897, -65.9617],
  "San Sebastian": [18.3374, -66.9901], "Santa Isabel": [17.9663, -66.4049], "Toa Alta": [18.3885, -66.2482],
  "Toa Baja": [18.4441, -66.2541], "Trujillo Alto": [18.3548, -66.0075], "Utuado": [18.2653, -66.7008],
  "Vega Alta": [18.4122, -66.3312], "Vega Baja": [18.4442, -66.3879], "Vieques": [18.1263, -65.4401],
  "Villalba": [18.1275, -66.4922], "Yabucoa": [18.0505, -65.8794], "Yauco": [18.0348, -66.8499],
};
function fireHaversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
function fireNearestMuni(lat, lon) {
  let best = null;
  let bd = Infinity;
  for (const name in PR_MUNIS) {
    const m = PR_MUNIS[name];
    const d = fireHaversine(lat, lon, m[0], m[1]);
    if (d < bd) {
      bd = d;
      best = name;
    }
  }
  return { name: best, dist: Math.round(bd * 10) / 10 };
}
function clusterFireHotspots(spots) {
  let rem = spots.slice();
  const clusters = [];
  while (rem.length) {
    const seed = rem.shift();
    const cl = [seed];
    const still = [];
    for (const s of rem) {
      if (fireHaversine(seed.lat, seed.lon, s.lat, s.lon) <= 1) cl.push(s);
      else still.push(s);
    }
    rem = still;
    const bestConf = cl.some((p) => p.confidence === "h") ? "h" : cl.some((p) => p.confidence === "n") ? "n" : "l";
    const maxFrp = Math.max(...cl.map((p) => p.frp));
    const latest = cl.sort((a, b) => (b.acq_date + b.acq_time).localeCompare(a.acq_date + a.acq_time))[0];
    clusters.push({
      lat: seed.lat, lon: seed.lon, municipality: seed.municipality, dist_km: seed.dist_km,
      confidence: bestConf, frp: maxFrp, detections: cl.length,
      acq_date: latest.acq_date, acq_time: latest.acq_time, satellite: latest.satellite, daynight: latest.daynight,
    });
  }
  return clusters;
}
let fireClustersCache = [];
let fireFetchFailed = false;
function fetchFires() {
  const listEl = $("#fireList");
  if (listEl) listEl.innerHTML = '<p class="hint">🛰️ Consultando satélites...</p>';
  const allHotspots = [];
  let done = 0;
  let failCount = 0;
  const finishOne = () => {
    done++;
    if (done >= FIRMS_SOURCES.length) {
      fireFetchFailed = failCount >= FIRMS_SOURCES.length;
      renderFireModal(allHotspots);
    }
  };
  FIRMS_SOURCES.forEach((src) => {
    const url = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${FIRMS_KEY}/${src}/${FIRMS_BBOX}/2`;
    fetch(url)
      .then((r) => r.text())
      .then((txt) => {
        const lines = txt.trim().split("\n");
        if (lines.length > 1) {
          const hdr = lines[0].split(",");
          for (let i = 1; i < lines.length; i++) {
            const fields = lines[i].split(",");
            if (fields.length < hdr.length) continue;
            const row = {};
            hdr.forEach((h, j) => (row[h] = fields[j]));
            const lat = parseFloat(row.latitude);
            const lon = parseFloat(row.longitude);
            if (isNaN(lat)) continue;
            const rawConf = row.confidence || "l";
            let conf;
            const cn = parseInt(rawConf, 10);
            conf = !isNaN(cn) ? (cn >= 80 ? "h" : cn >= 30 ? "n" : "l") : ["h", "n", "l"].includes(rawConf) ? rawConf : "l";
            const nearest = fireNearestMuni(lat, lon);
            allHotspots.push({
              lat, lon, confidence: conf, frp: parseFloat(row.frp) || 0,
              acq_date: row.acq_date || "", acq_time: (row.acq_time || "").padStart(4, "0"),
              satellite: row.satellite || src, daynight: row.daynight || "",
              municipality: nearest.name, dist_km: nearest.dist,
            });
          }
        }
        finishOne();
      })
      .catch(() => {
        failCount++;
        finishOne();
      });
  });
}
function updateFireBadge(count, severity, offline) {
  const btn = $("#btnFireAlert");
  btn.classList.remove("sev-moderada", "sev-baja", "offline");
  if (offline) {
    btn.hidden = false;
    btn.classList.add("offline");
    $("#fireAlertLabel").textContent = "🔥 Sin conexión";
    $("#fireAlertBadgeWrap").hidden = true;
    return;
  }
  $("#fireAlertBadgeWrap").hidden = false;
  $("#fireAlertLabel").textContent = "🔥 Incendios Activos";
  if (!count) {
    btn.hidden = true;
    return;
  }
  btn.hidden = false;
  if (severity === "MODERADA") btn.classList.add("sev-moderada");
  else if (severity === "BAJA") btn.classList.add("sev-baja");
  $("#fireAlertBadgeNum").textContent = count;
}
function renderFireModal(hotspots) {
  const summ = $("#fireSummary");
  const list = $("#fireList");
  if (fireFetchFailed) {
    fireClustersCache = [];
    updateFireBadge(0, null, true);
    if (summ) summ.innerHTML = "";
    if (list) {
      list.innerHTML =
        '<div class="fire-item"><div class="fire-icon">⚠️</div><div class="fire-info">' +
        '<div class="fire-muni">Sin conexión</div>' +
        '<div class="fire-detail">No se pudo verificar incendios en NASA FIRMS — revisa tu conexión a internet. Se reintenta automáticamente en cuanto vuelva la señal.</div>' +
        "</div></div>";
    }
    return;
  }
  const now = Date.now();
  const recent = hotspots.filter((h) => {
    try {
      const dt = new Date(`${h.acq_date}T${h.acq_time.substring(0, 2)}:${h.acq_time.substring(2, 4)}:00Z`);
      return now - dt.getTime() < 43200000; // 12h
    } catch (e) {
      return true;
    }
  });
  const seen = {};
  const unique = [];
  recent.forEach((h) => {
    const k = `${Math.round(h.lat * 1000)},${Math.round(h.lon * 1000)}`;
    if (!seen[k]) {
      seen[k] = 1;
      unique.push(h);
    }
  });

  if (!unique.length) {
    fireClustersCache = [];
    updateFireBadge(0, null);
    if (summ) summ.innerHTML = "";
    if (list) {
      list.innerHTML =
        '<div class="fire-item clear"><div class="fire-icon">🟢</div><div class="fire-info">' +
        '<div class="fire-muni">Sin incendios activos</div>' +
        '<div class="fire-detail">No se registran fuegos forestales activos en Puerto Rico en las últimas 12 horas. Fuente: NASA FIRMS (VIIRS + MODIS).</div>' +
        "</div></div>";
    }
    return;
  }

  const clusters = clusterFireHotspots(unique);
  fireClustersCache = clusters;
  const byMuni = {};
  clusters.forEach((c) => {
    if (!byMuni[c.municipality]) byMuni[c.municipality] = [];
    byMuni[c.municipality].push(c);
  });

  const totalFires = clusters.length;
  const highConf = clusters.filter((c) => c.confidence === "h").length;
  const maxFrp = Math.max(...clusters.map((c) => c.frp));

  let severity, sevColor;
  if (highConf >= 2 || maxFrp >= 15) {
    severity = "ALTA";
    sevColor = "var(--red)";
  } else if (highConf >= 1 || maxFrp >= 5) {
    severity = "MODERADA";
    sevColor = "#f4d03f";
  } else {
    severity = "BAJA";
    sevColor = "var(--accent)";
  }

  updateFireBadge(totalFires, severity);

  if (summ) {
    summ.innerHTML =
      `<div class="fire-stat"><span class="val" style="color:${sevColor}">${totalFires}</span><span class="lbl">Incendios</span></div>` +
      `<div class="fire-stat"><span class="val" style="color:${sevColor}">${severity}</span><span class="lbl">Severidad</span></div>` +
      `<div class="fire-stat"><span class="val">${maxFrp.toFixed(1)}</span><span class="lbl">FRP Max (MW)</span></div>` +
      `<div class="fire-stat"><span class="val">${Object.keys(byMuni).length}</span><span class="lbl">Municipios</span></div>`;
  }

  const munis = Object.keys(byMuni).sort((a, b) => byMuni[b].length - byMuni[a].length);
  let html = "";
  munis.forEach((m) => {
    const mc = byMuni[m];
    const fires = mc.length;
    const sevClass = mc.some((c) => c.confidence === "h") ? "high" : "mod";
    const countStr = fires > 1 ? `${fires} incendios activos` : "1 incendio activo";
    let detailHtml = "";
    mc.sort((a, b) => b.frp - a.frp).forEach((c, i) => {
      const gpsUrl = `https://www.google.com/maps?q=${c.lat},${c.lon}`;
      const confLabel = { h: "🔴 Alta", n: "🟠 Nominal", l: "🟡 Baja" }[c.confidence] || "?";
      const timeLabel = `${c.acq_date} ${c.acq_time.substring(0, 2)}:${c.acq_time.substring(2, 4)}Z`;
      const idx = fireClustersCache.indexOf(c);
      if (fires > 1) detailHtml += `<div style="margin-top:6px;padding-top:6px;border-top:1px solid rgba(255,255,255,.08)"><strong>Incendio ${i + 1}</strong><br>`;
      else detailHtml += `<div style="margin-top:4px">`;
      detailHtml +=
        `📍 <strong>${c.lat.toFixed(4)}°N, ${Math.abs(c.lon).toFixed(4)}°W</strong><br>` +
        `🗺️ <a href="${gpsUrl}" target="_blank">Abrir en Google Maps →</a><br>` +
        `⚡ FRP: <strong>${c.frp.toFixed(1)} MW</strong> | Confianza: ${confLabel}<br>` +
        `🛰️ ${c.satellite.replace("_", " ")} | 🕒 ${timeLabel}<br>` +
        `<button type="button" class="fire-sms-btn" data-fire-idx="${idx}">📱 Enviar SMS</button>` +
        `</div>`;
    });
    html += `<div class="fire-item ${sevClass}"><div class="fire-icon">🔥</div><div class="fire-info">` +
      `<div class="fire-muni">📍 ${m} — ${countStr}</div>` +
      `<div class="fire-detail">${detailHtml}</div></div></div>`;
  });
  if (list) list.innerHTML = html;
  applyDespachoLock();
}
function sendFireSms(cluster) {
  const gpsUrl = `https://www.google.com/maps?q=${cluster.lat},${cluster.lon}`;
  // Sin acentos ni emoji a proposito, mismo motivo que broadcastIncidente():
  // fuerza codificacion GSM-7 (160 caracteres/fragmento) en vez de Unicode (70).
  const body = `Fuego detectado en ${cluster.municipality}. Oprima enlace para direccion en Google Maps: ${gpsUrl}`;
  sendBroadcast(body, true);
}
$("#fireList").addEventListener("click", (e) => {
  const btn = e.target.closest(".fire-sms-btn");
  if (!btn) return;
  const cluster = fireClustersCache[parseInt(btn.dataset.fireIdx, 10)];
  if (cluster) withPressed(btn, () => sendFireSms(cluster));
});
onPressed("#btnFireAlert", () => $("#fireModalOverlay").classList.add("open"));
onPressed("#btnFireRefresh", fetchFires);
$("#fireModalClose").addEventListener("click", () => $("#fireModalOverlay").classList.remove("open"));
$("#fireModalOverlay").addEventListener("click", (e) => {
  if (e.target.id === "fireModalOverlay") $("#fireModalOverlay").classList.remove("open");
});
fetchFires();
setInterval(fetchFires, 900000); // 15 min
// Reconsulta al reabrir la app (el despachador la manda al background sin
// cerrarla, así que una recarga completa no siempre ocurre) y apenas vuelve
// la señal, en vez de esperar hasta 15 min en cualquiera de los dos casos.
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") fetchFires();
});
window.addEventListener("online", fetchFires);

// ===== Referencias de códigos (Clave 10 / Claves Alfa) =====
$("#btnOpenClave10").addEventListener("click", () => $("#clave10ModalOverlay").classList.add("open"));
$("#clave10ModalClose").addEventListener("click", () => $("#clave10ModalOverlay").classList.remove("open"));
$("#clave10ModalOverlay").addEventListener("click", (e) => {
  if (e.target.id === "clave10ModalOverlay") $("#clave10ModalOverlay").classList.remove("open");
});

$("#btnOpenAlfa").addEventListener("click", () => $("#alfaModalOverlay").classList.add("open"));
$("#alfaModalClose").addEventListener("click", () => $("#alfaModalOverlay").classList.remove("open"));
$("#alfaModalOverlay").addEventListener("click", (e) => {
  if (e.target.id === "alfaModalOverlay") $("#alfaModalOverlay").classList.remove("open");
});

// ===== Funcionalidades / Acerca de / Términos y Condiciones =====
$("#btnOpenFuncionalidades").addEventListener("click", () => $("#funcionalidadesModalOverlay").classList.add("open"));
$("#funcionalidadesModalClose").addEventListener("click", () => $("#funcionalidadesModalOverlay").classList.remove("open"));
$("#funcionalidadesModalOverlay").addEventListener("click", (e) => {
  if (e.target.id === "funcionalidadesModalOverlay") $("#funcionalidadesModalOverlay").classList.remove("open");
});

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
