// Make profile info editable and update database
const pencilIcons = document.querySelectorAll('.pencil');
const confirmEditIcons = document.querySelectorAll('.confirm-edit');

for (let i = 0; i < pencilIcons.length; i++) {
    pencilIcons[i].addEventListener('click', changeInfo);
    confirmEditIcons[i].addEventListener('click', confirmEdit)
}


function changeInfo () {
    let iconCell = this.parentNode;

    // Change pencil to confirmation icon
    this.style.display = 'none';
    let confirmEditIcon = iconCell.querySelector('.confirm-edit');
    confirmEditIcon.style.display = 'block';

    // Get id from previous td
    let infoCell = iconCell.previousElementSibling;
    let infoId = infoCell.id;

    // Get cell text to print to input's value
    let oldValue = infoCell.innerText;

    // Create input for editing text
    let input = document.createElement('input');

    // Add inputs
    if (infoId === 'birthday') {
        input.setAttribute('type', 'date');
        oldValue = `${oldValue.slice(6)}-${oldValue.slice(3, 5)}-${oldValue.slice(0, 2)}`;
    } else if (infoId === 'password') {
        // Create input field for current-pw, new-pw and pw-confirmation
        input.setAttribute('type', 'password');
        input.setAttribute('id', 'current-password');
        let label1 = document.createElement('label');
        label1.setAttribute('for', 'password');
        label1.innerText = 'Current Password: ';
        let break1 = document.createElement('br');

        let input2 = document.createElement('input');
        input2.setAttribute('type', 'password');
        input2.setAttribute('id', 'new-password');
        let label2 = document.createElement('label');
        label2.setAttribute('for', 'password');
        label2.innerText = 'New Password: ';
        let break2 = document.createElement('br');

        let input3 = document.createElement('input');
        input3.setAttribute('type', 'password');
        input3.setAttribute('id', 'confirm-password');
        let label3 = document.createElement('label');
        label3.setAttribute('for', 'password');
        label3.innerText = 'Confirm Password: ';
        let break3 = document.createElement('br');

        infoCell.setAttribute('class', 'editable');
        infoCell.innerText = '';
        infoCell.appendChild(label1);
        infoCell.appendChild(input);
        infoCell.appendChild(break1);
        infoCell.appendChild(label2);
        infoCell.appendChild(input2);
        infoCell.appendChild(break2);
        infoCell.appendChild(label3);
        infoCell.appendChild(input3);
        infoCell.appendChild(break3);

        // Add current-pw to event listener for ajax check on blur
        let currentPassInput = document.querySelector('#current-password');
        currentPassInput.addEventListener('blur', function(){
            let oldPass = currentPassInput.value;
            $.ajax ({
                type: 'POST',
                url: '/profile/check-pass',
                data: { oldPass },
                success: function(data) {
                    if (data == '1') {
                        console.log('Current password is valid.');
                    } else if (data == '2'){
                        console.log('Invalid current password.');
                        showError(currentPassInput, 'Current password does not match!');
                        removeError();
                    } else {
                        console.log('Empty password.');
                        showError(currentPassInput, 'Current password is empty!');
                        removeError();
                    }
                }
            })
        })

        let newPass = document.querySelector('#new-password');
        newPass.addEventListener('blur', function() {
            if (newPass.value != '' && !validatePassword(newPass.value)) {
                let input = document.querySelector('#new-password');
                showError(input, 'Password must contain at least 8 characters and include lowercase letters, uppercase letters, numbers and special characters.');
                removeError();
            }
        })

        let confirmPass = document.querySelector('#confirm-password');
        confirmPass.addEventListener('blur', function() {
            if (confirmPass.value != '' && !validatePassword(confirmPass.value)) {
                let input = document.querySelector('#confirm-password');
                showError(input, 'Password confirmation does not match.');
                removeError();
            }
        })

        return;

    } else {
        // Create text input for fname and lname
        input.setAttribute('type', 'text');
    }

    input.setAttribute('value', oldValue);
    input.setAttribute('class', 'new');
    infoCell.setAttribute('class', 'editable');
    infoCell.innerHTML = '';
    infoCell.appendChild(input);

}

function confirmEdit () {
    let iconCell = this.parentNode;
    // Get input's td id
    let infoCell = document.querySelector('.editable');
    let infoId = infoCell.id;

    // Get cell text to print to input's value
    let input = document.querySelector('.new');
    let newValue;

    // Remove the input element and restore the original value
    if (infoId === 'birthday') {
        newValue = input.value;
        newValue = `${newValue.slice(8)}-${newValue.slice(5, 7)}-${newValue.slice(0, 4)}`;
        infoCell.innerHTML = newValue;
    } else if (infoId === 'password') {
        newValue = document.querySelector('#new-password').value;
        let confirmPassInput = document.querySelector('#confirm-password');
        let currentPassInput = document.querySelector('#current-password');
        let newPassInput = document.querySelector('#new-password');

        // Check if pass confirmation matches new pass
        if (currentPassInput.value == '') {
            showError(currentPassInput, 'Empty password!');
            removeError();
            return;
        } else if (newPassInput.value == '') {
            showError(newPassInput, 'Empty password!');
            removeError();
            return;
        } else if (confirmPassInput.value == '') {
            showError(confirmPassInput, 'Empty password!');
            removeError();
            return;
        } else if (newPassInput.value !== confirmPassInput.value) {
            showError(confirmPassInput, 'Password confirmation does not match!');
            removeError();
            return;
        } else {
            infoCell.innerText = ' ----- ';
        }
    } else {
        newValue = input.value;
        if (newValue == '') {
            showError(input, 'Invalid empty field!');
            removeError();
            return;
        }

        infoCell.innerText = newValue;
    }

    // Update data
    $.ajax({
        type: 'POST',
        url: '/profile',
        data: { infoId, newValue },
        success: function(data) {
            if (data == '1') {
                console.log('Profile data edited.');
            } else if (data == '2') {
                console.log('No changes.');
            } else {
                console.log('Empty info. Returning');
            }
        }
    })

    // Change pencil to confirmation icon
    this.style.display = 'none';
    let pencilIcon = iconCell.querySelector('.pencil');
    pencilIcon.style.display = 'block';

    // Remove previously added classes
    infoCell.removeAttribute('class');

}


function showError(input, message) {
    let p = document.createElement('p');
    p.setAttribute('class', 'error');

    p.innerText = message;

    let inputCell = input.parentNode;
    input.style.backgroundColor = '#860A35';
    inputCell.appendChild(p);
    p.style.color = '#860A35';
}

function removeError() {
    // Get red input to remove style on focus
    let redInput = document.querySelector(`[style^="background-color"]`);
    let errorPar = document.querySelector('.error');
    redInput.addEventListener('click', function () {
        redInput.style.backgroundColor = '';
        errorPar.remove();
    })
}

function validatePassword(pw) {
    const pwRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/
    return pwRegex.test(pw);
}
