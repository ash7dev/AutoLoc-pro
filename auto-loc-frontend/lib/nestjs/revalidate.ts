/**
 * Utility functions for revalidating Next.js cache paths
 */

/**
 * Revalidate all paths related to a specific vehicle
 */
export async function revalidateVehiclePaths(vehicleId: string): Promise<void> {
    try {
        const paths = [
            `/api/revalidate?path=/vehicles/${vehicleId}`,
            `/api/revalidate?path=/dashboard/owner/vehicles/${vehicleId}`,
        ];

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
