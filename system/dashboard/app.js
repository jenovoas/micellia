// Simulación de la Aritmética Sexagesimal S60 en Frontend
class S60 {
    static SCALE = 216000; // 60^3

    static fromFloat(val) {
        const raw = Math.round(val * S60.SCALE);
        return new S60(raw);
    }

    constructor(raw) {
        this.raw = raw;
    }

    toParts() {
        const absRaw = Math.abs(this.raw);
        const units = Math.floor(absRaw / S60.SCALE);
        let remainder = absRaw % S60.SCALE;

        const minutes = Math.floor(remainder / 3600);
        remainder = remainder % 3600;

        const seconds = Math.floor(remainder / 60);
        const thirds = remainder % 60;

        const signedUnits = this.raw < 0 ? -units : units;
        return { units: signedUnits, minutes, seconds, thirds };
    }

    toString() {
        const { units, minutes, seconds, thirds } = this.toParts();
        return `${units}° ${minutes}' ${seconds}" ${thirds}'''`;
    }
}

// Estados del Sistema
const STATES = {
    PREPARACION: {
        name: "PREPARACIÓN",
        desc: "Fase de ingreso manual de lote y trazabilidad física del sustrato. Esperando inoculación.",
        class: "incubacion"
    },
    INCUBACION: {
        name: "INCUBACIÓN",
        desc: "Oscuridad total. Alta concentración de CO₂ para desarrollo del micelio. Humedad templada.",
        class: "incubacion"
    },
    INDUCCION: {
        name: "INDUCCIÓN",
        desc: "Choque térmico (descenso de temperatura a 18-20°C) y lumínico para inducir formación de primordios.",
        class: "alerta"
    },
    FRUCTIFICACION: {
        name: "FRUCTIFICACIÓN",
        desc: "Humedad relativa en 85-95%, temperatura de 18-22°C (plano técnico), máxima aireación HEPA (CO₂ bajo control).",
        class: ""
    },
    COSECHA: {
        name: "COSECHA",
        desc: "Retiro y pesaje manual de cuerpos fructíferos. Registro de rendimiento en TruthSync.",
        class: "incubacion"
    },
    SANITIZACION: {
        name: "SANITIZACIÓN",
        desc: "Limpieza estructural y pasteurización manual de la cámara de fructificación.",
        class: "alerta"
    },
    CONTAMINACION_ALERTA: {
        name: "ALERTA: CONTAMINACIÓN",
        desc: "¡PELIGRO! Presunta espora ajena detectada o caída de flujo de aire. Compuertas de aireación cerradas herméticamente.",
        class: "alerta"
    }
};

const STATE_ORDER = [
    "PREPARACION",
    "INCUBACION",
    "INDUCCION",
    "FRUCTIFICACION",
    "COSECHA",
    "SANITIZACION"
];

// Estado Inicial
let currentStateKey = "FRUCTIFICACION";
let currentTab = "obs"; // 'obs' o 'sec'

// Base de Logs
const logsObs = [
    { time: "17:55:02", type: "success", text: "TruthSync: Generación de firma criptográfica para Batch-091." },
    { time: "17:55:10", type: "info", text: "Transición: Entrada automática al estado de INCUBACIÓN." },
    { time: "17:56:45", type: "info", text: "Sensores: CO₂ acumulado superó las 2,200 ppm (Valor S60: 2200° 0' 0\" 0''')." },
    { time: "17:58:12", type: "info", text: "Transición: Choque lumínico iniciado (Fase de INDUCCIÓN)." },
    { time: "17:59:00", type: "success", text: "Transición: Entrada en estado de FRUCTIFICACIÓN." }
];

const logsSec = [
    { time: "17:54:30", type: "info", text: "eBPF XDP: Filtro de interfaz cargado en eth0." },
    { time: "17:55:00", type: "success", text: "eBPF LSM: Regla cargada para bloquear llamadas execve en /etc/micelia." },
    { time: "17:58:32", type: "warning", text: "mTLS: Intento de conexión descartado desde IP no aprobada (192.168.1.144)." },
    { time: "17:59:15", type: "info", text: "TruthSync: Hash verificado para la firma del daemon Cortex. Integridad 100%." }
];

