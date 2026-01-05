import { useEffect, useState } from "react";
import axios from "../../lib/axios";

export default function DecisionDashboard() {
  const [papers, setPapers] = useState([]);

  useEffect(() => {
    axios.get("/chair/review-summary")
      .then(res => setPapers(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Decision Dashboard</h2>

      <table className="w-full border rounded-lg">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3 border">Title</th>
            <th className="p-3 border">Avg Score</th>
            <th className="p-3 border">Reviews</th>
            <th className="p-3 border">Action</th>
          </tr>
        </thead>

        <tbody>
          {papers.map(paper => (
            <tr key={paper.id} className="hover:bg-gray-50">
              <td className="p-3 border">{paper.title}</td>
              <td className="p-3 border text-center">{paper.avgScore}</td>
              <td className="p-3 border text-center">{paper.reviewCount}</td>
              <td className="p-3 border text-center">
                <DecisionAction paperId={paper.id} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
