import time
from flask import Flask, request, jsonify
import requests
from datetime import datetime, timedelta, timezone
from dateutil.relativedelta import relativedelta
from urllib.parse import urlencode

app = Flask(__name__)

FRANKFURTER_API = "https://api.frankfurter.dev/v1"

@app.route('/api/time')
def get_current_time():
    return {'time': time.time()}

@app.route('/api/rates', methods=['GET'])
def get_exchange_rates():
    pairs = request.args.getlist('pair')
    if not pairs:
        return jsonify({"error": "At least one currency pair must be provided"}), 400
    #note: currently not restricting requests to currency pairs other than usd,cad,eur

    # parse and validate the dates:
    from_str = request.args.get('from')
    if not from_str:
        return jsonify({"error": "'from' date is required (format: YYYY-MM-DD)"}), 400
    from_date = datetime.strptime(from_str, '%Y-%m-%d').date() # convert to date

    today = datetime.now(timezone.utc).date()

    two_years_ago = today - relativedelta(years=2) # this is how far back we can go
    if from_date < two_years_ago:
        return jsonify({"error": "this api can only provide the data up to 2 years ago."}), 400

    paged_from = from_date.isoformat()
    paged_to = today.isoformat()
    
    results = {}
    for pair in pairs:
        try:
            base, target = pair.upper().split("/")
            url = f"{FRANKFURTER_API}/{paged_from}..{paged_to}"
            params = {"from": base, "to": target}
            response = requests.get(url, params=params)
            response.raise_for_status()
            data = response.json()

            rates = {
                date: rate[target]
                for date, rate in data.get("rates", {}).items()
            }
            results[pair] = rates
        except Exception as e:
            results[pair] = {"error": str(e)}

    return jsonify({
        "from": paged_from,
        "to": paged_to,
        "data": results
    }), 200
