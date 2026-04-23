export interface Product {
  id:            string;
  name:          string;
  nameFr:        string;
  description:   string;
  descriptionFr: string;
  price:         number;        // MAD
  originalPrice?: number;
  rating:        number;
  reviewCount:   number;
  category:      "protein" | "vitamins" | "creatine" | "fatburner" | "preworkout" | "recovery";
  image:         string;
  badge?:        string;
  badgeFr?:      string;
  isBestSeller?: boolean;
  isFeatured?:   boolean;
  stock:         number;
  flavors?:      string[];
  weight?:       string;
}

export const categories = [
  { slug: "protein",    nameEn: "Protein",      nameFr: "Protéines",          icon: "💪" },
  { slug: "vitamins",   nameEn: "Vitamins",      nameFr: "Vitamines",          icon: "🌿" },
  { slug: "creatine",   nameEn: "Creatine",      nameFr: "Créatine",           icon: "⚡" },
  { slug: "fatburner",  nameEn: "Fat Burner",    nameFr: "Brûleur de graisse", icon: "🔥" },
  { slug: "preworkout", nameEn: "Pre-Workout",   nameFr: "Pré-entraînement",   icon: "🚀" },
  { slug: "recovery",   nameEn: "Recovery",      nameFr: "Récupération",       icon: "🧘" },
] as const;

export const products: Product[] = [
  {
    id: "1",
    name: "Whey Protein Gold",
    nameFr: "Whey Protéine Gold",
    description: "Premium whey protein for muscle recovery and growth. 25g protein per serving.",
    descriptionFr: "Protéine de whey premium pour la récupération musculaire. 25g de protéines par portion.",
    price: 350,
    originalPrice: 420,
    rating: 4.8,
    reviewCount: 234,
    category: "protein",
    image: "/images/protein.jpg",
    badge: "Best Seller",
    badgeFr: "Meilleure vente",
    isBestSeller: true,
    isFeatured: true,
    stock: 50,
    flavors: ["Chocolate", "Vanilla", "Strawberry"],
    weight: "1kg",
  },
  {
    id: "2",
    name: "Creatine Monohydrate",
    nameFr: "Créatine Monohydrate",
    description: "Pure creatine monohydrate for strength and performance. 5g per serving.",
    descriptionFr: "Créatine monohydrate pure pour la force et la performance.",
    price: 180,
    rating: 4.9,
    reviewCount: 189,
    category: "creatine",
    image: "/images/creatine.jpg",
    badge: "New",
    badgeFr: "Nouveau",
    isBestSeller: true,
    isFeatured: true,
    stock: 75,
    weight: "500g",
  },
  {
    id: "3",
    name: "Omega 3 Fish Oil",
    nameFr: "Oméga 3 Huile de Poisson",
    description: "High quality omega-3 fatty acids for heart and brain health.",
    descriptionFr: "Acides gras oméga-3 de haute qualité pour le cœur et le cerveau.",
    price: 120,
    originalPrice: 150,
    rating: 4.7,
    reviewCount: 312,
    category: "vitamins",
    image: "/images/omega3.jpg",
    isBestSeller: true,
    isFeatured: true,
    stock: 30,
  },
  {
    id: "4",
    name: "Pre-Workout Extreme",
    nameFr: "Pré-entraînement Extrême",
    description: "High-energy pre-workout formula with caffeine and beta-alanine.",
    descriptionFr: "Formule pré-entraînement haute énergie avec caféine et bêta-alanine.",
    price: 290,
    rating: 4.6,
    reviewCount: 156,
    category: "preworkout",
    image: "/images/preworkout.jpg",
    isBestSeller: true,
    stock: 60,
    flavors: ["Watermelon", "Blue Raspberry", "Peach"],
    weight: "300g",
  },
  {
    id: "5",
    name: "Vitamin D3 + K2",
    nameFr: "Vitamine D3 + K2",
    description: "Essential vitamin D3 and K2 for bone health and immunity.",
    descriptionFr: "Vitamine D3 et K2 essentiels pour les os et l'immunité.",
    price: 95,
    rating: 4.9,
    reviewCount: 98,
    category: "vitamins",
    image: "/images/vitamind3.jpg",
    badge: "Exclusive",
    badgeFr: "Exclusif",
    isFeatured: true,
    stock: 20,
  },
  {
    id: "6",
    name: "BCAA 2:1:1",
    nameFr: "BCAA 2:1:1",
    description: "Branch chain amino acids for muscle recovery and anti-catabolism.",
    descriptionFr: "Acides aminés branchés pour la récupération musculaire.",
    price: 210,
    rating: 4.5,
    reviewCount: 267,
    category: "recovery",
    image: "/images/bcaa.jpg",
    isBestSeller: true,
    stock: 45,
    flavors: ["Lemon", "Orange", "Berry"],
    weight: "400g",
  },
  {
    id: "7",
    name: "Thermogenic Fat Burner",
    nameFr: "Brûleur de Graisse Thermogénique",
    description: "Advanced fat burning formula to accelerate your metabolism.",
    descriptionFr: "Formule avancée de brûlage des graisses pour accélérer le métabolisme.",
    price: 250,
    rating: 4.8,
    reviewCount: 143,
    category: "fatburner",
    image: "/images/fatburner.jpg",
    isFeatured: true,
    stock: 35,
  },
  {
    id: "8",
    name: "Magnesium Bisglycinate",
    nameFr: "Bisglycinate de Magnésium",
    description: "High absorption magnesium for sleep, recovery and muscle function.",
    descriptionFr: "Magnésium haute absorption pour le sommeil et la récupération.",
    price: 85,
    rating: 4.7,
    reviewCount: 201,
    category: "vitamins",
    image: "/images/magnesium.jpg",
    badge: "Trending",
    badgeFr: "Tendance",
    isBestSeller: true,
    stock: 55,
  },
];
