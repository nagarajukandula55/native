export async function getShiprocketToken() {

  const res = await fetch(
    "https://apiv2.shiprocket.in/v1/external/auth/login",
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({

        email:
          process.env.SHIPROCKET_EMAIL,

        password:
          process.env.SHIPROCKET_PASSWORD,
      }),
    }
  );

  const data = await res.json();

  return data.token;
}
