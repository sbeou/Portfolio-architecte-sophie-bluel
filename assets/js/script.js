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
                    <span id='${works.id}' class='btnDelete'><i class="fa-solid fa-trash-can"></i></span>
                    <img src="${works.imageUrl}" alt="${works.title}" crossorigin>
                    <a href='#'>éditer</a>
                </figure>`;
                document.querySelectorAll('.btnDelete').forEach(item => {
                    item.addEventListener('click', () => {
                        deleteWork(item.id);
                    })
                  })
            }
        }
});

// creation des catégories

document.querySelector(".category").innerHTML = `<li id="all" class="active btn btnCat">Tous</li>`;
fetch("http://localhost:5678/api/categories")
    .then(data => data.json())
    .then(jsonListCategories => {
        for(let jsonCategories of jsonListCategories) {
            let categories = new Categories(jsonCategories);
            document.querySelector(".category").innerHTML += `<li id="${categories.id}" class="btn btnCat">${categories.name}</li>`;
            document.querySelectorAll('.btnCat').forEach(item => {
                item.addEventListener('click', () => {
                  filterByCategory(item.id);
                })
              })
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
    document.querySelector("#introduction figure").innerHTML += `<a href='#'><i class="fa-regular fa-pen-to-square"></i> Modifier</a>`;
    const btnModifierTxt = document.createElement("a");
    const txtPres = document.querySelector("#introduction article");
    txtPres.insertBefore(btnModifierTxt, txtPres.firstChild);
    btnModifierTxt.innerHTML = `<i class="fa-regular fa-pen-to-square"></i> Modifier`;
    btnModifierTxt.setAttribute("href", "#");
    document.querySelectorAll(".btnModal").forEach(a => {
        a.addEventListener('click', openModal);
    });
    //banner mode edition 
    document.querySelector(".topHeader").style.height = '60px';
    document.querySelector(".topHeader").innerHTML += `<div class='banEdition'><i class="fa-regular fa-pen-to-square"></i> Mode édition <button>publié les changement</button></div>`;

    // Add work form 

    document.getElementById('form_work').innerHTML = `<form enctype="multipart/form-data"  method="post" name="newWork">
        <label for="image" class="labelFile">
            <i class="fa-regular fa-image"></i>
            <span>+ Ajouter photo</span>
            <input type="file" name="image" id="image" hidden accept="jpg,png">
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

    // Preview image 
    let imageForm = false;
    const image = document.getElementById("image");
    image.addEventListener('change', previewImage);
    function previewImage() {
        const labelFile = document.querySelector(".labelFile");
        const elementSpan = labelFile.querySelector("span");
        const elementI= labelFile.querySelector("i");
        const elementP= labelFile.querySelector("p");
        const preview = this.files[0];
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
                if(imageForm === false) {
                    document.querySelector(".erroImg").innerHTML = "<p style='color:red;font-weight:700;font-size:14px'>Envoyer ume image! </p>";
                } 
                if(titleForm.value === "") {
                    document.querySelector(".labelTitle").innerHTML = "<br><span style='color:red;font-weight:700'>Saisissez un titre!</span>";
                }
                if(catForm.value === "") {
                    document.querySelector(".labelCat").innerHTML = "<br><span style='color:red;font-weight:700'>Choisissez une catégorie!</span>";
                }
                if (imageForm === true && catForm.value !== "" && titleForm.value !== "")  {
                    sendFormWork(form);
                }
                event.preventDefault();
            },
            false
        );
        
    }
}

function sendFormWork(form) {
    const output = document.querySelector(".output");
    const formData = new FormData(form);
    const request = fetch('http://localhost:5678/api/works', {
        method: "POST",
        headers: {
            "Authorization": "Bearer " + jwt
        },
        body: formData
    }).then((response) => response.json())
    .then((result) => {
        if(!result.error) {
            output.innerHTML = "Gallerie mise à jour!";
            document.querySelector(".labelFile").innerHTML = `<i class="fa-regular fa-image"></i>
                <span>+ Ajouter photo</span>
                <input type="file" name="image" id="image" hidden accept="jpg,png">
                <p>jpg, png : 4mo max</p>
                <div class="erroImg"></div>`;
            image.addEventListener('change', previewImage);
            form.reset();
            imageForm = false;
            document.querySelector(".gallery--modal").innerHTML += `<figure id="modalWork${result.id}">
                <span id='${result.id}' class='btnDelete'><i class="fa-solid fa-trash-can"></i></span>
                <img src="${result.imageUrl}" alt="${result.title}" crossorigin>
                <a href='#'>éditer</a>
            </figure>`;
            document.querySelectorAll('.btnDelete').forEach(item => {
                item.addEventListener('click', () => {
                    deleteWork(item.id);
                })
            })
            document.querySelector(".gallery").innerHTML += `<figure id="work${result.id}" class="${result.categoryId} work show">
                <img src="${result.imageUrl}" alt="${result.title}" crossorigin>
                <figcaption>${result.title}</figcaption>
            </figure>`; 
        }     
     }).catch((error) => {
        output.innerHTML = `Erreur ${error} occurru lors de l'envoie de l'image.`;
      });
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
    const btn = document.getElementsByClassName("btnCat");
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