// Referencias del DOM
const rangeTemp = document.getElementById("range-temp");
const rangeHum = document.getElementById("range-hum");
const rangeCo2 = document.getElementById("range-co2");

const tempFloat = document.getElementById("temp-float");
const tempS60 = document.getElementById("temp-s60");
const humFloat = document.getElementById("hum-float");
const humS60 = document.getElementById("hum-s60");
const co2Float = document.getElementById("co2-float");
const co2S60 = document.getElementById("co2-s60");

const stateBadge = document.getElementById("current-state-badge");
const stateDesc = document.getElementById("state-desc");
const timelineSteps = document.querySelectorAll(".timeline-step");

const btnNextState = document.getElementById("btn-next-state");
const btnTriggerAlert = document.getElementById("btn-trigger-alert");

const tabObs = document.getElementById("tab-obs");
const tabSec = document.getElementById("tab-sec");
const logViewport = document.getElementById("log-viewport");

// Función para actualizar los gauges circulares SVG
function setGaugeValue(circleId, percent) {
    const circle = document.getElementById(circleId);
    if (!circle) return;
    const circumference = 2 * Math.PI * 42; // radio r=42 -> ~263.89
    circle.style.strokeDasharray = circumference;
    const clampedPercent = Math.max(0, Math.min(1, percent));
    const offset = circumference - (clampedPercent * circumference);
    circle.style.strokeDashoffset = offset;
}

// Funciones de Actualización de Sensores
function updateTemperature(val) {
    tempFloat.textContent = `${parseFloat(val).toFixed(2)} °C`;
    const s = S60.fromFloat(val);
    tempS60.textContent = s.toString();
    // Escala del simulador: 10°C a 30°C
    const percent = (parseFloat(val) - 10) / (30 - 10);
    setGaugeValue("temp-gauge-circle", percent);
}

// Actualizar Humedad
function updateHumidity(val) {
    humFloat.textContent = `${parseFloat(val).toFixed(2)} %`;
    const s = S60.fromFloat(val);
    humS60.textContent = s.toString();
    // Escala del simulador: 50% a 100%
    const percent = (parseFloat(val) - 50) / (100 - 50);
    setGaugeValue("hum-gauge-circle", percent);
}

// Actualizar CO2
function updateCO2(val) {
    co2Float.textContent = `${parseInt(val)} ppm`;
    const s = S60.fromFloat(val);
    co2S60.textContent = s.toString();
    // Escala del simulador: 300 ppm a 3000 ppm
    const percent = (parseFloat(val) - 300) / (3000 - 300);
    setGaugeValue("co2-gauge-circle", percent);
}

// Inicialización de Controles
rangeTemp.addEventListener("input", (e) => {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
        updateTemperature(e.target.value);
    }
});

rangeHum.addEventListener("input", (e) => {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
        updateHumidity(e.target.value);
    }
});

rangeCo2.addEventListener("input", (e) => {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
        updateCO2(e.target.value);
    }
});

// Renderizar Historial de Logs
function renderLogs() {
    logViewport.innerHTML = "";
    const list = currentTab === "obs" ? logsObs : logsSec;
    list.forEach(item => {
        const div = document.createElement("div");
        div.className = `log-line ${item.type}`;
        div.innerHTML = `<span class="log-time">[${item.time}]</span> <span class="log-text">${item.text}</span>`;
        logViewport.appendChild(div);
    });
    // Auto-scroll al fondo
    logViewport.scrollTop = logViewport.scrollHeight;
}

function addLog(tab, type, text) {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    const logItem = { time: timeStr, type, text };
    
    if (tab === "obs") {
        logsObs.push(logItem);
    } else {
        logsSec.push(logItem);
    }
    renderLogs();
}

