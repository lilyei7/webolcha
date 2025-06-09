/**
 * recetas-ingredientes.js
 * Gestión de ingredientes unificados para recetas
 */

let contadorIngredientes = 0;

// Función unificada para agregar ingredientes (simples, compuestos y elaborados)
function agregarIngredienteUnificado(ingrediente = null) {
    const container = document.getElementById('allIngredientesContainer');
    const ingredienteIndex = container.children.length;
    
    // Determinar el tipo del ingrediente si está siendo editado
    const tipoIngrediente = ingrediente ? (ingrediente.tipo || 'insumo') : 'insumo';
    
    // Crear opciones para insumos normales
    const opcionesInsumos = recetasInsumosDisponibles.map(insumo => 
        `<option value="${insumo.id}" 
            data-unidad="${insumo.unidad}" 
            data-costo="${insumo.costo_unitario || 0}"
            data-nombre="${insumo.nombre}"
            data-tipo="insumo"
            ${ingrediente && ingrediente.id == insumo.id && tipoIngrediente === 'insumo' ? 'selected' : ''}>
            🔹 ${insumo.nombre}
        </option>`
    ).join('');
    
    // Crear opciones para insumos compuestos
    const opcionesCompuestos = recetasInsumosCompuestosDisponibles.map(insumo => 
        `<option value="${insumo.id}" 
            data-unidad="${insumo.unidad}" 
            data-costo="${insumo.costo || 0}"
            data-nombre="${insumo.nombre}"
            data-tipo="insumo_compuesto"
            ${ingrediente && ingrediente.id == insumo.id && tipoIngrediente === 'insumo_compuesto' ? 'selected' : ''}>
            🔸 ${insumo.nombre} (Compuesto)
        </option>`
    ).join('');
    
    // Crear opciones para insumos elaborados
    const opcionesElaborados = recetasInsumosElaboradosDisponibles.map(insumo => 
        `<option value="${insumo.id}" 
            data-unidad="${insumo.unidad}" 
            data-costo="${insumo.cantidad > 0 ? (insumo.costo_total / insumo.cantidad) : insumo.costo_total || 0}"
            data-nombre="${insumo.nombre}"
            data-tipo="insumo_elaborado"
            ${ingrediente && ingrediente.id == insumo.id && tipoIngrediente === 'insumo_elaborado' ? 'selected' : ''}>
            🔻 ${insumo.nombre} (Elaborado)
        </option>`
    ).join('');
    
    // Color de fondo según tipo de ingrediente
    let bgColor = '#f8fafc'; // Color por defecto (gris claro)
    if (tipoIngrediente === 'insumo_compuesto') {
        bgColor = '#f0f7ff';  // Color azul claro para compuestos
    } else if (tipoIngrediente === 'insumo_elaborado') {
        bgColor = '#fff7ed';  // Color naranja claro para elaborados
    }
    
    // Crear el elemento del ingrediente
    const ingredienteItem = document.createElement('div');
    ingredienteItem.className = 'ingrediente-item';
    ingredienteItem.style.cssText = `margin-bottom: 16px; padding: 16px; background-color: ${bgColor}; border-radius: 8px; position: relative; border: 1px solid #e2e8f0;`;
    
    // HTML del ingrediente
    ingredienteItem.innerHTML = `
        <button type="button" class="btn-eliminar-ingrediente" style="position: absolute; right: 16px; top: 16px; background: none; border: none; color: #ef4444; cursor: pointer; font-size: 1rem;">
            <i class="fa-solid fa-times"></i>
        </button>
        <div style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 16px; align-items: end;">
            <div>
                <label for="ingredienteTipo${ingredienteIndex}" style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151; font-size: 0.9rem;">Ingrediente</label>
                <select id="ingredienteTipo${ingredienteIndex}" style="padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; width: 100%; font-size: 0.95rem;" onchange="actualizarCamposIngrediente(${ingredienteIndex})">
                    <optgroup label="Insumos Básicos">
                        ${opcionesInsumos}
                    </optgroup>
                    <optgroup label="Insumos Compuestos">
                        ${opcionesCompuestos}
                    </optgroup>
                    <optgroup label="Insumos Elaborados">
                        ${opcionesElaborados}
                    </optgroup>
                </select>
                <div id="ingredienteCostoUnitarioInfo${ingredienteIndex}" style="margin-top: 4px; font-size: 0.8rem; color: #6b7280; display: none;"></div>
            </div>
            <div>
                <label for="ingredienteUnidad${ingredienteIndex}" style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151; font-size: 0.9rem;">Unidad</label>
                <input type="text" id="ingredienteUnidad${ingredienteIndex}" readonly style="padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; width: 100%; font-size: 0.95rem; background-color: #f1f5f9;">
                <input type="hidden" id="ingredienteTipoValor${ingredienteIndex}">
            </div>
            <div>
                <label for="ingredienteCantidad${ingredienteIndex}" style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151; font-size: 0.9rem;">Cantidad</label>
                <input type="number" id="ingredienteCantidad${ingredienteIndex}" min="0" step="0.01" style="padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; width: 100%; font-size: 0.95rem;" oninput="calcularCostoIngrediente(${ingredienteIndex})">
            </div>
            <div>
                <label for="ingredienteCosto${ingredienteIndex}" style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151; font-size: 0.9rem;">Costo</label>
                <div style="position: relative;">
                    <span style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #64748b;">$</span>
                    <input type="number" id="ingredienteCosto${ingredienteIndex}" readonly step="0.01" min="0" style="padding: 12px 12px 12px 24px; border: 1px solid #e2e8f0; border-radius: 8px; width: 100%; font-size: 0.95rem; background-color: #f1f5f9;">
                </div>
            </div>
        </div>
    `;
    
    container.appendChild(ingredienteItem);
    
    // Configurar botón de eliminar
    const deleteBtn = ingredienteItem.querySelector('.btn-eliminar-ingrediente');
    deleteBtn.addEventListener('click', () => {
        container.removeChild(ingredienteItem);
        actualizarCostoTotalReceta();
    });
    
    // Si hay datos, rellenar los campos
    if (ingrediente) {
        document.getElementById(`ingredienteUnidad${ingredienteIndex}`).value = ingrediente.unidad || '';
        document.getElementById(`ingredienteCantidad${ingredienteIndex}`).value = ingrediente.cantidad || '';
        document.getElementById(`ingredienteCosto${ingredienteIndex}`).value = ingrediente.costo || '';
        document.getElementById(`ingredienteTipoValor${ingredienteIndex}`).value = tipoIngrediente;
        
        // Mostrar costo unitario
        const infoElement = document.getElementById(`ingredienteCostoUnitarioInfo${ingredienteIndex}`);
        let costoBase = 0;
        
        if (tipoIngrediente === 'insumo') {
            const insumoSeleccionado = recetasInsumosDisponibles.find(i => i.id == ingrediente.id);
            costoBase = insumoSeleccionado?.costo_unitario || 0;
        } else if (tipoIngrediente === 'insumo_compuesto') {
            const insumoSeleccionado = recetasInsumosCompuestosDisponibles.find(i => i.id == ingrediente.id);
            costoBase = insumoSeleccionado?.costo || 0;
        } else if (tipoIngrediente === 'insumo_elaborado') {
            const insumoSeleccionado = recetasInsumosElaboradosDisponibles.find(i => i.id == ingrediente.id);
            costoBase = insumoSeleccionado?.cantidad > 0 ? 
                (insumoSeleccionado.costo_total / insumoSeleccionado.cantidad) : 
                insumoSeleccionado?.costo_total || 0;
        }
        
        mostrarInfoCostoUnitario(costoBase, ingrediente.unidad, infoElement, tipoIngrediente);
    }
    
    // Actualizar el costo total
    actualizarCostoTotalReceta();
}

