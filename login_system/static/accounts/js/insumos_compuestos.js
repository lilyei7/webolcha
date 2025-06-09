// Función para obtener el token CSRF
function getCsrfToken() {
    return getCookie('csrftoken');
}

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

// Variable global para guardar la lista de insumos
let insumosDisponibles = [];

// Cargar la lista de insumos disponibles
async function cargarInsumosDisponibles() {
    try {
        const response = await fetch('/insumos-para-compuesto/');
        const data = await response.json();
        
        if (data.status === 'success') {
            insumosDisponibles = data.insumos;
            console.log('Insumos cargados:', insumosDisponibles.length);
            
            // Log para depurar precios
            console.log('Detalle de costos de insumos:');
            data.insumos.forEach(insumo => {
                console.log(`${insumo.nombre}: $${insumo.costo_estimado || 0} por ${insumo.unidad}`);
            });
        } else {
            console.error('Error al cargar insumos:', data.message);
        }
    } catch (error) {
        console.error('Error al cargar insumos:', error);
    }
}

// Función principal para cargar el contenido de Insumos Compuestos
function loadInsumosCompuestosContent() {
    const mainContent = document.querySelector('.main-content');
    
    // HTML completo con todos los elementos necesarios
    mainContent.innerHTML = `
        <div style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); padding: 24px; margin-top: 24px;">
            <!-- Encabezado de la sección -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; border-bottom: 1px solid #f1f5f9; padding-bottom: 20px;">
                <div>
                    <h1 style="color: #1e293b; margin: 0; font-size: 2rem; font-weight: 700; letter-spacing: -0.02em;">Insumos Compuestos</h1>
                    <p style="color: #64748b; margin-top: 6px; font-size: 1.05rem; max-width: 550px; line-height: 1.5;">
                        Administra tus insumos compuestos de producción propia y sus componentes
                    </p>
                </div>
                <button id="btnNuevoInsumoCompuesto" style="background: linear-gradient(90deg, #3b82f6 0%, #2563eb 100%); color: #ffffff; border: none; padding: 12px 20px; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 0.95rem; box-shadow: 0 4px 12px rgba(37,99,235,0.25); display: flex; align-items: center; gap: 8px; transition: all 0.3s ease; transform: translateY(0);">
                    <i class="fa-solid fa-plus" style="font-size: 0.85rem;"></i> 
                    <span>Nuevo Insumo Compuesto</span>
                </button>
            </div>
            
            <!-- Filtros de búsqueda -->
            <div style="display: flex; gap: 16px; margin: 24px 0; flex-wrap: wrap; background-color: #f8fafc; border-radius: 10px; padding: 20px; border: 1px solid #e2e8f0;">
                <div style="flex: 1; min-width: 260px; position: relative;">
                    <i class="fa-solid fa-search" style="position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: #64748b; font-size: 1rem;"></i>
                    <input type="text" id="searchInsumoCompuesto" placeholder="Buscar insumo compuesto..." style="width: 100%; padding: 14px 14px 14px 45px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 1rem; box-shadow: 0 2px 5px rgba(0,0,0,0.03); transition: all 0.2s ease; color: #1e293b; font-weight: 500; background: white;">
                </div>
                <select id="filterCategoriaCompuesta" style="padding: 12px 18px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: white; min-width: 190px; font-size: 1rem; color: #1e293b; font-weight: 500; box-shadow: 0 2px 5px rgba(0,0,0,0.03); background-image: url('data:image/svg+xml;utf8,<svg fill=\\'%2364748b\\' height=\\'24\\' viewBox=\\'0 0 24 24\\' width=\\'24\\' xmlns=\\'http://www.w3.org/2000/svg\\'><path d=\\'M7 10l5 5 5-5z\\'/><path d=\\'M0 0h24v24H0z\\' fill=\\'none\\'/></svg>'); background-repeat: no-repeat; background-position: right 12px center; -webkit-appearance: none; -moz-appearance: none; appearance: none; padding-right: 36px;">
                    <option value="todas">Todas las categorías</option>
                    <option value="salsas">Salsas</option>
                    <option value="masas">Masas</option>
                    <option value="marinados">Marinados</option>
                    <option value="mezclas">Mezclas</option>
                </select>
            </div>
            
            <!-- Tabla de insumos compuestos -->
            <div style="overflow-x: auto; margin-top: 10px;">
                <table id="insumosCompuestosTable" style="width: 100%; border-collapse: collapse; background: #ffffff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); margin-top: 20px; overflow: hidden;">
                    <thead>
                        <tr>
                            <th style="background-color: #f9fafb; color: #4b5563; font-weight: 600; font-size: 0.875rem; text-transform: uppercase; padding: 16px; letter-spacing: 0.05em; text-align: left; border-bottom: 2px solid #e5e7eb;">Insumo</th>
                            <th style="background-color: #f9fafb; color: #4b5563; font-weight: 600; font-size: 0.875rem; text-transform: uppercase; padding: 16px; letter-spacing: 0.05em; text-align: left; border-bottom: 2px solid #e5e7eb;">Unidad de Medida</th>
                            <th style="background-color: #f9fafb; color: #4b5563; font-weight: 600; font-size: 0.875rem; text-transform: uppercase; padding: 16px; letter-spacing: 0.05em; text-align: left; border-bottom: 2px solid #e5e7eb;">Cantidad</th>
                            <th style="background-color: #f9fafb; color: #4b5563; font-weight: 600; font-size: 0.875rem; text-transform: uppercase; padding: 16px; letter-spacing: 0.05em; text-align: left; border-bottom: 2px solid #e5e7eb;">Costo Aproximado</th>
                            <th style="background-color: #f9fafb; color: #4b5563; font-weight: 600; font-size: 0.875rem; text-transform: uppercase; padding: 16px; letter-spacing: 0.05em; text-align: center; border-bottom: 2px solid #e5e7eb;">Acciones</th>
                        </tr>
                    </thead>
                    <tbody id="insumosCompuestosTbody">
                        <tr>
                            <td colspan="5" style="text-align: center; padding: 20px; color: #6b7280;">Cargando insumos compuestos...</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Modal para crear/editar insumo compuesto -->
        <div id="insumoCompuestoModal" style="display: none; position: fixed; z-index: 9999; left: 0; top: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.6); align-items: center; justify-content: center;">
            <div style="background-color: #fff; padding: 30px; border-radius: 12px; width: 90%; max-width: 700px; max-height: 90vh; overflow-y: auto; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2); position: relative;">
                <span id="closeInsumoCompuestoModal" style="position: absolute; right: 20px; top: 20px; font-size: 28px; cursor: pointer; color: #6b7280;">&times;</span>
                <h2 id="insumoCompuestoModalTitle" style="color: #1f2937; margin-top: 0; margin-bottom: 24px; font-size: 1.5rem; border-bottom: 1px solid #e7e7eb; padding-bottom: 12px;">Nuevo Insumo Compuesto</h2>
                
                <form id="insumoCompuestoForm" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
                    <input type="hidden" id="insumoCompuestoId" name="insumoCompuestoId">
                    
                    <div style="grid-column: span 2; display: flex; flex-direction: column;">
                        <label for="nombreInsumoCompuesto" style="color: #4b5563; margin-bottom: 6px; font-weight: 500;">Nombre del insumo compuesto: *</label>
                        <input type="text" id="nombreInsumoCompuesto" name="nombreInsumoCompuesto" required style="padding: 10px 12px; border: 1px solid #e7e7eb; border-radius: 6px; font-size: 0.95rem;">
                    </div>
                    
                    <div style="display: flex; flex-direction: column;">
                        <label for="categoriaInsumoCompuesto" style="color: #4b5563; margin-bottom: 6px; font-weight: 500;">Categoría: *</label>
                        <select id="categoriaInsumoCompuesto" name="categoriaInsumoCompuesto" required style="padding: 10px 12px; border: 1px solid #e7e7eb; border-radius: 6px; font-size: 0.95rem; background-color: white;">
                            <option value="">Seleccionar categoría</option>
                            <option value="salsas">Salsas</option>
                            <option value="masas">Masas</option>
                            <option value="marinados">Marinados</option>
                            <option value="mezclas">Mezclas</option>
                        </select>
                    </div>
                    
                    <div style="display: flex; flex-direction: column;">
                        <label for="unidadInsumoCompuesto" style="color: #4b5563; margin-bottom: 6px; font-weight: 500;">Unidad de medida: *</label>
                        <select id="unidadInsumoCompuesto" name="unidadInsumoCompuesto" required style="padding: 10px 12px; border: 1px solid #e7e7eb; border-radius: 6px; font-size: 0.95rem; background-color: white;">
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
                        <label for="cantidadTotal" style="color: #4b5563; margin-bottom: 6px; font-weight: 500;">Cantidad producida: *</label>
                        <input type="number" id="cantidadTotal" name="cantidadTotal" min="0.01" step="0.01" required style="padding: 10px 12px; border: 1px solid #e7e7eb; border-radius: 6px; font-size: 0.95rem;">
                    </div>
                    
                    <div style="grid-column: span 2;">
                        <h3 style="margin-top: 20px; color: #1f2937; font-weight: 600; font-size: 1.1rem; border-bottom: 1px solid #e7e7eb; padding-bottom: 10px;">Componentes</h3>
                        
                        <div id="componentesContainer" style="margin-bottom: 15px;"></div>
                        
                        <button type="button" id="agregarComponenteBtn" style="background-color: #e5e7eb; color: #4b5563; border: none; padding: 8px 15px; border-radius: 6px; cursor: pointer; font-size: 0.9rem; display: flex; align-items: center; gap: 5px;">
                            <i class="fa-solid fa-plus"></i> Agregar componente
                        </button>
                    </div>
                    
                    <div style="grid-column: span 2;">
                        <div style="display: flex; flex-direction: column;">
                            <label for="descripcionInsumoCompuesto" style="color: #4b5563; margin-bottom: 6px; font-weight: 500;">Descripción/Observaciones:</label>
                            <textarea id="descripcionInsumoCompuesto" name="descripcionInsumoCompuesto" rows="3" style="padding: 10px 12px; border: 1px solid #e7e7eb; border-radius: 6px; font-size: 0.95rem; resize: vertical;"></textarea>
                        </div>
                    </div>
                    
                    <div style="grid-column: span 2; display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
                        <button type="submit" style="background: linear-gradient(90deg, #3b82f6 0%, #2563eb 100%); color: #ffffff; border: none; padding: 12px 20px; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 0.95rem; box-shadow: 0 4px 12px rgba(37,99,235,0.25);">
                            <i class="fa-solid fa-save"></i> Guardar
                        </button>
                        <button type="button" id="cancelarInsumoCompuestoBtn" style="background: #f3f4f6; color: #4b5563; border: none; padding: 12px 20px; border-radius: 6px; cursor: pointer; font-weight: 500; font-size: 0.95rem;">
                            <i class="fa-solid fa-times"></i> Cancelar
                        </button>
                    </div>
                    
                    <div style="grid-column: span 2; margin-top: 15px; background-color: #f0f9ff; padding: 12px; border-radius: 6px; border: 1px solid #bae6fd;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-weight: 600; color: #0369a1;">Costo total calculado:</span>
                            <span id="costoTotalCalculado" style="font-weight: 700; color: #0284c7; font-size: 1.1rem;">$0.00</span>
                        </div>
                    </div>
                </form>
            </div>
        </div>

        <!-- Modal para ver detalle de componentes -->
        <div id="detalleComponentesModal" style="display: none; position: fixed; z-index: 9999; left: 0; top: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.6); align-items: center; justify-content: center;">
            <div style="background-color: #fff; padding: 30px; border-radius: 12px; width: 90%; max-width: 700px; max-height: 90vh; overflow-y: auto; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2); position: relative;">
                <span id="closeDetalleComponentesModal" style="position: absolute; right: 20px; top: 20px; font-size: 28px; cursor: pointer; color: #6b7280;">&times;</span>
                <h2 id="detalleComponentesTitle" style="color: #1f2937; margin-top: 0; margin-bottom: 24px; font-size: 1.5rem; border-bottom: 1px solid #e7e7eb; padding-bottom: 12px;">Detalles del Insumo Compuesto</h2>
                <div id="detalleComponentesContent"></div>
                <div style="text-align: right; margin-top: 20px;">
                    <button type="button" id="cerrarDetalleComponentesBtn" style="background: #f3f4f6; color: #4b5563; border: none; padding: 12px 20px; border-radius: 6px; cursor: pointer; font-weight: 500; font-size: 0.95rem;">
                        <i class="fa-solid fa-times"></i> Cerrar
                    </button>
                </div>
            </div>
        </div>
    `;

    // Cargar insumos disponibles primero (con manejo de errores)
    cargarInsumosDisponibles()
        .then(() => {
            // Intentamos cargar datos reales de la API, si falla usamos datos de ejemplo
            cargarInsumosCompuestos()
                .catch(error => {
                    console.warn("Error cargando desde API, usando datos de ejemplo", error);
                    cargarDatosEjemplo();
                });
            
            // Configurar event listeners después de que todo el HTML esté insertado
            setTimeout(() => configurarEventListeners(), 100);
        })
        .catch(error => {
            console.error("Error al cargar insumos disponibles:", error);
            // Cargar datos de ejemplo como fallback
            cargarDatosEjemplo();
            setTimeout(() => configurarEventListeners(), 100);
        });
}