// Control del Estado Lógico
function updateStateUI() {
    const state = STATES[currentStateKey];
    stateBadge.textContent = state.name;
    stateDesc.textContent = state.desc;
    
    // Quitar todas las clases especiales y poner la del estado
    stateBadge.className = "state-badge";
    if (state.class) {
        stateBadge.classList.add(state.class);
    }

    // Actualizar barra de timeline
    const activeIndex = STATE_ORDER.indexOf(currentStateKey);
    timelineSteps.forEach((step, idx) => {
        step.className = "timeline-step";
        if (idx < activeIndex) {
            step.classList.add("done");
        } else if (idx === activeIndex) {
            step.classList.add("active");
        }
    });

    if (currentStateKey === "CONTAMINACION_ALERTA") {
        btnNextState.textContent = "Reiniciar a Preparación";
        btnNextState.className = "btn btn-primary";
    } else {
        const nextIdx = (STATE_ORDER.indexOf(currentStateKey) + 1) % STATE_ORDER.length;
        const nextStateName = STATES[STATE_ORDER[nextIdx]].name;
        btnNextState.textContent = `Avanzar a ${nextStateName}`;
        btnNextState.className = "btn btn-primary";
    }
}

btnNextState.addEventListener("click", () => {
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ action: "next_state" }));
    } else {
        // Fallback local offline
        if (currentStateKey === "CONTAMINACION_ALERTA") {
            currentStateKey = "PREPARACION";
            addLog("obs", "success", "Manual: Sanitización estructural completada y certificada. Reiniciando Cámara.");
        } else {
            const currentIdx = STATE_ORDER.indexOf(currentStateKey);
            const nextIdx = (currentIdx + 1) % STATE_ORDER.length;
            const oldState = STATES[currentStateKey].name;
            currentStateKey = STATE_ORDER[nextIdx];
            const newState = STATES[currentStateKey].name;
            
            addLog("obs", "info", `Transición: Cámara cambió de ${oldState} a ${newState}.`);
        }
        updateStateUI();
    }
});

btnTriggerAlert.addEventListener("click", () => {
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ action: "trigger_alert" }));
    } else {
        // Fallback local offline
        if (currentStateKey !== "CONTAMINACION_ALERTA") {
            currentStateKey = "CONTAMINACION_ALERTA";
            addLog("sec", "error", "Alerta MIP: Activado aislamiento físico. Compuertas HEPA bloqueadas.");
            addLog("obs", "error", "Incidencia: Se ha reportado una alerta de contaminación estructural manual.");
            updateStateUI();
        }
    }
});

// Control de Tabs de Logs
tabObs.addEventListener("click", () => {
    currentTab = "obs";
    tabObs.classList.add("active");
    tabSec.classList.remove("active");
    renderLogs();
});

tabSec.addEventListener("click", () => {
    currentTab = "sec";
    tabSec.classList.add("active");
    tabObs.classList.remove("active");
    renderLogs();
});

// ==========================================================================
// CONEXIÓN WEBSOCKET CON CORTEX BACKEND
// ==========================================================================
let socket = null;

