import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './views/Login';
import Register from './views/Register';
import Conversations from './views/Conversations';
import ConversationDetail from './views/ConversationDetail';
import Verify from './views/Verify';
import Layout from './components/Layout';
import Profile from './views/Profile';
import EditProfile from './views/EditProfile';
import UserPosts from './views/UserPosts';
import ResetPassword from './views/ResetPassword';
import ForgotPassword from './views/ForgotPassword';
import CreatePost from './views/CreatePost';
import EditPost from './views/EditPost';
import Home from './views/Home';

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Rutas sin Layout */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Rutas con Layout */}
        <Route element={<Layout />}>
          {/* Rutas Hijas Relativas */}
          <Route index element={<Home />} />
          <Route path="conversations" element={<Conversations />} />
          <Route path="create-post" element={<CreatePost />} />
          <Route path="posts/:postId/edit" element={<EditPost />} />
          <Route path="conversations/:id" element={<ConversationDetail />} />
          <Route path="profile/:profileUsername" element={<Profile />} />
          <Route path="account/edit" element={<EditProfile />} />
          <Route path="posts/:profileUsername" element={<UserPosts />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
