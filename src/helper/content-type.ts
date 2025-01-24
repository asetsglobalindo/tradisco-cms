const CONTENT_TYPE = {
  BUSINESS: "business",
  NEWS: "news",
  CAREER: "career",
  ABOUT_PROFILE: "about_profile",
  INVESTOR: "investor",
  ANNUAL_REPORT: "annual_report",
  SUSTAINABILITY_REPORT: "sustainability_report",
  PROCUREMENT_REPORT: "procurement_report",
  PROCUREMENT_INFORMATION: "procurement_information",
  BUSINESS_PAGE: "business_page",
  NEWS_PAGE: "news_page",
  CAREER_PAGE: "career_page",
  ABOUT_MANAGEMENT: "about_management",
  ABOUT_HSS: "about_hsse",
  ABOUT_PREEMPLOYMENT: "about_preemployment",
  ABOUT_VALUE: "about_value",
  ABOUT_REWARD: "about_reward",
  MITRA: "mitra",
  MITRA_PAGE: "mitra_page",
  SUB_COMPANY: "sub_company",
  CSR: "csr",
  getTypeNumber: (type: string) => {
    return Object.keys(CONTENT_TYPE).indexOf(type.toUpperCase()) + 1;
  },
};

export default CONTENT_TYPE;
