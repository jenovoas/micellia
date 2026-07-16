// public.js - Lógica interactiva y cliente de Micelia (Carrito, Login Social, ML y Despachos)

// State global del Carrito y Usuario
let cart = [];
let currentUser = null;
let userOrders = []; // Órdenes del usuario logueado
let socket = null;

// Base de Datos de Artículos (Camino Micelia)
const ARTICLES = {
    1: {
        title: "¿Qué es realmente el hongo ostra?",
        tag: "Fundamentos Micológicos",
        image: "oyster_mushrooms.png",
        content: `
            <p>El hongo ostra (<strong>Pleurotus ostreatus</strong>) es un organismo fascinante que pertenece al reino Fungi. A diferencia de las plantas, no produce clorofila ni realiza fotosíntesis. Su ciclo de vida es saprófito: obtiene su energía y nutrientes descomponiendo materia orgánica muerta, principalmente madera o restos agrícolas.</p>
            <h2>Estructura y Anatomía</h2>
            <p>Lo que consumimos habitualmente es el "cuerpo fructífero", el equivalente a la manzana en un manzano. El organismo real es el <strong>micelio</strong>, una red invisible de filamentos microscópicos llamadas hifas que colonizan el sustrato.</p>
            <p>El hongo ostra se caracteriza por su forma de concha u ostra, con un pie o tallo lateral corto y láminas que descienden por él. Su color varía desde tonos grises cenizos hasta cremas según las condiciones de temperatura y luminosidad.</p>
            <h2>Ecología y Resiliencia</h2>
            <p>Es una de las especies de hongos más vigorosas para cultivar, ya que su micelio es sumamente agresivo y coloniza los sustratos rápidamente, compitiendo de forma efectiva contra mohos y bacterias oportunistas.</p>
        `
    },
    2: {
        title: "¿Por qué cada vez más personas lo incorporan a su alimentación?",
        tag: "Compendio Nutricional",
        image: "raw_mushrooms.png",
        content: `
            <p>Ante la necesidad de transicionar hacia dietas más saludables y de menor impacto ecológico, el hongo ostra emerge como un superalimento proteico. En base seca, su contenido de proteína oscila entre el <strong>15% y el 30%</strong>, incorporando todos los aminoácidos esenciales requeridos por el cuerpo humano.</p>
            <h2>Nutrición y Salud Cardiovascular</h2>
            <p>Las setas ostra son naturalmente bajas en sodio y grasas saturadas, y no contienen colesterol. Contienen lovastatina natural, un compuesto clínicamente validado para regular los niveles de colesterol en la sangre.</p>
            <h2>Beta-glucanos y Sistema Inmune</h2>
            <p>Son ricos en polisacáridos complejos llamados <strong>beta-glucanos</strong>. Estas moléculas actúan como inmunomoduladores, estimulando la actividad de los macrófagos y las células asesinas naturales (NK) del sistema inmunitario. También aportan vitaminas del complejo B (B1, B2, B5, B9) y minerales esenciales como fósforo, potasio, hierro y zinc.</p>
        `
    },
    3: {
        title: "Cinco errores comunes al cocinar hongo ostra por primera vez",
        tag: "Guía Gastronómica",
        image: "steak.png",
        content: `
            <p>El hongo ostra destaca por su textura firme, carnosa y un sutil perfil de sabor umami. Sin embargo, su preparación culinaria difiere de otros vegetales. Evita estos errores para garantizar un resultado perfecto:</p>
            <h2>1. Lavarlos bajo el grifo de agua</h2>
            <p>Las setas actúan como esponjas físicas. Si las sumerges en agua, la absorberán por completo, y al cocinarlas se ablandarán y quedarán gomosas en lugar de dorarse. Límpialas únicamente con un paño húmedo o pincel de cocina si tienen restos de sustrato.</p>
            <h2>2. Cortarlos con cuchillo fino</h2>
            <p>El hongo ostra posee fibras longitudinales. Es mucho mejor desmenuzarlos a mano en tiras siguiendo el sentido natural de sus láminas. Esto preserva la textura carnosa similar al pollo deshilachado.</p>
            <h2>3. Usar una sartén fría o baja temperatura</h2>
            <p>Para lograr la caramelización y textura crujiente de los bordes, necesitas sellar a fuego alto. Agrega las setas cuando la sartén esté muy caliente con un poco de aceite de oliva o mantequilla.</p>
            <h2>4. Moverlos constantemente</h2>
            <p>Coloca las tiras en la sartén y déjalas dorar sin tocarlas durante 2-3 minutos. Voltéalas una sola vez. Si las revuelves constantemente, liberarán agua y terminarán cocinándose al vapor.</p>
            <h2>5. Salar al principio</h2>
            <p>La sal extrae el agua celular por ósmosis. Agrega la sal y especias únicamente al final de la cocción, justo antes de retirar del fuego.</p>
        `
    },
    4: {
        title: "¿Cómo se produce un hongo sin fertilizantes químicos?",
        tag: "Bioseguridad Limpia",
        image: "substrate_bags.png",
        content: `
            <p>En la agricultura convencional, la dependencia de agroquímicos es severa. El cultivo de setas, en cambio, es un proceso biológico puro que prescinde por completo de pesticidas y fertilizantes sintéticos.</p>
            <h2>Digestión Enzimática vs Fertilización</h2>
            <p>Los hongos no absorben fertilizantes. Se alimentan fragmentando la celulosa y lignina del sustrato mediante un cóctel de enzimas naturales (lacasas y peroxidasas). La nutrición viene directamente de la materia orgánica del sustrato.</p>
            <h2>La Inmersión Alcalina</h2>
            <p>Para asegurar que solo el micelio del hongo crezca y no otros mohos competidores, el sustrato se desinfecta. En lugar de quemar gas para generar vapor, sumergimos la paja en agua fría con cal hidratada (<strong>Ca(OH)2</strong>) al 1% durante 16 horas.</p>
            <p>El pH sube bruscamente a 12, eliminando esporas competidoras de forma iónica. Al escurrir el sustrato y exponerlo al aire, la cal reacciona con el CO2 atmosférico, transformándose en carbonato de calcio inocuo y devolviendo el pH a un rango neutro de 7-8 ideal para el micelio.</p>
        `
    },
    5: {
        title: "¿Qué residuos agrícolas pueden transformarse en alimento?",
        tag: "Economía Circular",
        image: "circular_economy.png",
        content: `
            <p>La Provincia de Arauco desecha anualmente miles de toneladas de subproductos forestales y agrícolas que comúnmente se queman en los campos, provocando contaminación. Micelia valoriza estos recursos.</p>
            <h2>Sustratos Aptos</h2>
            <p>El hongo ostra puede cultivarse en una variedad extraordinaria de residuos de alto contenido de carbono:</p>
            <ul>
                <li><strong>Paja de Trigo y Avena</strong>: El sustrato principal, aporta excelente porosidad y estructura física.</li>
                <li><strong>Virutas y Aserrines de Maderas Blandas</strong>: Procedentres de aserraderos locales (evitando pinos con alto contenido de resinas inhibidoras).</li>
                <li><strong>Borra de Café</strong>: Un residuo urbano rico en nitrógeno que potencia el crecimiento y calibre de las setas.</li>
            </ul>
            <h2>Retorno a la Tierra</h2>
            <p>Una vez finalizadas las cosechas, el sustrato remanente (llamado "sustrato gastado de setas" o SMS) está parcialmente digerido por el hongo y enriquecido con proteína micelial. Esto lo convierte en un excelente abono orgánico recuperador de suelos o en alimento nutritivo para ganado, cerrando un ciclo de residuo cero.</p>
        `
    }
};

