#![cfg_attr(not(feature = "std"), no_std)]

use core::ops::{Add, AddAssign, Sub, SubAssign, Mul, MulAssign, Div, DivAssign, Neg};
use core::fmt;

/// S60 representa un número en base sexagesimal con precisión determinista de tres niveles (Tercios: 1/216,000).
/// Esto evita por completo la acumulación de errores de punto flotante en sistemas biológicos críticos.
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Default)]
pub struct S60 {
    /// Valor bruto almacenado como cantidad de "Tercios" (1/216000 de unidad).
    raw: i64,
}

impl S60 {
    /// Escala base: 60^3 = 216,000 tercios por unidad.
    pub const SCALE: i64 = 216_000;
    pub const ZERO: Self = Self { raw: 0 };
    pub const ONE: Self = Self { raw: Self::SCALE };

    /// Crea una nueva instancia de S60 a partir de sus componentes sexagesimales.
    /// `units` puede ser negativo; `minutes`, `seconds` y `thirds` deben ser positivos (rango 0-59).
    pub const fn from_parts(units: i64, minutes: u8, seconds: u8, thirds: u8) -> Self {
        let sign = if units >= 0 { 1 } else { -1 };
        let abs_units = if units >= 0 { units } else { -units };
        
        let raw = sign * (
            abs_units * Self::SCALE +
            (minutes as i64) * 3600 +
            (seconds as i64) * 60 +
            (thirds as i64)
        );
        Self { raw }
    }

    /// Crea un valor S60 a partir del valor bruto directo (en tercios).
    pub const fn from_raw(raw: i64) -> Self {
        Self { raw }
    }

    /// Obtiene el valor bruto interno (en tercios).
    pub const fn raw(&self) -> i64 {
        self.raw
    }

    /// Descompone el valor S60 en sus partes constituyentes: (unidades, minutos, segundos, tercios).
    pub const fn to_parts(&self) -> (i64, u8, u8, u8) {
        let abs_raw = if self.raw >= 0 { self.raw } else { -self.raw };
        let units = abs_raw / Self::SCALE;
        let remainder = abs_raw % Self::SCALE;
        
        let minutes = (remainder / 3600) as u8;
        let remainder = remainder % 3600;
        
        let seconds = (remainder / 60) as u8;
        let thirds = (remainder % 60) as u8;
        
        let signed_units = if self.raw < 0 { -units } else { units };
        (signed_units, minutes, seconds, thirds)
    }

    /// Crea un valor S60 a partir de unidades enteras.
    pub const fn from_units(units: i64) -> Self {
        Self { raw: units * Self::SCALE }
    }

    /// Convierte el valor S60 a f64. Útil únicamente para telemetría externa o
    /// APIs de presentación. Prohibido su uso en bucles de control interno.
    #[cfg(feature = "std")]
    pub fn to_f64(&self) -> f64 {
        self.raw as f64 / Self::SCALE as f64
    }

    /// Convierte un f64 a S60, redondeando al tercio sexagesimal más cercano.
    /// Útil para la ingesta inicial de sensores analógicos de terceros.
    #[cfg(feature = "std")]
    pub fn from_f64(val: f64) -> Self {
        let raw = (val * Self::SCALE as f64).round() as i64;
        Self { raw }
    }
}

// --- Implementación de operaciones aritméticas estándar ---

impl Add for S60 {
    type Output = Self;
    fn add(self, rhs: Self) -> Self::Output {
        Self { raw: self.raw + rhs.raw }
    }
}

impl AddAssign for S60 {
    fn add_assign(&mut self, rhs: Self) {
        self.raw += rhs.raw;
    }
}

impl Sub for S60 {
    type Output = Self;
    fn sub(self, rhs: Self) -> Self::Output {
        Self { raw: self.raw - rhs.raw }
    }
}

impl SubAssign for S60 {
    fn sub_assign(&mut self, rhs: Self) {
        self.raw -= rhs.raw;
    }
}

impl Neg for S60 {
    type Output = Self;
    fn neg(self) -> Self::Output {
        Self { raw: -self.raw }
    }
}

// Multiplicación escalar (por enteros)
impl Mul<i64> for S60 {
    type Output = Self;
    fn mul(self, rhs: i64) -> Self::Output {
        Self { raw: self.raw * rhs }
    }
}

impl MulAssign<i64> for S60 {
    fn mul_assign(&mut self, rhs: i64) {
        self.raw *= rhs;
    }
}

// División escalar (por enteros)
impl Div<i64> for S60 {
    type Output = Self;
    fn div(self, rhs: i64) -> Self::Output {
        Self { raw: self.raw / rhs }
    }
}

impl DivAssign<i64> for S60 {
    fn div_assign(&mut self, rhs: i64) {
        self.raw /= rhs;
    }
}

// Formateo para depuración y presentación
impl fmt::Display for S60 {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let (u, m, s, t) = self.to_parts();
        write!(f, "{}\u{00B0} {}' {}\" {}'''", u, m, s, t)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_conversion() {
        let val = S60::from_parts(15, 30, 0, 0); // 15.5
        assert_eq!(val.raw, 15 * S60::SCALE + 30 * 3600);
        let (u, m, s, t) = val.to_parts();
        assert_eq!(u, 15);
        assert_eq!(m, 30);
        assert_eq!(s, 0);
        assert_eq!(t, 0);
    }

    #[test]
    fn test_negative_conversion() {
        let val = S60::from_parts(-5, 10, 15, 30);
        let (u, m, s, t) = val.to_parts();
        assert_eq!(u, -5);
        assert_eq!(m, 10);
        assert_eq!(s, 15);
        assert_eq!(t, 30);
    }

    #[test]
    fn test_arithmetic() {
        let val1 = S60::from_parts(1, 45, 0, 0);
        let val2 = S60::from_parts(2, 20, 0, 0);
        let sum = val1 + val2;
        let (u, m, s, t) = sum.to_parts();
        assert_eq!(u, 4);
        assert_eq!(m, 5);
        assert_eq!(s, 0);
        assert_eq!(t, 0);
    }
}
