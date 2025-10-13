export const uploadImage = async (file: File): Promise<string> => {
  return uploadImages([file]).then((urls) => urls[0]);
};

export const uploadImages = async (files: File[]): Promise<string[]> => {
  try {
    const uploadPromises = files.map((file) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append(
        "upload_preset",
        import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
      );
      formData.append("cloud_name", import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);
      formData.append("api_key", import.meta.env.VITE_CLOUDINARY_API_KEY);
      formData.append("folder", "product/images");
      formData.append("resource_type", "image");

      // Add timestamp and signature
      const timestamp = Math.round(new Date().getTime() / 1000);
      formData.append("timestamp", timestamp.toString());

      return fetch(
        `https://api.cloudinary.com/v1_1/${
          import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
        }/image/upload`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
          },
          body: formData,
        }
      ).then(async (response) => {
        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(
            `Cloudinary upload failed: ${response.status} ${response.statusText} - ${errorData}`
          );
        }
        const data = await response.json();
        if (!data.secure_url) {
          throw new Error("No secure_url in Cloudinary response");
        }
        return data.secure_url;
      });
    });

    return Promise.all(uploadPromises);
  } catch (error) {
    console.error("Error uploading images:", error);
    throw error;
  }
};
