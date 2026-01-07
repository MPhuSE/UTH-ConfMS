// src/components/SubmissionForm.jsx
export default function SubmissionForm({ data, setData, disabled }) {
  return (
    <div className="space-y-4">
      <input
        className="border p-2 rounded w-full"
        placeholder="Paper Title"
        value={data.title}
        disabled={disabled}
        onChange={(e) =>
          setData({ ...data, title: e.target.value })
        }
      />

      <textarea
        className="border p-2 rounded w-full"
        placeholder="Abstract"
        rows={5}
        disabled={disabled}
        value={data.abstract}
        onChange={(e) =>
          setData({ ...data, abstract: e.target.value })
        }
      />
    </div>
  );
}
