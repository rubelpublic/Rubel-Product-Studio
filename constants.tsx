import React from 'react';
import { 
  Layers, Grid, Newspaper, BookOpen, Gamepad2, Aperture, Monitor, Zap, HeartCrack, Camera, User, Feather 
} from 'lucide-react';

export const AD_SIZES = [
  { id: 'square', name: 'Square (1:1)', ratio: '1:1', promptRatio: '1080x1080', description: 'Instagram/Facebook Feed' },
  { id: 'vertical', name: 'Vertical (3:4)', ratio: '3:4', promptRatio: '1080x1350', description: 'Optimal Feed Post' },
  { id: 'story', name: 'Story/Reel (9:16)', ratio: '9:16', promptRatio: '1080x1920', description: 'Full Screen Mobile' },
];

export const CTA_STYLES = [
  { id: 'red-rounded', name: 'Red Rounded', prompt: 'a prominent, softly rounded, vibrant RED button' },
  { id: 'blue-sharp', name: 'Blue Sharp', prompt: 'a sharp, rectangular, electric CYAN-BLUE button with slight metallic texture' },
  { id: 'white-ghost', name: 'White Ghost', prompt: 'a clean, translucent WHITE button with a thin border, placed over the image' },
  { id: 'gold-luxury', name: 'Gold Luxury', prompt: 'a luxurious, glossy GOLD gradient button with subtle depth and shadow' },
  { id: 'playful-pop', name: 'Playful Pop', prompt: 'a bubbly, 3D-style button in bright orange or yellow, perfect for kids products' },
];

export const AESTHETIC_STYLES = [
  { id: 'auto', name: '✨ Auto (AI Choice)', prompt: 'an aesthetic style that perfectly matches the product identity and target audience' },
  { id: 'minimalist', name: 'Minimalist & Clean', prompt: 'a clean, white-space dominant, modern minimalist aesthetic with soft shadows' },
  { id: 'luxury', name: 'Dark Luxury', prompt: 'a premium, high-end aesthetic with dark tones, gold accents, and dramatic lighting' },
  { id: 'vibrant', name: 'Vibrant Pop', prompt: 'an energetic, colorful, high-saturation "Pop Art" style aesthetic' },
  { id: 'organic', name: 'Nature & Organic', prompt: 'a fresh, natural aesthetic with botanical elements, wood textures, and soft sunlight' },
  { id: 'tech', name: 'Future Tech', prompt: 'a sleek, neon-lit, cyberpunk or high-tech aesthetic with glowing elements' },
  { id: 'vintage', name: 'Retro / Vintage', prompt: 'a nostalgic, warm, retro aesthetic with film grain and muted classic tones' },
  { id: 'thumbnail', name: 'Thumbnail', prompt: 'a professional, high-click-through-rate YouTube thumbnail aesthetic with high contrast, vibrant colors, emotive elements, and a composition designed to hook the viewer instantly' },
];

export const MODEL_TYPES = [
    { id: 'bangladeshi-f', name: 'Female (Bangladeshi)', prompt: 'a beautiful Bangladeshi woman' },
    { id: 'bangladeshi-m', name: 'Male (Bangladeshi)', prompt: 'a handsome Bangladeshi man' },
    { id: 'bangladeshi-kid', name: 'Kid/Baby (Bangladeshi)', prompt: 'a cute, happy Bangladeshi child' },
];

export const SCENARIO_TYPES = [
    { id: 'cozy-home', name: 'Cozy Home', prompt: 'in a brightly lit, modern minimalist living room' },
    { id: 'outdoor-adventure', name: 'Outdoor Adventure', prompt: 'on a misty mountain trail at sunrise' },
    { id: 'office-desk', name: 'Professional Desk', prompt: 'at a clean, ergonomic home office desk' },
    { id: 'gym', name: 'Modern Gym', prompt: 'in a clean, well-equipped modern gym during a workout' },
    { id: 'cafe', name: 'Urban Cafe', prompt: 'in a trendy, sunlit European-style cafe' },
    { id: 'playground', name: 'Sunny Playground', prompt: 'playing happily in a colorful, sunny outdoor playground with soft bokeh' }, 
    { id: 'school-playroom', name: 'School/Playroom', prompt: 'in a bright, colorful preschool classroom or playroom filled with educational vibes' },
];

