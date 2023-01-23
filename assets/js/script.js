let jwt = localStorage.getItem("jwt");
let btnLogin = document.querySelector(".login"); 
let modal = null;
const focusableSelector = 'button, a , input, textarea, select';
let focusables = [];

// Creation de la gallerie

fetch("http://localhost:5678/api/works")
    .then(data => data.json())
    .then(jsonListWork => {
        for(let jsonWorks of jsonListWork) {
            let works = new Works(jsonWorks);
            document.querySelector(".gallery").innerHTML += `<figure id="work${works.id}" class="${works.category.id} work show">
                <img src="${works.imageUrl}" alt="${works.title}" crossorigin>
                <figcaption>${works.title}</figcaption>
            </figure>`;
            if(jwt != null) {
                document.querySelector(".gallery--modal").innerHTML += `<figure id="modalWork${works.id}">
                    <span onclick='deleteWork(${works.id})'><i class="fa-solid fa-trash-can"></i></span>
                    <img src="${works.imageUrl}" alt="${works.title}" crossorigin>
                    <a href='#'>éditer</a>
                </figure>`;
            }
        }
});

// creation des catégories

document.querySelector(".category").innerHTML = `<li id="all" class='active btn' onclick='filterByCategory("all")'>Tous</li>`;
fetch("http://localhost:5678/api/categories")
    .then(data => data.json())
    .then(jsonListCategories => {
        for(let jsonCategories of jsonListCategories) {
            let categories = new Categories(jsonCategories);
            document.querySelector(".category").innerHTML += `<li id="${categories.id}" class='btn' onclick='filterByCategory(${categories.id})'>${categories.name}</li>`;
            if(jwt != null) {
                document.getElementById("category").innerHTML += `<option value="${categories.id}">${categories.name}</option>`;
            }   
        }
});

// btn modifier

if (jwt != null) {
   btnLogin.innerHTML = "<a href='#'>Logout</a>";
   btnLogin.addEventListener('click', function() {
    logout()
   });
   document.querySelector("#portfolio h2").innerHTML += `<a href='#modal1' class='btnModal'><i class="fa-regular fa-pen-to-square"></i> Modifier</a>`;
}

document.querySelectorAll(".btnModal").forEach(a => {
    a.addEventListener('click', openModal);
});

// Add work form 

if (jwt != null) {
    document.getElementById('form_work').innerHTML = `<form enctype="multipart/form-data"  method="post" name="newWork">
        <label for="image" class="labelFile">
            <i class="fa-regular fa-image"></i>
            <span>+ Ajouter photo</span>
            <input type="file" name="image" id="image" hidden accept="jpg,png" onchange="previewImage(this)">
            <p>jpg, png : 4mo max</p>
            <div class="erroImg"></div>
        </label>
        <label for="title" class='labelTitle'>Titre</label>
        <input type="text" name="title" id="title">
        <label for="category" class='labelCat'>Catégorie</label>
        <select name="category" id="category">
            <option disabled selected value></option>
        </select>
        <input type="submit" value="Valider">
    </form><div class="output"></div>`;
}

// Preview image 
let imageForm = false;
function previewImage(e) {
    const labelFile = document.querySelector(".labelFile");
    const elementSpan = labelFile.querySelector("span");
    const elementI= labelFile.querySelector("i");
    const elementP= labelFile.querySelector("p");
    const [preview] = e.files;
    if (preview) {
        const imagePreview = document.createElement("img");
        elementSpan.remove();
        elementI.remove();
        elementP.remove();
        labelFile.appendChild(imagePreview);
        imagePreview.setAttribute("src", URL.createObjectURL(preview));
        imageForm = true;
        document.querySelector(".erroImg").innerHTML = "";
    }
}

// Add work 

