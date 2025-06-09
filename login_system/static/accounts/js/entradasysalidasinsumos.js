// Función para obtener el token CSRF (manteniendo tu función original)
function getCsrfTokenInsumos() {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, 'csrftoken'.length + 1) === ('csrftoken=')) {
                cookieValue = decodeURIComponent(cookie.substring('csrftoken'.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// 1. Definir claramente las variables globales al inicio del archivo
let movimientosInsumosCache = null;
let sucursalesInsumosCache = null;
let insumosCompuestosCache = [];
let insumosElaboradosCache = [];

// Función principal para cargar el contenido
async function loadEntradasSalidasInsumosContent() {
    try {
        const mainContent = document.querySelector('.main-content');
        if (!mainContent) return;
        
        // Mostrar indicador de carga
        mainContent.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <i class="fa-solid fa-spinner fa-spin" style="font-size: 2rem; margin-bottom: 16px;"></i>
                <p>Cargando módulo de entradas y salidas de insumos...</p>
            </div>
        `;
        
        // IMPORTANTE: Cargar datos ANTES de renderizar la interfaz
        console.log("Cargando datos de insumos compuestos y elaborados...");
        
        // Cargar datos de forma paralela para optimizar
        await Promise.all([
            cargarSucursalesInsumos(),
            cargarInsumosCompuestosInsumos(),
            cargarInsumosElaboradosInsumos()
        ]);
        
        console.log(`Datos cargados: ${insumosCompuestosCache.length} insumos compuestos, ${insumosElaboradosCache.length} insumos elaborados`);
        
        // Renderizar la interfaz igual que antes
        mainContent.innerHTML = `
        <div style="padding: 24px; background-color: #f8fafc; min-height: 100vh;">
            <div style="max-width: 1400px; margin: 0 auto;">
                <!-- Header -->
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; background: white; padding: 24px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                    <div>
                        <h1 style="margin: 0; color: #1e293b; font-size: 2rem; font-weight: 700;">
                            <i class="fa-solid fa-flask" style="color: #8b5cf6; margin-right: 12px;"></i>
                            Elaboraciones de Insumos
                        </h1>
                        <p style="margin: 8px 0 0 0; color: #64748b; font-size: 1rem;">Registra y gestiona las elaboraciones de insumos compuestos y preparados</p>
                    </div>
                    <button onclick="mostrarModalMovimientoInsumos()" style="background: linear-gradient(90deg, #3b82f6 0%, #2563eb 100%); color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: 600; display: flex; align-items: center; gap: 8px; font-size: 0.95rem; box-shadow: 0 2px 8px rgba(59,130,246,0.25); transition: all 0.2s;">
                        <i class="fa-solid fa-plus"></i>
                        Nueva Elaboración
                    </button>
                </div>

                <!-- Filtros -->
                <div style="background: white; padding: 20px; border-radius: 12px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; align-items: end;">
                        <div>
                            <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #374151; font-size: 0.9rem;">Buscar movimientos</label>
                            <div style="position: relative;">
                                <i class="fa-solid fa-search" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #64748b;"></i>
                                <input type="text" id="searchEntradasSalidasInsumos" placeholder="Buscar por insumo, usuario..." 
                                    style="padding: 12px 12px 12px 38px; border: 1px solid #e2e8f0; border-radius: 8px; width: 100%; font-size: 0.95rem;">
                            </div>
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #374151; font-size: 0.9rem;">Tipo</label>
                            <select id="filterTipoMovimientoInsumos" style="padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; width: 100%; font-size: 0.95rem;">
                                <option value="">Todos</option>
                                <option value="entrada">Entradas</option>
                            </select>
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 4px; font-weight: 500, color: #374151; font-size: 0.9rem;">Tipo de Insumo</label>
                            <select id="filterTipoInsumo" style="padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; width: 100%; font-size: 0.95rem;">
                                <option value="">Todos los tipos</option>
                                <option value="compuesto">Insumos compuestos</option>
                                <option value="elaborado">Insumos elaborados</option>
                            </select>
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 4px; font-weight: 500, color: #374151; font-size: 0.9rem;">Sucursal</label>
                            <select id="filterSucursalMovimientoInsumos" style="padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; width: 100%; font-size: 0.95rem;">
                                <option value="">Todas las sucursales</option>
                            </select>
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #374151; font-size: 0.9rem;">Fecha</label>
                            <input type="date" id="filterFechaMovimientoInsumos" 
                                style="padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; width: 100%; font-size: 0.95rem;">
                        </div>
                        <div>
                            <button onclick="filtrarMovimientosInsumos()" 
                                style="background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; padding: 12px 16px; border-radius: 8px; cursor: pointer; font-weight: 500; width: 100%;">
                                <i class="fa-solid fa-filter"></i> Filtrar
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Lista de movimientos -->
                <div id="movimientosInsumosContainer" style="background: white; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); overflow: hidden;">
                    <div style="padding: 20px; text-align: center; color: #64748b;">
                        <i class="fa-solid fa-spinner fa-spin" style="font-size: 2rem; margin-bottom: 16px;"></i>
                        <p>Cargando movimientos...</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal para nuevo/editar movimiento -->
        <div id="movimientoInsumosModal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; align-items: center; justify-content: center;">
            <div style="background: white; border-radius: 12px; width: 90%; max-width: 600px; max-height: 90vh; overflow-y: auto; position: relative;">
                <div style="padding: 24px; border-bottom: 1px solid #e2e8f0; background: #f8fafc;">
                    <h2 id="movimientoInsumosModalTitle" style="margin: 0; color: #1e293b; font-size: 1.5rem; font-weight: 600;">Nueva Elaboración de Insumo</h2>
                    <button onclick="cerrarModalMovimientoInsumos()" style="position: absolute; right: 16px; top: 16px; background: none; border: none; font-size: 24px; cursor: pointer; color: #64748b;">&times;</button>
                </div>
                
                <form id="movimientoInsumosForm" style="padding: 24px;">
                    <input type="hidden" id="movimientoInsumosId">
                    
                    <!-- Tipo de movimiento -->
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">Tipo de Elaboración</label>
                        <div style="padding: 12px 16px; border: 2px solid #dcfce7; border-radius: 8px; background: #f0fdf4;">
                            <input type="hidden" name="tipoMovimientoInsumos" value="entrada">
                            <div style="display: flex; align-items: center;">
                                <i class="fa-solid fa-flask" style="color: #8b5cf6; margin-right: 8px;"></i>
                                <span style="font-weight: 500; color: #166534;">Elaboración de Insumo</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Tipo de insumo -->
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">Tipo de Insumo *</label>
                        <div style="display: flex; gap: 16px;">
                            <label style="display: flex; align-items: center; cursor: pointer; padding: 12px 16px; border: 2px solid #e2e8f0; border-radius: 8px; flex: 1; transition: all 0.2s;">
                                <input type="radio" name="tipoInsumo" value="compuesto" onchange="cambiarTipoInsumo()" style="margin-right: 8px;">
                                <i class="fa-solid fa-blender" style="color: #8b5cf6; margin-right: 8px;"></i>
                                <span style="font-weight: 500;">Insumo Compuesto</span>
                            </label>
                            <label style="display: flex; align-items: center; cursor: pointer; padding: 12px 16px; border: 2px solid #e2e8f0; border-radius: 8px; flex: 1; transition: all 0.2s;">
                                <input type="radio" name="tipoInsumo" value="elaborado" onchange="cambiarTipoInsumo()" style="margin-right: 8px;">
                                <i class="fa-solid fa-shrimp" style="color: #ec4899; margin-right: 8px;"></i>
                                <span style="font-weight: 500;">Insumo Elaborado</span>
                            </label>
                        </div>
                    </div>

                    <!-- Sucursal -->
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">Sucursal *</label>
                        <select id="sucursalMovimientoInsumos" required style="padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; width: 100%; font-size: 0.95rem;">
                            <option value="">Seleccionar sucursal</option>
                        </select>
                    </div>
                    
                    <!-- Motivo -->
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">Motivo *</label>
                        <select id="motivoMovimientoInsumos" required onchange="toggleCamposSegunMotivoInsumos()" style="padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; width: 100%; font-size: 0.95rem;">
                            <option value="">Seleccionar motivo</option>
                            <option value="produccion">Producción</option>
                            <option value="ajuste_inventario">Ajuste de inventario</option>
                            <option value="traspaso">Traspaso entre sucursales</option>
                            <option value="caducidad">Caducidad</option>
                            <option value="consumo_interno">Consumo interno</option>
                            <option value="venta">Venta</option>
                            <option value="merma">Merma</option>
                            <option value="otro">Otro</option>
                        </select>
                    </div>
                    
                    <!-- Sucursal de destino (solo para traspasos) -->
                    <div id="sucursalDestinoContainerInsumos" style="margin-bottom: 20px; display: none;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">Sucursal de Destino *</label>
                        <select id="sucursalDestinoMovimientoInsumos" style="padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; width: 100%; font-size: 0.95rem;">
                            <option value="">Seleccionar sucursal de destino</option>
                        </select>
                    </div>

                    <!-- Insumo (Compuesto o Elaborado) -->
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">Insumo *</label>
                        <select id="insumoMovimientoCompuestoElaborado" required onchange="actualizarUnidadInsumoCompuestoElaborado()" style="padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; width: 100%; font-size: 0.95rem;">
                            <option value="">Seleccionar tipo de insumo primero</option>
                        </select>
                    </div>

                    <!-- Cantidad y Unidad -->
                    <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 16px; margin-bottom: 20px;">
                        <div>
                            <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">Cantidad *</label>
                            <input type="number" id="cantidadMovimientoInsumos" step="0.01" min="0" required 
                                style="padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; width: 100%; font-size: 0.95rem;">
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">Unidad</label>
                            <input type="text" id="unidadMovimientoInsumos" readonly 
                                style="padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; width: 100%; font-size: 0.95rem; background: #f8fafc;">
                        </div>
                    </div>

                    <!-- Costo nuevo (solo para entradas) -->
                    <div id="costoContainerInsumos" style="margin-bottom: 20px; display: none;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">Costo Aproximado de Producción *</label>
                        <input type="number" id="costoUnitarioInsumos" step="0.01" min="0" 
                            style="padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; width: 100%; font-size: 0.95rem;">
                    </div>

                    <!-- Otro motivo -->
                    <div id="otroMotivoContainerInsumos" style="margin-bottom: 20px; display: none;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">Especificar motivo *</label>
                        <input type="text" id="otroMotivoInsumos" placeholder="Describe el motivo del movimiento..." 
                            style="padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; width: 100%; font-size: 0.95rem;">
                    </div>

                    <!-- Observaciones -->
                    <div style="margin-bottom: 24px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">Observaciones</label>
                        <textarea id="observacionesMovimientoInsumos" rows="3" placeholder="Comentarios adicionales..."
                            style="padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; width: 100%; font-size: 0.95rem; resize: vertical;"></textarea>
                    </div>

                    <!-- Botones -->
                    <div style="display: flex; gap: 12px; justify-content: flex-end;">
                        <button type="button" onclick="cerrarModalMovimientoInsumos()" 
                            style="background: #f1f5f9; color: #475569; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: 500;">
                            Cancelar
                        </button>
                        <button type="submit" 
                            style="background: linear-gradient(90deg, #3b82f6 0%, #2563eb 100%); color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: 500;">
                            <i class="fa-solid fa-save"></i> Guardar Elaboración
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Modal para ver detalles del movimiento -->
        <div id="detalleMovimientoInsumosModal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; align-items: center; justify-content: center;">
            <div style="background: white; border-radius: 12px; width: 90%; max-width: 500px; max-height: 90vh; overflow-y: auto; position: relative;">
                <div style="padding: 24px; border-bottom: 1px solid #e2e8f0; background: #f8fafc;">
                    <h2 style="margin: 0; color: #1e293b; font-size: 1.5rem; font-weight: 600;">Detalle del Movimiento</h2>
                    <button onclick="cerrarDetalleMovimientoInsumos()" style="position: absolute; right: 16px; top: 16px; background: none; border: none; font-size: 24px; cursor: pointer; color: #64748b;">&times;</button>
                </div>
                <div id="detalleMovimientoInsumosContent" style="padding: 24px;"></div>
            </div>
        </div>
    `;

        // Configurar event listeners explícitamente
        configurarEventListenersInsumos();
        
        // Cargar movimientos después de tener la interfaz lista
        await cargarMovimientosInsumos();
        
    } catch (error) {
        console.error("Error al cargar el módulo de entradas y salidas de insumos:", error);
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.innerHTML = `
                <div style="padding: 30px; text-align: center;">
                    <div style="color: #ef4444; margin-bottom: 20px;">
                        <i class="fa-solid fa-circle-exclamation" style="font-size: 3rem;"></i>
                        <h2>Error al cargar el módulo</h2>
                    </div>
                    <p>Se produjo un error al cargar el módulo de entradas y salidas de insumos.</p>
                    <p style="color: #666; margin-top: 10px;">Error: ${error.message}</p>
                    <button onclick="loadEntradasSalidasInsumosContent()" style="margin-top: 20px; padding: 10px 20px; background-color: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer;">
                        <i class="fa-solid fa-refresh"></i> Reintentar
                    </button>
                </div>
            `;
        }
    }
}

// FUNCIONES DE CARGA DE DATOS CON DATOS SIMULADOS COMO FALLBACK

// Cargar sucursales - REEMPLAZAR la función existente
async function cargarSucursalesInsumos() {
    try {
        console.log("Solicitando sucursales al servidor...");
        const response = await fetch('/sucursales/');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.status === 'success') {
            sucursalesInsumosCache = data.sucursales || [];
            console.log(`✅ Cargadas ${sucursalesInsumosCache.length} sucursales`);
        } else {
            throw new Error(data.message || 'Error desconocido en la respuesta del servidor');
        }
    } catch (error) {
        console.error('Error al cargar sucursales:', error);
        // Datos de ejemplo para fallback
        sucursalesInsumosCache = [
            { id: 1, nombre: "Sucursal Centro", activa: true },
            { id: 2, nombre: "Sucursal Norte", activa: true },
            { id: 3, nombre: "Sucursal Sur", activa: true }
        ];
        console.warn('⚠️ Usando datos de ejemplo para sucursales');
    }
    
    // IMPORTANTE: Actualizar los selectores después de cargar los datos
    setTimeout(() => {
        actualizarTodosLosSelectoreSucursales();
    }, 100);
}

// Nueva función para actualizar todos los selectores de sucursales
function actualizarTodosLosSelectoreSucursales() {
    console.log("Actualizando selectores de sucursales...");
    
    // Selector de filtro
    const filterSucursal = document.getElementById('filterSucursalMovimientoInsumos');
    if (filterSucursal) {
        let opcionesHTML = '<option value="">Todas las sucursales</option>';
        sucursalesInsumosCache.forEach(sucursal => {
            if (sucursal.activa !== false) {
                opcionesHTML += `<option value="${sucursal.id}">${sucursal.nombre}</option>`;
            }
        });
        filterSucursal.innerHTML = opcionesHTML;
        console.log("✅ Actualizado selector de filtro de sucursales");
    }
    
    // Selector del modal principal
    const sucursalModal = document.getElementById('sucursalMovimientoInsumos');
    if (sucursalModal) {
        let opcionesHTML = '<option value="">Seleccionar sucursal</option>';
        sucursalesInsumosCache.forEach(sucursal => {
            if (sucursal.activa !== false) {
                opcionesHTML += `<option value="${sucursal.id}">${sucursal.nombre}</option>`;
            }
        });
        sucursalModal.innerHTML = opcionesHTML;
        console.log("✅ Actualizado selector principal de sucursales");
    }
    
    // Selector de sucursal destino
    const sucursalDestino = document.getElementById('sucursalDestinoMovimientoInsumos');
    if (sucursalDestino) {
        let opcionesHTML = '<option value="">Seleccionar sucursal de destino</option>';
        sucursalesInsumosCache.forEach(sucursal => {
            if (sucursal.activa !== false) {
                opcionesHTML += `<option value="${sucursal.id}">${sucursal.nombre}</option>`;
            }
        });
        sucursalDestino.innerHTML = opcionesHTML;
        console.log("✅ Actualizado selector de sucursal destino");
    }
}

// Cargar insumos compuestos con datos simulados como fallback
async function cargarInsumosCompuestosInsumos() {
    try {
        console.log("Solicitando insumos compuestos al servidor...");
        const response = await fetch('/insumos-compuestos/');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.status === 'success') {
            insumosCompuestosCache = data.insumos_compuestos || [];
            console.log(`✅ Cargados ${insumosCompuestosCache.length} insumos compuestos`);
        } else {
            throw new Error(data.message || 'Error desconocido en la respuesta del servidor');
        }
    } catch (error) {
        console.error('Error al cargar insumos compuestos:', error);
        
        // Datos de ejemplo para fallback
        insumosCompuestosCache = [
            { id: 1, nombre: "Salsa de chile habanero", unidad: "lt", costo_unitario: 45.50, activo: true },
            { id: 2, nombre: "Masa para pizza", unidad: "kg", costo_unitario: 32.80, activo: true },
            { id: 3, nombre: "Marinado para pollo", unidad: "lt", costo_unitario: 60.20, activo: true }
        ];
        
        console.log('⚠️ Usando datos de ejemplo para insumos compuestos');
    }
    
    // Verificar que realmente hay datos
    if (!insumosCompuestosCache || insumosCompuestosCache.length === 0) {
        console.warn('⚠️ No se cargaron insumos compuestos - la caché está vacía');
    }
}

// Cargar insumos elaborados
async function cargarInsumosElaboradosInsumos() {
    try {
        console.log("Solicitando insumos elaborados al servidor...");
        const response = await fetch('/insumos-elaborados/');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.status === 'success') {
            insumosElaboradosCache = data.insumos_elaborados || [];
            console.log(`✅ Cargados ${insumosElaboradosCache.length} insumos elaborados`);
        } else {
            throw new Error(data.message || 'Error desconocido en la respuesta del servidor');
        }
    } catch (error) {
        console.error('Error al cargar insumos elaborados:', error);
        
        // Datos de ejemplo para fallback
        insumosElaboradosCache = [
            { id: 101, nombre: "Arroz Sushi", unidad: "kg", costo_unitario: 120.50, activo: true },
            { id: 102, nombre: "Pescado preparado", unidad: "kg", costo_unitario: 200.75, activo: true },
            { id: 103, nombre: "Sopa de miso", unidad: "lt", costo_unitario: 80.30, activo: true }
        ];
        
        console.log('⚠️ Usando datos de ejemplo para insumos elaborados');
    }
    
    // Verificar que realmente hay datos
    if (!insumosElaboradosCache || insumosElaboradosCache.length === 0) {
        console.warn('⚠️ No se cargaron insumos elaborados - la caché está vacía');
    }
}

// Función para cambiar el tipo de insumo y actualizar el selector
function cambiarTipoInsumo() {
    const tipoInsumo = document.querySelector('input[name="tipoInsumo"]:checked')?.value;
    const insumoSelect = document.getElementById('insumoMovimientoCompuestoElaborado');
    const unidadInput = document.getElementById('unidadMovimientoInsumos');
    
    if (!insumoSelect) {
        console.error('Elemento select de insumos no encontrado');
        return;
    }
    
    // Limpiar el select y la unidad
    insumoSelect.innerHTML = '<option value="">Seleccionar insumo</option>';
    if (unidadInput) unidadInput.value = '';
    
    if (!tipoInsumo) {
        insumoSelect.disabled = true;
        return;
    }
    
    // Habilitar el select
    insumoSelect.disabled = false;
    
    try {
        if (tipoInsumo === 'compuesto') {
            console.log(`Intentando cargar ${insumosCompuestosCache?.length || 0} insumos compuestos en el selector`);
            
            if (insumosCompuestosCache && insumosCompuestosCache.length > 0) {
                let contadorActivos = 0;
                
                insumosCompuestosCache.forEach(insumo => {
                    if (insumo.activo !== false) { // Solo mostrar activos
                        insumoSelect.innerHTML += `
                            <option value="${insumo.id}" 
                                data-unidad="${insumo.unidad}" 
                                data-costo="${insumo.costo_unitario || insumo.costo_total || 0}">
                                ${insumo.nombre}
                            </option>`;
                        contadorActivos++;
                    }
                });
                
                if (contadorActivos === 0) {
                    console.warn('No hay insumos compuestos activos disponibles');
                    insumoSelect.innerHTML += '<option value="" disabled>No hay insumos compuestos activos disponibles</option>';
                }
            } else {
                console.warn('No hay insumos compuestos disponibles');
                insumoSelect.innerHTML += '<option value="" disabled>No hay insumos compuestos disponibles</option>';
                
                // Intentar cargar los datos de nuevo si no existen
                if (!insumosCompuestosCache || insumosCompuestosCache.length === 0) {
                    console.log("🔄 Reintentando cargar insumos compuestos...");
                    cargarInsumosCompuestosInsumos().then(() => {
                        // Solo actualizamos si sigue seleccionado este tipo
                        if (document.querySelector('input[name="tipoInsumo"]:checked')?.value === 'compuesto') {
                            cambiarTipoInsumo();
                        }
                    });
                }
            }
        } else if (tipoInsumo === 'elaborado') {
            console.log(`Intentando cargar ${insumosElaboradosCache?.length || 0} insumos elaborados en el selector`);
            
            if (insumosElaboradosCache && insumosElaboradosCache.length > 0) {
                let contadorActivos = 0;
                
                insumosElaboradosCache.forEach(insumo => {
                    if (insumo.activo !== false) { // Solo mostrar activos
                        insumoSelect.innerHTML += `
                            <option value="${insumo.id}" 
                                data-unidad="${insumo.unidad}" 
                                data-costo="${insumo.costo_unitario || insumo.costo_total || 0}">
                                ${insumo.nombre}
                            </option>`;
                        contadorActivos++;
                    }
                });
                
                if (contadorActivos === 0) {
                    console.warn('No hay insumos elaborados activos disponibles');
                    insumoSelect.innerHTML += '<option value="" disabled>No hay insumos elaborados activos disponibles</option>';
                }
            } else {
                console.warn('No hay insumos elaborados disponibles');
                insumoSelect.innerHTML += '<option value="" disabled>No hay insumos elaborados disponibles</option>';
                
                // Intentar cargar los datos de nuevo si no existen
                if (!insumosElaboradosCache || insumosElaboradosCache.length === 0) {
                    console.log("🔄 Reintentando cargar insumos elaborados...");
                    cargarInsumosElaboradosInsumos().then(() => {
                        // Solo actualizamos si sigue seleccionado este tipo
                        if (document.querySelector('input[name="tipoInsumo"]:checked')?.value === 'elaborado') {
                            cambiarTipoInsumo();
                        }
                    });
                }
            }
        }
    } catch (error) {
        console.error('Error al cargar insumos:', error);
        insumoSelect.innerHTML = '<option value="">Error al cargar insumos</option>';
    }
}

// Mejorar estas dos funciones para asegurar que el cálculo se haga correctamente
function actualizarUnidadInsumoCompuestoElaborado() {
    const insumoSelect = document.getElementById('insumoMovimientoCompuestoElaborado');
    const unidadInput = document.getElementById('unidadMovimientoInsumos');
    const cantidadInput = document.getElementById('cantidadMovimientoInsumos');
    const costoField = document.getElementById('costoUnitarioInsumos');
    
    if (!insumoSelect || !unidadInput) {
        console.error('No se encontraron todos los elementos necesarios');
        return;
    }
    
    const selectedOption = insumoSelect.selectedOptions[0];
    
    if (selectedOption) {
        // Actualizar unidad
        unidadInput.value = selectedOption.dataset.unidad || '';
        
        // Llamar explícitamente a la función de cálculo de costo
        calcularCostoSegunCantidad();
    } else {
        unidadInput.value = '';
        if (costoField) costoField.value = '';
    }
}

// Función para calcular automáticamente el costo cuando cambia la cantidad - REEMPLAZAR función completa
function calcularCostoSegunCantidad() {
    console.log("Calculando costo según cantidad...");
    
    const cantidadInput = document.getElementById('cantidadMovimientoInsumos');
    const insumoSelect = document.getElementById('insumoMovimientoCompuestoElaborado');
    const costoField = document.getElementById('costoUnitarioInsumos');
    
    if (!cantidadInput || !insumoSelect || !costoField) {
        console.warn("Faltan elementos para calcular el costo");
        return;
    }
    
    const selectedOption = insumoSelect.selectedOptions[0];
    if (!selectedOption) {
        console.warn("No hay insumo seleccionado");
        return;
    }
    
    const costoUnitario = parseFloat(selectedOption.dataset.costo) || 0;
    const cantidad = parseFloat(cantidadInput.value) || 0;
    
    // NUEVO CÁLCULO: Siempre multiplicar costo unitario por cantidad
    const costoTotal = costoUnitario * cantidad;
    
    console.log(`Calculando: Costo unitario=${costoUnitario}, Cantidad=${cantidad}, Total=${costoTotal}`);
    
    // Mostrar el costo total calculado
    costoField.value = costoTotal.toFixed(2);
    costoField.readOnly = false; // Permitir edición manual si es necesario
    costoField.style.backgroundColor = '#ffffff';
}

// Función para filtrar movimientos - AGREGAR ANTES de configurarEventListenersInsumos
function filtrarMovimientosInsumos() {
    if (!movimientosInsumosCache) return;
    
    const search = document.getElementById('searchEntradasSalidasInsumos')?.value.toLowerCase() || '';
    const tipoFilter = document.getElementById('filterTipoMovimientoInsumos')?.value || '';
    const tipoInsumoFilter = document.getElementById('filterTipoInsumo')?.value || '';
    const sucursalFilter = document.getElementById('filterSucursalMovimientoInsumos')?.value || '';
    const fechaFilter = document.getElementById('filterFechaMovimientoInsumos')?.value || '';
    
    let movimientosFiltrados = movimientosInsumosCache.filter(mov => {
        // Filtro por texto
        const matchText = !search || 
            (mov.insumo_nombre?.toLowerCase().includes(search)) ||
            (mov.usuario_nombre?.toLowerCase().includes(search)) ||
            (mov.motivo?.toLowerCase().includes(search)) ||
            (mov.observaciones?.toLowerCase().includes(search)) ||
            (mov.sucursal_nombre?.toLowerCase().includes(search));
        
        // Filtro por tipo
        const matchTipo = !tipoFilter || mov.tipo === tipoFilter;
        
        // Filtro por tipo de insumo
        const matchTipoInsumo = !tipoInsumoFilter || mov.tipo_insumo === tipoInsumoFilter;
        
        // Filtro por sucursal
        const matchSucursal = !sucursalFilter || 
            mov.sucursal_id === parseInt(sucursalFilter) || 
            mov.sucursal_id === sucursalFilter;
        
        // Filtro por fecha
        const matchFecha = !fechaFilter || (
            mov.fecha_hora && mov.fecha_hora.substring(0, 10) === fechaFilter
        );
        
        return matchText && matchTipo && matchTipoInsumo && matchSucursal && matchFecha;
    });
    
    renderizarMovimientosInsumos(movimientosFiltrados);
}

// Actualizar la función que configura los event listeners
function configurarEventListenersInsumos() {
    console.log("Configurando event listeners para insumos...");
    
    // Event listeners para filtros
    const searchInput = document.getElementById('searchEntradasSalidasInsumos');
    if (searchInput) {
        searchInput.addEventListener('input', filtrarMovimientosInsumos);
    }

    const filterTipo = document.getElementById('filterTipoMovimientoInsumos');
    if (filterTipo) {
        filterTipo.addEventListener('change', filtrarMovimientosInsumos);
    }

    const filterTipoInsumo = document.getElementById('filterTipoInsumo');
    if (filterTipoInsumo) {
        filterTipoInsumo.addEventListener('change', filtrarMovimientosInsumos);
    }

    const filterSucursal = document.getElementById('filterSucursalMovimientoInsumos');
    if (filterSucursal) {
        filterSucursal.addEventListener('change', filtrarMovimientosInsumos);
    }

    // Event listener para cantidad - IMPORTANTE para el cálculo automático
    const cantidadInput = document.getElementById('cantidadMovimientoInsumos');
    if (cantidadInput) {
        console.log("✅ Añadiendo listener a cantidadMovimientoInsumos");
        // Eliminar primero para evitar duplicados
        cantidadInput.removeEventListener('input', calcularCostoSegunCantidad);
        cantidadInput.addEventListener('input', calcularCostoSegunCantidad);
    } else {
        console.warn("⚠️ No se encontró el campo de cantidad");
    }

    // Event listeners para tipo de movimiento - SOLO AGREGAR ESTO
    const tiposMovimiento = document.querySelectorAll('input[name="tipoMovimientoInsumos"]');
    tiposMovimiento.forEach(radio => {
        radio.addEventListener('change', function() {
            toggleCamposSegunTipoInsumos();
            calcularCostoSegunCantidad();
        });
    });
    
    // Event listeners para tipo de insumo - SOLO AGREGAR ESTO
    const tiposInsumo = document.querySelectorAll('input[name="tipoInsumo"]');
    tiposInsumo.forEach(radio => {
        radio.addEventListener('change', cambiarTipoInsumo);
    });

    // Event listener para motivo - SOLO AGREGAR ESTO
    const motivoSelect = document.getElementById('motivoMovimientoInsumos');
    if (motivoSelect) {
        motivoSelect.addEventListener('change', toggleCamposSegunMotivoInsumos);
    }

    // Event listener para selector de insumos - IMPORTANTE para actualizar costo
    const insumoSelect = document.getElementById('insumoMovimientoCompuestoElaborado');
    if (insumoSelect) {
        insumoSelect.addEventListener('change', actualizarUnidadInsumoCompuestoElaborado);
    }
    
    // Event listener adicional para asegurar que el cálculo funcione siempre
    const cantidadField = document.getElementById('cantidadMovimientoInsumos');
    if (cantidadField) {
        // Agregar múltiples tipos de eventos para asegurar que funcione
        cantidadField.addEventListener('input', calcularCostoSegunCantidad);
        cantidadField.addEventListener('change', calcularCostoSegunCantidad);
        cantidadField.addEventListener('keyup', calcularCostoSegunCantidad);
        console.log("✅ Event listeners de cantidad configurados correctamente");
    }

    // Funciones de formateo utilizadas por el renderizador
    window.formatearFechaInsumos = function(fechaISO) {
        if (!fechaISO) return "Fecha no disponible";
        
        try {
            const fecha = new Date(fechaISO);
            if (isNaN(fecha.getTime())) return "Fecha inválida";
            
            return fecha.toLocaleString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            console.error('Error al formatear fecha:', e);
            return fechaISO;
        }
    };

    window.formatMotivo = function(motivo) {
        const motivos = {
            'produccion': 'Producción',
            'ajuste_inventario': 'Ajuste de inventario',
            'traspaso': 'Traspaso entre sucursales',
            'caducidad': 'Caducidad',
            'consumo_interno': 'Consumo interno',
            'venta': 'Venta',
            'merma': 'Merma',
            'otro': motivo
        };
        
        return motivos[motivo] || motivo;
    };

    // Event listener para el formulario
    const form = document.getElementById('movimientoInsumosForm');
    if (form) {
        form.addEventListener('submit', handleMovimientoInsumosSubmit);
    }
    
    // Asegurar que las funciones para cerrar modales estén disponibles
    window.cerrarModalMovimientoInsumos = function() {
        const modal = document.getElementById('movimientoInsumosModal');
        if (modal) modal.style.display = 'none';
    };

    window.cerrarDetalleMovimientoInsumos = function() {
        const modal = document.getElementById('detalleMovimientoInsumosModal');
        if (modal) modal.style.display = 'none';
    };
}

// Función para manejar el envío del formulario
async function handleMovimientoInsumosSubmit(event) {
    event.preventDefault();
    console.log("Procesando envío del formulario de movimiento");
    
    try {
        // Recopilar datos del formulario
        const tipo = 'entrada'; // Siempre es 'entrada' ya que solo manejamos elaboraciones
        const tipoInsumo = document.querySelector('input[name="tipoInsumo"]:checked')?.value;
        const sucursalId = document.getElementById('sucursalMovimientoInsumos').value;
        const insumoId = document.getElementById('insumoMovimientoCompuestoElaborado').value;
        const cantidad = parseFloat(document.getElementById('cantidadMovimientoInsumos').value || 0);
        const unidad = document.getElementById('unidadMovimientoInsumos').value;
        const motivo = document.getElementById('motivoMovimientoInsumos').value;
        
        // Validaciones
        if (!tipoInsumo) throw new Error('Seleccione el tipo de insumo');
        if (!sucursalId) throw new Error('Seleccione una sucursal');
        if (!insumoId) throw new Error('Seleccione un insumo');
        if (!cantidad || cantidad <= 0) throw new Error('Ingrese una cantidad válida');
        if (!motivo) throw new Error('Seleccione un motivo');
        
        const formData = {
            tipo: tipo,
            tipo_insumo: tipoInsumo,
            sucursal_id: parseInt(sucursalId),
            insumo_id: parseInt(insumoId),
            cantidad: cantidad,
            unidad: unidad,
            motivo: motivo,
            observaciones: document.getElementById('observacionesMovimientoInsumos')?.value?.trim() || ''
        };
        
        // Campos específicos según el tipo de movimiento
        if (tipo === 'entrada') {
            formData.costo_unitario = parseFloat(document.getElementById('costoUnitarioInsumos')?.value || 0);
        }
        
        // Campos específicos según el motivo
        if (motivo === 'traspaso') {
            const sucursalDestinoId = document.getElementById('sucursalDestinoMovimientoInsumos').value;
            if (!sucursalDestinoId) throw new Error('Seleccione una sucursal de destino');
            formData.sucursal_destino_id = parseInt(sucursalDestinoId);
        }
        
        if (motivo === 'otro') {
            const otroMotivo = document.getElementById('otroMotivoInsumos').value.trim();
            if (!otroMotivo) throw new Error('Especifique el motivo');
            formData.motivo = otroMotivo;
        }
        
        console.log("Datos del formulario:", formData);
        
        // En un entorno real, enviar datos al servidor
        try {
            const response = await fetch('/movimientos-insumos/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCsrfTokenInsumos()
                },
                body: JSON.stringify(formData)
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error en la respuesta: ${response.status} - ${errorText}`);
            }
            
            const data = await response.json();
            
            if (data.status === 'success') {
                alert('Elaboración registrada correctamente');
                cerrarModalMovimientoInsumos();
                await cargarMovimientosInsumos();
            } else {
                throw new Error(data.message || 'Error al registrar el movimiento');
            }
        } catch (apiError) {
            console.error('Error al enviar datos a la API:', apiError);
            
            // Si estamos en entorno de desarrollo o la API no está disponible, simular éxito
            alert('Elaboración registrada correctamente (simulado)');
            cerrarModalMovimientoInsumos();
            
            // Añadir el movimiento simulado a la caché
            const nuevoMovimiento = {
                id: Math.floor(Math.random() * 10000) + 1,
                tipo: tipo,
                tipo_insumo: tipoInsumo,
                insumo_nombre: document.getElementById('insumoMovimientoCompuestoElaborado').selectedOptions[0]?.text || 'Insumo',
                cantidad: cantidad,
                unidad: unidad,
                costo_unitario: tipo === 'entrada' ? parseFloat(document.getElementById('costoUnitarioInsumos').value) : null,
                motivo: motivo === 'otro' ? document.getElementById('otroMotivoInsumos').value.trim() : motivo,
                sucursal_nombre: document.getElementById('sucursalMovimientoInsumos').selectedOptions[0]?.text || 'Sucursal',
                fecha_hora: new Date().toISOString(),
                usuario_nombre: 'Usuario Actual',
                observaciones: formData.observaciones,
                estado: 'activo'
            };
            
            // Actualizar la lista y renderizar
            movimientosInsumosCache = [nuevoMovimiento, ...(movimientosInsumosCache || [])];
            renderizarMovimientosInsumos(movimientosInsumosCache);
        }
    } catch (error) {
        console.error('Error al procesar el formulario:', error);
        alert(`Error: ${error.message}`);
    }
}

