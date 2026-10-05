"use client";
import { tokenProvider } from "@/actions/stream.actions";
import Loader from "@/components/Loader";
import { useUser } from "@clerk/nextjs";
import { StreamVideo, StreamVideoClient } from "@stream-io/video-react-sdk";
import { ReactNode, useEffect, useState } from "react";

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;

const StreamVideoProvider = ({ children }: { children: ReactNode }) => {
  const [videoClient, setVideoClient] = useState<StreamVideoClient>();
  const { user, isLoaded } = useUser();
  const userId = user?.id;
  const emailName = user?.emailAddresses[0]?.emailAddress.split("@")[0];
  const displayName = user
    ? user.fullName ||
      user.username ||
      [user.firstName, user.lastName].filter(Boolean).join(" ") ||
      emailName ||
      `Participant ${user.id.slice(-4)}`
    : "";

  useEffect(() => {
    if (!isLoaded || !userId) return;
    if (!apiKey) {
      console.error("Stream API key missing");
      return;
    }
    const client = new StreamVideoClient({
      apiKey,
      user: {
        id: userId,
        name: displayName,
        image: user?.imageUrl,
      },
      tokenProvider,
    });

    setVideoClient(client);
    return () => {
      setVideoClient((current) => current === client ? undefined : current);
      void client.disconnectUser().catch((error) => {
        console.error("Failed to disconnect the video client", error);
      });
    };
  }, [userId, displayName, user?.imageUrl, isLoaded]);

  if (!isLoaded || !videoClient) return <Loader />;

  return <StreamVideo client={videoClient}>{children}</StreamVideo>;
};

export default StreamVideoProvider;
