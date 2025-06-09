/**
 * recetas-core.js
 * Funcionalidades básicas y utilidades para el módulo de recetas
 */

// Función para obtener el token CSRF de las cookies
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// Variables globales para mantener listas de insumos
let recetasInsumosDisponibles = [];
let recetasInsumosCompuestosDisponibles = [];

// Verificar si la variable ya existe
if (typeof recetasInsumosElaboradosDisponibles === 'undefined') {
    var recetasInsumosElaboradosDisponibles = [];
}

// Utilidades
function formatearUnidad(unidad) {
    const unidades = {
        'kg': 'Kilogramo',
        'g': 'Gramo',
        'lt': 'Litro',
        'ml': 'Mililitro',
        'pza': 'Pieza',
        'bolsa': 'Bolsa',
        'lata': 'Lata'
    };
    return unidades[unidad] || unidad;
}

function capitalizarPrimeraLetra(string) {
    return string && string.charAt(0).toUpperCase() + string.slice(1);
}

// Función para calcular el costo total de ingredientes de una receta
function calcularCostoIngredientes(receta) {
    let costoTotal = 0;
    
    // Sumar costos de insumos simples
    if (receta.insumos && Array.isArray(receta.insumos)) {
        costoTotal += receta.insumos.reduce((sum, insumo) => sum + (parseFloat(insumo.costo) || 0), 0);
    }
    
    // Sumar costos de insumos compuestos
    if (receta.insumos_compuestos && Array.isArray(receta.insumos_compuestos)) {
        costoTotal += receta.insumos_compuestos.reduce((sum, insumo) => sum + (parseFloat(insumo.costo) || 0), 0);
    }
    
    // Sumar costos de insumos elaborados
    if (receta.insumos_elaborados && Array.isArray(receta.insumos_elaborados)) {
        costoTotal += receta.insumos_elaborados.reduce((sum, insumo) => sum + (parseFloat(insumo.costo) || 0), 0);
    }
    
    return costoTotal;
}

// Función para asegurar que las funciones CRUD estén disponibles
function asegurarFuncionesCRUD() {
    // Verificar si las funciones CRUD están definidas
    const funcionesFaltantes = [];
    
    // Lista de funciones requeridas desde crudRecetas.js
    const funcionesRequeridas = [
        'mostrarModalReceta', 
        'editarReceta', 
        'eliminarReceta', 
        'guardarReceta', 
        'verDetalleReceta', 
        'cargarDatosEjemplo'
    ];
    
    // Verificar cada función
    funcionesRequeridas.forEach(nombreFuncion => {
        if (typeof window[nombreFuncion] !== 'function') {
            funcionesFaltantes.push(nombreFuncion);
            
            // Crear una función temporal para evitar errores
            window[nombreFuncion] = function() {
                console.warn(`La función ${nombreFuncion} fue llamada pero no está disponible correctamente.`);
                alert(`Error: No se pudo cargar la función ${nombreFuncion}. Por favor, recarga la página.`);
            };
        }
    });
    
    // Si faltan funciones, cargar el script crudRecetas.js
    if (funcionesFaltantes.length > 0) {
        console.warn('Funciones CRUD faltantes:', funcionesFaltantes);
        console.log('Intentando cargar crudRecetas.js dinámicamente...');
        
        // Cargar el script dinámicamente
        const script = document.createElement('script');
        script.src = '/static/accounts/js/crudRecetas.js'; // Usar path absoluto
        script.onload = function() {
            console.log('crudRecetas.js cargado correctamente');
            
            // Verificar si también necesitamos insumosRecetas.js
            if (typeof window.agregarInsumo !== 'function') {
                console.warn('La función agregarInsumo no está disponible');
                const scriptInsumos = document.createElement('script');
                scriptInsumos.src = '/static/accounts/js/insumosRecetas.js';
                scriptInsumos.onload = function() {
                    console.log('insumosRecetas.js cargado correctamente');
                };
                document.head.appendChild(scriptInsumos);
            }
        };
        document.head.appendChild(script);
    }
}

// Exportar funciones
window.getCookie = getCookie;
window.formatearUnidad = formatearUnidad;
window.capitalizarPrimeraLetra = capitalizarPrimeraLetra;
window.calcularCostoIngredientes = calcularCostoIngredientes;
window.asegurarFuncionesCRUD = asegurarFuncionesCRUD;

console.log("✅ Módulo core de recetas cargado");