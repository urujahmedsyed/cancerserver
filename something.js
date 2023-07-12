const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const base64 = require('base64-js');

// Define the schema
const UserSchema = new mongoose.Schema({
  image: { type: String, required: true },
  converted_image: { type: String, required: true },
}, { collection: 'img-data' });

// Create the model
const ImgDataModel = mongoose.model('ImgData', UserSchema);

// Connect to MongoDB
const url='mongodb+srv://urujahmedsyed:beabat@cluster0.64q31qj.mongodb.net/resportal1';
mongoose.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Function to read and encode the image file
const encodeImage = (filePath) => {
  const fileData = fs.readFileSync(filePath);
  const base64Data = base64.fromByteArray(fileData);
  return base64Data;
};

// Specify the paths of the original and converted image folders
const originalFolderPath = 'C:\\Users\\URUJ AHMED SYED\\OneDrive\\Desktop\\duseep\\finaldest';
const convertedFolderPath = 'C:\\Users\\URUJ AHMED SYED\\OneDrive\\Desktop\\duseep\\convoutput';

// Get the list of image files in the original folder
const originalImageFiles = fs.readdirSync(originalFolderPath);

// Iterate through each image file
originalImageFiles.forEach((originalImageFile) => {
  // Construct the file paths for the original and converted images
  const originalImagePath = path.join(originalFolderPath, originalImageFile);
  const convertedImageFile = originalImageFile.replace('.png', '_converted.png');
  const convertedImagePath = path.join(convertedFolderPath, convertedImageFile);

  // Encode the original and converted images
  const originalImageBase64 = encodeImage(originalImagePath);
  const convertedImageBase64 = encodeImage(convertedImagePath);

  // Create a new document with the encoded images
  const imgData = new ImgDataModel({
    image: originalImageBase64,
    converted_image: convertedImageBase64,
  });

  // Save the document to the database
  imgData.save((error, savedData) => {
    if (error) {
      console.error('Error saving image data:', error);
    } else {
      console.log('Image data saved successfully:', savedData);
    }
  });
});
