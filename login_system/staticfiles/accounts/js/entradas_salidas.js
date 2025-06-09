// Función para obtener el token CSRF
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

// Variables globales para caches
let entradasSalidasMovimientosCache = null;
let entradasSalidasSucursalesCache = null;
let entradasSalidasInsumosCache = null;
let entradasSalidasProveedoresCache = null;

// Función principal para cargar el contenido de entradas y salidas
async function loadEntradasSalidasContent() {
    const mainContent = document.querySelector('.main-content');
    mainContent.innerHTML = `
        <div style="padding: 24px; background-color: #f8fafc; min-height: 100vh;">
            <div style="max-width: 1400px; margin: 0 auto;">
                <!-- Header -->
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; background: white; padding: 24px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                    <div>
                        <h1 style="margin: 0; color: #1e293b; font-size: 2rem; font-weight: 700;">
                            <i class="fa-solid fa-exchange-alt" style="color: #3b82f6; margin-right: 12px;"></i>
                            Entradas y Salidas
                        </h1>
                        <p style="margin: 8px 0 0 0; color: #64748b; font-size: 1rem;">Gestiona los movimientos de inventario</p>
                    </div>
                    <button onclick="mostrarModalMovimiento()" style="background: linear-gradient(90deg, #3b82f6 0%, #2563eb 100%); color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: 600; display: flex; align-items: center; gap: 8px; font-size: 0.95rem; box-shadow: 0 2px 8px rgba(59,130,246,0.25); transition: all 0.2s;">
                        <i class="fa-solid fa-plus"></i>
                        Nuevo Movimiento
                    </button>
                </div>

                <!-- Filtros -->
                <div style="background: white; padding: 20px; border-radius: 12px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; align-items: end;">
                        <div>
                            <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #374151; font-size: 0.9rem;">Buscar movimientos</label>
                            <div style="position: relative;">
                                <i class="fa-solid fa-search" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #64748b;"></i>
                                <input type="text" id="searchEntradasSalidas" placeholder="Buscar por insumo, usuario..." 
                                    style="padding: 12px 12px 12px 38px; border: 1px solid #e2e8f0; border-radius: 8px; width: 100%; font-size: 0.95rem;">
                            </div>
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #374151; font-size: 0.9rem;">Tipo</label>
                            <select id="filterTipoMovimiento" style="padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; width: 100%; font-size: 0.95rem;">
                                <option value="">Todos</option>
                                <option value="entrada">Entradas</option>
                                <option value="salida">Salidas</option>
                            </select>
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 4px; font-weight: 500, color: #374151; font-size: 0.9rem;">Sucursal</label>
                            <select id="filterSucursalMovimiento" style="padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; width: 100%; font-size: 0.95rem;">
                                <option value="">Todas las sucursales</option>
                            </select>
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #374151; font-size: 0.9rem;">Fecha</label>
                            <input type="date" id="filterFechaMovimiento" 
                                style="padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; width: 100%; font-size: 0.95rem;">
                        </div>
                        <div>
                            <button onclick="filtrarMovimientos()" 
                                style="background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; padding: 12px 16px; border-radius: 8px; cursor: pointer; font-weight: 500; width: 100%;">
                                <i class="fa-solid fa-filter"></i> Filtrar
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Lista de movimientos -->
                <div id="movimientosContainer" style="background: white; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); overflow: hidden;">
                    <div style="padding: 20px; text-align: center; color: #64748b;">
                        <i class="fa-solid fa-spinner fa-spin" style="font-size: 2rem; margin-bottom: 16px;"></i>
                        <p>Cargando movimientos...</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal para nuevo/editar movimiento -->
        <div id="movimientoModal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; align-items: center; justify-content: center;">
            <div style="background: white; border-radius: 12px; width: 90%; max-width: 600px; max-height: 90vh; overflow-y: auto; position: relative;">
                <div style="padding: 24px; border-bottom: 1px solid #e2e8f0; background: #f8fafc;">
                    <h2 id="movimientoModalTitle" style="margin: 0; color: #1e293b; font-size: 1.5rem; font-weight: 600;">Nuevo Movimiento</h2>
                    <button onclick="cerrarModalMovimiento()" style="position: absolute; right: 16px; top: 16px; background: none; border: none; font-size: 24px; cursor: pointer; color: #64748b;">&times;</button>
                </div>
                
                <form id="movimientoForm" style="padding: 24px;">
                    <input type="hidden" id="movimientoId">
                    
                    <!-- Tipo de movimiento -->
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">Tipo de Movimiento *</label>
                        <div style="display: flex; gap: 16px;">
                            <label style="display: flex; align-items: center; cursor: pointer; padding: 12px 16px; border: 2px solid #e2e8f0; border-radius: 8px; flex: 1; transition: all 0.2s;">
                                <input type="radio" name="tipoMovimiento" value="entrada" onchange="toggleCamposSegunTipo()" style="margin-right: 8px;">
                                <i class="fa-solid fa-arrow-down" style="color: #10b981; margin-right: 8px;"></i>
                                <span style="font-weight: 500;">Entrada</span>
                            </label>
                            <label style="display: flex; align-items: center; cursor: pointer; padding: 12px 16px; border: 2px solid #e2e8f0; border-radius: 8px; flex: 1; transition: all 0.2s;">
                                <input type="radio" name="tipoMovimiento" value="salida" onchange="toggleCamposSegunTipo()" style="margin-right: 8px;">
                                <i class="fa-solid fa-arrow-up" style="color: #ef4444; margin-right: 8px;"></i>
                                <span style="font-weight: 500;">Salida</span>
                            </label>
                        </div>
                    </div>

                    <!-- Sucursal -->
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">Sucursal *</label>
                        <select id="sucursalMovimiento" required style="padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; width: 100%; font-size: 0.95rem;">
                            <option value="">Seleccionar sucursal</option>
                        </select>
                    </div>
                    
                    <!-- Motivo (MOVED HERE, now after Sucursal) -->
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">Motivo *</label>
                        <select id="motivoMovimiento" required onchange="toggleCamposSegunMotivo()" style="padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; width: 100%; font-size: 0.95rem;">
                            <option value="">Seleccionar motivo</option>
                            <option value="compra">Compra</option>
                            <option value="devolucion">Devolución</option>
                            <option value="ajuste_inventario">Ajuste de inventario</option>
                            <option value="traspaso">Traspaso entre sucursales</option>
                            <option value="caducidad">Caducidad</option>
                            <option value="consumo_interno">Consumo interno</option>
                            <option value="venta">Venta</option>
                            <option value="merma">Merma</option>
                            <option value="otro">Otro</option>
                        </select>
                    </div>
                    
                    <!-- Proveedor (solo para entradas y devoluciones) -->
                    <div id="proveedorContainer" style="margin-bottom: 20px; display: none;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">Proveedor</label>
                        <select id="proveedorMovimiento" style="padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; width: 100%; font-size: 0.95rem;">
                            <option value="">Seleccionar proveedor (opcional)</option>
                        </select>
                    </div>
                    
                    <!-- Sucursal de destino (solo para traspasos) -->
                    <div id="sucursalDestinoContainer" style="margin-bottom: 20px; display: none;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">Sucursal de Destino *</label>
                        <select id="sucursalDestinoMovimiento" style="padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; width: 100%; font-size: 0.95rem;">
                            <option value="">Seleccionar sucursal de destino</option>
                        </select>
                    </div>

                    <!-- Insumo -->
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">Insumo *</label>
                        <select id="insumoMovimiento" required onchange="actualizarUnidadInsumo()" style="padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; width: 100%; font-size: 0.95rem;">
                            <option value="">Seleccionar insumo</option>
                        </select>
                    </div>

                    <!-- Cantidad y Unidad -->
                    <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 16px; margin-bottom: 20px;">
                        <div>
                            <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">Cantidad *</label>
                            <input type="number" id="cantidadMovimiento" step="0.01" min="0" required 
                                style="padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; width: 100%; font-size: 0.95rem;">
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">Unidad</label>
                            <input type="text" id="unidadMovimiento" readonly 
                                style="padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; width: 100%; font-size: 0.95rem; background: #f8fafc;">
                        </div>
                    </div>

                    

                    <!-- Costo nuevo (solo para entradas) -->
                    <div id="costoContainer" style="margin-bottom: 20px; display: none;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 500, color: #374151;">Costo Nuevo *</label>
                        <input type="number" id="costoUnitario" step="0.01" min="0" 
                            style="padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; width: 100%; font-size: 0.95rem;">
                    </div>

                    

                    <!-- Otro motivo -->
                    <div id="otroMotivoContainer" style="margin-bottom: 20px; display: none;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">Especificar motivo *</label>
                        <input type="text" id="otroMotivo" placeholder="Describe el motivo del movimiento..." 
                            style="padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; width: 100%; font-size: 0.95rem;">
                    </div>

                    <!-- Observaciones -->
                    <div style="margin-bottom: 24px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">Observaciones</label>
                        <textarea id="observacionesMovimiento" rows="3" placeholder="Comentarios adicionales..."
                            style="padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; width: 100%; font-size: 0.95rem; resize: vertical;"></textarea>
                    </div>

                    <!-- Botones -->
                    <div style="display: flex; gap: 12px; justify-content: flex-end;">
                        <button type="button" onclick="cerrarModalMovimiento()" 
                            style="background: #f1f5f9; color: #475569; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: 500;">
                            Cancelar
                        </button>
                        <button type="submit" 
                            style="background: linear-gradient(90deg, #3b82f6 0%, #2563eb 100%); color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: 500;">
                            <i class="fa-solid fa-save"></i> Guardar Movimiento
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Modal para ver detalles del movimiento -->
        <div id="detalleMovimientoModal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; align-items: center; justify-content: center;">
            <div style="background: white; border-radius: 12px; width: 90%; max-width: 500px; max-height: 90vh; overflow-y: auto; position: relative;">
                <div style="padding: 24px; border-bottom: 1px solid #e2e8f0; background: #f8fafc;">
                    <h2 style="margin: 0; color: #1e293b; font-size: 1.5rem; font-weight: 600;">Detalle del Movimiento</h2>
                    <button onclick="cerrarDetalleMovimiento()" style="position: absolute; right: 16px; top: 16px; background: none; border: none; font-size: 24px; cursor: pointer; color: #64748b;">&times;</button>
                </div>
                <div id="detalleMovimientoContent" style="padding: 24px;"></div>
            </div>
        </div>
    `;

    // Inicializar componentes
    await cargarSucursalesEntradasSalidas();
    await cargarInsumosEntradasSalidas();
    await cargarProveedoresEntradasSalidas();
    await cargarMovimientos();
    configurarEventListenersEntradasSalidas();
}

