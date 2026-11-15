def hex_to_rgb(hex_code: str) -> tuple[int, int, int]:
    clean = hex_code.lstrip("#")
    if len(clean) == 3:
        clean = "".join(c * 2 for c in clean)
    return tuple(int(clean[i:i + 2], 16) for i in (0, 2, 4))

def rgb_to_hex(r: int, g: int, b: int) -> str:
    return f"#{r:02x}{g:02x}{b:02x}"

def rgb_to_hsl(r: int, g: int, b: int) -> tuple[int, int, int]:
    r_n, g_n, b_n = r / 255.0, g / 255.0, b / 255.0
    c_max, c_min = max(r_n, g_n, b_n), min(r_n, g_n, b_n)
    delta = c_max - c_min
    l = (c_max + c_min) / 2.0
    if delta == 0:
        h = s = 0.0
    else:
        s = delta / (2.0 - c_max - c_min) if l > 0.5 else delta / (c_max + c_min)
        if c_max == r_n:
            h = ((g_n - b_n) / delta) % 6
        elif c_max == g_n:
            h = ((b_n - r_n) / delta) + 2
        else:
            h = ((r_n - g_n) / delta) + 4
        h *= 60.0
    return round(h), round(s * 100), round(l * 100)

if __name__ == "__main__":
    brand_hex = "#a0a0ff"
    rgb = hex_to_rgb(brand_hex)
    hsl = rgb_to_hsl(*rgb)
    hex_rev = rgb_to_hex(*rgb)
    print(f"HEX: {brand_hex} -> RGB: {rgb} -> HSL: {hsl}")
    assert hex_rev == brand_hex
