from PIL import Image
import io

def convert_image(image_bytes: bytes, target_format: str = "WEBP", quality: int = 85) -> bytes:
    """Converts image bytes to target format (WEBP, PNG, JPEG) with optional compression."""
    img = Image.open(io.BytesIO(image_bytes))
    target_format = target_format.upper()
    if target_format == "JPEG" and img.mode in ("RGBA", "P"):
        img = img.convert("RGB")
    out = io.BytesIO()
    img.save(out, format=target_format, quality=quality)
    return out.getvalue()

if __name__ == "__main__":
    # Create a 64x64 test image in memory
    img = Image.new("RGBA", (64, 64), color=(160, 160, 255, 255))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    png_bytes = buf.getvalue()
    
    webp_bytes = convert_image(png_bytes, target_format="WEBP", quality=80)
    print(f"Original PNG size:  {len(png_bytes)} bytes")
    print(f"Converted WebP size: {len(webp_bytes)} bytes")
    assert len(webp_bytes) > 0
