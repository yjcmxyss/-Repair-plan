import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronLeft, ChevronRight, Heart, ArrowRight, PlayCircle, Star, Calendar, MapPin, FolderOpen } from 'lucide-react';

// 导入详情页组件
import NewsDetail from "../pages/NewsDetail";

const NEWS_LIST = [
  { id: "1.1", title: "全球多国联合启动亚马逊雨林保护计划，预计十年内恢复百万公顷植被", date: "2026-05-20", category: "生态保护", source: "联合国环境署", img: "news/1.1.jpg", wide: true, desc: "该计划由联合国环境规划署牵头，联合巴西、秘鲁等南美国家共同实施，利用卫星遥感技术实时监控非法采伐。" },
  { id: "1.2", title: "2026全球碳中和进展报告：超50国已完成阶段性减排目标", date: "2026-05-18", category: "气候政策", source: "国际能源署", img: "news/1.2.jpg", wide: false, desc: "最新报告显示，可再生能源占比首次超过化石燃料，全球减排进程步入快车道。" },
  { id: "2.1", title: "好消息！30余种濒危野生动物种群数量实现恢复性增长", date: "2026-05-15", category: "生物多样性", source: "野生动物协会", img: "news/2.1.jpg", wide: false, desc: "大熊猫、东北虎、朱鹮等珍稀物种野外种群数量稳步增长, 依托自然保护地建设。" },
  { id: "2.2", title: "全球海洋塑料污染治理取得突破，新型降解技术投入使用", date: "2026-05-12", category: "海洋环保", source: "海洋研究所", img: "news/2.2.jpg", wide: false, desc: "科学家研发出可快速降解海洋塑料的微生物技术，有效遏制微塑料进入食物链。" },
  { id: "3.1", title: "我国三北防护林工程迎来48周年，荒漠植被覆盖率突破历史峰值", date: "2026-05-28", category: "防沙治沙", source: "国家林草局", img: "news/3.1.jpg", wide: true, desc: "历经数十年治沙造林，北方风沙带累计修复退化土地超千万公顷，筑牢北方生态屏障。" },
  { id: "3.2", title: "极地气候监测报告：南北极冰川融化速度首次出现放缓迹象", date: "2026-05-21", category: "气候监测", source: "世界气象组织", img: "news/3.2.jpg", wide: false, desc: "多年全球减排行动初步抑制极地变暖速率，海冰消融趋势得到缓解。" },
  { id: "4.1", title: "野生华南虎野外繁育研究取得进展，物种复壮计划稳步推进", date: "2026-05-26", category: "濒危物种", source: "物种保护中心", img: "news/4.1.jpg", wide: false, desc: "人工繁育个体野化训练成果显著，为珍稀物种野外回归奠定基础。" },
  { id: "4.2", title: "全球海洋赤潮综合治理技术落地，近海富营养化污染得到遏制", date: "2026-05-29", category: "海洋环保", source: "海洋科考队", img: "news/4.2.jpg", wide: false, desc: "管控陆源污水入海排放，配套海洋生态净化系统，海水水质持续向好。" },
  { id: "5.1", title: "可完全替代塑料！植物基纤维新型环保材料实现工业化量产", date: "2026-06-01", category: "绿色科技", source: "科技日报", img: "news/2.3.jpg", wide: false, desc: "以农作物秸秆为原料，实现从农田到餐桌的零污染循环。" },
];

const VIDEO_SLIDES = [
  { id: 1, title: "冰川消融 · 临界警报", video: "news/lunbo1.mp4" },
  { id: 2, title: "厄尔尼诺 · 极端天气常态化", video: "news/lunbo2.mp4" },
  { id: 3, title: "大气污染 · 守护呼吸净土", video: "news/lunbo3.mp4" },
];

