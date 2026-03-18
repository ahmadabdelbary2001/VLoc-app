use serde::{Deserialize, Serialize};

use crate::error::{EngineError, EngineResult};

/// Representation of a specific geographical location.
/// 
/// **Why**: Needed for all simulation and map operations. 
/// We use f64 for high-precision GPS coordinate storage.
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

#[derive(Debug, Clone, Copy, Serialize, Deserialize, specta::Type, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum EndOfRouteBehavior {
    Stop,
    Restart,
    Reverse,
}

/// Defines a planned path for simulation.
/// 
/// **Why**: Houses the waypoint collection and loop settings required by the Simulator.
#[derive(Debug, Clone, Serialize, Deserialize, specta::Type)]
pub struct Route {
    pub waypoints: Vec<Coordinates>,
    pub end_behavior: EndOfRouteBehavior,
}

/// Encapsulates the complete status of the spoofing engine at a point in time.
/// 
/// **Why**: This is the primary data structure synced between Rust and the React UI.
#[derive(Debug, Clone, Serialize, Deserialize, specta::Type)]
pub struct SpoofingState {
    pub is_active: bool,
    pub current_location: Option<Coordinates>,
    pub current_speed_kmh: f32,
    pub remaining_distance_meters: Option<f64>,
    pub inaccuracy_meters: f32,
}