// Configurar event listeners
function configurarEventListenersEntradasSalidas() {
    const searchInput = document.getElementById('searchEntradasSalidas');
    if (searchInput) {
        searchInput.addEventListener('input', filtrarMovimientos);
    }

    const filterTipo = document.getElementById('filterTipoMovimiento');
    if (filterTipo) {
        filterTipo.addEventListener('change', filtrarMovimientos);
    }

    const filterSucursal = document.getElementById('filterSucursalMovimiento');
    if (filterSucursal) {
        filterSucursal.addEventListener('change', filtrarMovimientos);
    }

    const filterFecha = document.getElementById('filterFechaMovimiento');
    if (filterFecha) {
        filterFecha.addEventListener('change', filtrarMovimientos);
    }

    const movimientoForm = document.getElementById('movimientoForm');
    if (movimientoForm) {
        movimientoForm.addEventListener('submit', handleMovimientoSubmit);
    }

    const proveedorSelect = document.getElementById('proveedorMovimiento');
    if (proveedorSelect) {
        proveedorSelect.addEventListener('change', function() {
            cargarInsumosDeProveedor(this.value);
        });
    }
    
    const sucursalSelect = document.getElementById('sucursalMovimiento');
    if (sucursalSelect) {
        sucursalSelect.addEventListener('change', function() {
            const motivo = document.getElementById('motivoMovimiento').value;
            if (motivo === 'traspaso') {
                cargarInsumosDeOrigen(this.value);
                // Also populate destination sucursal dropdown, excluding the current selection
                cargarSucursalesDestino(this.value);
            }
        });
    }
    
    const motivoSelect = document.getElementById('motivoMovimiento');
    if (motivoSelect) {
        motivoSelect.addEventListener('change', toggleCamposSegunMotivo);
    }
}

