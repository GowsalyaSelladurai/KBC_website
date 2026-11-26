
const images = [
  {
    src: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=900",
    title: "Bridal Makeup",
    number: "01",
    category: "BRIDAL ARTISTRY",
  },
  {
    src: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=900",
    title: "Beauty Artistry",
    number: "02",
    category: "MAKEUP ARTISTRY",
  },
  {
    src: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=900",
    title: "Hair Styling",
    number: "03",
    category: "HAIR DESIGN",
  },
  {
    src: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=900",
    title: "Skin Care",
    number: "04",
    category: "SKIN & FACIAL",
  },
  {
    src: "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=900",
    title: "Nail Art",
    number: "05",
    category: "NAIL DESIGN",
  },
  {
    src: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=900",
    title: "Beauty Training",
    number: "06",
    category: "PROFESSIONAL TRAINING",
  },
];

export default function Gallery() {
  return (
    <section className="kbc-gallery3d" id="gallery">
      <div className="gallery3d-heading">
        <span className="gallery3d-tag">✦ OUR EXCLUSIVE PORTFOLIO ✦</span>

        <h2>
          Beauty In <span>Every Detail</span>
        </h2>

        <p>
          Discover the art of beauty, creativity and professional excellence.
        </p>

        <div className="gallery3d-line" />
      </div>

      <div className="gallery3d-grid">
        {images.map((image) => (
          <div className="gallery3d-card" key={image.number}>
            <div className="gallery3d-image">
              <img src={image.src} alt={image.title} />

              <div className="gallery3d-overlay">
                <span className="gallery3d-number">
                  {image.number}
                </span>

                <div className="gallery3d-content">
                  <span className="gallery3d-category">
                    {image.category}
                  </span>

                  <h3>{image.title}</h3>

                  <div className="gallery3d-bottom-line" />

                  <span className="gallery3d-explore">
                    EXPLORE ARTISTRY ↗
                  </span>
                </div>
              </div>

              <div className="gallery3d-shine" />
            </div>
          </div>
        ))}
      </div>

      <div className="gallery3d-footer">
        <span>✦</span>
        <p>WHERE BEAUTY MEETS ARTISTRY</p>
        <span>✦</span>
      </div>
    </section>
  );
}
