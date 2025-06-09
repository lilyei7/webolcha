/**
 * Funciones comunes para todos los formularios de usuarios
 */

// Función para mostrar notificaciones
function showNotification(message, type = 'success') {
    console.log('Mostrando notificación:', message, type);
    
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

// Función para obtener CSRF token
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

// Validaciones comunes
function validateCommonFields(formData) {
    const required = ['nombre', 'username', 'email'];
    
    for (const field of required) {
        if (!formData[field] || formData[field].trim() === '') {
            throw new Error(`El campo ${field} es requerido`);
        }
    }
    
    // Validar email
    if (!formData.email.includes('@')) {
        throw new Error('El correo electrónico no es válido');
    }
    
    return true;
}

// Función para cerrar modal
function closeUserModal() {
    const modal = document.getElementById('userModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Exportar funciones comunes
window.UserCommon = {
    showNotification,
    getCookie,
    validateCommonFields,
    closeUserModal
};