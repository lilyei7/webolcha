// Función para obtener el token CSRF
function getCsrfTokenRecetas() {
    return getCookie('csrftoken');
}

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

// Variables globales
let recetasInsumosDisponibles = [];
let recetasInsumosCompuestosDisponibles = [];
let recetasInsumosElaboradosDisponibles = [];
let contadorIngredientes = 0;

// Función principal para cargar el contenido de Recetas
function loadRecetasContent() {
    console.log('🔄 Iniciando carga de módulo de recetas...');
    
    const mainContent = document.querySelector('.main-content');
    
    if (!mainContent) {
        console.error('No se encontró .main-content');
        alert('Error: No se pudo encontrar el contenedor principal');
        return;
    }
    
    try {
        mainContent.innerHTML = `
            <div style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); padding: 24px; margin-top: 24px;">
                <!-- Encabezado -->
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; border-bottom: 1px solid #f1f5f9; padding-bottom: 20px;">
                    <div>
                        <h1 style="color: #1e293b; margin: 0; font-size: 2rem; font-weight: 700;">
                            <i class="fa-solid fa-utensils" style="color: #3b82f6; margin-right: 12px;"></i>
                            Recetas
                        </h1>
                        <p style="color: #64748b; margin-top: 6px; font-size: 1.05rem;">
                            Gestiona tus recetas y sus ingredientes
                        </p>
                    </div>
                    <button id="btnNuevaReceta" style="background: linear-gradient(90deg, #3b82f6 0%, #2563eb 100%); color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: 600; display: flex; align-items: center; gap: 8px;">
                        <i class="fa-solid fa-plus"></i>
                        Nueva Receta
                    </button>
                </div>

                <!-- Filtros -->
                <div style="display: flex; gap: 16px; margin: 24px 0; background-color: #f8fafc; border-radius: 10px; padding: 20px;">
                    <div style="flex: 1; position: relative;">
                        <i class="fa-solid fa-search" style="position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: #64748b;"></i>
                        <input type="text" id="searchReceta" placeholder="Buscar receta..." style="width: 100%; padding: 14px 14px 14px 45px; border: 1px solid #e2e8f0; border-radius: 8px; background: white;">
                    </div>
                    <select id="filterCategoriaReceta" style="padding: 12px 18px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: white; min-width: 190px;">
                        <option value="">Todas las categorías</option>
                        <option value="pizza">Pizza</option>
                        <option value="pasta">Pasta</option>
                        <option value="ensalada">Ensalada</option>
                        <option value="postre">Postre</option>
                        <option value="bebida">Bebida</option>
                    </select>
                </div>

                <!-- Tabla -->
                <div style="overflow-x: auto;">
                    <table style="width: 100%; color:black; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden;">
                        <thead>
                            <tr style="background-color: #f8fafc;">
                                <th style="padding: 16px; text-align: left; font-weight: 600; color: #4b5563; border-bottom: 2px solid #e5e7eb;">NOMBRE</th>
                                <th style="padding: 16px; text-align: left; font-weight: 600; color: #4b5563; border-bottom: 2px solid #e5e7eb;">CATEGORÍA</th>
                                <th style="padding: 16px; text-align: right; font-weight: 600; color: #4b5563; border-bottom: 2px solid #e5e7eb;">PRECIO</th>
                                <th style="padding: 16px; text-align: center; font-weight: 600; color: #4b5563; border-bottom: 2px solid #e5e7eb;">ACCIONES</th>
                            </tr>
                        </thead>
                        <tbody id="recetasTbody">
                            <tr>
                                <td colspan="4" style="text-align: center; padding: 20px; color: #6b7280;">
                                    <i class="fa-solid fa-spinner fa-spin"></i> Cargando recetas...
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        // Crear modales después de crear la interfaz principal
        crearModalReceta();
        crearModalDetalle();
        
        // Configurar eventos básicos
        configurarEventListenersBasicos();
        
        // Cargar datos iniciales
        setTimeout(() => {
            cargarDatosIniciales();
        }, 100);
        
        console.log('✅ Módulo de recetas cargado exitosamente');
        
    } catch (error) {
        console.error('Error creando interfaz de recetas:', error);
        mainContent.innerHTML = `
            <div style="padding: 24px; text-align: center; color: #ef4444;">
                <h2>Error al cargar Recetas</h2>
                <p>Ha ocurrido un problema técnico. Por favor, recarga la página.</p>
                <button onclick="location.reload()" style="background: #3b82f6; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer;">
                    Recargar Página
                </button>
            </div>
        `;
    }
}

// Crear modal de receta
function crearModalReceta() {
    const existingModal = document.getElementById('recetaModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    const modalHTML = `
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
                            <label for="nombreReceta" style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">Nombre *</label>
                            <input type="text" id="nombreReceta" required style="padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; width: 100%;">
                        </div>
                        <div>
                            <label for="categoriaReceta" style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">Categoría *</label>
                            <select id="categoriaReceta" required style="padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; width: 100%;">
                                <option value="">Seleccionar categoría</option>
                                <option value="pizza">Pizza</option>
                                <option value="pasta">Pasta</option>
                                <option value="ensalada">Ensalada</option>
                                <option value="postre">Postre</option>
                                <option value="bebida">Bebida</option>
                            </select>
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <label for="descripcionReceta" style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">Descripción</label>
                        <textarea id="descripcionReceta" rows="3" style="padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; width: 100%; resize: vertical;"></textarea>
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <label for="costoVenta" style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">Precio de venta *</label>
                        <div style="position: relative;">
                            <span style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #64748b;">$</span>
                            <input type="number" id="costoVenta" step="0.01" min="0" required style="padding: 12px 12px 12px 24px; border: 1px solid #e2e8f0; border-radius: 8px; width: 100%;">
                        </div>
                    </div>
                    
                    <!-- Ingredientes -->
                    <div style="margin-bottom: 24px;">
                        <h3 style="margin-top: 20px; color: #1f2937; font-weight: 600; border-bottom: 1px solid #e7e7eb; padding-bottom: 10px;">Ingredientes</h3>
                        <div id="ingredientesContainer" style="margin-bottom: 15px;"></div>
                        <button type="button" id="agregarIngredienteBtn" style="background-color: #f1f5f9; color: #475569; border: none; padding: 8px 15px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 5px;">
                            <i class="fa-solid fa-plus"></i> Agregar ingrediente
                        </button>
                    </div>
                    
                    <!-- Botones -->
                    <div style="display: flex; gap: 12px; justify-content: flex-end;">
                        <button type="button" id="cancelarRecetaBtn" style="background: #f1f5f9; color: #475569; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: 500;">
                            Cancelar
                        </button>
                        <button type="submit" style="background: linear-gradient(90deg, #3b82f6 0%, #2563eb 100%); color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: 500;">
                            <i class="fa-solid fa-save"></i> Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    configurarEventosModal();
}

// Crear modal de detalle
function crearModalDetalle() {
    const existingModal = document.getElementById('detalleRecetaModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    const modalHTML = `
        <div id="detalleRecetaModal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; align-items: center; justify-content: center;">
            <div style="background: white; border-radius: 12px; width: 90%; max-width: 800px; max-height: 90vh; overflow-y: auto; position: relative;">
                <div style="padding: 24px; border-bottom: 1px solid #e2e8f0; background: #f8fafc;">
                    <h2 id="detalleRecetaTitle" style="margin: 0; color: #1e293b; font-size: 1.5rem; font-weight: 600;">Detalle de Receta</h2>
                    <button id="closeDetalleRecetaModal" style="position: absolute; right: 16px; top: 16px; background: none; border: none; font-size: 24px; cursor: pointer; color: #64748b;">&times;</button>
                </div>
                <div id="detalleRecetaContent" style="padding: 24px;"></div>
                <div style="padding: 16px 24px 24px; display: flex; justify-content: flex-end;">
                    <button type="button" id="cerrarDetalleRecetaBtn" style="background: #f1f5f9; color: #475569; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: 500;">
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    configurarEventosModalDetalle();
}

// Configurar eventos del modal principal
function configurarEventosModal() {
    document.getElementById('closeRecetaModal').addEventListener('click', cerrarModalReceta);
    document.getElementById('cancelarRecetaBtn').addEventListener('click', cerrarModalReceta);
    document.getElementById('recetaForm').addEventListener('submit', guardarReceta);
    document.getElementById('agregarIngredienteBtn').addEventListener('click', () => {
        agregarIngredienteReceta();
    });
    
    document.getElementById('recetaModal').addEventListener('click', (e) => {
        if (e.target.id === 'recetaModal') cerrarModalReceta();
    });
}

// Configurar eventos del modal de detalle
function configurarEventosModalDetalle() {
    document.getElementById('closeDetalleRecetaModal').addEventListener('click', cerrarModalDetalle);
    document.getElementById('cerrarDetalleRecetaBtn').addEventListener('click', cerrarModalDetalle);
    
    document.getElementById('detalleRecetaModal').addEventListener('click', (e) => {
        if (e.target.id === 'detalleRecetaModal') cerrarModalDetalle();
    });
}

// Mostrar modal de receta
function mostrarModalReceta(receta = null) {
    const modal = document.getElementById('recetaModal');
    const form = document.getElementById('recetaForm');
    
    if (!modal) {
        console.error('Modal de receta no encontrado');
        return;
    }
    
    // Limpiar formulario
    form.reset();
    document.getElementById('ingredientesContainer').innerHTML = '';
    contadorIngredientes = 0;
    
    if (!receta) {
        document.getElementById('recetaModalTitle').textContent = 'Nueva Receta';
        document.getElementById('recetaId').value = '';
    } else {
        document.getElementById('recetaModalTitle').textContent = 'Editar Receta';
        document.getElementById('recetaId').value = receta.id;
        document.getElementById('nombreReceta').value = receta.nombre;
        document.getElementById('categoriaReceta').value = receta.categoria;
        document.getElementById('costoVenta').value = receta.costo;
        document.getElementById('descripcionReceta').value = receta.descripcion || '';
        
        // Cargar ingredientes existentes
        if (receta.insumos) {
            receta.insumos.forEach(insumo => agregarIngredienteReceta(insumo));
        }
        if (receta.insumos_compuestos) {
            receta.insumos_compuestos.forEach(insumo => agregarIngredienteReceta(insumo));
        }
        if (receta.insumos_elaborados) {
            receta.insumos_elaborados.forEach(insumo => agregarIngredienteReceta(insumo));
        }
    }
    
    modal.style.display = 'flex';
}

// Cerrar modales
function cerrarModalReceta() {
    document.getElementById('recetaModal').style.display = 'none';
}

function cerrarModalDetalle() {
    document.getElementById('detalleRecetaModal').style.display = 'none';
}

// FUNCIÓN ESPECÍFICA PARA RECETAS - CAMBIÉ EL NOMBRE PARA EVITAR CONFLICTOS
function agregarIngredienteReceta(ingrediente = null) {
    const container = document.getElementById('ingredientesContainer');
    const index = contadorIngredientes++;
    
    const div = document.createElement('div');
    div.className = 'ingrediente-item';
    div.style.cssText = 'margin-bottom: 16px; padding: 16px; background-color: #f8fafc; border-radius: 8px; position: relative; border: 1px solid #e2e8f0;';
    
    div.innerHTML = `
        <button type="button" class="btn-eliminar-ingrediente-receta" style="position: absolute; right: 16px; top: 16px; background: none; border: none; color: #ef4444; cursor: pointer;">
            <i class="fa-solid fa-times"></i>
        </button>
        <div style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 16px; align-items: end;">
            <div>
                <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">Ingrediente</label>
                <select id="ingredienteTipoReceta${index}" style="padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; width: 100%;" onchange="actualizarCamposIngredienteReceta(${index})">
                    <option value="">Seleccionar ingrediente</option>
                    ${generarOpcionesIngredientesParaRecetas(ingrediente)}
                </select>
                <div id="ingredienteCostoInfoReceta${index}" style="margin-top: 4px; font-size: 0.8rem; color: #6b7280; display: none;"></div>
            </div>
            <div>
                <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">Unidad</label>
                <input type="text" id="ingredienteUnidadReceta${index}" readonly style="padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; width: 100%; background-color: #f1f5f9;">
                <input type="hidden" id="ingredienteTipoValorReceta${index}">
            </div>
            <div>
                <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">Cantidad</label>
                <input type="number" id="ingredienteCantidadReceta${index}" min="0" step="0.01" style="padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; width: 100%;" oninput="calcularCostoIngredienteReceta(${index})">
            </div>
            <div>
                <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">Costo</label>
                <div style="position: relative;">
                    <span style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #64748b;">$</span>
                    <input type="number" id="ingredienteCostoReceta${index}" readonly step="0.01" min="0" style="padding: 12px 12px 12px 24px; border: 1px solid #e2e8f0; border-radius: 8px; width: 100%; background-color: #f1f5f9;">
                </div>
            </div>
        </div>
    `;
    
    container.appendChild(div);
    
    // Configurar botón eliminar
    div.querySelector('.btn-eliminar-ingrediente-receta').addEventListener('click', () => {
        container.removeChild(div);
        actualizarCostoTotalReceta();
    });
    
    // Si hay datos de ingrediente, llenar campos
    if (ingrediente) {
        const selectIngrediente = document.getElementById(`ingredienteTipoReceta${index}`);
        
        if (ingrediente.tipo === 'insumo') {
            selectIngrediente.value = ingrediente.id;
        } else if (ingrediente.tipo === 'compuesto') {
            selectIngrediente.value = ingrediente.id;
        } else if (ingrediente.tipo === 'elaborado') {
            selectIngrediente.value = ingrediente.id;
        }
        
        document.getElementById(`ingredienteUnidadReceta${index}`).value = ingrediente.unidad || '';
        document.getElementById(`ingredienteCantidadReceta${index}`).value = ingrediente.cantidad || '';
        document.getElementById(`ingredienteCostoReceta${index}`).value = ingrediente.costo || '';
        document.getElementById(`ingredienteTipoValorReceta${index}`).value = ingrediente.tipo || '';
        
        actualizarCamposIngredienteReceta(index);
    }
}

// Generar opciones de ingredientes para recetas - CON IDENTIFICADORES ÚNICOS
function generarOpcionesIngredientesParaRecetas(ingredienteSeleccionado = null) {
    let html = '';
    
    // Insumos básicos - CON COSTO DESDE INSUMOS_PROVEEDORES
    if (recetasInsumosDisponibles && recetasInsumosDisponibles.length > 0) {
        html += '<optgroup label="Insumos Simples">';
        recetasInsumosDisponibles.forEach(insumo => {
            const selected = ingredienteSeleccionado && ingredienteSeleccionado.id == insumo.id && ingredienteSeleccionado.tipo === 'insumo' ? 'selected' : '';
            
            const costoUnitario = parseFloat(insumo.costo_unitario) || 0;
            
            html += `<option value="${insumo.id}" data-tipo="insumo" data-unidad="${insumo.unidad}" data-costo="${costoUnitario}" ${selected}>🔹 ${insumo.nombre}</option>`;
        });
        html += '</optgroup>';
    }
    
    // Insumos compuestos - CON COSTO CALCULADO DESDE COMPONENTES
    if (recetasInsumosCompuestosDisponibles && recetasInsumosCompuestosDisponibles.length > 0) {
        html += '<optgroup label="Insumos Compuestos">';
        recetasInsumosCompuestosDisponibles.forEach(insumo => {
            const selected = ingredienteSeleccionado && ingredienteSeleccionado.id == insumo.id && ingredienteSeleccionado.tipo === 'compuesto' ? 'selected' : '';
            
            const costoUnitario = parseFloat(insumo.costo_unitario) || 0;
            
            html += `<option value="${insumo.id}" data-tipo="compuesto" data-unidad="${insumo.unidad}" data-costo="${costoUnitario}" ${selected}>🔸 ${insumo.nombre}</option>`;
        });
        html += '</optgroup>';
    }
    
    // Insumos elaborados - YA FUNCIONA CORRECTAMENTE
    if (recetasInsumosElaboradosDisponibles && recetasInsumosElaboradosDisponibles.length > 0) {
        html += '<optgroup label="Insumos Elaborados">';
        recetasInsumosElaboradosDisponibles.forEach(insumo => {
            const selected = ingredienteSeleccionado && ingredienteSeleccionado.id == insumo.id && ingredienteSeleccionado.tipo === 'elaborado' ? 'selected' : '';
            
            const costoUnitario = parseFloat(insumo.costo_unitario) || 0;
            
            html += `<option value="${insumo.id}" data-tipo="elaborado" data-unidad="${insumo.unidad}" data-costo="${costoUnitario}" ${selected}>🔻 ${insumo.nombre}</option>`;
        });
        html += '</optgroup>';
    }
    
    return html;
}

// Actualizar campos cuando se selecciona un ingrediente EN RECETAS
function actualizarCamposIngredienteReceta(index) {
    const select = document.getElementById(`ingredienteTipoReceta${index}`);
    const unidadInput = document.getElementById(`ingredienteUnidadReceta${index}`);
    const tipoInput = document.getElementById(`ingredienteTipoValorReceta${index}`);
    const costoInfo = document.getElementById(`ingredienteCostoInfoReceta${index}`);
    
    if (!select.value) {
        unidadInput.value = '';
        tipoInput.value = '';
        costoInfo.style.display = 'none';
        return;
    }
    
    const option = select.options[select.selectedIndex];
    const tipo = option.getAttribute('data-tipo');
    const unidad = option.getAttribute('data-unidad');
    const costo = parseFloat(option.getAttribute('data-costo')) || 0;
    
    unidadInput.value = unidad;
    tipoInput.value = tipo;
    
    // Mostrar información del costo CON COLORES ESPECÍFICOS
    if (costo > 0) {
        let fuenteCosto = '';
        if (tipo === 'insumo') {
            fuenteCosto = '(desde proveedores)';
            costoInfo.style.color = '#059669';
        } else if (tipo === 'compuesto') {
            fuenteCosto = '(calculado desde componentes)';
            costoInfo.style.color = '#1e40af';
        } else if (tipo === 'elaborado') {
            fuenteCosto = '(desde insumo elaborado)';
            costoInfo.style.color = '#ea580c';
        }
        
        costoInfo.innerHTML = `<strong>$${costo.toFixed(2)}/${unidad}</strong> <span style="font-size: 0.7rem; opacity: 0.8;">${fuenteCosto}</span>`;
        costoInfo.style.display = 'block';
    } else {
        costoInfo.innerHTML = '<span style="color: #ef4444;">⚠️ Sin costo definido - Verificar proveedores</span>';
        costoInfo.style.display = 'block';
    }
    
    // Calcular costo si hay cantidad
    const cantidadInput = document.getElementById(`ingredienteCantidadReceta${index}`);
    if (cantidadInput.value) {
        calcularCostoIngredienteReceta(index);
    }
}

// Calcular costo de ingrediente EN RECETAS
function calcularCostoIngredienteReceta(index) {
    const select = document.getElementById(`ingredienteTipoReceta${index}`);
    const cantidadInput = document.getElementById(`ingredienteCantidadReceta${index}`);
    const costoInput = document.getElementById(`ingredienteCostoReceta${index}`);
    
    if (!select.value || !cantidadInput.value) {
        costoInput.value = '';
        actualizarCostoTotalReceta();
        return;
    }
    
    const option = select.options[select.selectedIndex];
    const costoUnitario = parseFloat(option.getAttribute('data-costo')) || 0;
    const cantidad = parseFloat(cantidadInput.value) || 0;
    
    const costoTotal = cantidad * costoUnitario;
    costoInput.value = costoTotal.toFixed(2);
    
    actualizarCostoTotalReceta();
}

// Actualizar costo total de la receta
function actualizarCostoTotalReceta() {
    const ingredientes = document.querySelectorAll('.ingrediente-item');
    let costoTotal = 0;
    
    ingredientes.forEach(item => {
        const costoInput = item.querySelector('input[id^="ingredienteCostoReceta"]');
        if (costoInput && costoInput.value) {
            costoTotal += parseFloat(costoInput.value) || 0;
        }
    });
    
    const container = document.getElementById('ingredientesContainer');
    if (container) {
        const indicadorAnterior = container.querySelector('.costo-total-indicador-recetas');
        if (indicadorAnterior) {
            indicadorAnterior.remove();
        }
        
        if (costoTotal > 0) {
            const indicador = document.createElement('div');
            indicador.className = 'costo-total-indicador-recetas';
            indicador.style.cssText = 'background: #f0f9ff; border: 1px solid #0ea5e9; padding: 12px; border-radius: 8px; margin-top: 16px; text-align: right;';
            indicador.innerHTML = `
                <span style="color: #0369a1; font-weight: 600;">
                    💰 Costo total de ingredientes: $${costoTotal.toFixed(2)}
                </span>
            `;
            container.appendChild(indicador);
        }
    }
}

// FUNCIÓN CRÍTICA: Recopilar ingredientes del formulario - CORREGIDA
function recopilarIngredientesRecetas() {
    console.log('🔍 Recopilando ingredientes del formulario...');
    
    const ingredientes = [];
    const items = document.querySelectorAll('.ingrediente-item');
    
    console.log(`Encontrados ${items.length} elementos de ingredientes`);
    
    items.forEach((item, idx) => {
        console.log(`Procesando ingrediente ${idx + 1}:`);
        
        const select = item.querySelector(`select[id^="ingredienteTipoReceta"]`);
        const unidadInput = item.querySelector(`input[id^="ingredienteUnidadReceta"]`);
        const cantidadInput = item.querySelector(`input[id^="ingredienteCantidadReceta"]`);
        const costoInput = item.querySelector(`input[id^="ingredienteCostoReceta"]`);
        const tipoInput = item.querySelector(`input[id^="ingredienteTipoValorReceta"]`);
        
        if (select && select.value && cantidadInput && cantidadInput.value && parseFloat(cantidadInput.value) > 0) {
            const nombreCompleto = select.options[select.selectedIndex].text;
            const nombreLimpio = nombreCompleto.replace(/^[🔹🔸🔻]\s*/, '');
            
            const ingrediente = {
                id: parseInt(select.value),
                nombre: nombreLimpio,
                tipo: tipoInput ? tipoInput.value : 'insumo',
                unidad: unidadInput ? unidadInput.value : '',
                cantidad: parseFloat(cantidadInput.value),
                costo: parseFloat(costoInput.value) || 0
            };
            
            console.log(`Ingrediente válido encontrado:`, ingrediente);
            ingredientes.push(ingrediente);
        } else {
            console.log(`Ingrediente ${idx + 1} omitido - datos incompletos`);
        }
    });
    
    console.log(`Total de ingredientes recopilados: ${ingredientes.length}`);
    return ingredientes;
}

// FUNCIÓN CORREGIDA: Guardar receta con validación mejorada
async function guardarReceta(event) {
    event.preventDefault();
    console.log('🚀 Iniciando proceso de guardado de receta...');
    
    const id = document.getElementById('recetaId').value;
    const nombre = document.getElementById('nombreReceta').value;
    const categoria = document.getElementById('categoriaReceta').value;
    const costo = parseFloat(document.getElementById('costoVenta').value) || 0;
    const descripcion = document.getElementById('descripcionReceta').value;
    
    console.log('Datos básicos de la receta:', { id, nombre, categoria, costo, descripcion });
    
    // Validaciones básicas
    if (!nombre || nombre.trim() === '') {
        alert('El nombre de la receta es obligatorio');
        return;
    }
    
    if (!categoria || categoria.trim() === '') {
        alert('La categoría es obligatoria');
        return;
    }
    
    if (costo <= 0) {
        alert('El precio de venta debe ser mayor a 0');
        return;
    }
    
    // Recopilar ingredientes
    const ingredientes = recopilarIngredientesRecetas();
    
    if (ingredientes.length === 0) {
        alert('Debe agregar al menos un ingrediente a la receta');
        return;
    }
    
    console.log('Ingredientes recopilados:', ingredientes);
    
    // Separar ingredientes por tipo
    const insumos = ingredientes.filter(i => i.tipo === 'insumo');
    const insumos_compuestos = ingredientes.filter(i => i.tipo === 'compuesto');
    const insumos_elaborados = ingredientes.filter(i => i.tipo === 'elaborado');
    
    console.log('Ingredientes separados por tipo:', {
        insumos: insumos.length,
        insumos_compuestos: insumos_compuestos.length,
        insumos_elaborados: insumos_elaborados.length
    });
    
    // Estructura de datos para enviar al servidor
    const formData = {
        nombre: nombre.trim(),
        categoria: categoria.trim(),
        costo: parseFloat(costo.toFixed(2)),
        descripcion: descripcion.trim(),
        insumos: insumos,
        insumos_compuestos: insumos_compuestos,
        insumos_elaborados: insumos_elaborados
    };
    
    console.log('Datos finales a enviar:', formData);
    
    try {
        const url = id ? `/recetas/${id}/` : '/recetas/';
        const method = id ? 'PUT' : 'POST';
        
        console.log(`Enviando ${method} request a ${url}`);
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCsrfTokenRecetas()
            },
            body: JSON.stringify(formData)
        });
        
        console.log('Respuesta del servidor:', response.status, response.statusText);
        
        const data = await response.json();
        console.log('Datos de respuesta:', data);
        
        if (data.status === 'success') {
            alert(`Receta ${id ? 'actualizada' : 'creada'} exitosamente`);
            cerrarModalReceta();
            cargarRecetas();
        } else {
            console.error('Error del servidor:', data);
            alert('Error: ' + (data.message || 'Error desconocido en el servidor'));
        }
    } catch (error) {
        console.error('Error en la petición:', error);
        alert('Error de conexión al guardar la receta');
    }
}

