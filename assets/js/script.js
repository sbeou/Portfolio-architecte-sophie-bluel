fetch("http://localhost:5678/api/works")
    .then(data => data.json())
    .then(jsonListWork => {
        for(let jsonWorks of jsonListWork) {
            let works = new Works(jsonWorks);
            document.querySelector(".gallery").innerHTML += `<figure>
                                                                <img src="${works.imageUrl}" alt="${works.title}" crossorigin>
                                                                <figcaption>${works.title}</figcaption>
                                                            </figure>`;
        }
    })