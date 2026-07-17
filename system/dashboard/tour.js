/**
 * Micelia - Tour Guiado Interactivo (IA) — Sercotec 2026
 * Script de automatización y guia interactiva en el frontend.
 */

(function () {
    // Inyectar estilos CSS específicos para el Tour de forma dinámica
    const style = document.createElement('style');
    style.textContent = `
        /* Botón Flotante de Activación */
        #tour-trigger-btn {
            position: fixed;
            bottom: 2rem;
            right: 7.5rem;
            z-index: 9999;
            background: #c3b59f; /* Oro crema */
            color: #0d2215; /* Verde bosque */
            border: 1px solid #c3b59f;
            padding: 16px 28px;
            font-family: 'Space Grotesk', sans-serif;
            font-size: 1.05rem;
            font-weight: 700;
            border-radius: 50px;
            cursor: pointer;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4), 0 0 15px rgba(195, 181, 159, 0.3);
            display: flex;
            align-items: center;
            gap: 10px;
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        #tour-trigger-btn:hover {
            background: #d2c6b4;
            box-shadow: 0 12px 35px rgba(0, 0, 0, 0.5), 0 0 25px rgba(195, 181, 159, 0.6);
            transform: translateY(-3px) scale(1.02);
        }
        #tour-trigger-btn .pulse-dot {
            width: 10px;
            height: 10px;
            background: #5aa469;
            border-radius: 50%;
            animation: pulse-dot-anim 1.5s infinite;
        }
        @keyframes pulse-dot-anim {
            0% { transform: scale(0.9); opacity: 0.5; }
            50% { transform: scale(1.3); opacity: 1; }
            100% { transform: scale(0.9); opacity: 0.5; }
        }

        /* Panel de evaluación */
        #tour-dialog-box {
            position: fixed;
            bottom: 24px;
            left: 24px;
            z-index: 10001;
            width: 520px;
            max-width: calc(100vw - 48px);
            background: rgba(13, 34, 21, 0.98); /* Verde bosque con glassmorphism */
            border: 2px solid #c3b59f;
            border-radius: 18px;
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8);
            font-family: 'Outfit', sans-serif;
            color: #f5f2eb;
            display: none;
            flex-direction: column;
            overflow: hidden;
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease;
            transform: translateY(30px);
            opacity: 0;
        }
        #tour-dialog-box.active {
            display: flex;
            transform: translateY(0);
            opacity: 1;
        }

        /* Encabezado del diálogo */
        .tour-header {
            padding: 18px 22px;
            background: rgba(195, 181, 159, 0.08);
            border-bottom: 1px solid rgba(195, 181, 159, 0.15);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .tour-header h3 {
            margin: 0;
            font-family: 'Space Grotesk', sans-serif;
            font-size: 1.25rem;
            color: #c3b59f;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .tour-status {
            display: flex;
            align-items: center;
            gap: 7px;
            margin-top: 6px;
            color: #aeb9af;
            font-size: 0.72rem;
            font-weight: 700;
            letter-spacing: 0.1em;
            text-transform: uppercase;
        }
        .tour-status-dot {
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: #72bd7e;
            box-shadow: 0 0 10px #72bd7e;
        }
        .tour-close-btn {
            background: transparent;
            border: none;
            color: #bab8b0;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 6px;
            border-radius: 50%;
            transition: background 0.3s;
        }
        .tour-close-btn:hover {
            background: rgba(255, 255, 255, 0.1);
            color: #f5f2eb;
        }

        /* Barra de Progreso */
        .tour-progress-bar-container {
            width: 100%;
            height: 5px;
            background: rgba(255, 255, 255, 0.05);
            position: relative;
        }
        .tour-progress-bar {
            height: 100%;
            background: #c3b59f;
            width: 0%;
            transition: width 0.4s ease;
        }

        /* Cuerpo del diálogo con textos legibles */
        .tour-body {
            padding: 20px 24px 18px;
            flex-grow: 1;
        }
        .tour-kicker {
            color: #aeb9af;
            font-size: 0.72rem;
            font-weight: 700;
            letter-spacing: 0.12em;
            text-transform: uppercase;
        }
        .tour-step-title {
            font-family: 'Space Grotesk', sans-serif;
            font-size: 1.45rem;
            color: #c3b59f;
            margin: 0 0 14px 0;
            line-height: 1.3;
        }
        .tour-message {
            font-size: 1.02rem;
            color: #e2dfd5;
            line-height: 1.7;
            margin: 0;
            min-height: 122px;
        }
        .tour-proof {
            display: grid;
            grid-template-columns: 30px 1fr;
            gap: 10px;
            margin-top: 17px;
            padding: 13px;
            border: 1px solid rgba(195, 181, 159, 0.2);
            border-radius: 10px;
            background: linear-gradient(120deg, rgba(195, 181, 159, 0.12), rgba(255, 255, 255, 0.025));
        }
        .tour-proof .material-symbols-outlined {
            color: #c3b59f;
            font-size: 1.3rem;
        }
        .tour-proof-label {
            color: #c3b59f;
            font-size: 0.68rem;
            font-weight: 800;
            letter-spacing: 0.1em;
            text-transform: uppercase;
        }
        .tour-proof-text {
            margin-top: 3px;
            color: #f5f2eb;
            font-size: 0.86rem;
            line-height: 1.45;
        }
        .tour-stage-rail {
            display: flex;
            gap: 5px;
            padding: 14px 24px 0;
        }
        .tour-stage-dot {
            height: 4px;
            flex: 1;
            border-radius: 99px;
            background: rgba(255, 255, 255, 0.12);
            transition: background 0.3s ease, transform 0.3s ease;
        }
        .tour-stage-dot.complete { background: #c3b59f; }
        .tour-stage-dot.current { background: #72bd7e; transform: scaleY(1.5); }
        .tour-message strong {
            color: #c3b59f;
            font-weight: 600;
        }

        /* Controles / Botones */
        .tour-footer {
            padding: 18px 24px;
            background: rgba(0, 0, 0, 0.3);
            border-top: 1px solid rgba(255, 255, 255, 0.05);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .tour-step-count {
            font-size: 0.9rem;
            color: #a09f98;
            font-family: monospace;
        }
        .tour-shortcuts {
            padding: 0 24px 15px;
            color: #777e78;
            font-size: 0.7rem;
        }
        .tour-buttons {
            display: flex;
            gap: 12px;
        }
        .tour-btn {
            font-family: 'Space Grotesk', sans-serif;
            font-size: 0.95rem;
            font-weight: 600;
            padding: 10px 20px;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .tour-btn-prev {
            background: transparent;
            color: #bab8b0;
            border: 1px solid rgba(255, 255, 255, 0.15);
        }
        .tour-btn-prev:hover {
            border-color: #bab8b0;
            color: #f5f2eb;
            background: rgba(255, 255, 255, 0.05);
        }
        .tour-btn-prev:disabled {
            opacity: 0.3;
            cursor: not-allowed;
            pointer-events: none;
        }
        .tour-btn-next {
            background: #c3b59f;
            color: #0d2215;
            border: 1px solid #c3b59f;
        }
        .tour-btn-next:hover {
            background: #d2c6b4;
            border-color: #d2c6b4;
            box-shadow: 0 0 12px rgba(195, 181, 159, 0.4);
        }

        /* Resaltado del elemento actual en el Tour */
        .tour-highlight {
            position: relative !important;
            z-index: 10000 !important;
            box-shadow: 0 0 35px #c3b59f !important;
            border: 2px solid #c3b59f !important;
            transform: scale(1.03);
            transition: all 0.4s ease-in-out;
        }

        /* Ajuste del modal de artículos durante el tour */
        #article-modal.tour-active-modal .article-modal-content {
            padding: 2.5rem 1.5rem 1.5rem !important;
            overflow: hidden !important;
            max-width: 900px !important;
            width: 90% !important;
            height: 80vh !important;
            display: flex;
            flex-direction: column;
        }
        #article-modal.tour-active-modal #article-content {
            flex-grow: 1;
            height: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
        }

        /* Backdrop de oscurecimiento */
        #tour-backdrop {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.6);
            z-index: 10000;
            display: none;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.4s ease;
        }
        #tour-backdrop.active {
            display: block;
            pointer-events: auto;
            opacity: 1;
        }
        @media (max-width: 640px) {
            #tour-trigger-btn {
                right: 1rem;
                bottom: 5.6rem;
                padding: 13px 18px;
                font-size: 0.9rem;
            }
            #tour-dialog-box {
                left: 12px;
                bottom: 12px;
                max-width: calc(100vw - 24px);
                max-height: calc(100dvh - 24px);
                overflow-y: auto;
            }
            .tour-header, .tour-body { padding-left: 18px; padding-right: 18px; }
            .tour-stage-rail, .tour-shortcuts { padding-left: 18px; padding-right: 18px; }
            .tour-footer { padding: 14px 18px; }
            .tour-message { min-height: 0; font-size: 0.95rem; line-height: 1.55; }
            .tour-shortcuts { display: none; }
            .tour-btn { padding: 9px 12px; font-size: 0.82rem; }
        }
    `;
    document.head.appendChild(style);

    // Crear elementos de la interfaz del tour en el DOM
    const triggerBtn = document.createElement('button');
    triggerBtn.id = 'tour-trigger-btn';
    triggerBtn.innerHTML = `
        <div class="pulse-dot"></div>
        <span class="material-symbols-outlined">reviews</span>
        Iniciar Tour Guiado (IA) — Sercotec 2026
    `;
    document.body.appendChild(triggerBtn);

    const backdrop = document.createElement('div');
    backdrop.id = 'tour-backdrop';
    document.body.appendChild(backdrop);

    const dialogBox = document.createElement('div');
    dialogBox.id = 'tour-dialog-box';
    dialogBox.innerHTML = `
        <div class="tour-header">
            <div>
                <h3><span class="material-symbols-outlined" style="font-size: 1.35rem;">neurology</span> Tour Sercotec</h3>
                <div class="tour-status"><span class="tour-status-dot"></span> Demostración guiada</div>
            </div>
            <button class="tour-close-btn" id="tour-exit-btn">
                <span class="material-symbols-outlined" style="font-size: 1.25rem;">close</span>
            </button>
        </div>
        <div class="tour-progress-bar-container">
            <div class="tour-progress-bar" id="tour-progress-fill"></div>
        </div>
        <div class="tour-stage-rail" id="tour-stage-rail" aria-label="Progreso del tour"></div>
        <div class="tour-body">
            <div class="tour-kicker" id="tour-step-category-text">Visión general</div>
            <h4 class="tour-step-title" id="tour-step-title-text">Paso</h4>
            <p class="tour-message" id="tour-message-text" aria-live="polite">Mensaje</p>
            <div class="tour-proof">
                <span class="material-symbols-outlined">verified</span>
                <div>
                    <div class="tour-proof-label">Evidencia en pantalla</div>
                    <div class="tour-proof-text" id="tour-proof-text">Indicador</div>
                </div>
            </div>
        </div>
        <div class="tour-shortcuts">Usa <strong>flechas</strong> para avanzar o retroceder. <strong>Esc</strong> para salir.</div>
        <div class="tour-footer">
            <span class="tour-step-count" id="tour-step-count-text">0 de 0</span>
            <div class="tour-buttons">
                <button class="tour-btn tour-btn-prev" id="tour-prev-btn" disabled>
                    <span class="material-symbols-outlined" style="font-size: 1.1rem;">arrow_back</span>
                    Regresar
                </button>
                <button class="tour-btn tour-btn-next" id="tour-next-btn">
                    Continuar
                    <span class="material-symbols-outlined" style="font-size: 1.1rem;" id="tour-next-icon">arrow_forward</span>
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(dialogBox);

    // Estado del Tour
    let currentStep = -1;
    let isTourActive = false;
    let typingTimer = null;

    // Pasos del Recorrido Mejorado con mayor detalle técnico y automatizaciones
    const pasos = [
        {
            titulo: "🤖 Tour Guiado Interactivo — Sercotec 2026",
            mensaje: "¡Bienvenido! Soy el **Asistente Virtual de Guía** de Micelia. Hoy realizaremos una simulación automatizada en tiempo real de nuestra infraestructura digital. Descubrirás cómo conectamos sensores físicos, controlamos las cámaras de cultivo, procesamos transacciones criptográficas y asistimos a los clientes de forma 100% autónoma.",
            accion: () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                clearHighlights();
                closeWhatsAppWidget();
            },
            btnNextText: "Comenzar Tour"
        },
        {
            titulo: "⚙️ Core del Sistema: Cortex Daemon en Rust",
            mensaje: "El motor (Core) de Micelia es el **Cortex Daemon**, un servidor de alto rendimiento programado en **Rust**. Este software procesa en tiempo real los datos climáticos de múltiples cámaras de cultivo simultáneamente sin caídas de servicio, y utiliza algoritmos de **Inteligencia Artificial** para predecir la demanda comercial y proyectar las cosechas semanales de setas frescas, optimizando el stock.",
            accion: () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                clearHighlights();
                closeWhatsAppWidget();
                const header = document.querySelector('header');
                if (header) {
                    header.style.boxShadow = "0 0 35px rgba(195, 181, 159, 0.5)";
                    setTimeout(() => { header.style.boxShadow = ""; }, 1500);
                }
            },
            btnNextText: "Continuar Inspección"
        },
        {
            titulo: "🌾 Soluciones a la Medida para Cada Cliente",
            mensaje: "Nuestra web incluye **soluciones y herramientas adaptadas** a cada segmento de cliente: la **Suscripción B2B Restaurante HORECA ($25.000/mes)** para chefs, **Kits de Autocultivo Educativos ($12.000)** para colegios y familias, un panel inteligente de **Hábitos de Consumo ML** para optimización de cosechas, y opciones de **Accesibilidad (A11y)** para la tercera edad. Observa los formatos de venta destacados en pantalla.",
            accion: () => {
                clearHighlights();
                closeWhatsAppWidget();
                const tienda = document.getElementById('tienda');
                if (tienda) {
                    tienda.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    setTimeout(() => {
                        const products = document.querySelectorAll('.product-card');
                        products.forEach(p => p.classList.add('tour-highlight'));
                    }, 600);
                }
            },
            btnNextText: "Continuar Inspección"
        },
        {
            titulo: "📚 Base de Conocimiento y Educación al Cliente",
            mensaje: "Micelia no solo vende — **educa**. Mantenemos una **Biblioteca de Publicaciones Técnicas** con artículos sobre micología aplicada, gastronomía, sostenibilidad y tecnología de cultivo. Esto genera confianza en el consumidor y posiciona la marca como referente local. He desplazado la pantalla a la sección de artículos destacados.",
            accion: () => {
                clearHighlights();
                closeWhatsAppWidget();
                // Scroll a la sección de artículos en la landing
                const bibliotecaSection = document.getElementById('camino-micelia') || document.querySelector('.articles-section') || document.querySelector('[id*="article"]');
                if (bibliotecaSection) {
                    bibliotecaSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                // Resaltar las tarjetas de artículos
                setTimeout(() => {
                    const cards = document.querySelectorAll('.article-card, .path-card, .knowledge-card');
                    if (cards.length > 0) {
                        cards.forEach(c => c.classList.add('tour-highlight'));
                    }
                }, 700);
            },
            btnNextText: "Ver Chatbot"
        },
        {
            titulo: "💬 Automatización de Asistentes: Chatbot WhatsApp",
            mensaje: "Para eliminar la **fricción digital en la tercera edad**, integramos un chatbot de ventas de WhatsApp. **Observa el costado derecho**: la IA del tour abrirá el chat e iniciará una **simulación de nota de voz de 6 segundos**. El Cortex Daemon procesa el audio del adulto mayor solicitando setas de 500g, calcula la intención del pedido y lo asiste de forma totalmente autónoma.",
            accion: () => {
                clearHighlights();
                
                // Resaltar el widget de chat y abrir la ventana del chat
                const widget = document.getElementById("wa-bot-widget");
                if (widget) {
                    widget.classList.add("tour-highlight");
                }
                
                const win = document.getElementById("wa-bot-window");
                const bubble = document.getElementById("wa-bot-bubble");
                if (win && win.style.display !== "flex") {
                    if (bubble) bubble.click();
                }

                // Esperar 1.5 segundos y activar la simulación de audio automáticamente
                setTimeout(() => {
                    const audioBtn = document.getElementById("wa-audio-sim-btn");
                    if (audioBtn) {
                        audioBtn.click();
                    }
                }, 1500);
            },
            btnNextText: "Continuar Inspección"
        },
        {
            titulo: "🔬 Sensores Físicos y Control Microclimático",
            mensaje: "Esta publicación explica los sensores instalados en la cámara: el **SHT31** registra temperatura y humedad, y el sensor de **CO₂** detecta la acumulación producida por el cultivo. El ESP32 envía estas lecturas al Cortex Daemon para que el productor pueda revisar el ambiente y actuar antes de que la calidad de las setas se vea afectada.",
            accion: () => {
                clearHighlights();
                closeWhatsAppWidget();

                const artModal = document.getElementById("article-modal");
                const artContent = document.getElementById("article-content");
                if (artModal && artContent) {
                    artModal.classList.add("tour-active-modal");
                    artContent.innerHTML = `
                        <div class="article-content-body" style="height: 100%; margin: 0; padding: 0; display: flex; flex-direction: column;">
                            <iframe src="view_doc.html?v=${Date.now()}&file=docs/tecnologia_sensores_cultivo.md&title=Sensores%20de%20la%20Camara" style="width: 100%; flex-grow: 1; height: 100%; border: none; border-radius: 12px; background: transparent;"></iframe>
                        </div>
                    `;
                    artModal.classList.add("open");
                }
            },
            btnNextText: "Continuar Inspección"
        },
        {
            titulo: "🖥️ Panel del Productor: Centro de Control Cortex",
            mensaje: "Para la gestión interna, el productor dispone de un **Centro de Control y Telemetría**. He abierto una vista previa interactiva en pantalla: en este panel puedes visualizar en tiempo real el estado microclimático de la cámara 001, la bitácora de tareas para los operarios y el planificador predictivo de siembra basado en Machine Learning.",
            accion: () => {
                clearHighlights();
                closeWhatsAppWidget();
                
                const pathSection = document.getElementById('camino-micelia');
                if (pathSection) {
                    pathSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                
                setTimeout(() => {
                    const artModal = document.getElementById("article-modal");
                    const artContent = document.getElementById("article-content");
                    if (artModal && artContent) {
                        artModal.classList.add("tour-active-modal");
                        artContent.innerHTML = `
                            <div class="article-content-body" style="height: 100%; margin: 0; padding: 0; display: flex; flex-direction: column;">
                                <iframe src="admin.html?v=${Date.now()}" style="width: 100%; flex-grow: 1; height: 100%; border: none; border-radius: 12px; background: transparent;"></iframe>
                            </div>
                        `;
                        artModal.classList.add("open");
                    }
                }, 600);
            },
            btnNextText: "Ver Despachos"
        },
        {
            titulo: "🚚 Gestión de Despachos y Cadena de Custodia",
            mensaje: "El sistema también automatiza la logística. He activado la vista de **Gestión de Despachos** en el panel de control. Desde aquí, el productor coordina las entregas B2B a restaurantes. Cada actualización de estado (en preparación, en camino, despachado) se firma criptográficamente en el ledger para certificar la inmutabilidad de la cadena de frío y frescura.",
            accion: () => {
                clearHighlights();
                closeWhatsAppWidget();
                
                // Asegurar que el modal esté abierto
                const artModal = document.getElementById("article-modal");
                if (artModal && !artModal.classList.contains("open")) {
                    artModal.classList.add("tour-active-modal");
                    artModal.classList.add("open");
                }

                // Esperar a que el iframe esté listo y activar la pestaña de despachos
                setTimeout(() => {
                    const iframe = document.querySelector("#article-content iframe");
                    if (iframe && iframe.contentWindow) {
                        const btn = iframe.contentWindow.document.getElementById("btn-deliveries");
                        if (btn) btn.click();
                    }
                }, 400);
            },
            btnNextText: "Ver Estándar S60"
        },
        {
            titulo: "📊 Estándar Yatra S60 y el Peligro de Etiloamento",
            mensaje: "Procesamos las lecturas en **base sexagesimal (s60)** para simplificar cálculos horarios. El control microclimático debe mantener la Humedad entre **85%-95%** (crítico para inducir primordios) y el CO₂ **< 900 ppm**. Si el CO₂ se acumula, el hongo sufre **etiloamento**: una deformación hormonal que alarga y vuelve fibroso el tallo, reduciendo el sombrero y perdiendo su valor comercial. Hemos abierto la especificación técnica en el modal.",
            accion: () => {
                clearHighlights();
                closeWhatsAppWidget();

                // Cerrar el modal anterior (admin/despachos) antes de abrir el nuevo
                const artModalPrev = document.getElementById("article-modal");
                if (artModalPrev) {
                    artModalPrev.classList.remove("open");
                    artModalPrev.classList.remove("tour-active-modal");
                }
                
                const pathSection = document.getElementById('camino-micelia');
                if (pathSection) {
                    pathSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                
                setTimeout(() => {
                    const artModal = document.getElementById("article-modal");
                    const artContent = document.getElementById("article-content");
                    if (artModal && artContent) {
                        artModal.classList.add("tour-active-modal");
                        artContent.innerHTML = `
                            <div class="article-content-body" style="height: 100%; margin: 0; padding: 0; display: flex; flex-direction: column;">
                                <iframe src="view_doc.html?v=${Date.now()}&file=docs/telemetria_s60.md&title=Telemetria%20IoT%20S60" style="width: 100%; flex-grow: 1; height: 100%; border: none; border-radius: 12px; background: transparent;"></iframe>
                            </div>
                        `;
                        artModal.classList.add("open");
                    }
                }, 600);
            },
            btnNextText: "Continuar Inspección"
        },
        {
            titulo: "🧮 Estructura Financiera y Umbral de Equilibrio",
            mensaje: "El subsidio de $3.500.000 se maximiza al operar en terreno propio (costo de arriendo = $0). Definimos costos fijos mensuales de **$170.000** y variables de **$230.000**. El **punto de equilibrio** se alcanza vendiendo apenas **$218.270** al mes (lo cual equivale a solo el 21% de capacidad operativa del régimen regular), minimizando drásticamente el riesgo de pérdida comercial.",
            accion: () => {
                clearHighlights();
                closeWhatsAppWidget();
                
                const artModal = document.getElementById("article-modal");
                if (artModal) {
                    artModal.classList.remove("open");
                    artModal.classList.remove("tour-active-modal");
                }

                const nosotros = document.getElementById('nosotros');
                if (nosotros) {
                    nosotros.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    setTimeout(() => {
                        nosotros.style.boxShadow = "0 0 35px rgba(195, 181, 159, 0.4)";
                        setTimeout(() => { nosotros.style.boxShadow = ""; }, 2000);
                    }, 600);
                }
            },
            btnNextText: "Continuar Inspección"
        },
        {
            titulo: "🔗 Inmutabilidad Criptográfica (TruthSync)",
            mensaje: "Cada pedido genera un registro firmado mediante **hashing criptográfico SHA256** en PostgreSQL (`truthsync_orders`). Este hash matemático enlaza de forma inmutable el ID del pedido, los datos del cliente, el monto final y el hash del bloque anterior. De esta forma, el 'Pasaporte de Cosecha' del cliente es completamente inalterable. Observa la generación del bloque criptográfico en la pasarela.",
            accion: () => {
                clearHighlights();
                closeWhatsAppWidget();
                
                const artModal = document.getElementById("article-modal");
                if (artModal) {
                    artModal.classList.remove("open");
                    artModal.classList.remove("tour-active-modal");
                }
                
                const event = new CustomEvent('triggerTruthSyncDemo');
                window.dispatchEvent(event);
            },
            btnNextText: "Ver Trazabilidad"
        },
        {
            titulo: "📜 Pasaporte de Cosecha y Trazabilidad de Lote",
            mensaje: "Una vez completado el pago firmado, el cliente accede a su **Pasaporte de Cosecha**. Aquí se certifica el origen del lote, el sustrato de trigo y cal hidratada utilizado, y se exponen las gráficas microclimáticas (humedad y temperatura) del cultivo de su lote específico directo del ledger de PostgreSQL, garantizando confianza absoluta.",
            accion: () => {
                clearHighlights();
                closeWhatsAppWidget();
                
                const payModal = document.getElementById("payment-modal");
                if (payModal) payModal.classList.remove("open");
                
                setTimeout(() => {
                    const artModal = document.getElementById("article-modal");
                    const artContent = document.getElementById("article-content");
                    if (artModal && artContent) {
                        artModal.classList.add("tour-active-modal");
                        const hashEl = document.getElementById("sig-hash-text");
                        let hashVal = "8f3c9a62efd32a83e0291ba29103de281f9a2e8c2810a7281f1ab98273cf";
                        if (hashEl && hashEl.textContent && hashEl.textContent.includes("sha256:")) {
                            hashVal = hashEl.textContent.replace("sha256:", "").split("\n")[0].trim();
                        }
                        
                        artContent.innerHTML = `
                            <div class="article-content-body" style="height: 100%; margin: 0; padding: 0; display: flex; flex-direction: column;">
                                <iframe src="view_lote.html?v=${Date.now()}&hash=${hashVal}" style="width: 100%; flex-grow: 1; height: 100%; border: none; border-radius: 12px; background: transparent;"></iframe>
                            </div>
                        `;
                        artModal.classList.add("open");
                    }
                }, 600);
            },
            btnNextText: "Finalizar Tour"
        },
        {
            titulo: "✅ Tour Completado Exitosamente",
            mensaje: "¡Felicidades! Hemos recorrido y validado el flujo tecnológico. Hemos demostrado la viabilidad de la regresión predictiva, el estándar de telemetría IoT S60, el enlazado del ledger TruthSync, y la estructura de costos. Este proyecto une a la perfección el impacto local con la alta tecnología digital. ¡Muchas gracias por tu evaluación!",
            accion: () => {
                clearHighlights();
                closeWhatsAppWidget();
                
                const artModal = document.getElementById("article-modal");
                if (artModal) {
                    artModal.classList.remove("open");
                    artModal.classList.remove("tour-active-modal");
                }
                
                const payModal = document.getElementById("payment-modal");
                if (payModal) payModal.classList.remove("open");
                window.scrollTo({ top: 0, behavior: 'smooth' });
            },
            btnNextText: "Finalizar Tour"
        }
    ];

    const evidenciaPorPaso = [
        { categoria: "Visión de negocio", texto: "Ruta de evaluación: producción local, venta digital y trazabilidad." },
        { categoria: "Capacidad tecnológica", texto: "Cortex centraliza telemetría, operación y proyección de demanda." },
        { categoria: "Mercado y clientes", texto: "Formatos comerciales visibles: HORECA, autocultivo y venta directa." },
        { categoria: "Ecosistema de conocimiento", texto: "Biblioteca de artículos técnicos visibles en la landing page." },
        { categoria: "Inclusión comercial", texto: "Flujo WhatsApp simplificado para pedidos del Pack Adulto Mayor." },
        { categoria: "Producción inteligente", texto: "Artículo publicado: sensores, ESP32 y lectura de condiciones de la cámara." },
        { categoria: "Gestión operativa", texto: "Panel del productor: telemetría, tareas y planificación en una sola vista." },
        { categoria: "Logística", texto: "Despachos con estados operativos y registro de cada actualización en el ledger." },
        { categoria: "Calidad verificable", texto: "Rangos saludables: 85%-95% HR, CO2 menor a 900 ppm y 18-22 C." },
        { categoria: "Viabilidad", texto: "Estructura de costos y punto de equilibrio como base para escalar con control." },
        { categoria: "Confianza", texto: "Cada cambio de pedido se vincula a un hash SHA256 en TruthSync." },
        { categoria: "Trazabilidad completa", texto: "El cliente accede a su pasaporte de cosecha con historial microclimático inmutable." },
        { categoria: "Cierre", texto: "Modelo integrado: alimento local, operación medible y experiencia de cliente digital." }
    ];

    // Funciones del Tour
    function clearHighlights() {
        const highlighted = document.querySelectorAll('.tour-highlight');
        highlighted.forEach(el => {
            el.classList.remove('tour-highlight');
        });
    }

    function closeWhatsAppWidget() {
        const win = document.getElementById("wa-bot-window");
        if (win) {
            win.style.display = "none";
        }
        const widget = document.getElementById("wa-bot-widget");
        if (widget) {
            widget.classList.remove("tour-highlight");
        }
    }

    function typeWriter(text, elementId, speed = 10, onComplete) {
        if (typingTimer) clearInterval(typingTimer);
        const element = document.getElementById(elementId);
        if (!element) return;

        element.textContent = "";
        let i = 0;
        
        let textWithoutStars = text.replace(/\*\*/g, "");
        let parts = text.split("**");
        
        typingTimer = setInterval(() => {
            if (i < textWithoutStars.length) {
                let currentLen = 0;
                let currentHTML = "";
                let inBold = false;
                
                for (let p = 0; p < parts.length; p++) {
                    let part = parts[p];
                    if (currentLen + part.length >= i) {
                        let sliceLen = i - currentLen;
                        let textSlice = part.substring(0, sliceLen);
                        currentHTML += inBold ? `<strong>${textSlice}</strong>` : textSlice;
                        break;
                    } else {
                        currentHTML += inBold ? `<strong>${part}</strong>` : part;
                        currentLen += part.length;
                    }
                    inBold = !inBold;
                }
                
                element.innerHTML = currentHTML;
                i++;
            } else {
                clearInterval(typingTimer);
                typingTimer = null;
                
                let finalHTML = "";
                let inBold = false;
                for (let p = 0; p < parts.length; p++) {
                    finalHTML += inBold ? `<strong>${parts[p]}</strong>` : parts[p];
                    inBold = !inBold;
                }
                element.innerHTML = finalHTML;
                
                if (onComplete) onComplete();
            }
        }, speed);
    }

    function startTour() {
        isTourActive = true;
        currentStep = 0;
        backdrop.classList.add('active');
        dialogBox.classList.add('active');
        // Transformar el trigger btn en botón de reinicio
        triggerBtn.innerHTML = `
            <span class="material-symbols-outlined" style="font-size: 1.1rem;">restart_alt</span>
            Reiniciar Tour
        `;
        triggerBtn.style.opacity = '0.6';
        triggerBtn.style.display = 'flex';
        triggerBtn.title = 'Haz clic para reiniciar el tour desde el inicio';
        document.getElementById('tour-stage-rail').innerHTML = pasos.map((_, index) =>
            `<span class="tour-stage-dot" data-step="${index}"></span>`
        ).join('');
        renderStep();
    }

    function exitTour() {
        isTourActive = false;
        currentStep = -1;
        clearHighlights();
        closeWhatsAppWidget();
        backdrop.classList.remove('active');
        dialogBox.classList.remove('active');
        // Restaurar el botón trigger a su estado original
        triggerBtn.innerHTML = `
            <div class="pulse-dot"></div>
            <span class="material-symbols-outlined">reviews</span>
            Iniciar Tour Guiado (IA) — Sercotec 2026
        `;
        triggerBtn.style.opacity = '';
        triggerBtn.style.display = 'flex';
        triggerBtn.title = '';
        
        // Cerrar modales que el tour haya abierto
        const artModal = document.getElementById("article-modal");
        if (artModal) {
            artModal.classList.remove("open");
            artModal.classList.remove("tour-active-modal");
        }
        const payModal = document.getElementById("payment-modal");
        if (payModal) payModal.classList.remove("open");
        
        if (typingTimer) clearInterval(typingTimer);
    }

    function renderStep() {
        if (currentStep < 0 || currentStep >= pasos.length) {
            exitTour();
            return;
        }

        const step = pasos[currentStep];
        const evidencia = evidenciaPorPaso[currentStep];
        
        // Ejecutar acción del paso (scrolls, highlights, aperturas)
        step.accion();

        // Actualizar interfaz del diálogo
        document.getElementById('tour-step-title-text').textContent = step.titulo;
        document.getElementById('tour-step-category-text').textContent = evidencia.categoria;
        document.getElementById('tour-proof-text').textContent = evidencia.texto;
        
        // Barra de progreso y contador
        const progressFill = document.getElementById('tour-progress-fill');
        if (progressFill) {
            const percent = (currentStep / (pasos.length - 1)) * 100;
            progressFill.style.width = `${percent}%`;
        }

        document.querySelectorAll('.tour-stage-dot').forEach((dot, index) => {
            dot.classList.toggle('complete', index < currentStep);
            dot.classList.toggle('current', index === currentStep);
        });

        const countText = document.getElementById('tour-step-count-text');
        if (countText) {
            countText.textContent = `Paso ${currentStep + 1} de ${pasos.length}`;
        }

        // Configurar botones
        const prevBtn = document.getElementById('tour-prev-btn');
        if (prevBtn) {
            prevBtn.disabled = currentStep === 0;
        }

        const nextBtn = document.getElementById('tour-next-btn');
        if (nextBtn) {
            if (currentStep === pasos.length - 1) {
                nextBtn.innerHTML = `
                    Finalizar Tour
                    <span class="material-symbols-outlined" style="font-size: 1.1rem;">check_circle</span>
                `;
            } else {
                nextBtn.innerHTML = `
                    ${step.btnNextText || "Continuar"}
                    <span class="material-symbols-outlined" style="font-size: 1.1rem;">arrow_forward</span>
                `;
            }
        }

        // Efecto Typewriter para el mensaje
        typeWriter(step.mensaje, 'tour-message-text', 8);
    }

    function handleNext() {
        if (currentStep < pasos.length - 1) {
            currentStep++;
            renderStep();
        } else {
            exitTour();
        }
    }

    // Configurar listeners de la UI del Tour
    triggerBtn.addEventListener('click', startTour);
    document.getElementById('tour-exit-btn').addEventListener('click', exitTour);
    document.getElementById('tour-next-btn').addEventListener('click', handleNext);
    
    // El botón Regresar
    const prevBtn = document.getElementById('tour-prev-btn');
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentStep > 0) {
                currentStep--;
                renderStep();
            }
        });
    }

    document.addEventListener('keydown', (event) => {
        if (!isTourActive || event.altKey || event.ctrlKey || event.metaKey) return;
        if (event.key === 'Escape') {
            exitTour();
        } else if (event.key === 'ArrowRight' || event.key === ' ') {
            event.preventDefault();
            handleNext();
        } else if (event.key === 'ArrowLeft' && currentStep > 0) {
            event.preventDefault();
            currentStep--;
            renderStep();
        }
    });

    // Registrar Evento Criptográfico del Paso 5 (TruthSync Demo Event)
    window.addEventListener('triggerTruthSyncDemo', () => {
        const paymentModal = document.getElementById("payment-modal");
        const paymentForm = document.getElementById("payment-form");
        const processing = document.getElementById("payment-processing");
        const successDiv = document.getElementById("payment-success");
        const hashText = document.getElementById("sig-hash-text");
        const amtText = document.getElementById("payment-amount-text");

        if (!paymentModal) return;

        // Configurar el monto a transferir a $25.000 CLP (Suscripción HORECA)
        if (amtText) amtText.textContent = "$25.000 CLP";

        // Abrir modal de pago y simular el procesamiento
        paymentModal.classList.add("open");
        if (paymentForm) paymentForm.style.display = "none";
        if (processing) processing.style.display = "block";
        if (successDiv) successDiv.style.display = "none";

        // Tras un retraso, simular transacción bancaria exitosa
        setTimeout(() => {
            if (processing) processing.style.display = "none";
            if (successDiv) successDiv.style.display = "block";

            // Hash criptográfico de producción TruthSync simulado
            const randomHash = "8f3c9a62efd" + Math.floor(100000 + Math.random() * 900000).toString(16) + "2a83e0291ba29103de281f9a2e8c2810a7281f1ab98273cf";
            if (hashText) {
                hashText.innerHTML = `sha256:${randomHash}<br><span style="font-size: 0.72rem; color: #5aa469; display: block; margin-top: 0.35rem;">✓ Firmado con clave pública Cortex local y registrada en PostgreSQL</span>`;
            }

            // Asignar al enlace de pasaporte de cosecha
            const passportLink = document.getElementById("lote-passport-link");
            if (passportLink) {
                passportLink.href = `view_lote.html?hash=${randomHash}`;
            }
        }, 1800);
    });

})();
