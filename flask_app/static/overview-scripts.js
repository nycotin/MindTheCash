// Hide/show filter form
const filterForm = document.querySelector('#filter-form');
const filterButton = document.querySelector('#filter-btn');

filterButton.addEventListener('click', function() {
    if (filterForm.style.display === 'block') {
        filterForm.style.display = 'none';
    } else {
        filterForm.style.display = 'block';
    }
})


// Reset filter values with clear filter button
let inputs = filterForm.querySelectorAll('.filter');
let category = undefined;
let transType = undefined;
let startDate = undefined;
let endDate = undefined;


const clearFilter = document.querySelector('#clear-btn');

clearFilter.addEventListener('click', function() {
    // Remove selected value
    for (let i of inputs) {
        i.value = '';
        console.log('Inputs cleared.');
    }

    let tbody = document.querySelector('#data-overview tbody');
    let rows = tbody.querySelectorAll('tr');
    console.log(rows);

    // Remove class and attributes applied by filtering function
    for (let row of rows) {
        if (row.hasAttribute('class') === true) {
            row.removeAttribute('class');
            console.log('Class removed.')
        }
        if (row.hasAttribute('hidden') === true) {
            row.removeAttribute('hidden');
            console.log('Hidden removed.')
        }
    }

    // Get list of all rows
    let allRows = document.querySelectorAll('#data-overview tbody tr');

    updateCalc(allRows);

    console.log('Filters removed.');
})


// Send filters ajax request
filterForm.addEventListener('change', () => {
    for (let i of inputs) {
        if (i.id === 'flt-category') {
            category = i.value;
        } else if (i.id === 'flt-trans_type') {
            transType = i.value;
        } else if (i.id === 'flt-start_date') {
            startDate = i.value;
        } else if (i.id === 'flt-end_date') {
            endDate = i.value;
        }
    }

    $.ajax({
        type: 'GET',
        url: '/overview/transactions/filter',
        data: { category, transType, startDate, endDate },
        success: function(response) {

            // Get all rows of jinja template
            let tbody = document.querySelector('#data-overview tbody');
            let rows = tbody.querySelectorAll('tr');
            // console.log(rows);

            // Confirmation if no data is found
            if (response.length === 0) {
                console.log('No data.')
            }

            // Remove any previously applied attributes
            for (let row of rows) {

                if (row.hasAttribute('class') === true) {
                    row.removeAttribute('class');
                    console.log('Class removed.')
                }
                if (row.hasAttribute('hidden') === true) {
                    row.removeAttribute('hidden');
                    console.log('Hidden removed.')
                }
            }

            // Loop through rows/response to compare
            for (let row of rows) {

                for (let item of response) {
                    // Add show attribute to relevant entries
                    if (row.id == item.id || row.id == '#') {
                        row.setAttribute('class', 'show');
                        console.log(`Showing row id #${row.id}`);
                    }
                }
                // If row id not in response, add hidden attribute to irrelevant entry
                if (row.hasAttribute('class') === false) {
                    row.setAttribute('hidden', 'true');
                    console.log(`Row id #${row.id} hidden`);
                }
            }

            // Get array of filtered rows
            let filteredRows = document.querySelectorAll('#data-overview .show');
            // console.log(filteredRows);

            // Update calculations
            updateCalc(filteredRows);

            // Confirmation
            console.log('Filtered view.');
        }

    })

})


// Delete entry in db
$(document).on('click', '#del-btn', function() {
    const td = this.parentNode;
    const row = td.parentNode;
    const rowId = row.id;
    console.log(row);

    $.ajax({
        type: 'POST',
        url: '/overview/transactions/delete/',
        data: { rowId },
        success: function(data) {
            row.remove();

            // Get list of all rows
            let allRows = document.querySelectorAll('#data-overview tbody tr');

            updateCalc(allRows);

            if (data == '1') {
                console.log('Entry deleted.');
            }
        }
    })


})


// Add event listener to all cells
const cells = document.querySelectorAll('td');

for (let cell of cells) {
    cell.addEventListener('click', editEntry);
}


// Event handler for blur to send data to server for update
$(document).on('blur', '.new', function() {
    const newElement = this; // input
    const td = newElement.parentNode;
    td.removeAttribute('class');
    const idAttribute = td.getAttribute('id');
    const tr = td.parentNode;
    const trId = tr.id;
    let newValue = newElement.value;

    if (idAttribute === 'name' && newValue === '' || idAttribute === 'amount' && newValue === '') {
        newElement.style.backgroundColor = '#860A35';

        // Get red input to remove style on focus
        let redInput = document.querySelector(`[style^="background-color"]`);
        redInput.addEventListener('click', function() {
        redInput.style.backgroundColor = '';
        })

        return;
    }

    $.ajax({
        type: 'POST',
        url: '/overview/transactions/edit/',
        data: { trId, idAttribute, newValue },
        success: function(data) {
            if (data == '1') {
                console.log('Entry updated.');
            } else {
                console.log('No changes.');
            }
        }
    });

    // Remove the input element and restore the original value
    if (idAttribute === 'datetime') {
        newValue = `${newValue.slice(8)}-${newValue.slice(5, 7)}-${newValue.slice(0, 4)}`;
        td.innerHTML = newValue;
    } else if (idAttribute === 'amount') {
        newValue = newValue.replace('.', ',') + ' €';
        td.innerHTML = newValue;
    }
    else {
        td.innerHTML = newValue;
    }

    // Get list of all rows
    let allRows = document.querySelectorAll('#data-overview tbody tr');

    updateCalc(allRows);
});


