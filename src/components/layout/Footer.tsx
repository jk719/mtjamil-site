import Link from "next/link";

const footerLinks = [
  { href: "/classes", label: "Classes" },
  { href: "/one-on-one", label: "One-on-One" },
  { href: "/lessons", label: "Lessons" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-neutral-200 bg-neutral-50/80">
      <div className="mx-auto max-w-5xl px-5 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row sm:items-center">
          <Link
            href="/"
            className="text-[13px] font-semibold tracking-tight text-neutral-900 transition-opacity hover:opacity-70"
          >
            mtjamil.com
          </Link>
          <ul className="flex flex-wrap items-center justify-center gap-6 sm:gap-8">
            {footerLinks.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="text-[13px] text-neutral-500 transition-colors hover:text-neutral-900"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <p className="mt-8 text-center text-[12px] text-neutral-400 sm:mt-10">
          © {currentYear} mtjamil.com. SAT Math tutoring.
        </p>
      </div>
    </footer>
  );
}
