/**
 * Utilidades para manejar permisos en el frontend
 */

// Verificar si el usuario tiene permisos de administrador
function isAdmin() {
    return window.userPermissions && window.userPermissions.admin === true;
}

// Verificar si el usuario tiene permisos de gerente o superiores
function isGerente() {
    return window.userPermissions && (window.userPermissions.gerente === true || window.userPermissions.admin === true);
}

// Verificar si el usuario puede ver un recurso
function canView(resourceType, resourceData = {}) {
    // Administradores pueden ver todo
    if (isAdmin()) return true;
    
    // Gerentes tienen acceso limitado según el recurso
    if (isGerente()) {
        switch (resourceType) {
            case 'usuario':
                return true;
            case 'sucursal':
                return true;
            case 'insumo':
                return true;
            default:
                return true;
        }
    }
    
    // Empleados tienen acceso muy restringido
    return false;
}

/**
 * Determina si un usuario puede editar a otro basado en sus roles
 * @param {string} targetUserRole - Rol del usuario a editar
 * @returns {boolean} - Verdadero si puede editar
 */
function canEditUser(targetUserRole) {
    // Verificar si window.userPermissions está definido
    if (!window.userPermissions) {
        console.warn("userPermissions no está definido, usando valores predeterminados");
        return false;
    }
    
    // Normalizar el rol para comparaciones consistentes
    const normalizedRole = targetUserRole.toLowerCase();
    
    console.log(`Verificando si puede editar usuario con rol: ${normalizedRole}`);
    console.log(`Permisos actuales:`, window.userPermissions);
    
    // Superusuario puede editar a cualquiera
    if (window.userPermissions.superuser === true) {
        return true;
    }
    
    // Administrador puede editar a gerentes y empleados, pero no a otros administradores
    if (window.userPermissions.admin === true) {
        return normalizedRole !== 'administrador' && normalizedRole !== 'admin';
    }
    
    // Gerente puede editar sólo a empleados
    if (window.userPermissions.gerente === true) {
        return normalizedRole === 'empleado';
    }
    
    // Empleados no pueden editar a nadie
    return false;
}

// Verificar si el usuario puede editar un recurso
function canEdit(resourceType, resourceData = {}) {
    // Caso especial para usuarios
    if (resourceType === 'usuario') {
        return canEditUser(resourceData.rol);
    }
    
    // Administradores pueden editar otros recursos
    if (isAdmin()) {
        return true;
    }
    
    // Gerentes tienen limitaciones
    if (isGerente()) {
        switch (resourceType) {
            case 'sucursal':
                return resourceData.asignada === true;
            default:
                return true;
        }
    }
    
    return false;
}

// Verificar si el usuario puede eliminar un recurso
function canDelete(resourceType, resourceData = {}) {
    // Similar a canEdit pero potencialmente más restrictivo
    return canEdit(resourceType, resourceData);
}

// Inicializar permisos al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    console.log("Inicializando permisos desde permissions.js");
    
    const permissionsElement = document.getElementById('user-permissions-data');
    if (permissionsElement) {
        try {
            const permissionsData = JSON.parse(permissionsElement.textContent.trim());
            window.userPermissions = {
                admin: permissionsData.admin === true,
                gerente: permissionsData.gerente === true,
                superuser: permissionsData.superuser === true,
                sucursales: permissionsData.sucursales || []
            };
            console.log("✅ Permisos cargados correctamente:", window.userPermissions);
        } catch (e) {
            console.error("❌ Error al parsear permisos:", e);
            console.error("Contenido del elemento:", permissionsElement.textContent);
        }
    } else {
        console.warn("⚠️ No se encontró el elemento con los permisos");
    }
});

// Inicializar la interfaz basada en permisos
document.addEventListener('DOMContentLoaded', function() {
    // Elementos solo visibles para administradores
    document.querySelectorAll('.admin-only').forEach(el => {
        el.style.display = isAdmin() ? '' : 'none';
    });
    
    // Elementos visibles para gerentes y administradores
    document.querySelectorAll('.manager-up').forEach(el => {
        el.style.display = isGerente() ? '' : 'none';
    });
});

// Exponer funciones globalmente
window.isAdmin = isAdmin;
window.isGerente = isGerente;
window.canView = canView;
window.canEdit = canEdit;
window.canDelete = canDelete;
window.canEditUser = canEditUser;