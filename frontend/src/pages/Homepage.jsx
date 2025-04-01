import React, { useEffect, useState } from "react";
import axios from "axios";
import NavBar from "../components/NavBar";
import Carousel from "../components/Carousel";
import Footer from "../components/Footer";


function Homepage() {
    const [info,setInfo] = useState([]);
    useEffect( () => {
        axios.get("http://127.0.0.1:8000/Product/products/")
        .then(response => {
          console.log("User data :",response.data)
          setInfo(response.data);
        })
        .catch(error => {
          console.error("error fetching data",error);
        });
        },[]);
    
  return (
  <div>
    <NavBar />
    <div className="p-2">
        <Carousel />

        <div className="flex w-full flex-col">
  <div className="divider"></div>
  <div className="card bg-base-300 rounded-box grid h-20 place-items-center">content</div>
</div>

      <h1>HomePage</h1>
      <ul className="flex flex-wrap justify-center gap-6 md:flex-nowrap md:justify-start">
        {info.map(infos => (
            <li key={infos.id}>
                <div className="card bg-base-100 w-96 shadow-sm">
           <figure >
            <img
              src={infos.image_url}
              alt="product_image" 
              style={{height:'250px'}} />
           </figure>
           <div className="card-body">
            <h2 className="card-title"><strong>Brand:</strong>{infos.product_name}</h2>
            <h2 className="card-price"><strong>Price:</strong>{infos.product_price}</h2>
           <p>{infos.product_description}</p>
          <div className="card-actions justify-end">
          <button className="btn btn-primary">Buy Now</button>
      </div>
   </div>
</div>
           </li>
        ))}
      </ul>

      < Footer/>
    </div>

</div>
  )
}

export default Homepage
