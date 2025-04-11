import React from 'react'
import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Homepage from './pages/Homepage'
import ProductPage from './pages/ProductPage'
import S3Image from './components/ImageViewer'
import UploadPage from './pages/UploadPage'
import PageProduct from './pages/PageProduct'
import LoginAndSignup from './pages/LoginAndSignup'
import CartPage from './pages/CartPage'
import VerifyOTP from './pages/VerifyOTP'
import ProductList from './pages/ProductList'
import ImageSearchModal from './components/ImageSearchModal'
import ModelViewer from './components/ModelView'
import { AuthProvider } from './components/authcontext'
import View from './components/View'
import InteractiveCloth from './components/View'
import Payment from './components/payment'

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Homepage />} />
          <Route path="/product/:productId" element={<ProductPage />} />
          <Route path='/Image' element={<S3Image />} />
          <Route path='/upload' element={<UploadPage />} />
          <Route path='/page/:pro' element={<PageProduct />} />
          <Route path='/login' element={<LoginAndSignup />} />
          <Route path='/cart' element={<CartPage />} />
          <Route path='/verifyotp' element={<VerifyOTP />} />
          <Route path='/list' element={<ProductList />} />
          <Route path='/ImageSearch' element={<ImageSearchModal />} />
          <Route path='/model' element={<ModelViewer />} />
          <Route path="/view/:productId" element={<InteractiveCloth />} />
          <Route path="/payment" element={<Payment />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App;
