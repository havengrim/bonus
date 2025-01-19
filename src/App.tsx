import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Page from './app/dashboard/page';
import LoginPage from './app/login/page';

import './index.css';
import CNAIncentivePage from './app/dashboard/cna';
import Gratuity from './app/dashboard/gratuity';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/page" element={<Page />} />
        <Route path="/cna" element={<CNAIncentivePage /> } />
        <Route path="/gratuity" element={<Gratuity /> } />
        <Route path="/" element={<LoginPage />} />
      </Routes>
    </Router>
  );
}

export default App;