// Make entry field editable
function editEntry() {
    // Get header name and value view via cell's id
    let td = this;
    let idAttribute = td.getAttribute('id');
    let classAttribute = td.getAttribute('class');
    const oldValue = td.innerHTML;

    if (idAttribute === 'name' && classAttribute !== 'clicked') {
        // Exit if an input element already exists
        if (td.querySelector(`[class$="new"]`)) {
            return;
        }

        const input = document.createElement('input');
        input.setAttribute('type', 'text');
        input.setAttribute('value', oldValue);
        input.setAttribute('class', 'form-control shadow-none border-0 new');
        input.setAttribute('required', 'required');
        td.setAttribute('class', 'clicked');
        td.innerHTML = '';
        td.appendChild(input);
        input.focus();
    } else if (idAttribute === 'category' && classAttribute !== 'clicked') {
        if (td.querySelector(`[class$="new"]`)) {
            return;
        }

        const input = document.createElement('select');
        input.setAttribute('class', 'form-control shadow-none border-0 new');
        input.setAttribute('required', 'required');
        let optionsArr = ['Grocery', 'Housing', 'Food&Drinks', 'Transportation', 'Healthcare', 'Shopping', 'Pets', 'Personal Spending', 'Sport', 'Entertainment', 'Other'];

        // Create option element for each category
        for (let item of optionsArr) {
            let option = document.createElement('option');
            option.setAttribute('value', item);
            if (td.innerHTML === item) {
                option.setAttribute('selected', 'selected');
            }
            option.textContent = item;
            input.appendChild(option);
        }

        td.setAttribute('class', 'clicked');
        td.innerHTML = '';
        td.appendChild(input);
        input.focus();
    } else if (idAttribute === 'trans_type' && classAttribute !== 'clicked') {
        if (td.querySelector(`[class$="new"]`)) {
            return;
        }

        const input = document.createElement('select');
        input.setAttribute('class', 'form-control shadow-none border-0 new');
        input.setAttribute('required', 'required');
        let optionsArr = ['Incoming', 'Outgoing'];

        for (let item of optionsArr) {
            let option = document.createElement('option');
            option.setAttribute('value', item);
            if (td.innerHTML === item) {
                option.setAttribute('selected', 'selected');
            }
            option.textContent = item;
            input.appendChild(option);
        }

        td.setAttribute('class', 'clicked');
        td.innerHTML = '';
        td.appendChild(input);
        input.focus();
    } else if (idAttribute === 'amount' && classAttribute !== 'clicked') {
        if (td.querySelector(`[class$="new"]`)) {
            return;
        }

        const input = document.createElement('input');
        input.setAttribute('type', 'number');
        input.setAttribute('value', oldValue.replace(' €', '').replace(',', '.'));
        input.setAttribute('class', 'form-control shadow-none border-0 new');
        input.setAttribute('required', 'required');
        td.setAttribute('class', 'clicked');
        td.innerHTML = "";
        td.appendChild(input);
        input.focus();
    } else if (idAttribute === 'datetime' && classAttribute !== 'clicked') {
        if (td.querySelector(`[class$="new"]`)) {
            return;
        }

        const input = document.createElement('input');
        let f_OldValue = `${oldValue.slice(6)}-${oldValue.slice(3, 5)}-${oldValue.slice(0, 2)}`;
        input.setAttribute('type', 'date');
        input.setAttribute('id', 'datetime');
        input.setAttribute('value', f_OldValue);
        input.setAttribute('class', 'form-control shadow-none border-0 new');
        td.setAttribute('class', 'clicked');
        td.innerHTML = '';
        td.appendChild(input);
        input.focus();
    }
}


// Update calculations for filtered rows
function updateCalc(list) {
    // Define variables for subtotals and total
    let subtotalOut = 0;
    let subtotalIn = 0;
    let total = 0;

    for (let item of list) {
        // Get relevant IDs of rows
        let amount;
        let transType;

        if (item.id !== '#') {
            let amount = item.querySelector('tr td#amount').innerHTML;
            amount = amount.replace(',', '.').replace(' €', '');
            amount = parseFloat(amount);
            transType = item.querySelector('tr td#trans_type').innerHTML;

            if (transType == 'Incoming') {
                subtotalIn += amount;
                total += amount;
            } else {
                subtotalOut += amount;
                total -= amount;
            }
            // Exclude row with form
        } else {
            break;
        }

    }

    // Get cells with subtotals/totals
    let subOg = document.querySelector('#totals tr td#sub-og');
    let subIc = document.querySelector('#totals tr td#sub-ic');
    let tot = document.querySelector('#totals tr td#total');

    // Include 2 decimals
    subtotalOut = subtotalOut.toFixed(2);
    subtotalIn = subtotalIn.toFixed(2);
    total = total.toFixed(2);

    // Convert dot to comma
    subtotalOut = subtotalOut.replace('.', ',');
    subtotalIn = subtotalIn.replace('.', ',');
    total = total.replace('.', ',');

    // Substitute subtotals/total with filtered rows amounts
    subOg.innerHTML = `${subtotalOut} €`;
    subIc.innerHTML = `${subtotalIn} €`;
    tot.innerHTML = `${total} €`;

    // Confirmation
    console.log('Calculations updated.');
}
