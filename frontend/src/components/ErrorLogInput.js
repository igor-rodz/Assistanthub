import { useState, useRef } from 'react';
import {
  Rocket,
  Database,
  Eye,
  Droplet,
  Plus,
  Sparkles,
  Clipboard,
  Info,
  ArrowLeft,
  AlertCircle,
  Image,
  X,
  Upload
} from 'lucide-react';
import { LiquidButton } from "@/components/ui/liquid-glass-button";
import ProceduralGroundBackground from "@/components/ui/ProceduralGroundBackground";

// Input Screen - One-Shot Fixes with Image Support
const ErrorLogInput = ({ onGenerate, onBack, user, onOpenProfile, error }) => {
  const [errorLog, setErrorLog] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const tags = [
    { id: 'deploy', label: 'Erro de Deploy', icon: Rocket },
    { id: 'database', label: 'Erro de Banco', icon: Database },
    { id: 'preview', label: 'Erro de Preview', icon: Eye },
    { id: 'hydration', label: 'Erro de Hydration', icon: Droplet },
  ];

  const toggleTag = (tagId) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(t => t !== tagId)
        : [...prev, tagId]
    );
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setErrorLog(text);
    } catch (err) {
      console.error('Failed to paste:', err);
    }
  };

  const handleImageSelect = (file) => {
    if (file && file.type.startsWith('image/')) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('Imagem muito grande. Máximo 10MB.');
        return;
      }

      setSelectedImage(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleImageSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleImageSelect(file);
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleGenerate = () => {
    // Require at least text OR image
    if (errorLog.trim() || selectedImage) {
      onGenerate({
        errorLog,
        tags: selectedTags,
        image: selectedImage
      });
    }
  };

  const canGenerate = errorLog.trim() || selectedImage;

  return (
    <div className="min-h-screen relative">
      <ProceduralGroundBackground />

      {/* Header */}
      <header className="relative z-10 flex items-center px-4 sm:px-6 lg:px-8 py-4 max-w-6xl mx-auto">
        <button
          onClick={onBack}
          className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          title="Voltar ao Dashboard"
        >
          <ArrowLeft className="w-5 h-5 text-white/60" />
        </button>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-6 py-2">
        {/* Hero Title */}
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              One-Shot Fixes
            </span>
          </h1>
          <p className="text-white/60 text-sm md:text-base max-w-2xl mx-auto">
            Cole seus logs de erro ou envie um screenshot para gerar prompts de correção.
          </p>
        </div>

        {/* Error Log Input Card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden mb-4">
          {/* Input Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="text-cyan-400 font-mono text-sm">&lt;/&gt;</span>
              <span className="text-white/80 text-sm font-medium">ENTRADA DE LOG DE ERRO</span>
            </div>
            <button
              onClick={handlePaste}
              className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <Clipboard className="w-4 h-4" />
              <span className="text-sm">Colar da Área de Transferência</span>
            </button>
          </div>

          {/* Text Area */}
          <textarea
            value={errorLog}
            onChange={(e) => setErrorLog(e.target.value)}
            placeholder={`// Cole seus logs de erro do Vercel, Console ou Supabase aqui...
ReferenceError: window is not defined
    at Page (./app/page.tsx:12:3)
...`}
            className="w-full h-40 bg-transparent text-white/90 font-mono text-sm p-4 resize-none focus:outline-none placeholder:text-white/30"
          />

          {/* Input Footer */}
          <div className="flex items-center justify-between px-4 py-2 border-t border-white/10">
            <div className="flex items-center gap-2 text-white/40 text-xs">
              <Info className="w-4 h-4" />
              <span>Texto e/ou imagem</span>
            </div>
            <span className="text-white/40 text-xs">{errorLog.length} caracteres</span>
          </div>
        </div>

        {/* Image Upload Section */}
        <div className="mb-4">
          <p className="text-white/50 text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
            <Image className="w-3 h-3" />
            SCREENSHOT DO ERRO (OPCIONAL)
          </p>

          {!imagePreview ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`
                relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all
                ${isDragging
                  ? 'border-cyan-400 bg-cyan-500/10'
                  : 'border-white/20 hover:border-white/40 hover:bg-white/5'
                }
              `}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
                className="hidden"
              />
              <Upload className={`w-8 h-8 mx-auto mb-2 ${isDragging ? 'text-cyan-400' : 'text-white/40'}`} />
              <p className="text-white/60 text-sm mb-1">
                {isDragging ? 'Solte a imagem aqui' : 'Arraste uma imagem ou clique para selecionar'}
              </p>
              <p className="text-white/30 text-xs">PNG, JPG, WEBP até 10MB</p>
            </div>
          ) : (
            <div className="relative bg-white/5 border border-white/10 rounded-xl p-3">
              <div className="flex items-start gap-4">
                <div className="relative flex-shrink-0">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-32 h-24 object-cover rounded-lg border border-white/10"
                  />
                  <button
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 hover:bg-red-400 rounded-full transition-colors"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white/80 text-sm font-medium truncate">{selectedImage?.name}</p>
                  <p className="text-white/40 text-xs mt-1">
                    {(selectedImage?.size / 1024).toFixed(1)} KB • {selectedImage?.type}
                  </p>
                  <div className="flex items-center gap-1 mt-2 text-emerald-400 text-xs">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                    Pronto para análise
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Context Tags */}
        <div className="mb-6">
          <p className="text-white/50 text-xs uppercase tracking-wider mb-3">TAGS DE CONTEXTO RÁPIDO</p>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => {
              const Icon = tag.icon;
              const isSelected = selectedTags.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  onClick={() => toggleTag(tag.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${isSelected
                    ? 'bg-cyan-600/20 border-cyan-500/50 text-cyan-400'
                    : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{tag.label}</span>
                </button>
              );
            })}
            <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/50 hover:bg-white/10 transition-colors">
              <Plus className="w-4 h-4" />
              <span className="text-sm">Adicionar tag</span>
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Generate Button */}
        <div className="flex justify-center">
          <LiquidButton
            onClick={handleGenerate}
            disabled={!canGenerate}
            size="xl"
            className="gap-3 text-lg font-medium text-white"
          >
            <Sparkles className="w-5 h-5" />
            <span>Gerar</span>
          </LiquidButton>
        </div>

        {/* Helper text */}
        {!canGenerate && (
          <p className="text-center text-white/30 text-xs mt-3">
            Cole um log de erro ou envie uma imagem para continuar
          </p>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-6">
        <p className="text-white/40 text-sm">
          Assistant Hub
        </p>
      </footer>
    </div>
  );
};

export default ErrorLogInput;
