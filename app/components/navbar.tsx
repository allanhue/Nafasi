import Link from "next/link";
import { features, type Feature } from "@/app/lib/features";

type NavbarProps = {
  activeFeature: Feature;
};

export default function Navbar({ activeFeature }: NavbarProps) {
  return (
    <header className="border-b border-[#d8ddd0] bg-[#fbfcf8]">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#1d3d35] text-sm font-bold text-white">
            N
          </span>
          <span>
            <span className="block text-base font-semibold leading-5">Nafasi</span>
            <span className="block text-xs text-[#677067]">Property and venue operations</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-2 text-sm font-medium text-[#677067] lg:flex">
          <Link className="rounded-md px-3 py-2 hover:bg-[#edf1e7] hover:text-[#20231f]" href="/auth/login">
            Login
          </Link>
          <Link className="rounded-md px-3 py-2 hover:bg-[#edf1e7] hover:text-[#20231f]" href="/auth/sign_up">
            Sign up
          </Link>
          <Link className="rounded-md px-3 py-2 hover:bg-[#edf1e7] hover:text-[#20231f]" href="/account">
            Account
          </Link>
          <Link className="rounded-md px-3 py-2 hover:bg-[#edf1e7] hover:text-[#20231f]" href="/dashboard">
            Dashboard
          </Link>
          {features.map((feature) => (
            <Link
              className="rounded-md px-3 py-2 hover:bg-[#edf1e7] hover:text-[#20231f]"
              href={feature.route}
              key={feature.key}
            >
              {feature.label}
            </Link>
          ))}
        </nav>
        <div className="rounded-md border border-[#d8ddd0] bg-white px-3 py-2 text-sm font-semibold text-[#1d3d35]">
          {activeFeature.label}
        </div>
      </div>
    </header>
  );
}
