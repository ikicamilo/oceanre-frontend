import React, { createContext, useState, useEffect } from 'react';
import { login as apiLogin, me as apiMe } from '../api/auth';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export function AuthProvider({ children }){
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem(import.meta.env.VITE_AUTH_TOKEN_KEY);
    if (token) {
      apiMe().then(data => { setUser(data.user); setLoading(false); }).catch(()=>{ setUser(null); setLoading(false);} );
    } else setLoading(false);
  }, []);

  async function login(email,password){
    const data = await apiLogin(email,password);
    localStorage.setItem(import.meta.env.VITE_AUTH_TOKEN_KEY, data.token);
    setUser(data.user);
    navigate('/');
  }

  function logout(){
    localStorage.removeItem(import.meta.env.VITE_AUTH_TOKEN_KEY);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}