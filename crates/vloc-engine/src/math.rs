use crate::models::Coordinates;


/// Earth's mean radius in meters for planetary-scale calculations.
const EARTH_RADIUS_M: f64 = 6_371_000.0;

/// Calculates the surface distance between two coordinates using the Haversine formula.
/// 
/// **Why**: This formula remains accurate for small distances while avoiding the 
/// high computational cost of the Vincenty's formula.
/// **How**: It uses the spherical law of cosines to determine the central angle 
/// between two points, then multiplies by the Earth's radius.
pub fn haversine_distance(p1: &Coordinates, p2: &Coordinates) -> f64 {
    let lat1_rad = p1.lat.to_radians();
    let lat2_rad = p2.lat.to_radians();
    let delta_lat = (p2.lat - p1.lat).to_radians();
    let delta_lng = (p2.lng - p1.lng).to_radians();

    let a = (delta_lat / 2.0).sin().powi(2)
        + lat1_rad.cos() * lat2_rad.cos() * (delta_lng / 2.0).sin().powi(2);
    
    let c = 2.0 * a.sqrt().atan2((1.0 - a).sqrt());

    EARTH_RADIUS_M * c
}

/// Computes the initial bearing from point p1 to p2.
/// 
/// **Why**: Needed to determine the direction of travel for path interpolation.
/// **How**: Calculates the horizontal angle relative to the meridian using 
/// the atan2 function to handle quadrant ambiguity.
pub fn calculate_bearing(p1: &Coordinates, p2: &Coordinates) -> f64 {
    let lat1_rad = p1.lat.to_radians();
    let lat2_rad = p2.lat.to_radians();
    let delta_lng = (p2.lng - p1.lng).to_radians();

    let y = delta_lng.sin() * lat2_rad.cos();
    let x = lat1_rad.cos() * lat2_rad.sin()
        - lat1_rad.sin() * lat2_rad.cos() * delta_lng.cos();
    
    let brng_rad = y.atan2(x);
    let brng_deg = brng_rad.to_degrees();

    // Normalizes results to range [0, 360] for consistent compass logic.
    (brng_deg + 360.0) % 360.0
}

/// Computes destination coordinates given a starting point, distance, and direction.
/// 
/// **Why**: Critical for simulating real-time GPS movement between waypoints.
/// **How**: Uses spherical trigonometry to project 2D displacement onto the 3D surface of the Earth.
pub fn calculate_destination(start: &Coordinates, distance_m: f64, bearing_deg: f64) -> Coordinates {
    let ang_dist = distance_m / EARTH_RADIUS_M;
    let bearing_rad = bearing_deg.to_radians();
    
    let lat1_rad = start.lat.to_radians();
    let lng1_rad = start.lng.to_radians();

    let lat2_rad = (lat1_rad.sin() * ang_dist.cos()
        + lat1_rad.cos() * ang_dist.sin() * bearing_rad.cos())
    .asin();

    let lng2_rad = lng1_rad + (bearing_rad.sin() * ang_dist.sin() * lat1_rad.cos())
        .atan2(ang_dist.cos() - lat1_rad.sin() * lat2_rad.sin());

    Coordinates {
        lat: lat2_rad.to_degrees(),
        lng: lng2_rad.to_degrees(),
        // Altitude is currently preserved as a static attribute during 2D projection.
        altitude: start.altitude,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_haversine_distance() {
        // Paris
        let p1 = Coordinates::new(48.8566, 2.3522).unwrap();
        // London
        let p2 = Coordinates::new(51.5074, -0.1278).unwrap();
        
        let dist = haversine_distance(&p1, &p2);
        
        // Expected distance is ~343.5km. We allow some margin of error.
        assert!(dist > 340_000.0 && dist < 345_000.0);
    }

    #[test]
    fn test_calculate_bearing() {
        let p1 = Coordinates::new(39.0999, -94.5812).unwrap(); // Kansas City
        let p2 = Coordinates::new(38.6270, -90.1994).unwrap(); // St Louis

        let bearing = calculate_bearing(&p1, &p2);
        
        // Approx 96.51 degrees
        assert!((bearing - 96.51).abs() < 1.0);
    }

    #[test]
    fn test_destination() {
        let start = Coordinates::new(40.7128, -74.0060).unwrap(); // NYC
        // Move 100km due East (bearing 90)
        let end = calculate_destination(&start, 100_000.0, 90.0);

        // Check if latitude is relatively similar and longitude shifted East
        assert!((end.lat - 40.71).abs() < 0.1);
        assert!(end.lng > -74.0060);
    }
}
