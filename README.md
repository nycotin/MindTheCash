# MIND THE CA$H
#### Video Demo:  https://www.youtube.com/watch?v=2isicsCVJD4
#### Description:
Mind The Ca$h is a web app to help people have an overview of their own expenses. Users can use this app to keep track of outgoing and incoming transactions which will be displayed in a tabular view in the main page of this app, the overview. In order to be able to use this app, users have to register and login, they can also manage and update their profile data, like update their name or change the password.
Everything mainly happens in the overview page, through which users can perform CRUD actions: Add new entries, view/filter, edit and delete them.
The main components of this project were developed with the following languages/frameworks: HTML, CSS, JavaScript, jQuery, Bootstrap, Flask, Python, Jinja, AJAX, SQLite.
Below is a detailed description and explanation of the compenents and the design of the app.

#### How to run the Flask App
1. Copy the repository on local computer with `https://github.com/nycotin/MindTheCash.git`;
2. Install virtual environment with `py -3 -m venv .venv`;
3. Activate virtual environment with `.venv/Scripts/activate`;
4. Refresh terminal and run `pip install -r flask_app/requirements.txt`;
5. Run `cd flask_app`;
6. Run `flask run` to start the server. The app will be available at `http://127.0.0.1:5000`;

Press CTRL+C to shut the server down and run `deactivate` to deactivate the virtual environment.


### Structure - HTML / Jinja / JavaScript
#### layout.html
Layout.html is the template used for the three pages that are accessible without login (i. e. index.html, login.html, register.html). It has a very simple structure without any navbar and it only includes a link to the style.css file and the links to bootstrap and googlefonts.

Jinja is used to replace the title page and the main element accordingly.

#### layout-app.html
Layout-app.html is the template used for the pages to the "actual" app (overview.html and profile.html). Its structure differs from the previous one because it includes a navbar, as well as a link to a different CSS file (style-app.css) and to the google ajax library.

Jinja is used to replace the title page and the main element accordingly, as well as in the navbar to pass in the users's username.

#### index.html
The index page mainly offers the user a nice and simple page where they can view the name of the app and access it. As the whole app is not accessible without credentials, users need to register (by clicking on the Register button) and then log in with the newly created credentials (by clicking on the Login button).

#### register.html // register-scripts.js
Before logging in, users have to register and create their credentials. If the Register button is clicked in the index.html page, the user is redirected to the register.html page, which presents them with a form where to enter personal data (firstname, lastname, date of birth), username and password.
JavaScript is used to validate the inputs on client-side on "blur" event to make sure that inputs are not left empty, the username is unique (performed via asychonous GET request to the /register/check-username route with AJAX), and that the email, password and password confirmation are valid. Is that not the case, an error message is displayed.

After successful validation, the user data is sent to the route /register via POST request through the HTML form and stored in the "users" table of the database.


#### login.html // login-scripts.js
After the registration is completed, the user is redirected to the login page, which can also be accessed by clicking on the Login button on the index.html page, if the user already has a profile.

In this page, the user should enter their credentials, which will be sumbitted to the /login route in the main app.py file to be processed.
JavaScript is again used for client-side validation on "blur" event for making sure that the inputs are not submitted empty. Is this the case, an error message is displayed.
An asychronous POST request for validating the credentials against the database is sent to the /login route, an error message is displey if they are not correct.

If the entered credentials are valid, the user will be redirected the their overview.

#### overview.html // overview-scripts.js
The overview.html page is the main page of the app. Here the user is able to see all their transactions in a tabular view. A separate table will keep track of the overall expenses, incoming and total. Filters can be added by toggling the filter form. All actions transaction ID in the first column of the overview table, which is retrieved from the database and rendered with Jinja syntaxt together with all other information, but hidden from the users' view and only used as reference for async requests.

Existing transactions are retrieved from the "transactions" table of the database via GET request to the /overview route and shown in a tabular view thanks to Jinja syntax. New entries can be added via form request, which is always visible as the last row of the first table. After having filled in all required information, the new entry can be added by clicking on the + button, the data will be validated and sent via POST request to the server. The page will refresh and the new entry displayed in the table. If the date is not given, it will automatically be filled with the current date by the helper function get_date().

Users can edit every single entry field separately. This was achieved via JavaScript and AJAX for the update in the database. The "click" event placed on all tables cells turns them into the respective inputs, this choice was made to limit the user to specific inputs only. Once the changes have been made, the "blur" event on the newly created input will turn the inout back to an uneditable table cell and send an asynchronopus POST request to the /overview/transactions/edit/ route. The calculation will be automatically updated without refreshing the page. Inputs that might be left empty (for example, name or amount) will turn red and the update blocked.

By clicking on the Filter button, the user can filter the transactions based on category, transaction type, start and end date. The table overview will be updated on the fly  whenever a filter is changed/added via async GET request to the /overview/transactions/filter route. The server dictionary response is compared to the existing rows on client-side and any unmatched row hidden with JavaScript. By clicking the Clear button the initial overview is restored.

Users can also delete entries by using the Delete button symbolized by the trash bin icon. In this case, a simple async POST request is send to the /overview/transactions/delete/ route together with the transaction ID stored in the first table cell and hidden from the users view.

The subtotlas/totals in the second table are calculated in the server, displayed via Jinja syntax and retrieved via GET request to the /overview route. Ayn async request related to editing, filtering and deleting will also accordingly update the calculations via the updateCalc() function written in JavaScript.

with headers: trans-id (kept hidden only to have the database reference)


#### profile.html // profile-scripts.js
The user information is stored in the database and can be viewed by the user by clicking on the drop-down menu on the top-right corner and selecting the Profile button.

