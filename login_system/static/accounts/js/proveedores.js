// Caché para los proveedores
let proveedoresCache = null;
let proveedoresCacheTime = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos en milisegundos

async function loadProveedores(forceRefresh = false) {
    try {
        const now = new Date().getTime();
        
        // Si tenemos proveedores en caché y no han expirado, devolver el caché
        if (!forceRefresh && proveedoresCache && proveedoresCacheTime && (now - proveedoresCacheTime < CACHE_TTL)) {
            return proveedoresCache;
        }
        
        // Si no tenemos caché o ha expirado, cargar desde el servidor
        const response = await fetch('/api/proveedores/');
        const data = await response.json();
        
        if (data.status === 'success') {
            // Actualizar el caché
            proveedoresCache = data.proveedores;
            proveedoresCacheTime = now;
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

async function loadProveedoresContent() {
    try {
        // Crear la estructura de la tabla con header y botón de agregar
        const mainContent = document.querySelector('.main-content');
        mainContent.innerHTML = `
            <div class="proveedores-container" style="background: #ffffff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); padding: 24px; margin-top: 24px;">
                <div class="proveedores-section-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; border-bottom: 1px solid #f1f5f9; padding-bottom: 20px;">
                    <div class="proveedores-header-left">
                        <h1 style="color: #1e293b; margin: 0; font-size: 2rem; font-weight: 700; letter-spacing: -0.02em;">Gestión de Proveedores</h1>
                        <p style="color: #64748b; margin-top: 6px; font-size: 1.05rem; max-width: 550px; line-height: 1.5;">Administra tus proveedores de insumos de manera eficiente y rápida</p>
                    </div>
                    <div class="proveedores-header-actions">
                        <button id="btnNuevoProveedor" class="btn-primary" style="background: linear-gradient(90deg, #3b82f6 0%, #2563eb 100%); color: #ffffff; border: none; padding: 12px 20px; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 0.95rem; box-shadow: 0 4px 12px rgba(37,99,235,0.25); display: flex; align-items: center; gap: 8px; transition: all 0.3s ease; transform: translateY(0);">
                            <i class="fa-solid fa-plus" style="font-size: 0.85rem;"></i> 
                            <span>Nuevo Proveedor</span>
                        </button>
                    </div>
                </div>
                
                <div class="proveedores-filters-section" style="display: flex; gap: 16px; margin: 24px 0; flex-wrap: wrap; background-color: #f8fafc; border-radius: 10px; padding: 20px; border: 1px solid #e2e8f0;">
                    <div class="proveedores-search-box" style="flex: 1; min-width: 260px; position: relative;">
                        <i class="fa-solid fa-search" style="position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: #64748b; font-size: 1rem;"></i>
                        <input type="text" id="searchProveedor" placeholder="Buscar proveedor..." style="width: 100%; padding: 14px 14px 14px 45px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 1rem; box-shadow: 0 2px 5px rgba(0,0,0,0.03); transition: all 0.2s ease; color: #1e293b; font-weight: 500; background: white;">
                    </div>
                    <select id="filterCategoria" class="proveedores-select" style="padding: 12px 18px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #f8fafc; min-width: 190px; font-size: 1rem; color: #1e293b; font-weight: 500; box-shadow: 0 2px 5px rgba(0,0,0,0.03); background-image: url('data:image/svg+xml;utf8,<svg fill=\\'%2364748b\\' height=\\'24\\' viewBox=\\'0 0 24 24\\' width=\\'24\\' xmlns=\\'http://www.w3.org/2000/svg\\'><path d=\\'M7 10l5 5 5-5z\\'/><path d=\\'M0 0h24v24H0z\\' fill=\\'none\\'/></svg>'); background-repeat: no-repeat; background-position: right 12px center; -webkit-appearance: none; -moz-appearance: none; appearance: none; padding-right: 36px;">
                        <option value="todas">Todas las categorías</option>
                    </select>
                    <select id="filterEstado" class="proveedores-select" style="padding: 12px 18px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #f8fafc; min-width: 180px; font-size: 1rem; color: #1e293b; font-weight: 500; box-shadow: 0 2px 5px rgba(0,0,0,0.03); background-image: url('data:image/svg+xml;utf8,<svg fill=\\'%2364748b\\' height=\\'24\\' viewBox=\\'0 0 24 24\\' width=\\'24\\' xmlns=\\'http://www.w3.org/2000/svg\\'><path d=\\'M7 10l5 5 5-5z\\'/><path d=\\'M0 0h24v24H0z\\' fill=\\'none\\'/></svg>'); background-repeat: no-repeat; background-position: right 12px center; -webkit-appearance: none; -moz-appearance: none; appearance: none; padding-right: 36px;">
                        <option value="todos">Todos los estados</option>
                        <option value="activo">Activos</option>
                        <option value="inactivo">Inactivos</option>
                    </select>
                </div>

                <div class="proveedores-table-wrapper" style="overflow-x: auto; margin-top: 10px;">
                    <table id="proveedoresTable" style="width: 100%; border-collapse: collapse; background: #ffffff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); margin-top: 20px; overflow: hidden;">
                        <thead>
                            <tr>
                                <th style="background-color: #f9fafb; color: #4b5563; font-weight: 600; font-size: 0.875rem; text-transform: uppercase; padding: 16px; letter-spacing: 0.05em; text-align: left; border-bottom: 2px solid #e5e7eb;">Nombre Comercial</th>
                                <th style="background-color: #f9fafb; color: #4b5563; font-weight: 600; font-size: 0.875rem; text-transform: uppercase; padding: 16px; letter-spacing: 0.05em; text-align: left; border-bottom: 2px solid #e5e7eb;">Razón Social</th>
                                <th style="background-color: #f9fafb; color: #4b5563; font-weight: 600; font-size: 0.875rem; text-transform: uppercase; padding: 16px; letter-spacing: 0.05em; text-align: left; border-bottom: 2px solid #e5e7eb;">RFC</th>
                                <th style="background-color: #f9fafb; color: #4b5563; font-weight: 600; font-size: 0.875rem; text-transform: uppercase; padding: 16px; letter-spacing: 0.05em; text-align: left; border-bottom: 2px solid #e5e7eb;">Contacto</th>
                                <th style="background-color: #f9fafb; color: #4b5563; font-weight: 600; font-size: 0.875rem; text-transform: uppercase; padding: 16px; letter-spacing: 0.05em; text-align: left; border-bottom: 2px solid #e5e7eb;">Teléfono</th>
                                <th style="background-color: #f9fafb; color: #4b5563; font-weight: 600; font-size: 0.875rem; text-transform: uppercase; padding: 16px; letter-spacing: 0.05em; text-align: left; border-bottom: 2px solid #e5e7eb;">Email</th>
                                <th style="background-color: #f9fafb; color: #4b5563; font-weight: 600; font-size: 0.875rem; text-transform: uppercase; padding: 16px; letter-spacing: 0.05em; text-align: left; border-bottom: 2px solid #e5e7eb;">Forma de Pago</th>
                                <th style="background-color: #f9fafb; color: #4b5563; font-weight: 600; font-size: 0.875rem; text-transform: uppercase; padding: 16px; letter-spacing: 0.05em; text-align: center; border-bottom: 2px solid #e5e7eb;">Estado</th>
                                <th style="background-color: #f9fafb; color: #4b5563; font-weight: 600; font-size: 0.875rem; text-transform: uppercase; padding: 16px; letter-spacing: 0.05em; text-align: center; border-bottom: 2px solid #e5e7eb;">Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="proveedoresTableBody">
                            <tr>
                                <td colspan="9" style="text-align: center; padding: 20px; color: #6b7280; background-color: white;">Cargando proveedores...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        // Añadir el HTML del modal al documento
        if (!document.getElementById('proveedorModal')) {
            const proveedorModalHtml = createProveedorModalHtml();
            document.body.insertAdjacentHTML('beforeend', proveedorModalHtml);
        }

        // Luego cargar los datos
        const proveedores = await loadProveedores(true);
        renderProveedoresTable(proveedores);
        
        // Configurar el evento click para el botón "Nuevo Proveedor"
        document.getElementById('btnNuevoProveedor').addEventListener('click', showProveedorModal);
        
        // Configurar el filtro de búsqueda
        document.getElementById('searchProveedor').addEventListener('input', filterProveedores);
        document.getElementById('filterCategoria').addEventListener('change', filterProveedores);
        document.getElementById('filterEstado').addEventListener('change', filterProveedores);
        
    } catch (error) {
        console.error('Error:', error);
        const mainContent = document.querySelector('.main-content');
        mainContent.innerHTML = `
            <div class="error-message">
                <h2>Error al cargar proveedores</h2>
                <p>${error.message}</p>
                <button class="btn-primary" onclick="loadProveedoresContent()">
                    <i class="fa-solid fa-sync"></i> Reintentar
                </button>
            </div>
        `;
    }
}

// Función para renderizar la tabla de proveedores
function renderProveedoresTable(proveedores) {
    const tbody = document.getElementById('proveedoresTableBody');
    
    if (!tbody || !proveedores) return;
    
    if (proveedores.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align: center; padding: 20px; color: #6b7280; background-color: white;">No hay proveedores registrados.</td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = proveedores.map(proveedor => `
        <tr data-id="${proveedor.id}" style="background-color: white;">
            <td style="padding: 16px; border-bottom: 1px solid #f3f4f6; vertical-align: middle; background-color: white;">
                <div style="font-weight: 600; color: #000000; font-size: 1rem;">${proveedor.nombre}</div>
            </td>
            <td style="padding: 16px; border-bottom: 1px solid #f3f4f6; vertical-align: middle; color: #000000; background-color: white;">${proveedor.razon_social || ''}</td>
            <td style="padding: 16px; border-bottom: 1px solid #f3f4f6; vertical-align: middle; color: #000000; background-color: white;">${proveedor.rfc || ''}</td>
            <td style="padding: 16px; border-bottom: 1px solid #f3f4f6; vertical-align: middle; color: #000000; background-color: white;">${proveedor.contacto || ''}</td>
            <td style="padding: 16px; border-bottom: 1px solid #f3f4f6; vertical-align: middle; color: #000000; background-color: white;">${proveedor.telefono || ''}</td>
            <td style="padding: 16px; border-bottom: 1px solid #f3f4f6; vertical-align: middle; color: #000000; background-color: white;">${proveedor.email || ''}</td>
            <td style="padding: 16px; border-bottom: 1px solid #f3f4f6; vertical-align: middle; color: #000000; background-color: white;">${proveedor.forma_pago_preferida || 'Transferencia'}</td>
            <td style="padding: 16px; border-bottom: 1px solid #f3f4f6; vertical-align: middle; text-align: center; background-color: white;">
                <span style="display: inline-block; padding: 4px 10px; border-radius: 20px; font-size: 0.85rem; font-weight: 500; min-width: 70px; text-align: center; background-color: ${proveedor.activo ? '#ecfdf5' : '#f3f4f6'}; color: ${proveedor.activo ? '#047857' : '#6b7280'};">
                    ${proveedor.activo ? 'Activo' : 'Inactivo'}
                </span>
            </td>
            <td style="padding: 16px; border-bottom: 1px solid #f3f4f6; vertical-align: middle; background-color: white;">
                <div style="display: flex; gap: 8px; justify-content: center;">
                    <button class="btn-icon" style="width: 32px; height: 32px; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; color: #6b7280; background: #f3f4f6; border: none; cursor: pointer;" title="Ver productos" onclick="verProductosProveedor(${proveedor.id})">
                        <i class="fa-solid fa-box-open"></i>
                    </button>
                    <button class="btn-icon" style="width: 32px; height: 32px; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; color: #3b82f6; background: #eff6ff; border: none; cursor: pointer;" title="Editar" onclick="editProveedor(${proveedor.id})">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button class="btn-icon" style="width: 32px; height: 32px; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; color: #ef4444; background: #fef2f2; border: none; cursor: pointer;" title="Eliminar" onclick="deleteProveedor(${proveedor.id}, '${proveedor.nombre.replace("'", "\\'")}')">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Función para crear el HTML del modal de proveedor con los nuevos campos
function createProveedorModalHtml() {
    return `
    <div id="proveedorModal" class="modal" style="display:none; position: fixed; z-index: 9999; left: 0; top: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.6); align-items: center; justify-content: center;">
        <div class="modal-content" style="background-color: #fff; padding: 40px; border-radius: 16px; width: 95%; max-width: 1200px; max-height: 95vh; min-height: 80vh; overflow-y: auto; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3); position: relative; margin: 2.5vh auto;">
            <span class="close-modal" id="closeProveedorModal" style="position: absolute; right: 20px; top: 20px; font-size: 28px; cursor: pointer; color: #6b7280;">&times;</span>
            <h2 id="proveedorModalTitle" style="color: #1f2937; margin-top: 0; margin-bottom: 24px; font-size: 1.5rem; border-bottom: 1px solid #e5e7eb; padding-bottom: 12px;">Nuevo Proveedor</h2>
            <form id="proveedorForm" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
                <input type="hidden" id="proveedorId" name="proveedorId">

                <div class="form-group" style="display: flex; flex-direction: column;">
                    <label for="proveedorNombre" style="color: #4b5563; margin-bottom: 6px; font-weight: 500;">Nombre comercial: *</label>
                    <input type="text" id="proveedorNombre" name="nombre" required style="padding: 10px 12px; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 0.95rem;">
                </div>
                
                <div class="form-group" style="display: flex; flex-direction: column;">
                    <label for="proveedorRazonSocial" style="color: #4b5563; margin-bottom: 6px; font-weight: 500;">Razón social:</label>
                    <input type="text" id="proveedorRazonSocial" name="razon_social" style="padding: 10px 12px; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 0.95rem;">
                </div>
                
                <div class="form-group" style="display: flex; flex-direction: column;">
                    <label for="proveedorRFC" style="color: #4b5563; margin-bottom: 6px; font-weight: 500;">RFC:</label>
                    <input type="text" id="proveedorRFC" name="rfc" style="padding: 10px 12px; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 0.95rem;">
                </div>
                
                <div class="form-group" style="display: flex; flex-direction: column;">
                    <label for="proveedorContacto" style="color: #4b5563; margin-bottom: 6px; font-weight: 500;">Persona de contacto:</label>
                    <input type="text" id="proveedorContacto" name="contacto" style="padding: 10px 12px; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 0.95rem;">
                </div>
                
                <div class="form-group" style="display: flex; flex-direction: column;">
                    <label for="proveedorTelefono" style="color: #4b5563; margin-bottom: 6px; font-weight: 500;">Teléfono:</label>
                    <input type="text" id="proveedorTelefono" name="telefono" style="padding: 10px 12px; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 0.95rem;">
                </div>
                
                <div class="form-group" style="display: flex; flex-direction: column;">
                    <label for="proveedorEmail" style="color: #4b5563; margin-bottom: 6px; font-weight: 500;">Email:</label>
                    <input type="email" id="proveedorEmail" name="email" style="padding: 10px 12px; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 0.95rem;">
                </div>
                
                <div class="form-group" style="display: flex; flex-direction: column;">
                    <label for="proveedorFormaPago" style="color: #4b5563; margin-bottom: 6px; font-weight: 500;">Forma de pago preferida:</label>
                    <select id="proveedorFormaPago" name="forma_pago_preferida" style="padding: 10px 12px; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 0.95rem; background-color: white;">
                        <option value="Efectivo">Efectivo</option>
                        <option value="Transferencia" selected>Transferencia</option>
                        <option value="Crédito">Crédito</option>
                    </select>
                </div>
                
                <div class="form-group" style="display: flex; flex-direction: column;">
                    <label for="proveedorDiasCredito" style="color: #4b5563; margin-bottom: 6px; font-weight: 500;">Días de crédito:</label>
                    <input type="number" id="proveedorDiasCredito" name="dias_credito" min="0" style="padding: 10px 12px; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 0.95rem;">
                </div>
                
                <div class="form-group" style="display: flex; flex-direction: column; grid-column: span 2;">
                    <label for="proveedorDireccion" style="color: #4b5563; margin-bottom: 6px; font-weight: 500;">Dirección:</label>
                    <input type="text" id="proveedorDireccion" name="direccion" style="padding: 10px 12px; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 0.95rem;">
                </div>
                
                <div class="form-group" style="display: flex; flex-direction: column;">
                    <label for="proveedorCiudad" style="color: #4b5563; margin-bottom: 6px; font-weight: 500;">Ciudad/Estado:</label>
                    <input type="text" id="proveedorCiudad" name="ciudad_estado" style="padding: 10px 12px; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 0.95rem;">
                </div>
                
                <div class="form-group" style="display: flex; flex-direction: column;">
                    <label for="proveedorCategoria" style="color: #4b5563; margin-bottom: 6px; font-weight: 500;">Categoría de productos:</label>
                    <input type="text" id="proveedorCategoria" name="categoria" style="padding: 10px 12px; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 0.95rem;">
                </div>
                
                <div class="form-group" style="display: flex; flex-direction: column; grid-column: span 2;">
                    <label for="proveedorNotas" style="color: #4b5563; margin-bottom: 6px; font-weight: 500;">Notas adicionales:</label>
                    <textarea id="proveedorNotas" name="notas" rows="3" style="padding: 10px 12px; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 0.95rem; resize: vertical; min-height: 80px;"></textarea>
                </div>
                
                <div class="form-group" style="display: flex; flex-direction: column; grid-column: span 2;">
                    <div style="display: flex; align-items: center;">
                        <input type="checkbox" id="proveedorActivo" name="activo" checked style="width: 16px; height: 16px; margin-right: 10px; accent-color: #3b82f6; cursor: pointer;">
                        <label for="proveedorActivo" style="color: #4b5563; cursor: pointer; user-select: none;">Proveedor activo</label>
                    </div>
                </div>
                
                <div class="form-actions" style="grid-column: span 2; display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
                    <button type="submit" class="btn-primary" style="background: linear-gradient(90deg, #3b82f6 0%, #2563eb 100%); color: #ffffff; border: none; padding: 0.75rem 1.5rem; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 0.925rem; box-shadow: 0 2px 8px rgba(37,99,235,0.2);">Guardar</button>
                    <button type="button" class="btn-secondary" id="cancelProveedorBtn" style="background: #f3f4f6; color: #4b5563; border: none; padding: 0.75rem 1.5rem; border-radius: 6px; cursor: pointer; font-weight: 500; font-size: 0.925rem; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">Cancelar</button>
                </div>
            </form>
        </div>
    </div>`;
}

// Función para obtener el token CSRF
function getCsrfToken() {
    const tokenElement = document.querySelector('[name=csrfmiddlewaretoken]');
    if (tokenElement) {
        return tokenElement.value;
    }
    
    // Si no hay elemento con el token, intentar leerlo de las cookies
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.startsWith('csrftoken=')) {
            return cookie.substring('csrftoken='.length);
        }
    }
    
    console.error('No se pudo encontrar el token CSRF');
    return '';
}

// Función para mostrar el modal de proveedor
function showProveedorModal(proveedor = null) {
    const modal = document.getElementById('proveedorModal');
    if (modal) {
        // Limpiar el formulario
        document.getElementById('proveedorForm').reset();
        document.getElementById('proveedorId').value = '';
        
        // Título según sea nuevo o edición
        document.getElementById('proveedorModalTitle').textContent = proveedor ? 'Editar Proveedor' : 'Nuevo Proveedor';
        
        // Si es edición, llenar el formulario
        if (proveedor) {
            document.getElementById('proveedorId').value = proveedor.id || '';
            document.getElementById('proveedorNombre').value = proveedor.nombre || '';
            document.getElementById('proveedorRazonSocial').value = proveedor.razon_social || '';
            document.getElementById('proveedorRFC').value = proveedor.rfc || '';
            document.getElementById('proveedorContacto').value = proveedor.contacto || '';
            document.getElementById('proveedorTelefono').value = proveedor.telefono || '';
            document.getElementById('proveedorEmail').value = proveedor.email || '';
            document.getElementById('proveedorFormaPago').value = proveedor.forma_pago_preferida || 'Transferencia';
            document.getElementById('proveedorDiasCredito').value = proveedor.dias_credito || '';
            document.getElementById('proveedorDireccion').value = proveedor.direccion || '';
            document.getElementById('proveedorCiudad').value = proveedor.ciudad_estado || '';
            document.getElementById('proveedorCategoria').value = proveedor.categoria || '';
            document.getElementById('proveedorNotas').value = proveedor.notas || '';
            document.getElementById('proveedorActivo').checked = !!proveedor.activo;
        }
        
        // Mostrar el modal
        modal.style.display = 'flex';
        
        // Configurar eventos
        document.getElementById('closeProveedorModal').addEventListener('click', closeProveedorModal);
        document.getElementById('cancelProveedorBtn').addEventListener('click', closeProveedorModal);
        document.getElementById('proveedorForm').addEventListener('submit', handleProveedorSubmit);
        
        // Cerrar modal al hacer clic fuera
        window.addEventListener('click', (e) => {
            if (e.target === modal) closeProveedorModal();
        });
    }
}

// Función para cerrar el modal
function closeProveedorModal() {
    const modal = document.getElementById('proveedorModal');
    if (modal) {
        modal.style.display = 'none';
        
        // Remover event listeners para evitar duplicados
        document.getElementById('proveedorForm').removeEventListener('submit', handleProveedorSubmit);
        document.getElementById('closeProveedorModal').removeEventListener('click', closeProveedorModal);
        document.getElementById('cancelProveedorBtn').removeEventListener('click', closeProveedorModal);
    }
}

// Función para manejar el envío del formulario
async function handleProveedorSubmit(event) {
    event.preventDefault();
    
    try {
        // Validar nombre
        const nombre = document.getElementById('proveedorNombre').value.trim();
        if (!nombre) {
            throw new Error('El nombre comercial del proveedor es requerido');
        }

        // Recopilar datos del formulario
        const formData = {
            nombre: nombre,
            razon_social: document.getElementById('proveedorRazonSocial').value.trim(),
            rfc: document.getElementById('proveedorRFC').value.trim(),
            contacto: document.getElementById('proveedorContacto').value.trim(),
            telefono: document.getElementById('proveedorTelefono').value.trim(),
            email: document.getElementById('proveedorEmail').value.trim(),
            forma_pago_preferida: document.getElementById('proveedorFormaPago').value.trim(),
            dias_credito: document.getElementById('proveedorDiasCredito').value ? parseInt(document.getElementById('proveedorDiasCredito').value) : null,
            direccion: document.getElementById('proveedorDireccion').value.trim(),
            ciudad_estado: document.getElementById('proveedorCiudad').value.trim(),
            categoria: document.getElementById('proveedorCategoria').value.trim(),
            notas: document.getElementById('proveedorNotas').value.trim(),
            activo: document.getElementById('proveedorActivo').checked
        };
        
        const proveedorId = document.getElementById('proveedorId').value;
        // Fix: Only consider it as editing if ID exists and is not empty
        const isEditing = proveedorId && proveedorId.trim() !== '';
        
        // Only add ID to formData if we're editing an existing provider
        if (isEditing) {
            formData.id = parseInt(proveedorId);
        }
        
        const method = isEditing ? 'PUT' : 'POST';
        
        console.log('Enviando solicitud:', {
            method: method,
            isEditing: isEditing,
            formData: formData
        });
        
        const response = await fetch('/api/proveedores/', {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCsrfToken()
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (data.status === 'success') {
            closeProveedorModal();
            await loadProveedoresContent(); // Recargar la tabla
            
            // Mostrar mensaje de éxito
            showNotification(isEditing ? 'Proveedor actualizado correctamente' : 'Proveedor creado correctamente');
        } else {
            throw new Error(data.message || 'Error al procesar la solicitud');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification(`Error: ${error.message}`, 'error');
    }
}

// Función para filtrar proveedores
function filterProveedores() {
    const searchTerm = document.getElementById('searchProveedor').value.toLowerCase();
    const categoriaFilter = document.getElementById('filterCategoria').value;
    const estadoFilter = document.getElementById('filterEstado').value;
    
    if (!proveedoresCache) return;
    
    const filteredProveedores = proveedoresCache.filter(proveedor => {
        // Filtrar por término de búsqueda
        const matchesSearch = 
            proveedor.nombre.toLowerCase().includes(searchTerm) ||
            (proveedor.razon_social && proveedor.razon_social.toLowerCase().includes(searchTerm)) ||
            (proveedor.rfc && proveedor.rfc.toLowerCase().includes(searchTerm)) ||
            (proveedor.contacto && proveedor.contacto.toLowerCase().includes(searchTerm));
        
        // Filtrar por categoría
        const matchesCategoria = categoriaFilter === 'todas' || 
            (proveedor.categoria && proveedor.categoria === categoriaFilter);
            
        // Filtrar por estado
        const matchesEstado = estadoFilter === 'todos' || 
            (estadoFilter === 'activo' && proveedor.activo) || 
            (estadoFilter === 'inactivo' && !proveedor.activo);
            
        return matchesSearch && matchesCategoria && matchesEstado;
    });
    
    renderProveedoresTable(filteredProveedores);
}

// Función para editar un proveedor
async function editProveedor(id) {
    try {
        if (!id || isNaN(parseInt(id))) {
            throw new Error('ID de proveedor inválido');
        }
        
        const proveedores = await loadProveedores();
        const proveedor = proveedores.find(p => p.id === id);
        
        if (proveedor) {
            console.log('Editando proveedor:', proveedor);
            showProveedorModal(proveedor);
        } else {
            showNotification('Proveedor no encontrado', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error al cargar el proveedor', 'error');
    }
}

// Función para eliminar un proveedor
async function deleteProveedor(id, nombre) {
    if (confirm(`¿Estás seguro de eliminar al proveedor "${nombre}"? Esta acción no se puede deshacer.`)) {
        try {
            const response = await fetch('/api/proveedores/', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCsrfToken()
                },
                body: JSON.stringify({ id })
            });
            
            const data = await response.json();
            
            if (data.status === 'success') {
                await loadProveedoresContent(); // Recargar la tabla
                showNotification('Proveedor eliminado correctamente');
            } else {
                throw new Error(data.message || 'Error al eliminar el proveedor');
            }
        } catch (error) {
            console.error('Error:', error);
            showNotification(`Error: ${error.message}`, 'error');
        }
    }
}

// Función para ver productos asociados a un proveedor
async function verProductosProveedor(id) {
    try {
        // Obtener productos del proveedor
        const responseProductos = await fetch(`/api/proveedores/${id}/productos/`);
        const dataProductos = await responseProductos.json();
        
        // Obtener todos los insumos disponibles
        const responseInsumos = await fetch('/insumos/');
        const dataInsumos = await responseInsumos.json();
        
        if (dataProductos.status === 'success') {
            // Mostrar modal con los productos e insumos
            showProductosModal(
                dataProductos.productos, 
                dataProductos.proveedor_nombre, 
                id, 
                dataInsumos.status === 'success' ? dataInsumos.insumos : []
            );
        } else {
            throw new Error(dataProductos.message || 'Error al cargar los productos');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification(`Error: ${error.message}`, 'error');
    }
}

// Función para cerrar el modal de productos
function closeProductosModal() {
    const productosModal = document.getElementById('productosModal');
    if (productosModal) {
        productosModal.style.display = 'none';
    }
}

function showProductosModal(productos, proveedorNombre, proveedorId, insumos = []) {
    // Crear modal si no existe
    let productosModal = document.getElementById('productosModal');
    if (!productosModal) {
        const modalHTML = `
            <div id="productosModal" class="modal" style="display:none; position: fixed; z-index: 9999; left: 0; top: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.6); align-items: center; justify-content: center;">
                <div class="modal-content" style="background-color: #fff; padding: 30px; border-radius: 12px; width: 90%; max-width: 800px; max-height: 90vh; overflow-y: auto; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2); position: relative;">
                    <span class="close-modal" id="closeProductosModal" style="position: absolute; right: 20px; top: 20px; font-size: 28px; cursor: pointer; color: #6b7280; transition: color 0.2s;">&times;</span>
                    <h2 style="color: #1e293b; margin-top: 0; margin-bottom: 24px; font-size: 1.5rem; border-bottom: 1px solid #e5e7eb; padding-bottom: 12px;">Productos de <span id="proveedorNombreTitle" style="color: #2563eb;"></span></h2>
                    
                    <div class="modal-tabs" style="display: flex; margin-bottom: 20px; border-bottom: 1px solid #e5e7eb;">
                        <div class="tab active" id="tabProductos" style="padding: 10px 15px; cursor: pointer; font-weight: 500; border-bottom: 2px solid #3b82f6; color: #1e293b;">Productos actuales</div>
                        <div class="tab" id="tabInsumos" style="padding: 10px 15px; cursor: pointer; font-weight: 500; color: #64748b;">Asignar insumos</div>
                    </div>
                    
                    <div id="productosContent" style="color: #1e293b;">
                        <div class="productos-list" id="productosListContainer">
                            <!-- Se rellenará dinámicamente -->
                        </div>
                    </div>
                    
                    <div id="insumosContent" style="display: none;">
                        <div style="margin-bottom: 15px;">
                            <div style="position: relative;">
                                <i class="fa-solid fa-search" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #64748b;"></i>
                                <input type="text" id="searchInsumos" placeholder="Buscar insumos..." style="padding: 12px 12px 12px 38px; border: 1px solid #e2e8f0; border-radius: 8px; width: 100%; color: #1e293b; font-size: 0.95rem; box-shadow: 0 2px 4px rgba(0,0,0,0.03);">
                            </div>
                        </div>
                        
                        <div class="insumos-list" id="insumosListContainer" style="max-height: 350px; overflow-y: auto; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 20px; background-color: #f8fafc;">
                            <!-- Se rellenará dinámicamente -->
                        </div>
                        
                        <button type="button" class="btn-primary" id="asignarInsumosBtn" style="background: linear-gradient(90deg, #3b82f6 0%, #2563eb 100%); color: #ffffff; border: none; padding: 0.75rem 1.5rem; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 0.925rem; box-shadow: 0 2px 8px rgba(37,99,235,0.2);">
                            <i class="fa-solid fa-link"></i> Asignar Insumos Seleccionados
                        </button>
                    </div>
                    
                    <div class="form-actions" style="margin-top: 24px; display: flex; justify-content: flex-end;">
                        <button type="button" class="btn-secondary" id="closeProductosBtn" style="background: #f1f5f9; color: #475569; border: none; padding: 0.75rem 1.5rem; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 0.95rem; transition: all 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">Cerrar</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        productosModal = document.getElementById('productosModal');
        
        // Añadir eventos
        document.getElementById('closeProductosModal').addEventListener('click', closeProductosModal);
        document.getElementById('closeProductosBtn').addEventListener('click', closeProductosModal);
        
        // Eventos para las pestañas
        document.getElementById('tabProductos').addEventListener('click', () => {
            document.getElementById('productosContent').style.display = 'block';
            document.getElementById('insumosContent').style.display = 'none';
            document.getElementById('tabProductos').classList.add('active');
            document.getElementById('tabProductos').style.borderBottom = '2px solid #3b82f6';
            document.getElementById('tabProductos').style.color = '#1e293b';
            document.getElementById('tabInsumos').classList.remove('active');
            document.getElementById('tabInsumos').style.borderBottom = 'none';
            document.getElementById('tabInsumos').style.color = '#64748b';
        });
        
        document.getElementById('tabInsumos').addEventListener('click', () => {
            document.getElementById('productosContent').style.display = 'none';
            document.getElementById('insumosContent').style.display = 'block';
            document.getElementById('tabInsumos').classList.add('active');
            document.getElementById('tabInsumos').style.borderBottom = '2px solid #3b82f6';
            document.getElementById('tabInsumos').style.color = '#1e293b';
            document.getElementById('tabProductos').classList.remove('active');
            document.getElementById('tabProductos').style.borderBottom = 'none';
            document.getElementById('tabProductos').style.color = '#64748b';
        });
        
        // Evento para el botón asignar
        document.getElementById('asignarInsumosBtn').addEventListener('click', () => {
            asignarInsumosAProveedor(proveedorId);
        });
        
        // Filtrar insumos
        document.getElementById('searchInsumos').addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const insumosItems = document.querySelectorAll('.insumo-item');
            
            insumosItems.forEach(item => {
                const insumoNombre = item.querySelector('.insumo-nombre').textContent.toLowerCase();
                if (insumoNombre.includes(searchTerm)) {
                    item.style.display = 'flex';
                } else {
                    item.style.display = 'none';
                }
            });
        });
        
        // Evento para cerrar el modal haciendo clic fuera
        window.addEventListener('click', (e) => {
            if (e.target === productosModal) {
                closeProductosModal();
            }
        });
    }
    
    // Guardar el ID del proveedor
    productosModal.dataset.proveedorId = proveedorId;
    
    // Rellenar datos
    document.getElementById('proveedorNombreTitle').textContent = proveedorNombre;
    
    // Llenar contenedor de productos actuales
    const productosContainer = document.getElementById('productosListContainer');
    if (productos.length === 0) {
        productosContainer.innerHTML = `
            <div style="padding: 40px 20px; text-align: center; background-color: #f8fafc; border-radius: 8px; border: 1px dashed #cbd5e1;">
                <div style="margin-bottom: 16px; color: #94a3b8;">
                    <i class="fa-solid fa-box-open" style="font-size: 2.5rem;"></i>
                </div>
                <p style="color: #64748b; font-size: 1.05rem; margin: 0;">Este proveedor no tiene productos asociados.</p>
            </div>`;
    } else {
        productosContainer.innerHTML = `
            <div class="table-responsive" style="border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid #e2e8f0;">
                <table class="productos-table" style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr>
                            <th style="text-align: left; padding: 16px; border-bottom: 1px solid #e2e8f0; background-color: #f8fafc; color: #475569; font-weight: 600; font-size: 0.875rem;">Nombre</th>
                            <th style="text-align: left; padding: 16px; border-bottom: 1px solid #e2e8f0; background-color: #f8fafc; color: #475569; font-weight: 600; font-size: 0.875rem;">Categoría</th>
                            <th style="text-align: left; padding: 16px; border-bottom: 1px solid #e2e8f0; background-color: #f8fafc; color: #475569; font-weight: 600; font-size: 0.875rem;">Costo</th>
                            <th style="text-align: left; padding: 16px; border-bottom: 1px solid #e2e8f0; background-color: #f8fafc; color: #475569; font-weight: 600; font-size: 0.875rem;">Unidad</th>
                            <th style="text-align: center; padding: 16px; border-bottom: 1px solid #e2e8f0; background-color: #f8fafc; color: #475569; font-weight: 600; font-size: 0.875rem;">Es Principal</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${productos.map((prod, index) => `
                            <tr style="background-color: ${index % 2 === 0 ? '#ffffff' : '#f8fafc'}; transition: background-color 0.2s;">
                                <td style="padding: 14px 16px; border-bottom: 1px solid #e2e8f0; color: #1e293b; font-weight: 500;">${prod.nombre}</td>
                                <td style="padding: 14px 16px; border-bottom: 1px solid #e2e8f0; color: #475569;">${prod.categoria || 'No especificada'}</td>
                                <td style="padding: 14px 16px; border-bottom: 1px solid #e2e8f0; color: #1e293b; font-weight: 500;">$${prod.costo_unitario.toFixed(2)}</td>
                                <td style="padding: 14px 16px; border-bottom: 1px solid #e2e8f0; color: #475569;">${prod.unidad || 'N/A'}</td>
                                <td style="padding: 14px 16px; border-bottom: 1px solid #e2e8f0; text-align: center;">
                                    <span style="display: inline-block; padding: 4px 10px; border-radius: 20px; font-size: 0.85rem; font-weight: 500; min-width: 90px; text-align: center; background-color: ${prod.es_principal ? '#ecfdf5' : '#f1f5f9'}; color: ${prod.es_principal ? '#047857' : '#64748b'};">
                                        ${prod.es_principal ? 'Principal' : 'Secundario'}
                                    </span>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            <div style="margin-top: 12px; text-align: right; color: #64748b; font-size: 0.9rem;">
                Total: ${productos.length} producto${productos.length !== 1 ? 's' : ''}
            </div>
        `;
    }
    
    // Llenar contenedor de insumos
    const insumosContainer = document.getElementById('insumosListContainer');
    if (insumos && insumos.length > 0) {
        insumosContainer.innerHTML = insumos.map(insumo => `
    <div class="insumo-item" style="display: flex; align-items: center; padding: 16px 20px; border-bottom: 1px solid #f1f5f9; transition: all 0.2s ease; background-color: white; gap: 20px; border-radius: 8px; margin-bottom: 4px;">
        <!-- Checkbox minimalista -->
        <div style="display: flex; align-items: center; margin-right: 8px;">
            <input type="checkbox" class="insumo-checkbox" value="${insumo.id}" 
                style="width: 18px; height: 18px; accent-color: #6366f1; cursor: pointer; border-radius: 3px;" 
                onchange="toggleCostoInput(this)">
        </div>
        
        <!-- Información del insumo -->
        <div style="flex-grow: 1; min-width: 0; margin-right: 20px;">
            <div class="insumo-nombre" style="font-weight: 600; color: #1f2937; font-size: 0.95rem; margin-bottom: 6px;">${insumo.nombre}</div>
        </div>
        
        <!-- Contenedor de etiquetas minimalistas con mayor separación -->
        <div style="display: flex; align-items: center; gap: 12px; flex-wrap: nowrap; margin-right: 20px;">
            <!-- Etiqueta de Categoría -->
            <div style="background-color: #f3f4f6; color: #6b7280; padding: 4px 10px; border-radius: 14px; font-size: 0.75rem; font-weight: 500; display: flex; align-items: center; gap: 5px; white-space: nowrap; border: 1px solid #e5e7eb; min-width: 80px; justify-content: center;">
                <i class="fa-solid fa-tag" style="font-size: 0.65rem;"></i>
                <span>${insumo.categoria}</span>
            </div>
            
            <!-- Etiqueta de Unidad -->
            <div style="background-color: #f0fdf4; color: #16a34a; padding: 4px 10px; border-radius: 14px; font-size: 0.75rem; font-weight: 500; display: flex; align-items: center; gap: 5px; white-space: nowrap; border: 1px solid #dcfce7; min-width: 70px; justify-content: center;">
                <i class="fa-solid fa-balance-scale" style="font-size: 0.65rem;"></i>
                <span>${insumo.unidad}</span>
            </div>
            
            <!-- Etiqueta de Stock -->
            <div style="background-color: #fef3c7; color: #d97706; padding: 4px 10px; border-radius: 14px; font-size: 0.75rem; font-weight: 500; display: flex; align-items: center; gap: 5px; white-space: nowrap; border: 1px solid #fde68a; min-width: 80px; justify-content: center;">
                <i class="fa-solid fa-cubes" style="font-size: 0.65rem;"></i>
                <span>${insumo.stock}</span>
            </div>
        </div>
        
        <!-- Input de costo minimalista -->
        <div style="min-width: 130px;">
            <div class="costo-container" style="display: flex; align-items: center; background-color: #f9fafb; padding: 0 10px; border-radius: 8px; border: 1px solid #e5e7eb; transition: all 0.2s ease;">
                <span style="color: #9ca3af; margin-right: 4px; font-weight: 500; font-size: 0.9rem;">$</span>
                <input type="number" class="insumo-costo" step="0.01" min="0" placeholder="0.00" disabled 
                    style="padding: 10px 0; border: none; outline: none; width: 100%; background-color: transparent; font-size: 0.9rem; color: #1f2937; font-weight: 500;" 
                    data-insumo-id="${insumo.id}">
            </div>
        </div>
    </div>
`).join('');
    } else {
        insumosContainer.innerHTML = `
        <div style="padding: 40px 20px; text-align: center; color: #64748b; background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border-radius: 12px; border: 2px dashed #cbd5e1;">
            <div style="margin-bottom: 16px; color: #94a3b8;">
                <i class="fa-solid fa-cubes" style="font-size: 3rem;"></i>
            </div>
            <h3 style="margin: 0 0 8px 0; color: #475569; font-weight: 600;">No hay insumos disponibles</h3>
            <p style="margin: 0; font-size: 0.95rem;">Agrega insumos al sistema para poder asignarlos a proveedores.</p>
        </div>`;
    }
    
    // Añadir mensaje de instrucción
    document.getElementById('insumosContent').insertAdjacentHTML('afterbegin', `
        <div style="margin-bottom: 15px; padding: 10px; background-color: #eff6ff; border-radius: 6px; border-left: 4px solid #3b82f6;">
            <p style="margin: 0; color: #1e40af; font-size: 0.95rem;">
                <i class="fa-solid fa-info-circle" style="margin-right: 5px;"></i>
                Selecciona los insumos que provee este proveedor y asigna sus costos unitarios. El costo se habilita automáticamente al marcar la casilla.
            </p>
        </div>
    `);
    
    // Prerellenar costos existentes si el insumo ya está asignado al proveedor
    if (productos && productos.length > 0) {
        setTimeout(() => {
            document.querySelectorAll('.insumo-item').forEach(item => {
                const checkbox = item.querySelector('.insumo-checkbox');
                const insumoId = checkbox.value;
                const existingProducto = productos.find(p => p.insumo_id == insumoId);
                
                if (existingProducto) {
                    checkbox.checked = true;
                    const costoInput = item.querySelector('.insumo-costo');
                    costoInput.value = existingProducto.costo_unitario.toFixed(2);
                    toggleCostoInput(checkbox);
                }
            });
        }, 100);
    }
    
    // Mostrar modal
    productosModal.style.display = 'flex';
}

// Función para asignar insumos al proveedor
async function asignarInsumosAProveedor(proveedorId) {
    try {
        // Crear un array para almacenar los datos de los insumos seleccionados
        const insumosData = [];
        
        // Recorrer todos los checkboxes seleccionados
        document.querySelectorAll('.insumo-checkbox:checked').forEach(checkbox => {
            const insumoId = checkbox.value;
            const costoInput = checkbox.closest('.insumo-item').querySelector('.insumo-costo');
            const costo = parseFloat(costoInput.value) || 0;
            
            // Validar que el costo sea un número válido
            if (isNaN(costo) || costo < 0) {
                throw new Error(`Por favor ingresa un costo válido para todos los insumos seleccionados`);
            }
            
            insumosData.push({
                id: insumoId,
                costo: costo
            });
        });
        
        if (insumosData.length === 0) {
            showNotification('Selecciona al menos un insumo para asignar', 'error');
            return;
        }
        
        // Enviar la solicitud para asignar insumos con sus costos
        const response = await fetch(`/api/proveedores/${proveedorId}/asignar-insumos/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCsrfToken()
            },
            body: JSON.stringify({
                insumos: insumosData
            })
        });
        
        const data = await response.json();
        
        if (data.status === 'success') {
            showNotification('Insumos asignados correctamente');
            
            // Actualizar la lista de productos
            verProductosProveedor(proveedorId);
            
            // Cambiar a la pestaña de productos
            document.getElementById('tabProductos').click();
        } else {
            throw new Error(data.message || 'Error al asignar insumos');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification(`Error: ${error.message}`, 'error');
    }
}

// Función para mostrar notificaciones
function showNotification(message, type = 'success') {
    // Si no existe el elemento de notificación, lo creamos
    let notification = document.getElementById('proveedorNotification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'proveedorNotification';
        notification.style.position = 'fixed';
        notification.style.bottom = '20px';
        notification.style.right = '20px';
        notification.style.padding = '10px 20px';
        notification.style.borderRadius = '4px';
        notification.style.color = 'white';
        notification.style.fontWeight = '500';
        notification.style.zIndex = '9999';
        notification.style.boxShadow = '0 3px 10px rgba(0,0,0,0.2)';
        document.body.appendChild(notification);
    }
    
    // Establecer estilo según el tipo
    notification.style.backgroundColor = type === 'success' ? '#10b981' : '#ef4444';
    notification.textContent = message;
    
    // Mostrar la notificación
    notification.style.display = 'block';
    
    // Ocultar después de 3 segundos
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// Función mejorada para activar/desactivar el campo de costo (estilo minimalista)
function toggleCostoInput(checkbox) {
    const insumoItem = checkbox.closest('.insumo-item');
    const costoInput = insumoItem.querySelector('.insumo-costo');
    const costoContainer = insumoItem.querySelector('.costo-container');
    
    if (checkbox.checked) {
        // Habilitar y dar estilo activo minimalista
        costoInput.disabled = false;
        costoInput.focus();
        costoContainer.style.backgroundColor = '#ffffff';
        costoContainer.style.borderColor = '#6366f1';
        costoContainer.style.boxShadow = '0 0 0 2px rgba(99, 102, 241, 0.1)';
        
        // Efecto sutil en toda la fila
        insumoItem.style.backgroundColor = '#fafbff';
        insumoItem.style.borderColor = '#e0e7ff';
        insumoItem.style.transform = 'translateY(-0.5px)';
    } else {
        // Deshabilitar y restaurar estilo
        costoInput.disabled = true;
        costoInput.value = '';
        costoContainer.style.backgroundColor = '#f9fafb';
        costoContainer.style.borderColor = '#e5e7eb';
        costoContainer.style.boxShadow = 'none';
        
        // Restaurar estilo de la fila
        insumoItem.style.backgroundColor = '#ffffff';
        insumoItem.style.borderColor = '#f1f5f9';
        insumoItem.style.transform = 'translateY(0)';
    }
    
    // Actualizar contador de seleccionados
    updateSelectedCounter();
}

// Función para actualizar el contador con estilo minimalista
function updateSelectedCounter() {
    const selectedCount = document.querySelectorAll('.insumo-checkbox:checked').length;
    const counterElement = document.getElementById('selectedCounter');
    const insumosListElement = document.querySelector('.insumos-list');
    
    // If the counter already exists, just update it
    if (counterElement) {
        counterElement.textContent = selectedCount;
        counterElement.parentElement.style.display = selectedCount > 0 ? 'block' : 'none';
    } 
    // Otherwise create it, but only if the insumos-list container exists
    else if (insumosListElement) {
        const counterHtml = `
            <div id="selectedCounterContainer" style="margin: 12px 0; text-align: right; ${selectedCount > 0 ? '' : 'display: none;'}">
                <div style="display: inline-flex; align-items: center; background-color: #6366f1; color: white; padding: 6px 12px; border-radius: 16px; font-size: 0.8rem; font-weight: 500; box-shadow: 0 2px 4px rgba(99, 102, 241, 0.2);">
                    <i class="fa-solid fa-check-circle" style="margin-right: 6px; font-size: 0.8rem;"></i>
                    <span id="selectedCounter">${selectedCount}</span> seleccionado${selectedCount > 1 ? 's' : ''}
                </div>
            </div>
        `;
        insumosListElement.insertAdjacentHTML('afterend', counterHtml);
    }
}