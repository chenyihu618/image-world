import Navbar from "@/components/Navbar";
import { getScenicSpot } from "@/lib/data";
import { notFound } from "next/navigation";
import ClientScenicPage from "./client";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ScenicSpotPage({ params }: Props) {
  const { id } = await params;
  const spot = getScenicSpot(id);

  if (!spot) {
    notFound();
  }

  return <ClientScenicPage spot={spot} />;
}