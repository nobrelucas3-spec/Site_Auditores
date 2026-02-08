import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { NewsItem } from '../types';

interface HomeBannerProps {
    featuredNews: NewsItem[];
}

const HomeBanner: React.FC<HomeBannerProps> = ({ featuredNews }) => {
    const [currentSlide, setCurrentSlide] = useState(0);

    // Combine static institutional slide with news slides
    const slides = [
        // Static Slide (Institutional / Join Us)
        {
            type: 'static',
            id: 'static-hero',
            image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=1920',
            tag: 'Institucional',
            title: 'Fortalecendo o Controle Externo em Pernambuco',
            description: 'Unindo forças para garantir a ética, a transparência e a valorização do auditor no serviço público.',
            primaryAction: { label: 'Associe-se Agora', link: '/associe-se' },
            secondaryAction: { label: 'Saiba Mais', link: '/institucional/quem-somos' }
        },
        // News Slides
        ...featuredNews.map(news => ({
            type: 'news',
            id: news.id,
            image: news.imageUrl,
            tag: news.category,
            title: news.title,
            description: news.summary,
            date: news.date,
            link: `/news/${news.id}`
        }))
    ];

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    };

    // Auto-play
    useEffect(() => {
        const timer = setInterval(() => {
            nextSlide();
        }, 6000); // 6 seconds per slide
        return () => clearInterval(timer);
    }, [currentSlide]);

    return (
        <div className="relative h-[400px] md:h-[500px] w-full bg-slate-900 overflow-hidden group">
            {/* Slides */}
            {slides.map((slide, index) => (
                <div
                    key={slide.id}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
                        }`}
                >
                    {/* Background Image */}
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url('${slide.image}')` }}
                    ></div>

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-primary-900/95 via-primary-900/60 to-primary-900/30"></div>

                    {/* Content */}
                    <div className="relative container mx-auto px-4 h-full flex flex-col justify-center pb-8 md:pb-16">
                        <div className={`max-w-3xl transition-all duration-700 delay-300 ${index === currentSlide ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>

                            <div className="flex items-center gap-3 mb-3 md:mb-4">
                                <span className="inline-block bg-secondary-500 text-primary-900 text-xs font-bold px-2 py-1 md:px-3 rounded uppercase tracking-wider shadow-sm">
                                    {slide.tag}
                                </span>
                                {slide.type === 'news' && slide.date && (
                                    <span className="text-gray-300 text-xs md:text-sm flex items-center gap-1">
                                        <Calendar size={14} className="text-secondary-400" />
                                        {new Date(slide.date).toLocaleDateString('pt-BR')}
                                    </span>
                                )}
                            </div>

                            <h1 className="text-2xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4 md:mb-6 drop-shadow-sm">
                                <span className="line-clamp-3">{slide.title}</span>
                            </h1>

                            <p className="text-sm md:text-xl text-gray-200 mb-6 md:mb-8 max-w-2xl leading-relaxed line-clamp-2 drop-shadow-sm">
                                {slide.description}
                            </p>

                            <div className="flex flex-wrap gap-3 md:gap-4">
                                {slide.type === 'static' ? (
                                    <>
                                        <Link to={slide.primaryAction!.link} className="bg-secondary-500 hover:bg-secondary-600 text-primary-900 font-bold py-2 px-6 md:py-3 md:px-8 text-sm md:text-base rounded shadow-lg transition-transform hover:-translate-y-1 flex items-center gap-2">
                                            {slide.primaryAction!.label} <ArrowRight size={16} className="md:w-[18px] md:h-[18px]" />
                                        </Link>
                                        <Link to={slide.secondaryAction!.link} className="bg-transparent border-2 border-white/30 text-white hover:bg-white/10 hover:border-white font-bold py-2 px-6 md:py-3 md:px-8 text-sm md:text-base rounded transition-all backdrop-blur-sm">
                                            {slide.secondaryAction!.label}
                                        </Link>
                                    </>
                                ) : (
                                    <Link to={slide.link!} className="bg-secondary-500 hover:bg-secondary-600 text-primary-900 font-bold py-2 px-6 md:py-3 md:px-8 text-sm md:text-base rounded shadow-lg transition-transform hover:-translate-y-1 flex items-center gap-2">
                                        Ler Notícia Completa <ArrowRight size={16} className="md:w-[18px] md:h-[18px]" />
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            {/* Controls */}
            <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/20 hover:bg-black/40 text-white p-3 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 md:opacity-100"
            >
                <ChevronLeft size={24} />
            </button>
            <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/20 hover:bg-black/40 text-white p-3 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 md:opacity-100"
            >
                <ChevronRight size={24} />
            </button>

            {/* Indicators */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentSlide ? 'bg-secondary-500 w-8' : 'bg-white/40 hover:bg-white/60'
                            }`}
                    />
                ))}
            </div>
        </div>
    );
};

export default HomeBanner;
