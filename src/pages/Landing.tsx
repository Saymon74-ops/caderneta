import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ChevronDown, Smartphone, BookOpen, TrendingUp, Package, Users, PieChart, Quote } from 'lucide-react';

function FadeIn({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const currentRef = ref.current;
    if (!currentRef) return;
    
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.unobserve(currentRef);
      }
    }, { threshold: 0.1, rootMargin: '50px' });
    
    observer.observe(currentRef);
    return () => observer.disconnect();
  }, []);
  
  return (
    <div 
      ref={ref} 
      className={`transition-all duration-700 w-full ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} 
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function MockupApp({ type }: { type: 'dashboard' | 'fiados' | 'relatorio' }) {
  if (type === 'dashboard') {
    return (
      <div style={{background:'#1a1a2e', borderRadius:'36px', padding:'10px', width:'220px', boxShadow:'0 20px 60px rgba(0,0,0,0.3)', margin:'0 auto'}}>
        <div style={{background:'#f2f6f3', borderRadius:'26px', overflow:'hidden', height:'400px', position:'relative'}}>
          <div style={{background:'white', padding:'12px 14px', display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid #f3f4f6'}}>
            <div>
              <div style={{fontWeight:'800', fontSize:'12px', color:'#111'}}>Olá, João 👋</div>
              <div style={{fontSize:'10px', color:'#9ca3af'}}>Bem-vindo ao Caderneta</div>
            </div>
            <div style={{width:'30px',height:'30px',background:'#1a9e5c',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:'800',fontSize:'12px'}}>J</div>
          </div>
          <div style={{background:'#1a9e5c',margin:'10px',borderRadius:'14px',padding:'14px',position:'relative',overflow:'hidden'}}>
            <div style={{color:'rgba(255,255,255,0.7)',fontSize:'9px',textTransform:'uppercase',letterSpacing:'0.5px'}}>Faturamento do mês</div>
            <div style={{color:'white',fontSize:'20px',fontWeight:'800',marginTop:'4px'}}>R$ 3.840,00</div>
            <div style={{color:'rgba(255,255,255,0.6)',fontSize:'9px',marginTop:'4px'}}>↑ +12% este mês</div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px',margin:'0 10px'}}>
            <div style={{background:'white',borderRadius:'10px',padding:'10px',border:'1px solid #f3f4f6'}}>
              <div style={{fontSize:'8px',color:'#9ca3af',textTransform:'uppercase'}}>Lucro Real</div>
              <div style={{fontSize:'13px',fontWeight:'800',color:'#1a9e5c',marginTop:'2px'}}>R$ 1.240</div>
            </div>
            <div style={{background:'white',borderRadius:'10px',padding:'10px',border:'1px solid #f3f4f6'}}>
              <div style={{fontSize:'8px',color:'#9ca3af',textTransform:'uppercase'}}>No Fiado</div>
              <div style={{fontSize:'13px',fontWeight:'800',color:'#dc2626',marginTop:'2px'}}>R$ 620</div>
            </div>
            <div style={{background:'white',borderRadius:'10px',padding:'10px',border:'1px solid #f3f4f6'}}>
              <div style={{fontSize:'8px',color:'#9ca3af',textTransform:'uppercase'}}>Vendas Hoje</div>
              <div style={{fontSize:'13px',fontWeight:'800',color:'#1a9e5c',marginTop:'2px'}}>R$ 340</div>
            </div>
            <div style={{background:'white',borderRadius:'10px',padding:'10px',border:'1px solid #f3f4f6'}}>
              <div style={{fontSize:'8px',color:'#9ca3af',textTransform:'uppercase'}}>Recebido</div>
              <div style={{fontSize:'13px',fontWeight:'800',color:'#b45309',marginTop:'2px'}}>R$ 180</div>
            </div>
          </div>
          <div style={{position:'absolute',bottom:'0',left:'0',right:'0',background:'white',padding:'8px 4px',display:'flex',justifyContent:'space-around',borderTop:'1px solid #f3f4f6'}}>
            <div style={{fontSize:'7px',color:'#1a9e5c',textAlign:'center',fontWeight:'600'}}>🏠 Início</div>
            <div style={{fontSize:'7px',color:'#9ca3af',textAlign:'center'}}>👥 Clientes</div>
            <div style={{fontSize:'7px',color:'#9ca3af',textAlign:'center'}}>🛒 Vender</div>
            <div style={{fontSize:'7px',color:'#9ca3af',textAlign:'center'}}>📋 Fiado</div>
            <div style={{fontSize:'7px',color:'#9ca3af',textAlign:'center'}}>☰ Menu</div>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'fiados') {
    return (
      <div style={{background:'#1a1a2e', borderRadius:'36px', padding:'10px', width:'220px', boxShadow:'0 20px 60px rgba(0,0,0,0.3)', margin:'0 auto'}}>
        <div style={{background:'#f2f6f3', borderRadius:'26px', overflow:'hidden', height:'400px', position:'relative'}}>
          <div style={{background:'white', padding:'12px 14px', borderBottom:'1px solid #f3f4f6'}}>
            <div style={{fontWeight:'800', fontSize:'13px', color:'#111'}}>Fiados em Aberto</div>
            <div style={{fontSize:'10px', color:'#dc2626', fontWeight:'600'}}>Total: R$ 620,00</div>
          </div>
          <div style={{padding:'10px', display:'flex', flexDirection:'column', gap:'8px'}}>
            {[{nome:'Maria Silva', valor:'R$ 180', dias:'12 dias atrasado', pago:25},{nome:'João Costa', valor:'R$ 95', dias:'7 dias atrasado', pago:0},{nome:'Ana Lima', valor:'R$ 120', dias:'Vence amanhã', pago:50}].map((f,i) => (
              <div key={i} style={{background:'white', borderRadius:'12px', padding:'10px', border:'1px solid #f3f4f6'}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                  <div style={{fontWeight:'700', fontSize:'11px', color:'#111'}}>{f.nome}</div>
                  <div style={{fontWeight:'800', fontSize:'12px', color:'#dc2626'}}>{f.valor}</div>
                </div>
                <div style={{fontSize:'9px', color:'#dc2626', marginTop:'2px', fontWeight:'600'}}>{f.dias}</div>
                <div style={{background:'#f3f4f6', borderRadius:'4px', height:'4px', marginTop:'6px', overflow:'hidden'}}>
                  <div style={{background:'#1a9e5c', height:'100%', width:`${f.pago}%`, borderRadius:'4px'}}/>
                </div>
                <div style={{display:'flex', justifyContent:'space-between', marginTop:'4px'}}>
                  <div style={{fontSize:'8px', color:'#9ca3af'}}>Pago: {f.pago}%</div>
                  <div style={{fontSize:'8px', color:'#25D366', fontWeight:'600'}}>💬 Cobrar</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{position:'absolute',bottom:'0',left:'0',right:'0',background:'white',padding:'8px 4px',display:'flex',justifyContent:'space-around',borderTop:'1px solid #f3f4f6'}}>
            <div style={{fontSize:'7px',color:'#9ca3af',textAlign:'center'}}>🏠 Início</div>
            <div style={{fontSize:'7px',color:'#9ca3af',textAlign:'center'}}>👥 Clientes</div>
            <div style={{fontSize:'7px',color:'#9ca3af',textAlign:'center'}}>🛒 Vender</div>
            <div style={{fontSize:'7px',color:'#1a9e5c',textAlign:'center',fontWeight:'600'}}>📋 Fiado</div>
            <div style={{fontSize:'7px',color:'#9ca3af',textAlign:'center'}}>☰ Menu</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{background:'#1a1a2e', borderRadius:'36px', padding:'10px', width:'220px', boxShadow:'0 20px 60px rgba(0,0,0,0.3)', margin:'0 auto'}}>
      <div style={{background:'#f2f6f3', borderRadius:'26px', overflow:'hidden', height:'400px', position:'relative'}}>
        <div style={{background:'white', padding:'12px 14px', borderBottom:'1px solid #f3f4f6'}}>
          <div style={{fontWeight:'800', fontSize:'13px', color:'#111'}}>Relatórios</div>
        </div>
        <div style={{padding:'10px'}}>
          <div style={{display:'flex', gap:'4px', marginBottom:'10px'}}>
            {['Hoje','7 dias','30 dias','Tudo'].map((p,i) => (
              <div key={i} style={{padding:'3px 7px', borderRadius:'20px', fontSize:'8px', fontWeight:'600', background: i===1 ? '#1a9e5c' : 'white', color: i===1 ? 'white' : '#9ca3af', border:'1px solid #f3f4f6'}}>{p}</div>
            ))}
          </div>
          <div style={{background:'#1a9e5c', borderRadius:'12px', padding:'12px', marginBottom:'8px'}}>
            <div style={{color:'rgba(255,255,255,0.7)', fontSize:'9px'}}>Faturamento</div>
            <div style={{color:'white', fontSize:'18px', fontWeight:'800'}}>R$ 3.840</div>
          </div>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'6px', marginBottom:'8px'}}>
            <div style={{background:'white', borderRadius:'10px', padding:'8px', border:'1px solid #f3f4f6'}}>
              <div style={{fontSize:'8px', color:'#9ca3af'}}>Lucro Real</div>
              <div style={{fontSize:'12px', fontWeight:'800', color:'#1a9e5c'}}>R$ 1.240</div>
            </div>
            <div style={{background:'white', borderRadius:'10px', padding:'8px', border:'1px solid #f3f4f6'}}>
              <div style={{fontSize:'8px', color:'#9ca3af'}}>Despesas</div>
              <div style={{fontSize:'12px', fontWeight:'800', color:'#dc2626'}}>R$ 380</div>
            </div>
          </div>
          <div style={{background:'white', borderRadius:'10px', padding:'10px', border:'1px solid #f3f4f6'}}>
            <div style={{fontSize:'9px', color:'#111', fontWeight:'700', marginBottom:'6px'}}>Vendas pagas vs fiado</div>
            <div style={{display:'flex', gap:'4px', height:'8px', borderRadius:'4px', overflow:'hidden'}}>
              <div style={{background:'#1a9e5c', width:'65%'}}/>
              <div style={{background:'#b45309', width:'35%'}}/>
            </div>
            <div style={{display:'flex', justifyContent:'space-between', marginTop:'4px'}}>
              <div style={{fontSize:'8px', color:'#1a9e5c', fontWeight:'600'}}>● Pagas 65%</div>
              <div style={{fontSize:'8px', color:'#b45309', fontWeight:'600'}}>● Fiado 35%</div>
            </div>
          </div>
        </div>
        <div style={{position:'absolute',bottom:'0',left:'0',right:'0',background:'white',padding:'8px 4px',display:'flex',justifyContent:'space-around',borderTop:'1px solid #f3f4f6'}}>
          <div style={{fontSize:'7px',color:'#9ca3af',textAlign:'center'}}>🏠 Início</div>
          <div style={{fontSize:'7px',color:'#9ca3af',textAlign:'center'}}>👥 Clientes</div>
          <div style={{fontSize:'7px',color:'#9ca3af',textAlign:'center'}}>🛒 Vender</div>
          <div style={{fontSize:'7px',color:'#9ca3af',textAlign:'center'}}>📋 Fiado</div>
          <div style={{fontSize:'7px',color:'#9ca3af',textAlign:'center'}}>☰ Menu</div>
        </div>
      </div>
    </div>
  );
}

function ImageCarousel() {
  const images = [
    '/slide1.jpg',
    '/slide2.jpg',
    '/slide3.jpg',
    '/slide4.jpg'
  ];
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <div className="w-full max-w-[450px] mx-auto relative overflow-visible rounded-[2.5rem] bg-transparent flex items-center justify-center">
      <div className="w-full aspect-[4/5] relative">
        {images.map((src, i) => (
          <img 
            key={i}
            src={src}
            className={`absolute top-0 left-0 w-full h-full object-contain transition-all duration-700 ease-in-out ${
              i === currentIndex ? 'opacity-100 z-10 translate-x-0 scale-100' : 'opacity-0 z-0 scale-95'
            }`}
            style={{
              transform: i === currentIndex ? 'translateX(0)' : i < currentIndex ? 'translateX(-20px)' : 'translateX(20px)'
            }}
            alt={`App slide ${i + 1}`}
          />
        ))}
      </div>
      
      <button 
        onClick={() => setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
        className="absolute -left-4 sm:-left-12 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full flex items-center justify-center shadow-[0_5px_15px_rgba(0,0,0,0.1)] text-[#1a9e5c] hover:scale-110 hover:bg-[#1a9e5c] hover:text-white transition-all z-20 focus:outline-none"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="m15 18-6-6 6-6"/></svg>
      </button>

      <button 
        onClick={() => setCurrentIndex((prev) => (prev + 1) % images.length)}
        className="absolute -right-4 sm:-right-12 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full flex items-center justify-center shadow-[0_5px_15px_rgba(0,0,0,0.1)] text-[#1a9e5c] hover:scale-110 hover:bg-[#1a9e5c] hover:text-white transition-all z-20 focus:outline-none"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="ml-1"><path d="m9 18 6-6-6-6"/></svg>
      </button>

      <div className="absolute -bottom-10 left-0 right-0 flex justify-center gap-3 z-20">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`h-2.5 rounded-full transition-all duration-300 shadow-sm ${
              i === currentIndex ? 'bg-[#1a9e5c] w-8' : 'bg-gray-300/80 w-2.5 hover:bg-gray-400'
            }`}
            aria-label={`Ir para o slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

export default function Landing() {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [bannerHeight, setBannerHeight] = useState(0);
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (installPrompt && !isInstalled && bannerRef.current) {
      setBannerHeight(bannerRef.current.offsetHeight);
      
      const resizeObserver = new ResizeObserver((entries) => {
        for (let entry of entries) {
          setBannerHeight((entry.target as HTMLElement).offsetHeight);
        }
      });
      resizeObserver.observe(bannerRef.current);
      return () => resizeObserver.disconnect();
    } else {
      setBannerHeight(0);
    }
  }, [installPrompt, isInstalled]);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    const installedHandler = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', installedHandler);
    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const result = await installPrompt.userChoice;
    if (result.outcome === 'accepted') setIsInstalled(true);
  };

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div 
      className="font-sans text-gray-900 bg-white overflow-x-hidden"
      style={{ paddingTop: bannerHeight ? `${bannerHeight}px` : '0px' }}
    >
      {installPrompt && !isInstalled && (
        <div 
          ref={bannerRef}
          className="fixed top-0 left-0 w-full bg-[#1a9e5c] text-white px-6 py-3 flex items-center justify-center sm:justify-between z-[60] border-b-2 border-[#0d7a40] flex-wrap gap-3 shadow-md"
        >
          <span className="text-sm font-bold text-center">📲 Instale o Caderneta no seu celular!</span>
          <button onClick={handleInstall} className="bg-white text-[#1a9e5c] px-6 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wide shadow-sm active:scale-95 transition-transform hover:shadow-md">Instalar app</button>
        </div>
      )}
      {/* NAVBAR */}
      <nav 
        className="fixed w-full bg-white/90 backdrop-blur-md border-b border-gray-100 z-50 top-0 transition-all"
        style={{ paddingTop: bannerHeight ? `${bannerHeight}px` : '0px' }}
      >
        <div className="max-w-[1100px] mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg width="36" height="44" viewBox="0 0 72 88" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="0" y="0" width="72" height="88" rx="10" fill="#1a9e5c"/>
              <rect x="0" y="0" width="14" height="88" rx="10" fill="#0d7a40"/>
              <rect x="7" y="0" width="7" height="88" fill="#0d7a40"/>
              <circle cx="14" cy="18" r="5" fill="none" stroke="white" strokeWidth="2"/>
              <circle cx="14" cy="34" r="5" fill="none" stroke="white" strokeWidth="2"/>
              <circle cx="14" cy="50" r="5" fill="none" stroke="white" strokeWidth="2"/>
              <circle cx="14" cy="66" r="5" fill="none" stroke="white" strokeWidth="2"/>
              <line x1="24" y1="30" x2="60" y2="30" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/>
              <line x1="24" y1="42" x2="60" y2="42" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/>
              <line x1="24" y1="54" x2="60" y2="54" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/>
              <text x="42" y="22" textAnchor="middle" fontSize="18" fontWeight="800" fill="white" fontFamily="sans-serif">C</text>
            </svg>
            <span className="font-syne font-bold text-2xl text-gray-900 tracking-tight">Caderneta</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="bg-[#1a9e5c] text-white px-8 py-2.5 rounded-full font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all w-full text-center">
              Entrar
            </Link>
          </div>
        </div>
      </nav>

      {/* SEÇÃO 1: HERO */}
      <section className="pt-36 pb-20 px-6 max-w-[1100px] mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
        <div className="flex-1 space-y-8 text-center lg:text-left">
          <FadeIn>
            <div className="inline-flex items-center gap-2 bg-[#dcfce7] text-[#166534] px-4 py-1.5 rounded-full text-sm font-bold shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#166534] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#166534]"></span>
              </span>
              ✦ Mais de 500 revendedores já usam
            </div>
          </FadeIn>
          
          <FadeIn delay={100}>
            <h1 className="text-5xl lg:text-7xl font-syne font-extrabold leading-[1.1] text-gray-900">
              Pare de perder dinheiro no <span className="text-[#1a9e5c] relative whitespace-nowrap">
                fiado.<svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 100 10" preserveAspectRatio="none"><path d="M0 5 Q 50 10 100 5" stroke="#1a9e5c" strokeWidth="3" fill="transparent"/></svg>
              </span>
            </h1>
          </FadeIn>
          
          <FadeIn delay={200}>
            <p className="text-xl text-gray-500 font-medium max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              O Caderneta organiza suas vendas, controla o fiado e te mostra o lucro real — tudo no celular, direto no navegador.
            </p>
          </FadeIn>
          
          <FadeIn delay={300}>
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <Link to="/register" className="w-full sm:w-auto bg-[#1a9e5c] text-white px-8 py-4 rounded-full font-bold text-lg shadow-xl shadow-[#1a9e5c]/30 hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2">
                Começar agora <ChevronRightIcon />
              </Link>
              <button onClick={() => scrollTo('funcionalidades')} className="w-full sm:w-auto px-8 py-4 rounded-full font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 transition-colors">
                Ver como funciona
              </button>
            </div>
          </FadeIn>
        </div>
        
        <div className="flex-1 w-full max-w-[400px] lg:max-w-none">
          <FadeIn delay={400}>
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-tr from-[#1a9e5c]/20 to-transparent blur-2xl rounded-[60px]"></div>
              <MockupApp type="dashboard" />
            </div>
          </FadeIn>
        </div>
      </section>



      {/* SEÇÃO 2: PROBLEMAS */}
      <section className="py-24 bg-[#f2f6f3]">
        <div className="max-w-[1100px] mx-auto px-6 text-center">
          <FadeIn>
            <h2 className="text-3xl lg:text-5xl font-syne font-bold text-gray-900 mb-16">Você se identifica com isso?</h2>
          </FadeIn>
          
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {[
              { icon: '😰', text: 'Não sei quanto tenho na rua pendurado no fiado' },
              { icon: '📓', text: 'Controlo tudo no caderno de papel e perco informação' },
              { icon: '💸', text: 'Não sei se as minhas vendas tão dando lucro de verdade' }
            ].map((d, i) => (
              <FadeIn key={i} delay={i * 150}>
                <div className="bg-white p-8 rounded-3xl shadow-sm h-full border border-gray-100 hover:-translate-y-2 transition-transform">
                  <div className="text-5xl mb-6">{d.icon}</div>
                  <p className="text-lg font-bold text-gray-800 leading-snug">{d.text}</p>
                </div>
              </FadeIn>
            ))}
          </div>
          
          <FadeIn delay={500}>
            <p className="text-2xl font-bold text-[#1a9e5c] font-syne">O Caderneta resolve tudo isso.</p>
          </FadeIn>
        </div>
      </section>

      {/* SEÇÃO 3: FUNCIONALIDADES */}
      <section id="funcionalidades" className="py-24 bg-white">
        <div className="max-w-[1100px] mx-auto px-6">
          <FadeIn>
            <h2 className="text-4xl lg:text-5xl font-syne font-bold text-gray-900 text-center mb-16">
              Tudo que você precisa em um só lugar
            </h2>
          </FadeIn>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: <BookOpen className="text-[#1a9e5c]" size={28} />, title: 'Controle de Fiado', desc: 'Saiba exatamente quem te deve, quanto e há quantos dias.' },
              { icon: <TrendingUp className="text-[#1a9e5c]" size={28} />, title: 'Lucro Real', desc: 'Descubra quanto você realmente ganha depois dos custos.' },
              { icon: <Smartphone className="text-[#1a9e5c]" size={28} />, title: 'Cobrança via WhatsApp', desc: 'Mande mensagem de cobrança com um toque, sem constrangimento.' },
              { icon: <Package className="text-[#1a9e5c]" size={28} />, title: 'Controle de Estoque', desc: 'Saiba quando seu produto está acabando.' },
              { icon: <Users className="text-[#1a9e5c]" size={28} />, title: 'Gestão de Vendedores', desc: 'Calcule comissões automaticamente.' },
              { icon: <PieChart className="text-[#1a9e5c]" size={28} />, title: 'Relatórios Completos', desc: 'Veja seu desempenho por dia, semana ou mês.' },
            ].map((f, i) => (
              <FadeIn key={i} delay={i * 100}>
                <div className="p-8 rounded-3xl bg-gray-50 hover:bg-[#dcfce7]/30 transition-colors border border-gray-100 h-full">
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-6 border border-gray-100">
                    {f.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 font-syne">{f.title}</h3>
                  <p className="text-gray-500 font-medium leading-relaxed">{f.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* SEÇÃO 4: CARROSSEL */}
      <section className="py-24 bg-[#f2f6f3] overflow-hidden">
        <div className="max-w-[900px] mx-auto px-6 text-center">
          <FadeIn>
            <h2 className="text-4xl lg:text-5xl font-syne font-bold text-gray-900 mb-4">
              Veja o Caderneta em ação
            </h2>
            <p className="text-xl text-gray-500 font-medium mb-16">
              Passe para o lado e veja como é simples e rápido
            </p>
          </FadeIn>
          
          <FadeIn delay={200}>
            <ImageCarousel />
          </FadeIn>
        </div>
      </section>

      {/* SEÇÃO 5: DEPOIMENTOS */}
      <section className="py-24 bg-white">
        <div className="max-w-[1100px] mx-auto px-6">
          <FadeIn>
            <h2 className="text-4xl lg:text-5xl font-syne font-bold text-gray-900 text-center mb-16">
              O que dizem nossos clientes
            </h2>
          </FadeIn>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { q: "Antes eu não sabia quanto tinha no fiado. Agora vejo tudo na hora.", n: "Ana Paula", d: "Revendedora", color: "bg-fuchsia-100 text-fuchsia-600" },
              { q: "Parei de usar caderno e nunca mais perdi um vencimento.", n: "Carlos", d: "Revendedor de limpeza", color: "bg-blue-100 text-blue-600" },
              { q: "Em um mês já recuperei R$400 em fiados que eu tinha esquecido.", n: "Rosimeire", d: "Vendedora autônoma", color: "bg-emerald-100 text-emerald-600" }
            ].map((d, i) => (
              <FadeIn key={i} delay={i * 150}>
                <div className="p-8 rounded-3xl bg-gray-50 border border-gray-100 h-full flex flex-col justify-between">
                  <div>
                    <Quote className="text-gray-300 mb-4" size={32} />
                    <p className="text-lg font-medium text-gray-700 leading-relaxed mb-8">"{d.q}"</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full ${d.color} flex items-center justify-center font-bold text-xl`}>
                      {d.n.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{d.n}</p>
                      <p className="text-sm text-gray-500">{d.d}</p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* SEÇÃO 6: PREÇO */}
      <section className="py-24 bg-[#1a9e5c] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="max-w-[1100px] mx-auto px-6 relative z-10 text-center">
          <FadeIn>
            <h2 className="text-4xl lg:text-5xl font-syne font-bold text-white mb-12">
              Um único plano.<br className="md:hidden"/> Sem surpresas.
            </h2>
          </FadeIn>
          
          <FadeIn delay={200}>
            <div className="max-w-[450px] mx-auto bg-white rounded-[40px] p-10 shadow-2xl">
              <div className="mb-8 border-b border-gray-100 pb-8">
                <span className="bg-[#dcfce7] text-[#166534] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4 inline-block">Plano Pro</span>
                <div className="flex items-end justify-center gap-1">
                  <span className="text-3xl font-syne font-extrabold text-[#1a9e5c]">Assinar Agora</span>
                </div>
              </div>
              
              <ul className="space-y-4 text-left mb-10">
                {[
                  'Clientes ilimitados',
                  'Fiados ilimitados',
                  'Controle de estoque',
                  'Gestão de vendedores',
                  'Relatórios completos',
                  'Cobrança via WhatsApp',
                  'Notificações de vencimento',
                  'Suporte VIP via WhatsApp'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="text-[#1a9e5c] shrink-0" size={24} />
                    <span className="font-bold text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
              
              <Link to="/register" className="block w-full bg-[#1a9e5c] text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg hover:-translate-y-1 transition-all">
                Assinar agora
              </Link>
              <p className="text-sm font-medium text-gray-400 mt-4">
                Cancele quando quiser. Sem multa.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* SEÇÃO 7: FAQ */}
      <section className="py-24 bg-[#f2f6f3]">
        <div className="max-w-[800px] mx-auto px-6">
          <FadeIn>
            <h2 className="text-4xl lg:text-5xl font-syne font-bold text-gray-900 text-center mb-16">
              Perguntas frequentes
            </h2>
          </FadeIn>
          
          <div className="space-y-4">
            {[
              { q: "Preciso instalar alguma coisa?", a: "Não! Funciona direto no navegador e pode ser instalado como app no celular com um clique (PWA)." },
              { q: "Funciona para qualquer tipo de venda?", a: "Sim! Qualquer revendedor porta a porta pode usar, independente do produto." },
              { q: "Meus dados ficam salvos?", a: "Sim, tudo salvo na nuvem com segurança. Você acessa de qualquer celular." },
              { q: "Posso cancelar quando quiser?", a: "Sim, sem multa e sem burocracia. Cancela na hora no próprio painel." },
              { q: "Tem suporte?", a: "Sim! Suporte garantido via WhatsApp para todos os assinantes ativos." },
            ].map((faq, i) => (
               <FaqItem key={i} question={faq.q} answer={faq.a} delay={i * 100} />
            ))}
          </div>
        </div>
      </section>

      {/* SEÇÃO 8: CTA FINAL */}
      <section className="py-32 bg-white border-b border-gray-100">
        <div className="max-w-[800px] mx-auto px-6 text-center">
          <FadeIn>
            <h2 className="text-4xl lg:text-6xl font-syne font-bold text-gray-900 mb-6 leading-tight">
              Comece hoje e pare de perder dinheiro
            </h2>
          </FadeIn>
          <FadeIn delay={150}>
            <p className="text-xl text-gray-500 font-medium mb-10">
              Junte-se a centenas de revendedores que já controlam suas finanças com o Caderneta.
            </p>
          </FadeIn>
          <FadeIn delay={300}>
            <Link to="/register" className="inline-block bg-[#1a9e5c] text-white px-10 py-5 rounded-full font-bold text-lg shadow-xl shadow-[#1a9e5c]/30 hover:shadow-2xl hover:-translate-y-1 transition-all">
              Criar minha conta agora
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 bg-white text-center">
        <div className="max-w-[1100px] mx-auto px-6">
          <div className="flex items-center justify-center gap-2 mb-6 opacity-30">
            <div className="w-8 h-8 bg-[#1a9e5c] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold font-syne">C</span>
            </div>
            <span className="font-syne font-bold text-xl text-gray-900">Caderneta</span>
          </div>
          <p className="text-gray-500 font-medium mb-6">Feito para revendedores brasileiros 🇧🇷</p>
          <div className="flex justify-center gap-6 mb-8 text-sm font-bold text-gray-600">
            <Link to="/login" className="hover:text-[#1a9e5c]">Entrar</Link>
            <Link to="/register" className="hover:text-[#1a9e5c]">Cadastrar</Link>
          </div>
          <p className="text-xs text-gray-400 font-medium tracking-wide">
            © {new Date().getFullYear()} Caderneta. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FaqItem({ question, answer, delay }: { question: string, answer: string, delay: number }) {
  const [open, setOpen] = useState(false);
  return (
    <FadeIn delay={delay}>
      <div className="border border-gray-200 bg-white rounded-2xl overflow-hidden hover:border-[#1a9e5c]/30 transition-colors">
        <button 
          onClick={() => setOpen(!open)} 
          className="w-full text-left p-6 font-syne font-bold text-lg text-gray-800 flex justify-between items-center"
        >
          {question}
          <ChevronDown className={`transition-transform duration-300 text-gray-400 ${open ? 'rotate-180 text-[#1a9e5c]' : ''}`} />
        </button>
        <div className={`transition-all duration-300 px-6 overflow-hidden bg-gray-50/50 ${open ? 'max-h-40 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}>
          <p className="text-gray-600 font-medium leading-relaxed">{answer}</p>
        </div>
      </div>
    </FadeIn>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6"/>
    </svg>
  );
}
