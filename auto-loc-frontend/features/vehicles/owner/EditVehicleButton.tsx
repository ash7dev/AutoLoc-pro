"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Edit } from "lucide-react";
import type { Vehicle } from "@/lib/nestjs/vehicles";
import { EditVehicleSheet } from "./EditVehicleSheet";

interface Props {
    vehicle: Vehicle;
}

/**
 * Client-side Edit button + modal for the vehicle detail page.
 * Replaces the old <Link> to a non-existent /edit route.
 */
export function EditVehicleButton({ vehicle }: Props) {
    const [editing, setEditing] = useState(false);
    const router = useRouter();

    return (
        <>
            <button
                type="button"
                onClick={() => setEditing(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-semibold text-white/60 hover:text-white hover:border-white/20 transition-all"
            >
                <Edit className="w-3.5 h-3.5" />
                Modifier
            </button>

            <EditVehicleSheet
                vehicle={editing ? vehicle : null}
                open={editing}
                onClose={() => setEditing(false)}
                onSaved={() => {
                    setEditing(false);
                    router.refresh();
                }}
            />
        </>
    );
}
