import hashlib
import hmac

def generate_hash(text: str, algorithm: str = "sha256") -> str:
    """Computes a hexadecimal hash digest using standard library hashlib."""
    h = hashlib.new(algorithm)
    h.update(text.encode("utf-8"))
    return h.hexdigest()

def generate_hmac(key: str, message: str, algorithm: str = "sha256") -> str:
    """Computes a keyed-hash message authentication code (HMAC)."""
    h = hmac.new(key.encode("utf-8"), message.encode("utf-8"), getattr(hashlib, algorithm))
    return h.hexdigest()

if __name__ == "__main__":
    data = "Old Lane 17 Tools"
    sha256_hash = generate_hash(data, "sha256")
    sha512_hash = generate_hash(data, "sha512")
    hmac_code = generate_hmac("secret_key", data, "sha256")
    print(f"Data:    {data}")
    print(f"SHA-256: {sha256_hash}")
    print(f"SHA-512: {sha512_hash[:32]}...")
    print(f"HMAC:    {hmac_code}")
    assert len(sha256_hash) == 64
    assert len(sha512_hash) == 128
