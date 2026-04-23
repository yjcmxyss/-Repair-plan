// @ts-nocheck
import React, { useEffect } from 'react'; // 已修复：导入 useEffect
import { motion } from 'framer-motion';
import { 
  ChevronLeft, Heart, Eye, MessageSquare, 
  Bookmark, Share2, Quote, Calendar, User // 已修复：将 UserAstronaut 改为 User
} from 'lucide-react';

const NewsDetail = ({ news, onBack }) => {
  // 模拟首字下沉样式
  const dropCapStyle = {
    float: 'left',
    fontSize: '4.5rem',
    lineHeight: '1',
    fontWeight: '1000',
    marginRight: '0.75rem',
    color: '#000',
    fontStyle: 'italic'
  };

  // 每次进入详情页自动回到顶部
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!news) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="max-w-5xl mx-auto px-6 pt-32 pb-20 font-sans text-black"
    >
      {/* 1. 顶部导航与操作 */}
      <div className="flex items-center justify-between mb-12">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 font-black uppercase text-sm border-2 border-black px-6 py-2 rounded-full hover:bg-black hover:text-white transition-all  active:shadow-none active:translate-x-1 active:translate-y-1"
        >
          <ChevronLeft size={18}/> 返回列表
        </button>
        <div className="flex gap-4">
          <button className="p-3 border-2 border-black rounded-full hover:bg-[#FFF95E] transition-colors"><Share2 size={20}/></button>
          <button className="p-3 border-2 border-black rounded-full hover:bg-[#FFF95E] transition-colors"><Bookmark size={20}/></button>
        </div>
      </div>

      {/* 2. 文章头部元数据 */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <span className="bg-[#FFF95E] border-2 border-black px-4 py-1 text-xs font-black uppercase tracking-widest">
            {news.category}
          </span>
          <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">
            {news.source} • {news.date}
          </span>
        </div>
        
        <h1 className="text-5xl md:text-6xl font-[1000] italic uppercase leading-[1.1] tracking-tighter mb-8 text-black">
          {news.title}
        </h1>

        <div className="flex flex-wrap items-center gap-6 border-y-2 border-black py-6">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-[#98FF8A]">
   <User size={20} />  {/* ✅ 使用已经导入的 User */}
</div>
             <span className="font-black text-sm uppercase tracking-tight">修复计划 · 环境新闻部</span>
          </div>
          <div className="ml-auto flex items-center gap-8 font-black text-xs uppercase tracking-widest opacity-40">
            <span className="flex items-center gap-2"><Eye size={16}/> 2.8k Reads</span>
            <span className="flex items-center gap-2"><MessageSquare size={16}/> 47 Comments</span>
          </div>
        </div>
      </div>

      {/* 3. 特色大图 */}
      <figure className="mb-16 border-4 border-black rounded-[3rem] overflow-hidden ">
        <img 
          src={news.img} 
          className="w-full h-auto object-cover aspect-video" 
          alt={news.title} 
        />
        <figcaption className="bg-black text-white p-4 text-xs font-bold italic uppercase tracking-widest flex items-center gap-2">
           <Quote size={14} className="text-[#98FF8A]" /> 亚马逊雨林核心区监测站 · 数据实时同步中
        </figcaption>
      </figure>

      {/* 4. 正文内容 */}
      <article className="space-y-8 mb-20 text-xl leading-relaxed font-medium text-slate-800">
        <p>
          <span style={dropCapStyle}>{news.desc?.charAt(0) || "在"}</span>
          {news.desc?.slice(1) || "世界地球日当天，巴西、秘鲁、哥伦比亚、厄瓜多尔等亚马逊流域八国，联合欧盟、美国及多个国际环保组织，正式签署《亚马逊雨林联合修复与保护框架协议》。"}
        </p>

        <h2 className="text-3xl font-[1000] italic uppercase pt-6 border-l-8 border-[#98FF8A] pl-6 text-black">
          🌳 前所未有的跨国协作
        </h2>

        <p>
          根据协议，第一阶段（2026-2028年）将投入47亿美元，用于遏制非法砍伐、建立实时卫星监测网络以及启动大规模重新造林。巴西环境部长席尔瓦表示：“这不仅是雨林的转折点，更是全球气候治理的里程碑。”
        </p>

        {/* 引用块样式 */}
        <div className="bg-slate-50 border-4 border-black p-10 rounded-[2.5rem] relative my-16 ">
          <Quote className="absolute -top-6 -left-2 opacity-20 text-black" size={80} />
          <p className="italic font-[1000] text-2xl relative z-10 mb-6 leading-tight text-black">
            "如果亚马逊雨林消失，全球变暖将突破不可逆的临界点。这次联合行动是二十年来最具雄心的生态修复计划。"
          </p>
          <cite className="block text-right font-black uppercase text-sm tracking-widest opacity-50">
            — 联合国环境规划署 (UNEP) 执行主任
          </cite>
        </div>

        <p>
          修复计划的核心创新在于“自然资本激励机制”：参与国每恢复一公顷原生植被，即可从国际绿色基金获得额外技术援助与债务减免。同时，卫星遥感系统“Amazon Eye”将公开数据，任何公民都可以通过修复计划互动社区追踪雨林变化。
        </p>
      </article>

      {/* 5. 详情页页脚/标签 */}
      <div className="border-t-4 border-black pt-10 flex flex-col md:flex-row justify-between items-center gap-8 mb-20">
        <div className="flex gap-3">
          {["#雨林保护", "#生态修复", "#气候行动"].map(tag => (
            <span key={tag} className="text-[10px] font-black px-4 py-2 border-2 border-black rounded-lg uppercase tracking-tighter bg-white hover:bg-black hover:text-white transition-all cursor-default">
              {tag}
            </span>
          ))}
        </div>
        <button className="flex items-center gap-3 bg-[#FFF95E] border-4 border-black px-10 py-5 font-[1000] uppercase tracking-widest rounded-2xl hover:translate-y-[-4px] hover: transition-all active:translate-y-0">
          支持此修复项目 <Heart size={20} fill="currentColor" />
        </button>
      </div>
    </motion.div>
  );
};

export default NewsDetail;