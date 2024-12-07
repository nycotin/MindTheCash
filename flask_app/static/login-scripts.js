// Client-side form validation with JS

const button = document.querySelector('#login button.btn');

// Get user input
const form = document.querySelector('#login form');
const inputs = document.querySelectorAll('#login input');

// Create p for showing error if necessary
let p = document.createElement('p');
p.setAttribute('class', 'error');

for(let i of inputs) {
    i.addEventListener('click', clearError);
    i.addEventListener('blur', validateInput);
}

function validateInput() {
    if (this.value === '') {
        displayError(this, this.previousElementSibling.innerText.replace(':', '').replace('*', ''));
    };
}

function displayError(input, label) {
    // Disable submit
    button.setAttribute('type', 'button');

    input.classList.add('error');

    // Add and custom error message
    p.innerText = `${label} missing!`;
    input.parentNode.appendChild(p);
}

function clearError() {
    button.setAttribute('type', 'sumbit');
    this.classList.remove('error');
    p.remove();
}

form.addEventListener('submit', formHandler);

function formHandler(event) {
    event.preventDefault();

    const username = document.querySelector('#username').value;
    const password = document.querySelector('#password').value;

    validateCredentials(username, password)
        .then(valid => {
            if (valid) {
                form.submit();
            } else {
                button.setAttribute('type', 'button');
                p.innerText = 'Incorrect Username and/or Password!';
                form.appendChild(p);
            }
        })
}

function validateCredentials(username, password) {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: 'POST',
            url: '/login',
            data: { username, password },
            success: function(data) {
                if (data == '1') {
                    resolve(false);
                } else {
                    resolve(true);
                }
            }
        });
    })
}
