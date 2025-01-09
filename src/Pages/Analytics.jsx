import React from 'react';
import { useAuth } from "../context/AuthContext";
import { Line, Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Analytics = () => {
  const { currentUser, tables = [] } = useAuth();

  const calculateTableGPA = (table) => {
    let totalScore = 0;
    let totalUnits = 0;
    table.data.forEach(row => {
      if (row[1] && row[2]) {
        totalScore += parseFloat(row[3] || 0);
        totalUnits += parseFloat(row[1] || 0);
      }
    });
    return totalUnits ? (totalScore / totalUnits).toFixed(2) : "0.00";
  };

  const getGradeDistribution = () => {
    const grades = { A: 0, B: 0, C: 0, D: 0, F: 0 };
    tables.forEach(table => {
      table.data.forEach(row => {
        const grade = parseFloat(row[2] || 0);
        if (grade >= 4.5) grades.A++;
        else if (grade >= 3.5) grades.B++;
        else if (grade >= 2.5) grades.C++;
        else if (grade >= 1.5) grades.D++;
        else if (grade > 0) grades.F++;
      });
    });
    return grades;
  };

  const getBestSemester = () => {
    if (!tables.length) return null;
    return tables.reduce((best, table) => {
      const gpa = parseFloat(calculateTableGPA(table));
      return gpa > best.gpa ? { name: table.name, gpa } : best;
    }, { name: '', gpa: 0 });
  };

  const getTotalUnits = () => {
    return tables.reduce((sum, table) => 
      sum + table.data.reduce((s, row) => s + parseFloat(row[1] || 0), 0)
    , 0);
  };

  const gpaData = {
    labels: tables.map(table => table.name || []),
    datasets: [{
      label: 'GPA',
      data: tables.map(table => calculateTableGPA(table)),
      borderColor: '#3b82f6',
      tension: 0.1
    }]
  };

  const gradeData = {
    labels: ['A', 'B', 'C', 'D', 'F'],
    datasets: [{
      data: Object.values(getGradeDistribution()),
      backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#6b7280']
    }]
  };

  const unitsData = {
    labels: tables.map(table => table.name),
    datasets: [{
      label: 'Credit Units',
      data: tables.map(table => 
        table.data.reduce((sum, row) => sum + parseFloat(row[1] || 0), 0)
      ),
      backgroundColor: '#3b82f6'
    }]
  };

  const bestSemester = getBestSemester();
  const totalUnits = getTotalUnits();
  const totalCourses = tables.reduce((sum, table) => sum + table.data.length, 0);
  const gradeDistribution = getGradeDistribution();

  return (
    <div className="w-[100vw] min-h-screen bg-[#111827]">
      <div className="pt-28 px-8 sm:px-12 md:px-[6vw]">
        <h1 className="text-4xl font-bold mb-8">
          Analytics Dashboard <span className="text-blue-600">{currentUser?.profileData?.firstName || 'User'}</span>
        </h1>

        {tables.length === 0 ? (
          <div className="text-center py-16 bg-black bg-opacity-50 rounded-lg">
            <h2 className="text-2xl font-bold text-gray-400">No data available</h2>
            <p className="text-gray-500 mt-2">Add some semesters to see your analytics</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-black bg-opacity-50 p-6 rounded-lg">
                <h3 className="text-gray-400 mb-2">Total Semesters</h3>
                <p className="text-2xl font-bold">{tables.length}</p>
              </div>
              <div className="bg-black bg-opacity-50 p-6 rounded-lg">
                <h3 className="text-gray-400 mb-2">Best Semester GPA</h3>
                <p className="text-2xl font-bold text-blue-600">
                  {bestSemester?.gpa || '0.00'}
                </p>
              </div>
              <div className="bg-black bg-opacity-50 p-6 rounded-lg">
                <h3 className="text-gray-400 mb-2">Total Units</h3>
                <p className="text-2xl font-bold text-green-500">{totalUnits}</p>
              </div>
              <div className="bg-black bg-opacity-50 p-6 rounded-lg">
                <h3 className="text-gray-400 mb-2">Total Courses</h3>
                <p className="text-2xl font-bold text-yellow-500">{totalCourses}</p>
              </div>
            </div>

            <div className="bg-black bg-opacity-50 p-6 rounded-lg mb-8">
              <h2 className="text-xl font-bold mb-6">GPA Trend</h2>
              <div className="h-[400px]">
                <Line data={gpaData} options={{ 
                  maintainAspectRatio: false,
                  scales: { y: { min: 0, max: 5 } }
                }} />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="bg-black bg-opacity-50 p-6 rounded-lg">
                <h2 className="text-xl font-bold mb-6">Grade Distribution</h2>
                <div className="h-[300px]">
                  <Pie data={gradeData} options={{ 
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'right' } }
                  }} />
                </div>
              </div>

              <div className="bg-black bg-opacity-50 p-6 rounded-lg">
                <h2 className="text-xl font-bold mb-6">Credit Units per Semester</h2>
                <div className="h-[300px]">
                  <Bar data={unitsData} options={{ 
                    maintainAspectRatio: false,
                    scales: { y: { beginAtZero: true } }
                  }} />
                </div>
              </div>
            </div>

            <div className="bg-black bg-opacity-50 p-6 rounded-lg mb-8">
              <h2 className="text-xl font-bold mb-6">Performance Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 bg-opacity-50 bg-blue-900 rounded-lg">
                  <h3 className="text-gray-300 mb-2">Best Performing Semester</h3>
                  <p className="text-xl font-bold">{bestSemester?.name || 'N/A'} ({bestSemester?.gpa || '0.00'})</p>
                </div>
                <div className="p-4 bg-opacity-50 bg-blue-900 rounded-lg">
                  <h3 className="text-gray-300 mb-2">Total A Grades</h3>
                  <p className="text-xl font-bold">{gradeDistribution.A} courses</p>
                </div>
                <div className="p-4 bg-opacity-50 bg-blue-900 rounded-lg">
                  <h3 className="text-gray-300 mb-2">Average Units/Semester</h3>
                  <p className="text-xl font-bold">
                    {tables.length ? (totalUnits / tables.length).toFixed(1) : '0'} units
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Analytics;