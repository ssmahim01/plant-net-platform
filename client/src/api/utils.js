import axios from "axios";

const upload = async(imageData) => {
    const formData = new FormData();

    formData.append('image', imageData);
    const {data} = await axios.post(`https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_IMGBB_API}`, formData);

    return data.data.display_url;
};

export {upload};