const CONTENT_TYPE = {
  BUSINESS: "business",
  NEWS: "news",

  // delete
  CAREER: "career",
  COMMERCIAL: "commercial",
  RESIDENTIAL: "residential",
  ABOUT: "about",
  HOME: "home",
  NEWS_DETAIL: "news_detail",
  CAREER_DETAIL: "career_detail",
  FOOTER: "footer",
  CONTACT_US: "contact_us",
  getTypeNumber: (type: string) => {
    return Object.keys(CONTENT_TYPE).indexOf(type.toUpperCase()) + 1;
  },
};

export default CONTENT_TYPE;
