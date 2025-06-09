// Funciones para gestionar insumos en recetas

// Variables globales para mantener listas de insumos
let contadorInsumos = 0;
let contadorInsumosCompuestos = 0;
let contadorInsumosElaborados = 0;  // Nueva variable para elaborados

// Usar window para acceder/modificar la variable global
if (typeof window.recetasInsumosElaboradosDisponibles === 'undefined') {
    window.recetasInsumosElaboradosDisponibles = [];
}

/**
 * Agrega un nuevo insumo al formulario de receta
 * @param {Object} insumoData - Datos del insumo si se está editando
 */
function agregarInsumo(insumoData = null) {
    const container = document.getElementById('insumosContainer');
    const index = contadorInsumos++;
    
    // Crear el elemento del insumo
    const insumoItem = document.createElement('div');
    insumoItem.className = 'insumo-item';
    insumoItem.style.cssText = 'margin-bottom: 16px; padding: 16px; background-color: #f8fafc; border-radius: 8px; position: relative; border: 1px solid #e2e8f0;';
    
    // HTML del insumo
    insumoItem.innerHTML = `
        <button type="button" class="btn-eliminar-insumo" style="position: absolute; right: 16px; top: 16px; background: none; border: none; color: #ef4444; cursor: pointer; font-size: 1rem;">
            <i class="fa-solid fa-times"></i>
        </button>
        <div style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 16px; align-items: end;">
            <div>
                <label for="insumoId${index}" style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151; font-size: 0.9rem;">Insumo</label>
                <select id="insumoId${index}" style="padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; width: 100%; font-size: 0.95rem;" onchange="actualizarCamposInsumo(${index})">
                    <option value="">Seleccionar insumo</option>
                    ${recetasInsumosDisponibles.map(insumo => 
                        `<option value="${insumo.id}" ${insumoData && insumoData.id == insumo.id ? 'selected' : ''}>${insumo.nombre}</option>`
                    ).join('')}
                </select>
                <div id="costoUnitarioInfo${index}" style="margin-top: 4px; font-size: 0.8rem; color: #6b7280; display: none;"></div>
            </div>
            <div>
                <label for="insumoUnidad${index}" style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151; font-size: 0.9rem;">Unidad</label>
                <input type="text" id="insumoUnidad${index}" readonly style="padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; width: 100%; font-size: 0.95rem; background-color: #f1f5f9;">
            </div>
            <div>
                <label for="insumoCantidad${index}" style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151; font-size: 0.9rem;">Cantidad</label>
                <input type="number" id="insumoCantidad${index}" min="0" step="0.01" style="padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; width: 100%; font-size: 0.95rem;" oninput="calcularCostoInsumo(${index})">
            </div>
            <div>
                <label for="insumoCosto${index}" style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151; font-size: 0.9rem;">Costo</label>
                <div style="position: relative;">
                    <span style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #64748b;">$</span>
                    <input type="number" id="insumoCosto${index}" readonly step="0.01" min="0" style="padding: 12px 12px 12px 24px; border: 1px solid #e2e8f0; border-radius: 8px; width: 100%; font-size: 0.95rem; background-color: #f1f5f9;">
                </div>
            </div>
        </div>
    `;
    
    container.appendChild(insumoItem);
    
    // Configurar botón de eliminar
    const deleteBtn = insumoItem.querySelector('.btn-eliminar-insumo');
    deleteBtn.addEventListener('click', () => {
        container.removeChild(insumoItem);
    });
    
    // Si hay datos, rellenar los campos
    if (insumoData) {
        document.getElementById(`insumoUnidad${index}`).value = insumoData.unidad || '';
        document.getElementById(`insumoCantidad${index}`).value = insumoData.cantidad || '';
        document.getElementById(`insumoCosto${index}`).value = insumoData.costo || '';
        
        // Mostrar costo unitario si existe en los datos de insumos disponibles
        const insumoSeleccionado = recetasInsumosDisponibles.find(i => i.id == insumoData.id);
        if (insumoSeleccionado && insumoSeleccionado.costo_unitario) {
            const costoUnitarioInfo = document.getElementById(`costoUnitarioInfo${index}`);
            costoUnitarioInfo.innerHTML = `<strong>$${insumoSeleccionado.costo_unitario.toFixed(2)}/${insumoData.unidad}</strong>`;
            costoUnitarioInfo.style.display = "block";
            costoUnitarioInfo.style.color = "#059669";
        }
    }
}

