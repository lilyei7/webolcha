/**
 * recetas-data.js
 * Carga y manejo de datos para el módulo de recetas
 */

// Función para cargar todos los insumos necesarios
async function cargarTodosInsumosParaRecetas() {
    try {
        console.log("Cargando todos los insumos para recetas...");
        
        // Cargar insumos simples
        const insumosResponse = await fetch('/insumos-para-receta/');
        
        // Comprobar si la respuesta es JSON antes de intentar parsearla
        const contentType = insumosResponse.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            throw new Error(`La respuesta no es JSON: ${await insumosResponse.text().substring(0, 100)}...`);
        }
        
        const insumosData = await insumosResponse.json();
        if (insumosData.status === 'success') {
            recetasInsumosDisponibles = insumosData.insumos;
            console.log('✅ Insumos simples cargados:', recetasInsumosDisponibles.length);
        } else {
            console.error('Error al cargar insumos:', insumosData.message);
        }
        
        // Cargar insumos compuestos
        const compuestosResponse = await fetch('/insumos-compuestos-para-receta/');
        const compuestosData = await compuestosResponse.json();
        if (compuestosData.status === 'success') {
            recetasInsumosCompuestosDisponibles = compuestosData.insumos_compuestos;
            console.log('✅ Insumos compuestos cargados:', recetasInsumosCompuestosDisponibles.length);
        } else {
            console.error('Error al cargar insumos compuestos:', compuestosData.message);
        }
        
        // Cargar insumos elaborados
        const elaboradosResponse = await fetch('/insumos-elaborados-para-recetas/');
        const elaboradosData = await elaboradosResponse.json();
        if (elaboradosData.status === 'success') {
            if (typeof recetasInsumosElaboradosDisponibles === 'undefined') {
                window.recetasInsumosElaboradosDisponibles = elaboradosData.insumos_elaborados;
            } else {
                recetasInsumosElaboradosDisponibles = elaboradosData.insumos_elaborados;
            }
            console.log('✅ Insumos elaborados cargados:', recetasInsumosElaboradosDisponibles.length);
        } else {
            console.error('Error al cargar insumos elaborados:', elaboradosData.message);
        }
        
        console.log('✅ Todos los insumos cargados para recetas');
        return true;
    } catch (error) {
        console.error('Error al cargar insumos para recetas:', error);
        
        // Proporcionar datos de ejemplo como respaldo
        recetasInsumosDisponibles = [];
        recetasInsumosCompuestosDisponibles = [];
        if (typeof recetasInsumosElaboradosDisponibles === 'undefined') {
            window.recetasInsumosElaboradosDisponibles = [];
        } else {
            recetasInsumosElaboradosDisponibles = [];
        }
        
        console.warn('⚠️ Usando listas vacías como respaldo');
        return false;
    }
}

// Alias para compatibilidad con código existente
async function cargarIngredientesDisponibles() {
    console.log("Cargando ingredientes disponibles para recetas...");
    return await cargarTodosInsumosParaRecetas();
}

