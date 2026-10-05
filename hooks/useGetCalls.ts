import { useUser } from "@clerk/nextjs";
import { Call, useStreamVideoClient } from "@stream-io/video-react-sdk";
import { useEffect, useState } from "react";

export const useGetCalls = (externalRefreshKey = 0) => {
  const [calls, setCalls] = useState<Call[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const client = useStreamVideoClient();
  const { user } = useUser();

  useEffect(() => {
    let cancelled = false;
    const loadCalls = async () => {
      if (!client || !user?.id) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        const { calls: result } = await client.queryCalls({
          sort: [{ field: "starts_at", direction: -1 }],
          limit: 100,
          filter_conditions: {
            $or: [
              { created_by_user_id: user.id },
              { members: { $in: [user.id] } },
            ],
          },
        });

        if (!cancelled) setCalls(result);
      } catch (error) {
        console.error(error);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    void loadCalls();
    return () => {
      cancelled = true;
    };
  }, [client, user?.id, externalRefreshKey]);

  const now = new Date();

  const endedCalls = calls
    .filter(({ state: { endedAt } }: Call) => !!endedAt)
    .sort((a, b) => new Date(b.state.endedAt!).getTime() - new Date(a.state.endedAt!).getTime());
  const upcomingCalls = calls.filter(({ state: { startsAt, endedAt } }: Call) => {
    return startsAt && new Date(startsAt) > now && !endedAt;
  }).sort((a, b) => new Date(a.state.startsAt!).getTime() - new Date(b.state.startsAt!).getTime());

  return { endedCalls, upcomingCalls, callRecordings: calls, isLoading };
};
