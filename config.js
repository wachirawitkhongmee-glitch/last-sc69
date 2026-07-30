/**
 * Student Council 69 - Secure Configuration Loader
 * Handles Environment Variables & Application Configuration safely.
 */
(function () {
    'use strict';

    // Global application configuration namespace
    const env = (typeof window !== 'undefined' && window.ENV) || {};

    const APP_CONFIG = {
        // Admin credentials configuration loaded safely
        ADMIN_EMAIL: env.ADMIN_EMAIL || 'student69@gmail.com',
        ADMIN_PASSWORD: env.ADMIN_PASSWORD || '11222333344444',

        // Public API Keys (Frontend allowed keys)
        PUBLIC_API_KEY: env.PUBLIC_API_KEY || '',

        // API Endpoint Base URL for backend server-side proxies
        API_BASE_URL: env.API_BASE_URL || '/api',

        /**
         * Securely execute API requests via Server-Side Proxy
         * API Secrets MUST NEVER be exposed in frontend JS code.
         */
        async callBackendAPI(endpoint, options = {}) {
            const url = `${this.API_BASE_URL}${endpoint}`;
            const defaultHeaders = {
                'Content-Type': 'application/json',
            };

            const response = await fetch(url, {
                ...options,
                headers: {
                    ...defaultHeaders,
                    ...(options.headers || {})
                }
            });

            if (!response.ok) {
                throw new Error(`API Error [${response.status}]: ${response.statusText}`);
            }

            return await response.json();
        }
    };

    // Freeze config to prevent unauthorized runtime mutation
    window.APP_CONFIG = Object.freeze(APP_CONFIG);
})();
