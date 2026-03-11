import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative flex min-h-[85vh] flex-col items-center justify-center px-6 pt-24 pb-20 text-center lg:min-h-[90vh] lg:px-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-4xl font-semibold tracking-tight text-neutral-900 sm:text-5xl md:text-6xl lg:text-7xl">
          Understand SAT Math
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-neutral-600 sm:text-xl md:mt-8 md:text-2xl">
          Small group classes and one-on-one tutoring focused on real
          mathematical understanding.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-5 md:mt-14">
          <Link
            href="/lessons"
            className="inline-flex min-w-[180px] items-center justify-center rounded-full bg-neutral-900 px-8 py-4 text-base font-medium text-white transition-all hover:bg-neutral-800 hover:scale-[1.02] active:scale-[0.98]"
          >
            Explore Lessons
          </Link>
          <Link
            href="/classes"
            className="inline-flex min-w-[180px] items-center justify-center rounded-full border border-neutral-300 bg-white px-8 py-4 text-base font-medium text-neutral-900 transition-all hover:border-neutral-400 hover:bg-neutral-50 hover:scale-[1.02] active:scale-[0.98]"
          >
            Join a Class
          </Link>
        </div>
      </div>
    </section>
  );
}
