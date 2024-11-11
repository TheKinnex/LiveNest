import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './views/Login';
import Register from './views/Register';
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
import ChatLayout from './components/ChatLayout';
import Subscriptions from './views/Subscriptions';
import MySubscriptions from './views/MySubscriptions';
import PaymentSuccess from './views/PaymentSuccess';
import PaymentCancel from './views/PaymentCancel';

import AdminLayout from './components/AdminLayout';
import Users from './views/admin/Users';
import BlockedAccount from './views/BlockedAccount';
import AdminSubscriptions from './views/admin/Subscriptions'
import BlockedUsers from './views/admin/BlockedUsers';
import AdminPosts from './views/admin/Posts';
import Reports from './views/admin/Reports';

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
        <Route path="/blocked" element={<BlockedAccount />} />

        {/* Rutas con Layout */}
        <Route element={<Layout />}>

          {/* Rutas Hijas Relativas */}
          <Route index element={<Home />} />
          <Route path="conversations" element={<ChatLayout />} />
          <Route path="create-post" element={<CreatePost />} />
          <Route path="posts/:postId/edit" element={<EditPost />} />
          <Route path="profile/:profileUsername" element={<Profile />} />
          <Route path="account/edit" element={<EditProfile />} />
          <Route path="posts/:profileUsername" element={<UserPosts />} />
          <Route path="subscriptions" element={<Subscriptions />} />
          <Route path="my-subscriptions" element={<MySubscriptions />} />
        </Route>

        <Route path="admin" element={<AdminLayout />}>
          <Route path="users" element={<Users />} />
          <Route path="subscriptions" element={<AdminSubscriptions />} />
          <Route path="blocked-users" element={<BlockedUsers />} />
          <Route path="posts" element={<AdminPosts />} />
          <Route path="reports" element={<Reports />} />
        </Route>


        {/* Rutas de Pago sin Layout */}
        <Route path="/payments/success" element={<PaymentSuccess />} />
        <Route path="/payments/cancel" element={<PaymentCancel />} />
      </Routes>
    </Router>
  );
};

export default App;
