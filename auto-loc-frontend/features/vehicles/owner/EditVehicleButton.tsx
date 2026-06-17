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
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-emerald-200 bg-emerald-50 text-[12px] font-bold text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300 transition-all"
            >
                <Edit className="w-3.5 h-3.5" strokeWidth={2} />
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
