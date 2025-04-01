import React from 'react'
import './App.css'
import { BrowserRouter, Route, Router, Routes } from 'react-router-dom'
import Homepage from './pages/Homepage'
import ProductPage from './pages/ProductPage'
import S3Image from './components/ImageViewer'

const App = () => {
  return (
    <BrowserRouter>
     <div>
       <Routes>
        <Route path='/' element={<Homepage />} />
        <Route path='/Product' element={<ProductPage />} />
        <Route path='/Image' element={<S3Image />} />
       </Routes>
     </div>
    </BrowserRouter>
  )
}

export default App