// ==========================================================================
// INICIALIZACIÓN
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
    // Referencias DOM
    const openCartBtn = document.getElementById("open-cart-btn");
    const closeCartBtn = document.getElementById("close-cart-btn");
    const cartSidebar = document.getElementById("cart-sidebar");
    const cartBackdrop = document.getElementById("cart-backdrop");
    const checkoutBtn = document.getElementById("checkout-btn");
    
    const checkoutModal = document.getElementById("checkout-modal");
    const checkoutForm = document.getElementById("checkout-form");
    
    const paymentModal = document.getElementById("payment-modal");
    const paymentForm = document.getElementById("payment-form");

    const loginNavBtn = document.getElementById("login-nav-btn");
    const profileNavContainer = document.getElementById("profile-nav-container");
    const loginForm = document.getElementById("login-form");

    // Verificar si ya hay sesión iniciada en localStorage
    const savedUser = localStorage.getItem("micelia_current_user");
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateUserUI();
        loadUserOrders();
    }

    // Eventos de Navegación
    loginNavBtn.addEventListener("click", () => {
        document.getElementById("login-modal").classList.add("open");
    });

    profileNavContainer.addEventListener("click", () => {
        openProfileModal();
    });

    // Abrir / Cerrar Carrito
    openCartBtn.addEventListener("click", () => {
        cartSidebar.classList.add("open");
        cartBackdrop.classList.add("open");
    });

    const closeCart = () => {
        cartSidebar.classList.remove("open");
        cartBackdrop.classList.remove("open");
    };

    closeCartBtn.addEventListener("click", closeCart);
    cartBackdrop.addEventListener("click", closeCart);

    // Añadir al Carrito
    const addBtns = document.querySelectorAll(".add-to-cart-btn");
    addBtns.forEach(btn => {
        btn.addEventListener("click", (e) => {
            const id = btn.getAttribute("data-id");
            const name = btn.getAttribute("data-name");
            const price = parseInt(btn.getAttribute("data-price"));
            
            addToCart(id, name, price);
            cartSidebar.classList.add("open");
            cartBackdrop.classList.add("open");
        });
    });

    // Checkout Form Submit -> Abrir Pago
    checkoutForm.addEventListener("submit", (e) => {
        e.preventDefault();
        checkoutModal.classList.remove("open");
        
        const total = calculateTotal();
        document.getElementById("payment-amount-text").textContent = `$${total.toLocaleString("es-CL")} CLP`;
        
        paymentModal.classList.add("open");
    });

    // Envío del Pago -> Registrar Pedido en Cortex
    paymentForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        paymentForm.style.display = "none";
        const processing = document.getElementById("payment-processing");
        processing.style.display = "block";

        const name = document.getElementById("checkout-name").value;
        const email = document.getElementById("checkout-email").value;
        const address = document.getElementById("checkout-address").value;
        
        const itemsList = cart.map(item => `${item.name} x${item.quantity}`).join(", ");
        const total = calculateTotal();

        const orderPayload = {
            customer_name: name,
            customer_email: email,
            items: `${itemsList} (Despacho: ${address})`,
            total_amount: total
        };

        // Simular validación bancaria
        setTimeout(async () => {
            try {
                const response = await fetch("/api/orders", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(orderPayload)
                });
                
                const resData = await response.json();
                
                processing.style.display = "none";
                const successDiv = document.getElementById("payment-success");
                successDiv.style.display = "block";
                
                document.getElementById("sig-hash-text").textContent = resData.signature || "sha256:error_firma";
                
                // Si el usuario está autenticado, refrescar sus órdenes
                if (currentUser) {
                    await loadUserOrders();
                }
                
            } catch (err) {
                console.error("Error al enviar pedido a Cortex:", err);
                const fakeSig = "sha256:local_" + Math.random().toString(36).substring(2, 15);
                processing.style.display = "none";
                const successDiv = document.getElementById("payment-success");
                successDiv.style.display = "block";
                document.getElementById("sig-hash-text").textContent = fakeSig + " (Cortex Offline - Firma Local)";
            }
        }, 2000);
    });

    // Abrir Modal de Checkout
    checkoutBtn.addEventListener("click", () => {
        closeCart();
        // Si hay usuario logueado, pre-llenar formulario
        if (currentUser) {
            document.getElementById("checkout-name").value = currentUser.name;
            document.getElementById("checkout-email").value = currentUser.email;
        }
        checkoutModal.classList.add("open");
    });

    // Formulario de Inicio de Sesión
    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = document.getElementById("login-email").value;
        const name = email.split("@")[0]; // Nombre simplificado
        loginUser(email, name, "Email");
    });

    // Conectar WebSocket para recibir actualizaciones de despacho en tiempo real
    connectClientWebSocket();

    // Inicializar pestaña por defecto de estilos de vida
    switchLifestyle('deportistas');
});

