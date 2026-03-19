use serde::Serialize;
use thiserror::Error;

/// Core domain errors for the VLoc simulation engine.
/// 
/// **Why**: Centralizes error management to ensure consistent behavior across the 
/// engine and provides serialized error states for the frontend.
#[derive(Debug, Error, Serialize, specta::Type)]
#[serde(tag = "type", content = "message")]
pub enum EngineError {
    /// Provided latitude or longitude is out of Earth's physical bounds.
    #[error("Invalid coordinate values provided: {0}")]
    InvalidCoordinate(String),

    /// Speed value is physically impossible or zero.
    #[error("Speed cannot be negative or zero")]
    InvalidSpeed,

    /// Insufficient waypoints to calculate a path.
    #[error("Route must contain at least one waypoint")]
    InvalidRoute,

    /// General failure in starting the simulation environment.
    #[error("Engine simulation failed to start: {0}")]
    SimulationFailed(String),
}

pub type EngineResult<T> = Result<T, EngineError>;
