import AccountSetting from "./pages/AccountSetting";
import Business from "./pages/Business/Business";
import BusinessCreate from "./pages/Business/BusinessCreate";
import BusinessUpdate from "./pages/Business/BusinessUpdate";
import BusinessCategory from "./pages/BusinessCategory/BusinessCategory";
import Career from "./pages/Career/Career";
import CareerCreate from "./pages/Career/CareerCreate";
import CareerUpdate from "./pages/Career/CareerUpdate";
import Header from "./pages/Header/Header";
import HeaderCreate from "./pages/Header/HeaderCreate";
import HeaderUpdate from "./pages/Header/HeaderUpdate";
import HomePage from "./pages/HomePage/HomePage";
import AnnualReport from "./pages/AnnualReport/AnnualReport";
import AnnualReportCreate from "./pages/AnnualReport/AnnualReportCreate";
import AnnualReportUpdate from "./pages/AnnualReport/AnnualReportUpdate";
import Location from "./pages/Location/Location";
import News from "./pages/News/News";
import NewsCreate from "./pages/News/NewsCreate";
import NewsUpdate from "./pages/News/NewsUpdate";
import NewsCategory from "./pages/NewsCategory/NewsCategory";
import PageSetting from "./pages/PageSetting/PageSetting";

import Role from "./pages/Role/Role";
import RoleCreate from "./pages/Role/RoleCreate";
import RoleUpdate from "./pages/Role/RoleUpdate";
import Users from "./pages/Users/Users";
import UsersCreate from "./pages/Users/UsersCreate";
import UsersUpdate from "./pages/Users/UsersUpdate";
import SustainabilityReport from "./pages/SustainabilityReport/SustainabilityReport";
import SustainabilityReportCreate from "./pages/SustainabilityReport/SustainabilityReportCreate";
import SustainabilityReportUpdate from "./pages/SustainabilityReport/SustainabilityReportUpdate";
import BannerPage from "./pages/BannerPage/BannerPage";
import BussinessPage from "./pages/BussinessPage/BussinessPage";
import BussinessPageCreate from "./pages/BussinessPage/BussinessPageCreate";
import BussinessPageUpdate from "./pages/BussinessPage/BussinessPageUpdate";
import NewsPage from "./pages/NewsPage/NewsPage";
import CareerPage from "./pages/CareerPage/CareerPage";
import ProcuremenetReport from "./pages/ProcuremenetReport/ProcuremenetReport";
import AboutPage from "./pages/AboutPage/AboutPage";
import AboutReward from "./pages/AboutReward/AboutReward";
import AboutValue from "./pages/AboutValue/AboutValue";
import AboutWork from "./pages/AboutWork/AboutWork";
import AboutHSSE from "./pages/AboutHSSE/AboutHSSE";
import AboutManagement from "./pages/AboutManagement/AboutManagement";
import Partnership from "./pages/Partnership/Partnership";
import PartnershipCreate from "./pages/Partnership/PartnershipCreate";
import PartnershipUpdate from "./pages/Partnership/PartnershipUpdate";
import PartnershipPage from "./pages/PartnershipPage/PartnershipPage";
import CSRPage from "./pages/CSRPage/CSRPage";
import CSROurPrograms from "./pages/CSROurPrograms/CSROurPrograms";

