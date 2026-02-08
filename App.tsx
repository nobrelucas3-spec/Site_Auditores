import React from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import News from './pages/News';
import Article from './pages/Article';
import Audit from './pages/Audit';
import UnderConstruction from './components/UnderConstruction';
import Institucional from './pages/Institucional';
import Contact from './pages/Contact';
import Agreements from './pages/Agreements';
import Transparency from './pages/Transparency';
import JoinUs from './pages/JoinUs';
import Gallery from './pages/Gallery';
import JuridicalAnalysis from './pages/JuridicalAnalysis';
import TechnicalAnalysisList from './pages/TechnicalAnalysisList';
import MemberLogin from './pages/MemberLogin';
import MemberDashboard from './pages/MemberDashboard';
import FinancialDashboard from './pages/FinancialDashboard';
import FirstAccess from './pages/FirstAccess';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import FinancialDetailed from './pages/FinancialDetailed';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <ScrollToTop />
      <div className="flex flex-col min-h-screen font-sans text-slate-900">
        <Header />
        <div className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />

            {/* Rotas Institucionais */}
            <Route path="/institucional/quem-somos" element={<Institucional type="quem-somos" />} />
            <Route path="/institucional/estatuto" element={<Institucional type="estatuto" />} />
            <Route path="/institucional/diretoria" element={<Institucional type="diretoria" />} />

            {/* Rotas de Comunicação */}
            <Route path="/news" element={<News />} />
            <Route path="/news/:id" element={<Article />} />
            <Route path="/auditorias/:id" element={<Audit />} />

            {/* Análise Técnica Routes */}
            <Route path="/analise-tecnica" element={<TechnicalAnalysisList />} />
            <Route path="/analise-tecnica/inversao-hierarquica" element={<JuridicalAnalysis />} /> {/* Specific Article */}

            <Route path="/comunicacao/artigos" element={<UnderConstruction title="Artigos" />} />
            <Route path="/comunicacao/fotos" element={<Gallery type="fotos" />} />
            <Route path="/comunicacao/videos" element={<Gallery type="videos" />} />
            <Route path="/comunicacao/publicacoes" element={<UnderConstruction title="Publicações" />} />

            {/* Outras Páginas */}
            <Route path="/associe-se" element={<JoinUs />} />
            <Route path="/transparencia" element={<Transparency />} />
            <Route path="/convenios" element={<Agreements />} />
            <Route path="/contato" element={<Contact />} />
            <Route path="/juridico" element={<UnderConstruction title="Jurídico" />} />

            {/* Área do Filiado */}
            <Route path="/area-do-filiado" element={<MemberLogin />} />
            <Route path="/area-do-filiado/dashboard" element={<MemberDashboard />} />
            <Route path="/area-do-filiado/financeiro" element={<FinancialDashboard />} />
            <Route path="/area-do-filiado/financeiro/detalhes" element={<FinancialDetailed />} />
            <Route path="/primeiro-acesso" element={<FirstAccess />} />
            <Route path="/esqueci-senha" element={<ForgotPassword />} />
            <Route path="/redefinir-senha" element={<ResetPassword />} />

            {/* Fallback */}
            <Route path="/services" element={<Agreements />} /> {/* Redirect services to agreements or keep as placeholder */}
            <Route path="/about" element={<Institucional type="quem-somos" />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </HashRouter>
  );
};

export default App;