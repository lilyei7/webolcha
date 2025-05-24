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

// Variables globales para almacenar datos necesarios (RENOMBRADAS para evitar conflicto)
let recetasInsumosDisponibles = [];
let recetasInsumosCompuestosDisponibles = [];

// Función para cargar insumos y insumos compuestos disponibles
async function cargarIngredientesDisponibles() {
    try {
        console.log('Cargando ingredientes para recetas...');
        
        // Cargar insumos con su costo unitario desde proveedor principal
        const responseInsumos = await fetch('/insumos-para-receta/');
        const dataInsumos = await responseInsumos.json();
        
        if (dataInsumos.status === 'success') {
            recetasInsumosDisponibles = dataInsumos.insumos;
            console.log('Insumos cargados:', recetasInsumosDisponibles);
            
            // Debug: Verificar que cada insumo tiene un costo unitario
            console.log('Comprobando costos unitarios de los insumos...');
            recetasInsumosDisponibles.forEach(insumo => {
                console.log(`Insumo ${insumo.nombre} (ID: ${insumo.id}) - Costo Unitario: $${insumo.costo_unitario || 0}`);
            });
            
            // Identificar y reportar insumos sin costo unitario
            let insumosConProblemas = 0;
            recetasInsumosDisponibles.forEach(insumo => {
                if (!insumo.costo_unitario || insumo.costo_unitario <= 0) {
                    console.warn(`El insumo ${insumo.nombre} (ID: ${insumo.id}) no tiene costo unitario definido`);
                    insumosConProblemas++;
                }
            });
            
            if (insumosConProblemas > 0) {
                console.warn(`Algunos insumos no tienen costo unitario definido (${insumosConProblemas} de ${recetasInsumosDisponibles.length}). Esto afectará los cálculos automáticos.`);
                // Mostrar una alerta más visible
                setTimeout(() => {
                    const mainContent = document.querySelector('.main-content');
                    if (mainContent) {
                        const alertaDiv = document.createElement('div');
                        alertaDiv.style.cssText = `
                            background-color: #fff3cd;
                            color: #856404;
                            padding: 12px;
                            margin-bottom: 20px;
                            border-radius: 4px;
                            border-left: 4px solid #ffc107;
                        `;
                        alertaDiv.innerHTML = `
                            <strong>⚠️ Advertencia:</strong> Se encontraron ${insumosConProblemas} insumos sin costo unitario definido.
                            Esto puede afectar los cálculos de costos en las recetas.
                            <button onclick="this.parentElement.style.display='none'" 
                                    style="float: right; background: none; border: none; cursor: pointer; font-weight: bold;">
                                ×
                            </button>
                            <div style="clear: both; margin-top: 8px;">
                                <button onclick="mostrarModalAsignarCostos()" style="background-color: #ffc107; color: #333; border: none; border-radius: 4px; padding: 6px 12px; cursor: pointer;">
                                    Asignar costos a insumos
                                </button>
                            </div>
                        `;
                        mainContent.insertBefore(alertaDiv, mainContent.firstChild);
                    }
                }, 500);
            }
        } else {
            throw new Error('Error al cargar insumos: ' + dataInsumos.message);
        }
        
        // Cargar insumos compuestos
        const responseCompuestos = await fetch('/insumos-compuestos-para-receta/');
        const dataCompuestos = await responseCompuestos.json();
        
        if (dataCompuestos.status === 'success') {
            recetasInsumosCompuestosDisponibles = dataCompuestos.insumos_compuestos;
            console.log('Insumos compuestos cargados:', recetasInsumosCompuestosDisponibles);
            
            // Verificación para insumos compuestos
            recetasInsumosCompuestosDisponibles.forEach(insumo => {
                console.log(`Insumo compuesto ${insumo.nombre} (ID: ${insumo.id}) - Costo: $${insumo.costo || 0}`);
            });
        } else {
            throw new Error('Error al cargar insumos compuestos: ' + dataCompuestos.message);
        }
        
        return true;
    } catch (error) {
        console.error('Error al cargar ingredientes:', error);
        alert('Error al cargar los ingredientes disponibles: ' + error.message);
        return false;
    }
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
        script.src = '/static/accounts/js/crudRecetas.js';
        script.onload = function() {
            console.log('crudRecetas.js cargado correctamente');
        };
        document.head.appendChild(script);
    }
}

