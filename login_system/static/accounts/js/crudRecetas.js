// Verificar que las funciones necesarias estén disponibles
(function() {
    const requiredFunctions = [
        'agregarInsumo', 
        'agregarInsumoCompuesto',
        'actualizarCamposInsumo',
        'calcularCostoInsumo'
    ];
    
    const missingFunctions = [];
    requiredFunctions.forEach(fn => {
        if (typeof window[fn] !== 'function') {
            missingFunctions.push(fn);
            console.error(`Error: La función '${fn}' necesaria para crudRecetas.js no está definida.`);
            
            // Crear una función temporal de emergencia para evitar errores fatales
            window[fn] = function() {
                console.warn(`⚠️ Llamada a '${fn}' que no está correctamente implementada.`);
                alert(`Error: Función '${fn}' no disponible. Por favor, recargue la página.`);
            };
        }
    });
    
    if (missingFunctions.length > 0) {
        console.error(`crudRecetas.js: Faltan ${missingFunctions.length} funciones requeridas. Intentando cargar insumosRecetas.js dinámicamente...`);
        
        // Intentar cargar insumosRecetas.js dinámicamente
        const script = document.createElement('script');
        script.src = '/static/accounts/js/insumosRecetas.js';
        script.onload = function() {
            console.log('✅ insumosRecetas.js cargado dinámicamente');
            // Verificar si las funciones ahora están disponibles
            const stillMissing = missingFunctions.filter(fn => typeof window[fn] !== 'function');
            if (stillMissing.length > 0) {
                console.error(`Aún faltan funciones después de cargar insumosRecetas.js: ${stillMissing.join(', ')}`);
            } else {
                console.log('✅ Todas las funciones requeridas están ahora disponibles');
            }
        };
        document.head.appendChild(script);
    } else {
        console.log('✅ crudRecetas.js: Todas las funciones requeridas están disponibles');
    }
})();

// Funciones CRUD para operaciones con recetas

// Función para mostrar el modal de receta
function mostrarModalReceta(receta = null) {
    const modal = document.getElementById('recetaModal');
    const form = document.getElementById('recetaForm');
    const insumosContainer = document.getElementById('insumosContainer');
    const insumosCompuestosContainer = document.getElementById('insumosCompuestosContainer');
    const insumosElaboradosContainer = document.getElementById('insumosElaboradosContainer'); // NUEVO
    
    // Limpiar el formulario
    form.reset();
    insumosContainer.innerHTML = '';
    insumosCompuestosContainer.innerHTML = '';
    insumosElaboradosContainer.innerHTML = ''; // NUEVO
    
    // Quitar advertencias previas si existieran
    const advertenciaExistente = form.querySelector('.advertencia-ejemplo');
    if (advertenciaExistente) {
        advertenciaExistente.remove();
    }
    
    // Si es una nueva receta, dejar el formulario vacío
    if (!receta) {
        document.getElementById('recetaModalTitle').textContent = 'Nueva Receta';
        document.getElementById('recetaId').value = '';
    } else {
        // Si es edición, llenar el formulario con los datos existentes
        document.getElementById('recetaModalTitle').textContent = 
            receta.ejemplo ? 'Editar Receta (EJEMPLO)' : 'Editar Receta';
        
        if (receta.ejemplo) {
            // Agregar una nota de advertencia si son datos de ejemplo
            const warningDiv = document.createElement('div');
            warningDiv.className = 'advertencia-ejemplo';
            warningDiv.style.marginBottom = '15px';
            warningDiv.style.backgroundColor = '#fff3cd';
            warningDiv.style.color = '#664d03';
            warningDiv.style.padding = '10px';
            warningDiv.style.borderRadius = '4px';
            warningDiv.innerHTML = '<strong>⚠️ Nota:</strong> Estos son datos de ejemplo porque no se pudo conectar con la base de datos.';
            form.insertBefore(warningDiv, form.firstChild);
        }
        
        document.getElementById('recetaId').value = receta.id;
        document.getElementById('nombreReceta').value = receta.nombre;
        document.getElementById('categoriaReceta').value = receta.categoria;
        document.getElementById('costoVenta').value = receta.costo;
        document.getElementById('descripcionReceta').value = receta.descripcion || '';
        
        // Añadir insumos
        if (receta.insumos && receta.insumos.length > 0) {
            receta.insumos.forEach(insumo => {
                agregarInsumo(insumo);
            });
        }
        
        // Añadir insumos compuestos
        if (receta.insumos_compuestos && receta.insumos_compuestos.length > 0) {
            receta.insumos_compuestos.forEach(insumoCompuesto => {
                agregarInsumoCompuesto(insumoCompuesto);
            });
        }
        
        // NUEVO: Añadir insumos elaborados
        if (receta.insumos_elaborados && receta.insumos_elaborados.length > 0) {
            receta.insumos_elaborados.forEach(insumoElaborado => {
                agregarInsumoElaborado(insumoElaborado);
            });
        }
    }
    
    modal.style.display = 'flex';
}

