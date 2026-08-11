"""Hello unit test module."""

from apps/py_geo.hello import hello


def test_hello():
    """Test the hello function."""
    assert hello() == "Hello apps/py-geo"