// ==========================================================================
// PREDICCIÓN DE APRENDIZAJE AUTOMÁTICO (ML CLIENTE)
// ==========================================================================
function runMLPrediction() {
    const mlText = document.getElementById("ml-prediction-text");
    const mlActionContainer = document.getElementById("ml-action-container");

    if (!currentUser) {
        mlText.textContent = "Inicia sesión para entrenar el modelo de predicción de consumo.";
        mlActionContainer.style.display = "none";
        return;
    }

    // Filtrar órdenes de este usuario
    const myOrders = userOrders.filter(o => o.customer_email.toLowerCase() === currentUser.email.toLowerCase());

    if (myOrders.length === 0) {
        mlText.textContent = "No hay compras registradas para este perfil. Compra una caja para iniciar el entrenamiento del modelo de consumo.";
        mlActionContainer.style.display = "none";
        return;
    }

    // Algoritmo ML de Consumo Micológico:
    // 1. Cada 500g de setas ostra frescas rinde aproximadamente 7 días para un consumidor moderado.
    // 2. Cada 1kg rinde 14 días.
    // 3. Suscripción HORECA rinde 7 días por entrega semanal.
    let totalEstimatedDays = 0;
    
    myOrders.forEach(order => {
        const desc = order.items.toLowerCase();
        if (desc.includes("500g")) {
            totalEstimatedDays += 7;
        } else if (desc.includes("1kg")) {
            totalEstimatedDays += 14;
        } else if (desc.includes("horeca")) {
            totalEstimatedDays += 28; // Duración mensual de la suscripción
        } else {
            totalEstimatedDays += 7; // Por defecto
        }
    });

    // Ajustar por frecuencia de compra
    const lastOrder = myOrders[0]; // Orden más reciente
    const lastOrderDate = new Date(lastOrder.timestamp || new Date());
    
    // Predicción de próxima compra (fecha en la que se agotará)
    const nextOrderDate = new Date(lastOrderDate.getTime());
    nextOrderDate.setDate(nextOrderDate.getDate() + Math.max(7, Math.round(totalEstimatedDays / myOrders.length)));

    const today = new Date();
    const diffTime = nextOrderDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateStr = nextOrderDate.toLocaleDateString('es-CL', options);

    if (diffDays <= 0) {
        mlText.innerHTML = `<strong>Predicción:</strong> Estimamos que tus setas ostra se agotaron hace ${Math.abs(diffDays)} días.<br>Te sugerimos reabastecer tu despensa con una nueva caja para mantener una alimentación balanceada.`;
    } else {
        mlText.innerHTML = `<strong>Predicción Cortex ML:</strong> Basado en tu ritmo histórico, tu caja actual de setas se agotará en <strong>${diffDays} días</strong>.<br>Te sugerimos programar tu próximo despacho para el: <strong>${dateStr}</strong>.`;
    }
    
    mlActionContainer.style.display = "block";
}

function orderPredictedItem() {
    // Busca el último item que compró para sugerir el mismo
    const myOrders = userOrders.filter(o => o.customer_email.toLowerCase() === currentUser.email.toLowerCase());
    let name = "Hongo Ostra Fresco 500g";
    let price = 4500;
    let id = "1";

    if (myOrders.length > 0) {
        const last = myOrders[0].items.toLowerCase();
        if (last.includes("1kg")) {
            name = "Hongo Ostra Fresco 1kg";
            price = 8000;
            id = "2";
        } else if (last.includes("horeca")) {
            name = "Suscripción HORECA";
            price = 25000;
            id = "3";
        }
    }

    closeProfileModal();
    addToCart(id, name, price);
    document.getElementById("cart-sidebar").classList.add("open");
    document.getElementById("cart-backdrop").classList.add("open");
}