// Función auxiliar para calcular el costo total a partir de los componentes
function calcularCostoTotalDesdeComponentes(componentes) {
    if (!componentes || !Array.isArray(componentes)) {
        return 0;
    }
    
    // Log para depuración
    let total = 0;
    for (let componente of componentes) {
        const costo = parseFloat(componente.costo || 0);
        total += costo;
        console.log(`Componente: ${componente.insumo || 'Sin nombre'}, Costo: $${costo}, Total acumulado: $${total}`);
    }
    
    return total;
}

// Función para cargar insumos compuestos desde la API
async function cargarInsumosCompuestos() {
    try {
        const response = await fetch('/insumos-compuestos/');
        const data = await response.json();
        
        if (data.status === 'success') {
            const tbody = document.getElementById('insumosCompuestosTbody');
            
            if (data.insumos_compuestos.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="5" style="text-align: center; padding: 20px; color: #6b7280;">
                            No hay insumos compuestos registrados
                        </td>
                    </tr>
                `;
                return;
            }
            
            // Depuración
            console.log("Datos de insumos compuestos recibidos:", data.insumos_compuestos);
            
            tbody.innerHTML = data.insumos_compuestos.map(insumo => {
                // Asegurar que todos los valores estén definidos
                const nombre = insumo.nombre || 'Sin nombre';
                const categoria = insumo.categoria || 'sin-categoria';
                const unidad = insumo.unidad || '-';
                const cantidad = insumo.cantidad || 0;
                
                // IMPORTANTE: Siempre recalcular el costo total a partir de los componentes
                // en lugar de confiar en el valor que viene del backend
                const costoTotal = calcularCostoTotalDesdeComponentes(insumo.componentes);
                
                // Asegurar que tenemos un valor válido para el costo unitario
                const costoUnitario = cantidad > 0 ? costoTotal / cantidad : 0;
                
                console.log(`Insumo: ${nombre}, Componentes:`, insumo.componentes);
                console.log(`Costo total calculado: $${costoTotal.toFixed(2)}`);
                
                return `
                    <tr>
                        <td style="padding: 16px; border-bottom: 1px solid #f3f4f6; vertical-align: middle; background-color: white;">
                            <div style="font-weight: 600; color: #000000; font-size: 1rem;">${nombre}</div>
                            <div style="color: #64748b; font-size: 0.85rem;">Categoría: ${capitalizarPrimeraLetraInsumos(categoria)}</div>
                        </td>
                        <td style="padding: 16px; border-bottom: 1px solid #f3f4f6; vertical-align: middle; color: #000000; background-color: white;">${formatearUnidad(unidad)}</td>
                        <td style="padding: 16px; border-bottom: 1px solid #f3f4f6; vertical-align: middle; color: #000000; background-color: white;">${cantidad}</td>
                        <td style="padding: 16px; border-bottom: 1px solid #f3f4f6; vertical-align: middle; color: #000000; background-color: white;">
                            <div style="font-weight: 500;">$${costoTotal.toFixed(2)}</div>
                            <div style="color: #64748b; font-size: 0.85rem;">$${costoUnitario.toFixed(2)} por ${formatearUnidad(unidad)}</div>
                        </td>
                        <td style="padding: 16px; border-bottom: 1px solid #f3f4f6; vertical-align: middle; background-color: white; text-align: center;">
                            <div style="display: flex; gap: 8px; justify-content: center;">
                                <button onclick="verDetalleComponentes(${insumo.id})" style="width: 32px; height: 32px; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; color: #6b7280; background: #f3f4f6; border: none; cursor: pointer;" title="Ver componentes">
                                    <i class="fa-solid fa-list"></i>
                                </button>
                                <button onclick="editarInsumoCompuesto(${insumo.id})" style="width: 32px; height: 32px; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; color: #3b82f6; background: #eff6ff; border: none; cursor: pointer;" title="Editar">
                                    <i class="fa-solid fa-pen"></i>
                                </button>
                                <button onclick="eliminarInsumoCompuesto(${insumo.id}, '${nombre.replace(/'/g, "\\'")}')" style="width: 32px; height: 32px; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; color: #ef4444; background: #fef2f2; border: none; cursor: pointer;" title="Eliminar">
                                    <i class="fa-solid fa-trash"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            }).join('');
            
        } else {
            console.error('Error al cargar insumos compuestos:', data.message);
        }
    } catch (error) {
        console.error('Error al cargar insumos compuestos:', error);
    }
}

