import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { ANIMAL_DATA, CATEGORIES } from '../data/animalData'; 
import '../index.css';

const BG_MAP = {
  '全部': 'space1.png', // 自然全景
  '森林生态': 'space/森林.png', // 森林
  '海洋生态': 'space/海洋.png', // 海洋
  '极地生态': 'space/极地.png', // 极地/冰川
  '草原生态': 'space/草原.png', // 草原
};

export default function EndangeredAnimals({ onSelectAnimal,onCloseDetail }) {
  const [activeCat, setActiveCat] = useState('全部');
  const [selected, setSelected] = useState(null);
  const constraintsRef = useRef(null); 
  const pointerStart = useRef({ x: 0, y: 0 });
  const [positions, setPositions] = useState({});

  const filtered = useMemo(() => {
    if (!ANIMAL_DATA) return [];
    return activeCat === '全部' ? ANIMAL_DATA : ANIMAL_DATA.filter(a => a.category === activeCat);
  }, [activeCat]);

  // --- 【重构居中杂乱布局算法】 ---
  useEffect(() => {
    if (!filtered || filtered.length === 0) return;

    const newPositions = { ...positions };
    const cardWidth = 300;
    const horizontalGap = 260; // 稍微调大一点点，防止重叠得看不见字
    const verticalGap = 340;   
    
    // 获取当前容器宽度（默认为窗口宽度）
    const containerWidth = constraintsRef.current?.offsetWidth || window.innerWidth;
    
    // 根据屏幕宽度动态决定每行放几个，实现真正的全屏铺满
    const cardsPerRow = Math.max(1, Math.floor((containerWidth - 100) / horizontalGap));

    filtered.forEach((animal, index) => {
      const row = Math.floor(index / cardsPerRow);
      const col = index % cardsPerRow;

      // 计算当前行的总宽度，用于居中对齐
      const itemsInThisRow = Math.min(cardsPerRow, filtered.length - row * cardsPerRow);
      const rowWidth = (itemsInThisRow - 1) * horizontalGap + cardWidth;
      const startX = (containerWidth - rowWidth) / 2;

      // 1. 基础居中坐标
      const baseX = startX + col * horizontalGap;
      const baseY = row * verticalGap + 60;
      
      // 2. 强力随机偏移（产生“乱”感）
      const jitterX = Math.random() * 80 - 40; 
      const jitterY = Math.random() * 80 - 40; 
      
      // 3. 随机角度
      const randomRotate = Math.random() * 12 - 6; // -6度 到 6度

      newPositions[animal.id] = { 
        x: baseX + jitterX, 
        y: baseY + jitterY,
        rotate: randomRotate,
        zIndex: Math.floor(Math.random() * 20) 
      };
    });

    setPositions(newPositions);
  }, [activeCat, filtered.length]); 

  const handlePointerDown = (e) => {
    pointerStart.current = { x: e.clientX, y: e.clientY };
  };

  const handleCardClick = (animal, e) => {
    const distance = Math.sqrt(
      Math.pow(e.clientX - pointerStart.current.x, 2) +
      Math.pow(e.clientY - pointerStart.current.y, 2)
    );
    if (distance < 5) setSelected(animal);
     if (onSelectAnimal) onSelectAnimal(animal);
  };

  if (!ANIMAL_DATA || !CATEGORIES) return null;

  
  return (
  <div className="relative w-full min-h-screen font-sans text-black overflow-visible transition-all duration-1000 ease-in-out"
         style={{
           backgroundImage: `url(${BG_MAP[activeCat] || BG_MAP['全部']})`,
           backgroundSize: 'cover',
           backgroundPosition: 'center',
           backgroundAttachment: 'fixed' // 视差滚动效果
         }}>
      
      {/* 1. 分类导航 */}
      {/* 1. 分类导航 - 这里开始替换 */}
      <motion.div 
        // 1. 初始状态：在下方一点，透明
        initial={{ y: 80, opacity: 0 }} 
        // 2. 滚入视口时：滑到原位，变不透明
        whileInView={{ y: 0, opacity: 1 }} 
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        
        // 3. 保持原本的 sticky 悬浮和层级
        className="flex justify-center mb-20 sticky top-10 w-full px-4 pointer-events-none z-[1000]"
      >
        <div className="
          flex items-center px-8 py-2 
          bg-white border-2 border-black rounded-full 
          shadow-[0_10px_30px_rgba(0,0,0,0.1)] 
          pointer-events-auto
        ">
          {/* 左侧黑点 */}
          <div className="w-2.5 h-2.5 bg-black rounded-full mr-8 shrink-0" />

          {/* 导航选项 */}
          <div className="flex items-center gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCat(cat)}
                className={`
                  px-6 py-1.5 rounded-xl text-base font-[1000] uppercase tracking-wider transition-all duration-200
                  ${activeCat === cat 
                    ? 'bg-black text-white' 
                    : 'bg-transparent text-black hover:bg-slate-100'
                  }
                `}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* 2. 展示卡片区 (300px) */}
        <div ref={constraintsRef} className="relative w-full min-h-[1400px] pb-40 overflow-visible">
        <AnimatePresence>
          {filtered.map((animal, index) => {
            // 【关键修复点】：如果 positions 里还没存入这个 animal 的坐标，给它一个 fallback 默认值，防止白屏
            const pos = positions[animal.id] || { x: index * 50, y: index * 50, rotate: 0, zIndex: 1 };

            return (
              <motion.div
                key={animal.id}
                layoutId={`card-${animal.id}`}
                drag 
                dragConstraints={constraintsRef} 
                dragMomentum={true}

                
   initial={{ 
        x: pos.x, 
        y: pos.y + 100, 
        opacity: 0, 
        rotate: pos.rotate || 0 
      }}
      // 2. 当进入视口时：回到计算位置，不透明
      whileInView={{ 
        x: pos.x, 
        y: pos.y, 
        opacity: 1, 
        rotate: pos.rotate || 0 
      }}
      
      // amount: 0.2 表示卡片露出 20% 时触发动画
      // once: false 表示每次滚入都会触发，如果你只想触发一次可以改回 true
      viewport={{ once: true, amount: 0.1 }}
      // 4. 物理效果：使用带阻尼的弹簧，让“浮”上来的感觉更真实
      transition={{ 
        type: "spring", 
        damping: 25, 
        stiffness: 100,
        delay: (index % 3) * 0.1 // 增加一点点错落感，更生动
      }}
      
      // 拖拽后的动画目标（确保手动拖拽后不被 whileInView 覆盖）
      animate={{ 
        zIndex: pos.zIndex || 1
      }}

      onDragEnd={(e) => {
        const cardRect = e.target.getBoundingClientRect();
        const parentRect = constraintsRef.current.getBoundingClientRect();
        setPositions(prev => ({ 
          ...prev, 
          [animal.id]: { 
            ...prev[animal.id],
            x: cardRect.left - parentRect.left, 
            y: cardRect.top - parentRect.top,
            rotate: 0, 
            zIndex: 50 
          } 
        }));
      }}
      onPointerDown={handlePointerDown}
      onClick={(e) => handleCardClick(animal, e)}
      whileHover={{ scale: 1.03, zIndex: 100, rotate: 0 }}
      whileDrag={{ scale: 1.05, zIndex: 200 }}
      className="absolute w-[300px] border border-black rounded-xl cursor-grab bg-white p-2.5 flex flex-col shadow-none"
      style={{ left: 0, top: 0 }} 
    >
                <div className="aspect-square w-full overflow-hidden rounded-lg pointer-events-none">
                  <img src={animal.img} className="w-full h-full object-cover" alt="" />
                </div>
                <div className="px-2 pt-8 pb-5 flex flex-col gap-6 pointer-events-none text-black">
                  <div className="space-y-1">
                    <h3 className="text-4xl font-[1000] tracking-tighter uppercase leading-none italic">{animal.name}</h3>
                    <p className="text-[9px] font-black text-slate-300 tracking-[0.2em] italic uppercase ">{animal.nameEn}</p>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-[8px] font-black px-3 py-1 rounded uppercase text-white tracking-widest" style={{ backgroundColor: animal.tagColor }}>{animal.status}</span>
                    <span className="text-[8px] font-black uppercase opacity-20 underline underline-offset-8">DATA ↗</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* 3. 详情弹窗 */}
     {/* 3. 详情弹窗 */}
<AnimatePresence>
  {selected && (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6" onClick={() =>{ setSelected(null); if (onCloseDetail) onCloseDetail(); }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-white/95 backdrop-blur-3xl" />
      
      <motion.div 
        layoutId={`card-${selected.id}`}
        className="relative w-full max-w-[1450px] h-[85vh] min-h-[800px] bg-white border-2 border-black rounded-xl overflow-hidden flex flex-col md:flex-row p-5 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >

        {/* --- 【1. 新增：背景图层】 --- */}
        <div 
          className="absolute inset-0 z-0 opacity-60 pointer-events-none" 
          style={{
            backgroundImage: `url('space2.png')`, // 这里替换图片
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />

        {/* --- 【2. 包装层：新增一个 div 包住原有全部内容，确保内容在背景图上方】 --- */}
        <div className="relative z-10 flex flex-col md:flex-row w-full h-full">
          
          {/* --- 【3. 修改：关闭按钮的定位，确保不被图片挡住】 --- */}
          <button className="absolute top-0 right-0 z-20 p-2 border-2 border-black rounded-full hover:bg-black hover:text-white transition-all" onClick={() => {setSelected(null);  if (onCloseDetail) onCloseDetail();}}>
            <X size={20} />
          </button>

          {/* 左侧图 (保持不变) */}
          <div className="md:w-[48%] h-full relative overflow-hidden rounded-lg">
            <img src={selected.img} className="w-full h-full object-cover" alt=""/>
          </div>

          {/* 右侧详情 (保持不变) */}
          <div className="md:w-[52%] h-full flex flex-col p-12 lg:p-16 justify-between text-black overflow-y-auto custom-scrollbar">
            
            {/* 标题 (保持不变) */}
            <div className="shrink-0">
                <h2 className="text-6xl font-[1000] tracking-tighter uppercase mb-3 leading-none  italic">{selected.name}</h2>
                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.4em] italic">{selected.nameEn}</p>
            </div>

            {/* 档案盒 (保持不变) */}
            <div className="border-2 border-black rounded-xl p-8 bg-[#fff95e] space-y-8 my-6 shrink-0">
              <div className="flex flex-col gap-2.5">
                <span className="text-[10px] font-black uppercase opacity-40 tracking-[0.2em]">01. 栖息范围</span>
                <p className="text-xl font-bold leading-relaxed">{selected.dist}</p>
              </div>
              <div className="flex flex-col gap-2.5">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">02. 主要威胁</span>
                <p className="text-xl font-bold leading-relaxed">{selected.threat}</p>
              </div>
              <div className="flex flex-col gap-2.5">
                <span className="text-[10px] font-black uppercase opacity-40 tracking-[0.2em]">03. 生态角色</span>
                <p className="text-xl font-bold leading-relaxed">{selected.role}</p>
              </div>
            </div>

            {/* 生态链容器 (保持不变) */}
            <div className="border-2 border-black rounded-xl px-6 pt-4 pb-10 bg-[#fffff] shrink-0 relative">
              <div className="flex justify-center mb-6"> 
                <span className="text-[15px] font-black uppercase tracking-[0.2em] ">食物链</span>
              </div>
              <div className="flex flex-wrap items-center gap-6 justify-center">
                {selected.chain.map((step, i) => (
                  <React.Fragment key={i}>
                    <div className="px-4 py-3 border-2 border-black rounded-xl font-black text-base uppercase bg-white ">
                      {step.name}
                    </div>
                    {i < selected.chain.length - 1 && (
                      <span className="text-xl font-black opacity-30 text-black">→</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        {/* --- 【包装层结束标签】 --- */}
        </div> 

      </motion.div>
    </div>
  )}
</AnimatePresence>
    </div>
  );
}