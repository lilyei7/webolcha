// Función para obtener el token CSRF
function getCsrfTokenElaborados() {
    return getCookie('csrftoken');
}

// Función para obtener el token CSRF de las cookies
function getCookieElaborados(name) {
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

// Variables globales para guardar las listas de insumos
let insumosDisponiblesElaborados = [];
let insumosCompuestosDisponibles = [];

// Cargar la lista de insumos disponibles (modificada para cargar ambos tipos)
async function cargarInsumosDisponiblesElaborados() {
    try {
        // Cargar insumos normales
        const responseInsumos = await fetch('/insumos-para-elaborado/');
        const dataInsumos = await responseInsumos.json();
        
        if (dataInsumos.status === 'success') {
            insumosDisponiblesElaborados = dataInsumos.insumos;
            console.log('Insumos simples cargados para elaborados:', insumosDisponiblesElaborados.length);
            
            // Log para depurar precios
            console.log('Detalle de costos de insumos para elaborados:');
            dataInsumos.insumos.forEach(insumo => {
                console.log(`- ${insumo.nombre}: $${insumo.costo_estimado || 0} por ${insumo.unidad}`);
            });
        } else {
            console.error('Error al cargar insumos simples para elaborados:', dataInsumos.message);
        }
        
        // Cargar insumos compuestos
        const responseCompuestos = await fetch('/insumos-compuestos-para-elaborado/');
        const dataCompuestos = await responseCompuestos.json();
        
        if (dataCompuestos.status === 'success') {
            insumosCompuestosDisponibles = dataCompuestos.insumos_compuestos;
            console.log('Insumos compuestos cargados para elaborados:', insumosCompuestosDisponibles.length);
            
            // Log para depurar precios
            console.log('Detalle de costos de insumos compuestos para elaborados:');
            dataCompuestos.insumos_compuestos.forEach(insumo => {
                console.log(`- ${insumo.nombre}: $${insumo.costo_estimado || 0} por ${insumo.unidad}`);
            });
        } else {
            console.error('Error al cargar insumos compuestos para elaborados:', dataCompuestos.message);
        }
    } catch (error) {
        console.error('Error al cargar insumos para elaborados:', error);
        throw error; // Re-lanzar el error para manejarlo en el llamador
    }
}

// Función principal para cargar el contenido de Insumos Elaborados
function loadInsumosElaboradosContent() {
    const mainContent = document.querySelector('.main-content');
    
    // HTML completo con todos los elementos necesarios
    mainContent.innerHTML = `
        <div style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); padding: 24px; margin-top: 24px;">
            <!-- Encabezado de la sección -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; border-bottom: 1px solid #f1f5f9; padding-bottom: 20px;">
                <div>
                    <h1 style="color: #1e293b; margin: 0; font-size: 2rem; font-weight: 700; letter-spacing: -0.02em;">Insumos Elaborados</h1>
                    <p style="color: #64748b; margin-top: 6px; font-size: 1.05rem; max-width: 550px; line-height: 1.5;">
                        Gestiona tus insumos elaborados de preparación especial y sus ingredientes
                    </p>
                </div>
                <button id="btnNuevoInsumoElaborado" style="background: linear-gradient(90deg, #f97316 0%, #fb923c 100%); color: #ffffff; border: none; padding: 12px 20px; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 0.95rem; box-shadow: 0 4px 12px rgba(249,115,22,0.25); display: flex; align-items: center; gap: 8px; transition: all 0.3s ease; transform: translateY(0);">
                    <i class="fa-solid fa-plus" style="font-size: 0.85rem;"></i> 
                    <span>Nuevo Insumo Elaborado</span>
                </button>
            </div>
            
            <!-- Filtros de búsqueda -->
            <div style="display: flex; gap: 16px; margin: 24px 0; flex-wrap: wrap; background-color: #f8fafc; border-radius: 10px; padding: 20px; border: 1px solid #e2e8f0;">
                <div style="flex: 1; min-width: 260px; position: relative;">
                    <i class="fa-solid fa-search" style="position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: #64748b; font-size: 1rem;"></i>
                    <input type="text" id="searchInsumoElaborado" placeholder="Buscar insumo elaborado..." style="width: 100%; padding: 14px 14px 14px 45px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 1rem; box-shadow: 0 2px 5px rgba(0,0,0,0.03); transition: all 0.2s ease; color: #1e293b; font-weight: 500; background: white;">
                </div>
                <select id="filterCategoriaElaborado" style="padding: 12px 18px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: white; min-width: 190px; font-size: 1rem; color: #1e293b; font-weight: 500; box-shadow: 0 2px 5px rgba(0,0,0,0.03); background-image: url('data:image/svg+xml;utf8,<svg fill=\\'%2364748b\\' height=\\'24\\' viewBox=\\'0 0 24 24\\' width=\\'24\\' xmlns=\\'http://www.w3.org/2000/svg\\'><path d=\\'M7 10l5 5 5-5z\\'/><path d=\\'M0 0h24v24H0z\\' fill=\\'none\\'/></svg>'); background-repeat: no-repeat; background-position: right 12px center; -webkit-appearance: none; -moz-appearance: none; appearance: none; padding-right: 36px;">
                    <option value="todas">Todas las categorías</option>
                    <option value="preparados">Preparados</option>
                    <option value="cocidos">Cocidos</option>
                    <option value="fermentados">Fermentados</option>
                    <option value="ahumados">Ahumados</option>
                </select>
            </div>
            
            <!-- Tabla de insumos elaborados -->
            <div style="overflow-x: auto; margin-top: 10px;">
                <table id="insumosElaboradosTable" style="width: 100%; border-collapse: collapse; background: #ffffff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); margin-top: 20px; overflow: hidden;">
                    <thead>
                        <tr>
                            <th style="background-color: #f9fafb; color: #4b5563; font-weight: 600; font-size: 0.875rem; text-transform: uppercase; padding: 16px; letter-spacing: 0.05em; text-align: left; border-bottom: 2px solid #e5e7eb;">Insumo</th>
                            <th style="background-color: #f9fafb; color: #4b5563; font-weight: 600; font-size: 0.875rem; text-transform: uppercase; padding: 16px; letter-spacing: 0.05em; text-align: left; border-bottom: 2px solid #e5e7eb;">Unidad de Medida</th>
                            <th style="background-color: #f9fafb; color: #4b5563; font-weight: 600; font-size: 0.875rem; text-transform: uppercase; padding: 16px; letter-spacing: 0.05em; text-align: left; border-bottom: 2px solid #e5e7eb;">Cantidad</th>
                            <th style="background-color: #f9fafb; color: #4b5563; font-weight: 600; font-size: 0.875rem; text-transform: uppercase; padding: 16px; letter-spacing: 0.05em; text-align: left; border-bottom: 2px solid #e5e7eb;">Costo Aproximado</th>
                            <th style="background-color: #f9fafb; color: #4b5563; font-weight: 600; font-size: 0.875rem; text-transform: uppercase; padding: 16px; letter-spacing: 0.05em; text-align: center; border-bottom: 2px solid #e5e7eb;">Acciones</th>
                        </tr>
                    </thead>
                    <tbody id="insumosElaboradosTbody">
                        <tr>
                            <td colspan="5" style="text-align: center; padding: 20px; color: #6b7280;">Cargando insumos elaborados...</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Modal para crear/editar insumo elaborado -->
        <div id="insumoElaboradoModal" style="display: none; position: fixed; z-index: 9999; left: 0; top: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.6); align-items: center; justify-content: center;">
            <div style="background-color: #fff; padding: 30px; border-radius: 12px; width: 90%; max-width: 700px; max-height: 90vh; overflow-y: auto; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2); position: relative;">
                <span id="closeInsumoElaboradoModal" style="position: absolute; right: 20px; top: 20px; font-size: 28px; cursor: pointer; color: #6b7280;">&times;</span>
                <h2 id="insumoElaboradoModalTitle" style="color: #1f2937; margin-top: 0; margin-bottom: 24px; font-size: 1.5rem; border-bottom: 1px solid #e7e7eb; padding-bottom: 12px;">Nuevo Insumo Elaborado</h2>
                
                <form id="insumoElaboradoForm" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
                    <input type="hidden" id="insumoElaboradoId" name="insumoElaboradoId">
                    
                    <div style="grid-column: span 2; display: flex; flex-direction: column;">
                        <label for="nombreInsumoElaborado" style="color: #4b5563; margin-bottom: 6px; font-weight: 500;">Nombre del insumo elaborado: *</label>
                        <input type="text" id="nombreInsumoElaborado" name="nombreInsumoElaborado" required style="padding: 10px 12px; border: 1px solid #e7e7eb; border-radius: 6px; font-size: 0.95rem;">
                    </div>
                    
                    <div style="display: flex; flex-direction: column;">
                        <label for="categoriaInsumoElaborado" style="color: #4b5563; margin-bottom: 6px; font-weight: 500;">Categoría: *</label>
                        <select id="categoriaInsumoElaborado" name="categoriaInsumoElaborado" required style="padding: 10px 12px; border: 1px solid #e7e7eb; border-radius: 6px; font-size: 0.95rem; background-color: white;">
                            <option value="">Seleccionar categoría</option>
                            <option value="preparados">Preparados</option>
                            <option value="cocidos">Cocidos</option>
                            <option value="fermentados">Fermentados</option>
                            <option value="ahumados">Ahumados</option>
                        </select>
                    </div>
                    
                    <div style="display: flex; flex-direction: column;">
                        <label for="unidadInsumoElaborado" style="color: #4b5563; margin-bottom: 6px; font-weight: 500;">Unidad de medida: *</label>
                        <select id="unidadInsumoElaborado" name="unidadInsumoElaborado" required style="padding: 10px 12px; border: 1px solid #e7e7eb; border-radius: 6px; font-size: 0.95rem; background-color: white;">
                            <option value="">Seleccionar unidad</option>
                            <option value="kg">Kilogramo (kg)</option>
                            <option value="g">Gramo (g)</option>
                            <option value="lt">Litro (lt)</option>
                            <option value="ml">Mililitro (ml)</option>
                            <option value="pza">Pieza (pza)</option>
                        </select>
                    </div>
                    
                    <!-- Añade campo de cantidad total -->
                    <div style="display: flex; flex-direction: column;">
                        <label for="cantidadTotalElaborado" style="color: #4b5563; margin-bottom: 6px; font-weight: 500;">Cantidad producida: *</label>
                        <input type="number" id="cantidadTotalElaborado" name="cantidadTotalElaborado" min="0.01" step="0.01" required style="padding: 10px 12px; border: 1px solid #e7e7eb; border-radius: 6px; font-size: 0.95rem;">
                    </div>
                    
                    <div style="grid-column: span 2;">
                        <h3 style="margin-top: 20px; color: #1f2937; font-weight: 600; font-size: 1.1rem; border-bottom: 1px solid #e7e7eb; padding-bottom: 10px;">Ingredientes</h3>
                        
                        <div id="ingredientesContainer" style="margin-bottom: 15px;"></div>
                        
                        <button type="button" id="agregarIngredienteBtn" style="background-color: #ffedd5; color: #f97316; border: none; padding: 8px 15px; border-radius: 6px; cursor: pointer; font-size: 0.9rem; display: flex; align-items: center; gap: 5px;">
                            <i class="fa-solid fa-plus"></i> Agregar ingrediente
                        </button>
                    </div>
                    
                    <!-- Agregar campo de tiempo de preparación -->
                    <div style="display: flex; flex-direction: column;">
                        <label for="tiempoPreparacion" style="color: #4b5563; margin-bottom: 6px; font-weight: 500;">Tiempo de preparación (minutos):</label>
                        <input type="number" id="tiempoPreparacion" name="tiempoPreparacion" min="0" style="padding: 10px 12px; border: 1px solid #e7e7eb; border-radius: 6px; font-size: 0.95rem;">
                    </div>
                    
                    <!-- Agregar campo de método de preparación -->
                    <div style="display: flex; flex-direction: column;">
                        <label for="metodoPreparacion" style="color: #4b5563; margin-bottom: 6px; font-weight: 500;">Método de preparación:</label>
                        <select id="metodoPreparacion" name="metodoPreparacion" style="padding: 10px 12px; border: 1px solid #e7e7eb; border-radius: 6px; font-size: 0.95rem; background-color: white;">
                            <option value="">Seleccionar método</option>
                            <option value="coccion">Cocción</option>
                            <option value="horneado">Horneado</option>
                            <option value="frito">Frito</option>
                            <option value="fermentado">Fermentado</option>
                            <option value="mezclado">Mezclado</option>
                            <option value="otro">Otro</option>
                        </select>
                    </div>
                    
                    <div style="grid-column: span 2;">
                        <div style="display: flex; flex-direction: column;">
                            <label for="descripcionInsumoElaborado" style="color: #4b5563; margin-bottom: 6px; font-weight: 500;">Instrucciones de preparación:</label>
                            <textarea id="descripcionInsumoElaborado" name="descripcionInsumoElaborado" rows="3" style="padding: 10px 12px; border: 1px solid #e7e7eb; border-radius: 6px; font-size: 0.95rem; resize: vertical;"></textarea>
                        </div>
                    </div>
                    
                    <div style="grid-column: span 2; display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
                        <button type="submit" style="background: linear-gradient(90deg, #f97316 0%, #fb923c 100%); color: #ffffff; border: none; padding: 12px 20px; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 0.95rem; box-shadow: 0 4px 12px rgba(249,115,22,0.25);">
                            <i class="fa-solid fa-save"></i> Guardar
                        </button>
                        <button type="button" id="cancelarInsumoElaboradoBtn" style="background: #f3f4f6; color: #4b5563; border: none; padding: 12px 20px; border-radius: 6px; cursor: pointer; font-weight: 500; font-size: 0.95rem;">
                            <i class="fa-solid fa-times"></i> Cancelar
                        </button>
                    </div>
                    
                    <div style="grid-column: span 2; margin-top: 15px; background-color: #fff7ed; padding: 12px; border-radius: 6px; border: 1px solid #fed7aa;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-weight: 600; color: #c2410c;">Costo total calculado:</span>
                            <span id="costoTotalElaboradoCalculado" style="font-weight: 700; color: #ea580c; font-size: 1.1rem;">$0.00</span>
                        </div>
                    </div>
                </form>
            </div>
        </div>

        <!-- Modal para ver detalle de ingredientes -->
        <div id="detalleIngredientesModal" style="display: none; position: fixed; z-index: 9999; left: 0; top: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.6); align-items: center; justify-content: center;">
            <div style="background-color: #fff; padding: 30px; border-radius: 12px; width: 90%; max-width: 700px; max-height: 90vh; overflow-y: auto; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2); position: relative;">
                <span id="closeDetalleIngredientesModal" style="position: absolute; right: 20px; top: 20px; font-size: 28px; cursor: pointer; color: #6b7280;">&times;</span>
                <h2 id="detalleIngredientesTitle" style="color: #1f2937; margin-top: 0; margin-bottom: 24px; font-size: 1.5rem; border-bottom: 1px solid #e7e7eb; padding-bottom: 12px;">Detalles del Insumo Elaborado</h2>
                <div id="detalleIngredientesContent"></div>
                <div style="text-align: right; margin-top: 20px;">
                    <button type="button" id="cerrarDetalleIngredientesBtn" style="background: #f3f4f6; color: #4b5563; border: none; padding: 12px 20px; border-radius: 6px; cursor: pointer; font-weight: 500; font-size: 0.95rem;">
                        <i class="fa-solid fa-times"></i> Cerrar
                    </button>
                </div>
            </div>
        </div>
    `;

    // Cargar insumos disponibles primero (con manejo de errores)
    cargarInsumosDisponiblesElaborados()
        .then(() => {
            // Intentamos cargar datos reales de la API
            cargarInsumosElaborados()
                .catch(error => {
                    console.error("Error al cargar insumos elaborados:", error);
                    // Mostrar mensaje de error
                    document.getElementById('insumosElaboradosTbody').innerHTML = `
                        <tr>
                            <td colspan="5" style="text-align: center; padding: 20px; color: #ef4444;">
                                <i class="fa-solid fa-triangle-exclamation" style="font-size: 1.5rem; margin-bottom: 10px;"></i>
                                <p>Error al cargar insumos elaborados</p>
                                <button onclick="cargarInsumosElaborados()" style="padding: 6px 12px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer; margin-top: 10px;">
                                    Intentar nuevamente
                                </button>
                            </td>
                        </tr>
                    `;
                });
            
            // Configurar event listeners después de que todo el HTML esté insertado
            setTimeout(() => configurarEventListenersElaborados(), 100);
        })
        .catch(error => {
            console.error("Error al cargar insumos disponibles para elaborados:", error);
            // Mostrar mensaje de error
            document.getElementById('insumosElaboradosTbody').innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 20px; color: #ef4444;">
                        <p>Error al cargar los insumos básicos necesarios</p>
                        <button onclick="loadInsumosElaboradosContent()" style="padding: 6px 12px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer; margin-top: 10px;">
                            Recargar
                        </button>
                    </td>
                </tr>
            `;
        });
}

// Función para calcular el costo total en insumos elaborados
function calcularCostoTotalElaborado(ingredientes) {
    if (!ingredientes || !Array.isArray(ingredientes)) {
        return 0;
    }
    
    // Log para depuración
    let total = 0;
    for (let ingrediente of ingredientes) {
        const costo = parseFloat(ingrediente.costo || 0);
        total += costo;
        console.log(`Ingrediente: ${ingrediente.insumo || 'Sin nombre'}, Costo: $${costo}, Total acumulado: $${total}`);
    }
    
    return total;
}

// Función para cargar insumos elaborados desde la API
async function cargarInsumosElaborados() {
    try {
        const response = await fetch('/insumos-elaborados/');
        const data = await response.json();
        
        if (data.status === 'success') {
            const tbody = document.getElementById('insumosElaboradosTbody');
            
            if (data.insumos_elaborados.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="5" style="text-align: center; padding: 20px; color: #6b7280;">
                            No hay insumos elaborados registrados
                        </td>
                    </tr>
                `;
                return;
            }
            
            // Depuración
            console.log("Datos de insumos elaborados recibidos:", data.insumos_elaborados);
            
            tbody.innerHTML = data.insumos_elaborados.map(insumo => {
                // Asegurar que todos los valores estén definidos
                const nombre = insumo.nombre || 'Sin nombre';
                const categoria = insumo.categoria || 'sin-categoria';
                const unidad = insumo.unidad || '-';
                const cantidad = insumo.cantidad || 0;
                
                // IMPORTANTE: Siempre recalcular el costo total a partir de los componentes
                // en lugar de confiar en el valor que viene del backend
                const costoTotal = calcularCostoTotalElaborado(insumo.ingredientes);
                
                // Asegurar que tenemos un valor válido para el costo unitario
                const costoUnitario = cantidad > 0 ? costoTotal / cantidad : 0;
                
                return `
                    <tr>
                        <td style="padding: 16px; border-bottom: 1px solid #f3f4f6; vertical-align: middle; background-color: white;">
                            <div style="font-weight: 600; color: #000000; font-size: 1rem;">${nombre}</div>
                            <div style="color: #64748b; font-size: 0.85rem;">Categoría: ${capitalizarPrimeraLetraElaborados(categoria)}</div>
                        </td>
                        <td style="padding: 16px; border-bottom: 1px solid #f3f4f6; vertical-align: middle; color: #000000; background-color: white;">${formatearUnidadElaborados(unidad)}</td>
                        <td style="padding: 16px; border-bottom: 1px solid #f3f4f6; vertical-align: middle; color: #000000; background-color: white;">${cantidad}</td>
                        <td style="padding: 16px; border-bottom: 1px solid #f3f4f6; vertical-align: middle; color: #000000; background-color: white;">
                            <div style="font-weight: 500;">$${costoTotal.toFixed(2)}</div>
                            <div style="color: #64748b; font-size: 0.85rem;">$${costoUnitario.toFixed(2)} por ${formatearUnidadElaborados(unidad)}</div>
                        </td>
                        <td style="padding: 16px; border-bottom: 1px solid #f3f4f6; vertical-align: middle; background-color: white; text-align: center;">
                            <div style="display: flex; gap: 8px; justify-content: center;">
                                <button onclick="verDetalleIngredientes(${insumo.id})" style="width: 32px; height: 32px; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; color: #6b7280; background: #f3f4f6; border: none; cursor: pointer;" title="Ver ingredientes">
                                    <i class="fa-solid fa-list"></i>
                                </button>
                                <button onclick="editarInsumoElaborado(${insumo.id})" style="width: 32px; height: 32px; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; color: #f97316; background: #fff7ed; border: none; cursor: pointer;" title="Editar">
                                    <i class="fa-solid fa-pen"></i>
                                </button>
                                <button onclick="eliminarInsumoElaborado(${insumo.id}, '${nombre.replace(/'/g, "\\'")}')" style="width: 32px; height: 32px; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; color: #ef4444; background: #fef2f2; border: none; cursor: pointer;" title="Eliminar">
                                    <i class="fa-solid fa-trash"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            }).join('');
            
        } else {
            console.error('Error al cargar insumos elaborados:', data.message);
        }
    } catch (error) {
        console.error('Error al cargar insumos elaborados:', error);
    }
}

// Función para filtrar insumos elaborados según criterios de búsqueda
function filtrarInsumosElaborados() {
    const searchTerm = document.getElementById('searchInsumoElaborado').value.toLowerCase();
    const categoriaFilter = document.getElementById('filterCategoriaElaborado').value;
    
    const rows = document.querySelectorAll('#insumosElaboradosTbody tr');
    
    rows.forEach(row => {
        const insumoNombre = row.querySelector('div[style*="font-weight: 600"]')?.textContent.toLowerCase() || '';
        const insumoCategoria = row.querySelector('div[style*="color: #64748b"]')?.textContent.toLowerCase() || '';
        
        const matchesSearch = insumoNombre.includes(searchTerm);
        const matchesCategoria = categoriaFilter === 'todas' || insumoCategoria.includes(categoriaFilter.toLowerCase());
        
        // Mostrar u ocultar la fila según los filtros
        row.style.display = (matchesSearch && matchesCategoria) ? '' : 'none';
    });
}

// Función para calcular y mostrar el costo total
function actualizarCostoTotalElaborado() {
    console.log("📊 Recalculando costo total del elaborado...");
    const ingredientesItems = document.querySelectorAll('.ingrediente-item');
    let costoTotal = 0;
    
    ingredientesItems.forEach(item => {
        const cantidadInput = item.querySelector('input[id^="ingredienteCantidad"]');
        const costoInput = item.querySelector('input[id^="ingredienteCosto"]');
        
        if (cantidadInput && costoInput) {
            const cantidad = parseFloat(cantidadInput.value) || 0;
            const costo = parseFloat(costoInput.value) || 0;
            costoTotal += costo;
        }
    });
    
    // Mostrar el costo total en el elemento HTML
    const costoTotalElement = document.getElementById('costoTotalElaboradoCalculado');
    if (costoTotalElement) {
        costoTotalElement.textContent = `$${costoTotal.toFixed(2)}`;
    }
    
    // Calcular costo unitario si hay cantidad total
    const cantidadTotalInput = document.getElementById('cantidadTotalElaborado');
    if (cantidadTotalInput) {
        const cantidadTotal = parseFloat(cantidadTotalInput.value) || 0;
        if (cantidadTotal > 0) {
            const costoUnitario = costoTotal / cantidadTotal;
            console.log(`📈 Costo unitario: $${costoUnitario.toFixed(2)} (basado en cantidad: ${cantidadTotal})`);
        }
    }
    
    console.log(`💰 Costo total elaborado calculado: $${costoTotal.toFixed(2)}`);
    return costoTotal;
}

// Función para configurar event listeners
function configurarEventListenersElaborados() {
    // Botón para mostrar el modal de nuevo insumo elaborado
    document.getElementById('btnNuevoInsumoElaborado').addEventListener('click', () => {
        mostrarModalInsumoElaborado();
    });

    // Botón para cerrar el modal
    document.getElementById('closeInsumoElaboradoModal').addEventListener('click', () => {
        document.getElementById('insumoElaboradoModal').style.display = 'none';
    });

    // Botón para cancelar
    document.getElementById('cancelarInsumoElaboradoBtn').addEventListener('click', () => {
        document.getElementById('insumoElaboradoModal').style.display = 'none';
    });

    // Botón para agregar un ingrediente
    document.getElementById('agregarIngredienteBtn').addEventListener('click', () => {
        agregarIngrediente();
    });

    // Formulario
    document.getElementById('insumoElaboradoForm').addEventListener('submit', (e) => {
        e.preventDefault();
        guardarInsumoElaborado();
    });

    // Botones para el modal de detalles
    document.getElementById('closeDetalleIngredientesModal').addEventListener('click', () => {
        document.getElementById('detalleIngredientesModal').style.display = 'none';
    });

    document.getElementById('cerrarDetalleIngredientesBtn').addEventListener('click', () => {
        document.getElementById('detalleIngredientesModal').style.display = 'none';
    });

    // Filtro de búsqueda
    document.getElementById('searchInsumoElaborado').addEventListener('input', filtrarInsumosElaborados);
    document.getElementById('filterCategoriaElaborado').addEventListener('change', filtrarInsumosElaborados);
    
    // Añadido: Evento para actualizar costo total al cambiar cantidad total
    document.getElementById('cantidadTotalElaborado').addEventListener('input', actualizarCostoTotalElaborado);
}

// Función para mostrar el modal de insumo elaborado
function mostrarModalInsumoElaborado(insumoElaborado = null) {
    const modal = document.getElementById('insumoElaboradoModal');
    const form = document.getElementById('insumoElaboradoForm');
    const ingredientes = document.getElementById('ingredientesContainer');
    
    // Limpiar el formulario
    form.reset();
    ingredientes.innerHTML = '';
    
    // Si es un nuevo insumo, mostrar un ingrediente vacío por defecto
    if (!insumoElaborado) {
        document.getElementById('insumoElaboradoModalTitle').textContent = 'Nuevo Insumo Elaborado';
        document.getElementById('insumoElaboradoId').value = '';
        agregarIngrediente();
    } else {
        // Si es edición, llenar el formulario con los datos existentes
        document.getElementById('insumoElaboradoModalTitle').textContent = 'Editar Insumo Elaborado';
        
        document.getElementById('insumoElaboradoId').value = insumoElaborado.id;
        document.getElementById('nombreInsumoElaborado').value = insumoElaborado.nombre;
        document.getElementById('categoriaInsumoElaborado').value = insumoElaborado.categoria;
        document.getElementById('unidadInsumoElaborado').value = insumoElaborado.unidad;
        document.getElementById('cantidadTotalElaborado').value = insumoElaborado.cantidad;
        document.getElementById('tiempoPreparacion').value = insumoElaborado.tiempo_preparacion || '';
        document.getElementById('metodoPreparacion').value = insumoElaborado.metodo_preparacion || '';
        document.getElementById('descripcionInsumoElaborado').value = insumoElaborado.descripcion || '';
        
        // Agregar los ingredientes (con soporte para tipo)
        if (insumoElaborado.ingredientes && insumoElaborado.ingredientes.length > 0) {
            insumoElaborado.ingredientes.forEach(ingrediente => {
                // Asegurarnos de que el tipo esté definido
                if (!ingrediente.tipo) {
                    ingrediente.tipo = 'insumo'; // Por defecto es insumo normal
                }
                
                agregarIngrediente(ingrediente);
            });
        } else {
            agregarIngrediente();
        }
        
        // Actualizar el costo total
        setTimeout(() => {
            actualizarCostoTotalElaborado();
        }, 100);
    }
    
    modal.style.display = 'flex';
}

// Función para agregar un ingrediente al formulario
function agregarIngrediente(ingrediente = null) {
    const container = document.getElementById('ingredientesContainer');
    const ingredienteIndex = container.children.length;
    
    // Determinar el tipo del ingrediente si está siendo editado
    const tipoIngrediente = ingrediente ? (ingrediente.tipo || 'insumo') : 'insumo';
    
    // Crear opciones para insumos normales
    const opcionesInsumos = insumosDisponiblesElaborados.map(insumo => 
        `<option value="${insumo.id}" 
            data-unidad="${insumo.unidad}" 
            data-costo="${insumo.costo_estimado || 0}"
            data-nombre="${insumo.nombre}"
            data-tipo="insumo"
            ${ingrediente && ingrediente.insumo_id === insumo.id && tipoIngrediente === 'insumo' ? 'selected' : ''}>
            🔹 ${insumo.nombre}
        </option>`
    ).join('');
    
    // Crear opciones para insumos compuestos
    const opcionesCompuestos = insumosCompuestosDisponibles.map(insumo => 
        `<option value="${insumo.id}" 
            data-unidad="${insumo.unidad}" 
            data-costo="${insumo.costo_estimado || 0}"
            data-nombre="${insumo.nombre}"
            data-tipo="insumo_compuesto"
            ${ingrediente && ingrediente.insumo_id === insumo.id && tipoIngrediente === 'insumo_compuesto' ? 'selected' : ''}>
            🔸 ${insumo.nombre} (Compuesto)
        </option>`
    ).join('');
    
    const ingredienteHTML = `
        <div class="ingrediente-item" style="display: grid; grid-template-columns: 3fr 1fr 1fr 1fr auto; gap: 10px; margin-bottom: 10px; padding: 10px; background-color: #fff7ed; border-radius: 6px; align-items: center;">
            <div>
                <label for="ingredienteInsumo${ingredienteIndex}" style="display: block; font-size: 0.8rem; color: #6b7280; margin-bottom: 3px;">Insumo</label>
                <select id="ingredienteInsumo${ingredienteIndex}" name="ingredienteInsumo[]" required style="width: 100%; padding: 8px 10px; border: 1px solid #e7e7eb; border-radius: 4px; font-size: 0.9rem;">
                    <option value="">-- Seleccione un ingrediente --</option>
                    <optgroup label="Insumos Simples">
                        ${opcionesInsumos}
                    </optgroup>
                    <optgroup label="Insumos Compuestos">
                        ${opcionesCompuestos}
                    </optgroup>
                </select>
            </div>
            <div>
                <label for="ingredienteUnidad${ingredienteIndex}" style="display: block; font-size: 0.8rem; color: #6b7280; margin-bottom: 3px;">Unidad</label>
                <input type="text" id="ingredienteUnidad${ingredienteIndex}" name="ingredienteUnidad[]" value="${ingrediente ? ingrediente.unidad : ''}" readonly style="width: 100%; padding: 8px 10px; border: 1px solid #e7e7eb; border-radius: 4px; font-size: 0.9rem; background-color: #f3f4f6;">
            </div>
            <div>
                <label for="ingredienteCantidad${ingredienteIndex}" style="display: block; font-size: 0.8rem; color: #6b7280; margin-bottom: 3px;">Cantidad</label>
                <input type="number" id="ingredienteCantidad${ingredienteIndex}" name="ingredienteCantidad[]" min="0.01" step="0.01" value="${ingrediente ? ingrediente.cantidad : ''}" required style="width: 100%; padding: 8px 10px; border: 1px solid #e7e7eb; border-radius: 4px; font-size: 0.9rem;">
            </div>
            <div>
                <label for="ingredienteCosto${ingredienteIndex}" style="display: block; font-size: 0.8rem; color: #6b7280; margin-bottom: 3px;">Costo</label>
                <input type="number" id="ingredienteCosto${ingredienteIndex}" name="ingredienteCosto[]" min="0" step="0.01" value="${ingrediente ? ingrediente.costo : ''}" required style="width: 100%; padding: 8px 10px; border: 1px solid #e7e7eb; border-radius: 4px; font-size: 0.9rem;">
            </div>
            <div style="display: flex; align-items: flex-end; padding-bottom: 5px;">
                <button type="button" class="eliminar-ingrediente-btn" style="background-color: #fee2e2; color: #ef4444; border: none; border-radius: 4px; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
                    <i class="fa-solid fa-times"></i>
                </button>
            </div>
            <input type="hidden" id="ingredienteTipo${ingredienteIndex}" name="ingredienteTipo[]" value="${tipoIngrediente}">
        </div>
    `;
    
    // Agregar HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = ingredienteHTML;
    const ingredienteElement = tempDiv.firstElementChild;
    
    container.appendChild(ingredienteElement);
    
    // Añadir event listener para eliminar este ingrediente
    ingredienteElement.querySelector('.eliminar-ingrediente-btn').addEventListener('click', () => {
        container.removeChild(ingredienteElement);
        actualizarCostoTotalElaborado(); // Recalcular costo al eliminar
    });

    // Obtener referencias a los elementos
    const selectInsumo = ingredienteElement.querySelector(`#ingredienteInsumo${ingredienteIndex}`);
    const unidadInput = ingredienteElement.querySelector(`#ingredienteUnidad${ingredienteIndex}`);
    const cantidadInput = ingredienteElement.querySelector(`#ingredienteCantidad${ingredienteIndex}`);
    const costoInput = ingredienteElement.querySelector(`#ingredienteCosto${ingredienteIndex}`);
    const tipoInput = ingredienteElement.querySelector(`#ingredienteTipo${ingredienteIndex}`);
    
    // Evento cuando se selecciona un insumo
    selectInsumo.addEventListener('change', function() {
        const selectedOption = this.options[this.selectedIndex];
        if (selectedOption.value) {
            const unidad = selectedOption.dataset.unidad || '';
            const costoBase = parseFloat(selectedOption.dataset.costo) || 0;
            const tipo = selectedOption.dataset.tipo || 'insumo';
            
            // Actualizar unidad
            unidadInput.value = unidad;
            
            // Actualizar el tipo de ingrediente
            tipoInput.value = tipo;
            
            // Obtener la cantidad actual y calcular costo
            const cantidad = parseFloat(cantidadInput.value) || 0;
            if (cantidad > 0) {
                // Si ya hay una cantidad, calculamos el costo
                costoInput.value = (costoBase * cantidad).toFixed(2);
            } else {
                // Si no hay cantidad, colocamos el costo base como valor inicial
                // y establecemos cantidad como 1 para simplificar el cálculo inicial
                cantidadInput.value = "1";
                costoInput.value = costoBase.toFixed(2);
            }
            
            // Actualizar costo total
            actualizarCostoTotalElaborado();
        }
    });
    
    // Evento cuando se cambia la cantidad
    cantidadInput.addEventListener('input', function() {
        const cantidad = parseFloat(this.value) || 0;
        const selectedOption = selectInsumo.options[selectInsumo.selectedIndex];
        
        if (selectedOption && selectedOption.value) {
            const costoBase = parseFloat(selectedOption.dataset.costo) || 0;
            costoInput.value = (costoBase * cantidad).toFixed(2);
            
            // Actualizar costo total
            actualizarCostoTotalElaborado();
        }
    });
    
    // Evento cuando se cambia el costo directamente
    costoInput.addEventListener('input', actualizarCostoTotalElaborado);
    
    // Si hay un ingrediente para precargar, simular el evento change
    if (ingrediente && ingrediente.insumo_id) {
        selectInsumo.dispatchEvent(new Event('change'));
    }
}

// Función para guardar un insumo elaborado
async function guardarInsumoElaborado() {
    try {
        // Obtener valores básicos del formulario
        const id = document.getElementById('insumoElaboradoId').value;
        const nombre = document.getElementById('nombreInsumoElaborado').value.trim();
        const categoria = document.getElementById('categoriaInsumoElaborado').value;
        const unidad = document.getElementById('unidadInsumoElaborado').value;
        const descripcion = document.getElementById('descripcionInsumoElaborado').value.trim();
        const tiempoPreparacion = document.getElementById('tiempoPreparacion').value || 0;
        const metodoPreparacion = document.getElementById('metodoPreparacion').value || '';
        
        // Validaciones básicas
        if (!nombre) throw new Error('El nombre es obligatorio');
        if (!categoria) throw new Error('La categoría es obligatoria');
        if (!unidad) throw new Error('La unidad de medida es obligatoria');
        
        // Obtener cantidad producida total
        const cantidadTotal = parseFloat(document.getElementById('cantidadTotalElaborado').value);
        if (isNaN(cantidadTotal) || cantidadTotal <= 0) {
            throw new Error('Debe especificar una cantidad válida producida');
        }
        
        // Recopilar ingredientes
        const ingredientes = document.querySelectorAll('.ingrediente-item');
        if (ingredientes.length === 0) {
            throw new Error('Debe agregar al menos un ingrediente');
        }
        
        const ingredientesData = [];
        ingredientes.forEach(ingrediente => {
            const insumoSelect = ingrediente.querySelector('select[name="ingredienteInsumo[]"]');
            const cantidadInput = ingrediente.querySelector('input[name="ingredienteCantidad[]"]');
            const costoInput = ingrediente.querySelector('input[name="ingredienteCosto[]"]');
            const tipoInput = ingrediente.querySelector('input[name="ingredienteTipo[]"]');
            
            const insumoId = parseInt(insumoSelect.value);
            const cantidad = parseFloat(cantidadInput.value) || 0;
            const costo = parseFloat(costoInput.value) || 0;
            const tipo = tipoInput.value || 'insumo';
            
            if (!insumoId || isNaN(insumoId)) throw new Error('Selecciona un insumo válido');
            if (cantidad <= 0) throw new Error(`Ingresa una cantidad válida para ${insumoSelect.options[insumoSelect.selectedIndex].text}`);
            if (costo <= 0) throw new Error(`Ingresa un costo válido para ${insumoSelect.options[insumoSelect.selectedIndex].text}`);
            
            ingredientesData.push({
                insumo_id: insumoId,
                cantidad: cantidad,
                costo: costo,
                tipo: tipo
            });
        });
        
        // Calcular costo total
        const costoTotal = actualizarCostoTotalElaborado() || 0;
        
        // Crear el objeto de datos completo
        const insumoElaboradoData = {
            nombre,
            categoria,
            unidad,
            cantidad: cantidadTotal,
            costo_total: costoTotal,
            descripcion,
            tiempo_preparacion: parseInt(tiempoPreparacion),
            metodo_preparacion: metodoPreparacion,
            ingredientes: ingredientesData
        };
        
        // Debug - Verificar que los datos son correctos
        console.log('Datos a enviar (insumo elaborado):', insumoElaboradoData);
        
        // Si hay ID, es una edición
        if (id) {
            insumoElaboradoData.id = parseInt(id);
        }
        
        // Enviar al servidor
        const url = id ? `/insumos-elaborados/${id}/` : '/insumos-elaborados/';
        const method = id ? 'PUT' : 'POST';
        
        console.log(`Enviando ${method} a ${url} con datos:`, insumoElaboradoData);
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCsrfTokenElaborados()
            },
            body: JSON.stringify(insumoElaboradoData)
        });
        
        if (!response.ok) {
            // Obtener mensaje de error detallado si está disponible
            let errorMessage = `Error HTTP: ${response.status}`;
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorMessage;
            } catch (e) {
                console.warn('No se pudo parsear el mensaje de error como JSON');
            }
            throw new Error(errorMessage);
        }
        
        const data = await response.json();
        
        if (data.status === 'success') {
            // Ocultar modal y refrescar datos
            document.getElementById('insumoElaboradoModal').style.display = 'none';
            
            // Mostrar notificación de éxito
            const mensaje = id ? 'Insumo elaborado actualizado correctamente' : 'Insumo elaborado creado correctamente';
            showNotificationElaborado(mensaje, 'success');
            
            // Recargar la lista de insumos elaborados
            await cargarInsumosElaborados();
        } else {
            throw new Error(data.message || 'Error al procesar la solicitud');
        }
        
    } catch (error) {
        console.error('Error al guardar insumo elaborado:', error);
        showNotificationElaborado(`Error: ${error.message}`, 'error');
    }
}

