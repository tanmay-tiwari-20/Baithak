import { useUser } from "@clerk/nextjs";
import { useCall, useCallStateHooks } from "@stream-io/video-react-sdk";

export const useMeetingAccess = () => {
  const call = useCall();
  const { user } = useUser();
  const {
    useCallCreatedBy,
    useCallCustomData,
    useCallMembers,
  } = useCallStateHooks();
  const createdBy = useCallCreatedBy();
  const custom = useCallCustomData();
  const members = useCallMembers();
  const userId = user?.id;
  const isHost = !!userId && (createdBy?.id === userId || call?.isCreatedByMe);
  const isAdmitted = !!userId && (
    members.some((member) => member.user_id === userId) ||
    custom.admission_statuses?.[userId] === "approved"
  );
  const pendingRequests = Array.isArray(custom.pending_requests)
    ? custom.pending_requests as Array<{ user_id: string; name: string; requested_at: string }>
    : [];

  return {
    call,
    user,
    userId,
    isHost,
    isAdmitted,
    quickAccess: custom.quick_access === true,
    pendingRequests,
    custom,
    admissionStatus: userId ? custom.admission_statuses?.[userId] as string | undefined : undefined,
  };
};
