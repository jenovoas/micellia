use s60::S60;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Scenario {
    Stable,
    PressureDrop,
}

#[derive(Debug, Deserialize, Serialize, PartialEq, Eq)]
pub struct TelemetryFrame {
    pub cell_id: String,
    pub temp_raw: i64,
    pub hum_raw: i64,
    pub co2_raw: i64,
    pub diff_press_raw: i64,
}

impl TelemetryFrame {
    pub fn to_json_line(&self) -> Result<Vec<u8>, serde_json::Error> {
        let mut line = serde_json::to_vec(self)?;
        line.push(b'\n');
        Ok(line)
    }
}

pub fn sample(cell_id: &str, tick: u64, scenario: Scenario) -> TelemetryFrame {
    let temp_c = 19.5 + (tick % 7) as f64 * 0.05 - 0.15;
    let humidity_pct = 92.0 + (tick % 5) as f64 * 0.1 - 0.2;
    let co2_ppm = 780.0 + (tick % 9) as f64 * 5.0 - 20.0;
    let pressure_raw = match scenario {
        Scenario::Stable => 2160,
        Scenario::PressureDrop if tick % 40 >= 37 => 350,
        Scenario::PressureDrop => 2160,
    };

    TelemetryFrame {
        cell_id: cell_id.to_owned(),
        temp_raw: S60::from_f64(temp_c).raw(),
        hum_raw: S60::from_f64(humidity_pct).raw(),
        co2_raw: S60::from_f64(co2_ppm).raw(),
        diff_press_raw: pressure_raw,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn samples_are_deterministic_and_use_s60_raw_values() {
        let first = sample("cell_test", 12, Scenario::Stable);
        let second = sample("cell_test", 12, Scenario::Stable);

        assert_eq!(first, second);
        assert_eq!(
            first.temp_raw,
            S60::from_f64(19.5 + (12 % 7) as f64 * 0.05 - 0.15).raw()
        );
        assert_eq!(first.diff_press_raw, 2160);
    }

    #[test]
    fn pressure_drop_scenario_emits_alert_value_only_in_its_window() {
        assert_eq!(
            sample("cell_test", 36, Scenario::PressureDrop).diff_press_raw,
            2160
        );
        assert_eq!(
            sample("cell_test", 37, Scenario::PressureDrop).diff_press_raw,
            350
        );
        assert_eq!(
            sample("cell_test", 39, Scenario::PressureDrop).diff_press_raw,
            350
        );
        assert_eq!(
            sample("cell_test", 40, Scenario::PressureDrop).diff_press_raw,
            2160
        );
    }

    #[test]
    fn frames_are_json_lines() {
        let line = sample("cell_test", 0, Scenario::Stable)
            .to_json_line()
            .unwrap();
        assert_eq!(line.last(), Some(&b'\n'));
        let frame: TelemetryFrame = serde_json::from_slice(&line).unwrap();
        assert_eq!(frame.cell_id, "cell_test");
    }
}
