import About from "./pages/About/About";
import AccountSetting from "./pages/AccountSetting";
import BannerPage from "./pages/BannerPage/BannerPage";
import Business from "./pages/Business/Business";
import BusinessCreate from "./pages/Business/BusinessCreate";
import BusinessUpdate from "./pages/Business/BusinessUpdate";
import BusinessCategory from "./pages/BusinessCategory/BusinessCategory";
import Career from "./pages/Career/Career";
import CareerCreate from "./pages/Career/CareerCreate";
import CareerUpdate from "./pages/Career/CareerUpdate";
import CareerPage from "./pages/CareerPage/CareerPage";
import Commercial from "./pages/Commercial/Commercial";
import CommercialCreate from "./pages/Commercial/CommercialCreate";
import CommercialUpdate from "./pages/Commercial/CommercialUpdate";
import ContactUsPage from "./pages/ContactUsPage/ContactUsPage";
import FooterContent from "./pages/FooterContent/FooterContent";
import Header from "./pages/Header/Header";
import HeaderCreate from "./pages/Header/HeaderCreate";
import HeaderUpdate from "./pages/Header/HeaderUpdate";
import HomePage from "./pages/HomePage/HomePage";
import Location from "./pages/Location/Location";
import News from "./pages/News/News";
import NewsCreate from "./pages/News/NewsCreate";
import NewsUpdate from "./pages/News/NewsUpdate";
import NewsCategory from "./pages/NewsCategory/NewsCategory";
import NewsPage from "./pages/NewsPage/NewsPage";
import PageSetting from "./pages/PageSetting/PageSetting";
import ProjectPage from "./pages/Project/ProjectPage";
import Residential from "./pages/Residential/Residential";
import ResidentialCreate from "./pages/Residential/ResidentialCreate";
import ResidentialUpdate from "./pages/Residential/ResidentialUpdate";
import Role from "./pages/Role/Role";
import RoleCreate from "./pages/Role/RoleCreate";
import RoleUpdate from "./pages/Role/RoleUpdate";
import Users from "./pages/Users/Users";
import UsersCreate from "./pages/Users/UsersCreate";
import UsersUpdate from "./pages/Users/UsersUpdate";

const pagesListWithChilds = [
  // residential
  {
    route: "/dashboard/residential",
    component: Residential,
    childs: [
      {
        route: "/dashboard/residential/create",
        component: ResidentialCreate,
        access: "create",
      },
      {
        route: "/dashboard/residential/update/:id",
        component: ResidentialUpdate,
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
  // Commercial
  {
    route: "/dashboard/commercial",
    component: Commercial,
    childs: [
      {
        route: "/dashboard/commercial/create",
        component: CommercialCreate,
        access: "create",
      },
      {
        route: "/dashboard/commercial/update/:id",
        component: CommercialUpdate,
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
];

const pageListNoChild = [
  {
    route: "/dashboard/project-page",
    component: ProjectPage,
    childs: [],
    hasChild: false,
  },
  {
    route: "/dashboard/location",
    component: Location,
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
    route: "/dashboard/contact-us-page",
    component: ContactUsPage,
    childs: [],
    hasChild: false,
  },
  {
    route: "/dashboard/footer-content",
    component: FooterContent,
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
    route: "/dashboard/banner-page",
    component: BannerPage,
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
    route: "/dashboard/career-page",
    component: CareerPage,
    childs: [],
    hasChild: false,
  },
  {
    route: "/dashboard/about-page",
    component: About,
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
