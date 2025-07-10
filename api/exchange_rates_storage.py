from db import get_db


def get_rates_from_db(pair, from_date, to_date):
    """
    Retrieves exchange rates for a given currency pair and date range from the database.

    Returns:
        dict: A mapping of date strings to exchange rates found in the database.
    """
    db = get_db()
    
    cursor = db.execute(
        "SELECT date, rate FROM exchange_rates WHERE currency_pair = ? AND date BETWEEN ? AND ?",
        (pair, from_date, to_date),
    )

    rates = {}
    for row in cursor.fetchall():
        rates[row["date"]] = row["rate"]
        
    return rates


def save_rates_to_db(pair, rates_dict):
    """
    Saves a dictionary of exchange rates to the database for a specific currency pair.
    
    Returns:
        nothing right now but we should probably have some error checks, and return the number of rows inserted.
    """
    db = get_db()

    data = []
    for date, rate in rates_dict.items():
        data.append((pair, date, rate))

    db.executemany(
        "INSERT OR IGNORE INTO exchange_rates (currency_pair, date, rate) VALUES (?, ?, ?)",
        data,
    )
    db.commit()
