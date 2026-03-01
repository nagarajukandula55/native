
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Products from './pages/Products'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Admin from './pages/Admin'

export default function App(){
return(
<Routes>
<Route path="/" element={<Home/>}/>
<Route path="/products" element={<Products/>}/>
<Route path="/cart" element={<Cart/>}/>
<Route path="/checkout" element={<Checkout/>}/>
<Route path="/admin" element={<Admin/>}/>
</Routes>
)}
