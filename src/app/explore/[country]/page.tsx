import Navbar from "@/components/Navbar";
import DynamicMap from "@/components/DynamicMap";

interface Props {
  params: Promise<{ country: string }>;
}

export default async function ExploreCountry({ params }: Props) {
  const { country } = await params;
  return (
    <main className="h-screen w-full relative">
      <Navbar title="探索" transparent />
      <DynamicMap countryId={country} />
    </main>
  );
}