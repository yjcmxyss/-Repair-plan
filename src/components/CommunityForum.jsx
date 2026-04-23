// 必须包含 https:// 协议头
const API_BASE = "https://repair-plan-backend-production.up.railway.app";
// @ts-nocheck
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom'; // 导入路由跳转

import { 
  Heart, MessageCircle, Share2, Eye, PencilLine, 
  Bell, Flame, Leaf, Sun, Wind, Calendar, Users, Clock, X, ChevronRight,
  Trophy, CheckCircle 
} from 'lucide-react';

// --- 原始展示数据 (作为备份) ---
const INITIAL_POSTS = [
  { id: "p1_1", author: "气候行动组", authorImg: "https://picsum.photos/id/1039/60/60", date: "2025-12-20", role: "官方认证", title: "2025全球碳中和目标进展", content: "全球变暖导致极端天气频发，各国加速能源转型。最新报告显示可再生能源占比创新高。", images: ["https://picsum.photos/id/1039/300/200"], tags: ["气候行动"], likes: 528, comments: 142, category: "气候行动" },
  { id: "p1_4", author: "森林守护队", authorImg: "https://picsum.photos/id/1062/60/60", date: "2025-12-17", role: "官方项目组", title: "热带雨林危机：每分钟消失3个足球场", content: "非法砍伐严重，我们需要立即行动守护地球之肺。", images: [], tags: ["森林保护"], likes: 689, comments: 211, category: "森林保护" },
  { id: "p1_7", author: "海洋保护中心", authorImg: "https://picsum.photos/id/1069/60/60", date: "2025-12-14", role: "官方认证", title: "海洋塑料污染：每年800万吨入海", content: "塑料垃圾遍布全球海沟，急需循环经济方案。", images: ["https://picsum.photos/id/1069/300/200"], tags: ["海洋保护"], likes: 845, comments: 312, category: "海洋保护" },
  { id: "p3_1", author: "野生动物保护协会", authorImg: "https://picsum.photos/id/102/60/60", date: "2025-12-10", role: "公益组织", title: "亚洲象、东北虎栖息地修复", content: "建立自然保护区，种群数量稳步恢复。", images: [], tags: ["野生动物"], likes: 456, comments: 78, category: "野生动物" },
];

const CommunityForum = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [activeCategory, setActiveCategory] = useState('全部');
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [time, setTime] = useState(new Date());

  // --- 新增逻辑：配置与状态 ---
  const [user, setUser] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');

  // 获取数据库帖子
  const fetchPosts = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/posts`);
      const data = await res.json();
      if (data.code === 0) setPosts(data.data.reverse());
    } catch (err) { console.error("获取数据失败"); }
  };

 const handleLike = async (postId) => {
  // 1. 先检查本地存储，看这个用户是否给这个帖子点过赞
  const hasLiked = localStorage.getItem(`liked_post_${postId}`);
  if (hasLiked) {
    alert("你已经点过赞啦！");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/like-post`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId })
    });

    if (res.ok) {
      // 2. 点赞成功后，在本地存入标记
      localStorage.setItem(`liked_post_${postId}`, 'true');
      
      // 3. 更新 UI
      setPosts(prev => prev.map(p => 
        p.id === postId ? { ...p, likes: (p.likes || 0) + 1, isLiked: true } : p
      ));
    }
  } catch (err) {
    console.error("点赞失败:", err);
  }
};

