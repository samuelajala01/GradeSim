import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload } from "lucide-react";

const PDFUploader = () => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [error, setError] = useState(null);

  const onDrop = useCallback((acceptedFiles) => {
    const pdfFiles = acceptedFiles.filter((file) => file.type === "application/pdf");

    if (pdfFiles.length === 0) {
      setError("Only PDF files are allowed.");
      return;
    }

    setUploadedFiles((prevFiles) => [...prevFiles, ...pdfFiles]);
    setError(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    multiple: true,
    maxFiles: 5,
  });

  return (
    <div className="mb-8">
      <div
        {...getRootProps()}
        className="border-2 border-dashed border-blue-500 p-6 rounded cursor-pointer text-center bg-[#1f2937] hover:bg-[#111827] transition-all"
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-2">
          <Upload size={32} className="text-blue-400" />
          {isDragActive ? (
            <p className="text-blue-300">Drop the PDF files here ...</p>
          ) : (
            <p className="text-white">Drag 'n' drop PDF files here, or click to select files</p>
          )}
        </div>
      </div>

      {error && <p className="text-red-500 mt-2">{error}</p>}

      {uploadedFiles.length > 0 && (
        <div className="mt-4">
          <h3 className="text-white font-bold mb-2">Uploaded Files:</h3>
          <ul className="list-disc list-inside text-gray-300">
            {uploadedFiles.map((file, index) => (
              <li key={index}>{file.name}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PDFUploader;
