// Client-side form validation with JS and AJAX

const button = document.querySelector('#register button.btn');

// Get user input
const form = document.querySelector('#register form');
const inputs = document.querySelectorAll('#register input');

// Create p for showing error if necessary
let p = document.createElement('p');
p.setAttribute('class', 'error');

for(let i of inputs) {
    i.addEventListener('click', clearError);
    i.addEventListener('blur', validateInput);
}


function validateInput() {
    if (this.value === '') {
        if (this.id !== 'birthday'){
            displayError(this, this.previousElementSibling.innerText.replace(':', '').replace('*', ''));
        };
    } else if (this.id === 'email' && !validateEmail(this.value)) {
        displayError(this, this.previousElementSibling.innerText.replace(':', '').replace('*', ''));
    } else if (this.id === 'username') {
        validateUsername(this.value)
            .then(response => {
                if(!response) {
                    displayError(this, this.previousElementSibling.innerText.replace(':', '').replace('*', ''));
                }
            })
    } else if (this.id === 'password' && !validatePassword(this.value)) {
        displayError(this, this.previousElementSibling.innerText.replace(':', '').replace('*', ''));
    } else if (this.id === 'password-confirmation' && !validateConfirm(this.value)) {
        displayError(this, this.previousElementSibling.innerText.replace(':', '').replace('*', ''));
    }
}


function displayError(input, label) {
    // Disable submit
    button.setAttribute('type', 'button');

    input.classList.add('error');

    // Add and custom error message
    if (input.value === '') {
        p.innerText = `${label} missing!`;
    } else if (input.id === 'email') {
        p.innerText = `Invalid ${label}! Email can only contain lowercase/uppercase letters, numbers, dashes (-), underscores (_)`;
    } else if (input.id === 'username') {
        p.innerText = `${label} already taken!`;
    } else if (input.id === 'password') {
        p.innerText = `Invalid ${label}! Password must contain at least 8 characters and include lowercase letters, uppercase letters, numbers and special characters.`;
    } else if (input.id === 'password-confirmation') {
        p.innerText = `${label} doesn't match!`;
    }
    input.parentNode.appendChild(p);

}


function validateEmail(email) {
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}


function validatePassword(pw) {
  const pwRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/
  return pwRegex.test(pw);
}


function validateUsername(username) {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: 'GET',
            url: '/register/check-username',
            data: { username },
            success: function(data) {
                if (data == '1') {
                    resolve(false);
                } else {
                    resolve(true);
                }
            }
        });
    });
}


function validateConfirm(input) {
    const pw = document.querySelector('#password');
    if (input !== pw.value) {
        return false;
    }
    return true;
}


function clearError() {
    button.setAttribute('type', 'sumbit');
    this.classList.remove('error');
    p.remove();
}
