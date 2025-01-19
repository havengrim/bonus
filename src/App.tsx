import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Page from './app/dashboard/page';
import LoginPage from './app/login/page';
import { ToastContainer } from 'react-toastify'; // Import ToastContainer
import 'react-toastify/dist/ReactToastify.css'; // Import Toastify CSS
import './index.css';
import CNAIncentivePage from './app/dashboard/cna';
import Gratuity from './app/dashboard/gratuity';
import CreateUserPage from './app/dashboard/CreateUserPage';


const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/page" element={<Page />} />
        <Route path="/cna" element={<CNAIncentivePage />} />
        <Route path="/gratuity" element={<Gratuity />} />
        <Route path="/create" element={<CreateUserPage />} />
        <Route path="/" element={<LoginPage />} />
      </Routes>
      
      {/* Include ToastContainer here */}
      <ToastContainer />
    </Router>
  );
}

export default App;
