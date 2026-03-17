use crate::error::{EngineError, EngineResult};
use crate::math::{calculate_bearing, calculate_destination, haversine_distance};
use crate::models::{Coordinates, Route, SpoofingState, EndOfRouteBehavior};

/// Main simulation engine responsible for coordinate interpolation and route management.
pub struct Simulator {
    /// Ordered list of coordinates to be traversed.
    route: Route,
    /// Current internal state of the simulation.
    state: SpoofingState,
    /// Tracks the current segment being traversed in the route.
    current_waypoint_idx: usize,
    /// Whether we're currently moving backwards in Reverse mode.
    is_reversing: bool,
}

impl Simulator {
    /// Initializes a new simulator with a validated route and speed.
    /// 
    /// **How**: Checks if the speed is positive and the route contains enough points 
    /// to form at least one segment.
    pub fn new(route: Route, initial_speed_kmh: f32) -> EngineResult<Self> {
        if initial_speed_kmh <= 0.0 {
            return Err(EngineError::InvalidSpeed);
        }

        if route.waypoints.len() < 1 {
            return Err(EngineError::InvalidRoute);
        }

        let current_location = route.waypoints.first().copied();

        Ok(Self {
            route,
            state: SpoofingState {
                is_active: false,
                current_location,
                current_speed_kmh: initial_speed_kmh,
                remaining_distance_meters: None,
            },
            current_waypoint_idx: 0,
            is_reversing: false,
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

    /// Advances the simulation by a given time delta.
    pub fn tick(&mut self, delta_seconds: f64) -> Option<Coordinates> {
        if !self.state.is_active {
            return None;
        }

        let mut current_loc = self.state.current_location?;
        
        // Special Case: 1-point Static Simulation
        // Stay active indefinitely at that coordinate.
        if self.route.waypoints.len() < 2 {
            return Some(current_loc);
        }

        let mut distance_travel_m = (self.state.current_speed_kmh as f64 * 1000.0 / 3600.0) * delta_seconds;

        while distance_travel_m > 0.0 {
            // Determine the next target waypoint based on direction
            let at_end = if !self.is_reversing {
                self.current_waypoint_idx + 1 >= self.route.waypoints.len()
            } else {
                self.current_waypoint_idx == 0
            };

            if at_end {
                match self.route.end_behavior {
                    EndOfRouteBehavior::Restart => {
                        self.current_waypoint_idx = 0;
                        current_loc = self.route.waypoints[0];
                        self.is_reversing = false;
                        continue;
                    }
                    EndOfRouteBehavior::Reverse => {
                        self.is_reversing = !self.is_reversing;
                        // Safety: we already checked waypoints.len() < 2 above
                        continue;
                    }
                    EndOfRouteBehavior::Stop => {
                        self.stop();
                        self.state.current_location = Some(current_loc);
                        return Some(current_loc);
                    }
                }
            }

            let next_idx = if !self.is_reversing {
                self.current_waypoint_idx + 1
            } else {
                self.current_waypoint_idx - 1
            };

            let next_waypoint = &self.route.waypoints[next_idx];
            let dist_to_next = haversine_distance(&current_loc, next_waypoint);

            if distance_travel_m >= dist_to_next {
                distance_travel_m -= dist_to_next;
                current_loc = *next_waypoint;
                self.current_waypoint_idx = next_idx;
            } else {
                let bearing = calculate_bearing(&current_loc, next_waypoint);
                current_loc = calculate_destination(&current_loc, distance_travel_m, bearing);
                distance_travel_m = 0.0;
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
                Coordinates::new(0.0, 1.0).unwrap(), // Approx 111.19km East
            ],
            end_behavior: EndOfRouteBehavior::Stop,
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
        // 3600 km/h = 1000 m/s 
        let mut sim = Simulator::new(route, 3600.0).unwrap();
        sim.start();

        let loc = sim.tick(1.0).unwrap();
        assert!(loc.lng > 0.0); 
        assert!((loc.lat - 0.0).abs() < 1e-10); 
    }

    #[test]
    fn test_route_stop_behavior() {
        let route = create_test_route();
        // 500k km/h to reach end in one tick
        let mut sim = Simulator::new(route, 500_000.0).unwrap();
        sim.start();

        let _ = sim.tick(1.0);
        
        assert!(!sim.get_state().is_active);
        let current_loc = sim.get_state().current_location.unwrap();
        assert_eq!(current_loc.lng, 1.0); 
    }

    #[test]
    fn test_route_restart_behavior() {
        let mut route = create_test_route();
        route.end_behavior = EndOfRouteBehavior::Restart;
        
        // Use a speed that finishes exactly more than one leg but less than two
        // 111.2km * 1.5 = ~166km. 166km/h = ~46m/s.
        let mut sim = Simulator::new(route, 600_000.0).unwrap();
        sim.start();

        // 600k km/h = ~166km in 1s. This is 1.5 legs.
        // Leg 1: 0->1 (111km). Restart. Leg 2: 0 -> 0.5 (~55km).
        let loc = sim.tick(1.0).unwrap();
        assert!(loc.lng > 0.0 && loc.lng < 1.0);
        assert!(sim.get_state().is_active);
    }

    #[test]
    fn test_route_reverse_behavior() {
        let mut route = create_test_route();
        route.end_behavior = EndOfRouteBehavior::Reverse;
        
        let mut sim = Simulator::new(route, 600_000.0).unwrap();
        sim.start();

        // 600k km/h = ~166km in 1s. 1.5 legs.
        // Leg 1: 0->1 (111km). Reverse. Leg 2 (reversing): 1 -> 0.5 (~55km).
        let loc = sim.tick(1.0).unwrap();
        assert!(sim.is_reversing);
        assert!(loc.lng < 1.0 && loc.lng > 0.0);
        
        // Tick again: should reach start and flip back
        let _ = sim.tick(1.0);
        assert!(!sim.is_reversing);
    }

    #[test]
    fn test_static_persistence() {
        let route = Route {
            waypoints: vec![Coordinates::new(0.0, 0.0).unwrap()],
            end_behavior: EndOfRouteBehavior::Stop,
        };
        let mut sim = Simulator::new(route, 60.0).unwrap();
        sim.start();

        // Tick multiple times
        for _ in 0..10 {
            let loc = sim.tick(1.0).unwrap();
            assert_eq!(loc.lat, 0.0);
            assert_eq!(loc.lng, 0.0);
            assert!(sim.get_state().is_active); // Should NOT stop for 1 point
        }
    }
}
