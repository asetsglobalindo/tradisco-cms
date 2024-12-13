const IMG_TYPE = {
  HOME_BANNER: "home_banner",
  ABOUT: "about",
  NEWS: "news",
  PROJECT: "project",
  COMMERCIAL: "commercial",
  RESIDENTIAL: "residential",
  getTypeNumber: (type: string) => {
    return Object.keys(IMG_TYPE).indexOf(type.toUpperCase()) + 1;
  },
};

export default IMG_TYPE;
