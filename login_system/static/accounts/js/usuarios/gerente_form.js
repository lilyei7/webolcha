/**
 * Formulario específico para usuarios gerentes
 * Solo pueden crear/editar empleados de sus sucursales
 */

class GerenteUserForm {
    constructor() {
        this.modalId = 'userModal';
        this.formId = 'userForm';
    }

    async showModal(userId = null) {
        console.log('👔 GERENTE: Mostrando modal de usuario');
        
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
        title.textContent = userId ? 'Editar Empleado' : 'Nuevo Empleado';
        
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

        // Configurar selector de rol - GERENTE SOLO VE EMPLEADO
        const rolSelect = document.getElementById('rol');
        if (rolSelect) {
            rolSelect.innerHTML = '<option value="empleado">Empleado</option>';
            rolSelect.disabled = true;
            rolSelect.value = 'empleado';
        }

        // Cargar solo las sucursales del gerente
        await this.loadGerenteSucursales();

        // Si es edición, cargar datos del usuario
        if (userId) {
            await this.loadUserData(userId);
        }

        modal.style.display = 'flex';
    }

    async loadGerenteSucursales() {
        try {
            const response = await fetch('/api/sucursales-para-usuario/');
            const data = await response.json();
            
            if (data.status === 'success') {
                const sucursalSelect = document.getElementById('sucursal');
                
                // Si el gerente tiene una sola sucursal, preseleccionarla y deshabilitar
                if (data.sucursales.length === 1) {
                    const sucursal = data.sucursales[0];
                    sucursalSelect.innerHTML = `<option value="${sucursal.id}" selected>${sucursal.nombre}</option>`;
                    sucursalSelect.disabled = true;
                    console.log(`✅ Sucursal única preseleccionada: ${sucursal.nombre}`);
                } else {
                    // Si tiene varias, mostrar todas pero preseleccionar la primera
                    sucursalSelect.innerHTML = '<option value="">Seleccionar sucursal</option>';
                    data.sucursales.forEach((sucursal, index) => {
                        const option = document.createElement('option');
                        option.value = sucursal.id;
                        option.textContent = sucursal.nombre;
                        if (index === 0) option.selected = true;
                        sucursalSelect.appendChild(option);
                    });
                }
            }
        } catch (error) {
            console.error('Error cargando sucursales del gerente:', error);
        }
    }

    async loadUserData(userId) {
        try {
            const response = await fetch(`/usuarios/${userId}/`);
            const data = await response.json();
            
            if (data.status === 'success') {
                const user = data.usuario;
                
                // Verificar que el usuario es empleado (gerentes no pueden editar otros roles)
                if (user.rol !== 'Empleado') {
                    throw new Error('Los gerentes solo pueden editar empleados');
                }
                
                // Llenar campos básicos
                document.getElementById('nombre').value = user.nombre;
                document.getElementById('username').value = user.username;
                document.getElementById('email').value = user.email;
                document.getElementById('telefono').value = user.telefono || '';
                document.getElementById('activo').checked = user.activo;

                // El rol ya está fijo en "empleado"
                
                // Configurar sucursal (debería estar en las sucursales del gerente)
                if (user.sucursal_id) {
                    const sucursalSelect = document.getElementById('sucursal');
                    const option = Array.from(sucursalSelect.options)
                        .find(opt => opt.value == user.sucursal_id);
                    if (option) {
                        sucursalSelect.value = user.sucursal_id;
                    } else {
                        throw new Error('El empleado no pertenece a tus sucursales asignadas');
                    }
                }

                // Limpiar campos de contraseña
                document.getElementById('password').value = '';
                document.getElementById('confirm_password').value = '';
                
                const passwordLabel = document.querySelector('label[for="password"]');
                if (passwordLabel) {
                    passwordLabel.innerHTML = 'Contraseña: <span class="optional">(opcional - dejar en blanco para mantener)</span>';
                }
            }
        } catch (error) {
            console.error('Error cargando datos del empleado:', error);
            UserCommon.showNotification(error.message, 'error');
            UserCommon.closeUserModal();
        }
    }

    async handleSubmit(event) {
        event.preventDefault();
        console.log('👔 GERENTE: Procesando formulario de empleado');

        try {
            const formData = this.collectFormData();
            UserCommon.validateCommonFields(formData);
            this.validateGerenteSpecific(formData);

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
            rol: 'empleado', // Siempre empleado para gerentes
            sucursal: document.getElementById('sucursal').value,
            activo: document.getElementById('activo').checked
        };
    }

    validateGerenteSpecific(formData) {
        // Forzar rol de empleado
        if (formData.rol !== 'empleado') {
            throw new Error('Los gerentes solo pueden crear empleados');
        }

        // Validar sucursal requerida
        if (!formData.sucursal) {
            throw new Error('Debe seleccionar una sucursal');
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

// Instancia global para gerentes
window.gerenteUserForm = new GerenteUserForm();

// **IMPORTANTE: Asegurar que las funciones se exportan inmediatamente**
console.log('🔧 Exportando funciones de gerente al ámbito global...');

// Funciones globales para compatibilidad - con verificación
if (typeof window.showAddUserModal === 'undefined') {
    window.showAddUserModal = function() {
        console.log('👔 GERENTE: Ejecutando showAddUserModal');
        if (window.gerenteUserForm && typeof window.gerenteUserForm.showModal === 'function') {
            window.gerenteUserForm.showModal();
        } else {
            console.error('❌ gerenteUserForm no está disponible o no tiene método showModal');
        }
    };
}

if (typeof window.editUser === 'undefined') {
    window.editUser = function(userId) {
        console.log('👔 GERENTE: Ejecutando editUser para:', userId);
        if (window.gerenteUserForm && typeof window.gerenteUserForm.showModal === 'function') {
            window.gerenteUserForm.showModal(userId);
        } else {
            console.error('❌ gerenteUserForm no está disponible o no tiene método showModal');
        }
    };
}

if (typeof window.handleUserSubmit === 'undefined') {
    window.handleUserSubmit = function(event) {
        console.log('👔 GERENTE: Ejecutando handleUserSubmit');
        if (window.gerenteUserForm && typeof window.gerenteUserForm.handleSubmit === 'function') {
            window.gerenteUserForm.handleSubmit(event);
        } else {
            console.error('❌ gerenteUserForm no está disponible o no tiene método handleSubmit');
        }
    };
}

// Marcar que el script se ha cargado completamente
window.gerenteFormLoaded = true;

console.log('✅ Funciones de gerente exportadas correctamente:', {
    showAddUserModal: typeof window.showAddUserModal,
    editUser: typeof window.editUser,
    handleUserSubmit: typeof window.handleUserSubmit,
    gerenteUserForm: !!window.gerenteUserForm
});