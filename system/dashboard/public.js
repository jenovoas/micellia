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
    // Inicializar Fondo 3D Mycelium
    initMycelium3D();

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
    if (loginNavBtn) {
        loginNavBtn.addEventListener("click", () => {
            const modal = document.getElementById("login-modal");
            if (modal) modal.classList.add("open");
        });
    }

    if (profileNavContainer) {
        profileNavContainer.addEventListener("click", () => {
            if (currentUser && currentUser.role === "operator") {
                window.location.href = "admin.html";
            } else {
                openProfileModal();
            }
        });
    }

    // Abrir / Cerrar Carrito
    if (openCartBtn) {
        openCartBtn.addEventListener("click", () => {
            if (cartSidebar) cartSidebar.classList.add("open");
            if (cartBackdrop) cartBackdrop.classList.add("open");
        });
    }

    const closeCart = () => {
        if (cartSidebar) cartSidebar.classList.remove("open");
        if (cartBackdrop) cartBackdrop.classList.remove("open");
    };

    if (closeCartBtn) closeCartBtn.addEventListener("click", closeCart);
    if (cartBackdrop) cartBackdrop.addEventListener("click", closeCart);

    // Añadir al Carrito
    const addBtns = document.querySelectorAll(".add-to-cart-btn");
    addBtns.forEach(btn => {
        btn.addEventListener("click", (e) => {
            const id = btn.getAttribute("data-id");
            const name = btn.getAttribute("data-name");
            const price = parseInt(btn.getAttribute("data-price"));
            
            addToCart(id, name, price);
            if (cartSidebar) cartSidebar.classList.add("open");
            if (cartBackdrop) cartBackdrop.classList.add("open");
        });
    });

    // Checkout Form Submit -> Abrir Pago
    if (checkoutForm) {
        checkoutForm.addEventListener("submit", (e) => {
            e.preventDefault();
            if (checkoutModal) checkoutModal.classList.remove("open");
            
            const total = calculateTotal();
            const amtText = document.getElementById("payment-amount-text");
            if (amtText) amtText.textContent = `$${total.toLocaleString("es-CL")} CLP`;
            
            if (paymentModal) paymentModal.classList.add("open");
        });
    }

    // Envío del Pago -> Registrar Pedido en Cortex
    if (paymentForm) {
        paymentForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            paymentForm.style.display = "none";
            const processing = document.getElementById("payment-processing");
            if (processing) processing.style.display = "block";
    
            const nameInput = document.getElementById("checkout-name");
            const emailInput = document.getElementById("checkout-email");
            const addressInput = document.getElementById("checkout-address");
            
            const name = nameInput ? nameInput.value : "";
            const email = emailInput ? emailInput.value : "";
            const address = addressInput ? addressInput.value : "";
            
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
                    
                    if (processing) processing.style.display = "none";
                    const successDiv = document.getElementById("payment-success");
                    if (successDiv) successDiv.style.display = "block";
                    
                    const hashText = document.getElementById("sig-hash-text");
                    if (hashText) hashText.textContent = resData.signature || "sha256:error_firma";
                    
                    // Si el usuario está autenticado, refrescar sus órdenes
                    if (currentUser) {
                        await loadUserOrders();
                    }
                    
                } catch (err) {
                    console.error("Error al enviar pedido a Cortex:", err);
                    const fakeSig = "sha256:local_" + Math.random().toString(36).substring(2, 15);
                    if (processing) processing.style.display = "none";
                    const successDiv = document.getElementById("payment-success");
                    if (successDiv) successDiv.style.display = "block";
                    const hashText = document.getElementById("sig-hash-text");
                    if (hashText) hashText.textContent = fakeSig + " (Cortex Offline - Firma Local)";
                }
            }, 2000);
        });
    }

    // Abrir Modal de Checkout
    if (checkoutBtn) {
        checkoutBtn.addEventListener("click", () => {
            closeCart();
            // Si hay usuario logueado, pre-llenar formulario
            if (currentUser) {
                const nameInput = document.getElementById("checkout-name");
                const emailInput = document.getElementById("checkout-email");
                if (nameInput) nameInput.value = currentUser.name;
                if (emailInput) emailInput.value = currentUser.email;
            }
            if (checkoutModal) checkoutModal.classList.add("open");
        });
    }

    // Formulario de Inicio de Sesión
    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const emailInput = document.getElementById("login-email");
            if (emailInput) {
                const email = emailInput.value;
                const name = email.split("@")[0]; // Nombre simplificado
                loginUser(email, name, "Email");
            }
        });
    }

    // Conectar WebSocket para recibir actualizaciones de despacho en tiempo real
    connectClientWebSocket();

    // Inicializar pestaña por defecto de estilos de vida si existe la sección
    if (document.getElementById("lifestyle-content-card")) {
        switchLifestyle('deportistas');
    }
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
    const role = email.toLowerCase().endsWith("@micelia.cl") ? "operator" : "customer";
    currentUser = { name, email, provider, role };
    localStorage.setItem("micelia_current_user", JSON.stringify(currentUser));
    
    updateUserUI();
    closeLoginModal();
    
    // Si es operador, redirigir inmediatamente a admin.html
    if (role === "operator") {
        window.location.href = "admin.html";
    } else {
        loadUserOrders();
    }
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
        
        const profileModal = document.getElementById("profile-modal");
        if (profileModal && profileModal.classList.contains("open")) {
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
    const profileModal = document.getElementById("profile-modal");
    if (profileModal) profileModal.classList.remove("open");
}

function closeLoginModal() {
    const loginModal = document.getElementById("login-modal");
    if (loginModal) loginModal.classList.remove("open");
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
// BITÁCORA Y HISTORIAL DE SENSORES EN VIVO (SENSORES CLIENTE)
// ==========================================================================
let telemetryHistory = [];
let isTelemetryStudyOpen = false;

function generateTelemetryHash(temp, hum, co2, timeStr) {
    const seed = `${temp.toFixed(2)}-${hum.toFixed(2)}-${Math.round(co2)}-${timeStr}-truthsync-micelia`;
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = (hash << 5) - hash + seed.charCodeAt(i);
        hash |= 0;
    }
    const hex = Math.abs(hash).toString(16).padEnd(8, '0') + Math.abs(hash * 31).toString(16).padEnd(8, '0');
    return `0x${hex.substring(0, 8)}...${hex.substring(hex.length - 4)}`;
}