// Agregar ingrediente
function agregarIngrediente(ingrediente = null) {
    const container = document.getElementById('ingredientesContainer');
    const index = contadorIngredientes++;
    
    const div = document.createElement('div');
    div.className = 'ingrediente-item';
    div.style.cssText = 'margin-bottom: 16px; padding: 16px; background-color: #f8fafc; border-radius: 8px; position: relative; border: 1px solid #e2e8f0;';
    
    div.innerHTML = `
        <button type="button" class="btn-eliminar-ingrediente" style="position: absolute; right: 16px; top: 16px; background: none; border: none; color: #ef4444; cursor: pointer;">
            <i class="fa-solid fa-times"></i>
        </button>
        <div style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 16px; align-items: end;">
            <div>
                <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">Ingrediente</label>
                <select id="ingredienteTipo${index}" style="padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; width: 100%;" onchange="actualizarCamposIngrediente(${index})">
                    <option value="">Seleccionar ingrediente</option>
                    ${generarOpcionesIngredientes(ingrediente)}
                </select>
                <div id="ingredienteCostoInfo${index}" style="margin-top: 4px; font-size: 0.8rem; color: #6b7280; display: none;"></div>
            </div>
            <div>
                <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">Unidad</label>
                <input type="text" id="ingredienteUnidad${index}" readonly style="padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; width: 100%; background-color: #f1f5f9;">
                <input type="hidden" id="ingredienteTipoValor${index}">
            </div>
            <div>
                <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">Cantidad</label>
                <input type="number" id="ingredienteCantidad${index}" min="0" step="0.01" style="padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; width: 100%;" oninput="calcularCostoIngrediente(${index})">
            </div>
            <div>
                <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">Costo</label>
                <div style="position: relative;">
                    <span style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #64748b;">$</span>
                    <input type="number" id="ingredienteCosto${index}" readonly step="0.01" min="0" style="padding: 12px 12px 12px 24px; border: 1px solid #e2e8f0; border-radius: 8px; width: 100%; background-color: #f1f5f9;">
                </div>
            </div>
        </div>
    `;
    
    container.appendChild(div);
    
    // Configurar botón eliminar
    div.querySelector('.btn-eliminar-ingrediente').addEventListener('click', () => {
        container.removeChild(div);
    });
    
    // Si hay datos, llenar campos
    if (ingrediente) {
        document.getElementById(`ingredienteUnidad${index}`).value = ingrediente.unidad || '';
        document.getElementById(`ingredienteCantidad${index}`).value = ingrediente.cantidad || '';
        document.getElementById(`ingredienteCosto${index}`).value = ingrediente.costo || '';
    }
}

