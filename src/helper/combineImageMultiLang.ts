const combineImageMultiLang = (images1: string[], images2: string[]) => {
  if (images1.length !== images2.length) {
    throw new Error("Image english and indonesia must be same amount");
  }

  return Array(images1.length)
    .fill("")
    .map((_, index) => ({
      en: images1[index],
      id: images2[index],
    }));
};

export default combineImageMultiLang;