function openTelemetryStudyModal() {
    isTelemetryStudyOpen = true;
    
    const container = document.getElementById("article-content");
    container.innerHTML = `
        <div class="article-content-body">
            <span class="metadata">Historial de logs • Camino del Micelio</span>
            <h1>Bitácora de Sensores y Cultivo Autónomo</h1>
            <p style="color: var(--text-muted); font-size: 0.95rem; margin-bottom: 1.5rem;">Audita el registro de telemetría de temperatura, humedad y CO₂ de nuestras cámaras en base sexagesimal (s60) firmados criptográficamente en TruthSync.</p>
            
            <div class="telemetry-study-dashboard" style="display: flex; flex-direction: column; gap: 1.5rem; margin-top: 1.5rem;">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem;">
                    <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 1.25rem; border-radius: 12px; text-align: center;">
                        <span style="font-size: 0.8rem; color: var(--text-muted); display: block; margin-bottom: 0.5rem;">Temperatura Celular</span>
                        <strong style="font-size: 1.6rem; color: var(--accent-gold);" id="telemetry-temp">19.50 °C</strong>
                    </div>
                    <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 1.25rem; border-radius: 12px; text-align: center;">
                        <span style="font-size: 0.8rem; color: var(--text-muted); display: block; margin-bottom: 0.5rem;">Humedad Relativa</span>
                        <strong style="font-size: 1.6rem; color: var(--accent-green-light);" id="telemetry-hum">92.15 %</strong>
                    </div>
                    <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 1.25rem; border-radius: 12px; text-align: center;">
                        <span style="font-size: 0.8rem; color: var(--text-muted); display: block; margin-bottom: 0.5rem;">CO₂ Ambiental</span>
                        <strong style="font-size: 1.6rem; color: var(--text-primary);" id="telemetry-co2">780 ppm</strong>
                    </div>
                </div>
                
                <!-- Gráfico de Fluctuación -->
                <div style="background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.05); padding: 1.5rem; border-radius: 16px;">
                    <h4 style="margin: 0 0 1rem 0; font-size: 0.95rem; color: var(--accent-gold); display: flex; align-items: center; gap: 0.5rem; font-family: var(--font-display);">
                        <span class="material-symbols-outlined" style="font-size: 1.2rem;">timeline</span>
                        Gráfico de Fluctuación de Humedad (%) y Temperatura (°C)
                    </h4>
                    <div id="telemetry-live-chart" style="width: 100%; height: 140px; display: flex; align-items: flex-end; justify-content: space-between; border-left: 2px solid rgba(255,255,255,0.08); border-bottom: 2px solid rgba(255,255,255,0.08); padding-left: 10px; position: relative;">
                        <!-- Puntos de gráfico cargados dinámicamente -->
                        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: var(--text-muted); font-size: 0.85rem;" id="chart-waiting-msg">
                            Esperando lecturas de sensores...
                        </div>
                    </div>
                    <div style="display: flex; justify-content: center; gap: 2rem; font-size: 0.8rem; margin-top: 1rem;">
                        <span style="display: flex; align-items: center; gap: 0.5rem;"><span style="width: 10px; height: 10px; background: rgba(90,164,105,0.3); border-radius: 2px;"></span>Humedad (%)</span>
                        <span style="display: flex; align-items: center; gap: 0.5rem;"><span style="width: 8px; height: 8px; background: var(--accent-gold); border-radius: 50%;"></span>Temperatura (°C)</span>
                    </div>
                </div>

                <!-- Tabla de Logs Científicos -->
                <div style="background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.05); padding: 1.5rem; border-radius: 16px;">
                    <h4 style="margin: 0 0 1rem 0; font-size: 0.95rem; color: var(--accent-gold); display: flex; align-items: center; gap: 0.5rem; font-family: var(--font-display);">
                        <span class="material-symbols-outlined" style="font-size: 1.2rem;">dataset</span>
                        Registro Histórico de Logs (Yatra S60 / TruthSync)
                    </h4>
                    <div style="overflow-x: auto; max-height: 250px;">
                        <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem; text-align: left;">
                            <thead>
                                <tr style="border-bottom: 1px solid rgba(255,255,255,0.1); color: var(--text-muted);">
                                    <th style="padding: 0.5rem;">Hora</th>
                                    <th style="padding: 0.5rem;">Temperatura (°C)</th>
                                    <th style="padding: 0.5rem;">Humedad (%)</th>
                                    <th style="padding: 0.5rem;">CO₂ (ppm)</th>
                                    <th style="padding: 0.5rem;">Firma Ledger</th>
                                    <th style="padding: 0.5rem;">Estado</th>
                                </tr>
                            </thead>
                            <tbody id="telemetry-logs-tbody">
                                <!-- Se poblará de forma dinámica -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById("article-modal").classList.add("open");
    
    // Iniciar con datos de simulación si la conexión no ha enviado nada aún
    if (telemetryHistory.length === 0) {
        let baseTime = Date.now() - 12 * 60000;
        for (let i = 0; i < 12; i++) {
            const temp = 18 + Math.random() * 3;
            const hum = 88 + Math.random() * 6;
            const co2 = 700 + Math.random() * 200;
            const time = new Date(baseTime + i * 5000);
            const timeStr = time.toTimeString().split(' ')[0];
            
            telemetryHistory.push({
                temp,
                hum,
                co2,
                rawTemp: Math.round(temp * 216000),
                rawHum: Math.round(hum * 216000),
                rawCo2: Math.round(co2 * 216000),
                timeStr,
                hash: generateTelemetryHash(temp, hum, co2, timeStr),
                status: (hum >= 85 && hum <= 95 && co2 < 900) ? "Óptimo" : "Alerta"
            });
        }
    }
    
    renderTelemetryChart();
    renderTelemetryLogsTable();
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

    const timeStr = new Date().toTimeString().split(' ')[0];
    
    // Registrar en histórico
    telemetryHistory.push({
        temp,
        hum,
        co2,
        rawTemp: Math.round(temp * 216000),
        rawHum: Math.round(hum * 216000),
        rawCo2: Math.round(co2 * 216000),
        timeStr,
        hash: generateTelemetryHash(temp, hum, co2, timeStr),
        status: (hum >= 85 && hum <= 95 && co2 < 900) ? "Óptimo" : "Alerta"
    });
    
    if (telemetryHistory.length > 20) {
        telemetryHistory.shift();
    }

    renderTelemetryChart();
    renderTelemetryLogsTable();
}

function renderTelemetryChart() {
    const chart = document.getElementById("telemetry-live-chart");
    if (!chart) return;

    let html = "";
    telemetryHistory.slice(-15).forEach((pt) => {
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

function renderTelemetryLogsTable() {
    const tbody = document.getElementById("telemetry-logs-tbody");
    if (!tbody) return;

    let html = "";
    [...telemetryHistory].reverse().forEach((pt) => {
        const statusColor = pt.status === "Óptimo" ? "#5aa469" : "#ff5e5e";
        html += `
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                <td style="padding: 0.6rem 0.5rem; font-family: monospace;">${pt.timeStr}</td>
                <td style="padding: 0.6rem 0.5rem;">${pt.temp.toFixed(2)}°C <span style="font-size: 0.7rem; color: var(--text-muted); display: block;">(s60: ${pt.rawTemp.toLocaleString()})</span></td>
                <td style="padding: 0.6rem 0.5rem;">${pt.hum.toFixed(2)}% <span style="font-size: 0.7rem; color: var(--text-muted); display: block;">(s60: ${pt.rawHum.toLocaleString()})</span></td>
                <td style="padding: 0.6rem 0.5rem;">${Math.round(pt.co2)} ppm <span style="font-size: 0.7rem; color: var(--text-muted); display: block;">(s60: ${pt.rawCo2.toLocaleString()})</span></td>
                <td style="padding: 0.6rem 0.5rem; font-family: monospace; color: var(--accent-gold);">${pt.hash}</td>
                <td style="padding: 0.6rem 0.5rem; color: ${statusColor}; font-weight: 600;">${pt.status}</td>
            </tr>
        `;
    });
    tbody.innerHTML = html;
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
    const waBtn = document.getElementById("whatsapp-order-btn");
    
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    countBadge.textContent = totalItems;
    
    if (cart.length === 0) {
        container.innerHTML = `<div class="empty-cart-message">El carrito está vacío.</div>`;
        totalPriceText.textContent = "$0 CLP";
        checkoutBtn.disabled = true;
        if (waBtn) {
            waBtn.style.opacity = "0.6";
            waBtn.style.cursor = "not-allowed";
        }
        return;
    }
    
    checkoutBtn.disabled = false;
    if (waBtn) {
        waBtn.style.opacity = "1";
        waBtn.style.cursor = "pointer";
    }
    
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
    // Inyectar y configurar asistente de ventas en todas las páginas
    initSalesBotUI();
});

// ==========================================================================
// BOTÓN DE DESPACHO / PEDIDO DE CARRITO POR WHATSAPP (IA AUTOMATIZADO)
// ==========================================================================
function requestWhatsAppOrder(event) {
    if (event) event.preventDefault();
    if (cart.length === 0) return;

    const orderId = "MC-" + Math.floor(100000 + Math.random() * 900000);
    const total = calculateTotal();
    
    let message = `¡Hola Micelia! 🍄 Quisiera realizar un pedido automatizado con IA para los siguientes productos del carrito:\n\n`;
    
    cart.forEach(item => {
        message += `• ${item.quantity}x ${item.name} ($${(item.price * item.quantity).toLocaleString("es-CL")} CLP)\n`;
    });
    
    message += `\n*Total Pedido:* $${total.toLocaleString("es-CL")} CLP.\n`;
    message += `*Referencia de Pedido:* ${orderId}\n\n`;
    message += `Quedo a la espera de que el bot de IA me tome los datos de envío. ¡Muchas gracias!`;

    const encodedText = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/56912345678?text=${encodedText}`;
    
    // Abrir WhatsApp en pestaña nueva
    window.open(whatsappUrl, "_blank");
}

