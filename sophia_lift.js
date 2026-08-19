// sophia_lift.js - Pure JavaScript Aeonic Conduit Module
// No Emscripten, no WASM, no compilation. Just pure JS.

(function() {
    const R_VALUE = 3.99;
    const CHAOTIC_SEED = 0.618;
    
    // Simple string hash function
    function hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash * 31) + str.charCodeAt(i)) >>> 0;
        }
        return hash;
    }
    
    // Convert a 32-bit integer to 8-character hex string
    function toHex32(value) {
        return (value >>> 0).toString(16).padStart(8, '0');
    }
    
    // The lifting function - returns a JSON string of chaotic points
    function lift_public_key(x_input, seed_perturbation, iterations) {
        const seed_value = hashString(x_input);
        let x_n = CHAOTIC_SEED + seed_perturbation;
        const results = [];
        
        for (let i = 0; i < iterations; i++) {
            x_n = R_VALUE * x_n * (1.0 - x_n);
            
            // Generate chaotic values using the logistic map
            const chaotic_high = (Math.floor(x_n * 1e15) ^ seed_value) >>> 0;
            const chaotic_low = (Math.floor((x_n * 1e16) % 1e9) ^ (seed_value >>> 8)) >>> 0;
            
            // Create hex string
            const hex_str = toHex32(chaotic_high) + toHex32(chaotic_low);
            results.push(hex_str);
        }
        
        return JSON.stringify(results);
    }
    
    // The resonance scorer - returns a double between 0 and 1
    function score_resonance(json_points) {
        const points = JSON.parse(json_points);
        if (points.length === 0) return 0.0;
        
        let total = 0;
        let count = 0;
        
        for (const p of points) {
            for (const c of p) {
                const digit = parseInt(c, 16);
                if (!isNaN(digit)) {
                    total += digit;
                    count++;
                }
            }
        }
        
        if (count === 0) return 0.0;
        const avg = total / count;
        return Math.max(0.0, Math.min(1.0, 1.0 - Math.abs(avg - 7.5) / 7.5));
    }
    
    // Export as CommonJS module
    module.exports = {
        lift_public_key: lift_public_key,
        score_resonance: score_resonance
    };
})();
