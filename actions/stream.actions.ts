"use server";

import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { StreamClient, type CallSettingsRequest } from "@stream-io/node-sdk";
import { createMeetingCode } from "@/lib/meeting-code";

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
const apiSecret = process.env.STREAM_SECRET_KEY;
const BAITHAK_CALL_TYPE = "baithak";
type MeetingCallType = "baithak" | "default";

const createStreamClient = () => {
  if (!apiKey || !apiSecret) throw new Error("Stream credentials are not configured");
  return new StreamClient(apiKey, apiSecret);
};

const isValidPersonalRoomCode = (value: unknown): value is string =>
  typeof value === "string" && /^[a-z0-9]{3}-[a-z0-9]{4}-[a-z0-9]{3}$/i.test(value);

export const getOrCreatePersonalRoomCode = async () => {
  const user = await currentUser();
  if (!user) throw new Error("You must be signed in to access your personal room");

  const clerk = await clerkClient();
  const clerkUser = await clerk.users.getUser(user.id);
  const savedCode = clerkUser.privateMetadata.personalRoomCode;
  if (isValidPersonalRoomCode(savedCode)) return savedCode;

  const roomCode = createMeetingCode();
  await clerk.users.updateUserMetadata(user.id, {
    privateMetadata: {
      ...clerkUser.privateMetadata,
      personalRoomCode: roomCode,
    },
  });
  return roomCode;
};

export const tokenProvider = async () => {
  const user = await currentUser();
  if (!user) throw new Error("User is not logged in");

  const client = createStreamClient();
  const exp = Math.round(Date.now() / 1000) + 60 * 60;
  const issued = Math.floor(Date.now() / 1000) - 60;
  return client.createToken(user.id, exp, issued);
};

/**
 * A dedicated call type makes the admission policy specific to Baithak. Users
 * can inspect a room and send a join request, while only admitted call members
 * receive the `join-call` capability.
 */
export const ensureBaithakCallType = async () => {
  const user = await currentUser();
  if (!user) throw new Error("You must be signed in to create a meeting");

  const client = createStreamClient();
  const { call_types: callTypes } = await client.video.listCallTypes();
  const defaults = callTypes.default;
  if (!defaults) throw new Error("The default Stream call type is unavailable");

  const grants = Object.fromEntries(
    Object.entries(defaults.grants).map(([role, capabilities]) => [
      role,
      [...capabilities],
    ]),
  );
  grants.user = (grants.user || []).filter((capability) => capability !== "join-call");
  grants.call_member = Array.from(
    new Set([
      ...(grants.user || []),
      ...(grants.call_member || []),
      "join-call",
    ]),
  );

  // Stream returns RTMP quality as an arbitrary string, while its request type
  // only accepts a fixed set of values. Keep supported settings and normalize
  // any unexpected server value before sending the defaults back.
  const supportedRtmpQualities = [
    "360p",
    "480p",
    "720p",
    "1080p",
    "1440p",
    "portrait-360x640",
    "portrait-480x854",
    "portrait-720x1280",
    "portrait-1080x1920",
    "portrait-1440x2560",
  ] as const;
  const returnedQuality = defaults.settings.broadcasting.rtmp.quality;
  const rtmpQuality = supportedRtmpQualities.find((quality) => quality === returnedQuality) || "720p";
  const settings = {
    ...defaults.settings,
    broadcasting: {
      ...defaults.settings.broadcasting,
      rtmp: {
        ...defaults.settings.broadcasting.rtmp,
        quality: rtmpQuality,
      },
    },
  } satisfies CallSettingsRequest;

  if (callTypes[BAITHAK_CALL_TYPE]) {
    await client.video.updateCallType({
      name: BAITHAK_CALL_TYPE,
      grants,
      settings,
    });
  } else {
    try {
      await client.video.createCallType({
        name: BAITHAK_CALL_TYPE,
        grants,
        settings,
      });
    } catch (error) {
      // Another request may have created the type at the same time.
      const { call_types: currentTypes } = await client.video.listCallTypes();
      if (!currentTypes[BAITHAK_CALL_TYPE]) throw error;
      await client.video.updateCallType({
        name: BAITHAK_CALL_TYPE,
        grants,
        settings,
      });
    }
  }
};