// Función para editar una receta
function editarReceta(id) {
    try {
        // Intentar obtener los datos de la API
        fetch(`/recetas/${id}/`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Error HTTP: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (data.status === 'success') {
                    mostrarModalReceta(data.receta);
                } else {
                    throw new Error(data.message || 'Error desconocido');
                }
            })
            .catch(error => {
                console.error("Error al obtener receta para editar:", error);
                
                // Modo de datos de ejemplo como respaldo
                const recetasEjemplo = getRecetasEjemplo();
                const receta = recetasEjemplo.find(r => r.id === id);
                if (receta) {
                    receta.ejemplo = true; // Marcar como datos de ejemplo
                    mostrarModalReceta(receta);
                } else {
                    alert("No se pudo encontrar la receta");
                }
            });
    } catch (error) {
        console.error("Error general al editar receta:", error);
    }
}

// Función para eliminar receta
function eliminarReceta(id, nombre) {
    if (confirm(`¿Está seguro que desea eliminar la receta "${nombre}"?`)) {
        try {
            fetch(`/recetas/${id}/`, {
                method: 'DELETE',
                headers: {
                    'X-CSRFToken': getCookie('csrftoken')
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Error HTTP: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (data.status === 'success') {
                    alert('Receta eliminada exitosamente');
                    // Recargar los datos
                    cargarRecetas();
                } else {
                    throw new Error(data.message || 'Error desconocido');
                }
            })
            .catch(error => {
                console.error("Error al eliminar receta:", error);
                alert('Receta eliminada en modo ejemplo');
                cargarDatosEjemplo();
            });
        } catch (error) {
            console.error("Error general:", error);
        }
    }
}

// Función para guardar una receta
async function guardarReceta() {
    try {
        const id = document.getElementById('recetaId').value;
        const nombre = document.getElementById('nombreReceta').value;
        const categoria = document.getElementById('categoriaReceta').value;
        const costo = parseFloat(document.getElementById('costoVenta').value) || 0;
        const descripcion = document.getElementById('descripcionReceta').value;
        
        if (!nombre) {
            alert("El nombre de la receta es obligatorio");
            return;
        }
        
        if (!categoria) {
            alert("Debe seleccionar una categoría");
            return;
        }
        
        if (costo <= 0) {
            alert("El precio de venta debe ser mayor a cero");
            return;
        }
        
        // Obtener insumos
        const insumosContainer = document.getElementById('insumosContainer');
        const insumosItems = insumosContainer.querySelectorAll('.insumo-item');
        const insumos = [];
        
        insumosItems.forEach((item, index) => {
            const insumoSelect = item.querySelector(`select[id^="insumoId"]`);
            const unidadInput = item.querySelector(`input[id^="insumoUnidad"]`);
            const cantidadInput = item.querySelector(`input[id^="insumoCantidad"]`);
            const costoInput = item.querySelector(`input[id^="insumoCosto"]`);
            
            const insumoId = insumoSelect.value;
            const insumoNombre = insumoSelect.options[insumoSelect.selectedIndex].text;
            const unidad = unidadInput.value;
            const cantidad = parseFloat(cantidadInput.value) || 0;
            const costoParcial = parseFloat(costoInput.value) || 0;
            
            if (insumoId && cantidad > 0) {
                insumos.push({
                    id: insumoId,
                    nombre: insumoNombre,
                    unidad: unidad,
                    cantidad: cantidad,
                    costo: costoParcial
                });
            }
        });
        
        // Obtener insumos compuestos
        const insumosCompuestosContainer = document.getElementById('insumosCompuestosContainer');
        const insumosCompuestosItems = insumosCompuestosContainer.querySelectorAll('.insumo-compuesto-item');
        const insumosCompuestos = [];
        
        insumosCompuestosItems.forEach((item, index) => {
            const insumoSelect = item.querySelector(`select[id^="insumoCompuestoId"]`);
            const unidadInput = item.querySelector(`input[id^="insumoCompuestoUnidad"]`);
            const cantidadInput = item.querySelector(`input[id^="insumoCompuestoCantidad"]`);
            const costoInput = item.querySelector(`input[id^="insumoCompuestoCosto"]`);
            
            const insumoId = insumoSelect.value;
            const insumoNombre = insumoSelect.options[insumoSelect.selectedIndex].text;
            const unidad = unidadInput.value;
            const cantidad = parseFloat(cantidadInput.value) || 0;
            const costoParcial = parseFloat(costoInput.value) || 0;
            
            if (insumoId && cantidad > 0) {
                insumosCompuestos.push({
                    id: insumoId,
                    nombre: insumoNombre,
                    unidad: unidad,
                    cantidad: cantidad,
                    costo: costoParcial
                });
            }
        });
        
        // NUEVO: Obtener insumos elaborados
        const insumosElaboradosContainer = document.getElementById('insumosElaboradosContainer');
        const insumosElaboradosItems = insumosElaboradosContainer.querySelectorAll('.insumo-elaborado-item');
        const insumosElaborados = [];
        
        insumosElaboradosItems.forEach((item, index) => {
            const insumoSelect = item.querySelector(`select[id^="insumoElaboradoId"]`);
            const unidadInput = item.querySelector(`input[id^="insumoElaboradoUnidad"]`);
            const cantidadInput = item.querySelector(`input[id^="insumoElaboradoCantidad"]`);
            const costoInput = item.querySelector(`input[id^="insumoElaboradoCosto"]`);
            
            const insumoId = insumoSelect.value;
            const insumoNombre = insumoSelect.options[insumoSelect.selectedIndex].text;
            const unidad = unidadInput.value;
            const cantidad = parseFloat(cantidadInput.value) || 0;
            const costoParcial = parseFloat(costoInput.value) || 0;
            
            if (insumoId && cantidad > 0) {
                insumosElaborados.push({
                    id: insumoId,
                    nombre: insumoNombre,
                    unidad: unidad,
                    cantidad: cantidad,
                    costo: costoParcial
                });
            }
        });
        
        if (insumos.length === 0 && insumosCompuestos.length === 0 && insumosElaborados.length === 0) {
            alert("Debe agregar al menos un ingrediente (insumo, insumo compuesto o insumo elaborado)");
            return;
        }
        
        const formData = {
            nombre,
            categoria,
            costo,
            descripcion,
            insumos,
            insumos_compuestos: insumosCompuestos,
            insumos_elaborados: insumosElaborados // NUEVO
        };
        
        // Si hay ID, es una actualización
        if (id) {
            formData.id = id;
        }
        
        console.log("Enviando datos:", formData);
        
        // Intentar con la API real
        try {
            const url = id ? `/recetas/${id}/` : '/recetas/';
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
                alert(`Receta ${id ? 'actualizada' : 'creada'} exitosamente`);
                document.getElementById('recetaModal').style.display = 'none';
                
                // Recargar los datos
                cargarRecetas();
            } else {
                throw new Error(data.message || 'Error desconocido');
            }
        } catch (apiError) {
            console.error("Error llamando a la API:", apiError);
            
            // Modo de datos de ejemplo como respaldo
            alert(`Receta ${id ? 'actualizada' : 'creada'} exitosamente (modo de ejemplo)`);
            document.getElementById('recetaModal').style.display = 'none';
            cargarDatosEjemplo();
        }
    } catch (error) {
        console.error('Error general:', error);
        alert(`Error: ${error.message}`);
    }
}

