import React, { useState } from 'react';

const Home = () => {
    const [tables, setTables] = useState([]);
    const [newTableName, setNewTableName] = useState('');

    const addTable = () => {
        setTables([...tables, { name: newTableName, rows: 4, cols: 4, data: Array(4).fill(Array(4).fill('')) }]);
        setNewTableName('');
    };

    const addRow = (tableIndex) => {
        const newTables = [...tables];
        newTables[tableIndex].rows += 1;
        newTables[tableIndex].data.push(Array(newTables[tableIndex].cols).fill(''));
        setTables(newTables);
    };

    const addColumn = (tableIndex) => {
        const newTables = [...tables];
        newTables[tableIndex].cols += 1;
        newTables[tableIndex].data = newTables[tableIndex].data.map(row => [...row, '']);
        setTables(newTables);
    };

    const handleCellChange = (tableIndex, rowIndex, colIndex, value) => {
        const newTables = [...tables];
        newTables[tableIndex].data[rowIndex][colIndex] = value;
        setTables(newTables);
    };

    return (
        <div className="w-[100vw] m-8 sm:m-12 md:m-20">
            <h1 className='text-4xl font-bold'>Welcome John,</h1>
            <div className="mt-4">
                <input
                    type="text"
                    value={newTableName}
                    onChange={(e) => setNewTableName(e.target.value)}
                    placeholder="Enter table name"
                    className="p-2 border border-gray-300 rounded"
                />
                <button onClick={addTable} className="ml-2 p-2 bg-blue-500 text-white rounded">Add Table</button>
            </div>
            {tables.map((table, tableIndex) => (
                <div key={tableIndex} className="mt-8">
                    <h2 className="text-2xl font-bold">{table.name}</h2>
                    <table className="mt-4 w-full border-collapse border border-gray-300">
                        <thead>
                            <tr>
                                {Array.from({ length: table.cols }).map((_, colIndex) => (
                                    <th key={colIndex} className="border border-gray-300 p-2">Column {colIndex + 1}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {table.data.map((row, rowIndex) => (
                                <tr key={rowIndex}>
                                    {row.map((cell, colIndex) => (
                                        <td key={colIndex} className="border border-gray-300 p-2">
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
                    <button onClick={() => addRow(tableIndex)} className="mt-2 p-2 bg-blue-500 text-white rounded">Add Row</button>
                    <button onClick={() => addColumn(tableIndex)} className="mt-2 ml-2 p-2 bg-green-500 text-white rounded">Add Column</button>
                </div>
            ))}
        </div>
    );
}

export default Home;