type AdmissionRequest = {
  user_id: string;
  name: string;
  requested_at: string;
};

const getMeetingCall = async (meetingId: string, callType: MeetingCallType = BAITHAK_CALL_TYPE) => {
  if (!/^[a-zA-Z0-9_-]{1,64}$/.test(meetingId)) {
    throw new Error("Invalid meeting code");
  }
  const client = createStreamClient();
  return client.video.call(callType, meetingId);
};

const getCurrentUserName = (user: NonNullable<Awaited<ReturnType<typeof currentUser>>>) => {
  const emailName = user.emailAddresses[0]?.emailAddress.split("@")[0];
  return (
    user.fullName ||
    user.username ||
    [user.firstName, user.lastName].filter(Boolean).join(" ") ||
    emailName ||
    `Participant ${user.id.slice(-4)}`
  );
};

export const requestMeetingAdmission = async (
  meetingId: string,
  callType: MeetingCallType = BAITHAK_CALL_TYPE,
) => {
  const user = await currentUser();
  if (!user) throw new Error("Please sign in before requesting to join");

  const call = await getMeetingCall(meetingId, callType);
  const { call: room, members } = await call.get({ members_limit: 100 });
  if (room.created_by.id === user.id || members.some((member) => member.user_id === user.id)) {
    return { status: "admitted" as const };
  }

  const custom = room.custom || {};
  if (custom.quick_access === true) {
    await call.updateCallMembers({
      update_members: [{ user_id: user.id, role: "call_member" }],
    });
    const admissionStatuses = { ...(custom.admission_statuses || {}), [user.id]: "approved" };
    await call.update({
      custom: {
        ...custom,
        pending_requests: (Array.isArray(custom.pending_requests) ? custom.pending_requests : []).filter(
          (request: AdmissionRequest) => request.user_id !== user.id,
        ),
        admission_statuses: admissionStatuses,
      },
    });
    return { status: "admitted" as const };
  }

  const requests: AdmissionRequest[] = Array.isArray(custom.pending_requests)
    ? custom.pending_requests
    : [];
  const pendingRequests = [
    ...requests.filter((request) => request.user_id !== user.id),
    {
      user_id: user.id,
      name: getCurrentUserName(user),
      requested_at: new Date().toISOString(),
    },
  ];
  const admissionStatuses = { ...(custom.admission_statuses || {}) };
  delete admissionStatuses[user.id];

  await call.update({
    custom: {
      ...custom,
      pending_requests: pendingRequests,
      admission_statuses: admissionStatuses,
    },
  });
  return { status: "waiting" as const };
};

export const respondToMeetingAdmission = async (
  meetingId: string,
  userId: string,
  approved: boolean,
  callType: MeetingCallType = BAITHAK_CALL_TYPE,
) => {
  const user = await currentUser();
  if (!user) throw new Error("Please sign in to manage this meeting");

  const call = await getMeetingCall(meetingId, callType);
  const { call: room } = await call.get();
  if (room.created_by.id !== user.id) throw new Error("Only the meeting host can admit guests");

  const custom = room.custom || {};
  const requests: AdmissionRequest[] = Array.isArray(custom.pending_requests)
    ? custom.pending_requests
    : [];
  if (!requests.some((request) => request.user_id === userId)) return;

  if (approved) {
    await call.updateCallMembers({
      update_members: [{ user_id: userId, role: "call_member" }],
    });
  }

  const admissionStatuses = { ...(custom.admission_statuses || {}), [userId]: approved ? "approved" : "denied" };
  await call.update({
    custom: {
      ...custom,
      pending_requests: requests.filter((request) => request.user_id !== userId),
      admission_statuses: admissionStatuses,
    },
  });
};

export const setMeetingQuickAccess = async (
  meetingId: string,
  isOpen: boolean,
  callType: MeetingCallType = BAITHAK_CALL_TYPE,
) => {
  const user = await currentUser();
  if (!user) throw new Error("Please sign in to manage this meeting");

  const call = await getMeetingCall(meetingId, callType);
  const { call: room } = await call.get();
  if (room.created_by.id !== user.id) throw new Error("Only the meeting host can change access");

  await call.update({
    custom: {
      ...(room.custom || {}),
      quick_access: isOpen,
    },
  });
};