// Cargar insumos para recetas
async function cargarTodosInsumosParaRecetas() {
    try {
        console.log('🔄 Cargando todos los insumos con costos...');
        
        // Cargar insumos simples CON COSTOS DESDE INSUMOS_PROVEEDORES
        try {
            const insumosResponse = await fetch('/insumos-para-receta/');
            if (insumosResponse.ok) {
                const data = await insumosResponse.json();
                if (data.status === 'success') {
                    recetasInsumosDisponibles = data.insumos || [];
                    console.log('✅ Insumos simples cargados:', recetasInsumosDisponibles.length);
                    
                    // Debug: Mostrar algunos ejemplos de costos
                    if (recetasInsumosDisponibles.length > 0) {
                        console.log('💰 Ejemplo de insumo simple con costo:', {
                            nombre: recetasInsumosDisponibles[0].nombre,
                            costo_unitario: recetasInsumosDisponibles[0].costo_unitario,
                            unidad: recetasInsumosDisponibles[0].unidad
                        });
                    }
                }
            }
        } catch (e) {
            console.warn('Error cargando insumos simples:', e);
        }

        // Cargar insumos compuestos CON COSTOS CALCULADOS
        try {
            const compuestosResponse = await fetch('/insumos-compuestos-para-receta/');
            if (compuestosResponse.ok) {
                const data = await compuestosResponse.json();
                if (data.status === 'success') {
                    recetasInsumosCompuestosDisponibles = data.insumos_compuestos || [];
                    console.log('✅ Insumos compuestos cargados:', recetasInsumosCompuestosDisponibles.length);
                    
                    // Debug: Mostrar algunos ejemplos de costos
                    if (recetasInsumosCompuestosDisponibles.length > 0) {
                        console.log('💰 Ejemplo de insumo compuesto con costo:', {
                            nombre: recetasInsumosCompuestosDisponibles[0].nombre,
                            costo_unitario: recetasInsumosCompuestosDisponibles[0].costo_unitario,
                            costo_total: recetasInsumosCompuestosDisponibles[0].costo_total,
                            cantidad: recetasInsumosCompuestosDisponibles[0].cantidad,
                            unidad: recetasInsumosCompuestosDisponibles[0].unidad
                        });
                    }
                }
            }
        } catch (e) {
            console.warn('Error cargando insumos compuestos:', e);
        }

        // Cargar insumos elaborados - YA FUNCIONA
        try {
            const elaboradosResponse = await fetch('/insumos-elaborados-para-recetas/');
            if (elaboradosResponse.ok) {
                const data = await elaboradosResponse.json();
                if (data.status === 'success') {
                    recetasInsumosElaboradosDisponibles = data.insumos_elaborados || [];
                    console.log('✅ Insumos elaborados cargados:', recetasInsumosElaboradosDisponibles.length);
                }
            }
        } catch (e) {
            console.warn('Error cargando insumos elaborados:', e);
            recetasInsumosElaboradosDisponibles = [];
        }

        console.log('✅ Todos los insumos cargados para recetas con costos correctos');
    } catch (error) {
        console.error('Error general cargando insumos:', error);
        // Usar arrays vacíos como respaldo
        recetasInsumosDisponibles = [];
        recetasInsumosCompuestosDisponibles = [];
        recetasInsumosElaboradosDisponibles = [];
    }
}

