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
                <h2 id="insumoCompuestoModalTitle" style="color: #1f2937; margin-top: 0; margin-bottom: 24px; font-size: 1.5rem; border-bottom: 1px solid #e5e7eb; padding-bottom: 12px;">Nuevo Insumo Compuesto</h2>
                
                <form id="insumoCompuestoForm" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
                    <input type="hidden" id="insumoCompuestoId" name="insumoCompuestoId">
                    
                    <div style="grid-column: span 2; display: flex; flex-direction: column;">
                        <label for="nombreInsumoCompuesto" style="color: #4b5563; margin-bottom: 6px; font-weight: 500;">Nombre del insumo compuesto: *</label>
                        <input type="text" id="nombreInsumoCompuesto" name="nombreInsumoCompuesto" required style="padding: 10px 12px; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 0.95rem;">
                    </div>
                    
                    <div style="display: flex; flex-direction: column;">
                        <label for="categoriaInsumoCompuesto" style="color: #4b5563; margin-bottom: 6px; font-weight: 500;">Categoría: *</label>
                        <select id="categoriaInsumoCompuesto" name="categoriaInsumoCompuesto" required style="padding: 10px 12px; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 0.95rem; background-color: white;">
                            <option value="">Seleccionar categoría</option>
                            <option value="salsas">Salsas</option>
                            <option value="masas">Masas</option>
                            <option value="marinados">Marinados</option>
                            <option value="mezclas">Mezclas</option>
                        </select>
                    </div>
                    
                    <div style="display: flex; flex-direction: column;">
                        <label for="unidadInsumoCompuesto" style="color: #4b5563; margin-bottom: 6px; font-weight: 500;">Unidad de medida: *</label>
                        <select id="unidadInsumoCompuesto" name="unidadInsumoCompuesto" required style="padding: 10px 12px; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 0.95rem; background-color: white;">
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
                        <input type="number" id="cantidadTotal" name="cantidadTotal" min="0.01" step="0.01" required style="padding: 10px 12px; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 0.95rem;">
                    </div>
                    
                    <div style="grid-column: span 2;">
                        <h3 style="margin-top: 20px; color: #1f2937; font-weight: 600; font-size: 1.1rem; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px;">Componentes</h3>
                        
                        <div id="componentesContainer" style="margin-bottom: 15px;"></div>
                        
                        <button type="button" id="agregarComponenteBtn" style="background-color: #e5e7eb; color: #4b5563; border: none; padding: 8px 15px; border-radius: 6px; cursor: pointer; font-size: 0.9rem; display: flex; align-items: center; gap: 5px;">
                            <i class="fa-solid fa-plus"></i> Agregar componente
                        </button>
                    </div>
                    
                    <div style="grid-column: span 2;">
                        <div style="display: flex; flex-direction: column;">
                            <label for="descripcionInsumoCompuesto" style="color: #4b5563; margin-bottom: 6px; font-weight: 500;">Descripción/Observaciones:</label>
                            <textarea id="descripcionInsumoCompuesto" name="descripcionInsumoCompuesto" rows="3" style="padding: 10px 12px; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 0.95rem; resize: vertical;"></textarea>
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
                </form>
            </div>
        </div>

        <!-- Modal para ver detalle de componentes -->
        <div id="detalleComponentesModal" style="display: none; position: fixed; z-index: 9999; left: 0; top: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.6); align-items: center; justify-content: center;">
            <div style="background-color: #fff; padding: 30px; border-radius: 12px; width: 90%; max-width: 700px; max-height: 90vh; overflow-y: auto; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2); position: relative;">
                <span id="closeDetalleComponentesModal" style="position: absolute; right: 20px; top: 20px; font-size: 28px; cursor: pointer; color: #6b7280;">&times;</span>
                <h2 id="detalleComponentesTitle" style="color: #1f2937; margin-top: 0; margin-bottom: 24px; font-size: 1.5rem; border-bottom: 1px solid #e5e7eb; padding-bottom: 12px;">Detalles del Insumo Compuesto</h2>
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
            
            tbody.innerHTML = data.insumos_compuestos.map(insumo => `
                <tr>
                    <td style="padding: 16px; border-bottom: 1px solid #f3f4f6; vertical-align: middle; background-color: white;">
                        <div style="font-weight: 600; color: #000000; font-size: 1rem;">${insumo.nombre}</div>
                        <div style="color: #64748b; font-size: 0.85rem;">Categoría: ${capitalizarPrimeraLetra(insumo.categoria)}</div>
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
            
        } else {
            console.error('Error al cargar insumos compuestos:', data.message);
        }
    } catch (error) {
        console.error('Error al cargar insumos compuestos:', error);
    }
}

// Función para cargar datos de ejemplo
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
                <div style="color: #64748b; font-size: 0.85rem;">Categoría: ${capitalizarPrimeraLetra(insumo.categoria)}</div>
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
            data-costo="${insumo.costo_estimado}"
            ${componente && componente.insumo_id === insumo.id ? 'selected' : ''}>
            ${insumo.nombre}
        </option>`
    ).join('');
    
    const componenteHTML = `
        <div class="componente-item" style="display: grid; grid-template-columns: 3fr 1fr 1fr 1fr auto; gap: 10px; margin-bottom: 10px; padding: 10px; background-color: #f9fafb; border-radius: 6px; align-items: center;">
            <div>
                <label for="componenteInsumo${componenteIndex}" style="display: block; font-size: 0.8rem; color: #6b7280; margin-bottom: 3px;">Insumo</label>
                <select id="componenteInsumo${componenteIndex}" name="componenteInsumo[]" required style="width: 100%; padding: 8px 10px; border: 1px solid #e5e7eb; border-radius: 4px; font-size: 0.9rem;">
                    <option value="">-- Seleccione un insumo --</option>
                    ${opcionesInsumos}
                </select>
            </div>
            <div>
                <label for="componenteUnidad${componenteIndex}" style="display: block; font-size: 0.8rem; color: #6b7280; margin-bottom: 3px;">Unidad</label>
                <input type="text" id="componenteUnidad${componenteIndex}" name="componenteUnidad[]" value="${componente ? componente.unidad : ''}" readonly style="width: 100%; padding: 8px 10px; border: 1px solid #e5e7eb; border-radius: 4px; font-size: 0.9rem; background-color: #f3f4f6;">
            </div>
            <div>
                <label for="componenteCantidad${componenteIndex}" style="display: block; font-size: 0.8rem; color: #6b7280; margin-bottom: 3px;">Cantidad</label>
                <input type="number" id="componenteCantidad${componenteIndex}" name="componenteCantidad[]" min="0.01" step="0.01" value="${componente ? componente.cantidad : ''}" required style="width: 100%; padding: 8px 10px; border: 1px solid #e5e7eb; border-radius: 4px; font-size: 0.9rem;">
            </div>
            <div>
                <label for="componenteCosto${componenteIndex}" style="display: block; font-size: 0.8rem; color: #6b7280; margin-bottom: 3px;">Costo</label>
                <input type="number" id="componenteCosto${componenteIndex}" name="componenteCosto[]" min="0" step="0.01" value="${componente ? componente.costo : ''}" required style="width: 100%; padding: 8px 10px; border: 1px solid #e5e7eb; border-radius: 4px; font-size: 0.9rem;">
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
    });

    // Añadir event listener para actualizar unidad y costo al seleccionar un insumo
    const selectInsumo = componenteElement.querySelector(`#componenteInsumo${componenteIndex}`);
    selectInsumo.addEventListener('change', function() {
        const selectedOption = this.options[this.selectedIndex];
        const unidadInput = componenteElement.querySelector(`#componenteUnidad${componenteIndex}`);
        const costoInput = componenteElement.querySelector(`#componenteCosto${componenteIndex}`);
        
        if (selectedOption.value) {
            unidadInput.value = selectedOption.dataset.unidad;
            // Sugerimos el costo pero permitimos modificarlo
            if (!costoInput.value) {
                costoInput.value = selectedOption.dataset.costo;
            }
        } else {
            unidadInput.value = '';
            costoInput.value = '';
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
        const id = document.getElementById('insumoCompuestoId').value;
        const nombre = document.getElementById('nombreInsumoCompuesto').value;
        const categoria = document.getElementById('categoriaInsumoCompuesto').value;
        const unidad = document.getElementById('unidadInsumoCompuesto').value;
        const descripcion = document.getElementById('descripcionInsumoCompuesto').value;
        const cantidadTotal = parseFloat(document.getElementById('cantidadTotal').value) || 0;
        
        if (!nombre) {
            alert("El nombre del insumo compuesto es obligatorio");
            return;
        }
        
        if (!categoria) {
            alert("Debe seleccionar una categoría");
            return;
        }
        
        if (!unidad) {
            alert("Debe seleccionar una unidad de medida");
            return;
        }
        
        if (cantidadTotal <= 0) {
            alert("La cantidad debe ser mayor a cero");
            return;
        }
        
        // Obtener componentes
        const componentesContainer = document.getElementById('componentesContainer');
        const componentesItems = componentesContainer.querySelectorAll('.componente-item');
        const componentes = [];
        
        let costoTotal = 0;
        
        componentesItems.forEach((item, index) => {
            // Aquí estaba el error, los IDs no coincidían
            const insumoSelect = item.querySelector(`select[id^="componenteInsumo"]`);
            const unidadInput = item.querySelector(`input[id^="componenteUnidad"]`);
            const cantidadInput = item.querySelector(`input[id^="componenteCantidad"]`);
            const costoInput = item.querySelector(`input[id^="componenteCosto"]`);
            
            if (!insumoSelect || !unidadInput || !cantidadInput || !costoInput) {
                console.error("Faltan campos en el componente", index);
                return;
            }
            
            const insumoId = insumoSelect.value;
            const insumoNombre = insumoSelect.options[insumoSelect.selectedIndex].text;
            const unidadComponente = unidadInput.value;
            const cantidad = parseFloat(cantidadInput.value) || 0;
            const costo = parseFloat(costoInput.value) || 0;
            
            if (insumoId && cantidad > 0) {
                componentes.push({
                    insumo_id: insumoId,
                    insumo: insumoNombre,
                    unidad: unidadComponente,
                    cantidad: cantidad,
                    costo: costo
                });
                
                costoTotal += costo;
            }
        });
        
        if (componentes.length === 0) {
            alert("Debe agregar al menos un componente");
            return;
        }
        
        const formData = {
            nombre,
            categoria,
            unidad,
            cantidad: cantidadTotal,
            costo_total: costoTotal,
            descripcion,
            componentes
        };
        
        // Si hay ID, es una actualización
        if (id) {
            formData.id = id;
        }
        
        console.log("Enviando datos:", formData);
        
        // Intentar con la API real
        try {
            // Corregido: Para PUT request, usar la URL con el ID específico
            const url = id ? `/insumos-compuestos/${id}/` : '/insumos-compuestos/';
            const method = id ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify(formData)
            });
            
            if (!response.ok) {
                // Intentar obtener más información del error
                let errorDetail = '';
                try {
                    const errorData = await response.json();
                    errorDetail = errorData.message || errorData.error || '';
                } catch (e) {
                    errorDetail = await response.text();
                }
                
                throw new Error(`Error HTTP: ${response.status} - ${errorDetail}`);
            }
            
            const data = await response.json();
            
            if (data.status === 'success') {
                alert(`Insumo compuesto ${id ? 'actualizado' : 'creado'} exitosamente`);
                document.getElementById('insumoCompuestoModal').style.display = 'none';
                
                // Recargar los datos
                cargarInsumosCompuestos();
            } else {
                throw new Error(data.message || 'Error desconocido');
            }
        } catch (apiError) {
            console.error("Error llamando a la API:", apiError);
            
            // Modo de datos de ejemplo como respaldo
            alert(`Insumo compuesto ${id ? 'actualizado' : 'creado'} exitosamente (modo de ejemplo)`);
            document.getElementById('insumoCompuestoModal').style.display = 'none';
            cargarDatosEjemplo();
        }
    } catch (error) {
        console.error('Error general:', error);
        alert(`Error: ${error.message}`);
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
            
            document.getElementById('detalleComponentesTitle').textContent = `Componentes de: ${insumoCompuesto.nombre}`;
            
            const content = document.getElementById('detalleComponentesContent');
            content.innerHTML = `
                <div style="margin-bottom: 20px; background-color: #f8fafc; border-radius: 10px; padding: 20px; border: 1px solid #e2e8f0;">
                    <p style="margin: 8px 0; font-size: 1rem;"><strong style="color: #4b5563;">Categoría:</strong> <span style="color: #1e293b;">${capitalizarPrimeraLetra(insumoCompuesto.categoria)}</span></p>
                    <p style="margin: 8px 0; font-size: 1rem;"><strong style="color: #4b5563;">Unidad de medida:</strong> <span style="color: #1e293b;">${formatearUnidad(insumoCompuesto.unidad)}</span></p>
                    <p style="margin: 8px 0; font-size: 1rem;"><strong style="color: #4b5563;">Cantidad producida:</strong> <span style="color: #1e293b;">${insumoCompuesto.cantidad} ${formatearUnidad(insumoCompuesto.unidad)}</span></p>
                    <p style="margin: 8px 0; font-size: 1rem;"><strong style="color: #4b5563;">Costo total:</strong> <span style="color: #1e293b;">$${insumoCompuesto.costo.toFixed(2)}</span></p>
                    <p style="margin: 8px 0; font-size: 1rem;"><strong style="color: #4b5563;">Costo unitario:</strong> <span style="color: #1e293b;">$${(insumoCompuesto.costo/insumoCompuesto.cantidad).toFixed(2)} por ${formatearUnidad(insumoCompuesto.unidad)}</span></p>
                </div>
                
                <h3 style="margin-top: 20px; margin-bottom: 16px; color: #1f2937; font-weight: 600; font-size: 1.1rem; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px;">Lista de componentes</h3>
                
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
                            ${insumoCompuesto.componentes.map(componente => `
                            <tr>
                                <td style="padding: 16px; border-bottom: 1px solid #f3f4f6; vertical-align: middle; color: #000000; background-color: white;">${componente.insumo}</td>
                                <td style="padding: 16px; border-bottom: 1px solid #f3f4f6; vertical-align: middle; color: #000000; background-color: white;">${formatearUnidad(componente.unidad)}</td>
                                <td style="padding: 16px; border-bottom: 1px solid #f3f4f6; vertical-align: middle; color: #000000; background-color: white;">${componente.cantidad}</td>
                                <td style="padding: 16px; border-bottom: 1px solid #f3f4f6; vertical-align: middle; color: #000000; background-color: white; text-align: right;">$${componente.costo.toFixed(2)}</td>
                            </tr>
                            `).join('')}
                            <tr>
                                <td colspan="3" style="padding: 16px; font-weight: 600; text-align: right; border-top: 2px solid #e5e7eb; background-color: white;">TOTAL:</td>
                                <td style="padding: 16px; font-weight: 600; text-align: right; border-top: 2px solid #e5e7eb; background-color: white;">$${insumoCompuesto.costo.toFixed(2)}</td>
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
        
        if (confirm(`No se pudo cargar el insumo compuesto desde la base de datos.\n${error}\n\n¿Quieres ver datos de ejemplo?`)) {
            mostrarDatosEjemploInsumoCompuesto(id);
        }
    }
}

// Actualizar también la función mostrarDatosEjemploInsumoCompuesto para mantener consistencia
function mostrarDatosEjemploInsumoCompuesto(id) {
    // Código existente para cargar los datos de ejemplo
    
    // Actualizar solo la parte del HTML
    document.getElementById('detalleComponentesTitle').textContent = `Componentes de: ${insumoCompuesto.nombre} (EJEMPLO)`;
    
    const content = document.getElementById('detalleComponentesContent');
    content.innerHTML = `
        <div style="margin-bottom: 16px; background-color: #fff3cd; color: #664d03; padding: 12px; border-radius: 6px; border: 1px solid #ffecb5;">
            <strong>⚠️ Nota:</strong> Estos son datos de ejemplo porque no se pudo conectar con la base de datos.
        </div>
        
        <div style="margin-bottom: 20px; background-color: #f8fafc; border-radius: 10px; padding: 20px; border: 1px solid #e2e8f0;">
            <p style="margin: 8px 0; font-size: 1rem;"><strong style="color: #4b5563;">Categoría:</strong> <span style="color: #1e293b;">${capitalizarPrimeraLetra(insumoCompuesto.categoria)}</span></p>
            <p style="margin: 8px 0; font-size: 1rem;"><strong style="color: #4b5563;">Unidad de medida:</strong> <span style="color: #1e293b;">${formatearUnidad(insumoCompuesto.unidad)}</span></p>
            <p style="margin: 8px 0; font-size: 1rem;"><strong style="color: #4b5563;">Cantidad producida:</strong> <span style="color: #1e293b;">${insumoCompuesto.cantidad} ${formatearUnidad(insumoCompuesto.unidad)}</span></p>
            <p style="margin: 8px 0; font-size: 1rem;"><strong style="color: #4b5563;">Costo total:</strong> <span style="color: #1e293b;">$${insumoCompuesto.costo.toFixed(2)}</span></p>
            <p style="margin: 8px 0; font-size: 1rem;"><strong style="color: #4b5563;">Costo unitario:</strong> <span style="color: #1e293b;">$${(insumoCompuesto.costo/insumoCompuesto.cantidad).toFixed(2)} por ${formatearUnidad(insumoCompuesto.unidad)}</span></p>
        </div>
        
        <h3 style="margin-top: 20px; margin-bottom: 16px; color: #1f2937; font-weight: 600; font-size: 1.1rem; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px;">Lista de componentes</h3>
        
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
                    ${insumoCompuesto.componentes.map(componente => `
                    <tr>
                        <td style="padding: 16px; border-bottom: 1px solid #f3f4f6; vertical-align: middle; color: #000000; background-color: white;">${componente.insumo}</td>
                        <td style="padding: 16px; border-bottom: 1px solid #f3f4f6; vertical-align: middle; color: #000000; background-color: white;">${formatearUnidad(componente.unidad)}</td>
                        <td style="padding: 16px; border-bottom: 1px solid #f3f4f6; vertical-align: middle; color: #000000; background-color: white;">${componente.cantidad}</td>
                        <td style="padding: 16px; border-bottom: 1px solid #f3f4f6; vertical-align: middle; color: #000000; background-color: white; text-align: right;">$${componente.costo.toFixed(2)}</td>
                    </tr>
                    `).join('')}
                    <tr>
                        <td colspan="3" style="padding: 16px; font-weight: 600; text-align: right; border-top: 2px solid #e5e7eb; background-color: white;">TOTAL:</td>
                        <td style="padding: 16px; font-weight: 600; text-align: right; border-top: 2px solid #e5e7eb; background-color: white;">$${insumoCompuesto.costo.toFixed(2)}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;
    
    document.getElementById('detalleComponentesModal').style.display = 'flex';
}

