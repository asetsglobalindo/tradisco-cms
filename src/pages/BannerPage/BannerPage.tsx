// hook
import {useLocation, useNavigate} from "react-router-dom";

// component
import Breadcrumb from "@/components/Breadcrumb";
import {Button} from "@/components/ui/button";
import {Separator} from "@/components/ui/separator";
import {useState} from "react";
import ImageRepository from "@/components/ImageRepository";
import IMG_TYPE from "@/helper/img-type";

const title_page = "Banner Page";

const BannerPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const prevLocation = location.pathname.split("/").slice(0, 3).join("/");
  const breadcrumbItems = [{title: title_page, link: prevLocation}];

  const [annualReport, setAnnualReport] = useState<string[]>([]);
  const [sustainabilityReport, setSustainabilityReport] = useState<string[]>([]);
  const [procrementReport, setProcrementReport] = useState<string[]>([]);
  const [businessReport, setBusinessReport] = useState<string[]>([]);

  return (
    <section>
      <Breadcrumb items={breadcrumbItems} />
      <section className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold">{title_page}</h1>
      </section>
      <Separator />

      <section className="flex flex-col w-full mt-5 space-y-4">
        <ImageRepository
          img_type={IMG_TYPE.ANNUAL_REPORT_BANNER}
          label="Annual Report Banner"
          value={annualReport}
          limit={1}
          onChange={(data) => {
            setAnnualReport(data.map((item) => item._id));
          }}
        />

        <ImageRepository
          img_type={IMG_TYPE.SUSTAINABILITY_REPORT_BANNER}
          label="Sustainability Report Banner"
          value={sustainabilityReport}
          limit={1}
          onChange={(data) => {
            setSustainabilityReport(data.map((item) => item._id));
          }}
        />

        <ImageRepository
          img_type={IMG_TYPE.PROCUREMENT_REPORT_BANNER}
          label="Procrement Report Banner"
          value={procrementReport}
          limit={1}
          onChange={(data) => {
            setProcrementReport(data.map((item) => item._id));
          }}
        />

        <ImageRepository
          img_type={IMG_TYPE.BUSINESS_BANNER}
          label="Business Report Banner"
          value={businessReport}
          limit={1}
          onChange={(data) => {
            setBusinessReport(data.map((item) => item._id));
          }}
        />
        <div className="flex justify-center">
          <div className="flex gap-4 mt-5 mb-10">
            <Button className="w-[100px]" type="button" variant={"outline"} onClick={() => navigate(prevLocation)}>
              Back
            </Button>
          </div>
        </div>
      </section>
    </section>
  );
};

export default BannerPage;

