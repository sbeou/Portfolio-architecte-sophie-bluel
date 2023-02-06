let jwt = localStorage.getItem("jwt");
if (jwt != null) {
  window.location.href = './index.html'
}

document.getElementById("loginForm").addEventListener('submit', login);

function login(event) {
  let user = {
    email: document.getElementById("username").value,
    password: document.getElementById("password").value
  };

  fetch('http://localhost:5678/api/users/login', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'Content-Type': 'application/json; charset=UTF-8'
    },
    body: JSON.stringify(user)
  }).then((response) => response.json())
  .then((result) => {
    if(result.token) {
      localStorage.setItem("jwt", result.token);
      window.location.href = './index.html';
    } else {
      alert("Erreur dans l’identifiant ou le mot de passe");
    }
  });
  
  event.preventDefault();
}