import React, { useEffect } from 'react';
import { X, ZoomIn } from 'lucide-react';

interface ImageViewerProps {
    isOpen: boolean;
    onClose: () => void;
    imageSrc: string;
    imageAlt?: string;
}

const ImageViewer: React.FC<ImageViewerProps> = ({ isOpen, onClose, imageSrc, imageAlt }) => {
    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            // Prevent body scrolling when modal is open
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'auto';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity duration-300 animate-fade-in"
            onClick={onClose}
        >
            <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white/70 hover:text-white bg-black/50 hover:bg-black/80 rounded-full p-2 transition-all z-10"
                aria-label="Sair do modo tela cheia"
            >
                <X size={32} />
            </button>

            <div
                className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the image wrapper
            >
                <img
                    src={imageSrc}
                    alt={imageAlt || 'Imagem em tela cheia'}
                    className="max-w-full max-h-full object-contain rounded-md shadow-2xl"
                />
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm pointer-events-none">
                    Pressione ESC para sair
                </div>
            </div>
        </div>
    );
};

export default ImageViewer;
