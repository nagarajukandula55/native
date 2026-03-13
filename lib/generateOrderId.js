export function generateOrderId(){

  const now = new Date()

  const yy = now.getFullYear().toString().slice(-2)
  const mm = String(now.getMonth()+1).padStart(2,"0")
  const dd = String(now.getDate()).padStart(2,"0")

  const random = Math.random().toString(36).substring(2,6).toUpperCase()

  return `NAT-${yy}${mm}${dd}-${random}`

}