// Función para editar un insumo elaborado
async function editarInsumoElaborado(id) {
    try {
        console.log(`Editando insumo elaborado con ID: ${id}`);
        
        // Mostrar un indicador de carga
        const loadingToast = showNotificationElaborado('Cargando datos...', 'info', false);
        
        // Cargar los datos del insumo elaborado
        const response = await fetch(`/insumos-elaborados/${id}/`);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Ocultar el toast de carga
        if (loadingToast) loadingToast.remove();
        
        if (data.status === 'success') {
            console.log("Datos del insumo elaborado cargados correctamente:", data.insumo_elaborado);
            
            // Verificar que el campo cantidad viene correctamente
            if (data.insumo_elaborado.cantidad === undefined || data.insumo_elaborado.cantidad === null) {
                console.warn("⚠️ El campo 'cantidad' está vacío en los datos recibidos");
                data.insumo_elaborado.cantidad = 0; // Valor por defecto
            }
            
            // Mostrar el modal con los datos cargados
            mostrarModalInsumoElaborado(data.insumo_elaborado);
        } else {
            throw new Error(data.message || 'Error al cargar los datos del insumo elaborado');
        }
    } catch (error) {
        console.error('Error al editar insumo elaborado:', error);
        showNotificationElaborado(`Error: ${error.message}`, 'error');
    }
}

