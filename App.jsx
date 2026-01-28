import React, { useState, useEffect } from 'react';
import { Heart, Gift, Users, Clock, Calendar, MapPin, CheckCircle2, ChevronRight, ExternalLink, Loader2 } from 'lucide-react';

/**
 * CONFIGURAÇÕES DO CASAMENTO
 */
const WEDDING_DATE = new Date('2026-05-02T16:00:00');
const COUPLE_NAMES = "Júlia & Vitor";
// URL Final do Google Apps Script integrada
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw766Z70PB6ORpMJxKLOSrSHeHtB0VdvwVe9uQry0n2cwdA10mDfZ0DRh4god516iIg/exec";

const App = () => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [searchName, setSearchName] = useState('');
  const [loading, setLoading] = useState(false);
  const [foundGuests, setFoundGuests] = useState([]);
  const [error, setError] = useState('');
  const [attendance, setAttendance] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [finished, setFinished] = useState(false);

  // Lógica da Contagem Regressiva
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const difference = WEDDING_DATE.getTime() - now.getTime();
      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Busca real na planilha via Google Apps Script
  const handleRSVPSearch = async () => {
    if (searchName.trim().length < 3) {
      setError('Por favor, digite pelo menos 3 letras para buscar.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${SCRIPT_URL}?nome=${encodeURIComponent(searchName.trim())}`);
      const data = await response.json();
      
      if (data && data.length > 0) {
        setFoundGuests(data);
        const initialAttendance = {};
        // Inicializa todos como presentes por padrão ao encontrar o convite
        data.forEach(g => {
          initialAttendance[g.nomeIndividual] = g.situacao === "Confirmado";
        });
        setAttendance(initialAttendance);
      } else {
        setError('Convite não encontrado. Verifique se o nome está correto.');
      }
    } catch (err) {
      console.error("Erro na busca:", err);
      setError('Erro ao conectar com a lista. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const toggleAttendance = (nome) => {
    setAttendance(prev => ({ ...prev, [nome]: !prev[nome] }));
  };

  const submitRSVP = async () => {
    setIsSubmitting(true);
    const payload = foundGuests.map(g => ({
      nomeIndividual: g.nomeIndividual,
      presente: attendance[g.nomeIndividual]
    }));

    try {
      // O Google Apps Script exige modo no-cors para POST simples ou tratamento de pre-flight
      await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify(payload),
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
      });
      setFinished(true);
    } catch (err) {
      console.error("Erro ao enviar RSVP:", err);
      setError('Erro ao salvar sua confirmação. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const gifts = [
    { id: 1, title: 'Brinde da noite de núpcias', price: 491.71, image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=500' },
    { id: 2, title: 'Brunch honeymoon no quarto', price: 268.49, image: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?q=80&w=500' },
    { id: 3, title: 'Café da manhã romântico', price: 361.65, image: 'https://images.unsplash.com/photo-1495214781650-648ac8046fe1?q=80&w=500' },
    { id: 4, title: 'Churrasqueira Elétrica', price: 250.00, image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=500' },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans selection:bg-rose-100">
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@600&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap');`}
      </style>

      {/* Header / Nav */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <nav className="max-w-6xl mx-auto px-6 py-4 flex flex-wrap justify-center gap-4 md:gap-8 text-[10px] md:text-xs uppercase tracking-[0.2em] font-medium text-slate-500">
          <a href="#home" className="hover:text-slate-900 transition-colors">Home</a>
          <a href="#casal" className="hover:text-slate-900 transition-colors">O Casal</a>
          <a href="#cerimonia" className="hover:text-slate-900 transition-colors">Cerimônia</a>
          <a href="#presentes" className="hover:text-slate-900 transition-colors">Lista de Presentes</a>
          <a href="#rsvp" className="hover:text-slate-900 transition-colors">Confirmar Presença</a>
        </nav>
      </header>

      {/* Hero Section */}
      <section id="home" className="flex flex-col items-center pt-12 pb-20 px-6">
        <div className="relative w-full max-w-4xl overflow-hidden rounded-b-[200px] mb-12 shadow-sm border border-slate-50">
          <img 
            src="https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=80&w=1200" 
            alt="Foto do Casal" 
            className="w-full h-[400px] md:h-[600px] object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white/40 to-transparent" />
        </div>

        <h1 className="text-6xl md:text-8xl font-['Dancing_Script'] mb-6 text-slate-900 text-center">
          {COUPLE_NAMES}
        </h1>
        
        <div className="flex flex-col items-center space-y-4">
          <span className="text-2xl md:text-3xl font-['Playfair_Display'] tracking-[0.15em] text-slate-700">
            02.05.2026
          </span>
          <div className="h-px w-24 bg-slate-200" />
          <div className="flex gap-4 md:gap-8 text-center uppercase tracking-widest text-[10px] md:text-xs text-slate-400">
            <div><span className="block text-xl md:text-2xl text-slate-700 font-bold">{timeLeft.days}</span> Dias</div>
            <div><span className="block text-xl md:text-2xl text-slate-700 font-bold">{timeLeft.hours}</span> Hrs</div>
            <div><span className="block text-xl md:text-2xl text-slate-700 font-bold">{timeLeft.minutes}</span> Min</div>
            <div><span className="block text-xl md:text-2xl text-slate-700 font-bold">{timeLeft.seconds}</span> Seg</div>
          </div>
        </div>
      </section>

      {/* O Casal */}
      <section id="casal" className="max-w-4xl mx-auto py-20 px-6 border-t border-slate-50 text-center">
          <h2 className="text-sm uppercase tracking-[0.3em] text-slate-400 mb-12">Nossa História</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center text-left">
             <div className="aspect-[3/4] overflow-hidden rounded-xl shadow-lg">
                <img src="https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=600" className="w-full h-full object-cover" alt="História do Casal" />
             </div>
             <div className="space-y-6">
                <h3 className="font-['Playfair_Display'] text-3xl italic text-slate-800 tracking-wide">Como tudo começou...</h3>
                <p className="text-slate-500 leading-relaxed font-serif italic text-lg">
                  "O amor não consiste em olhar um para o outro, mas em olhar juntos na mesma direção."
                </p>
                <div className="grid grid-cols-2 gap-4">
                   <div className="aspect-square overflow-hidden rounded-lg">
                      <img src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=400" className="w-full h-full object-cover" alt="Momentos" />
                   </div>
                   <div className="aspect-square overflow-hidden rounded-lg">
                      <img src="https://images.unsplash.com/photo-1522673607200-1648832cee98?q=80&w=400" className="w-full h-full object-cover" alt="Momentos" />
                   </div>
                </div>
             </div>
          </div>
      </section>

      {/* Seção Cerimônia */}
      <section id="cerimonia" className="bg-slate-50 py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-sm uppercase tracking-[0.3em] text-slate-400 mb-4">Onde & Quando</h2>
            <h3 className="text-3xl font-['Playfair_Display'] text-slate-800">A Cerimônia</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-center">
            <div className="aspect-[4/5] overflow-hidden rounded-[2.5rem] shadow-sm rotate-[-2deg] border-8 border-white">
              <img src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=600" className="w-full h-full object-cover" alt="Espaço" />
            </div>

            <div className="space-y-8 text-center flex flex-col items-center">
              <div className="p-8 bg-white rounded-3xl shadow-sm border border-slate-100 w-full">
                <Calendar className="text-rose-200 mx-auto mb-4" size={32} />
                <p className="font-bold text-slate-700 uppercase tracking-widest text-sm mb-1">Data</p>
                <p className="text-slate-500">Sábado, 02 de Maio de 2026</p>
                <div className="h-px w-12 bg-slate-100 mx-auto my-6" />
                <Clock className="text-rose-200 mx-auto mb-4" size={32} />
                <p className="font-bold text-slate-700 uppercase tracking-widest text-sm mb-1">Horário</p>
                <p className="text-slate-500">Às 16:00 horas</p>
                <div className="h-px w-12 bg-slate-100 mx-auto my-6" />
                <MapPin className="text-rose-200 mx-auto mb-4" size={32} />
                <p className="font-bold text-slate-700 uppercase tracking-widest text-sm mb-1">Local</p>
                <p className="text-slate-500 leading-relaxed mb-6">Espaço Quinta das Flores</p>
                <button 
                  onClick={() => window.open('https://maps.google.com', '_blank')}
                  className="inline-flex items-center gap-2 text-rose-300 font-bold hover:text-rose-400 transition-colors uppercase text-[10px] tracking-widest border-b-2 border-rose-50 pb-1"
                >
                  Ver no Google Maps <ExternalLink size={14} />
                </button>
              </div>
            </div>

            <div className="aspect-[4/5] overflow-hidden rounded-[2.5rem] shadow-sm rotate-[2deg] border-8 border-white">
              <img src="https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=600" className="w-full h-full object-cover" alt="Decoração" />
            </div>
          </div>
        </div>
      </section>

      {/* Lista de Presentes */}
      <section id="presentes" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-['Playfair_Display'] mb-4">Lista de Presentes</h2>
            <p className="text-slate-500 text-sm max-w-lg mx-auto leading-relaxed">
              Sua presença é nosso maior presente, mas se desejar nos presentear, preparamos uma lista de experiências para nossa nova vida.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {gifts.map((gift) => (
              <div key={gift.id} className="bg-white border border-slate-100 rounded-[2rem] p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center group">
                <div className="w-full aspect-square rounded-[1.5rem] overflow-hidden mb-6">
                  <img src={gift.image} alt={gift.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <h3 className="text-center font-medium text-slate-700 mb-2 h-12 flex items-center px-2 line-clamp-2">{gift.title}</h3>
                <p className="text-xl font-bold text-slate-900 mb-6">R$ {gift.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                <button 
                  className="w-full bg-[#737373] hover:bg-slate-800 text-white font-medium py-3 rounded-xl transition-colors text-sm uppercase tracking-widest flex items-center justify-center gap-2"
                  onClick={() => window.open('https://www.mercadopago.com.br', '_blank')}
                >
                  <Gift size={16} /> Presentear
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RSVP */}
      <section id="rsvp" className="bg-slate-50 py-24 px-6">
        <div className="max-w-xl mx-auto bg-white border border-slate-100 p-8 md:p-12 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-rose-200" />
          
          <div className="text-center mb-10">
            <Users className="mx-auto text-rose-300 mb-4" size={40} />
            <h2 className="text-3xl font-['Playfair_Display'] mb-2">Confirmar Presença</h2>
            <p className="text-slate-400 text-sm italic">Digite o nome conforme está no convite físico.</p>
          </div>

          {finished ? (
            <div className="text-center py-10 animate-in fade-in zoom-in duration-500">
               <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="text-green-600" size={40} />
               </div>
               <h3 className="text-2xl font-['Playfair_Display'] text-slate-800 mb-2">Obrigado!</h3>
               <p className="text-slate-500">Sua confirmação foi enviada para o casal.</p>
               <button onClick={() => { setFinished(false); setFoundGuests([]); setSearchName(''); }} className="mt-8 text-rose-300 font-bold uppercase text-[10px] tracking-widest border-b border-rose-100">Confirmar outro convite</button>
            </div>
          ) : foundGuests.length === 0 ? (
            <div className="space-y-4">
              <input 
                type="text" 
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleRSVPSearch()}
                placeholder="Busque pelo Nome do Convite" 
                className="w-full p-4 pl-6 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-rose-200 outline-none transition-all"
              />
              {error && <p className="text-rose-500 text-[10px] px-2 font-medium uppercase tracking-wider">{error}</p>}
              <button 
                disabled={loading}
                onClick={handleRSVPSearch}
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-black transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" /> : "Verificar Convite"}
              </button>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-8 p-4 bg-rose-50 rounded-2xl border border-rose-100 text-center">
                <span className="text-xs text-rose-400 uppercase tracking-widest font-bold">Convite Encontrado</span>
                <h4 className="text-xl font-['Playfair_Display'] text-slate-800 mt-1">{foundGuests[0].nomeConvite}</h4>
              </div>

              <div className="space-y-3 mb-8">
                {foundGuests.map((convidado, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => toggleAttendance(convidado.nomeIndividual)}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${attendance[convidado.nomeIndividual] ? 'bg-white border-rose-200 shadow-sm' : 'bg-slate-50 border-transparent opacity-60'}`}
                  >
                    <span className={`font-medium ${attendance[convidado.nomeIndividual] ? 'text-slate-900' : 'text-slate-400'}`}>
                      {convidado.nomeIndividual}
                    </span>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${attendance[convidado.nomeIndividual] ? 'bg-rose-400 border-rose-400' : 'border-slate-300'}`}>
                      {attendance[convidado.nomeIndividual] && <CheckCircle2 size={16} className="text-white" />}
                    </div>
                  </div>
                ))}
              </div>

              <button 
                disabled={isSubmitting}
                onClick={submitRSVP}
                className="w-full bg-rose-400 text-white py-4 rounded-2xl font-bold hover:bg-rose-500 transition-all shadow-lg shadow-rose-100 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="animate-spin" /> : "Confirmar Presença"}
              </button>
              
              <button onClick={() => setFoundGuests([])} className="w-full text-slate-400 text-[10px] uppercase tracking-widest mt-6 hover:text-slate-600">Buscar outro nome</button>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 text-center text-slate-400 text-xs tracking-widest uppercase border-t border-slate-50">
        <Heart className="mx-auto text-rose-200 mb-4 fill-rose-200" size={20} />
        <p>Com carinho, {COUPLE_NAMES}</p>
        <p className="mt-4 opacity-50">02.05.2026</p>
      </footer>
    </div>
  );
};

export default App;