function connectWebSocket() {
    const wsProto = location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = location.host ? `${wsProto}//${location.host}/ws` : "ws://127.0.0.1:8080/ws";
    socket = new WebSocket(wsUrl);

    socket.onopen = () => {
        console.log("WebSocket connected to Cortex");
        addLog("obs", "success", "Conexión establecida con el daemon de Cortex.");
        document.querySelector(".status-text").textContent = "Cortex Online (WS Connected)";
        document.querySelector(".pulse-dot").className = "pulse-dot green";
    };

    socket.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            
            // Si es un evento de nuevo pedido
            if (data.type === "order") {
                addLog("obs", "info", `Pedido de ${data.customer_name} (\$${data.total_amount.toLocaleString("es-CL")}) firmado en TruthSync!`);
                if (typeof viewDeliveries !== "undefined" && viewDeliveries.style.display === "block") {
                    loadAdminOrders();
                }
                return;
            }
            if (data.type === "order_status_update") {
                if (typeof viewDeliveries !== "undefined" && viewDeliveries.style.display === "block") {
                    loadAdminOrders();
                }
                return;
            }
            
            // Actualizar sensores
            if (data.cell_id) {
                const tempFloatVal = data.temp_raw / 216000;
                const humFloatVal = data.hum_raw / 216000;
                const co2FloatVal = data.co2_raw / 216000;
                
                updateTemperature(tempFloatVal);
                updateHumidity(humFloatVal);
                updateCO2(co2FloatVal);

                // Sincronizar selectores en pantalla para mostrar la realidad física
                rangeTemp.value = tempFloatVal;
                rangeHum.value = humFloatVal;
                rangeCo2.value = co2FloatVal;
                
                // Actualizar estado de la cámara
                if (currentStateKey !== data.current_state) {
                    addLog("obs", "info", `Transición de estado: ${currentStateKey} -> ${data.current_state}`);
                    currentStateKey = data.current_state;
                    updateStateUI();
                }

                // Logs de actuadores basados en el estado del backend
                if (data.damper_closed && !data.last_damper_state) {
                    addLog("sec", "warning", "Alerta MIP: Compuertas damper cerradas por aislamiento preventivo.");
                }
            }
        } catch (e) {
            console.error("Error al procesar mensaje del WebSocket:", e);
        }
    };

    socket.onclose = () => {
        console.log("WebSocket connection closed. Retrying in 5 seconds...");
        addLog("obs", "warning", "WebSocket desconectado. Ejecutando en modo de simulación offline.");
        document.querySelector(".status-text").textContent = "Cortex Offline (Simulado)";
        document.querySelector(".pulse-dot").className = "pulse-dot green"; // mantenemos pulso por la simulación local
        setTimeout(connectWebSocket, 5000);
    };

    socket.onerror = (error) => {
        console.error("WebSocket error:", error);
    };
}

// Inicialización de la pantalla al cargar
updateTemperature(rangeTemp.value);
updateHumidity(rangeHum.value);
updateCO2(rangeCo2.value);

// ==========================================================================
// SPA NAVIGATION & ORDER GESTION (ADMIN)
// ==========================================================================
const btnDashboard = document.getElementById("btn-dashboard");
const btnDeliveries = document.getElementById("btn-deliveries");
const btnTasks = document.getElementById("btn-tasks");
const btnMlForecast = document.getElementById("btn-ml-forecast");
const btnDossier = document.getElementById("btn-dossier");

const viewDashboard = document.getElementById("view-dashboard");
const viewDeliveries = document.getElementById("view-deliveries");
const viewTasks = document.getElementById("view-tasks");
const viewMlForecast = document.getElementById("view-ml-forecast");
const viewDossier = document.getElementById("view-dossier");

function switchView(target) {
    viewDashboard.style.display = "none";
    viewDeliveries.style.display = "none";
    if (viewTasks) viewTasks.style.display = "none";
    viewMlForecast.style.display = "none";
    if (viewDossier) viewDossier.style.display = "none";
    
    btnDashboard.classList.remove("active");
    btnDeliveries.classList.remove("active");
    if (btnTasks) btnTasks.classList.remove("active");
    btnMlForecast.classList.remove("active");
    if (btnDossier) btnDossier.classList.remove("active");

    if (target === "dashboard") {
        viewDashboard.style.display = "grid";
        btnDashboard.classList.add("active");
    } else if (target === "deliveries") {
        viewDeliveries.style.display = "block";
        btnDeliveries.classList.add("active");
        loadAdminOrders();
    } else if (target === "tasks") {
        if (viewTasks) viewTasks.style.display = "block";
        if (btnTasks) btnTasks.classList.add("active");
        loadAndRenderTasks();
    } else if (target === "ml-forecast") {
        viewMlForecast.style.display = "block";
        btnMlForecast.classList.add("active");
        renderMlForecastChart();
    } else if (target === "dossier") {
        if (viewDossier) {
            viewDossier.style.display = "block";
            btnDossier.classList.add("active");
        }
    }
}

btnDashboard.addEventListener("click", (e) => { e.preventDefault(); switchView("dashboard"); });
btnDeliveries.addEventListener("click", (e) => { e.preventDefault(); switchView("deliveries"); });
if (btnTasks) btnTasks.addEventListener("click", (e) => { e.preventDefault(); switchView("tasks"); });
btnMlForecast.addEventListener("click", (e) => { e.preventDefault(); switchView("ml-forecast"); });
if (btnDossier) btnDossier.addEventListener("click", (e) => { e.preventDefault(); switchView("dossier"); });

