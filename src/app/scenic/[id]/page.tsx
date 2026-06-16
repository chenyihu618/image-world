import Navbar from "@/components/Navbar";
import { notFound } from "next/navigation";
import ClientScenicPage from "./client";
import { getScenicSpot } from "@/lib/db";

interface Props { params: Promise<{ id: string }>; }

export default async function ScenicSpotPage({ params }: Props) {
  const { id } = await params;
  const spot = await getScenicSpot(id);
  if (!spot) { notFound(); }
  return <ClientScenicPage spot={spot} />;
}