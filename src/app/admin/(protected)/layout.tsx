import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/config';
import { AdminNav } from '@/components/admin/AdminNav';
import { AlertIcon } from '@/components/ui/Icon';

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  if (!isSupabaseConfigured()) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-ink px-6">
        <div className="max-w-[420px] bg-paper p-8 text-center">
          <AlertIcon className="mx-auto mb-4 h-7 w-7 text-pole" />
          <h1 className="mb-2 text-xl font-black uppercase">Admin ανενεργό</h1>
          <p className="text-sm text-mute">
            Το Supabase δεν έχει ρυθμιστεί ακόμα. Πρόσθεσε τα environment variables για να ενεργοποιηθεί το
            dashboard.
          </p>
        </div>
      </main>
    );
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/admin/login');

  return (
    <div className="min-h-screen bg-stone">
      <AdminNav />
      <main className="mx-auto max-w-[1180px] px-5 py-8">{children}</main>
    </div>
  );
}