async function loadAdminOrders() {
    const tableBody = document.getElementById("admin-orders-table-body");
    try {
        const response = await fetch("/api/orders");
        const orders = await response.json();
        
        if (orders.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="7" style="padding: 2rem; text-align: center; color: var(--text-muted);">No hay pedidos registrados.</td></tr>`;
            return;
        }

        let html = "";
        orders.forEach(order => {
            const status = order.status || "Procesando";
            
            const selectHtml = `
                <select onchange="changeOrderStatus(${order.id}, this.value)" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 0.35rem 0.5rem; color: #fff; font-family: var(--font-sans); cursor: pointer;">
                    <option value="Procesando" ${status === "Procesando" ? "selected" : ""}>Procesando</option>
                    <option value="Cosechando" ${status === "Cosechando" ? "selected" : ""}>Cosechando</option>
                    <option value="En Reparto" ${status === "En Reparto" ? "selected" : ""}>En Reparto</option>
                    <option value="Entregado" ${status === "Entregado" ? "selected" : ""}>Entregado</option>
                </select>
            `;

            html += `
                <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.05); vertical-align: middle;">
                    <td style="padding: 1.25rem 1rem;">#${order.id}</td>
                    <td style="padding: 1.25rem 1rem; font-size: 0.8rem; color: var(--text-muted);">${new Date(order.timestamp).toLocaleDateString('es-CL')}</td>
                    <td style="padding: 1.25rem 1rem;">
                        <strong>${order.customer_name}</strong><br>
                        <small style="color: var(--text-muted);">${order.customer_email}</small>
                    </td>
                    <td style="padding: 1.25rem 1rem; font-size: 0.85rem; color: var(--text-muted);">${order.items}</td>
                    <td style="padding: 1.25rem 1rem; color: var(--accent-gold); font-weight: 600;">$${order.total_amount.toLocaleString("es-CL")}</td>
                    <td style="padding: 1.25rem 1rem;">${selectHtml}</td>
                    <td style="padding: 1.25rem 1rem; font-family: monospace; font-size: 0.75rem; color: var(--text-muted); word-break: break-all;">${order.signature}</td>
                </tr>
            `;
        });
        tableBody.innerHTML = html;

    } catch (e) {
        console.error("Error cargando pedidos en admin:", e);
        tableBody.innerHTML = `<tr><td colspan="7" style="padding: 2rem; text-align: center; color: red;">Error al conectar con la base de datos de Cortex.</td></tr>`;
    }
}

async function changeOrderStatus(orderId, newStatus) {
    try {
        const response = await fetch("/api/orders/status", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ order_id: orderId, new_status: newStatus })
        });
        const data = await response.json();
        if (data.status === "success") {
            addLog("obs", "info", `Pedido #${orderId} actualizado a '${newStatus}' y firmado en TruthSync.`);
            loadAdminOrders();
        } else {
            alert("No se pudo actualizar el estado del pedido.");
        }
    } catch (e) {
        console.error("Error al actualizar despacho:", e);
    }
}

