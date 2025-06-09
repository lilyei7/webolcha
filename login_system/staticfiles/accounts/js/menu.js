// Archivo dedicado para el manejo del menú
(function() {
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Iniciando script dedicado para el menú (menu.js)');
        setupMenu();
        
        // Añadir debugging helpers
        window.debugMenu = function() {
            const menuInventario = document.getElementById('menuInventario');
            const submenuInventario = document.getElementById('submenuInventario');
            
            console.group('Debug información del menú');
            console.log('menuInventario element:', menuInventario);
            console.log('submenuInventario element:', submenuInventario);
            
            if (submenuInventario) {
                console.log('submenuInventario.className:', submenuInventario.className);
                console.log('submenuInventario.style.display:', getComputedStyle(submenuInventario).display);
                console.log('submenuInventario.style.maxHeight:', getComputedStyle(submenuInventario).maxHeight);
                console.log('submenuInventario.style.visibility:', getComputedStyle(submenuInventario).visibility);
                console.log('submenuInventario.style.opacity:', getComputedStyle(submenuInventario).opacity);
            }
            
            console.log('¿Tiene la clase "show"?', submenuInventario?.classList.contains('show'));
            console.groupEnd();
        };
        
        // Ejecutar debugging después de 1 segundo para asegurar que todo esté cargado
        setTimeout(window.debugMenu, 1000);
    });

    function setupMenu() {
        const menuInventario = document.getElementById('menuInventario');
        const submenuInventario = document.getElementById('submenuInventario');
        const chevron = menuInventario ? menuInventario.querySelector('.submenu-icon') : null;
        
        if (!menuInventario || !submenuInventario) {
            console.error('Menu elements not found for setup.');
            return;
        }

        // Initial state
        submenuInventario.classList.remove('show');
        submenuInventario.style.maxHeight = '0'; // Explicitly set for JS control
        submenuInventario.style.opacity = '0';
        submenuInventario.style.visibility = 'hidden';
        menuInventario.classList.remove('active');
        if(chevron) chevron.style.transform = 'rotate(0deg)';

        let clickTimeout;
        menuInventario.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            if (clickTimeout) {
                clearTimeout(clickTimeout);
            }
            
            clickTimeout = setTimeout(() => {
                const isOpening = !submenuInventario.classList.contains('show');
                
                if (isOpening) {
                    submenuInventario.classList.add('show'); // Add class first for styles
                    menuInventario.classList.add('active');
                    
                    // Set maxHeight to scrollHeight for smooth animation
                    submenuInventario.style.maxHeight = `${submenuInventario.scrollHeight}px`;
                    submenuInventario.style.opacity = '1';
                    submenuInventario.style.visibility = 'visible';
                    
                    if (chevron) {
                        chevron.style.transform = 'rotate(180deg)';
                    }
                    animateMenuItems(true);
                } else {
                    // Start closing animation
                    submenuInventario.style.maxHeight = '0';
                    submenuInventario.style.opacity = '0';
                    // Visibility will be handled by transitionend or timeout if needed,
                    // but max-height:0 and opacity:0 usually suffice.
                    // Keep visibility:hidden for transition in CSS.
                    
                    menuInventario.classList.remove('active');
                    if (chevron) {
                        chevron.style.transform = 'rotate(0deg)';
                    }
                    
                    // Remove .show class after transition
                    // Listen to transitionend for robustness
                    const handleTransitionEnd = () => {
                        if (!submenuInventario.classList.contains('show')) { // Check if still closing
                           submenuInventario.style.visibility = 'hidden';
                        }
                        submenuInventario.removeEventListener('transitionend', handleTransitionEnd);
                    };
                    submenuInventario.addEventListener('transitionend', handleTransitionEnd);
                    
                    // Fallback if transitionend doesn't fire (e.g. display:none interrupts)
                    // but with max-height it should be fine.
                    // The CSS transition is 0.4s (400ms)
                    setTimeout(() => {
                         submenuInventario.classList.remove('show');
                         // Ensure visibility is hidden if not already by transitionend
                         if (submenuInventario.style.maxHeight === '0px') {
                            submenuInventario.style.visibility = 'hidden';
                         }
                    }, 400);

                    animateMenuItems(false);
                }
            }, 50);
        }, { capture: true });

        // Cerrar submenú al hacer click fuera
        document.addEventListener('click', function(e) {
            if (submenuInventario.classList.contains('show') &&
                !menuInventario.contains(e.target) && 
                !submenuInventario.contains(e.target)) {
                
                submenuInventario.classList.remove('show');
                menuInventario.classList.remove('active');
                
                // Revertir estilos
                submenuInventario.style.maxHeight = '0';
                submenuInventario.style.height = '0';
                submenuInventario.style.visibility = 'hidden';
                submenuInventario.style.opacity = '0';
                
                if (chevron) {
                    chevron.style.transform = 'rotate(0deg)';
                }
                
                console.log('Menú cerrado por click fuera');
            }
        });
        
        // Comportamiento cuando se hace clic en un elemento del submenu
        const submenuLinks = submenuInventario.querySelectorAll('a');
        submenuLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                // No cerrar el submenu al hacer clic en sus elementos
                e.stopPropagation();
                
                // Remover clase active de todos los links
                submenuLinks.forEach(l => l.classList.remove('active'));
                
                // Agregar clase active al link actual
                this.classList.add('active');
            });
        });
    }

    function animateMenuItems(isExpanding) {
        const shiftableItems = document.querySelectorAll('.sidebar .menu-item.shiftable');
        const submenu = document.getElementById('submenuInventario');
        
        let displacement = 0;
        if (isExpanding && submenu) {
            // submenu.scrollHeight includes its content and padding.
            // We add 10 to account for the `margin-bottom: 10px;` 
            // that `#submenuInventario.show` has.
            displacement = submenu.scrollHeight + 10; 
        }

        shiftableItems.forEach((item, index) => {
            // The CSS already defines transition for transform on .menu-item
            // item.style.transition = 'transform 0.4s cubic-bezier(0.4,0,0.2,1)'; // Already in CSS
            
            // Staggered delay for a nicer effect (optional)
            const delay = index * 30; 
            
            setTimeout(() => {
                item.style.transform = `translateY(${displacement}px)`;
            }, delay);
        });
    }
})();
