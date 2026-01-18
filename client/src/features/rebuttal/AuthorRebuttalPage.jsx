import { useParams } from "react-router-dom";
import AuthorRebuttalForm from "./AuthorRebuttalForm";

export default function AuthorRebuttalPage() {
  const { submissionId } = useParams();
  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gửi Rebuttal</h1>
        <p className="mt-1 text-sm text-gray-500">Submission #{submissionId}</p>
      </div>
      <AuthorRebuttalForm paperId={Number(submissionId)} />
    </div>
  );
}

