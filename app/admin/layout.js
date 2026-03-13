import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export default function AdminLayout({ children }){

  const token = cookies().get("adminToken")

  if(!token){
    redirect("/admin/login")
  }

  return (
    <div>
      {children}
    </div>
  )

}
