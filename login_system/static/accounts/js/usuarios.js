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

            <div class="usuarios-filters">
                <div class="search-box">
                    <input type="text" id="searchUser" placeholder="Buscar usuario...">
                    <i class="fa-solid fa-search"></i>
                </div>
                <div class="role-filter">
                    <select id="filterRole">
                        <option value="todos">
                            <i class="fa-solid fa-users"></i>
                            Todos los roles
                        </option>
                        <option value="admin">
                            <i class="fa-solid fa-user-shield"></i>
                            Administrador
                        </option>
                        <option value="gerente">
                            <i class="fa-solid fa-user-tie"></i>
                            Gerente
                        </option>
                        <option value="empleado">
                            <i class="fa-solid fa-user"></i>
                            Empleado
                        </option>
                    </select>
                </div>
            </div>

            <div class="usuarios-grid" id="usuariosGrid"></div>
        </div>
    `;

    // Antes de agregar el modal, elimina el anterior si existe
    if (document.getElementById('userModal')) {
        document.getElementById('userModal').remove();
    }
    const modalHTML = `
        <div id="userModal" class="modal">
            <div class="modal-content">
                <span class="close-modal" onclick="closeUserModal()">&times;</span>
                <h2 id="userModalTitle">Nuevo Usuario</h2>
                <form id="userForm" onsubmit="handleUserSubmit(event)">
                    <input type="hidden" id="userId">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="nombreusuario">Nombre completo:</label>
                            <input type="text" id="nombreusuario" name="nombreusuario" required>
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
                            <label for="telefonousuario">Teléfono:</label>
                            <input type="tel" id="telefonousuario" name="telefonousuario" pattern="[0-9+ -]*">
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
                            <option value="sucursal1">Sucursal 1</option>
                            <option value="sucursal2">Sucursal 2</option>
                            </select>
                        </div>
                    </div>

                    <div class="form-row password-section">
                        <div class="form-group">
                            <label for="password">Contraseña:</label>
                            <div class="password-input">
                                <input type="password" id="password" name="password" required>
                                <i class="fa-solid fa-eye toggle-password"></i>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="confirm_password">Confirmar contraseña:</label>
                            <div class="password-input">
                                <input type="password" id="confirm_password" name="confirm_password" required>
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
                        <button type="button" class="btn-secondary" onclick="closeUserModal()">
                            <i class="fa-solid fa-times"></i> Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    loadUsuarios();
    initializeEventListeners();
}

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

