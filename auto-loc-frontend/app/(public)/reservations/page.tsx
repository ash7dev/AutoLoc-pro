import type { Metadata } from 'next';
import { ReservationsClient } from './client';

export const metadata: Metadata = {
    title: 'Mes réservations — AutoLoc',
    description: 'Consultez et gérez vos réservations de véhicules sur AutoLoc.',
};

export default function TenantReservationsPage() {
    return <ReservationsClient />;
}
