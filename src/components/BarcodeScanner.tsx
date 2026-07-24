'use client';

import { useEffect, useRef, useState } from 'react';
import { useT } from '@/lib/i18n';
import { Sheet } from '@/components/ui/Sheet';
import type { FoodItem } from '@/types';

interface Props {
  open: boolean;
  onClose: () => void;
  onFound: (item: FoodItem, image?: string) => void;
}

/**
 * Barcode scanner. Uses the native BarcodeDetector API when available
 * (Android Chrome, some desktops). Always offers manual code entry as a
 * reliable fallback (works everywhere, incl. iOS Safari).
 */
export function BarcodeScanner({ open, onClose, onFound }: Props) {
  const { t, locale } = useT();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [manual, setManual] = useState('');
  const [status, setStatus] = useState<string>('');
  const [scanning, setScanning] = useState(false);

  async function lookup(code: string) {
    setStatus(locale === 'ar' ? 'جاري البحث...' : 'Looking up...');
    try {
      const res = await fetch(`/api/barcode?code=${encodeURIComponent(code)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.found) {
          onFound(data.item, data.image);
          onClose();
          return;
        }
      }
      setStatus(locale === 'ar' ? 'المنتج غير موجود، جرّب رقم آخر' : 'Product not found, try another code');
    } catch {
      setStatus(locale === 'ar' ? 'تعذّر البحث' : 'Lookup failed');
    }
  }

  useEffect(() => {
    if (!open) return;
    let stream: MediaStream | null = null;
    let raf = 0;
    const Detector = (window as any).BarcodeDetector;

    async function run() {
      if (!Detector || !navigator.mediaDevices?.getUserMedia) return;
      try {
        const detector = new Detector({ formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128'] });
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setScanning(true);
        }
        const tick = async () => {
          if (!videoRef.current) return;
          try {
            const codes = await detector.detect(videoRef.current);
            if (codes.length) {
              cancelAnimationFrame(raf);
              lookup(codes[0].rawValue);
              return;
            }
          } catch {
            /* frame not ready */
          }
          raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      } catch {
        setScanning(false);
      }
    }
    run();
    return () => {
      cancelAnimationFrame(raf);
      stream?.getTracks().forEach((tr) => tr.stop());
      setScanning(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Sheet open={open} onClose={onClose} title={t('foods.scan')}>
      <div className="space-y-4">
        <div className="relative aspect-video overflow-hidden rounded-2xl bg-black">
          <video ref={videoRef} className="h-full w-full object-cover" muted playsInline />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-24 w-3/4 rounded-xl border-2 border-brand-400/80" />
          </div>
          {!scanning && (
            <div className="absolute inset-0 grid place-items-center text-center text-sm text-white/80">
              <div>
                📷<br />
                {locale === 'ar' ? 'الكاميرا غير متاحة — أدخل الرقم يدويًا' : 'Camera unavailable — enter code manually'}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <input
            className="input flex-1"
            inputMode="numeric"
            placeholder={locale === 'ar' ? 'رقم الباركود' : 'Barcode number'}
            value={manual}
            onChange={(e) => setManual(e.target.value)}
          />
          <button onClick={() => manual && lookup(manual)} className="btn-primary">
            {locale === 'ar' ? 'بحث' : 'Find'}
          </button>
        </div>
        {status && <p className="muted text-center text-sm">{status}</p>}
        <p className="muted text-center text-xs">
          {locale === 'ar' ? 'يدعم قاعدة Open Food Facts العالمية' : 'Powered by the global Open Food Facts database'}
        </p>
      </div>
    </Sheet>
  );
}
