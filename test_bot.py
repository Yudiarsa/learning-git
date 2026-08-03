"""
test_bot.py
Skrip uji coba untuk memastikan koneksi ke Telegram Bot API berjalan baik,
sebelum digunakan sebagai modul notifikasi pada Bot Arbitrase Polymarket.

Cara pakai:
1. Isi variabel TOKEN dengan token bot Telegram Anda (didapat dari @BotFather).
2. Isi variabel CHAT_ID dengan ID chat/grup tujuan notifikasi.
3. Jalankan: python3 test_bot.py
"""

import sys

import requests

# =========================================================
# ISI KREDENSIAL TELEGRAM ANDA DI SINI
# =========================================================
TOKEN = ""    # Contoh: "123456789:ABCdefGhIJKlmNoPQRstuVWxyz"
CHAT_ID = ""  # Contoh: "123456789" (personal) atau "-1001234567890" (grup)

TELEGRAM_API_BASE = "https://api.telegram.org"


def check_network_connection() -> bool:
    """Memastikan environment bisa menjangkau server Telegram."""
    try:
        response = requests.get(TELEGRAM_API_BASE, timeout=10)
        print(f"[OK] Jaringan terhubung ke {TELEGRAM_API_BASE} (status HTTP {response.status_code})")
        return True
    except requests.exceptions.RequestException as e:
        print(f"[GAGAL] Tidak bisa menjangkau {TELEGRAM_API_BASE}: {e}")
        return False


def send_telegram_message(token: str, chat_id: str, text: str) -> bool:
    """Mengirim pesan teks ke Telegram melalui Bot API."""
    url = f"{TELEGRAM_API_BASE}/bot{token}/sendMessage"
    payload = {"chat_id": chat_id, "text": text}

    try:
        response = requests.post(url, data=payload, timeout=10)
        data = response.json()
    except requests.exceptions.RequestException as e:
        print(f"[GAGAL] Request ke Telegram error: {e}")
        return False

    if response.status_code == 200 and data.get("ok"):
        print("[OK] Pesan berhasil terkirim ke Telegram!")
        return True

    print(f"[GAGAL] Telegram API menolak permintaan (HTTP {response.status_code})")
    print(f"        Detail: {data.get('description', data)}")
    return False


def main():
    print("=== Test Bot Notifikasi Telegram - Polymarket Arbitrage Bot ===\n")

    print("1. Mengecek koneksi jaringan ke Telegram...")
    if not check_network_connection():
        print("\nJaringan bermasalah, periksa koneksi internet/proxy Anda.")
        sys.exit(1)

    print("\n2. Mengecek kredensial bot...")
    if not TOKEN or not CHAT_ID:
        print("[PERINGATAN] TOKEN dan/atau CHAT_ID masih kosong.")
        print("             Isi variabel TOKEN dan CHAT_ID di bagian atas file ini,")
        print("             lalu jalankan kembali skrip untuk mengirim pesan uji coba.")
        sys.exit(0)

    print("\n3. Mengirim pesan uji coba...")
    send_telegram_message(
        TOKEN,
        CHAT_ID,
        "Bot Arbitrase Polymarket berhasil terhubung ke Telegram!",
    )


if __name__ == "__main__":
    main()
