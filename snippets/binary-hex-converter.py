def text_to_binary(text: str) -> str:
    """Converts UTF-8 text into space-separated 8-bit binary strings."""
    return " ".join(f"{b:08b}" for b in text.encode("utf-8"))

def binary_to_text(binary: str) -> str:
    """Converts binary strings (space-separated or raw) back into UTF-8 text."""
    clean = binary.replace(" ", "").strip()
    byte_chunks = [clean[i:i + 8] for i in range(0, len(clean), 8) if len(clean[i:i + 8]) == 8]
    return bytes(int(b, 2) for b in byte_chunks).decode("utf-8", errors="replace")

def base_converter(value_str: str, from_base: int = 10, to_base: int = 16) -> str:
    """Converts integers between standard bases (2, 8, 10, 16)."""
    n = int(value_str.strip(), from_base)
    if to_base == 2:
        return bin(n)[2:]
    elif to_base == 8:
        return oct(n)[2:]
    elif to_base == 10:
        return str(n)
    elif to_base == 16:
        return hex(n)[2:].upper()
    raise ValueError(f"Unsupported target base: {to_base}")

if __name__ == "__main__":
    msg = "Tools"
    b_str = text_to_binary(msg)
    recovered = binary_to_text(b_str)
    print(f"Text to Binary: '{msg}' -> {b_str}")
    print(f"Binary to Text: {recovered}")
    print(f"Dec 255 to Hex: {base_converter('255', 10, 16)}")
    assert recovered == msg
    assert base_converter("255", 10, 16) == "FF"
