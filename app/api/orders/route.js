import connectDB from "@/lib/db"
import Order from "@/models/Order"
import { NextResponse } from "next/server"

export async function POST(req){

try{

```
await connectDB()

const body = await req.json()

const order = await Order.create(body)

return NextResponse.json(order)
```

}catch(err){

```
console.log("Order error:",err)

return NextResponse.json({error:"Order failed"})
```

}

}
