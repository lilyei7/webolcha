/**
 * Script para diagnosticar problemas de carga de scripts
 */
(function() {
    // Registrar el momento en que se carga este script
    console.log(`[Script Loader] ${new Date().toISOString()}: script-loader-debug.js cargado`);
    
    // Crear un objeto para rastrear cuándo se carga cada script
    window.scriptLoadTracker = window.scriptLoadTracker || {
        scriptsLoaded: {},
        
        // Registrar que un script ha sido cargado
        register: function(scriptName) {
            const timestamp = new Date().toISOString();
            this.scriptsLoaded[scriptName] = timestamp;
            console.log(`[Script Loader] ${timestamp}: ${scriptName} cargado`);
        },
        
        // Verificar si un script específico ha sido cargado
        isLoaded: function(scriptName) {
            return !!this.scriptsLoaded[scriptName];
        },
        
        // Verificar si varias funciones están disponibles
        checkFunctions: function(functionNames) {
            const missing = [];
            const available = [];
            
            functionNames.forEach(fn => {
                if (typeof window[fn] === 'function') {
                    available.push(fn);
                } else {
                    missing.push(fn);
                }
            });
            
            return { available, missing };
        },
        
        // Mostrar un informe de todos los scripts cargados con su orden
        showReport: function() {
            console.group('Reporte de carga de scripts');
            const scripts = Object.entries(this.scriptsLoaded)
                .sort((a, b) => a[1].localeCompare(b[1]));
                
            scripts.forEach(([name, time], index) => {
                console.log(`${index + 1}. ${name} - ${time}`);
            });
            
            console.groupEnd();
        }
    };
    
    // Observar cambios en el DOM para detectar nuevos scripts
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeName === 'SCRIPT' && node.src) {
                        // Extraer el nombre del script de la URL
                        const scriptPath = node.src.split('/').pop();
                        window.scriptLoadTracker.register(scriptPath);
                    }
                });
            }
        });
    });
    
    // Iniciar observación
    observer.observe(document.documentElement, {
        childList: true,
        subtree: true
    });
    
    // Registrar scripts ya cargados
    document.querySelectorAll('script[src]').forEach(script => {
        const scriptPath = script.src.split('/').pop();
        if (scriptPath) {
            window.scriptLoadTracker.scriptsLoaded[scriptPath] = 'loaded before tracking';
        }
    });
    
    // Añadir función de ayuda para diagnosticar problemas de función
    window.checkFunctionAvailability = function(...functionNames) {
        const result = window.scriptLoadTracker.checkFunctions(functionNames);
        
        console.group('Verificación de disponibilidad de funciones');
        if (result.available.length > 0) {
            console.log('✅ Funciones disponibles:', result.available);
        }
        if (result.missing.length > 0) {
            console.error('❌ Funciones no disponibles:', result.missing);
        }
        console.groupEnd();
        
        return result;
    };
    
    // Registrar este propio script
    window.scriptLoadTracker.register('script-loader-debug.js');
})();
