# Text <-> DNA: 2 bits per nucleotide (00=A, 01=C, 10=G, 11=T)
MAP = {"00": "A", "01": "C", "10": "G", "11": "T"}
REV = {v: k for k, v in MAP.items()}

def text_to_dna(text: str) -> str:
    bits = "".join(f"{b:08b}" for b in text.encode("utf-8"))
    return "".join(MAP[bits[i:i + 2]] for i in range(0, len(bits), 2))

def dna_to_text(dna: str) -> str:
    dna = dna.strip().upper()
    bits = "".join(REV[n] for n in dna if n in REV)
    data = bytes(int(bits[i:i + 8], 2) for i in range(0, len(bits), 8))
    return data.decode("utf-8", errors="replace")

if __name__ == "__main__":
    sample = "Old Lane 17"
    dna = text_to_dna(sample)
    recovered = dna_to_text(dna)
    print(f"Original: {sample}")
    print(f"DNA:      {dna[:32]}...")
    print(f"Decoded:  {recovered}")
    assert recovered == sample