// ==========================================================================
// ASISTENTE DE VENTAS FLOTANTE CON IA (SALES BOT)
// ==========================================================================
function initSalesBotUI() {
    if (localStorage.getItem("sales-bot-muted") === "true") return;
    if (document.getElementById("sales-bot-bubble")) return;

    const bubble = document.createElement("div");
    bubble.id = "sales-bot-bubble";
    bubble.style.cssText = "position: fixed; bottom: 2rem; right: 2rem; width: 60px; height: 60px; background: var(--accent-gold); color: black; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 8px 24px rgba(0,0,0,0.4); z-index: 999; transition: transform 0.3s ease;";
    bubble.innerHTML = `
        <span class="material-symbols-outlined" style="font-size: 2.1rem; color: black; display: flex; align-items: center; justify-content: center;">smart_toy</span>
        <span style="position: absolute; top: -2px; right: -2px; width: 12px; height: 12px; background: #25d366; border-radius: 50%; border: 2px solid var(--bg-dark);"></span>
    `;
    
    bubble.addEventListener("mouseenter", () => bubble.style.transform = 'scale(1.06)');
    bubble.addEventListener("mouseleave", () => bubble.style.transform = 'scale(1)');
    bubble.addEventListener("click", toggleSalesBot);

    const chat = document.createElement("div");
    chat.id = "sales-bot-chat";
    chat.style.cssText = "position: fixed; bottom: 6.5rem; right: 2rem; width: 340px; height: 450px; background: var(--bg-card); border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; box-shadow: 0 15px 40px rgba(0,0,0,0.6); display: none; flex-direction: column; overflow: hidden; z-index: 1000; font-family: var(--font-body); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);";
    chat.innerHTML = `
        <!-- Chat Header -->
        <div style="background: var(--bg-dark); padding: 1rem; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <span class="material-symbols-outlined" style="color: var(--accent-gold); font-size: 1.5rem;">smart_toy</span>
                <div>
                    <strong style="color: var(--text-primary); font-size: 0.95rem; display: block;">Asistente Virtual Micelia</strong>
                    <span style="color: #25d366; font-size: 0.72rem; display: flex; align-items: center; gap: 0.25rem;">
                        <span style="width: 6px; height: 6px; background: #25d366; border-radius: 50%;"></span> En línea (IA)
                    </span>
                </div>
            </div>
            <div style="display: flex; align-items: center; gap: 0.75rem;">
                <button onclick="muteSalesBot()" title="Silenciar asistente permanentemente (Dejarme en paz)" style="background: none; border: none; color: rgba(220, 80, 80, 0.75); cursor: pointer; display: flex; align-items: center; gap: 0.2rem; font-size: 0.75rem; font-family: var(--font-body); transition: color 0.3s; padding: 0.2rem;" onmouseover="this.style.color='#ff4b4b'" onmouseout="this.style.color='rgba(220, 80, 80, 0.75)'">
                    <span class="material-symbols-outlined" style="font-size: 1.1rem;">volume_off</span>
                    Silenciar
                </button>
                <button onclick="toggleSalesBot()" style="background: none; border: none; color: var(--text-muted); cursor: pointer; display: flex; align-items: center; padding: 0.2rem;">
                    <span class="material-symbols-outlined" style="font-size: 1.2rem;">close</span>
                </button>
            </div>
        </div>

        <!-- Chat Messages -->
        <div id="sales-bot-messages" style="flex: 1; padding: 1rem; overflow-y: auto; display: flex; flex-direction: column; gap: 1rem; background: rgba(0,0,0,0.15);">
            <div style="background: rgba(255,255,255,0.03); padding: 0.8rem; border-radius: 12px 12px 12px 0; align-self: flex-start; max-width: 85%; font-size: 0.9rem; line-height: 1.4; color: var(--text-primary);">
                ¡Hola! Soy el asistente de compras de Micelia. 🍄 ¿Quieres saber sobre nuestras setas ostra, recetas o prefieres que arme tu pedido para enviarlo directamente a WhatsApp?
            </div>
        </div>

        <!-- Chat Input -->
        <form id="sales-bot-form" onsubmit="handleSalesBotSubmit(event)" style="padding: 0.8rem; border-top: 1px solid rgba(255,255,255,0.05); display: flex; gap: 0.5rem; background: var(--bg-dark); margin: 0;">
            <input type="text" id="sales-bot-input" placeholder="Pregúntame algo..." style="flex: 1; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); padding: 0.7rem 1rem; border-radius: 20px; color: var(--text-primary); font-size: 0.9rem; outline: none; transition: border 0.3s;" onfocus="this.style.borderColor='var(--accent-gold)'" onblur="this.style.borderColor='rgba(255,255,255,0.08)'">
            <button type="submit" style="background: var(--accent-gold); border: none; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                <span class="material-symbols-outlined" style="color: black; font-size: 1.2rem; transform: rotate(-45deg) translate(2px, -1px);">send</span>
            </button>
        </form>
    `;

    document.body.appendChild(bubble);
    document.body.appendChild(chat);
}

function muteSalesBot() {
    if (confirm("¿Deseas silenciar al asistente de IA permanentemente? No volverá a aparecer en ninguna página.")) {
        localStorage.setItem("sales-bot-muted", "true");
        const bubble = document.getElementById("sales-bot-bubble");
        const chat = document.getElementById("sales-bot-chat");
        if (bubble) bubble.remove();
        if (chat) chat.remove();
    }
}

function toggleSalesBot() {
    const chat = document.getElementById("sales-bot-chat");
    if (!chat) return;
    
    if (chat.style.display === "none" || chat.style.display === "") {
        chat.style.display = "flex";
        // Desplazarse al final del chat al abrir
        const msgs = document.getElementById("sales-bot-messages");
        if (msgs) msgs.scrollTop = msgs.scrollHeight;
    } else {
        chat.style.display = "none";
    }
}

function handleSalesBotSubmit(event) {
    if (event) event.preventDefault();
    
    const input = document.getElementById("sales-bot-input");
    const msgsContainer = document.getElementById("sales-bot-messages");
    if (!input || !msgsContainer || input.value.trim() === "") return;
    
    const userText = input.value.trim();
    input.value = "";
    
    // 1. Mostrar mensaje del usuario
    appendSalesBotMessage(userText, "user");
    
    // 2. Analizar respuesta de la IA (Simulación inteligente local)
    setTimeout(() => {
        const responseText = processSalesBotQuery(userText);
        appendSalesBotMessage(responseText, "bot");
    }, 600);
}

function appendSalesBotMessage(text, sender) {
    const msgsContainer = document.getElementById("sales-bot-messages");
    if (!msgsContainer) return;
    
    const div = document.createElement("div");
    if (sender === "user") {
        div.style.background = "var(--accent-gold)";
        div.style.color = "black";
        div.style.alignSelf = "flex-end";
        div.style.borderRadius = "12px 12px 0 12px";
    } else {
        div.style.background = "rgba(255,255,255,0.03)";
        div.style.color = "var(--text-primary)";
        div.style.alignSelf = "flex-start";
        div.style.borderRadius = "12px 12px 12px 0";
    }
    
    div.style.padding = "0.8rem";
    div.style.maxWidth = "85%";
    div.style.fontSize = "0.9rem";
    div.style.lineHeight = "1.4";
    div.style.wordBreak = "break-word";
    div.innerHTML = text;
    
    msgsContainer.appendChild(div);
    msgsContainer.scrollTop = msgsContainer.scrollHeight;
}

