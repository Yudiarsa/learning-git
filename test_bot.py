import requests

# 1. Masukkan Token dan Chat ID Anda di sini
TOKEN = "GANTI_DENGAN_TOKEN_BOT_ANDA"
CHAT_ID = "GANTI_DENGAN_CHAT_ID_ANDA"

# 2. Pesan uji coba
pesan = "🚀 Tes Sinyal Bot: Koneksi dari Python ke Telegram berhasil!"

# 3. Kirim pesan via API Telegram
url = f"https://api.telegram.org/bot{TOKEN}/sendMessage"
payload = {
    "chat_id": CHAT_ID,
    "text": pesan
}

response = requests.post(url, data=payload)

# 4. Cek hasil pengiriman
if response.status_code == 200:
    print("✅ Pesan berhasil terkirim ke Telegram!")
else:
    print("❌ Gagal mengirim pesan. Cek Token/Chat ID Anda.")
