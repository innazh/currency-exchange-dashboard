from flask import g
import sqlite3

DATABASE = "data.db"

def get_db():
    if 'db' not in g:
        g.db = sqlite3.connect(DATABASE)
        g.db.row_factory = sqlite3.Row
    return g.db

def close_db(e=None):
    if 'db' in g:
        db = g.pop('db', None)
        db.close()

def init_db():
    db = get_db()
    db.execute('''
        CREATE TABLE IF NOT EXISTS exchange_rates (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            currency_pair TEXT NOT NULL,
            date TEXT NOT NULL,
            rate REAL NOT NULL,
            UNIQUE(currency_pair, date)
        )
    ''')
    db.commit()
