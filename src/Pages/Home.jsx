import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Trash2 } from "lucide-react";

const Home = () => {
  const [tables, setTables] = useState([]);
  const [newTableName, setNewTableName] = useState("");
  const [deleteTableIndex, setDeleteTableIndex] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const { currentUser } = useAuth();

  const addTable = () => {
    if (newTableName.trim() === "") {
      alert("Please enter a table name");
      return;
    }
    const initialData = [
      ["", "", "", ""]
    ];
    
    setTables([
      ...tables,
      {
        name: newTableName,
        rows: 4,
        cols: 4,
        colNames: ["Course", "Course Unit", "Grade", "Score"],
        data: initialData,
      },
    ]);
    setNewTableName("");
  };

  const deleteTable = () => {
    setTables((prevTables) => {
      return prevTables.filter((_, index) => index !== deleteTableIndex);
    });
    setShowConfirmModal(false);
    setDeleteTableIndex(null);
  };

  const handleCellChange = (tableIndex, rowIndex, colIndex, value) => {
    if ((colIndex === 1 || colIndex === 2) && value !== "") {
      const numValue = parseFloat(value);
      if (isNaN(numValue)) return;
    }

    setTables(prevTables => {
      const newTables = [...prevTables];
      const newData = [...newTables[tableIndex].data];
      newData[rowIndex] = [...newData[rowIndex]];
      newData[rowIndex][colIndex] = value;
      
      if (colIndex === 1 || colIndex === 2) {
        const unit = newData[rowIndex][1];
        const grade = newData[rowIndex][2];
        if (unit && grade) {
          const score = Math.round(parseFloat(unit) * parseFloat(grade)).toString(); // Removed decimal places
          newData[rowIndex][3] = score;
        } else {
          newData[rowIndex][3] = "";
        }
      }
      
      newTables[tableIndex] = {
        ...newTables[tableIndex],
        data: newData
      };
      return newTables;
    });
  };

  const addRow = (tableIndex) => {
    setTables(prevTables => {
      const newTables = [...prevTables];
      const newData = [...newTables[tableIndex].data];
      newData.push(["", "", "", ""]);
      newTables[tableIndex] = {
        ...newTables[tableIndex],
        data: newData
      };
      return newTables;
    });
  };

  const deleteRow = (tableIndex, rowIndex) => {
    setTables(prevTables => {
      const newTables = [...prevTables];
      const newData = [...newTables[tableIndex].data];
      newData.splice(rowIndex, 1);
      newTables[tableIndex] = {
        ...newTables[tableIndex],
        data: newData
      };
      return newTables;
    });
  };

  const calculateTotalGrade = (table) => {
    let totalScore = 0;
    let totalUnits = 0;
    
    table.data.forEach(row => {
      if (row[1] && row[2]) {
        totalScore += parseFloat(row[3] || 0);
        totalUnits += parseFloat(row[1] || 0);
      }
    });
    
    return totalUnits ? Math.round(totalScore / totalUnits).toString() : '0'; // Removed decimal places
  };

  return (
    <div className="w-[100vw] m-8 sm:m-12 md:m-20">
      <h1 className="text-4xl font-bold mb-8">
        Welcome {currentUser?.profileData?.firstName}!
      </h1>

      <div className="mt-4 mb-8">
        <input
          type="text"
          value={newTableName}
          onChange={(e) => setNewTableName(e.target.value)}
          placeholder="Enter table name"
          className="p-2 border border-gray-300 rounded bg-[#111827]"
        />
        <button
          onClick={addTable}
          className="ml-2 p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Create Table
        </button>
      </div>

      {tables.map((table, tableIndex) => (
        <div key={tableIndex} className="mt-8 bg-[#1f325e] p-4 rounded-md">
          <h2 className="text-2xl font-bold pl-2 mb-4">{table.name}</h2>

          <div className="overflow-x-auto rounded-lg">
            <table className="w-full border-collapse bg-[#1a2b4d]">
              <thead>
                <tr>
                  {table.colNames.map((colName, colIndex) => (
                    <th key={colIndex} className="border border-gray-600 p-3 text-left bg-[#284184] font-bold">
                      {colName}
                    </th>
                  ))}
                  <th className="border border-gray-600 p-3 text-left bg-[#284184] font-bold">Action</th>
                </tr>
              </thead>
              <tbody>
                {table.data.map((row, rowIndex) => (
                  <tr key={rowIndex} className="hover:bg-[#233156] transition-colors">
                    {row.map((cell, colIndex) => (
                      <td key={colIndex} className="border border-gray-600 p-2">
                        <input
                          type={colIndex === 1 || colIndex === 2 ? "number" : "text"}
                          value={cell}
                          onChange={(e) => handleCellChange(tableIndex, rowIndex, colIndex, e.target.value)}
                          className="w-full bg-transparent outline-none px-2 py-1"
                          disabled={colIndex === 3}
                          min={colIndex === 1 || colIndex === 2 ? "0" : undefined}
                          step="1"
                          placeholder={colIndex === 0 ? "Enter course name" : colIndex === 1 ? "Units" : colIndex === 2 ? "Grade" : ""}
                        />
                      </td>
                    ))}
                    <td className="border border-gray-600 p-2 text-center">
                      <button
                        onClick={() => deleteRow(tableIndex, rowIndex)}
                        className="p-1.5 text-red-400 hover:text-red-500 hover:bg-[#1f2937] rounded-full transition-colors"
                        title="Delete row"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => addRow(tableIndex)}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              >
                Add Row
              </button>
              <button
                onClick={() => {
                  setDeleteTableIndex(tableIndex);
                  setShowConfirmModal(true);
                }}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                Delete Table
              </button>
            </div>
            <div className="px-4 py-2 bg-[#284184] rounded-lg">
              <span className="font-bold">Total Grade: </span>
              <span className="text-lg">{calculateTotalGrade(table)}</span>
            </div>
          </div>
        </div>
      ))}

      {showConfirmModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-[#111827] p-4 rounded shadow-lg w-1/3">
            <h3 className="text-lg font-bold mb-4">Confirm Deletion</h3>
            <p className="text-red-500">
              Are you sure you want to delete this table? This action cannot be
              undone.
            </p>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 bg-gray-300 text-black rounded mr-2"
              >
                Cancel
              </button>
              <button
                onClick={deleteTable}
                className="px-4 py-2 bg-red-500 text-white rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;