// Cargar sucursales
async function cargarSucursalesEntradasSalidas() {
    try {
        const response = await fetch('/sucursales/');
        const data = await response.json();
        
        if (data.status === 'success') {
            // Real data from database
            entradasSalidasSucursalesCache = data.sucursales;
            
            // Populate dropdown with real data
            const sucursalSelect = document.getElementById('sucursalMovimiento');
            if (sucursalSelect) {
                sucursalSelect.innerHTML = '<option value="">Seleccionar sucursal</option>' +
                    data.sucursales.map(s => `<option value="${s.id}">${s.nombre}</option>`).join('');
            }

            // Populate filter with real data
            const filterSucursal = document.getElementById('filterSucursalMovimiento');
            if (filterSucursal) {
                filterSucursal.innerHTML = '<option value="">Todas las sucursales</option>' +
                    data.sucursales.map(s => `<option value="${s.id}">${s.nombre}</option>`).join('');
            }
        } else {
            console.error('Error en respuesta:', data.message || 'Error desconocido');
        }
    } catch (error) {
        console.error('Error al cargar sucursales:', error);
    }
}

// Cargar insumos
async function cargarInsumosEntradasSalidas() {
    try {
        const response = await fetch('/insumos/');
        const data = await response.json();
        
        if (data.status === 'success') {
            entradasSalidasInsumosCache = data.insumos;
            
            const insumoSelect = document.getElementById('insumoMovimiento');
            if (insumoSelect) {
                insumoSelect.innerHTML = '<option value="">Seleccionar insumo</option>' +
                    data.insumos.map(i => `<option value="${i.id}" data-unidad="${i.unidad}">${i.nombre} (${i.categoria})</option>`).join('');
            }
        }  // Este cierre de llave debe estar aquí
    } catch (error) { // El catch debe estar a este nivel
        console.error('Error al cargar insumos:', error);
    }
}

// Cargar proveedores
async function cargarProveedoresEntradasSalidas() {
    try {
        const response = await fetch('/proveedores/');
        const data = await response.json();
        
        if (data.status === 'success') {
            entradasSalidasProveedoresCache = data.proveedores;
            
            const proveedorSelect = document.getElementById('proveedorMovimiento');
            if (proveedorSelect) {
                proveedorSelect.innerHTML = '<option value="">Seleccionar proveedor (opcional)</option>' +
                    data.proveedores.map(p => `<option value="${p.id}">${p.nombre}</option>`).join('');
            }
        }  // Este cierre de llave debe estar aquí
    } catch (error) { // El catch debe estar a este nivel
        console.error('Error al cargar proveedores:', error);
    }
}

// Cargar movimientos
async function cargarMovimientos() {
    try {
        const response = await fetch('/api/movimientos/');
        const data = await response.json();
        
        if (data.status === 'success') {
            // Store real database data in cache
            entradasSalidasMovimientosCache = data.movimientos;
            // Render using real data
            renderizarMovimientos(data.movimientos);
        } else {
            throw new Error(data.message || 'Error al cargar movimientos');
        }
    } catch (error) {
        console.error('Error al cargar movimientos:', error);
        document.getElementById('movimientosContainer').innerHTML = `
            <div style="padding: 40px; text-align: center; color: #ef4444;">
                <i class="fa-solid fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 16px;"></i>
                <h3 style="margin: 0 0 8px 0;">Error al cargar movimientos</h3>
                <p style="margin: 0; color: #64748b;">${error.message}</p>
                <button onclick="cargarMovimientos()" style="margin-top: 16px; background: #3b82f6; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer;">
                    Reintentar
                </button>
            </div>
        `;
    }
}

