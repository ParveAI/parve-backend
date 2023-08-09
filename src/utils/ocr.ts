export const ocr = async (imgUrl: string) => {
    const ocrUrl = "https://api.ocr.space/parse/image";
    const ocrKey = "helloworld";
    const ocrLanguage = "eng";
    const formData = new FormData();
    formData.append("url", imgUrl);
    formData.append("apikey", ocrKey);
    formData.append("language", ocrLanguage);
  
    const response = await fetch(ocrUrl, {
      method: "POST",
      headers: {
        apikey: ocrKey,
      },
      body: formData,
    });
  
    const data = await response.json();
    return data;
  };

