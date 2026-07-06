"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signup } from "@/lib/an-sdk/auth";
import { ApiError } from "@/lib/an-sdk/client";
import { isSsoMode, isSsoConfigured, startSsoLogin } from "@/lib/an-sdk/sso";
import { useUser } from "@/context/UserContext";

export default function SignupPage() {
  const router = useRouter();
  const { refreshUser } = useUser();
  const ssoMode = isSsoMode();

  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  async function handleSignup(e) {
    e.preventDefault();
    setMsg("");

    if (!form.name || !form.email || !form.password) {
      setMsg("Please fill all required fields");
      return;
    }

    if (form.password.length < 6) {
      setMsg("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      await signup(form);
      await refreshUser();
      setMsg("success:Account created — redirecting...");
      setTimeout(() => router.push("/"), 1200);
    } catch (err) {
      console.error(err);
      if (err instanceof ApiError) {
        setMsg(err.message || "Server error");
      } else {
        setMsg("Server error. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  const isSuccess = msg.startsWith("success:");
  const displayMsg = isSuccess ? msg.slice(8) : msg;

  return (
    <div className="wrap">
      <div className="card">
        <div className="logo">
          <img src="/logo.svg" alt="Native" />
        </div>

        <h2>Create your account</h2>
        <p className="sub">Join Native for a healthier everyday</p>

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
          <form onSubmit={handleSignup}>
            <input
              placeholder="Full name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input"
            />
            <input
              placeholder="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="input"
            />
            <input
              placeholder="Phone (optional)"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="input"
            />
            <div className="passWrap">
              <input
                type={showPass ? "text" : "password"}
                placeholder="Password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="input"
              />
              <span onClick={() => setShowPass(!showPass)} className="eye">
                {showPass ? "Hide" : "Show"}
              </span>
            </div>

            {msg && (
              <p className={isSuccess ? "success" : "error"}>{displayMsg}</p>
            )}

            <button className="submitBtn" disabled={loading}>
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>
        )}

        <p className="footer">
          Already have an account?{" "}
          <Link href="/login" className="link">
            Login
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
          max-width: 400px;
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
        .passWrap {
          position: relative;
        }
        .eye {
          position: absolute;
          right: 14px;
          top: 14px;
          font-size: 12px;
          color: #c28b45;
          cursor: pointer;
          font-weight: 600;
        }
        .error {
          color: #e11d48;
          font-size: 12px;
          margin-bottom: 12px;
        }
        .success {
          color: #16a34a;
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
