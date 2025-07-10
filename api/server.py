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
    success, error, data = validate_request_args(request.args)
    if not success:
        return jsonify(error), 400

    from_date = data["from_date"].isoformat()
    to_date = data["to_date"].isoformat()

    results = {}
    
    # iterate through all pairs
    for pair in data["pairs"]:
        # get existing rates from the db for this pair
        cached_rates = get_rates_from_db(pair, from_date, to_date)
        if cached_rates:
            print(f"Loaded {len(cached_rates)} cached rates for {pair} from DB.")

        # determine missing dates after cache retrieval
        all_dates = set()
        current = data["from_date"]
        while current <= data["to_date"]:
            all_dates.add(current.isoformat())
            current += timedelta(days=1)

        missing_dates = sorted(all_dates - cached_rates.keys())

        if missing_dates:
            # fetch missing interest rates within this range from api
            missing_start_date = missing_dates[0]
            missing_end_date = missing_dates[-1]
            _, fetched_rates = fetch_frankfurter_data(pair, missing_start_date, missing_end_date)

            # save fetched data to the db
            save_rates_to_db(pair, fetched_rates)

            # update cached dict (by merging fetched data into it)
            cached_rates.update(fetched_rates)

        results[pair] = cached_rates

    return jsonify({"from": from_date, "to": to_date, "data": results}), 200


@app.teardown_appcontext
def teardown(exception):
    close_db()


with app.app_context():
    init_db()  # this will only create the db if it doesn't exist
