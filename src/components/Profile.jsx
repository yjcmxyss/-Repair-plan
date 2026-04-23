// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title } from 'chart.js';
import { Pie, Line } from 'react-chartjs-2';

// 注册图表组件
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title);


const ProfileEdit = ({ user, updateUser }) => {
  const [form, setForm] = useState({
    name: user.name, signature: user.signature, gender: user.gender, password: user.password,
  });
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };
  const handleAvatar = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      updateUser({ ...user, avatar: url });
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch('https://repair-plan-backend-production.up.railway.app/api/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user.id, name: form.name, signature: form.signature, gender: form.gender, password: form.password, avatar: user.avatar
        })
      });
      updateUser({ ...user, ...form });
      localStorage.setItem('user', JSON.stringify({ ...user, ...form }));
      alert('✅ 资料保存成功');
    } catch (err) { alert('保存失败'); }
  };
  return (
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg border-2 border-black shadow-md">
        <div className="flex justify-center">
          <label className="cursor-pointer group">
            <img src={user.avatar} className="w-24 h-24 rounded-full border-4 border-black object-cover transition-transform group-hover:scale-105" alt="avatar" />
            <input type="file" className="hidden" onChange={handleAvatar} />
            <p className="text-xs text-center mt-1 text-gray-500">点击更换头像</p>
          </label>
        </div>
        <div><label className="font-bold text-sm block mb-1">昵称</label><input name="name" value={form.name} onChange={handleChange} className="w-full border-2 border-black p-2 rounded outline-none focus:border-blue-600" /></div>
        <div><label className="font-bold text-sm block mb-1">密码</label><input name="password" value={form.password} onChange={handleChange} className="w-full border-2 border-black p-2 rounded outline-none focus:border-blue-600" /></div>
        <div><label className="font-bold text-sm block mb-1">个性签名</label><input name="signature" value={form.signature} onChange={handleChange} className="w-full border-2 border-black p-2 rounded outline-none focus:border-blue-600" /></div>
        <div>
          <label className="font-bold text-sm block mb-1">性别</label>
          <select name="gender" value={form.gender} onChange={handleChange} className="w-full border-2 border-black p-2 rounded outline-none focus:border-blue-600">
            <option>男</option><option>女</option><option>保密</option>
          </select>
        </div>
        <button type="submit" className="bg-blue-800 text-white py-2 font-bold w-full rounded border-2 border-black hover:bg-blue-700 transition-colors">保存修改</button>
      </form>
  );
};