// Renderizar movimientos
function renderizarMovimientos(movimientos) {
    const container = document.getElementById('movimientosContainer');
    
    if (!movimientos || movimientos.length === 0) {
        container.innerHTML = `
            <div style="padding: 40px; text-align: center; color: #64748b;">
                <i class="fa-solid fa-inbox" style="font-size: 3rem; margin-bottom: 16px;"></i>
                <h3 style="margin: 0 0 8px 0;">No hay movimientos</h3>
                <p style="margin: 0;">Aún no se han registrado movimientos de inventario</p>
            </div>
        `;
        return;
    }

    const movimientosHTML = movimientos.map(mov => `
        <div style="border-bottom: 1px solid #e2e8f0; padding: 16px 20px; transition: background-color 0.2s; cursor: pointer; display: flex; align-items: center; justify-content: space-between;" 
             onclick="verMovimiento(${mov.id})" onmouseover="this.style.backgroundColor='#f8fafc'" onmouseout="this.style.backgroundColor='white'">
            
            <div style="display: flex; align-items: center; flex-grow: 1;">
                <div style="margin-right: 16px; display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 50%; background-color: ${mov.tipo === 'entrada' ? '#ecfdf5' : '#fef2f2'};">
                    <i class="fa-solid ${mov.tipo === 'entrada' ? 'fa-arrow-down' : 'fa-arrow-up'}" 
                       style="color: ${mov.tipo === 'entrada' ? '#10b981' : '#ef4444'}; font-size: 1.2rem;"></i>
                </div>
                
                <div style="flex-grow: 1;">
                    <div style="display: flex; align-items: center; margin-bottom: 4px;">
                        <span style="font-weight: 600; color: #1e293b; margin-right: 12px;">${mov.insumo_nombre}</span>
                        <span style="background-color: ${mov.tipo === 'entrada' ? '#d1fae5' : '#fee2e2'}; 
                                     color: ${mov.tipo === 'entrada' ? '#047857' : '#b91c1c'}; 
                                     padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: 500; text-transform: uppercase;">
                            ${mov.tipo}
                        </span>
                    </div>
                    <div style="color: #64748b; font-size: 0.9rem;">
                        <span>${mov.cantidad} ${mov.unidad}</span>
                        <span style="margin: 0 8px;">•</span>
                        <span>${mov.sucursal_nombre}</span>
                        <span style="margin: 0 8px;">•</span>
                        <span>${formatearFechaHora(mov.fecha_hora)}</span>
                    </div>
                </div>
            </div>
            
            <div style="text-align: right;">
                ${mov.tipo === 'entrada' ? `
                    <div style="font-weight: 600; color: #1e293b;">$${(mov.costo_unitario || 0).toFixed(2)}</div>
                    <div style="font-size: 0.85rem; color: #64748b;">${mov.proveedor_nombre || 'Sin proveedor'}</div>
                ` : `
                    <div style="font-size: 0.9rem; color: #64748b;">${mov.motivo}</div>
                `}
                
                ${mov.estado === 'cancelado' ? `
                    <span style="background-color: #fee2e2; color: #b91c1c; padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: 500;">
                        CANCELADO
                    </span>
                ` : ''}
            </div>
            
            <div style="margin-left: 16px;">
                ${mov.estado !== 'cancelado' ? `
                    <button onclick="event.stopPropagation(); cancelarMovimiento(${mov.id})" 
                            style="background: none; border: none; color: #ef4444; cursor: pointer; padding: 8px; border-radius: 4px;" 
                            title="Cancelar Movimiento">
                        <i class="fa-solid fa-ban"></i>
                    </button>
                ` : ''}
            </div>
        </div>
    `).join('');

    container.innerHTML = `
        <div style="padding: 20px; border-bottom: 1px solid #e2e8f0; background: #f8fafc;">
            <h3 style="margin: 0; color: #1e293b; font-size: 1.1rem; font-weight: 600;">
                Movimientos registrados (${movimientos.length})
            </h3>
        </div>
        ${movimientosHTML}
    `;
}

// Mostrar modal para nuevo movimiento
function mostrarModalMovimiento() {
    document.getElementById('movimientoModal').style.display = 'flex';
    document.getElementById('movimientoModalTitle').textContent = 'Nuevo Movimiento';
    document.getElementById('movimientoForm').reset();
    document.getElementById('movimientoId').value = '';
    
    // Default to 'entrada' type
    document.querySelector('input[name="tipoMovimiento"][value="entrada"]').checked = true;
    
    // Clear the insumoMovimiento select
    const insumoSelect = document.getElementById('insumoMovimiento');
    insumoSelect.innerHTML = '<option value="">Seleccione datos adicionales primero</option>';
    insumoSelect.disabled = true;
    
    // Initialize all containers to be hidden
    document.getElementById('proveedorContainer').style.display = 'none';
    document.getElementById('sucursalDestinoContainer').style.display = 'none';
    document.getElementById('otroMotivoContainer').style.display = 'none';
    document.getElementById('costoContainer').style.display = 'none';
    
    // Initialize field visibility based on the default type
    toggleCamposSegunTipo();
}

// Cerrar modal
function cerrarModalMovimiento() {
    document.getElementById('movimientoModal').style.display = 'none';
}

// Cerrar modal de detalle
function cerrarDetalleMovimiento() {
    document.getElementById('detalleMovimientoModal').style.display = 'none';
}

