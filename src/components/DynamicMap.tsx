'use client';

import dynamic from 'next/dynamic';

const MapContent = dynamic(() => import('@/components/MapContent'), { ssr: false });

export default function DynamicMap({ countryId }: { countryId: string }) {
  return <MapContent countryId={countryId} />;
}