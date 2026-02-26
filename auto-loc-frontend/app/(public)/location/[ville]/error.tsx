'use client';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
            <h2 className="text-xl font-semibold">Une erreur s'est produite</h2>
            <p className="text-muted-foreground">{error.message}</p>
            <button onClick={() => reset()} className="px-4 py-2 bg-primary text-primary-foreground rounded-md">
                Réessayer
            </button>
        </div>
    );
}