// ==========================================================================
// CONEXIÓN WEBSOCKET Y SEGUIMIENTO EN TIEMPO REAL
// ==========================================================================
function connectClientWebSocket() {
    const wsProto = location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = location.host ? `${wsProto}//${location.host}/ws` : "ws://127.0.0.1:8080/ws";
    
    socket = new WebSocket(wsUrl);

    socket.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            
            // Si el WebSocket notifica un cambio de estado en una orden
            if (data.type === "order_status_update") {
                console.log(`WebSocket: Actualización de pedido #${data.order_id} recibida: ${data.new_status}`);
                // Buscar orden local y actualizar
                const order = userOrders.find(o => o.id === data.order_id);
                if (order) {
                    order.status = data.new_status;
                    order.signature = data.signature;
                    // Re-renderizar si el perfil está abierto
                    if (document.getElementById("profile-modal").classList.contains("open")) {
                        renderProfileOrders();
                    }
                }
            } else if (data.type === "order") {
                // Alerta de nueva orden de este usuario (completado por el endpoint POST)
                if (currentUser && data.customer_name.toLowerCase().includes(currentUser.name.toLowerCase())) {
                    loadUserOrders();
                }
            } else if (data.cell_id) {
                // Si es actualización de sensor, actualizar el panel de estudio si está abierto
                updateLiveTelemetryStudy(data.temp_raw / 216000, data.hum_raw / 216000, data.co2_raw / 216000);
            }
        } catch (e) {
            console.error("Error procesando mensaje WebSocket en cliente:", e);
        }
    };

    socket.onclose = () => {
        setTimeout(connectClientWebSocket, 5000);
    };
}

// ==========================================================================
// AUXILIARES DE LOGIN Y MODALES
// ==========================================================================

function loginSocial(platform) {
    // Simular login con popup
    alert(`Conectando con pasarela de autenticación de ${platform}...`);
    const name = platform === "Google" ? "María González (Google)" : "Juan Pérez (Facebook)";
    const email = platform === "Google" ? "maria.g@gmail.com" : "juan.fb@hotmail.com";
    loginUser(email, name, platform);
}

function loginUser(email, name, provider) {
    currentUser = { name, email, provider };
    localStorage.setItem("micelia_current_user", JSON.stringify(currentUser));
    
    updateUserUI();
    closeLoginModal();
    loadUserOrders();
}

function logoutUser() {
    currentUser = null;
    userOrders = [];
    localStorage.removeItem("micelia_current_user");
    
    document.getElementById("login-nav-btn").style.display = "block";
    document.getElementById("profile-nav-container").style.display = "none";
    
    closeProfileModal();
}

function updateUserUI() {
    document.getElementById("login-nav-btn").style.display = "none";
    const profileCont = document.getElementById("profile-nav-container");
    profileCont.style.display = "flex";
    
    // Iniciales o primer nombre
    const shortName = currentUser.name.split(" ")[0];
    document.getElementById("profile-name-text").textContent = shortName;
}

async function loadUserOrders() {
    try {
        const response = await fetch("/api/orders");
        const allOrders = await response.json();
        // Filtrar solo las del cliente autenticado
        userOrders = allOrders.filter(o => o.customer_email.toLowerCase() === currentUser.email.toLowerCase());
        
        if (document.getElementById("profile-modal").classList.contains("open")) {
            renderProfileOrders();
            runMLPrediction();
        }
    } catch (e) {
        console.error("Error al cargar pedidos del usuario:", e);
    }
}

