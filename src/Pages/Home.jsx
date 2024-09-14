import React, { useState } from 'react';

const Home = () => {
    const [tables, setTables] = useState([]);
    const [newTableName, setNewTableName] = useState('');

    const addTable = () => {
        if (newTableName.trim() === '') {
            alert('Please enter a table name');
            return;
        }
        setTables([...tables, { name: newTableName, rows: 1, cols: 4, colNames: Array(4).fill('Column'), data: Array(1).fill(Array(4).fill('')) }]);
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
                colNames: [...newTables[tableIndex].colNames, 'Column'],
                data: newTables[tableIndex].data.map(row => [...row, ''])
            };
            return newTables;
        });
    };

    const handleCellChange = (tableIndex, rowIndex, colIndex, value) => {
        setTables(prevTables => {
            const newTables = [...prevTables];
            newTables[tableIndex] = {
                ...newTables[tableIndex],
                data: newTables[tableIndex].data.map((row, rIdx) => 
                    rIdx === rowIndex ? row.map((cell, cIdx) => cIdx === colIndex ? value : cell) : row
                )
            };
            return newTables;
        });
    };

    const handleColNameChange = (tableIndex, colIndex, value) => {
        setTables(prevTables => {
            const newTables = [...prevTables];
            newTables[tableIndex] = {
                ...newTables[tableIndex],
                colNames: newTables[tableIndex].colNames.map((colName, cIdx) => cIdx === colIndex ? value : colName)
            };
            return newTables;
        });
    };

    return (
        <div className="w-[100vw] m-8 sm:m-12 md:m-20">
            <h1 className='text-4xl font-bold mb-8'>Welcome John,</h1>
            <div className="mt-4">
                <input
                    type="text"
                    value={newTableName}
                    onChange={(e) => setNewTableName(e.target.value)}
                    placeholder="Enter table name"
                    className="p-2 border border-gray-300 rounded bg-[#111827]"
                />
                <button onClick={addTable} className="ml-2 p-2 bg-blue-500 text-white rounded">Create Table</button>
            </div>
            {tables.map((table, tableIndex) => (
                <div key={tableIndex} className="mt-8">
                    <h2 className="text-2xl font-bold">{table.name}</h2>
                    <table className="w-full mt-4 border-collapse">
                    <thead>
    <tr>
        <th className="border p-2">Course</th>
        <th className="border p-2">Course Unit</th>
        <th className="border p-2">Other</th>
        <th className="border p-2">Grade</th>
    </tr>
</thead>
<tbody>
    {table.data.map((row, rowIndex) => (
        <tr key={rowIndex}>
            {row.map((cell, colIndex) => (
                <td key={colIndex} className="border p-2">
                    <input
                        type="text"
                        value={cell}
                        onChange={(e) => handleCellChange(tableIndex, rowIndex, colIndex, e.target.value)}
                        className="w-full p-1 border border-gray-300 rounded"
                    />
                </td>
            ))}
        </tr>
    ))}
</tbody>
                    </table>
                    <button onClick={() => addRow(tableIndex)} className="mt-2 p-2 bg-green-500 text-white rounded">Add Row</button>
                    <button onClick={() => addColumn(tableIndex)} className="mt-2 ml-2 p-2 bg-green-500 text-white rounded">Add Column</button>
                </div>
            ))}
        </div>
    );
};

export default Home;