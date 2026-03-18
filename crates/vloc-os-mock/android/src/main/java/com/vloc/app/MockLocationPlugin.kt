package com.vloc.app

import android.annotation.SuppressLint
import android.app.Activity
import android.content.Context
import android.location.Location
import android.location.LocationManager
import android.os.Build
import android.os.SystemClock
import app.tauri.annotation.Command
import app.tauri.annotation.TauriPlugin
import app.tauri.plugin.Invoke
import app.tauri.plugin.Plugin

@TauriPlugin
class MockLocationPlugin(private val activity: Activity) : Plugin(activity) {
    private var locationManager: LocationManager? = null
    private val providerName = LocationManager.GPS_PROVIDER

    override fun load(webapp: Any) {
        super.load(webapp)
        locationManager = activity.getSystemService(Context.LOCATION_SERVICE) as LocationManager
    }

    @Command
    fun startMock(invoke: Invoke) {
        try {
            locationManager?.let { lm ->
                // Clean up before starting
                try {
                    lm.removeTestProvider(providerName)
                } catch (e: Exception) {
                    // Ignore if it doesn't exist
                }

                lm.addTestProvider(
                    providerName,
                    false, false, false, false,
                    true, true, true,
                    0, 1
                )
                lm.setTestProviderEnabled(providerName, true)
                invoke.resolve()
            } ?: invoke.reject("LocationManager not available")
        } catch (e: Exception) {
            invoke.reject("Failed to start mock: ${e.message}")
        }
    }

    @Command
    fun updateLocation(invoke: Invoke) {
        val lat = invoke.getFloat("lat") ?: 0.0f
        val lng = invoke.getFloat("lng") ?: 0.0f

        try {
            val mockLocation = Location(providerName).apply {
                latitude = lat.toDouble()
                longitude = lng.toDouble()
                altitude = 0.0
                time = System.currentTimeMillis()
                accuracy = 1.0f
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN_MR1) {
                    elapsedRealtimeNanos = SystemClock.elapsedRealtimeNanos()
                }
            }

            locationManager?.setTestProviderLocation(providerName, mockLocation)
            invoke.resolve()
        } catch (e: Exception) {
            invoke.reject("Failed to update location: ${e.message}")
        }
    }

    @Command
    fun stopMock(invoke: Invoke) {
        try {
            locationManager?.let { lm ->
                lm.setTestProviderEnabled(providerName, false)
                lm.removeTestProvider(providerName)
                invoke.resolve()
            } ?: invoke.reject("LocationManager not available")
        } catch (e: Exception) {
            invoke.reject("Failed to stop mock: ${e.message}")
        }
    }
}
