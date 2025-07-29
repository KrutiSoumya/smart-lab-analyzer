import React, { useState } from "react";
import axios from "axios";
import "./App.css";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  LabelList,
  ReferenceArea,
} from "recharts";

const NORMAL_RANGES = {
  Hemoglobin: { min: 12, max: 16 },
  WBC: { min: 4000, max: 11000 },
  "Platelet Count": { min: 150000, max: 450000 },
};

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [results, setResults] = useState({});

  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await axios.post("http://localhost:5000/upload", formData);
      const { explanations, values } = response.data;

      const previousReports = JSON.parse(localStorage.getItem("lab_reports") || "[]");

      const newEntry = {
        date: new Date().toISOString(),
        explanations,
        values,
      };

      const updatedReports = [...previousReports, newEntry];
      localStorage.setItem("lab_reports", JSON.stringify(updatedReports));

      setResults(explanations);
    } catch (error) {
      console.error("❌ Upload error:", error);
      alert("An error occurred during upload.");
    }
  };

  const getChartData = (test) => {
    const reports = JSON.parse(localStorage.getItem("lab_reports") || "[]");

    return reports
      .map((entry) => {
        const val = entry.values?.[test];
        if (val === undefined || val === null) return null;

        const dateObj = new Date(entry.date);
        if (isNaN(dateObj.getTime())) return null;

        return {
          date: dateObj.toLocaleDateString(),
          value: typeof val === "string" ? parseFloat(val.replace(/,/g, "")) : val,
        };
      })
      .filter(Boolean);
  };

  return (
    <div className="App">
      <h1>🧬 Smart Lab Report Explainer</h1>

      <div className="upload-container">
        <input type="file" accept=".pdf" onChange={(e) => setSelectedFile(e.target.files[0])} />
        <button onClick={handleUpload}>Upload Report</button>
      </div>

      {Object.entries(results).length > 0 && (
        <div className="results">
          <h2>🩺 Analysis Results</h2>
          {Object.entries(results).map(([test, explanation]) => {
            const isNormal = explanation.startsWith("🟢");
            const cardStyle = {
              backgroundColor: isNormal ? "#d1fae5" : "#fee2e2",
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "1rem",
              marginBottom: "1rem",
            };

            return (
              <div className="card" key={test} style={cardStyle}>
                <h3>{test}</h3>
                {explanation.split("\n").map((line, idx) => (
                  <p key={idx}>{line}</p>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {Object.keys(results).map((test) => {
        const chartData = getChartData(test);
        const normalRange = NORMAL_RANGES[test];

        return (
          <div key={test} style={{ marginTop: "2rem" }}>
            <h3>📊 {test} Trend</h3>
            {chartData.length >= 2 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Legend />
                  {normalRange && (
                    <ReferenceArea
                      y1={normalRange.min}
                      y2={normalRange.max}
                      strokeOpacity={0}
                      fill="#bbf7d0"
                      fillOpacity={0.4}
                    />
                  )}
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#4f46e5"
                    strokeWidth={2}
                    dot={{
                      r: 5,
                      stroke: "#4f46e5",
                      strokeWidth: 2,
                      fill: "white",
                    }}
                    activeDot={false}
                  >
                    <LabelList
                      dataKey="value"
                      position="top"
                      style={{
                        fontSize: "13px",
                        fontWeight: "bold",
                        fill: "#333",
                      }}
                    />
                  </Line>
                </LineChart>
              </ResponsiveContainer>
            ) : chartData.length === 1 ? (
              <p style={{ fontStyle: "italic" }}>Need at least two reports to show trend.</p>
            ) : (
              <p style={{ fontStyle: "italic" }}>No data found for this test.</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default App;