// Función para cargar datos de ejemplo (corregida - eliminar duplicados)
function cargarDatosEjemplo() {
    const insumosCompuestos = [
        {
            id: 1,
            nombre: 'Salsa de chile habanero',
            categoria: 'salsas',
            unidad: 'lt',
            cantidad: 2.5,
            costo: 85.50,
            componentes: [
                { insumo: 'Chile habanero', unidad: 'kg', cantidad: 0.5, costo: 25.00 },
                { insumo: 'Ajo', unidad: 'kg', cantidad: 0.1, costo: 8.50 },
                { insumo: 'Cebolla', unidad: 'kg', cantidad: 0.25, costo: 12.00 },
                { insumo: 'Vinagre', unidad: 'lt', cantidad: 1, costo: 20.00 },
                { insumo: 'Sal', unidad: 'kg', cantidad: 0.05, costo: 1.00 }
            ]
        },
        {
            id: 2,
            nombre: 'Masa para pizza',
            categoria: 'masas',
            unidad: 'kg',
            cantidad: 5,
            costo: 120.00,
            componentes: [
                { insumo: 'Harina', unidad: 'kg', cantidad: 3, costo: 60.00 },
                { insumo: 'Levadura', unidad: 'g', cantidad: 50, costo: 15.00 },
                { insumo: 'Aceite de oliva', unidad: 'ml', cantidad: 200, costo: 30.00 },
                { insumo: 'Sal', unidad: 'kg', cantidad: 0.05, costo: 1.00 }
            ]
        },
        {
            id: 3,
            nombre: 'Marinado para pollo',
            categoria: 'marinados',
            unidad: 'lt',
            cantidad: 3,
            costo: 95.75,
            componentes: [
                { insumo: 'Jugo de limón', unidad: 'lt', cantidad: 1, costo: 35.00 },
                { insumo: 'Ajo en polvo', unidad: 'kg', cantidad: 0.1, costo: 18.00 },
                { insumo: 'Cebolla deshidratada', unidad: 'kg', cantidad: 0.1, costo: 15.75 },
                { insumo: 'Aceite vegetal', unidad: 'lt', cantidad: 0.5, costo: 20.00 },
                { insumo: 'Especias mixtas', unidad: 'kg', cantidad: 0.05, costo: 7.00 }
            ]
        }
    ];

    const tbody = document.getElementById('insumosCompuestosTbody');
    tbody.innerHTML = insumosCompuestos.map(insumo => `
        <tr>
            <td style="padding: 16px; border-bottom: 1px solid #f3f4f6; vertical-align: middle; background-color: white;">
                <div style="font-weight: 600; color: #000000; font-size: 1rem;">${insumo.nombre}</div>
                <div style="color: #64748b; font-size: 0.85rem;">Categoría: ${capitalizarPrimeraLetraInsumos(insumo.categoria)}</div>
            </td>
            <td style="padding: 16px; border-bottom: 1px solid #f3f4f6; vertical-align: middle; color: #000000; background-color: white;">${formatearUnidad(insumo.unidad)}</td>
            <td style="padding: 16px; border-bottom: 1px solid #f3f4f6; vertical-align: middle; color: #000000; background-color: white;">${insumo.cantidad}</td>
            <td style="padding: 16px; border-bottom: 1px solid #f3f4f6; vertical-align: middle; color: #000000; background-color: white;">
                <div style="font-weight: 500;">$${insumo.costo.toFixed(2)}</div>
                <div style="color: #64748b; font-size: 0.85rem;">$${(insumo.costo/insumo.cantidad).toFixed(2)} por ${formatearUnidad(insumo.unidad)}</div>
            </td>
            <td style="padding: 16px; border-bottom: 1px solid #f3f4f6; vertical-align: middle; background-color: white; text-align: center;">
                <div style="display: flex; gap: 8px; justify-content: center;">
                    <button onclick="verDetalleComponentes(${insumo.id})" style="width: 32px; height: 32px; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; color: #6b7280; background: #f3f4f6; border: none; cursor: pointer;" title="Ver componentes">
                        <i class="fa-solid fa-list"></i>
                    </button>
                    <button onclick="editarInsumoCompuesto(${insumo.id})" style="width: 32px; height: 32px; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; color: #3b82f6; background: #eff6ff; border: none; cursor: pointer;" title="Editar">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button onclick="eliminarInsumoCompuesto(${insumo.id}, '${insumo.nombre}')" style="width: 32px; height: 32px; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; color: #ef4444; background: #fef2f2; border: none; cursor: pointer;" title="Eliminar">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Función para eliminar un insumo compuesto
async function eliminarInsumoCompuesto(id, nombre) {
    try {
        // Solicitar confirmación al usuario
        if (!confirm(`¿Estás seguro de que deseas eliminar el insumo compuesto "${nombre}"?`)) {
            return; // El usuario canceló la eliminación
        }
        
        console.log(`Eliminando insumo compuesto con ID: ${id}`);
        
        // Enviar solicitud DELETE al servidor
        const response = await fetch(`/insumos-compuestos/${id}/`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
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
            showNotification(`Insumo compuesto "${nombre}" eliminado correctamente`, 'success');
            
            // Recargar la lista de insumos compuestos
            await cargarInsumosCompuestos();
        } else {
            throw new Error(data.message || 'Error al eliminar el insumo compuesto');
        }
    } catch (error) {
        console.error('Error al eliminar insumo compuesto:', error);
        showNotification(`Error: ${error.message}`, 'error');
    }
}

// Función para filtrar insumos compuestos según criterios de búsqueda
function filtrarInsumosCompuestos() {
    const searchTerm = document.getElementById('searchInsumoCompuesto').value.toLowerCase();
    const categoriaFilter = document.getElementById('filterCategoriaCompuesta').value;
    
    const rows = document.querySelectorAll('#insumosCompuestosTbody tr');
    
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
function actualizarCostoTotal() {
    console.log("📊 Recalculando costo total...");
    const componentesItems = document.querySelectorAll('.componente-item');
    let costoTotal = 0;
    
    componentesItems.forEach(item => {
        const cantidadInput = item.querySelector('input[id^="componenteCantidad"]');
        const costoInput = item.querySelector('input[id^="componenteCosto"]');
        
        if (cantidadInput && costoInput) {
            const cantidad = parseFloat(cantidadInput.value) || 0;
            const costo = parseFloat(costoInput.value) || 0;
            costoTotal += costo;
        }
    });
    
    // Mostrar el costo total en el elemento HTML
    const costoTotalElement = document.getElementById('costoTotalCalculado');
    if (costoTotalElement) {
        costoTotalElement.textContent = `$${costoTotal.toFixed(2)}`;
    }
    
    // Calcular costo unitario si hay cantidad total
    const cantidadTotalInput = document.getElementById('cantidadTotal');
    if (cantidadTotalInput) {
        const cantidadTotal = parseFloat(cantidadTotalInput.value) || 0;
        if (cantidadTotal > 0) {
            const costoUnitario = costoTotal / cantidadTotal;
            
            // Crear o actualizar el elemento para mostrar el costo unitario
            let costoUnitarioElement = document.getElementById('costoUnitarioCalculado');
            if (!costoUnitarioElement) {
                costoUnitarioElement = document.createElement('span');
                costoUnitarioElement.id = 'costoUnitarioCalculado';
                costoUnitarioElement.style.display = 'block';
                costoUnitarioElement.style.marginTop = '5px';
                costoUnitarioElement.style.fontSize = '0.9rem';
                costoUnitarioElement.style.color = '#0369a1';
                costoTotalElement.parentNode.appendChild(costoUnitarioElement);
            }
            
            // Obtener la unidad seleccionada
            const unidadSelect = document.getElementById('unidadInsumoCompuesto');
            const unidad = unidadSelect ? unidadSelect.value : '';
            
            costoUnitarioElement.textContent = `Costo unitario: $${costoUnitario.toFixed(2)}/${unidad}`;
        }
    }
    
    console.log(`💰 Costo total calculado: $${costoTotal.toFixed(2)}`);
    return costoTotal;
}

// Función para configurar event listeners
function configurarEventListeners() {
    // Botón para mostrar el modal de nuevo insumo compuesto
    document.getElementById('btnNuevoInsumoCompuesto').addEventListener('click', () => {
        mostrarModalInsumoCompuesto();
    });

    // Botón para cerrar el modal
    document.getElementById('closeInsumoCompuestoModal').addEventListener('click', () => {
        document.getElementById('insumoCompuestoModal').style.display = 'none';
    });

    // Botón para cancelar
    document.getElementById('cancelarInsumoCompuestoBtn').addEventListener('click', () => {
        document.getElementById('insumoCompuestoModal').style.display = 'none';
    });

    // Botón para agregar un componente
    document.getElementById('agregarComponenteBtn').addEventListener('click', () => {
        agregarComponente();
    });

    // Formulario
    document.getElementById('insumoCompuestoForm').addEventListener('submit', (e) => {
        e.preventDefault();
        guardarInsumoCompuesto();
    });

    // Botones para el modal de detalles
    document.getElementById('closeDetalleComponentesModal').addEventListener('click', () => {
        document.getElementById('detalleComponentesModal').style.display = 'none';
    });

    document.getElementById('cerrarDetalleComponentesBtn').addEventListener('click', () => {
        document.getElementById('detalleComponentesModal').style.display = 'none';
    });

    // Filtro de búsqueda
    document.getElementById('searchInsumoCompuesto').addEventListener('input', filtrarInsumosCompuestos);
    document.getElementById('filterCategoriaCompuesta').addEventListener('change', filtrarInsumosCompuestos);
    
    // Añadido: Evento para actualizar costo total al cambiar cantidad total
    document.getElementById('cantidadTotal').addEventListener('input', actualizarCostoTotal);
}

// Función para mostrar el modal de insumo compuesto
function mostrarModalInsumoCompuesto(insumoCompuesto = null) {
    const modal = document.getElementById('insumoCompuestoModal');
    const form = document.getElementById('insumoCompuestoForm');
    const componentes = document.getElementById('componentesContainer');
    
    // Limpiar el formulario
    form.reset();
    componentes.innerHTML = '';
    
    // Si es un nuevo insumo, mostrar un componente vacío por defecto
    if (!insumoCompuesto) {
        document.getElementById('insumoCompuestoModalTitle').textContent = 'Nuevo Insumo Compuesto';
        document.getElementById('insumoCompuestoId').value = '';
        agregarComponente();
    } else {
        // Si es edición, llenar el formulario con los datos existentes
        document.getElementById('insumoCompuestoModalTitle').textContent = 
            insumoCompuesto.ejemplo ? 'Editar Insumo Compuesto (EJEMPLO)' : 'Editar Insumo Compuesto';
        
        if (insumoCompuesto.ejemplo) {
            // Agregar una nota de advertencia si son datos de ejemplo
            const warningDiv = document.createElement('div');
            warningDiv.style.marginBottom = '15px';
            warningDiv.style.backgroundColor = '#fff3cd';
            warningDiv.style.color = '#664d03';
            warningDiv.style.padding = '10px';
            warningDiv.style.borderRadius = '4px';
            warningDiv.innerHTML = '<strong>⚠️ Nota:</strong> Estos son datos de ejemplo porque no se pudo conectar con la base de datos.';
            form.insertBefore(warningDiv, form.firstChild);
        }
        
        document.getElementById('insumoCompuestoId').value = insumoCompuesto.id;
        document.getElementById('nombreInsumoCompuesto').value = insumoCompuesto.nombre;
        document.getElementById('categoriaInsumoCompuesto').value = insumoCompuesto.categoria;
        document.getElementById('unidadInsumoCompuesto').value = insumoCompuesto.unidad;
        document.getElementById('descripcionInsumoCompuesto').value = insumoCompuesto.descripcion || '';
        document.getElementById('cantidadTotal').value = insumoCompuesto.cantidad;
        
        // Añadir componentes
        insumoCompuesto.componentes.forEach(componente => {
            agregarComponente(componente);
        });
    }
    
    modal.style.display = 'flex';
}

// Función para agregar un componente al formulario
function agregarComponente(componente = null) {
    const container = document.getElementById('componentesContainer');
    const componenteIndex = container.children.length;
    
    // Crear las opciones para el selector de insumos
    const opcionesInsumos = insumosDisponibles.map(insumo => 
        `<option value="${insumo.id}" 
            data-unidad="${insumo.unidad}" 
            data-costo="${insumo.costo_estimado || 0}"
            data-nombre="${insumo.nombre}"
            ${componente && componente.insumo_id === insumo.id ? 'selected' : ''}>
            ${insumo.nombre}
        </option>`
    ).join('');
    
    const componenteHTML = `
        <div class="componente-item" style="display: grid; grid-template-columns: 3fr 1fr 1fr 1fr auto; gap: 10px; margin-bottom: 10px; padding: 10px; background-color: #f9fafb; border-radius: 6px; align-items: center;">
            <div>
                <label for="componenteInsumo${componenteIndex}" style="display: block; font-size: 0.8rem; color: #6b7280; margin-bottom: 3px;">Insumo</label>
                <select id="componenteInsumo${componenteIndex}" name="componenteInsumo[]" required style="width: 100%; padding: 8px 10px; border: 1px solid #e7e7eb; border-radius: 4px; font-size: 0.9rem;">
                    <option value="">-- Seleccione un insumo --</option>
                    ${opcionesInsumos}
                </select>
            </div>
            <div>
                <label for="componenteUnidad${componenteIndex}" style="display: block; font-size: 0.8rem; color: #6b7280; margin-bottom: 3px;">Unidad</label>
                <input type="text" id="componenteUnidad${componenteIndex}" name="componenteUnidad[]" value="${componente ? componente.unidad : ''}" readonly style="width: 100%; padding: 8px 10px; border: 1px solid #e7e7eb; border-radius: 4px; font-size: 0.9rem; background-color: #f3f4f6;">
            </div>
            <div>
                <label for="componenteCantidad${componenteIndex}" style="display: block; font-size: 0.8rem; color: #6b7280; margin-bottom: 3px;">Cantidad</label>
                <input type="number" id="componenteCantidad${componenteIndex}" name="componenteCantidad[]" min="0.01" step="0.01" value="${componente ? componente.cantidad : ''}" required style="width: 100%; padding: 8px 10px; border: 1px solid #e7e7eb; border-radius: 4px; font-size: 0.9rem;">
            </div>
            <div>
                <label for="componenteCosto${componenteIndex}" style="display: block; font-size: 0.8rem; color: #6b7280; margin-bottom: 3px;">Costo</label>
                <input type="number" id="componenteCosto${componenteIndex}" name="componenteCosto[]" min="0" step="0.01" value="${componente ? componente.costo : ''}" required style="width: 100%; padding: 8px 10px; border: 1px solid #e7e7eb; border-radius: 4px; font-size: 0.9rem;">
            </div>
            <div style="display: flex; align-items: flex-end; padding-bottom: 5px;">
                <button type="button" class="eliminar-componente-btn" style="background-color: #fee2e2; color: #ef4444; border: none; border-radius: 4px; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
                    <i class="fa-solid fa-times"></i>
                </button>
            </div>
        </div>
    `;
    
    // Agregar HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = componenteHTML;
    const componenteElement = tempDiv.firstElementChild;
    
    container.appendChild(componenteElement);
    
    // Añadir event listener para eliminar este componente
    componenteElement.querySelector('.eliminar-componente-btn').addEventListener('click', () => {
        componenteElement.remove();
        actualizarCostoTotal();
    });

    // Obtener referencias a los elementos
    const selectInsumo = componenteElement.querySelector(`#componenteInsumo${componenteIndex}`);
    const unidadInput = componenteElement.querySelector(`#componenteUnidad${componenteIndex}`);
    const cantidadInput = componenteElement.querySelector(`#componenteCantidad${componenteIndex}`);
    const costoInput = componenteElement.querySelector(`#componenteCosto${componenteIndex}`);
    
    // Evento cuando se selecciona un insumo
    selectInsumo.addEventListener('change', function() {
        // Limpiar advertencia previa si existe
        const previousWarning = componenteElement.querySelector('.costo-warning');
        if (previousWarning) previousWarning.remove();
        
        const selectedOption = this.options[this.selectedIndex];
        
        if (selectedOption && selectedOption.value) {
            // Obtener datos del insumo seleccionado
            const nombre = selectedOption.getAttribute('data-nombre');
            const unidad = selectedOption.getAttribute('data-unidad');
            const costoUnitario = parseFloat(selectedOption.getAttribute('data-costo')) || 0;
            
            console.log(`Insumo seleccionado: ${nombre}, Unidad: ${unidad}, Costo unitario: ${costoUnitario}`);
            
            // Actualizar el campo de unidad
            unidadInput.value = unidad;
            
            // Si ya hay una cantidad, actualizar el costo
            const cantidad = parseFloat(cantidadInput.value) || 0;
            
            if (costoUnitario > 0) {
                // Calcular y actualizar costo según cantidad ingresada
                if (cantidad > 0) {
                    costoInput.value = (cantidad * costoUnitario).toFixed(2);
                    costoInput.style.borderColor = '#e7e7eb';
                }
            } else {
                // Si no tiene costo unitario, mostrar advertencia
                costoInput.value = '0.00';
                costoInput.style.borderColor = '#e67e22';
                
                // Crear mensaje de advertencia
                const warningElement = document.createElement('div');
                warningElement.className = 'costo-warning';
                warningElement.style.color = '#e67e22';
                warningElement.style.fontSize = '0.75rem';
                warningElement.style.marginTop = '4px';
                warningElement.innerHTML = '⚠️ Este insumo no tiene precio definido en proveedores';
                
                // Añadir advertencia después del campo de costo
                costoInput.parentNode.appendChild(warningElement);
            }
            
            // Actualizar el costo total
            actualizarCostoTotal();
        } else {
            // Limpiar campos si no hay insumo seleccionado
            unidadInput.value = '';
            costoInput.value = '';
            costoInput.style.borderColor = '#e7e7eb';
        }
    });
    
    // Evento cuando se cambia la cantidad
    cantidadInput.addEventListener('input', function() {
        const selectedOption = selectInsumo.options[selectInsumo.selectedIndex];
        
        if (selectedOption && selectedOption.value) {
            const costoUnitario = parseFloat(selectedOption.getAttribute('data-costo')) || 0;
            const cantidad = parseFloat(this.value) || 0;
            
            console.log(`Cambiando cantidad a ${cantidad}, costo unitario: ${costoUnitario}`);
            
            if (cantidad > 0) {
                if (costoUnitario > 0) {
                    // Actualizar el costo basado en cantidad * precio unitario
                    costoInput.value = (cantidad * costoUnitario).toFixed(2);
                } else {
                    // Indicar que debe ingresar el costo manualmente
                    if (!componenteElement.querySelector('.costo-warning')) {
                        costoInput.style.borderColor = '#e67e22';
                        
                        const warningElement = document.createElement('div');
                        warningElement.className = 'costo-warning';
                        warningElement.style.color = '#e67e22';
                        warningElement.style.fontSize = '0.75rem';
                        warningElement.style.marginTop = '4px';
                        warningElement.innerHTML = '⚠️ Este insumo no tiene precio definido en proveedores';
                        
                        costoInput.parentNode.appendChild(warningElement);
                    }
                }
            }
            
            // Actualizar el costo total
            actualizarCostoTotal();
        }
    });
    
    // Evento cuando se cambia el costo directamente
    costoInput.addEventListener('input', function() {
        // Actualizar el costo total
        actualizarCostoTotal();
        
        // Si hay una advertencia, quitarla
        const warning = componenteElement.querySelector('.costo-warning');
        if (warning && parseFloat(this.value) > 0) {
            warning.remove();
            this.style.borderColor = '#e7e7eb';
        }
    });
    
    // Si hay un componente para precargar, simular el evento change
    if (componente && componente.insumo_id) {
        selectInsumo.dispatchEvent(new Event('change'));
    }
}

// Función para guardar un insumo compuesto
async function guardarInsumoCompuesto() {
    try {
        // Verificar si hay componentes
        const componentes = document.querySelectorAll('.componente-item');
        if (componentes.length === 0) {
            throw new Error('Debes agregar al menos un componente');
        }
        
        // Recopilar datos básicos
        const id = document.getElementById('insumoCompuestoId').value;
        const nombre = document.getElementById('nombreInsumoCompuesto').value.trim();
        const categoria = document.getElementById('categoriaInsumoCompuesto').value || 'sin-categoria'; // Valor predeterminado
        const unidad = document.getElementById('unidadInsumoCompuesto').value;
        
        // Convertir cantidadTotal explícitamente a número con parseFloat
        const cantidadTotalStr = document.getElementById('cantidadTotal').value;
        const cantidadTotal = parseFloat(cantidadTotalStr);
        
        // Validación explícita del valor cantidad
        if (isNaN(cantidadTotal) || cantidadTotal <= 0) {
            throw new Error('La cantidad debe ser un número mayor a cero');
        }
        
        const descripcion = document.getElementById('descripcionInsumoCompuesto').value.trim();
        
        // Validar datos
        if (!nombre) throw new Error('El nombre es obligatorio');
        if (!unidad) throw new Error('La unidad de medida es obligatoria');
        
        // Recopilar componentes
        const componentesData = [];
        componentes.forEach(componente => {
            const insumoSelect = componente.querySelector('select[name="componenteInsumo[]"]');
            const cantidadInput = componente.querySelector('input[name="componenteCantidad[]"]');
            const costoInput = componente.querySelector('input[name="componenteCosto[]"]');
            
            const insumoId = parseInt(insumoSelect.value);
            const cantidad = parseFloat(cantidadInput.value) || 0;
            const costo = parseFloat(costoInput.value) || 0;
            
            if (!insumoId || isNaN(insumoId)) throw new Error('Selecciona un insumo válido');
            if (cantidad <= 0) throw new Error(`Ingresa una cantidad válida para ${insumoSelect.options[insumoSelect.selectedIndex].text}`);
            if (costo <= 0) throw new Error(`Ingresa un costo válido para ${insumoSelect.options[insumoSelect.selectedIndex].text}`);
            
            componentesData.push({
                insumo_id: insumoId,
                cantidad: cantidad,
                costo: costo
            });
        });
        
        // Calcular costo total - asegurar que no sea undefined
        const costoTotal = actualizarCostoTotal() || 0;
        
        // Crear el objeto de datos
        const insumoCompuestoData = {
            nombre,
            categoria,
            unidad,
            cantidad: cantidadTotal,
            costo_total: costoTotal,
            descripcion,
            componentes: componentesData
        };
        
        // Debug - Verificar que los datos son correctos
        console.log('Datos a enviar (verificados):', insumoCompuestoData);
        
        // Si hay ID, es una edición
        if (id) {
            insumoCompuestoData.id = parseInt(id);
        }
        
        // Enviar al servidor
        const url = id ? `/insumos-compuestos/${id}/` : '/insumos-compuestos/';
        const method = id ? 'PUT' : 'POST';
        
        console.log(`Enviando ${method} a ${url} con datos:`, insumoCompuestoData);
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCsrfToken()
            },
            body: JSON.stringify(insumoCompuestoData)
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
            document.getElementById('insumoCompuestoModal').style.display = 'none';
            
            // Mostrar notificación de éxito
            const mensaje = id ? 'Insumo compuesto actualizado correctamente' : 'Insumo compuesto creado correctamente';
            showNotification(mensaje, 'success');
            
            // Recargar la lista de insumos compuestos
            await cargarInsumosCompuestos();
        } else {
            throw new Error(data.message || 'Error al procesar la solicitud');
        }
    } catch (error) {
        console.error('Error llamando a la API:', error);
        showNotification(`Error: ${error.message}`, 'error');
    }
}