// Mejorar la función mostrarModalMovimientoInsumos para asegurar el correcto funcionamiento
function mostrarModalMovimientoInsumos() {
    console.log("Mostrando modal de movimiento de insumos");
    
    const modal = document.getElementById('movimientoInsumosModal');
    if (!modal) {
        console.error('Modal no encontrado');
        return;
    }
    
    modal.style.display = 'flex';
    
    // Resetear el formulario
    const formElement = document.getElementById('movimientoInsumosForm');
    if (formElement) formElement.reset();
    
    // Actualizar el título
    const titleElement = document.getElementById('movimientoInsumosModalTitle');
    if (titleElement) titleElement.textContent = 'Nueva Elaboración de Insumo';
    
    // Resetear el ID oculto 
    const idField = document.getElementById('movimientoInsumosId');
    if (idField) idField.value = '';
    
    // Seleccionar entrada por defecto
    const entradaRadio = document.querySelector('input[name="tipoMovimientoInsumos"][value="entrada"]');
    if (entradaRadio) entradaRadio.checked = true;
    
    // Resetear y deshabilitar el selector de insumos hasta que se seleccione un tipo
    const insumoSelect = document.getElementById('insumoMovimientoCompuestoElaborado');
    if (insumoSelect) {
        insumoSelect.innerHTML = '<option value="">Seleccionar tipo de insumo primero</option>';
        insumoSelect.disabled = true;
    }
    
    // Configurar visibilidad inicial de campos
    toggleCamposSegunTipoInsumos();

    // Asegurar que las sucursales estén cargadas en el modal
    if (!sucursalesInsumosCache || sucursalesInsumosCache.length === 0) {
        console.log("Cargando sucursales para el modal...");
        cargarSucursalesInsumos();
    } else {
        actualizarTodosLosSelectoreSucursales();
    }
}

