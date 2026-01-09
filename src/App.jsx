import { useEffect, useState } from 'react';
import { db } from './db';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { InstallPWA } from './components/InstallPWA';
import { Heart, Wifi, WifiOff, GraduationCap, LayoutGrid, Calendar, User, CheckCircle, Edit3 } from 'lucide-react';

function App() {
  const [noticias, setNoticias] = useState([]);
  const [online, setOnline] = useState(navigator.onLine);
  const [abaAtiva, setAbaAtiva] = useState('inicio');

  // ESTADO DO PERFIL DO USUÁRIO (Lê da memória ou usa padrão)
  const [perfil, setPerfil] = useState(() => {
    const salvo = localStorage.getItem('user_profile');
    return salvo ? JSON.parse(salvo) : { nome: 'Professor(a)', disciplina: 'Educação Básica' };
  });

  const [editandoPerfil, setEditandoPerfil] = useState(false);

  // Monitora online/offline
  useEffect(() => {
    const handleStatus = () => setOnline(navigator.onLine);
    window.addEventListener('online', handleStatus);
    window.addEventListener('offline', handleStatus);
    return () => window.removeEventListener('online', handleStatus);
  }, []);

  // Salva o perfil sempre que mudar
  useEffect(() => {
    localStorage.setItem('user_profile', JSON.stringify(perfil));
  }, [perfil]);

  // Carrega Notícias
  useEffect(() => {
    const carregarNoticias = async () => {
      const noticiasSalvas = await db.noticias.orderBy('data').reverse().toArray();
      setNoticias(noticiasSalvas);

      if (navigator.onLine) {
        try {
          const resposta = await fetch('/noticias.json');
          const novidades = await resposta.json();

          for (const noticia of novidades) {
            const existe = await db.noticias.where('guid').equals(noticia.id).first();
            if (!existe) {
              await db.noticias.add({
                guid: noticia.id,
                titulo: noticia.titulo,
                resumo: noticia.resumo,
                data: noticia.data,
                link: noticia.link,
                lido: 0,
                favorito: 0
              });
            }
          }
          const listaAtualizada = await db.noticias.orderBy('data').reverse().toArray();
          setNoticias(listaAtualizada);
        } catch (erro) {
          console.error("Erro ao atualizar:", erro);
        }
      }
    };
    carregarNoticias();
  }, [online]);

  // Funções de interação (Lido/Favorito)
  const toggleFavorito = async (id, statusAtual) => {
    const novoStatus = statusAtual === 1 ? 0 : 1;
    await db.noticias.update(id, { favorito: novoStatus });
    setNoticias(prev => prev.map(n => n.id === id ? { ...n, favorito: novoStatus } : n));
  };

  const toggleLido = async (id, statusAtual) => {
    const novoStatus = statusAtual === 1 ? 0 : 1;
    await db.noticias.update(id, { lido: novoStatus });
    setNoticias(prev => prev.map(n => n.id === id ? { ...n, lido: novoStatus } : n));
  };

  const noticiasFiltradas = noticias.filter(n => {
    if (abaAtiva === 'inicio') return !n.lido; 
    if (abaAtiva === 'favoritos') return n.favorito === 1;
    if (abaAtiva === 'lidos') return n.lido === 1;
    return true;
  });

  const formatarData = (dataIso) => {
    try {
      return format(parseISO(dataIso), "dd 'de' MMM", { locale: ptBR }).toUpperCase();
    } catch (e) { return dataIso; }
  };

  return (
    <div className="min-h-screen bg-[#EBF4FA] font-sans pb-32"> {/* Aumentei o padding bottom para segurança */}
      
      {/* CABEÇALHO */}
      <header className="pt-8 pb-6 px-6 flex justify-between items-start sticky top-0 bg-[#EBF4FA] z-10">
        <div className="flex gap-4 items-center">
          <div className="bg-[#1E3A8A] p-3 rounded-2xl shadow-lg text-white">
            <GraduationCap size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1E3A8A] leading-tight">Professor News</h1>
            <p className="text-sm text-slate-500 font-medium">
               Olá, {perfil.nome.split(' ')[0]}
            </p>
          </div>
        </div>
        <div className={`p-2 rounded-full ${online ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {online ? <Wifi size={20} /> : <WifiOff size={20} />}
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="px-5 space-y-5">
        
        {abaAtiva === 'perfil' ? (
          /* TELA DE PERFIL EDITÁVEL */
          <div className="bg-white p-6 rounded-[20px] shadow-sm text-center space-y-4 animate-fade-in">
             
             {/* Avatar com Iniciais */}
             <div className="w-24 h-24 bg-blue-100 rounded-full mx-auto flex items-center justify-center text-blue-800 font-bold text-3xl border-4 border-white shadow-sm">
               {perfil.nome.charAt(0).toUpperCase()}
             </div>

             {/* Área de Edição */}
             <div className="space-y-3">
               {editandoPerfil ? (
                 <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-left">
                      <label className="text-xs font-bold text-slate-400 uppercase">Seu Nome</label>
                      <input 
                        type="text" 
                        value={perfil.nome}
                        onChange={(e) => setPerfil({...perfil, nome: e.target.value})}
                        className="w-full p-2 rounded border border-slate-300 focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div className="text-left">
                      <label className="text-xs font-bold text-slate-400 uppercase">Sua Área/Disciplina</label>
                      <input 
                        type="text" 
                        value={perfil.disciplina}
                        onChange={(e) => setPerfil({...perfil, disciplina: e.target.value})}
                        className="w-full p-2 rounded border border-slate-300 focus:border-blue-500 outline-none"
                      />
                    </div>
                    <button 
                      onClick={() => setEditandoPerfil(false)}
                      className="w-full bg-green-600 text-white py-2 rounded-lg font-bold mt-2"
                    >
                      Salvar Alterações
                    </button>
                 </div>
               ) : (
                 <>
                   <h2 className="text-2xl font-bold text-slate-800">{perfil.nome}</h2>
                   <p className="text-slate-500">{perfil.disciplina}</p>
                   <button 
                     onClick={() => setEditandoPerfil(true)}
                     className="text-sm text-blue-600 font-semibold flex items-center justify-center gap-1 mx-auto hover:bg-blue-50 px-3 py-1 rounded-full transition-colors"
                   >
                     <Edit3 size={14} /> Editar Perfil
                   </button>
                 </>
               )}
             </div>

             {/* Estatísticas */}
             <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-slate-100">
                <div className="bg-slate-50 p-4 rounded-xl">
                   <p className="text-3xl font-bold text-[#1E3A8A]">{noticias.filter(n => n.lido).length}</p>
                   <p className="text-xs uppercase text-slate-500 font-bold">Leituras</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl">
                   <p className="text-3xl font-bold text-red-500">{noticias.filter(n => n.favorito).length}</p>
                   <p className="text-xs uppercase text-slate-500 font-bold">Favoritos</p>
                </div>
             </div>
          </div>
        ) : (
          /* LISTA DE NOTÍCIAS */
          <>
            {noticiasFiltradas.length === 0 && (
              <div className="text-center py-20 text-slate-400">
                <p>Nenhuma notícia encontrada aqui.</p>
                {abaAtiva !== 'inicio' && (
                  <button onClick={() => setAbaAtiva('inicio')} className="mt-4 text-[#1E3A8A] font-bold text-sm">
                    Voltar ao início
                  </button>
                )}
              </div>
            )}

            {noticiasFiltradas.map((noticia) => (
              <article key={noticia.id} className="bg-white p-5 rounded-[20px] shadow-sm border border-slate-100 flex flex-col gap-3 transition-all animate-fade-in">
                <div className="flex justify-between items-center">
                  <span className="bg-blue-50 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">
                    {formatarData(noticia.data)}
                  </span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => toggleLido(noticia.id, noticia.lido)}
                      className={`p-2 rounded-full transition-colors ${noticia.lido ? 'text-green-600 bg-green-50' : 'text-slate-300 hover:bg-slate-50'}`}
                    >
                        <CheckCircle size={20} className={noticia.lido ? "fill-current" : ""} />
                    </button>
                    <button 
                      onClick={() => toggleFavorito(noticia.id, noticia.favorito)}
                      className={`p-2 rounded-full transition-colors ${noticia.favorito ? 'text-red-500 bg-red-50' : 'text-slate-300 hover:bg-slate-50'}`}
                    >
                        <Heart size={20} className={noticia.favorito ? "fill-current" : ""} />
                    </button>
                  </div>
                </div>

                <h3 className={`text-lg font-bold leading-snug ${noticia.lido ? 'text-slate-400' : 'text-slate-800'}`}>
                  {noticia.titulo}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed line-clamp-3">
                  {noticia.resumo}
                </p>
                <a 
                  href={noticia.link} 
                  target="_blank" 
                  rel="noreferrer"
                  className="mt-2 text-[#1E3A8A] font-semibold text-sm flex items-center gap-1 hover:underline self-start"
                >
                  Ler matéria completa
                </a>
              </article>
            ))}
          </>
        )}
      </main>

      {/* BARRA DE NAVEGAÇÃO */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#1E3A8A] rounded-t-[30px] shadow-2xl px-6 py-4 flex justify-between items-center z-50">
        <NavButton icon={<LayoutGrid size={24} />} label="Início" active={abaAtiva === 'inicio'} onClick={() => setAbaAtiva('inicio')} />
        <NavButton icon={<CheckCircle size={24} />} label="Lidos" active={abaAtiva === 'lidos'} onClick={() => setAbaAtiva('lidos')} />
        <NavButton icon={<Heart size={24} />} label="Favoritos" active={abaAtiva === 'favoritos'} onClick={() => setAbaAtiva('favoritos')} />
        <NavButton icon={<User size={24} />} label="Perfil" active={abaAtiva === 'perfil'} onClick={() => setAbaAtiva('perfil')} />
      </nav>

      <InstallPWA />
    </div>
  );
}

function NavButton({ icon, label, active, onClick }) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center gap-1 transition-all duration-300 ${active ? 'text-white scale-110' : 'text-blue-300 hover:text-blue-100'}`}>
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
      {active && <span className="w-1 h-1 bg-white rounded-full mt-1"></span>}
    </button>
  );
}

export default App;