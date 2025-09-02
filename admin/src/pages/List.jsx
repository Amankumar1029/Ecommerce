import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl, currency } from "../App";
import { toast } from "react-toastify";

const List = ({token}) => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state

  const fetchList = async () => {
    try {
      setLoading(true); // Set loading when fetch starts
      const response = await axios.get(backendUrl + "/api/product/list");
      console.log("Response data:", response.data); // Log full response

      if (response.data.products) {
        // Check if products exist in response
        console.log("Setting list with:", response.data.products);
        setList(response.data.products);
      } else if (Array.isArray(response.data)) {
        // Check if response itself is array
        console.log("Setting list with direct data:", response.data);
        setList(response.data);
      } else {
        toast.error("Invalid data format received");
      }
    } catch (error) {
      console.log("Fetch error:", error);
      toast.error(error.message);
    } finally {
      setLoading(false); // Always turn off loading
    }
  };

  const removeProduct = async(id)=>{
    try{
        const response = await axios.post(backendUrl+ '/api/product/remove',{id},{headers:{token}})

        if(response.data.success){
            toast.success(response.data.products);
            await fetchList();
        }
        else{
            toast.error(response.data.message)
        }
    }catch(error){
        console.log(error);
        toast.error(error.message);
    }
  }

  useEffect(() => {
    fetchList();
  }, []);

  // Add debug rendering
  console.log("Current list state:", list);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!Array.isArray(list) || list.length === 0) {
    return <div>No products found.</div>;
  }

  return (
    <>
      <p className="mb-2">All Products List ({list.length} items)</p>
      <div className="flex flex-col gap-2">
        {/* List Table Title */}
        <div className="hidden md:grid grid-cols-[1fr_3fr_1fr_1fr_1fr] items-center py-1 px-2 border bg-gray-100 text-sm">
          <b>Image</b>
          <b>Name</b>
          <b>Category</b>
          <b>Price</b>
          <b className="text-center">Action</b>
        </div>
        {/* Product List */}
        {list.map((item, index) => (
          <div
            className="grid grid-cols-[1fr_3fr_1fr] md:grid-cols-[1fr_3fr_1fr_1fr_1fr] items-center gap-2 py-1 px-2 border text-sm"
            key={item._id || index}
          >
            <img
              className="w-12"
              src={Array.isArray(item.image) ? item.image[0] : item.image}
              alt={item.name || "Product"}
            />
            <p>{item.name}</p>
            <p>{item.category}</p>
            <p>
              {currency}
              {item.price}
            </p>
            <p onClick={()=>removeProduct(item._id)} className="text-right md:text-center cursor-pointer text-lg">
              X
            </p>
          </div>
        ))}
      </div>
    </>
  );
};

export default List;