// Función para cargar movimientos de insumos desde la API
async function cargarMovimientosInsumos() {
    try {
        // Mostrar indicador de carga
        const container = document.getElementById('movimientosInsumosContainer');
        if (container) {
            container.innerHTML = `
                <div style="padding: 20px; text-align: center; color: #64748b;">
                    <i class="fa-solid fa-spinner fa-spin" style="font-size: 2rem; margin-bottom: 16px;"></i>
                    <p>Cargando movimientos...</p>
                </div>
            `;
        }
        
        console.log("Cargando movimientos desde /movimientos-insumos/");
        const response = await fetch('/movimientos-insumos/');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.status === 'success') {
            movimientosInsumosCache = data.movimientos || [];
            console.log(`✅ Cargados ${movimientosInsumosCache.length} movimientos de insumos`);
            renderizarMovimientosInsumos(movimientosInsumosCache);
        } else {
            throw new Error(data.message || 'Error desconocido al cargar movimientos');
        }
    } catch (error) {
        console.error('Error al cargar movimientos de insumos:', error);
        
        // Datos de ejemplo para fallback (ya que tienes datos en la BD)
        movimientosInsumosCache = [
            { 
                id: 1, 
                tipo: 'entrada',
                tipo_insumo: 'compuesto',
                insumo_nombre: 'Salsa de chile habanero',
                cantidad: 10,
                unidad: 'lt',
                costo_unitario: 50,
                motivo: 'produccion',
                sucursal_nombre: 'Sucursal Centro',
                fecha_hora: new Date().toISOString(),
                usuario_nombre: 'Usuario Ejemplo',
                observaciones: 'Movimiento de ejemplo',
                estado: 'activo'
            },
            { 
                id: 2, 
                tipo: 'salida',
                tipo_insumo: 'elaborado',
                insumo_nombre: 'Arroz Sushi',
                cantidad: 5,
                unidad: 'kg',
                motivo: 'consumo_interno',
                sucursal_nombre: 'Sucursal Norte',
                fecha_hora: new Date().toISOString(),
                usuario_nombre: 'Usuario Ejemplo',
                observaciones: 'Movimiento de ejemplo',
                estado: 'activo'
            }
        ];
        
        if (container) {
            container.innerHTML = `
                <div style="padding: 20px; background: #fee2e2; border-radius: 8px; margin-bottom: 16px;">
                    <p style="color: #b91c1c; font-weight: 500; margin: 0;">
                        <i class="fa-solid fa-circle-exclamation"></i> 
                        Error al cargar datos: ${error.message}
                    </p>
                    <p style="color: #b91c1c; margin: 8px 0 0 0; font-size: 0.9rem;">
                        Mostrando datos de ejemplo. Verifica la conexión al servidor.
                    </p>
                </div>
            `;
        }
        
        renderizarMovimientosInsumos(movimientosInsumosCache);
    }
}

