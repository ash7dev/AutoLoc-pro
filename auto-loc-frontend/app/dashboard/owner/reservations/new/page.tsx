import { redirect } from 'next/navigation';

// New reservations are created from the vehicle detail page, not from this route.
// Redirect owners back to their reservations list.
export default function NewReservationPage() {
    redirect('/dashboard/owner/reservations');
}
