/**
 * Formulario específico para empleados
 * Solo pueden editar su propio perfil (campos limitados)
 */

class EmpleadoUserForm {
    constructor() {
        this.modalId = 'userModal';
        this.formId = 'userForm';
    }

    async showModal(userId = null) {
        console.log('👤 EMPLEADO: Mostrando modal de perfil');
        
        // Los empleados solo pueden editar su propio perfil
        const currentUserId = window.currentUserId || null;
        if (userId && userId != currentUserId) {
            UserCommon.showNotification('Solo puedes editar tu propio perfil', 'error');
            return;
        }

        const modal = document.getElementById(this.modalId);
        const form = document.getElementById(this.formId);
        
        if (!modal || !form) {
            console.error('Modal o formulario no encontrado');
            return;
        }

        // Limpiar formulario
        form.reset();
        
        // Configurar título
        const title = document.getElementById('userModalTitle');
        title.textContent = 'Mi Perfil';
        
        // Campo oculto para ID
        let userIdField = document.getElementById('userId');
        if (!userIdField) {
            userIdField = document.createElement('input');
            userIdField.type = 'hidden';
            userIdField.id = 'userId';
            userIdField.name = 'userId';
            form.appendChild(userIdField);
        }
        userIdField.value = currentUserId;

        // Deshabilitar campos que no pueden editar
        this.setupReadOnlyFields();

        // Cargar datos del perfil
        await this.loadProfileData(currentUserId);

        modal.style.display = 'flex';
    }

    setupReadOnlyFields() {
        // Campos que los empleados NO pueden editar
        const readOnlyFields = ['username', 'rol', 'sucursal', 'activo'];
        
        readOnlyFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.disabled = true;
                field.style.backgroundColor = '#f5f5f5';
                field.style.cursor = 'not-allowed';
            }
        });

        // Ocultar selector de rol y sucursal o mostrar como texto
        const rolSelect = document.getElementById('rol');
        const sucursalSelect = document.getElementById('sucursal');
        
        if (rolSelect) {
            rolSelect.style.display = 'none';
            // Crear un campo de texto para mostrar el rol
            const rolDisplay = document.createElement('input');
            rolDisplay.type = 'text';
            rolDisplay.disabled = true;
            rolDisplay.style.backgroundColor = '#f5f5f5';
            rolDisplay.id = 'rol_display';
            rolSelect.parentNode.appendChild(rolDisplay);
        }

        if (sucursalSelect) {
            sucursalSelect.style.display = 'none';
            // Crear un campo de texto para mostrar la sucursal
            const sucursalDisplay = document.createElement('input');
            sucursalDisplay.type = 'text';
            sucursalDisplay.disabled = true;
            sucursalDisplay.style.backgroundColor = '#f5f5f5';
            sucursalDisplay.id = 'sucursal_display';
            sucursalSelect.parentNode.appendChild(sucursalDisplay);
        }
    }

    async loadProfileData(userId) {
        try {
            const response = await fetch(`/usuarios/${userId}/`);
            const data = await response.json();
            
            if (data.status === 'success') {
                const user = data.usuario;
                
                // Llenar campos editables
                document.getElementById('nombre').value = user.nombre;
                document.getElementById('email').value = user.email;
                document.getElementById('telefono').value = user.telefono || '';

                // Mostrar campos de solo lectura
                const rolDisplay = document.getElementById('rol_display');
                if (rolDisplay) {
                    rolDisplay.value = user.rol;
                }

                const sucursalDisplay = document.getElementById('sucursal_display');
                if (sucursalDisplay) {
                    sucursalDisplay.value = user.sucursal || 'No asignada';
                }

                // Mostrar username como solo lectura
                document.getElementById('username').value = user.username;

                // Limpiar campos de contraseña
                document.getElementById('password').value = '';
                document.getElementById('confirm_password').value = '';
                
                const passwordLabel = document.querySelector('label[for="password"]');
                if (passwordLabel) {
                    passwordLabel.innerHTML = 'Nueva contraseña: <span class="optional">(opcional - dejar en blanco para mantener)</span>';
                }
            }
        } catch (error) {
            console.error('Error cargando perfil:', error);
            UserCommon.showNotification('Error al cargar tu perfil', 'error');
        }
    }

    async handleSubmit(event) {
        event.preventDefault();
        console.log('👤 EMPLEADO: Actualizando perfil');

        try {
            const formData = this.collectFormData();
            this.validateEmpleadoSpecific(formData);

            const userId = document.getElementById('userId').value;
            const response = await fetch(`/usuarios/${userId}/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': UserCommon.getCookie('csrftoken')
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            
            if (data.status === 'success') {
                UserCommon.showNotification('Perfil actualizado correctamente', 'success');
                UserCommon.closeUserModal();
            } else {
                throw new Error(data.message || 'Error al actualizar el perfil');
            }
        } catch (error) {
            console.error('Error:', error);
            UserCommon.showNotification(error.message, 'error');
        }
    }

    collectFormData() {
        // Solo campos que el empleado puede editar
        return {
            nombre: document.getElementById('nombre').value.trim(),
            email: document.getElementById('email').value.trim(),
            telefono: document.getElementById('telefono').value.trim(),
            password: document.getElementById('password').value
        };
    }

    validateEmpleadoSpecific(formData) {
        // Validaciones básicas
        if (!formData.nombre) {
            throw new Error('El nombre es requerido');
        }

        if (!formData.email || !formData.email.includes('@')) {
            throw new Error('El correo electrónico es requerido y debe ser válido');
        }

        // Validar contraseña si se proporciona
        if (formData.password) {
            if (formData.password.length < 8) {
                throw new Error('La contraseña debe tener al menos 8 caracteres');
            }

            const confirmPassword = document.getElementById('confirm_password').value;
            if (formData.password !== confirmPassword) {
                throw new Error('Las contraseñas no coinciden');
            }
        }

        return true;
    }
}

// Instancia global para empleados
window.empleadoUserForm = new EmpleadoUserForm();

// Funciones globales para compatibilidad (solo perfil)
window.showAddUserModal = function() {
    UserCommon.showNotification('Los empleados no pueden crear usuarios', 'error');
};

window.editUser = function(userId) {
    window.empleadoUserForm.showModal(userId);
};

window.handleUserSubmit = function(event) {
    window.empleadoUserForm.handleSubmit(event);
};