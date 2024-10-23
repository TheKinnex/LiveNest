// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './views/Login';
import Register from './views/Register';
import Conversations from './views/Conversations';
import ConversationDetail from './views/ConversationDetail';
import Verify from './views/Verify';
import Layout from './components/Layout';

const App = () => {
  return (
    // Solo UNA instancia de Router (BrowserRouter) en la raíz
    <Router>
      <Routes>
        {/* Rutas sin Layout */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify" element={<Verify />} />
 
        {/* Rutas con Layout */}
        <Route path="/*" element={<Layout />}>
          <Route path="conversations" element={<Conversations />} />
          <Route path="conversations/:id" element={<ConversationDetail />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
