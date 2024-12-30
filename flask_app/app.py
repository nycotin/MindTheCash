import os

from cs50 import SQL
from flask import (
    Flask,
    redirect,
    render_template,
    request,
    session
)
from flask_session import Session
from werkzeug.security import check_password_hash, generate_password_hash

from functions import login_required, get_date, format_date, euro

app = Flask(__name__)

app.jinja_env.filters["euro"] = euro

app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

db = SQL("sqlite:///static/database.db")


@app.after_request
def after_request(response):
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Expires"] = 0
    response.headers["Pragma"] = "no-cache"
    return response


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        # Clear previous sessions
        session.clear()

        # Store input to variables
        username = request.form.get("username")
        password = request.form.get("password")

        # Check for correct credentials
        rows = db.execute("SELECT * FROM users WHERE username = ?;", username)
        if len(rows) != 1 or not check_password_hash(rows[0]["hash"], password):
            print('Invalid username and/or password')
            return '1'

        # Remember user
        session["user_id"] = rows[0]["id"]

        return redirect("/overview")

    else:
        return render_template("login.html")


@app.route("/logout")
def logout():
    # Forget user_id
    session.clear()

    # Redirect user to login
    return redirect("/login")


@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        # Create dict for user inputs
        user_inputs = request.form.to_dict()

        # Format date DD-MM-YYYY if given
        if user_inputs["birthday"]:
            user_inputs["birthday"] = format_date(user_inputs["birthday"])

        # Create hash for password
        hash = generate_password_hash(
            user_inputs["password"], method="pbkdf2", salt_length=16
        )
        user_inputs["hash"] = hash

        # Add data to DB
        db.execute(
            "INSERT INTO users (firstname, lastname, email, username, hash, birthday) VALUES (?, ?, ?, ?, ?, ?);",
            user_inputs["firstname"].strip().title(),
            user_inputs["lastname"].strip().title(),
            user_inputs["email"],
            user_inputs["username"],
            user_inputs["hash"],
            user_inputs["birthday"],
        )

        # Perform login after successful registration
        # Clear previous sessions
        session.clear()

        # Remember user
        rows = db.execute("SELECT * FROM users WHERE username = ?;", user_inputs["username"])
        session["user_id"] = rows[0]["id"]

        return redirect("/overview")

    else:
        return render_template("register.html")


@app.route("/register/check-username", methods=["GET"])
def check_username():
    username_db = db.execute(
        "SELECT username FROM users WHERE username = ?;", request.args.get(
            "username")
        )
    if len(username_db) != 0:
        print("Invalid username")
        return "1"
    else:
        return '2'


@app.route("/overview", methods=["GET", "POST"])
@login_required
def overview():
    user_id = session["user_id"]
    username = db.execute("SELECT username FROM users WHERE id = ?;", user_id)
    transactions = db.execute(
        "SELECT * FROM transactions WHERE user_id = ? ORDER BY datetime;", user_id
    )

    if request.method == "POST":
        # Save user input
        user_inputs = {}
        user_inputs["name"] = request.form.get("name")
        user_inputs["category"] = request.form.get("category")
        user_inputs["trans_type"] = request.form.get("trans_type")
        user_inputs["amount"] = float(request.form.get("amount"))
        user_inputs["datetime"] = request.form.get("date")

        # Add data to DB
        if not user_inputs["datetime"]:
            user_inputs["datetime"] = get_date()
        else:
            user_inputs["datetime"] = format_date(user_inputs["datetime"])

        db.execute(
            "INSERT INTO transactions (user_id, name, category, trans_type, amount, datetime) VALUES (?, ?, ?, ?, ?, ?);",
            user_id,
            user_inputs["name"],
            user_inputs["category"],
            user_inputs["trans_type"],
            user_inputs["amount"],
            user_inputs["datetime"]
        )

        return redirect("/overview")

    else:
        # Run calculations
        subtotal_og = 0
        subtotal_ic = 0
        total = 0

        for trans in transactions:
            if trans["trans_type"] == "Outgoing":
                subtotal_og += trans["amount"]
                total -= trans["amount"]
            elif trans["trans_type"] == "Incoming":
                subtotal_ic += trans["amount"]
                total += trans["amount"]

        return render_template(
            "overview.html",
            username=username[0]["username"],
            transactions=transactions,
            subtotal_og=subtotal_og,
            subtotal_ic=subtotal_ic,
            total=total
        )


