import { ImageResponse } from 'next/og';
import { fetchVehicle } from '@/lib/nestjs/vehicles';

export const runtime = 'edge';
export const alt = 'AutoLoc — Location de véhicule';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: { id: string } }) {
    let title = 'AutoLoc — Location de véhicule';
    let subtitle = 'Louez un véhicule en toute confiance';

    try {
        const vehicle = await fetchVehicle(params.id);
        title = `${vehicle.marque} ${vehicle.modele} ${vehicle.annee}`;
        subtitle = `À partir de ${Number(vehicle.prixParJour).toLocaleString('fr-FR')} FCFA/jour · ${vehicle.ville}`;
    } catch {
        // fallback to defaults
    }

    return new ImageResponse(
        (
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                    color: 'white',
                    fontFamily: 'sans-serif',
                    padding: 60,
                }}
            >
                <div style={{ fontSize: 28, opacity: 0.6, marginBottom: 16, display: 'flex' }}>
                    AutoLoc
                </div>
                <div
                    style={{
                        fontSize: 52,
                        fontWeight: 700,
                        textAlign: 'center',
                        lineHeight: 1.2,
                        display: 'flex',
                    }}
                >
                    {title}
                </div>
                <div
                    style={{
                        fontSize: 24,
                        opacity: 0.7,
                        marginTop: 20,
                        display: 'flex',
                    }}
                >
                    {subtitle}
                </div>
            </div>
        ),
        { ...size },
    );
}
