import axios from "../../lib/axios";

export default function DecisionAction({ paperId }) {
  const decide = (decision) => {
    axios.post(`/chair/decision/${paperId}`, { decision })
      .then(() => alert("Decision saved"))
      .catch(err => console.error(err));
  };

  return (
    <div className="flex gap-2 justify-center">
      <button
        onClick={() => decide("ACCEPT")}
        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
      >
        Accept
      </button>

      <button
        onClick={() => decide("REJECT")}
        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
      >
        Reject
      </button>
    </div>
  );
}