// Función para editar un insumo compuesto
async function editarInsumoCompuesto(id) {
    try {
        console.log(`Editando insumo compuesto con ID: ${id}`);
        
        // Mostrar un indicador de carga
        const loadingToast = showNotification('Cargando datos...', 'info', false);
        
        // Cargar los datos del insumo compuesto
        const response = await fetch(`/insumos-compuestos/${id}/`);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Ocultar el toast de carga
        if (loadingToast) loadingToast.remove();
        
        if (data.status === 'success') {
            console.log("Datos del insumo cargados correctamente:", data.insumo_compuesto);
            
            // Verificar que el campo cantidad viene correctamente
            if (data.insumo_compuesto.cantidad === undefined || data.insumo_compuesto.cantidad === null) {
                console.warn("⚠️ El campo 'cantidad' está vacío en los datos recibidos");
                data.insumo_compuesto.cantidad = 0; // Valor por defecto
            }
            
            // Mostrar el modal con los datos cargados
            mostrarModalInsumoCompuesto(data.insumo_compuesto);
        } else {
            throw new Error(data.message || 'Error al cargar los datos del insumo compuesto');
        }
    } catch (error) {
        console.error('Error al editar insumo compuesto:', error);
        showNotification(`Error: ${error.message}`, 'error');
    }
}

