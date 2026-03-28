'use client';

import { useState, useEffect } from 'react';
import { OwnerSettings } from '@/components/settings/owner-settings';
import { fetchUserProfile, type UserProfile } from '@/lib/nestjs/auth';
import { useRoleStore } from '@/features/auth/stores/role.store';

export default function DashboardSettingsPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const accessToken = useRoleStore.getState().accessToken;
        if (accessToken) {
          const userProfile = await fetchUserProfile(accessToken);
          setProfile(userProfile);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return <OwnerSettings profile={profile} />;
}
