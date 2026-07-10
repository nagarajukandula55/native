"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { login } from "@/lib/an-sdk/auth";
import { ApiError } from "@/lib/an-sdk/client";
import { isSsoMode, isSsoConfigured, startSsoLogin } from "@/lib/an-sdk/sso";
import { useUser } from "@/context/UserContext";
import { getBusinessBranding } from "@/lib/an-sdk/company";

export default function LoginPage() {
  const router = useRouter();
  const { refreshUser } = useUser();
  const ssoMode = isSsoMode();

  // Dynamic business-uploaded logo, same pattern as Navbar's logoUrl prop
  // (sourced from ANgroup's public GET /api/businesses/public). Falls
  // back to the static asset on error/absence.
  const [logoUrl, setLogoUrl] = useState(null);
  useEffect(() => {
    getBusinessBranding()
      .then((b) => setLogoUrl(b?.logo || null))
      .catch(() => setLogoUrl(null));
  }, []);

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      setError("Please fill all fields");
      return;
    }

    try {
      setLoading(true);
      await login(form.email, form.password);
      await refreshUser();
      router.push("/");
    } catch (err) {
      console.error(err);
      if (err instanceof ApiError) {
        setError(err.message || "Login failed");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wrap">
      <div className="card">
        <div className="logo">
          <img
            src={logoUrl || "/logo.svg"}
            alt="Native"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "/logo.svg";
            }}
          />
        </div>

        <h2>Welcome back</h2>
        <p className="sub">Log in to your Native account</p>

        {ssoMode ? (
          <>
            <button
              type="button"
              className="ssoBtn"
              onClick={() => startSsoLogin("/")}
              disabled={!isSsoConfigured()}
            >
              Continue with AN Account
            </button>
            {!isSsoConfigured() && (
              <p className="hint">
                Single sign-on isn't configured yet — set
                NEXT_PUBLIC_AN_SSO_URL to enable it.
              </p>
            )}
          </>
        ) : (
          <form onSubmit={handleLogin}>
            <input
              name="email"
              placeholder="Email or phone"
              value={form.email}
              onChange={handleChange}
              className="input"
            />
            <input
              name="password"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="input"
            />

            <div className="row">
              <Link href="/reset-password" className="link">
                Forgot password?
              </Link>
            </div>

            {error && <p className="error">{error}</p>}

            <button className="submitBtn" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        )}

        <p className="footer">
          New to Native?{" "}
          <Link href="/signup" className="link">
            Create an account
          </Link>
        </p>

        <p className="footer sell">
          Want to sell on Native?{" "}
          <Link href="/sell" className="link">
            Become a vendor
          </Link>
        </p>
      </div>

      <style jsx>{`
        .wrap {
          min-height: calc(100vh - 200px);
          display: flex;
          justify-content: center;
          align-items: center;
          background: #faf8f3;
          padding: 40px 16px;
        }
        .card {
          width: 100%;
          max-width: 380px;
          background: #fff;
          padding: 36px 32px;
          border-radius: 16px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
          text-align: center;
        }
        .logo img {
          height: 84px;
          object-fit: contain;
          margin-bottom: 16px;
        }
        h2 {
          margin: 0 0 4px;
          font-size: 22px;
        }
        .sub {
          color: #888;
          font-size: 13px;
          margin-bottom: 24px;
        }
        .input {
          width: 100%;
          padding: 13px 14px;
          border-radius: 8px;
          border: 1px solid #ddd;
          margin-bottom: 14px;
          outline: none;
          font-size: 14px;
          box-sizing: border-box;
        }
        .input:focus {
          border-color: #c28b45;
        }
        .row {
          text-align: right;
          margin-bottom: 14px;
        }
        .error {
          color: #e11d48;
          font-size: 12px;
          margin-bottom: 12px;
        }
        .submitBtn {
          width: 100%;
          padding: 13px;
          background: #c28b45;
          color: #fff;
          border: none;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
        }
        .submitBtn:hover {
          background: #a36d32;
        }
        .submitBtn:disabled {
          opacity: 0.7;
          cursor: default;
        }
        .ssoBtn {
          width: 100%;
          padding: 14px;
          background: #000;
          color: #fff;
          border: none;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          margin-bottom: 8px;
        }
        .ssoBtn:disabled {
          opacity: 0.5;
          cursor: default;
        }
        .hint {
          color: #888;
          font-size: 12px;
          margin-bottom: 8px;
        }
        .link {
          color: #c28b45;
          text-decoration: none;
          font-weight: 600;
        }
        .footer {
          margin-top: 18px;
          font-size: 13px;
          color: #555;
        }
        .footer.sell {
          margin-top: 8px;
          font-size: 12px;
        }
      `}</style>
    </div>
  );
}
