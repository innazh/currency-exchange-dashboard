from flask import Flask, request, jsonify, send_from_directory
from datetime import timedelta

from db import init_db, close_db
from exchange_rates_service import validate_request_args, fetch_frankfurter_data
from exchange_rates_storage import get_rates_from_db, save_rates_to_db

app = Flask(__name__, static_folder="../dist", static_url_path="/")

@app.route("/")
def home():
    return send_from_directory(app.static_folder, "index.html")

@app.route("/api/rates", methods=["GET"])
def get_exchange_rates():
    success, error, args_dict = validate_request_args(request.args)
    if not success:
        return jsonify(error), 400

    from_date = args_dict["from_date"].isoformat()
    to_date = args_dict["to_date"].isoformat()

    results = {}
    
    # iterate through all pairs
    for pair in args_dict["pairs"]:
        results[pair] = process_currency_pair(pair, args_dict["from_date"], args_dict["to_date"])

    return jsonify({"from": from_date, "to": to_date, "data": results}), 200


def get_missing_dates_list(start_date, end_date, cached_dates):
    """Creates a set of all requested dates from start to end date, and returns the requested dates that are not contained in cached data so far. """
    all_dates = set()
    current = start_date
    while current <= end_date:
        all_dates.add(current.isoformat())
        current += timedelta(days=1)

    missing_dates = sorted(all_dates - cached_dates)
    return missing_dates

def process_currency_pair(pair, from_date, to_date):
    cached_rates = get_rates_from_db(pair, from_date, to_date)
    missing_dates = get_missing_dates_list(from_date, to_date, cached_rates.keys())

    if missing_dates:
        # fetch missing interest rates within this range from api
        missing_start_date = missing_dates[0]
        missing_end_date = missing_dates[-1]
        _, fetched_rates = fetch_frankfurter_data(pair, missing_start_date, missing_end_date)

        save_rates_to_db(pair, fetched_rates)

        # merge fetched into cached
        cached_rates.update(fetched_rates)
    return cached_rates


@app.teardown_appcontext
def teardown(exception):
    close_db()


with app.app_context():
    init_db()  # this will only create the db if it doesn't exist
