import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const Home = () => {
  const [tables, setTables] = useState([]);
  const [newTableName, setNewTableName] = useState("");
  const [deleteTableIndex, setDeleteTableIndex] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [userDetails, setUserDetails] = useState({});

  const { currentUser } = useAuth();

  //   useEffect(() => {
  //     if (currentUser) {
  //       console.log("Raw displayName:", currentUser.displayName);
  //       console.log("Full currentUser:", currentUser);
  //       console.log("Profile Data:", currentUser.profileData);
  //     }
  //   }, [currentUser]);

  const addTable = () => {
    if (newTableName.trim() === "") {
      alert("Please enter a table name");
      return;
    }
    setTables([
      ...tables,
      {
        name: newTableName,
        rows: 4,
        cols: 4,
        colNames: ["Course", "Course Unit", "Grade", "Score"],
        data: Array(1).fill(Array(4).fill("")),
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

  if (currentUser?.profileData) {
    const { firstName, lastName, course, educationLevel } =
      currentUser.profileData;
  }
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
          className="ml-2 p-2 bg-blue-500 text-white rounded"
        >
          Create Table
        </button>
      </div>

      {/* Tables Logic */}
      {tables.map((table, tableIndex) => (
        <div key={tableIndex} className="mt-8 bg-[#1f325e] p-4 rounded-md">
          <h2 className="text-2xl font-bold pl-2">{table.name}</h2>
          <button
            onClick={() => {
              setDeleteTableIndex(tableIndex);
              setShowConfirmModal(true);
            }}
            className="mt-2 ml-2 p-2 bg-red-500 text-white rounded"
          >
            Delete Table
          </button>
        </div>
      ))}

      {/* Confirmation Modal */}
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
