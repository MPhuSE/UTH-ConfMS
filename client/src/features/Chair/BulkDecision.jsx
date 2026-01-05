import { useState } from "react";
import axios from "../../lib/axios";

export default function BulkDecision({ selectedIds }) {
  const [decision, setDecision] = useState("");

  const submitBulk = () => {
    axios.post("/chair/bulk-decision", {
      paperIds: selectedIds,
      decision
    }).then(() => alert("Bulk decision done"));
  };

  return (
    <div className="flex items-center gap-3 mt-4">
      <select
        className="border p-2 rounded"
        value={decision}
        onChange={e => setDecision(e.target.value)}
      >
        <option value="">Select decision</option>
        <option value="ACCEPT">Accept</option>
        <option value="REJECT">Reject</option>
      </select>

      <button
        onClick={submitBulk}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Apply
      </button> 
    </div>
  );
}