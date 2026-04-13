from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import os

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "model.pkl")

model = joblib.load(MODEL_PATH)

@app.route("/")
def home():
    return "AQI Prediction API is running"

@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()

    input_df = pd.DataFrame([{
        "co_aqi_value": data["co"],
        "ozone_aqi_value": data["ozone"],
        "no2_aqi_value": data["no2"],
        "pm2.5_aqi_value": data["pm25"]
    }])

    prediction = model.predict(input_df)[0]
    confidence = model.predict_proba(input_df).max()

    return jsonify({
        "aqi_category": prediction,
        "confidence": round(float(confidence) * 100, 2)
    })

if __name__ == "__main__":
    app.run(debug=True)
