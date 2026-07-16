use std::sync::Arc;
use tokio::net::{TcpListener as TokioTcpListener, TcpStream};
use tokio::sync::broadcast;
use tokio::sync::RwLock;
use tokio::io::AsyncReadExt;
use serde::{Serialize, Deserialize};
use axum::{
    routing::{get, put},
    Router,
    extract::ws::{WebSocketUpgrade, WebSocket, Message},
    response::IntoResponse,
    Json,
};
use tower_http::cors::CorsLayer;

// Configuración por defecto
const TCP_PORT: u16 = 4000;
const HTTP_PORT: u16 = 8080;
const PG_URL: &str = "postgresql://postgres:postgres@localhost:5432/micelia";
const REDIS_URL: &str = "redis://127.0.0.1:6379/";

// Estado del cultivo y la cámara autónoma
#[derive(Debug, Clone, Serialize, Deserialize)]
struct ChamberState {
    cell_id: String,
    current_state: String,
    temp_raw: i64,
    hum_raw: i64,
    co2_raw: i64,
    diff_press_raw: i64,
    damper_closed: bool,
    extractor_active: bool,
}

impl Default for ChamberState {
    fn default() -> Self {
        Self {
            cell_id: "cell_001".to_string(),
            current_state: "FRUCTIFICACION".to_string(),
            temp_raw: (19.5 * 216000.0) as i64, // ~19.5°C
            hum_raw: (92.15 * 216000.0) as i64, // ~92.15%
            co2_raw: 780 * 216000,           // 780 ppm
            diff_press_raw: 2160,            // 0.01 units
            damper_closed: false,
            extractor_active: true,
        }
    }
}

// Telemetría entrante de los sensores del firmware
#[derive(Debug, Deserialize, Serialize, Clone)]
struct TelemetryPayload {
    cell_id: String,
    temp_raw: i64,
    hum_raw: i64,
    co2_raw: i64,
    diff_press_raw: i64,
}

// Acciones solicitadas por el dashboard
#[derive(Debug, Deserialize)]
struct DashboardAction {
    action: String, // "next_state", "trigger_alert"
}

struct AppState {
    chamber: RwLock<ChamberState>,
    tx: broadcast::Sender<serde_json::Value>,
    pg_client: Option<tokio_postgres::Client>,
    redis_client: Option<redis::aio::Connection>,
}

#[tokio::main]
async fn main() {
    println!("Cortex daemon de Micelia inicializado.");

    // Conexión opcional a base de datos PostgreSQL (TruthSync)
    let pg_client = match tokio_postgres::connect(PG_URL, tokio_postgres::NoTls).await {
        Ok((client, connection)) => {
            tokio::spawn(async move {
                if let Err(e) = connection.await {
                    eprintln!("Error de conexión en Postgres: {}", e);
                }
            });
            println!("TruthSync: Conectado a PostgreSQL en {}", PG_URL);
            
            // Crear tabla de ledger si no existe
            let _ = client.execute(
                "CREATE TABLE IF NOT EXISTS truthsync_ledger (
                    id SERIAL PRIMARY KEY,
                    timestamp TIMESTAMPTZ DEFAULT NOW(),
                    cell_id TEXT,
                    state_from TEXT,
                    state_to TEXT,
                    signature TEXT
                )",
                &[]
            ).await;
            
            // Crear tabla de pedidos si no existe
            let _ = client.execute(
                "CREATE TABLE IF NOT EXISTS truthsync_orders (
                    id SERIAL PRIMARY KEY,
                    timestamp TIMESTAMPTZ DEFAULT NOW(),
                    customer_name TEXT,
                    customer_email TEXT,
                    items TEXT,
                    total_amount INT,
                    status TEXT DEFAULT 'Procesando',
                    signature TEXT
                )",
                &[]
            ).await;

            // Ejecutar migración para agregar columna status en caso de que ya exista la tabla vieja
            let _ = client.execute(
                "ALTER TABLE truthsync_orders ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Procesando'",
                &[]
            ).await;
            Some(client)
        }
        Err(_) => {
            println!("TruthSync: Operando en modo 'Ledger local simulado' (Postgres offline)");
            None
        }
    };

    // Conexión opcional a Redis (Caché de estado)
    let redis_conn = match redis::Client::open(REDIS_URL) {
        Ok(client) => match client.get_tokio_connection().await {
            Ok(conn) => {
                println!("State Cache: Conectado a Redis en {}", REDIS_URL);
                Some(conn)
            }
            Err(_) => {
                println!("State Cache: Operando en modo 'Caché local simulado' (Redis offline)");
                None
            }
        },
        Err(_) => {
            println!("State Cache: Operando en modo 'Caché local simulado' (Redis offline)");
            None
        }
    };

    // Inicializar estado compartido y canal de transmisión
    let (tx, _) = broadcast::channel(100);
    let app_state = Arc::new(AppState {
        chamber: RwLock::new(ChamberState::default()),
        tx,
        pg_client,
        redis_client: redis_conn,
    });

    // Clonar estado para las distintas tareas
    let state_tcp = app_state.clone();
    let state_http = app_state.clone();

    // 1. Iniciar Servidor TCP para Firmware del Nodo (Puerto 4000)
    tokio::spawn(async move {
        let listener = TokioTcpListener::bind(format!("127.0.0.1:{}", TCP_PORT)).await.unwrap();
        println!("TCP Listener: Escuchando firmware en el puerto {}", TCP_PORT);

        loop {
            if let Ok((socket, addr)) = listener.accept().await {
                let state = state_tcp.clone();
                tokio::spawn(async move {
                    handle_node_connection(socket, addr, state).await;
                });
            }
        }
    });

    // 2. Iniciar Servidor API Axum y WebSockets (Puerto 8080)
    let app = Router::new()
        .route("/ws", get(ws_handler))
        .route("/api/orders", get(get_orders).post(create_order))
        .route("/api/orders/status", put(update_order_status))
        .fallback_service(tower_http::services::ServeDir::new("../dashboard"))
        .layer(CorsLayer::permissive())
        .with_state(state_http);

    let listener_http = tokio::net::TcpListener::bind(format!("0.0.0.0:{}", HTTP_PORT)).await.unwrap();
    println!("API Gateway: Servidor HTTP/WebSocket listo en http://localhost:{}", HTTP_PORT);
    axum::serve(listener_http, app).await.unwrap();
}

