import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import Link from "next/link"

export default function AdminLayout({ children }){

  const token = cookies().get("adminToken")

  if(!token){
    redirect("/admin/login")
  }

  return (

    <div style={{display:"flex", minHeight:"100vh"}}>

      {/* SIDEBAR */}
      <div style={{
        width:"240px",
        background:"#111",
        color:"#fff",
        padding:"25px"
      }}>

        <h2>Admin</h2>

        <nav style={{
          marginTop:"30px",
          display:"flex",
          flexDirection:"column",
          gap:"15px"
        }}>

          <Link href="/admin/orders" style={link}>Orders</Link>

          <Link href="/admin/products" style={link}>Products</Link>

          <Link href="/admin/customers" style={link}>Customers</Link>

          <Link href="/admin/analytics" style={link}>Analytics</Link>

          <Link href="/admin/logout" style={link}>Logout</Link>

        </nav>

      </div>

      {/* CONTENT */}
      <div style={{
        flex:1,
        background:"#f5f5f5",
        padding:"30px"
      }}>
        {children}
      </div>

    </div>

  )

}

const link = {
  color:"#fff",
  textDecoration:"none"
}
