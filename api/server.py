from flask import Flask, request, jsonify, send_from_directory
from db import init_db, close_db
from exchange_rates import validate_request_args, fetch_frankfurter_data

app = Flask(__name__,  static_folder='../dist', static_url_path='/')

@app.route('/')
def home():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/api/rates', methods=['GET'])
def get_exchange_rates():
    is_valid, error, data = validate_request_args(request.args)
    if not is_valid:
        return jsonify(error), 400

    from_date = data["from_date"].isoformat()
    to_date = data["to_date"].isoformat()
    
    results = {}
    for pair in data["pairs"]:
        key, value = fetch_frankfurter_data(pair, from_date, to_date)
        results[key] = value

    return jsonify({
        "from": from_date,
        "to": to_date,
        "data": results
    }), 200

@app.teardown_appcontext
def teardown(exception):
    close_db()

with app.app_context():
    init_db() # this will only create the db if it doesn't exist