// Funciones básicas que deben estar disponibles
function getUserRole() {
    try {
        // Intentar obtener desde permisos
        if (window.userPermissions && window.userPermissions.admin) {
            return 'admin';
        }
        if (window.userPermissions && window.userPermissions.gerente) {
            return 'gerente';
        }
        if (window.userPermissions && window.userPermissions.superuser) {
            return 'superuser';
        }
        
        // Valor por defecto
        return 'empleado';
    } catch (error) {
        console.error("Error obteniendo rol de usuario:", error);
        return 'empleado';
    }
}

function loadUsuariosDefault() {
    console.log("🔄 Cargando lista de usuarios predeterminada");
    const grid = document.getElementById('usuariosGrid');
    if (!grid) {
        console.error("❌ No se encontró el contenedor usuariosGrid");
        return;
    }
    
    grid.innerHTML = '<div class="loading">🔄 Cargando usuarios...</div>';
    
    fetch('/usuarios/')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success' && data.usuarios) {
                renderUsuariosSimple(data.usuarios, grid);
            } else {
                grid.innerHTML = '<div class="error">Error al cargar usuarios</div>';
            }
        })
        .catch(error => {
            console.error("Error cargando usuarios:", error);
            grid.innerHTML = '<div class="error">Error al conectar con el servidor</div>';
        });
}

function renderUsuariosSimple(usuarios, container) {
    if (!usuarios.length) {
        container.innerHTML = '<div class="empty">No hay usuarios para mostrar</div>';
        return;
    }
    
    container.innerHTML = usuarios.map(usuario => `
        <div class="user-card ${!usuario.activo ? 'inactive-user' : ''}">
            <div class="user-header">
                <h3 style="color: white">${usuario.nombre}</h3>
                <span class="user-role">${usuario.rol}</span>
            </div>
            <div class="user-details">
                <p>${usuario.email}</p>
                <p>${usuario.sucursal || 'Sin sucursal'}</p>
            </div>
            <div class="user-actions">
                <button class="btn-edit" data-id="${usuario.id}">
                    <i class="fa-solid fa-pen"></i> Editar
                </button>
            </div>
        </div>
    `).join('');
    
    // Agregar eventos a los botones
    container.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            if (typeof window.editUser === 'function') {
                window.editUser(id);
            } else {
                alert('Función de edición no disponible. Recarga la página.');
            }
        });
    });
}

async function loadUserFormScript(userRole) {
    console.log(`🔄 Cargando script para rol: ${userRole}`);
    
    let scriptPath;
    switch(userRole) {
        case 'admin':
        case 'superuser':
            scriptPath = '/static/accounts/js/usuarios_form.js';
            break;
        case 'empleado':
            scriptPath = '/static/accounts/js/usuarios/empleado_form.js';
            break;
        default:
            scriptPath = '/static/accounts/js/usuarios_form.js';
    }
    
    return new Promise((resolve) => {
        const existingScript = document.querySelector(`script[src="${scriptPath}"]`);
        if (existingScript) {
            console.log(`✅ Script ya cargado: ${scriptPath}`);
            resolve();
            return;
        }
        
        const script = document.createElement('script');
        script.src = scriptPath;
        script.onload = () => {
            console.log(`✅ Script cargado: ${scriptPath}`);
            resolve();
        };
        script.onerror = () => {
            console.error(`❌ Error cargando: ${scriptPath}`);
            resolve();
        };
        document.head.appendChild(script);
    });
}