const MyPosts = ({ user, posts, fetchPosts }) => {
  const addComment = async (postId, content) => {
    if (!content.trim()) return;
    try {
      await fetch('https://repair-plan-backend-production.up.railway.app/api/add-comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, content, username: user.username })
      });
      fetchPosts();
    } catch (err) { }
  };
  const like = async (postId) => {
    try { await fetch('https://repair-plan-backend-production.up.railway.app/api/like-post', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ postId }) }); fetchPosts(); } catch (err) { }
  };
  const myPosts = posts.filter(p => p.author === user.username);
  return (
      <div className="space-y-4">
        <h3 className="text-xl font-bold">我的帖子</h3>
        {myPosts.length === 0 ? <div className="bg-white p-6 border-2 border-black rounded-lg text-center">暂无发布的帖子</div> : (
            myPosts.map(p => (
                <div key={p.id} className="border-2 border-black p-4 rounded-lg bg-white shadow hover:shadow-lg transition-shadow text-left">
                  <h3 className="font-bold text-lg">{p.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{p.content}</p>
                  <div className="flex gap-3 mt-3 text-sm">
                    <button onClick={() => like(p.id)} className="text-red-600 font-bold flex items-center gap-1">❤️ 点赞 {p.likes}</button>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${p.status === 'approved' ? 'bg-blue-200 text-blue-800' : 'bg-yellow-200 text-yellow-800'}`}>{p.status}</span>
                  </div>
                  <div className="mt-3">
                    <input placeholder="评论..." onKeyDown={(e) => e.key === 'Enter' && addComment(p.id, e.target.value)} className="w-full border border-black p-2 text-sm rounded outline-none" />
                  </div>
                </div>
            ))
        )}
      </div>
  );
};


const AdminPanel = ({ users, posts, setUsers, fetchPosts }) => {
  const fetchUsers = async () => { try { const res = await fetch('https://repair-plan-backend-production.up.railway.app/api/users'); const data = await res.json(); if (data.code === 0) setUsers(data.data); } catch (err) { } };
  useEffect(() => { fetchUsers(); }, []);
  const audit = async (id, status) => { try { await fetch('https://repair-plan-backend-production.up.railway.app/api/audit-post', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) }); fetchPosts(); } catch (err) { } };
  return (
      <div className="bg-white p-4 border-2 border-black rounded-lg text-left">
        <h3 className="font-bold text-lg mb-3">帖子审核</h3>
        <div className="space-y-2">
          {posts.map(p => (
            <div key={p.id} className="border-b pb-2 flex justify-between items-center">
              <div><div className="font-bold">{p.title}</div><div className="text-xs text-gray-600">作者：{p.author}</div></div>
              <div className="flex gap-2">
                <button onClick={() => audit(p.id, 'approved')} className="text-sm px-2 py-1 bg-blue-800 text-white border border-black">通过</button>
                <button onClick={() => audit(p.id, 'rejected')} className="text-sm px-2 py-1 bg-red-800 text-white border border-black">拒绝</button>
              </div>
            </div>
          ))}
        </div>
      </div>
  );
};


const Charts = ({ users }) => {
  const genderData = {
    labels: ['男', '女', '保密'],
    datasets: [{ data: [users.filter(u => u.gender === '男').length, users.filter(u => u.gender === '女').length, users.filter(u => u.gender === '保密').length], backgroundColor: ['#3b82f6', '#ec4899', '#6b7280'], borderColor: '#000', borderWidth: 1 }],
  };
  return (
    <div className="bg-white p-4 border-2 border-black rounded-lg max-w-md mx-auto">
      <h3 className="font-bold text-lg mb-3 text-center">用户性别统计</h3>
      <Pie data={genderData} />
    </div>
  );
};

// --- 主页面 Profile ---
const Profile = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState('profile');
  const [authMode, setAuthMode] = useState('login');

  useEffect(() => {
    const localUser = localStorage.getItem('user');
    if (localUser) setUser(JSON.parse(localUser));
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await fetch('https://repair-plan-backend-production.up.railway.app/api/posts');
      const data = await res.json();
      if (data.code === 0) setPosts(data.data);
    } catch (err) { }
  };

  const handleLogin = async (username, password) => {
    try {
      const res = await fetch('https://repair-plan-backend-production.up.railway.app/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) });
      const data = await res.json();
      if (data.code === 0) {
        setUser(data.data);
        localStorage.setItem('user', JSON.stringify(data.data));
        fetchPosts();
      } else { alert(data.msg); }
    } catch (err) { alert('连接服务器失败'); }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    navigate('/');
  };

  const updateUser = (newData) => {
    setUser(newData);
    localStorage.setItem('user', JSON.stringify(newData));
  };

  return (
      <div className="w-full min-h-screen bg-transparent">
       

        {!user ? (
            <div className="container mx-auto px-6 pt-32 pb-12">
              <div className="max-w-md mx-auto bg-white border-2 border-black rounded-lg shadow-[4px_4px_0px_rgba(0,0,0,1)] overflow-hidden text-left">
                <div className="flex border-b-2 border-black">
                  <button onClick={() => setAuthMode('login')} className={`flex-1 py-3 font-bold text-sm ${authMode === 'login' ? 'bg-blue-700 text-white' : 'bg-white text-black'}`}>登录</button>
                  <button onClick={() => setAuthMode('register')} className={`flex-1 py-3 font-bold text-sm ${authMode === 'register' ? 'bg-blue-700 text-white' : 'bg-white text-black'}`}>注册</button>
                </div>
                <div className="p-8">
                  {authMode === 'login' ? (
                      <form onSubmit={(e) => { e.preventDefault(); handleLogin(e.target.username.value, e.target.password.value); }} className="space-y-4">
                        <div><label className="block text-sm font-bold mb-1">用户名</label><input name="username" className="w-full border-2 border-black p-2 rounded outline-none" defaultValue="user" /></div>
                        <div><label className="block text-sm font-bold mb-1">密码</label><input name="password" type="password" className="w-full border-2 border-black p-2 rounded outline-none" defaultValue="123456" /></div>
                        <button type="submit" className="w-full bg-blue-700 text-white py-3 font-bold rounded border-2 border-black hover:bg-blue-600 transition-colors">登录</button>
                      </form>
                  ) : (
                      <form className="space-y-4">
                        
                         <p className="text-center text-sm">请先开发后端注册接口</p>
                      </form>
                  )}
                </div>
              </div>
            </div>
        ) : (
          
            <div className="w-full pt-32 pb-12 px-6">
              <div className="container mx-auto max-w-6xl space-y-8 text-left">
                
           
                <div className="flex gap-4 flex-wrap bg-white p-4 border-2 border-black rounded-lg items-center">
                  <button onClick={() => setTab('profile')} className={`px-4 py-2 font-bold border-2 border-black transition-colors ${tab === 'profile' ? 'bg-indigo-600 text-white' : 'bg-white hover:bg-gray-100'}`}>个人资料</button>
                  <button onClick={() => setTab('posts')} className={`px-4 py-2 font-bold border-2 border-black transition-colors ${tab === 'posts' ? 'bg-indigo-600 text-white' : 'bg-white hover:bg-gray-100'}`}>我的帖子</button>
                  {user.role === 'admin' && (
                      <>
                        <button onClick={() => setTab('admin')} className={`px-4 py-2 font-bold border-2 border-black transition-colors ${tab === 'admin' ? 'bg-indigo-600 text-white' : 'bg-white hover:bg-gray-100'}`}>管理后台</button>
                        <button onClick={() => setTab('charts')} className={`px-4 py-2 font-bold border-2 border-black transition-colors ${tab === 'charts' ? 'bg-indigo-600 text-white' : 'bg-white hover:bg-gray-100'}`}>数据统计</button>
                      </>
                  )}
                  
               
                  <button 
                    onClick={logout} 
                    className="ml-auto bg-black text-white px-4 py-2 font-bold border-2 border-black hover:bg-red-600 transition-colors"
                  >
                    退出登录
                  </button>
                </div>

                {/* 内容区域 */}
                <div className="bg-white p-2 rounded-lg">
                  {tab === 'profile' && <ProfileEdit user={user} updateUser={updateUser} />}
                  {tab === 'posts' && <MyPosts user={user} posts={posts} fetchPosts={fetchPosts} />}
                  {tab === 'admin' && <AdminPanel users={users} posts={posts} setUsers={setUsers} fetchPosts={fetchPosts} />}
                  {tab === 'charts' && <Charts users={users} />}
                </div>
              </div>
            </div>
        )}
      </div>
  );
};

export default Profile;