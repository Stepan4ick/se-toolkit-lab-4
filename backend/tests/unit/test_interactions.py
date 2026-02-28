"""Unit tests for interaction filtering logic."""

from app.models.interaction import InteractionLog
from app.routers.interactions import _filter_by_item_id


def _make_log(id: int, learner_id: int, item_id: int) -> InteractionLog:
    return InteractionLog(id=id, learner_id=learner_id, item_id=item_id, kind="attempt")


def test_filter_returns_all_when_item_id_is_none() -> None:
    interactions = [_make_log(1, 1, 1), _make_log(2, 2, 2)]
    result = _filter_by_item_id(interactions, None)
    assert result == interactions


def test_filter_returns_empty_for_empty_input() -> None:
    result = _filter_by_item_id([], 1)
    assert result == []


def test_filter_returns_interaction_with_matching_ids() -> None:
    interactions = [_make_log(1, 1, 1), _make_log(2, 2, 2)]
    result = _filter_by_item_id(interactions, 1)
    assert len(result) == 1
    assert result[0].id == 1

def test_filter_excludes_interaction_with_different_learner_id() -> None:
    interactions = [_make_log(1, 2, 1)]
    result = _filter_by_item_id(interactions, 1)
    assert len(result) == 1
    assert result[0].id == 1
    assert result[0].learner_id == 2
    assert result[0].item_id == 1

def test_filter_returns_multiple_matching_interactions() -> None:
    """Test filter returns all interactions with matching item_id."""
    interactions = [
        _make_log(1, 1, 1),
        _make_log(2, 2, 2),
        _make_log(3, 3, 1),
        _make_log(4, 4, 1),
        _make_log(5, 5, 3)
    ]
    result = _filter_by_item_id(interactions, 1)
    assert len(result) == 3
    assert all(i.item_id == 1 for i in result)
    assert [i.id for i in result] == [1, 3, 4]


def test_filter_preserves_all_fields() -> None:
    """Test that filter preserves all fields of the interaction."""
    interactions = [
        _make_log(1, 5, 1),
        _make_log(2, 10, 2),
        _make_log(3, 15, 1)
    ]
    result = _filter_by_item_id(interactions, 1)
    assert len(result) == 2
    assert result[0].learner_id == 5
    assert result[1].learner_id == 15
    assert result[0].kind == "attempt"
    assert result[1].kind == "attempt"


def test_filter_with_item_id_zero() -> None:
    """Test filtering with item_id=0 (boundary value)."""
    interactions = [
        _make_log(1, 1, 0),
        _make_log(2, 2, 1),
        _make_log(3, 3, 0)
    ]
    result = _filter_by_item_id(interactions, 0)
    assert len(result) == 2
    assert all(i.item_id == 0 for i in result)
    assert result[0].id == 1
    assert result[1].id == 3