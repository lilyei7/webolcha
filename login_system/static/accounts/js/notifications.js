class NotificationManager {
    constructor() {
        this.bell = document.getElementById('notificationsButton');
        this.badge = document.querySelector('.notification-badge');
        this.dropdown = document.getElementById('notificationsDropdown');
        this.list = document.querySelector('.notifications-list');
        this.emptyState = document.querySelector('.notifications-empty');
        this.unreadCount = 0;
        
        // Comentar temporalmente hasta implementar WebSockets
        // this.initializeWebSocket();
        this.initializeEventListeners();
        this.loadNotifications();
    }

    initializeWebSocket() {
        this.socket = new WebSocket(
            `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws/notifications/`
        );

        this.socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.addNotification(data);
        };
    }

    initializeEventListeners() {
        this.bell.parentElement.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleDropdown();
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.notifications-menu')) {
                this.dropdown.classList.remove('show');
            }
        });

        document.querySelector('.mark-all-read').addEventListener('click', () => {
            this.markAllAsRead();
        });
    }

    async loadNotifications() {
        try {
            // Simular datos de ejemplo
            const mockNotifications = [
                {
                    id: 1,
                    type: 'sucursal_created',
                    title: 'Nueva Sucursal',
                    message: 'Se ha creado la sucursal "Plaza Norte" exitosamente',
                    icon: 'fa-building',
                    created_at: new Date().toISOString(),
                    read: false
                },
                {
                    id: 2,
                    type: 'user_created',
                    title: 'Nuevo Usuario',
                    message: 'El usuario "María González" ha sido registrado como Gerente',
                    icon: 'fa-user-plus',
                    created_at: new Date(Date.now() - 30 * 60000).toISOString(), // 30 minutos atrás
                    read: false
                },
                {
                    id: 3,
                    type: 'inventory_update',
                    title: 'Actualización de Inventario',
                    message: 'Se han agregado 50 nuevos productos al inventario',
                    icon: 'fa-box',
                    created_at: new Date(Date.now() - 2 * 3600000).toISOString(), // 2 horas atrás
                    read: true
                },
                {
                    id: 4,
                    type: 'system_alert',
                    title: 'Mantenimiento Programado',
                    message: 'El sistema entrará en mantenimiento hoy a las 22:00 hrs',
                    icon: 'fa-gear',
                    created_at: new Date(Date.now() - 5 * 3600000).toISOString(), // 5 horas atrás
                    read: true
                }
            ];

            this.unreadCount = mockNotifications.filter(n => !n.read).length;
            this.updateBadge();
            this.renderNotifications(mockNotifications);
        } catch (error) {
            console.error('Error loading notifications:', error);
        }
    }

    updateBadge() {
        this.badge.textContent = this.unreadCount;
        this.badge.classList.toggle('pulse', this.unreadCount > 0);
        this.badge.style.display = this.unreadCount > 0 ? 'flex' : 'none';
    }

    addNotification(notification) {
        if (!notification.read) {
            this.unreadCount++;
            this.updateBadge();
        }

        const element = this.createNotificationElement(notification);
        this.list.insertBefore(element, this.list.firstChild);
        this.emptyState.style.display = 'none';
        
        // Animación de entrada
        element.style.opacity = '0';
        element.style.transform = 'translateX(-20px)';
        setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateX(0)';
        }, 50);
    }

    createNotificationElement(notification) {
        const element = document.createElement('div');
        element.className = `notification-item ${notification.read ? '' : 'unread'} ${notification.type}`;
        element.innerHTML = `
            <i class="fa-solid ${notification.icon}"></i>
            <div class="notification-content">
                <div class="notification-title">${notification.title}</div>
                <div class="notification-message">${notification.message}</div>
                <div class="notification-time">
                    <i class="fa-regular fa-clock"></i> 
                    ${this.formatTime(notification.created_at)}
                </div>
            </div>
        `;
        
        // Agregar efecto hover
        element.addEventListener('mouseenter', () => {
            element.style.transform = 'translateX(4px)';
        });
        
        element.addEventListener('mouseleave', () => {
            element.style.transform = 'translateX(0)';
        });

        return element;
    }

    renderNotifications(notifications) {
        if (!this.list) {
            console.error('Notifications list element not found');
            return;
        }

        // Limpiar la lista actual
        this.list.innerHTML = '';

        if (notifications.length === 0) {
            if (this.emptyState) {
                this.emptyState.style.display = 'block';
            }
            return;
        }

        // Ocultar el estado vacío si hay notificaciones
        if (this.emptyState) {
            this.emptyState.style.display = 'none';
        }

        // Renderizar cada notificación
        notifications.forEach(notification => {
            const element = this.createNotificationElement(notification);
            
            // Agregar con animación
            element.style.opacity = '0';
            element.style.transform = 'translateX(-20px)';
            this.list.appendChild(element);
            
            // Trigger animation
            setTimeout(() => {
                element.style.opacity = '1';
                element.style.transform = 'translateX(0)';
            }, 50);
        });
    }

    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = Math.floor((now - date) / 1000);

        if (diff < 60) return 'Justo ahora';
        if (diff < 3600) return `Hace ${Math.floor(diff / 60)} minutos`;
        if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} horas`;
        return date.toLocaleDateString();
    }

    toggleDropdown() {
        if (this.dropdown) {
            this.dropdown.classList.toggle('show');
            if (this.dropdown.classList.contains('show')) {
                // Forzar re-render de las notificaciones cuando se abre
                this.loadNotifications();
            }
        } else {
            console.error('Dropdown element not found');
        }
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.notificationManager = new NotificationManager();
});