const form = document.forms.namedItem("newWork");
const output = document.querySelector(".output");
const titleForm = document.getElementById("title");
const catForm = document.getElementById("category");
titleForm.addEventListener("change", (e) => {
    document.querySelector(".labelTitle").innerHTML = "Titre";
})
catForm.addEventListener("change", (e) => {
    document.querySelector(".labelCat").innerHTML = "Catégorie";
})
if(form) {
    form.addEventListener(
        "submit",
        (event) => {
            console.log(imageForm + " Title:" + titleForm.value + " Cat:" + catForm.value);
            if(imageForm === false) {
                document.querySelector(".erroImg").innerHTML = "<p style='color:red;font-weight:700;font-size:14px'>Envoyer ume image! </p>";
                event.preventDefault();
            } 
            if(titleForm.value === "") {
                document.querySelector(".labelTitle").innerHTML = "<br><span style='color:red;font-weight:700'>Saisissez un titre!</span>";
                 event.preventDefault();
            }
            if(catForm.value === "") {
                document.querySelector(".labelCat").innerHTML = "<br><span style='color:red;font-weight:700'>Choisissez une catégorie!</span>";
                event.preventDefault();
            }
            if (imageForm === true && catForm.value !== "" && titleForm.value !== "")  {
                const formData = new FormData(form);
                const request = new XMLHttpRequest();
                request.open("POST", "http://localhost:5678/api/works");
                request.setRequestHeader("Authorization", "Bearer " + jwt);
                request.onreadystatechange = () => {
                    if (request.readyState === 4) {
                        const works = JSON.parse(request.responseText);
                        document.querySelector(".gallery--modal").innerHTML += `<figure id="modalWork${works.id}">
                            <span onclick='deleteWork(${works.id})'><i class="fa-solid fa-trash-can"></i></span>
                            <img src="${works.imageUrl}" alt="${works.title}" crossorigin>
                            <a href='#'>éditer</a>
                        </figure>`;
                        document.querySelector(".gallery").innerHTML += `<figure id="work${works.id}" class="${works.categoryId} work show">
                            <img src="${works.imageUrl}" alt="${works.title}" crossorigin>
                            <figcaption>${works.title}</figcaption>
                        </figure>`;
                    }
                }
                request.onload = (progress) => {
                    request.status === 201
                        ? output.innerHTML = "Gallerie mise à jour!"
                        : output.innerHTML = `Erreur ${request.status} occurru lors de l'envoie de l'image.`;
                };
                request.send(formData);
                document.querySelector(".labelFile").innerHTML = `<i class="fa-regular fa-image"></i>
                    <span>+ Ajouter photo</span>
                    <input type="file" name="image" id="image" hidden accept="jpg,png" onchange="previewImage(this)">
                    <p>jpg, png : 4mo max</p>
                    <div class="erroImg"></div>`;
                form.reset();
                imageForm = false;
                event.preventDefault();
            }
        },
        false
    );
}




// Modal

window.addEventListener("keydown", function (e) {
    if(e.key === "Escape" || e.key === "Esc") {
        closeModal(e);
    }
    if(e.key === "Tab"){
        focusInModal(e);
    }
})

function openModal(e) {
    if(modal) {
        closeModal(e)
    }
    modal = document.querySelector(this.getAttribute('href'));
    e.preventDefault();
    focusables = Array.from(modal.querySelectorAll(focusableSelector));
    modal.style.display = null;
    modal.removeAttribute('aria-hidden');
    modal.setAttribute('aria-modal', true);
    modal.addEventListener('click', closeModal);
    modal.querySelector('.btnCloseModal').addEventListener('click', closeModal);
    modal.querySelector('.modalStop').addEventListener('click', stopPropagation);
}

function closeModal(e) {
    if(modal === null) {
        return;
    }
    e.preventDefault();
    modal.style.display = "none";
    modal.setAttribute('aria-hidden', true);
    modal.removeAttribute('aria-modal');
    modal.removeEventListener('click', closeModal);
    modal.querySelector('.btnCloseModal').removeEventListener('click', closeModal);
    modal.querySelector('.modalStop').removeEventListener('click', stopPropagation);
    modal = null;
    document.querySelector(".output").innerHTML = "";
}
function stopPropagation(e) {
    e.stopPropagation();
}

function focusInModal(e) {
    e.preventDefault();
    let index = focusables.findIndex(f => f === modal.querySelector(':focus'));
    if(e.shiftKey === true) {
        index--
    } else {
        index++
    }
    if (index >= focusables.length) {
        index = 0;
    }
    if(index < 0) {
        index = focusables.length -1;
    }
    focusables[index].focus();
}



// Filtre de catégorie

function filterByCategory(cat) {
    const work = document.getElementsByClassName("work");
    const btn = document.getElementsByClassName("btn");
    for (let i = 0; i < btn.length; i++) {
        btn[i].classList.remove("active");
    }
    document.getElementById(cat).classList.add("active");
    for (let i = 0; i < work.length; i++) {
        work[i].classList.remove("show");
        if(work[i].className.indexOf(cat) > -1) {
            work[i].classList.add("show");
        }
    }
    if(cat === "all") {
        for (let i = 0; i < work.length; i++) {
            work[i].classList.add("show");
        }
    }  
}

// Logout

function logout() {
    localStorage.removeItem("jwt");
    window.location.href = './login.html';
    return false;
  }

  // Delete Work

  function deleteWork(id) {
    if(confirm("Êtes vous sure de vouloir effacer ce projet?") == true) {
    fetch('http://localhost:5678/api/works/' + id, { 
        method: 'DELETE',
        headers: {
            'Authorization': 'Bearer ' + jwt,
            'accept': 'application/json',
            'Content-Type': 'application/json; charset=UTF-8'
          } });
          
    document.getElementById("work" + id).remove();
    document.getElementById("modalWork" + id).remove();
    }
    return false;
  }