function renderProfileOrders() {
    const list = document.getElementById("profile-orders-list");
    if (userOrders.length === 0) {
        list.innerHTML = `<p style="color: var(--text-muted); font-size: 0.95rem; text-align: center; margin: 2rem 0;">Aún no has realizado ningún pedido.</p>`;
        return;
    }

    let html = "";
    userOrders.forEach(order => {
        // Calcular porcentaje de barra según el estado
        let progressPercent = 0;
        let step1 = "", step2 = "", step3 = "", step4 = "";

        const status = order.status || "Procesando";

        if (status === "Procesando") {
            progressPercent = 5;
            step1 = "active";
        } else if (status === "Cosechando") {
            progressPercent = 33;
            step1 = "active";
            step2 = "active";
        } else if (status === "En Reparto") {
            progressPercent = 66;
            step1 = "active";
            step2 = "active";
            step3 = "active";
        } else if (status === "Entregado") {
            progressPercent = 100;
            step1 = "active";
            step2 = "active";
            step3 = "active";
            step4 = "active";
        }

        html += `
            <div class="profile-order-card" style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem;">
                <div style="display: flex; justify-content: space-between; font-size: 0.9rem; color: var(--text-muted);">
                    <span>Pedido #${order.id} • ${new Date(order.timestamp).toLocaleDateString('es-CL')}</span>
                    <span style="color: var(--accent-gold); font-weight: 600;">$${order.total_amount.toLocaleString("es-CL")} CLP</span>
                </div>
                <div style="font-weight: 500; font-size: 0.95rem;">${order.items.split(" (Despacho:")[0]}</div>
                
                <!-- Línea de seguimiento / Timeline -->
                <div class="delivery-timeline-container" style="position: relative; margin-top: 1rem; padding-bottom: 0.5rem;">
                    <div style="height: 4px; background: rgba(255,255,255,0.08); border-radius: 2px; position: absolute; top: 15px; left: 20px; right: 20px; z-index: 1;">
                        <div style="height: 100%; width: ${progressPercent}%; background: var(--accent-gold); border-radius: 2px; transition: width 0.6s ease;"></div>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; position: relative; z-index: 2;">
                        <div class="timeline-step ${step1}" style="text-align: center; font-size: 0.75rem; color: var(--text-muted);">
                            <span class="material-symbols-outlined" style="font-size: 1.4rem; padding: 6px; border-radius: 50%; background: #0c120e; border: 2px solid rgba(255,255,255,0.1); display: block; margin: 0 auto 0.5rem auto; width: 34px; height: 34px;">payments</span>
                            <span>Procesado</span>
                        </div>
                        <div class="timeline-step ${step2}" style="text-align: center; font-size: 0.75rem; color: var(--text-muted);">
                            <span class="material-symbols-outlined" style="font-size: 1.4rem; padding: 6px; border-radius: 50%; background: #0c120e; border: 2px solid rgba(255,255,255,0.1); display: block; margin: 0 auto 0.5rem auto; width: 34px; height: 34px;">agriculture</span>
                            <span>Cosechando</span>
                        </div>
                        <div class="timeline-step ${step3}" style="text-align: center; font-size: 0.75rem; color: var(--text-muted);">
                            <span class="material-symbols-outlined" style="font-size: 1.4rem; padding: 6px; border-radius: 50%; background: #0c120e; border: 2px solid rgba(255,255,255,0.1); display: block; margin: 0 auto 0.5rem auto; width: 34px; height: 34px;">local_shipping</span>
                            <span>En Reparto</span>
                        </div>
                        <div class="timeline-step ${step4}" style="text-align: center; font-size: 0.75rem; color: var(--text-muted);">
                            <span class="material-symbols-outlined" style="font-size: 1.4rem; padding: 6px; border-radius: 50%; background: #0c120e; border: 2px solid rgba(255,255,255,0.1); display: block; margin: 0 auto 0.5rem auto; width: 34px; height: 34px;">check_circle</span>
                            <span>Entregado</span>
                        </div>
                    </div>
                </div>

                <!-- Firma inmutable -->
                <div style="font-size: 0.75rem; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.03); border-radius: 6px; padding: 0.5rem; color: var(--text-muted); font-family: monospace; word-break: break-all; margin-top: 0.5rem;">
                    <span style="color: var(--accent-gold);">TruthSync Signature:</span> ${order.signature}
                </div>
            </div>
        `;
    });

    list.innerHTML = html;
    
    // Inyectar clase active en CSS dinámico
    const styleElem = document.createElement("style");
    styleElem.innerHTML = `
        .timeline-step.active span {
            color: #0c120e !important;
            background: var(--accent-gold) !important;
            border-color: var(--accent-gold) !important;
            box-shadow: 0 0 10px var(--accent-gold-glow);
        }
        .timeline-step.active span + span, .timeline-step.active span ~ span {
            color: var(--accent-gold) !important;
            font-weight: 600;
        }
    `;
    document.head.appendChild(styleElem);
}

// ==========================================================================
// CONTROL DE MODALES EN PORTAL
// ==========================================================================

function openProfileModal() {
    document.getElementById("profile-modal").classList.add("open");
    
    // Cargar datos
    document.getElementById("profile-user-name").textContent = currentUser.name;
    document.getElementById("profile-user-email").textContent = currentUser.email;
    
    renderProfileOrders();
    runMLPrediction();
}

function closeProfileModal() {
    document.getElementById("profile-modal").classList.remove("open");
}

function closeLoginModal() {
    document.getElementById("login-modal").classList.remove("open");
}

function openArticleModal(id) {
    const article = ARTICLES[id];
    if (!article) return;
    
    const container = document.getElementById("article-content");
    container.innerHTML = `
        <div class="article-content-body">
            <div class="article-modal-image-wrapper" style="width: 100%; height: 280px; overflow: hidden; border-radius: 16px; margin-bottom: 1.5rem;">
                <img src="${article.image}" style="width: 100%; height: 100%; object-fit: cover;" alt="${article.title}">
            </div>
            <span class="metadata">${article.tag} • Camino del Micelio</span>
            <h1>${article.title}</h1>
            ${article.content}
        </div>
    `;
    
    document.getElementById("article-modal").classList.add("open");
}

function closeArticleModal() {
    isTelemetryStudyOpen = false; // Asegurar apagar bandera si era telemetría
    document.getElementById("article-modal").classList.remove("open");
}

// ==========================================================================
// ESTUDIO CIENTÍFICO Y TELEMETRÍA EN VIVO (SENSORES CLIENTE)
// ==========================================================================
let telemetryHistory = [];
let isTelemetryStudyOpen = false;

