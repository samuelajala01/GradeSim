import React, { useState } from 'react';

const Home = () => {
    const [tables, setTables] = useState([]);
    const [newTableName, setNewTableName] = useState('');

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

    const addColumn = (tableIndex) => {
        setTables(prevTables => {
            const newTables = [...prevTables];
            newTables[tableIndex] = {
                ...newTables[tableIndex],
                cols: newTables[tableIndex].cols + 1,
                colNames: [...newTables[tableIndex].colNames, 'New Column'],
                data: newTables[tableIndex].data.map(row => [...row, ''])
            };
            return newTables;
        });
    };

    const handleCellChange = (tableIndex, rowIndex, colIndex, value) => {
        setTables(prevTables => {
            const newTables = [...prevTables];
            const newData = newTables[tableIndex].data.map((row, rIdx) => {
                if (rIdx === rowIndex) {
                    const newRow = [...row];
                    newRow[colIndex] = value;

                    // If the column index is 1 (Course Unit) or 2 (Grade), update Score
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
                    <div key={tableIndex} className="mt-8">
                        <h2 className="text-2xl font-bold pl-2">{table.name}</h2>
                        <table className="w-full mt-4 border-collapse">
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
                        <button onClick={() => addColumn(tableIndex)} className="mt-2 ml-2 p-2 bg-green-500 text-white rounded">Add Column</button>
                    </div>
                );
            })}
        </div>
    );
};

export default Home;