// Manejar conexiones TCP del firmware
async fn handle_node_connection(mut socket: TcpStream, addr: std::net::SocketAddr, state: Arc<AppState>) {
    println!("TCP Listener: Nodo conectado desde {}", addr);
    let mut buf = [0; 1024];

    loop {
        match socket.read(&mut buf).await {
            Ok(0) => {
                println!("TCP Listener: Nodo desconectado {}", addr);
                break;
            }
            Ok(n) => {
                let data = &buf[..n];
                if let Ok(telemetry) = serde_json::from_slice::<TelemetryPayload>(data) {
                    // Procesar telemetría y aplicar reglas MIP/Yatra
                    let mut chamber = state.chamber.write().await;
                    chamber.temp_raw = telemetry.temp_raw;
                    chamber.hum_raw = telemetry.hum_raw;
                    chamber.co2_raw = telemetry.co2_raw;
                    chamber.diff_press_raw = telemetry.diff_press_raw;

                    // Regla de Control de CO2 (Umbral de 800 ppm)
                    let co2_ppm = telemetry.co2_raw / 216000;
                    chamber.extractor_active = co2_ppm > 800;

                    // Regla de Control de Presión Diferencial (Prevención de Trichoderma)
                    // Si cae por debajo de 500 tercios (equivalente a 0.0023 unidades de presión)
                    if telemetry.diff_press_raw < 500 && chamber.current_state != "CONTAMINACION_ALERTA" && chamber.current_state != "SANITIZACION" {
                        let old_state = chamber.current_state.clone();
                        chamber.current_state = "CONTAMINACION_ALERTA".to_string();
                        chamber.damper_closed = true;
                        println!("MIP ALERT: ¡Pérdida de flujo de aire detectada! Hermetización activa. Transición: {} -> CONTAMINACION_ALERTA", old_state);
                        
                        // Guardar en el ledger de TruthSync
                        log_state_transition(&state, &chamber.cell_id, &old_state, "CONTAMINACION_ALERTA").await;
                    }

                    // Actualizar caché de Redis
                    if let Some(ref _conn) = state.redis_client {
                        // En desarrollo simulamos la escritura sin bloquear
                    }

                    // Transmitir actualización al canal WebSocket
                    let _ = state.tx.send(serde_json::to_value(chamber.clone()).unwrap());
                }
            }
            Err(e) => {
                eprintln!("TCP Listener Error: {}", e);
                break;
            }
        }
    }
}

