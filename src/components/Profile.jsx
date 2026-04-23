// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // 移除了 Link
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title } from 'chart.js';
import { Pie, Line } from 'react-chartjs-2';

// 注册图表组件
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title);

// 个人资料编辑（持久化）
const ProfileEdit = ({ user, updateUser }) => {
  const [form, setForm] = useState({
    name: user.name,
    signature: user.signature,
    gender: user.gender,
    password: user.password,
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
      await fetch('http://localhost:3001/api/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user.id,
          name: form.name,
          signature: form.signature,
          gender: form.gender,
          password: form.password,
          avatar: user.avatar
        })
      });
      updateUser({ ...user, ...form });
      localStorage.setItem('user', JSON.stringify({ ...user, ...form }));
      alert('✅ 资料保存成功（已永久保存到数据库）');
    } catch (err) {
      alert('保存失败');
    }
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

        <div>
          <label className="font-bold text-sm block mb-1">昵称</label>
          <input name="name" value={form.name} onChange={handleChange} className="w-full border-2 border-black p-2 rounded outline-none focus:border-blue-600" />
        </div>

        <div>
          <label className="font-bold text-sm block mb-1">密码</label>
          <input name="password" value={form.password} onChange={handleChange} className="w-full border-2 border-black p-2 rounded outline-none focus:border-blue-600" />
        </div>

        <div>
          <label className="font-bold text-sm block mb-1">个性签名</label>
          <input name="signature" value={form.signature} onChange={handleChange} className="w-full border-2 border-black p-2 rounded outline-none focus:border-blue-600" />
        </div>

        <div>
          <label className="font-bold text-sm block mb-1">性别</label>
          <select name="gender" value={form.gender} onChange={handleChange} className="w-full border-2 border-black p-2 rounded outline-none focus:border-blue-600">
            <option>男</option>
            <option>女</option>
            <option>保密</option>
          </select>
        </div>

        <button type="submit" className="bg-blue-800 text-white py-2 font-bold w-full rounded border-2 border-black hover:bg-blue-700 transition-colors">保存修改</button>
      </form>
  );
};

