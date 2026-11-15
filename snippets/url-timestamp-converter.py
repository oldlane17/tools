import urllib.parse
from datetime import datetime, timezone

def url_encode(text: str) -> str:
    return urllib.parse.quote(text, safe="")

def url_decode(text: str) -> str:
    return urllib.parse.unquote(text)

def timestamp_to_iso(epoch_seconds: int | float) -> str:
    dt = datetime.fromtimestamp(epoch_seconds, tz=timezone.utc)
    return dt.isoformat()

def iso_to_timestamp(iso_str: str) -> int:
    dt = datetime.fromisoformat(iso_str)
    return int(dt.timestamp())

if __name__ == "__main__":
    raw_url = "https://tools.oldlane17.com/?search=hello world&filter=code"
    encoded = url_encode(raw_url)
    decoded = url_decode(encoded)
    ts = 1700000000
    iso = timestamp_to_iso(ts)
    print(f"Encoded:   {encoded}")
    print(f"Decoded:   {decoded}")
    print(f"Timestamp: {ts} -> {iso}")
    assert decoded == raw_url
    assert iso_to_timestamp(iso) == ts
