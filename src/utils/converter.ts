export const convertBlobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const base64Clean = base64String.split(',')[1]; 
        resolve(base64Clean);
      };
      reader.onerror = reject;
    });
  };
  