// Reemplazar verDetalleComponentes

async function verDetalleComponentes(id) {
    try {
        console.log(`Obteniendo detalles del insumo compuesto ID: ${id}`);
        
        // Intentar obtener los datos de la API
        const response = await fetch(`/insumos-compuestos/${id}/`);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.status === 'success') {
            const insumoCompuesto = data.insumo_compuesto;
            console.log("Datos recibidos del insumo compuesto:", insumoCompuesto);
            
            document.getElementById('detalleComponentesTitle').textContent = `Componentes de: ${insumoCompuesto.nombre}`;
            
            const content = document.getElementById('detalleComponentesContent');
            
            // Asegurar todos los valores o proporcionar defaults
            const categoria = insumoCompuesto.categoria || 'Sin categoría';
            const unidad = insumoCompuesto.unidad || '-';
            const cantidad = insumoCompuesto.cantidad || 0;
            const costo_total = insumoCompuesto.costo_total || 0;
            const costoUnitario = cantidad > 0 ? costo_total / cantidad : 0;
            
            content.innerHTML = `
                <div style="margin-bottom: 20px; background-color: #f8fafc; border-radius: 10px; padding: 20px; border: 1px solid #e2e8f0;">
                    <p style="margin: 8px 0; font-size: 1rem;"><strong style="color: #4b5563;">Categoría:</strong> <span style="color: #1e293b;">${capitalizarPrimeraLetraInsumos(categoria)}</span></p>
                    <p style="margin: 8px 0; font-size: 1rem;"><strong style="color: #4b5563;">Unidad de medida:</strong> <span style="color: #1e293b;">${formatearUnidad(unidad)}</span></p>
                    <p style="margin: 8px 0; font-size: 1rem;"><strong style="color: #4b5563;">Cantidad producida:</strong> <span style="color: #1e293b;">${cantidad} ${formatearUnidad(unidad)}</span></p>
                    <p style="margin: 8px 0; font-size: 1rem;"><strong style="color: #4b5563;">Costo total:</strong> <span style="color: #1e293b;">$${costo_total.toFixed(2)}</span></p>
                    <p style="margin: 8px 0; font-size: 1rem;"><strong style="color: #4b5563;">Costo unitario:</strong> <span style="color: #1e293b;">$${costoUnitario.toFixed(2)} por ${formatearUnidad(unidad)}</span></p>
                </div>
                
                <h3 style="margin-top: 20px; margin-bottom: 16px; color: #1f2937; font-weight: 600; font-size: 1.1rem; border-bottom: 1px solid #e7e7eb; padding-bottom: 10px;">Lista de componentes</h3>
                
                <div style="overflow-x: auto; margin-top: 10px;">
                    <table style="width: 100%; border-collapse: collapse; background: #ffffff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); margin-top: 10px; overflow: hidden;">
                        <thead>
                            <tr>
                                <th style="background-color: #f9fafb; color: #4b5563; font-weight: 600; font-size: 0.875rem; text-transform: uppercase; padding: 16px; letter-spacing: 0.05em; text-align: left; border-bottom: 2px solid #e5e7eb;">Insumo</th>
                                <th style="background-color: #f9fafb; color: #4b5563; font-weight: 600; font-size: 0.875rem; text-transform: uppercase; padding: 16px; letter-spacing: 0.05em; text-align: left; border-bottom: 2px solid #e5e7eb;">Unidad</th>
                                <th style="background-color: #f9fafb; color: #4b5563; font-weight: 600; font-size: 0.875rem; text-transform: uppercase; padding: 16px; letter-spacing: 0.05em; text-align: left; border-bottom: 2px solid #e5e7eb;">Cantidad</th>
                                <th style="background-color: #f9fafb; color: #4b5563; font-weight: 600; font-size: 0.875rem; text-transform: uppercase; padding: 16px; letter-spacing: 0.05em; text-align: right; border-bottom: 2px solid #e5e7eb;">Costo</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${insumoCompuesto.componentes && insumoCompuesto.componentes.map(componente => {
                                const nombreInsumo = componente.insumo || 'Componente sin nombre';
                                const unidadComponente = componente.unidad || '-';
                                const cantidadComponente = componente.cantidad || 0;
                                const costoComponente = componente.costo || 0;
                                
                                return `
                                <tr>
                                    <td style="padding: 16px; border-bottom: 1px solid #f3f4f6; vertical-align: middle; color: #000000; background-color: white;">${nombreInsumo}</td>
                                    <td style="padding: 16px; border-bottom: 1px solid #f3f4f6; vertical-align: middle; color: #000000; background-color: white;">${formatearUnidad(unidadComponente)}</td>
                                    <td style="padding: 16px; border-bottom: 1px solid #f3f4f6; vertical-align: middle; color: #000000; background-color: white;">${cantidadComponente}</td>
                                    <td style="padding: 16px; border-bottom: 1px solid #f3f4f6; vertical-align: middle; color: #000000; background-color: white; text-align: right;">$${costoComponente.toFixed(2)}</td>
                                </tr>
                                `;
                            }).join('') || '<tr><td colspan="4" style="text-align:center; padding: 20px;">No hay componentes disponibles</td></tr>'}
                            <tr>
                                <td colspan="3" style="padding: 16px; font-weight: 600; text-align: right; border-top: 2px solid #e7e7eb; background-color: white;">TOTAL:</td>
                                <td style="padding: 16px; font-weight: 600; text-align: right; border-top: 2px solid #e7e7eb; background-color: white;">$${costo_total.toFixed(2)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            `;
            
            document.getElementById('detalleComponentesModal').style.display = 'flex';
        } else {
            throw new Error(data.message || 'Error desconocido');
        }
    } catch (error) {
        console.error('Error al obtener detalles del insumo compuesto:', error);
        alert(`Error al cargar los detalles del insumo compuesto: ${error.message}`);
    }
}

