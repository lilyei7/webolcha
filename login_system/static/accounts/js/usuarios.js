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
        
        <!-- Modal para agregar/editar usuario -->
        <div id="userModal" class="modal">
            <div class="modal-content">
                <span class="close-modal" onclick="closeUserModal()">&times;</span>
                <h2 id="userModalTitle">Nuevo Usuario</h2>
                <form id="userForm" onsubmit="handleUserSubmit(event)">
                    <input type="hidden" id="userId" name="userId" value="">
                    
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
                                <option value="empleado">Empleado</option>
                                <option value="gerente">Gerente</option>
                                <option value="admin">Administrador</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="sucursal">Sucursal asignada:</label>
                            <select id="sucursal" name="sucursal" required>
                                <option value="">Seleccionar sucursal</option>
                            </select>
                        </div>
                    </div>

                    <div class="form-row password-section">
                        <div class="form-group">
                            <label for="password">Contraseña:</label>
                            <input type="password" id="password" name="password">
                        </div>
                        <div class="form-group">
                            <label for="confirm_password">Confirmar contraseña:</label>
                            <input type="password" id="confirm_password" name="confirm_password">
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
                        <button type="button" class="btn-secondary" onclick="closeUserModal()">
                            <i class="fa-solid fa-times"></i> Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;

    loadUsuarios();
    initializeEventListeners();

    // Aseguramos que las funciones críticas estén definidas
    ensureFunctionsAvailable();
}

// Inicializar event listeners para elementos de la interfaz
function initializeEventListeners() {
    // Inicializar los event listeners de los toggles de contraseña
    const togglePasswordButtons = document.querySelectorAll('.toggle-password');
    togglePasswordButtons.forEach(button => {
        button.addEventListener('click', function() {
            const input = this.previousElementSibling;
            const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
            input.setAttribute('type', type);
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
        });
    });
}

// Asegurar que las funciones críticas estén disponibles
function ensureFunctionsAvailable() {
    // Implementaciones de respaldo para funciones críticas
    if (typeof window.closeUserModal !== 'function') {
        console.warn('La función closeUserModal no está disponible. Usando implementación de respaldo.');
        window.closeUserModal = function() {
            const modal = document.getElementById('userModal');
            if (modal) {
                modal.style.display = 'none';
            }
        };
    }

    if (typeof window.showAddUserModal !== 'function') {
        console.warn('La función showAddUserModal no está disponible. Usando implementación de respaldo.');
        window.showAddUserModal = function() {
            const modal = document.getElementById('userModal');
            if (modal) {
                modal.style.display = 'flex';
            }
        };
    }

    // Inicializar window.userPermissions si no existe
    if (!window.userPermissions) {
        console.warn('window.userPermissions no está definido. Inicializándolo con valores predeterminados.');
        window.userPermissions = {
            admin: false,
            gerente: false,
            superuser: false
        };
    }

    // Asegurar que existe el campo de ID de usuario
    if (!document.getElementById('userId')) {
        console.warn('Campo userId no encontrado, creando uno temporal.');
        const hiddenField = document.createElement('input');
        hiddenField.type = 'hidden';
        hiddenField.id = 'userId';
        hiddenField.name = 'userId';
        document.getElementById('userForm')?.appendChild(hiddenField);
    }
}