// 我的帖子（数据库持久化）
const MyPosts = ({ user, posts, setPosts, fetchPosts }) => {
  const addComment = async (postId, content) => {
    if (!content.trim()) return;
    try {
      await fetch('http://localhost:3001/api/add-comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, content, username: user.username })
      });
      fetchPosts();
    } catch (err) { }
  };

  const like = async (postId) => {
    try {
      await fetch('http://localhost:3001/api/like-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId })
      });
      fetchPosts();
    } catch (err) { }
  };

  const myPosts = posts.filter(p => p.author === user.username);

  return (
      <div className="space-y-4">
        <h3 className="text-xl font-bold">我的帖子</h3>
        {myPosts.length === 0 ? (
            <div className="bg-white p-6 border-2 border-black rounded-lg text-center">暂无发布的帖子</div>
        ) : (
            myPosts.map(p => (
                <div key={p.id} className="border-2 border-black p-4 rounded-lg bg-white shadow hover:shadow-lg transition-shadow">
                  <h3 className="font-bold text-lg">{p.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{p.content}</p>
                  <div className="flex gap-3 mt-3 text-sm">
                    <button onClick={() => like(p.id)} className="text-red-600 font-bold flex items-center gap-1">❤️ 点赞 {p.likes}</button>
                    <button className="text-yellow-600 font-bold">⭐ 收藏</button>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${p.status === 'approved' ? 'bg-blue-200 text-blue-800' : p.status === 'rejected' ? 'bg-red-200 text-red-800' : 'bg-yellow-200 text-yellow-800'}`}>
                {p.status === 'pending' ? '待审核' : p.status === 'approved' ? '已通过' : '已拒绝'}
              </span>
                  </div>
                  <div className="mt-3">
                    <input
                        placeholder="写下你的评论..."
                        onKeyDown={(e) => e.key === 'Enter' && addComment(p.id, e.target.value)}
                        className="w-full border border-black p-2 text-sm rounded outline-none"
                    />
                    <div className="mt-2 space-y-1">
                      {p.comments?.map((c, i) => (
                          <div key={i} className="text-xs text-gray-600 bg-gray-100 p-1 rounded">
                            <span className="font-bold">{c.user}</span>：{c.content}
                          </div>
                      ))}
                    </div>
                  </div>
                </div>
            ))
        )}
      </div>
  );
};

// 管理员面板
const AdminPanel = ({ users, posts, setPosts, setUsers, fetchPosts }) => {
  const fetchUsers = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/users');
      const data = await res.json();
      if (data.code === 0) setUsers(data.data);
    } catch (err) { }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const banUser = async (id, status) => {
    try {
      await fetch('http://localhost:3001/api/ban-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });
      fetchUsers();
    } catch (err) { }
  };

  const audit = async (id, status) => {
    try {
      await fetch('http://localhost:3001/api/audit-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });
      fetchPosts();
    } catch (err) { }
  };

  return (
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-4 border-2 border-black rounded-lg">
          <h3 className="font-bold text-lg mb-3">用户管理</h3>
          <div className="space-y-2">
            {users.map(u => (
                <div key={u.id} className="flex justify-between items-center border-b pb-2">
                  <div className="flex items-center gap-2">
                    <img src={u.avatar} className="w-8 h-8 rounded-full object-cover border border-black" />
                    <div>
                      <span className="font-bold">{u.username}</span>
                      <span className="text-xs mx-2">昵称：{u.name}</span>
                      <span className="text-xs mx-2 text-red-600">密码：{u.password}</span>
                      <span className="text-xs mx-2">性别：{u.gender}</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${u.status === 'banned' ? 'bg-red-200 text-red-800' : 'bg-blue-200 text-blue-800'}`}>
                    {u.status === 'banned' ? '已封禁' : '正常'}
                  </span>
                    </div>
                  </div>
                  <button
                      onClick={() => banUser(u.id, u.status === 'banned' ? 'normal' : 'banned')}
                      className={`text-sm px-2 py-1 border border-black ${u.status === 'banned' ? 'bg-blue-800 text-white' : 'bg-red-800 text-white'}`}>
                    {u.status === 'banned' ? '解除封禁' : '封禁用户'}
                  </button>
                </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-4 border-2 border-black rounded-lg">
          <h3 className="font-bold text-lg mb-3">帖子审核</h3>
          <div className="space-y-2">
            {posts.map(p => (
                <div key={p.id} className="border-b pb-2">
                  <div className="font-bold">{p.title}</div>
                  <div className="text-xs text-gray-600 mb-2">作者：{p.author} | 状态：{p.status}</div>
                  <div className="flex gap-2">
                    <button onClick={() => audit(p.id, 'approved')} className="text-sm px-2 py-1 bg-blue-800 text-white border border-black">通过</button>
                    <button onClick={() => audit(p.id, 'rejected')} className="text-sm px-2 py-1 bg-red-800 text-white border border-black">拒绝</button>
                  </div>
                </div>
            ))}
          </div>
        </div>
      </div>
  );
};

// 数据统计图表
const Charts = ({ users }) => {
  const [loginStats, setLoginStats] = useState([]);
  const [dateLabels, setDateLabels] = useState([]);

  useEffect(() => {
    const today = new Date();
    const labels = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const m = d.getMonth() + 1;
      const day = d.getDate();
      labels.push(`${m}/${day}`);
    }
    setDateLabels(labels);
    const stored = JSON.parse(localStorage.getItem('login_stats') || '[0,0,0,0,0,0,0]');
    setLoginStats(stored);
  }, []);

  const genderData = {
    labels: ['男', '女', '保密'],
    datasets: [{
      label: '用户性别统计',
      data: [
        users.filter(u => u.gender === '男').length,
        users.filter(u => u.gender === '女').length,
        users.filter(u => u.gender === '保密').length,
      ],
      backgroundColor: ['#3b82f6', '#ec4899', '#6b7280'],
      borderColor: '#000',
      borderWidth: 1
    }],
  };

  const chartOptions = {
    responsive: true,
    plugins: { legend: { position: 'top' } },
  };

  return (
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-4 border-2 border-black rounded-lg">
          <h3 className="font-bold text-lg mb-3">性别统计饼图</h3>
          <Pie data={genderData} options={chartOptions} />
        </div>
      </div>
  );
};

// 主页面
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
      const res = await fetch('http://localhost:3001/api/posts');
      const data = await res.json();
      if (data.code === 0) setPosts(data.data);
    } catch (err) { }
  };

  const recordLogin = () => {
    const todayIdx = 6;
    const stats = JSON.parse(localStorage.getItem('login_stats') || '[0,0,0,0,0,0,0]');
    stats[todayIdx] += 1;
    localStorage.setItem('login_stats', JSON.stringify(stats));
  };

  const handleLogin = async (username, password) => {
    try {
      const res = await fetch('http://localhost:3001/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (data.code === 0) {
        if (data.data.status === 'banned') {
          alert('您的账号已被管理员封禁！');
          return;
        }
        recordLogin();
        setUser(data.data);
        localStorage.setItem('user', JSON.stringify(data.data));
        alert('登录成功！');
      } else {
        alert(data.msg);
      }
    } catch (err) {
      alert('连接服务器失败');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    navigate('/profile');
  };

  const updateUser = (newData) => {
    setUser(newData);
    localStorage.setItem('user', JSON.stringify(newData));
  };

  return (
      <div className="w-full min-h-screen bg-[url('/space1.png')] bg-cover bg-center bg-fixed">
        {/* 导航栏已移除 */}

        {!user ? (
            <div className="container mx-auto px-6 pt-28 pb-12">
              <div className="max-w-md mx-auto bg-white border-2 border-black rounded-lg  overflow-hidden">
                <div className="flex border-b-2 border-black">
                  <button
                      onClick={() => setAuthMode('login')}
                      className={`flex-1 py-3 font-bold text-sm uppercase tracking-wider transition-colors ${authMode === 'login' ? 'bg-blue-700 text-white' : 'bg-white text-black hover:bg-gray-100'}`}
                  >
                    登录
                  </button>
                  <button
                      onClick={() => setAuthMode('register')}
                      className={`flex-1 py-3 font-bold text-sm uppercase tracking-wider transition-colors ${authMode === 'register' ? 'bg-blue-700 text-white' : 'bg-white text-black hover:bg-gray-100'}`}
                  >
                    注册
                  </button>
                </div>

                <div className="p-8">
                  {authMode === 'login' ? (
                      <>
                        <h2 className="text-center font-black text-2xl mb-6 text-blue-800">用户登录</h2>
                        <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              handleLogin(e.target.username.value, e.target.password.value);
                            }}
                            className="space-y-4"
                        >
                          <div>
                            <label className="block text-sm font-bold mb-1">用户名</label>
                            <input name="username" placeholder="请输入用户名" className="w-full border-2 border-black p-2 rounded outline-none" defaultValue="user" />
                          </div>
                          <div>
                            <label className="block text-sm font-bold mb-1">密码</label>
                            <input name="password" type="password" placeholder="请输入密码" className="w-full border-2 border-black p-2 rounded outline-none" defaultValue="123456" />
                          </div>
                          <button type="submit" className="w-full bg-blue-700 text-white py-3 font-bold rounded border-2 border-black hover:bg-blue-600 transition-colors">登录</button>
                        </form>
                      </>
                  ) : (
                      <>
                        <h2 className="text-center font-black text-2xl mb-6 text-blue-800">用户注册</h2>
                        <form
                            onSubmit={async (e) => {
                              e.preventDefault();
                              const username = e.target.regUsername.value.trim();
                              const password = e.target.regPassword.value;
                              const confirm = e.target.regPasswordConfirm.value;

                              if (!username || !password) {
                                alert('请填写完整信息！');
                                return;
                              }
                              if (password !== confirm) {
                                alert('两次密码不一致！');
                                return;
                              }

                              try {
                                const res = await fetch('http://localhost:3001/api/register', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ username, password })
                                });
                                const data = await res.json();
                                if (data.code === 0) {
                                  alert('注册成功！请登录');
                                  setAuthMode('login');
                                } else {
                                  alert(data.msg);
                                }
                              } catch (err) {
                                alert('注册失败');
                              }
                            }}
                            className="space-y-4"
                        >
                          <div>
                            <label className="block text-sm font-bold mb-1">用户名</label>
                            <input name="regUsername" placeholder="请设置用户名" className="w-full border-2 border-black p-2 rounded outline-none" />
                          </div>
                          <div>
                            <label className="block text-sm font-bold mb-1">密码</label>
                            <input name="regPassword" type="password" placeholder="请设置密码" className="w-full border-2 border-black p-2 rounded outline-none" />
                          </div>
                          <div>
                            <label className="block text-sm font-bold mb-1">确认密码</label>
                            <input name="regPasswordConfirm" type="password" placeholder="请再次输入密码" className="w-full border-2 border-black p-2 rounded outline-none" />
                          </div>
                          <button type="submit" className="w-full bg-blue-700 text-white py-3 font-bold rounded border-2 border-black hover:bg-blue-600 transition-colors">注册</button>
                        </form>
                      </>
                  )}
                </div>
              </div>
            </div>
        ) : (
            /* 移除了 fixed 定位和 top 偏移，使其自然占据页面 */
            <div className="container mx-auto px-6 py-12">
              <div className="max-w-6xl mx-auto space-y-8">
                {/* 选项卡栏，添加了退出登录按钮 */}
                <div className="flex gap-4 flex-wrap bg-white p-4 border-2 border-black rounded-lg items-center ">
                  <button onClick={() => setTab('profile')} className={`px-4 py-2 font-bold border-2 border-black transition-colors ${tab === 'profile' ? 'bg-indigo-600 text-white' : 'bg-white hover:bg-gray-100'}`}>个人资料</button>
                  <button onClick={() => setTab('posts')} className={`px-4 py-2 font-bold border-2 border-black transition-colors ${tab === 'posts' ? 'bg-indigo-600 text-white' : 'bg-white hover:bg-gray-100'}`}>我的帖子</button>
                  {user.role === 'admin' && (
                      <>
                        <button onClick={() => setTab('admin')} className={`px-4 py-2 font-bold border-2 border-black transition-colors ${tab === 'admin' ? 'bg-indigo-600 text-white' : 'bg-white hover:bg-gray-100'}`}>管理后台</button>
                        <button onClick={() => setTab('charts')} className={`px-4 py-2 font-bold border-2 border-black transition-colors ${tab === 'charts' ? 'bg-indigo-600 text-white' : 'bg-white hover:bg-gray-100'}`}>数据统计</button>
                      </>
                  )}
                  {/* 在选项卡最后保留退出登录按钮 */}
                  <div className="ml-auto flex items-center gap-4">
                    <span className="font-bold text-sm bg-gray-100 px-3 py-2 border-2 border-black rounded uppercase">当前用户: {user.name}</span>
                    <button onClick={logout} className="bg-black text-white px-4 py-2 font-bold border-2 border-black hover:bg-red-600 transition-colors">退出登录</button>
                  </div>
                </div>

                {tab === 'profile' && <ProfileEdit user={user} updateUser={updateUser} />}
                {tab === 'posts' && <MyPosts user={user} posts={posts} setPosts={setPosts} fetchPosts={fetchPosts} />}
                {tab === 'admin' && <AdminPanel users={users} posts={posts} setPosts={setPosts} setUsers={setUsers} fetchPosts={fetchPosts} />}
                {tab === 'charts' && <Charts users={users} />}
              </div>
            </div>
        )}
      </div>
  );
};

export default Profile;