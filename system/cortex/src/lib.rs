use pyo3::prelude::*;

/// Función expuesta a Python para convertir un valor raw S60 a string legible.
#[pyfunction]
fn s60_to_string(raw: i64) -> PyResult<String> {
    let val = s60::S60::from_raw(raw);
    Ok(format!("{}", val))
}

/// Calcula una proyección de regresión lineal (mínimos cuadrados) en base a un histórico de ventas.
/// Retorna (pendiente, intersección) para realizar proyecciones en Python.
#[pyfunction]
fn predict_sales(days: Vec<f64>, amounts: Vec<f64>) -> PyResult<(f64, f64)> {
    if days.len() != amounts.len() || days.is_empty() {
        return Err(pyo3::exceptions::PyValueError::new_err("Los vectores deben ser de igual longitud y no vacíos."));
    }

    let n = days.len() as f64;
    let sum_x = days.iter().sum::<f64>();
    let sum_y = amounts.iter().sum::<f64>();
    let sum_xy = days.iter().zip(amounts.iter()).map(|(x, y)| x * y).sum::<f64>();
    let sum_xx = days.iter().map(|x| x * x).sum::<f64>();

    let denominator = n * sum_xx - sum_x * sum_x;
    if denominator == 0.0 {
        return Ok((0.0, sum_y / n));
    }

    let slope = (n * sum_xy - sum_x * sum_y) / denominator;
    let intercept = (sum_y - slope * sum_x) / n;

    Ok((slope, intercept))
}

/// Módulo Python 'cortex' construido mediante PyO3.
#[pymodule]
fn cortex(m: &Bound<'_, PyModule>) -> PyResult<()> {
    m.add_function(wrap_pyfunction!(s60_to_string, m)?)?;
    m.add_function(wrap_pyfunction!(predict_sales, m)?)?;
    Ok(())
}
