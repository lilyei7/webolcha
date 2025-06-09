// Función para editar un usuario - con mejor manejo de roles
async function editUser(userId) {
    try {
        console.log(`🔄 Cargando datos del usuario ${userId}...`);
        const response = await fetch(`/usuarios/${userId}/`);
        const data = await response.json();
        
        if (data.status === 'success') {
            const user = data.usuario;
            console.log("📋 Datos del usuario a editar:", user);
            
            // Continuar con la edición...
            document.getElementById('userModalTitle').textContent = 'Editar Usuario';
            document.getElementById('userId').value = user.id;
            
            // Valores normales
            document.getElementById('nombre').value = user.nombre;
            document.getElementById('username').value = user.username;
            document.getElementById('email').value = user.email;
            document.getElementById('telefono').value = user.telefono || '';
            
            // Vaciar campos de contraseña para edición
            document.getElementById('password').value = '';
            document.getElementById('confirm_password').value = '';
            
            // Actualizar labels para indicar que la contraseña es opcional en edición
            const passwordLabel = document.querySelector('label[for="password"]');
            const confirmPasswordLabel = document.querySelector('label[for="confirm_password"]');
            
            if (passwordLabel) {
                passwordLabel.innerHTML = 'Contraseña: <span class="optional">(opcional - dejar en blanco para mantener)</span>';
            }
            if (confirmPasswordLabel) {
                confirmPasswordLabel.innerHTML = 'Confirmar contraseña: <span class="optional">(opcional)</span>';
            }
            
            // Estado activo/inactivo
            document.getElementById('activo').checked = user.activo;
            
            // **AQUÍ ESTÁ EL PROBLEMA - FALTA APLICAR RESTRICCIONES PARA GERENTE EN EDICIÓN**
            
            // Verificar si el usuario actual es gerente (sin permisos de admin)
            const esGerente = window.userPermissions && 
                             window.userPermissions.gerente === true && 
                             !window.userPermissions.admin && 
                             !window.userPermissions.superuser;
            
            console.log("¿Es gerente?", esGerente);
            
            // MANEJO DEL ROL - CON RESTRICCIONES PARA GERENTE
            const rolSelect = document.getElementById('rol');
            
            if (esGerente) {
                // Si es gerente, FORZAR a mostrar solo "Empleado"
                console.log("APLICANDO RESTRICCIÓN: Gerente solo puede editar como empleado");
                rolSelect.innerHTML = '<option value="empleado">Empleado</option>';
                rolSelect.disabled = true;
                
                // Asegurar campo oculto
                let hiddenRolField = document.getElementById('hidden_rol');
                if (!hiddenRolField) {
                    hiddenRolField = document.createElement('input');
                    hiddenRolField.type = 'hidden';
                    hiddenRolField.id = 'hidden_rol';
                    hiddenRolField.name = 'hidden_rol';
                    document.getElementById('userForm').appendChild(hiddenRolField);
                }
                hiddenRolField.value = 'empleado';
                
            } else {
                // Para administradores, manejar roles normalmente
                const rolMap = {
                    'Administrador': 'admin',
                    'Admin': 'admin',
                    'Gerente': 'gerente',
                    'Empleado': 'empleado'
                };
                
                const normalizedRole = user.rol.trim();
                const rolValue = rolMap[normalizedRole] || normalizedRole.toLowerCase();
                
                // Asegurar que exista el campo oculto para el rol
                let hiddenRolField = document.getElementById('hidden_rol');
                if (!hiddenRolField) {
                    hiddenRolField = document.createElement('input');
                    hiddenRolField.type = 'hidden';
                    hiddenRolField.id = 'hidden_rol';
                    hiddenRolField.name = 'hidden_rol';
                    document.getElementById('userForm').appendChild(hiddenRolField);
                }
                
                hiddenRolField.value = rolValue;
                
                // Verificar si la opción ya existe en el select
                const optionExists = Array.from(rolSelect.options).some(option => 
                    option.value.toLowerCase() === rolValue.toLowerCase()
                );
                
                if (optionExists) {
                    rolSelect.value = rolValue;
                } else {
                    // Si no existe la opción, agregarla
                    const newOption = new Option(user.rol, rolValue);
                    rolSelect.add(newOption);
                    rolSelect.value = rolValue;
                }
            }
            
            // Cargar sucursales con restricciones
            await cargarSucursalesParaUsuario();
            
            // Seleccionar la sucursal actual del usuario
            const sucursalSelect = document.getElementById('sucursal');
            if (sucursalSelect && user.sucursal_id) {
                for (const option of sucursalSelect.options) {
                    if (option.value == user.sucursal_id) {
                        option.selected = true;
                        break;
                    }
                }
            }
            
            document.getElementById('userModal').style.display = 'flex';
        } else {
            showNotification(data.message || 'Error al cargar el usuario', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error al conectar con el servidor', 'error');
    }
}

// Mostrar modal para agregar o editar un usuario
function showAddUserModal() {
    // Asegurar que existe el campo userId
    if (!document.getElementById('userId')) {
        const hiddenField = document.createElement('input');
        hiddenField.type = 'hidden';
        hiddenField.id = 'userId';
        hiddenField.name = 'userId';
        document.getElementById('userForm')?.appendChild(hiddenField);
    }
    
    // Asegurar que existe el campo hidden_rol
    if (!document.getElementById('hidden_rol')) {
        const hiddenRolField = document.createElement('input');
        hiddenRolField.type = 'hidden';
        hiddenRolField.id = 'hidden_rol';
        hiddenRolField.name = 'hidden_rol';
        document.getElementById('userForm')?.appendChild(hiddenRolField);
    }
    
    const modal = document.getElementById('userModal');
    const form = document.getElementById('userForm');
    const userIdField = document.getElementById('userId');
    
    if (modal && form && userIdField) {
        const userId = userIdField.value || '';
        
        if (!userId) {
            // Nuevo usuario: limpiar todo y configurar
            document.getElementById('userModalTitle').textContent = 'Nuevo Usuario';
            form.reset();
            userIdField.value = '';
            
            // RESTRICCIÓN: Si es gerente, restringir el selector de rol a "Empleado" únicamente
            const esGerente = window.userPermissions && 
                             window.userPermissions.gerente === true && 
                             !window.userPermissions.admin && 
                             !window.userPermissions.superuser;
    
            console.log("¿Es gerente al crear usuario?", esGerente);
    
            const rolSelect = document.getElementById('rol');
            if (rolSelect && esGerente) {
                console.log("APLICANDO RESTRICCIÓN: Gerente solo puede crear empleados");
                
                // Limpiar opciones existentes y agregar solo empleado
                rolSelect.innerHTML = '<option value="empleado">Empleado</option>';
                rolSelect.disabled = true;
                
                // Actualizar también el campo oculto del rol
                let hiddenRolField = document.getElementById('hidden_rol');
                if (!hiddenRolField) {
                    hiddenRolField = document.createElement('input');
                    hiddenRolField.type = 'hidden';
                    hiddenRolField.id = 'hidden_rol';
                    hiddenRolField.name = 'hidden_rol';
                    document.getElementById('userForm').appendChild(hiddenRolField);
                }
                hiddenRolField.value = 'empleado';
            }
        }
        
        // Cargar sucursales - La API ya filtra según permisos del usuario
        cargarSucursalesParaUsuario();
        
        modal.style.display = 'flex';
    } else {
        console.error("Error: No se encontraron elementos necesarios para el modal");
    }
}

// Función para cerrar el modal
function closeUserModal() {
    const modal = document.getElementById('userModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Manejar el envío del formulario con mejor manejo de rol
async function handleUserSubmit(event) {
    event.preventDefault();
    
    console.group("📤 Enviando formulario de usuario");
    
    try {
        const form = document.getElementById('userForm');
        const userId = document.getElementById('userId').value;
        
        // Validar el formulario
        if (!validateUserForm()) {
            console.groupEnd();
            return;
        }
        
        // Obtener el valor del teléfono
        const telefonoField = document.getElementById('telefono');
        const telefonoValue = telefonoField ? telefonoField.value.trim() : '';
        
        // MANEJO MEJORADO DEL ROL - CORREGIR ESTA PARTE
        const rolSelect = document.getElementById('rol');
        const hiddenRolField = document.getElementById('hidden_rol');
        let rolValue;
        
        // Determinar qué valor de rol usar, en orden de prioridad:
        if (rolSelect && !rolSelect.disabled) {
            // 1. Si el select está habilitado, usar su valor directamente
            rolValue = rolSelect.value;
            console.log(`⭐ Usando valor del select de rol (habilitado): "${rolValue}"`);
        } else if (hiddenRolField && hiddenRolField.value) {
            // 2. Si hay campo oculto con valor, usarlo (prioridad para edición de admins)
            rolValue = hiddenRolField.value;
            console.log(`⭐ Usando valor del campo oculto: "${rolValue}"`);
        } else if (rolSelect) {
            // 3. Incluso si está deshabilitado, intentar usar el valor del select
            rolValue = rolSelect.value;
            console.log(`⭐ Usando valor del select deshabilitado: "${rolValue}"`);
        } else {
            // 4. Si todo lo anterior falla, valor por defecto
            rolValue = 'empleado';
            console.log(`⚠️ Usando valor predeterminado: "${rolValue}"`);
        }
        
        // Validación adicional del rol
        if (!rolValue || rolValue === '' || rolValue === 'undefined') {
            console.error("❌ ERROR: El rol está vacío o indefinido");
            // Intentar obtener el rol desde el campo oculto o usar empleado por defecto
            if (hiddenRolField && hiddenRolField.value && hiddenRolField.value !== '') {
                rolValue = hiddenRolField.value;
                console.log(`🔧 Usando valor del campo oculto como respaldo: "${rolValue}"`);
            } else {
                rolValue = userId ? 'empleado' : 'empleado'; // Para edición y creación
                console.log(`🔧 Usando valor predeterminado forzado: "${rolValue}"`);
            }
        }
        
        console.log(`📝 Rol final a enviar: "${rolValue}"`);
        
        // Verificar que tenemos sucursal
        const sucursalValue = document.getElementById('sucursal').value;
        if (!sucursalValue) {
            showNotification("Debe seleccionar una sucursal", "error");
            document.getElementById('sucursal').focus();
            console.groupEnd();
            return;
        }

        // Crear el objeto con los datos del formulario
        const formData = {
            nombre: document.getElementById('nombre').value.trim(),
            username: document.getElementById('username').value.trim(),
            email: document.getElementById('email').value.trim(),
            telefono: telefonoValue,
            password: document.getElementById('password').value,
            rol: rolValue, // Usar el valor validado del rol
            sucursal: sucursalValue,
            activo: document.getElementById('activo').checked
        };
        
        console.log("📦 Datos finales a enviar:", formData);

        // Determinar URL y método según sea creación o edición
        const url = userId ? `/usuarios/${userId}/` : '/usuarios/';
        const method = userId ? 'PUT' : 'POST';

        console.log(`📡 Enviando solicitud ${method} a ${url}`);
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        console.log("📩 Respuesta recibida:", data);
        
        if (data.status === 'success') {
            showNotification(data.message, 'success');
            closeUserModal();
            await loadUsuarios();
        } else {
            throw new Error(data.message || "Error al procesar la solicitud");
        }
    } catch (error) {
        console.error('❌ Error:', error);
        showNotification(error.message, 'error');
    }
    
    console.groupEnd();
}

// Validar formulario de usuario
function validateUserForm() {
    console.group("Validación del formulario de usuario");
    
    // Verificar que el formulario y los campos existen antes de validar
    const form = document.getElementById('userForm');
    if (!form) {
        console.error("Formulario userForm no encontrado");
        console.groupEnd();
        return false;
    }
    
    // Lista de campos requeridos y sus mensajes
    const fields = {
        nombre: 'El nombre es requerido',
        username: 'El nombre de usuario es requerido',
        email: 'El correo electrónico es requerido'
    };

    // Validar campos requeridos con verificación adicional
    for (const [fieldId, message] of Object.entries(fields)) {
        const field = document.getElementById(fieldId);
        if (!field) {
            console.error(`¡ALERTA! Campo ${fieldId} no encontrado en el formulario`);
            showNotification(`Error: Campo ${fieldId} no encontrado`, 'error');
            console.groupEnd();
            return false;
        }
        
        // Verificar que el campo tenga un valor válido
        let value = '';
        try {
            value = field.value ? field.value.trim() : '';
        } catch (e) {
            console.error(`Error al obtener valor del campo ${fieldId}:`, e);
            value = '';
        }
        
        console.log(`Validando campo ${fieldId}: "${value}" (tipo: ${field.type}, ID: ${field.id})`);
        
        if (!value || value.length === 0) {
            console.error(`El campo ${fieldId} está vacío o solo contiene espacios`);
            showNotification(message, 'error');
            
            // Intentar enfocar el campo
            try {
                field.focus();
            } catch (e) {
                console.warn(`No se pudo enfocar el campo ${fieldId}`);
            }
            
            console.groupEnd();
            return false;
        }
    }

    // Validar email
    const emailField = document.getElementById('email');
    if (emailField && emailField.value) {
        const email = emailField.value.trim();
        if (!email.includes('@')) {
            showNotification('El correo electrónico no es válido', 'error');
            emailField.focus();
            console.groupEnd();
            return false;
        }
    }

    // Validar contraseñas (solo para usuarios nuevos o si se ingresó contraseña)
    const passwordField = document.getElementById('password');
    const confirmPasswordField = document.getElementById('confirm_password');
    const userIdField = document.getElementById('userId');
    
    if (passwordField && confirmPasswordField && userIdField) {
        const password = passwordField.value || '';
        const confirmPassword = confirmPasswordField.value || '';
        const userId = userIdField.value || '';

        // Si es usuario nuevo, la contraseña es obligatoria
        if (!userId && (!password || password.length < 8)) {
            showNotification('La contraseña debe tener al menos 8 caracteres', 'error');
            passwordField.focus();
            console.groupEnd();
            return false;
        }

        // Si hay contraseña, debe coincidir con la confirmación
        if (password && password !== confirmPassword) {
            showNotification('Las contraseñas no coinciden', 'error');
            confirmPasswordField.focus();
            console.groupEnd();
            return false;
        }
    }

    console.log("✅ Formulario validado correctamente");
    console.groupEnd();
    return true;
}

// Cargar sucursales para el formulario de usuario
async function cargarSucursalesParaUsuario() {
    try {
        console.log("🔄 Solicitando sucursales al servidor...");
        console.log("Estado de permisos:", window.userPermissions);
        
        // Usar la API específica para sucursales de usuario en lugar de la genérica
        const response = await fetch('/api/sucursales-para-usuario/');
        const data = await response.json();
        
        if (data.status === 'success') {
            const sucursalSelect = document.getElementById('sucursal');
            
            if (sucursalSelect) {
                sucursalSelect.innerHTML = '<option value="">Seleccionar sucursal</option>';
                
                // Verificar que data.sucursales existe y es un array
                if (Array.isArray(data.sucursales)) {
                    console.log(`📋 Cargando ${data.sucursales.length} sucursales:`, data.sucursales);
                    
                    // Es gerente puro (sin permisos de admin)
                    const esGerente = window.userPermissions && 
                                     window.userPermissions.gerente === true && 
                                     !window.userPermissions.admin && 
                                     !window.userPermissions.superuser;
                    
                    // Si es gerente siempre debe preseleccionar la sucursal,
                    // independiente de cuántas tenga
                    if (esGerente && data.sucursales.length > 0) {
                        // Preseleccionar siempre la primera sucursal para gerentes
                        const firstSucursal = data.sucursales[0];
                        
                        // Si hay una sola sucursal, mostrar solo esa
                        if (data.sucursales.length === 1) {
                            sucursalSelect.innerHTML = ''; // Limpiar la opción "Seleccionar sucursal"
                            const option = document.createElement('option');
                            option.value = firstSucursal.id;
                            option.textContent = firstSucursal.nombre;
                            option.selected = true;
                            sucursalSelect.appendChild(option);
                            sucursalSelect.disabled = true; // Deshabilitar el selector
                            console.log(`✅ Única sucursal seleccionada: ${firstSucursal.nombre}`);
                        } else {
                            // Si hay varias, agregar todas pero preseleccionar la primera
                            data.sucursales.forEach((sucursal, index) => {
                                const option = document.createElement('option');
                                option.value = sucursal.id;
                                option.textContent = sucursal.nombre;
                                if (index === 0) {
                                    option.selected = true;
                                }
                                sucursalSelect.appendChild(option);
                            });
                            console.log(`✅ Primera sucursal preseleccionada de ${data.sucursales.length}`);
                        }
                    } else {
                        // Para administradores, mostrar todas sin preseleccionar
                        data.sucursales.forEach(sucursal => {
                            const option = document.createElement('option');
                            option.value = sucursal.id;
                            option.textContent = sucursal.nombre;
                            sucursalSelect.appendChild(option);
                        });
                    }
                    
                    console.log("✅ Sucursales cargadas correctamente");
                } else {
                    console.error("❌ Error: data.sucursales no es un array", data);
                }
            }
        }
    } catch (error) {
        console.error('❌ Error en la solicitud de sucursales:', error);
        showNotification("Error al cargar las sucursales", "error");
    }
}

// Función para mostrar notificaciones (por si no existe)
function showNotification(message, type = 'success') {
    console.log('Mostrando notificación:', message, type);
    
    // Verificar si ya existe una función global showNotification
    if (typeof window.showNotification === 'function' && window.showNotification !== showNotification) {
        window.showNotification(message, type);
        return;
    }
    
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

// Función para diagnosticar problemas del formulario
function debugUserForm() {
    console.group("Diagnóstico del Formulario de Usuarios");
    
    // Comprobar campos importantes
    const fields = ['nombre', 'username', 'email', 'telefono', 'rol', 'sucursal', 'password'];
    
    fields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        console.log(`Campo ${fieldId}:`, field ? 
            {
                valor: field.value,
                tipo: field.type,
                required: field.required,
                pattern: field.pattern || 'N/A'
            } : 'NO ENCONTRADO');
    });
    
    // Comprobar si el modal está visible
    const modal = document.getElementById('userModal');
    console.log("Modal de usuario:", modal ? 
        { 
            visible: modal.style.display === 'flex',
            style: modal.style.display
        } : 'NO ENCONTRADO');
    
    console.groupEnd();
}

// Agregar la función a window para acceso desde consola
window.debugUserForm = debugUserForm;

// Modificar showAddUserModal para incluir depuración
function showAddUserModal() {
    // Asegurar que existe el campo userId
    if (!document.getElementById('userId')) {
        const hiddenField = document.createElement('input');
        hiddenField.type = 'hidden';
        hiddenField.id = 'userId';
        hiddenField.name = 'userId';
        document.getElementById('userForm')?.appendChild(hiddenField);
    }
    
    // Asegurar que existe el campo hidden_rol
    if (!document.getElementById('hidden_rol')) {
        const hiddenRolField = document.createElement('input');
        hiddenRolField.type = 'hidden';
        hiddenRolField.id = 'hidden_rol';
        hiddenRolField.name = 'hidden_rol';
        document.getElementById('userForm')?.appendChild(hiddenRolField);
    }
    
    const modal = document.getElementById('userModal');
    const form = document.getElementById('userForm');
    const userIdField = document.getElementById('userId');
    
    if (modal && form && userIdField) {
        const userId = userIdField.value || '';
        
        if (!userId) {
            // Nuevo usuario: limpiar todo y configurar
            document.getElementById('userModalTitle').textContent = 'Nuevo Usuario';
            form.reset();
            userIdField.value = '';
            
            // RESTRICCIÓN: Si es gerente, restringir el selector de rol a "Empleado" únicamente
            const esGerente = window.userPermissions && 
                             window.userPermissions.gerente === true && 
                             !window.userPermissions.admin && 
                             !window.userPermissions.superuser;
    
            console.log("¿Es gerente al crear usuario?", esGerente);
    
            const rolSelect = document.getElementById('rol');
            if (rolSelect && esGerente) {
                console.log("APLICANDO RESTRICCIÓN: Gerente solo puede crear empleados");
                
                // Limpiar opciones existentes y agregar solo empleado
                rolSelect.innerHTML = '<option value="empleado">Empleado</option>';
                rolSelect.disabled = true;
                
                // Actualizar también el campo oculto del rol
                let hiddenRolField = document.getElementById('hidden_rol');
                if (!hiddenRolField) {
                    hiddenRolField = document.createElement('input');
                    hiddenRolField.type = 'hidden';
                    hiddenRolField.id = 'hidden_rol';
                    hiddenRolField.name = 'hidden_rol';
                    document.getElementById('userForm').appendChild(hiddenRolField);
                }
                hiddenRolField.value = 'empleado';
            }
        }
        
        // Cargar sucursales - La API ya filtra según permisos del usuario
        cargarSucursalesParaUsuario();
        
        modal.style.display = 'flex';
    } else {
        console.error("Error: No se encontraron elementos necesarios para el modal");
    }
    
    // Agregar depuración después de mostrar el modal
    setTimeout(() => {
        console.log("Modal de usuario mostrado, ejecutando diagnóstico...");
        debugUserForm();
    }, 500);
}

// Función de diagnóstico para el rol
window.debugRolFields = function() {
    const rolSelect = document.getElementById('rol');
    const hiddenRolField = document.getElementById('hidden_rol');
    
    console.group("Diagnóstico de campos de rol");
    console.log("rolSelect:", rolSelect ? {
        value: rolSelect.value,
        disabled: rolSelect.disabled,
        selectedIndex: rolSelect.selectedIndex,
        options: Array.from(rolSelect.options).map(o => ({value: o.value, text: o.text}))
    } : "No encontrado");
    
    console.log("hiddenRolField:", hiddenRolField ? {
        value: hiddenRolField.value
    } : "No encontrado");
    console.groupEnd();
    
    return "Diagnóstico completado - revisa la consola";
};

// Función de debugging para verificar permisos
window.debugPermisos = function() {
    console.group("🔍 DEBUG PERMISOS");
    console.log("window.userPermissions:", window.userPermissions);
    
    if (window.userPermissions) {
        const esGerente = window.userPermissions.gerente === true && 
                         !window.userPermissions.admin && 
                         !window.userPermissions.superuser;
        console.log("¿Es gerente puro?", esGerente);
        console.log("admin:", window.userPermissions.admin);
        console.log("gerente:", window.userPermissions.gerente);
        console.log("superuser:", window.userPermissions.superuser);
    }
    console.groupEnd();
};

// Exportar funciones que podrían no estar disponibles globalmente
window.showNotification = showNotification;

// Exportar las funciones para que estén disponibles globalmente
window.showAddUserModal = showAddUserModal;
window.closeUserModal = closeUserModal;
window.handleUserSubmit = handleUserSubmit;
window.editUser = editUser;

// Para diagnóstico: asegurar que el campo userId existe al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    // Esperar un poco para que el DOM se complete
    setTimeout(() => {
        if (!document.getElementById('userId')) {
            console.warn("El campo userId no existe, será creado cuando se abra el modal");
        }

        // Añadir listeners para debug del campo nombre
        const nombreField = document.getElementById('nombre');
        if (nombreField) {
            nombreField.addEventListener('input', function() {
                console.log(`Campo nombre cambió a: "${this.value}"`);
            });
            nombreField.addEventListener('blur', function() {
                console.log(`Campo nombre perdió foco con valor: "${this.value}"`);
            });
        } else {
            console.warn("Campo nombre no encontrado al cargar la página");
        }
    }, 1000);
});

// **AGREGAR AL FINAL DEL ARCHIVO:**
// Marcar que usuarios_form.js se ha cargado
window.usuarios_form_loaded = true;

// **IMPORTANTE: NO sobrescribir si ya existe una implementación específica**
if (!window.showAddUserModal || typeof window.showAddUserModal_generic === 'undefined') {
    window.showAddUserModal_generic = window.showAddUserModal; // Guardar versión genérica
}

if (!window.editUser || typeof window.editUser_generic === 'undefined') {
    window.editUser_generic = window.editUser; // Guardar versión genérica
}

if (!window.handleUserSubmit || typeof window.handleUserSubmit_generic === 'undefined') {
    window.handleUserSubmit_generic = window.handleUserSubmit; // Guardar versión genérica
}