function renderMlForecastChart() {
    const viewport = document.getElementById("ml-chart-viewport");
    
    const historical = [
        { month: "Abril", amount: 450000 },
        { month: "Mayo", amount: 620000 },
        { month: "Junio", amount: 780000 }
    ];

    const x = [1, 2, 3];
    const y = historical.map(h => h.amount);
    const n = x.length;
    const sum_x = x.reduce((a, b) => a + b, 0);
    const sum_y = y.reduce((a, b) => a + b, 0);
    const sum_xy = x.reduce((sum, val, idx) => sum + val * y[idx], 0);
    const sum_xx = x.reduce((sum, val) => sum + val * val, 0);
    
    const slope = (n * sum_xy - sum_x * sum_y) / (n * sum_xx - sum_x * sum_x);
    const intercept = (sum_y - slope * sum_x) / n;

    const predicted = [
        { month: "Julio (ML)", amount: Math.round(slope * 4 + intercept) },
        { month: "Agosto (ML)", amount: Math.round(slope * 5 + intercept) },
        { month: "Septiembre (ML)", amount: Math.round(slope * 6 + intercept) }
    ];

    const maxVal = Math.max(...historical.map(h => h.amount), ...predicted.map(p => p.amount)) * 1.15;
    let html = "";
    
    historical.forEach(h => {
        const heightPercent = (h.amount / maxVal) * 85;
        html += `
            <div class="chart-bar-container" style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; height: 100%; justify-content: flex-end;">
                <span style="font-size: 0.75rem; font-weight: 600; color: var(--accent-green-light);">$${(h.amount / 1000)}k</span>
                <div class="chart-bar" style="width: 40px; height: ${heightPercent}%; background: linear-gradient(0deg, var(--accent-green), var(--accent-green-light)); border-radius: 8px 8px 0 0; box-shadow: 0 4px 15px rgba(90, 164, 105, 0.25);"></div>
                <span style="font-size: 0.75rem; color: var(--text-muted);">${h.month}</span>
            </div>
        `;
    });

    predicted.forEach(p => {
        const heightPercent = (p.amount / maxVal) * 85;
        html += `
            <div class="chart-bar-container" style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; height: 100%; justify-content: flex-end;">
                <span style="font-size: 0.75rem; font-weight: 600; color: var(--accent-gold); font-family: var(--font-display);">$${(p.amount / 1000)}k</span>
                <div class="chart-bar" style="width: 40px; height: ${heightPercent}%; background: linear-gradient(0deg, rgba(195, 181, 159, 0.2), var(--accent-gold)); border-radius: 8px 8px 0 0; box-shadow: 0 4px 15px rgba(195, 181, 159, 0.2); border: 1px dashed var(--accent-gold);"></div>
                <span style="font-size: 0.75rem; color: var(--accent-gold); font-weight: 500;">${p.month}</span>
            </div>
        `;
    });

    viewport.innerHTML = html;
}
updateStateUI();
renderLogs();

// Mostrar nombre del operador en el subtítulo
const savedUser = localStorage.getItem("micelia_current_user");
if (savedUser) {
    const userObj = JSON.parse(savedUser);
    const subtitle = document.querySelector(".subtitle");
    if (subtitle) {
        subtitle.innerHTML = `Monitoreo en tiempo real bajo Protocolo Yatra S60 · Operador: <strong>${userObj.name}</strong>`;
    }
}

// Botón de cerrar sesión
const btnLogout = document.getElementById("btn-logout");
if (btnLogout) {
    btnLogout.addEventListener("click", () => {
        localStorage.removeItem("micelia_current_user");
        window.location.href = "index.html";
    });
}

// ==========================================================================
// LABOUR LOAD BALANCING & TASK MANAGEMENT
// ==========================================================================
const EMPLOYEES = [
    { email: "maria.angelica@micelia.cl", name: "Maria Angélica" },
    { email: "cristian.novoa@micelia.cl", name: "Cristian Novoa" },
    { email: "jaime.novoa@micelia.cl", name: "Jaime Novoa" }
];

function getTasks() {
    const raw = localStorage.getItem("micelia_tasks");
    if (!raw) {
        const defaults = [
            { id: 1, desc: "Revisar filtros HEPA y sensores SHT31", assignee: "cristian.novoa@micelia.cl", priority: "Alta", status: "Pendiente" },
            { id: 2, desc: "Pasteurizar sustrato para nuevo lote", assignee: "jaime.novoa@micelia.cl", priority: "Alta", status: "Iniciada" },
            { id: 3, desc: "Registrar peso de cosecha en Ledger TruthSync", assignee: "maria.angelica@micelia.cl", priority: "Media", status: "Pendiente" },
            { id: 4, desc: "Ajustar compuertas de CO2 según Yatra S60", assignee: "cristian.novoa@micelia.cl", priority: "Baja", status: "Completada" }
        ];
        localStorage.setItem("micelia_tasks", JSON.stringify(defaults));
        return defaults;
    }
    return JSON.parse(raw);
}

function saveTasks(tasks) {
    localStorage.setItem("micelia_tasks", JSON.stringify(tasks));
}