const pagesListWithChilds = [
  {
    route: "/dashboard/sustainability-report",
    component: SustainabilityReport,
    childs: [
      {
        route: "/dashboard/sustainability-report/create",
        component: SustainabilityReportCreate,
        access: "create",
      },
      {
        route: "/dashboard/sustainability-report/update/:id",
        component: SustainabilityReportUpdate,
        access: "update",
      },
    ],
    hasChild: true,
  },
  // header
  {
    route: "/dashboard/header",
    component: Header,
    childs: [
      {
        route: "/dashboard/header/create",
        component: HeaderCreate,
        access: "create",
      },
      {
        route: "/dashboard/header/update/:id",
        component: HeaderUpdate,
        access: "update",
      },
    ],
    hasChild: true,
  },

  // news
  {
    route: "/dashboard/news",
    component: News,
    childs: [
      {
        route: "/dashboard/news/create",
        component: NewsCreate,
        access: "create",
      },
      {
        route: "/dashboard/news/update/:id",
        component: NewsUpdate,
        access: "update",
      },
    ],
    hasChild: true,
  },
  // career
  {
    route: "/dashboard/career",
    component: Career,
    childs: [
      {
        route: "/dashboard/career/create",
        component: CareerCreate,
        access: "create",
      },
      {
        route: "/dashboard/career/update/:id",
        component: CareerUpdate,
        access: "update",
      },
    ],
    hasChild: true,
  },
  // users
  {
    route: "/dashboard/users",
    component: Users,
    childs: [
      {
        route: "/dashboard/users/create",
        component: UsersCreate,
        access: "create",
      },
      {
        route: "/dashboard/users/update/:id",
        component: UsersUpdate,
        access: "update",
      },
    ],
    hasChild: true,
  },

  // role
  {
    route: "/dashboard/role",
    component: Role,
    childs: [
      {
        route: "/dashboard/role/create",
        component: RoleCreate,
        access: "create",
      },
      {
        route: "/dashboard/role/update/:id",
        component: RoleUpdate,
        access: "update",
      },
    ],
    hasChild: true,
  },
  // role
  {
    route: "/dashboard/business",
    component: Business,
    childs: [
      {
        route: "/dashboard/business/create",
        component: BusinessCreate,
        access: "create",
      },
      {
        route: "/dashboard/business/update/:id",
        component: BusinessUpdate,
        access: "update",
      },
    ],
    hasChild: true,
  },
  {
    route: "/dashboard/business-page",
    component: BussinessPage,
    childs: [
      {
        route: "/dashboard/business-page/create",
        component: BussinessPageCreate,
        access: "create",
      },
      {
        route: "/dashboard/business-page/update/:id",
        component: BussinessPageUpdate,
        access: "update",
      },
    ],
    hasChild: true,
  },
  {
    route: "/dashboard/annual-report",
    component: AnnualReport,
    childs: [
      {
        route: "/dashboard/annual-report/create",
        component: AnnualReportCreate,
        access: "create",
      },
      {
        route: "/dashboard/annual-report/update/:id",
        component: AnnualReportUpdate,
        access: "update",
      },
    ],
    hasChild: true,
  },
  {
    route: "/dashboard/partnership",
    component: Partnership,
    childs: [
      {
        route: "/dashboard/partnership/create",
        component: PartnershipCreate,
        access: "create",
      },
      {
        route: "/dashboard/partnership/update/:id",
        component: PartnershipUpdate,
        access: "update",
      },
    ],
    hasChild: true,
  },
];

const pageListNoChild = [
  {
    route: "/dashboard/location",
    component: Location,
    childs: [],
    hasChild: false,
  },
  {
    route: "/dashboard/partnership-page",
    component: PartnershipPage,
    childs: [],
    hasChild: false,
  },
  {
    route: "/dashboard/csr-our-programs",
    component: CSROurPrograms,
    childs: [],
    hasChild: false,
  },
  {
    route: "/dashboard/about-reward",
    component: AboutReward,
    childs: [],
    hasChild: false,
  },
  {
    route: "/dashboard/about-value",
    component: AboutValue,
    childs: [],
    hasChild: false,
  },
  {
    route: "/dashboard/about-hsse",
    component: AboutHSSE,
    childs: [],
    hasChild: false,
  },
  {
    route: "/dashboard/csr-page",
    component: CSRPage,
    childs: [],
    hasChild: false,
  },
  {
    route: "/dashboard/about-workers",
    component: AboutWork,
    childs: [],
    hasChild: false,
  },
  {
    route: "/dashboard/about-management",
    component: AboutManagement,
    childs: [],
    hasChild: false,
  },
  {
    route: "/dashboard/about-page",
    component: AboutPage,
    childs: [],
    hasChild: false,
  },
  {
    route: "/dashboard/procurement-information",
    component: ProcuremenetReport,
    childs: [],
    hasChild: false,
  },
  {
    route: "/dashboard/career-page",
    component: CareerPage,
    childs: [],
    hasChild: false,
  },
  {
    route: "/dashboard/news-page",
    component: NewsPage,
    childs: [],
    hasChild: false,
  },
  {
    route: "/dashboard/business-category",
    component: BusinessCategory,
    childs: [],
    hasChild: false,
  },
  {
    route: "/dashboard/category",
    component: NewsCategory,
    childs: [],
    hasChild: false,
  },
  {
    route: "/dashboard/banner-page",
    component: BannerPage,
    childs: [],
    hasChild: false,
  },

  {
    route: "/dashboard/home-page",
    component: HomePage,
    childs: [],
    hasChild: false,
  },
  {
    route: "/dashboard/pages",
    component: PageSetting,
    childs: [],
    hasChild: false,
  },

  {
    route: "/dashboard/account",
    component: AccountSetting,
    childs: [],
    hasChild: false,
  },
];

const pagesList = [...pagesListWithChilds, ...pageListNoChild];

export default pagesList;