/**
 * Agrega un nuevo insumo compuesto al formulario de receta
 * @param {Object} insumoData - Datos del insumo compuesto si se está editando
 */
function agregarInsumoCompuesto(insumoData = null) {
    const container = document.getElementById('insumosCompuestosContainer');
    const index = contadorInsumosCompuestos++;
    
    // Crear el elemento del insumo compuesto
    const insumoItem = document.createElement('div');
    insumoItem.className = 'insumo-compuesto-item';
    insumoItem.style.cssText = 'margin-bottom: 16px; padding: 16px; background-color: #f0f7ff; border-radius: 8px; position: relative; border: 1px solid #dbeafe;';
    
    // HTML del insumo compuesto
    insumoItem.innerHTML = `
        <button type="button" class="btn-eliminar-insumo-compuesto" style="position: absolute; right: 16px; top: 16px; background: none; border: none; color: #ef4444; cursor: pointer; font-size: 1rem;">
            <i class="fa-solid fa-times"></i>
        </button>
        <div style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 16px; align-items: end;">
            <div>
                <label for="insumoCompuestoId${index}" style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151; font-size: 0.9rem;">Insumo Pre-preparado</label>
                <select id="insumoCompuestoId${index}" style="padding: 12px; border: 1px solid #dbeafe; border-radius: 8px; width: 100%; font-size: 0.95rem;" onchange="actualizarCamposInsumoCompuesto(${index})">
                    <option value="">Seleccionar insumo</option>
                    ${recetasInsumosCompuestosDisponibles.map(insumo => 
                        `<option value="${insumo.id}" ${insumoData && insumoData.id == insumo.id ? 'selected' : ''}>${insumo.nombre}</option>`
                    ).join('')}
                </select>
                <div id="costoUnitarioInfoCompuesto${index}" style="margin-top: 4px; font-size: 0.8rem; color: #6b7280; display: none;"></div>
            </div>
            <div>
                <label for="insumoCompuestoUnidad${index}" style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151; font-size: 0.9rem;">Unidad</label>
                <input type="text" id="insumoCompuestoUnidad${index}" readonly style="padding: 12px; border: 1px solid #dbeafe; border-radius: 8px; width: 100%; font-size: 0.95rem; background-color: #f0f7ff;">
            </div>
            <div>
                <label for="insumoCompuestoCantidad${index}" style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151; font-size: 0.9rem;">Cantidad</label>
                <input type="number" id="insumoCompuestoCantidad${index}" min="0" step="0.01" style="padding: 12px; border: 1px solid #dbeafe; border-radius: 8px; width: 100%; font-size: 0.95rem;" oninput="calcularCostoInsumoCompuesto(${index})">
            </div>
            <div>
                <label for="insumoCompuestoCosto${index}" style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151; font-size: 0.9rem;">Costo</label>
                <div style="position: relative;">
                    <span style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #64748b;">$</span>
                    <input type="number" id="insumoCompuestoCosto${index}" readonly step="0.01" min="0" style="padding: 12px 12px 12px 24px; border: 1px solid #dbeafe; border-radius: 8px; width: 100%; font-size: 0.95rem; background-color: #f0f7ff;">
                </div>
            </div>
        </div>
    `;
    
    container.appendChild(insumoItem);
    
    // Configurar botón de eliminar
    const deleteBtn = insumoItem.querySelector('.btn-eliminar-insumo-compuesto');
    deleteBtn.addEventListener('click', () => {
        container.removeChild(insumoItem);
    });
    
    // Si hay datos, rellenar los campos
    if (insumoData) {
        document.getElementById(`insumoCompuestoUnidad${index}`).value = insumoData.unidad || '';
        document.getElementById(`insumoCompuestoCantidad${index}`).value = insumoData.cantidad || '';
        document.getElementById(`insumoCompuestoCosto${index}`).value = insumoData.costo || '';
        
        // Mostrar costo unitario si existe en los datos de insumos compuestos disponibles
        const insumoSeleccionado = recetasInsumosCompuestosDisponibles.find(i => i.id == insumoData.id);
        if (insumoSeleccionado && insumoSeleccionado.costo) {
            const costoUnitarioInfo = document.getElementById(`costoUnitarioInfoCompuesto${index}`);
            costoUnitarioInfo.innerHTML = `<strong>$${insumoSeleccionado.costo.toFixed(2)}/${insumoData.unidad}</strong>`;
            costoUnitarioInfo.style.display = "block";
            costoUnitarioInfo.style.color = "#1e40af";
        }
    }
}

