from datetime import datetime, timezone
from dateutil.relativedelta import relativedelta
import requests

FRANKFURTER_API = "https://api.frankfurter.app"


def validate_request_args(args):
    """
    Validates query parameters for exchange rate requests.

    Returns:
        tuple:
            - bool: success or failure to validate the params.
            - dict or None: error message if failed to validate.

    """
    # note: currently not restricting requests to currency pairs other than usd,cad,eur
    # note: I noticed a niche error with querying for the 2 years mark around midnught EST time. Proooobably has to do with the timezones.
    pairs = args.getlist("pair")
    if not pairs:
        return False, {"error": "At least one currency pair must be provided"}, None

    from_str = args.get("from")
    if not from_str:
        return False, {"error": "'from' date is required (format: YYYY-MM-DD)"}, None

    from_date = datetime.strptime(from_str, "%Y-%m-%d").date()
    today = datetime.now(timezone.utc).date()
    two_years_ago = today - relativedelta(years=2)

    if from_date < two_years_ago:
        return (False, {"error": "This API can only provide data up to 2 years ago."}, None)

    return True, None, {"pairs": pairs, "from_date": from_date, "to_date": today}


def fetch_frankfurter_data(pair, from_date, to_date):
    """
    Fetches historical exchange rate data for a given currency pair from the Frankfurter API.

    Returns:
        tuple:
            - str: the original currency pair.
            - dict: a mapping of date strings to exchange rates, or an error message if the request fails.
    """
    try:
        base, target = pair.upper().split("/")
        url = f"{FRANKFURTER_API}/{from_date}..{to_date}"
        params = {"from": base, "to": target}

        response = requests.get(url, params=params)
        response.raise_for_status()
        data = response.json()

        rates = {date: rate[target] for date, rate in data.get("rates", {}).items()}
        return pair, rates
    except Exception as e:
        return pair, {"error": str(e)}