export const VISUAL_MODES = [
  // --- COMBO / PACKAGE OFFERS (type: 'combo') ---
  { 
    group: 'Combo & Packages', 
    id: 'super-bundle', 
    name: 'Mega Combo Deal', 
    icon: <Layers size={20} />, 
    type: 'combo', 
    promptStyle: 'A **professional, high-value "Combo Offer" composition**. All uploaded images represent **DISTINCT items** included in this package. Arrange them together artfully (e.g., grouped together in a dynamic pile or structured arrangement) to show abundance and value. Use commercial product lighting (softbox/rim light) to separate items from the background.' 
  },
  { 
    group: 'Combo & Packages', 
    id: 'variety-collection', 
    name: 'Collection Showcase', 
    icon: <Grid size={20} />, 
    type: 'combo', 
    promptStyle: 'A **clean, organized "Knolling" or Grid-based composition**. Arrange the uploaded items in a neat, symmetrical pattern or a tidy flat-lay. This layout is perfect for showcasing variety, different colors, or a full product lineup. Ensure equal visual weight for each item.' 
  },

  // --- BANNER DESIGN TEMPLATES (type: 'banner') ---
  { group: 'Banner Design', id: 'traditional', name: 'Traditional / Classic', icon: <Newspaper size={20} />, type: 'banner', promptStyle: 'A **classic, trustworthy, and balanced advertisement design**. Use a standard rule-of-thirds composition with warm, welcoming lighting. The aesthetic is "Family Brand" or "Trusted Heritage". Avoid experimental angles—focus on a clear, honest, and high-quality presentation that feels safe and reliable.' },
  { group: 'Banner Design', id: 'editorial', name: 'Editorial / Magazine', icon: <BookOpen size={20} />, type: 'banner', promptStyle: 'An **ultra-chic, high-fashion "Magazine Editorial" composition**. Treat the product like a celebrity model. Use dramatic but soft lighting, interesting textures in the background (like marble, silk, or concrete), and a layout that mimics a spread in a premium fashion or tech magazine. High contrast, rich tones, and sophisticated negative space.' },
  { group: 'Banner Design', id: 'toy-specialist', name: 'Toy Specialist', icon: <Gamepad2 size={20} />, type: 'banner', promptStyle: 'An **enchanting, vibrant, and high-energy** banner. Use a **colorful, fun-filled background** with elements like soft clouds, stars, or abstract playful shapes.' },
  { group: 'Banner Design', id: 'elite-studio', name: 'Elite Studio Photo', icon: <Aperture size={20} />, type: 'banner', promptStyle: 'An **ultra high-resolution, hyper-photorealistic, high-end studio photography** shot. The background is a luxurious, seamless gradient. Emphasize crisp focus and rich material rendering.' },
  { group: 'Banner Design', id: 'dynamic-angles', name: 'Dynamic Angles', icon: <Monitor size={20} />, type: 'banner', promptStyle: 'An **ultra high-resolution, dynamic composition** using **unconventional camera angles**. Showcased with dramatic flair, bold lighting and deep shadows.' },
  { group: 'Banner Design', id: 'gen-z', name: 'Gen-Z Aesthetic', icon: <Zap size={20} />, type: 'banner', promptStyle: 'An **ultra high-resolution, vibrant, trendy, and playful creative** with a **Gen-Z aesthetic**. Use bright, contrasting colors and holographic textures.' },
  { group: 'Banner Design', id: 'cinematic', name: 'Cinematic Depth', icon: <Aperture size={20} />, type: 'banner', promptStyle: 'An **ultra high-resolution, professional, cinematic** creative using deep midnight blues and subtle gold accents. Use **dramatic spotlighting**.' },
  { group: 'Banner Design', id: 'social-hook', name: 'Social Hook', icon: <HeartCrack size={20} />, type: 'banner', promptStyle: 'An **attention-grabbing social media hook**. Bold, visually chaotic (in a compelling way), using highly contrasting colors to disrupt the feed.' },
  
  // --- MODEL PHOTOSHOOT (type: 'model-shot') ---
  { group: 'Model Photoshoot', id: 'model-ai-gen', name: 'AI Model Generator', icon: <Camera size={20} />, type: 'model-shot' },
  { group: 'Model Photoshoot', id: 'model-face-swap', name: 'Model (Face Reference)', icon: <User size={20} />, type: 'model-shot' },
  
  // --- IMAGE CLEANUP ACTIONS (type: 'action') ---
  { group: 'Image Cleanup', id: 'remove-bg', name: 'Remove Background', icon: <Feather size={20} />, type: 'action', promptStyle: 'Isolate the main product with sharp precision on a pure white background.' },
];