const handleCommentSubmit = async (postId, content) => {
  // 如果没登录，拦截并提醒
  if (!user) {
    alert("🔒 请先登录后再发表见解！");
    navigate('/profile');
    return;
  }
  
  // 过滤空内容
  if (!content.trim()) return;

  try {
    const res = await fetch(`${API_BASE}/api/add-comment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        postId,
        username: user.name, // 使用登录用户的昵称
        content: content,
        avatar: user.avatar  // 使用登录用户的头像 (Base64)
      })
    });

    if (res.ok) {
      // 评论成功后，重新获取帖子列表以刷新显示
      fetchPosts();
    } else {
      const data = await res.json();
      alert(data.msg || "评论失败");
    }
  } catch (err) {
    console.error("评论请求出错:", err);
    alert("连接后端失败，请检查网络");
  }
};

  // 初始化逻辑
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    
    // 获取登录状态
    const localUser = localStorage.getItem('user');
    if (localUser) setUser(JSON.parse(localUser));

    fetchPosts(); // 从 Railway 拉取数据

    return () => clearInterval(timer);
  }, []);

  // 过滤逻辑
  const filteredPosts = useMemo(() => {
    return activeCategory === '全部' ? posts : posts.filter(p => p.category === activeCategory);
  }, [activeCategory, posts]);

  // 发布按钮拦截
  const handleOpenModal = () => {
    if (!user) {
      alert('🔒 请先登录后再发布内容！');
      navigate('/profile');
      return;
    }
    setIsPostModalOpen(true);
  };

  // 提交发帖到后端
  const handleTransmit = async () => {
    if (!newTitle.trim() || !newContent.trim()) {
      alert('请完整填写标题和内容');
      return;
    }

    const postData = {
      author: user.username,
      authorNickname: user.name,
      authorImg: user.avatar,
      role: user.role === 'admin' ? "管理员" : "社区成员",
      title: newTitle,
      content: newContent,
      category: activeCategory === '全部' ? "环保科普" : activeCategory,
      date: new Date().toISOString().split('T')[0]
    };

    try {
      const res = await fetch(`${API_BASE}/api/add-post`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData)
      });
      const data = await res.json();
      if (data.code === 0) {
        alert('✅ 发布成功，已永久保存！');
        setIsPostModalOpen(false);
        setNewTitle('');
        setNewContent('');
        fetchPosts(); // 刷新列表
      }
    } catch (err) { alert('发布失败，请检查 Railway 后端连接'); }
  };

  return (
    <div className="min-h-screen bg-white text-black pt-24 pb-20 font-sans">
      
      {/* 1. 顶部视频横幅 */}
      <div className="relative h-[400px] w-full overflow-hidden mb-12">
        <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
          <source src="/shiping.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white px-4">
          <motion.h1 initial={{y:20, opacity:0}} animate={{y:0, opacity:1}} className="text-5xl font-[1000] italic uppercase tracking-tighter mb-4">Community.Interactions</motion.h1>
          <p className="text-lg font-medium opacity-80 max-w-2xl text-center">汇聚全球环保力量，共建可持续地球家园</p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6">
        {/* 公告栏 */}
        <div className="border-2 border-black rounded-2xl p-4 mb-10 flex items-center gap-4 bg-white">
          <div className="bg-[#E0CB28] text-white px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest flex items-center gap-2">
            <Bell size={14} /> Notice
          </div>
          <p className="text-sm font-bold truncate">2025全球环保志愿行动正式启动，欢迎全国志愿者加入我们的保护计划！</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* 左侧：列表区 */}
          <div className="lg:col-span-2 flex-1">
            {/* 分类筛选 */}
            <div className="flex flex-wrap gap-2 mb-8 border-b-2 border-black/5 pb-6">
              {['全部', '气候行动', '森林保护', '海洋保护', '野生动物', '环保科普'].map(cat => (
                <button 
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-6 py-2 rounded-full border-2 border-black font-black text-xs uppercase transition-all
                    ${activeCategory === cat ? 'bg-[#FFF95E] text-black' : 'bg-white text-black hover:bg-slate-100'}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* 帖子循环 */}
            <div className="space-y-6">
              {filteredPosts.map(post => (
                <motion.div 
                  layout
                  key={post.id}
                  className="bg-white border-2 border-black rounded-[2rem] p-8 transition-all hover:translate-y-[-2px]"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <img src={post.authorImg || post.authorImg} className="w-12 h-12 rounded-full border-2 border-black object-cover" alt=""/>
                    <div>
                      <h4 className="font-black text-base">{post.authorNickname || post.author}</h4>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{post.date} • {post.role}</div>
                    </div>
                  </div>
                  <h3 className="text-2xl font-[1000] italic uppercase tracking-tight mb-4">{post.title}</h3>
                  <p className="text-slate-600 font-medium leading-relaxed mb-6">{post.content}</p>
                  
                  {post.images && post.images.length > 0 && (
                    <div className="rounded-2xl overflow-hidden border-2 border-black mb-6">
                      <img src={post.images[0]} className="w-full h-64 object-cover transition-all duration-700" alt=""/>
                    </div>
                  )}

                 <div className="flex items-center gap-6">
  {/* 点赞按钮 */}
  <button 
    onClick={() => handleLike(post.id)}
    className="flex items-center gap-2 text-slate-500 hover:text-[#2e7d32] transition-colors group"
  >
    <div className="p-2 rounded-full group-hover:bg-green-50">
      <Heart size={20} className={post.likes > 0 ? "fill-red-500 text-red-500" : ""} />
    </div>
    <span className="font-bold">{post.likes || 0}</span>
  </button>

  {/* 评论按钮 */}
  <button className="flex items-center gap-2 text-slate-500 hover:text-blue-500 transition-colors group">
    <div className="p-2 rounded-full group-hover:bg-blue-50">
      <MessageCircle size={20} />
    </div>
    {/* 这里判断 comments 是否存在并解析 */}
    <span className="font-bold">
      {post.comments ? (typeof post.comments === 'string' ? JSON.parse(post.comments).length : post.comments.length) : 0}
    </span>
  </button>
</div>
<div className="mt-4 pt-4 border-t-2 border-slate-100">
  <input 
    type="text"
    placeholder="发表你的见解 (回车发送)..."
    className="w-full bg-slate-50 border-2 border-slate-200 p-3 rounded-xl font-bold text-sm outline-none focus:border-black transition-all"
    onKeyDown={(e) => {
      if (e.key === 'Enter') {
        handleCommentSubmit(post.id, e.target.value);
        e.target.value = ""; // 发送后清空
      }
    }}
  />
</div>
<div className="mt-6 space-y-4">
  {(() => {
    try {
      // 1. 解析评论数据（兼容字符串和对象格式）
      const commentList = typeof post.comments === 'string' 
        ? JSON.parse(post.comments) 
        : (post.comments || []);

      return commentList.map((comment, idx) => (
        <motion.div 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          key={idx} 
          className="flex gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100"
        >
          {/* 评论者头像 */}
          <img 
            src={comment.avatar || "https://picsum.photos/60/60"} 
            className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
          />
          <div className="flex-1">
            <div className="flex justify-between items-center mb-1">
              <span className="font-black text-xs uppercase tracking-wider text-slate-400">
                {comment.username}
              </span>
              <span className="text-[10px] text-slate-300 font-bold">
                {comment.date}
              </span>
            </div>
            <p className="text-sm font-bold text-slate-700 leading-relaxed">
              {comment.content}
            </p>
          </div>
        </motion.div>
      ));
    } catch (e) {
      console.error("解析评论失败", e);
      return null;
    }
  })()}
</div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* 右侧：侧边栏卡片 */}
          <aside className="lg:w-[360px] space-y-6">
            
            {/* 1. 发布按钮 */}
            <button 
              onClick={handleOpenModal}
              className="w-full bg-[#FFF95E] text-black py-5 rounded-[1.5rem] border-2 border-black font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-white t transition-all"
            >
              <PencilLine size={20} /> 发布环保帖子
            </button>

            {/* 2. 社区公告 */}
            <div className="bg-white border-2 border-black rounded-[2rem] p-6">
              <h3 className="font-black uppercase text-sm mb-4 flex items-center gap-2"><Bell size={18} className="text-[#2e7d32]"/> Announcements</h3>
              <div className="space-y-3">
                <div className="p-3 bg-green-50 border-l-4 border-[#2e7d32] rounded-r-xl">
                  <p className="text-xs font-black text-black">世界地球日活动开启</p>
                  <p className="text-[10px] text-gray-500 mt-1">4月22日分享行动赢取奖品</p>
                </div>
                <div className="p-3 bg-blue-50 border-l-4 border-[#0288d1] rounded-r-xl">
                  <p className="text-xs font-black text-black">环保知识打卡计划</p>
                  <p className="text-[10px] text-gray-500 mt-1">每日学习积分换好礼</p>
                </div>
              </div>
            </div>

            {/* 3. 热门话题 */}
            <div className="bg-white border-2 border-black rounded-[2rem] p-6">
              <h3 className="font-black uppercase text-sm mb-4 flex items-center gap-2"><Flame size={18} className="text-orange-500"/> Hot Topics</h3>
              <div className="space-y-2">
                {['#低碳生活实践', '#保护生物多样性', '#海洋减塑行动'].map((t, i) => (
                  <div key={i} className="flex justify-between items-center p-2 hover:bg-slate-50 rounded-xl cursor-pointer font-bold text-xs">
                    <span className="text-slate-400">#</span> {t}
                    <span className="text-[10px] opacity-30">{(4-i)*1.5}k</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. 今日绿色行动 */}
            <div className="bg-[#e6f7e9] border-2 border-black rounded-[2rem] p-6 text-[#2e7d32]">
              <h3 className="font-black uppercase text-xs mb-3 flex items-center gap-2"><Leaf size={16}/> Daily Action</h3>
              <p className="text-sm font-bold leading-relaxed mb-4 italic">“每周少开一天车，碳排放减少约15%”</p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-white px-3 py-1 border border-black text-[9px] font-black rounded-full uppercase">🚲 骑行</span>
                <span className="bg-white px-3 py-1 border border-black text-[9px] font-black rounded-full uppercase">♻️ 自备杯</span>
              </div>
            </div>

            {/* 5. 今日天气 */}
            <div className="bg-white border-2 border-black rounded-[2rem] p-6 text-black">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-black uppercase opacity-40 text-black">Local Climate</span>
                < Sun size={20} className="text-orange-400" />
              </div>
              <div className="flex items-end gap-2 mb-4">
                <span className="text-4xl font-[1000] italic leading-none">26°C</span>
                <span className="text-xs font-black uppercase">Sunny</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px] font-black uppercase border-t border-black/5 pt-4 text-black">
                <div className="flex items-center gap-1 text-blue-500"><Wind size={12}/> Wind 2LV</div>
                <div className="flex items-center gap-1 text-emerald-500"><Leaf size={12}/> AQI 38</div>
              </div>
            </div>

            {/* 6. 环保日历 */}
            <div className="bg-white border-2 border-black rounded-[2rem] p-6 text-black">
              <h3 className="font-black uppercase text-sm mb-4 flex items-center gap-2"><Calendar size={18}/> Calendar</h3>
              <div className="space-y-2 text-xs font-bold text-black">
                <div className="flex justify-between border-b border-black/5 pb-2"><span>世界地球日</span><span className="opacity-40">04/22</span></div>
                <div className="flex justify-between border-b border-black/5 pb-2"><span>世界海洋日</span><span className="opacity-40">06/08</span></div>
              </div>
            </div>

            {/* 7. 达人榜 */}
            <div className="bg-white border-2 border-black rounded-[2rem] p-6 text-black">
              <h3 className="font-black uppercase text-sm mb-4 flex items-center gap-2"><Trophy size={18} className="text-amber-500"/> Leaders</h3>
              <div className="space-y-3">
                {[
                  { n: "绿色先锋林", v: "1260", color: "bg-amber-400" },
                  { n: "海洋卫士", v: "980", color: "bg-slate-300" }
                ].map((u, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl">
                    <div className={`w-5 h-5 ${u.color} text-white rounded-full flex items-center justify-center text-[10px] font-black`}>{i+1}</div>
                    <span className="text-xs font-black flex-1 text-black">{u.n}</span>
                    <span className="text-[10px] font-bold opacity-40 text-black">🌱 {u.v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 8. 每日倡议 */}
            <div className="bg-blue-50 border-2 border-black rounded-[2rem] p-6 text-black">
              <div className="flex items-center gap-2 mb-3 font-black text-xs uppercase text-black"><MessageCircle size={16}/> Daily Initiative</div>
              <div className="bg-white p-4 border-2 border-black rounded-xl mb-4 italic font-bold text-sm leading-relaxed text-black">
                “今天请减少使用一次性餐具，自带水杯，为地球减塑。”
              </div>
              <button className="w-full bg-black text-white py-2 rounded-full font-black uppercase text-[10px] hover:bg-[#E0CB28] transition-all">
                <CheckCircle className="inline-block mr-1" size={12}/> 我要打卡
              </button>
            </div>

            {/* 9. 活跃用户 */}
            <div className="bg-white border-2 border-black rounded-[2rem] p-6 text-black">
              <h3 className="font-black uppercase text-xs mb-4 flex items-center gap-2 text-black"><Users size={16}/> Active Operators</h3>
              <div className="flex -space-x-3">
                {[101, 102, 103, 104, 105].map(id => (
                  <img key={id} src={`https://picsum.photos/id/${id}/40/40`} className="w-10 h-10 rounded-full border-2 border-white shadow-sm" alt="user" />
                ))}
                <div className="w-10 h-10 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-black text-black">+86</div>
              </div>
              <p className="text-[9px] font-bold text-slate-400 mt-4 uppercase">23 Online dynamically now</p>
            </div>

            {/* 10. 实时时钟 */}
            <div className="bg-black text-white rounded-[2rem] p-7 text-center border-2 border-black">
              <div className="text-4xl font-[1000] tracking-widest tabular-nums leading-none mb-2">
                {time.toLocaleTimeString('en-GB', { hour12: false })}
              </div>
              <div className="text-[10px] font-black text-[#93ED8A] uppercase tracking-[0.3em]">{time.toLocaleDateString()}</div>
            </div>
          </aside>
        </div>
      </main>

      {/* 发布模态框 */}
      <AnimatePresence>
        {isPostModalOpen && (
          <div className="fixed inset-0 z-[5000] flex items-center justify-center px-6">
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={() => setIsPostModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div 
              initial={{y: 50, scale: 0.9}} animate={{y: 0, scale: 1}} exit={{y: 50, scale: 0.9}}
              className="bg-white border-4 border-black w-full max-w-xl rounded-[2.5rem] p-10 relative z-10"
            >
              <button onClick={() => setIsPostModalOpen(false)} className="absolute top-6 right-6 text-black"><X /></button>
              <h2 className="text-3xl font-[1000] uppercase italic tracking-tighter mb-6 text-black">创建帖子</h2>
              
              <input 
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="这里输入标题..." 
                className="w-full border-2 border-black p-4 rounded-xl mb-4 font-bold outline-none focus:bg-slate-50 text-black uppercase" 
              />
              <textarea 
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="这里输入内容..." 
                rows={4} 
                className="w-full border-2 border-black p-4 rounded-xl mb-6 font-bold outline-none focus:bg-slate-50 text-black" 
              />
              
              <button 
                onClick={handleTransmit}
                className="w-full bg-black text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-[#E0CB28] transition-colors border-2 border-black"
              >
                发布 ↗
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CommunityForum;