"""
orderbook.py
Representasi order book sederhana (bid/ask) untuk satu token CLOB Polymarket.
"""

from dataclasses import dataclass, field
from typing import Dict, List, Optional


@dataclass
class OrderBook:
    asset_id: str
    bids: Dict[str, str] = field(default_factory=dict)  # price -> size
    asks: Dict[str, str] = field(default_factory=dict)  # price -> size

    def apply_snapshot(self, bids: List[dict], asks: List[dict]) -> None:
        self.bids = {level["price"]: level["size"] for level in bids}
        self.asks = {level["price"]: level["size"] for level in asks}

    def apply_price_change(self, changes: List[dict]) -> None:
        for change in changes:
            price = change["price"]
            size = change["size"]
            side = change["side"].upper()
            book_side = self.bids if side == "BUY" else self.asks
            if float(size) == 0:
                book_side.pop(price, None)
            else:
                book_side[price] = size

    def best_ask(self) -> Optional[str]:
        """Harga jual (ask) termurah yang tersedia, atau None jika kosong."""
        if not self.asks:
            return None
        return min(self.asks, key=float)

    def best_bid(self) -> Optional[str]:
        """Harga beli (bid) tertinggi yang tersedia, atau None jika kosong."""
        if not self.bids:
            return None
        return max(self.bids, key=float)