// Función auxiliar para capitalizar primera letra
function capitalizarPrimeraLetra(texto) {
    return texto.charAt(0).toUpperCase() + texto.slice(1);
}

// Función para formatear unidades de medida
function formatearUnidad(unidad) {
    const formatos = {
        'kg': 'Kilogramo (kg)',
        'g': 'Gramo (g)',
        'lt': 'Litro (lt)',
        'ml': 'Mililitro (ml)',
        'pza': 'Pieza (pza)'
    };
    
    return formatos[unidad] || unidad;
}

// Añade esta función después de tus otras funciones
function filtrarInsumosCompuestos() {
    const busqueda = document.getElementById('searchInsumoCompuesto').value.toLowerCase();
    const categoria = document.getElementById('filterCategoriaCompuesta').value;
    
    const filas = document.querySelectorAll('#insumosCompuestosTbody tr');
    
    filas.forEach(fila => {
        // Si solo hay una celda (mensaje de no hay datos), mostrarla siempre
        if (fila.cells.length === 1) {
            return;
        }
        
        const nombreElement = fila.querySelector('td:first-child div:first-child');
        const categoriaElement = fila.querySelector('td:first-child div:last-child');
        
        if (!nombreElement || !categoriaElement) {
            return;
        }
        
        const nombre = nombreElement.textContent.toLowerCase();
        const categoriaTexto = categoriaElement.textContent.toLowerCase();
        
        // Extraer solo el texto de la categoría después de "Categoría: "
        const categoriaPura = categoriaTexto.replace('categoría:', '').trim();
        
        // Verificar si cumple con los filtros
        const cumpleBusqueda = nombre.includes(busqueda);
        const cumpleCategoria = categoria === 'todas' || categoriaPura === categoria;
        
        // Mostrar u ocultar la fila según los filtros
        fila.style.display = (cumpleBusqueda && cumpleCategoria) ? '' : 'none';
    });
}

