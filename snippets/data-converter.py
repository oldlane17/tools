import json
import csv
import io

def json_to_csv(json_str: str) -> str:
    """Converts a JSON array of dicts into a CSV string."""
    data = json.loads(json_str)
    if not isinstance(data, list) or not data:
        return ""
    headers = list(data[0].keys())
    out = io.StringIO()
    writer = csv.DictWriter(out, fieldnames=headers, lineterminator="\n")
    writer.writeheader()
    writer.writerows(data)
    return out.getvalue()

def csv_to_json(csv_str: str) -> str:
    """Converts a CSV string into a formatted JSON string."""
    f = io.StringIO(csv_str.strip())
    reader = csv.DictReader(f)
    return json.dumps(list(reader), indent=2)

if __name__ == "__main__":
    records = [{"id": 1, "name": "Tool A", "active": True}, {"id": 2, "name": "Tool B", "active": False}]
    j_str = json.dumps(records)
    csv_out = json_to_csv(j_str)
    j_out = csv_to_json(csv_out)
    print("CSV Output:\n" + csv_out)
    print("Re-converted JSON:\n" + j_out)
    assert len(json.loads(j_out)) == 2
