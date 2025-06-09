/**
 * Formulario específico para usuarios administradores
 * Pueden crear/editar cualquier tipo de usuario
 */

class AdminUserForm {
    constructor() {
        this.modalId = 'userModal';
        this.formId = 'userForm';
    }

    async showModal(userId = null) {
        console.log('🔧 ADMIN: Mostrando modal de usuario');
        
        const modal = document.getElementById(this.modalId);
        const form = document.getElementById(this.formId);
        
        if (!modal || !form) {
            console.error('Modal o formulario no encontrado');
            console.log('Elementos encontrados:', {
                modal: !!modal,
                form: !!form,
                modalId: this.modalId,
                formId: this.formId
            });
            
            // Intentar crear el modal si no existe
            if (!modal) {
                console.warn('Intentando crear modal faltante...');
                // Puedes implementar lógica para crear el modal aquí si es necesario
            }
            return;
        }

        // Limpiar formulario
        form.reset();
        
        // Configurar título
        const title = document.getElementById('userModalTitle');
        title.textContent = userId ? 'Editar Usuario' : 'Nuevo Usuario';
        
        // Campo oculto para ID
        let userIdField = document.getElementById('userId');
        if (!userIdField) {
            userIdField = document.createElement('input');
            userIdField.type = 'hidden';
            userIdField.id = 'userId';
            userIdField.name = 'userId';
            form.appendChild(userIdField);
        }
        userIdField.value = userId || '';

        // Configurar selector de rol - ADMIN VE TODAS LAS OPCIONES
        const rolSelect = document.getElementById('rol');
        if (rolSelect) {
            rolSelect.innerHTML = `
                <option value="empleado">Empleado</option>
                <option value="gerente">Gerente</option>
                <option value="admin">Administrador</option>
            `;
            rolSelect.disabled = false;
        }

        // Cargar sucursales (todas)
        await this.loadAllSucursales();

        // Si es edición, cargar datos del usuario
        if (userId) {
            await this.loadUserData(userId);
        }

        modal.style.display = 'flex';
    }

    async loadAllSucursales() {
        try {
            const response = await fetch('/api/sucursales-para-usuario/');
            const data = await response.json();
            
            if (data.status === 'success') {
                const sucursalSelect = document.getElementById('sucursal');
                sucursalSelect.innerHTML = '<option value="">Seleccionar sucursal</option>';
                
                data.sucursales.forEach(sucursal => {
                    const option = document.createElement('option');
                    option.value = sucursal.id;
                    option.textContent = sucursal.nombre;
                    sucursalSelect.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Error cargando sucursales:', error);
        }
    }

    async loadUserData(userId) {
        try {
            const response = await fetch(`/usuarios/${userId}/`);
            const data = await response.json();
            
            if (data.status === 'success') {
                const user = data.usuario;
                
                // Llenar campos básicos
                document.getElementById('nombre').value = user.nombre;
                document.getElementById('username').value = user.username;
                document.getElementById('email').value = user.email;
                document.getElementById('telefono').value = user.telefono || '';
                document.getElementById('activo').checked = user.activo;

                // Configurar rol
                const rolSelect = document.getElementById('rol');
                const rolMap = {
                    'Administrador': 'admin',
                    'Admin': 'admin',
                    'Gerente': 'gerente',
                    'Empleado': 'empleado'
                };
                const rolValue = rolMap[user.rol] || user.rol.toLowerCase();
                rolSelect.value = rolValue;

                // Configurar sucursal
                if (user.sucursal_id) {
                    document.getElementById('sucursal').value = user.sucursal_id;
                }

                // Limpiar campos de contraseña y marcarlos como opcionales
                document.getElementById('password').value = '';
                document.getElementById('confirm_password').value = '';
                
                const passwordLabel = document.querySelector('label[for="password"]');
                if (passwordLabel) {
                    passwordLabel.innerHTML = 'Contraseña: <span class="optional">(opcional - dejar en blanco para mantener)</span>';
                }
            }
        } catch (error) {
            console.error('Error cargando datos del usuario:', error);
            UserCommon.showNotification('Error al cargar los datos del usuario', 'error');
        }
    }

    async handleSubmit(event) {
        event.preventDefault();
        console.log('🔧 ADMIN: Procesando formulario');

        try {
            const formData = this.collectFormData();
            UserCommon.validateCommonFields(formData);
            this.validateAdminSpecific(formData);

            const userId = document.getElementById('userId').value;
            const url = userId ? `/usuarios/${userId}/` : '/usuarios/';
            const method = userId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': UserCommon.getCookie('csrftoken')
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            
            if (data.status === 'success') {
                UserCommon.showNotification(data.message, 'success');
                UserCommon.closeUserModal();
                if (typeof loadUsuarios === 'function') {
                    await loadUsuarios();
                }
            } else {
                throw new Error(data.message || 'Error al procesar la solicitud');
            }
        } catch (error) {
            console.error('Error:', error);
            UserCommon.showNotification(error.message, 'error');
        }
    }

    collectFormData() {
        return {
            nombre: document.getElementById('nombre').value.trim(),
            username: document.getElementById('username').value.trim(),
            email: document.getElementById('email').value.trim(),
            telefono: document.getElementById('telefono').value.trim(),
            password: document.getElementById('password').value,
            rol: document.getElementById('rol').value,
            sucursal: document.getElementById('sucursal').value,
            activo: document.getElementById('activo').checked
        };
    }

    validateAdminSpecific(formData) {
        // Validar sucursal requerida
        if (!formData.sucursal) {
            throw new Error('Debe seleccionar una sucursal');
        }

        // Validar rol
        if (!formData.rol) {
            throw new Error('Debe seleccionar un rol');
        }

        // Validar contraseña para usuarios nuevos
        const userId = document.getElementById('userId').value;
        if (!userId && (!formData.password || formData.password.length < 8)) {
            throw new Error('La contraseña debe tener al menos 8 caracteres');
        }

        // Validar confirmación de contraseña
        if (formData.password) {
            const confirmPassword = document.getElementById('confirm_password').value;
            if (formData.password !== confirmPassword) {
                throw new Error('Las contraseñas no coinciden');
            }
        }

        return true;
    }
}

// Instancia global para administradores
window.adminUserForm = new AdminUserForm();

// Funciones globales para compatibilidad
window.showAddUserModal = function() {
    window.adminUserForm.showModal();
};

window.editUser = function(userId) {
    window.adminUserForm.showModal(userId);
};

window.handleUserSubmit = function(event) {
    window.adminUserForm.handleSubmit(event);
};