// src/pages/NewsDetail.jsx
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Heart, Eye, MessageSquare, Bookmark, Share2, Quote, User } from 'lucide-react';
// 1. 导入详情数据
import { NEWS_DETAILS } from '../data/newsData'; 

const NewsDetail = ({ news, onBack }) => {

  const detail = NEWS_DETAILS[news.id] || { 
    sections: [{ type: 'p', text: "详细内容正在实时同步中..." }],
    tags: ["#生态保护"]
  };

  const dropCapStyle = {
    float: 'left',
    fontSize: '4.5rem',
    lineHeight: '1',
    fontWeight: '1000',
    marginRight: '0.75rem',
    color: '#000',
    fontStyle: 'italic'
  };

  useEffect(() => { window.scrollTo(0, 0); }, []);

  if (!news) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="max-w-5xl mx-auto px-6 pt-32 pb-20 font-sans text-black"
    >
      {/* 顶部操作 */}
      <div className="flex items-center justify-between mb-12">
        <button onClick={onBack} className="flex items-center gap-2 font-black uppercase text-sm border-2 border-black px-6 py-2 rounded-full hover:bg-black hover:text-white transition-all ">
          <ChevronLeft size={18}/> 返回列表
        </button>
      </div>

      {/* 标题区 */}
      <div className="mb-12">
        <span className="bg-[#FFF95E] border-2 border-black px-4 py-1 text-xs font-black uppercase mb-6 inline-block">{news.category}</span>
        <h1 className="text-5xl md:text-6xl font-[1000] italic uppercase leading-[1.1] tracking-tighter mb-8">{news.title}</h1>
      </div>

     
      <figure className="mb-16 border-4 border-black rounded-[3rem] overflow-hidden ">
        <img src={news.img} className="w-full h-auto object-cover aspect-video" alt="" />
      </figure>

    
      <article className="space-y-8 mb-20 text-xl leading-relaxed font-medium text-black">
        {detail.sections.map((section, idx) => {
          if (section.type === 'p') {
            return (
              <p key={idx}>
                {/* 仅在第一段应用首字下沉 */}
                {idx === 0 && <span style={dropCapStyle}>{section.text.charAt(0)}</span>}
                {idx === 0 ? section.text.slice(1) : section.text}
              </p>
            );
          }
          if (section.type === 'h2') {
            return (
              <h2 key={idx} className="text-3xl font-[1000] italic uppercase pt-6 border-l-8 border-[#B3F7A3] pl-6">
                {section.text}
              </h2>
            );
          }
          if (section.type === 'quote') {
            return (
              <div key={idx} className="bg-slate-50 border-4 border-black p-10 rounded-[2.5rem] relative my-16 ">
                <Quote className="absolute -top-6 -left-2 opacity-20 text-black" size={80} />
                <p className="italic font-[1000] text-2xl relative z-10 mb-6 leading-tight italic">"{section.text}"</p>
                <cite className="block text-right font-black uppercase text-sm opacity-50">— {section.author}</cite>
              </div>
            );
          }
          return null;
        })}
      </article>

      {/* 底部标签 */}
      <div className="border-t-4 border-black pt-10 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex gap-3">
          {detail.tags.map(tag => (
            <span key={tag} className="text-[10px] font-black px-4 py-2 border-2 border-black rounded-lg uppercase tracking-tighter bg-white hover:bg-black hover:text-white transition-all">{tag}</span>
          ))}
        </div>
        <button className="flex items-center gap-3 bg-[#B3F7A3] border-4 border-black px-10 py-5 font-[1000] uppercase tracking-widest rounded-2xl hover:translate-y-[-4px] hover: transition-all">
          支持此项目 <Heart size={20} fill="currentColor" />
        </button>
      </div>
    </motion.div>
  );
};

export default NewsDetail;