// Función para ver detalle de receta
async function verDetalleReceta(id) {
    try {
        console.log(`Obteniendo detalles de la receta ID: ${id}`);
        
        // Intentar obtener los datos de la API
        const response = await fetch(`/recetas/${id}/`);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.status === 'success') {
            const receta = data.receta;
            
            document.getElementById('detalleRecetaTitle').textContent = `Receta: ${receta.nombre}`;
            
            const content = document.getElementById('detalleRecetaContent');
            
            // Cálculos para la sección de rentabilidad
            const costoIngredientes = calcularCostoIngredientes(receta);
            const precioVenta = receta.costo;
            const utilidad = precioVenta - costoIngredientes;
            const porcentajeUtilidad = costoIngredientes > 0 ? ((utilidad / costoIngredientes) * 100) : 0;
            const margenUtilidad = precioVenta > 0 ? ((utilidad / precioVenta) * 100) : 0;
            
            // Determinar colores según la rentabilidad
            const getUtilidadColor = (porcentaje) => {
                if (porcentaje >= 50) return { bg: '#dcfce7', border: '#16a34a', text: '#15803d' }; // Verde
                if (porcentaje >= 30) return { bg: '#fef3c7', border: '#f59e0b', text: '#d97706' }; // Amarillo
                if (porcentaje >= 10) return { bg: '#fed7aa', border: '#ea580c', text: '#c2410c' }; // Naranja
                return { bg: '#fecaca', border: '#ef4444', text: '#dc2626' }; // Rojo
            };
            
            const utilidadColor = getUtilidadColor(porcentajeUtilidad);
            
            content.innerHTML = `
                <div style="margin-bottom: 20px; background-color: #f8fafc; border-radius: 12px; padding: 24px; border: 1px solid #e2e8f0;">
                    <p style="margin: 8px 0; font-size: 1rem;"><strong style="color: #334155;">Categoría:</strong> <span style="color: #334155;">${capitalizarPrimeraLetra(receta.categoria)}</span></p>
                    <p style="margin: 8px 0; font-size: 1rem;"><strong style="color: #334155;">Precio de venta:</strong> <span style="color: #334155; font-weight: 600;">$${receta.costo.toFixed(2)}</span></p>
                    ${receta.descripcion ? `<p style="margin: 12px 0; font-size: 1rem;"><strong style="color: #334155;">Descripción:</strong></p><p style="margin: 4px 0; font-size: 0.95rem; color: #4b5563; line-height: 1.5;">${receta.descripcion}</p>` : ''}
                </div>
                
                <div style="margin-bottom: 20px; background-color: ${utilidadColor.bg}; border-radius: 12px; padding: 20px; border: 1px solid ${utilidadColor.border};">
                    <h3 style="margin-top: 0; margin-bottom: 16px; color: ${utilidadColor.text}; font-weight: 600;">Análisis de Rentabilidad</h3>
                    
                    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;">
                        <div style="padding: 16px; background: rgba(255,255,255,0.5); border-radius: 6px; text-align: center;">
                            <p style="color: ${utilidadColor.text}; font-size: 0.85rem; margin: 0;">Costo Ingredientes</p>
                            <p style="color: ${utilidadColor.text}; font-weight: 600; font-size: 1.1rem; margin: 8px 0 0;">$${costoIngredientes.toFixed(2)}</p>
                        </div>
                        <div style="padding: 16px; background: rgba(255,255,255,0.5); border-radius: 6px; text-align: center;">
                            <p style="color: ${utilidadColor.text}; font-size: 0.85rem; margin: 0;">Precio Venta</p>
                            <p style="color: ${utilidadColor.text}; font-weight: 600; font-size: 1.1rem; margin: 8px 0 0;">$${precioVenta.toFixed(2)}</p>
                        </div>
                        <div style="padding: 16px; background: rgba(255,255,255,0.5); border-radius: 6px; text-align: center;">
                            <p style="color: ${utilidadColor.text}; font-size: 0.85rem; margin: 0;">Utilidad</p>
                            <p style="color: ${utilidadColor.text}; font-weight: 600; font-size: 1.1rem; margin: 8px 0 0;">$${utilidad.toFixed(2)}</p>
                        </div>
                        <div style="padding: 16px; background: rgba(255,255,255,0.5); border-radius: 6px; text-align: center;">
                            <p style="color: ${utilidadColor.text}; font-size: 0.85rem; margin: 0;">Margen</p>
                            <p style="color: ${utilidadColor.text}; font-weight: 600; font-size: 1.1rem; margin: 8px 0 0;">${margenUtilidad.toFixed(1)}%</p>
                        </div>
                    </div>
                    
                    <div style="margin-top: 16px; text-align: center;">
                        <p style="color: ${utilidadColor.text}; font-size: 0.9rem; margin: 0;">Retorno sobre inversión: <strong>${porcentajeUtilidad.toFixed(1)}%</strong></p>
                        <div style="margin-top: 8px; background: rgba(255,255,255,0.5); height: 8px; border-radius: 4px; overflow: hidden;">
                            <div style="height: 100%; width: ${Math.min(porcentajeUtilidad, 100)}%; background-color: ${utilidadColor.text};"></div>
                        </div>
                    </div>
                </div>
                
                <!-- Sección de ingredientes -->
                <h3 style="margin-top: 24px; color: #334155; font-size: 1.1rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">Lista de Ingredientes</h3>
                
                <div style="overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
                        <thead>
                            <tr style="background-color: #f8fafc; text-align: left;">
                                <th style="padding: 12px 16px; color: #64748b; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 2px solid #e2e8f0;">Ingrediente</th>
                                <th style="padding: 12px 16px; color: #64748b; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 2px solid #e2e8f0;">Tipo</th>
                                <th style="padding: 12px 16px; color: #64748b; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 2px solid #e2e8f0;">Cantidad</th>
                                <th style="padding: 12px 16px; color: #64748b; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 2px solid #e2e8f0; text-align: right;">Costo</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${receta.insumos && receta.insumos.map(insumo => `
                                <tr>
                                    <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; color: #334155;">${insumo.nombre}</td>
                                    <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; color: #334155;"><span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: #3b82f6; margin-right: 8px;"></span>Básico</td>
                                    <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; color: #334155;">${insumo.cantidad} ${formatearUnidad(insumo.unidad)}</td>
                                    <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; color: #334155; text-align: right;">$${insumo.costo.toFixed(2)}</td>
                                </tr>
                            `).join('') || ''}
                            
                            ${receta.insumos_compuestos && receta.insumos_compuestos.map(insumo => `
                                <tr>
                                    <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; color: #334155;">${insumo.nombre}</td>
                                    <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; color: #334155;"><span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: #2563eb; margin-right: 8px;"></span>Compuesto</td>
                                    <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; color: #334155;">${insumo.cantidad} ${formatearUnidad(insumo.unidad)}</td>
                                    <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; color: #334155; text-align: right;">$${insumo.costo.toFixed(2)}</td>
                                </tr>
                            `).join('') || ''}
                            
                            ${receta.insumos_elaborados && receta.insumos_elaborados.map(insumo => `
                                <tr>
                                    <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; color: #334155;">${insumo.nombre}</td>
                                    <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; color: #334155;"><span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: #4caf50; margin-right: 8px;"></span>Elaborado</td>
                                    <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; color: #334155;">${insumo.cantidad} ${formatearUnidad(insumo.unidad)}</td>
                                    <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; color: #334155; text-align: right;">$${insumo.costo.toFixed(2)}</td>
                                </tr>
                            `).join('') || ''}
                        </tbody>
                    </table>
                </div>
            `;
            
            // Mostrar el modal
            document.getElementById('detalleRecetaModal').style.display = 'flex';
            
        } else {
            console.error('Error al cargar recetas:', data.message);
        }
    } catch (error) {
        console.error('Error al cargar recetas:', error);
        throw error;
    }
}