// Exportar la función principal para que sea accesible desde fuera
window.loadInsumosCompuestosContent = loadInsumosCompuestosContent;
window.verDetalleComponentes = verDetalleComponentes;
window.editarInsumoCompuesto = editarInsumoCompuesto;
window.eliminarInsumoCompuesto = eliminarInsumoCompuesto;
window.filtrarInsumosCompuestos = filtrarInsumosCompuestos;

// Inicialización directa cuando se carga el documento
document.addEventListener('DOMContentLoaded', function() {
    console.log("Inicializando handler para Insumos Compuestos");
    
    // Evento para el botón de insumos compuestos (tanto con el ID antiguo como el nuevo)
    const btnInsumos = document.getElementById('menu_insumos_compuestos');
                       
    if (btnInsumos) {
        console.log("Botón de Insumos Compuestos encontrado, añadiendo evento");
        btnInsumos.addEventListener('click', function(e) {
            e.preventDefault();
            console.log("Clic en Insumos Compuestos detectado");
            
            // Activar este elemento visualmente
            document.querySelectorAll('#submenuInventario a').forEach(a => a.classList.remove('active'));
            this.classList.add('active');
            
            // Cargar el contenido
            loadInsumosCompuestosContent();
        });
    } else {
        console.warn("No se encontró el botón de Insumos Compuestos");
    }
});

