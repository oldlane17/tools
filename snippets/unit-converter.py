# Length conversion factors to meters (SI base unit)
LENGTH_TO_METERS = {
    "mm": 0.001,
    "cm": 0.01,
    "m": 1.0,
    "km": 1000.0,
    "in": 0.0254,
    "ft": 0.3048,
    "yd": 0.9144,
    "mi": 1609.344
}

def convert_length(value: float, from_unit: str, to_unit: str) -> float:
    """Converts lengths via the SI meter base unit."""
    meters = value * LENGTH_TO_METERS[from_unit]
    return meters / LENGTH_TO_METERS[to_unit]

def convert_temperature(val: float, from_u: str, to_u: str) -> float:
    # Convert to Celsius
    if from_u == "C": c = val
    elif from_u == "F": c = (val - 32) * 5 / 9
    elif from_u == "K": c = val - 273.15
    # Convert from Celsius
    if to_u == "C": return c
    elif to_u == "F": return (c * 9 / 5) + 32
    elif to_u == "K": return c + 273.15

if __name__ == "__main__":
    miles = 5.0
    km = convert_length(miles, "mi", "km")
    f_temp = 68.0
    c_temp = convert_temperature(f_temp, "F", "C")
    print(f"{miles} miles = {km:.3f} km")
    print(f"{f_temp}°F = {c_temp:.1f}°C")
    assert round(c_temp, 1) == 20.0
