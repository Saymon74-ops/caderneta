import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';

export default function PWABanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const isInstalled = localStorage.getItem('pwa-installed');
    if (isInstalled) return;

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    });

    window.addEventListener('appinstalled', () => {
      localStorage.setItem('pwa-installed', 'true');
      setShowBanner(false);
      setDeferredPrompt(null);
    });
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowBanner(false);
      localStorage.setItem('pwa-installed', 'true');
    }
    setDeferredPrompt(null);
  };

  if (!showBanner) return null;

  return (
    <div className="bg-primary text-white px-4 py-3 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-2">
        <span className="text-xl">📲</span>
        <span className="text-sm font-medium">Instale o Caderneta no seu celular!</span>
      </div>
      <button
        onClick={handleInstallClick}
        className="bg-white text-primary text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 active:scale-95 transition-transform"
      >
        <Download size={14} />
        Instalar
      </button>
    </div>
  );
}
