"""
arbitrage.py
Deteksi peluang intramarket arbitrage: Best Ask YES + Best Ask NO < $1.00.
"""

from dataclasses import dataclass
from typing import Optional


@dataclass
class ArbitrageOpportunity:
    ask_yes: float
    ask_no: float
    total_cost: float
    profit: float
    profit_pct: float


def find_opportunity(ask_yes: Optional[str], ask_no: Optional[str]) -> Optional[ArbitrageOpportunity]:
    """Mengembalikan ArbitrageOpportunity jika (ask_yes + ask_no) < 1.0, selain itu None."""
    if ask_yes is None or ask_no is None:
        return None

    ask_yes_f = float(ask_yes)
    ask_no_f = float(ask_no)
    total_cost = ask_yes_f + ask_no_f

    if total_cost >= 1.0:
        return None

    profit = 1.0 - total_cost
    profit_pct = (profit / total_cost) * 100

    return ArbitrageOpportunity(
        ask_yes=ask_yes_f,
        ask_no=ask_no_f,
        total_cost=total_cost,
        profit=profit,
        profit_pct=profit_pct,
    )
