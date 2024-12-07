import csv
import requests

from flask import redirect, render_template, session
from functools import wraps
from datetime import datetime


def login_required(f):

    @wraps(f)
    def decorated_function(*args, **kwargs):
        if session.get("user_id") is None:
            return redirect("/login")
        return f(*args, **kwargs)
    return decorated_function


def get_date():

    now = datetime.now()
    current_date = now.strftime("%d-%m-%Y")

    return current_date


def format_date(s):

    date_format = "%Y-%m-%d"
    current_date = datetime.strptime(s, date_format)
    current_date = current_date.strftime("%d-%m-%Y")

    return current_date


def euro(amount):

    currency = "{:,.2f} €".format(amount)
    main_currency, fractional_currency = currency.split('.')
    new_main_currency = main_currency.replace(",", ".")
    currency = new_main_currency + "," + fractional_currency

    return currency

