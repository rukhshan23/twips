//Import React core library
import React from 'react';
//import BrowserRouter for routing functionality
//import Routes for defining the routes and rendering the appropriate components based on URL
//import Route for defining individual routes
import { BrowserRouter, Routes, Route } from 'react-router-dom';
//import page components
import Register from './pages/Register';
import Login from './pages/Login'
import Chat from './pages/Chat'
import SetAvatar from './pages/SetAvatar'

//App is the main component
export default function App() {
  return (
    <BrowserRouter>
    {/* */}
      <Routes>
        {/* Register component is renedered when url contain /register */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/setAvatar" element={<SetAvatar />} />
        <Route path="/" element={<Chat />} />
      </Routes>
    </BrowserRouter>
  );
}
