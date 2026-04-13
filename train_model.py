import os
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
import joblib

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "data", "global_air_pollution_data.csv")

df = pd.read_csv(DATA_PATH)
df.columns = df.columns.str.strip()

X = df[["co_aqi_value", "ozone_aqi_value", "no2_aqi_value", "pm2.5_aqi_value"]]
y = df["aqi_category"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

model = RandomForestClassifier(
    n_estimators=300,
    random_state=42,
    class_weight="balanced"
)

model.fit(X_train, y_train)

y_pred = model.predict(X_test)

print("Accuracy:", accuracy_score(y_test, y_pred))
print(classification_report(y_test, y_pred))

joblib.dump(model, os.path.join(BASE_DIR, "model.pkl"))

print("Model trained and saved successfully")
