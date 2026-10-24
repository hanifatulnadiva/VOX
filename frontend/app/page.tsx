import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white">
      <div className="max-w-xl text-center space-y-6">
        <span className="px-3 py-1 text-xs font-semibold bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-500/30">
          Monad Testnet Secured
        </span>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          Pemilihan Ketua BEM - VOX
        </h1>
        <p className="text-slate-300 text-base sm:text-lg">
          Sistem e-voting transparan, aman, dan terdesentralisasi menggunakan teknologi blockchain.
        </p>
        <div className="pt-4">
          <Link
            href="/vote"
            className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 py-3.5 rounded-xl shadow-lg transition-all duration-200 hover:shadow-indigo-500/25"
          >
            Mulai Voting Sekarang
          </Link>
        </div>
      </div>
    </main>
  );
}