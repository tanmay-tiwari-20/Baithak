import { Call, useStreamVideoClient } from "@stream-io/video-react-sdk";
import { useEffect, useState } from "react";

export const useGetCallById = (id: string | string[]) => {
  const [call, setCall] = useState<Call>();
  const [isCallLoading, setIsCallLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const client = useStreamVideoClient();

  useEffect(() => {
    if (!client || !id) return;
    let cancelled = false;
    let loadedCall: Call | undefined;
    setCall(undefined);
    setIsCallLoading(true);
    setLoadError(false);

    const loadCall = async () => {
      try {
        const { calls } = await client.queryCalls({
          filter_conditions: { id: Array.isArray(id) ? id[0] : id },
          limit: 10,
        });
        const meeting = calls.find((candidate) => candidate.type === "baithak") || calls[0];
        if (meeting) {
          await meeting.get();
          loadedCall = meeting;
        }
        if (cancelled) {
          if (loadedCall) await loadedCall.leave();
          return;
        }
        if (!cancelled) setCall(meeting);
      } catch (error) {
        console.error("Failed to load meeting", error);
        if (!cancelled) setLoadError(true);
      } finally {
        if (!cancelled) setIsCallLoading(false);
      }
    };

    void loadCall();
    return () => {
      cancelled = true;
      if (loadedCall) {
        void loadedCall.leave().catch((error) => {
          console.error("Failed to leave meeting", error);
        });
      }
    };
  }, [client, id]);

  return { call, isCallLoading, loadError };
};
