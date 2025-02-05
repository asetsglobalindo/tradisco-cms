const IMG_TYPE = {
  HOME: "home",
  BUSINESS: "business",
  NEWS: "news",
  CAREER: "career",
  ABOUT: "about",
  INVESTOR: "investor",
  ANNUAL_REPORT: "annual_report",
  SUSTAINABILITY_REPORT: "sustainability_report",
  PROCUREMENT_REPORT: "procuremenet_report",
  INVESTOR_BANNER: "investor_banner",
  ANNUAL_REPORT_BANNER: "annual_report_banner",
  SUSTAINABILITY_REPORT_BANNER: "sustainability_report_banner",
  PROCUREMENT_REPORT_BANNER: "procurement_information_banner",
  MITRA: "mitra",
  MITTA_PAGE: "mitra_page",
  SUB_COMPANY: "sub_company",
  CSR_PAGE: "csr_page",
  BAZMA: "bazma",
  COMPANY_REPORT: "company_report",

  getTypeNumber: (type: string) => {
    return Object.keys(IMG_TYPE).indexOf(type.toUpperCase()) + 1;
  },
};

export default IMG_TYPE;
