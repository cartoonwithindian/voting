import Link from "next/link";

export default function AccessDenied() {
  return (
    <div className="min-h-screen bg-bg-tertiary flex items-center justify-center px-4">
      <div className="bg-white rounded-[20px] border border p-10 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-error-600/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl">🚫</span>
        </div>
        <h1 className="text-2xl font-bold text-text-primary mb-2">Access Denied</h1>
        <p className="text-sm text-text-secondary mb-8">You do not have permission to access this page. Please contact an administrator if you believe this is an error.</p>
        <Link href="/login"
          className="inline-block bg-primary-600 text-white px-8 py-3 rounded-[12px] text-sm font-semibold hover:bg-primary-500 transition-colors">
          Go to Login
        </Link>
      </div>
    </div>
  );
}
