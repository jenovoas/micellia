#![cfg_attr(target_os = "none", no_std)]
#![cfg_attr(target_os = "none", no_main)]

// Manejo de pánico para entornos bare-metal (no_std)
#[cfg(target_os = "none")]
use core::panic::PanicInfo;

#[cfg(target_os = "none")]
#[panic_handler]
fn panic(_info: &PanicInfo) -> ! {
    loop {}
}

#[cfg(target_os = "none")]
#[no_mangle]
pub extern "C" fn _start() -> ! {
    // Inicialización real de hardware del nodo de cultivo IoT
    loop {}
}

// ==========================================================================
// SIMULACIÓN EN HOST (Sistemas con std: Linux, macOS, Windows)
// ==========================================================================
#[cfg(not(target_os = "none"))]
use std::{
    io::{Read, Write},
    net::TcpStream,
    thread,
    time::Duration,
};

#[cfg(not(target_os = "none"))]
fn main() {
    println!("Firmware del Nodo IoT: Iniciando simulador de sensores (Yatra / S60)...");
    
    let server_addr = "127.0.0.1:4000";
    
    loop {
        println!("Intentando conectar con Cortex Daemon en {}...", server_addr);
        match TcpStream::connect(server_addr) {
            Ok(mut stream) => {
                println!("¡Conectado exitosamente con Cortex!");
                run_sensor_simulation(&mut stream);
            }
            Err(e) => {
                eprintln!("Error al conectar con Cortex: {}. Reintentando en 3 segundos...", e);
                thread::sleep(Duration::from_secs(3));
            }
        }
    }
}

#[cfg(not(target_os = "none"))]
fn run_sensor_simulation(stream: &mut TcpStream) {
    let mut temp = 19.5;
    let mut hum = 92.15;
    let mut co2 = 780.0;
    
    let mut loop_count: u64 = 0;

    // Configurar timeout de lectura para que no se bloquee indefinidamente
    let _ = stream.set_read_timeout(Some(Duration::from_millis(100)));

    loop {
        loop_count += 1;

        // Flucutación natural de sensores
        temp += (loop_count % 3) as f64 * 0.05 - 0.05;
        hum += (loop_count % 2) as f64 * 0.1 - 0.05;
        co2 += (loop_count % 5) as f64 * 5.0 - 10.0;

        // Limitar rangos
        if temp < 15.0 { temp = 15.0; }
        if temp > 25.0 { temp = 25.0; }
        if hum < 80.0 { hum = 80.0; }
        if hum > 98.0 { hum = 98.0; }
        if co2 < 400.0 { co2 = 400.0; }
        if co2 > 1500.0 { co2 = 1500.0; }

        // Simular caída de presión diferencial (obstrucción HEPA / falla de extractor)
        // Cada 40 segundos, la presión cae a 300 tercios (error MIP) por 3 segundos.
        let diff_press_raw = if loop_count % 40 >= 37 {
            println!("Simulador: [ALERTA] Generando caída de presión diferencial (falla de flujo)...");
            350 // Menor a 500 tercios (desencadena alerta en Cortex)
        } else {
            2160 // Normal (~0.01 unidades de presión)
        };

        // Convertir a valores S60 brutos (raw)
        let temp_raw = (temp * 216000.0) as i64;
        let hum_raw = (hum * 216000.0) as i64;
        let co2_raw = (co2 * 216000.0) as i64;

        // Serialización manual ultraliviana a JSON compatible con Cortex
        let payload = format!(
            "{{\"cell_id\":\"cell_001\",\"temp_raw\":{},\"hum_raw\":{},\"co2_raw\":{},\"diff_press_raw\":{}}}",
            temp_raw, hum_raw, co2_raw, diff_press_raw
        );

        println!(
            "Sensor: T={:.2}°C ({}) | H={:.2}% ({}) | CO2={:.0}ppm | P_Diff={}",
            temp, temp_raw, hum, hum_raw, co2, diff_press_raw
        );

        if let Err(e) = stream.write_all(payload.as_bytes()) {
            eprintln!("Error al enviar telemetría: {}. Cerrando conexión.", e);
            break;
        }
        
        // Intentar leer respuestas/comandos de actuadores de Cortex (no bloqueante)
        let mut response_buf = [0; 256];
        if let Ok(n) = stream.read(&mut response_buf) {
            if n > 0 {
                let msg = String::from_utf8_lossy(&response_buf[..n]);
                println!("Actuador comando recibido de Cortex: {}", msg);
            }
        }

        thread::sleep(Duration::from_secs(1));
    }
}
