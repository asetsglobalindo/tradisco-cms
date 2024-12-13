import {cn} from "@/lib/utils";
import {Dispatch, SetStateAction, useEffect, useState} from "react";
import {Link, useLocation} from "react-router-dom";
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "../ui/accordion";
import {Circle} from "lucide-react";
import useUserStore from "@/store/userStore";
import {UseQueryResult, useQuery} from "react-query";
import PageServices from "@/services/page";
import {toast} from "react-toastify";
import ToastBody from "../ToastBody";
import {PageMenuItemType} from "@/types/page";
// import BasePageNav from "../../assets/json/base_page.json";

interface DashboardNavProps {
  setOpen?: Dispatch<SetStateAction<boolean>>;
}

interface PageMenuItemExtendedType extends PageMenuItemType {
  total_order: number;
}

export function DashboardNav({setOpen}: DashboardNavProps) {
  const userStore = useUserStore();
  const location = useLocation();
  const [defaultValue, setDefaultValue] = useState("");
  const {data}: UseQueryResult<PageMenuItemType[]> = useQuery({
    queryKey: ["pages"],
    queryFn: async () => await getPage({pageIndex: 0, pageSize: 200}),
    enabled: !!userStore.development,
  });

  const getPage = async ({pageIndex, pageSize}: {pageIndex: number; pageSize: number}) => {
    try {
      const response = await PageServices.get({page: pageIndex + 1, limit: pageSize});

      if (response.data.status !== 200) {
        throw new Error(response.data.err);
      }

      let result = response.data.data;
      let page_menu: PageMenuItemExtendedType[] = [];

      for (let i = 0; i < result.length; i++) {
        let currentPage = result[i];
        let groupIndex = page_menu.findIndex((pm) => pm.label === currentPage.group);
        let mapData = {
          _id: currentPage._id,
          actions: currentPage.actions,
          icon: currentPage.icon,
          label: currentPage.name,
          order: currentPage.order,
          sub_page_id: currentPage.sub_page_id,
          to: currentPage.route,
        };

        if (groupIndex > -1) {
          page_menu[groupIndex].items.push(mapData);

          // increase total order
          page_menu[groupIndex].total_order = page_menu[groupIndex].total_order + mapData.order;

          // sorting
          page_menu[groupIndex].items = page_menu[groupIndex].items.sort((a, b) => a.order - b.order);
        } else {
          page_menu.push({label: currentPage.group, items: [mapData], total_order: mapData.order});
        }
      }

      return page_menu.sort((a, b) => a.total_order - b.total_order);
    } catch (error: any) {
      toast.error(<ToastBody title="an error occurred" description={error.message || "Something went wrong"} />);
    }
  };

  useEffect(() => {
    let parent_route = userStore.route_menu;
    let parent_name = "";

    for (let i = 0; i < parent_route.length; i++) {
      parent_route[i].items.forEach((child_route) => {
        if (child_route.to === location.pathname) {
          parent_name = parent_route[i].label;
        }
      });
    }

    setDefaultValue(parent_name);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // if (!defaultValue) {
  //   return;
  // }

  return (
    <nav className="grid items-start gap-2 ">
      <Accordion defaultValue={defaultValue} type="single" collapsible className="w-full">
        {userStore.development
          ? // ? BasePageNav?.map((parent) => (
            data?.map((parent) => (
              <AccordionItem key={parent.label} value={parent.label}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2 font-medium tracking-wide capitalize">{parent.label}</div>
                </AccordionTrigger>
                <AccordionContent>
                  {parent.items.map((item) => {
                    return (
                      <Link
                        key={item._id}
                        to={item.to}
                        onClick={() => {
                          if (setOpen) setOpen(false);
                        }}
                      >
                        <span
                          className={cn(
                            "group flex items-center rounded-md  p-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                            location.pathname === item.to ? "font-semibold bg-accent" : "font-normal"
                          )}
                        >
                          <Circle size={8} className="mr-2" />
                          <span className="text-xs tracking-wide">{item.label}</span>
                        </span>
                      </Link>
                    );
                  })}
                </AccordionContent>
              </AccordionItem>
            ))
          : userStore.route_menu.map((parent) => (
              <AccordionItem key={parent.label} value={parent.label}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2 font-medium tracking-wide capitalize">{parent.label}</div>
                </AccordionTrigger>
                <AccordionContent>
                  {parent.items.map((item) => {
                    return (
                      <Link
                        key={item._id}
                        to={item.to}
                        onClick={() => {
                          if (setOpen) setOpen(false);
                        }}
                      >
                        <span
                          className={cn(
                            "group flex items-center rounded-md  p-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                            location.pathname === item.to ? "font-semibold bg-accent" : "font-normal"
                          )}
                        >
                          <Circle size={8} className="mr-2" />
                          <span className="text-xs tracking-wide">{item.label}</span>
                        </span>
                      </Link>
                    );
                  })}
                </AccordionContent>
              </AccordionItem>
            ))}
      </Accordion>
    </nav>
  );
}
