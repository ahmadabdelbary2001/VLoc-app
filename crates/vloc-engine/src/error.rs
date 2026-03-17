use serde::Serialize;
use thiserror::Error;

/// Core domain errors for the VLoc simulation engine
#[derive(Debug, Error, Serialize, specta::Type)]
#[serde(tag = "type", content = "message")]
pub enum EngineError {
    #[error("Invalid coordinate values provided: {0}")]
    InvalidCoordinate(String),

    #[error("Speed cannot be negative or zero")]
    InvalidSpeed,

    #[error("Route must contain at least two waypoints")]
    InvalidRoute,

    #[error("Engine simulation failed to start: {0}")]
    SimulationFailed(String),
}

pub type EngineResult<T> = Result<T, EngineError>;