function openTelemetryStudyModal() {
    isTelemetryStudyOpen = true;
    
    const container = document.getElementById("article-content");
    container.innerHTML = `
        <div class="article-content-body">
            <span class="metadata">Estudio Científico • Camino del Micelio</span>
            <h1>Estudio de Telemetría y Sensorización Micológica</h1>
            <p style="color: var(--text-muted); font-size: 0.95rem; margin-bottom: 1.5rem;">Monitorea y analiza las lecturas en tiempo real de temperatura, humedad y CO₂ de nuestras cámaras de fructificación activas bajo el Protocolo Yatra S60 de TruthSync.</p>
            
            <div class="telemetry-study-dashboard" style="display: flex; flex-direction: column; gap: 1.5rem; margin-top: 1.5rem;">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem;">
                    <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 1.25rem; border-radius: 12px; text-align: center;">
                        <span style="font-size: 0.8rem; color: var(--text-muted); display: block; margin-bottom: 0.5rem;">Temperatura Celular</span>
                        <strong style="font-size: 1.6rem; color: var(--accent-gold);" id="telemetry-temp">19.5 °C</strong>
                    </div>
                    <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 1.25rem; border-radius: 12px; text-align: center;">
                        <span style="font-size: 0.8rem; color: var(--text-muted); display: block; margin-bottom: 0.5rem;">Humedad Relativa</span>
                        <strong style="font-size: 1.6rem; color: var(--accent-green-light);" id="telemetry-hum">92.1 %</strong>
                    </div>
                    <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 1.25rem; border-radius: 12px; text-align: center;">
                        <span style="font-size: 0.8rem; color: var(--text-muted); display: block; margin-bottom: 0.5rem;">CO₂ Ambiental</span>
                        <strong style="font-size: 1.6rem; color: var(--text-primary);" id="telemetry-co2">780 ppm</strong>
                    </div>
                </div>
                
                <div style="background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.05); padding: 1.5rem; border-radius: 16px;">
                    <h4 style="margin: 0 0 1rem 0; font-size: 0.95rem; color: var(--accent-gold); display: flex; align-items: center; gap: 0.5rem; font-family: var(--font-display);">
                        <span class="material-symbols-outlined" style="font-size: 1.2rem;">timeline</span>
                        Gráfico de Fluctuación de Humedad (%) y Temperatura (°C)
                    </h4>
                    <div id="telemetry-live-chart" style="width: 100%; height: 180px; display: flex; align-items: flex-end; justify-content: space-between; border-left: 2px solid rgba(255,255,255,0.08); border-bottom: 2px solid rgba(255,255,255,0.08); padding-left: 10px; position: relative;">
                        <!-- Puntos de gráfico cargados dinámicamente -->
                        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: var(--text-muted); font-size: 0.85rem;" id="chart-waiting-msg">
                            Esperando lecturas de sensores en tiempo real...
                        </div>
                    </div>
                    <div style="display: flex; justify-content: center; gap: 2rem; font-size: 0.8rem; margin-top: 1rem;">
                        <span style="display: flex; align-items: center; gap: 0.5rem;"><span style="width: 10px; height: 10px; background: rgba(90,164,105,0.3); border-radius: 2px;"></span>Humedad (%)</span>
                        <span style="display: flex; align-items: center; gap: 0.5rem;"><span style="width: 8px; height: 8px; background: var(--accent-gold); border-radius: 50%;"></span>Temperatura (°C)</span>
                    </div>
                </div>
                
                <p style="font-size: 0.95rem; line-height: 1.6; color: var(--text-muted); margin: 0;">
                    <strong>Explicación de Parámetros:</strong> El cultivo de <em>Pleurotus ostreatus</em> requiere alta humedad relativa (85% a 95%) durante su fructificación para emular la neblina del bosque nativo. El CO₂ debe ser extraído activamente (idealmente bajo 900 ppm) para asegurar la oxigenación celular, evitando que el cuerpo fructífero crezca alargado y fibroso. Las transiciones críticas de humedad y CO₂ son firmadas de forma inmutable en TruthSync para auditorías de inocuidad.
                </p>
            </div>
        </div>
    `;
    
    document.getElementById("article-modal").classList.add("open");
    
    // Iniciar con datos de simulación si la conexión no ha enviado nada aún
    if (telemetryHistory.length === 0) {
        for (let i = 0; i < 15; i++) {
            telemetryHistory.push({
                temp: 18 + Math.random() * 3,
                hum: 88 + Math.random() * 6,
                co2: 700 + Math.random() * 200
            });
        }
    }
    renderTelemetryChart();
}

function updateLiveTelemetryStudy(temp, hum, co2) {
    if (!isTelemetryStudyOpen) return;

    // Actualizar valores en pantalla
    const tempEl = document.getElementById("telemetry-temp");
    const humEl = document.getElementById("telemetry-hum");
    const co2El = document.getElementById("telemetry-co2");

    if (tempEl) tempEl.textContent = `${temp.toFixed(2)} °C`;
    if (humEl) humEl.textContent = `${hum.toFixed(2)} %`;
    if (co2El) co2El.textContent = `${Math.round(co2)} ppm`;

    // Ocultar mensaje de espera
    const waiting = document.getElementById("chart-waiting-msg");
    if (waiting) waiting.style.display = "none";

    // Registrar en histórico
    telemetryHistory.push({ temp, hum, co2 });
    if (telemetryHistory.length > 20) {
        telemetryHistory.shift();
    }

    renderTelemetryChart();
}

function renderTelemetryChart() {
    const chart = document.getElementById("telemetry-live-chart");
    if (!chart) return;

    let html = "";
    telemetryHistory.forEach((pt) => {
        // Graficar humedad como barra de fondo y temperatura como punto/línea
        const humHeight = (pt.hum / 100) * 85; 
        const tempHeight = (pt.temp / 30) * 85; 
        
        html += `
            <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; height: 100%; position: relative;">
                <!-- Barra Humedad -->
                <div style="width: 14px; height: ${humHeight}%; background: rgba(90, 164, 105, 0.2); border-radius: 4px 4px 0 0; position: absolute; bottom: 0; z-index: 1;"></div>
                
                <!-- Nodo Temperatura -->
                <div style="width: 8px; height: 8px; background: var(--accent-gold); border-radius: 50%; position: absolute; bottom: ${tempHeight}%; z-index: 2; box-shadow: 0 0 8px var(--accent-gold);"></div>
            </div>
        `;
    });
    chart.innerHTML = html;
}

function closeCheckoutModal() {
    document.getElementById("checkout-modal").classList.remove("open");
}

function abortPayment() {
    document.getElementById("payment-modal").classList.remove("open");
    document.getElementById("payment-form").style.display = "block";
    document.getElementById("payment-processing").style.display = "none";
    document.getElementById("payment-success").style.display = "none";
}