// Toggle campos según tipo de movimiento
function toggleCamposSegunTipo() {
    const tipo = document.querySelector('input[name="tipoMovimiento"]:checked')?.value;
    const motivo = document.getElementById('motivoMovimiento').value;
    const proveedorContainer = document.getElementById('proveedorContainer');
    const costoContainer = document.getElementById('costoContainer');
    
    // Motivo-specific logic takes precedence for provider visibility
    if (motivo !== 'devolucion') {
        // Only show provider for devolucion or entrada
        proveedorContainer.style.display = tipo === 'entrada' ? 'block' : 'none';
    }
    
    if (tipo === 'entrada') {
        costoContainer.style.display = 'block';
        document.getElementById('costoUnitario').required = true;
    } else {
        costoContainer.style.display = 'none';
        document.getElementById('costoUnitario').required = false;
    }
}

// Toggle campos según motivo del movimiento
function toggleCamposSegunMotivo() {
    const motivo = document.getElementById('motivoMovimiento').value;
    const tipo = document.querySelector('input[name="tipoMovimiento"]:checked')?.value;
    const proveedorContainer = document.getElementById('proveedorContainer');
    const sucursalDestinoContainer = document.getElementById('sucursalDestinoContainer');
    const otroMotivoContainer = document.getElementById('otroMotivoContainer');
    const insumoSelect = document.getElementById('insumoMovimiento');
    
    // Reset display properties
    proveedorContainer.style.display = 'none';
    sucursalDestinoContainer.style.display = 'none';
    otroMotivoContainer.style.display = 'none';
    
    // Clear and disable insumo select until appropriate condition is met
    insumoSelect.innerHTML = '<option value="">Seleccione datos adicionales primero</option>';
    insumoSelect.disabled = true;
    
    // Show fields based on motivo
    if (motivo === 'devolucion') {
        // Show provider field for returns
        proveedorContainer.style.display = 'block';
        
        // Provider selection will enable the insumo field and load corresponding options
    } 
    else if (motivo === 'traspaso') {
        // Show destination location field for transfers
        sucursalDestinoContainer.style.display = 'block';
        
        // Load insumos from the origin location
        const sucursalOrigenId = document.getElementById('sucursalMovimiento').value;
        if (sucursalOrigenId) {
            cargarInsumosDeOrigen(sucursalOrigenId);
        } else {
            // If no origin location is selected, keep insumo disabled
            insumoSelect.innerHTML = '<option value="">Seleccione la sucursal de origen primero</option>';
        }
    }
    else if (motivo === 'otro') {
        // Show "other reason" field
        otroMotivoContainer.style.display = 'block';
        
        // For other reasons, enable insumo selection with all insumos
        cargarInsumosEntradasSalidas();
        insumoSelect.disabled = false;
    }
    else {
        // For all other motivos, load all insumos
        cargarInsumosEntradasSalidas();
        insumoSelect.disabled = false;
    }
    
    // When motivo changes, we should also check tipo (entrada/salida) 
    // to maintain consistent field visibility
    toggleCamposSegunTipo();
}

// Toggle otro motivo
function toggleOtroMotivo() {
    const motivo = document.getElementById('motivoMovimiento').value;
    const otroContainer = document.getElementById('otroMotivoContainer');
    
    if (motivo === 'otro') {
        otroContainer.style.display = 'block';
        document.getElementById('otroMotivo').required = true;
    } else {
        otroContainer.style.display = 'none';
        document.getElementById('otroMotivo').required = false;
    }
}

// Actualizar unidad del insumo y costo unitario
function actualizarUnidadInsumo() {
    const insumoSelect = document.getElementById('insumoMovimiento');
    const unidadInput = document.getElementById('unidadMovimiento');
    const costoInput = document.getElementById('costoUnitario');
    const selectedOption = insumoSelect.selectedOptions[0];
    
    if (selectedOption) {
        unidadInput.value = selectedOption.dataset.unidad || '';
        
        // Auto-fill cost from provider data if available
        if (selectedOption.dataset.costo && costoInput) {
            costoInput.value = selectedOption.dataset.costo;
        }
    } else {
        unidadInput.value = '';
        if (costoInput) costoInput.value = '';
    }
}