// Carga la lista de usuarios desde la API
async function loadUsuarios() {
    console.log("🔍 Iniciando carga de usuarios...");
    console.log("🔑 Permisos actuales:", window.userPermissions);
    
    // Asegurarse que canEditUser está disponible
    const checkEditPermission = function(targetRole) {
        // Si la función canEditUser está disponible, usarla
        if (typeof window.canEditUser === 'function') {
            console.log(`✓ Usando función canEditUser para ${targetRole}`);
            return window.canEditUser(targetRole);
        } 
        
        // Implementación local de respaldo
        console.log(`⚠️ Usando implementación local para permisos de ${targetRole}`);
        
        // Normalizar el rol para comparaciones consistentes
        const normalizedRole = targetRole.toLowerCase();
        
        // Superusuario puede editar a cualquiera
        if (window.userPermissions && window.userPermissions.superuser === true) {
            return true;
        }
        
        // Administrador puede editar a gerentes y empleados, pero no a otros administradores
        if (window.userPermissions && window.userPermissions.admin === true) {
            return normalizedRole !== 'administrador' && normalizedRole !== 'admin';
        }
        
        // Gerente puede editar sólo a empleados
        if (window.userPermissions && window.userPermissions.gerente === true) {
            return normalizedRole === 'empleado';
        }
        
        // Empleados no pueden editar a nadie
        return false;
    };
    
    try {
        const response = await fetch('/usuarios/');
        const data = await response.json();
        console.log("📊 Datos recibidos de la API:", data);
        
        if (data.status === 'success') {
            const grid = document.getElementById('usuariosGrid');
            if (!grid) {
                console.error("❌ Error: No se encontró el elemento usuariosGrid");
                return;
            }
            
            if (!data.usuarios || data.usuarios.length === 0) {
                console.log("ℹ️ No hay usuarios para mostrar");
                grid.innerHTML = '<div class="no-data">No hay usuarios para mostrar</div>';
                return;
            }
            
            grid.innerHTML = data.usuarios.map(usuario => {
                console.log(`👤 Procesando usuario: ${usuario.nombre}, Rol: ${usuario.rol}`);
                
                // Determinar si se puede editar este usuario usando la función local
                const canEdit = checkEditPermission(usuario.rol);
                console.log(`👉 ¿Puede editar a ${usuario.nombre}? ${canEdit ? 'SÍ' : 'NO'}`);
                
                return `
                <div class="user-card ${!usuario.activo ? 'inactive-user' : ''}">
                    <div class="user-header">
                        <div class="user-avatar">
                            <i class="fa-solid fa-user"></i>
                        </div>
                        <div class="user-info">
                            <h3>${usuario.nombre}</h3>
                            <span class="user-role role-${usuario.rol.toLowerCase()}">${usuario.rol}</span>
                            ${!usuario.activo ? '<span class="user-inactive">Inactivo</span>' : ''}
                        </div>
                    </div>
                    <div class="user-details">
                        <p><i class="fa-solid fa-at"></i> ${usuario.email}</p>
                        <p><i class="fa-solid fa-building"></i> ${usuario.sucursal || 'No asignada'}</p>
                        <p><i class="fa-solid fa-phone"></i> ${usuario.telefono || 'No registrado'}</p>
                    </div>
                    <div class="user-actions">
                        ${canEdit ? `
                            <button class="btn-edit" onclick="editUser(${usuario.id})" title="Editar usuario">
                                <i class="fa-solid fa-pen"></i>
                            </button>
                            <button class="btn-delete" onclick="deleteUser(${usuario.id})" title="Eliminar usuario">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        ` : `
                            <button class="btn-disabled" title="No tienes permiso para editar este usuario">
                                <i class="fa-solid fa-lock"></i>
                            </button>
                        `}
                    </div>
                </div>
                `;
            }).join('');
            
            console.log("✅ Usuarios cargados exitosamente");
        } else {
            console.error("❌ Error en la respuesta:", data.message || "Desconocido");
            document.getElementById('usuariosGrid').innerHTML = 
                '<div class="error-message">Error al cargar usuarios</div>';
        }
    } catch (error) {
        console.error("❌ Error al cargar usuarios:", error);
        document.getElementById('usuariosGrid').innerHTML = 
            '<div class="error-message">Error al conectar con el servidor</div>';
    }
}

// Función para editar un usuario si usuarios_form.js no está disponible
function editUser(userId) {
    console.log(`Intentando editar usuario con ID: ${userId}`);
    
    // Verificar si la función está disponible en el ámbito global (usuarios_form.js)
    if (typeof window.editUser === 'function' && window.editUser !== editUser) {
        // Llamar a la implementación externa
        window.editUser(userId);
    } else {
        // Implementación de respaldo
        fetch(`/usuarios/${userId}/`)
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    const user = data.usuario;
                    // Aquí implementaría la funcionalidad de edición
                    // Por ahora, solo mostramos los datos y un mensaje
                    console.log("Datos del usuario:", user);
                    showNotification('Función de edición completa en usuarios_form.js', 'info');
                } else {
                    showNotification(data.message || 'Error al cargar el usuario', 'error');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showNotification('Error al conectar con el servidor', 'error');
            });
    }
}

