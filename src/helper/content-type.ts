const CONTENT_TYPE = {
  BUSINESS: "business",
  NEWS: "news",
  CAREER: "career",
  ABOUT: "about",
  INVESTOR: "investor",
  ANNUAL_REPORT: "annual_report",
  SUSTAINABILITY_REPORT: "sustainability_report",
  PROCUREMENT_REPORT: "procurement_report",
  PROCUREMENT_INFORMATION: "procurement_information",
  BUSINESS_PAGE: "business_page",
  NEWS_PAGE: "news_page",
  CAREER_PAGE: "career_page",
  getTypeNumber: (type: string) => {
    return Object.keys(CONTENT_TYPE).indexOf(type.toUpperCase()) + 1;
  },
};

export default CONTENT_TYPE;