// Función para eliminar un insumo elaborado
async function eliminarInsumoElaborado(id, nombre) {
    try {
        // Solicitar confirmación al usuario
        if (!confirm(`¿Estás seguro de que deseas eliminar el insumo elaborado "${nombre}"?`)) {
            return; // El usuario canceló la eliminación
        }
        
        console.log(`Eliminando insumo elaborado con ID: ${id}`);
        
        // Enviar solicitud DELETE al servidor
        const response = await fetch(`/insumos-elaborados/${id}/`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCsrfTokenElaborados()
            }
        });
        
        if (!response.ok) {
            let errorMessage = `Error HTTP: ${response.status}`;
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorMessage;
            } catch (e) {
                console.warn('No se pudo parsear el mensaje de error como JSON');
            }
            throw new Error(errorMessage);
        }
        
        const data = await response.json();
        
        if (data.status === 'success') {
            // Mostrar notificación de éxito
            showNotificationElaborado(`Insumo elaborado "${nombre}" eliminado correctamente`, 'success');
            
            // Recargar la lista de insumos elaborados
            await cargarInsumosElaborados();
        } else {
            throw new Error(data.message || 'Error al eliminar el insumo elaborado');
        }
    } catch (error) {
        console.error('Error al eliminar insumo elaborado:', error);
        showNotificationElaborado(`Error: ${error.message}`, 'error');
    }
}

