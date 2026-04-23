import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Activity, Play, X, ArrowRight, ChevronRight, ChevronLeft, AlertTriangle } from 'lucide-react';


const CAROUSEL_DATA = [
  { img: "lunbo1.jpg", title: "根植自然", desc: "从破土新芽到山野生灵，守护地球完整生态脉络。" },
  { img: "lunbo2.jpg", title: "山野绵延", desc: "厚植生态根基，守护生物多样，让山野鸟兽自有家园。" },
  { img: "lunbo3.jpg", title: "万物生灵", desc: "敬畏自然本底，善待每一种生命，守护生态原生之美。" }
];

const STACK_CARDS = [
  { id: "01", title: "全球气候变暖", img: "b1.jpg", desc: "温室气体排放导致全球平均气温持续上升，引发冰川融化、海平面上升。" },
  { id: "02", title: "生物多样性锐减", img: "b2.jpg", desc: "栖息地破坏、过度捕捞导致物种灭绝速度加快，生态系统稳定性受到威胁。" },
  { id: "03", title: "水资源污染", img: "b3.jpg", desc: "工业废水、生活污水造成水体污染，全球约80%的废水未经处理排入自然。" },
  { id: "04", title: "大气环境污染", img: "b4.jpg", desc: "工业废气排放导致雾霾、酸雨等问题频发，全球90%人口呼吸不达标空气。" }
];

// --- 内部组件：堆叠文件夹卡片 ---
const FolderCard = ({ card, index }) => {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "end start"]
  });

  const rotate = useTransform(scrollYProgress, [0, 0.5], [index % 2 === 0 ? -10 : 10, 0]);
  const x = useTransform(scrollYProgress, [0, 0.5], [index % 2 === 0 ? -50 : 50, 0]);

  return (
    <div ref={targetRef} className="relative h-[110vh] w-full flex justify-center">
      <motion.div 
        style={{ rotate, x }}
        className="sticky top-20 w-[95%] h-[80vh] bg-white border-4 border-black rounded-[3rem] overflow-hidden flex flex-col md:flex-row items-center p-8 md:p-16 gap-12"
      >
        <div className="absolute top-0 left-12 -translate-y-full bg-white border-4 border-black border-b-0 px-8 py-2 rounded-t-3xl font-[1000] text-sm uppercase">
          CASE_FILE_{card.id}
        </div>

        <div className="flex-1 text-left">
          <h2 className="text-6xl md:text-8xl font-[1000] tracking-tighter uppercase italic leading-[0.8] mb-8">
            {card.title}
          </h2>
          <p className="text-lg font-bold text-slate-500 leading-relaxed max-w-md">
            {card.desc}
          </p>
          <button className="mt-8 px-8 py-3 bg-[#fff95e] border-2 border-black font-black uppercase hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all ">
            Access Full Report
          </button>
        </div>

        <div className="flex-1 h-full w-full rounded-[2rem] overflow-hidden border-2 border-black bg-slate-100 ">
          <img src={card.img} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" alt=""/>
        </div>
      </motion.div>
    </div>
  );
};

