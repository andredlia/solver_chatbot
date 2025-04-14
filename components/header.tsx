import Link from "next/link";

export const Header = () => {
  return (
    <div className="fixed right-0 left-0 w-full top-0 bg-white dark:bg-zinc-950">
      <div className="flex justify-between items-center p-4">
        <div className="flex flex-row items-center gap-2 shrink-0 ">
          <span className="jsx-e3e12cc6f9ad5a71 flex flex-row items-center gap-2 home-links">
            <div className="jsx-e3e12cc6f9ad5a71 w-4 text-lg text-center text-zinc-300 dark:text-zinc-600">
            </div>
            <div className="jsx-e3e12cc6f9ad5a71 flex flex-row items-center gap-4">
              <Link
                className="flex flex-row items-end gap-2"
                target="_blank"
                href="https://x.ai"
              >
              </Link>
            </div>
          </span>
        </div>
        <div className="flex flex-row items-center gap-2 shrink-0">
        </div>
      </div>
    </div>
  );
};