// Manejar envío del formulario
async function handleMovimientoSubmit(event) {
    event.preventDefault();
    
    try {
        const movimientoId = document.getElementById('movimientoId').value;
        const isEditing = !!movimientoId;
        
        const tipo = document.querySelector('input[name="tipoMovimiento"]:checked')?.value;
        const sucursalId = document.getElementById('sucursalMovimiento').value;
        const insumoId = document.getElementById('insumoMovimiento').value;
        const cantidad = parseFloat(document.getElementById('cantidadMovimiento').value);
        const motivo = document.getElementById('motivoMovimiento').value;
        
        // Validaciones básicas
        if (!tipo) {
            throw new Error('Debes seleccionar el tipo de movimiento');
        }
        
        if (!sucursalId) {
            throw new Error('Debes seleccionar una sucursal');
        }
        
        if (!motivo) {
            throw new Error('Debes seleccionar un motivo para el movimiento');
        }
        
        if (!insumoId) {
            throw new Error('Debes seleccionar un insumo');
        }
        
        if (!cantidad || cantidad <= 0) {
            throw new Error('Debes ingresar una cantidad válida');
        }
        
        // Validaciones adicionales según el motivo
        if (motivo === 'traspaso') {
            const sucursalDestinoId = document.getElementById('sucursalDestinoMovimiento').value;
            if (!sucursalDestinoId) {
                throw new Error('Debes seleccionar una sucursal de destino para el traspaso');
            }
        }
        
        // Validaciones adicionales según el tipo
        if (tipo === 'entrada') {
            const costoUnitario = parseFloat(document.getElementById('costoUnitario').value);
            if (!costoUnitario || costoUnitario < 0) {
                throw new Error('Debes ingresar un costo nuevo válido');
            }
        }
        
        // Si es "otro" motivo, validar que se haya especificado
        if (motivo === 'otro') {
            const otroMotivo = document.getElementById('otroMotivo').value.trim();
            if (!otroMotivo) {
                throw new Error('Debes especificar el motivo del movimiento');
            }
        }
        
        const formData = {
            tipo: tipo,
            sucursal_id: parseInt(sucursalId),
            insumo_id: parseInt(insumoId),
            cantidad: cantidad,
            unidad: document.getElementById('unidadMovimiento').value,
            motivo: motivo === 'otro' ? document.getElementById('otroMotivo').value.trim() : motivo,
            observaciones: document.getElementById('observacionesMovimiento').value.trim()
        };
        
        // Campos específicos para entradas
        if (tipo === 'entrada') {
            const proveedorId = document.getElementById('proveedorMovimiento').value;
            if (proveedorId) {
                formData.proveedor_id = parseInt(proveedorId);
            }
            formData.costo_unitario = parseFloat(document.getElementById('costoUnitario').value);
        }
        
        // Campos específicos para traspasos
        if (motivo === 'traspaso') {
            formData.sucursal_destino_id = parseInt(document.getElementById('sucursalDestinoMovimiento').value);
        }
        
        // Campos específicos para devoluciones
        if (motivo === 'devolucion') {
            const proveedorId = document.getElementById('proveedorMovimiento').value;
            if (proveedorId) {
                formData.proveedor_id = parseInt(proveedorId);
            }
        }
        
        const url = isEditing ? `/api/movimientos/${movimientoId}/` : '/api/movimientos/';
        const method = isEditing ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (data.status === 'success') {
            cerrarModalMovimiento();
            await cargarMovimientos();
            alert(isEditing ? 'Movimiento actualizado correctamente' : 'Movimiento registrado correctamente');
        } else {
            throw new Error(data.message || 'Error al procesar el movimiento');
        }
        
    } catch (error) {
        console.error('Error:', error);
        alert(`Error: ${error.message}`);
    }
}

// Ver detalle del movimiento
async function verMovimiento(movimientoId) {
    try {
        const response = await fetch(`/api/movimientos/${movimientoId}/`);
        const data = await response.json();
        
        if (data.status === 'success') {
            const movimiento = data.movimiento;
            
            const detalleHTML = `
                <div style="border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
                    <div style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; 
                                background-color: ${movimiento.tipo === 'entrada' ? '#ecfdf5' : '#fef2f2'}; 
                                display: flex; align-items: center; justify-content: space-between;">
                        <div>
                            <span style="font-weight: 600; color: ${movimiento.tipo === 'entrada' ? '#047857' : '#b91c1c'}; text-transform: uppercase;">
                                ${movimiento.tipo}
                            </span>
                            <span style="margin-left: 8px; font-size: 0.9rem; color: ${movimiento.tipo === 'entrada' ? '#065f46' : '#991b1b'};">
                                ${formatearFechaHora(movimiento.fecha_hora)}
                            </span>
                            
                            ${movimiento.estado === 'cancelado' ? `
                                <span style="margin-left: 8px; background-color: #fee2e2; color: #b91c1c; padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: 500;">
                                    CANCELADO
                                </span>
                            ` : ''}
                        </div>
                    </div>
                    
                    <div style="padding: 16px; background-color: white;">
                        <div style="margin-bottom: 16px;">
                            <div style="margin-bottom: 8px; font-weight: 600; color: #1e293b;">Insumo</div>
                            <div style="display: flex; align-items: center; background-color: #f8fafc; padding: 12px; border-radius: 6px;">
                                <i class="fa-solid fa-box" style="color: #3b82f6; margin-right: 10px; font-size: 1.2rem;"></i>
                                <div style="flex-grow: 1;">
                                    <div style="font-weight: 500; color: #1e293b;">${movimiento.insumo_nombre}</div>
                                    <div style="font-size: 0.85rem; color: #64748b;">${movimiento.cantidad} ${movimiento.unidad}</div>
                                </div>
                            </div>
                        </div>
                        
                        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 16px;">
                            <!-- Sucursal (top-left) -->
                            <div>
                                <div style="margin-bottom: 4px; font-size: 0.85rem; color: #64748b;">Sucursal</div>
                                <div style="font-weight: 500; color: #1e293b;">${movimiento.sucursal_nombre}</div>
                            </div>
                            
                            <!-- Sucursal de Destino (top-right, if applicable) -->
                            ${movimiento.motivo === 'traspaso' && movimiento.sucursal_destino_nombre ? `
                            <div>
                                <div style="margin-bottom: 4px; font-size: 0.85rem; color: #64748b;">Sucursal de Destino</div>
                                <div style="font-weight: 500; color: #1e293b;">${movimiento.sucursal_destino_nombre}</div>
                            </div>
                            ` : `
                            <!-- Placeholder when there's no destination -->
                            <div></div>
                            `}
                            
                            <!-- Motivo (bottom-right) -->
                            <div>
                                <div style="margin-bottom: 4px; font-size: 0.85rem; color: #64748b;">Motivo</div>
                                <div style="font-weight: 500; color: #1e293b;">${movimiento.motivo}</div>
                            </div>
                            
                            <!-- Usuario (bottom-left) -->
                            <div>
                                <div style="margin-bottom: 4px; font-size: 0.85rem; color: #64748b;">Usuario</div>
                                <div style="font-weight: 500; color: #1e293b;">${movimiento.usuario_nombre}</div>
                            </div>

                            ${movimiento.tipo === 'entrada' ? `
                            <!-- Additional entry-specific fields in a second row -->
                            <div>
                                <div style="margin-bottom: 4px; font-size: 0.85rem; color: #64748b;">Proveedor</div>
                                <div style="font-weight: 500; color: #1e293b;">${movimiento.proveedor_nombre || 'No especificado'}</div>
                            </div>
                            
                            <div>
                                <div style="margin-bottom: 4px; font-size: 0.85rem; color: #64748b;">Costo Nuevo</div>
                                <div style="font-weight: 500; color: #1e293b;">$${(movimiento.costo_unitario || 0).toFixed(2)}</div>
                            </div>
                            ` : ''}
                        </div>
                        
                        ${movimiento.observaciones ? `
                        <div style="margin-top: 16px; padding: 12px; background-color: #f8fafc; border-radius: 6px;">
                            <div style="margin-bottom: 4px; font-size: 0.85rem; color: #64748b;">Observaciones</div>
                            <div style="color: #1e293b;">${movimiento.observaciones}</div>
                        </div>
                        ` : ''}
                    </div>
                </div>
            `;
            
            document.getElementById('detalleMovimientoContent').innerHTML = detalleHTML;
            document.getElementById('detalleMovimientoModal').style.display = 'flex';
        }
    } catch (error) {
        console.error('Error al cargar detalle:', error);
        alert('Error al cargar el detalle del movimiento');
    }
}

