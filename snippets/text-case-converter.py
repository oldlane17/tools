import re

def to_snake_case(s: str) -> str:
    s = re.sub(r"([a-z0-9])([A-Z])", r"\1_\2", s)
    return re.sub(r"[\s\-_]+", "_", s).lower().strip("_")

def to_camel_case(s: str) -> str:
    words = re.split(r"[\s\-_]+", s.strip())
    if not words or not words[0]:
        return ""
    return words[0].lower() + "".join(w.capitalize() for w in words[1:])

def to_kebab_case(s: str) -> str:
    return to_snake_case(s).replace("_", "-")

def text_stats(text: str) -> dict:
    words = text.split()
    return {
        "words": len(words),
        "characters": len(text),
        "chars_no_spaces": len(text.replace(" ", "")),
        "reading_time_sec": round(len(words) / 200 * 60, 1)
    }

if __name__ == "__main__":
    text = "hello world from Old Lane 17"
    print("Snake: ", to_snake_case(text))
    print("Camel: ", to_camel_case(text))
    print("Kebab: ", to_kebab_case(text))
    print("Stats: ", text_stats(text))
    assert to_kebab_case("Hello World") == "hello-world"