function processSalesBotQuery(query) {
    const q = query.toLowerCase();
    
    // Función auxiliar para abrir el panel del carrito
    const openCart = () => {
        const sidebar = document.getElementById("cart-sidebar");
        const backdrop = document.getElementById("cart-backdrop");
        if (sidebar && backdrop) {
            sidebar.classList.add("open");
            backdrop.classList.add("open");
        }
    };

    // Función auxiliar para cerrar el panel del carrito
    const closeCart = () => {
        const sidebar = document.getElementById("cart-sidebar");
        const backdrop = document.getElementById("cart-backdrop");
        if (sidebar && backdrop) {
            sidebar.classList.remove("open");
            backdrop.classList.remove("open");
        }
    };
    
    // 1. Vaciar Carrito
    if (q.includes("vaciar") || q.includes("limpiar carro") || q.includes("limpiar carrito") || q.includes("vaciar carro") || q.includes("vaciar carrito")) {
        cart = [];
        renderCart();
        openCart();
        return `¡Listo! He vaciado tu carrito de compras por ti. El carro ahora está vacío.`;
    }

    // 2. Quitar/Eliminar productos específicos
    if (q.includes("quitar") || q.includes("eliminar") || q.includes("saca ") || q.includes("sacar") || q.includes("borrar")) {
        let removed = false;
        let itemName = "";
        
        if (q.includes("500") || q.includes("chico")) {
            cart = cart.filter(item => item.id !== "1");
            itemName = "Hongo Ostra Fresco 500g";
            removed = true;
        } else if (q.includes("1kg") || q.includes("1 kg") || q.includes("kilo") || q.includes("grande")) {
            cart = cart.filter(item => item.id !== "2");
            itemName = "Hongo Ostra Fresco 1kg";
            removed = true;
        } else if (q.includes("kit") || q.includes("autocultivo")) {
            cart = cart.filter(item => item.id !== "4");
            itemName = "Kit de Autocultivo Educativo";
            removed = true;
        } else if (q.includes("suscripcion") || q.includes("horeca") || q.includes("restaurante")) {
            cart = cart.filter(item => item.id !== "3");
            itemName = "Suscripción HORECA";
            removed = true;
        }
        
        if (removed) {
            renderCart();
            openCart();
            return `He retirado **${itemName}** de tu carrito de compras. ¡Panel actualizado!`;
        }
    }

    // 3. Ver/Mostrar/Abrir Carrito
    if (q.includes("ver carrito") || q.includes("ver carro") || q.includes("que tengo") || q.includes("mi pedido") || q.includes("abrir carrito") || q.includes("mostrar carro")) {
        openCart();
        if (cart.length === 0) {
            return `Tu carrito está vacío actualmente. ¿Quieres que te agregue una bandeja de 500g o 1kg?`;
        }
        const itemsList = cart.map(item => `• **${item.name}** (x${item.quantity}) - $${(item.price * item.quantity).toLocaleString("es-CL")} CLP`).join("<br>");
        return `Aquí tienes el detalle de tu pedido:<br><br>${itemsList}<br><br><strong>Total:</strong> $${calculateTotal().toLocaleString("es-CL")} CLP.<br>¡Ya abrí el panel lateral para ti!`;
    }

    // 4. Cerrar Carrito
    if (q.includes("cerrar carrito") || q.includes("ocultar carro") || q.includes("ocultar carrito") || q.includes("cerrar carro")) {
        closeCart();
        return `He cerrado el panel del carrito. ¿Hay algo más en lo que pueda ayudarte?`;
    }

    // 5. Proceder al pago / Checkout
    if (q.includes("comprar") || q.includes("pagar") || q.includes("checkout") || q.includes("finalizar pedido") || q.includes("despachar")) {
        if (cart.length === 0) {
            return `No puedes finalizar la compra porque tu carrito está vacío. Pídeme agregar un producto primero, por ejemplo: *"Agrega 1kg"*`;
        }
        closeCart();
        const checkoutModal = document.getElementById("checkout-modal");
        if (checkoutModal) {
            checkoutModal.classList.add("open");
            return `¡Excelente elección! He cerrado el carrito y **abierto la pasarela de despacho y pago**. Por favor completa tus datos en el formulario central.`;
        }
    }

    // Lógica para agregar al carro mediante comandos de texto
    if (q.includes("agregar") || q.includes("quiero comprar") || q.includes("llevar") || q.includes("pido") || q.includes("pon ")) {
        if (q.includes("500g") || q.includes("500 g") || q.includes("chico") || q.includes("pequeño") || q.includes("fresco 500")) {
            addToCart("1", "Hongo Ostra Fresco 500g", 4500);
            openCart();
            return `¡Excelente! He agregado **Hongo Ostra Fresco 500g ($4.500 CLP)** a tu carrito. Abre el carro a la derecha para ver tu total o haz clic en "Pedir por WhatsApp" para automatizar tu compra.`;
        }
        if (q.includes("1kg") || q.includes("1 kg") || q.includes("kilo") || q.includes("grande") || q.includes("fresco 1")) {
            addToCart("2", "Hongo Ostra Fresco 1kg", 8000);
            openCart();
            return `¡Hecho! Agregué **Hongo Ostra Fresco 1kg ($8.000 CLP)** a tu carrito. Puedes revisar el carro a la derecha.`;
        }
        if (q.includes("kit") || q.includes("autocultivo")) {
            if (q.includes("familiar") || q.includes("xl") || q.includes("grande")) {
                addToCart("5", "Kit de Autocultivo Familiar XL", 18000);
                openCart();
                return `¡Listo! Sumé el **Kit de Autocultivo Familiar XL ($18.000 CLP)** a tu carrito. ¡Es perfecto para cosechar setas en gran cantidad!`;
            } else if (q.includes("exotico") || q.includes("rosa") || q.includes("djamor") || q.includes("amarillo")) {
                addToCart("6", "Kit de Autocultivo Exótico", 15000);
                openCart();
                return `¡Hecho! Agregué el **Kit de Autocultivo Exótico ($15.000 CLP)** con setas rosadas tropicales a tu carrito.`;
            } else {
                addToCart("4", "Kit de Autocultivo Educativo", 12000);
                openCart();
                return `¡Listo! Sumé el **Kit de Autocultivo Educativo ($12.000 CLP)** a tu carrito. ¡Tus hijos aprenderán mucho viendo crecer sus setas!`;
            }
        }
        if (q.includes("suscripcion") || q.includes("horeca") || q.includes("restaurante")) {
            addToCart("3", "Suscripción HORECA", 25000);
            openCart();
            return `¡Agregado! He sumado la **Suscripción HORECA ($25.000 CLP/mes)** a tu carrito.`;
        }
    }
    
    // Respuestas informativas generales e integraciones del proyecto
    if (q.includes("hola") || q.includes("buenos dias") || q.includes("buenas tardes")) {
        return `¡Hola! Qué gusto saludarte. 😊 Soy el asistente inteligente de **Micelia**. ¿Quieres saber sobre los precios de catálogo, nuestras recetas gourmet, cómo funciona la telemetría IoT S60, la integración ML en Rust, o el ledger TruthSync? ¡Pregúntame lo que quieras!`;
    }
    
    if (q.includes("precio") || q.includes("cuanto cuesta") || q.includes("valor") || q.includes("catalogo") || q.includes("productos") || q.includes("kit")) {
        return `Nuestros productos y valores comerciales oficiales son:
<br><br>
• **Hongo Ostra Fresco 500g**: $4.500 CLP (Formato familiar de consumo diario)<br>
• **Hongo Ostra Fresco 1kg**: $8.000 CLP (Ideal para cocineros y conservación)<br>
• **Suscripción HORECA B2B**: $25.000 CLP/mes (Suministro garantizado de 3.5kg mensuales)<br>
• **Kit de Autocultivo Educativo**: $12.000 CLP (Proyecto STEM de 2kg para escuelas)<br>
• **Kit de Autocultivo Familiar XL**: $18.000 CLP (Bloque de producción de 4.5kg para hogar)<br>
• **Kit de Autocultivo Exótico**: $15.000 CLP (Setas rosadas Pleurotus djamor gourmet)<br><br>
¿Deseas que te agregue alguno al carro de compras?`;
    }
    
    if (q.includes("despacho") || q.includes("envio") || q.includes("entrega") || q.includes("a domicilio")) {
        return `Realizamos despachos directos todos los **miércoles y sábados** a toda la Provincia de Arauco (Curanilahue, Cañete, Lebu, Arauco). El despacho es gratuito para compras sobre $8.000 CLP.`;
    }
    
    if (q.includes("whatsapp") || q.includes("celular") || q.includes("telefono")) {
        return `¡Claro! Nuestra plataforma cuenta con una integración especial por WhatsApp. Al hacer clic en **"Pedir por WhatsApp (IA)"** en tu carrito de compras, o mediante nuestro enlace rápido, redactamos tu pedido de inmediato.`;
    }

    if (q.includes("adulto") || q.includes("mayor") || q.includes("abuelo") || q.includes("tercera edad") || q.includes("abuela")) {
        return `Para evitar la fricción digital y asegurar la accesibilidad de nuestros adultos mayores, contamos con un flujo simplificado de un solo clic. El enlace de WhatsApp los redirige al número corporativo con el mensaje pre-redactado:
<br><br>
💬 <em>"Hola Micelia, quisiera pedir el Pack Adulto Mayor de setas de 500g"</em><br><br>
De esta forma, pueden concretar su pedido sin formularios complejos.`;
    }
    
    if (q.includes("receta") || q.includes("cocinar") || q.includes("plat") || q.includes("gourmet") || q.includes("comida") || q.includes("tacos") || q.includes("risotto") || q.includes("steak") || q.includes("grill") || q.includes("ceviche") || q.includes("calamar") || q.includes("scampi") || q.includes("teriyaki") || q.includes("crema")) {
        return `¡Nuestras recetas gourmet de Hongo Ostra son espectaculares! En nuestra **Biblioteca** puedes consultar las guías detalladas con paso a paso y valores nutricionales:<br><br>
• 🌮 **[Tacos Deshilachados](view_doc.html?file=docs/receta_tacos.md&title=Tacos%20de%20Hongo%20Ostra)** (Textura idéntica a carne desmechada)<br>
• 🥩 **[Clusters al Grill con Ajo](view_doc.html?file=docs/receta_grill.md&title=Clusters%20al%20Grill)** (Firme, ideal para parrilla)<br>
• 🍚 **[Risotto Cremoso de Trufa](view_doc.html?file=docs/receta_risotto.md&title=Risotto%20Cremoso%20de%20Setas)** (El sabor umami definitivo)<br>
• 🥗 **[Ceviche del Mar del Sur](view_doc.html?file=docs/receta_ceviche.md&title=Ceviche%20del%20Mar%20del%20Sur)** (Fresco, curado con limón)<br>
• 🦑 **[Calamares Crujientes Tempura](view_doc.html?file=docs/receta_calamares.md&title=%22Calamares%22%20Veganos)** (Aros crujientes sin mariscos)<br>
• 🧄 **[Scampi de Setas al Vino](view_doc.html?file=docs/receta_scampi.md&title=Scampi%20de%20Setas%20Ostra)** (Emulsión de mantequilla y ajo)<br>
• 🍱 **[Setas Teriyaki Wok](view_doc.html?file=docs/receta_teriyaki.md&title=Hongos%20Ostra%20Teriyaki)** (Glaseadas con soja y jengibre)<br>
• 🥣 **[Crema de Ostra al Tomillo](view_doc.html?file=docs/receta_crema.md&title=Crema%20de%20Hongo%20Ostra)** (Alta digestibilidad para Adulto Mayor)<br><br>
Pincha en cualquiera de los enlaces para ver los ingredientes y su preparación.`;
    }
    
    if (q.includes("biblioteca") || q.includes("articulo") || q.includes("leer") || q.includes("documento") || q.includes("conocimiento") || q.includes("saber")) {
        return `Nuestra **Biblioteca Científica** contiene guías de cultivo, artículos sobre tecnología y biología de setas:<br><br>
• 🔬 **[Biología del Hongo Ostra](view_doc.html?file=docs/biologia_hongo_ostra.md&title=Biologia%20del%20Hongo%20Ostra)** (Ciclo de vida y Reino Fungi)<br>
• 🧬 **[Superalimento e Inmunología](view_doc.html?file=docs/compendio_nutricional.md&title=Poder%20Nutricional%20del%20Hongo%20Ostra)** (Beta-glucanos y lovastatina)<br>
• 📡 **[Telemetría IoT S60](view_doc.html?file=docs/telemetria_s60.md&title=Telemetria%20IoT%20S60)** (Monitoreo con microcontroladores)<br>
• ⚡ **[Rust Cortex Daemon](view_doc.html?file=docs/cortex_daemon.md&title=Rust%20Cortex%20Daemon)** (Backend de telemetría concurrente)<br>
• 🔗 **[TruthSync Criptografía](view_doc.html?file=docs/truthsync_ledger.md&title=TruthSync%20Ledger)** (Inmutabilidad criptográfica de despachos)<br>
• ♻️ **[Economía Circular en Arauco](view_doc.html?file=docs/economia_circular.md&title=Economia%20Circular)** (Residuos orgánicos converted a alimento)<br>
• 📦 **[Guía de Autocultivo Educativo](view_doc.html?file=docs/guia_autocultivo.md&title=Guia%20de%20Autocultivo)** (Tutorial del kit STEM)<br><br>
¡Te sugiero visitarla en el menú superior para ver las fotos y el vapor animado en recetas!`;
    }

    if (q.includes("registrar") || q.includes("cuenta") || q.includes("sesion") || q.includes("perfil") || q.includes("login") || q.includes("usuario") || q.includes("ingresar") || q.includes("entrar") || q.includes("registro") || q.includes("beneficio")) {
        return `¡Registrarte como cliente en **Micelia** te brinda grandes ventajas exclusivas! 🌟:<br><br>
1. 📦 **Seguimiento Criptográfico en Tiempo Real**: Rastrea el estado exacto de tu despacho con validación de hash TruthSync.<br>
2. 🚨 **Alertas IoT de Cultivo Personalizadas**: Si tienes un Kit de Autocultivo, puedes enlazar tus sensores y recibir alertas automáticas en tu teléfono si la humedad cae de 85% o el CO₂ supera los 900 ppm (óptimos fúngicos).<br>
3. 📜 **Historial Completo**: Guarda tus compras anteriores y descarga boletas o certificados de trazabilidad orgánica.<br><br>
Para registrarte o ingresar, haz clic en **"Iniciar Sesión"** en la barra superior del menú principal.`;
    }

    if (q.includes("pedido") || q.includes("seguimiento") || q.includes("despacho") || q.includes("enviar") || q.includes("estado") || q.includes("rastrear") || q.includes("compra") || q.includes("donde esta") || q.includes("transaccion")) {
        return `Cada pedido en Micelia cuenta con trazabilidad inmutable mediante **TruthSync**. El flujo es el siguiente:<br><br>
1. **Recibido**: Confirmado y registrado en PostgreSQL.<br>
2. **Cosechando**: Seleccionamos y cosechamos las setas frescas del sustrato.<br>
3. **En Reparto**: Nuestro despachador sale en ruta por la Provincia de Arauco (despachos miércoles y sábados).<br>
4. **Entregado**: Pedido firmado y sellado criptográficamente.<br><br>
Cada actualización de estado calcula un hash **SHA-256** único que asegura que la información es inmutable. Si inicias sesión con tu cuenta, verás un mapa interactivo con el estado de tu pedido en tiempo real y su firma digital de validación.`;
    }
    
    if (q.includes("s60") || q.includes("yatra") || q.includes("sensor") || q.includes("humedad") || q.includes("temperatura") || q.includes("co2") || q.includes("optimo") || q.includes("ideal")) {
        return `El sistema de telemetría IoT **Yatra S60** recopila lecturas de sensores (Temperatura, Humedad, CO₂) y las procesa en **base sexagesimal (s60)** en el firmware ESP32 y en el backend Cortex. 
<br><br>
Los rangos biológicos saludables ideales para el crecimiento del *Pleurotus ostreatus* son:<br>
• 💧 **Humedad**: 85% - 95% (crítico para inducción de primordios)<br>
• 🫧 **CO₂**: &lt; 900 ppm (evita que las setas crezcan fibrosas o elongadas)<br>
• 🌡️ **Temperatura**: 18°C - 22°C (crecimiento celular equilibrado)<br><br>
Puedes auditar las lecturas en tiempo real en nuestro dashboard de operador.`;
    }

    if (q.includes("truthsync") || q.includes("blockchain") || q.includes("hash") || q.includes("seguro") || q.includes("sha256") || q.includes("inmutable") || q.includes("ledger")) {
        return `**TruthSync** es nuestro ledger de transacciones inmutable. Cada vez que se crea un pedido o se actualiza un despacho, el sistema calcula un hash criptográfico **SHA256** (enlazando el ID del pedido, los datos del cliente, el estado anterior y el nuevo, junto con el hash anterior). Las firmas se guardan de forma incorruptible en la tabla PostgreSQL \`truthsync_orders\`.`;
    }

    if (q.includes("rust") || q.includes("pyo3") || q.includes("cortex") || q.includes("inteligencia") || q.includes("ml") || q.includes("machine learning") || q.includes("pronostico") || q.includes("predecir")) {
        return `Nuestra capa analítica Cortex cuenta con algoritmos de Machine Learning (mínimos cuadrados para regresión lineal de proyecciones de ventas) programados en **Rust** e integrados como módulo nativo ejecutable de Python usando **PyO3**. Para soporte óptimo de Python 3.14 bajo Linux RedHat/Fedora en producción, inyectamos la variable de entorno \`PYO3_USE_ABI3_FORWARD_COMPATIBILITY = "1"\`.`;
    }

    if (q.includes("sustrato") || q.includes("circular") || q.includes("arauco") || q.includes(" forestal") || q.includes("paja") || q.includes("cal")) {
        return `Micelia valoriza los residuos forestales y agrícolas de la Provincia de Arauco (paja de trigo y aserrín) como sustrato de cultivo. Implementamos una **desinfección alcalina** ecológica usando hidróxido de calcio (cal apagada al 1% durante 16 horas) en lugar de pasteurización por vapor, logrando una **Eficiencia Biológica (BE) del 65% al 80%** y con una huella hídrica ultra baja (solo 70 litros de agua por kg de hongo fresco).`;
    }
    
    return `Entiendo tu pregunta. Puedo guiarte con información sobre el catálogo de precios, sugerirte recetas y artículos técnicos, detallar los beneficios de registrarte como cliente, explicar el sistema de seguimiento de pedidos TruthSync, el Estándar Yatra S60 o la integración de Rust/PyO3 en Cortex ML.`;
}

