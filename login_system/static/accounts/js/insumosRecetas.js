// Funciones para gestionar insumos en recetas

// Variable para mantener el conteo de insumos en una receta
let contadorInsumos = 0;
let contadorInsumosCompuestos = 0;

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
    costoUnitarioInfo.style.color = costoUnitario > 0 ? "#1e40af" : "#ef4444";
    
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

function mostrarCostoUnitario(index) {
    // Muestra el costo unitario de un insumo como ayuda visual
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

function mostrarCostoUnitarioCompuesto(index) {
    // Muestra el costo unitario de un insumo compuesto como ayuda visual
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

// Export functions to global scope
window.agregarInsumo = agregarInsumo;
window.agregarInsumoCompuesto = agregarInsumoCompuesto;
window.actualizarCamposInsumo = actualizarCamposInsumo;
window.calcularCostoInsumo = calcularCostoInsumo;
window.actualizarCamposInsumoCompuesto = actualizarCamposInsumoCompuesto;
window.calcularCostoInsumoCompuesto = calcularCostoInsumoCompuesto;
window.mostrarCostoUnitario = mostrarCostoUnitario;
window.mostrarCostoUnitarioCompuesto = mostrarCostoUnitarioCompuesto;

console.log("✅ Funciones de insumosRecetas.js cargadas y disponibles globalmente");