// Función auxiliar para mostrar notificaciones (tamaño reducido)
function showNotification(message, type = 'success', autoHide = true) {
    // Crear el elemento de notificación
    const notification = document.createElement('div');
    notification.className = `notification notification-${type || 'success'}`;
    notification.style.position = 'fixed';
    notification.style.bottom = '15px';
    notification.style.right = '15px';
    notification.style.padding = '8px 12px'; // Reducido
    notification.style.borderRadius = '4px';
    notification.style.boxShadow = '0 2px 6px rgba(0,0,0,0.12)'; // Más sutil
    notification.style.zIndex = '10000';
    notification.style.maxWidth = '250px'; // Máximo en vez de mínimo
    notification.style.display = 'flex';
    notification.style.alignItems = 'center';
    notification.style.gap = '6px'; // Reducido
    notification.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
    notification.style.transform = 'translateX(100px)'; // Reducido de 400px a 100px
    notification.style.opacity = '0';
    notification.style.fontSize = '0.85rem'; // Texto más pequeño

    // Establecer colores según el tipo
    if (type === 'success') {
        notification.style.backgroundColor = '#10b981';
        notification.style.color = 'white';
    } else if (type === 'error') {
        notification.style.backgroundColor = '#ef4444';
        notification.style.color = 'white';
    } else if (type === 'info') {
        notification.style.backgroundColor = '#3b82f6';
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

    // Contenido más compacto
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

    // Configurar eliminación automática después de 4 segundos (reducido de 5)
    let timeout;
    if (autoHide) {
        timeout = setTimeout(() => {
            notification.style.transform = 'translateX(100px)'; // Reducido también aquí
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, 4000); // Tiempo reducido
    }

    // Configurar cierre manual
    const closeBtn = notification.querySelector('.close-notification');
    closeBtn.addEventListener('click', () => {
        clearTimeout(timeout);
        notification.style.transform = 'translateX(100px)'; // Reducido también aquí
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    });

    return notification;
}

// Guardar la función fetch original
const originalFetch = window.fetch;

// Redefinir fetch para interceptar y modificar las solicitudes
window.fetch = function(url, options) {
    // Solo modificar solicitudes a endpoints de insumos-compuestos
    if (url.includes('insumos-compuestos') && options && options.body) {
        try {
            // Parsear el cuerpo de la solicitud
            const data = JSON.parse(options.body);
            
            // Eliminar el campo 'activo' si está presente
            if ('activo' in data) {
                console.log('🔧 Eliminando campo activo:', data.activo);
                delete data.activo;
            }
            
            // Actualizar el cuerpo de la solicitud
            options.body = JSON.stringify(data);
        } catch (e) {
            console.warn('Error al procesar cuerpo de la solicitud:', e);
        }
    }
    
    // Llamar a la función fetch original con las opciones modificadas
    return originalFetch.apply(this, arguments);
};

console.log('✅ Interceptor instalado para eliminar campo activo de las solicitudes');

// Opción 1: Retornar cadena vacía
function capitalizarPrimeraLetra(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Opción 2: Mostrar guión
function capitalizarPrimeraLetra(str) {
    if (!str) return '-';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Opción 3: Manejar en el template con operador ternario
// En tu HTML: ${insumo.categoria ? capitalizarPrimeraLetra(insumo.categoria) : 'Sin categoría'}
function capitalizarPrimeraLetra(str) {
    return str.char
}

function capitalizarPrimeraLetraInsumos(str) {
    if (!str) return 'Sin categoría';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Función para formatear unidades de medida
function formatearUnidad(unidad) {
    if (!unidad) return '-';
    
    const formatosUnidades = {
        'kg': 'Kilogramo (kg)',
        'g': 'Gramo (g)',
        'lt': 'Litro (lt)',
        'ml': 'Mililitro (ml)',
        'pza': 'Pieza (pza)',
        'und': 'Unidad (und)',
        'porcion': 'Porción',
        'caja': 'Caja',
        'botella': 'Botella',
        'cucharada': 'Cucharada',
        'cucharadita': 'Cucharadita'
    };
    
    return formatosUnidades[unidad.toLowerCase()] || unidad;
}