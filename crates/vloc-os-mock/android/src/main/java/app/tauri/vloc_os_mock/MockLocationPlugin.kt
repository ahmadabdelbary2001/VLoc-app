package app.tauri.vloc_os_mock

import android.annotation.SuppressLint
import android.app.Activity
import android.content.Context
import android.location.Location
import android.location.LocationManager
import android.os.Build
import android.os.SystemClock
import android.provider.Settings
import app.tauri.annotation.Command
import app.tauri.annotation.TauriPlugin
import app.tauri.plugin.Invoke
import app.tauri.plugin.Plugin
import app.tauri.plugin.JSObject
import org.json.JSONObject

@TauriPlugin
class MockLocationPlugin(private val activity: Activity) : Plugin(activity) {
    private var locationManager: LocationManager? = null
    private val providerName = LocationManager.GPS_PROVIDER

    override fun load(webapp: Any) {
        super.load(webapp)
        locationManager = activity.getSystemService(Context.LOCATION_SERVICE) as LocationManager

        // Listen for events from Rust
        // Payload is a JSON string: {"lat": 0.0, "lng": 0.0, "speed": 0.0, "bearing": 0.0}
        app.listen("vloc-os-mock://start") {
            startMockInternal()
        }
        app.listen("vloc-os-mock://update") { event ->
            event.payload?.let { payload ->
                try {
                    val json = JSONObject(payload.toString())
                    val lat = json.optDouble("lat", 0.0)
                    val lng = json.optDouble("lng", 0.0)
                    val speed = json.optDouble("speed", 0.0).toFloat()
                    val bearing = json.optDouble("bearing", 0.0).toFloat()
                    updateLocationInternal(lat, lng, speed, bearing)
                } catch (e: Exception) {
                    // Log error
                }
            }
        }
        app.listen("vloc-os-mock://stop") {
            stopMockInternal()
        }
    }

    @Command
    fun startMock(invoke: Invoke) {
        if (startMockInternal()) {
            invoke.resolve()
        } else {
            invoke.reject("LocationManager not available")
        }
    }

    private fun startMockInternal(): Boolean {
        return try {
            locationManager?.let { lm ->
                try { lm.removeTestProvider(providerName) } catch (e: Exception) {}
                lm.addTestProvider(
                    providerName,
                    false, false, false, false,
                    true, true, true,
                    1, 1
                )
                lm.setTestProviderEnabled(providerName, true)
                true
            } ?: false
        } catch (e: Exception) {
            false
        }
    }

    @Command
    fun updateLocation(invoke: Invoke) {
        val lat = invoke.getFloat("lat")?.toDouble() ?: 0.0
        val lng = invoke.getFloat("lng")?.toDouble() ?: 0.0
        val speed = invoke.getFloat("speed") ?: 0.0f
        val bearing = invoke.getFloat("bearing") ?: 0.0f
        updateLocationInternal(lat, lng, speed, bearing)
        invoke.resolve()
    }

    private fun updateLocationInternal(lat: Double, lng: Double, speedVal: Float, bearingVal: Float) {
        try {
            val mockLocation = Location(providerName).apply {
                latitude = lat
                longitude = lng
                altitude = 0.0
                time = System.currentTimeMillis()
                accuracy = 1.0f
                speed = speedVal
                bearing = bearingVal
                
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN_MR1) {
                    elapsedRealtimeNanos = SystemClock.elapsedRealtimeNanos()
                }
                
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    bearingAccuracyDegrees = 0.1f
                    verticalAccuracyMeters = 0.1f
                    speedAccuracyMetersPerSecond = 0.01f
                }
            }
            locationManager?.setTestProviderLocation(providerName, mockLocation)
        } catch (e: Exception) {}
    }

    @Command
    fun stopMock(invoke: Invoke) {
        if (stopMockInternal()) {
            invoke.resolve()
        } else {
            invoke.reject("LocationManager not available")
        }
    }

    private fun stopMockInternal(): Boolean {
        return try {
            locationManager?.let { lm ->
                lm.setTestProviderEnabled(providerName, false)
                lm.removeTestProvider(providerName)
                true
            } ?: false
        } catch (e: Exception) {
            false
        }
    }
}
