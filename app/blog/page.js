export default function BlogPage() {
  const posts = [
    {
      id: 1,
      title: "South Indian Breakfast Thali – A Complete Morning Feast",
      date: "2026-03-01",
      image:
        "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=1200&q=80",
      excerpt:
        "A traditional South Indian breakfast includes idli, dosa, vada, sambar, and coconut chutney. It is light, healthy, and packed with probiotics and nutrients.",
    },
    {
      id: 2,
      title: "Poha – The Light & Healthy Indian Breakfast",
      date: "2026-02-28",
      image:
        "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1200&q=80",
      excerpt:
        "Poha is one of the most popular breakfast dishes in Maharashtra and Madhya Pradesh. Made with flattened rice, it is quick, tasty, and easy to digest.",
    },
    {
      id: 3,
      title: "Paratha Varieties – North India’s Comfort Breakfast",
      date: "2026-02-25",
      image:
        "https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=1200&q=80",
      excerpt:
        "From aloo paratha to paneer paratha, North Indian breakfasts are rich and filling, usually served with curd, butter, and pickle.",
    },
    {
      id: 4,
      title: "Upma – Simple Yet Nutritious Breakfast",
      date: "2026-02-22",
      image:
        "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?auto=format&fit=crop&w=1200&q=80",
      excerpt:
        "Upma is a South Indian dish made from semolina, vegetables, and spices. It is light, healthy, and perfect for busy mornings.",
    },
  ];

  return (
    <div className="container">
      <h1 className="title">Indian Breakfast Blog</h1>

      <div className="grid">
        {posts.map((post) => (
          <div key={post.id} className="card">
            <div className="imgWrap">
              <img src={post.image} alt={post.title} />
            </div>

            <div className="content">
              <h2>{post.title}</h2>
              <p className="date">{post.date}</p>
              <p className="excerpt">{post.excerpt}</p>

              <button className="btn">Read More</button>
            </div>
          </div>
        ))}
      </div>

      {/* ========== STYLES ========== */}
      <style jsx>{`
        .container {
          padding: 80px 60px;
          min-height: 100vh;
          background: #fafafa;
        }

        .title {
          font-size: 42px;
          font-weight: 800;
          margin-bottom: 40px;
          color: #111;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 28px;
        }

        .card {
          background: #fff;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
          transition: 0.25s ease;
        }

        .card:hover {
          transform: translateY(-6px);
        }

        .imgWrap img {
          width: 100%;
          height: 180px;
          object-fit: cover;
        }

        .content {
          padding: 16px;
        }

        h2 {
          font-size: 18px;
          margin-bottom: 6px;
          color: #111;
        }

        .date {
          font-size: 12px;
          color: #777;
          margin-bottom: 10px;
        }

        .excerpt {
          font-size: 14px;
          color: #555;
          line-height: 1.5;
          margin-bottom: 14px;

          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .btn {
          padding: 10px 14px;
          border: none;
          background: #111;
          color: #fff;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 600;
        }

        .btn:hover {
          background: #333;
        }
      `}</style>
    </div>
  );
}