const NewsPage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // 新增状态：存储当前选中的新闻。如果为 null 则显示列表。
  const [selectedNews, setSelectedNews] = useState(null);

  return (
    <div className="min-h-screen bg-white text-black font-sans pt-24 pb-20 overflow-x-hidden">
      <AnimatePresence mode="wait">
        {!selectedNews ? (
          /* --- 1. 新闻列表界面 --- */
          <motion.div
            key="list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
          >
            <main className="max-w-7xl mx-auto px-6">
              
              {/* 视频轮播区域 */}
              <div className="relative h-[600px] bg-black border-4 border-black rounded-[2rem] overflow-hidden mb-20 ">
                <AnimatePresence mode="wait">
                  <motion.div 
                    key={currentSlide}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0"
                  >
                    <video autoPlay muted loop playsInline className="w-full h-full object-cover opacity-60">
                      <source src={VIDEO_SLIDES[currentSlide].video} type="video/mp4" />
                    </video>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <h2 className="text-white text-6xl font-[1000] uppercase italic tracking-tighter drop-shadow-2xl text-center px-10 leading-tight">
                        {VIDEO_SLIDES[currentSlide].title}
                      </h2>
                    </div>
                  </motion.div>
                </AnimatePresence>

                <button onClick={() => setCurrentSlide((s) => (s - 1 + 3) % 3)} className="absolute left-6 top-1/2 -translate-y-1/2 w-14 h-14 bg-white border-2 border-black rounded-full flex items-center justify-center hover:bg-[#fff95e] transition-all z-10 shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-y-[-45%] active:shadow-none"><ChevronLeft/></button>
                <button onClick={() => setCurrentSlide((s) => (s + 1) % 3)} className="absolute right-6 top-1/2 -translate-y-1/2 w-14 h-14 bg-white border-2 border-black rounded-full flex items-center justify-center hover:bg-[#fff95e] transition-all z-10 shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-y-[-45%] active:shadow-none"><ChevronRight/></button>
              </div>

              {/* 标题与搜索 */}
              <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16 border-b-4 border-black pb-10">
                <div className="max-w-2xl">
                  <h1 className="text-7xl font-[1000] uppercase italic tracking-tighter leading-none mb-4 text-black">
                    生态保护 <span className="text-[#FEF85E]">新闻</span>
                  </h1>
                  <p className="text-lg font-bold text-slate-500 uppercase tracking-widest">实时同步全球生态科研进展与政策动态</p>
                </div>
                <div className="relative w-full md:w-96">
                  <input type="text" placeholder="SEARCH DATABASE..." className="w-full border-2 border-black p-4 rounded-xl outline-none font-black uppercase text-sm focus:bg-[#98FF8A] " />
                  <Search className="absolute right-4 top-1/2 -translate-y-1/2" size={20} />
                </div>
              </div>

              {/* 新闻卡片网格 */}
             {/* 新闻网格 */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-24 grid-flow-row-dense">
  {NEWS_LIST.map((news) => (
    <motion.div 
      key={news.id} 
      whileHover={{ y: -8 }} 
      // 确保外层有 group 类，用于触发子元素的 hover 效果
      className={`border-2 border-black bg-white flex flex-col group ${news.wide ? 'md:col-span-2' : ''}`}
    >
      {/* 图片部分 */}
      <div 
        className="h-72 border-b-2 border-black overflow-hidden relative cursor-pointer"
        onClick={() => setSelectedNews(news)} // 图片也可以点击跳转
      >
        <img src={news.img} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt="" />
        <div className="absolute top-4 left-4 bg-black text-white px-3 py-1 text-[10px] font-black uppercase tracking-tighter">{news.category}</div>
      </div>

      <div className="p-8 flex-1 flex flex-col justify-between">
        <div>
          <div className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest">{news.date} • {news.source}</div>
          
          {/* --- 修改点：标题添加点击事件和悬停颜色 --- */}
          <h3 
            onClick={() => setSelectedNews(news)} // 1. 添加点击跳转
            className="text-3xl font-black italic uppercase leading-tight mb-4 cursor-pointer transition-colors duration-300 group-hover:text-[#E0CB28]" 
            // 2. group-hover:text-[#2e7d32] 设置悬停颜色（这里推荐深绿色，更清晰）
            // 如果你想用你那个亮绿色，可以写 group-hover:text-[#98FF8A]
          >
            {news.title}
          </h3>
          
          <p className="text-slate-500 text-sm line-clamp-2 font-medium mb-4">{news.desc}</p>
        </div>

        <button 
          onClick={() => setSelectedNews(news)}
          className="flex items-center gap-2 font-black uppercase text-xs mt-4 hover:text-[#E0CB28] transition-colors"
        >
          阅读全文 <ArrowRight size={14} />
        </button>
      </div>
    </motion.div>
  ))}
</div>

              {/* 特色倡议区域 */}
              <div className="border-4 border-black bg-[#B3F7A3] rounded-[3rem] p-10 md:p-16 mb-24 flex flex-col md:flex-row gap-12 relative overflow-hidden ">
                <div className="flex-1 z-10">
                  <div className="flex items-center gap-2 text-black text-xs font-[1000] mb-6 tracking-[0.3em] uppercase">
                    <Star size={16} fill="black" /> FEATURED INITIATIVE
                  </div>
                  <h2 className="text-4xl md:text-5xl font-[1000] italic uppercase leading-[0.9] tracking-tighter mb-8">
                    以行动守护自然，<br/>用绿色连接未来
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10 text-black">
                    <div className="flex items-start gap-3"><FolderOpen size={18} className="mt-1 shrink-0" /> <span className="text-sm font-bold uppercase">生态修复与可持续发展</span></div>
                    <div className="flex items-start gap-3"><MapPin size={18} className="mt-1 shrink-0" /> <span className="text-sm font-bold uppercase">非洲萨赫勒地区 · 尼日尔</span></div>
                    <div className="flex items-start gap-3"><Calendar size={18} className="shrink-0" /> <span className="text-sm font-bold uppercase">START DATE: 2012</span></div>
                  </div>
                  <button className="px-10 py-4 bg-black text-white font-[1000] uppercase tracking-widest rounded-xl hover:bg-white hover:text-black transition-all flex items-center gap-3 ">
                    支持生态修复 <Heart size={18} fill="currentColor" />
                  </button>
                </div>
                <div className="flex-1 h-[400px] border-4 border-black rounded-[2rem] overflow-hidden rotate-2 shadow-xl bg-white">
                   <img src="news/shou.jpg" className="w-full h-full object-cover" alt="" />
                </div>
              </div>

              {/* 底部使命区 */}
              <div className="flex flex-col md:flex-row justify-between items-center gap-12 bg-black text-white p-12 rounded-[3rem] mb-20 ">
                <div className="max-w-xl">
                  <span className="text-[#FEF85E] font-black uppercase text-xs tracking-widest">Protect what matters</span>
                  <h2 className="text-5xl font-[1000] italic uppercase tracking-tighter mt-4 leading-none">Restore nature, empower communities.</h2>
                </div>
                <div className="flex gap-10">
                  <div className="text-center">
                    <div className="text-4xl font-[1000] text-[#FEF85E] italic">128K</div>
                    <div className="text-[9px] font-bold uppercase opacity-50 tracking-widest mt-2">Trees Planted</div>
                  </div>
                  <div className="text-center border-l border-white/20 pl-10">
                    <div className="text-4xl font-[1000] text-[#FEF85E] italic">8.2K</div>
                    <div className="text-[9px] font-bold uppercase opacity-50 tracking-widest mt-2">Volunteers</div>
                  </div>
                </div>
              </div>
            </main>

            {/* 极简页脚 */}
            <footer className="bg-white border-t-2 border-black py-10 px-6 text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.5em] opacity-30 italic">© 2026 Ecological News Division | Data Source Sync: 100%</p>
            </footer>
          </motion.div>
        ) : (
          /* --- 2. 新闻详情界面 --- */
          <NewsDetail 
            key="detail"
            news={selectedNews} 
            onBack={() => setSelectedNews(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default NewsPage;