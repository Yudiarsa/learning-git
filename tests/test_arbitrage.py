import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from arbitrage import find_opportunity
from orderbook import OrderBook


def test_finds_opportunity_when_total_below_one_dollar():
    opportunity = find_opportunity("0.45", "0.52")
    assert opportunity is not None
    assert opportunity.total_cost == 0.97
    assert round(opportunity.profit, 2) == 0.03
    assert round(opportunity.profit_pct, 2) == 3.09


def test_no_opportunity_when_total_at_or_above_one_dollar():
    assert find_opportunity("0.50", "0.51") is None
    assert find_opportunity("0.50", "0.50") is None


def test_no_opportunity_when_a_side_is_missing():
    assert find_opportunity(None, "0.50") is None
    assert find_opportunity("0.50", None) is None


def test_orderbook_tracks_best_ask_and_bid():
    book = OrderBook(asset_id="token-1")
    book.apply_snapshot(
        bids=[{"price": "0.40", "size": "100"}, {"price": "0.42", "size": "50"}],
        asks=[{"price": "0.48", "size": "100"}, {"price": "0.45", "size": "20"}],
    )
    assert book.best_ask() == "0.45"
    assert book.best_bid() == "0.42"


def test_orderbook_applies_price_change_and_removes_zero_size_levels():
    book = OrderBook(asset_id="token-1")
    book.apply_snapshot(bids=[], asks=[{"price": "0.45", "size": "20"}])
    book.apply_price_change([
        {"price": "0.44", "size": "10", "side": "SELL"},
        {"price": "0.45", "size": "0", "side": "SELL"},
    ])
    assert book.best_ask() == "0.44"