// Función principal para cargar el contenido de Recetas
async function loadRecetasContent() {
    console.log('Inicializando módulo de recetas...');
    
    // Primero asegurar que las funciones CRUD estén disponibles
    asegurarFuncionesCRUD();
    
    // Primero creamos la estructura HTML para las recetas
    const mainContent = document.querySelector('.main-content');
    if (!mainContent) {
        console.error('No se encontró el elemento .main-content');
        return;
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
                    
                    <!-- Ingredientes (insumos simples) -->
                    <div style="margin-bottom: 20px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                            <label style="font-weight: 500; color: #374151;">Ingredientes</label>
                            <button type="button" id="agregarInsumoBtn" style="background: #f1f5f9; color: #475569; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-weight: 500; font-size: 0.85rem; display: flex; align-items: center; gap: 4px;">
                                <i class="fa-solid fa-plus"></i> Agregar ingrediente
                            </button>
                        </div>
                        
                        <div id="insumosContainer">
                            <!-- Se rellenará dinámicamente -->
                        </div>
                    </div>
                    
                    <!-- Ingredientes (insumos compuestos) -->
                    <div style="margin-bottom: 24px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                            <label style="font-weight: 500; color: #374151;">Ingredientes pre-preparados</label>
                            <button type="button" id="agregarInsumoCompuestoBtn" style="background: #f1f5f9; color: #475569; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-weight: 500; font-size: 0.85rem; display: flex; align-items: center; gap: 4px;">
                                <i class="fa-solid fa-plus"></i> Agregar pre-preparado
                            </button>
                        </div>
                        
                        <div id="insumosCompuestosContainer">
                            <!-- Se rellenará dinámicamente -->
                        </div>
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
    await cargarIngredientesDisponibles();
    
    // Continuar con la carga de recetas una vez que el DOM está listo
    cargarRecetas();
    
    // Configurar event listeners específicos después de que el DOM esté listo
    setTimeout(() => configurarEventListenersRecetas(), 100);
    
    console.log('Módulo de recetas inicializado correctamente');
}

// Asegurar que la función loadRecetasContent esté disponible globalmente
window.loadRecetasContent = loadRecetasContent;

// Función para cargar recetas desde la API
async function cargarRecetas() {
    try {
        const response = await fetch('/recetas/');
        
        // Verificar si la respuesta es un 404 o HTML en lugar de JSON
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            // Si no es JSON, lanzamos un error pero con un mensaje amigable
            throw new Error("API no disponible o no devuelve JSON");
        }
        
        const data = await response.json();
        
        if (data.status === 'success') {
            const tbody = document.getElementById('recetasTbody');
            
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
            
            tbody.innerHTML = data.recetas.map(receta => `
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
                            <button onclick="eliminarReceta(${receta.id}, '${receta.nombre}')" style="width: 32px; height: 32px; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; color: #ef4444; background: #fef2f2; border: none; cursor: pointer;" title="Eliminar">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');
            
        } else {
            console.error('Error al cargar recetas:', data.message);
        }
    } catch (error) {
        console.error('Error al cargar recetas:', error);
        throw error;
    }
}

// Función para filtrar recetas
function filtrarRecetas() {
    // Implementar esta función para filtrar recetas por nombre o categoría
    const searchTerm = document.getElementById('searchReceta').value.toLowerCase();
    const categoriaFiltro = document.getElementById('filterCategoriaReceta').value.toLowerCase();
    
    const filas = document.querySelectorAll('#recetasTbody tr');
    
    filas.forEach(fila => {
        const nombre = fila.querySelector('td:first-child div').textContent.toLowerCase();
        const categoria = fila.querySelector('td:nth-child(2)').textContent.toLowerCase();
        
        const coincideNombre = nombre.includes(searchTerm);
        const coincideCategoria = categoriaFiltro === '' || categoria.toLowerCase() === categoriaFiltro;
        
        if (coincideNombre && coincideCategoria) {
            fila.style.display = '';
        } else {
            fila.style.display = 'none';
        }
    });
}

// Función para configurar los event listeners específicos de recetas
function configurarEventListenersRecetas() {
    console.log('Configurando event listeners para recetas...');
    
    // Asegurar que las funciones CRUD estén disponibles antes de configurar event listeners
    asegurarFuncionesCRUD();
    
    // Event listener para el botón de nueva receta
    const btnNuevaReceta = document.getElementById('btnNuevaReceta');
    if (btnNuevaReceta) {
        btnNuevaReceta.addEventListener('click', function() {
            if (typeof window.mostrarModalReceta === 'function') {
                window.mostrarModalReceta();
            } else {
                console.error('La función mostrarModalReceta no está disponible');
                alert('Error: No se puede mostrar el formulario de receta');
            }
        });
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
    
    // Event listener para agregar insumo
    const agregarInsumoBtn = document.getElementById('agregarInsumoBtn');
    if (agregarInsumoBtn) {
        agregarInsumoBtn.addEventListener('click', function() {
            agregarInsumo();
        });
    }
    
    // Event listener para agregar insumo compuesto
    const agregarInsumoCompuestoBtn = document.getElementById('agregarInsumoCompuestoBtn');
    if (agregarInsumoCompuestoBtn) {
        agregarInsumoCompuestoBtn.addEventListener('click', function() {
            agregarInsumoCompuesto();
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
    return string.charAt(0).toUpperCase() + string.slice(1);
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
    
    return costoTotal;
}

// Añadir esta función para abrir un modal que permita asignar costos a insumos
function mostrarModalAsignarCostos() {
    // Crear modal si no existe
    let costoModal = document.getElementById('asignarCostosModal');
    if (!costoModal) {
        const costoModalHTML = `
            <div id="asignarCostosModal" class="modal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background-color:rgba(0,0,0,0.5); z-index:1000; display:flex; align-items:center; justify-content:center;">
                <div class="modal-content" style="background:#fff; padding:20px; border-radius:8px; width:90%; max-width:800px; max-height:80vh; overflow-y:auto;">
                    <h2>Asignar Costos Unitarios a Insumos</h2>
                    <p>Estos insumos no tienen costos unitarios definidos. Por favor, asígneles un costo:</p>
                    <div id="insumosListaAsignar" style="margin-top:15px;">
                        <!-- Aquí se cargarán los insumos dinámicamente -->
                    </div>
                    <div style="margin-top:20px; display:flex; justify-content:flex-end; gap:10px;">
                        <button id="guardarCostosBtn" style="background:#2563eb; color:white; border:none; padding:8px 16px; border-radius:4px; cursor:pointer;">Guardar Costos</button>
                        <button id="cerrarCostosModalBtn" style="background:#e5e7eb; color:#1f2937; border:none; padding:8px 16px; border-radius:4px; cursor:pointer;">Cancelar</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', costoModalHTML);
        costoModal = document.getElementById('asignarCostosModal');
        
        // Añadir event listeners
        document.getElementById('cerrarCostosModalBtn').addEventListener('click', function() {
            costoModal.style.display = 'none';
        });
        
        document.getElementById('guardarCostosBtn').addEventListener('click', guardarCostosUnitarios);
    }
    
    // Llenar la lista con insumos sin costo
    const insumosSinCosto = recetasInsumosDisponibles.filter(i => !i.costo_unitario || i.costo_unitario <= 0);
    const listaContainer = document.getElementById('insumosListaAsignar');
    listaContainer.innerHTML = '';
    
    insumosSinCosto.forEach(insumo => {
        const insumoRow = document.createElement('div');
        insumoRow.className = 'insumo-costo-row';
        insumoRow.style.cssText = 'display:grid; grid-template-columns:1fr auto; gap:15px; margin-bottom:10px; align-items:center;';
        insumoRow.innerHTML = `
            <div>
                <strong>${insumo.nombre}</strong> (${insumo.unidad})
                <input type="hidden" value="${insumo.id}" class="insumo-id">
            </div>
            <div style="display:flex; align-items:center;">
                <span style="margin-right:5px;">$</span>
                <input type="number" min="0" step="0.01" class="costo-unitario-input" placeholder="Costo por ${insumo.unidad}" style="width:120px; padding:8px;">
                <span style="margin-left:5px;">/ ${insumo.unidad}</span>
            </div>
        `;
        listaContainer.appendChild(insumoRow);
    });
    
    // Mostrar modal
    costoModal.style.display = 'flex';
}

// Función para guardar los costos unitarios (simulación)
function guardarCostosUnitarios() {
    const rows = document.querySelectorAll('.insumo-costo-row');
    const datosActualizar = [];
    
    rows.forEach(row => {
        const insumoId = parseInt(row.querySelector('.insumo-id').value);
        const costoUnitario = parseFloat(row.querySelector('.costo-unitario-input').value) || 0;
        
        if (costoUnitario > 0) {
            datosActualizar.push({ id: insumoId, costo_unitario: costoUnitario });
            
            // Actualizar en memoria para cálculos inmediatos
            const insumo = recetasInsumosDisponibles.find(i => i.id === insumoId);
            if (insumo) {
                insumo.costo_unitario = costoUnitario;
            }
        }
    });
    
    if (datosActualizar.length > 0) {
        console.log('Datos para actualizar costos unitarios:', datosActualizar);
        
        // Aquí se enviarían los datos al servidor con fetch
        // Por ahora solo simulamos una actualización exitosa
        alert(`Se han actualizado ${datosActualizar.length} insumos con nuevos costos unitarios.`);
        
        // Cerrar el modal
        document.getElementById('asignarCostosModal').style.display = 'none';
        
        // Actualizar cualquier campo de costo que esté mostrándose
        document.querySelectorAll('[id^="insumoCantidad"]').forEach((input, index) => {
            if (input.value) {
                calcularCostoInsumo(index);
            }
        });
    } else {
        alert('No se han asignado costos unitarios.');
    }
}

// Implementaciones de respaldo para funciones críticas
// Solo se usarán si las originales no están disponibles
if (typeof window.mostrarModalReceta !== 'function') {
    window.mostrarModalReceta = function(receta = null) {
        console.warn('Usando implementación de respaldo para mostrarModalReceta');
        const modal = document.getElementById('recetaModal');
        if (modal) {
            modal.style.display = 'flex';
        } else {
            alert('El formulario de receta no está disponible');
        }
    };
}

if (typeof window.verDetalleReceta !== 'function') {
    window.verDetalleReceta = function(id) {
        console.warn('Usando implementación de respaldo para verDetalleReceta');
        alert(`Esta función no está disponible por completo. ID de receta: ${id}`);
    };
}

if (typeof window.editarReceta !== 'function') {
    window.editarReceta = function(id) {
        console.warn('Usando implementación de respaldo para editarReceta');
        alert(`Esta función no está disponible por completo. ID de receta: ${id}`);
    };
}

if (typeof window.eliminarReceta !== 'function') {
    window.eliminarReceta = function(id, nombre) {
        console.warn('Usando implementación de respaldo para eliminarReceta');
        alert(`Esta función no está disponible por completo. ID de receta: ${id}, Nombre: ${nombre}`);
    };
}

// Asegurar que las funciones estén disponibles apenas se cargue este script
asegurarFuncionesCRUD();