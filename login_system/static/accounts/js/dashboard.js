// Add this function at the top of your file
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

// Variable global para horarios temporales
let horariosTemporales = {
    lunes: { apertura: '', cierre: '', esta_abierto: true },
    martes: { apertura: '', cierre: '', esta_abierto: true },
    miercoles: { apertura: '', cierre: '', esta_abierto: true },
    jueves: { apertura: '', cierre: '', esta_abierto: true },
    viernes: { apertura: '', cierre: '', esta_abierto: true },
    sabado: { apertura: '', cierre: '', esta_abierto: true },
    domingo: { apertura: '', cierre: '', esta_abierto: true }
};

document.addEventListener('DOMContentLoaded', function() {
    console.log("Inicializando componentes de la interfaz...");
    
    // NO inicializar el menú de inventario aquí - dejarlo para menu.js
    // setupInventoryMenuAnimation();
    console.log("✓ Menú de inventario se inicializa en menu.js");
    
    // Inicialización de los links del submenú
    initializeSubmenuLinks();
    console.log("✓ Links del submenú inicializados");
    
    // Inicialización del menú de usuario
    initializeUserMenuHandlers();
    console.log("✓ Menú de usuario inicializado");
 
    // COMENTAR esta inicialización directa para evitar conflicto con menu.js
    // La funcionalidad completa ahora se maneja en menu.js
    /*
    const menuInventario = document.getElementById('menuInventario');
    const submenuInventario = document.getElementById('submenuInventario');
    
    if (menuInventario && submenuInventario) {
        menuInventario.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            submenuInventario.classList.toggle('show');
            menuInventario.classList.toggle('active');
            
            const chevron = menuInventario.querySelector('.submenu-icon');
            if (chevron) {
                chevron.style.transform = menuInventario.classList.contains('active') 
                    ? 'rotate(180deg)' : 'rotate(0deg)';
            }
        });
        
        // Cerrar el submenu cuando se hace clic fuera de él
        document.addEventListener('click', function(e) {
            if (!menuInventario.contains(e.target) && 
                !submenuInventario.contains(e.target) &&
                submenuInventario.classList.contains('show')) {
                
                submenuInventario.classList.remove('show');
                menuInventario.classList.remove('active');
                
                const chevron = menuInventario.querySelector('.submenu-icon');
                if (chevron) {
                    chevron.style.transform = 'rotate(0deg)';
                }
            }
        });
    }
    */
    
    // Añadir debugging helper para el menú si no existe ya
    if (!window.debugMenu) {
        window.debugMenu = function() {
            const menuInventario = document.getElementById('menuInventario');
            const submenuInventario = document.getElementById('submenuInventario');
            
            console.group('Debug información del menú (dashboard.js)');
            console.log('menuInventario:', menuInventario);
            console.log('submenuInventario:', submenuInventario);
            
            if (submenuInventario) {
                console.log('submenuInventario className:', submenuInventario.className);
                console.log('submenuInventario computedStyle.display:', 
                    window.getComputedStyle(submenuInventario).display);
                console.log('submenuInventario computedStyle.maxHeight:', 
                    window.getComputedStyle(submenuInventario).maxHeight);
                console.log('submenuInventario computedStyle.visibility:',
                    window.getComputedStyle(submenuInventario).visibility);
                console.log('¿Tiene clase "show"?', submenuInventario.classList.contains('show'));
            }
            console.groupEnd();
        };
    }
});

// Función corregida - ahora realmente no hace nada
function setupInventoryMenuAnimation() {
    console.log("Función setupInventoryMenuAnimation en dashboard.js se ha deprecado, usando menu.js");
}