/**
 * Actualiza los campos de un insumo cuando se selecciona desde el dropdown
 */
function actualizarCamposInsumo(index) {
    const insumoSelect = document.getElementById(`insumoId${index}`);
    const unidadInput = document.getElementById(`insumoUnidad${index}`);
    const cantidadInput = document.getElementById(`insumoCantidad${index}`);
    const costoInput = document.getElementById(`insumoCosto${index}`);
    const costoUnitarioInfo = document.getElementById(`costoUnitarioInfo${index}`);
    
    if (!insumoSelect.value) {
        unidadInput.value = "";
        costoInput.value = "";
        costoUnitarioInfo.style.display = "none";
        return;
    }
    
    // Buscar el insumo seleccionado
    const insumoId = parseInt(insumoSelect.value);
    const insumoSeleccionado = recetasInsumosDisponibles.find(i => i.id === insumoId);
    
    if (!insumoSeleccionado) {
        console.error(`No se encontró el insumo con ID ${insumoId} en el array de insumos disponibles`);
        return;
    }
    
    const unidad = insumoSeleccionado.unidad;
    const costoUnitario = insumoSeleccionado.costo_unitario || 0;
    
    // Actualizar la unidad
    unidadInput.value = unidad;
    
    // Mostrar el costo unitario como información
    costoUnitarioInfo.innerHTML = `<strong>$${costoUnitario.toFixed(2)}/${unidad}</strong>`;
    costoUnitarioInfo.style.display = "block";
    costoUnitarioInfo.style.color = costoUnitario > 0 ? "#059669" : "#ef4444";
    
    // Calcular el costo si ya hay una cantidad
    if (cantidadInput.value) {
        calcularCostoInsumo(index);
    }
}

/**
 * Calcula el costo de un insumo basado en su cantidad y costo unitario
 */
function calcularCostoInsumo(index) {
    const insumoSelect = document.getElementById(`insumoId${index}`);
    const cantidadInput = document.getElementById(`insumoCantidad${index}`);
    const costoInput = document.getElementById(`insumoCosto${index}`);
    
    if (!insumoSelect.value || !cantidadInput.value) {
        costoInput.value = '';
        return;
    }
    
    // Obtener el insumo seleccionado
    const insumoId = parseInt(insumoSelect.value);
    const insumoSeleccionado = recetasInsumosDisponibles.find(i => i.id === insumoId);
    
    if (!insumoSeleccionado) {
        console.error(`No se encontró el insumo con ID ${insumoId} en el array de insumos disponibles`);
        return;
    }
    
    const costoUnitario = insumoSeleccionado.costo_unitario || 0;
    const cantidad = parseFloat(cantidadInput.value) || 0;
    
    // Calcular costo total: cantidad * costo unitario
    const costoTotal = cantidad * costoUnitario;
    
    // Actualizar el campo de costo
    costoInput.value = costoTotal.toFixed(2);
}

