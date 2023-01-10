fetch("http://localhost:5678/api/works")
    .then(data => data.json())
    .then(jsonListWork => {
        for(let jsonWorks of jsonListWork) {
            let works = new Works(jsonWorks);
            document.querySelector(".gallery").innerHTML += `<figure class="${works.category.id} work show">
                <img src="${works.imageUrl}" alt="${works.title}" crossorigin>
                <figcaption>${works.title}</figcaption>
            </figure>`;
        }
});
document.querySelector(".category").innerHTML += `<li id="all" class='active btn' onclick='filterByCategory("all")'>Tous</li>`;
fetch("http://localhost:5678/api/categories")
    .then(data => data.json())
    .then(jsonListCategories => {
        for(let jsonCategories of jsonListCategories) {
            let categories = new Categories(jsonCategories);
            document.querySelector(".category").innerHTML += `<li id="${categories.id}" class='btn' onclick='filterByCategory(${categories.id})'>${categories.name}</li>`;   
        }
});
function filterByCategory(cat) {
    let work = document.getElementsByClassName("work");
    let btn = document.getElementsByClassName("btn");
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