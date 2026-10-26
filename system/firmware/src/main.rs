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
    // TODO: inicializar el runtime y los periféricos del modelo ESP32 elegido.
    loop {}
}

// En el host, este crate no simula sensores. El simulador vive separado para
// que datos sintéticos no se confundan con telemetría del firmware real.
#[cfg(not(target_os = "none"))]
fn main() {
    eprintln!("Este crate está reservado para firmware de hardware. Para pruebas locales ejecuta: cargo run -p firmware-sim");
}
