import React from "react";
import Breadcrumb from "./Breadcrumb";
import {Button} from "./ui/button";
import {Plus} from "lucide-react";
import {Separator} from "./ui/separator";

type BreadCrumbType = {
  title: string;
  link: string;
};

const TableHeaderPage: React.FC<{
  title: string;
  totalData: number;
  item: BreadCrumbType[];
  addHandler: () => void;
  disable?: boolean;
  hideCreate?: boolean;
  extraAction?: React.ReactNode;
}> = ({title, totalData, item, addHandler, disable = false, extraAction, hideCreate = false}) => {
  return (
    <React.Fragment>
      <Breadcrumb items={item} />
      {/* header */}
      <div className="flex items-center justify-between mb-4">
        <section className="">
          <h1 className="text-2xl font-bold">
            {title} ({totalData})
          </h1>
        </section>
        <section className="flex gap-4">
          {!hideCreate ? (
            <Button disabled={disable} onClick={() => addHandler()} className="text-xs md:text-sm">
              <Plus className="w-4 h-4 mr-2" /> Add New
            </Button>
          ) : null}
          {extraAction ? extraAction : null}
          {/* <form className="grid w-full max-w-sm items-center gap-1.5">
            <Input className="rounded-lg bg-primary text-secondary" id="picture" type="file" />
          </form> */}
        </section>
      </div>
      <Separator />
    </React.Fragment>
  );
};

export default TableHeaderPage;
