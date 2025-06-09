/**
 * Modal para mostrar detalles de recetas
 * Maneja toda la funcionalidad de visualización detallada de recetas
 */

// Función para crear el modal de detalle si no existe
function crearModalDetalleRecetas() {
    if (document.getElementById('detalleRecetaModal')) {
        return; // Ya existe
    }
    
    const modalHTML = `
        <div id="detalleRecetaModal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; align-items: center; justify-content: center;">
            <div style="background: white; border-radius: 12px; width: 95%; max-width: 900px; max-height: 95vh; overflow-y: auto; position: relative; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);">
                <!-- Header del modal -->
                <div style="padding: 24px; border-bottom: 1px solid #e2e8f0; background: linear-gradient(90deg, #f8fafc 0%, #f1f5f9 100%); border-radius: 12px 12px 0 0;">
                    <h2 id="detalleRecetaTitle" style="margin: 0; color: #1e293b; font-size: 1.75rem; font-weight: 700; display: flex; align-items: center; gap: 12px;">
                        <i class="fa-solid fa-utensils" style="color: #3b82f6;"></i>
                        <span>Detalle de Receta</span>
                    </h2>
                    <button id="closeDetalleRecetaModal" style="position: absolute; right: 20px; top: 20px; background: none; border: none; font-size: 24px; cursor: pointer; color: #64748b; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: all 0.2s;" 
                        onmouseover="this.style.background='#fee2e2'; this.style.color='#dc2626'" 
                        onmouseout="this.style.background='none'; this.style.color='#64748b'">&times;</button>
                </div>
                
                <!-- Contenido del modal -->
                <div id="detalleRecetaContent" style="padding: 0;">
                    <!-- El contenido se llenará dinámicamente -->
                </div>
                
                <!-- Footer del modal -->
                <div style="padding: 20px 24px; border-top: 1px solid #e2e8f0; background: #f8fafc; display: flex; justify-content: flex-end; gap: 12px; border-radius: 0 0 12px 12px;">
                    <button type="button" id="cerrarDetalleRecetaBtn" style="background: #f1f5f9; color: #475569; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: 500; display: flex; align-items: center; gap: 8px;">
                        <i class="fa-solid fa-times"></i> Cerrar
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    configurarEventosModalDetalle();
}

// Configurar eventos del modal de detalle
function configurarEventosModalDetalle() {
    const closeBtn = document.getElementById('closeDetalleRecetaModal');
    const cerrarBtn = document.getElementById('cerrarDetalleRecetaBtn');
    const modal = document.getElementById('detalleRecetaModal');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', cerrarModalDetalleRecetas);
    }
    
    if (cerrarBtn) {
        cerrarBtn.addEventListener('click', cerrarModalDetalleRecetas);
    }
    
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target.id === 'detalleRecetaModal') {
                cerrarModalDetalleRecetas();
            }
        });
    }
}

// Función para cerrar el modal
function cerrarModalDetalleRecetas() {
    const modal = document.getElementById('detalleRecetaModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Función para validar y formatear valores numéricos de forma segura
function validarYFormatearNumero(valor, decimales = 2) {
    if (valor === null || valor === undefined || valor === '' || isNaN(valor)) {
        return '0.00';
    }
    
    const numero = parseFloat(valor);
    if (isNaN(numero)) {
        return '0.00';
    }
    
    return numero.toFixed(decimales);
}

// Función principal para mostrar el detalle de la receta CON VALIDACIÓN COMPLETA
function mostrarDetalleReceta(receta) {
    console.log('🔍 Mostrando detalle de receta:', receta);
    
    // Asegurar que el modal existe
    crearModalDetalleRecetas();
    
    const modal = document.getElementById('detalleRecetaModal');
    const title = document.getElementById('detalleRecetaTitle');
    const content = document.getElementById('detalleRecetaContent');
    
    if (!modal || !title || !content) {
        console.error('❌ No se encontraron elementos del modal de detalle');
        alert('Error: No se pudo abrir el modal de detalle');
        return;
    }
    
    // Validar que tengamos datos de receta
    if (!receta) {
        console.error('❌ No se proporcionaron datos de receta');
        alert('Error: No se encontraron datos de la receta');
        return;
    }
    
    // Actualizar título
    const nombreReceta = receta.nombre || 'Receta sin nombre';
    title.innerHTML = `
        <i class="fa-solid fa-utensils" style="color: #3b82f6;"></i>
        <span>${nombreReceta}</span>
    `;
    
    // Calcular costos de manera segura
    let costoTotalIngredientes = 0;
    let contadorIngredientes = 0;
    
    // Procesar insumos simples
    let insumosHTML = '';
    if (receta.insumos && Array.isArray(receta.insumos) && receta.insumos.length > 0) {
        insumosHTML = '<h4 style="color: #059669; margin: 16px 0 12px 0; display: flex; align-items: center; gap: 8px;"><i class="fa-solid fa-cube"></i> Insumos Básicos:</h4>';
        insumosHTML += '<div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 12px; margin-bottom: 16px;">';
        insumosHTML += '<ul style="margin: 0; padding-left: 20px;">';
        
        receta.insumos.forEach(insumo => {
            const costoValidado = parseFloat(insumo.costo) || 0;
            const cantidadValidada = parseFloat(insumo.cantidad) || 0;
            const nombreInsumo = insumo.nombre || 'Insumo sin nombre';
            const unidadInsumo = insumo.unidad || 'unidad';
            
            costoTotalIngredientes += costoValidado;
            contadorIngredientes++;
            
            insumosHTML += `
                <li style="margin-bottom: 8px; color: #059669;">
                    <strong>${nombreInsumo}</strong> - 
                    ${validarYFormatearNumero(cantidadValidada)} ${unidadInsumo} 
                    <span style="color: #16a34a; font-weight: 600;">($${validarYFormatearNumero(costoValidado)})</span>
                </li>
            `;
        });
        
        insumosHTML += '</ul></div>';
    }
    
    // Procesar insumos compuestos
    let compuestosHTML = '';
    if (receta.insumos_compuestos && Array.isArray(receta.insumos_compuestos) && receta.insumos_compuestos.length > 0) {
        compuestosHTML = '<h4 style="color: #1e40af; margin: 16px 0 12px 0; display: flex; align-items: center; gap: 8px;"><i class="fa-solid fa-layer-group"></i> Insumos Compuestos:</h4>';
        compuestosHTML += '<div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 12px; margin-bottom: 16px;">';
        compuestosHTML += '<ul style="margin: 0; padding-left: 20px;">';
        
        receta.insumos_compuestos.forEach(insumo => {
            const costoValidado = parseFloat(insumo.costo) || 0;
            const cantidadValidada = parseFloat(insumo.cantidad) || 0;
            const nombreInsumo = insumo.nombre || 'Insumo compuesto sin nombre';
            const unidadInsumo = insumo.unidad || 'unidad';
            
            costoTotalIngredientes += costoValidado;
            contadorIngredientes++;
            
            compuestosHTML += `
                <li style="margin-bottom: 8px; color: #1e40af;">
                    <strong>${nombreInsumo}</strong> - 
                    ${validarYFormatearNumero(cantidadValidada)} ${unidadInsumo} 
                    <span style="color: #2563eb; font-weight: 600;">($${validarYFormatearNumero(costoValidado)})</span>
                </li>
            `;
        });
        
        compuestosHTML += '</ul></div>';
    }
    
    // Procesar insumos elaborados
    let elaboradosHTML = '';
    if (receta.insumos_elaborados && Array.isArray(receta.insumos_elaborados)) {
        // Depuración adicional
        console.log('Procesando insumos elaborados:', receta.insumos_elaborados);
        
        if (receta.insumos_elaborados.length > 0) {
            elaboradosHTML = '<h4 style="color: #ea580c; margin: 16px 0 12px 0; display: flex; align-items: center; gap: 8px;"><i class="fa-solid fa-fire-burner"></i> Insumos Elaborados:</h4>';
            elaboradosHTML += '<div style="background: #fff7ed; border: 1px solid #fed7aa; border-radius: 8px; padding: 12px; margin-bottom: 16px;">';
            elaboradosHTML += '<ul style="margin: 0; padding-left: 20px;">';
            
            receta.insumos_elaborados.forEach(insumo => {
                // Depuración para ver la estructura exacta de cada insumo elaborado
                console.log('Procesando insumo elaborado:', insumo);
                
                const costoValidado = parseFloat(insumo.costo) || 0;
                const cantidadValidada = parseFloat(insumo.cantidad) || 0;
                const nombreInsumo = insumo.nombre || insumo.nombre_insumo || 'Insumo elaborado sin nombre';
                const unidadInsumo = insumo.unidad || 'unidad';
                
                costoTotalIngredientes += costoValidado;
                contadorIngredientes++;
                
                // Añadir información adicional sobre el costo unitario si está disponible
                const costoUnitario = insumo.costo_unitario ? 
                    `<small style="display: block; font-size: 0.8rem; color: #9ca3af;">Costo unitario: $${validarYFormatearNumero(insumo.costo_unitario)}/${unidadInsumo}</small>` : '';
                
                elaboradosHTML += `
                    <li style="margin-bottom: 12px; color: #ea580c;">
                        <strong>${nombreInsumo}</strong> - 
                        ${validarYFormatearNumero(cantidadValidada)} ${unidadInsumo} 
                        <span style="color: #dc2626; font-weight: 600;">($${validarYFormatearNumero(costoValidado)})</span>
                        ${costoUnitario}
                    </li>
                `;
            });
            
            elaboradosHTML += '</ul></div>';
        }
    }
    
    // Calcular análisis de costos - Mejorar obtención del precio
    let precioVenta = 0;
    
    // Verificar todas las posibles fuentes del precio de venta
    if (receta.costo !== undefined && receta.costo !== null) {
        precioVenta = parseFloat(receta.costo);
        console.log('✅ Precio obtenido de receta.costo:', precioVenta);
    } else if (receta.precio_venta !== undefined && receta.precio_venta !== null) {
        precioVenta = parseFloat(receta.precio_venta);
        console.log('✅ Precio obtenido de receta.precio_venta:', precioVenta);
    } else {
        // Si no hay precio disponible, calcular un precio sugerido (costo total + 30%)
        precioVenta = costoTotalIngredientes * 1.3;
        console.log('⚠️ Precio calculado automáticamente:', precioVenta);
    }
    
    // Asegurar que precioVenta sea un número válido
    precioVenta = isNaN(precioVenta) ? 0 : precioVenta;
    
    const utilidad = precioVenta - costoTotalIngredientes;
    const margenPorcentaje = costoTotalIngredientes > 0 ? ((utilidad / costoTotalIngredientes) * 100) : 0;
    
    // Determinar el estado de rentabilidad
    let estadoRentabilidad = '';
    let colorEstado = '';
    let iconoEstado = '';
    
    if (utilidad > 0) {
        estadoRentabilidad = 'Rentable';
        colorEstado = '#059669';
        iconoEstado = 'fa-solid fa-circle-check';
    } else if (utilidad === 0) {
        estadoRentabilidad = 'Sin ganancia';
        colorEstado = '#f59e0b';
        iconoEstado = 'fa-solid fa-circle-minus';
    } else {
        estadoRentabilidad = 'Con pérdidas';
        colorEstado = '#dc2626';
        iconoEstado = 'fa-solid fa-circle-xmark';
    }
    
    // Construir el contenido completo del modal
    content.innerHTML = `
        <div style="padding: 24px;">
            <!-- Información general -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 32px;">
                <div style="background: #f8fafc; padding: 20px; border-radius: 12px; border-left: 4px solid #3b82f6;">
                    <h3 style="color: #1f2937; margin: 0 0 16px 0; font-size: 1.25rem; display: flex; align-items: center; gap: 8px;">
                        <i class="fa-solid fa-info-circle" style="color: #3b82f6;"></i>
                        Información General
                    </h3>
                    <div style="space-y: 8px;">
                        <p style="margin: 8px 0; color: #4b5563;"><strong style="color: #1f2937;">Nombre:</strong> ${nombreReceta}</p>
                        <p style="margin: 8px 0; color: #4b5563;"><strong style="color: #1f2937;">Categoría:</strong> ${capitalizarPrimeraLetra(receta.categoria || 'Sin categoría')}</p>
                        <p style="margin: 8px 0; color: #4b5563;"><strong style="color: #1f2937;">Descripción:</strong> ${receta.descripcion || 'Sin descripción'}</p>
                        ${receta.tiempo_preparacion ? `<p style="margin: 8px 0; color: #4b5563;"><strong style="color: #1f2937;">Tiempo:</strong> ${receta.tiempo_preparacion} minutos</p>` : ''}
                        ${receta.porciones ? `<p style="margin: 8px 0; color: #4b5563;"><strong style="color: #1f2937;">Porciones:</strong> ${receta.porciones}</p>` : ''}
                    </div>
                </div>
                
                <div style="background: #f0f9ff; padding: 20px; border-radius: 12px; border-left: 4px solid #0ea5e9;">
                    <h3 style="color: #1f2937; margin: 0 0 16px 0; font-size: 1.25rem; display: flex; align-items: center; gap: 8px;">
                        <i class="fa-solid fa-calculator" style="color: #0ea5e9;"></i>
                        Análisis de Costos
                    </h3>
                    <div style="space-y: 8px;">
                        <p style="margin: 8px 0; color: #4b5563;"><strong style="color: #1f2937;">Costo ingredientes:</strong> <span style="color: #dc2626; font-weight: 600;">$${validarYFormatearNumero(costoTotalIngredientes)}</span></p>
                        <p style="margin: 8px 0; color: #4b5563;">
    <strong style="color: #1f2937;">Precio de venta:</strong> 
    <span style="color: #059669; font-weight: 600; font-size: 1.1rem;">$${validarYFormatearNumero(precioVenta)}</span>
    ${precioVenta === 0 ? 
        '<span style="display: inline-block; background: #fef2f2; color: #dc2626; font-size: 0.8rem; padding: 2px 6px; border-radius: 4px; margin-left: 8px;">Sin definir</span>' : 
        ''}
</p>
                        <p style="margin: 8px 0; color: #4b5563;"><strong style="color: #1f2937;">Utilidad:</strong> <span style="color: ${utilidad >= 0 ? '#059669' : '#dc2626'}; font-weight: 600;">$${validarYFormatearNumero(utilidad)}</span></p>
                        <p style="margin: 8px 0; color: #4b5563;"><strong style="color: #1f2937;">Margen:</strong> <span style="color: ${margenPorcentaje >= 0 ? '#059669' : '#dc2626'}; font-weight: 600;">${validarYFormatearNumero(margenPorcentaje, 1)}%</span></p>
                        <div style="margin-top: 12px; padding: 8px 12px; background: white; border-radius: 6px; border: 1px solid #e2e8f0;">
                            <span style="color: ${colorEstado}; font-weight: 600; display: flex; align-items: center; gap: 6px;">
                                <i class="${iconoEstado}"></i>
                                ${estadoRentabilidad}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Resumen de ingredientes -->
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                <h3 style="color: #1f2937; margin: 0 0 16px 0; font-size: 1.25rem; display: flex; align-items: center; gap: 8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px;">
                    <i class="fa-solid fa-list-ul" style="color: #6366f1;"></i>
                    Resumen de Ingredientes
                </h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px; margin-bottom: 16px;">
                    <div style="text-align: center; padding: 12px; background: #f8fafc; border-radius: 8px;">
                        <div style="font-size: 1.5rem; font-weight: 700; color: #1f2937;">${contadorIngredientes}</div>
                        <div style="font-size: 0.875rem; color: #6b7280;">Total ingredientes</div>
                    </div>
                    <div style="text-align: center; padding: 12px; background: #f8fafc; border-radius: 8px;">
                        <div style="font-size: 1.5rem; font-weight: 700; color: #dc2626;">$${validarYFormatearNumero(costoTotalIngredientes)}</div>
                        <div style="font-size: 0.875rem; color: #6b7280;">Costo total</div>
                    </div>
                    <div style="text-align: center; padding: 12px; background: #f8fafc; border-radius: 8px;">
                        <div style="font-size: 1.5rem; font-weight: 700; color: ${precioVenta > 0 ? '#059669' : '#ef4444'};">
        ${precioVenta > 0 ? '$' + validarYFormatearNumero(precioVenta) : 'No definido'}
    </div>
    <div style="font-size: 0.875rem; color: #6b7280;">Precio venta</div>
                    </div>
                </div>
            </div>
            
            <!-- Lista detallada de ingredientes -->
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px;">
                <h3 style="color: #1f2937; margin: 0 0 20px 0; font-size: 1.25rem; display: flex; align-items: center; gap: 8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px;">
                    <i class="fa-solid fa-ingredients" style="color: #10b981;"></i>
                    Ingredientes Detallados
                </h3>
                
                ${insumosHTML || compuestosHTML || elaboradosHTML ? 
                    `${insumosHTML}
                    ${compuestosHTML}
                    ${elaboradosHTML}` : 
                    '<div style="text-align: center; padding: 40px; color: #6b7280;"><i class="fa-solid fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 12px; display: block;"></i><p style="margin: 0; font-size: 1.1rem;">No hay ingredientes registrados para esta receta.</p></div>'
                }
            </div>
        </div>
    `;
    
    // Mostrar el modal
    modal.style.display = 'flex';
    console.log('✅ Modal de detalle mostrado correctamente');
}

// Función para cargar y mostrar el detalle de una receta
async function verDetalleReceta(id) {
    try {
        console.log(`🔍 Cargando detalle de receta con ID: ${id}`);
        
        // Mostrar indicador de carga
        const modal = document.getElementById('detalleRecetaModal');
        if (modal) {
            modal.style.display = 'flex';
            const content = document.getElementById('detalleRecetaContent');
            if (content) {
                content.innerHTML = `
                    <div style="padding: 60px; text-align: center;">
                        <i class="fa-solid fa-spinner fa-spin" style="font-size: 2rem; color: #3b82f6; margin-bottom: 16px;"></i>
                        <p style="color: #6b7280; margin: 0;">Cargando detalle de la receta...</p>
                    </div>
                `;
            }
        }
        
        const response = await fetch(`/recetas/${id}/`);
        
        if (!response.ok) {
            throw new Error(`Error HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('📋 Datos de receta recibidos:', data);
        
        // Añadir este bloque para verificar específicamente el precio de venta
        if (data.status === 'success') {
            console.log('💰 Precio de venta recibido:', {
                costo_directo: data.receta.costo,
                precio_venta: data.receta.precio_venta || data.receta.costo,
                tipo: typeof data.receta.costo,
                disponible: data.receta.hasOwnProperty('costo')
            });
            
            // Resto del código existente...
            mostrarDetalleReceta(data.receta);
        } else {
            throw new Error(data.message || 'Error desconocido del servidor');
        }
    } catch (error) {
        console.error('❌ Error al cargar detalle de receta:', error);
        
        // Mostrar error en el modal si está abierto
        const modal = document.getElementById('detalleRecetaModal');
        const content = document.getElementById('detalleRecetaContent');
        
        if (modal && content) {
            content.innerHTML = `
                <div style="padding: 60px; text-align: center;">
                    <i class="fa-solid fa-exclamation-triangle" style="font-size: 2rem; color: #ef4444; margin-bottom: 16px;"></i>
                    <h3 style="color: #1f2937; margin-bottom: 8px;">Error al cargar la receta</h3>
                    <p style="color: #6b7280; margin-bottom: 20px;">${error.message}</p>
                    <button onclick="cerrarModalDetalleRecetas()" style="background: #3b82f6; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer;">
                        Cerrar
                    </button>
                </div>
            `;
        } else {
            alert('Error al cargar los detalles de la receta: ' + error.message);
        }
    }
}

// Función auxiliar para capitalizar texto
function capitalizarPrimeraLetra(string) {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Exportar funciones al scope global
window.mostrarDetalleReceta = mostrarDetalleReceta;
window.verDetalleReceta = verDetalleReceta;
window.cerrarModalDetalleRecetas = cerrarModalDetalleRecetas;
window.crearModalDetalleRecetas = crearModalDetalleRecetas;

console.log("✅ Módulo de modal de detalles de recetas cargado correctamente");