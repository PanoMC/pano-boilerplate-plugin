package com.panomc.plugins.boilerplate

import com.panomc.platform.api.PanoPlugin
import com.panomc.plugins.license.PluginLicenseClient

class BoilerplatePlugin : PanoPlugin() {
    /**
     * Premium plugins call requireValidLicense() at the top of onStart so any failure
     * propagates up as a [com.panomc.platform.license.LicenseRequiredException], PF4J
     * marks the plugin failed, and the host records the failure for the panel UI.
     * Pano core itself continues to start normally so the operator can resolve it.
     *
     * Free plugins can leave this in place — when no public key is embedded (no
     * `-PlicenseServer` / `-PpanoLicensePublicKey` / `PANO_LICENSE_*` env), [PluginLicenseClient.requireValidLicense] is a no-op.
     */
    private val licenseClient by lazy { PluginLicenseClient(this) }

    override suspend fun onStart() {
        licenseClient.requireValidLicense()
        logger.info("Starting...")
    }

    /**
     * Plugin-side license re-verification triggered by the panel "Refresh license" button.
     * The host fetches a fresh JWT, then calls this so the panel reflects the actual outcome
     * (e.g. signature/issuer mismatch) instead of waiting until the next start attempt.
     */
    override suspend fun verifyLicense() {
        licenseClient.requireValidLicense()
    }

    override suspend fun onEnable() {
        logger.info("Enabled!")
    }

    override suspend fun onUninstall() {
        logger.info("Uninstalling...")

        // add some cleanup codes for your data used in plugin before uninstalling
    }
}