// --- 主页面组件 ---
const EcoIssues = () => {
  const [slide, setSlide] = useState(0);

  return (
    <div className="w-full bg-white font-sans text-black overflow-x-hidden">
      <main className="max-w-7xl mx-auto px-6 pt-32 pb-20">
        
        {/* 第一部分：大轮播图 + 数据矩阵 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-24">
          {/* 左侧轮播图 */}
          <div className="lg:col-span-2 relative h-[500px] bg-white border-2 border-black rounded-[3rem] overflow-hidden ">
            <AnimatePresence mode="wait">
              <motion.div 
                key={slide}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="absolute inset-0"
              >
                <img src={CAROUSEL_DATA[slide].img} className="w-full h-full object-cover" alt=""/>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-12 flex flex-col justify-end text-white">
                  <h2 className="text-5xl font-[1000] italic uppercase tracking-tighter mb-4">{CAROUSEL_DATA[slide].title}</h2>
                  <p className="text-white/70 font-bold max-w-md">{CAROUSEL_DATA[slide].desc}</p>
                </div>
              </motion.div>
            </AnimatePresence>
            <div className="absolute top-8 right-8 flex gap-2">
              <button onClick={() => setSlide((s) => (s - 1 + 3) % 3)} className="w-10 h-10 bg-white border-2 border-black rounded-full flex items-center justify-center hover:bg-yellow-400 transition-colors"><ChevronLeft/></button>
              <button onClick={() => setSlide((s) => (s + 1) % 3)} className="w-10 h-10 bg-white border-2 border-black rounded-full flex items-center justify-center hover:bg-yellow-400 transition-colors"><ChevronRight/></button>
            </div>
          </div>

          {/* 右侧数据面板 */}
          <div className="flex flex-col gap-8">
           
            <div className="flex-1 bg-[#fff95e] border-2 border-black rounded-[2.5rem] p-8  flex flex-col justify-between">
               <h3 className="text-xl font-[1000] uppercase italic">CO₂ Density</h3>
               <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-[1000]">420</span>
                  <span className="text-xl font-black opacity-40">PPM</span>
               </div>
               <div className="w-full bg-black/10 h-2 rounded-full overflow-hidden">
                  <div className="bg-black h-full w-[85%]" />
               </div>
            </div>

           
            <div className="flex-1 bg-white border-2 border-black rounded-[2.5rem] p-8  flex flex-col justify-between border-t-8 ">
               <div className="flex justify-between items-center">
                  <h3 className="text-xl font-[1000] uppercase italic">Sea Level</h3>
                  <AlertTriangle className="text-red-500" size={24} />
               </div>
               <div className="text-4xl font-[1000]">+20.4<span className="text-sm">cm</span></div>
               {/* <p className="text-[8px] font-bold text-red-500/60 uppercase tracking-tighter italic leading-tight"></p> */}
            </div>
          </div>
        </div>

        {/* 标语区域 */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-32 border-t-2 border-black/5 pt-12">
           <div className="max-w-xl">
              <h4 className="text-slate-400 font-black uppercase text-xs tracking-[0.4em] mb-4">Repair Earth Undertone</h4>
              <h1 className="text-7xl font-[1000] uppercase leading-[0.85] tracking-tighter">
                OUR SKY<br/><span className="text-[#fff95e] drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">OCEAN</span> LAND
              </h1>
           </div>
           <div className="flex gap-16">
              <div className="text-center">
                 <div className="text-6xl font-[1000] italic">99%</div>
                 <div className="text-[10px] font-black uppercase opacity-40 mt-2">Success Rate</div>
              </div>
              <div className="text-center">
                 <div className="text-6xl font-[1000] italic">6+</div>
                 <div className="text-[10px] font-black uppercase opacity-40 mt-2">Core Issues</div>
              </div>
           </div>
        </div>
      </main>

      {/* 堆叠卡片区 */}
      <section className="bg-black py-20">
        <div className="max-w-7xl mx-auto px-6 mb-20 text-center text-white">
           <h2 className="text-6xl font-[1000] uppercase italic tracking-tighter mb-4">Case Files</h2>
           <p className="text-yellow-400 font-black uppercase text-xs tracking-[0.5em]">深度生态危机档案库</p>
        </div>
        
        <div className="space-y-0">
          {STACK_CARDS.map((card, i) => (
            <FolderCard key={card.id} card={card} index={i} />
          ))}
        </div>
      </section>

      {/* 页脚 */}
      <footer className="bg-white border-t-4 border-black py-16 px-12 flex flex-col md:flex-row justify-between items-center gap-8">
         <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white font-black italic text-xl">E</div>
            <span className="text-2xl font-[1000] uppercase tracking-tighter italic">修复计划</span>
         </div>
         <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center">© 2026 Ecological Guardian Platform | Data Verified</p>
         <button className="bg-black text-white px-8 py-3 font-black uppercase text-xs rounded-full hover:bg-yellow-400 hover:text-black transition-all">Join The Action</button>
      </footer>
    </div>
  );
};

export default EcoIssues;