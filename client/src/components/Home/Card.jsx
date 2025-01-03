import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Link } from "react-router-dom";

const Card = () => {
  const { data: plants } = useQuery({
    queryKey: ["plants"],
    queryFn: async () => {
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/plants`
      );
      return data[0];
    },
  });
  // console.log(plants);

  return (
    <Link
      to={`/plant/${plants?._id}`}
      className="col-span-1 cursor-pointer group shadow-xl p-3 rounded-xl"
    >
      <div className="flex flex-col gap-2 w-full">
        <div
          className="
              aspect-square 
              w-full 
              relative 
              overflow-hidden 
              rounded-xl
            "
        >
          <img
            className="
                object-cover 
                h-full 
                w-full 
                group-hover:scale-110 
                transition
              "
            src={plants?.image}
            alt="Plant Image"
          />
          <div
            className="
              absolute
              top-3
              right-3
            "
          ></div>
        </div>
        <div className="font-semibold text-lg">{plants?.name}</div>
        <div className="font-semibold text-lg">Category: {plants?.category}</div>
        <div className="font-semibold text-lg">Quantity: {plants?.quantity}</div>
        <div className="flex flex-row items-center gap-1">
          <div className="font-semibold"> Price: {plants?.price}$</div>
        </div>
      </div>
    </Link>
  );
};

export default Card;