import React from 'react'
import './App.css'
import { BrowserRouter, Route, Router, Routes } from 'react-router-dom'
import Homepage from './pages/Homepage'
import ProductPage from './pages/ProductPage'
import S3Image from './components/ImageViewer'
import UploadPage from './pages/UploadPage'
import PageProduct from './pages/PageProduct'

const App = () => {
  return (
    <BrowserRouter>
     <div>
       <Routes>
        <Route path='/' element={<Homepage />} />
        <Route path="/product/:productId" element={<ProductPage />} /> {/* Product page with ID */}
        <Route path='/Image' element={<S3Image />} />
        <Route path='/upload' element={<UploadPage />} />
        <Route path='/page/:pro' element={<PageProduct />} />
       </Routes>
     </div>
    </BrowserRouter>
  )
}

export default App
