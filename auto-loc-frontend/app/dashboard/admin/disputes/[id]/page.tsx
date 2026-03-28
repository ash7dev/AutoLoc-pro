import React from 'react';
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { fetchAdminDisputeDetail } from '../../../../../lib/nestjs/admin';
import { AdminDisputeDetailView } from '../../../../../features/admin/components/admin-dispute-detail';

export default async function AdminDisputePage({ params }: { params: { id: string } }) {
  const token = cookies().get('nest_access')?.value;
  if (!token) redirect('/login');

  let disputeData;
  try {
    disputeData = await fetchAdminDisputeDetail(token, params.id);
  } catch (err) {
    console.error('Failed to load dispute', err);
    notFound();
  }

  if (!disputeData) notFound();

  return <AdminDisputeDetailView data={disputeData} />;
}