/**
 * Actualiza los campos de un insumo compuesto cuando se selecciona desde el dropdown
 */
function actualizarCamposInsumoCompuesto(index) {
    const insumoSelect = document.getElementById(`insumoCompuestoId${index}`);
    const unidadInput = document.getElementById(`insumoCompuestoUnidad${index}`);
    const cantidadInput = document.getElementById(`insumoCompuestoCantidad${index}`);
    const costoInput = document.getElementById(`insumoCompuestoCosto${index}`);
    const costoUnitarioInfo = document.getElementById(`costoUnitarioInfoCompuesto${index}`);
    
    if (!insumoSelect.value) {
        unidadInput.value = "";
        costoInput.value = "";
        costoUnitarioInfo.style.display = "none";
        return;
    }
    
    // Buscar el insumo compuesto seleccionado
    const insumoId = parseInt(insumoSelect.value);
    const insumoSeleccionado = recetasInsumosCompuestosDisponibles.find(i => i.id === insumoId);
    
    if (!insumoSeleccionado) {
        console.error(`No se encontró el insumo compuesto con ID ${insumoId}`);
        return;
    }
    
    const unidad = insumoSeleccionado.unidad;
    const costoUnitario = insumoSeleccionado.costo || 0;
    
    // Actualizar la unidad
    unidadInput.value = unidad;
    
    // Mostrar el costo unitario como información
    costoUnitarioInfo.innerHTML = `<strong>$${costoUnitario.toFixed(2)}/${unidad}</strong>`;
    costoUnitarioInfo.style.display = "block";
    costoUnitarioInfo.style.color = "#1e40af";
    
    // Calcular el costo si ya hay una cantidad
    if (cantidadInput.value) {
        calcularCostoInsumoCompuesto(index);
    }
}

/**
 * Calcula el costo de un insumo compuesto basado en su cantidad y costo
 */
function calcularCostoInsumoCompuesto(index) {
    const insumoSelect = document.getElementById(`insumoCompuestoId${index}`);
    const cantidadInput = document.getElementById(`insumoCompuestoCantidad${index}`);
    const costoInput = document.getElementById(`insumoCompuestoCosto${index}`);
    
    if (!insumoSelect.value || !cantidadInput.value) {
        costoInput.value = '';
        return;
    }
    
    // Obtener el insumo compuesto seleccionado
    const insumoId = parseInt(insumoSelect.value);
    const insumoSeleccionado = recetasInsumosCompuestosDisponibles.find(i => i.id === insumoId);
    
    if (!insumoSeleccionado) {
        console.error(`No se encontró el insumo compuesto con ID ${insumoId}`);
        return;
    }
    
    const costoUnitario = insumoSeleccionado.costo || 0;
    const cantidad = parseFloat(cantidadInput.value) || 0;
    
    // Calcular costo total: cantidad * costo unitario
    const costoTotal = cantidad * costoUnitario;
    
    // Actualizar el campo de costo
    costoInput.value = costoTotal.toFixed(2);
}