// Generar opciones de ingredientes
function generarOpcionesIngredientes(ingredienteSeleccionado = null) {
    let html = '';
    
    // Insumos básicos
    if (recetasInsumosDisponibles.length > 0) {
        html += '<optgroup label="Insumos Básicos">';
        recetasInsumosDisponibles.forEach(insumo => {
            const selected = ingredienteSeleccionado && ingredienteSeleccionado.id == insumo.id && ingredienteSeleccionado.tipo === 'insumo' ? 'selected' : '';
            html += `<option value="${insumo.id}" data-tipo="insumo" data-unidad="${insumo.unidad}" data-costo="${insumo.costo_unitario || 0}" ${selected}>🔹 ${insumo.nombre}</option>`;
        });
        html += '</optgroup>';
    }
    
    // Insumos compuestos
    if (recetasInsumosCompuestosDisponibles.length > 0) {
        html += '<optgroup label="Insumos Compuestos">';
        recetasInsumosCompuestosDisponibles.forEach(insumo => {
            const selected = ingredienteSeleccionado && ingredienteSeleccionado.id == insumo.id && ingredienteSeleccionado.tipo === 'compuesto' ? 'selected' : '';
            html += `<option value="${insumo.id}" data-tipo="compuesto" data-unidad="${insumo.unidad}" data-costo="${insumo.costo || 0}" ${selected}>🔸 ${insumo.nombre}</option>`;
        });
        html += '</optgroup>';
    }
    
    // Insumos elaborados
    if (recetasInsumosElaboradosDisponibles.length > 0) {
        html += '<optgroup label="Insumos Elaborados">';
        recetasInsumosElaboradosDisponibles.forEach(insumo => {
            const costoUnitario = insumo.cantidad > 0 ? (insumo.costo_total / insumo.cantidad) : insumo.costo_total || 0;
            const selected = ingredienteSeleccionado && ingredienteSeleccionado.id == insumo.id && ingredienteSeleccionado.tipo === 'elaborado' ? 'selected' : '';
            html += `<option value="${insumo.id}" data-tipo="elaborado" data-unidad="${insumo.unidad}" data-costo="${costoUnitario}" ${selected}>🔻 ${insumo.nombre}</option>`;
        });
        html += '</optgroup>';
    }
    
    return html;
}