@app.route("/overview/transactions/filter")
@login_required
def filter_transactions():
    user_id = session["user_id"]
    # Save user input
    category = request.args.get("category")
    trans_type = request.args.get("transType")
    start_date = request.args.get("startDate")
    end_date = request.args.get("endDate")
    if start_date != "":
        start_date = format_date(start_date)
    if end_date != "":
        end_date = format_date(end_date)

    query_text = "SELECT * FROM transactions WHERE user_id = ?"
    query_params = [user_id];

    if category != "":
        query_text += " AND category = ?"
        query_params.append(category)
    if trans_type != "":
        query_text += " AND trans_type = ?"
        query_params.append(trans_type)

    if start_date != "" and end_date == "":
        query_text += " AND datetime >= ?"
        query_params.append(start_date)
    elif start_date == "" and end_date != "":
        query_text += " AND datetime <= ?"
        query_params.append(end_date)
    elif start_date != "" and end_date != "":
        query_text += " AND datetime BETWEEN ? AND ?"
        query_params.extend([start_date, end_date])

    query_text = f"{query_text};"
    query = db.execute(query_text, *query_params)
    print(query)

    return query


@app.route("/overview/transactions/edit/", methods=["POST"])
@login_required
def edit_transaction():

    trans_id = request.form.get("trId")
    id_attribute = request.form.get("idAttribute")
    new_value = request.form.get("newValue")

    if id_attribute == "datetime" and new_value != "":
        new_value = format_date(new_value)
    elif id_attribute == "datetime" and new_value == "":
        print("No date.")
        return "2"

    current_data = db.execute(
        "SELECT * FROM transactions WHERE id = ?;", trans_id)

    if current_data[0][id_attribute] != new_value:
        db.execute(
            "UPDATE transactions SET ? = ? WHERE id = ?;",
            id_attribute,
            new_value,
            trans_id,
        )
        print("Entry updated.")
        return "1"
    else:
        print("No changes.")
        return "2"


@app.route("/overview/transactions/delete/", methods=["POST"])
@login_required
def delete_transaction():

    trans_id = request.form.get("rowId")
    db.execute("DELETE FROM transactions WHERE id = ?;", trans_id)
    print(f"Transaction #{trans_id} deleted.")
    return "1"


@app.route("/profile", methods=["GET", "POST"])
@login_required
def profile():
    if request.method == "POST":
        user_id = session["user_id"]
        id_attribute = request.form.get("infoId")
        new_value = request.form.get("newValue")

        if new_value == "":
            print("Empty info. Returning.")
            return "3"

        current_data = db.execute("SELECT * FROM users WHERE id = ?;", user_id)

        if id_attribute == "password":
            new_hash = generate_password_hash(new_value, method="pbkdf2", salt_length=16)
            db.execute(
                "UPDATE users SET hash = ? WHERE id = ?;", new_hash, session["user_id"]
            )
            print("Info updated.")
            return "1"
        elif id_attribute != "password" and current_data[0][id_attribute] != new_value:
            db.execute(
                "UPDATE users SET ? = ? WHERE id = ?;", id_attribute, new_value, user_id
            )
            print("Info updated.")
            return "1"
        else:
            print("No changes.")
            return "2"

    else:
        user_info = db.execute("SELECT * FROM users WHERE id = ?;", session["user_id"])

        return render_template(
            "profile.html", user_info=user_info, username=user_info[0]["username"]
        )


@app.route("/profile/check-pass", methods=["POST"])
@login_required
def check_pass():
    user_id = session["user_id"]
    old_pass = request.form.get("oldPass")

    if old_pass == "":
        print("Empty input. Returning.")
        return "3"

    pw_hash = db.execute("SELECT hash FROM users WHERE id = ?;", user_id)
    check_pw = check_password_hash(pw_hash[0]["hash"], old_pass)

    # Check current password is correct
    if check_pw == False:
        return "2"
    else:
        return "1"