// Editar movimiento
async function editarMovimiento(movimientoId) {
    try {
        const response = await fetch(`/api/movimientos/${movimientoId}/`);
        const data = await response.json();
        
        if (data.status === 'success') {
            const movimiento = data.movimiento;
            
            // Llenar formulario
            document.getElementById('movimientoId').value = movimiento.id;
            document.querySelector(`input[name="tipoMovimiento"][value="${movimiento.tipo}"]`).checked = true;
            document.getElementById('sucursalMovimiento').value = movimiento.sucursal_id;
            
            // Primero establecer el proveedor
            const proveedorSelect = document.getElementById('proveedorMovimiento');
            proveedorSelect.value = movimiento.proveedor_id || '';
            
            // Cargar los insumos del proveedor y luego seleccionar el insumo
            if (movimiento.proveedor_id) {
                await cargarInsumosDeProveedor(movimiento.proveedor_id);
                // Después de cargar los insumos, establecer el insumo seleccionado
                document.getElementById('insumoMovimiento').value = movimiento.insumo_id;
            } else {
                // Si no hay proveedor, desactivar el selector de insumos
                const insumoSelect = document.getElementById('insumoMovimiento');
                insumoSelect.disabled = true;
                insumoSelect.innerHTML = '<option value="">Seleccione un proveedor primero</option>';
            }
            
            document.getElementById('cantidadMovimiento').value = movimiento.cantidad;
            document.getElementById('unidadMovimiento').value = movimiento.unidad;
            document.getElementById('motivoMovimiento').value = movimiento.motivo;
            document.getElementById('observacionesMovimiento').value = movimiento.observaciones || '';
            
            if (movimiento.tipo === 'entrada') {
                document.getElementById('costoUnitario').value = movimiento.costo_unitario || '';
            }
            
            toggleCamposSegunTipo();
            toggleCamposSegunMotivo();
            toggleOtroMotivo();
            
            document.getElementById('movimientoModalTitle').textContent = 'Editar Movimiento';
            document.getElementById('movimientoModal').style.display = 'flex';
        }
    } catch (error) {
        console.error('Error al cargar movimiento:', error);
        alert('Error al cargar los datos del movimiento');
    }
}

