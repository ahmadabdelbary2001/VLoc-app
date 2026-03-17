//! VLoc Core Engine
//! 
//! **Overview**: This crate houses the pure mathematical and simulation logic for 
//! high-precision GPS spoofing. It is platform-agnostic and independently tested.
//! 
//! **Modules**:
//! - `error`: Engine-specific error types and results.
//! - `math`: Geodesic and spherical trigonometric calculations.
//! - `models`: Core data structures used across the monorepo.
//! - `simulator`: The stateful simulation engine.

pub mod error;
pub mod math;
pub mod models;
pub mod simulator;
