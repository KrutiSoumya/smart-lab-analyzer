# ✅ RESTORED app.py (working version with "pattern" key)
from flask import Flask, request, jsonify
from pdf2image import convert_from_bytes
import pytesseract
import re
import json
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
with open(os.path.join(BASE_DIR, 'explanation_data', 'test_info.json'), encoding='utf-8') as f:
    TEST_INFO = json.load(f)

def extract_tests(text):
    results = []

    lines = text.splitlines()
    lines = [line.strip().lstrip("e•*") for line in lines if line.strip()]
    text = "\n".join(lines)

    for test, info in TEST_INFO.items():
        try:
            pattern = info["pattern"]
            matches = re.findall(pattern, text, re.IGNORECASE)

            for match in matches:
                # Handle multiple capturing groups (ORed patterns)
                if isinstance(match, tuple):
                    match_values = [m for m in match if m]  # keep non-empty groups
                    if not match_values:
                        continue
                    value_str = match_values[0].replace(",", "")
                else:
                    value_str = match.replace(",", "")

                if test == "Platelet Count":
                    unit = ""
                    if isinstance(match, tuple) and len(match) > 1:
                        unit = (match[1] or "").lower()
                    value = float(value_str)
                    if "lakh" in unit:
                        value *= 100000
                else:
                    value = float(value_str)

                results.append((test, value))

        except Exception as e:
            print(f"❌ Error extracting {test}: {e}")
            continue

    return results


def generate_explanations(results):
    explanations = {}

    for test, value in results:
        if test not in TEST_INFO:
            explanations[test] = f"{test}: {value} (No explanation defined)"
            continue

        info = TEST_INFO[test]
        low, high = info["normal_range"]
        desc = info["description"]

        if value < low:
            status = f"🔴 Low {test} ({value})"
            interpretation = info.get("low_interpretation", "Value is below normal.")
            action = info.get("low_action", "Consult a physician.")
        elif value > high:
            status = f"🔴 High {test} ({value})"
            interpretation = info.get("high_interpretation", "Value is above normal.")
            action = info.get("high_action", "Further evaluation advised.")
        else:
            status = f"🟢 {test} is Normal ({value})"
            interpretation = info.get("normal_interpretation", "Within expected range.")
            action = info.get("normal_action", "Maintain routine monitoring.")

        explanation = f"{status}\nNormal range: {low}–{high}\nFunction: {desc}\n{interpretation}\n{action}"
        explanations[test] = explanation

    return explanations

@app.route("/upload", methods=["POST"])
def upload_report():
    try:
        print("📥 File received")
        file = request.files["file"]
        print("🧾 File name:", file.filename)

        images = convert_from_bytes(file.read())
        print("🖼️ Converted to image")

        text = pytesseract.image_to_string(images[0])
        print("🔠 OCR extracted text:\n", text)

        results = extract_tests(text)
        print("📊 Test results:", results)

        explanations = generate_explanations(results)
        raw_values = {test: value for test, value in results}

        return jsonify({
            "explanations": explanations,
            "values": raw_values
        })

    except Exception as e:
        print("❌ Error occurred:", e)
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
