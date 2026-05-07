/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, FormEvent } from "react";
import confetti from "canvas-confetti";
import { 
  motion, 
  AnimatePresence 
} from "motion/react";
import { 
  Heart, 
  Mail, 
  Sparkles, 
  Flower2, 
  Lock, 
  User, 
  ArrowRight,
  Music,
  VolumeX,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ListMusic
} from "lucide-react";

// --- Components ---

const Countdown = ({ targetDate, name }: { targetDate: string; name: string }) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);
  const [isBirthday, setIsBirthday] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(targetDate) - +new Date();
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
        setIsBirthday(false);
      } else {
        setTimeLeft(null);
        setIsBirthday(true);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  if (isBirthday) {
    return (
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-pink-500 font-serif italic text-lg"
      >
        ✨ Happy Birthday, {name || "Sweetheart"}! ✨
      </motion.div>
    );
  }

  if (!timeLeft) return null;

  return (
    <div className="flex gap-3 text-pink-500 font-sans font-bold">
      <div className="flex flex-col items-center">
        <span className="text-lg md:text-xl">{timeLeft.days}</span>
        <span className="text-[7px] uppercase opacity-60">Days</span>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-lg md:text-xl">{timeLeft.hours}</span>
        <span className="text-[7px] uppercase opacity-60">Hours</span>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-lg md:text-xl">{timeLeft.minutes}</span>
        <span className="text-[7px] uppercase opacity-60">Mins</span>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-lg md:text-xl">{timeLeft.seconds}</span>
        <span className="text-[7px] uppercase opacity-60">Secs</span>
      </div>
    </div>
  );
};

interface FloatingItem {
  id: number;
  x: number;
  size: number;
  duration: number;
  icon: typeof Heart | typeof Flower2;
}

const FloatingContainer = ({ type }: { type: 'hearts' | 'flowers' }) => {
  const [items, setItems] = useState<FloatingItem[]>([]);
  
  const addItem = useCallback(() => {
    const id = Date.now();
    const newItem: FloatingItem = {
      id,
      x: Math.random() * 100,
      size: Math.random() * 20 + 15,
      duration: Math.random() * 4 + 4,
      icon: type === 'hearts' ? Heart : Flower2
    };
    setItems(prev => [...prev, newItem].slice(-15)); // Keep max 15 to avoid lag
  }, [type]);

  useEffect(() => {
    const interval = setInterval(addItem, 800);
    return () => clearInterval(interval);
  }, [addItem]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <AnimatePresence>
        {items.map(item => (
          <motion.div
            key={item.id}
            initial={{ y: "110vh", x: `${item.x}vw`, opacity: 0 }}
            animate={{ 
              y: "-10vh", 
              opacity: [0, 0.6, 0.4, 0],
              rotate: [0, 45, -45, 0]
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: item.duration, ease: "linear" }}
            className="absolute text-pink-400"
            style={{ fontSize: item.size }}
          >
            <item.icon fill={type === 'hearts' ? "currentColor" : "none"} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

const TypingText = ({ text, delay = 0.05, className = "" }: { text: string; delay?: number; className?: string }) => {
  const letters = Array.from(text);
  
  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: delay, delayChildren: 0.2 * i },
    }),
  };

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
    hidden: {
      opacity: 0,
      y: 20,
    },
  };

  return (
    <motion.div
      style={{ overflow: "hidden", display: "flex", flexWrap: "wrap", justifyContent: "center" }}
      variants={container}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {letters.map((letter, index) => (
        <motion.span variants={child} key={index}>
          {letter === " " ? "\u00A0" : letter}
        </motion.span>
      ))}
    </motion.div>
  );
};

// --- Main App ---