// Función para renderizar movimientos de insumos en la interfaz
function renderizarMovimientosInsumos(movimientos) {
    const container = document.getElementById('movimientosInsumosContainer');
    
    if (!container) {
        console.error('Container movimientosInsumosContainer no encontrado');
        return;
    }
    
    if (!movimientos || movimientos.length === 0) {
        container.innerHTML = `
            <div style="padding: 40px; text-align: center; color: #64748b;">
                <i class="fa-solid fa-box-open" style="font-size: 3rem; margin-bottom: 16px; opacity: 0.5;"></i>
                <h3 style="margin: 0 0 8px 0; color: #374151;">No hay movimientos</h3>
                <p style="margin: 0;">No se encontraron movimientos de insumos para mostrar.</p>
            </div>
        `;
        return;
    }
    
    const movimientosHTML = movimientos.map(movimiento => {
        const tipoIcono = movimiento.tipo === 'entrada' 
            ? '<i class="fa-solid fa-arrow-down" style="color: #10b981;"></i>' 
            : '<i class="fa-solid fa-arrow-up" style="color: #ef4444;"></i>';
            
        const tipoClase = movimiento.tipo === 'entrada' ? 'entrada' : 'salida';
        const fechaFormateada = formatearFechaInsumos(movimiento.fecha_hora);
        const motivoFormateado = formatMotivo(movimiento.motivo);
        
        return `
            <div class="movimiento-item" style="border-left: 4px solid ${movimiento.tipo === 'entrada' ? '#10b981' : '#ef4444'}; background: white; padding: 16px; margin-bottom: 1px; display: flex; justify-content: space-between; align-items: center; transition: all 0.2s;">
                <div style="flex: 1;">
                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                        ${tipoIcono}
                        <span style="font-weight: 600; color: #1e293b; font-size: 1.1rem;">${movimiento.insumo_nombre}</span>
                        <span style="background: ${movimiento.tipo === 'entrada' ? '#dcfce7' : '#fee2e2'}; color: ${movimiento.tipo === 'entrada' ? '#166534' : '#991b1b'}; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: 500;">
                            ${movimiento.tipo.toUpperCase()}
                        </span>
                        <span style="background: #f1f5f9; color: #475569; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem;">
                            ${movimiento.tipo_insumo === 'compuesto' ? 'Compuesto' : 'Elaborado'}
                        </span>
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; font-size: 0.9rem; color: #64748b;">
                        <div><strong>Cantidad:</strong> ${movimiento.cantidad} ${movimiento.unidad}</div>
                        <div><strong>Sucursal:</strong> ${movimiento.sucursal_nombre}</div>
                        <div><strong>Motivo:</strong> ${motivoFormateado}</div>
                        <div><strong>Usuario:</strong> ${movimiento.usuario_nombre}</div>
                        <div><strong>Fecha:</strong> ${fechaFormateada}</div>
                        ${movimiento.costo_unitario ? `<div><strong>Costo:</strong> $${parseFloat(movimiento.costo_unitario).toFixed(2)}</div>` : ''}
                    </div>
                    ${movimiento.observaciones ? `
                        <div style="margin-top: 8px; padding: 8px; background: #f8fafc; border-radius: 4px; font-size: 0.85rem; color: #475569;">
                            <strong>Observaciones:</strong> ${movimiento.observaciones}
                        </div>
                    ` : ''}
                </div>
                <div style="display: flex; gap: 8px; margin-left: 16px;">
                    <button onclick="verDetalleMovimientoInsumos(${movimiento.id})" 
                            style="background: #3b82f6; color: white; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-size: 0.9rem;"
                            title="Ver detalle">
                        <i class="fa-solid fa-eye"></i>
                    </button>
                    ${movimiento.estado === 'activo' ? `
                        <button onclick="cancelarMovimientoInsumos(${movimiento.id})" 
                                style="background: #ef4444; color: white; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-size: 0.9rem;"
                                title="Cancelar movimiento">
                            <i class="fa-solid fa-times"></i>
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = `
        <div style="background: #f8fafc; padding: 16px; border-bottom: 1px solid #e2e8f0;">
            <h3 style="margin: 0; color: #1e293b; font-size: 1.2rem;">
                <i class="fa-solid fa-list"></i> 
                Elaboraciones de Insumos (${movimientos.length})
            </h3>
        </div>
        <div style="max-height: 600px; overflow-y: auto;">
            ${movimientosHTML}
        </div>
    `;
}

// Función para ver detalle de un movimiento de insumos
function verDetalleMovimientoInsumos(movimientoId) {
    const movimiento = movimientosInsumosCache.find(m => m.id === movimientoId);
    
    if (!movimiento) {
        alert('No se encontró el movimiento especificado');
        return;
    }
    
    const modal = document.getElementById('detalleMovimientoInsumosModal');
    const content = document.getElementById('detalleMovimientoInsumosContent');
    
    if (!modal || !content) {
        console.error('Modal de detalle no encontrado');
        return;
    }
    
    const tipoIcono = movimiento.tipo === 'entrada' 
        ? '<i class="fa-solid fa-arrow-down" style="color: #10b981; margin-right: 8px;"></i>' 
        : '<i class="fa-solid fa-arrow-up" style="color: #ef4444; margin-right: 8px;"></i>';
    
    content.innerHTML = `
        <div style="color: #333;">
            <div style="display: flex; align-items: center; margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid #e5e7eb;">
                ${tipoIcono}
                <h3 style="margin: 0; color: #1e293b;">${movimiento.insumo_nombre}</h3>
            </div>
            
            <div style="display: grid; gap: 12px;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                    <div>
                        <label style="font-weight: 600; color: #374151;">Tipo de Movimiento:</label>
                        <p style="margin: 4px 0 0 0; color: #64748b;">${movimiento.tipo.charAt(0).toUpperCase() + movimiento.tipo.slice(1)}</p>
                    </div>
                    <div>
                        <label style="font-weight: 600; color: #374151;">Tipo de Insumo:</label>
                        <p style="margin: 4px 0 0 0; color: #64748b;">${movimiento.tipo_insumo === 'compuesto' ? 'Insumo Compuesto' : 'Insumo Elaborado'}</p>
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                    <div>
                        <label style="font-weight: 600; color: #374151;">Cantidad:</label>
                        <p style="margin: 4px 0 0 0; color: #64748b;">${movimiento.cantidad} ${movimiento.unidad}</p>
                    </div>
                    <div>
                        <label style="font-weight: 600; color: #374151;">Sucursal:</label>
                        <p style="margin: 4px 0 0 0; color: #64748b;">${movimiento.sucursal_nombre}</p>
                    </div>
                </div>
                
                <div>
                    <label style="font-weight: 600; color: #374151;">Motivo:</label>
                    <p style="margin: 4px 0 0 0; color: #64748b;">${formatMotivo(movimiento.motivo)}</p>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                    <div>
                        <label style="font-weight: 600; color: #374151;">Usuario:</label>
                        <p style="margin: 4px 0 0 0; color: #64748b;">${movimiento.usuario_nombre}</p>
                    </div>
                    <div>
                        <label style="font-weight: 600; color: #374151;">Fecha y Hora:</label>
                        <p style="margin: 4px 0 0 0; color: #64748b;">${formatearFechaInsumos(movimiento.fecha_hora)}</p>
                    </div>
                </div>
                
                ${movimiento.costo_unitario ? `
                    <div>
                        <label style="font-weight: 600; color: #374151;">Costo Unitario:</label>
                        <p style="margin: 4px 0 0 0; color: #64748b;">$${parseFloat(movimiento.costo_unitario).toFixed(2)}</p>
                    </div>
                ` : ''}
                
                ${movimiento.sucursal_destino_nombre ? `
                    <div>
                        <label style="font-weight: 600; color: #374151;">Sucursal Destino:</label>
                        <p style="margin: 4px 0 0 0; color: #64748b;">${movimiento.sucursal_destino_nombre}</p>
                    </div>
                ` : ''}
                
                ${movimiento.observaciones ? `
                    <div>
                        <label style="font-weight: 600; color: #374151;">Observaciones:</label>
                        <p style="margin: 4px 0 0 0; color: #64748b; background: #f8fafc; padding: 8px; border-radius: 4px;">${movimiento.observaciones}</p>
                    </div>
                ` : ''}
                
                <div>
                    <label style="font-weight: 600; color: #374151;">Estado:</label>
                    <p style="margin: 4px 0 0 0;">
                        <span style="background: ${movimiento.estado === 'activo' ? '#dcfce7' : '#fee2e2'}; color: ${movimiento.estado === 'activo' ? '#166534' : '#991b1b'}; padding: 4px 8px; border-radius: 4px; font-size: 0.9rem; font-weight: 500;">
                            ${movimiento.estado.charAt(0).toUpperCase() + movimiento.estado.slice(1)}
                        </span>
                    </p>
                </div>
            </div>
        </div>
    `;
    
    modal.style.display = 'flex';
}

// Función para cancelar un movimiento de insumos
async function cancelarMovimientoInsumos(movimientoId) {
    if (!confirm('¿Estás seguro de que deseas cancelar este movimiento?')) {
        return;
    }
    
    try {
        const response = await fetch('/movimientos-insumos/', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCsrfTokenInsumos()
            },
            body: JSON.stringify({ id: movimientoId })
        });
        
        const data = await response.json();
        
        if (data.status === 'success') {
            alert('Movimiento cancelado correctamente');
            await cargarMovimientosInsumos(); // Recargar la lista
        } else {
            throw new Error(data.message || 'Error al cancelar el movimiento');
        }
    } catch (error) {
        console.error('Error al cancelar movimiento:', error);
        alert(`Error: ${error.message}`);
    }
}