// NUEVO: Función para agregar un insumo elaborado al formulario de receta
function agregarInsumoElaborado(insumoData = null) {
    const container = document.getElementById('insumosElaboradosContainer');
    const index = contadorInsumosElaborados++;
    
    // Crear el elemento del insumo elaborado
    const insumoItem = document.createElement('div');
    insumoItem.className = 'insumo-elaborado-item';
    insumoItem.style.cssText = 'margin-bottom: 16px; padding: 16px; background-color: #fff7ed; border-radius: 8px; position: relative; border: 1px solid #fed7aa;';
    
    // HTML del insumo elaborado
    insumoItem.innerHTML = `
        <button type="button" class="btn-eliminar-insumo-elaborado" style="position: absolute; right: 16px; top: 16px; background: none; border: none; color: #ef4444; cursor: pointer; font-size: 1rem;">
            <i class="fa-solid fa-times"></i>
        </button>
        <div style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 16px; align-items: end;">
            <div>
                <label for="insumoElaboradoId${index}" style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151; font-size: 0.9rem;">Insumo Elaborado</label>
                <select id="insumoElaboradoId${index}" style="padding: 12px; border: 1px solid #fed7aa; border-radius: 8px; width: 100%; font-size: 0.95rem;" onchange="actualizarCamposInsumoElaborado(${index})">
                    <option value="">Seleccionar insumo elaborado</option>
                    ${recetasInsumosElaboradosDisponibles.map(insumo => 
                        `<option value="${insumo.id}" ${insumoData && insumoData.id == insumo.id ? 'selected' : ''}>${insumo.nombre}</option>`
                    ).join('')}
                </select>
                <div id="costoUnitarioInfoElaborado${index}" style="margin-top: 4px; font-size: 0.8rem; color: #6b7280; display: none;"></div>
            </div>
            <div>
                <label for="insumoElaboradoUnidad${index}" style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151; font-size: 0.9rem;">Unidad</label>
                <input type="text" id="insumoElaboradoUnidad${index}" readonly style="padding: 12px; border: 1px solid #fed7aa; border-radius: 8px; width: 100%; font-size: 0.95rem; background-color: #fff7ed;">
            </div>
            <div>
                <label for="insumoElaboradoCantidad${index}" style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151; font-size: 0.9rem;">Cantidad</label>
                <input type="number" id="insumoElaboradoCantidad${index}" min="0" step="0.01" style="padding: 12px; border: 1px solid #fed7aa; border-radius: 8px; width: 100%; font-size: 0.95rem;" oninput="calcularCostoInsumoElaborado(${index})">
            </div>
            <div>
                <label for="insumoElaboradoCosto${index}" style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151; font-size: 0.9rem;">Costo</label>
                <div style="position: relative;">
                    <span style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #64748b;">$</span>
                    <input type="number" id="insumoElaboradoCosto${index}" readonly step="0.01" min="0" style="padding: 12px 12px 12px 24px; border: 1px solid #fed7aa; border-radius: 8px; width: 100%; font-size: 0.95rem; background-color: #fff7ed;">
                </div>
            </div>
        </div>
    `;
    
    container.appendChild(insumoItem);
    
    // Configurar botón de eliminar
    const deleteBtn = insumoItem.querySelector('.btn-eliminar-insumo-elaborado');
    deleteBtn.addEventListener('click', () => {
        container.removeChild(insumoItem);
    });
    
    // Si hay datos, rellenar los campos
    if (insumoData) {
        document.getElementById(`insumoElaboradoUnidad${index}`).value = insumoData.unidad || '';
        document.getElementById(`insumoElaboradoCantidad${index}`).value = insumoData.cantidad || '';
        document.getElementById(`insumoElaboradoCosto${index}`).value = insumoData.costo || '';
        
        // Mostrar costo unitario si existe en los datos de insumos elaborados disponibles
        const insumoSeleccionado = recetasInsumosElaboradosDisponibles.find(i => i.id == insumoData.id);
        if (insumoSeleccionado && insumoSeleccionado.costo_unitario) {
            const costoUnitarioInfo = document.getElementById(`costoUnitarioInfoElaborado${index}`);
            costoUnitarioInfo.innerHTML = `<strong>$${insumoSeleccionado.costo_unitario.toFixed(2)}/${insumoData.unidad}</strong>`;
            costoUnitarioInfo.style.display = "block";
            costoUnitarioInfo.style.color = "#ea580c";
        }
    }
}

