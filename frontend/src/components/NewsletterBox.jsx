import React from 'react'

const NewsletterBox = () => {

    const onSubmitHandler = (event) => {
        event.preventDefault();
        alert('Subscribed successfully!');
    }

  return (
    <div className="text-center">
      <p className="text-2xl font-medium text-gray-800">
        Subscribe now & get 20% off
      </p>
      <p className="text-gray-400 mt-3">
        Add mobile number & email both, get 10% extra off
      </p>

      <form onSubmit={onSubmitHandler} className="w-full sm:w-1/2 flex items-center gap-3 mx-auto my-6 border pl-3 border-gray-400">
        <input
          type="email"
          placeholder="Enter your email"
          className="w-full sm:flex-1 outline-none text-center"
          required
        />
        <button
          type="submit"
          className="bg-black text-white px-10 py-2 hover:bg-gray-700 transition"
        >
          Subscribe
        </button>
      </form>
    </div>
  );
}

export default NewsletterBox