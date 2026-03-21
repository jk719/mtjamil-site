import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative flex min-h-[88vh] flex-col items-center justify-center px-5 pt-20 pb-16 text-center sm:px-6 lg:min-h-[90vh] lg:px-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-semibold tracking-tight text-neutral-900 sm:text-5xl md:text-6xl lg:text-[3.5rem]">
          Understand SAT Math
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-[17px] leading-relaxed text-neutral-500 sm:mt-7 sm:text-lg md:max-w-2xl md:text-[19px]">
          Not just tricks—real understanding. Small group classes and one-on-one
          tutoring so you build confidence and score what you’re capable of.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4 md:mt-12">
          <Link
            href="/lessons"
            className="inline-flex min-w-[160px] items-center justify-center rounded-full bg-neutral-900 px-6 py-3.5 text-[15px] font-medium text-white transition-all hover:bg-neutral-800 hover:scale-[1.02] active:scale-[0.98]"
          >
            Explore Lessons
          </Link>
          <Link
            href="/classes"
            className="inline-flex min-w-[160px] items-center justify-center rounded-full border border-neutral-300 bg-white px-6 py-3.5 text-[15px] font-medium text-neutral-900 transition-all hover:border-neutral-400 hover:bg-neutral-50 hover:scale-[1.02] active:scale-[0.98]"
          >
            Join a Class
          </Link>
        </div>
      </div>
    </section>
  );
}
