console.log("Script chargé");

const modal = document.getElementById('modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const photoGallery = document.getElementById('photo-gallery');
const photoGalleryView = document.getElementById('photo-gallery-view');
const addPhotoView = document.getElementById('add-photo-view');
const switchToAddPhoto = document.getElementById('switch-to-add-photo');
const backToGallery = document.getElementById('back-to-gallery');
const addPhotoForm = document.getElementById('add-photo-form');
const photoTitleInput = document.getElementById('photo-title');
const photoFileInput = document.getElementById('photo-file');
const photoCategorySelect = document.getElementById('photo-category');

// Cache la section des catégories
const categoriesContainer = document.getElementById('categories');
categoriesContainer.classList.add('hidden');

// Gérer le bouton Modifier pour afficher la modal
const editButton = document.createElement('button');
editButton.id = "edit-projects-button";
editButton.innerHTML = `
    <img src="./assets/icons/edit-icon.png" alt="Modifier">
`;
editButton.style.margin = "10px 0";
editButton.style.cursor = "pointer";

// Ajouter le bouton au DOM, juste sous le titre "Mes Projets"
const portfolioTitle = document.querySelector("#portfolio h2");
portfolioTitle.insertAdjacentElement('afterend', editButton);

// Écouter le clic sur le bouton Modifier
editButton.addEventListener('click', () => {
    modal.classList.remove('hidden');
});

// Fermer la modal
closeModalBtn.addEventListener('click', closeModal);
modal.addEventListener('click', (event) => {
    if (event.target === modal) {
        closeModal();
    }
});

// Gérer la navigation entre les vues de la modal
switchToAddPhoto.addEventListener('click', () => {
    photoGalleryView.classList.add('hidden');
    addPhotoView.classList.remove('hidden');
});

backToGallery.addEventListener('click', () => {
    addPhotoView.classList.add('hidden');
    photoGalleryView.classList.remove('hidden');
});

// Ajouter un projet depuis la modal
addPhotoForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const title = photoTitleInput.value.trim();
    const file = photoFileInput.files[0];
    const category = photoCategorySelect.value;

    if (!title || !file || !category) {
        console.error("Tous les champs doivent être remplis.");
        return;
    }

    if (!file.type.startsWith('image/')) {
        console.error("Le fichier doit être une image valide (JPEG ou PNG).");
        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        console.error("Le fichier est trop volumineux (max : 5 Mo).");
        return;
    }

    try {
        const formData = new FormData();
        formData.append('title', title);
        formData.append('image', file);
        formData.append('category', parseInt(category, 10));

        const token = localStorage.getItem('authToken');
        if (!token) {
            console.error("Token d'authentification manquant.");
            return;
        }

        const response = await fetch('http://localhost:5678/api/works', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formData,
        });

        if (response.ok) {
            const newWork = await response.json();
            console.log("Nouveau projet ajouté :", newWork);

            addWorkToGallery(newWork.title, newWork.imageUrl, newWork.id);

            addPhotoForm.reset();
            backToGallery.click();
        } else {
            const errorMessage = await response.text();
            console.error("Erreur lors de l'ajout :", response.status, response.statusText, errorMessage);
        }
    } catch (error) {
        console.error("Erreur réseau :", error);
    }
});

// Charger les travaux
async function loadWorks() {
    try {
        const response = await fetch('http://localhost:5678/api/works', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            }
        });

        if (response.ok) {
            const works = await response.json();
            photoGallery.innerHTML = "";
            works.forEach(work => {
                addWorkToGallery(work.title, work.imageUrl, work.id);
            });
        } else {
            console.error("Erreur lors du chargement des travaux :", response.statusText);
        }
    } catch (error) {
        console.error("Erreur réseau :", error);
    }
}

function addWorkToGallery(title, fileURL, id) {
    const listItem = document.createElement('li');
    listItem.dataset.id = id;

    const imageWrapper = document.createElement('div');
    imageWrapper.classList.add('image-wrapper');

    const img = document.createElement('img');
    img.src = fileURL;
    img.alt = title;

    const deleteIcon = document.createElement('div');
    deleteIcon.classList.add('delete-icon');

    const trashIcon = document.createElement('i');
    trashIcon.classList.add('fa-solid', 'fa-trash-can'); // Icône de suppression
    deleteIcon.appendChild(trashIcon);

    deleteIcon.addEventListener('click', () => deleteWork(id, listItem));

    imageWrapper.appendChild(img);
    imageWrapper.appendChild(deleteIcon);

    listItem.appendChild(imageWrapper);

    photoGallery.appendChild(listItem);
}




async function deleteWork(id, listItem) {
    const confirmation = confirm("Voulez-vous vraiment supprimer ce travail ?");
    if (!confirmation) return;

    try {
        const response = await fetch(`http://localhost:5678/api/works/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            }
        });

        if (response.ok) {
            listItem.remove();
            console.log(`Travail avec l'ID ${id} supprimé.`);
        } else {
            console.error("Erreur lors de la suppression :", response.statusText);
        }
    } catch (error) {
        console.error("Erreur réseau :", error);
    }
}

function closeModal() {
    modal.classList.add('hidden');
}

// Charger les travaux au chargement de la page
loadWorks();
