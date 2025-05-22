function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleButton = document.querySelector('.toggle-password');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleButton.textContent = 'Ocultar';
    } else {
        passwordInput.type = 'password';
        toggleButton.textContent = 'Mostrar';
    }
}

document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const submitButton = document.getElementById('submitButton');
    const buttonText = submitButton.querySelector('.button-text');
    const spinner = submitButton.querySelector('.spinner');
    
    // Disable button and show loading state
    submitButton.disabled = true;
    buttonText.textContent = 'Validando...';
    spinner.style.display = 'inline-block';

    const formData = new FormData(this);
    
    fetch(window.location.href, {
        method: 'POST',
        body: formData,
        headers: {
            'X-CSRFToken': formData.get('csrfmiddlewaretoken')
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            window.location.href = '/dashboard/';
        } else {
            alert(data.message);
        }
    })
    .catch(error => {
        alert('Error al procesar la solicitud');
    })
    .finally(() => {
        // Reset button state
        submitButton.disabled = false;
        buttonText.textContent = 'Ingresar';
        spinner.style.display = 'none';
    });
});