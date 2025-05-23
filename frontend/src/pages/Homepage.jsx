import React, { useEffect, useState } from "react";
import axios from "axios";
import NavBar from "../components/NavBar";
import Carousel from "../components/Carousel";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";


function Homepage() {
    const [info,setInfo] = useState([]);
    const [isfeatured,setIsFeatured] = useState([]);
    const navigate = useNavigate();

    useEffect( () => {
        axios.get("${import.meta.env.VITE_API_URL}/Product/products/")
        .then(response => {
          console.log("User data :",response.data)
          const Slice = response.data.slice(0,6)
          setInfo(Slice);
        })
        .catch(error => {
          console.error("error fetching data",error);
        });
        },[]);

    useEffect( () => {
          axios.get("${import.meta.env.VITE_API_URL}/Product/featured/")
          .then(response => {
            console.log("User data :",response.data)
            const featuredProducts = response.data.featured_products || [];
            const Slice = featuredProducts.slice(0,3)
            setIsFeatured(Slice);
          })
          .catch(error => {
            console.error("error fetching data",error);
          });
          },[]);

        const handleclick = (productId) =>{
          console.log("Navigating with productId:", productId);
          navigate(`/product/${productId}`);
        };
    
  return (
  <div>
    <NavBar />
    <div className="p-2">
        <Carousel />

  {/* divider*/}
        <div className="flex w-full flex-col">
        <div className="divider p-4 m-2"><h2 className="text-2xl font-bold mt-8 text-grey-500">On Sale</h2></div> <br /> <hr />
  
</div>

    
    {/* Product card*/}
      <ul className="flex flex-wrap justify-center m-4 p-4 g-4 gap- md:flex-nowrap md:justify-start rounded-lg">
        {info.map((infos, index) => (
            <li key={infos.id || index}>
                <div className="card bg-grey w-96 m-4 p-4 g-6 rounded-lg shadow-md border border-grey-600">
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
          <button  onClick={() => handleclick(infos.product_id)}
            className="btn btn-primary"
            >
              Buy Now</button>
      </div>
   </div>
</div>
           </li>
        ))}
      </ul>
    
    {/* Divider 2 */}
    <div className="flex w-full flex-col">
  <div className="divider p-4 m-2"><h2 className="text-2xl font-bold mt-8 text-grey-600">Featured Products</h2></div>
</div>
    {/*is Featured slide */}
<ul className="flex flex-wrap justify-center gap-6 md:flex-nowrap md:justify-start p-4 m-2">
        {isfeatured.map((infos, index) => (
            <li key={infos.id || index}>
                <div className="card bg-grey w-96 shadow-sm ">
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
