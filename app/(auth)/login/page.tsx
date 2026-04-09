import Image from "next/image";
import { LoginForm } from "./login-form";

type Props = { searchParams: Promise<{ error?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const { error } = await searchParams;

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Image src="/logo.png" alt="Drippilot" width={80} height={80} priority />
        </div>

        <div className="bg-white border border-neutral-200 rounded-2xl p-8 shadow-sm">
          <h1 className="text-neutral-900 font-semibold text-lg mb-1">
            Welcome back
          </h1>
          <p className="text-neutral-400 text-sm mb-6">
            Sign in to the admin panel
          </p>
          <LoginForm urlError={error} />
        </div>

        <p className="text-center text-neutral-400 text-xs mt-6">
          Admin accounts are provisioned manually.
        </p>
      </div>
    </div>
  );
}
