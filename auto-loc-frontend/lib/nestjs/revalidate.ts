/**
 * Utility functions for revalidating Next.js cache paths
 */

/**
 * Revalidate all paths related to a specific vehicle
 * @param vehicleId - The ID of the vehicle to revalidate
 * @param isNewVehicle - Set to true when creating a new vehicle to also revalidate listing pages
 */
export async function revalidateVehiclePaths(vehicleId: string, isNewVehicle = false): Promise<void> {
    try {
        const paths = [
            `/api/revalidate?path=/vehicles/${vehicleId}`,
            `/api/revalidate?path=/vehicle/${vehicleId}`,
            `/api/revalidate?path=/dashboard/owner/vehicles/${vehicleId}`,
        ];

        // If it's a new vehicle, also revalidate listing pages
        if (isNewVehicle) {
            paths.push(
                `/api/revalidate?path=/`,                    // Homepage
                `/api/revalidate?path=/explorer`,            // Explorer page
                `/api/revalidate?path=/dashboard/owner`,     // Owner dashboard
                `/api/revalidate?path=/dashboard/owner/vehicles`, // Owner vehicles list
            );
        }

        await Promise.all(
            paths.map(path =>
                fetch(path, { method: 'POST' })
                    .catch(err => console.warn(`Failed to revalidate ${path}:`, err))
            )
        );
    } catch (error) {
        console.error('Failed to revalidate vehicle paths:', error);
    }
}

/**
 * Revalidate reservation-related paths
 */
export async function revalidateReservationPaths(): Promise<void> {
    try {
        const paths = [
            '/api/revalidate?path=/dashboard/owner/reservations',
            '/api/revalidate?path=/dashboard/renter/reservations',
        ];

        await Promise.all(
            paths.map(path =>
                fetch(path, { method: 'POST' })
                    .catch(err => console.warn(`Failed to revalidate ${path}:`, err))
            )
        );
    } catch (error) {
        console.error('Failed to revalidate reservation paths:', error);
    }
}
