export function NotFoundPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-20 text-center">
      <h1 className="text-4xl font-bold text-slate-950">Page not found</h1>
      <p className="mt-4 text-slate-600">The guide or page you requested is not available.</p>
      <a href="/" className="mt-6 inline-flex rounded-full bg-emerald-600 px-5 py-3 font-bold text-white">Go home</a>
    </main>
  );
}