// Event listeners básicos
function configurarEventListenersBasicos() {
    const btnNuevaReceta = document.getElementById('btnNuevaReceta');
    if (btnNuevaReceta) {
        btnNuevaReceta.addEventListener('click', function() {
            console.log('Botón Nueva Receta clickeado');
            mostrarModalReceta();
        });
    }
    
    const searchReceta = document.getElementById('searchReceta');
    if (searchReceta) {
        searchReceta.addEventListener('input', filtrarRecetas);
    }
    
    const filterCategoria = document.getElementById('filterCategoriaReceta');
    if (filterCategoria) {
        filterCategoria.addEventListener('change', filtrarRecetas);
    }
}

// Cargar datos iniciales
async function cargarDatosIniciales() {
    await cargarTodosInsumosParaRecetas();
    await cargarRecetas();
    
    // Si existe la función del modal de detalles, asegurarse de que se cree el modal
    if (typeof window.crearModalDetalleRecetas === 'function') {
        try {
            console.log('Inicializando modal de detalles de recetas...');
            window.crearModalDetalleRecetas();
        } catch (error) {
            console.warn('Error al inicializar modal de detalles:', error);
        }
    }
}

// Filtrar recetas
function filtrarRecetas() {
    const searchTerm = document.getElementById('searchReceta')?.value.toLowerCase() || '';
    const categoria = document.getElementById('filterCategoriaReceta')?.value.toLowerCase() || '';
    
    const filas = document.querySelectorAll('#recetasTbody tr');
    
    filas.forEach(fila => {
        const nombre = fila.querySelector('td:first-child div')?.textContent.toLowerCase() || '';
        const categoriaFila = fila.querySelector('td:nth-child(2)')?.textContent.toLowerCase() || '';
        
        const coincideNombre = nombre.includes(searchTerm);
        const coincideCategoria = categoria === '' || categoriaFila.includes(categoria);
        
        fila.style.display = (coincideNombre && coincideCategoria) ? '' : 'none';
    });
}

