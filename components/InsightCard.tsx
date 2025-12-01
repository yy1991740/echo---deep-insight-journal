
import React, { useRef, useState } from 'react';
import { InsightResult, Language } from '../types';
import { Download, Loader2, Sparkles, Lock, Fingerprint, Quote } from 'lucide-react';
import html2canvas from 'html2canvas';

interface InsightCardProps {
  data: InsightResult | null;
  lang: Language;
}

export const InsightCard: React.FC<InsightCardProps> = ({ data, lang }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);

  if (!data) return null;

  const handleSave = async () => {
    if (!cardRef.current) return;
    
    // 自动解密，确保保存的内容是可见的
    if (!isRevealed) {
        setIsRevealed(true);
        // 等待动画完成
        await new Promise(resolve => setTimeout(resolve, 800));
    }
    
    setIsSaving(true);
    try {
      const originalElement = cardRef.current;
      
      // 创建一个离屏容器进行渲染，防止干扰当前视图
      const container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.top = '-10000px';
      container.style.left = '-10000px';
      container.style.display = 'flex';
      container.style.justifyContent = 'center';
      container.style.alignItems = 'center';
      container.style.backgroundColor = '#000000'; // 背景全黑
      container.style.padding = '100px'; // 留出足够的阴影空间
      container.style.zIndex = '-1000';

      const clone = originalElement.cloneNode(true) as HTMLElement;
      
      // 重置克隆节点的样式以适应导出
      clone.style.transform = 'scale(1)';
      clone.style.margin = '0';
      clone.style.boxShadow = 'none'; // 移除CSS阴影，防止截图截断
      
      // === 关键修复：处理烫金文字 ===
      // html2canvas 无法渲染 bg-clip-text，所以我们在截图时将其改为纯金色
      const goldTextElements = clone.querySelectorAll('.gold-text');
      goldTextElements.forEach((el) => {
          const element = el as HTMLElement;
          element.style.background = 'none';
          element.style.webkitBackgroundClip = 'initial';
          element.style.backgroundClip = 'initial';
          element.style.color = '#D4AF37'; // 纯正的香槟金 Hex
          element.style.textShadow = 'none';
      });

      // === 关键修复：确保分析文字可见 ===
      const analysisContainer = clone.querySelector('.analysis-container');
      if (analysisContainer) {
          const text = analysisContainer.querySelector('p') as HTMLElement;
          const overlay = analysisContainer.querySelector('.decrypt-overlay') as HTMLElement;
          
          if (text) {
            text.style.filter = 'none';
            text.style.opacity = '0.7';
            text.style.color = '#A1A1AA';
          }
          if (overlay) {
            overlay.style.display = 'none';
          }
      }
      
      container.appendChild(clone);
      document.body.appendChild(container);

      // 等待字体和DOM稳定
      await new Promise(resolve => setTimeout(resolve, 500));

      const canvas = await html2canvas(container, {
        backgroundColor: '#000000', // 导出图片的背景色
        scale: 3, // 高清导出
        logging: false,
        useCORS: true,
        allowTaint: true,
      });
      
      document.body.removeChild(container);
      
      // === Mobile Save Strategy (Web Share API) ===
      canvas.toBlob(async (blob) => {
        if (!blob) {
            alert("Image generation failed.");
            return;
        }

        const fileName = `ECHO_Soul_${new Date().toISOString().slice(0,10)}.png`;
        const file = new File([blob], fileName, { type: "image/png" });

        // 优先尝试原生分享 (iOS/Android 最佳体验)
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
                await navigator.share({
                    files: [file],
                    title: 'ECHO Insight Card',
                    text: data.golden_quote || 'My Deep Insight Journal Memory',
                });
                return; // 分享成功则退出
            } catch (error) {
                console.log("Share cancelled or failed, falling back to download", error);
                // 如果用户取消或分享失败，继续执行下方的下载逻辑作为兜底
            }
        }

        // 降级方案：传统下载链接 (Desktop / 不支持Share的设备)
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link); // Firefox 需要挂载
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

      }, 'image/png');

    } catch (error) {
      console.error("Error saving card:", error);
      alert("Saving failed.");
    } finally {
      setIsSaving(false);
    }
  };

  const today = new Date();
  const dateOptions: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' };
  const dateStr = today.toLocaleDateString('en-US', dateOptions).toUpperCase().split(' ').join(' . ');

  return (
    <div className="w-full flex flex-col items-center gap-12 mt-8 animate-[fadeIn_1s_ease-out]">
      
      {/* === The High-End Card === */}
      <div 
        ref={cardRef}
        className="relative w-full max-w-[380px] aspect-[3/5] bg-[#0a0a0a] text-slate-200 overflow-hidden flex flex-col shadow-2xl group select-none"
        style={{
            boxShadow: '0 0 0 1px rgba(255,255,255,0.08), 0 20px 50px -10px rgba(0,0,0,0.7)'
        }}
      >
        {/* === Textures & Lighting === */}
        {/* Noise Texture */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.07] mix-blend-overlay pointer-events-none" />
        
        {/* Ambient Glow (Gold) */}
        <div className="absolute -top-[20%] -right-[20%] w-[70%] h-[40%] bg-amber-500/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-[10%] -left-[10%] w-[50%] h-[40%] bg-indigo-500/5 blur-[80px] rounded-full pointer-events-none" />

        {/* Decorative Border Frame (Internal) */}
        <div className="absolute inset-3 border border-white/5 pointer-events-none flex flex-col justify-between">
            <div className="flex justify-between p-2">
                <div className="w-1.5 h-1.5 bg-white/20" />
                <div className="w-1.5 h-1.5 bg-white/20" />
            </div>
            <div className="flex justify-between p-2">
                <div className="w-1.5 h-1.5 bg-white/20" />
                <div className="w-1.5 h-1.5 bg-white/20" />
            </div>
        </div>
        
        {/* === Content === */}
        <div className="relative z-10 flex flex-col h-full w-full p-8 md:p-10">
            
            {/* Header: Date & Serial */}
            <div className="flex justify-between items-start opacity-50 mb-8">
                <span className="font-mono text-[10px] tracking-[0.2em] text-amber-100/60">
                    NO. {Math.floor(Math.random() * 10000).toString().padStart(4, '0')}
                </span>
                <span className="font-mono text-[10px] tracking-[0.2em]">
                    {dateStr}
                </span>
            </div>

            {/* Mood Badge - Fixed for html2canvas vertical alignment */}
            <div className="flex justify-center mb-6">
                <div className="px-4 h-8 flex items-center justify-center border border-amber-500/20 bg-amber-900/10 backdrop-blur-sm rounded-full">
                    <span className="font-serif text-[11px] text-amber-100/80 tracking-widest uppercase leading-none pt-[1px]">
                        {data.mood}
                    </span>
                </div>
            </div>

            {/* Main Quote Area */}
            <div className="flex-grow flex flex-col items-center justify-center text-center gap-6 relative">
                <Quote className="w-6 h-6 text-white/10 absolute -top-4 left-0 transform -scale-x-100" />
                
                {/* 烫金文字类名为 gold-text，方便截图时替换颜色 */}
                <h2 className="gold-text text-2xl md:text-[28px] font-serif leading-[1.6] tracking-wide text-transparent bg-clip-text bg-gradient-to-b from-[#FDE68A] via-[#D4AF37] to-[#926F34]">
                    {data.golden_quote}
                </h2>

                <div className="w-12 h-[1px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent mt-2" />
                
                <Quote className="w-6 h-6 text-white/10 absolute -bottom-4 right-0" />
            </div>

            {/* Bottom Analysis (Hidden/Revealed) */}
            <div className="mt-auto pt-8 w-full relative analysis-container">
                <div 
                    onClick={() => setIsRevealed(true)}
                    className={`relative transition-all duration-1000 ${!isRevealed ? 'cursor-pointer' : ''}`}
                >
                    {/* Actual Text */}
                    <p className={`font-serif text-[13px] leading-[2.0] text-justify text-slate-400 tracking-wider transition-all duration-1000 ${!isRevealed ? 'blur-[5px] opacity-40 grayscale' : 'blur-0 opacity-80'}`}>
                        {data.deep_insight}
                    </p>

                    {/* Decrypt Overlay (Only visible when hidden) */}
                    {!isRevealed && (
                        <div className="decrypt-overlay absolute inset-0 flex flex-col items-center justify-center z-20 gap-3">
                             <div className="p-3 rounded-full border border-white/10 bg-black/40 backdrop-blur-sm shadow-xl animate-pulse-slow">
                                <Fingerprint className="w-5 h-5 text-amber-100/60" />
                             </div>
                             <span className="text-[9px] font-mono tracking-[0.3em] text-amber-100/40 uppercase">
                                {lang === 'zh' ? '点击解密' : 'DECRYPT'}
                             </span>
                        </div>
                    )}
                </div>
                
                {/* Footer Brand */}
                <div className="mt-6 flex justify-center items-center gap-2 opacity-20">
                    <div className="h-[1px] w-8 bg-white" />
                    <span className="font-serif text-[10px] tracking-[0.3em]">ECHO</span>
                    <div className="h-[1px] w-8 bg-white" />
                </div>
            </div>
            
        </div>
      </div>

      {/* === Action Button === */}
      <button
        onClick={handleSave}
        disabled={isSaving}
        className="group relative px-8 py-3 overflow-hidden rounded-none transition-all duration-300"
      >
        <div className="absolute inset-0 border border-white/10 bg-white/[0.02] group-hover:bg-white/[0.05] transition-colors" />
        
        {/* Corner Accents for Button */}
        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/30" />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/30" />
        
        <div className="relative flex items-center gap-3">
            {isSaving ? (
                <Loader2 className="w-3 h-3 animate-spin text-amber-100/70" />
            ) : (
                <Download className="w-3 h-3 text-slate-400 group-hover:text-amber-100 transition-colors" />
            )}
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-slate-400 group-hover:text-amber-100 transition-colors">
                {lang === 'zh' ? '保存记忆' : 'SAVE MEMORY'}
            </span>
        </div>
      </button>

    </div>
  );
};
