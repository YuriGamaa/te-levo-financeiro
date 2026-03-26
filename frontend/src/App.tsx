import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Financial from './pages/Financial';
import FinancialCreate from './pages/FinancialCreate';
import FinancialEdit from './pages/FinancialEdit';
import Recharges from './pages/Recharges';
import Franchises from './pages/Franchises';
import FranchiseCreate from './pages/FranchiseCreate';
import FranchiseEdit from './pages/FranchiseEdit';
import Users from './pages/Users';
import UserCreate from './pages/UserCreate';
import UserEdit from './pages/UserEdit'; // <--- 1. VERIFIQUE SE ESTA LINHA EXISTE NO TOPO
import TechFees from './pages/TechFees'; 
import DailyClosing from './pages/DailyClosing';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/daily-closing" element={<DailyClosing />} />
          <Route path="/recharges" element={<Recharges />} />
          <Route path="/financial" element={<Financial />} />
          <Route path="/financial/new" element={<FinancialCreate />} />
          <Route path="/financial/edit/:id" element={<FinancialEdit />} />

          <Route path="/franchises" element={<Franchises />} />
          <Route path="/franchise-create" element={<FranchiseCreate />} />
          <Route path="/franchise-edit/:id" element={<FranchiseEdit />} />

          {/* --- BLOCO DE USUÁRIOS --- */}
          <Route path="/users" element={<Users />} />
          <Route path="/users/new" element={<UserCreate />} />
          <Route path="/users/edit/:id" element={<UserEdit />} /> {/* <--- 2. ESTA LINHA É A CHAVE! */}
          
          <Route path="/tech-fees" element={<TechFees />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;