"""
main.py
Bot Arbitrase Intramarket Polymarket.

Memantau order book YES/NO satu market lewat WebSocket CLOB Polymarket,
mendeteksi peluang (Best Ask YES + Best Ask NO < $1.00), dan mengirim
alert ke Telegram saat peluang ditemukan.

PENTING:
- Nama field pesan WebSocket ("bids"/"asks" vs "buys"/"sells", dst.) di sini
  mengikuti dokumentasi publik CLOB API Polymarket. Cetak (print) pesan
  mentah yang diterima dan cocokkan field-nya sebelum dipakai untuk
  trading nyata, karena API pihak ketiga bisa berubah.
- Skrip ini butuh koneksi WebSocket keluar (wss://), yang TIDAK didukung
  di lingkungan cloud session/sandbox Claude Code. Jalankan di mesin lokal
  Anda sendiri.

Cara pakai:
1. Isi TELEGRAM_TOKEN, TELEGRAM_CHAT_ID di config.py (atau environment variable).
2. Isi YES_TOKEN_ID dan NO_TOKEN_ID di config.py dengan token ID pasangan
   outcome dari market yang ingin dipantau.
3. Jalankan: python3 main.py
"""

import asyncio
import json
import time

import websockets

import config
from arbitrage import find_opportunity
from notifier import format_opportunity_message, send_telegram_message
from orderbook import OrderBook


class ArbitrageBot:
    def __init__(self):
        self.books = {
            config.YES_TOKEN_ID: OrderBook(asset_id=config.YES_TOKEN_ID),
            config.NO_TOKEN_ID: OrderBook(asset_id=config.NO_TOKEN_ID),
        }
        self._last_alert_at = 0.0

    async def run(self):
        if not config.YES_TOKEN_ID or not config.NO_TOKEN_ID:
            raise SystemExit("YES_TOKEN_ID dan NO_TOKEN_ID belum diisi. Lihat config.py.")

        async for connection in websockets.connect(config.CLOB_WS_URL, ping_interval=20):
            try:
                await self._subscribe(connection)
                async for raw_message in connection:
                    self._handle_message(raw_message)
            except websockets.ConnectionClosed:
                print("[ws] Koneksi terputus, menyambung ulang...")
                continue

    async def _subscribe(self, connection):
        subscribe_msg = {"type": "market", "assets_ids": list(self.books.keys())}
        await connection.send(json.dumps(subscribe_msg))
        print(f"[ws] Berlangganan order book untuk: {list(self.books.keys())}")

    def _handle_message(self, raw_message: str):
        try:
            payload = json.loads(raw_message)
        except json.JSONDecodeError:
            return

        messages = payload if isinstance(payload, list) else [payload]
        for message in messages:
            self._handle_single(message)

    def _handle_single(self, message: dict):
        print(f"[debug] pesan mentah diterima: {message}")  # TODO: hapus setelah verifikasi field selesai
        event_type = message.get("event_type") or message.get("type")
        book = self.books.get(message.get("asset_id"))
        if book is None:
            return

        if event_type == "book":
            book.apply_snapshot(
                bids=message.get("bids") or message.get("buys") or [],
                asks=message.get("asks") or message.get("sells") or [],
            )
        elif event_type == "price_change":
            book.apply_price_change(message.get("changes", []))
        else:
            return

        self._check_arbitrage()

    def _check_arbitrage(self):
        yes_book = self.books[config.YES_TOKEN_ID]
        no_book = self.books[config.NO_TOKEN_ID]

        opportunity = find_opportunity(yes_book.best_ask(), no_book.best_ask())
        if opportunity is None or opportunity.profit_pct < config.MIN_PROFIT_PCT:
            return

        now = time.monotonic()
        if now - self._last_alert_at < config.ALERT_COOLDOWN_SECONDS:
            return
        self._last_alert_at = now

        print(
            f"[arb] Peluang: ask_yes={opportunity.ask_yes} ask_no={opportunity.ask_no} "
            f"profit={opportunity.profit:.4f} ({opportunity.profit_pct:.2f}%)"
        )
        send_telegram_message(
            config.TELEGRAM_TOKEN,
            config.TELEGRAM_CHAT_ID,
            format_opportunity_message("YES/NO market", opportunity),
        )


if __name__ == "__main__":
    asyncio.run(ArbitrageBot().run())