// Función para ver detalle de los ingredientes de un insumo elaborado
async function verDetalleIngredientes(id) {
    try {
        console.log(`Obteniendo detalles del insumo elaborado ID: ${id}`);
        
        // Intentar obtener los datos de la API
        const response = await fetch(`/insumos-elaborados/${id}/`);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Respuesta completa:", data);
        
        if (data.status === 'success') {
            const insumoElaborado = data.insumo_elaborado;
            console.log("Datos del insumo elaborado:", insumoElaborado);
            console.log("Ingredientes:", insumoElaborado.ingredientes);
            
            document.getElementById('detalleIngredientesTitle').textContent = `Ingredientes de: ${insumoElaborado.nombre}`;
            
            const content = document.getElementById('detalleIngredientesContent');
            
            // Asegurar todos los valores o proporcionar defaults
            const categoria = insumoElaborado.categoria || 'Sin categoría';
            const unidad = insumoElaborado.unidad || '-';
            const cantidad = insumoElaborado.cantidad || 0;
            const costo_total = insumoElaborado.costo_total || 0;
            const costoUnitario = cantidad > 0 ? costo_total / cantidad : 0;
            const tiempoPrep = insumoElaborado.tiempo_preparacion || 'No especificado';
            const metodoPrep = insumoElaborado.metodo_preparacion || 'No especificado';
            
            content.innerHTML = `
                <div style="margin-bottom: 20px; background-color: #fff7ed; border-radius: 10px; padding: 20px; border: 1px solid #fed7aa;">
                    <p style="margin: 8px 0; font-size: 1rem;"><strong style="color: #9a3412;">Categoría:</strong> <span style="color: #9a3412;">${capitalizarPrimeraLetraElaborados(categoria)}</span></p>
                    <p style="margin: 8px 0; font-size: 1rem;"><strong style="color: #9a3412;">Unidad de medida:</strong> <span style="color: #9a3412;">${formatearUnidadElaborados(unidad)}</span></p>
                    <p style="margin: 8px 0; font-size: 1rem;"><strong style="color: #9a3412;">Cantidad producida:</strong> <span style="color: #9a3412;">${cantidad} ${formatearUnidadElaborados(unidad)}</span></p>
                    <p style="margin: 8px 0; font-size: 1rem;"><strong style="color: #9a3412;">Tiempo de preparación:</strong> <span style="color: #9a3412;">${tiempoPrep} minutos</span></p>
                    <p style="margin: 8px 0; font-size: 1rem;"><strong style="color: #9a3412;">Método:</strong> <span style="color: #9a3412;">${capitalizarPrimeraLetraElaborados(metodoPrep)}</span></p>
                    <p style="margin: 8px 0; font-size: 1rem;"><strong style="color: #9a3412;">Costo total:</strong> <span style="color: #9a3412;">$${costo_total.toFixed(2)}</span></p>
                    <p style="margin: 8px 0; font-size: 1rem;"><strong style="color: #9a3412;">Costo unitario:</strong> <span style="color: #9a3412;">$${costoUnitario.toFixed(2)} por ${formatearUnidadElaborados(unidad)}</span></p>
                </div>
                
                <h3 style="margin-top: 20px; margin-bottom: 16px; color: #9a3412; font-weight: 600; font-size: 1.1rem; border-bottom: 1px solid #fed7aa; padding-bottom: 10px;">Lista de ingredientes</h3>
                
                <div style="overflow-x: auto; margin-top: 10px;">
                    <table style="width: 100%; border-collapse: collapse; background: #ffffff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); margin-top: 10px; overflow: hidden;">
                        <thead>
                            <tr>
                                <th style="background-color: #fff7ed; color: #9a3412; font-weight: 600; font-size: 0.875rem; text-transform: uppercase; padding: 16px; letter-spacing: 0.05em; text-align: left; border-bottom: 2px solid #fed7aa;">Insumo</th>
                                <th style="background-color: #fff7ed; color: #9a3412; font-weight: 600; font-size: 0.875rem; text-transform: uppercase; padding: 16px; letter-spacing: 0.05em; text-align: left; border-bottom: 2px solid #fed7aa;">Tipo</th>
                                <th style="background-color: #fff7ed; color: #9a3412; font-weight: 600; font-size: 0.875rem; text-transform: uppercase; padding: 16px; letter-spacing: 0.05em; text-align: left; border-bottom: 2px solid #fed7aa;">Unidad</th>
                                <th style="background-color: #fff7ed; color: #9a3412; font-weight: 600; font-size: 0.875rem; text-transform: uppercase; padding: 16px; letter-spacing: 0.05em; text-align: left; border-bottom: 2px solid #fed7aa;">Cantidad</th>
                                <th style="background-color: #fff7ed; color: #9a3412; font-weight: 600; font-size: 0.875rem; text-transform: uppercase; padding: 16px; letter-spacing: 0.05em; text-align: right; border-bottom: 2px solid #fed7aa;">Costo</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${insumoElaborado.ingredientes && insumoElaborado.ingredientes.map(ingrediente => {
                                const nombreInsumo = ingrediente.insumo || 'Ingrediente sin nombre';
                                const unidadIngrediente = ingrediente.unidad || '-';
                                const cantidadIngrediente = ingrediente.cantidad || 0;
                                const costoIngrediente = ingrediente.costo || 0;
                                const tipoIngrediente = ingrediente.tipo === 'insumo_compuesto' ? 'Compuesto' : 'Simple';
                                const iconoTipo = ingrediente.tipo === 'insumo_compuesto' ? '🔸' : '🔹';
                                
                                return `
                                <tr>
                                    <td style="padding: 16px; border-bottom: 1px solid #fed7aa; vertical-align: middle; color: #9a3412; background-color: white;">${nombreInsumo}</td>
                                    <td style="padding: 16px; border-bottom: 1px solid #fed7aa; vertical-align: middle; color: #9a3412; background-color: white;">${iconoTipo} ${tipoIngrediente}</td>
                                    <td style="padding: 16px; border-bottom: 1px solid #fed7aa; vertical-align: middle; color: #9a3412; background-color: white;">${formatearUnidadElaborados(unidadIngrediente)}</td>
                                    <td style="padding: 16px; border-bottom: 1px solid #fed7aa; vertical-align: middle; color: #9a3412; background-color: white;">${cantidadIngrediente}</td>
                                    <td style="padding: 16px; border-bottom: 1px solid #fed7aa; vertical-align: middle; color: #9a3412; background-color: white; text-align: right;">$${costoIngrediente.toFixed(2)}</td>
                                </tr>
                                `;
                            }).join('') || '<tr><td colspan="5" style="text-align:center; padding: 20px;">No hay ingredientes disponibles</td></tr>'}
                            <tr>
                                <td colspan="4" style="padding: 16px; font-weight: 600; text-align: right; border-top: 2px solid #fed7aa; background-color: white; color: #9a3412;">TOTAL:</td>
                                <td style="padding: 16px; font-weight: 600; text-align: right; border-top: 2px solid #fed7aa; background-color: white; color: #9a3412;">$${costo_total.toFixed(2)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                ${insumoElaborado.descripcion ? `
                <h3 style="margin-top: 20px; margin-bottom: 16px; color: #9a3412; font-weight: 600; font-size: 1.1rem; border-bottom: 1px solid #fed7aa; padding-bottom: 10px;">Instrucciones de preparación</h3>
                <div style="background-color: #fff7ed; border-radius: 10px; padding: 20px; border: 1px solid #fed7aa;">
                    <p style="margin: 0; color: #9a3412;">${insumoElaborado.descripcion}</p>
                </div>
                ` : ''}
            `;
            
            document.getElementById('detalleIngredientesModal').style.display = 'flex';
        } else {
            throw new Error(data.message || 'Error desconocido');
        }
    } catch (error) {
        console.error('Error al obtener detalles del insumo elaborado:', error);
        showNotificationElaborado(`Error al cargar los detalles del insumo elaborado: ${error.message}`, 'error');
    }
}