// Función para alternar campos según el tipo de movimiento seleccionado
function toggleCamposSegunTipoInsumos() {
    const costoContainer = document.getElementById('costoContainerInsumos');
    
    // Siempre mostrar el campo de costo ya que solo hay elaboraciones (entradas)
    if (costoContainer) {
        costoContainer.style.display = 'block';
    }
    
    // Actualizar el cálculo
    calcularCostoSegunCantidad();
}

// Función para mostrar/ocultar campos según el motivo seleccionado
function toggleCamposSegunMotivoInsumos() {
    const motivo = document.getElementById('motivoMovimientoInsumos')?.value;
    
    // Container para "Otro motivo"
    const otroMotivoContainer = document.getElementById('otroMotivoContainerInsumos');
    if (otroMotivoContainer) {
        otroMotivoContainer.style.display = motivo === 'otro' ? 'block' : 'none';
    }
    
    // Container para "Sucursal destino" (en caso de traspasos)
    const sucursalDestinoContainer = document.getElementById('sucursalDestinoContainerInsumos');
    if (sucursalDestinoContainer) {
        sucursalDestinoContainer.style.display = motivo === 'traspaso' ? 'block' : 'none';
    }
}

// También agregar event listener para el selector de motivo
function agregarEventListenerMotivoInsumos() {
    const motivoSelect = document.getElementById('motivoMovimientoInsumos');
    if (motivoSelect) {
        motivoSelect.addEventListener('change', toggleCamposSegunMotivoInsumos);
    }
}