#[derive(Debug, Deserialize, Serialize, Clone)]
struct OrderPayload {
    customer_name: String,
    customer_email: String,
    items: String,
    total_amount: i32,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
struct OrderStatusPayload {
    order_id: i32,
    new_status: String,
}

// Obtener todas las órdenes registradas
async fn get_orders(
    axum::extract::State(state): axum::extract::State<Arc<AppState>>,
) -> impl IntoResponse {
    let mut orders = Vec::new();

    if let Some(ref pg) = state.pg_client {
        let rows = pg.query(
            "SELECT id, timestamp::text, customer_name, customer_email, items, total_amount, status, signature FROM truthsync_orders ORDER BY id DESC",
            &[]
        ).await;
        if let Ok(rows_list) = rows {
            for row in rows_list {
                let id: i32 = row.get(0);
                let timestamp: String = row.get(1);
                let customer_name: String = row.get(2);
                let customer_email: String = row.get(3);
                let items: String = row.get(4);
                let total_amount: i32 = row.get(5);
                let status: String = row.get(6);
                let signature: String = row.get(7);

                orders.push(serde_json::json!({
                    "id": id,
                    "timestamp": timestamp,
                    "customer_name": customer_name,
                    "customer_email": customer_email,
                    "items": items,
                    "total_amount": total_amount,
                    "status": status,
                    "signature": signature
                }));
            }
        }
    } else {
        // En desarrollo local sin Postgres, retornamos una de prueba
        orders.push(serde_json::json!({
            "id": 1,
            "timestamp": "2026-07-16 00:00:00",
            "customer_name": "María González",
            "customer_email": "maria@ejemplo.com",
            "items": "Hongo Ostra Fresco 500g x1 (Despacho: Prat 123)",
            "total_amount": 4500,
            "status": "Procesando",
            "signature": "sha256:mock_initial_order_signature_12345"
        }));
    }

    axum::Json(orders)
}

// Manejador para crear un nuevo pedido
async fn create_order(
    axum::extract::State(state): axum::extract::State<Arc<AppState>>,
    Json(payload): Json<OrderPayload>,
) -> impl IntoResponse {
    let order_data = format!("{}{}{}", payload.customer_email, payload.items, payload.total_amount);
    let signature = format!("sha256:{}", zmij::sha256(order_data));
    
    println!("TruthSync Order Ledger: Registrando pedido de {} (Firma: {})", payload.customer_name, signature);

    let mut new_id = 1;

    if let Some(ref pg) = state.pg_client {
        let res = pg.query(
            "INSERT INTO truthsync_orders (customer_name, customer_email, items, total_amount, signature) VALUES ($1, $2, $3, $4, $5) RETURNING id",
            &[
                &payload.customer_name,
                &payload.customer_email,
                &payload.items,
                &payload.total_amount,
                &signature,
            ]
        ).await;
        match res {
            Ok(rows) => {
                if !rows.is_empty() {
                    new_id = rows[0].get(0);
                }
            }
            Err(e) => {
                eprintln!("TruthSync Order Error: No se pudo escribir en PostgreSQL: {}", e);
            }
        }
    } else {
        // Generar un ID local mock basado en la hora del sistema para evitar colisiones locales
        new_id = (std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs() % 10000) as i32;
    }

    // Broadcast del evento del pedido a todos los dashboards conectados por WS
    let order_msg = serde_json::json!({
        "type": "order",
        "id": new_id,
        "customer_name": payload.customer_name,
        "total_amount": payload.total_amount,
        "signature": signature
    });
    let _ = state.tx.send(order_msg);

    axum::Json(serde_json::json!({
        "status": "success",
        "id": new_id,
        "signature": signature
    }))
}

// Manejador para actualizar el estado de despacho de un pedido
async fn update_order_status(
    axum::extract::State(state): axum::extract::State<Arc<AppState>>,
    Json(payload): Json<OrderStatusPayload>,
) -> impl IntoResponse {
    let order_data = format!("{}{}", payload.order_id, payload.new_status);
    let signature = format!("sha256:{}", zmij::sha256(order_data));
    
    println!("TruthSync Delivery Ledger: Actualizando pedido #{} a {} (Firma: {})", payload.order_id, payload.new_status, signature);

    let mut update_ok = false;

    if let Some(ref pg) = state.pg_client {
        let res = pg.execute(
            "UPDATE truthsync_orders SET status = $1, signature = $2 WHERE id = $3",
            &[&payload.new_status, &signature, &payload.order_id]
        ).await;
        match res {
            Ok(rows) => {
                if rows > 0 {
                    update_ok = true;
                }
            }
            Err(e) => {
                eprintln!("TruthSync Update Error: No se pudo escribir en PostgreSQL: {}", e);
            }
        }
    } else {
        // En desarrollo local sin Postgres, simulamos que siempre tiene éxito
        update_ok = true;
    }

    if update_ok {
        // Broadcast de la actualización a todos por WebSocket
        let update_msg = serde_json::json!({
            "type": "order_status_update",
            "order_id": payload.order_id,
            "new_status": payload.new_status,
            "signature": signature
        });
        let _ = state.tx.send(update_msg);
    }

    axum::Json(serde_json::json!({
        "status": if update_ok { "success" } else { "error" },
        "signature": signature
    }))
}

// Manejador del canal de WebSockets
async fn ws_handler(ws: WebSocketUpgrade, axum::extract::State(state): axum::extract::State<Arc<AppState>>) -> impl IntoResponse {
    ws.on_upgrade(|socket| handle_websocket(socket, state))
}

async fn handle_websocket(mut socket: WebSocket, state: Arc<AppState>) {
    println!("WebSocket: Cliente del Dashboard conectado.");
    
    // Enviar estado actual al conectar
    let current_chamber = {
        let chamber = state.chamber.read().await;
        chamber.clone()
    };
    if let Ok(json) = serde_json::to_string(&current_chamber) {
        let _ = socket.send(Message::Text(json)).await;
    }

    let mut rx = state.tx.subscribe();

    // Bucle duplex para leer comandos del dashboard y enviar telemetría en tiempo real
    loop {
        tokio::select! {
            // Recibir actualizaciones de estado del canal interno
            Ok(msg_val) = rx.recv() => {
                if let Ok(json) = serde_json::to_string(&msg_val) {
                    if socket.send(Message::Text(json)).await.is_err() {
                        break;
                    }
                }
            }
            // Recibir acciones/comandos desde el dashboard web
            Some(result) = socket.recv() => {
                match result {
                    Ok(Message::Text(text)) => {
                        if let Ok(action) = serde_json::from_str::<DashboardAction>(&text) {
                            let mut chamber = state.chamber.write().await;
                            let old_state = chamber.current_state.clone();
                            
                            if action.action == "next_state" {
                                if chamber.current_state == "CONTAMINACION_ALERTA" {
                                    chamber.current_state = "PREPARACION".to_string();
                                    chamber.damper_closed = false;
                                    log_state_transition(&state, &chamber.cell_id, &old_state, "PREPARACION").await;
                                } else {
                                    let order = vec![
                                        "PREPARACION", "INCUBACION", "INDUCCION", "FRUCTIFICACION", "COSECHA", "SANITIZACION"
                                    ];
                                    if let Some(idx) = order.iter().position(|&x| x == chamber.current_state) {
                                        let next_idx = (idx + 1) % order.len();
                                        let next_state = order[next_idx].to_string();
                                        chamber.current_state = next_state.clone();
                                        log_state_transition(&state, &chamber.cell_id, &old_state, &next_state).await;
                                    }
                                }
                            } else if action.action == "trigger_alert" {
                                if chamber.current_state != "CONTAMINACION_ALERTA" {
                                    chamber.current_state = "CONTAMINACION_ALERTA".to_string();
                                    chamber.damper_closed = true;
                                    log_state_transition(&state, &chamber.cell_id, &old_state, "CONTAMINACION_ALERTA").await;
                                }
                            }
                            
                            // Retransmitir estado actualizado
                            let _ = state.tx.send(serde_json::to_value(chamber.clone()).unwrap());
                        }
                    }
                    _ => break,
                }
            }
        }
    }
    println!("WebSocket: Cliente del Dashboard desconectado.");
}

// Escribir en el ledger inmutable de TruthSync
async fn log_state_transition(state: &AppState, cell_id: &str, from: &str, to: &str) {
    let mock_signature = format!("sha256:{}", zmij::sha256(format!("{}{}{}", cell_id, from, to)));
    println!("TruthSync Ledger: Registrando cambio {} -> {} (Firma: {})", from, to, mock_signature);

    if let Some(ref pg) = state.pg_client {
        let res = pg.execute(
            "INSERT INTO truthsync_ledger (cell_id, state_from, state_to, signature) VALUES ($1, $2, $3, $4)",
            &[&cell_id.to_string(), &from.to_string(), &to.to_string(), &mock_signature]
        ).await;
        if let Err(e) = res {
            eprintln!("TruthSync Error: No se pudo escribir en PostgreSQL: {}", e);
        }
    }
}

// Proveer la función sha256 usando un mock simple o una función sha256 real
mod zmij {
    use sha2::{Sha256, Digest};

    pub fn sha256(data: String) -> String {
        let mut hasher = Sha256::new();
        hasher.update(data.as_bytes());
        let result = hasher.finalize();
        format!("{:x}", result)
    }
}
