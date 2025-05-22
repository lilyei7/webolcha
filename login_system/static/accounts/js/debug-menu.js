/**
 * Utilidad para diagnosticar problemas con el menú desplegable
 * Agregar este script a su HTML para depurar problemas con la animación
 */
(function() {
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Inicializando debug-menu.js');
        
        // Crear botón de debugging en esquina inferior derecha
        const debugBtn = document.createElement('button');
        debugBtn.innerText = '🐞 Debug Menú';
        debugBtn.style.position = 'fixed';
        debugBtn.style.bottom = '10px';
        debugBtn.style.right = '10px';
        debugBtn.style.zIndex = '9999';
        debugBtn.style.padding = '8px 12px';
        debugBtn.style.backgroundColor = '#d946ef';
        debugBtn.style.color = 'white';
        debugBtn.style.border = 'none';
        debugBtn.style.borderRadius = '4px';
        debugBtn.style.cursor = 'pointer';
        
        // Agregar al DOM
        document.body.appendChild(debugBtn);
        
        // Click handler
        debugBtn.addEventListener('click', function() {
            // Obtener referencias
            const menuInventario = document.getElementById('menuInventario');
            const submenuInventario = document.getElementById('submenuInventario');
            
            // Mostrar información
            console.group('Información de depuración del menú');
            console.log('Menu element:', menuInventario);
            console.log('Submenu element:', submenuInventario);
            
            if (submenuInventario) {
                // Información de estilos
                const styles = window.getComputedStyle(submenuInventario);
                console.table({
                    'className': submenuInventario.className,
                    'display': styles.display,
                    'visibility': styles.visibility,
                    'max-height': styles.maxHeight,
                    'opacity': styles.opacity,
                    'overflow': styles.overflow,
                    'position': styles.position,
                    'z-index': styles.zIndex
                });
                
                // Forzar apertura del menú
                console.log('💡 Forzando apertura del menú para debugging');
                submenuInventario.classList.add('show');
                submenuInventario.style.display = 'block';
                submenuInventario.style.maxHeight = '500px';
                submenuInventario.style.visibility = 'visible';
                submenuInventario.style.opacity = '1';
                
                if (menuInventario) {
                    menuInventario.classList.add('active');
                    const chevron = menuInventario.querySelector('.submenu-icon');
                    if (chevron) {
                        chevron.style.transform = 'rotate(180deg)';
                    }
                }
            }
            
            console.groupEnd();
        });
        
        // Configurar debugging para el menú
        window.toggleDebugSubmenu = function() {
            const submenu = document.getElementById('submenuInventario');
            if (submenu) {
                submenu.classList.toggle('show');
                console.log('Debug toggle submenu:', submenu.classList.contains('show') ? 'visible' : 'hidden');
            }
        };
    });
})();