function finishOrder() {
    cart = [];
    renderCart();
    document.getElementById("payment-modal").classList.remove("open");
    document.getElementById("payment-form").style.display = "block";
    document.getElementById("payment-processing").style.display = "none";
    document.getElementById("payment-success").style.display = "none";
}

// Auxiliares del Carrito
function addToCart(id, name, price) {
    const existing = cart.find(item => item.id === id);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ id, name, price, quantity: 1 });
    }
    renderCart();
}

function updateQuantity(id, delta) {
    const item = cart.find(item => item.id === id);
    if (item) {
        item.quantity += delta;
        if (item.quantity <= 0) {
            cart = cart.filter(i => i.id !== id);
        }
    }
    renderCart();
}

function calculateTotal() {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

function renderCart() {
    const container = document.getElementById("cart-items-container");
    const countBadge = document.querySelector(".cart-count");
    const totalPriceText = document.getElementById("cart-total-price");
    const checkoutBtn = document.getElementById("checkout-btn");
    
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    countBadge.textContent = totalItems;
    
    if (cart.length === 0) {
        container.innerHTML = `<div class="empty-cart-message">El carrito está vacío.</div>`;
        totalPriceText.textContent = "$0 CLP";
        checkoutBtn.disabled = true;
        return;
    }
    
    checkoutBtn.disabled = false;
    let html = "";
    
    cart.forEach(item => {
        html += `
            <div class="cart-item">
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p>$${(item.price * item.quantity).toLocaleString("es-CL")} CLP</p>
                </div>
                <div class="cart-item-actions">
                    <button onclick="updateQuantity('${item.id}', -1)">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="updateQuantity('${item.id}', 1)">+</button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    const total = calculateTotal();
    totalPriceText.textContent = `$${total.toLocaleString("es-CL")} CLP`;
}

// ==========================================================================
// SECCIÓN INTERACTIVA: ESTILOS DE VIDA
// ==========================================================================
const LIFESTYLES = {
    deportistas: {
        title: "Nutrición de Alto Rendimiento y Recuperación",
        desc: "Las setas ostra aportan hasta un 30% de proteínas puras en base seca, conteniendo todos los aminoácidos esenciales necesarios para la reparación de tejido muscular sin aportar grasas ni colesterol. Además, son ricas en potasio (previene calambres) y beta-glucanos que mitigan la inflamación posentrenamiento.",
        tip: "Saltea 150g de hongos ostra a fuego alto con espinaca y ajo. Consúmelos junto a tu carbohidrato favorito dentro de la ventana de 45 minutos posentrenamiento para una síntesis proteica óptima.",
        product: "Suscripción HORECA / Deportista (Entregas Semanales)",
        price: "$25.000 / mes",
        prodId: "3",
        prodName: "Suscripción HORECA",
        prodPrice: 25000,
        image: "athlete_mushrooms.png"
    },
    "tercera-edad": {
        title: "Bienestar Digestivo, Cardiovascular y Vitalidad",
        desc: "El hongo ostra posee una textura blanda idónea para adultos mayores, facilitando la masticación en comparación con carnes duras. Son ricos en lovastatina natural que regula el colesterol, bajísimos en sodio para el cuidado de la presión arterial, y contienen complejo B para el mantenimiento del tono celular.",
        tip: "Licúa hongos ostra previamente salteados con papas nativas cocidas, un toque de leche descremada y nuez moscada para una crema reconfortante, nutritiva y de facilísima digestión.",
        product: "Caja de Hongo Ostra Fresco 500g",
        price: "$4.500",
        prodId: "1",
        prodName: "Hongo Ostra Fresco 500g",
        prodPrice: 4500,
        whatsappLink: true,
        image: "soup_mushrooms.png"
    },
    naturalistas: {
        title: "Consumo Consciente y Ecología Circular",
        desc: "Micelia cultiva sin pesticidas ni fertilizantes químicos sintéticos. Reutilizamos subproductos de la paja de trigo y aserrín local, y envasamos en recipientes compostables biodegradables de celulosa agrícola. Apoyas de forma directa a la soberanía alimentaria de la Provincia de Arauco.",
        tip: "No deseches la caja de cartón ni las virutas de madera; incorpóralas directamente a tu compostera doméstica. Se degradarán en un abono excelente rico en nitrógeno en pocas semanas.",
        product: "Caja de Hongo Ostra Fresco 1kg (Cero Plástico)",
        price: "$8.000",
        prodId: "2",
        prodName: "Hongo Ostra Fresco 1kg",
        prodPrice: 8000,
        image: "eco_packaging.png"
    },
    gourmet: {
        title: "Experiencia Gourmet y Texturas Únicas",
        desc: "Ideal para chefs y entusiastas de la gastronomía. El hongo ostra posee fibras longitudinales perfectas para imitar cortes de carne deshilachada. Al caramelizarse con calor directo, desarrolla notas de sabor umami complejas que realzan risottos, salsas y pastas.",
        tip: "Deshilacha las setas a mano en tiras delgadas. Ponlas en una sartén precalentada muy caliente con aceite de oliva. No las muevas por 2 minutos para sellar los bordes, voltea una vez, agrega mantequilla y sal al final.",
        product: "Caja de Hongo Ostra Fresco 1kg (Pack de Chef)",
        price: "$8.000",
        prodId: "2",
        prodName: "Hongo Ostra Fresco 1kg",
        prodPrice: 8000,
        image: "cooking_mushrooms.png"
    },
    familias: {
        title: "Ciencia en Casa y Aprendizaje STEM",
        desc: "Fomenta la curiosidad y la alimentación saludable en los niños. Una oportunidad didáctica para ver el crecimiento exponencial de los hongos (¡doblan su tamaño cada 24 horas!) y enseñarles sobre la importancia biológica del Reino Fungi en la descomposición forestal.",
        tip: "Coloca el kit en un rincón ventilado de la cocina lejos de la luz solar directa. Deja que tus hijos pulvericen agua dos veces al día y lleven un registro del crecimiento diario para su bitácora escolar.",
        product: "Kit de Autocultivo Educativo Micelia",
        price: "$12.000",
        prodId: "4",
        prodName: "Kit de Autocultivo Educativo",
        prodPrice: 12000,
        image: "family_harvest.png"
    }
};

function switchLifestyle(id) {
    const data = LIFESTYLES[id];
    if (!data) return;

    // Cambiar clase active en los botones
    document.querySelectorAll(".lifestyle-tab").forEach(tab => {
        if (tab.getAttribute("data-tab") === id) {
            tab.classList.add("active");
        } else {
            tab.classList.remove("active");
        }
    });

    const card = document.getElementById("lifestyle-content-card");
    
    let btnHtml = "";
    if (data.whatsappLink) {
        btnHtml = `
            <a href="https://wa.me/56912345678?text=Hola%20Micelia,%20quisiera%20pedir%20el%20Pack%20Adulto%20Mayor%20de%20setas%20de%20500g" target="_blank" class="btn btn-primary" style="display: inline-flex; align-items: center; gap: 0.5rem; background: #25d366; border-color: #25d366; text-decoration: none;">
                <span class="material-symbols-outlined">chat</span>
                Pedir por WhatsApp (Fácil)
            </a>
        `;
    } else {
        btnHtml = `
            <button class="btn btn-primary" onclick="addToCart('${data.prodId}', '${data.prodName}', ${data.prodPrice})">
                Añadir al Carrito
            </button>
        `;
    }

    card.innerHTML = `
        <div style="display: flex; gap: 2.5rem; flex-wrap: wrap;">
            <!-- Columna Izquierda: Texto e Información -->
            <div style="flex: 1.2; min-width: 280px; display: flex; flex-direction: column; gap: 1.5rem;">
                <div>
                    <h3 style="font-family: var(--font-display); font-size: 1.6rem; color: var(--accent-gold); margin-bottom: 0.85rem;">${data.title}</h3>
                    <p style="color: var(--text-primary); font-size: 1.05rem; line-height: 1.7; margin: 0;">${data.desc}</p>
                </div>
                
                <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.04); border-radius: 12px; padding: 1.5rem; display: flex; flex-direction: column; gap: 0.5rem;">
                    <h4 style="color: var(--accent-gold); font-size: 0.95rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; display: flex; align-items: center; gap: 0.5rem; margin: 0;">
                        <span class="material-symbols-outlined" style="font-size: 1.2rem;">tips_and_updates</span>
                        Consejo de Preparación / Cuidado
                    </h4>
                    <p style="color: var(--text-muted); font-size: 0.95rem; line-height: 1.6; margin: 0;">${data.tip}</p>
                </div>
                
                <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1.5rem; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 1.5rem; margin-top: auto;">
                    <div>
                        <span style="color: var(--text-muted); font-size: 0.85rem; display: block;">Producto Recomendado:</span>
                        <strong style="font-size: 1.1rem; color: var(--text-primary);">${data.product}</strong>
                        <span style="color: var(--accent-gold); font-weight: 600; margin-left: 0.5rem;">(${data.price})</span>
                    </div>
                    ${btnHtml}
                </div>
            </div>
            
            <!-- Columna Derecha: Imagen Temática Destacada -->
            <div style="flex: 0.8; min-width: 280px; display: flex; align-items: center; justify-content: center;">
                <div style="width: 100%; max-width: 360px; height: 260px; overflow: hidden; border-radius: 20px; border: 1px solid rgba(255,255,255,0.08); box-shadow: 0 15px 30px rgba(0,0,0,0.5), 0 0 20px rgba(195,181,159,0.05);">
                    <img src="${data.image}" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease;" alt="${data.title}" onmouseover="this.style.transform='scale(1.03)'" onmouseout="this.style.transform='scale(1)'">
                </div>
            </div>
        </div>
    `;
}

// ==========================================================================
// RECIPES SLIDER / CAROUSEL
// ==========================================================================
let currentSlide = 0;

function showSlide(index) {
    const slides = document.querySelectorAll(".slide");
    const dots = document.querySelectorAll(".slider-dot");
    
    if (slides.length === 0) return;

    if (index >= slides.length) currentSlide = 0;
    else if (index < 0) currentSlide = slides.length - 1;
    else currentSlide = index;

    slides.forEach((slide, i) => {
        if (i === currentSlide) {
            slide.classList.add("active");
            if (dots[i]) dots[i].classList.add("active");
        } else {
            slide.classList.remove("active");
            if (dots[i]) dots[i].classList.remove("active");
        }
    });
}

function moveSlider(delta) {
    showSlide(currentSlide + delta);
}

function setSlide(index) {
    showSlide(index);
}

// Auto-rotar cada 8 segundos
let sliderInterval = setInterval(() => {
    moveSlider(1);
}, 8000);

function resetSliderInterval() {
    clearInterval(sliderInterval);
    sliderInterval = setInterval(() => {
        moveSlider(1);
    }, 8000);
}

// Configurar escuchadores al interactuar para detener la rotación molesta
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".slider-arrow, .slider-dot").forEach(el => {
        el.addEventListener("click", resetSliderInterval);
    });
});


