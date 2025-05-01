import React from "react";
import { useAuth } from "../context/AuthContext";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

const Analytics = () => {
  const { currentUser } = useAuth();
  const tables = JSON.parse(localStorage.getItem("cgpaCalculatorTables")) || [];

  // Calculate GPA for a single semester
  const calculateGPA = (table) => {
    let totalScore = 0,
      totalUnits = 0;
    table.data.forEach((row) => {
      const unit = parseFloat(row[1]) || 0;
      const grade = parseFloat(row[2]) || 0;
      totalScore += unit * grade;
      totalUnits += unit;
    });
    return totalUnits ? (totalScore / totalUnits).toFixed(2) : 0;
  };

  // Overall CGPA calculation
  const calculateCGPA = () => {
    let totalScore = 0,
      totalUnits = 0;
    tables.forEach((table) => {
      table.data.forEach((row) => {
        const unit = parseFloat(row[1]) || 0;
        const grade = parseFloat(row[2]) || 0;
        totalScore += unit * grade;
        totalUnits += unit;
      });
    });
    return totalUnits ? (totalScore / totalUnits).toFixed(2) : 0;
  };

  // Grade distribution calculation
  const getGradeDistribution = () => {
    const distribution = { A: 0, B: 0, C: 0, D: 0, F: 0 };
    tables.forEach((table) => {
      table.data.forEach((row) => {
        const grade = parseFloat(row[2]) || 0;
        if (grade >= 4.5) distribution.A++;
        else if (grade >= 3.5) distribution.B++;
        else if (grade >= 2.5) distribution.C++;
        else if (grade >= 1.5) distribution.D++;
        else if (grade > 0) distribution.F++;
      });
    });
    return distribution;
  };

  const gradeDistribution = getGradeDistribution();

  // Chart data and options
  const semesterData = {
    labels: tables.map((table) => table.name),
    datasets: [
      {
        label: "GPA",
        data: tables.map((table) => calculateGPA(table)),
        backgroundColor: "rgba(59, 130, 246, 0.8)",
        borderColor: "rgba(59, 130, 246, 1)",
        borderWidth: 1,
      },
    ],
  };

  const gradeData = {
    labels: Object.keys(gradeDistribution),
    datasets: [
      {
        data: Object.values(gradeDistribution),
        backgroundColor: [
          "rgba(59, 130, 246, 0.8)",
          "rgba(16, 185, 129, 0.8)",
          "rgba(245, 158, 11, 0.8)",
          "rgba(239, 68, 68, 0.8)",
          "rgba(107, 114, 128, 0.8)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
    },
  };

  return (
    <div className=" p-[4vw] md:p-8 w-full mx-auto">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl mt-32 md:text-4xl font-bold mb-6 md:mb-8">
          Hi {currentUser?.profileData?.firstName}, here's your academic
          overview
        </h1>

        {tables.length === 0 ? (
          <div className="p-6 rounded-lg shadow">
            <p className="text-gray-600">
              No semester data available. Add semesters to see analytics.
            </p>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <div className=" p-4 rounded-lg shadow">
                <h3 className="text-gray-500 text-sm">Total Semesters</h3>
                <p className="text-2xl font-bold">{tables.length}</p>
              </div>
              <div className=" p-4 rounded-lg shadow-xl">
                <h3 className="text-gray-500 text-sm">Overall CGPA</h3>
                <p className="text-2xl font-bold text-blue-600">
                  {calculateCGPA()}
                </p>
              </div>
              <div className=" p-4 rounded-lg shadow">
                <h3 className="text-gray-500 text-sm">Total Courses</h3>
                <p className="text-2xl font-bold">
                  {tables.reduce((sum, table) => sum + table.data.length, 0)}
                </p>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="p-4 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-4">Semester GPAs</h2>
                <div className="h-64">
                  <Bar data={semesterData} options={chartOptions} />
                </div>
              </div>
              <div className="p-4 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-4">
                  Grade Distribution
                </h2>
                <div className="h-64">
                  <Pie data={gradeData} options={chartOptions} />
                </div>
              </div>
            </div>

            {/* Grade Breakdown */}
            <div className="p-4 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">Grade Breakdown</h2>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                {Object.entries(gradeDistribution).map(([grade, count]) => (
                  <div
                    key={grade}
                    className="text-center p-3 rounded-lg"
                  >
                    <div className="text-2xl font-bold">{count}</div>
                    <div className="text-gray-500">Grade {grade}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Analytics;
