// Crear modal principal de receta
function crearModalReceta() {
    if (document.getElementById('recetaModal')) return;
    
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
    if (document.getElementById('detalleRecetaModal')) return;
    
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
    document.getElementById('agregarIngredienteBtn').addEventListener('click', agregarIngrediente);
    
    // Cerrar al hacer clic fuera
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
    
    // Limpiar formulario
    form.reset();
    document.getElementById('ingredientesContainer').innerHTML = '';
    
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
            receta.insumos.forEach(insumo => agregarIngrediente(insumo));
        }
    }
    
    modal.style.display = 'flex';
}

// Cerrar modal de receta
function cerrarModalReceta() {
    document.getElementById('recetaModal').style.display = 'none';
}

// Cerrar modal de detalle
function cerrarModalDetalle() {
    document.getElementById('detalleRecetaModal').style.display = 'none';
}

// Exportar funciones
window.mostrarModalReceta = mostrarModalReceta;
window.cerrarModalReceta = cerrarModalReceta;
window.cerrarModalDetalle = cerrarModalDetalle;

console.log("✅ Módulo de modales de recetas cargado");