// Eliminar movimiento
async function eliminarMovimiento(movimientoId) {
    if (!confirm('¿Estás seguro de que deseas eliminar este movimiento? Esta acción no se puede deshacer.')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/movimientos/${movimientoId}/`, {
            method: 'DELETE',
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            }
        });
        
        const data = await response.json();
        
        if (data.status === 'success') {
            await cargarMovimientos();
            alert('Movimiento eliminado correctamente');
        } else {
            throw new Error(data.message || 'Error al eliminar el movimiento');
        }
    } catch (error) {
        console.error('Error:', error);
        alert(`Error: ${error.message}`);
    }
}

// Función para cancelar un movimiento
async function cancelarMovimiento(id) {
    event.stopPropagation(); // Evitar que se propague al onClick del contenedor
    
    if (!confirm('¿Está seguro de que desea cancelar este movimiento? Esta acción no se puede deshacer.')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/movimientos/${id}/cancelar/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            }
        });
        
        const data = await response.json();
        
        if (data.status === 'success') {
            alert('Movimiento cancelado correctamente');
            await cargarMovimientos(); // Recargar la lista
        } else {
            throw new Error(data.message || 'Error al cancelar el movimiento');
        }
    } catch (error) {
        console.error('Error:', error);
        alert(`Error: ${error.message}`);
    }
}

// Cargar insumos de un proveedor específico
async function cargarInsumosDeProveedor(proveedorId) {
    const insumoSelect = document.getElementById('insumoMovimiento');
    
    try {
        // If no provider is selected, disable ingredient selector
        if (!proveedorId) {
            insumoSelect.disabled = true;
            insumoSelect.innerHTML = '<option value="">Seleccione un proveedor primero</option>';
            return;
        }
        
        // Show loading state
        insumoSelect.disabled = true;
        insumoSelect.innerHTML = '<option value="">Cargando insumos...</option>';
        
        const response = await fetch(`/api/proveedores/${proveedorId}/productos/`);
        const data = await response.json();
        
        if (data.status === 'success') {
            // Enable the select and populate with provider's ingredients
            insumoSelect.innerHTML = '<option value="">Seleccionar insumo</option>';
            
            // Add products from this provider
            data.productos.forEach(producto => {
                insumoSelect.innerHTML += `<option value="${producto.insumo_id}" 
                    data-unidad="${producto.unidad}" 
                    data-costo="${producto.costo_unitario}">
                    ${producto.nombre} (${producto.categoria || 'Sin categoría'})
                </option>`;
            });
            
            // Enable the select now that we have options
            insumoSelect.disabled = false;
        }
    } catch (error) {
        console.error('Error al cargar insumos del proveedor:', error);
        // Show error state
        insumoSelect.innerHTML = '<option value="">Error al cargar insumos</option>';
    }
}

// Add this function to load insumos based on the origin location for transfers

// Cargar insumos de una sucursal de origen
async function cargarInsumosDeOrigen(sucursalId) {
    const insumoSelect = document.getElementById('insumoMovimiento');
    
    if (!sucursalId) {
        insumoSelect.innerHTML = '<option value="">Seleccione la sucursal de origen primero</option>';
        insumoSelect.disabled = true;
        return;
    }
    
    try {
        insumoSelect.disabled = true;
        insumoSelect.innerHTML = '<option value="">Cargando insumos...</option>';
        
        // API endpoint to get insumos available at a specific location
        const response = await fetch(`/api/sucursales/${sucursalId}/insumos/`);
        const data = await response.json();
        
        if (data.status === 'success') {
            insumoSelect.innerHTML = '<option value="">Seleccionar insumo</option>';
            
            // Add insumos from this location
            data.insumos.forEach(insumo => {
                insumoSelect.innerHTML += `<option value="${insumo.id}" 
                    data-unidad="${insumo.unidad}" 
                    data-stock="${insumo.stock}">
                    ${insumo.nombre} (Stock: ${insumo.stock} ${insumo.unidad})
                </option>`;
            });
            
            insumoSelect.disabled = false;
        } else {
            throw new Error(data.message || 'Error al cargar insumos de la sucursal');
        }
    } catch (error) {
        console.error('Error al cargar insumos de la sucursal:', error);
        insumoSelect.innerHTML = '<option value="">Error al cargar insumos</option>';
        insumoSelect.disabled = true;
    }
}

// Add this function to load destination locations, excluding the origin

// Cargar sucursales de destino para traspasos
async function cargarSucursalesDestino(origenId) {
    const destinoSelect = document.getElementById('sucursalDestinoMovimiento');
    
    try {
        destinoSelect.disabled = true;
        destinoSelect.innerHTML = '<option value="">Cargando sucursales...</option>';
        
        const response = await fetch('/sucursales/');
        const data = await response.json();
        
        if (data.status === 'success') {
            destinoSelect.innerHTML = '<option value="">Seleccionar sucursal de destino</option>';
            
            // Filter out the origin location
            const sucursalesDestino = data.sucursales.filter(s => s.id != origenId);
            
            sucursalesDestino.forEach(s => {
                destinoSelect.innerHTML += `<option value="${s.id}">${s.nombre}</option>`;
            });
            
            destinoSelect.disabled = false;
        } else {
            throw new Error(data.message || 'Error al cargar sucursales de destino');
        }
    } catch (error) {
        console.error('Error al cargar sucursales de destino:', error);
        destinoSelect.innerHTML = '<option value="">Error al cargar sucursales</option>';
    }
}

// Filtrar movimientos
function filtrarMovimientos() {
    if (!entradasSalidasMovimientosCache) return;
    
    const search = document.getElementById('searchEntradasSalidas').value.toLowerCase();
    const tipoFilter = document.getElementById('filterTipoMovimiento').value;
    const sucursalFilter = document.getElementById('filterSucursalMovimiento').value;
    const fechaFilter = document.getElementById('filterFechaMovimiento').value;
    
    let movimientosFiltrados = entradasSalidasMovimientosCache.filter(mov => {
        // Filtro por texto
        const matchText = !search || 
            mov.insumo_nombre.toLowerCase().includes(search) ||
            mov.usuario_nombre.toLowerCase().includes(search) ||
            mov.motivo.toLowerCase().includes(search) ||
            (mov.proveedor_nombre && mov.proveedor_nombre.toLowerCase().includes(search));
        
        // Filtro por tipo
        const matchTipo = !tipoFilter || mov.tipo === tipoFilter;
        
        // Filtro por sucursal
        const matchSucursal = !sucursalFilter || mov.sucursal_id.toString() === sucursalFilter;
        
        // Filtro por fecha
        const matchFecha = !fechaFilter || mov.fecha_hora.startsWith(fechaFilter);
        
        return matchText && matchTipo && matchSucursal && matchFecha;
    });
    
    renderizarMovimientos(movimientosFiltrados);
}

// Formatear fecha y hora
function formatearFechaHora(fechaHora) {
    const fecha = new Date(fechaHora);
    return fecha.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Hacer disponible globalmente
window.loadEntradasSalidasContent = loadEntradasSalidasContent;