The data is retrieved via GET request to the /profile route in the app.py file and displayed in a tabular view thanks to the Jinja syntax.

The user can edit and update their data thanks to JavaScript and AJAX. Username and email are unique and cannot be changed.
To this purpose the pencil icon and the tick icon have been added to an event listener and they trigger two different functions.

function changeInfo()
This function is triggered when the pencil icon is clicked and turns the corresponding field into an input. The pencil icon is hidden and the tick icon is shown.
If the field already has data in it (like in the case of firstname, lastname and, if given, birthday) the existing data will be directly populated into the input.
As the date displayed and sent in the date input is ISO-compliant (YYYY-MM-DD), but the date saved in the database is not (DD-MM-YYYY), additional formatting for the date had to be added to change the format to DD-MM-YYYY.

Editing the password requires additional steps due to security reasons. When clicking on the correspondent pencil icon, new inputs for current password, new password and password confirmation will be shown. The current password will be validated against the users table in the database via AJAX POST request to the /profile/check-pass route on "blur" event, the background color will turn red and an error message will be displayed at the bottom of the form. If the red input is back on focus, both the backgroundcolor and the error message will be removed.

function confirmEdit()
This function is triggered when the tick icon is clicked. This functions is made to update the table (turning the inpout back into an not-editable field) and sending the new data to the /confirm-data route of the app.py file to be updated in the database (via AJAX POST request).

The new password and password confirmation are checked on the spot with JavaScript. If they don't match, the pass-confirmation bacjground colot will turn red and a clear error message will be displayed in the form. The user won't be able to send the request.

The functions showError() and removerError() are used within the two main functions described above to show the error message for invald password or password confirmation.
The function validatePassword is used to make sure the password follows a specific pattern.


### Styles - CSS / JavaScript / Bootstrap
#### style.css / style-app.css
In order to have more clarity and a cleaner view, it has been decided to keep the styles of the index.html, register.html and login.html separated from those of the "main" app (overview.html and profile.html).

The nav bar has been rendered thanks to Bootstrap syntax, which includes popper js scripts included for enabling the drop-down view.

A custom Google font has been added and used throughout the templates.

### Server - Flask
#### app.py
The main server app.py includes some externa libraries and frameworks (cs50, flask, werkzeug, Jinja) and the SQLite database.

It includes the following routes:
- / : The index() function is triggered on default GET request to render the index.html page;
- /login: The login() function triggered on GET request renders the login.html page; when a POST request is sent, it validates the user's credentials against the database and redirects to the /overview route;
- /logout: The logout() function triggered on GET request clears the current Flask session, logging the user out and rederecting to the /login route;
- /register: The register() funciton triggered on GET request renders the register.html page; when called by POST request, it stores the user's information and credentials in the database and redirects to the /login route;
- /register/check-username: The check_username() function is triggered by GET request and used for the asynchronous request to check the uniqueness of the username. The response is returned to the AJAX request and used to throw an error, if necessary.
- /overview: The overview() function triggered on GET request renders the overview.html page and shows via Jinja syntax all existing transactions added by the logged in user. Calculations based on the database information are performed and sent to the templates. When called via POST request, it takes the form inputs whenever a new transaction is added by the user, adds or changes the format of the date and stores everything in the database. It finally redirects to the /overview route;
- /overview/transactions/filter: The filter_transactions() function called on GET request takes the user input added from the filter form and asynchronously generates the database query based on that input. It returns the dictionary of filtered data as response for further processing on client-side.
- /overview/transactions/edit: The edit_transaction() function triggered via POST request manages the input values sent asynchronously on "blur" event on client-side, validates against database whether the new value was changed or not. Only in case of changes, an UPDATE call is sent to the database to updatew the existing data, otherwise, no further actions are performed.
- /overview/transactions/delete: The delete_transaction() function is called on POST request and queries the database based on the transactions ID sent asynchronosuly on client-side. It sents a DELETE request to the database.
- /profile: The profile() function called on GET request renders the profile.html page and shows via Jinja syntax all existing information added by the logged in user on registration. When a POST request is sent, it stores the new value sent asynchronously on "blur" event and updates the changed information in the database (validation happens on client-side via JS). Only in case of changes and non-empty input, changes are sent to the databse.
- /profile/check-pass: The check_pass() function is triggered on asynchronous POST request to validate that the current password inserted by the user is valid.

#### functions.py
The function.py file includes a few helper functions that serve to perform smaller actions in the the main app.py.

The login login_required() funciton was included from the "finance" problem set of week 9 and add the decorator @login_required to all routes that are only accessible via login.

The get_date() and format_date(s) functions are used on POST request when a new transaction is added. Since the date is not a mandatory field (to avoid too much manual work from users side), get_date() will get the current date an format it as DD-MM-YYY when is not given. On the other side, if the user includes a date via the date inpout, the default ISO format stored by the input will be converted to the DD-MM-YYYY format by the format_date() function and stored in the database.

The euro() funciton is used to convert the amount given via the number input into an actual amount in Euro, by changing the default dot separator (.) to a comma (,) and adding the € symbol. This function is passed to the Jinja syntax and only used when rendering the overview templates.

### Database - SQLite
#### database.db
The SQLite database has a very simple 2-table structure, "users" and "transactions".
Users stores all users information submitted on registration, while transaction keeps track of all transactions of all users, which can additionally be referenced with the "user_id" for recreating a user-based overview. Passowrd are securely stored in the users table via salt hashing fucntion from the werkzeug.security library.
The schema is included in the tables.sql file in the static folder.
