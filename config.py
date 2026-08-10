"""
config.py
Konfigurasi terpusat untuk Bot Arbitrase Polymarket.

Isi nilai di bawah langsung, atau override lewat environment variable
dengan nama yang sama (mis. `export YES_TOKEN_ID=...`).
"""

import os

# --- Telegram ---
TELEGRAM_TOKEN = os.getenv("TELEGRAM_TOKEN", "")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID", "")

# --- Polymarket CLOB ---
CLOB_WS_URL = "wss://ws-subscriptions-clob.polymarket.com/ws/market"

# Token ID (bukan condition_id) untuk outcome YES dan NO dari market yang dipantau.
# Didapat mis. lewat GET https://clob.polymarket.com/markets/{condition_id}
YES_TOKEN_ID = os.getenv("YES_TOKEN_ID", "")
NO_TOKEN_ID = os.getenv("NO_TOKEN_ID", "")

# --- Strategi ---
# Ambang batas profit minimum (persen) sebelum alert dikirim.
MIN_PROFIT_PCT = float(os.getenv("MIN_PROFIT_PCT", "1.0"))

# Jeda minimum antar alert untuk market yang sama (detik), agar tidak spam.
ALERT_COOLDOWN_SECONDS = int(os.getenv("ALERT_COOLDOWN_SECONDS", "60"))
