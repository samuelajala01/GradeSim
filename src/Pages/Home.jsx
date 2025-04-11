import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { Trash2 } from "lucide-react";
import debounce from "lodash/debounce";

const STORAGE_KEY = "cgpaCalculatorTables";

const Home = () => {
  const [tables, setTables] = useState(() => {
    try {
      const savedTables = localStorage.getItem(STORAGE_KEY);
      return savedTables ? JSON.parse(savedTables) : [];
    } catch (error) {
      console.error("Error loading initial data:", error);
      return [];
    }
  });

  const [newTableName, setNewTableName] = useState("");
  const [deleteTableIndex, setDeleteTableIndex] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const { currentUser } = useAuth();

  // Debounced save function
  const debouncedSave = useCallback(
    debounce((data) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        setHasUnsavedChanges(false);
      } catch (error) {
        console.error("Error saving to localStorage:", error);
      }
    }, 1000),
    []
  );

  // Save data in specific situations
  const saveData = useCallback(
    (data) => {
      setHasUnsavedChanges(true);
      debouncedSave(data);
    },
    [debouncedSave]
  );

  // Save before user leaves/refreshes page
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tables));
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [tables, hasUnsavedChanges]);

  const addTable = () => {
    if (newTableName.trim() === "") {
      alert("Please enter a table name");
      return;
    }
    const initialData = [["", "", "", ""]];

    const newTables = [
      ...tables,
      {
        name: newTableName,
        rows: 4,
        cols: 4,
        colNames: ["Course", "Course Unit", "Grade", "Score"],
        data: initialData,
      },
    ];

    setTables(newTables);
    saveData(newTables);
    setNewTableName("");
  };

  const deleteTable = () => {
    const newTables = tables.filter((_, index) => index !== deleteTableIndex);
    setTables(newTables);
    saveData(newTables);
    setShowConfirmModal(false);
    setDeleteTableIndex(null);
  };

  const isRowComplete = (row) => {
    return (
      row[0] &&
      row[1] &&
      row[2] &&
      !isNaN(parseFloat(row[1])) &&
      !isNaN(parseFloat(row[2]))
    );
  };

  const handleCellChange = (tableIndex, rowIndex, colIndex, value) => {
    if ((colIndex === 1 || colIndex === 2) && value !== "") {
      const numValue = parseFloat(value);
      if (isNaN(numValue)) return;
    }

    setTables((prevTables) => {
      const newTables = [...prevTables];
      const newData = [...newTables[tableIndex].data];
      newData[rowIndex] = [...newData[rowIndex]];
      newData[rowIndex][colIndex] = value;

      if (colIndex === 1 || colIndex === 2) {
        const unit = newData[rowIndex][1];
        const grade = newData[rowIndex][2];
        if (unit && grade) {
          const score = Math.round(
            parseFloat(unit) * parseFloat(grade)
          ).toString();
          newData[rowIndex][3] = score;
        } else {
          newData[rowIndex][3] = "";
        }
      }

      newTables[tableIndex] = {
        ...newTables[tableIndex],
        data: newData,
      };

      if (isRowComplete(newData[rowIndex])) {
        saveData(newTables);
      }

      return newTables;
    });
  };

  const addRow = (tableIndex) => {
    const newTables = [...tables];
    const newData = [...newTables[tableIndex].data];
    newData.push(["", "", "", ""]);
    newTables[tableIndex] = {
      ...newTables[tableIndex],
      data: newData,
    };
    setTables(newTables);
  };

  const deleteRow = (tableIndex, rowIndex) => {
    const newTables = [...tables];
    const newData = [...newTables[tableIndex].data];
    newData.splice(rowIndex, 1);

    if (newData.length === 0) {
      const filteredTables = tables.filter((_, index) => index !== tableIndex);
      setTables(filteredTables);
      saveData(filteredTables);
      return;
    }

    newTables[tableIndex] = {
      ...newTables[tableIndex],
      data: newData,
    };
    setTables(newTables);
    saveData(newTables);
  };

  const calculateTotalGrade = (table) => {
    let totalScore = 0;
    let totalUnits = 0;

    table.data.forEach((row) => {
      if (row[1] && row[2]) {
        totalScore += parseFloat(row[3] || 0);
        totalUnits += parseFloat(row[1] || 0);
      }
    });

    return totalUnits
      ? (totalScore / totalUnits).toFixed(2).toString()
      : "0.00";
  };

  const calculateCGPA = () => {
    let totalScoreAllTables = 0;
    let totalUnitsAllTables = 0;

    tables.forEach((table) => {
      table.data.forEach((row) => {
        if (row[1] && row[2]) {
          totalScoreAllTables += parseFloat(row[3] || 0);
          totalUnitsAllTables += parseFloat(row[1] || 0);
        }
      });
    });

    return totalUnitsAllTables
      ? (totalScoreAllTables / totalUnitsAllTables).toFixed(2).toString()
      : "0.00";
  };

  const calculateTotalUnits = () => {
    let totalUnits = 0;

    tables.forEach((table) => {
      table.data.forEach((row) => {
        if (row[1]) {
          totalUnits += parseFloat(row[1]) || 0;
        }
      });
    });

    return totalUnits;
  };

  const calculateTotalScore = () => {
    let totalScore = 0;

    tables.forEach((table) => {
      table.data.forEach((row) => {
        if (row[3]) {
          totalScore += parseFloat(row[3]) || 0;
        }
      });
    });

    return totalScore;
  };

  return (
    <div className="w-[100vw] mt-28 m-8 sm:m-16 md:m-[8vw]">
      <h1 className="text-4xl font-bold mb-8">
        Welcome{" "}
        <span className="text-blue-600">
          {currentUser?.profileData?.firstName}
        </span>
        👋🏽
      </h1>

      <div className="mt-4 mb-16">
        <input
          type="text"
          value={newTableName}
          onChange={(e) => setNewTableName(e.target.value)}
          placeholder="Enter semester name"
          className="p-2 border border-gray-300 rounded bg-[#111827]"
        />
        <button
          onClick={addTable}
          className="ml-2 p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Create table
        </button>
      </div>

      <p className="text-2xl font-bold mb-8">
        CGPA: <span className="text-blue-600">{calculateCGPA()}</span> | Total
        Units: <span className="text-blue-600">{calculateTotalUnits()}</span> | 
        Total Score:{" "}
        <span className="text-blue-600">{calculateTotalScore()}</span>
      </p>

      {tables.length === 0 ? (
        <p className="text-gray-400 text-center py-16">
          No semesters created yet. Create a new semester to begin.
        </p>
      ) : (
        tables.map((table, tableIndex) => (
          <div
            key={tableIndex}
            className="mt-8 bg-black bg-opacity-[0.5] p-8 rounded-sm"
          >
            <h2 className="text-2xl font-bold pl-2 mb-4">{table.name}</h2>

            <div className="overflow-x-auto rounded-sm">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border border-white p-3 text-left bg-blue-600 font-bold">
                      S/N
                    </th>
                    {table.colNames.map((colName, colIndex) => (
                      <th
                        key={colIndex}
                        className="border border-white p-3 text-left bg-blue-600 font-bold"
                      >
                        {colName}
                      </th>
                    ))}
                    <th className="border border-white p-3 text-left bg-blue-600 font-bold">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {table.data.map((row, rowIndex) => (
                    <tr
                      key={rowIndex}
                      className="hover:bg-[#233156] transition-colors"
                    >
                      <td className="border border-white p-2 text-center">
                        {rowIndex + 1}
                      </td>
                      {row.map((cell, colIndex) => (
                        <td key={colIndex} className="border border-white p-2">
                          <input
                            type={
                              colIndex === 1 || colIndex === 2
                                ? "number"
                                : "text"
                            }
                            value={cell}
                            onChange={(e) =>
                              handleCellChange(
                                tableIndex,
                                rowIndex,
                                colIndex,
                                e.target.value
                              )
                            }
                            className={`w-full bg-transparent outline-none px-2 py-1 rounded focus:ring-2 focus:ring-blue-500 transition-all
                              ${
                                colIndex === 1 || colIndex === 2
                                  ? "text-center font-mono tracking-wider"
                                  : ""
                              }
                              ${
                                colIndex === 3
                                  ? "text-yellow-400 font-semibold"
                                  : ""
                              }`}
                            disabled={colIndex === 3}
                            min={
                              colIndex === 1 || colIndex === 2 ? "0" : undefined
                            }
                            step={colIndex === 2 ? "0.1" : "1"}
                            placeholder={
                              colIndex === 0
                                ? "Enter course name"
                                : colIndex === 1
                                ? "Units"
                                : colIndex === 2
                                ? "Grade"
                                : ""
                            }
                          />
                        </td>
                      ))}
                      <td className="border border-white p-2 text-center">
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

            <div className="mt-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => addRow(tableIndex)}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                >
                  Add Course
                </button>
                <button
                  onClick={() => {
                    setDeleteTableIndex(tableIndex);
                    setShowConfirmModal(true);
                  }}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                >
                  Delete table
                </button>
              </div>
              <div className="px-4 py-2 bg-blue-600 rounded-lg">
                <span className="font-bold">GPA: </span>
                <span className="text-lg">{calculateTotalGrade(table)}</span>
              </div>
            </div>
          </div>
        ))
      )}

      {showConfirmModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-[#111827] p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Confirm Deletion</h3>
            <p className="text-red-500">
              Are you sure you want to delete this table? This action cannot be
              undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={deleteTable}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {hasUnsavedChanges && (
        <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-md opacity-75 transition-opacity">
          Saving...
        </div>
      )}
    </div>
  );
};

export default Home;