// NUEVO: Actualiza los campos de un insumo elaborado al seleccionarlo
function actualizarCamposInsumoElaborado(index) {
    const insumoSelect = document.getElementById(`insumoElaboradoId${index}`);
    const unidadInput = document.getElementById(`insumoElaboradoUnidad${index}`);
    const cantidadInput = document.getElementById(`insumoElaboradoCantidad${index}`);
    const costoInput = document.getElementById(`insumoElaboradoCosto${index}`);
    const costoUnitarioInfo = document.getElementById(`costoUnitarioInfoElaborado${index}`);
    
    if (!insumoSelect.value) {
        unidadInput.value = "";
        costoInput.value = "";
        costoUnitarioInfo.style.display = "none";
        return;
    }
    
    // Buscar el insumo elaborado seleccionado
    const insumoId = parseInt(insumoSelect.value);
    const insumoSeleccionado = recetasInsumosElaboradosDisponibles.find(i => i.id === insumoId);
    
    if (!insumoSeleccionado) {
        console.error(`No se encontró el insumo elaborado con ID ${insumoId}`);
        return;
    }
    
    const unidad = insumoSeleccionado.unidad;
    // Calcular costo unitario (costo total dividido por cantidad producida)
    const costoUnitario = insumoSeleccionado.cantidad > 0 
        ? insumoSeleccionado.costo_total / insumoSeleccionado.cantidad 
        : insumoSeleccionado.costo_total || 0;
    
    // Actualizar la unidad
    unidadInput.value = unidad;
    
    // Mostrar el costo unitario como información
    costoUnitarioInfo.innerHTML = `<strong>$${costoUnitario.toFixed(2)}/${unidad}</strong>`;
    costoUnitarioInfo.style.display = "block";
    costoUnitarioInfo.style.color = costoUnitario > 0 ? "#ea580c" : "#ef4444";
    
    // Calcular el costo si ya hay una cantidad
    if (cantidadInput.value) {
        calcularCostoInsumoElaborado(index);
    } else {
        // Si no hay cantidad aún, precargar con 1 para facilitar
        cantidadInput.value = "1";
        calcularCostoInsumoElaborado(index);
    }
}

// NUEVO: Calcula el costo de un insumo elaborado basado en su cantidad
function calcularCostoInsumoElaborado(index) {
    const insumoSelect = document.getElementById(`insumoElaboradoId${index}`);
    const cantidadInput = document.getElementById(`insumoElaboradoCantidad${index}`);
    const costoInput = document.getElementById(`insumoElaboradoCosto${index}`);
    
    if (!insumoSelect.value || !cantidadInput.value) {
        costoInput.value = '';
        return;
    }
    
    // Obtener el insumo elaborado seleccionado
    const insumoId = parseInt(insumoSelect.value);
    const insumoSeleccionado = recetasInsumosElaboradosDisponibles.find(i => i.id === insumoId);
    
    if (!insumoSeleccionado) {
        console.error(`No se encontró el insumo elaborado con ID ${insumoId}`);
        return;
    }
    
    // Calcular costo unitario (costo total dividido por cantidad producida)
    const costoUnitario = insumoSeleccionado.cantidad > 0 
        ? insumoSeleccionado.costo_total / insumoSeleccionado.cantidad 
        : insumoSeleccionado.costo_total || 0;
    
    const cantidad = parseFloat(cantidadInput.value) || 0;
    
    // Calcular costo total: cantidad * costo unitario
    const costoTotal = cantidad * costoUnitario;
    
    // Actualizar el campo de costo
    costoInput.value = costoTotal.toFixed(2);
}