function loadAndRenderTasks() {
    const tasks = getTasks();
    const currentUser = JSON.parse(localStorage.getItem("micelia_current_user"));
    const userEmail = currentUser ? currentUser.email.toLowerCase() : "";
    const isAdmin = (userEmail === "maria.angelica@micelia.cl");

    // 1. Mostrar/Ocultar paneles según privilegios
    const adminPanel = document.getElementById("admin-task-creation-panel");
    const autoAssignBtn = document.getElementById("btn-auto-assign");
    if (adminPanel) adminPanel.style.display = isAdmin ? "block" : "none";
    if (autoAssignBtn) autoAssignBtn.style.display = isAdmin ? "flex" : "none";

    // 2. Calcular carga laboral por empleado (solo contamos tareas no completadas)
    const counts = {
        "maria.angelica@micelia.cl": 0,
        "cristian.novoa@micelia.cl": 0,
        "jaime.novoa@micelia.cl": 0
    };
    tasks.forEach(t => {
        if (t.status !== "Completada" && counts[t.assignee] !== undefined) {
            counts[t.assignee]++;
        }
    });

    // Renderizar contadores en la UI
    document.getElementById("load-maria").textContent = `${counts["maria.angelica@micelia.cl"]} pendiente(s)`;
    document.getElementById("load-cristian").textContent = `${counts["cristian.novoa@micelia.cl"]} pendiente(s)`;
    document.getElementById("load-jaime").textContent = `${counts["jaime.novoa@micelia.cl"]} pendiente(s)`;

    // Calcular porcentajes de barra de progreso (máximo de 5 tareas para 100%)
    const getPercent = (count) => Math.min((count / 5) * 100, 100);
    document.getElementById("progress-maria").style.width = `${getPercent(counts["maria.angelica@micelia.cl"])}%`;
    document.getElementById("progress-cristian").style.width = `${getPercent(counts["cristian.novoa@micelia.cl"])}%`;
    document.getElementById("progress-jaime").style.width = `${getPercent(counts["jaime.novoa@micelia.cl"])}%`;

    // Cambiar color de barras según carga
    const updateBarColor = (el, count) => {
        if (count >= 4) el.style.background = "var(--accent-red)";
        else if (count >= 2) el.style.background = "var(--accent-gold)";
        else el.style.background = "var(--accent-green)";
    };
    updateBarColor(document.getElementById("progress-maria"), counts["maria.angelica@micelia.cl"]);
    updateBarColor(document.getElementById("progress-cristian"), counts["cristian.novoa@micelia.cl"]);
    updateBarColor(document.getElementById("progress-jaime"), counts["jaime.novoa@micelia.cl"]);

    // 3. Renderizar la tabla de tareas
    const tbody = document.getElementById("tasks-table-body");
    if (!tbody) return;

    if (tasks.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="padding: 1.5rem; text-align: center; color: var(--text-muted);">No hay tareas asignadas.</td></tr>`;
        return;
    }

    let html = "";
    tasks.forEach(t => {
        const isOwnTask = (t.assignee.toLowerCase() === userEmail);
        const canEdit = isAdmin || isOwnTask;

        let statusClass = "state-badge";
        if (t.status === "Completada") statusClass += " green";
        else if (t.status === "Iniciada") statusClass += " yellow";

        let selectStatus = "";
        if (canEdit) {
            selectStatus = `
                <select onchange="updateTaskStatus(${t.id}, this.value)" style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 0.25rem 0.5rem; color: #fff; font-size: 0.8rem; cursor: pointer;">
                    <option value="Pendiente" ${t.status === "Pendiente" ? "selected" : ""}>Pendiente</option>
                    <option value="Iniciada" ${t.status === "Iniciada" ? "selected" : ""}>Iniciada</option>
                    <option value="Completada" ${t.status === "Completada" ? "selected" : ""}>Completada</option>
                </select>
            `;
        } else {
            selectStatus = `<span class="${statusClass}">${t.status}</span>`;
        }

        // Acciones: los admins pueden reasignar o eliminar; los usuarios comunes solo pueden ver
        let actionsHtml = "";
        if (isAdmin) {
            actionsHtml = `
                <button onclick="deleteTask(${t.id})" class="btn btn-danger" style="padding: 0.25rem 0.5rem; font-size: 0.75rem; display: inline-flex; align-items: center; gap: 0.25rem;">
                    <span class="material-symbols-outlined" style="font-size: 0.9rem;">delete</span> Borrar
                </button>
            `;
        } else {
            actionsHtml = `<span style="color: var(--text-muted); font-size: 0.75rem;">Solo lectura</span>`;
        }

        const employeeName = EMPLOYEES.find(e => e.email === t.assignee)?.name || t.assignee;

        html += `
            <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.05); vertical-align: middle;">
                <td style="padding: 0.75rem;">#${t.id}</td>
                <td style="padding: 0.75rem; font-weight: 500; color: #fff;">${t.desc}</td>
                <td style="padding: 0.75rem;"><code>${employeeName}</code></td>
                <td style="padding: 0.75rem;"><span style="color: ${t.priority === 'Alta' ? 'var(--accent-red)' : t.priority === 'Media' ? 'var(--accent-gold)' : 'var(--text-muted)'}">${t.priority}</span></td>
                <td style="padding: 0.75rem;">${selectStatus}</td>
                <td style="padding: 0.75rem; text-align: right;">${actionsHtml}</td>
            </tr>
        `;
    });
    tbody.innerHTML = html;
}

// Balanceador automático de carga: asigna la tarea al empleado con menos tareas pendientes
function balanceTaskAssignee() {
    const tasks = getTasks();
    const counts = {
        "maria.angelica@micelia.cl": 0,
        "cristian.novoa@micelia.cl": 0,
        "jaime.novoa@micelia.cl": 0
    };
    tasks.forEach(t => {
        if (t.status !== "Completada" && counts[t.assignee] !== undefined) {
            counts[t.assignee]++;
        }
    });

    let bestAssignee = "cristian.novoa@micelia.cl";
    let minLoad = Infinity;

    // Buscamos el empleado con menor carga. Preferimos operarios sobre el admin si empatan
    const checkOrder = ["cristian.novoa@micelia.cl", "jaime.novoa@micelia.cl", "maria.angelica@micelia.cl"];
    checkOrder.forEach(email => {
        if (counts[email] < minLoad) {
            minLoad = counts[email];
            bestAssignee = email;
        }
    });

    return bestAssignee;
}

window.updateTaskStatus = function(id, status) {
    const tasks = getTasks();
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.status = status;
        saveTasks(tasks);
        loadAndRenderTasks();
        logsObs.push({ time: new Date().toLocaleTimeString('es-CL'), type: "info", text: `Tarea #${id} actualizada a: ${status}` });
        renderLogs();
    }
};