// Función para eliminar un usuario
function deleteUser(userId) {
    if (!confirm('¿Está seguro de que desea eliminar este usuario?')) {
        return;
    }
    
    fetch(`/usuarios/${userId}/`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            showNotification(data.message, 'success');
            loadUsuarios(); // Recargar la lista
        } else {
            throw new Error(data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('Error al eliminar usuario', 'error');
    });
}

// Mostrar notificaciones
function showNotification(message, type = 'success') {
    console.log('Mostrando notificación:', message, type);
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fa-solid ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Funciones para verificación de permisos
function isAdmin() {
    return window.userPermissions && window.userPermissions.admin === true;
}

function isGerente() {
    return window.userPermissions && (window.userPermissions.gerente === true || isAdmin());
}

// Función para obtener el CSRF token
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

// Exportar funciones al ámbito global para que sean accesibles desde HTML
window.loadUsuariosContent = loadUsuariosContent;
window.loadUsuarios = loadUsuarios;
window.editUser = editUser;
window.deleteUser = deleteUser;
window.closeUserModal = closeUserModal;
window.showAddUserModal = showAddUserModal;

function renderUsuarios(usuarios) {
    const grid = document.getElementById('usuariosGrid');
    
    if (!usuarios || usuarios.length === 0) {
        grid.innerHTML = '<p class="no-data">No hay usuarios para mostrar</p>';
        return;
    }
    
    grid.innerHTML = usuarios.map(usuario => {
        // Determinar clase CSS del rol para la tarjeta
        let roleClass = 'role-empleado'; // Por defecto
        const roleLower = usuario.rol.toLowerCase();
        
        if (roleLower === 'administrador' || roleLower === 'admin') {
            roleClass = 'role-administrador'; // Usar 'administrador' completo
        } else if (roleLower === 'gerente') {
            roleClass = 'role-gerente';
        } else if (roleLower === 'empleado') {
            roleClass = 'role-empleado';
        }
        
        const isInactive = !usuario.activo;
        const cardClass = isInactive ? 'user-card inactive-user' : 'user-card';
        
        // Determinar si el usuario puede ser editado
        const canEditThisUser = typeof window.canEditUser === 'function' 
            ? window.canEditUser(usuario.rol)
            : (window.userPermissions && 
              ((window.userPermissions.admin && usuario.rol !== 'Administrador') || 
               window.userPermissions.superuser || 
               (window.userPermissions.gerente && usuario.rol === 'Empleado')));
        
        return `
            <div class="${cardClass}">
                <div class="user-header">
                    <div class="user-avatar">
                        <i class="fa-solid fa-user"></i>
                    </div>
                    <div class="user-info">
                        <h3>${usuario.nombre}</h3>
                        <span class="user-role ${roleClass}">${usuario.rol}</span>
                        ${isInactive ? '<span class="user-inactive">Inactivo</span>' : ''}
                    </div>
                </div>
                
                <div class="user-details">
                    <p><i class="fa-solid fa-at"></i> ${usuario.username}</p>
                    <p><i class="fa-solid fa-envelope"></i> ${usuario.email}</p>
                    ${usuario.telefono ? `<p><i class="fa-solid fa-phone"></i> ${usuario.telefono}</p>` : ''}
                    <p><i class="fa-solid fa-building"></i> ${usuario.sucursal || 'Sin asignar'}</p>
                </div>
                
                <div class="user-actions">
                    ${canEditThisUser ? 
                        `<button class="btn-secondary" onclick="editUser(${usuario.id})">
                            <i class="fa-solid fa-edit"></i> Editar
                        </button>` :
                        `<button class="btn-disabled" disabled title="No tienes permisos para editar este usuario">
                            <i class="fa-solid fa-edit"></i> Editar
                        </button>`
                    }
                    ${canEditThisUser ?
                        `<button class="btn-danger" onclick="deleteUser(${usuario.id})">
                            <i class="fa-solid fa-trash"></i> Eliminar
                        </button>` :
                        `<button class="btn-disabled" disabled title="No tienes permisos para eliminar este usuario">
                            <i class="fa-solid fa-trash"></i> Eliminar
                        </button>`
                    }
                </div>
            </div>
        `;
    }).join('');
}