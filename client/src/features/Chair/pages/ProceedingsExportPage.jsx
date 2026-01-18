import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import Button from "../../../components/Button";
import { useProceedingStore } from "../../../app/store/useProceedingStore";

export default function ProceedingsExportPage() {
  const { conferenceId } = useParams();
  const { isLoading, error, exportData, exportProceedings, downloadProceedingsJson } =
    useProceedingStore();

  const confIdNum = useMemo(() => Number(conferenceId), [conferenceId]);

  useEffect(() => {
    if (!confIdNum) return;
    exportProceedings(confIdNum).catch(() => {});
  }, [confIdNum, exportProceedings]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Export Proceedings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Xuất danh sách bài accepted + camera-ready + schedule (JSON)
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-between">
        <div className="text-sm text-gray-700">
          {exportData?.conference?.name ? (
            <div>
              <div className="font-semibold">{exportData.conference.name}</div>
              <div className="text-gray-500">
                Papers: <span className="font-medium">{exportData.count ?? 0}</span>
              </div>
            </div>
          ) : (
            <div>Conference #{confIdNum}</div>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => exportProceedings(confIdNum)}
            disabled={isLoading}
            className="!w-auto"
          >
            Refresh
          </Button>
          <Button
            onClick={() => downloadProceedingsJson(confIdNum)}
            disabled={isLoading}
            className="!w-auto"
          >
            Download JSON
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="text-sm font-semibold mb-2">Preview</div>
        <pre className="text-xs bg-gray-50 border rounded p-3 overflow-auto max-h-[520px]">
          {exportData ? JSON.stringify(exportData, null, 2) : "No data"}
        </pre>
      </div>
    </div>
  );
}

