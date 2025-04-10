import React from 'react'

function Carousel() {
  return (
    <div>
      <div
  className="hero min-h-[50dvh] "
  style={{
    backgroundImage: "url(https://img.daisyui.com/images/stock/photo-1507358522600-9f71e620c44e.webp)",
  }}>
  <div className="hero-overlay bg-opacity-60"></div>
  <div className="hero-content text-neutral-content text-center">
    <div className="max-w-md">
      <h1 className="mb-5 text-5xl font-bold">Hello there</h1>
      <p className="mb-5">
      Discover a wide selection of top-quality products, unbeatable deals, and a shopping experience designed with you in mind. Whether you're here to find something specific or just browsing, we’re here to help every step of the way.
      </p>
      <button className="btn btn-primary">Get Started</button>
    </div>
  </div>
</div>
    </div>
  )
}

export default Carousel
