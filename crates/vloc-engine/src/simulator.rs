use crate::error::{EngineError, EngineResult};
use crate::math::{calculate_bearing, calculate_destination, haversine_distance};
use crate::models::{Coordinates, Route, SpoofingState};

pub struct Simulator {
    route: Route,
    state: SpoofingState,
    current_waypoint_idx: usize,
}

impl Simulator {
    pub fn new(route: Route, initial_speed_kmh: f32) -> EngineResult<Self> {
        if initial_speed_kmh <= 0.0 {
            return Err(EngineError::InvalidSpeed);
        }

        if route.waypoints.len() < 2 {
            return Err(EngineError::InvalidRoute);
        }

        let current_location = route.waypoints.first().copied();

        Ok(Self {
            route,
            state: SpoofingState {
                is_active: false,
                current_location,
                current_speed_kmh: initial_speed_kmh,
                remaining_distance_meters: None, // Could pre-calculate total route distance here
            },
            current_waypoint_idx: 0,
        })
    }

    pub fn start(&mut self) {
        self.state.is_active = true;
    }

    pub fn stop(&mut self) {
        self.state.is_active = false;
    }

    pub fn get_state(&self) -> &SpoofingState {
        &self.state
    }

    pub fn set_speed(&mut self, speed_kmh: f32) -> EngineResult<()> {
        if speed_kmh <= 0.0 {
            return Err(EngineError::InvalidSpeed);
        }
        self.state.current_speed_kmh = speed_kmh;
        Ok(())
    }

    /// Advances the simulation by a given time delta (in seconds).
    /// Returns the new Coordinates if active, or None if inactive/finished.
    pub fn tick(&mut self, delta_seconds: f64) -> Option<Coordinates> {
        if !self.state.is_active {
            return None;
        }

        let mut current_loc = self.state.current_location?;
        let mut distance_to_travel_m = (self.state.current_speed_kmh as f64 * 1000.0 / 3600.0) * delta_seconds;

        // Move along waypoints until distance is consumed or route ends
        while distance_to_travel_m > 0.0 {
            let next_idx = self.current_waypoint_idx + 1;
            
            if next_idx >= self.route.waypoints.len() {
                if self.route.is_loop {
                    self.current_waypoint_idx = 0;
                    current_loc = self.route.waypoints[0];
                    continue;
                } else {
                    // Reached end of route
                    self.stop();
                    self.state.current_location = Some(current_loc);
                    return Some(current_loc);
                }
            }

            let next_waypoint = &self.route.waypoints[next_idx];
            let dist_to_next = haversine_distance(&current_loc, next_waypoint);

            if distance_to_travel_m >= dist_to_next {
                // Overshot or reached exactly - snap to waypoint and subtract distance
                distance_to_travel_m -= dist_to_next;
                current_loc = *next_waypoint;
                self.current_waypoint_idx = next_idx;
            } else {
                // Move partially towards next waypoint
                let bearing = calculate_bearing(&current_loc, next_waypoint);
                current_loc = calculate_destination(&current_loc, distance_to_travel_m, bearing);
                distance_to_travel_m = 0.0; // Finished this tick
            }
        }

        self.state.current_location = Some(current_loc);
        Some(current_loc)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn create_test_route() -> Route {
        Route {
            waypoints: vec![
                Coordinates::new(0.0, 0.0).unwrap(),
                Coordinates::new(0.0, 1.0).unwrap(), // Approx 111km East
            ],
            is_loop: false,
        }
    }

    #[test]
    fn test_simulator_initialization() {
        let route = create_test_route();
        let sim = Simulator::new(route, 60.0).unwrap();
        
        assert_eq!(sim.get_state().current_speed_kmh, 60.0);
        assert!(!sim.get_state().is_active);
    }

    #[test]
    fn test_invalid_speed() {
        let route = create_test_route();
        let result = Simulator::new(route, -10.0);
        assert!(result.is_err());
    }

    #[test]
    fn test_tick_advancement() {
        let route = create_test_route();
        // 3600 km/h = 1000 m/s (very fast for testing)
        let mut sim = Simulator::new(route, 3600.0).unwrap();
        sim.start();

        // Tick 1 second (should move 1000 meters East)
        let loc = sim.tick(1.0).unwrap();
        assert!(loc.lng > 0.0); // Moved East
        assert!((loc.lat - 0.0).abs() < 1e-10); // Stayed on Equator
    }

    #[test]
    fn test_route_completion() {
        let route = create_test_route();
        // 1,000,000 km/h to instantly finish the 111km route in one tick
        let mut sim = Simulator::new(route, 1_000_000.0).unwrap();
        sim.start();

        let _ = sim.tick(1.0);
        
        // Should have stopped because it reached the end of the non-looping route
        assert!(!sim.get_state().is_active);
        let current_loc = sim.get_state().current_location.unwrap();
        assert_eq!(current_loc.lng, 1.0); // Snapped to final waypoint
    }
}
