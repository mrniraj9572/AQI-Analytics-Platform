import { useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

function App() {
  // ================= STATE =================
  const [form, setForm] = useState({
    co: "",
    ozone: "",
    no2: "",
    pm25: ""
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ================= HANDLERS =================
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const predictAQI = async () => {
    setError("");
    setLoading(true);

    try {
      const res = await axios.post("http://127.0.0.1:5000/predict", {
        co: Number(form.co),
        ozone: Number(form.ozone),
        no2: Number(form.no2),
        pm25: Number(form.pm25)
      });
      setResult(res.data);
    } catch {
      setError("Backend not reachable. Make sure Flask is running.");
    }

    setLoading(false);
  };

  // ================= DATA =================
  const analyticsData = [
    { name: "CO", value: Number(form.co) || 0 },
    { name: "Ozone", value: Number(form.ozone) || 0 },
    { name: "NO₂", value: Number(form.no2) || 0 },
    { name: "PM2.5", value: Number(form.pm25) || 0 }
  ];

  const dominantPollutant = analyticsData.reduce(
    (max, item) => (item.value > max.value ? item : max),
    analyticsData[0]
  );

  const aqiMeterData = [
    { name: "Good", value: 20, color: "#16a34a" },
    { name: "Moderate", value: 20, color: "#eab308" },
    { name: "Unhealthy", value: 20, color: "#f97316" },
    { name: "Very Unhealthy", value: 20, color: "#ef4444" },
    { name: "Hazardous", value: 20, color: "#7c2d12" }
  ];
  const getNeedleAngle = (category) => {
  switch (category) {
    case "Good":
      return -150;
    case "Moderate":
      return -110;
    case "Unhealthy for Sensitive Groups":
      return -70;
    case "Unhealthy":
      return -30;
    case "Very Unhealthy":
      return -10;
    case "Hazardous":
      return 10;
    default:
      return -150;
  }
};

const Needle = ({ angle }) => {
  const centerX = 160;
  const centerY = 160;
  const length = 75;

  const radian = (Math.PI / 180) * angle;
  const x = centerX + length * Math.cos(radian);
  const y = centerY + length * Math.sin(radian);

  return (
    <svg
      width="320"
      height="160"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        pointerEvents: "none"
      }}
    >
      {/* Needle line */}
      <line
        x1={centerX}
        y1={centerY}
        x2={x}
        y2={y}
        stroke="#000000"      // dark slate
        strokeWidth="4"       // THICKER
        strokeLinecap="round"
      />

      {/* Center pivot */}
      <circle
        cx={centerX}
        cy={centerY}
        r="7"
        fill="#0f172a"
        stroke="#ffffff"
        strokeWidth="-9"
      />
    </svg>
  );
};


  // ================= UI =================
  return (
    <div style={styles.page}>
      {/* HEADER */}
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>Air Quality Intelligence Dashboard</h1>
        <p style={styles.headerSub}>
          Multiclass ML • Data Analytics • EDA-based System
        </p>
      </div>

      {/* DASHBOARD */}
      <div style={styles.dashboard}>
        {/* LEFT PANEL */}
        <div style={styles.leftPanel}>
          <h2 style={styles.sectionTitle}>AQI Prediction</h2>

          <input type="number" name="co" placeholder="CO AQI Value" onChange={handleChange} style={styles.input} />
          <input type="number" name="ozone" placeholder="Ozone AQI Value" onChange={handleChange} style={styles.input} />
          <input type="number" name="no2" placeholder="NO₂ AQI Value" onChange={handleChange} style={styles.input} />
          <input type="number" name="pm25" placeholder="PM2.5 AQI Value" onChange={handleChange} style={styles.input} />

          <button onClick={predictAQI} style={styles.button} disabled={loading}>
            {loading ? "Analyzing..." : "Predict AQI"}
          </button>

          {error && <p style={styles.error}>{error}</p>}

          {result && (
            <div style={styles.result}>
              <p><b>AQI Category:</b> {result.aqi_category}</p>
              <p><b>Confidence:</b> {result.confidence}%</p>
            </div>
          )}
        </div>

        {/* RIGHT PANEL */}
        <div style={styles.rightPanel}>
          {/* AQI METER */}
         <div style={styles.meterContainer}>
  <h2 style={styles.sectionTitle}>Air Quality Level</h2>

  <div style={{ position: "relative", width: "320px", margin: "0 auto" }}>
    <PieChart width={320} height={160}>
      <Pie
        data={aqiMeterData}
        startAngle={180}
        endAngle={0}
        cx="50%"
        cy="100%"
        innerRadius={70}
        outerRadius={100}
        dataKey="value"
        stroke="none"
      >
        {aqiMeterData.map((entry, index) => (
          <Cell key={index} fill={entry.color} />
        ))}
      </Pie>
    </PieChart>

    {/* NEEDLE */}
    <Needle angle={getNeedleAngle(result?.aqi_category)} />
  </div>

  <p style={styles.meterLabel}>
    {result ? result.aqi_category : "--"}
  </p>
</div>


          {/* ANALYTICS */}
          <h2 style={{ ...styles.sectionTitle, marginTop: "25px" }}>
            Pollutant Analytics
          </h2>

          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={analyticsData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>

          <p style={styles.dominant}>
            <b>Dominant Pollutant:</b> {dominantPollutant.name}
          </p>
        </div>
      </div>
    </div>
  );
}

// ================= STYLES =================
const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#0f172a",
    padding: "40px"
  },
  header: {
    marginBottom: "30px"
  },
  headerTitle: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#ffffff"
  },
  headerSub: {
    fontSize: "14px",
    color: "#94a3b8"
  },
  dashboard: {
    display: "grid",
    gridTemplateColumns: "1fr 1.3fr",
    gap: "30px"
  },
  leftPanel: {
    background: "#ffffff",
    padding: "30px",
    borderRadius: "14px"
  },
  rightPanel: {
    background: "#ffffff",
    padding: "30px",
    borderRadius: "14px"
  },
  sectionTitle: {
    marginBottom: "15px",
    fontSize: "18px"
  },
  input: {
    width: "100%",
    padding: "10px",
    marginBottom: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc"
  },
  button: {
    width: "100%",
    padding: "12px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    marginTop: "10px"
  },
  result: {
    marginTop: "20px",
    background: "#2c2d2f",
    padding: "15px",
    borderRadius: "6px",
    fontWeight: "600"
  },
  meterContainer: {
    textAlign: "center",
    marginBottom: "70px"
  },
  meterLabel: {
    fontSize: "22px",
    fontWeight: "700",
    marginTop: "-10px"
  },
  dominant: {
    marginTop: "15px",
    fontSize: "14px"
  },
  error: {
    marginTop: "12px",
    color: "red",
    fontSize: "14px"
  }
};

export default App;
