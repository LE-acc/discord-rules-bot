import { BottomNav } from '@/components/BottomNav';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto min-h-[100dvh] w-full max-w-2xl px-4 pb-28 pt-4 safe-top">
      {children}
      <BottomNav />
    </div>
  );
}
