export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-indigo-400 to-indigo-600" />
        <div className="p-6">
          <div className="mb-6 text-center">
            <img
              src="/Logo_Trombone.svg"
              alt=""
              aria-hidden="true"
              width={56}
              height={56}
              className="mx-auto mb-3"
            />
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Naipe
            </h1>
            <p className="mt-1 text-sm text-slate-500">Site interno da organização</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
