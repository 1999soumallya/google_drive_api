import './App.css';
import { useCallback, useEffect, useState } from 'react';
import { storeTokenData } from './Functions/TokenValidation';
import { Route, Routes } from 'react-router-dom';
import DefaultNavbar from './Components/Navbar';
import FileList from './Components/FileList';
import { ToastContainer } from 'react-toastify';

function App() {

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleTokenFromQueryParams = useCallback(() => {
    const query = new URLSearchParams(window.location.search);
    const accessToken = query.get("accessToken");
    const refreshToken = query.get("refreshToken");
    const expirationDate = newExpirationDate();
    if (accessToken && refreshToken) {
      storeTokenData(accessToken, refreshToken, expirationDate);
      setIsLoggedIn(true);
    }
  }, []);

  const newExpirationDate = () => {
    var expiration = new Date();
    expiration.setHours(expiration.getHours() + 1);
    return expiration;
  };

  useEffect(() => {
    handleTokenFromQueryParams()
  }, [handleTokenFromQueryParams])

  const signOut = () => {
    setIsLoggedIn(false);
    sessionStorage.clear();
  };

  return (
    <>
      <DefaultNavbar isLoggedIn={isLoggedIn} signOut={signOut} />
      <Routes>
        <Route index element={<FileList />} />
      </Routes>
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClickrtl={false} pauseOnFocusLossdraggablepauseOnHovertheme="colored" />
    </>
  );
}

export default App;