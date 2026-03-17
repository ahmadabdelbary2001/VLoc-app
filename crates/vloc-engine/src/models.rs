use serde::{Deserialize, Serialize};

use crate::error::{EngineError, EngineResult};

#[derive(Debug, Clone, Copy, PartialEq, Serialize, Deserialize, specta::Type)]
pub struct Coordinates {
    pub lat: f64,
    pub lng: f64,
    pub altitude: Option<f64>,
}

impl Coordinates {
    /// Create new coordinates, ensuring valid latitude/longitude bounds
    pub fn new(lat: f64, lng: f64) -> EngineResult<Self> {
        if !(-90.0..=90.0).contains(&lat) {
            return Err(EngineError::InvalidCoordinate(format!("Latitude must be between -90 and 90. Got {}", lat)));
        }
        if !(-180.0..=180.0).contains(&lng) {
            return Err(EngineError::InvalidCoordinate(format!("Longitude must be between -180 and 180. Got {}", lng)));
        }
        
        Ok(Self { lat, lng, altitude: None })
    }

    pub fn with_altitude(mut self, alt: f64) -> Self {
        self.altitude = Some(alt);
        self
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, specta::Type)]
pub struct Route {
    pub waypoints: Vec<Coordinates>,
    pub is_loop: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize, specta::Type)]
pub struct SpoofingState {
    pub is_active: bool,
    pub current_location: Option<Coordinates>,
    pub current_speed_kmh: f32,
    pub remaining_distance_meters: Option<f64>,
}
