import { useCallback, useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const SLIDES = [
  {
    src: "/banners/banner-1.png",
    alt: "yassineiherb — N°1 en nutrition sportive au Maroc. Produits certifiés, qualité garantie.",
  },
  {
    src: "/banners/banner-2.png",
    alt: "Les vitamines sont-elles périmées ? Comment vérifier les dates et détecter l'altération.",
  },
  {
    src: "/banners/banner-3.png",
    alt: "BOGO 40% Off sur les marques Iherbyassine — ingrédients testés, qualité de confiance.",
  },
  {
    src: "/banners/banner-4.png",
    alt: "Votre santé, notre priorité — Compléments alimentaires naturels pour votre bien-être.",
  },
];

const AUTOPLAY_MS = 5000;

export default function BannerSlider() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "center" });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const autoplayTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const isPaused = useRef(false);

  const startAutoplay = useCallback(() => {
    if (autoplayTimer.current) clearInterval(autoplayTimer.current);
    autoplayTimer.current = setInterval(() => {
      if (!isPaused.current) emblaApi?.scrollNext();
    }, AUTOPLAY_MS);
  }, [emblaApi]);

  const stopAutoplay = useCallback(() => {
    if (autoplayTimer.current) {
      clearInterval(autoplayTimer.current);
      autoplayTimer.current = null;
    }
  }, []);

  const scrollPrev = useCallback(() => {
    emblaApi?.scrollPrev();
    // reset timer so user doesn't get immediately auto-advanced
    startAutoplay();
  }, [emblaApi, startAutoplay]);

  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext();
    startAutoplay();
  }, [emblaApi, startAutoplay]);

  const scrollTo = useCallback(
    (index: number) => {
      emblaApi?.scrollTo(index);
      startAutoplay();
    },
    [emblaApi, startAutoplay],
  );

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    onSelect();

    startAutoplay();

    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
      stopAutoplay();
    };
  }, [emblaApi, startAutoplay, stopAutoplay]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowLeft") scrollPrev();
      if (e.key === "ArrowRight") scrollNext();
    },
    [scrollPrev, scrollNext],
  );

  return (
    <section
      aria-label="Promotions et actualités"
      aria-roledescription="carousel"
      className="relative w-full bg-gray-100 focus-within:outline-none"
      onMouseEnter={() => { isPaused.current = true; }}
      onMouseLeave={() => { isPaused.current = false; }}
      onFocus={() => { isPaused.current = true; }}
      onBlur={() => { isPaused.current = false; }}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Embla viewport — aspect-ratio reserves space to prevent CLS */}
      <div
        ref={emblaRef}
        className="overflow-hidden w-full"
        aria-live="polite"
      >
        <div className="flex touch-pan-y select-none">
          {SLIDES.map((slide, i) => (
            <div
              key={slide.src}
              className="flex-shrink-0 w-full"
              role="group"
              aria-roledescription="slide"
              aria-label={`Slide ${i + 1} sur ${SLIDES.length}`}
            >
              {/* aspect-[8/3] reserves ~37.5 % height → zero CLS */}
              <div className="relative w-full aspect-[8/3] sm:aspect-[21/8] overflow-hidden">
                <img
                  src={slide.src}
                  alt={slide.alt}
                  width={1280}
                  height={480}
                  loading={i === 0 ? "eager" : "lazy"}
                  decoding="async"
                  draggable={false}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Prev arrow — desktop only */}
      <button
        onClick={scrollPrev}
        className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm shadow-md items-center justify-center hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-colors"
        aria-label="Slide précédent"
      >
        <ChevronLeft className="w-5 h-5 text-gray-700" />
      </button>

      {/* Next arrow — desktop only */}
      <button
        onClick={scrollNext}
        className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm shadow-md items-center justify-center hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-colors"
        aria-label="Slide suivant"
      >
        <ChevronRight className="w-5 h-5 text-gray-700" />
      </button>

      {/* Navigation dots */}
      <div
        className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20"
        role="tablist"
        aria-label="Sélectionner un slide"
      >
        {SLIDES.map((slide, i) => (
          <button
            key={slide.src}
            role="tab"
            aria-selected={i === selectedIndex}
            aria-label={`Aller au slide ${i + 1}`}
            onClick={() => scrollTo(i)}
            className={`h-2 rounded-full transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
              i === selectedIndex
                ? "w-6 bg-white shadow-sm"
                : "w-2 bg-white/50 hover:bg-white/75"
            }`}
          />
        ))}
      </div>

      {/* Bottom shadow for depth */}
      <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
    </section>
  );
}
