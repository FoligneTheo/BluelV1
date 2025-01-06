console.log("Script chargé");

// Récupération des éléments DOM
const modal = document.getElementById("modal");
const closeModalBtns = document.querySelectorAll(".close-btn");
const photoGallery = document.getElementById("photo-gallery");
const photoGalleryView = document.getElementById("photo-gallery-view");
const addPhotoView = document.getElementById("add-photo-view");
const switchToAddPhoto = document.getElementById("switch-to-add-photo");
const backArrow = document.getElementById("back-to-gallery");
const addPhotoForm = document.getElementById("add-photo-form");
const photoTitleInput = document.getElementById("photo-title");
const photoFileInput = document.getElementById("photo-file");
const photoCategorySelect = document.getElementById("photo-category");
const submitButton = document.querySelector(".submit-button");
const photoChangeContainer = document.querySelector(".photo-change");

// Fonction pour vérifier si tous les champs sont remplis
function checkFormValidity() {
    const isFormValid =
        photoTitleInput.value.trim() !== "" &&
        photoFileInput.files.length > 0 &&
        photoCategorySelect.value !== "";

    submitButton.disabled = !isFormValid;
    submitButton.style.backgroundColor = isFormValid ? "#1D6154" : "gray";
}

// Écouteurs pour vérifier les champs en temps réel
photoTitleInput.addEventListener("input", checkFormValidity);
photoFileInput.addEventListener("change", checkFormValidity);
photoCategorySelect.addEventListener("change", checkFormValidity);

// Fonction pour fermer la modal
function closeModal() {
    modal.classList.add("hidden");
    photoGalleryView.classList.remove("hidden");
    addPhotoView.classList.add("hidden");
    backArrow.style.display = "none";
}

// Ajout des événements sur tous les boutons close
closeModalBtns.forEach((btn) => {
    btn.addEventListener("click", closeModal);
});

// Gestion du clic en dehors de la modal pour la fermer
modal.addEventListener("click", (event) => {
    if (event.target === modal) {
        closeModal();
    }
});

// Gestion du bouton "Ajouter une photo"
switchToAddPhoto.addEventListener("click", () => {
    photoGalleryView.classList.add("hidden");
    addPhotoView.classList.remove("hidden");
    backArrow.style.display = "block";
    checkFormValidity();
});

// Gestion de la flèche de retour
backArrow.addEventListener("click", () => {
    addPhotoView.classList.add("hidden");
    photoGalleryView.classList.remove("hidden");
    backArrow.style.display = "none";
});

// Gérer le bouton Modifier pour afficher la modal
const editButton = document.createElement("button");
editButton.id = "edit-projects-button";
editButton.innerHTML = `
    <img src="./assets/icons/edit-icon.png" alt="Modifier">
`;
editButton.style.margin = "10px 0";
editButton.style.cursor = "pointer";

// Ajouter le bouton au DOM, juste sous le titre "Mes Projets"
const portfolioTitle = document.querySelector("#portfolio h2");
portfolioTitle.insertAdjacentElement("afterend", editButton);

// Écouter le clic sur le bouton Modifier
editButton.addEventListener("click", () => {
    modal.classList.remove("hidden");
    photoGalleryView.classList.remove("hidden");
    addPhotoView.classList.add("hidden");
    backArrow.style.display = "none";
});

// Fonction pour prévisualiser l'image
photoFileInput.addEventListener("change", (event) => {
    const file = event.target.files[0];

    if (file && file.type.startsWith("image/")) {
        const reader = new FileReader();

        reader.onload = (e) => {
            photoChangeContainer.innerHTML = `
                <img src="${e.target.result}" alt="Prévisualisation de l'image" 
                     style="width: 100%; max-height: 120px; object-fit: cover; border: 2px solid #ccc;" />
            `;
        };

        reader.readAsDataURL(file);
    } else {
        resetPhotoPreview();
    }
});

// Fonction pour réinitialiser la prévisualisation
function resetPhotoPreview() {
    photoChangeContainer.innerHTML = `
        <img id="photo-preview-image" src="" alt="Prévisualisation de l'image"
            style="display: none; width: 100%; max-height: 120px; object-fit: cover;" />
        <label for="photo-file" id="photo-label" class="photo-label">
            <i class="fa-regular fa-image photo-icon"></i>
            <button type="button" class="add-photo-button">+ Ajouter photo</button>
        </label>
        <input type="file" id="photo-file" name="file" accept="image/*" required hidden>
        <p id="file-info">jpg, png : 4mo max</p>
    `;
}

// Fonction pour ajouter un projet à la galerie
function addWorkToGallery(title, fileURL, id) {
    const listItem = document.createElement("li");
    listItem.dataset.id = id;

    const imageWrapper = document.createElement("div");
    imageWrapper.classList.add("image-wrapper");

    const img = document.createElement("img");
    img.src = fileURL;
    img.alt = title;

    const deleteIcon = document.createElement("div");
    deleteIcon.classList.add("delete-icon");

    const trashIcon = document.createElement("i");
    trashIcon.classList.add("fa-solid", "fa-trash-can");
    deleteIcon.appendChild(trashIcon);

    deleteIcon.addEventListener("click", () => deleteWork(id, listItem));

    imageWrapper.appendChild(img);
    imageWrapper.appendChild(deleteIcon);
    listItem.appendChild(imageWrapper);

    photoGallery.appendChild(listItem);
}

// Fonction pour gérer la soumission du formulaire
addPhotoForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    // Désactiver le bouton pour éviter les doubles envois
    submitButton.disabled = true;

    const title = photoTitleInput.value.trim();
    const file = photoFileInput.files[0];
    const category = photoCategorySelect.value;

    if (!title || !file || !category) {
        console.error("Tous les champs doivent être remplis.");
        submitButton.disabled = false;
        return;
    }

    try {
        const formData = new FormData();
        formData.append("title", title);
        formData.append("image", file);
        formData.append("category", parseInt(category, 10));

        const token = localStorage.getItem("authToken");
        if (!token) {
            console.error("Token d'authentification manquant.");
            submitButton.disabled = false;
            return;
        }

        const response = await fetch("http://localhost:5678/api/works", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: formData,
        });

        if (response.ok) {
            const newWork = await response.json();
            console.log("Nouveau projet ajouté :", newWork);

            addWorkToGallery(newWork.title, newWork.imageUrl, newWork.id);

            addPhotoForm.reset();
            resetPhotoPreview();
            checkFormValidity();
            backArrow.click();
        } else {
            console.error("Erreur lors de l'ajout :", response.statusText);
        }
    } catch (error) {
        console.error("Erreur réseau :", error);
    } finally {
        submitButton.disabled = false;
    }
});

// Charger les travaux
async function loadWorks() {
    try {
        const response = await fetch("http://localhost:5678/api/works", {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
        });

        if (response.ok) {
            const works = await response.json();
            photoGallery.innerHTML = "";
            works.forEach((work) => {
                addWorkToGallery(work.title, work.imageUrl, work.id);
            });
        } else {
            console.error("Erreur lors du chargement des travaux :", response.statusText);
        }
    } catch (error) {
        console.error("Erreur réseau :", error);
    }
}

// Fonction pour supprimer un travail
async function deleteWork(id, listItem) {
    const confirmation = confirm("Voulez-vous vraiment supprimer ce travail ?");
    if (!confirmation) return;

    try {
        const response = await fetch(`http://localhost:5678/api/works/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
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

// Charger les travaux au chargement de la page
loadWorks();
