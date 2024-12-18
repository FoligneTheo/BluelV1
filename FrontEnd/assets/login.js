document.getElementById('login-form').addEventListener('submit', async function (event) {
    event.preventDefault(); // Empêche le rechargement de la page

    // Récupération des valeurs des champs
    const email = document.getElementById('email').value.trim(); // Enlève les espaces inutiles
    const password = document.getElementById('password').value.trim();

    // Réinitialisation du message d'erreur
    const errorMessageElement = document.getElementById('error-message');
    errorMessageElement.style.display = 'none';
    errorMessageElement.textContent = '';

    // Vérification des champs avant l'envoi
    if (!email || !password) {
        errorMessageElement.textContent = 'Veuillez remplir tous les champs.';
        errorMessageElement.style.display = 'block';
        return;
    }

    try {
        // Requête à l'API pour la connexion
        const response = await fetch('http://localhost:5678/api/users/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        // Si la réponse est correcte (200)
        if (response.ok) {
            const data = await response.json(); // Récupération du token
            localStorage.setItem('authToken', data.token); // Stockage du token dans le localStorage
            window.location.href = 'admin.html'; // Redirection vers la page d'administration
        } else {
            // Si la réponse n'est pas correcte (exemple : 401 Unauthorized)
            const errorData = await response.json();
            const errorMessage = errorData.message || 'Identifiants incorrects, veuillez réessayer.';
            errorMessageElement.textContent = errorMessage;
            errorMessageElement.style.display = 'block';
        }
    } catch (error) {
        // Gestion des erreurs réseau ou autres
        console.error('Erreur réseau :', error);
        errorMessageElement.textContent =
            'Une erreur s\'est produite. Veuillez réessayer plus tard.';
        errorMessageElement.style.display = 'block';
    }
});