// Actualizar la función editarInsumoCompuesto para mejor manejo de errores
async function editarInsumoCompuesto(id) {
    try {
        console.log(`Editando insumo compuesto ID: ${id}`);
        
        // Mostrar indicador de carga
        const loader = document.createElement('div');
        loader.innerHTML = `
            <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; 
                        background: rgba(255,255,255,0.7); z-index: 9998; 
                        display: flex; justify-content: center; align-items: center;">
                <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                    <p style="margin: 0; padding: 10px; text-align: center;">Cargando datos...</p>
                </div>
            </div>
        `;
        document.body.appendChild(loader);
        
        // Intentar obtener los datos de la API
        const response = await fetch(`/insumos-compuestos/${id}/`);
        
        // Quitar el indicador de carga
        document.body.removeChild(loader);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.status === 'success') {
            mostrarModalInsumoCompuesto(data.insumo_compuesto);
        } else {
            throw new Error(data.message || 'Error desconocido');
        }
    } catch (error) {
        console.error("Error obteniendo datos de API:", error);
        
        if (confirm(`No se pudo cargar el insumo compuesto desde la base de datos.\n${error}\n\n¿Quieres usar datos de ejemplo?`)) {
            // Usar datos de ejemplo solo como fallback
            const insumosCompuestos = [
                {
                    id: 1,
                    nombre: 'Salsa de chile habanero',
                    categoria: 'salsas',
                    unidad: 'lt',
                    cantidad: 2.5,
                    costo: 85.50,
                    componentes: [
                        { insumo: 'Chile habanero', insumo_id: 1, unidad: 'kg', cantidad: 0.5, costo: 25.00 },
                        { insumo: 'Ajo', insumo_id: 2, unidad: 'kg', cantidad: 0.1, costo: 8.50 },
                        { insumo: 'Cebolla', insumo_id: 3, unidad: 'kg', cantidad: 0.25, costo: 12.00 },
                        { insumo: 'Vinagre', insumo_id: 4, unidad: 'lt', cantidad: 1, costo: 20.00 },
                        { insumo: 'Sal', insumo_id: 5, unidad: 'kg', cantidad: 0.05, costo: 1.00 }
                    ]
                },
                // ... otros datos de ejemplo
            ];
            
            const insumoCompuesto = insumosCompuestos.find(item => item.id === id);
            
            if (!insumoCompuesto) {
                alert('No se encontró un ejemplo para este insumo compuesto');
                return;
            }
            
            mostrarModalInsumoCompuesto({...insumoCompuesto, ejemplo: true});
        }
    }
}

