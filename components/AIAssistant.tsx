
import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Sparkles, Brain, Image as ImageIcon, Volume2, Mic, MicOff,
  User, Bot, Trash2, HelpCircle, Package, TrendingUp, Wallet, 
  Percent, ShoppingCart, PlusCircle, AlertCircle
} from 'lucide-react';
import { Message, AIModelType, Product, Order, Customer } from '../types';
import { chatWithFlash, chatWithThinking, analyzeImage, generateSpeech, decodeBase64Audio } from '../services/geminiService';

interface AIAssistantProps {
  products: Product[];
  orders: Order[];
  customers: Customer[];
}

const AIAssistant: React.FC<AIAssistantProps> = ({ products, orders, customers }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Assalamu Alaikum! I'm your SmartShodhai AI. How can I help you manage your shop today? You can ask me about your stock, today's sales, or who owes you money (Baki)." }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [mode, setMode] = useState<AIModelType>('fast');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const recognitionRef = useRef<any>(null);

  const suggestions = [
    { label: "What items are low stock?", icon: Package, color: "text-amber-600 bg-amber-50" },
    { label: "Today's profit?", icon: Percent, color: "text-emerald-600 bg-emerald-50" },
    { label: "Who has unpaid dues?", icon: Wallet, color: "text-rose-600 bg-rose-50" },
    { label: "Show today's sales total.", icon: TrendingUp, color: "text-indigo-600 bg-indigo-50" },
    { label: "Add 10 pcs to Milk stock.", icon: PlusCircle, color: "text-blue-600 bg-blue-50" },
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Cleanup recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice recognition is not supported in this browser.");
      return;
    }

    if (!recognitionRef.current) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'bn-BD'; // Support Bengali
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInput(transcript);
          // Automatically send after voice capture for smooth flow
          handleSend(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
        if (event.error !== 'no-speech') {
          setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: "Dukkito Bhai, logic ta bujhchi na. Abar bolun please (Sorry, I couldn't understand that. Please try again)." 
          }]);
        }
      };
      recognitionRef.current = recognition;
    }

    try {
      recognitionRef.current.start();
    } catch (e) {
      console.error("Error starting recognition:", e);
      // Already started or other error
    }
  };

  const getContextString = () => {
    const stockSummary = products.map(p => `${p.name}: ${p.quantity} units (Min: ${p.minStockLevel})`).join(', ');
    const customerSummary = customers.map(c => `${c.name}: ৳${c.currentDue || 0} due`).join(', ');
    const ordersSummary = orders.map(o => `Order #${o.id} for ৳${o.totalAmount} is ${o.status}`).join(', ');
    
    return `
      STOCK: ${stockSummary}. 
      CUSTOMERS & DUES: ${customerSummary}. 
      RECENT ORDERS: ${ordersSummary}.
    `;
  };

  const handleSend = async (overrideInput?: string) => {
    const textToSend = overrideInput || input;
    if (!textToSend.trim() && !selectedImage) return;

    // Stop listening if sending
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }

    const userMessage: Message = { 
      role: 'user', 
      content: textToSend, 
      image: selectedImage || undefined 
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const context = getContextString();
      let responseText = '';
      
      if (selectedImage) {
        responseText = await analyzeImage(selectedImage, textToSend);
        setSelectedImage(null);
      } else if (mode === 'think') {
        responseText = await chatWithThinking(textToSend, context);
      } else {
        responseText = await chatWithFlash(textToSend, context);
      }

      setMessages(prev => [...prev, { role: 'assistant', content: responseText, isThinking: mode === 'think' }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', content: "Dukkito Bhai, error hoyeche. Net check korun." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSpeechOutput = async (text: string) => {
    try {
      const base64Audio = await generateSpeech(text);
      if (base64Audio) {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
        }
        const buffer = await decodeBase64Audio(base64Audio, audioContextRef.current);
        const source = audioContextRef.current.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContextRef.current.destination);
        source.start(0);
      }
    } catch (err) {
      console.error("Speech error", err);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setMode('image');
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header / Mode Selector */}
      <div className="p-4 border-b border-slate-100 flex flex-wrap gap-2 justify-between items-center bg-slate-50/50">
        <div className="flex gap-2">
          <button 
            onClick={() => setMode('fast')}
            className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center space-x-2 transition-all ${mode === 'fast' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white text-slate-500 border border-slate-200'}`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Fast Flash</span>
          </button>
          <button 
            onClick={() => setMode('think')}
            className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center space-x-2 transition-all ${mode === 'think' ? 'bg-purple-600 text-white shadow-lg shadow-purple-100' : 'bg-white text-slate-500 border border-slate-200'}`}
          >
            <Brain className="w-3.5 h-3.5" />
            <span>Deep Analysis</span>
          </button>
        </div>
        <button 
          onClick={() => setMessages([{ role: 'assistant', content: "Chat cleared. Ask me anything, Bhai!" }])}
          className="p-2 text-slate-400 hover:text-red-500 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Message Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-100">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start gap-4`}>
              <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className="space-y-2">
                <div className={`p-4 rounded-2xl shadow-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-50 text-slate-800 border border-slate-100 rounded-tl-none'}`}>
                  {msg.image && <img src={msg.image} alt="User upload" className="max-w-xs rounded-xl mb-3 border border-white/20 shadow-md" />}
                  <p className="text-sm whitespace-pre-wrap leading-relaxed font-medium">{msg.content}</p>
                </div>
                {msg.role === 'assistant' && (
                  <button onClick={() => handleSpeechOutput(msg.content)} className="flex items-center space-x-2 text-[10px] text-slate-400 hover:text-indigo-600 transition-colors font-bold uppercase tracking-wider pl-1">
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Listen</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-50 border border-slate-100 p-4 rounded-3xl rounded-tl-none flex items-center space-x-4">
              <div className="flex space-x-1">
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-6 bg-slate-50/50 border-t border-slate-100">
        {/* Suggestion Chips */}
        {!selectedImage && messages.length < 10 && (
          <div className="mb-4 flex gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar">
            {suggestions.map((s, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(s.label)}
                className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border border-slate-100 shadow-sm hover:shadow-md hover:scale-105 transition-all bg-white ${s.color}`}
              >
                <s.icon className="w-3.5 h-3.5" />
                {s.label}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-3.5 text-slate-400 hover:text-indigo-600 bg-white rounded-2xl border border-slate-200 shadow-sm"
          >
            <ImageIcon className="w-5 h-5" />
          </button>
          
          <button 
            onClick={toggleListening}
            className={`p-3.5 rounded-2xl border shadow-sm transition-all ${isListening ? 'bg-red-500 text-white animate-pulse border-red-600' : 'bg-white text-slate-400 border-slate-200 hover:text-emerald-600'}`}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={onFileChange} />
          
          <div className="flex-1 relative">
            <input 
              type="text" 
              placeholder={isListening ? "Listening... Bolo Bhai" : "Tap the mic and speak your question..."}
              className={`w-full pl-5 pr-14 py-4 bg-white border rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 shadow-sm font-medium transition-all ${isListening ? 'border-red-300 ring-4 ring-red-100' : 'border-slate-200'}`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button 
              onClick={() => handleSend()}
              disabled={loading || (!input.trim() && !selectedImage)}
              className="absolute right-2 top-2 p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="flex justify-center items-center gap-2 mt-4">
           <AlertCircle className="w-3 h-3 text-slate-300" />
           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
            AI can make mistakes • Always check your Tally
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
