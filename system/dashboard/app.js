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
const btnMlForecast = document.getElementById("btn-ml-forecast");

const viewDashboard = document.getElementById("view-dashboard");
const viewDeliveries = document.getElementById("view-deliveries");
const viewMlForecast = document.getElementById("view-ml-forecast");

function switchView(target) {
    viewDashboard.style.display = "none";
    viewDeliveries.style.display = "none";
    viewMlForecast.style.display = "none";
    
    btnDashboard.classList.remove("active");
    btnDeliveries.classList.remove("active");
    btnMlForecast.classList.remove("active");

    if (target === "dashboard") {
        viewDashboard.style.display = "grid";
        btnDashboard.classList.add("active");
    } else if (target === "deliveries") {
        viewDeliveries.style.display = "block";
        btnDeliveries.classList.add("active");
        loadAdminOrders();
    } else if (target === "ml-forecast") {
        viewMlForecast.style.display = "block";
        btnMlForecast.classList.add("active");
        renderMlForecastChart();
    }
}

btnDashboard.addEventListener("click", (e) => { e.preventDefault(); switchView("dashboard"); });
btnDeliveries.addEventListener("click", (e) => { e.preventDefault(); switchView("deliveries"); });
btnMlForecast.addEventListener("click", (e) => { e.preventDefault(); switchView("ml-forecast"); });

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

// Iniciar conexión real con Cortex
connectWebSocket();
