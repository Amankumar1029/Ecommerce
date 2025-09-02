import React from 'react'
import assets from '../assets/assets'

const Footer = () => {
  return (
    <div>
      <div className="flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm">
        <div>
          <img className="w-32 mb-5" src={assets.logo} alt="logo" />
          <p className="w-full md:w-2/3 text-gray-600">
            Let's grab the offer and start purchasing different types of clothes
          </p>
        </div>
        <div>
          <p className="text-xl font-medium mb-5">COMPANY</p>
          <ul className="flex flex-col gap-1 text-gray-600">
            <li>Home</li>
            <li>About Us</li>
            <li>Delivery</li>
            <li>Privacy policy</li>
          </ul>
        </div>
        <div>
          <p className="text-xl font-medium mb-5">GET IN TOUCH</p>
          <ul className="flex flex-col gap-1 text-gray-600">
            <li>+91 7647353286</li>
            <li>aman@gmail.com</li>      
          </ul>
        </div>
      </div>
      <div>
        <hr/>
        <p>Copyright 2025@ forever.com - All Rights Reserved.</p>
      </div>
    </div>
  );
}

export default Footer