window.deleteTask = function(id) {
    let tasks = getTasks();
    tasks = tasks.filter(t => t.id !== id);
    saveTasks(tasks);
    loadAndRenderTasks();
};

// Listeners para Creación y Balanceo automático
document.addEventListener("DOMContentLoaded", () => {
    const taskForm = document.getElementById("task-creation-form");
    if (taskForm) {
        taskForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const desc = document.getElementById("task-desc-input").value;
            let assignee = document.getElementById("task-assignee-select").value;
            const priority = document.getElementById("task-priority-select").value;

            if (assignee === "auto") {
                assignee = balanceTaskAssignee();
            }

            const tasks = getTasks();
            const nextId = tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1;
            
            tasks.push({
                id: nextId,
                desc,
                assignee,
                priority,
                status: "Pendiente"
            });

            saveTasks(tasks);
            loadAndRenderTasks();
            taskForm.reset();
        });
    }

    const autoAssignBtn = document.getElementById("btn-auto-assign");
    if (autoAssignBtn) {
        autoAssignBtn.addEventListener("click", () => {
            const tasks = getTasks();
            // Balancear todas las tareas no completadas de forma equitativa
            tasks.forEach(t => {
                if (t.status !== "Completada") {
                    t.assignee = balanceTaskAssignee();
                }
            });
            saveTasks(tasks);
            loadAndRenderTasks();
            alert("Carga laboral balanceada automáticamente según pendientes.");
        });
    }
});

// Iniciar conexión real con Cortex
connectWebSocket();
