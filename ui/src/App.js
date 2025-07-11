import React, { useState } from 'react';
import axios from 'axios';
import FlowChart from './components/Flocharts';

function App() {
  const [prompt, setPrompt] = useState('');
  const [treeData, setTreeData] = useState(null);

  const handleSubmit = async () => {
    try {
      const response = await axios.post('http://localhost:5000/generate-chart', { prompt });
      setTreeData(response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Land Inheritance Flowchart Generator</h1>
      <textarea
        className="w-full border p-2 mb-4"
        rows="5"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe how land was divided..."
      />
      <button onClick={handleSubmit} className="bg-blue-500 text-white px-4 py-2 rounded">
        Generate Flowchart
      </button>

      {treeData && <FlowChart treeData={treeData} />}
    </div>
  );
}

export default App;
