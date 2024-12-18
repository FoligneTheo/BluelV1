function initializePage() {
    updateLoginState();
    loadCategoriesAndWorks();
    setupEditButton();
}

function updateLoginState() {
    const loginLink = document.getElementById('login-link');
    const editButton = document.getElementById('edit-projects-button');

    // Vérifie si l'utilisateur est connecté
    const isLoggedIn = localStorage.getItem('isLoggedIn') === "true";

    if (isLoggedIn) {
        // Change le lien "Login" en "Logout"
        loginLink.textContent = "Logout";
        loginLink.onclick = () => {
            // Déconnexion : on supprime le token et on met à jour l'état
            localStorage.removeItem('authToken');
            localStorage.removeItem('isLoggedIn');
            window.location.reload();
        };

        // Affiche le bouton "Modifier"
        editButton.classList.remove('hidden');
    } else {
        // Redirige vers la page de connexion
        loginLink.textContent = "Login";
        loginLink.onclick = () => {
            window.location.href = 'login.html';
        };

        // Cache le bouton "Modifier"
        editButton.classList.add('hidden');
    }
}



async function loadCategoriesAndWorks() {
    const worksResponse = await fetch("http://localhost:5678/api/works");
    const categoriesResponse = await fetch("http://localhost:5678/api/categories");

    const works = await worksResponse.json();
    const categories = await categoriesResponse.json();

    displayCategories(categories, works);
    displayWorks(works);
}

function displayCategories(categories, works) {
    const categoriesContainer = document.getElementById('categories');
    categoriesContainer.innerHTML = "";

    const allButton = document.createElement('button');
    allButton.innerText = "Tous";
    allButton.onclick = () => displayWorks(works);
    categoriesContainer.appendChild(allButton);

    categories.forEach(category => {
        const button = document.createElement('button');
        button.innerText = category.name;
        button.onclick = () => {
            const filteredWorks = works.filter(work => work.categoryId === category.id);
            displayWorks(filteredWorks);
        };
        categoriesContainer.appendChild(button);
    });
}

function displayWorks(works) {
    const worksContainer = document.getElementById('works');
    worksContainer.innerHTML = "";

    works.forEach(work => {
        const figure = document.createElement("figure");
        const image = document.createElement("img");
        const figcaption = document.createElement("figcaption");

        image.src = work.imageUrl;
        image.alt = work.title;
        figcaption.innerHTML = work.title;

        figure.appendChild(image);
        figure.appendChild(figcaption);
        worksContainer.appendChild(figure);
    });
}

function setupEditButton() {
    const editButton = document.getElementById('edit-projects-button');
    editButton.addEventListener('click', function () {
        // Simuler l'ouverture de la modal existante
        const openModalBtn = document.getElementById('open-modal-btn');
        if (openModalBtn) openModalBtn.click();
    });
}

initializePage();
