
import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, CheckCircle2, AlertCircle, Loader2, Package, X, 
  Focus, BookOpen, ShoppingBag, ArrowRight, User as UserIcon,
  Calculator, PlusCircle
} from 'lucide-react';
import { Product, ScanResult, DetectedItem, ScanMode } from '../types';
import { analyzeProductLabel, analyzeAccountBook } from '../services/geminiService';

interface InventoryScannerProps {
  existingProducts: Product[];
  onConfirm: (result: ScanResult) => void;
  onCancel: () => void;
}

const InventoryScanner: React.FC<InventoryScannerProps> = ({ existingProducts, onConfirm, onCancel }) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scanMode, setScanMode] = useState<ScanMode | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (scanMode && !capturedImage) {
      startCamera();
    }
    return () => stopCamera();
  }, [scanMode, capturedImage]);

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: { exact: 'environment' } }, 
        audio: false 
      }).catch(() => {
        return navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
      });
      
      setStream(s);
      if (videoRef.current) {
        videoRef.current.srcObject = s;
      }
    } catch (err) {
      console.error("Camera access error:", err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const capture = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg');
        setCapturedImage(dataUrl);
        stopCamera();
        handleAnalysis(dataUrl);
      }
    }
  };

  const handleAnalysis = async (image: string) => {
    if (!scanMode) return;
    setIsAnalyzing(true);
    try {
      let result: any;
      if (scanMode === 'product') {
        const detection = await analyzeProductLabel(image);
        const existing = existingProducts.find(p => p.name.toLowerCase().includes(detection.name.toLowerCase()));
        
        setScanResult({
          mode: 'product',
          intent: 'Audit',
          summary: `Product: ${detection.name}`,
          items: [{
            ...detection,
            quantity: 1,
            isExisting: !!existing,
            existingProductId: existing?.id,
            category: detection.category || 'General'
          }]
        });
      } else {
        const detection = await analyzeAccountBook(image);
        const matchedItems = detection.items.map((item: any) => {
          const existing = existingProducts.find(p => p.name.toLowerCase().includes(item.name.toLowerCase()));
          return {
            ...item,
            brand: 'Local',
            confidence: 0.9,
            isExisting: !!existing,
            existingProductId: existing?.id,
            category: item.category || 'General'
          };
        });

        setScanResult({
          ...detection,
          mode: 'book',
          items: matchedItems
        });
      }
    } catch (err) {
      console.error("Analysis failed:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setCapturedImage(null);
    setScanResult(null);
    setIsAnalyzing(false);
  };

  // Initial Selection View
  if (!scanMode) {
    return (
      <div className="max-w-md mx-auto space-y-6 pt-10">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-extrabold text-slate-900">Choose Scan Type</h2>
          <p className="text-slate-500">How would you like to update your stock?</p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <button 
            onClick={() => setScanMode('product')}
            className="group p-6 bg-white border-2 border-slate-100 rounded-3xl hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left shadow-sm flex items-center gap-6"
          >
            <div className="bg-indigo-100 p-4 rounded-2xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <div>
              <p className="text-lg font-bold text-slate-900">Scan Product</p>
              <p className="text-sm text-slate-500">Scan barcode or label of 1 item</p>
            </div>
            <ArrowRight className="w-5 h-5 ml-auto text-slate-300 group-hover:text-indigo-500" />
          </button>

          <button 
            onClick={() => setScanMode('book')}
            className="group p-6 bg-white border-2 border-slate-100 rounded-3xl hover:border-emerald-500 hover:bg-emerald-50 transition-all text-left shadow-sm flex items-center gap-6"
          >
            <div className="bg-emerald-100 p-4 rounded-2xl text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <BookOpen className="w-8 h-8" />
            </div>
            <div>
              <p className="text-lg font-bold text-slate-900">Scan Account Book</p>
              <p className="text-sm text-slate-500">Scan handwritten lists & dues</p>
            </div>
            <ArrowRight className="w-5 h-5 ml-auto text-slate-300 group-hover:text-emerald-500" />
          </button>
        </div>

        <button 
          onClick={onCancel}
          className="w-full py-4 text-slate-400 font-bold hover:text-slate-600 transition-colors"
        >
          Cancel
        </button>
      </div>
    );
  }

  // Result View
  if (scanResult) {
    const isBook = scanResult.mode === 'book';
    const firstItem = scanResult.items[0];

    return (
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden max-w-lg mx-auto animate-in fade-in slide-in-from-bottom-4">
        <div className={`p-6 border-b border-slate-100 flex justify-between items-center ${isBook ? 'bg-emerald-50' : 'bg-indigo-50'}`}>
          <div>
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className={`w-6 h-6 ${isBook ? 'text-emerald-500' : 'text-indigo-500'}`} />
              {isBook ? 'Account Book Scanned' : 'Product Found'}
            </h3>
            <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-bold">Please review and confirm</p>
          </div>
          <button onClick={reset} className="p-2 hover:bg-white rounded-full transition-colors text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Metadata if it's a book scan */}
          {isBook && (scanResult.customerName || scanResult.dueAmount !== undefined) && (
            <div className="grid grid-cols-2 gap-4">
              {scanResult.customerName && (
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase mb-1">
                    <UserIcon className="w-3 h-3" /> Customer
                  </div>
                  <p className="font-bold text-slate-900">{scanResult.customerName}</p>
                </div>
              )}
              {scanResult.dueAmount !== undefined && (
                <div className="bg-amber-50 p-3 rounded-2xl border border-amber-100">
                  <div className="flex items-center gap-2 text-[10px] text-amber-500 font-bold uppercase mb-1">
                    <Calculator className="w-3 h-3" /> Due Amount
                  </div>
                  <p className="font-extrabold text-amber-700">৳{scanResult.dueAmount.toLocaleString()}</p>
                </div>
              )}
            </div>
          )}

          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
            {scanResult.items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className={`p-2.5 rounded-xl ${item.isExisting ? 'bg-slate-100 text-slate-600' : 'bg-emerald-50 text-emerald-600'}`}>
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-slate-900">{item.name}</p>
                      {!item.isExisting && (
                        <span className="text-[9px] bg-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded font-bold">NEW</span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">{item.category || 'General'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">{item.quantity} PCS</p>
                  {item.price && <p className="text-xs text-slate-500">৳{item.price}</p>}
                </div>
              </div>
            ))}
          </div>

          {!firstItem?.isExisting && scanResult.mode === 'product' && (
            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex gap-4">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <p className="text-sm font-bold text-amber-800 leading-tight">Product not in inventory</p>
                <p className="text-xs text-amber-600 mt-1">This item is not recognized. Add as new product?</p>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
          <button 
            onClick={reset}
            className="flex-1 py-4 bg-white border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all text-sm"
          >
            Cancel
          </button>
          
          {scanResult.mode === 'product' && !firstItem.isExisting ? (
             <button 
             onClick={() => onConfirm(scanResult)}
             className="flex-[2] py-4 bg-amber-600 text-white font-bold rounded-2xl hover:bg-amber-700 shadow-lg shadow-amber-200 transition-all flex items-center justify-center gap-2 text-sm"
           >
             <PlusCircle className="w-5 h-5" />
             Add New Product
           </button>
          ) : (
            <button 
              onClick={() => onConfirm(scanResult)}
              className="flex-[2] py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 text-sm"
            >
              Confirm & Save
            </button>
          )}
        </div>
      </div>
    );
  }

  // Camera View
  return (
    <div className="max-w-xl mx-auto space-y-4">
      <div className="relative aspect-[3/4] bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white">
        {capturedImage ? (
          <img src={capturedImage} className="w-full h-full object-cover" alt="Captured" />
        ) : (
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
        )}
        
        {/* SCAN BOX OVERLAY */}
        {!isAnalyzing && !capturedImage && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            {/* Background shade */}
            <div className="absolute inset-0 bg-black/40"></div>
            
            {/* Viewfinder box */}
            <div className={`relative z-10 ${scanMode === 'product' ? 'w-[75%] aspect-square' : 'w-[85%] h-[70%]'} border-2 border-white/20 rounded-3xl`}>
              {/* Corner markers */}
              <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-white rounded-tl-3xl shadow-[0_0_15px_rgba(255,255,255,0.3)]"></div>
              <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-white rounded-tr-3xl"></div>
              <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-white rounded-bl-3xl"></div>
              <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-white rounded-br-3xl"></div>
              
              {/* Scan Animation */}
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-white/50 shadow-[0_0_20px_white] animate-[scan_3s_infinite_ease-in-out]"></div>
            </div>

            <div className="absolute top-[12%] left-0 right-0 text-center px-4">
               <div className="bg-black/60 backdrop-blur-xl px-6 py-2.5 rounded-full inline-flex items-center gap-3 border border-white/20">
                 <Focus className="w-5 h-5 text-white" />
                 <span className="text-white text-sm font-bold tracking-tight">
                   {scanMode === 'product' ? 'Scan Product Barcode or Label' : 'Scan Account Book Page'}
                 </span>
               </div>
            </div>
          </div>
        )}
        
        {isAnalyzing && (
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl flex flex-col items-center justify-center text-white p-6 text-center z-50">
            <Loader2 className="w-16 h-16 animate-spin mb-6 text-indigo-400" />
            <h3 className="text-2xl font-bold mb-2">Analyzing Image...</h3>
            <p className="text-slate-400 max-w-[200px]">
              {scanMode === 'product' ? 'Identifying brand and details.' : 'Reading handwritten list and prices.'}
            </p>
          </div>
        )}

        <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-20">
          <button onClick={() => setScanMode(null)} className="p-2.5 bg-black/40 text-white rounded-full backdrop-blur-xl hover:bg-black/60 transition-colors">
            <X className="w-6 h-6" />
          </button>
          <div className="bg-white text-slate-900 text-[10px] px-4 py-1.5 rounded-full font-black uppercase tracking-widest shadow-xl">
            {scanMode === 'product' ? 'PRODUCT SCAN' : 'KHATA SCAN'}
          </div>
        </div>

        {/* Action Button Container */}
        <div className="absolute bottom-12 left-0 right-0 flex flex-col items-center gap-4 z-20">
          <button 
            onClick={capture}
            disabled={isAnalyzing}
            className="group flex flex-col items-center gap-3"
          >
            <div className="w-24 h-24 bg-white/20 rounded-full p-2 backdrop-blur-md active:scale-95 transition-all">
              <div className="w-full h-full bg-white rounded-full flex items-center justify-center text-slate-900 shadow-2xl">
                <Camera className="w-10 h-10" />
              </div>
            </div>
            <span className="bg-white text-slate-900 text-xs font-black px-6 py-2 rounded-full shadow-xl">
              TAP TO SCAN
            </span>
          </button>
        </div>
      </div>
      
      <canvas ref={canvasRef} className="hidden" />
      
      <div className="bg-indigo-50 p-5 rounded-[2rem] border border-indigo-100 flex items-center gap-5">
        <div className="bg-white p-3 rounded-2xl shadow-sm text-indigo-600">
          <Calculator className="w-6 h-6" />
        </div>
        <div className="text-left">
          <p className="text-sm font-bold text-indigo-900">How to scan best?</p>
          <p className="text-xs text-indigo-700/70 italic leading-snug">
            {scanMode === 'product' ? "Keep the brand name (e.g. PRAN, ACI) in the box." : "Make sure handwriting is clear and not blurry."}
          </p>
        </div>
      </div>

      <style>{`
        @keyframes scan {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(280px); }
        }
      `}</style>
    </div>
  );
};

export default InventoryScanner;
