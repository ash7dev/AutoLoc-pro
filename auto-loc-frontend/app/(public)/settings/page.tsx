import type { Metadata } from 'next';
import { SettingsClient } from './client';

export const metadata: Metadata = {
    title: 'Paramètres — AutoLoc',
    description: 'Gérez vos paramètres et informations personnelles sur AutoLoc.',
};

export default function SettingsPage() {
    return <SettingsClient />;
}
