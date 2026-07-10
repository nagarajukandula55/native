"use client";

export default function Loading() {
  return (
    <div className="loadingWrap">
      <div className="spinner" />

      <style jsx>{`
        .loadingWrap {
          min-height: 50vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .spinner {
          width: 36px;
          height: 36px;
          border: 3px solid #eee;
          border-top: 3px solid #c28b45;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