// ==========================================================================
// FONDO 3D DE RED DE MICELIO (THREE.JS)
// ==========================================================================
// ==========================================================================
// FONDO 3D DE RED DE MICELIO (THREE.JS) CON HONGOS OSTRA PROCEDURALES
// ==========================================================================
function createWireframeOysterMushroom(colorHex) {
    const group = new THREE.Group();
    
    // Material translúcido estilo rejilla holográfica
    const material = new THREE.MeshBasicMaterial({
        color: colorHex,
        wireframe: true,
        transparent: true,
        opacity: 0.18
    });

    // 1. Sombrero de Hongo Ostra (Pleurotoide - forma de abanico asimétrico)
    // El domo de la esfera achatada representa el sombrero, y las subdivisiones forman las "laminillas" (gills)
    const capGeo = new THREE.SphereGeometry(1.0, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2.2);
    const cap = new THREE.Mesh(capGeo, material);
    cap.scale.set(1.4, 0.22, 1.0); // Achatado y alargado
    cap.rotation.x = 0.35;         // Inclinado característico
    cap.position.set(0, 0.8, -0.2);
    group.add(cap);

    // 2. Tallo (Stipe) lateral
    const stemGeo = new THREE.CylinderGeometry(0.06, 0.14, 1.2, 8, 3);
    const stem = new THREE.Mesh(stemGeo, material);
    stem.rotation.z = -0.2; // Inclinación lateral
    stem.position.set(-0.25, 0.25, 0);
    group.add(stem);

    // 3. Pequeño Hongo Secundario (Brote del racimo)
    const babyGroup = new THREE.Group();
    const babyCap = new THREE.Mesh(capGeo, material);
    babyCap.scale.set(0.7, 0.13, 0.5);
    babyCap.rotation.x = 0.45;
    babyCap.position.set(0, 0.4, -0.1);
    babyGroup.add(babyCap);

    const babyStem = new THREE.Mesh(stemGeo, material);
    babyStem.scale.set(0.6, 0.6, 0.6);
    babyStem.rotation.z = -0.35;
    babyStem.position.set(-0.15, 0.1, 0);
    babyGroup.add(babyStem);

    babyGroup.position.set(0.4, -0.2, 0.2);
    group.add(babyGroup);

    return group;
}

