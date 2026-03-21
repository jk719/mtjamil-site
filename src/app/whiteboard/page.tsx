import Link from "next/link";
import Whiteboard from "@/components/Whiteboard";

export default function WhiteboardPage() {
  return (
    <div className="px-4 pt-24 pb-12">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
            Math Whiteboard
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Draw, erase, and work through problems
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={16}
            height={16}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          Back
        </Link>
      </div>
      <Whiteboard />
    </div>
  );
}
