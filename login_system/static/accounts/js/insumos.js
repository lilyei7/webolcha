// Caché para los proveedores (renombrada para evitar conflicto)
let insumosProveedoresCache = null;
let insumosProveedoresCacheTime = null;
const INSUMOS_CACHE_TTL = 5 * 60 * 1000; // 5 minutos en milisegundos

async function loadInsumosProveedores(forceRefresh = false) {
    try {
        const now = new Date().getTime();
        
        // Si tenemos proveedores en caché y no han expirado, devolver el caché
        if (!forceRefresh && insumosProveedoresCache && insumosProveedoresCacheTime && (now - insumosProveedoresCacheTime < INSUMOS_CACHE_TTL)) {
            return insumosProveedoresCache;
        }
        
        // Si no tenemos caché o ha expirado, cargar desde el servidor
        const response = await fetch('/api/proveedores/');
        const data = await response.json();
        
        if (data.status === 'success') {
            // Actualizar el caché
            insumosProveedoresCache = data.proveedores;
            insumosProveedoresCacheTime = now;
            return data.proveedores;
        } else {
            console.error('Error al cargar proveedores:', data.message);
            return [];
        }
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
}

// Función para inicializar un select con iconos
function inicializarSelectConIconos(selectId) {
    const select = document.getElementById(selectId);
    if (!select) return;
    
    const parent = select.parentElement;
    
    // Verificar si ya existe un custom select para evitar duplicación
    const existingCustomSelect = parent.querySelector('.custom-select-container');
    if (existingCustomSelect) {
        existingCustomSelect.remove();
    }
    
    // Crear el contenedor personalizado
    const customSelectContainer = document.createElement('div');
    customSelectContainer.className = 'custom-select-container';
    
    // Hacer que ocupe espacio disponible
    customSelectContainer.style.width = '100%';
    
    // Crear el display para la selección actual
    const selectDisplay = document.createElement('div');
    selectDisplay.className = 'select-display';
    
    // Establecer "Seleccionar categoría" y mejorar el estilo
    selectDisplay.innerHTML = `
        <i class="fa-solid fa-layer-group"></i>
        <span>Seleccionar categoría</span>
    `;
    
    // Crear el contenedor de opciones
    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'select-options';
    
    // Ocultar el select original pero mantenerlo para el envío de formularios
    select.style.display = 'none';
    
    // Añadir opciones al contenedor personalizado
    Array.from(select.options).forEach(option => {
        if (!option.value) return; // Ignorar la opción vacía
        
        const optionEl = document.createElement('div');
        optionEl.className = 'select-option';
        optionEl.dataset.value = option.value;
        
        // Usar atributos de datos para iconos, usarlos si están disponibles
        let iconHtml = '';
        if (option.dataset.icono) {
            const iconStyle = `
                background-color: ${option.dataset.colorFondo || '#f3f4f6'};
                color: ${option.dataset.colorIcono || '#374151'};
                width: 24px;
                height: 24px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                border-radius: 4px;
                margin-right: 8px;
            `;
            
            iconHtml = `<span class="option-icon" style="${iconStyle}"><i class="fa-solid ${option.dataset.icono}"></i></span>`;
        }
        
        optionEl.innerHTML = `
            <div class="option-content">
                ${iconHtml}
                <span>${option.textContent}</span>
            </div>
        `;
        
        // Añadir evento de clic para seleccionar la opción
        optionEl.addEventListener('click', () => {
            // Establecer el valor en el select original
            select.value = option.value;
            
            // Disparar evento change para que otros listeners lo detecten
            select.dispatchEvent(new Event('change', { bubbles: true }));
            
            // Actualización del elemento seleccionado
            const displayText = selectDisplay.querySelector('span');
            displayText.textContent = option.textContent;
            
            if (option.dataset.icono) {
                const iconStyle = `
                    background-color: ${option.dataset.colorFondo || '#f3f4f6'};
                    color: ${option.dataset.colorIcono || '#374151'};
                    width: 24px;
                    height: 24px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 4px;
                    margin-right: 8px;
                `;
                
                selectDisplay.innerHTML = `
                    <div class="option-content">
                        <span class="option-icon" style="${iconStyle}"><i class="fa-solid ${option.dataset.icono}"></i></span>
                        <span>${option.textContent}</span>
                    </div>
                `;
            } else {
                selectDisplay.innerHTML = `<span>${option.textContent}</span>`;
            }
            
            // Cerrar el menú
            optionsContainer.classList.remove('show');
        });
        
        optionsContainer.appendChild(optionEl);
    });
    
    // Agregar botón de nueva categoría al final de las opciones
    const addCategoryBtn = document.createElement('div');
    addCategoryBtn.className = 'select-option add-category-option';
    addCategoryBtn.innerHTML = `
        <i class="fa-solid fa-plus"></i>
        <span>Nueva categoría</span>
    `;
    
    addCategoryBtn.addEventListener('click', (e) => {
        showCategoriaModal();
        optionsContainer.classList.remove('show');
    });
    
    optionsContainer.appendChild(addCategoryBtn);
    
    // Agregar evento clic para mostrar/ocultar opciones
    selectDisplay.addEventListener('click', (e) => {
        e.stopPropagation();
        optionsContainer.classList.toggle('show');
    });
    
    // Cerrar cuando se hace clic fuera
    document.addEventListener('click', () => {
        optionsContainer.classList.remove('show');
    });
    
    // Añadir elementos al DOM
    customSelectContainer.appendChild(selectDisplay);
    customSelectContainer.appendChild(optionsContainer);
    parent.appendChild(customSelectContainer);
}

// Función para mostrar el modal de categoría
function showCategoriaModal() {
    // Crear el modal si no existe
    let categoriaModal = document.getElementById('categoriaModal');
    if (!categoriaModal) {
        const categoriaModalHTML = `
            <div id="categoriaModal" class="modal"
                style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.45); z-index: 3000;">
                <div class="modal-content categoria-modal"
                    style="background: #fff; border-radius: 12px; max-width: 400px; width: 95%; padding: 32px 24px 24px 24px; box-shadow: 0 8px 32px rgba(37,99,235,0.25); position: relative; z-index: 3100;">
                    <span class="close-modal" id="closeCategoriaModal"
                        style="position: absolute; right: 18px; top: 12px; font-size: 28px; cursor: pointer; color: #6b7280; transition: color 0.2s; z-index: 3200;">&times;</span>
                    <h2 style="margin-top: 0; margin-bottom: 18px;">Nueva Categoría</h2>
                    <form id="categoriaForm">
                        <div class="form-group">
                            <label for="categoriaNombre">Nombre de la categoría: *</label>
                            <input type="text" id="categoriaNombre" required>
                        </div>
                        <div class="form-group">
                            <div class="icono-container">
                                <label>Icono y color:</label>
                                <div class="icono-preview" id="iconoPreview"
                                    style="display: inline-block; background: #f3f4f6; border-radius: 6px; padding: 8px; margin-bottom: 8px;">
                                    <i class="fa-solid fa-cube" id="iconoSeleccionado" style="color: #374151; font-size: 1.5rem;"></i>
                                </div>
                                <div class="icono-selector" style="margin-top: 8px;">
                                    <select id="categoriaIcono">
                                        <option value="fa-cube">Cubo</option>
                                        <option value="fa-boxes-stacked">Cajas</option>
                                        <option value="fa-wheat-awn">Trigo</option>
                                        <option value="fa-carrot">Zanahoria</option>
                                        <option value="fa-egg">Huevo</option>
                                        <option value="fa-fish">Pescado</option>
                                        <option value="fa-bottle-water">Botella</option>
                                        <option value="fa-cookie">Galleta</option>
                                    </select>
                                </div>
                            </div>
                            <div class="color-picker-container" style="display: flex; gap: 12px; margin-top: 10px;">
                                <div class="color-picker">
                                    <label>Fondo: </label>
                                    <input type="color" id="colorFondo" value="#f3f4f6">
                                </div>
                                <div class="color-picker">
                                    <label>Icono: </label>
                                    <input type="color" id="colorIcono" value="#374151">
                                </div>
                            </div>
                        </div>
                        <div class="form-actions" style="margin-top: 18px; display: flex; gap: 10px; justify-content: flex-end;">
                            <button type="submit" class="btn-primary" id="guardarCategoriaBtn">
                                <i class="fa-solid fa-save"></i> Guardar Categoría
                            </button>
                            <button type="button" class="btn-secondary" id="cancelarCategoriaBtn">
                                <i class="fa-solid fa-times"></i> Cancelar
                            </button>
                        </div>
                    </form>
                    <div class="categorias-list" id="categoriasExistentes" style="margin-top: 18px;">
                        <!-- Las categorías se cargarán dinámicamente -->
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', categoriaModalHTML);
        categoriaModal = document.getElementById('categoriaModal');

        // Configurar eventos del modal
        document.getElementById('closeCategoriaModal').addEventListener('click', closeCategoriaModal);
        document.getElementById('cancelarCategoriaBtn').addEventListener('click', closeCategoriaModal);
        document.getElementById('categoriaForm').addEventListener('submit', handleCategoriaSubmit);
        document.getElementById('categoriaIcono').addEventListener('change', function() {
            document.getElementById('iconoSeleccionado').className = 'fa-solid ' + this.value;
        });
        document.getElementById('colorFondo').addEventListener('input', function() {
            document.getElementById('iconoPreview').style.backgroundColor = this.value;
        });
        document.getElementById('colorIcono').addEventListener('input', function() {
            document.getElementById('iconoSeleccionado').style.color = this.value;
        });
    } else {
        if (categoriaModal.parentElement !== document.body) {
            document.body.appendChild(categoriaModal);
        }
    }

    // Cargar categorías existentes
    cargarCategoriasExistentes();

    // Mostrar el modal
    categoriaModal.style.display = 'flex';
}

// Función para cerrar el modal de categoría
function closeCategoriaModal() {
    const modal = document.getElementById('categoriaModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Función para cargar las categorías existentes en el modal
async function cargarCategoriasExistentes() {
    try {
        const response = await fetch('/categorias/');
        const data = await response.json();
        
        const container = document.getElementById('categoriasExistentes');
        container.innerHTML = '';
        
        if (data.status === 'success') {
            data.categorias.forEach(categoria => {
                const categoriaEl = document.createElement('div');
                categoriaEl.className = 'categoria-item';
                
                categoriaEl.innerHTML = `
                    <div class="categoria-icon" style="background-color: ${categoria.color_fondo}; color: ${categoria.color_icono}">
                        <i class="fa-solid ${categoria.icono}"></i>
                    </div>
                    <div class="categoria-name">${categoria.nombre}</div>
                `;
                
                container.appendChild(categoriaEl);
            });
        }
    } catch (error) {
        console.error('Error al cargar categorías:', error);
    }
}

// Función para manejar el envío del formulario de categoría
async function handleCategoriaSubmit(event) {
    event.preventDefault();
    
    try {
        // Validar nombre
        const nombre = document.getElementById('categoriaNombre').value.trim();
        if (!nombre) {
            throw new Error('El nombre de la categoría es requerido');
        }
        
        // Recopilar datos del formulario
        const formData = {
            nombre: nombre,
            icono: document.getElementById('categoriaIcono').value,
            color_fondo: document.getElementById('colorFondo').value,
            color_icono: document.getElementById('colorIcono').value
        };
        
        // Enviar al servidor
        const response = await fetch('/categorias/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (data.status === 'success') {
            // Cerrar el modal
            closeCategoriaModal();
            
            // Recargar categorías en el select
            await cargarCategorias();
            
            // Mostrar mensaje de éxito
            alert('Categoría creada correctamente');
        } else {
            throw new Error(data.message || 'Error al crear categoría');
        }
    } catch (error) {
        console.error('Error:', error);
        alert(`Error: ${error.message}`);
    }
}

// Helper function to get CSRF token
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

// Función para cargar la página principal de insumos
function loadInsumosContent() {
    const mainContent = document.querySelector('.main-content');
    mainContent.innerHTML = `
        <div class="insumos-section">
            <div class="insumos-section-header">
                <div class="insumos-header-left">
                    <h1>Gestión de Insumos</h1>
                    <p>Administra tus insumos y materias primas</p>
                </div>
                <div class="insumos-header-actions">
                    <button id="btnNuevoInsumo" class="btn-primary">
                        <i class="fa-solid fa-plus"></i> Nuevo Insumo
                    </button>
                </div>
            </div>
            
            <div class="insumos-filters-section">
                <div class="insumos-search-box">
                    <i class="fa-solid fa-search"></i>
                    <input type="text" id="searchInsumo" placeholder="Buscar insumo...">
                </div>
                <select id="filterCategoria" class="insumos-select">
                    <option value="todas">Todas las categorías</option>
                </select>
                <select id="filterStock" class="insumos-select">
                    <option value="todos">Todo el stock</option>
                    <option value="bajo">Stock bajo</option>
                    <option value="normal">Stock normal</option>
                </select>
            </div>

            <div class="insumos-table-wrapper">
                <table id="insumosTable" class="tabla-insumos">
                    <thead>
                        <tr>
                            <th class="th-insumos">Nombre</th>
                            <th class="th-insumos">Unidad</th>
                            <th class="th-insumos">Categoría</th>
                            <th class="th-insumos">Stock</th>
                            <th class="th-insumos">Mínimo</th>
                            <th class="th-insumos">Acciones</th>
                        </tr>
                    </thead>
                    <tbody id="insumosTableBody"></tbody>
                </table>
            </div>
        </div>

        <!-- Modal para nuevo/editar insumo -->
        <div id="insumoModal" class="modal">
            <div class="modal-content">
                <span class="close-modal" id="closeInsumoModal">&times;</span>
                <h2 id="insumoModalTitle">Nuevo Insumo</h2>
                <form id="insumoForm">
                    <input type="hidden" id="insumoId" name="insumoId" value="">
                    
                    <div class="form-group">
                        <label for="insumoNombre">Nombre del insumo: *</label>
                        <input type="text" id="insumoNombre" name="nombre" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="insumoUnidad">Unidad de medida: *</label>
                        <select id="insumoUnidad" name="unidad" required>
                            <option value="">Seleccionar unidad</option>
                            <option value="kg">Kilogramo (kg)</option>
                            <option value="g">Gramo (g)</option>
                            <option value="lt">Litro (lt)</option>
                            <option value="ml">Mililitro (ml)</option>
                            <option value="pza">Pieza (pza)</option>
                            <option value="caja">Caja</option>
                            <option value="bolsa">Bolsa</option>
                            <option value="paquete">Paquete</option>
                        </select>
                    </div>
                    
                    <div class="form-group" id="categoriaSelectorContainer">
                        <label for="insumoCategoria">Categoría: *</label>
                        <select id="insumoCategoria" name="categoria" required>
                            <option value="">Seleccionar categoría</option>
                            <!-- Opciones se cargarán dinámicamente -->
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="insumoTipo">Tipo: *</label>
                        <select id="insumoTipo" name="tipo" required>
                            <option value="">Seleccionar tipo</option>
                            <option value="Materia Prima">Materia Prima</option>
                            <option value="Producto Terminado">Producto Terminado</option>
                            <option value="Insumo">Insumo</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="insumoStock">Stock actual: *</label>
                        <input type="number" id="insumoStock" name="stock" required min="0" value="0">
                    </div>
                    
                    <div class="form-group">
                        <label for="insumoMinimo">Stock mínimo: *</label>
                        <input type="number" id="insumoMinimo" name="minimo" required min="0" value="0">
                    </div>
                    
                    <div class="form-actions">
                        <button type="submit" class="btn-primary">Guardar</button>
                        <button type="button" class="btn-secondary" id="cancelInsumoBtn">Cancelar</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    // Cargar los insumos
    fetch('/insumos/')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                const tbody = document.getElementById('insumosTableBody');
                
                tbody.innerHTML = data.insumos.map(insumo => `
                    <tr>
                        <td class="td-insumos">
                            <div class="insumo-nombre">
                                <div class="insumo-title">${insumo.nombre}</div>
                            </div>
                        </td>
                        <td class="td-insumos">${insumo.unidad}</td>
                        <td class="td-insumos">${insumo.categoria}</td>
                        <td class="td-insumos">
                            <div class="insumo-badge ${insumo.stock <= insumo.minimo ? 'insumo-badge-critical' : 'insumo-badge-ok'}">
                                <i class="fa-solid ${insumo.stock <= insumo.minimo ? 'fa-triangle-exclamation' : 'fa-check-circle'}"></i>
                                ${insumo.stock}
                            </div>
                        </td>
                        <td class="td-insumos">${insumo.minimo}</td>
                        <td class="td-insumos">
                            <div class="actions-container">
                                <button class="btn-icon-insumos" title="Editar" onclick="editarInsumo(${insumo.id})">
                                    <i class="fa-solid fa-pen"></i>
                                </button>
                                <button class="btn-icon-insumos btn-delete" title="Eliminar" onclick="eliminarInsumo(${insumo.id})">
                                    <i class="fa-solid fa-trash"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `).join('');
                
                // Cargar las categorías para el select
                cargarCategorias();
                
                // Configurar evento para el botón Nuevo Insumo
                document.getElementById('btnNuevoInsumo').addEventListener('click', mostrarModalInsumo);
                
                // Configurar eventos para el modal
                document.getElementById('closeInsumoModal').addEventListener('click', cerrarModalInsumo);
                document.getElementById('cancelInsumoBtn').addEventListener('click', cerrarModalInsumo);
                document.getElementById('insumoForm').addEventListener('submit', handleInsumoSubmit);
            } else {
                console.error('Error al cargar insumos:', data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

// Función para mostrar el modal de nuevo insumo
function mostrarModalInsumo() {
    document.getElementById('insumoForm').reset();
    document.getElementById('insumoId').value = '';
    document.getElementById('insumoModalTitle').textContent = 'Nuevo Insumo';
    document.getElementById('insumoStock').value = '0';
    document.getElementById('insumoMinimo').value = '0';
    
    document.getElementById('insumoModal').style.display = 'flex';
    
    // Inicializar select personalizado para categorías
    setTimeout(() => {
        inicializarSelectConIconos('insumoCategoria');
    }, 100);
}

// Función para cerrar el modal de insumo
function cerrarModalInsumo() {
    document.getElementById('insumoModal').style.display = 'none';
}

// Funciones para editar y eliminar insumos
function editarInsumo(id) {
    console.log(`Iniciando edición del insumo con ID: ${id}`);
    
    // Mostrar indicador de carga
    const loadingIndicator = document.createElement('div');
    loadingIndicator.id = 'loading-indicator';
    loadingIndicator.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
                    background: rgba(255,255,255,0.8); z-index: 9999; display: flex; 
                    justify-content: center; align-items: center;">
            <div style="background: white; padding: 20px; border-radius: 5px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
                <p>Cargando datos del insumo...</p>
            </div>
        </div>
    `;
    document.body.appendChild(loadingIndicator);

    fetch(`/insumos/${id}/`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // Remover indicador de carga
            document.body.removeChild(loadingIndicator);
            
            if (data.status === 'success') {
                const insumo = data.insumo;
                
                console.log(`Cargando datos del insumo en el formulario:`, insumo);
                
                // Asegurar que el ID se establezca correctamente y no sea una cadena vacía
                document.getElementById('insumoId').value = insumo.id.toString();
                console.log(`ID configurado en el formulario: ${document.getElementById('insumoId').value}`);
                
                // Configurar el resto de campos
                document.getElementById('insumoNombre').value = insumo.nombre;
                document.getElementById('insumoUnidad').value = insumo.unidad;
                document.getElementById('insumoCategoria').value = insumo.categoria;
                document.getElementById('insumoTipo').value = insumo.tipo;
                document.getElementById('insumoStock').value = insumo.stock;
                document.getElementById('insumoMinimo').value = insumo.minimo;
                
                document.getElementById('insumoModalTitle').textContent = 'Editar Insumo';
                document.getElementById('insumoModal').style.display = 'flex';
                
                setTimeout(() => {
                    inicializarSelectConIconos('insumoCategoria');
                }, 100);
            } else {
                alert(`Error al cargar los datos del insumo: ${data.message || 'Error desconocido'}`);
            }
        })
        .catch(error => {
            // Remover indicador de carga en caso de error
            if (document.getElementById('loading-indicator')) {
                document.body.removeChild(loadingIndicator);
            }
            
            console.error('Error:', error);
            alert(`Error al cargar los datos del insumo: ${error.message}`);
        });
}

function eliminarInsumo(id) {
    if (confirm('¿Estás seguro de que deseas eliminar este insumo?')) {
        fetch(`/insumos/${id}/`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            }
        })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    loadInsumosContent();
                    alert('Insumo eliminado correctamente');
                } else {
                    alert(data.message || 'Error al eliminar el insumo');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error al eliminar el insumo');
            });
    }
}

// Función para manejar el envío del formulario de insumo
async function handleInsumoSubmit(event) {
    event.preventDefault();
    
    try {
        const nombre = document.getElementById('insumoNombre').value.trim();
        if (!nombre) {
            throw new Error('El nombre del insumo es requerido');
        }

        // Obtener ID y determinar si estamos editando
        const insumoId = document.getElementById('insumoId').value;
        console.log(`ID del insumo obtenido del formulario: "${insumoId}"`);
        
        const isEditing = !!insumoId;
        console.log(`¿Estamos en modo edición? ${isEditing}`);
        
        // VALIDACIÓN IMPORTANTE
        if (isEditing && (!insumoId || insumoId === '')) {
            throw new Error('Error interno: ID de insumo no válido para edición');
        }

        const formData = {
            nombre: nombre,
            unidad: document.getElementById('insumoUnidad').value.trim(),
            categoria: document.getElementById('insumoCategoria').value,
            tipo: document.getElementById('insumoTipo').value,
            stock: parseInt(document.getElementById('insumoStock').value) || 0,
            minimo: parseInt(document.getElementById('insumoMinimo').value) || 0
        };
        
        // Si estamos editando, incluir el ID en los datos
        if (isEditing) {
            formData.id = parseInt(insumoId);
        }
        
        // Construir URL según modo
        const url = isEditing ? `/insumos/${insumoId}/` : '/insumos/';
        const method = isEditing ? 'PUT' : 'POST';
        
        console.log(`Modo: ${isEditing ? 'Edición' : 'Creación'}, ID: "${insumoId}"`);
        console.log(`Enviando solicitud ${method} a ${url} con datos:`, formData);
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify(formData)
        });
        
        // Verificar si la respuesta es OK antes de procesarla
        if (!response.ok) {
            // Para errores HTTP, mostrar el estado
            throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);
        }
        
        const responseText = await response.text();
        console.log(`Respuesta del servidor:`, responseText);
        
        // Solo intentar parsear como JSON si hay contenido
        if (!responseText.trim()) {
            throw new Error('Respuesta vacía del servidor');
        }
        
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (error) {
            throw new Error(`Error al procesar la respuesta: ${responseText.substring(0, 100)}...`);
        }
        
        if (data.status === 'success') {
            cerrarModalInsumo();
            loadInsumosContent();
            alert(isEditing ? 'Insumo actualizado correctamente' : 'Insumo creado correctamente');
        } else {
            throw new Error(data.message || 'Error al procesar la solicitud');
        }
    } catch (error) {
        console.error('Error completo:', error);
        alert(`Error: ${error.message}`);
    }
}

// Función para cargar las categorías en el select
async function cargarCategorias() {
    try {
        const response = await fetch('/categorias/');
        const data = await response.json();
        
        if (data.status === 'success') {
            const select = document.getElementById('insumoCategoria');
            if (!select) return;
            
            // Mantener la primera opción (placeholder)
            const firstOption = select.options[0];
            select.innerHTML = '';
            select.appendChild(firstOption);
            
            // Añadir las categorías
            data.categorias.forEach(categoria => {
                const option = document.createElement('option');
                option.value = categoria.nombre;
                option.textContent = categoria.nombre;
                
                option.dataset.icono = categoria.icono;
                option.dataset.colorFondo = categoria.color_fondo;
                option.dataset.colorIcono = categoria.color_icono;
                
                select.appendChild(option);
            });
            
            // Inicializar el select personalizado
            inicializarSelectConIconos('insumoCategoria');
            
            // También actualizar el select de filtro si existe
            const filterSelect = document.getElementById('filterCategoria');
            if (filterSelect) {
                // Mantener la primera opción
                const firstFilterOption = filterSelect.options[0];
                filterSelect.innerHTML = '';
                filterSelect.appendChild(firstFilterOption);
                
                // Añadir las categorías
                data.categorias.forEach(categoria => {
                    const option = document.createElement('option');
                    option.value = categoria.nombre;
                    option.textContent = categoria.nombre;
                    filterSelect.appendChild(option);
                });
            }
        }
    } catch (error) {
        console.error('Error al cargar categorías:', error);
    }
}

// Asegurar que loadInsumosContent esté disponible globalmente
window.loadInsumosContent = loadInsumosContent;