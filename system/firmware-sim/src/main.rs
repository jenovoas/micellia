mod model;

use clap::{Parser, ValueEnum};
use model::{sample, Scenario};
use std::{
    error::Error,
    io::{self, Write},
    net::{SocketAddr, TcpStream, ToSocketAddrs},
    thread,
    time::Duration,
};

#[derive(Debug, Parser)]
#[command(about = "Genera telemetría sintética para pruebas locales de Cortex")]
struct Args {
    #[arg(long, default_value = "127.0.0.1")]
    host: String,
    #[arg(long, default_value_t = 4000)]
    port: u16,
    #[arg(long, default_value = "cell_001")]
    cell_id: String,
    #[arg(long, default_value_t = 1000, value_parser = clap::value_parser!(u64).range(1..))]
    interval_ms: u64,
    #[arg(long, value_enum, default_value_t = ScenarioArg::Stable)]
    scenario: ScenarioArg,
    #[arg(long)]
    once: bool,
}

#[derive(Debug, Clone, Copy, ValueEnum)]
enum ScenarioArg {
    Stable,
    PressureDrop,
}

impl From<ScenarioArg> for Scenario {
    fn from(value: ScenarioArg) -> Self {
        match value {
            ScenarioArg::Stable => Self::Stable,
            ScenarioArg::PressureDrop => Self::PressureDrop,
        }
    }
}

fn main() -> Result<(), Box<dyn Error>> {
    let args = Args::parse();
    let destination = validate_args(&args)?;
    let address = destination.to_string();
    let mut tick = 0;
    let mut retry_delay = Duration::from_secs(1);

    loop {
        match TcpStream::connect(destination) {
            Ok(mut stream) => {
                stream.set_nodelay(true)?;
                eprintln!("Conectado a Cortex en {address}; fuente=SINTÉTICA");
                retry_delay = Duration::from_secs(1);

                loop {
                    let frame = sample(&args.cell_id, tick, args.scenario.into());
                    let line = frame.to_json_line()?;
                    if let Err(error) = stream.write_all(&line) {
                        eprintln!(
                            "Conexión interrumpida ({error}); reintentando en {retry_delay:?}"
                        );
                        break;
                    }

                    println!(
                        "SINTÉTICO cell={} tick={} temp_raw={} hum_raw={} co2_raw={} pressure_raw={}",
                        frame.cell_id,
                        tick,
                        frame.temp_raw,
                        frame.hum_raw,
                        frame.co2_raw,
                        frame.diff_press_raw
                    );
                    tick += 1;

                    if args.once {
                        return Ok(());
                    }
                    thread::sleep(Duration::from_millis(args.interval_ms));
                }
            }
            Err(error) => {
                if args.once {
                    return Err(error.into());
                }
                eprintln!(
                    "No se pudo conectar a {address} ({error}); reintentando en {retry_delay:?}"
                );
            }
        }

        if args.once {
            return Err(io::Error::new(
                io::ErrorKind::ConnectionAborted,
                "no se pudo enviar la muestra",
            )
            .into());
        }

        thread::sleep(retry_delay);
        retry_delay = (retry_delay * 2).min(Duration::from_secs(30));
    }
}

fn validate_args(args: &Args) -> Result<SocketAddr, Box<dyn Error>> {
    if args.cell_id.trim().is_empty() || args.cell_id.len() > 64 {
        return Err("--cell-id debe tener entre 1 y 64 bytes".into());
    }

    let addresses: Vec<_> = (args.host.as_str(), args.port).to_socket_addrs()?.collect();
    if addresses.is_empty() || addresses.iter().any(|address| !address.ip().is_loopback()) {
        return Err("el simulador solo permite destinos loopback".into());
    }

    Ok(addresses[0])
}

#[cfg(test)]
mod tests {
    use super::{validate_args, Args, ScenarioArg};
    use std::net::Ipv4Addr;

    fn args(host: &str) -> Args {
        Args {
            host: host.to_owned(),
            port: 4000,
            cell_id: "cell_test".to_owned(),
            interval_ms: 1000,
            scenario: ScenarioArg::Stable,
            once: true,
        }
    }

    #[test]
    fn pins_loopback_destination() {
        let destination = validate_args(&args("127.0.0.1")).unwrap();
        assert_eq!(destination.ip(), Ipv4Addr::LOCALHOST);
    }

    #[test]
    fn rejects_non_loopback_destinations() {
        assert!(validate_args(&args("192.0.2.1")).is_err());
    }
}