// NUEVO: Mostrar el costo unitario de un insumo elaborado
function mostrarCostoUnitarioElaborado(index) {
    const insumoSelect = document.getElementById(`insumoElaboradoId${index}`);
    const costoUnitarioInfo = document.getElementById(`costoUnitarioInfoElaborado${index}`);
    
    if (!insumoSelect.value) {
        costoUnitarioInfo.style.display = "none";
        return;
    }
    
    const insumoId = parseInt(insumoSelect.value);
    const insumoSeleccionado = recetasInsumosElaboradosDisponibles.find(i => i.id === insumoId);
    
    if (insumoSeleccionado) {
        // Calcular costo unitario
        const costoUnitario = insumoSeleccionado.cantidad > 0 
            ? insumoSeleccionado.costo_total / insumoSeleccionado.cantidad 
            : insumoSeleccionado.costo_total || 0;
            
        const unidad = insumoSeleccionado.unidad;
        
        costoUnitarioInfo.innerHTML = `<strong>$${costoUnitario.toFixed(2)}/${unidad}</strong>`;
        costoUnitarioInfo.style.display = "block";
        costoUnitarioInfo.style.color = "#ea580c";
    }
}

// Función para mostrar el costo unitario de un insumo compuesto como ayuda visual
function mostrarCostoUnitarioCompuesto(index) {
    const insumoSelect = document.getElementById(`insumoCompuestoId${index}`);
    const costoUnitarioInfo = document.getElementById(`costoUnitarioInfoCompuesto${index}`);
    
    if (!insumoSelect.value) {
        costoUnitarioInfo.style.display = "none";
        return;
    }
    
    const insumoId = parseInt(insumoSelect.value);
    const insumoSeleccionado = recetasInsumosCompuestosDisponibles.find(i => i.id === insumoId);
    
    if (insumoSeleccionado && insumoSeleccionado.costo) {
        const costoUnitario = insumoSeleccionado.costo;
        const unidad = insumoSeleccionado.unidad;
        
        costoUnitarioInfo.innerHTML = `<strong>$${costoUnitario.toFixed(2)}/${unidad}</strong>`;
        costoUnitarioInfo.style.display = "block";
        costoUnitarioInfo.style.color = "#1e40af";
    }
}

// NUEVO: Mostrar el costo unitario de un insumo elaborado
function mostrarCostoUnitario(index) {
    const insumoSelect = document.getElementById(`insumoId${index}`);
    const costoUnitarioInfo = document.getElementById(`costoUnitarioInfo${index}`);
    
    if (!insumoSelect.value) {
        costoUnitarioInfo.style.display = "none";
        return;
    }
    
    const insumoId = parseInt(insumoSelect.value);
    const insumoSeleccionado = recetasInsumosDisponibles.find(i => i.id === insumoId);
    
    if (insumoSeleccionado && insumoSeleccionado.costo_unitario) {
        const costoUnitario = insumoSeleccionado.costo_unitario;
        const unidad = insumoSeleccionado.unidad;
        
        costoUnitarioInfo.innerHTML = `<strong>$${costoUnitario.toFixed(2)}/${unidad}</strong>`;
        costoUnitarioInfo.style.display = "block";
        costoUnitarioInfo.style.color = "#059669";
    }
}

// Export functions to global scope
window.agregarInsumo = agregarInsumo;
window.agregarInsumoCompuesto = agregarInsumoCompuesto;
window.actualizarCamposInsumo = actualizarCamposInsumo;
window.calcularCostoInsumo = calcularCostoInsumo;
window.actualizarCamposInsumoCompuesto = actualizarCamposInsumoCompuesto;
window.calcularCostoInsumoCompuesto = calcularCostoInsumoCompuesto;
window.agregarInsumoElaborado = agregarInsumoElaborado;
window.actualizarCamposInsumoElaborado = actualizarCamposInsumoElaborado;
window.calcularCostoInsumoElaborado = calcularCostoInsumoElaborado;
window.mostrarCostoUnitario = mostrarCostoUnitario;
window.mostrarCostoUnitarioCompuesto = mostrarCostoUnitarioCompuesto;
window.mostrarCostoUnitarioElaborado = mostrarCostoUnitarioElaborado;

console.log("✅ Funciones de insumosRecetas.js cargadas y disponibles globalmente");