function initMycelium3D() {
    const container = document.getElementById('canvas-container');
    if (!container || typeof THREE === 'undefined') return;

    // 1. Escena, cámara y renderizador
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 8;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 2. Crear Racimos de Hongos Ostra Holográficos
    const mushrooms = [];
    const shroomColor = 0xc3b59f; // Color oro champán

    // Cluster 1 (Izquierda Superior)
    const m1 = createWireframeOysterMushroom(shroomColor);
    m1.position.set(-3.5, 1.8, -2.5);
    m1.scale.set(1.3, 1.3, 1.3);
    scene.add(m1);
    mushrooms.push(m1);

    // Cluster 2 (Derecha Inferior)
    const m2 = createWireframeOysterMushroom(shroomColor);
    m2.position.set(3.8, -1.8, -3.0);
    m2.rotation.y = Math.PI / 1.5;
    m2.scale.set(1.1, 1.1, 1.1);
    scene.add(m2);
    mushrooms.push(m2);

    // Cluster 3 (Centro Atrás)
    const m3 = createWireframeOysterMushroom(shroomColor);
    m3.position.set(0.2, 2.5, -4.5);
    m3.rotation.y = -Math.PI / 4;
    m3.scale.set(1.2, 1.2, 1.2);
    scene.add(m3);
    mushrooms.push(m3);

    // 3. Generación de nodos de micelio (Spores)
    const nodeCount = 90;
    const positions = [];
    const velocities = [];
    
    for (let i = 0; i < nodeCount; i++) {
        const x = (Math.random() - 0.5) * 12;
        const y = (Math.random() - 0.5) * 10;
        const z = (Math.random() - 0.5) * 8;
        positions.push(new THREE.Vector3(x, y, z));
        
        const vx = (Math.random() - 0.5) * 0.003;
        const vy = (Math.random() - 0.5) * 0.003;
        const vz = (Math.random() - 0.5) * 0.003;
        velocities.push(new THREE.Vector3(vx, vy, vz));
    }

    // 4. Puntos de crecimiento (Tip Points)
    const pointsGeometry = new THREE.BufferGeometry();
    const pointsArray = new Float32Array(nodeCount * 3);
    updatePointsArray();

    function updatePointsArray() {
        for (let i = 0; i < nodeCount; i++) {
            pointsArray[i * 3] = positions[i].x;
            pointsArray[i * 3 + 1] = positions[i].y;
            pointsArray[i * 3 + 2] = positions[i].z;
        }
        pointsGeometry.setAttribute('position', new THREE.BufferAttribute(pointsArray, 3));
    }

    const pointsMaterial = new THREE.PointsMaterial({
        size: 0.07,
        color: 0xc3b59f,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });

    const pointsMesh = new THREE.Points(pointsGeometry, pointsMaterial);
    scene.add(pointsMesh);

    // 5. Conexiones del micelio (Líneas/Hifas)
    const lineMaterial = new THREE.LineBasicMaterial({
        color: 0xc3b59f,
        transparent: true,
        opacity: 0.12,
        blending: THREE.AdditiveBlending
    });

    const lineGeometry = new THREE.BufferGeometry();
    const lineMesh = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lineMesh);

    // 6. Interacción del ratón
    let mouseX = 0, mouseY = 0;
    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    // 7. Bucle de animación
    const maxDistance = 2.4;
    
    function animate() {
        if (!isMycelium3DEnabled) {
            renderer.clear();
            return;
        }
        requestAnimationFrame(animate);

        // Deriva lenta de los nodos
        for (let i = 0; i < nodeCount; i++) {
            positions[i].add(velocities[i]);
            
            if (Math.abs(positions[i].x) > 7.5) velocities[i].x *= -1;
            if (Math.abs(positions[i].y) > 6.0) velocities[i].y *= -1;
            if (Math.abs(positions[i].z) > 5.0) velocities[i].z *= -1;
        }

        updatePointsArray();
        pointsGeometry.attributes.position.needsUpdate = true;

        // Construir líneas dinámicas
        const lineVertices = [];
        for (let i = 0; i < nodeCount; i++) {
            for (let j = i + 1; j < nodeCount; j++) {
                const dist = positions[i].distanceTo(positions[j]);
                if (dist < maxDistance) {
                    lineVertices.push(positions[i].x, positions[i].y, positions[i].z);
                    lineVertices.push(positions[j].x, positions[j].y, positions[j].z);
                }
            }
        }

        if (lineVertices.length > 0) {
            lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(lineVertices, 3));
            lineGeometry.computeBoundingSphere();
        } else {
            lineGeometry.deleteAttribute('position');
        }

        // Rotación general de la red
        pointsMesh.rotation.y += 0.0004;
        pointsMesh.rotation.x += 0.0001;
        lineMesh.rotation.y += 0.0004;
        lineMesh.rotation.x += 0.0001;

        // Flotar y rotar hongos ostra
        mushrooms.forEach((shroom, index) => {
            shroom.rotation.y += 0.0015;
            shroom.position.y += Math.sin(Date.now() * 0.0008 + index) * 0.0012;
        });

        // Parallax de la cámara
        camera.position.x += (mouseX * 1.8 - camera.position.x) * 0.03;
        camera.position.y += (mouseY * 1.5 - camera.position.y) * 0.03;
        camera.lookAt(scene.position);

        renderer.render(scene, camera);
    }

    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