function initializeSubmenuLinks() {
    // Submenu Inventario
    const submenuLinks = [
        { id: 'menu-insumos-link', handler: loadInsumosContent },
        { id: 'entradas_salidas', handler: function() { 
            console.log('[DEBUG] Click en Entradas y Salidas');
            if (typeof window.loadEntradasSalidasContent === 'function') {
                window.loadEntradasSalidasContent();
            } else {
                console.error('La función loadEntradasSalidasContent no está disponible');
                alert('Error: Módulo de Entradas y Salidas no disponible');
            }
        }},
        { id: 'proveedores', handler: loadProveedoresContent },
        { id: 'menu_insumos_compuestos', handler: loadInsumosCompuestosContent },
        { id: 'recetas', handler: function() { 
            console.log('[DEBUG] Click en Recetas');
            if (typeof window.loadRecetasContent === 'function') {
                try {
                    window.loadRecetasContent();
                } catch(err) {
                    console.error('Error al cargar el módulo de recetas:', err);
                    alert('Ha ocurrido un error al cargar el módulo de recetas. Por favor, recargue la página e intente nuevamente.');
                }
            } else {
                console.warn('[ADVERTENCIA] La función loadRecetasContent no está disponible');
                console.log('[DEBUG] Verificando funciones de recetas disponibles:', {
                    loadRecetasContent: typeof window.loadRecetasContent,
                    editarReceta: typeof window.editarReceta,
                    verDetalleReceta: typeof window.verDetalleReceta,
                    eliminarReceta: typeof window.eliminarReceta
                });
                
                alert('El módulo de recetas no pudo cargarse correctamente. Esto puede deberse a un problema de carga de scripts.');
            }
        }},
        { id: 'reportes', handler: function() { /* TODO: loadReportesContent(); */ } },
    ];
    
    submenuLinks.forEach(link => {
        const el = document.getElementById(link.id);
        if (el) {
            el.addEventListener('click', function(e) {
                e.preventDefault();
                document.querySelectorAll('.submenu a').forEach(link => link.classList.remove('active'));
                this.classList.add('active');
                link.handler();
            });
        } else {
            console.warn(`[ADVERTENCIA] Elemento con ID '${link.id}' no encontrado en el DOM`);
        }
    });

    // Sucursales y Usuarios fuera del submenu
    const sucursalesLink = document.getElementById('menuSucursales');
    if (sucursalesLink) {
        sucursalesLink.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelectorAll('.menu-item').forEach(link => link.classList.remove('active'));
            this.classList.add('active');
            loadSucursalesContent();
        });
    }
    const usuariosLink = document.getElementById('menuUsuarios');
    if (usuariosLink) {
        usuariosLink.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelectorAll('.menu-item').forEach(link => link.classList.remove('active'));
            this.classList.add('active');
            loadUsuariosContent();
        });
    }
}

function initializeUserMenuHandlers() {
    const userMenu = document.getElementById('userMenu');
    const userDropdown = document.getElementById('userDropdown');
    
    if (userMenu && userDropdown) {
        userMenu.addEventListener('click', function(e) {
            e.stopPropagation();
            userDropdown.classList.toggle('active');
        });
    }
}

function loadSucursalesContent() {
    const mainContent = document.querySelector('.main-content');
    mainContent.classList.add('dark-theme');
    mainContent.innerHTML = `
        <div class="section-header">
            <h1>Gestión de Sucursales</h1>
            <button class="btn-primary" onclick="showAddSucursalModal()">
                <i class="fa-solid fa-plus"></i> Nueva Sucursal
            </button>
        </div>
        <div class="sucursales-grid" id="sucursalesGrid"></div>
    `;

    loadSucursales();
}

