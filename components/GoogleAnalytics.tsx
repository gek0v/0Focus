import { useEffect } from 'react';

const GoogleAnalytics = () => {
  // Usamos la variable de entorno si existe, si no, el ID que nos has proporcionado
  const gaId = import.meta.env.VITE_GA_ID || 'G-0V10RWXL4R';

  useEffect(() => {
    if (!gaId) return;

    // Evitar duplicados
    if (document.querySelector(`script[src*="googletagmanager.com/gtag/js?id=${gaId}"]`)) return;

    // Script 1: Global Site Tag
    const script1 = document.createElement('script');
    script1.async = true;
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    document.head.appendChild(script1);

    // Script 2: Configuración (gtag.js)
    const script2 = document.createElement('script');
    script2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${gaId}');
    `;
    document.head.appendChild(script2);

    console.log(`📊 Google Analytics (Google Tag) initialized: ${gaId}`);
  }, [gaId]);

  return null;
};

export default GoogleAnalytics;