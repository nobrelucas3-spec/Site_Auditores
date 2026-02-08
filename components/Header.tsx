import React, { useState, useRef, useEffect } from 'react';
import { Menu, X, Facebook, Instagram, Linkedin, Twitter, ChevronDown, Lock } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => location.pathname === path ? 'text-secondary-400 font-semibold' : 'text-gray-100 hover:text-secondary-400';
  const isParentActive = (paths: string[]) => paths.some(path => location.pathname.startsWith(path)) ? 'text-secondary-400 font-semibold' : 'text-gray-100 hover:text-secondary-400';

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = (name: string) => {
    if (activeDropdown === name) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(name);
    }
  };

  const NavItem = ({ title, to, children }: { title: string, to?: string, children?: React.ReactNode }) => {
    const hasChildren = !!children;
    const isDropdownOpen = activeDropdown === title;

    // Check if any child link is active to highlight parent
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const childPaths = React.Children.toArray(children).map((child: any) => child.props.to);
    const parentClass = to ? isActive(to) : isParentActive(childPaths);

    if (!hasChildren && to) {
      return (
        <Link to={to} className={`transition-colors py-2 ${parentClass}`}>
          {title}
        </Link>
      );
    }

    return (
      <div className="relative group">
        <button
          onClick={() => toggleDropdown(title)}
          className={`flex items-center gap-1 py-2 transition-colors ${parentClass} focus:outline-none`}
          onMouseEnter={() => window.innerWidth >= 768 && setActiveDropdown(title)}
        >
          {title} <ChevronDown size={14} className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown Menu */}
        <div
          className={`absolute left-0 mt-0 w-56 bg-white rounded-md shadow-xl py-2 z-50 transition-all duration-200 origin-top-left border-t-2 border-secondary-500
            ${isDropdownOpen ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'}`}
          onMouseLeave={() => window.innerWidth >= 768 && setActiveDropdown(null)}
        >
          {children}
        </div>
      </div>
    );
  };

  const DropdownItem = ({ to, children }: { to: string, children: React.ReactNode }) => (
    <Link
      to={to}
      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-secondary-600 transition-colors border-l-2 border-transparent hover:border-secondary-500"
      onClick={() => setActiveDropdown(null)}
    >
      {children}
    </Link>
  );

  return (
    <header className="w-full bg-primary-900 text-white shadow-lg sticky top-0 z-50" ref={dropdownRef}>
      {/* Top Bar */}
      <div className="bg-primary-800 py-2 border-b border-primary-700 hidden md:block">
        <div className="container mx-auto px-4 flex justify-between items-center text-sm">
          <div className="flex gap-4">
            <span>(81) 99163-0278</span>
            <span>auditores.sindical.tce.pe@gmail.com</span>
          </div>
          <div className="flex gap-4">
            <a href="https://instagram.com/auditorestce.pe" target="_blank" rel="noopener noreferrer" className="hover:text-secondary-400"><Instagram size={16} /></a>
            <a href="#" className="hover:text-secondary-400"><Facebook size={16} /></a>
            <a href="#" className="hover:text-secondary-400"><Linkedin size={16} /></a>
            <a href="#" className="hover:text-secondary-400"><Twitter size={16} /></a>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">

        {/* Left Side: Logo & Menu Button (Mobile) */}
        <div className="flex items-center gap-4">
          <button
            className="text-white focus:outline-none hover:text-secondary-400 transition-colors xl:hidden"
            onClick={() => setIsMenuOpen(true)}
          >
            <Menu size={28} />
          </button>

          <Link to="/" className="flex items-center gap-3 group shrink-0">
            <div className="bg-white rounded-full h-12 w-12 md:h-16 md:w-16 flex items-center justify-center shadow-md overflow-hidden shrink-0 border-2 border-primary-100 group-hover:border-secondary-400 transition-colors">
              <img
                src="/logo.png"
                alt="Logo Auditores TCE-PE"
                className="h-full w-full object-contain p-1"
              />
            </div>
            <div className="leading-tight">
              <h1 className="font-bold text-lg md:text-xl uppercase tracking-wide text-white group-hover:text-secondary-400 transition-colors">Auditores TCE-PE</h1>
              <p className="text-xs text-gray-300 font-light hidden sm:block max-w-[200px] md:max-w-none">Associação e Sindicato dos Auditores de Controle Externo TCE-PE</p>
            </div>
          </Link>
        </div>

        {/* Right Side: Desktop Nav & Mobile Member Link */}
        <div className="flex items-center gap-4">
          {/* Desktop Navigation */}
          <nav className="hidden xl:flex gap-5 items-center text-sm font-medium">
            <NavItem title="Início" to="/" />

            <NavItem title="Institucional">
              <DropdownItem to="/institucional/quem-somos">Quem Somos</DropdownItem>
              <DropdownItem to="/institucional/estatuto">Estatuto</DropdownItem>
              <DropdownItem to="/institucional/diretoria">Diretoria</DropdownItem>
            </NavItem>

            <NavItem title="Comunicação">
              <DropdownItem to="/news">Notícias</DropdownItem>
              <DropdownItem to="/analise-tecnica">Análise Técnica</DropdownItem>
              <DropdownItem to="/comunicacao/artigos">Artigos</DropdownItem>
              <DropdownItem to="/comunicacao/fotos">Galeria de Fotos</DropdownItem>
              <DropdownItem to="/comunicacao/videos">Galeria de Vídeos</DropdownItem>
              <DropdownItem to="/comunicacao/publicacoes">Publicações</DropdownItem>
            </NavItem>

            <NavItem title="Associe-se" to="/associe-se" />
            <NavItem title="Transparência" to="/area-do-filiado/financeiro" />
            <NavItem title="Convênios" to="/convenios" />
            <NavItem title="Contato" to="/contato" />

            <Link to="/area-do-filiado" className="flex items-center gap-2 bg-white text-primary-900 px-4 py-2 rounded-full text-xs font-bold hover:bg-secondary-400 transition-colors uppercase tracking-wider shadow-sm ml-2">
              <Lock size={14} />
              Área do Filiado
            </Link>
          </nav>

          {/* Mobile Member Shortcut */}
          <Link to="/area-do-filiado" className="xl:hidden text-white hover:text-secondary-400 p-2">
            <Lock size={24} />
          </Link>
        </div>
      </div>

      {/* Sidebar Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-[60] transition-opacity duration-300 ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={() => setIsMenuOpen(false)}
      />

      {/* Sidebar / Drawer Navigation */}
      <div className={`fixed inset-y-0 left-0 w-[80%] max-w-sm bg-primary-900 shadow-2xl z-[70] transform transition-transform duration-300 ease-out ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-primary-800 flex justify-between items-center bg-primary-950">
            <span className="font-bold text-white uppercase tracking-wider text-sm">Menu de Navegação</span>
            <button onClick={() => setIsMenuOpen(false)} className="text-gray-400 hover:text-white">
              <X size={24} />
            </button>
          </div>

          {/* Sidebar Content */}
          <div className="flex-1 overflow-y-auto py-4">
            <div className="flex flex-col px-4 gap-2">
              <Link to="/" onClick={() => setIsMenuOpen(false)} className="py-3 border-b border-primary-800 text-white font-medium hover:text-secondary-400">Início</Link>

              {/* Collapsible Sections in Sidebar */}
              <div className="py-3 border-b border-primary-800">
                <div className="text-secondary-500 text-xs font-bold uppercase mb-3">Institucional</div>
                <div className="pl-3 flex flex-col gap-3">
                  <Link to="/institucional/quem-somos" onClick={() => setIsMenuOpen(false)} className="text-gray-300 hover:text-white text-sm">Quem Somos</Link>
                  <Link to="/institucional/estatuto" onClick={() => setIsMenuOpen(false)} className="text-gray-300 hover:text-white text-sm">Estatuto</Link>
                  <Link to="/institucional/diretoria" onClick={() => setIsMenuOpen(false)} className="text-gray-300 hover:text-white text-sm">Diretoria</Link>
                </div>
              </div>

              <div className="py-3 border-b border-primary-800">
                <div className="text-secondary-500 text-xs font-bold uppercase mb-3">Comunicação</div>
                <div className="pl-3 flex flex-col gap-3">
                  <Link to="/news" onClick={() => setIsMenuOpen(false)} className="text-gray-300 hover:text-white text-sm">Notícias</Link>
                  <Link to="/analise-tecnica" onClick={() => setIsMenuOpen(false)} className="text-gray-300 hover:text-white text-sm flex items-center justify-between">
                    Análise Técnica
                    <span className="bg-secondary-500 text-primary-900 text-[10px] px-1.5 py-0.5 rounded font-bold">Novo</span>
                  </Link>
                  <Link to="/comunicacao/artigos" onClick={() => setIsMenuOpen(false)} className="text-gray-300 hover:text-white text-sm">Artigos</Link>
                  <Link to="/comunicacao/fotos" onClick={() => setIsMenuOpen(false)} className="text-gray-300 hover:text-white text-sm">Galeria de Fotos</Link>
                  <Link to="/comunicacao/videos" onClick={() => setIsMenuOpen(false)} className="text-gray-300 hover:text-white text-sm">Galeria de Vídeos</Link>
                </div>
              </div>

              <Link to="/associe-se" onClick={() => setIsMenuOpen(false)} className="py-3 border-b border-primary-800 text-white font-medium hover:text-secondary-400">Associe-se</Link>
              <Link to="/area-do-filiado/financeiro" onClick={() => setIsMenuOpen(false)} className="py-3 border-b border-primary-800 text-white font-medium hover:text-secondary-400">Transparência</Link>
              <Link to="/convenios" onClick={() => setIsMenuOpen(false)} className="py-3 border-b border-primary-800 text-white font-medium hover:text-secondary-400">Convênios</Link>
              <Link to="/contato" onClick={() => setIsMenuOpen(false)} className="py-3 border-b border-primary-800 text-white font-medium hover:text-secondary-400">Contato</Link>

              <Link to="/area-do-filiado" onClick={() => setIsMenuOpen(false)} className="py-3 mt-4 text-center rounded bg-secondary-500 text-primary-900 font-bold hover:bg-secondary-400 uppercase text-xs flex items-center justify-center gap-2">
                <Lock size={14} />
                Área do Filiado
              </Link>
            </div>
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 bg-primary-950 border-t border-primary-800 text-center">
            <p className="text-xs text-gray-500">Auditores TCE-PE &copy; 2026</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;