async function loadSucursales() {
    try {
        const response = await fetch('/sucursales/');
        const data = await response.json();
        
        if (data.status === 'success') {
            const grid = document.getElementById('sucursalesGrid');
            grid.innerHTML = data.sucursales.map(sucursal => `
                <div class="sucursal-card">
                    <div class="sucursal-header">
                        <h3>${sucursal.nombre}</h3>
                        <span class="badge ${sucursal.activa ? 'active' : 'inactive'}">
                            ${sucursal.activa ? 'Activa' : 'Inactiva'}
                        </span>
                    </div>
                    <div class="sucursal-info">
                        <p><i class="fa-solid fa-location-dot"></i> ${sucursal.direccion}</p>
                        <p><i class="fa-solid fa-building"></i> ${sucursal.ciudad_estado}</p>
                        <p><i class="fa-solid fa-phone"></i> ${sucursal.telefono}</p>
                        <p><i class="fa-solid fa-user"></i> Gerente: ${sucursal.gerente}</p>
                        <p><i class="fa-solid fa-clock"></i> Horarios:</p>
                        ${Object.entries(sucursal.horarios || {}).map(([dia, horario]) => `
                            <p class="horario-item">
                                ${dia.charAt(0).toUpperCase() + dia.slice(1)}: 
                                ${horario.esta_abierto 
                                    ? `${horario.apertura} - ${horario.cierre}` 
                                    : 'Cerrado'}
                            </p>
                        `).join('')}
                        <p><i class="fa-solid fa-dollar-sign"></i> Meta Diaria: $${sucursal.meta_diaria.toLocaleString()}</p>
                    </div>
                    <div class="sucursal-actions">
                        <button class="btn-edit" onclick="editSucursal(${sucursal.id})" type="button">
                            <i class="fa-solid fa-pen"></i> Editar
                        </button>
                        <button class="btn-ver" style="
                            background: linear-gradient(90deg, #f7971e 0%, #ffd200 100%);
                            color: #1F2937;
                            border: none;
                            padding: 0.75rem 1.5rem;
                            border-radius: 6px;
                            cursor: pointer;
                            font-weight: 600;
                            font-size: 1rem;
                            box-shadow: 0 2px 8px rgba(255, 210, 0, 0.15);
                            display: flex;
                            align-items: center;
                            gap: 8px;
                            transition: background 0.3s, color 0.2s, box-shadow 0.3s;
                        "
                        onmouseover="this.style.background='linear-gradient(90deg, #ffd200 0%, #f7971e 100%)';this.style.color='#fff';this.style.boxShadow='0 4px 16px rgba(255,210,0,0.25)';"
                        onmouseout="this.style.background='linear-gradient(90deg, #f7971e 0%, #ffd200 100%)';this.style.color='#1F2937';this.style.boxShadow='0 2px 8px rgba(255,210,0,0.15)';"
                        onclick="viewSucursal(${sucursal.id})">
                            <i class="fa-solid fa-eye"></i> Ver
                        </button>
                        <button class="btn-delete" onclick="deleteSucursal(${sucursal.id})">
                            <i class="fa-solid fa-trash"></i> Eliminar
                        </button>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

function loadUsuariosContent() {
    const mainContent = document.querySelector('.main-content');
    mainContent.innerHTML = `
        <div class="usuarios-container">
            <div class="section-header">
                <h1>Gestión de Usuarios</h1>
                <button class="btn-primary" onclick="showAddUserModal()">
                    <i class="fa-solid fa-user-plus"></i> Nuevo Usuario
                </button>
            </div>
            <div class="usuarios-grid" id="usuariosGrid"></div>
        </div>
    `;
    
    // Comprobamos si la función existe antes de llamarla
    if (typeof loadUsuarios === 'function') {
        loadUsuarios();
    } else {
        console.error('La función loadUsuarios no está definida. Asegúrate de que usuarios.js está cargado correctamente.');
        
        // Carga de ejemplo para evitar que se vea vacío
        document.getElementById('usuariosGrid').innerHTML = `
            <div style="text-align: center; padding: 20px;">
                <p style="color: #666;">Cargando usuarios...</p>
            </div>
        `;
    }
}

function showAddSucursalModal() {
    document.getElementById('modalTitle').textContent = 'Nueva Sucursal';
    document.getElementById('sucursalForm').reset();
    document.getElementById('sucursalId').value = '';
    
    // Resetear horarios temporales
    horariosTemporales = {
        lunes: { apertura: '', cierre: '', esta_abierto: true },
        martes: { apertura: '', cierre: '', esta_abierto: true },
        miercoles: { apertura: '', cierre: '', esta_abierto: true },
        jueves: { apertura: '', cierre: '', esta_abierto: true },
        viernes: { apertura: '', cierre: '', esta_abierto: true },
        sabado: { apertura: '', cierre: '', esta_abierto: true },
        domingo: { apertura: '', cierre: '', esta_abierto: true }
    };
    
    document.getElementById('sucursalModal').style.display = 'flex';
    
    // Aseguramos que el formulario tenga el manejador correcto
    document.getElementById('sucursalForm').onsubmit = handleSucursalSubmit;
}

function closeSucursalModal() {
    document.getElementById('sucursalModal').style.display = 'none';
}

// Reiniciamos la función handleSucursalSubmit para asegurar su correcto funcionamiento
async function handleSucursalSubmit(event) {
    event.preventDefault();
    
    try {
        const sucursalId = document.getElementById('sucursalId').value;
        console.log('ID de sucursal:', sucursalId); // Debug log
        
        const formData = {
            nombre: document.getElementById('nombre').value,
            codigo_interno: document.getElementById('codigo_interno').value,
            direccion: document.getElementById('direccion').value,
            ciudad_estado: document.getElementById('ciudad_estado').value,
            locacion: document.getElementById('locacion').value,
            telefono: document.getElementById('telefono').value,
            zona_horaria: document.getElementById('zona_horaria').value,
            gerente: document.getElementById('gerente').value,
            entrega_domicilio: parseInt(document.getElementById('entrega_domicilio').value, 10),
            numero_mesas: parseInt(document.getElementById('numero_mesas').value, 10) || 0,
            capacidad_comensales: parseInt(document.getElementById('capacidad_comensales').value, 10) || 0,
            meta_diaria: parseFloat(document.getElementById('meta_diaria').value) || 0,
            activa: parseInt(document.getElementById('activa').value, 10),
            horarios: horariosTemporales
        };

        console.log('Enviando datos de sucursal:', formData); // Debug log

        const url = sucursalId ? `/sucursales/${sucursalId}/` : '/sucursales/';
        const method = sucursalId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        if (data.status === 'success') {
            closeSucursalModal();
            await loadSucursales();
            alert(sucursalId ? 'Sucursal actualizada exitosamente' : 'Sucursal creada exitosamente');
        } else {
            throw new Error(data.message || 'Error al procesar la solicitud');
        }
    } catch (error) {
        console.error('Error:', error);
        alert(`Error: ${error.message}`);
    }
}

function showHorariosModal() {
    const modal = document.getElementById('horariosModal');
    modal.style.display = 'flex';
    
    // Cargar horarios temporales en el formulario
    Object.entries(horariosTemporales).forEach(([dia, horario]) => {
        const apertura = document.getElementById(`${dia}_apertura`);
        const cierre = document.getElementById(`${dia}_cierre`);
        const cerrado = document.getElementById(`${dia}_cerrado`);
        
        if (apertura && cierre && cerrado) {
            apertura.value = horario.apertura;
            cierre.value = horario.cierre;
            cerrado.checked = !horario.esta_abierto;
            apertura.disabled = cerrado.checked;
            cierre.disabled = cerrado.checked;
        }
    });
    
    // Configurar eventos para los checkboxes de "Cerrado"
    const dias = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
    dias.forEach(dia => {
        const cerradoCheckbox = document.getElementById(`${dia}_cerrado`);
        if (cerradoCheckbox) {
            cerradoCheckbox.addEventListener('change', function() {
                document.getElementById(`${dia}_apertura`).disabled = this.checked;
                document.getElementById(`${dia}_cierre`).disabled = this.checked;
            });
        }
    });
}

function guardarHorariosTemporales() {
    const dias = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
    
    dias.forEach(dia => {
        const cerrado = document.getElementById(`${dia}_cerrado`).checked;
        horariosTemporales[dia] = {
            apertura: cerrado ? '' : document.getElementById(`${dia}_apertura`).value,
            cierre: cerrado ? '' : document.getElementById(`${dia}_cierre`).value,
            esta_abierto: !cerrado
        };
    });

    document.getElementById('horariosModal').style.display = 'none';
}

async function editSucursal(id) {
    try {
        console.log('Editando sucursal:', id); // Debug log
        
        const response = await fetch(`/sucursales/${id}/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Datos recibidos:', data); // Debug log

        if (data.status === 'success') {
            const s = data.sucursal;
            
            // Actualizar el título y el ID oculto
            document.getElementById('modalTitle').textContent = 'Editar Sucursal';
            document.getElementById('sucursalId').value = id;

            // Actualizar los campos del formulario
            const fields = {
                'nombre': s.nombre,
                'codigo_interno': s.codigo_interno,
                'direccion': s.direccion,
                'ciudad_estado': s.ciudad_estado,
                'locacion': s.locacion || '',
                'telefono': s.telefono,
                'zona_horaria': s.zona_horaria,
                'gerente': s.gerente,
                'entrega_domicilio': s.entrega_domicilio ? '1' : '0',
                'numero_mesas': s.numero_mesas,
                'capacidad_comensales': s.capacidad_comensales,
                'meta_diaria': s.meta_diaria,
                'activa': s.activa ? '1' : '0'
            };

            // Llenar cada campo
            Object.entries(fields).forEach(([fieldId, value]) => {
                const element = document.getElementById(fieldId);
                if (element) {
                    element.value = value;
                } else {
                    console.warn(`Campo no encontrado: ${fieldId}`);
                }
            });

            // Actualizar horarios
            horariosTemporales = s.horarios || {
                lunes: { apertura: '', cierre: '', esta_abierto: true },
                martes: { apertura: '', cierre: '', esta_abierto: true },
                miercoles: { apertura: '', cierre: '', esta_abierto: true },
                jueves: { apertura: '', cierre: '', esta_abierto: true },
                viernes: { apertura: '', cierre: '', esta_abierto: true },
                sabado: { apertura: '', cierre: '', esta_abierto: true },
                domingo: { apertura: '', cierre: '', esta_abierto: true }
            };

            // Mostrar el modal
            const modal = document.getElementById('sucursalModal');
            if (modal) {
                modal.style.display = 'flex';
            } else {
                console.error('Modal no encontrado');
            }
        } else {
            throw new Error(data.message || 'Error al cargar los datos');
        }
    } catch (error) {
        console.error('Error detallado:', error);
        alert('Error al cargar los datos de la sucursal');
    }
}

async function deleteSucursal(id) {
    if (confirm('¿Estás seguro de eliminar esta sucursal?')) {
        try {
            const response = await fetch('/sucursales/', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify({ id })
            });

            const data = await response.json();
            if (data.status === 'success') {
                await loadSucursales();
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al eliminar la sucursal');
        }
    }
}

function closeVerSucursalModal() {
    document.getElementById('verSucursalModal').style.display = 'none';
}

async function viewSucursal(id) {
    try {
        const response = await fetch(`/sucursales/${id}/`);
        const data = await response.json();
        if (data.status === 'success') {
            const s = data.sucursal;
            document.getElementById('verSucursalInfo').innerHTML = `
                <div style="color: #333333;">
                    <p><strong style="color: #000000;">Nombre:</strong> <span style="color: #333333;">${s.nombre}</span></p>
                    <p><strong style="color: #000000;">Código interno:</strong> <span style="color: #333333;">${s.codigo_interno}</span></p>
                    <p><strong style="color: #000000;">Dirección:</strong> <span style="color: #333333;">${s.direccion}</span></p>
                    <p><strong style="color: #000000;">Ciudad/Estado:</strong> <span style="color: #333333;">${s.ciudad_estado}</span></p>
                    <p><strong style="color: #000000;">Locación:</strong> <span style="color: #333333;">${s.locacion || '-'}</span></p>
                    <p><strong style="color: #000000;">Teléfono:</strong> <span style="color: #333333;">${s.telefono}</span></p>
                    <p><strong style="color: #000000;">Horarios:</strong></p>
                    <div style="margin-left: 20px; color: #333333;">
                    ${Object.entries(s.horarios || {}).map(([dia, horario]) => `
                        <p class="horario-item" style="color: #333333;">
                            <strong style="color: #000000;">${dia.charAt(0).toUpperCase() + dia.slice(1)}:</strong> 
                            <span style="color: #333333;">
                                ${horario.esta_abierto 
                                    ? `${horario.apertura} - ${horario.cierre}` 
                                    : 'Cerrado'}
                            </span>
                        </p>
                    `).join('')}
                    </div>
                    <p><strong style="color: #000000;">Zona horaria:</strong> <span style="color: #333333;">${s.zona_horaria}</span></p>
                    <p><strong style="color: #000000;">Gerente:</strong> <span style="color: #333333;">${s.gerente}</span></p>
                    <p><strong style="color: #000000;">Entrega a domicilio:</strong> <span style="color: #333333;">${s.entrega_domicilio ? 'Sí' : 'No'}</span></p>
                    <p><strong style="color: #000000;">Mesas:</strong> <span style="color: #333333;">${s.numero_mesas}</span></p>
                    <p><strong style="color: #000000;">Capacidad comensales:</strong> <span style="color: #333333;">${s.capacidad_comensales}</span></p>
                    <p><strong style="color: #000000;">Meta diaria:</strong> <span style="color: #333333;">$${parseFloat(s.meta_diaria).toLocaleString()}</span></p>
                    <p><strong style="color: #000000;">Activa:</strong> <span style="color: #333333;">${s.activa ? 'Sí' : 'No'}</span></p>
                </div>
            `;
            document.getElementById('verSucursalModal').style.display = 'flex';
        } else {
            alert('No se pudo cargar la información.');
        }
    } catch (error) {
        console.error('Error detallado:', error);
        alert('Error al cargar la información.');
    }
}

function closeHorariosModal() {
    // No guardamos cambios, solo cerramos
    document.getElementById('horariosModal').style.display = 'none';
}

async function cargarHorarios(sucursalId) {
    try {
        const response = await fetch(`/sucursales/${sucursalId}/horarios/`);
        const data = await response.json();
        if (data.status === 'success') {
            horariosActuales = data.horarios;
            // Rellena el formulario con los horarios
            Object.entries(data.horarios).forEach(([dia, horario]) => {
                document.getElementById(`${dia.toLowerCase()}_apertura`).value = horario.apertura;
                document.getElementById(`${dia.toLowerCase()}_cierre`).value = horario.cierre;
                document.getElementById(`${dia.toLowerCase()}_cerrado`).checked = !horario.esta_abierto;
            });
        }
    } catch (error) {
        console.error('Error al cargar horarios:', error);
    }
}

async function guardarHorarios() {
    const dias = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
    
    dias.forEach(dia => {
        const cerrado = document.getElementById(`${dia}_cerrado`).checked;
        horariosTemporales[dia] = {
            apertura: cerrado ? '' : document.getElementById(`${dia}_apertura`).value,
            cierre: cerrado ? '' : document.getElementById(`${dia}_cierre`).value,
            esta_abierto: !cerrado
        };
    });

    // Actualizar horarios de la sucursal si estamos editando
    const sucursalId = document.getElementById('sucursalId').value;
    if (sucursalId) {
        try {
            const response = await fetch(`/sucursales/${sucursalId}/horarios/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify({ horarios: horariosTemporales })
            });

            const data = await response.json();
            if (data.status === 'success') {
                alert('Horarios guardados exitosamente');
            } else {
                alert('Error al guardar horarios: ' + data.message);
            }
        } catch (error) {
            console.error('Error al guardar horarios:', error);
            alert('Error al guardar horarios');
        }
    }

    closeHorariosModal();
}
