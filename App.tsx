import React, { useState, useRef } from 'react';
import { 
  Wand2, Download, Sparkles, ImageIcon, Trash2, Loader2, Maximize, Target, Gem, Tag, 
  Lightbulb, TrendingUp, DollarSign, XCircle, Check, Camera, User, ImagePlus, Package, 
  Layers, Palette, PenTool, Type, AlignLeft, Component
} from 'lucide-react';

import { 
  AD_SIZES, CTA_STYLES, AESTHETIC_STYLES, MODEL_TYPES, SCENARIO_TYPES, VISUAL_MODES 
} from './constants';
import { generateMarketingData, generateCreative } from './services/gemini';
import { StepCard } from './components/StepCard';
import { CustomInput } from './components/CustomInput';
import { SelectorButton } from './components/SelectorButton';

const MAX_IMAGES = 8;

export default function App() {
  // --- State Management ---
  const [productImages, setProductImages] = useState<string[]>([]); 
  const [uploadedLogo, setUploadedLogo] = useState<string | null>(null); 
  const [uploadedFaceImage, setUploadedFaceImage] = useState<string | null>(null); 
  const [generatedAdImage, setGeneratedAdImage] = useState<string | null>(null);
  
  // Settings
  const [selectedModeId, setSelectedModeId] = useState(VISUAL_MODES[2].id); 
  const [selectedSize, setSelectedSize] = useState(AD_SIZES[0].id);
  const [selectedAestheticId, setSelectedAestheticId] = useState(AESTHETIC_STYLES[0].id); 
  
  // Model Photoshoot States
  const [selectedModelType, setSelectedModelType] = useState(MODEL_TYPES[0].id);
  const [selectedScenarioType, setSelectedScenarioType] = useState(SCENARIO_TYPES[0].id);
  const [customModelPrompt, setCustomModelPrompt] = useState(''); 

  // Content Writer States
  const [contentWriterMode, setContentWriterMode] = useState<'write-text' | 'without-text'>('without-text');
  const [adHook, setAdHook] = useState(''); 
  
  // Banner/CTA States
  const [selectedCtaStyle, setSelectedCtaStyle] = useState(CTA_STYLES[0].id);
  const [adText, setAdText] = useState('SHOP NOW');
  const [includeCta, setIncludeCta] = useState(true); 
  
  // Branding States
  const [includeLogo, setIncludeLogo] = useState(false); 
  const [includeWatermarkText, setIncludeWatermarkText] = useState(false); 
  const [brandWatermark, setBrandWatermark] = useState('Rubel.shop'); 

  // Marketing States
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState(''); 
  const [keywords, setKeywords] = useState('');
  const [isMarketingProcessing, setIsMarketingProcessing] = useState(false);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faceInputRef = useRef<HTMLInputElement>(null); 

  // Derived Data
  const selectedMode = VISUAL_MODES.find(m => m.id === selectedModeId)!;
  const selectedAesthetic = AESTHETIC_STYLES.find(s => s.id === selectedAestheticId)!;
  
  const isBannerMode = selectedMode.type === 'banner';
  const isModelShotMode = selectedMode.type === 'model-shot';
  const isActionMode = selectedMode.type === 'action';
  const isComboMode = selectedMode.type === 'combo'; 
  const selectedSizeData = AD_SIZES.find(s => s.id === selectedSize)!;
  const selectedCtaStyleData = CTA_STYLES.find(c => c.id === selectedCtaStyle)!;

  // --- Handlers ---

  const handleMarketingAnalysis = async () => {
    if (productImages.length === 0) return;

    setIsMarketingProcessing(true);
    setProductName('');
    setDescription('');
    setKeywords('');
    setAdHook('');
    setError(null);
    
    try {
      let extraContext = "";
      if (productImages.length > 1) {
          extraContext = `Note: ${productImages.length} images provided. Treat as a bundle/combo. Focus description on value and variety.`;
      }
      
      const result = await generateMarketingData(productImages[0], extraContext);

      if (result) {
        setProductName(result.productName || '');
        setDescription(result.longDescription || '');
        setKeywords(result.keywords || '');
        setAdHook(result.visualHook || '');
        
        if (result.visualHook) {
            setContentWriterMode('write-text');
        }
      }
    } catch (e) {
      console.error("Marketing API Error:", e);
      setError("Failed to generate marketing data. Please try again.");
    } finally {
      setIsMarketingProcessing(false);
    }
  };

  const handleGenerateCreative = async () => {
    if (productImages.length === 0) {
        setError("Please upload at least one product image.");
        return;
    }
    
    if (selectedModeId === 'model-face-swap' && !uploadedFaceImage) {
        setError("Please upload a face reference image for the 'Model (Face Reference)' mode.");
        return;
    }

    setIsProcessing(true);
    setError(null);
    setGeneratedAdImage(null);
    
    try {
      let finalPrompt = '';
      const aestheticPrompt = selectedAesthetic ? selectedAesthetic.prompt : "a professional, high-quality aesthetic";
      const negativePrompt = "Do NOT display any prices, currency symbols, dollar signs, cost numbers, or price tags.";

      // Content Writer
      let contentWriterInstructions = "";
      if (contentWriterMode === 'write-text') {
          const hookText = adHook.trim() || productName.trim() || "SPECIAL OFFER";
          contentWriterInstructions = `
            **TYPOGRAPHY INSTRUCTION**: You MUST render the text "${hookText}" clearly and artistically on the image. 
            Integrate the text into the composition using a font style that matches the ${selectedAesthetic.name} vibe. 
            Ensure the text is legible, correctly spelled, and visually balanced.
          `;
      } else {
          contentWriterInstructions = `
            **NO TEXT INSTRUCTION**: Do NOT render any headlines, slogans, body copy, or floating text on the background. 
            Keep the composition clean of typography.
          `;
      }

      // Prompt Construction
      if (isComboMode) {
          finalPrompt = 
            `Generate an **ultra high-resolution, professional "Combo/Collection" product advertisement**.
            The final image must have an aspect ratio of **${selectedSizeData.ratio}** (e.g., ${selectedSizeData.promptRatio}).
            **Layout**: ${selectedMode.promptStyle}
            **Style**: Apply ${aestheticPrompt}.
            **Content Writer**: ${contentWriterInstructions}
            **Negative Constraint**: ${negativePrompt}
            `;

          if (includeCta && adText) {
            finalPrompt += ` Integrate a clear **Call-to-Action (CTA)** button: "${selectedCtaStyleData.prompt}". Text: "${adText.toUpperCase()}".`;
          }
          if (includeLogo && uploadedLogo) finalPrompt += ` Composite the provided logo image subtly in the top-right corner.`;
          else if (includeWatermarkText && brandWatermark) finalPrompt += ` Add text watermark "${brandWatermark}" cleanly in the corner.`;

      } else if (isBannerMode) {
        finalPrompt = 
          `Generate an **ultra high-resolution, photorealistic, high-impact** social media ad banner. 
          Aspect Ratio: **${selectedSizeData.ratio}** (${selectedSizeData.promptRatio}).
          Focus: The product shown in the **input images**. Render a perfect, high-fidelity instance of it.
          **Layout**: "${selectedMode.promptStyle}".
          **Style**: Infuse this with ${aestheticPrompt}.
          **Content Writer**: ${contentWriterInstructions}
          **Negative Constraint**: ${negativePrompt}`;

        if (includeCta && adText) finalPrompt += ` Integrate a **Call-to-Action (CTA)**: "${selectedCtaStyleData.prompt}". Text: "${adText.toUpperCase()}".`;
        if (includeLogo && uploadedLogo) finalPrompt += ` Composite the provided logo image subtly in the top-right corner.`;
        else if (includeWatermarkText && brandWatermark) finalPrompt += ` Add text watermark "${brandWatermark}" cleanly in the corner.`;
        
      } else if (isModelShotMode) {
          const selectedModel = MODEL_TYPES.find(m => m.id === selectedModelType)!;
          const selectedScenario = SCENARIO_TYPES.find(s => s.id === selectedScenarioType)!;
          let posePrompt = customModelPrompt.trim() || 'in a natural, candid pose, happily interacting with the product'; 

          finalPrompt = `Generate an **ultra high-resolution, professional, lifestyle photograph**. Aspect Ratio: **${selectedSizeData.ratio}**. 
          Feature ${selectedModel.prompt} ${selectedScenario.prompt}. 
          The model is **${posePrompt}**. 
          Render the product from the input images expertly into the scene. 
          **Content Writer**: ${contentWriterInstructions}
          **Style**: ${aestheticPrompt}.
          ${negativePrompt}`;

          if (selectedModeId === 'model-face-swap' && uploadedFaceImage) {
              finalPrompt += ` Use the **face reference image input** for the model's face.`;
          }

      } else {
        // Cleanup / Action
        finalPrompt = `${selectedMode.promptStyle}. Use provided product images. High resolution. ${negativePrompt}`;
      }

      const imageUrl = await generateCreative({
        prompt: finalPrompt,
        productImages,
        logoImage: (isBannerMode || isComboMode) && includeLogo && uploadedLogo ? uploadedLogo : undefined,
        faceImage: selectedModeId === 'model-face-swap' && uploadedFaceImage ? uploadedFaceImage : undefined,
        aspectRatio: selectedSizeData.ratio
      });

      if (imageUrl) {
        setGeneratedAdImage(imageUrl);
      }
      
    } catch (e: any) {
      console.error("Visual API Error:", e);
      // Clean up error message for display
      const msg = e.message || String(e);
      setError(msg.replace("Error:", "").trim());
    } finally {
      setIsProcessing(false);
    }
  };

  // --- Helpers ---
  const handleProductImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files: File[] = e.target.files ? Array.from(e.target.files) : [];
    if (files.length === 0) return;

    const slotsAvailable = MAX_IMAGES - productImages.length;
    const filesToProcess = files.slice(0, slotsAvailable);

    filesToProcess.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setProductImages(prev => [...prev, event.target!.result as string]);
            setProductName('');
            setDescription('');
            setKeywords('');
            setAdHook('');
          }
        };
        reader.readAsDataURL(file);
      }
    });
    e.target.value = ''; 
  };

  const removeProductImage = (indexToRemove: number) => {
    setProductImages(prev => prev.filter((_, index) => index !== indexToRemove));
  };
  
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
            if (event.target?.result) {
                setUploadedLogo(event.target.result as string);
                setIncludeLogo(true); 
            }
        };
        reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const handleFaceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
            if (event.target?.result) {
               setUploadedFaceImage(event.target.result as string);
            }
        };
        reader.readAsDataURL(file);
    }
    e.target.value = '';
  };
  
  const clearAllImages = () => {
    setProductImages([]);
    setGeneratedAdImage(null);
    setProductName('');
    setDescription('');
    setKeywords('');
    setAdHook('');
  };

  const downloadAd = () => {
    if (generatedAdImage) {
      const link = document.createElement('a');
      link.download = `rubel-creative-${selectedModeId}-${Date.now()}.png`;
      link.href = generatedAdImage;
      link.click();
    }
  };

  return (
    <div className="min-h-screen font-sans bg-gray-50 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="text-center mb-12 animate-fade-in-down">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Component className="text-pink-600" size={40} />
            <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text text-transparent">
              Rubel Product Creative Studio
            </h1>
          </div>
          <p className="text-gray-600 text-base sm:text-lg">
            AI-Powered **Deep Image Recognition**, Visual Design, and **Content Writing**.
          </p>
        </header>

        {/* Main Grid Layout */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Panel - Controls */}
          <div className="space-y-6">
            
            {/* STEP 1: Product & Marketing */}
            <StepCard number={1} title="Product Images & Deep Analysis" icon={<Lightbulb size={24} className="text-purple-600" />}>
                
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                        <ImageIcon size={18}/> Product Images 
                        <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{productImages.length} / {MAX_IMAGES}</span>
                    </h3>
                    {productImages.length > 0 && (
                        <button onClick={clearAllImages} className="text-xs text-red-500 hover:text-red-700 font-medium">Clear All</button>
                    )}
                </div>

                {/* Upload Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                    {productImages.length < MAX_IMAGES && (
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="aspect-square border-2 border-dashed border-purple-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-purple-50 hover:border-purple-500 transition-all group"
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleProductImageUpload}
                                className="hidden" 
                            />
                            <ImagePlus size={24} className="text-purple-400 group-hover:text-purple-600 mb-1" />
                            <span className="text-xs font-semibold text-purple-500 group-hover:text-purple-700">Add Image</span>
                        </div>
                    )}

                    {productImages.map((img, idx) => (
                        <div key={idx} className="relative aspect-square rounded-xl border border-gray-200 overflow-hidden group shadow-sm hover:shadow-md transition-all">
                            <img src={img} alt={`Product ${idx}`} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button 
                                    onClick={() => removeProductImage(idx)}
                                    className="bg-white/90 p-1.5 rounded-full text-red-500 hover:text-red-700 hover:scale-110 transition-transform"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                            <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1.5 rounded-full font-bold">
                                {idx + 1}
                            </div>
                        </div>
                    ))}
                    
                    {Array.from({ length: Math.max(0, (productImages.length > 3 ? MAX_IMAGES : 4) - productImages.length - 1) }).map((_, i) => (
                        <div key={`empty-${i}`} className="aspect-square border border-gray-100 bg-gray-50 rounded-xl flex items-center justify-center">
                           <div className="w-2 h-2 bg-gray-200 rounded-full"></div>
                        </div>
                    ))}
                </div>

                {productImages.length > 0 && (
                     <div className="flex justify-between items-center text-xs font-medium mb-4">
                        <span className="text-green-600 flex items-center gap-1"><Check size={12}/> {productImages.length} image(s) ready.</span>
                        {productImages.length > 1 && (
                            <span className="text-purple-600 flex items-center gap-1 animate-pulse"><Layers size={12}/> Multi-product mode available</span>
                        )}
                     </div>
                )}
                
                {/* 1B: Marketing Data Generation */}
                <div className="mt-6 border-t pt-4 border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2"><TrendingUp size={18}/> Deep Marketing Insights</h3>
                    <button
                        onClick={handleMarketingAnalysis}
                        disabled={productImages.length === 0 || isMarketingProcessing}
                        className={`w-full py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300 ${
                            productImages.length > 0 && !isMarketingProcessing
                            ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg active:scale-[0.99]'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                    >
                        {isMarketingProcessing ? <Loader2 size={20} className="animate-spin" /> : <DollarSign size={20} />}
                        {isMarketingProcessing ? 'Analyzing Visuals...' : 'Generate Long Desc, Hook & SEO'}
                    </button>

                    <div className="mt-4 space-y-3">
                        <CustomInput
                            label="Product Name"
                            value={productName}
                            onChange={(e) => setProductName(e.target.value)}
                            placeholder="Suggested Product Name"
                        />
                        <CustomInput
                            label="Long Description (Sales Copy)"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Detailed, benefit-driven description (100+ words)"
                            type="textarea"
                            rows={6}
                        />
                        <div className="grid grid-cols-2 gap-3">
                             <CustomInput
                                label="Visual Ad Hook (for Image)"
                                value={adHook}
                                onChange={(e) => setAdHook(e.target.value)}
                                placeholder="Short punchy headline"
                            />
                            <CustomInput
                                label="SEO Keywords"
                                value={keywords}
                                onChange={(e) => setKeywords(e.target.value)}
                                placeholder="Tags..."
                            />
                        </div>
                    </div>
                </div>
            </StepCard>

            {/* STEP 2: Visual Operation */}
            <StepCard number={2} title="Select Visual Operation" icon={<Sparkles size={24} className="text-purple-600" />}>
                
                <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2"><Maximize size={18}/> Output Size</h3>
                <div className="grid grid-cols-3 gap-3">
                    {AD_SIZES.map((size) => (
                    <button
                        key={size.id}
                        onClick={() => setSelectedSize(size.id)}
                        disabled={isProcessing}
                        className={`p-3 rounded-xl border-4 transition-all duration-200 text-center focus:outline-none ${
                        selectedSize === size.id
                            ? 'border-pink-600 bg-pink-50 shadow-md scale-[1.05]'
                            : 'border-gray-100 hover:border-pink-300 bg-white hover:shadow-sm'
                        }`}
                    >
                        <p className="font-bold text-base">{size.ratio}</p>
                        <p className="text-xs text-gray-600">{size.name}</p>
                    </button>
                    ))}
                </div>

                <h3 className="text-lg font-semibold text-gray-700 mt-6 mb-3 flex items-center gap-2"><Wand2 size={18}/> Select Operation Mode</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[...new Set(VISUAL_MODES.map(m => m.group))].map((groupName, index) => {
                    const groupModes = VISUAL_MODES.filter(m => m.group === groupName);

                    return (
                        <div key={index} className="col-span-full">
                            <h4 className="text-md font-bold text-gray-500 mt-4 mb-2 border-b border-gray-200 pb-1 flex items-center gap-2">
                                {groupName}
                                {groupName.includes('Combo') && <span className="bg-gradient-to-r from-orange-400 to-red-500 text-white text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">Multi-Item</span>}
                            </h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {groupModes.map((mode) => (
                                <button
                                    key={mode.id}
                                    onClick={() => setSelectedModeId(mode.id)}
                                    disabled={isProcessing}
                                    title={mode.name}
                                    className={`p-3 rounded-xl border-4 transition-all duration-200 text-center focus:outline-none flex flex-col items-center justify-between min-h-[90px] ${
                                        mode.id === selectedModeId
                                            ? 'border-purple-600 shadow-lg scale-[1.02] bg-purple-50'
                                            : 'border-gray-100 hover:border-purple-300 bg-white hover:shadow-md'
                                    }`}
                                >
                                    <div className={`mt-2 ${mode.type === 'combo' ? 'text-orange-600' : 'text-gray-700'}`}>
                                        {mode.icon}
                                    </div>
                                    <p className="text-xs font-semibold text-gray-700 leading-tight pb-1">{mode.name}</p>
                                </button>
                            ))}
                            </div>
                        </div>
                    );
                  })}
                </div>

                {/* Aesthetic Selector */}
                {(isComboMode || isBannerMode) && (
                    <div className="mt-6 animate-fade-in">
                        <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2"><Palette size={18}/> Aesthetic Style</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {AESTHETIC_STYLES.map((style) => (
                                <button
                                    key={style.id}
                                    onClick={() => setSelectedAestheticId(style.id)}
                                    disabled={isProcessing}
                                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 border-2 ${
                                        selectedAestheticId === style.id
                                            ? 'bg-indigo-100 border-indigo-500 text-indigo-700'
                                            : 'bg-white border-gray-200 text-gray-600 hover:border-indigo-200'
                                    }`}
                                >
                                    {style.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </StepCard>

            {/* STEP 3: Customize & Generate */}
            <StepCard number={3} title="Customize & Finalize" icon={<Tag size={24} className="text-pink-600" />}>
                
                {/* 3A. MODEL PHOTOSHOOT CONTROLS */}
                {isModelShotMode && (
                    <div className="p-4 mb-6 border border-red-100 rounded-lg bg-red-50 space-y-4 animate-fade-in">
                        <h3 className="text-lg font-bold text-red-800 flex items-center gap-2"><Camera size={20}/> Model Photoshoot Settings</h3>
                        
                        {/* WARNING for Face Swap */}
                        {selectedModeId === 'model-face-swap' && (
                            <>
                                <p className="text-sm text-red-700 bg-red-100 p-2 rounded-lg font-medium border border-red-300">
                                    ⚠️ **Identity Warning:** Face swap accuracy varies. The AI uses your image as a loose reference.
                                </p>
                                <div className="border border-red-200 p-3 rounded-lg bg-white">
                                    <h4 className="text-md font-semibold text-gray-700 mb-2 flex items-center gap-1"><User size={16}/> Upload Face Reference (Required)</h4>
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => faceInputRef.current?.click()} disabled={isProcessing} className="px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors">
                                            Choose Face Image
                                        </button>
                                        <input ref={faceInputRef} type="file" accept="image/*" onChange={handleFaceUpload} className="hidden" />
                                    </div>
                                    {uploadedFaceImage && (
                                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-red-300 mt-2">
                                            <div className="flex items-center gap-3">
                                                <Check size={16} className="text-red-600"/>
                                                <span className="text-xs font-medium text-red-700">Face Ref uploaded.</span>
                                                <img src={uploadedFaceImage} alt="Face Preview" className="h-6 w-6 object-cover rounded-full border" />
                                            </div>
                                            <button onClick={() => setUploadedFaceImage(null)} className="text-sm text-red-500 hover:text-red-700 p-1 flex items-center gap-1"><Trash2 size={14}/></button>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                        
                        <div>
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-1">Model Type</label>
                            <div className="grid grid-cols-2 gap-3 mt-1">
                                {MODEL_TYPES.map((type) => (
                                    <SelectorButton key={type.id} id={type.id} current={selectedModelType} name={type.name} onClick={setSelectedModelType} disabled={isProcessing} />
                                ))}
                            </div>
                        </div>
                        
                        <div className="pt-2 border-t border-red-200">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-1">Define Pose/Vibe</label>
                            <CustomInput
                                label=""
                                value={customModelPrompt}
                                onChange={(e) => setCustomModelPrompt(e.target.value)}
                                placeholder="e.g., dynamic power pose looking at camera"
                                disabled={isProcessing}
                                type="textarea"
                            />
                        </div>

                        <div className='pt-2 border-t border-red-200'>
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-1">Scenario/Background</label>
                            <div className="grid grid-cols-3 gap-3 mt-1">
                                {SCENARIO_TYPES.map((scenario) => (
                                    <SelectorButton key={scenario.id} id={scenario.id} current={selectedScenarioType} name={scenario.name} onClick={setSelectedScenarioType} disabled={isProcessing} />
                                ))}
                            </div>
                        </div>
                    </div>
                )}


                {/* 3B. BANNER & COMBO MODE CONTROLS */}
                {(isBannerMode || isComboMode) && (
                    <div className="space-y-6 animate-fade-in">
                        
                        {isComboMode && (
                             <div className="p-4 border border-orange-100 rounded-lg bg-orange-50 animate-fade-in">
                                <h3 className="text-lg font-bold text-orange-800 flex items-center gap-2 mb-2"><Package size={20}/> Package Settings</h3>
                                <p className="text-sm text-orange-700">AI will arrange <strong>{productImages.length} items</strong> using <strong>{selectedMode.name}</strong> layout.</p>
                             </div>
                        )}
                        
                        {/* --- CONTENT WRITER --- */}
                        <div className="p-4 border border-indigo-100 rounded-lg bg-indigo-50">
                             <h3 className="text-lg font-bold text-indigo-800 flex items-center gap-2 mb-3"><PenTool size={20}/> Content Writer</h3>
                             
                             <div className="flex gap-4 mb-4">
                                <button
                                    onClick={() => setContentWriterMode('write-text')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 transition-all ${
                                        contentWriterMode === 'write-text'
                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                                        : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
                                    }`}
                                >
                                    <Type size={18} />
                                    <span className="font-semibold text-sm">Write Text (Hook)</span>
                                </button>
                                
                                <button
                                    onClick={() => setContentWriterMode('without-text')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 transition-all ${
                                        contentWriterMode === 'without-text'
                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                                        : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
                                    }`}
                                >
                                    <AlignLeft size={18} className="opacity-50" />
                                    <span className="font-semibold text-sm">Without Text</span>
                                </button>
                             </div>

                             {contentWriterMode === 'write-text' && (
                                 <div className="bg-white p-3 rounded-lg border border-indigo-200 animate-fade-in">
                                     <CustomInput
                                        label="Hooking Text to Render"
                                        value={adHook}
                                        onChange={(e) => setAdHook(e.target.value)}
                                        placeholder="e.g. UNLEASH POWER"
                                        disabled={isProcessing}
                                     />
                                     <p className="text-xs text-indigo-600 mt-2 flex items-center gap-1">
                                        <Sparkles size={12}/> The AI will artistically render this text onto the image.
                                     </p>
                                 </div>
                             )}
                             
                             {contentWriterMode === 'without-text' && (
                                  <div className="bg-white p-3 rounded-lg border border-gray-200 animate-fade-in text-sm text-gray-500 italic">
                                     The creative will be generated cleanly without any headline typography.
                                  </div>
                             )}
                        </div>

                        {/* CTA Controls */}
                        <div className="p-4 border border-blue-100 rounded-lg bg-blue-50">
                            <h3 className="text-lg font-bold text-blue-800 flex items-center gap-2 mb-3"><Target size={20}/> CTA Controls</h3>
                            <div className="flex items-center mb-3">
                                <input type="checkbox" id="includeCta" checked={includeCta} onChange={(e) => setIncludeCta(e.target.checked)} disabled={isProcessing} className="h-5 w-5 text-purple-600 rounded focus:ring-purple-500 cursor-pointer"/>
                                <label htmlFor="includeCta" className="ml-2 text-gray-700 font-medium cursor-pointer">Include Call-to-Action Button</label>
                            </div>

                            {includeCta && (
                                <div className="space-y-4 pt-2 border-t border-blue-200">
                                    <CustomInput label="CTA Text (Max 20 chars)" value={adText} onChange={(e) => setAdText(e.target.value)} placeholder="SHOP NOW" disabled={isProcessing} maxLength={20}/>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">CTA Button Style</label>
                                        <div className="grid grid-cols-2 gap-3 mt-1">
                                            {CTA_STYLES.map((style) => (
                                                <button key={style.id} onClick={() => setSelectedCtaStyle(style.id)} disabled={isProcessing} className={`p-2 rounded-xl border-3 transition-all duration-200 text-center text-xs font-semibold ${selectedCtaStyle === style.id ? 'border-blue-600 bg-blue-100' : 'border-gray-200 hover:border-blue-300 bg-white'}`}>{style.name}</button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        {/* Branding */}
                        <div className="p-4 border border-teal-100 rounded-lg bg-teal-50">
                            <h3 className="text-lg font-bold text-teal-800 flex items-center gap-2 mb-3"><Gem size={20}/> Branding Options</h3>
                            <div className="mb-4 pb-4 border-b border-teal-200">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center">
                                        <input type="checkbox" id="includeLogo" checked={includeLogo && !!uploadedLogo} onChange={() => {
                                            if (!includeLogo && !uploadedLogo) logoInputRef.current?.click();
                                            setIncludeLogo(!includeLogo);
                                        }} disabled={isProcessing} className="h-5 w-5 text-teal-600 rounded focus:ring-teal-500 cursor-pointer"/>
                                        <label htmlFor="includeLogo" className="ml-2 text-gray-700 font-medium cursor-pointer">Include Transparent Logo Image</label>
                                    </div>
                                    {uploadedLogo && ( <button onClick={() => { setUploadedLogo(null); setIncludeLogo(false); }} className="text-sm text-red-500 hover:text-red-700 p-1 flex items-center gap-1"><Trash2 size={16}/> Clear</button> )}
                                </div>
                                <div className="block w-full text-sm text-gray-500 bg-teal-50 hover:bg-teal-100 p-2 rounded-lg cursor-pointer border border-teal-200 text-center transition-colors" onClick={() => logoInputRef.current?.click()}>
                                    {uploadedLogo ? "Change Logo File" : "Choose Logo File"}
                                </div>
                                <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden"/>
                                {uploadedLogo && (
                                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-teal-300 mt-2">
                                        <div className="flex items-center gap-3">
                                            <Check size={20} className="text-teal-600"/>
                                            <span className="text-sm font-medium text-teal-700">Logo Ready.</span>
                                            <img src={uploadedLogo} alt="Logo Preview" className="h-8 object-contain border rounded" />
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div>
                                <div className="flex items-center mb-2">
                                    <input type="checkbox" id="includeWatermarkText" checked={includeWatermarkText} onChange={() => setIncludeWatermarkText(!includeWatermarkText)} disabled={isProcessing} className="h-5 w-5 text-teal-600 rounded focus:ring-teal-500 cursor-pointer"/>
                                    <label htmlFor="includeWatermarkText" className="ml-2 text-gray-700 font-medium cursor-pointer">Include Simple Text Watermark</label>
                                </div>
                                {includeWatermarkText && ( <CustomInput label="Watermark Text" value={brandWatermark} onChange={(e) => setBrandWatermark(e.target.value)} placeholder="Brand Name" disabled={isProcessing} maxLength={30}/> )}
                            </div>
                        </div>
                    </div>
                )}
                
                {isActionMode && (
                    <div className="p-4 mb-6 border border-yellow-100 rounded-lg bg-yellow-50 text-yellow-800 animate-fade-in">
                        <h4 className="font-bold flex items-center gap-2"><XCircle size={18}/> Action Mode Activated</h4>
                        <p className="text-sm mt-1">CTA and Branding controls are disabled. The AI will focus solely on the **"{selectedMode.name}"** task.</p>
                    </div>
                )}

                <button
                onClick={handleGenerateCreative}
                disabled={productImages.length === 0 || isProcessing || (selectedModeId === 'model-face-swap' && !uploadedFaceImage)}
                className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300 mt-6 shadow-md ${
                    (productImages.length > 0 && !isProcessing && !(selectedModeId === 'model-face-swap' && !uploadedFaceImage))
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-xl hover:shadow-purple-400/50 hover:-translate-y-0.5 active:scale-[0.98]'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
                >
                {isProcessing ? <Loader2 size={24} className="animate-spin" /> : <Wand2 size={24} />}
                {isProcessing ? 'Processing Visual...' : 'Generate New Creative'}
                </button>

                {error && (
                <div className="p-4 bg-red-100 text-red-700 rounded-lg font-medium text-center border border-red-300 mt-4 animate-shake">
                    {error}
                </div>
                )}
            </StepCard>
          </div>

          {/* Right Panel - Preview */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 lg:h-full lg:sticky lg:top-4 transition-all duration-500">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Live Preview</h2>
              {generatedAdImage && (
                <button
                  onClick={downloadAd}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors shadow-md hover:shadow-lg"
                >
                  <Download size={20} />
                  Download PNG
                </button>
              )}
            </div>
            
            <p className="text-sm text-gray-500 mb-4">
                Current Mode: **{selectedMode.group}** / Format: **{selectedSizeData.name} ({selectedSizeData.ratio})**
            </p>

            <div 
              className="bg-gray-100 rounded-xl flex items-center justify-center w-full mx-auto overflow-hidden relative transition-all duration-500" 
              style={{ aspectRatio: selectedSizeData.ratio.replace(':','/'), maxWidth: '600px', minHeight: '300px' }}
            >
              {(isProcessing || isMarketingProcessing) && (
                <div className="text-center p-8 absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-10 animate-fade-in">
                  <Loader2 size={48} className="mx-auto mb-4 animate-spin text-purple-500" />
                  <p className="font-semibold text-lg text-purple-600">
                    Rubel is processing...
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    {isProcessing ? `Creating: ${selectedMode.name}` : `Analyzing Visuals...`}
                  </p>
                </div>
              )}
              
              {productImages.length === 0 && !isProcessing && !isMarketingProcessing && (
                <div className="text-center text-gray-400 p-8">
                  <ImageIcon size={64} className="mx-auto mb-4 opacity-30" />
                  <p className="font-semibold text-lg opacity-60">Upload photos to start!</p>
                </div>
              )}

              {generatedAdImage && !isProcessing && (
                <img
                  src={generatedAdImage}
                  alt={`AI Generated Ad Creative (${selectedSizeData.name})`}
                  className="w-full h-full object-contain shadow-2xl animate-fade-in-up"
                />
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-gray-400 pb-8">
          <p className="text-sm">
            Powered by the **Deshi AI** Image and Text Generation APIs.
          </p>
        </footer>
      </div>
    </div>
  );
}