import base64

def b64_encode(text: str) -> str:
    """Encodes a UTF-8 string to a Base64 ASCII string."""
    raw_bytes = text.encode("utf-8")
    return base64.b64encode(raw_bytes).decode("ascii")

def b64_decode(encoded: str) -> str:
    """Decodes a Base64 string back into a UTF-8 string."""
    raw_bytes = base64.b64decode(encoded.encode("ascii"))
    return raw_bytes.decode("utf-8", errors="replace")

if __name__ == "__main__":
    msg = "Hello from tools.oldlane17.com!"
    enc = b64_encode(msg)
    dec = b64_decode(enc)
    print(f"Original: {msg}")
    print(f"Encoded:  {enc}")
    print(f"Decoded:  {dec}")
    assert dec == msg
