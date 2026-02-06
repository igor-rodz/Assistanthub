import { cn } from "../../lib/utils";
import { useState } from "react";

export const Component = () => {
    const [count, setCount] = useState(0);

    return (
        <div className={cn("flex flex-col items-center gap-4 p-4 rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50")}>
            <h1 className="text-2xl font-bold mb-2">Component Example</h1>
            <h2 className="text-xl font-semibold">{count}</h2>
            <div className="flex gap-2">
                <button
                    onClick={() => setCount((prev) => prev - 1)}
                    className="px-4 py-2 bg-zinc-900 text-white rounded hover:bg-zinc-800 transition-colors"
                >
                    -
                </button>
                <button
                    onClick={() => setCount((prev) => prev + 1)}
                    className="px-4 py-2 bg-zinc-900 text-white rounded hover:bg-zinc-800 transition-colors"
                >
                    +
                </button>
            </div>
        </div>
    );
};

export default Component;