async function loadUsuarios() {
    try {
        const response = await fetch('/usuarios/');
        const data = await response.json();
        
        if (data.status === 'success') {
            const grid = document.getElementById('usuariosGrid');
            grid.innerHTML = data.usuarios.map(usuario => `
                <div class="user-card">
                    <div class="user-header">
                        <div class="user-avatar">
                            <i class="fa-solid fa-user"></i>
                        </div>
                        <div class="user-info">
                            <h3>${usuario.nombre}</h3>
                            <span class="user-role role-${usuario.rol}">${usuario.rol}</span>
                        </div>
                    </div>
                    <div class="user-details">
                        <p><i class="fa-solid fa-at"></i> ${usuario.email}</p>
                        <p><i class="fa-solid fa-building"></i> ${usuario.sucursal}</p>
                        <p><i class="fa-solid fa-phone"></i> ${usuario.telefono || 'No registrado'}</p>
                    </div>
                    <div class="user-actions">
                        <button class="btn-edit" onclick="editUser(${usuario.id})" title="Editar usuario">
                            <i class="fa-solid fa-pen"></i>
                        </button>
                        <button class="btn-delete" onclick="deleteUser(${usuario.id})" title="Eliminar usuario">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function editUser(userId) {
    try {
        const response = await fetch(`/usuarios/${userId}/`);
        const data = await response.json();
        
        if (data.status === 'success') {
            const user = data.usuario;
            console.log('Datos del usuario recibidos:', user); // Debug
            
            // Limpiar campos de contraseña
            document.getElementById('password').value = '';
            document.getElementById('confirm_password').value = '';
            document.getElementById('password').required = false;
            document.getElementById('confirm_password').required = false;
            
            // Rellenar el formulario con los datos del usuario
            document.getElementById('nombreusuario').value = user.nombre || '';
            document.getElementById('username').value = user.username || '';
            document.getElementById('email').value = user.email || '';
            document.getElementById('telefonousuario').value = user.telefono || '';
            document.getElementById('rol').value = user.rol || 'empleado';
            document.getElementById('sucursal').value = user.sucursal || '';
            document.getElementById('activo').checked = user.activo;
            document.getElementById('userId').value = user.id;
            
            // Ocultar campos de contraseña en edición
            const passwordSection = document.querySelector('.password-section');
            if (passwordSection) {
                const passwordInputs = passwordSection.querySelectorAll('input');
                passwordInputs.forEach(input => {
                    input.required = false;
                    input.value = '';
                });
            }
            
            // Cambiar título del modal
            document.getElementById('userModalTitle').textContent = 'Editar Usuario';
            
            // Mostrar el modal
            const modal = document.getElementById('userModal');
            if (modal) {
                modal.style.display = 'flex';
            }
        }
    } catch (error) {
        console.error('Error al cargar usuario:', error);
        showNotification('Error al cargar datos del usuario', 'error');
    }
}

async function deleteUser(userId) {
    if (!confirm('¿Está seguro de que desea eliminar este usuario?')) {
        return;
    }
    
    try {
        const response = await fetch(`/usuarios/${userId}/`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            }
        });
        
        const data = await response.json();
        
        if (data.status === 'success') {
            showNotification(data.message, 'success');
            await loadUsuarios();
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error al eliminar usuario', 'error');
    }
}

// Modificar showAddUserModal para no limpiar los campos en edición
function showAddUserModal() {
    const modal = document.getElementById('userModal');
    const form = document.getElementById('userForm');
    const userId = document.getElementById('userId').value;
    
    if (modal && form) {
        if (!userId) {
            // Nuevo usuario: limpiar todo
            document.getElementById('userModalTitle').textContent = 'Nuevo Usuario';
            form.reset();
            document.getElementById('userId').value = '';
            
            // Hacer campos de contraseña requeridos
            const passwordInputs = document.querySelectorAll('.password-section input');
            passwordInputs.forEach(input => input.required = true);
        }
        // En edición: mantener los datos
        
        modal.style.display = 'flex';
    }
}

// Función para cerrar el modal
function closeUserModal() {
    const modal = document.getElementById('userModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Modificar handleUserSubmit para manejar tanto creación como edición
async function handleUserSubmit(event) {
    event.preventDefault();
    
    try {
        const form = document.getElementById('userForm');
        const userId = document.getElementById('userId').value;
        
        const formData = {
            nombre: document.getElementById('nombreusuario').value.trim(),
            username: document.getElementById('username').value.trim(),
            email: document.getElementById('email').value.trim(),
            telefono: document.getElementById('telefonousuario').value.trim(),
            password: document.getElementById('password').value,
            rol: document.getElementById('rol').value,
            sucursal: document.getElementById('sucursal').value,
            activo: document.getElementById('activo').checked
        };

        // Si no hay contraseña en edición, eliminarla del objeto
        if (!formData.password && userId) {
            delete formData.password;
        }

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
            await loadUsuarios();
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification(error.message, 'error');
    }
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

function validateUserForm() {
    const fields = {
        nombreusuario: 'El nombre es requerido',
        username: 'El nombre de usuario es requerido',
        email: 'El correo electrónico es requerido',
        password: 'La contraseña es requerida',
        confirm_password: 'Debe confirmar la contraseña'
    };

    // Validar campos requeridos
    for (const [fieldId, message] of Object.entries(fields)) {
        const field = document.getElementById(fieldId);
        const value = field.value.trim();
        
        if (!value) {
            showNotification(message, 'error');
            field.focus();
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

    // Validar contraseñas
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm_password').value;

    if (password.length < 8) {
        showNotification('La contraseña debe tener al menos 8 caracteres', 'error');
        document.getElementById('password').focus();
        return false;
    }

    if (password !== confirmPassword) {
        showNotification('Las contraseñas no coinciden', 'error');
        document.getElementById('confirm_password').focus();
        return false;
    }

    return true;
}

// Agregar console.log para debugging
function showNotification(message, type = 'success') {
    console.log('Mostrando notificación:', message, type); // Para debugging
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

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Búsqueda en tiempo real
    const searchInput = document.getElementById('searchUs');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            // Implementar búsqueda
        });
    }

    // Filtro por rol
    const filterRole = document.getElementById('filterRole');
    if (filterRole) {
        filterRole.addEventListener('change', function() {
            // Implementar filtrado
        });
    }

    // Agregar event listener para el formulario
    const userForm = document.getElementById('userForm');
    if (userForm) {
        userForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Valores del formulario en submit:');
            console.log('nombre:', document.getElementById('nombre').value);
            console.log('username:', document.getElementById('username').value);
            console.log('email:', document.getElementById('email').value);
            handleUserSubmit(e);
        });
    }
});