"use client"

import { createContext, useContext, useState, useEffect } from "react"

const CartContext = createContext()

export function CartProvider({ children }) {

const [cart,setCart] = useState([])

// Load cart from localStorage
useEffect(()=>{

```
const savedCart = localStorage.getItem("cart")

if(savedCart){
  setCart(JSON.parse(savedCart))
}
```

},[])

// Save cart whenever it changes
useEffect(()=>{

```
localStorage.setItem("cart", JSON.stringify(cart))
```

},[cart])

function addToCart(product){

```
setCart(prev=>{

  const exists = prev.find(p=>p._id === product._id)

  if(exists){

    return prev.map(p =>
      p._id === product._id
      ? { ...p, quantity: p.quantity + 1 }
      : p
    )

  }

  return [...prev,{...product, quantity:1}]

})
```

}

function increaseQty(id){

```
setCart(prev =>
  prev.map(p =>
    p._id === id
    ? { ...p, quantity: p.quantity + 1 }
    : p
  )
)
```

}

function decreaseQty(id){

```
setCart(prev =>
  prev.map(p =>
    p._id === id
    ? { ...p, quantity: Math.max(1,p.quantity - 1) }
    : p
  )
)
```

}

function removeFromCart(id){

```
setCart(prev => prev.filter(p => p._id !== id))
```

}

return (

```
<CartContext.Provider
  value={{
    cart,
    addToCart,
    increaseQty,
    decreaseQty,
    removeFromCart
  }}
>

  {children}

</CartContext.Provider>
```

)

}

export function useCart(){
return useContext(CartContext)
}
