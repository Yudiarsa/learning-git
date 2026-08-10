"""
notifier.py
Pengiriman notifikasi ke Telegram untuk Bot Arbitrase Polymarket.
"""

import requests

from arbitrage import ArbitrageOpportunity

TELEGRAM_API_BASE = "https://api.telegram.org"


def send_telegram_message(token: str, chat_id: str, text: str, timeout: int = 10) -> bool:
    """Mengirim pesan teks ke Telegram. Mengembalikan True jika berhasil."""
    if not token or not chat_id:
        print("[notifier] TELEGRAM_TOKEN / TELEGRAM_CHAT_ID belum diisi, alert dilewati.")
        return False

    url = f"{TELEGRAM_API_BASE}/bot{token}/sendMessage"
    payload = {"chat_id": chat_id, "text": text, "parse_mode": "Markdown"}

    try:
        response = requests.post(url, data=payload, timeout=timeout)
        data = response.json()
    except requests.exceptions.RequestException as e:
        print(f"[notifier] Gagal mengirim pesan Telegram: {e}")
        return False

    if response.status_code == 200 and data.get("ok"):
        return True

    print(f"[notifier] Telegram menolak permintaan: {data.get('description', data)}")
    return False


def format_opportunity_message(market_label: str, opportunity: ArbitrageOpportunity) -> str:
    return (
        "*Peluang Arbitrase Terdeteksi!*\n"
        f"Market: `{market_label}`\n"
        f"Ask YES: `${opportunity.ask_yes:.4f}`\n"
        f"Ask NO: `${opportunity.ask_no:.4f}`\n"
        f"Total Cost: `${opportunity.total_cost:.4f}`\n"
        f"Profit: `${opportunity.profit:.4f}` (`{opportunity.profit_pct:.2f}%`)"
    )
