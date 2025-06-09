// Guardar receta
async function guardarReceta(event) {
    event.preventDefault();
    
    const id = document.getElementById('recetaId').value;
    const nombre = document.getElementById('nombreReceta').value;
    const categoria = document.getElementById('categoriaReceta').value;
    const costo = parseFloat(document.getElementById('costoVenta').value) || 0;
    const descripcion = document.getElementById('descripcionReceta').value;
    
    if (!nombre || !categoria || costo <= 0) {
        alert('Por favor completa todos los campos obligatorios');
        return;
    }
    
    // Recopilar ingredientes
    const ingredientes = recopilarIngredientes();
    
    if (ingredientes.length === 0) {
        alert('Debe agregar al menos un ingrediente');
        return;
    }
    
    const formData = {
        nombre,
        categoria,
        costo,
        descripcion,
        insumos: ingredientes.filter(i => i.tipo === 'insumo'),
        insumos_compuestos: ingredientes.filter(i => i.tipo === 'compuesto'),
        insumos_elaborados: ingredientes.filter(i => i.tipo === 'elaborado')
    };
    
    try {
        const url = id ? `/recetas/${id}/` : '/recetas/';
        const method = id ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCsrfTokenRecetas()
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (data.status === 'success') {
            alert(`Receta ${id ? 'actualizada' : 'creada'} exitosamente`);
            cerrarModalReceta();
            cargarRecetas();
        } else {
            alert('Error: ' + data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al guardar la receta');
    }
}

// Editar receta
async function editarReceta(id) {
    try {
        const response = await fetch(`/recetas/${id}/`);
        const data = await response.json();
        
        if (data.status === 'success') {
            mostrarModalReceta(data.receta);
        } else {
            alert('Error al cargar la receta');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar la receta');
    }
}

// Eliminar receta
async function eliminarReceta(id, nombre) {
    if (!confirm(`¿Está seguro que desea eliminar la receta "${nombre}"?`)) {
        return;
    }
    
    try {
        const response = await fetch(`/recetas/${id}/`, {
            method: 'DELETE',
            headers: {
                'X-CSRFToken': getCsrfTokenRecetas()
            }
        });
        
        const data = await response.json();
        
        if (data.status === 'success') {
            alert('Receta eliminada exitosamente');
            cargarRecetas();
        } else {
            alert('Error: ' + data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar la receta');
    }
}

// Ver detalle de receta
async function verDetalleReceta(id) {
    try {
        const response = await fetch(`/recetas/${id}/`);
        const data = await response.json();
        
        if (data.status === 'success') {
            mostrarDetalleReceta(data.receta);
        } else {
            alert('Error al cargar los detalles');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar los detalles');
    }
}

// Mostrar detalle de receta
function mostrarDetalleReceta(receta) {
    const modal = document.getElementById('detalleRecetaModal');
    const title = document.getElementById('detalleRecetaTitle');
    const content = document.getElementById('detalleRecetaContent');
    
    title.textContent = `Receta: ${receta.nombre}`;
    
    const costoIngredientes = calcularCostoIngredientes(receta);
    const utilidad = receta.costo - costoIngredientes;
    const porcentajeUtilidad = costoIngredientes > 0 ? ((utilidad / costoIngredientes) * 100) : 0;
    
    content.innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px;">
            <div>
                <h3 style="color: #1f2937; margin-bottom: 12px;">Información General</h3>
                <p><strong>Nombre:</strong> ${receta.nombre}</p>
                <p><strong>Categoría:</strong> ${capitalizarPrimeraLetra(receta.categoria)}</p>
                <p><strong>Descripción:</strong> ${receta.descripcion || 'Sin descripción'}</p>
            </div>
            <div>
                <h3 style="color: #1f2937; margin-bottom: 12px;">Análisis de Costos</h3>
                <p><strong>Costo de ingredientes:</strong> $${costoIngredientes.toFixed(2)}</p>
                <p><strong>Precio de venta:</strong> $${receta.costo.toFixed(2)}</p>
                <p><strong>Utilidad:</strong> <span style="color: ${utilidad >= 0 ? '#059669' : '#dc2626'};">$${utilidad.toFixed(2)}</span></p>
                <p><strong>Margen:</strong> <span style="color: ${porcentajeUtilidad >= 0 ? '#059669' : '#dc2626'};">${porcentajeUtilidad.toFixed(1)}%</span></p>
            </div>
        </div>
        
        <h3 style="color: #1f2937; margin-bottom: 12px;">Ingredientes</h3>
        <div style="background: #f8fafc; padding: 16px; border-radius: 8px;">
            ${generarListaIngredientes(receta)}
        </div>
    `;
    
    modal.style.display = 'flex';
}

// Generar lista de ingredientes para el detalle
function generarListaIngredientes(receta) {
    let html = '';
    
    if (receta.insumos && receta.insumos.length > 0) {
        html += '<h4 style="color: #059669; margin-bottom: 8px;">Insumos Básicos:</h4>';
        html += '<ul style="margin-bottom: 16px;">';
        receta.insumos.forEach(insumo => {
            html += `<li>${insumo.nombre} - ${insumo.cantidad} ${insumo.unidad} ($${insumo.costo.toFixed(2)})</li>`;
        });
        html += '</ul>';
    }
    
    if (receta.insumos_compuestos && receta.insumos_compuestos.length > 0) {
        html += '<h4 style="color: #1e40af; margin-bottom: 8px;">Insumos Compuestos:</h4>';
        html += '<ul style="margin-bottom: 16px;">';
        receta.insumos_compuestos.forEach(insumo => {
            html += `<li>${insumo.nombre} - ${insumo.cantidad} ${insumo.unidad} ($${insumo.costo.toFixed(2)})</li>`;
        });
        html += '</ul>';
    }
    
    if (receta.insumos_elaborados && receta.insumos_elaborados.length > 0) {
        html += '<h4 style="color: #ea580c; margin-bottom: 8px;">Insumos Elaborados:</h4>';
        html += '<ul>';
        receta.insumos_elaborados.forEach(insumo => {
            html += `<li>${insumo.nombre} - ${insumo.cantidad} ${insumo.unidad} ($${insumo.costo.toFixed(2)})</li>`;
        });
        html += '</ul>';
    }
    
    return html || '<p>No hay ingredientes registrados.</p>';
}

// Calcular costo de ingredientes
function calcularCostoIngredientes(receta) {
    let total = 0;
    
    if (receta.insumos) {
        total += receta.insumos.reduce((sum, insumo) => sum + parseFloat(insumo.costo || 0), 0);
    }
    if (receta.insumos_compuestos) {
        total += receta.insumos_compuestos.reduce((sum, insumo) => sum + parseFloat(insumo.costo || 0), 0);
    }
    if (receta.insumos_elaborados) {
        total += receta.insumos_elaborados.reduce((sum, insumo) => sum + parseFloat(insumo.costo || 0), 0);
    }
    
    return total;
}

// Exportar funciones
window.guardarReceta = guardarReceta;
window.editarReceta = editarReceta;
window.eliminarReceta = eliminarReceta;
window.verDetalleReceta = verDetalleReceta;

console.log("✅ Módulo CRUD de recetas cargado");