function setupModalHandlers() {
    console.log("🔧 Configurando handlers del modal");
    
    // Handler para cerrar modal
    const closeBtn = document.getElementById('closeUserModalBtn');
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            const modal = document.getElementById('userModal');
            if (modal) modal.style.display = 'none';
        });
    }
    
    // Handler para botón cancelar
    const cancelBtn = document.getElementById('cancelUserModalBtn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            const modal = document.getElementById('userModal');
            if (modal) modal.style.display = 'none';
        });
    }
    
    // Handler para formulario
    const form = document.getElementById('userForm');
    if (form) {
        form.addEventListener('submit', function(event) {
            event.preventDefault();
            if (typeof window.handleUserSubmit === 'function') {
                window.handleUserSubmit(event);
            } else {
                console.error("❌ handleUserSubmit no disponible");
                alert("Error: No se puede procesar el formulario");
            }
        });
    }
}
function createUserModalHTML() {
    // Determinar qué opciones de rol mostrar según el usuario actual
    const currentUserRole = getUserRole();
    let roleOptions = '';
    
    if (currentUserRole === 'gerente') {
        // Gerentes solo pueden crear empleados
        roleOptions = '<option value="empleado">Empleado</option>';
    } else if (currentUserRole === 'admin' || currentUserRole === 'superuser') {
        // Admins pueden crear todos los roles
        roleOptions = `
            <option value="empleado">Empleado</option>
            <option value="gerente">Gerente</option>
            <option value="admin">Administrador</option>
        `;
    } else {
        // Por defecto, solo empleados
        roleOptions = '<option value="empleado">Empleado</option>';
    }

    return `
        <!-- Modal para agregar/editar usuario -->
        <div id="userModal" class="modal">
            <div class="modal-content">
                <span class="close-modal" id="closeUserModalBtn">&times;</span>
                <h2 id="userModalTitle">Nuevo Usuario</h2>
                <form id="userForm">
                    <!-- No uses el atributo onsubmit -->
                    <div class="form-row">
                        <div class="form-group">
                            <label for="nombre">Nombre completo:</label>
                            <input type="text" id="nombre" name="nombre" required>
                        </div>
                        <div class="form-group">
                            <label for="username">Nombre de usuario:</label>
                            <input type="text" id="username" name="username" required>
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="email">Correo electrónico:</label>
                            <input type="email" id="email" name="email" required>
                        </div>
                        <div class="form-group">
                            <label for="telefono">Teléfono:</label>
                            <input type="tel" id="telefono" name="telefono">
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="rol">Rol:</label>
                            <select id="rol" name="rol" required>
                                ${roleOptions}
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="sucursal">Sucursal asignada:</label>
                            <select id="sucursal" name="sucursal" required>
                                <!-- Se cargará dinámicamente -->
                            </select>
                        </div>
                    </div>

                    <div class="form-row password-section">
                        <div class="form-group">
                            <label for="password">Contraseña:</label>
                            <div class="password-input">
                                <input type="password" id="password" name="password">
                                <i class="fa-solid fa-eye toggle-password"></i>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="confirm_password">Confirmar contraseña:</label>
                            <div class="password-input">
                                <input type="password" id="confirm_password" name="confirm_password">
                                <i class="fa-solid fa-eye toggle-password"></i>
                            </div>
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="checkbox-container">
                            <input type="checkbox" id="activo" name="activo" checked>
                            <span class="checkmark"></span>
                            Usuario activo
                        </label>
                    </div>

                    <div class="form-actions">
                        <button type="submit" class="btn-primary">
                            <i class="fa-solid fa-save"></i> Guardar
                        </button>
                        <button type="button" class="btn-secondary" id="cancelUserModalBtn">
                            <i class="fa-solid fa-times"></i> Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
}

async function loadUsuariosContent() {
    const mainContent = document.querySelector('.main-content');
    
    // HTML básico sin el modal aún
    mainContent.innerHTML = `
        <div class="usuarios-container">
            <div class="section-header">
                <h1>Gestión de Usuarios</h1>
                <button class="btn-primary" onclick="showAddUserModal()" style="
                    background-color: #3b82f6;
                    color: white;
                    padding: 0.75rem 1.5rem;
                    border-radius: 0.375rem;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    border: none;
                    cursor: pointer;">
                    <i class="fa-solid fa-user-plus"></i> Nuevo Usuario
                </button>
            </div>

            <div class="usuarios-filters" style="display: flex; gap: 1rem; margin-bottom: 1.5rem;">
                <div class="search-box" style="position: relative; flex: 1;">
                    <i class="fa-solid fa-search" style="
                        position: absolute;
                        top: 50%;
                        left: 0.75rem;
                        transform: translateY(-50%);
                        color: #94a3b8;
                    "></i>
                    <input type="text" id="searchUser" placeholder="Buscar usuario..." style="
                        width: 100%;
                        padding: 0.5rem 1rem 0.5rem 2.5rem;
                        border-radius: 0.375rem;
                        border: 2px solid #e2e8f0;
                        font-size: 0.875rem;
                    ">
                </div>
                <select id="filterRole" style="
                    padding: 0.5rem;
                    border-radius: 0.375rem;
                    border: 2px solid #e2e8f0;
                    font-size: 0.875rem;
                    min-width: 150px;
                ">
                    <option value="todos">Todos los roles</option>
                    <option value="admin">Administrador</option>
                    <option value="gerente">Gerente</option>
                    <option value="empleado">Empleado</option>
                </select>
            </div>

            <div class="usuarios-grid" id="usuariosGrid">
                <div class="loading">Cargando usuarios...</div>
            </div>
        </div>
    `;
    
    // IMPORTANTE: Añadir el modal como paso separado
    mainContent.insertAdjacentHTML('beforeend', createUserModalHTML());
    
    // Configurar el modal después de insertarlo
    setupModalHandlers();

    // Cargar usuarios después de renderizar el HTML
    setTimeout(() => {
        loadUsuarios();
    }, 100);
}

// Nueva función CORREGIDA para cargar componentes de gerente
async function loadGerenteComponentsFixed() {
    return new Promise((resolve) => {
        console.group('🔄 CARGA ESPECÍFICA PARA GERENTE - VERSIÓN CORREGIDA');
        
        // Solo cargar el script PRINCIPAL de gerente (no todos los scripts nuevos)
        const scriptToLoad = '/static/accounts/js/usuarios/gerente_form.js';
        
        // Verificar si ya está cargado
        const existingScript = document.querySelector(`script[src="${scriptToLoad}"]`);
        if (existingScript) {
            console.log(`✅ Script de gerente ya cargado`);
            
            // Verificar que las funciones estén disponibles
            if (window.gerenteUserForm) {
                setupGerenteGlobalFunctions();
                console.groupEnd();
                resolve();
                return;
            }
        }
        
        console.log(`🔄 Cargando script de gerente: ${scriptToLoad}`);
        const script = document.createElement('script');
        script.src = scriptToLoad;
        script.setAttribute('data-gerente-component', 'true');
        
        script.onload = () => {
            console.log(`✅ Script de gerente cargado exitosamente`);
            
            // Esperar un momento para que el script se inicialice
            setTimeout(() => {
                if (window.gerenteUserForm) {
                    setupGerenteGlobalFunctions();
                    console.log("✅ Funciones de gerente configuradas correctamente");
                } else {
                    console.error("❌ gerenteUserForm no está disponible después de cargar el script");
                    setupFallbackFunctions();
                }
                
                console.groupEnd();
                resolve();
            }, 100);
        };
        
        script.onerror = () => {
            console.error(`❌ Error al cargar script de gerente`);
            setupFallbackFunctions();
            console.groupEnd();
            resolve();
        };
        
        document.head.appendChild(script);
    });
}

// Función para configurar las funciones globales específicas de gerente
function setupGerenteGlobalFunctions() {
    console.log("🔧 Configurando funciones globales específicas para GERENTE");
    
    // IMPORTANTE: No sobrescribir si ya existen y funcionan
    if (typeof window.showAddUserModal !== 'function' || !window.showAddUserModal.toString().includes('gerente')) {
        window.showAddUserModal = function() {
            console.log("👔 GERENTE: Ejecutando showAddUserModal");
            
            // Verificar que el modal existe
            if (!document.getElementById('userModal')) {
                console.warn("⚠️ Modal no encontrado, creando...");
                createUserModalInDOM();
            }
            
            if (window.gerenteUserForm && typeof window.gerenteUserForm.showModal === 'function') {
                window.gerenteUserForm.showModal();
            } else {
                console.error("❌ gerenteUserForm no está disponible");
                alert("Error: Formulario no disponible. Recarga la página.");
            }
        };
        console.log("✅ showAddUserModal configurada para gerente");
    }
    
    if (typeof window.editUser !== 'function' || !window.editUser.toString().includes('gerente')) {
        window.editUser = function(userId) {
            console.log("👔 GERENTE: Ejecutando editUser para:", userId);
            
            // Verificar que el modal existe
            if (!document.getElementById('userModal')) {
                console.warn("⚠️ Modal no encontrado, creando...");
                createUserModalInDOM();
            }
            
            if (window.gerenteUserForm && typeof window.gerenteUserForm.showModal === 'function') {
                window.gerenteUserForm.showModal(userId);
            } else {
                console.error("❌ gerenteUserForm no está disponible");
                alert("Error: Formulario no disponible. Recarga la página.");
            }
        };
        console.log("✅ editUser configurada para gerente");
    }
    
    if (typeof window.handleUserSubmit !== 'function' || !window.handleUserSubmit.toString().includes('gerente')) {
        window.handleUserSubmit = function(event) {
            console.log("👔 GERENTE: Ejecutando handleUserSubmit");
            if (window.gerenteUserForm && typeof window.gerenteUserForm.handleSubmit === 'function') {
                window.gerenteUserForm.handleSubmit(event);
            } else {
                console.error("❌ gerenteUserForm.handleSubmit no está disponible");
                alert("Error: No se puede procesar el formulario. Recarga la página.");
            }
        };
        console.log("✅ handleUserSubmit configurada para gerente");
    }
    
    // Verificar estado final
    console.log("✓ Estado final de funciones de gerente:", {
        showAddUserModal: typeof window.showAddUserModal,
        editUser: typeof window.editUser,
        handleUserSubmit: typeof window.handleUserSubmit,
        gerenteUserForm: !!window.gerenteUserForm
    });
}

// Función para configurar botones después de cargar scripts
function setupButtonsAfterScriptLoad(userRole) {
    console.log(`🔘 Configurando botones para rol: ${userRole}`);
    
    if (userRole !== 'empleado') {
        const addButton = document.getElementById('btnAddUser');
        if (addButton) {
            // Habilitar botón y cambiar texto
            addButton.disabled = false;
            addButton.innerHTML = `
                <i class="fa-solid fa-user-plus"></i> 
                ${userRole === 'gerente' ? 'Nuevo Empleado' : 'Nuevo Usuario'}
            `;
            
            // Limpiar listeners existentes y agregar nuevo
            addButton.removeEventListener('click', handleAddUserClick);
            addButton.addEventListener('click', handleAddUserClick);
            
            console.log("✅ Botón 'Nuevo Usuario' configurado");
        }
    } else {
        const profileButton = document.getElementById('btnEditProfile');
        if (profileButton) {
            profileButton.disabled = false;
            profileButton.innerHTML = '<i class="fa-solid fa-user-edit"></i> Editar Mi Perfil';
            
            profileButton.removeEventListener('click', handleEditProfileClick);
            profileButton.addEventListener('click', handleEditProfileClick);
            
            console.log("✅ Botón 'Editar Perfil' configurado");
        }
    }
}

// Función para manejar click en botón de agregar usuario
function handleAddUserClick(e) {
    e.preventDefault();
    console.log("🖱️ Click en botón 'Nuevo Usuario'");
    
    if (typeof window.showAddUserModal === 'function') {
        try {
            window.showAddUserModal();
        } catch (error) {
            console.error("❌ Error al ejecutar showAddUserModal:", error);
            alert("Error al abrir formulario. Recarga la página.");
        }
    } else {
        console.error("❌ showAddUserModal no está definida");
        alert("Error: Función no disponible. Recarga la página.");
    }
}

// Función para manejar click en botón de editar perfil
function handleEditProfileClick() {
    console.log("🖱️ Botón 'Editar perfil' clickeado");
    if (typeof window.editUser === 'function') {
        window.editUser(window.currentUserId);
    } else {
        console.error("❌ ERROR: función editUser no disponible");
        alert("Error al cargar perfil. Por favor recarga la página.");
    }
}

// Función para crear implementaciones de respaldo
function setupFallbackFunctions() {
    console.log("⚠️ Configurando funciones de respaldo");
    
    window.showAddUserModal = function() {
        alert("Función no disponible. Por favor, recarga la página.");
    };
    
    window.editUser = function(userId) {
        alert("Función no disponible. Por favor, recarga la página.");
    };
    
    window.handleUserSubmit = function(event) {
        event.preventDefault();
        alert("Función no disponible. Por favor, recarga la página.");
    };
}

// Función mejorada para crear el modal en el DOM
function createUserModalInDOM() {
    const existingModal = document.getElementById('userModal');
    if (existingModal) {
        console.log("✅ Modal ya existe, no es necesario crearlo");
        return;
    }
    
    console.log("🏗️ Creando modal de usuario en el DOM...");
    
    // Crear el modal usando la función existente
    const modalHTML = createUserModalHTML();
    
    // Crear un contenedor temporal para convertir string a elementos DOM
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = modalHTML;
    
    // Extraer el modal del contenedor temporal
    const modal = tempDiv.querySelector('#userModal');
    
    if (modal) {
        // Agregar el modal al body
        document.body.appendChild(modal);
        console.log("✅ Modal de usuario creado e insertado en el DOM");
        
        // Configurar los event listeners para el modal
        setupModalHandlers();
    } else {
        console.error("❌ Error: No se pudo crear el modal");
    }
}

// Añade esta función para habilitar filtrado y búsqueda

function setupUserFilters() {
    const searchInput = document.getElementById('searchUser');
    const filterRole = document.getElementById('filterRole');
    
    if (!searchInput || !filterRole) return;
    
    // Función para filtrar usuarios
    const filterUsers = () => {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedRole = filterRole.value.toLowerCase();
        
        const userCards = document.querySelectorAll('.user-card');
        
        userCards.forEach(card => {
            const name = card.querySelector('h3').innerText.toLowerCase();
            const username = card.querySelector('.user-details p:first-child').innerText.toLowerCase();
            const email = card.querySelector('.user-details p:nth-child(2)').innerText.toLowerCase();
            const role = card.querySelector('.user-role').innerText.toLowerCase();
            
            const matchesSearch = name.includes(searchTerm) || 
                                 username.includes(searchTerm) || 
                                 email.includes(searchTerm);
                                 
            const matchesRole = selectedRole === 'todos' || role.includes(selectedRole);
            
            // Mostrar u ocultar según los filtros
            if (matchesSearch && matchesRole) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    };
    
    // Agregar event listeners
    searchInput.addEventListener('input', filterUsers);
    filterRole.addEventListener('change', filterUsers);
    
    // Inicializar filtros
    setTimeout(filterUsers, 500);
}

// Llamar a esta función después de cargar usuarios
function loadUsuarios() {
    console.log("🔄 Cargando usuarios...");
    
    fetch('/usuarios/')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                renderUsuarios(data.usuarios);
                setupUserFilters(); // Configurar filtros después de cargar usuarios
            } else {
                console.error('Error al cargar usuarios:', data.message);
                showNotification('Error al cargar usuarios', 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showNotification('Error al conectar con el servidor', 'error');
        });
}

// Función para cargar usuarios (básica)
async function loadUsuarios() {
    console.log("🔄 Cargando usuarios...");
    
    try {
        const response = await fetch('/usuarios/');
        const data = await response.json();
        
        if (data.status === 'success') {
            renderUsuarios(data.usuarios);
        } else {
            console.error('Error al cargar usuarios:', data.message);
            showNotification('Error al cargar usuarios', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error al conectar con el servidor', 'error');
    }
}

// Función para renderizar usuarios en la grid
function renderUsuarios(usuarios) {
    const grid = document.getElementById('usuariosGrid');
    if (!grid) {
        console.error('No se encontró el contenedor usuariosGrid');
        return;
    }

    if (!usuarios.length) {
        grid.innerHTML = '<div class="empty-state">No hay usuarios para mostrar</div>';
        return;
    }

    grid.innerHTML = usuarios.map(usuario => {
        // Determinar la clase correcta para el rol
        let rolClass = 'role-empleado';
        let rolBgColor = '#fef3c7'; 
        let rolTextColor = '#92400e';
        
        if (usuario.rol.toLowerCase().includes('admin')) {
            rolClass = 'role-administrador';
            rolBgColor = '#eff6ff';
            rolTextColor = '#1d4ed8';
        } else if (usuario.rol.toLowerCase().includes('gerente')) {
            rolClass = 'role-gerente';
            rolBgColor = '#f0fdf4';
            rolTextColor = '#15803d';
        }

        return `
        <div style="
            background-color: #ffffff; 
            border-radius: 12px; 
            box-shadow: 0 2px 10px rgba(0,0,0,0.08); 
            padding: 1.5rem; 
            margin-bottom: 1rem; 
            border: 1px solid #e2e8f0;
            color: #1e293b;">
            
            <div style="display: flex; justify-content: space-between; margin-bottom: 1rem;">
                <div>
                    <h3 style="font-size: 1.25rem; font-weight: 600; margin: 0 0 0.5rem 0; color: #1e293b;">
                        ${usuario.nombre}
                    </h3>
                    <span style="
                        display: inline-block; 
                        font-size: 0.75rem; 
                        font-weight: 600; 
                        padding: 0.25rem 0.75rem; 
                        border-radius: 9999px; 
                        text-transform: uppercase; 
                        letter-spacing: 0.025em;
                        background-color: ${rolBgColor};
                        color: ${rolTextColor};
                        border: 1px solid ${rolBgColor.replace('f', 'e')};">
                        ${usuario.rol}
                    </span>
                    ${!usuario.activo ? 
                        `<span style="
                            display: inline-block;
                            background-color: #fee2e2;
                            color: #dc2626;
                            font-size: 0.75rem;
                            padding: 0.125rem 0.5rem;
                            border-radius: 9999px;
                            margin-left: 0.5rem;
                            font-weight: 500;">
                            Inactivo
                        </span>` 
                        : ''}
                </div>
            </div>
            
            <div style="margin-bottom: 1.25rem; font-size: 0.875rem; color: #64748b;">
                <p style="margin: 0.5rem 0; display: flex; align-items: center;">
                    <i class="fa-solid fa-user" style="width: 1.25rem; margin-right: 0.5rem;"></i> 
                    ${usuario.username}
                </p>
                <p style="margin: 0.5rem 0; display: flex; align-items: center;">
                    <i class="fa-solid fa-envelope" style="width: 1.25rem; margin-right: 0.5rem;"></i> 
                    ${usuario.email}
                </p>
                ${usuario.telefono ? 
                    `<p style="margin: 0.5rem 0; display: flex; align-items: center;">
                        <i class="fa-solid fa-phone" style="width: 1.25rem; margin-right: 0.5rem;"></i> 
                        ${usuario.telefono}
                    </p>` 
                    : ''}
                <p style="margin: 0.5rem 0; display: flex; align-items: center;">
                    <i class="fa-solid fa-building" style="width: 1.25rem; margin-right: 0.5rem;"></i> 
                    ${usuario.sucursal || 'Sin asignar'}
                </p>
            </div>
            
            <div style="display: flex; gap: 0.5rem;">
                <button onclick="editUser(${usuario.id})" style="
                    padding: 0.5rem 1rem;
                    border: none;
                    border-radius: 0.375rem;
                    font-size: 0.875rem;
                    font-weight: 500;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    background-color: #e0f2fe;
                    color: #0284c7;">
                    <i class="fa-solid fa-pen"></i> Editar
                </button>
                <button onclick="deleteUser(${usuario.id})" style="
                    padding: 0.5rem 1rem;
                    border: none;
                    border-radius: 0.375rem;
                    font-size: 0.875rem;
                    font-weight: 500;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    background-color: #fee2e2;
                    color: #dc2626;">
                    <i class="fa-solid fa-trash"></i> Eliminar
                </button>
            </div>
        </div>
        `;
    }).join('');
}

// Función para mostrar modal de agregar usuario
function showAddUserModal() {
    console.log("🆕 Abriendo modal para nuevo usuario");
    
    // CRÍTICO: Verificar que el modal existe antes de usarlo
    if (!document.getElementById('userModal')) {
        console.log("Modal no encontrado, creando...");
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            // Añadir el modal al mainContent
            mainContent.insertAdjacentHTML('beforeend', createUserModalHTML());
            // Configurar los handlers después de crear el modal
            setupModalHandlers();
        } else {
            // Si no hay mainContent, añadir al body
            document.body.insertAdjacentHTML('beforeend', createUserModalHTML());
            setupModalHandlers();
        }
    }
    
    const modal = document.getElementById('userModal');
    const form = document.getElementById('userForm');
    
    if (!modal || !form) {
        console.error('Modal o formulario no encontrado incluso después de crearlo');
        showNotification('Error al cargar el formulario', 'error');
        return;
    }

    // Limpiar formulario
    form.reset();
    
    // Configurar título
    document.getElementById('userModalTitle').textContent = 'Nuevo Usuario';
    
    // Campo oculto para ID
    let userIdField = document.getElementById('userId');
    if (!userIdField) {
        userIdField = document.createElement('input');
        userIdField.type = 'hidden';
        userIdField.id = 'userId';
        userIdField.name = 'userId';
        form.appendChild(userIdField);
    }
    userIdField.value = '';

    // Cargar sucursales
    loadSucursalesForSelect();

    // Mostrar modal
    modal.style.display = 'flex';
}

// Función para editar usuario
async function editUser(userId) {
    console.log("✏️ Editando usuario:", userId);
    
    // CRÍTICO: Verificar que el modal existe antes de usarlo
    if (!document.getElementById('userModal')) {
        console.log("Modal no encontrado, creando...");
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            // Añadir el modal al mainContent
            mainContent.insertAdjacentHTML('beforeend', createUserModalHTML());
            // Configurar los handlers después de crear el modal
            setupModalHandlers();
        } else {
            // Si no hay mainContent, añadir al body
            document.body.insertAdjacentHTML('beforeend', createUserModalHTML());
            setupModalHandlers();
        }
    }
    
    // Continuar con la función normal
    try {
        fetch(`/usuarios/${userId}/`)
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    const user = data.usuario;
                    
                    // Ahora estamos seguros que el modal existe
                    document.getElementById('userModalTitle').textContent = 'Editar Usuario';
                    
                    // Campo oculto para ID
                    let userIdField = document.getElementById('userId');
                    if (!userIdField) {
                        userIdField = document.createElement('input');
                        userIdField.type = 'hidden';
                        userIdField.id = 'userId';
                        userIdField.name = 'userId';
                        document.getElementById('userForm').appendChild(userIdField);
                    }
                    userIdField.value = user.id;
                    
                    // Llenar campos
                    document.getElementById('nombre').value = user.nombre;
                    document.getElementById('username').value = user.username;
                    document.getElementById('email').value = user.email;
                    document.getElementById('telefono').value = user.telefono || '';
                    document.getElementById('rol').value = user.rol.toLowerCase();
                    document.getElementById('activo').checked = user.activo;
                    
                    // Limpiar contraseñas
                    document.getElementById('password').value = '';
                    document.getElementById('confirm_password').value = '';
                    
                    // Cargar sucursales y seleccionar la actual
                    loadSucursalesForSelect().then(() => {
                        if (user.sucursal_id) {
                            document.getElementById('sucursal').value = user.sucursal_id;
                        }
                        
                        // Mostrar modal
                        document.getElementById('userModal').style.display = 'flex';
                    });
                } else {
                    showNotification(data.message || 'Error al cargar usuario', 'error');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showNotification('Error al conectar con el servidor', 'error');
            });
    } catch (error) {
        console.error('Error en editUser:', error);
        showNotification('Error al procesar la solicitud', 'error');
    }
}

// Función para eliminar usuario
async function deleteUser(userId) {
    if (!confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
        return;
    }
    
    try {
        const response = await fetch(`/usuarios/${userId}/`, {
            method: 'DELETE',
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            }
        });
        
        const data = await response.json();
        
        if (data.status === 'success') {
            showNotification('Usuario eliminado correctamente', 'success');
            loadUsuarios(); // Recargar lista
        } else {
            showNotification(data.message || 'Error al eliminar usuario', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error al conectar con el servidor', 'error');
    }
}

// Función para cerrar modal
function closeUserModal() {
    const modal = document.getElementById('userModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Función para manejar envío del formulario
async function handleUserSubmit(event) {
    event.preventDefault();
    console.log("📤 Enviando formulario de usuario");
    
    try {
        // Validar formulario
        if (!validateUserForm()) {
            return;
        }
        
        const userId = document.getElementById('userId').value;
        
        // Recopilar datos del formulario
        const formData = {
            nombre: document.getElementById('nombre').value.trim(),
            username: document.getElementById('username').value.trim(),
            email: document.getElementById('email').value.trim(),
            telefono: document.getElementById('telefono').value.trim(),
            password: document.getElementById('password').value,
            rol: document.getElementById('rol').value,
            sucursal: document.getElementById('sucursal').value,
            activo: document.getElementById('activo').checked
        };
        
        // Determinar URL y método
        const url = userId ? `/usuarios/${userId}/` : '/usuarios/';
        const method = userId ? 'PUT' : 'POST';
        
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
            showNotification(data.message, 'success');
            closeUserModal();
            loadUsuarios(); // Recargar lista
        } else {
            throw new Error(data.message || 'Error al procesar la solicitud');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification(error.message, 'error');
    }
}

// Función para validar formulario
function validateUserForm() {
    const requiredFields = ['nombre', 'username', 'email', 'rol', 'sucursal'];
    
    for (const fieldId of requiredFields) {
        const field = document.getElementById(fieldId);
        if (!field || !field.value.trim()) {
            showNotification(`El campo ${fieldId} es requerido`, 'error');
            field?.focus();
            return false;
        }
    }
    
    // Validar email
    const email = document.getElementById('email').value.trim();
    if (!email.includes('@')) {
        showNotification('El correo electrónico no es válido', 'error');
        document.getElementById('email').focus();
        return false;
    }
    
    // Validar contraseña para usuarios nuevos
    const userId = document.getElementById('userId').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm_password').value;
    
    if (!userId && (!password || password.length < 8)) {
        showNotification('La contraseña debe tener al menos 8 caracteres', 'error');
        document.getElementById('password').focus();
        return false;
    }
    
    if (password && password !== confirmPassword) {
        showNotification('Las contraseñas no coinciden', 'error');
        document.getElementById('confirm_password').focus();
        return false;
    }
    
    return true;
}

// Función para cargar sucursales
async function loadSucursales() {
    // Verificar sesión antes de continuar
    if (!await checkSessionAndRedirect()) {
        return;
    }
    
    try {
        console.log("🔄 Solicitando lista de sucursales...");
        const response = await fetch('/api/sucursales/');
        
        // Verificar primero si la respuesta es exitosa
        if (!response.ok) {
            throw new Error(`Error en la respuesta: ${response.status} ${response.statusText}`);
        }
        
        // Verificar tipo de contenido antes de parsear
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            throw new Error(`Respuesta no es JSON: ${contentType}`);
        }
        
        const data = await response.json();
        
        if (data.status === 'success') {
            const select = document.getElementById('sucursal');
            if (!select) {
                console.error("❌ No se encontró el elemento select#sucursal");
                return;
            }
            
            select.innerHTML = '<option value="">Seleccionar sucursal</option>';
            
            if (!Array.isArray(data.sucursales)) {
                console.error("❌ data.sucursales no es un array:", data);
                return;
            }
            
            console.log(`✅ ${data.sucursales.length} sucursales cargadas`);
            data.sucursales.forEach(sucursal => {
                const option = document.createElement('option');
                option.value = sucursal.id;
                option.textContent = sucursal.nombre;
                select.appendChild(option);
            });
        } else {
            console.error("❌ Estado de respuesta incorrecto:", data);
            showNotification('Error al cargar sucursales', 'error');
        }
    } catch (error) {
        console.error('❌ Error cargando sucursales:', error);
        
        // Intentar cargar sucursales desde un endpoint alternativo como respaldo
        try {
            console.log("🔄 Intentando endpoint alternativo para sucursales...");
            const response = await fetch('/api/sucursales-para-usuario/');
            
            if (!response.ok) {
                throw new Error(`Error en respuesta alternativa: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.status === 'success' && Array.isArray(data.sucursales)) {
                const select = document.getElementById('sucursal');
                if (select) {
                    select.innerHTML = '<option value="">Seleccionar sucursal</option>';
                    data.sucursales.forEach(sucursal => {
                        const option = document.createElement('option');
                        option.value = sucursal.id;
                        option.textContent = sucursal.nombre;
                        select.appendChild(option);
                    });
                    console.log("✅ Sucursales cargadas desde endpoint alternativo");
                }
            } else {
                throw new Error("Formato de datos incorrecto en endpoint alternativo");
            }
        } catch (fallbackError) {
            console.error("❌ Error en endpoint alternativo:", fallbackError);
            
            // En caso de que todos los intentos fallen, cargar valores de demostración
            const select = document.getElementById('sucursal');
            if (select) {
                select.innerHTML = `
                    <option value="1">Sucursal 1</option>
                    <option value="2">Sucursal 2</option>
                    <option value="3">Sucursal 3</option>
                `;
                console.log("✅ Sucursales de demostración cargadas");
            }
        }
    }
}

