import React, { useState } from 'react';

const Home = () => {
    const [tables, setTables] = useState([]);
    const [newTableName, setNewTableName] = useState('');
    const [deleteTableIndex, setDeleteTableIndex] = useState(null); // Track which table to delete
    const [showConfirmModal, setShowConfirmModal] = useState(false); // Show modal

    const addTable = () => {
        if (newTableName.trim() === '') {
            alert('Please enter a table name');
            return;
        }
        setTables([...tables, { 
            name: newTableName, 
            rows: 4, 
            cols: 4, 
            colNames: ['Course', 'Course Unit', 'Grade', 'Score'], 
            data: Array(1).fill(Array(4).fill('')) 
        }]);
        setNewTableName('');
    };

    const addRow = (tableIndex) => {
        setTables(prevTables => {
            const newTables = [...prevTables];
            newTables[tableIndex] = {
                ...newTables[tableIndex],
                rows: newTables[tableIndex].rows + 1,
                data: [...newTables[tableIndex].data, Array(newTables[tableIndex].cols).fill('')]
            };
            return newTables;
        });
    };

    // const addColumn = (tableIndex) => {
    //     setTables(prevTables => {
    //         const newTables = [...prevTables];
    //         newTables[tableIndex] = {
    //             ...newTables[tableIndex],
    //             cols: newTables[tableIndex].cols + 1,
    //             colNames: [...newTables[tableIndex].colNames, `New Column ${newTables[tableIndex].cols - 3}`],
    //             data: newTables[tableIndex].data.map(row => [...row, ''])
    //         };
    //         return newTables;
    //     });
    // };

    const deleteRow = (tableIndex, rowIndex) => {
        setTables(prevTables => {
            const newTables = [...prevTables];
            newTables[tableIndex] = {
                ...newTables[tableIndex],
                rows: newTables[tableIndex].rows - 1,
                data: newTables[tableIndex].data.filter((_, idx) => idx !== rowIndex)
            };
    
            // If no rows remain after deletion, delete the table
            if (newTables[tableIndex].data.length === 0) {
                return newTables.filter((_, index) => index !== tableIndex);
            }
    
            return newTables;
        });
    };
    

    const deleteTable = () => {
        setTables(prevTables => {
            return prevTables.filter((_, index) => index !== deleteTableIndex);
        });
        setShowConfirmModal(false);
        setDeleteTableIndex(null);
    };

    const handleCellChange = (tableIndex, rowIndex, colIndex, value) => {
        setTables(prevTables => {
            const newTables = [...prevTables];
            const newData = newTables[tableIndex].data.map((row, rIdx) => {
                if (rIdx === rowIndex) {
                    const newRow = [...row];
                    newRow[colIndex] = value;

                    // Update Score column based on Course Unit and Grade
                    if (colIndex === 1 || colIndex === 2) {
                        const unit = parseFloat(newRow[1]) || 0;
                        const grade = parseFloat(newRow[2]) || 0;
                        newRow[3] = (unit * grade).toString(); // Update Score column
                    }

                    return newRow;
                }
                return row;
            });

            newTables[tableIndex] = {
                ...newTables[tableIndex],
                data: newData
            };

            return newTables;
        });
    };

    const calculateTotals = (table) => {
        const totalUnits = table.data.reduce((sum, row) => sum + (parseFloat(row[1]) || 0), 0);
        const totalGrades = table.data.reduce((sum, row) => sum + (parseFloat(row[2]) || 0), 0);
        const totalScore = table.data.reduce((sum, row) => sum + (parseFloat(row[3]) || 0), 0);
        return { totalUnits, totalGrades, totalScore };
    };

    return (
        <div className="w-[100vw] m-8 sm:m-12 md:m-20">
            <h1 className='text-4xl font-bold mb-8'>Welcome John,</h1>
            <div className="mt-4 mb-8">
                <input
                    type="text"
                    value={newTableName}
                    onChange={(e) => setNewTableName(e.target.value)}
                    placeholder="Enter table name"
                    className="p-2 border border-gray-300 rounded bg-[#111827]"
                />
                <button onClick={addTable} className="ml-2 p-2 bg-blue-500 text-white rounded">Create Table</button>
            </div>
            {tables.map((table, tableIndex) => {
                const { totalUnits, totalGrades, totalScore } = calculateTotals(table);
                return (
                    <div key={tableIndex} className="mt-8 bg-[#1f325e] p-4 rounded-md">
                        <h2 className="text-2xl font-bold pl-2">{table.name}</h2>
                        
                        <table className="w-full mt-4 border-collapse mb-8">
                            <thead>
                                <tr>
                                    {table.colNames.map((colName, colIndex) => (
                                        <th key={colIndex} className="border p-2">{colName}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {table.data.map((row, rowIndex) => (
                                    <tr key={rowIndex}>
                                        {row.map((cell, colIndex) => (
                                            <td key={colIndex} className="border p-2">
                                                {colIndex === 3 ? (
                                                    <input
                                                        type="text"
                                                        value={cell}
                                                        readOnly
                                                        className="w-full p-1 border border-gray-300 rounded text-center" 
                                                    />
                                                ) : (
                                                    <input
                                                        type="text"
                                                        value={cell}
                                                        onChange={(e) => handleCellChange(tableIndex, rowIndex, colIndex, e.target.value)}
                                                        className="w-full p-1 border border-gray-300 rounded text-center"
                                                    />
                                                )}
                                            </td>
                                        ))}
                                        <td>
                                            <button
                                                onClick={() => deleteRow(tableIndex, rowIndex)}
                                                className="p-1 bg-red-500 text-white rounded"
                                            >
                                                X
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                <tr className='text-center'>
                                    <td className="border p-2 font-bold">Total: </td>
                                    <td className="border p-2 font-bold">{totalUnits}</td>
                                    <td className="border p-2 font-bold">{totalGrades}</td>
                                    <td className="border p-2 font-bold">{totalScore}</td>
                                </tr>
                            </tbody>
                        </table>
                        <button onClick={() => addRow(tableIndex)} className="mt-2 p-2 bg-green-500 text-white rounded">Add Row</button>
                        {/* <button onClick={() => addColumn(tableIndex)} className="mt-2 ml-2 p-2 bg-green-500 text-white rounded">Add Column</button> */}
                        <button 
                            onClick={() => { setDeleteTableIndex(tableIndex); setShowConfirmModal(true); }} 
                            className="mt-2 ml-2 p-2 bg-red-500 text-white rounded"
                        >
                            Delete Table
                        </button>
                    </div>
                );
            })}

            {/* Confirmation Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-[#111827] p-4 rounded shadow-lg w-1/3">
                        <h3 className="text-lg font-bold mb-4 tr">Confirm Deletion</h3>
                        <p className='text-red-500'>Are you sure you want to delete this table? This action cannot be undone.</p>
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
