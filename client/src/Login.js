import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from './services/apiService';
import { initializeSocket } from './services/socketService';
import './Login.css';

function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await authService.login(form);
      const { user, token } = response;
      
      // Store auth data
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
      
      // Initialize socket connection
      initializeSocket(user._id);
      
      alert(`Welcome, ${user.name}`);
      navigate('/home');
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        alert(err.response.data.message);
      } else {
        alert('Login failed. Please try again.');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1>Telegram</h1>
      <h2>Login</h2>
      <input 
        placeholder="Email" 
        value={form.email}
        onChange={e => setForm({ ...form, email: e.target.value })} 
      /><br />
      <input 
        type="password" 
        placeholder="Password" 
        value={form.password}
        onChange={e => setForm({ ...form, password: e.target.value })} 
      /><br />
      <button type="submit">Login</button>
      <h2>Don't have an account?</h2>
      <a href='/signup'>Create account</a>
    </form>
  );
}

export default Login;