// Actualiza los campos de un ingrediente cuando se selecciona desde el dropdown
function actualizarCamposIngrediente(index) {
    const ingredienteSelect = document.getElementById(`ingredienteTipo${index}`);
    const unidadInput = document.getElementById(`ingredienteUnidad${index}`);
    const cantidadInput = document.getElementById(`ingredienteCantidad${index}`);
    const costoInput = document.getElementById(`ingredienteCosto${index}`);
    const tipoInput = document.getElementById(`ingredienteTipoValor${index}`);
    const costoUnitarioInfo = document.getElementById(`ingredienteCostoUnitarioInfo${index}`);
    
    if (!ingredienteSelect.value) {
        unidadInput.value = "";
        tipoInput.value = "";
        costoInput.value = "";
        costoUnitarioInfo.style.display = "none";
        return;
    }
    
    const selectedOption = ingredienteSelect.options[ingredienteSelect.selectedIndex];
    const tipo = selectedOption.getAttribute('data-tipo');
    const unidad = selectedOption.getAttribute('data-unidad');
    const costoBase = parseFloat(selectedOption.getAttribute('data-costo')) || 0;
    
    // Actualizar la unidad y el tipo
    unidadInput.value = unidad;
    tipoInput.value = tipo;
    
    // Cambiar el color de fondo según el tipo de ingrediente
    const ingredienteItem = ingredienteSelect.closest('.ingrediente-item');
    if (tipo === 'insumo_compuesto') {
        ingredienteItem.style.backgroundColor = '#f0f7ff';
    } else if (tipo === 'insumo_elaborado') {
        ingredienteItem.style.backgroundColor = '#fff7ed';
    } else {
        ingredienteItem.style.backgroundColor = '#f8fafc';
    }
    
    // Mostrar el costo unitario como información
    mostrarInfoCostoUnitario(costoBase, unidad, costoUnitarioInfo, tipo);
    
    // Calcular el costo si ya hay una cantidad
    if (cantidadInput.value) {
        calcularCostoIngrediente(index);
    } else {
        // Si no hay cantidad, sugerir 1 por defecto
        cantidadInput.value = "1";
        calcularCostoIngrediente(index);
    }
}