// Utilidades
function capitalizarPrimeraLetra(string) {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Cargar recetas CON MANEJO DE ERRORES MEJORADO
async function cargarRecetas() {
    const tbody = document.getElementById('recetasTbody');
    
    if (!tbody) {
        console.error('No se encontró tbody de recetas');
        return;
    }
    
    try {
        console.log('🔄 Iniciando carga de recetas desde el servidor...');
        const response = await fetch('/recetas/');
        
        if (!response.ok) {
            throw new Error(`Error HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('✅ Respuesta del servidor recibida:', data);
        
        if (data.status === 'success') {
            mostrarRecetas(data.recetas);
        } else {
            throw new Error(data.message || 'Error desconocido del servidor');
        }
    } catch (error) {
        console.error('❌ Error cargando recetas:', error);
        tbody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; padding: 20px; color: #ef4444;">
                    <div style="margin-bottom: 8px;">
                        <i class="fa-solid fa-triangle-exclamation"></i> 
                        Error al cargar recetas
                    </div>
                    <div style="font-size: 0.9rem; color: #b91c1c;">
                        ${error.message}
                    </div>
                    <button onclick="cargarRecetas()" style="margin-top: 8px; background: #3b82f6; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
                        Reintentar
                    </button>
                </td>
            </tr>
        `;
    }
}

// Mostrar recetas en tabla
function mostrarRecetas(recetas) {
    const tbody = document.getElementById('recetasTbody');
    
    if (!tbody) return;
    
    if (!recetas || recetas.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; padding: 20px; color: #6b7280;">
                    No hay recetas registradas
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = recetas.map(receta => `
        <tr>
            <td style="padding: 16px; border-bottom: 1px solid #f3f4f6; background-color: white;">
                <div style="font-weight: 600; color: #000000;">${receta.nombre || 'Sin nombre'}</div>
            </td>
            <td style="padding: 16px; border-bottom: 1px solid #f3f4f6; background-color: white;">
                ${capitalizarPrimeraLetra(receta.categoria || 'Sin categoría')}
            </td>
            <td style="padding: 16px; border-bottom: 1px solid #f3f4f6; background-color: white; text-align: right;">
                <div style="font-weight: 500;">$${(receta.costo || 0).toFixed(2)}</div>
            </td>
            <td style="padding: 16px; border-bottom: 1px solid #f3f4f6; background-color: white; text-align: center;">
                <div style="display: flex; gap: 8px; justify-content: center;">
                    <button onclick="verDetalleReceta(${receta.id})" style="width: 32px; height: 32px; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; color: #6b7280; background: #f3f4f6; border: none; cursor: pointer;" title="Ver detalles">
                        <i class="fa-solid fa-list"></i>
                    </button>
                    <button onclick="editarReceta(${receta.id})" style="width: 32px; height: 32px; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; color: #3b82f6; background: #eff6ff; border: none; cursor: pointer;" title="Editar">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button onclick="eliminarReceta(${receta.id}, '${(receta.nombre || '').replace(/'/g, "\\'")}'))" style="width: 32px; height: 32px; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; color: #ef4444; background: #fef2f2; border: none; cursor: pointer;" title="Eliminar">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
    
    console.log(`✅ ${recetas.length} recetas mostradas en la tabla`);
}

// Funciones CRUD básicas (placeholders)
function editarReceta(id) {
    alert(`Editar receta ${id} - Funcionalidad en desarrollo`);
}

function eliminarReceta(id, nombre) {
    if (confirm(`¿Eliminar la receta "${nombre}"?`)) {
        alert(`Eliminar receta ${id} - Funcionalidad en desarrollo`);
    }
}

function verDetalleReceta(id) {
    console.log("Delegando verDetalleReceta a modal-detalles-recetas.js:", id);
    
    // Verificar si existe la función en el otro archivo
    if (typeof window.verDetalleReceta === 'function' && 
        window.verDetalleReceta !== verDetalleReceta) {
        // Llamar a la implementación del otro archivo
        window.verDetalleReceta(id);
    } else {
        // Crear el modal si no existe
        if (!document.getElementById('detalleRecetaModal')) {
            console.log('Modal de detalles no encontrado, creando uno...');
            crearModalDetalle();
        }
        
        // Mostrar mensaje de carga en el modal
        const detalleModal = document.getElementById('detalleRecetaModal');
        const detalleContent = document.getElementById('detalleRecetaContent');
        
        if (detalleModal && detalleContent) {
            detalleModal.style.display = 'flex';
            detalleContent.innerHTML = `
                <div style="text-align: center; padding: 40px;">
                    <i class="fa-solid fa-spinner fa-spin" style="font-size: 2rem; color: #3b82f6; margin-bottom: 16px;"></i>
                    <p style="color: #6b7280; margin: 0;">Cargando detalle de la receta...</p>
                </div>
            `;
            
            // Iniciar la carga de datos
            cargarDetalleReceta(id);
        } else {
            alert("Error: No se pudo mostrar el modal de detalles");
        }
    }
}

// Función auxiliar para cargar datos si no está disponible la del módulo específico
async function cargarDetalleReceta(id) {
    try {
        const response = await fetch(`/recetas/${id}/`);
        
        if (!response.ok) {
            throw new Error(`Error HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.status === 'success') {
            mostrarDetalleReceta(data.receta);
        } else {
            throw new Error(data.message || 'Error desconocido al cargar la receta');
        }
    } catch (error) {
        console.error('Error al cargar detalle de receta:', error);
        
        const detalleContent = document.getElementById('detalleRecetaContent');
        if (detalleContent) {
            detalleContent.innerHTML = `
                <div style="text-align: center; padding: 40px;">
                    <i class="fa-solid fa-exclamation-triangle" style="font-size: 2rem; color: #ef4444; margin-bottom: 16px;"></i>
                    <h3 style="color: #1f2937; margin-bottom: 8px;">Error al cargar la receta</h3>
                    <p style="color: #6b7280; margin-bottom: 20px;">${error.message}</p>
                    <button onclick="cerrarModalDetalle()" style="background: #3b82f6; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer;">
                        Cerrar
                    </button>
                </div>
            `;
        }
    }
}

// Mostrar detalle de receta con validaciones y manejo de errores
function mostrarDetalleReceta(receta) {
    // Si existe la versión en modal-detalles-recetas.js, delegamos a esa
    if (typeof window.mostrarDetalleReceta === 'function' && 
        window.mostrarDetalleReceta !== mostrarDetalleReceta) {
        window.mostrarDetalleReceta(receta);
        return;
    }
    
    const modal = document.getElementById('detalleRecetaModal');
    const title = document.getElementById('detalleRecetaTitle');
    const content = document.getElementById('detalleRecetaContent');
    
    if (!modal || !title || !content) {
        console.error('No se encontraron elementos del modal de detalle');
        alert('Error: No se pudo mostrar el detalle de la receta');
        return;
    }
    
    if (!receta) {
        console.error('No se recibieron datos de la receta');
        content.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #6b7280;">
                <i class="fa-solid fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 12px; display: block;"></i>
                <p style="margin: 0; font-size: 1.1rem;">No hay datos disponibles para esta receta.</p>
            </div>
        `;
        return;
    }
    
    title.textContent = `Receta: ${receta.nombre || 'Sin nombre'}`;
    
    // Calcular costos de manera segura
    let costoIngredientes = 0;
    
    // Insumos básicos
    if (receta.insumos && Array.isArray(receta.insumos)) {
        costoIngredientes += receta.insumos.reduce((total, insumo) => 
            total + (parseFloat(insumo.costo) || 0), 0);
    }
    
    // Insumos compuestos
    if (receta.insumos_compuestos && Array.isArray(receta.insumos_compuestos)) {
        costoIngredientes += receta.insumos_compuestos.reduce((total, insumo) => 
            total + (parseFloat(insumo.costo) || 0), 0);
    }
    
    // Insumos elaborados
    if (receta.insumos_elaborados && Array.isArray(receta.insumos_elaborados)) {
        costoIngredientes += receta.insumos_elaborados.reduce((total, insumo) => 
            total + (parseFloat(insumo.costo) || 0), 0);
    }
    
    const precioVenta = parseFloat(receta.costo) || 0;
    const utilidad = precioVenta - costoIngredientes;
    const porcentajeUtilidad = costoIngredientes > 0 ? ((utilidad / costoIngredientes) * 100) : 0;
    
    content.innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px;">
            <div style="background: #f8fafc; padding: 20px; border-radius: 12px; border-left: 4px solid #3b82f6;">
                <h3 style="color: #1f2937; margin: 0 0 16px 0; font-size: 1.25rem; display: flex; align-items: center; gap: 8px;">
                    <i class="fa-solid fa-info-circle" style="color: #3b82f6;"></i>
                    Información General
                </h3>
                <p style="margin: 8px 0; color: #4b5563;"><strong style="color: #1f2937;">Nombre:</strong> ${receta.nombre || 'Sin nombre'}</p>
                <p style="margin: 8px 0; color: #4b5563;"><strong style="color: #1f2937;">Categoría:</strong> ${capitalizarPrimeraLetra(receta.categoria || 'Sin categoría')}</p>
                <p style="margin: 8px 0; color: #4b5563;"><strong style="color: #1f2937;">Descripción:</strong> ${receta.descripcion || 'Sin descripción'}</p>
                ${receta.tiempo_preparacion ? `<p style="margin: 8px 0; color: #4b5563;"><strong style="color: #1f2937;">Tiempo:</strong> ${receta.tiempo_preparacion} minutos</p>` : ''}
                ${receta.porciones ? `<p style="margin: 8px 0; color: #4b5563;"><strong style="color: #1f2937;">Porciones:</strong> ${receta.porciones}</p>` : ''}
            </div>
            
            <div style="background: #f0f9ff; padding: 20px; border-radius: 12px; border-left: 4px solid #0ea5e9;">
                <h3 style="color: #1f2937; margin: 0 0 16px 0; font-size: 1.25rem; display: flex; align-items: center; gap: 8px;">
                    <i class="fa-solid fa-calculator" style="color: #0ea5e9;"></i>
                    Análisis de Costos
                </h3>
                <p style="margin: 8px 0; color: #4b5563;"><strong style="color: #1f2937;">Costo ingredientes:</strong> <span style="color: #dc2626; font-weight: 600;">$${costoIngredientes.toFixed(2)}</span></p>
                <p style="margin: 8px 0; color: #4b5563;"><strong style="color: #1f2937;">Precio de venta:</strong> <span style="color: #059669; font-weight: 600;">$${precioVenta.toFixed(2)}</span></p>
                <p style="margin: 8px 0; color: #4b5563;"><strong style="color: #1f2937;">Utilidad:</strong> <span style="color: ${utilidad >= 0 ? '#059669' : '#dc2626'}; font-weight: 600;">$${utilidad.toFixed(2)}</span></p>
                <p style="margin: 8px 0; color: #4b5563;"><strong style="color: #1f2937;">Margen:</strong> <span style="color: ${porcentajeUtilidad >= 0 ? '#059669' : '#dc2626'}; font-weight: 600;">${porcentajeUtilidad.toFixed(1)}%</span></p>
            </div>
        </div>
        
        <h3 style="color: #1f2937; margin: 0 0 16px 0; font-size: 1.25rem; display: flex; align-items: center; gap: 8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px;">
            <i class="fa-solid fa-list-ul" style="color: #6366f1;"></i>
            Ingredientes
        </h3>
        
        ${generarListaIngredientes(receta)}
    `;
    
    modal.style.display = 'flex';
}

// Generar lista de ingredientes mejorada
function generarListaIngredientes(receta) {
    let html = '';
    
    // Procesar insumos simples
    if (receta.insumos && Array.isArray(receta.insumos) && receta.insumos.length > 0) {
        html += '<h4 style="color: #059669; margin: 16px 0 12px 0; display: flex; align-items: center; gap: 8px;"><i class="fa-solid fa-cube"></i> Insumos Básicos:</h4>';
        html += '<div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 12px; margin-bottom: 16px;">';
        html += '<ul style="margin: 0; padding-left: 20px;">';
        
        receta.insumos.forEach(insumo => {
            const costo = parseFloat(insumo.costo) || 0;
            const cantidad = parseFloat(insumo.cantidad) || 0;
            const nombre = insumo.nombre || 'Insumo sin nombre';
            const unidad = insumo.unidad || 'unidad';
            
            html += `
                <li style="margin-bottom: 8px; color: #059669;">
                    <strong>${nombre}</strong> - 
                    ${cantidad.toFixed(2)} ${unidad} 
                    <span style="color: #16a34a; font-weight: 600;">($${costo.toFixed(2)})</span>
                </li>
            `;
        });
        
        html += '</ul></div>';
    }
    
    // Procesar insumos compuestos
    if (receta.insumos_compuestos && Array.isArray(receta.insumos_compuestos) && receta.insumos_compuestos.length > 0) {
        html += '<h4 style="color: #1e40af; margin: 16px 0 12px 0; display: flex; align-items: center; gap: 8px;"><i class="fa-solid fa-layer-group"></i> Insumos Compuestos:</h4>';
        html += '<div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 12px; margin-bottom: 16px;">';
        html += '<ul style="margin: 0; padding-left: 20px;">';
        
        receta.insumos_compuestos.forEach(insumo => {
            const costo = parseFloat(insumo.costo) || 0;
            const cantidad = parseFloat(insumo.cantidad) || 0;
            const nombre = insumo.nombre || 'Insumo compuesto sin nombre';
            const unidad = insumo.unidad || 'unidad';
            
            html += `
                <li style="margin-bottom: 8px; color: #1e40af;">
                    <strong>${nombre}</strong> - 
                    ${cantidad.toFixed(2)} ${unidad} 
                    <span style="color: #2563eb; font-weight: 600;">($${costo.toFixed(2)})</span>
                </li>
            `;
        });
        
        html += '</ul></div>';
    }
    
    // Procesar insumos elaborados
    if (receta.insumos_elaborados && Array.isArray(receta.insumos_elaborados) && receta.insumos_elaborados.length > 0) {
        html += '<h4 style="color: #ea580c; margin: 16px 0 12px 0; display: flex; align-items: center; gap: 8px;"><i class="fa-solid fa-fire-burner"></i> Insumos Elaborados:</h4>';
        html += '<div style="background: #fff7ed; border: 1px solid #fed7aa; border-radius: 8px; padding: 12px; margin-bottom: 16px;">';
        html += '<ul style="margin: 0; padding-left: 20px;">';
        
        receta.insumos_elaborados.forEach(insumo => {
            const costo = parseFloat(insumo.costo) || 0;
            const cantidad = parseFloat(insumo.cantidad) || 0;
            const nombre = insumo.nombre || 'Insumo elaborado sin nombre';
            const unidad = insumo.unidad || 'unidad';
            
            html += `
                <li style="margin-bottom: 8px; color: #ea580c;">
                    <strong>${nombre}</strong> - 
                    ${cantidad.toFixed(2)} ${unidad} 
                    <span style="color: #dc2626; font-weight: 600;">($${costo.toFixed(2)})</span>
                </li>
            `;
        });
        
        html += '</ul></div>';
    }
    
    // Si no hay ingredientes
    if (!html) {
        html = `
            <div style="text-align: center; padding: 40px; color: #6b7280;">
                <i class="fa-solid fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 12px; display: block;"></i>
                <p style="margin: 0; font-size: 1.1rem;">No hay ingredientes registrados para esta receta.</p>
            </div>
        `;
    }
    
    return html;
}

// Hacer funciones globales con nombres únicos para evitar conflictos
window.loadRecetasContent = loadRecetasContent;
window.mostrarModalReceta = mostrarModalReceta;
window.actualizarCamposIngredienteReceta = actualizarCamposIngredienteReceta;
window.calcularCostoIngredienteReceta = calcularCostoIngredienteReceta;
window.editarReceta = editarReceta;
window.eliminarReceta = eliminarReceta;
window.verDetalleReceta = verDetalleReceta;

console.log("✅ Módulo principal de recetas cargado y corregido");