// ==========================================================================
// CONTROL DEL SLIDER DE HÉROE (INICIO)
// ==========================================================================
let currentHeroSlide = 0;
let heroInterval = null;

function initHeroSlider() {
    const slides = document.querySelectorAll(".hero-slide");
    const dots = document.querySelectorAll(".hero-dot");
    if (slides.length === 0) return;

    // Iniciar con diapositiva aleatoria para dinamismo de entrada
    currentHeroSlide = Math.floor(Math.random() * slides.length);
    showHeroSlide(currentHeroSlide);

    startHeroInterval();
}

function showHeroSlide(index) {
    const slides = document.querySelectorAll(".hero-slide");
    const dots = document.querySelectorAll(".hero-dot");
    if (slides.length === 0) return;

    if (index >= slides.length) currentHeroSlide = 0;
    else if (index < 0) currentHeroSlide = slides.length - 1;
    else currentHeroSlide = index;

    slides.forEach((slide, i) => {
        if (i === currentHeroSlide) {
            slide.classList.add("active");
        } else {
            slide.classList.remove("active");
        }
    });

    dots.forEach((dot, i) => {
        if (i === currentHeroSlide) {
            dot.classList.add("active");
        } else {
            dot.classList.remove("active");
        }
    });
}

function setHeroSlide(index) {
    showHeroSlide(index);
    resetHeroInterval();
}

function startHeroInterval() {
    if (heroInterval) clearInterval(heroInterval);
    heroInterval = setInterval(() => {
        showHeroSlide(currentHeroSlide + 1);
    }, 8500); // Rotación automática cada 8.5 segundos
}

function resetHeroInterval() {
    clearInterval(heroInterval);
    startHeroInterval();
}

// Inicializar sliders y widgets de accesibilidad en la carga de la página
document.addEventListener("DOMContentLoaded", () => {
    initHeroSlider();
    initAccessibilityUI();
});

// ==========================================================================
// MÓDULO DE ACCESIBILIDAD Y TEMAS (A11Y)
// ==========================================================================
let ttsActive = false;
let ttsUtterance = null;
let isMycelium3DEnabled = true;

function initAccessibilityUI() {
    if (document.getElementById("a11y-widget-bubble")) return;

    // Crear Burbuja de Accesibilidad (Esquina Inferior Izquierda)
    const bubble = document.createElement("div");
    bubble.id = "a11y-widget-bubble";
    bubble.style.cssText = "position: fixed; bottom: 2rem; left: 2rem; width: 60px; height: 60px; background: #2b4c7e; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 8px 24px rgba(0,0,0,0.4); z-index: 999; transition: transform 0.3s ease;";
    bubble.innerHTML = `<span class="material-symbols-outlined" style="font-size: 2.1rem; color: white; display: flex; align-items: center; justify-content: center;">accessibility_new</span>`;
    
    bubble.addEventListener("mouseenter", () => bubble.style.transform = 'scale(1.06)');
    bubble.addEventListener("mouseleave", () => bubble.style.transform = 'scale(1)');
    bubble.addEventListener("click", toggleAccessibilityPanel);

    // Crear Panel de Accesibilidad
    const panel = document.createElement("div");
    panel.id = "a11y-panel";
    panel.className = "a11y-panel";
    panel.innerHTML = `
        <div class="a11y-header">
            <span class="a11y-title">Accesibilidad y Temas</span>
            <button class="a11y-close" onclick="toggleAccessibilityPanel()" style="background:none; border:none; color:var(--text-muted); cursor:pointer;">
                <span class="material-symbols-outlined" style="font-size: 1.2rem;">close</span>
            </button>
        </div>
        
        <!-- Tema Claro / Oscuro -->
        <div class="a11y-option">
            <span>Tema visual:</span>
            <div class="a11y-btn-group">
                <button class="a11y-btn" id="theme-btn-dark" onclick="setA11yTheme('dark')">Oscuro</button>
                <button class="a11y-btn" id="theme-btn-light" onclick="setA11yTheme('light')">Claro</button>
            </div>
        </div>

        <!-- Contraste Alto -->
        <div class="a11y-option">
            <span>Contraste Alto:</span>
            <div class="a11y-btn-group">
                <button class="a11y-btn" id="contrast-btn-off" onclick="setA11yContrast(false)">Normal</button>
                <button class="a11y-btn" id="contrast-btn-on" onclick="setA11yContrast(true)">Alto</button>
            </div>
        </div>

        <!-- Ajuste de Fuente -->
        <div class="a11y-option">
            <span>Tamaño de Texto:</span>
            <div class="a11y-btn-group">
                <button class="a11y-btn" id="font-btn-sm" onclick="setA11yFontSize('sm')">A-</button>
                <button class="a11y-btn" id="font-btn-md" onclick="setA11yFontSize('md')">Normal</button>
                <button class="a11y-btn" id="font-btn-lg" onclick="setA11yFontSize('lg')">A+</button>
            </div>
        </div>

        <!-- Carga Rápida (Sin Animaciones) -->
        <div class="a11y-option">
            <span>Carga Rápida (Sin Anim.):</span>
            <div class="a11y-btn-group">
                <button class="a11y-btn" id="anim-btn-off" onclick="setA11yAnimations(true)">No</button>
                <button class="a11y-btn" id="anim-btn-on" onclick="setA11yAnimations(false)">Sí</button>
            </div>
        </div>

        <!-- Lector de Pantalla por Voz -->
        <div class="a11y-option">
            <span>Lector de Voz (TTS):</span>
            <button class="a11y-btn" id="tts-btn" onclick="toggleA11yTTS()">Activar Lector</button>
        </div>

        <!-- Acceso Directo Adulto Mayor -->
        <div class="a11y-option" style="border-top: 1px solid rgba(255, 255, 255, 0.08); padding-top: 0.75rem; margin-top: 0.25rem;">
            <a href="https://wa.me/56912345678?text=Hola%20Micelia%2C%20quisiera%20pedir%20el%20Pack%20Adulto%20Mayor%20de%20setas%20de%20500g" target="_blank" rel="noopener noreferrer" style="display: flex; align-items: center; gap: 0.4rem; text-decoration: none; color: var(--accent-gold); width: 100%; justify-content: center; font-weight: bold; font-size: 0.82rem;">
                <span class="material-symbols-outlined" style="font-size: 1.2rem;">elderly</span> Pedido Rápido Adulto Mayor
            </a>
        </div>
    `;

    document.body.appendChild(bubble);
    document.body.appendChild(panel);

    // Cargar preferencias del usuario y detectar preferencias del navegador/sistema
    applySavedA11ySettings();
}