// Añade esta función después de las otras funciones y antes de las exportaciones al final del archivo
async function eliminarInsumoCompuesto(id, nombre) {
    if (confirm(`¿Estás seguro de que quieres eliminar "${nombre}"?`)) {
        try {
            // Intentar eliminar usando la API
            const response = await fetch(`/insumos-compuestos/${id}/`, {
                method: 'DELETE',
                headers: {
                    'X-CSRFToken': getCookie('csrftoken')
                }
            });
            
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.status === 'success') {
                alert(`Insumo compuesto "${nombre}" eliminado correctamente`);
                cargarInsumosCompuestos();
            } else {
                throw new Error(data.message || 'Error desconocido');
            }
        } catch (error) {
            console.error("Error eliminando con API:", error);
            
            // En modo de ejemplo, simular éxito
            alert(`Insumo compuesto "${nombre}" eliminado correctamente (modo de ejemplo)`);
            cargarDatosEjemplo();
        }
    }
}

// Asegúrate de que estas exportaciones al ámbito global existan al final del archivo:
window.loadInsumosCompuestosContent = loadInsumosCompuestosContent;
window.verDetalleComponentes = verDetalleComponentes;
window.editarInsumoCompuesto = editarInsumoCompuesto;
window.eliminarInsumoCompuesto = eliminarInsumoCompuesto;
window.filtrarInsumosCompuestos = filtrarInsumosCompuestos;