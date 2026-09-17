import { BookingWizard } from '@/components/booking/BookingWizard';

export const metadata = {
  title: "Κλείσε ραντεβού — Joe's Barbershop",
};

export default function BookPage() {
  return (
    <main className="flex-1 bg-paper">
      <BookingWizard />
    </main>
  );
}
