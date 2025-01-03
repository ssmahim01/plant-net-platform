import { Helmet } from 'react-helmet-async'
import AddPlantForm from '../../../components/Form/AddPlantForm'
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import { useState } from 'react';
import { upload } from '../../../api/utils';
import useAuth from '../../../hooks/useAuth';
import toast from 'react-hot-toast';

const AddPlant = () => {
  const {user} = useAuth();
  const [uploadImage, setUploadImage] = useState({
    image: {name: 'Upload Button'} 
  });
  const [loading, setLoading] = useState(false);
  const axiosSecure = useAxiosSecure();

  const handleSubmit = async(e) => {
    e.preventDefault();

    const form = e.target;
    const name = form.name.value;
    const category = form.category.value;
    const description = form.description.value;
    const quantity = parseInt(form.quantity.value);
    const price = parseFloat(form.price.value);
    const image = form.image.files[0];
    const photoURL = await upload(image);

    const uploader = {
      name: user?.displayName,
      email: user?.email,
      image: user?.photoURL
    }

    const plantData = {
      name,
      category,
      description,
      quantity,
      price,
      image: photoURL,
      uploader
    };

    try{
      await axiosSecure.post('/plants', plantData);
      toast.success('Data Added Successfully');
    } catch(error){
      console.log(error);
    }finally{
      setLoading(false);
    }
  };

  return (
    <div>
      <Helmet>
        <title>Add Plant | Dashboard</title>
      </Helmet>

      {/* Form */}
      <AddPlantForm 
      handleSubmit={handleSubmit}
      loading={loading}
      uploadImage={uploadImage}
      setUploadImage={setUploadImage}
      />
    </div>
  )
}

export default AddPlant