// Añadir esta nueva función debajo de loadSucursales

// Función específica para cargar sucursales en el select del modal de usuario
async function loadSucursalesForSelect() {
    try {
        console.log("🔄 Cargando sucursales para el select...");
        
        // Verificar que existe el elemento select
        const selectElement = document.getElementById('sucursal');
        if (!selectElement) {
            console.error("❌ No se encontró el elemento select#sucursal");
            return;
        }
        
        // Intentar primero la API principal
        const response = await fetch('/api/sucursales-para-usuario/');
        
        if (!response.ok) {
            throw new Error(`Error en la respuesta: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.status === 'success' && Array.isArray(data.sucursales)) {
            // Limpiar opciones existentes
            selectElement.innerHTML = '<option value="">Seleccionar sucursal</option>';
            
            // Agregar nuevas opciones
            data.sucursales.forEach(sucursal => {
                const option = document.createElement('option');
                option.value = sucursal.id;
                option.textContent = sucursal.nombre;
                selectElement.appendChild(option);
            });
            
            console.log(`✅ ${data.sucursales.length} sucursales cargadas en el select`);
            return true;
        } else {
            throw new Error("Formato de datos incorrecto");
        }
    } catch (error) {
        console.error('❌ Error cargando sucursales:', error);
        
        // Cargar opciones de emergencia
        const selectElement = document.getElementById('sucursal');
        if (selectElement) {
            selectElement.innerHTML = `
                <option value="">Seleccionar sucursal</option>
                <option value="1">Sucursal 1</option>
                <option value="2">Sucursal 2</option>
                <option value="3">Sucursal 3</option>
            `;
            console.warn("⚠️ Cargadas sucursales de emergencia");
        }
        return true;
    }
}

// Añadir esta función para verificar la sesión

async function checkSessionAndRedirect() {
    try {
        const response = await fetch('/api/check-session/', {
            method: 'GET',
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        });
        
        if (!response.ok) {
            console.error("❌ Sesión inválida, redirigiendo...");
            window.location.href = '/login/?next=' + encodeURIComponent(window.location.pathname);
            return false;
        }
        
        return true;
    } catch (error) {
        console.error("❌ Error verificando sesión:", error);
        return false;
    }
}