function toggleAccessibilityPanel() {
    const panel = document.getElementById("a11y-panel");
    if (panel) {
        panel.classList.toggle("active");
    }
}

function setA11yTheme(theme) {
    if (theme === "light") {
        document.body.classList.add("light-theme");
        localStorage.setItem("a11y-theme", "light");
    } else {
        document.body.classList.remove("light-theme");
        localStorage.setItem("a11y-theme", "dark");
    }
    updateActiveButtons();
}

function setA11yContrast(highContrast) {
    if (highContrast) {
        document.body.classList.add("high-contrast");
        localStorage.setItem("a11y-contrast", "true");
    } else {
        document.body.classList.remove("high-contrast");
        localStorage.setItem("a11y-contrast", "false");
    }
    updateActiveButtons();
}

function setA11yFontSize(size) {
    document.body.classList.remove("font-scale-lg", "font-scale-xl");
    if (size === "lg") {
        document.body.classList.add("font-scale-lg");
        localStorage.setItem("a11y-font-size", "lg");
    } else if (size === "xl") {
        document.body.classList.add("font-scale-xl");
        localStorage.setItem("a11y-font-size", "xl");
    } else {
        localStorage.setItem("a11y-font-size", "md");
    }
    updateActiveButtons();
}

function setA11yAnimations(enabled) {
    if (enabled) {
        document.body.classList.remove("no-animations");
        localStorage.setItem("a11y-no-animations", "false");
        isMycelium3DEnabled = true;
        
        // Re-inicializar Three.js si es necesario
        if (typeof initMycelium3D === 'function') {
            const canvasContainer = document.getElementById('canvas-container');
            if (canvasContainer && canvasContainer.children.length === 0) {
                initMycelium3D();
            }
        }
        
        // Reactivar rotaciones
        startHeroInterval();
    } else {
        document.body.classList.add("no-animations");
        localStorage.setItem("a11y-no-animations", "true");
        isMycelium3DEnabled = false;
        
        // Limpiar el lienzo Three.js para liberar CPU/GPU al 100%
        const canvasContainer = document.getElementById('canvas-container');
        if (canvasContainer) {
            canvasContainer.innerHTML = ''; 
        }
        
        // Detener los intervalos de los sliders para que queden fijos
        if (heroInterval) clearInterval(heroInterval);
    }
    updateActiveButtons();
}

function toggleA11yTTS() {
    const btn = document.getElementById("tts-btn");
    if (!btn) return;

    if (!ttsActive) {
        ttsActive = true;
        btn.textContent = "Detener Lector";
        btn.style.background = "#ff4b4b";
        btn.style.color = "white";
        
        speakPageText();
    } else {
        ttsActive = false;
        btn.textContent = "Activar Lector";
        btn.style.background = "";
        btn.style.color = "";
        
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
    }
}

function speakPageText() {
    if (!window.speechSynthesis) {
        alert("La síntesis de voz no está soportada en este navegador.");
        return;
    }
    window.speechSynthesis.cancel();

    // Recolectar texto del cuerpo principal (títulos y párrafos)
    const elements = document.querySelectorAll("h1, h2, h3, p");
    let textToSpeak = "Panel de lectura de Micelia. ";
    elements.forEach(el => {
        if (el.closest("#a11y-panel") || el.closest("#sales-bot-chat") || el.closest(".navbar")) return;
        textToSpeak += el.innerText + ". ";
    });

    ttsUtterance = new SpeechSynthesisUtterance(textToSpeak);
    ttsUtterance.lang = "es-CL";
    ttsUtterance.rate = 1.0;
    
    ttsUtterance.onend = () => {
        if (ttsActive) toggleA11yTTS();
    };

    window.speechSynthesis.speak(ttsUtterance);
}

function applySavedA11ySettings() {
    // 1. Detección automática del tema del sistema o preferencia guardada
    const savedTheme = localStorage.getItem("a11y-theme");
    const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;

    if (savedTheme === "light" || (!savedTheme && prefersLight)) {
        document.body.classList.add("light-theme");
    } else {
        document.body.classList.remove("light-theme");
    }

    // Escuchar cambios dinámicos del sistema en tiempo real si no hay preferencia explícita guardada
    window.matchMedia("(prefers-color-scheme: light)").addEventListener("change", (e) => {
        if (!localStorage.getItem("a11y-theme")) {
            if (e.matches) {
                document.body.classList.add("light-theme");
            } else {
                document.body.classList.remove("light-theme");
            }
            updateActiveButtons();
        }
    });

    // 2. Cargar contraste guardado
    const savedContrast = localStorage.getItem("a11y-contrast");
    if (savedContrast === "true") {
        document.body.classList.add("high-contrast");
    }

    // 3. Cargar escala de fuente guardada
    const savedFontSize = localStorage.getItem("a11y-font-size");
    if (savedFontSize === "lg") {
        document.body.classList.add("font-scale-lg");
    } else if (savedFontSize === "xl") {
        // Mapeamos xl a font-scale-xl para mayor adaptabilidad
        document.body.classList.add("font-scale-xl");
    }

    // 4. Cargar estado de animaciones y carga rápida
    const savedNoAnimations = localStorage.getItem("a11y-no-animations");
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (savedNoAnimations === "true" || (!savedNoAnimations && prefersReducedMotion)) {
        setA11yAnimations(false);
    } else {
        setA11yAnimations(true);
    }

    updateActiveButtons();
}

function updateActiveButtons() {
    // Resetear clases activas de botones
    document.querySelectorAll(".a11y-btn").forEach(btn => btn.classList.remove("active"));

    // Botones de Tema
    if (document.body.classList.contains("light-theme")) {
        const btn = document.getElementById("theme-btn-light");
        if (btn) btn.classList.add("active");
    } else {
        const btn = document.getElementById("theme-btn-dark");
        if (btn) btn.classList.add("active");
    }

    // Botones de Contraste
    if (document.body.classList.contains("high-contrast")) {
        const btn = document.getElementById("contrast-btn-on");
        if (btn) btn.classList.add("active");
    } else {
        const btn = document.getElementById("contrast-btn-off");
        if (btn) btn.classList.add("active");
    }

    // Botones de Letra
    if (document.body.classList.contains("font-scale-lg")) {
        const btn = document.getElementById("font-btn-lg");
        if (btn) btn.classList.add("active");
    } else if (document.body.classList.contains("font-scale-xl")) {
        const btn = document.getElementById("font-btn-lg");
        if (btn) btn.classList.add("active");
    } else {
        const btn = document.getElementById("font-btn-md");
        if (btn) btn.classList.add("active");
    }

    // Botones de Animaciones (Carga Rápida)
    if (isMycelium3DEnabled) {
        const btn = document.getElementById("anim-btn-off");
        if (btn) btn.classList.add("active");
    } else {
        const btn = document.getElementById("anim-btn-on");
        if (btn) btn.classList.add("active");
    }
}
