import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home/home';
import Summarize from './components/Summarize/summarize';
import NavBar from './components/NavBar/navbar';
import About from './components/About/about';
import Login from './components/Login/login';
import Register from './components/Register/register';

function App() {
  return (
    <Router>
      <NavBar />
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/summarize" element={<Summarize />} />
          <Route path="/about" element={<About />} />
          <Route path ="/login" element={<Login />} />
          <Route path = "/register" element={<Register/>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
