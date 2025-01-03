/* eslint-disable react/prop-types */
import {
  Dialog,
  Transition,
  TransitionChild,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { Fragment, useState } from "react";
import useAuth from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import toast from "react-hot-toast";

const PurchaseModal = ({ closeModal, isOpen, refetch, plant }) => {
  const { _id, name, category, price, quantity, uploader } = plant || {};
  const { user } = useAuth();
  const navigate = useNavigate();
  const axiosSecure = useAxiosSecure();
  const [totalQuantity, setTotalQuantity] = useState(1);
  const [totalPrice, setTotalPrice] = useState(price);
  const [purchase, setPurchase] = useState({
    customer: {
      name: user?.displayName,
      email: user?.email,
      image: user?.photoURL,
    },
    plantId: _id,
    price: totalPrice,
    quantity: totalQuantity,
    seller: uploader?.email,
    address: "",
    status: "Pending",
  });

  const handleQuantity = (value) => {
    if (value > quantity) {
      setTotalQuantity(quantity);
      return toast.error("Quantity exceeds available stock!");
    }
    if (value < 0) {
      setTotalQuantity(1);
      return toast.error("Quantity cannot be less than 1");
    }

    setTotalQuantity(value);
    setTotalPrice(value * price);
    setPurchase((prev) => {
      return { ...prev, quantity: value, price: value * price };
    });
  };

  const handlePurchase = async () => {
    console.table(purchase);
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={closeModal}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <DialogTitle
                  as="h3"
                  className="text-lg font-medium text-center leading-6 text-gray-900"
                >
                  Review Info Before Purchase
                </DialogTitle>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">Plant: {name}</p>
                </div>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">Category: {category}</p>
                </div>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Customer: {user?.displayName}
                  </p>
                </div>

                <div className="mt-2">
                  <p className="text-sm text-gray-500">Price: $ {price}</p>
                </div>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Available Quantity: {quantity}
                  </p>
                </div>

                <div className="my-3 space-y-2">
                  <div className="space-x-2 text-sm">
                    <label htmlFor="quantity" className="text-gray-600">
                      Quantity:
                    </label>
                    <input
                      id="quantity"
                      className="p-3 text-gray-800 border border-lime-300 focus:outline-lime-500 rounded-md bg-white"
                      name="quantity"
                      value={totalQuantity}
                      onChange={(e) => handleQuantity(parseInt(e.target.value))}
                      type="number"
                      placeholder="Provide your Quantity"
                      required
                    />
                  </div>

                  <div className="space-x-2 text-sm">
                    <label htmlFor="address" className="text-gray-600">
                      Address:
                    </label>
                    <input
                      className="p-3 text-gray-800 border border-lime-300 focus:outline-lime-500 rounded-md bg-white"
                      name="address"
                      onChange={(e) =>
                        setPurchase((prev) => {
                          return { ...prev, address: e.target.value };
                        })
                      }
                      id="address"
                      type="text"
                      placeholder="Address"
                      required
                    />
                  </div>
                </div>
                  <div className="mt-5">
                    <button onClick={handlePurchase} className="w-full btn bg-green-500 border-none text-lg px-6 py-1 text-white font-bold rounded-full">{`Pay ${totalPrice}$`}</button>
                  </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default PurchaseModal;