// Calcula el costo de un ingrediente basado en su cantidad y costo unitario
function calcularCostoIngrediente(index) {
    const ingredienteSelect = document.getElementById(`ingredienteTipo${index}`);
    const cantidadInput = document.getElementById(`ingredienteCantidad${index}`);
    const costoInput = document.getElementById(`ingredienteCosto${index}`);
    
    if (!ingredienteSelect.value || !cantidadInput.value) {
        costoInput.value = '';
        actualizarCostoTotalReceta();
        return;
    }
    
    const selectedOption = ingredienteSelect.options[ingredienteSelect.selectedIndex];
    const costoBase = parseFloat(selectedOption.getAttribute('data-costo')) || 0;
    const cantidad = parseFloat(cantidadInput.value) || 0;
    
    // Calcular costo total: cantidad * costo unitario
    const costoTotal = cantidad * costoBase;
    
    // Actualizar el campo de costo
    costoInput.value = costoTotal.toFixed(2);
    
    // Actualizar el costo total de la receta
    actualizarCostoTotalReceta();
}

// Función para mostrar información del costo unitario con colores diferentes según el tipo
function mostrarInfoCostoUnitario(costoBase, unidad, infoElement, tipo) {
    if (!costoBase || costoBase <= 0) {
        infoElement.innerHTML = `<span style="color: #ef4444;">⚠️ Sin costo definido</span>`;
        infoElement.style.display = "block";
        return;
    }
    
    let color = "#059669";  // Verde para insumos simples
    if (tipo === 'insumo_compuesto') {
        color = "#1e40af";  // Azul para compuestos
    } else if (tipo === 'insumo_elaborado') {
        color = "#ea580c";  // Naranja para elaborados
    }
    
    infoElement.innerHTML = `<strong style="color: ${color};">$${costoBase.toFixed(2)}/${unidad}</strong>`;
    infoElement.style.display = "block";
}

// Función para actualizar el costo total de la receta
function actualizarCostoTotalReceta() {
    const costoVentaInput = document.getElementById('costoVenta');
    if (!costoVentaInput) return;
    
    // Obtener todos los ingredientes y sumar sus costos
    const costoTotal = Array.from(document.querySelectorAll('[id^="ingredienteCosto"]'))
        .reduce((sum, input) => sum + (parseFloat(input.value) || 0), 0);
    
    // Si no hay un precio ya definido, sugerir un precio basado en el costo
    // con un margen del 50%
    if (!costoVentaInput.value || parseFloat(costoVentaInput.value) === 0) {
        const precioSugerido = costoTotal * 1.5;
        costoVentaInput.value = precioSugerido.toFixed(2);
    }
}

// Recopilar ingredientes del formulario
function recopilarIngredientes() {
    const ingredientes = [];
    const items = document.querySelectorAll('.ingrediente-item');
    
    items.forEach((item, index) => {
        const select = item.querySelector(`select[id^="ingredienteTipo"]`);
        const unidadInput = item.querySelector(`input[id^="ingredienteUnidad"]`);
        const cantidadInput = item.querySelector(`input[id^="ingredienteCantidad"]`);
        const costoInput = item.querySelector(`input[id^="ingredienteCosto"]`);
        const tipoInput = item.querySelector(`input[id^="ingredienteTipoValor"]`);
        
        if (select.value && cantidadInput.value && parseFloat(cantidadInput.value) > 0) {
            ingredientes.push({
                id: parseInt(select.value),
                nombre: select.options[select.selectedIndex].text.replace(/^[🔹🔸🔻]\s*/, ''),
                tipo: tipoInput.value,
                unidad: unidadInput.value,
                cantidad: parseFloat(cantidadInput.value),
                costo: parseFloat(costoInput.value) || 0
            });
        }
    });
    
    return ingredientes;
}

// Exportar funciones
window.agregarIngredienteUnificado = agregarIngredienteUnificado;
window.agregarIngrediente = agregarIngrediente;
window.actualizarCamposIngrediente = actualizarCamposIngrediente;
window.calcularCostoIngrediente = calcularCostoIngrediente;
window.mostrarInfoCostoUnitario = mostrarInfoCostoUnitario;
window.actualizarCostoTotalReceta = actualizarCostoTotalReceta;
window.recopilarIngredientes = recopilarIngredientes;

console.log("✅ Módulo de ingredientes para recetas cargado");