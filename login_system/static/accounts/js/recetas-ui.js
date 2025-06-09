/**
 * recetas-ui.js
 * Interfaz de usuario para el módulo de recetas
 */

// Función principal para cargar el contenido de Recetas
async function loadRecetasContent() {
    console.log('🔄 Inicializando módulo de recetas...');
    
    // Asegurar que las funciones CRUD estén disponibles
    asegurarFuncionesCRUD();
    
    // Primero creamos la estructura HTML para las recetas
    const mainContent = document.querySelector('.main-content');
    if (!mainContent) {
        console.error('Error: No se puede encontrar el contenedor principal (.main-content)');
        
        // Intentar encontrar otro contenedor compatible
        const alternativeContainer = document.querySelector('#main') || 
                                     document.querySelector('#content') || 
                                     document.querySelector('main');
        
        if (!alternativeContainer) {
            alert('No se pudo encontrar un contenedor adecuado para mostrar las recetas');
            return;
        }
        
        console.log('Se utilizará un contenedor alternativo para mostrar las recetas');
        mainContent = alternativeContainer;
    }
    
    // Insertar la estructura HTML para la página de recetas
    mainContent.innerHTML = `
        <div style="padding: 24px; background-color: #f8fafc; min-height: 100vh;">
            <div style="max-width: 1200px; margin: 0 auto;">
                <!-- Header -->
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; background: white; padding: 24px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                    <div>
                        <h1 style="margin: 0; color: #1e293b; font-size: 2rem; font-weight: 700;">
                            <i class="fa-solid fa-utensils" style="color: #3b82f6; margin-right: 12px;"></i>
                            Recetas
                        </h1>
                        <p style="margin: 8px 0 0 0; color: #64748b; font-size: 1rem;">Gestiona tus recetas y sus ingredientes</p>
                    </div>
                    <button id="btnNuevaReceta" style="background: linear-gradient(90deg, #3b82f6 0%, #2563eb 100%); color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: 600; display: flex; align-items: center; gap: 8px; font-size: 0.95rem; box-shadow: 0 2px 8px rgba(59,130,246,0.25); transition: all 0.2s;">
                        <i class="fa-solid fa-plus"></i>
                        Nueva Receta
                    </button>
                </div>

                <!-- Filtros -->
                <div style="background: white; padding: 20px; border-radius: 12px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                    <div style="display: grid; grid-template-columns: 1fr auto; gap: 16px; align-items: end;">
                        <div>
                            <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #374151; font-size: 0.9rem;">Buscar recetas</label>
                            <div style="position: relative;">
                                <i class="fa-solid fa-search" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #64748b;"></i>
                                <input type="text" id="searchReceta" placeholder="Buscar por nombre..." 
                                    style="padding: 12px 12px 12px 38px; border: 1px solid #e2e8f0; border-radius: 8px; width: 100%; font-size: 0.95rem;">
                            </div>
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #374151; font-size: 0.9rem;">Categoría</label>
                            <select id="filterCategoriaReceta" style="padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; width: 100%; font-size: 0.95rem;">
                                <option value="">Todas las categorías</option>
                                <option value="pizza">Pizza</option>
                                <option value="pasta">Pasta</option>
                                <option value="ensalada">Ensalada</option>
                                <option value="postre">Postre</option>
                                <option value="bebida">Bebida</option>
                            </select>
                        </div>
                    </div>
                </div>

                <!-- Lista de recetas -->
                <div style="background: white; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); overflow: hidden;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background-color: #f8fafc;">
                                <th style="padding: 16px; text-align: left; font-weight: 600; font-size: 0.9rem; color: #4b5563; border-bottom: 2px solid #e5e7eb;">NOMBRE</th>
                                <th style="padding: 16px; text-align: left; font-weight: 600; font-size: 0.9rem; color: #4b5563; border-bottom: 2px solid #e5e7eb;">CATEGORÍA</th>
                                <th style="padding: 16px; text-align: right; font-weight: 600; font-size: 0.9rem; color: #4b5563; border-bottom: 2px solid #e5e7eb;">PRECIO</th>
                                <th style="padding: 16px; text-align: center; font-weight: 600; font-size: 0.9rem; color: #4b5563; border-bottom: 2px solid #e5e7eb;">ACCIONES</th>
                            </tr>
                        </thead>
                        <tbody id="recetasTbody">
                            <tr>
                                <td colspan="4" style="text-align: center; padding: 20px; color: #6b7280;">
                                    <i class="fa-solid fa-spinner fa-spin" style="margin-right: 8px;"></i> Cargando recetas...
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- Modal para nueva/editar receta -->
        <div id="recetaModal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; align-items: center; justify-content: center;">
            <div style="background: white; border-radius: 12px; width: 90%; max-width: 800px; max-height: 90vh; overflow-y: auto; position: relative;">
                <div style="padding: 24px; border-bottom: 1px solid #e2e8f0; background: #f8fafc;">
                    <h2 id="recetaModalTitle" style="margin: 0; color: #1e293b; font-size: 1.5rem; font-weight: 600;">Nueva Receta</h2>
                    <button id="closeRecetaModal" style="position: absolute; right: 16px; top: 16px; background: none; border: none; font-size: 24px; cursor: pointer; color: #64748b;">&times;</button>
                </div>
                
                <form id="recetaForm" style="padding: 24px;">
                    <input type="hidden" id="recetaId">
                    
                    <!-- Datos básicos -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px;">
                        <div>
                            <label for="nombreReceta" style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">Nombre de la receta *</label>
                            <input type="text" id="nombreReceta" required style="padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; width: 100%; font-size: 0.95rem;">
                        </div>
                        <div>
                            <label for="categoriaReceta" style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">Categoría *</label>
                            <select id="categoriaReceta" required style="padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; width: 100%; font-size: 0.95rem;">
                                <option value="">Seleccionar categoría</option>
                                <option value="pizza">Pizza</option>
                                <option value="pasta">Pasta</option>
                                <option value="ensalada">Ensalada</option>
                                <option value="postre">Postre</option>
                                <option value="bebida">Bebida</option>
                            </select>
                        </div>
                    </div>
                    
                    <!-- Descripción -->
                    <div style="margin-bottom: 20px;">
                        <label for="descripcionReceta" style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">Descripción</label>
                        <textarea id="descripcionReceta" rows="3" style="padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; width: 100%; font-size: 0.95rem; resize: vertical;"></textarea>
                    </div>
                    
                    <!-- Precio de venta -->
                    <div style="margin-bottom: 20px;">
                        <label for="costoVenta" style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">Precio de venta *</label>
                        <div style="position: relative;">
                            <span style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #64748b;">$</span>
                            <input type="number" id="costoVenta" step="0.01" min="0" required style="padding: 12px 12px 12px 24px; border: 1px solid #e2e8f0; border-radius: 8px; width: 100%; font-size: 0.95rem;">
                        </div>
                    </div>
                    
                    <!-- NUEVA SECCIÓN UNIFICADA DE INGREDIENTES -->
                    <div style="margin-bottom: 24px;">
                        <h3 style="margin-top: 20px; color: #1f2937; font-weight: 600; font-size: 1.1rem; border-bottom: 1px solid #e7e7eb; padding-bottom: 10px;">Ingredientes</h3>
                        
                        <div id="allIngredientesContainer" style="margin-bottom: 15px;"></div>
                        
                        <button type="button" id="agregarIngredienteUnificadoBtn" style="background-color: #f1f5f9; color: #475569; border: none; padding: 8px 15px; border-radius: 6px; cursor: pointer; font-size: 0.9rem; display: flex; align-items: center; gap: 5px;">
                            <i class="fa-solid fa-plus"></i> Agregar ingrediente
                        </button>
                    </div>
                    
                    <!-- Botones -->
                    <div style="display: flex; gap: 12px; justify-content: flex-end;">
                        <button type="button" id="cancelarRecetaBtn" style="background: #f1f5f9; color: #475569; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: 500;">
                            Cancelar
                        </button>
                        <button type="submit" style="background: linear-gradient(90deg, #3b82f6 0%, #2563eb 100%); color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: 500;">
                            <i class="fa-solid fa-save"></i> Guardar Receta
                        </button>
                    </div>
                </form>
            </div>
        </div>
        
        <!-- Modal para ver detalle de receta -->
        <div id="detalleRecetaModal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; align-items: center; justify-content: center;">
            <div style="background: white; border-radius: 12px; width: 90%; max-width: 800px; max-height: 90vh; overflow-y: auto; position: relative;">
                <div style="padding: 24px; border-bottom: 1px solid #e2e8f0; background: #f8fafc;">
                    <h2 id="detalleRecetaTitle" style="margin: 0; color: #1e293b; font-size: 1.5rem; font-weight: 600;">Detalle de Receta</h2>
                    <button id="closeDetalleRecetaModal" style="position: absolute; right: 16px; top: 16px; background: none; border: none; font-size: 24px; cursor: pointer; color: #64748b;">&times;</button>
                </div>
                <div id="detalleRecetaContent" style="padding: 24px;">
                    <!-- El contenido se llenará dinámicamente -->
                </div>
                <div style="padding: 16px 24px 24px; display: flex; justify-content: flex-end;">
                    <button type="button" id="cerrarDetalleRecetaBtn" style="background: #f1f5f9; color: #475569; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: 500;">
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Cargar los insumos disponibles para usar en recetas
    try {
        console.log('Cargando insumos para recetas...');
        await cargarTodosInsumosParaRecetas();
        console.log('✅ Insumos cargados correctamente');
    } catch (error) {
        console.error('Error cargando insumos:', error);
        // Continuar con la carga de recetas aunque falle la carga de insumos
    }
    
    // Configurar event listeners específicos
    try {
        console.log('Configurando event listeners...');
        configurarEventListenersRecetas();
        console.log('✅ Event listeners configurados');
    } catch (error) {
        console.error('Error configurando event listeners:', error);
    }
    
    // Cargar las recetas
    try {
        console.log('Cargando recetas...');
        await cargarRecetas();
    } catch (error) {
        console.error('Error cargando recetas:', error);
        // Intentar cargar datos de ejemplo como respaldo
        cargarDatosEjemplo();
    }
    
    console.log('✅ Módulo de recetas inicializado correctamente');
}

// Configurar event listeners específicos para recetas
function configurarEventListenersRecetas() {
    console.log('🎯 Configurando event listeners para recetas...');
    
    // Event listener para el botón de nueva receta
    const btnNuevaReceta = document.getElementById('btnNuevaReceta');
    if (btnNuevaReceta) {
        console.log('✅ Botón Nueva Receta encontrado, configurando listener');
        btnNuevaReceta.addEventListener('click', function() {
            console.log('🔔 Botón Nueva Receta clickeado');
            try {
                if (typeof mostrarModalReceta === 'function') {
                    mostrarModalReceta();
                } else {
                    console.error('La función mostrarModalReceta no está disponible');
                    alert('Error: No se puede mostrar el formulario de receta');
                }
            } catch (error) {
                console.error('Error al mostrar modal de receta:', error);
            }
        });
    } else {
        console.error('❌ No se encontró el botón de nueva receta');
    }

    // Event listener para cerrar modal de receta
    const closeRecetaModal = document.getElementById('closeRecetaModal');
    if (closeRecetaModal) {
        closeRecetaModal.addEventListener('click', function() {
            document.getElementById('recetaModal').style.display = 'none';
        });
    }
    
    // Event listener para cancelar en modal de receta
    const cancelarRecetaBtn = document.getElementById('cancelarRecetaBtn');
    if (cancelarRecetaBtn) {
        cancelarRecetaBtn.addEventListener('click', function() {
            document.getElementById('recetaModal').style.display = 'none';
        });
    }
    
    // Event listener para cerrar modal de detalle
    const closeDetalleRecetaModal = document.getElementById('closeDetalleRecetaModal');
    if (closeDetalleRecetaModal) {
        closeDetalleRecetaModal.addEventListener('click', function() {
            document.getElementById('detalleRecetaModal').style.display = 'none';
        });
    }
    
    const cerrarDetalleRecetaBtn = document.getElementById('cerrarDetalleRecetaBtn');
    if (cerrarDetalleRecetaBtn) {
        cerrarDetalleRecetaBtn.addEventListener('click', function() {
            document.getElementById('detalleRecetaModal').style.display = 'none';
        });
    }
    
    // Event listener para el formulario de receta
    const recetaForm = document.getElementById('recetaForm');
    if (recetaForm) {
        recetaForm.addEventListener('submit', function(e) {
            e.preventDefault();
            guardarReceta();
        });
    }
    
    // Event listener para agregar ingrediente unificado
    const agregarIngredienteUnificadoBtn = document.getElementById('agregarIngredienteUnificadoBtn');
    if (agregarIngredienteUnificadoBtn) {
        agregarIngredienteUnificadoBtn.addEventListener('click', function() {
            agregarIngredienteUnificado();
        });
    }
    
    // Event listeners para filtros
    const searchReceta = document.getElementById('searchReceta');
    if (searchReceta) {
        searchReceta.addEventListener('input', filtrarRecetas);
    }
    
    const filterCategoriaReceta = document.getElementById('filterCategoriaReceta');
    if (filterCategoriaReceta) {
        filterCategoriaReceta.addEventListener('change', filtrarRecetas);
    }
    
    // Event listener para cerrar modales cuando se hace clic fuera
    window.addEventListener('click', function(event) {
        const recetaModal = document.getElementById('recetaModal');
        const detalleRecetaModal = document.getElementById('detalleRecetaModal');
        
        if (event.target === recetaModal) {
            recetaModal.style.display = 'none';
        }
        
        if (event.target === detalleRecetaModal) {
            detalleRecetaModal.style.display = 'none';
        }
    });
    
    console.log('✓ Event listeners de recetas configurados correctamente');
}

// Exportar funciones
window.loadRecetasContent = loadRecetasContent;
window.configurarEventListenersRecetas = configurarEventListenersRecetas;

// Cargar recetas al cargar el documento
document.addEventListener('DOMContentLoaded', () => {
    // Solo cargar automáticamente si estamos en la página de recetas
    if (window.location.pathname.includes('/recetas')) {
        loadRecetasContent();
    }
});

console.log("✅ Módulo UI de recetas cargado");