// Función auxiliar para formatear unidades
function formatearUnidadElaborados(unidad) {
    if (!unidad) return '-';
    
    const unidades = {
        'kg': 'Kilogramo',
        'g': 'Gramo',
        'lt': 'Litro',
       
        'caja': 'Caja',
        'bolsa': 'Bolsa',
        'paquete': 'Paquete'
    };
    
    return unidades[unidad] || unidad;
}

// Función para capitalizar la primera letra
function capitalizarPrimeraLetraElaborados(str) {
    if (!str) return 'Sin categoría';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Función auxiliar para mostrar notificaciones
function showNotificationElaborado(message, type = 'success', autoHide = true) {
    // Crear el elemento de notificación
    const notification = document.createElement('div');
    notification.className = `notification notification-${type || 'success'}`;
    notification.style.position = 'fixed';
    notification.style.bottom = '15px';
    notification.style.right = '15px';
    notification.style.padding = '8px 12px';
    notification.style.borderRadius = '4px';
    notification.style.boxShadow = '0 2px 6px rgba(0,0,0,0.12)';
    notification.style.zIndex = '10000';
    notification.style.maxWidth = '250px';
    notification.style.display = 'flex';
    notification.style.alignItems = 'center';
    notification.style.gap = '6px';
    notification.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
    notification.style.transform = 'translateX(100px)';
    notification.style.opacity = '0';
    notification.style.fontSize = '0.85rem';

    // Establecer colores según el tipo
    if (type === 'success') {
        notification.style.backgroundColor = '#f97316';
        notification.style.color = 'white';
    } else if (type === 'error') {
        notification.style.backgroundColor = '#ef4444';
        notification.style.color = 'white';
    } else if (type === 'info') {
        notification.style.backgroundColor = '#f97316';
        notification.style.color = 'white';
    }

    // Iconos más pequeños
    let icon = '';
    if (type === 'success') {
        icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="width: 16px; height: 16px;">
                <path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clip-rule="evenodd" />
               </svg>`;
    } else if (type === 'error') {
        icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="width: 16px; height: 16px;">
                <path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z" clip-rule="evenodd" />
               </svg>`;
    } else if (type === 'info') {
        icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="width: 16px; height: 16px;">
                <path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z" clip-rule="evenodd" />
               </svg>`;
    }

    // Contenido de la notificación
    notification.innerHTML = `
        <div style="flex-shrink: 0;">${icon}</div>
        <div style="flex-grow: 1; line-height: 1.2;">${message}</div>
        <div style="flex-shrink: 0; cursor: pointer; margin-left: 2px;" class="close-notification">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style="width: 14px; height: 14px;">
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94l-1.72-1.72z" />
            </svg>
        </div>
    `;

    // Agregar al DOM
    document.body.appendChild(notification);

    // Animar entrada
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
        notification.style.opacity = '1';
    }, 10);

    // Configurar eliminación automática después de 4 segundos
    let timeout;
    if (autoHide) {
        timeout = setTimeout(() => {
            notification.style.transform = 'translateX(100px)';
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }

    // Configurar cierre manual
    const closeBtn = notification.querySelector('.close-notification');
    closeBtn.addEventListener('click', () => {
        clearTimeout(timeout);
        notification.style.transform = 'translateX(100px)';
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    });

    return notification;
}

// Inicializar la carga del contenido
document.addEventListener('DOMContentLoaded', () => {
    loadInsumosElaboradosContent();
});