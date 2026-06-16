import Link from "next/link";
import Navbar from "@/components/Navbar";
import { countries } from "@/lib/data";

export default function ExplorePage() {
  return (
    <main className="min-h-screen bg-[#0a0e1a] flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-lg">
          <h1 className="text-white/80 text-3xl font-light tracking-[0.2em] mb-3">
            选择探索区域
          </h1>
          <p className="text-white/40 text-sm mb-8">点击国家开始探索摄影作品</p>
          <div className="flex flex-wrap justify-center gap-4">
            {Object.values(countries).map((c) => (
              <Link
                key={c.id}
                href={`/explore/${c.id}`}
                className="group px-8 py-6 rounded-xl bg-white/[0.03] border border-white/10 hover:border-blue-400/30 hover:bg-white/[0.06] transition-all duration-300"
              >
                <p className="text-white/70 text-xl font-medium group-hover:text-white transition-colors">
                  {c.name}
                </p>
                <p className="text-white/30 text-xs mt-1">{c.nameEn}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