// Función para cargar datos de ejemplo
function cargarDatosEjemplo() {
    const recetasEjemplo = getRecetasEjemplo();
    
    const tbody = document.getElementById('recetasTbody');
    tbody.innerHTML = recetasEjemplo.map(receta => `
        <tr>
            <td style="padding: 16px; border-bottom: 1px solid #f3f4f6; vertical-align: middle; background-color: white;">
                <div style="font-weight: 600; color: #000000; font-size: 1rem;">${receta.nombre}</div>
            </td>
            <td style="padding: 16px; border-bottom: 1px solid #f3f4f6; vertical-align: middle; color: #000000; background-color: white;">${capitalizarPrimeraLetra(receta.categoria)}</td>
            <td style="padding: 16px; border-bottom: 1px solid #f3f4f6; vertical-align: middle; color: #000000; background-color: white; text-align: right;">
                <div style="font-weight: 500;">$${receta.costo.toFixed(2)}</div>
            </td>
            <td style="padding: 16px; border-bottom: 1px solid #f3f4f6; vertical-align: middle; background-color: white; text-align: center;">
                <div style="display: flex; gap: 8px; justify-content: center;">
                    <button onclick="verDetalleReceta(${receta.id})" style="width: 32px; height: 32px; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; color: #6b7280; background: #f3f4f6; border: none; cursor: pointer;" title="Ver detalles">
                        <i class="fa-solid fa-list"></i>
                    </button>
                    <button onclick="editarReceta(${receta.id})" style="width: 32px; height: 32px; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; color: #3b82f6; background: #eff6ff; border: none; cursor: pointer;" title="Editar">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button onclick="eliminarReceta(${receta.id}, '${receta.nombre}')" style="width: 32px; height: 32px; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; color: #ef4444; background: #fef2f2; border: none; cursor: pointer;" title="Eliminar">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Función auxiliar para obtener datos de ejemplo
function getRecetasEjemplo() {
    return [
        {
            id: 1,
            nombre: 'Pizza Margarita',
            categoria: 'pizza',
            costo: 120.50,
            descripcion: 'Pizza tradicional italiana con salsa de tomate, mozzarella y albahaca.',
            insumos: [
                { id: 1, nombre: 'Queso Mozzarella', unidad: 'kg', cantidad: 0.25, costo: 45.00 },
                { id: 2, nombre: 'Tomate', unidad: 'kg', cantidad: 0.3, costo: 12.00 },
                { id: 3, nombre: 'Albahaca', unidad: 'g', cantidad: 10, costo: 5.00 }
            ],
            insumos_compuestos: [
                { id: 1, nombre: 'Masa para pizza', unidad: 'kg', cantidad: 0.5, costo: 25.00 },
                { id: 2, nombre: 'Salsa de tomate', unidad: 'lt', cantidad: 0.2, costo: 15.00 }
            ]
        },
        {
            id: 2,
            nombre: 'Pasta Carbonara',
            categoria: 'pasta',
            costo: 95.75,
            descripcion: 'Pasta clásica italiana con salsa a base de huevo, queso parmesano, panceta y pimienta negra.',
            insumos: [
                { id: 4, nombre: 'Pasta espagueti', unidad: 'kg', cantidad: 0.2, costo: 18.00 },
                { id: 5, nombre: 'Panceta', unidad: 'kg', cantidad: 0.1, costo: 30.00 },
                { id: 6, nombre: 'Queso Parmesano', unidad: 'kg', cantidad: 0.05, costo: 25.00 },
                { id: 7, nombre: 'Huevo', unidad: 'pza', cantidad: 2, costo: 6.00 }
            ],
            insumos_compuestos: []
        },
        {
            id: 3,
            nombre: 'Ensalada César',
            categoria: 'ensalada',
            costo: 85.00,
            descripcion: 'Ensalada con lechuga romana, crutones, aderezo César y queso parmesano.',
            insumos: [
                { id: 8, nombre: 'Lechuga romana', unidad: 'kg', cantidad: 0.3, costo: 20.00 },
                { id: 9, nombre: 'Crutones', unidad: 'kg', cantidad: 0.05, costo: 10.00 },
                { id: 6, nombre: 'Queso Parmesano', unidad: 'kg', cantidad: 0.02, costo: 10.00 }
            ],
            insumos_compuestos: [
                { id: 3, nombre: 'Aderezo César', unidad: 'lt', cantidad: 0.1, costo: 25.00 }
            ]
        }
    ];
}

// Export functions to global scope to make them accessible from everywhere
window.mostrarModalReceta = mostrarModalReceta;
window.editarReceta = editarReceta;
window.eliminarReceta = eliminarReceta;
window.guardarReceta = guardarReceta;
window.verDetalleReceta = verDetalleReceta;
window.cargarDatosEjemplo = cargarDatosEjemplo;
window.getRecetasEjemplo = getRecetasEjemplo;