export default function App() {
  const [step, setStep] = useState<"login" | "love" | "letter" | "secret" | "spiderman" | "batman" | "hide" | "spotify">("login");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const [showVolumeWarning, setShowVolumeWarning] = useState(false);
  const audioRef = useCallback((node: HTMLAudioElement | null) => {
    if (node !== null) {
      node.volume = 0.5;
    }
  }, []);

  const CORRECT_PASSWORD = "15062005";

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    if (password === CORRECT_PASSWORD) {
      setStep("love");
      
      // Trigger fireworks
      const duration = 5 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);

      // Try to play music on interaction
      const audio = document.getElementById("bg-music") as HTMLAudioElement;
      if (audio) {
        audio.play().catch(() => {});
        setShowVolumeWarning(false);
      }
    } else {
      setError("Wrong password 😢");
    }
  };

  const loveMessage = "You mean everything to me 💕 I made this just for you.";
  const exploreMessage = "Which character do you want to explore?";
  const letterMessage = `
    …I don’t really know where to begin, but…
    If we put everything aside...all the things that have happened between us...I just want to tell you how much I love you, and how deeply I care about you.

    Sometimes I feel like you deserve someone better. But then, when I imagine you with someone else, it doesn’t feel right… it feels like I’m the one who truly understands you, who knows you, who can keep you happy.

    And yet, after everything i have done and the mistakes i've made... There’s so much going on inside me that I can’t even fully explain.. I’m scared… scared of marriage, scared that I won’t be able to keep anyone happy. I don’t even fully understand myself, so how can I promise that to someone else?

    I wish I could explain everything clearly in this letter, but I can’t. All I can say is… I don’t need you, I don’t need anyone. And that doesn’t mean I don’t love you...it’s just that I’m someone who still doesn’t know who he is… or maybe I’m just afraid.

    Thank you….for everything.

    Love you 3000. You were the only one… and you always will be
  `;

  return (
    <div 
      className="min-h-screen bg-[#FFF5F7] text-[#4A4A4A] flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans"
      onClick={() => {
        const audio = document.getElementById("bg-music") as HTMLAudioElement;
        if (audio && !isMuted) {
          audio.play().catch(() => {});
          setShowVolumeWarning(false);
        }
      }}
    >
      
      {/* Decorative Ornaments */}
      <div className="absolute top-10 left-10 text-pink-300 opacity-50 text-6xl select-none pointer-events-none">❤</div>
      <div className="absolute top-40 right-20 text-pink-200 opacity-40 text-8xl select-none pointer-events-none">❤</div>
      <div className="absolute bottom-20 left-24 text-pink-300 opacity-30 text-7xl select-none pointer-events-none">❤</div>
      <div className="absolute bottom-10 right-10 text-pink-200 opacity-60 text-5xl select-none pointer-events-none">❤</div>

      {/* Volume Warning Pop-up */}
      <AnimatePresence>
        {showVolumeWarning && !isMuted && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-[60] bg-white p-4 rounded-2xl shadow-xl border border-pink-100 flex items-center gap-3"
          >
            <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center text-pink-500">
              <Music size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">Volume is off or muted!</p>
              <p className="text-xs text-gray-500">Tap anywhere to play music ❤️</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Music Handler */}
      <div className="fixed top-4 right-4 z-50">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setIsMuted(!isMuted);
          }}
          className="p-2 bg-white/50 backdrop-blur-sm rounded-full text-pink-600 hover:bg-white/80 transition-colors"
        >
          {isMuted ? <VolumeX size={20} /> : <Music size={20} />}
        </button>
        <audio id="bg-music" ref={audioRef} loop muted={isMuted}>
          <source src="/music.mp3" type="audio/mpeg" />
        </audio>
      </div>

      <AnimatePresence mode="wait">
        {step === "login" && (
          <motion.div
            key="login"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-md bg-white/80 backdrop-blur-md p-10 rounded-[40px] shadow-xl z-20 text-center border-2 border-white"
          >
            <div className="bg-pink-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <Heart className="text-pink-400 fill-pink-50" size={32} />
            </div>
            
            <h1 className="text-4xl font-serif italic text-gray-800 mb-2">Welcome Gwen</h1>
            <p className="text-gray-400 mb-10 text-sm font-sans tracking-wide">Enter the special key to explore</p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-400" size={18} />
                <input
                  type="text"
                  placeholder="Your Name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-pink-100 focus:border-pink-300 focus:ring-0 outline-none bg-white/50 transition-all"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-400" size={18} />
                <input
                  type="password"
                  placeholder="Password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-pink-100 focus:border-pink-300 focus:ring-0 outline-none bg-white/50 transition-all"
                />
              </div>
              
              {error && <p className="text-red-400 text-sm mt-2">{error}</p>}

              <button
                type="submit"
                className="w-full py-3 bg-pink-500 hover:bg-pink-600 text-white font-medium rounded-xl shadow-lg shadow-pink-200 transition-all flex items-center justify-center gap-2 group"
              >
                Enter
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          </motion.div>
        )}

        {step === "love" && (
          <motion.div
            key="love"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="z-20 text-center space-y-6 max-w-4xl px-4 flex flex-col items-center"
          >
            <FloatingContainer type="hearts" />
            
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col items-center"
            >
              <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-pink-100 flex flex-col items-center space-y-2 mb-6">
                <div className="flex items-center space-x-2">
                  <span className="text-pink-500 font-bold tracking-widest text-[10px] uppercase font-sans">
                    {+new Date("2026-05-08T01:00:00") - +new Date() > 0 ? "Countdown" : "Celebration"}
                  </span>
                  <div className="h-0.5 w-0.5 bg-pink-200 rounded-full"></div>
                  <span className="text-gray-400 text-[10px] font-sans tracking-tight">May 8</span>
                </div>
                <Countdown targetDate="2026-05-08T01:00:00" name={name} />
              </div>
              
              <h1 className="text-5xl md:text-7xl font-serif italic text-gray-800 tracking-tight leading-tight mb-4">
                Welcome, <span className="text-pink-500">{name || "Sweetheart"}</span> ❤️
              </h1>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="w-full max-w-2xl bg-white/60 backdrop-blur-md rounded-[40px] p-8 border border-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6"
            >
              <div className="flex flex-col text-left">
                <h3 className="text-lg font-bold text-gray-800 font-sans">A note for you</h3>
                <p className="text-sm text-gray-500 font-sans">tap to read</p>
              </div>
              <button 
                onClick={() => setStep("letter")}
                className="bg-pink-500 hover:bg-pink-600 text-white px-10 py-5 rounded-full font-bold shadow-lg shadow-pink-200 flex items-center space-x-3 transition-colors shrink-0"
              >
                <span>💌 Open My Letter</span>
              </button>
            </motion.div>

            <div className="min-h-[80px] max-w-xl">
              <TypingText text={loveMessage} className="text-xl text-gray-500 leading-relaxed" />
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5 }}>
                <TypingText text={exploreMessage} className="text-lg text-pink-400 mt-2 italic font-sans" delay={0.04} />
              </motion.div>
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="flex flex-wrap justify-center gap-8 py-8"
            >
              <div className="group relative">
                <div onClick={() => setStep("spiderman")} className="w-56 h-72 bg-white p-3 rounded-2xl shadow-lg border border-white transform -rotate-3 hover:rotate-0 transition-transform duration-300 cursor-pointer">
                  <div className="w-full h-full bg-pink-100 rounded-xl overflow-hidden">
                    <img src="https://i.ibb.co/7x36fq7n/wmremove-transformed.jpg" className="w-full h-full object-cover" alt="Spiderman" />
                  </div>
                </div>
                <p className="mt-4 text-center font-medium text-pink-400 text-sm font-sans">Spiderman</p>
              </div>

              <div className="group relative">
                <div onClick={() => setStep("batman")} className="w-56 h-72 bg-white p-3 rounded-2xl shadow-lg border border-white transform rotate-2 hover:rotate-0 transition-transform duration-300 cursor-pointer">
                  <div className="w-full h-full bg-pink-200 rounded-xl overflow-hidden">
                    <img src="https://i.ibb.co/BHjWMPNZ/1bb6ae6832e5bc4faa4bd41d908e8ea3.jpg" className="w-full h-full object-cover" alt="Batman" />
                  </div>
                </div>
                <p className="mt-4 text-center font-medium text-pink-400 text-sm font-sans">Batman</p>
              </div>

              <div className="group relative">
                <div onClick={() => setStep("secret")} className="w-56 h-72 bg-white p-3 rounded-2xl shadow-lg border border-white transform -rotate-2 hover:rotate-0 transition-transform duration-300 cursor-pointer">
                  <div className="w-full h-full bg-pink-50 rounded-xl overflow-hidden">
                    <img src="http://i.ibb.co/DDcZYH3h/b833b272d04cbf7dc8782631ecf16655.jpg" className="w-full h-full object-cover" alt="Tyler Durden" />
                  </div>
                </div>
                <p className="mt-4 text-center font-medium text-pink-400 text-sm font-sans">Tyler Durden</p>
              </div>

              <div className="group relative">
                <div onClick={() => setStep("hide")} className="w-56 h-72 bg-white p-3 rounded-2xl shadow-lg border border-white transform rotate-3 hover:rotate-0 transition-transform duration-300 cursor-pointer">
                  <div className="w-full h-full bg-pink-100 rounded-xl overflow-hidden">  
                    <img src="https://i.ibb.co/YTF21cbx/5ffe33f36658e89d19e61ee0ef60dd93.jpg" className="w-full h-full object-cover" alt="The guy who wants to hide" />
                  </div>
                </div>
                <p className="mt-4 text-center font-medium text-pink-400 text-sm font-sans">The guy who wants to hide</p>
              </div>

              <div className="group relative">
                <div onClick={() => setStep("spotify")} className="w-56 h-72 bg-white p-3 rounded-2xl shadow-lg border border-white transform -rotate-3 hover:rotate-0 transition-transform duration-300 cursor-pointer">
                  <div className="w-full h-full bg-pink-200 rounded-xl overflow-hidden">
                    <img src="https://i.ibb.co/jZkvdsPS/46c7e92da3b50ebb7ab96661de1ebec1.jpg" className="w-full h-full object-cover" alt="For you" />
                  </div>
                </div>
                <p className="mt-4 text-center font-medium text-pink-400 text-sm font-sans">For you</p>
              </div>
            </motion.div>
          </motion.div>
        )}

        {step === "spotify" && (
          <motion.div
            key="spotify"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#FFF5F7] overflow-y-auto p-4 text-gray-800 font-sans"
          >
            <div className="max-w-2xl w-full mx-auto space-y-6 py-6 flex flex-col items-center">
              <div className="w-full max-w-[320px] flex items-center justify-between px-2">
                <div className="text-[10px] uppercase tracking-widest font-bold text-pink-400">Playing from Artist</div>
                <ListMusic size={16} className="text-pink-400" />
              </div>

              <div className="flex flex-row justify-center gap-2 w-full px-2">
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
                  onClick={() => window.open("https://youtu.be/M4ZoCHID9GI?si=7Ftx06NUtln_V0QL", "_blank")}
                  className="bg-white/80 backdrop-blur-xl p-2 rounded-xl shadow-lg border border-white flex-1 max-w-[100px] cursor-pointer hover:scale-105 transition-transform">
                  <div className="aspect-square rounded-lg overflow-hidden mb-2 shadow-sm">
                    <img src="https://i.ibb.co/Y89DD7Z/b2b5d23bdfa7e5c89e1dc83ef0d8276d.jpg" alt="The Weeknd" className="w-full h-full object-cover" />
                  </div>
                  <div className="text-center">
                    <h2 className="text-[10px] font-bold mb-0 tracking-tight truncate">Call Out My Name</h2>
                    <p className="text-[8px] text-gray-500 truncate">The Weeknd</p>
                  </div>
                  <div className="mt-2 flex items-center justify-center">
                    <div className="w-5 h-5 bg-pink-500 rounded-full flex items-center justify-center text-white">
                      <Play size={10} fill="currentColor" className="ml-0.5" />
                    </div>
                  </div>
                </motion.div>

                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
                  onClick={() => window.open("https://youtu.be/-BjZmE2gtdo?si=3TOfMaBUvHhhsSfW", "_blank")}
                  className="bg-white/80 backdrop-blur-xl p-2 rounded-xl shadow-lg border border-white flex-1 max-w-[100px] cursor-pointer hover:scale-105 transition-transform">
                  <div className="aspect-square rounded-lg overflow-hidden mb-2 shadow-sm">
                    <img src="https://i.ibb.co/mFRh6tNP/ecae375969b4adf7f15e88428b0e1282.jpg" alt="Taylor Swift" className="w-full h-full object-cover" />
                  </div>
                  <div className="text-center">
                    <h2 className="text-[10px] font-bold mb-0 tracking-tight truncate">Lover</h2>
                    <p className="text-[8px] text-gray-500 truncate">Taylor Swift</p>
                  </div>
                  <div className="mt-2 flex items-center justify-center">
                    <div className="w-5 h-5 bg-pink-500 rounded-full flex items-center justify-center text-white">
                      <Play size={10} fill="currentColor" className="ml-0.5" />
                    </div>
                  </div>
                </motion.div>

                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}
                  onClick={() => window.open("https://youtu.be/o_1aF54DO60?si=qIRG7A2SCbVKaeAC", "_blank")}
                  className="bg-white/80 backdrop-blur-xl p-2 rounded-xl shadow-lg border border-white flex-1 max-w-[100px] cursor-pointer hover:scale-105 transition-transform">
                  <div className="aspect-square rounded-lg overflow-hidden mb-2 shadow-sm">
                    <img src="https://i.ibb.co/JwZp4pJT/28b27dcb4ce8d6ae50c08b214d5fba00.jpg" alt="Lana Del Rey" className="w-full h-full object-cover" />
                  </div>
                  <div className="text-center">
                    <h2 className="text-[10px] font-bold mb-0 tracking-tight truncate">Young & Beautiful</h2>
                    <p className="text-[8px] text-gray-500 truncate">Lana Del Rey</p>
                  </div>
                  <div className="mt-2 flex items-center justify-center">
                    <div className="w-5 h-5 bg-pink-500 rounded-full flex items-center justify-center text-white">
                      <Play size={10} fill="currentColor" className="ml-0.5" />
                    </div>
                  </div>
                </motion.div>
              </div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-center px-4 max-w-[320px]">
                <p className="text-gray-500 italic text-xs leading-relaxed font-serif">
                  "Qawwali sunna start karo mohabbat ek hi nai bht kuch sikhne ko milta aagr use smjhoge to ...ye sab to acche hai but that's beauty"
                </p>
              </motion.div>

              <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} onClick={() => setStep("love")} className="w-full max-w-[200px] py-4 text-pink-400 hover:text-pink-600 text-xs font-bold tracking-widest uppercase transition-colors">
                Close Player
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ... (Rest of the components: batman, hide, spiderman, secret, letter) ... */}
        {/* Note: In your actual file, keep the remaining step === "batman" etc. blocks as they were! */}
      </AnimatePresence>

      <footer className="fixed bottom-4 text-gray-400 text-xs pointer-events-none">
        Made with ❤️ specifically for {name || "someone special"}
      </footer>
    </div>
  );
}