// Función mejorada para cargar recetas desde la API
async function cargarRecetas() {
    console.log('📋 Iniciando carga de recetas...');
    
    const tbody = document.getElementById('recetasTbody');
    
    if (!tbody) {
        console.error('No se encontró el elemento tbody para recetas');
        return;
    }
    
    // Mostrar indicador de carga
    tbody.innerHTML = `
        <tr>
            <td colspan="4" style="text-align: center; padding: 20px; color: #6b7280;">
                <i class="fa-solid fa-spinner fa-spin" style="margin-right: 8px;"></i> Cargando recetas...
            </td>
        </tr>
    `;
    
    try {
        console.log('Realizando solicitud a /recetas/');
        const response = await fetch('/recetas/');
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Datos recibidos:', data);
        
        if (data.status === 'success') {
            if (data.recetas.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="4" style="text-align: center; padding: 20px; color: #6b7280;">
                            No hay recetas registradas
                        </td>
                    </tr>
                `;
                return;
            }
            
            // Crear filas para cada receta
            const filasHTML = data.recetas.map(receta => `
                <tr>
                    <td style="padding: 16px; border-bottom: 1px solid #f3f4f6; vertical-align: middle; background-color: white;">
                        <div style="font-weight: 600; color: #000000; font-size: 1rem;">${receta.nombre}</div>
                    </td>
                    <td style="padding: 16px; border-bottom: 1px solid #f3f4f6; vertical-align: middle; color: #000000; background-color: white;">${capitalizarPrimeraLetra(receta.categoria)}</td>
                    <td style="padding: 16px; border-bottom: 1px solid #f3f4f6; vertical-align: middle; color: #000000; background-color: white; text-align: right;">
                        <div style="font-weight: 500;">$${receta.costo.toFixed(2)}</div>
                    </td>
                    <td style="padding: 16px; border-bottom: 1px solid #f3f4f6; vertical-align: middle; background-color: white; text-align: center;">
                        <div style="display: flex; gap: 8px; justify-content: center;">
                            <button onclick="verDetalleReceta(${receta.id})" style="width: 32px; height: 32px; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; color: #6b7280; background: #f3f4f6; border: none; cursor: pointer;" title="Ver detalles">
                                <i class="fa-solid fa-list"></i>
                            </button>
                            <button onclick="editarReceta(${receta.id})" style="width: 32px; height: 32px; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; color: #3b82f6; background: #eff6ff; border: none; cursor: pointer;" title="Editar">
                                <i class="fa-solid fa-pen"></i>
                            </button>
                            <button onclick="eliminarReceta(${receta.id}, '${receta.nombre.replace(/'/g, "\\'")}')" style="width: 32px; height: 32px; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; color: #ef4444; background: #fef2f2; border: none; cursor: pointer;" title="Eliminar">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');
            
            tbody.innerHTML = filasHTML;
            console.log('✅ Recetas cargadas correctamente');
            
        } else {
            console.error('Error al cargar recetas:', data.message);
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Error al cargar recetas:', error);
        
        // Cargar datos de ejemplo como respaldo
        console.log('⚠️ Cargando datos de ejemplo como respaldo...');
        tbody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; padding: 12px; color: #ef4444; background-color: #fef2f2;">
                    <div style="margin-bottom: 8px;">
                        <i class="fa-solid fa-triangle-exclamation" style="margin-right: 8px;"></i> 
                        No se pudo conectar con el servidor
                    </div>
                    <div style="font-size: 0.9rem; color: #b91c1c;">
                        Se mostrarán datos de ejemplo para demostración
                    </div>
                </td>
            </tr>
        `;
        
        // Cargar datos de ejemplo después del mensaje de error
        setTimeout(() => cargarDatosEjemplo(), 1000);
    }
}

// Función para filtrar recetas
function filtrarRecetas() {
    // Implementar esta función para filtrar recetas por nombre o categoría
    const searchTerm = document.getElementById('searchReceta').value.toLowerCase();
    const categoriaFiltro = document.getElementById('filterCategoriaReceta').value.toLowerCase();
    
    const filas = document.querySelectorAll('#recetasTbody tr');
    
    filas.forEach(fila => {
        const nombre = fila.querySelector('td:first-child div')?.textContent.toLowerCase() || '';
        const categoria = fila.querySelector('td:nth-child(2)')?.textContent.toLowerCase() || '';
        
        const coincideNombre = nombre.includes(searchTerm);
        const coincideCategoria = categoriaFiltro === '' || categoria.toLowerCase() === categoriaFiltro;
        
        if (coincideNombre && coincideCategoria) {
            fila.style.display = '';
        } else {
            fila.style.display = 'none';
        }
    });
}

// Exportar funciones
window.cargarTodosInsumosParaRecetas = cargarTodosInsumosParaRecetas;
window.cargarIngredientesDisponibles = cargarIngredientesDisponibles;
window.cargarRecetas = cargarRecetas;
window.filtrarRecetas = filtrarRecetas;

console.log("✅ Módulo de datos para recetas cargado");