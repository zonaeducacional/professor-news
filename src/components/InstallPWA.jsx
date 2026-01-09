import { useState, useEffect } from 'react';
import { Download, X, Share, PlusSquare } from 'lucide-react';

export function InstallPWA() {
  const [supportsPWA, setSupportsPWA] = useState(false);
  const [promptInstall, setPromptInstall] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // 1. Verifica se já está instalado (Standalone mode)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    if (isStandalone) {
      setIsInstalled(true);
      return; // Se já está instalado, não faz nada
    }

    // 2. Detecta se é iOS
    const iosCheck = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(iosCheck);

    // 3. Captura o evento de instalação do Chrome/Android
    const handler = (e) => {
      e.preventDefault();
      setPromptInstall(e);
      setSupportsPWA(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Se for iOS, mostramos o botão mesmo sem evento (pois iOS não dispara evento)
    if (iosCheck) {
      setSupportsPWA(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = (e) => {
    e.preventDefault();
    
    // Lógica para iOS: Mostra instruções
    if (isIOS) {
      setShowIOSInstructions(true);
      return;
    }

    // Lógica para Android: Dispara o prompt nativo
    if (!promptInstall) {
      return;
    }
    promptInstall.prompt();
  };

  // Se já estiver instalado ou não suportar, não mostra nada
  if (isInstalled || !supportsPWA) return null;

  return (
    <>
      {/* BOTÃO FLUTUANTE DE INSTALAÇÃO */}
      <div className="fixed bottom-28 right-4 z-40 animate-bounce-slow">
        <button
          onClick={handleInstallClick}
          className="flex items-center gap-2 bg-[#1E3A8A] text-white px-4 py-3 rounded-full shadow-xl hover:bg-blue-900 transition-all font-bold text-sm border-2 border-white/20"
        >
          <Download size={18} />
          Instalar App
        </button>
      </div>

      {/* MODAL DE INSTRUÇÕES PARA IOS (SÓ APARECE NO IPHONE) */}
      {showIOSInstructions && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center p-4 backdrop-blur-sm" onClick={() => setShowIOSInstructions(false)}>
          <div className="bg-white rounded-t-2xl w-full max-w-md p-6 shadow-2xl animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-[#1E3A8A]">Instalar no iPhone</h3>
              <button onClick={() => setShowIOSInstructions(false)} className="text-slate-400 hover:text-red-500">
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4 text-slate-600 text-sm">
              <p>O iOS não permite instalação direta. Siga os passos:</p>
              
              <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                <Share size={20} className="text-blue-600" />
                <span>1. Toque no botão <strong>Compartilhar</strong> na barra do navegador.</span>
              </div>

              <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                <PlusSquare size={20} className="text-blue-600" />
                <span>2. Role para baixo e toque em <strong>Adicionar à Tela de Início</strong>.</span>
              </div>
            </div>

            <div className="mt-6 text-center text-xs text-slate-400">
              Toque fora para fechar
            </div>
          </div>
        </div>
      )}
    </>
  );
}