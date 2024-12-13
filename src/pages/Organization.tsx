// hook
import {useEffect, useState} from "react";
import {useForm} from "react-hook-form";
import {UseQueryResult, useMutation, useQuery} from "react-query";
import {useLocation, useNavigate} from "react-router-dom";

// component
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import Breadcrumb from "@/components/Breadcrumb";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Separator} from "@/components/ui/separator";

// utils
import settledHandler from "@/helper/settledHandler";
import ApiService from "@/lib/ApiService";
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";
import {Permissions, TODO} from "@/types";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Textarea} from "@/components/ui/textarea";
import {toast} from "react-toastify";
import ToastBody from "@/components/ToastBody";
import {UserAddress} from "@/types/user";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Switch} from "@/components/ui/switch";
import InputDecimal from "@/components/InputDecimal";

const title_page = "Organization";
const ORGANIZATION_ID = import.meta.env.VITE_APP_ORGANIZATION_ID;

// active member shcema
const activeMemberPointSchema = z.object({
  member_point_currency: z.number().default(0),
  activate_member_point: z.boolean().default(true),
});
type DataFormValueActiveMember = z.infer<typeof activeMemberPointSchema>;

// address schema
const addressSchema = z.object({
  name: z.string({required_error: "Field Required"}).min(1),
  user_name: z.string({required_error: "Field Required"}).min(1),
  address: z.string({required_error: "Field Required"}).min(1),
  address2: z.string({required_error: "Field Required"}).min(0).default(""),
  province: z.string({required_error: "Field Required"}).min(1),
  district: z.string({required_error: "Field Required"}).min(1),
  urban: z.string({required_error: "Field Required"}).min(1),
  city: z.string({required_error: "Field Required"}).min(1),
  postal_code: z.string({required_error: "Field Required"}).min(1),
  phone_number: z.string({required_error: "Field Required"}).min(1),
  email: z.string({required_error: "Field Required"}).min(1),
  type: z.string().min(0).default("origin"),
  active_status: z.boolean().default(true),
});

type DataFormValueAddress = z.infer<typeof addressSchema>;

const ActivateMemberPoint: React.FC<{permissions: Permissions}> = ({permissions}) => {
  const navigate = useNavigate();
  const prevLocation = "/dashboard";

  const form = useForm<DataFormValueActiveMember>({
    resolver: zodResolver(activeMemberPointSchema),
  });

  const {mutate, isLoading} = useMutation(
    async (payload: DataFormValueActiveMember) => await ApiService.secure().post("/organization/vip", payload),
    {
      onSettled: (response) =>
        settledHandler({
          response,
          contextAction: "Update",
          onFinish: () => {
            getMerchantDetails();
          },
        }),
    }
  );

  const onSubmit = (data: DataFormValueActiveMember) => {
    mutate(data);
  };

  const getMerchantDetails = async () => {
    try {
      const res = await ApiService.secure().get("/organization/" + ORGANIZATION_ID);

      if (res.data.status !== 200) {
        throw new Error(res.data.message);
      }

      const result: any = res.data.data;
      form.reset({
        activate_member_point: result.activate_member_point,
        member_point_currency: result.member_point_currency,
      });
    } catch (error: any) {
      toast.error(<ToastBody title="an error occurred" description={error.message || "Something went wrong"} />);
      return error;
    }
  };

  useEffect(() => {
    getMerchantDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="mt-4">
      <section className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-bold">Member Points</h3>
      </section>
      <Separator />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col w-full mt-5 space-y-4">
          <FormField
            control={form.control}
            name="member_point_currency"
            render={({field}) => (
              <FormItem>
                <div className="flex flex-col space-y-2">
                  <label
                    htmlFor="order"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Member Point Currency
                  </label>
                  <InputDecimal
                    id="order"
                    {...field}
                    onChange={(event) => field.onChange(parseInt(event.target.value))}
                    placeholder="Enter order"
                    value={String(field.value)}
                  />
                </div>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="activate_member_point"
            defaultValue={false}
            render={({field}) => (
              <FormItem>
                <div className="flex flex-row items-center gap-2 mt-4">
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel>Active Status</FormLabel>
                </div>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
          <div className="flex justify-center">
            <div className="flex gap-4 mt-5 mb-10">
              <Button className="w-[100px]" type="button" variant={"outline"} onClick={() => navigate(prevLocation)}>
                Back
              </Button>
              <Button disabled={!permissions.update} className="w-[100px]" size={"sm"} isLoading={isLoading}>
                Submit
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </section>
  );
};

const CheckoutSetting: React.FC<{permissions: Permissions}> = ({permissions}) => {
  const navigate = useNavigate();
  const prevLocation = "/dashboard";

  const form = useForm();
  const {mutate, isLoading} = useMutation(
    async (payload: DataFormValueActiveMember) => await ApiService.secure().post("/organization/convert", payload),
    {
      onSettled: (response) =>
        settledHandler({
          response,
          contextAction: "Update",
          onFinish: () => {
            getOrganizationDetails();
          },
        }),
    }
  );

  const onSubmit = (data: any) => {
    mutate(data);
  };

  const getOrganizationDetails = async () => {
    try {
      const res = await ApiService.secure().get("/organization/" + ORGANIZATION_ID);

      if (res.data.status !== 200) {
        throw new Error(res.data.message);
      }

      const result: any = res.data.data;
      form.reset({
        nominal: +result.currency_convert,
        minutes: result.checkout_minute_removal,
        revert_product_in: res.data.data.revert_product_in,
        cart_minute_removal: res.data.data.cart_minute_removal,
        currency: result.currency.currency,
      });
    } catch (error: any) {
      toast.error(<ToastBody title="an error occurred" description={error.message || "Something went wrong"} />);
      return error;
    }
  };

  useEffect(() => {
    getOrganizationDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="mt-4">
      <section className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-bold">Checkout Settings</h3>
      </section>
      <Separator />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col w-full mt-5 space-y-4">
          <h3 className="font-semibold">Currency Setting</h3>
          <FormField
            control={form.control}
            name="currency"
            render={({field}) => (
              <FormItem>
                <div className="flex flex-col space-y-2">
                  <label
                    htmlFor="order"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Currency
                  </label>
                  <Input
                    id="currency"
                    {...field}
                    onChange={(event) => field.onChange(parseInt(event.target.value))}
                    placeholder="Enter currency"
                    value={String(field.value)}
                  />
                </div>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="nominal"
            render={({field}) => (
              <FormItem>
                <div className="flex flex-col space-y-2">
                  <label
                    htmlFor="order"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Convert Nominal
                  </label>
                  <InputDecimal
                    id="order"
                    {...field}
                    onChange={(event) => field.onChange(parseInt(event.target.value))}
                    placeholder="Enter order"
                    value={String(field.value)}
                  />
                </div>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <h3 className="font-semibold">Revert Product</h3>
          <FormField
            control={form.control}
            name="revert_product_in"
            render={({field}) => (
              <FormItem>
                <div className="flex flex-col space-y-2">
                  <label
                    htmlFor="revert_product_in"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Revert Product In
                  </label>
                  <InputDecimal
                    id="revert_product_in"
                    {...field}
                    onChange={(event) => field.onChange(parseInt(event.target.value))}
                    placeholder="Enter order"
                    value={String(field.value)}
                  />
                </div>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="cart_minute_removal"
            render={({field}) => (
              <FormItem>
                <div className="flex flex-col space-y-2">
                  <label
                    htmlFor="cart_minute_removal"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Cart Minute Removal
                  </label>
                  <InputDecimal
                    id="cart_minute_removal"
                    {...field}
                    onChange={(event) => field.onChange(parseInt(event.target.value))}
                    placeholder="Enter order"
                    value={String(field.value)}
                  />
                </div>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <h3 className="font-semibold">Checkout setting</h3>
          <FormField
            control={form.control}
            name="minutes"
            render={({field}) => (
              <FormItem>
                <div className="flex flex-col space-y-2">
                  <label
                    htmlFor="order"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Minutes
                  </label>
                  <Input
                    id="minutes"
                    {...field}
                    onChange={(event) => field.onChange(parseInt(event.target.value))}
                    placeholder="Enter Minutes"
                    value={String(field.value)}
                  />
                </div>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <div className="flex justify-center">
            <div className="flex gap-4 mt-5 mb-10">
              <Button className="w-[100px]" type="button" variant={"outline"} onClick={() => navigate(prevLocation)}>
                Back
              </Button>
              <Button disabled={!permissions.update} className="w-[100px]" size={"sm"} isLoading={isLoading}>
                Submit
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </section>
  );
};

const Setting: React.FC<{permissions: Permissions}> = ({permissions}) => {
  const navigate = useNavigate();
  const prevLocation = "/dashboard";

  const form = useForm();
  const {mutate, isLoading} = useMutation(
    async (payload: DataFormValueActiveMember) => await ApiService.secure().post("/organization/setting", payload),
    {
      onSettled: (response) =>
        settledHandler({
          response,
          contextAction: "Update",
          onFinish: () => {
            getOrganizationDetails();
          },
        }),
    }
  );

  const onSubmit = (data: any) => {
    mutate(data);
  };

  const getOrganizationDetails = async () => {
    try {
      const res = await ApiService.secure().get("/organization/" + ORGANIZATION_ID);

      if (res.data.status !== 200) {
        throw new Error(res.data.message);
      }

      const result: any = res.data.data;
      form.reset({
        auto_update_onprogres_transaction: result.auto_update_onprogres_transaction,
      });
    } catch (error: any) {
      toast.error(<ToastBody title="an error occurred" description={error.message || "Something went wrong"} />);
      return error;
    }
  };

  useEffect(() => {
    getOrganizationDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="mt-4">
      <section className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-bold">Checkout Settings</h3>
      </section>
      <Separator />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col w-full mt-5 space-y-4">
          <FormField
            control={form.control}
            name="auto_update_onprogres_transaction"
            render={({field}) => (
              <FormItem>
                <div className="flex flex-col space-y-2">
                  <label
                    htmlFor="order"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Auto Update Onprogres Transaction
                  </label>
                  <InputDecimal
                    id="order"
                    {...field}
                    onChange={(event) => field.onChange(parseInt(event.target.value))}
                    placeholder="Enter order"
                    value={String(field.value)}
                  />
                </div>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <div className="flex justify-center">
            <div className="flex gap-4 mt-5 mb-10">
              <Button className="w-[100px]" type="button" variant={"outline"} onClick={() => navigate(prevLocation)}>
                Back
              </Button>
              <Button disabled={!permissions.update} className="w-[100px]" size={"sm"} isLoading={isLoading}>
                Submit
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </section>
  );
};

const Address: React.FC<{permissions: Permissions}> = ({permissions}) => {
  const navigate = useNavigate();
  const prevLocation = "/dashboard";

  const [province, setProvince] = useState<string[]>([]);
  const [city, setCity] = useState<string[]>([]);
  const [district, setDistrict] = useState<string[]>([]);
  const [urban, setUrban] = useState<string[]>([]);
  const [postalCode, setPostalCode] = useState<string[]>([]);

  const formBio = useForm();

  const form = useForm<DataFormValueAddress>({
    resolver: zodResolver(addressSchema),
  });

  const provinceWatch = form.watch("province");
  const districtWatch = form.watch("district");
  const urbanWatch = form.watch("urban");
  const cityWatch = form.watch("city");
  const postalCodeWatch = form.watch("postal_code");

  const {data}: UseQueryResult<UserAddress | undefined> = useQuery({
    queryKey: [title_page],
    enabled: !!province.length,
    queryFn: async () => await getMerchantDetails(),
  });

  const {mutate, isLoading} = useMutation(
    async (payload: DataFormValueAddress) => await ApiService.secure().post("/organization/address", payload),
    {
      onSettled: (response) =>
        settledHandler({
          response,
          contextAction: "Update",
          onFinish: () => {
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          },
        }),
    }
  );

  const onSubmit = (data: DataFormValueAddress) => {
    mutate(data);
  };

  const getAddress = async ({payload}: {payload: TODO}): Promise<string[] | []> => {
    try {
      const response = await ApiService.secure().post("/address", payload);

      if (response.data.status !== 200) {
        throw new Error(response.data.message);
      }
      let result: string[] | [] = response.data.data || [];
      return result;
    } catch (error: TODO) {
      toast.error(<ToastBody title="an error occurred" description={error.message || "Something went wrong"} />);
      return [];
    }
  };

  const getMerchantDetails = async () => {
    try {
      const res = await ApiService.secure().get("/organization/" + ORGANIZATION_ID);

      if (res.data.status !== 200) {
        throw new Error(res.data.message);
      }

      const result: UserAddress = res.data.data.location;

      formBio.reset({
        name: res.data.data.name,
        email: res.data.data.email,
        phone_number: res.data.data.phone_number,
      });
      return result || {};
    } catch (error: any) {
      toast.error(<ToastBody title="an error occurred" description={error.message || "Something went wrong"} />);
      return error;
    }
  };

  useEffect(() => {
    getAddress({
      payload: {
        all_province: true,
      },
    }).then((data: string[] | []) => {
      setProvince(data);
    });
  }, []);

  useEffect(() => {
    if (provinceWatch) {
      getAddress({
        payload: {
          province: provinceWatch,
        },
      }).then((data: string[] | []) => {
        setCity(data);
      });
    }

    if (cityWatch) {
      getAddress({
        payload: {
          city: cityWatch,
        },
      }).then((data: string[] | []) => {
        setDistrict(data);
      });
    }

    if (districtWatch) {
      getAddress({
        payload: {
          district: districtWatch,
        },
      }).then((data: string[] | []) => {
        setUrban(data);
      });
    }

    if (districtWatch && urbanWatch) {
      getAddress({
        payload: {
          district: districtWatch,
          urban: urbanWatch,
        },
      }).then((data: string[] | []) => {
        setPostalCode(data);
      });
    }
  }, [provinceWatch, districtWatch, urbanWatch, cityWatch, postalCodeWatch]);

  useEffect(() => {
    const editHandler = async () => {
      if (data?.province) {
        await getAddress({
          payload: {
            province: data?.province,
          },
        }).then((data: string[] | []) => {
          setCity(data);
        });
      }

      if (data?.city) {
        await getAddress({
          payload: {
            city: data?.city,
          },
        }).then((data: string[] | []) => {
          setDistrict(data);
        });
      }

      if (data?.district) {
        await getAddress({
          payload: {
            district: data?.district,
          },
        }).then((data: string[] | []) => {
          setUrban(data);
        });
      }

      if (data?.district && data.urban) {
        await getAddress({
          payload: {
            district: data?.district,
            urban: data?.urban,
          },
        }).then((data: string[] | []) => {
          setPostalCode(data);
        });
      }

      form.reset({});

      setTimeout(() => {
        form.reset(data);
      }, 500);
    };

    if (data) {
      editHandler();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  return (
    <section className="mt-4">
      <section className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-bold">Merchant Address</h3>
      </section>
      <Separator />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col w-full mt-5 space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({field}) => (
              <FormItem>
                <FormLabel>Address Name </FormLabel>
                <FormControl>
                  <Input placeholder="Enter name" disabled={isLoading} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="user_name"
            render={({field}) => (
              <FormItem>
                <FormLabel>Reciever Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter name" disabled={isLoading} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({field}) => (
              <FormItem>
                <FormLabel>E-Mail</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="Enter your email" disabled={isLoading} {...field} />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone_number"
            render={({field}) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="Enter phone number" disabled={isLoading} {...field} />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address"
            render={({field}) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Textarea
                    id="description"
                    placeholder="Enter address"
                    className="resize-none"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="province"
            render={({field}) => (
              <FormItem>
                <FormLabel>Province</FormLabel>
                <FormControl>
                  <Select
                    disabled={!province.length}
                    onValueChange={(value) => {
                      form.setValue("city", "");
                      form.setValue("district", "");
                      form.setValue("urban", "");
                      form.setValue("postal_code", "");
                      field.onChange(value);
                    }}
                    value={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select province" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px]">
                      {province.map((data) => (
                        <SelectItem value={data}>{data}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="city"
            render={({field}) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Select
                    disabled={!city.length}
                    value={field.value}
                    onValueChange={(value) => {
                      form.setValue("district", "");
                      form.setValue("urban", "");
                      form.setValue("postal_code", "");
                      field.onChange(value);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px]">
                      {city.map((data) => (
                        <SelectItem value={data}>{data}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="district"
            render={({field}) => (
              <FormItem>
                <FormLabel>District</FormLabel>
                <FormControl>
                  <Select
                    disabled={!district.length}
                    value={field.value}
                    onValueChange={(value) => {
                      form.setValue("urban", "");
                      form.setValue("postal_code", "");
                      field.onChange(value);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select district" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px]">
                      {district.map((data) => (
                        <SelectItem value={data}>{data}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="urban"
            render={({field}) => (
              <FormItem>
                <FormLabel>Urban</FormLabel>
                <FormControl>
                  <Select
                    disabled={!urban.length}
                    value={field.value}
                    onValueChange={(value) => {
                      form.setValue("postal_code", "");
                      field.onChange(value);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select urban" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px]">
                      {urban.map((data) => (
                        <SelectItem value={data}>{data}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="postal_code"
            render={({field}) => (
              <FormItem>
                <FormLabel>Postal Code</FormLabel>
                <FormControl>
                  <Select
                    disabled={!postalCode.length}
                    onValueChange={(value) => field.onChange(value)}
                    value={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select postal code" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px]">
                      {postalCode.map((data) => (
                        <SelectItem value={data}>{data}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <div className="flex justify-center">
            <div className="flex gap-4 mt-5 mb-10">
              <Button className="w-[100px]" type="button" variant={"outline"} onClick={() => navigate(prevLocation)}>
                Back
              </Button>
              <Button disabled={!permissions.update} className="w-[100px]" size={"sm"} isLoading={isLoading}>
                Submit
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </section>
  );
};

const Bio = () => {
  const isLoading = true;

  const form = useForm<DataFormValueAddress>({
    resolver: zodResolver(addressSchema),
  });

  const getMerchantDetails = async () => {
    try {
      const res = await ApiService.secure().get("/organization/" + ORGANIZATION_ID);

      if (res.data.status !== 200) {
        throw new Error(res.data.message);
      }

      form.reset({
        name: res.data.data.name,
        email: res.data.data.email,
        phone_number: res.data.data.phone_number,
      });
    } catch (error: any) {
      toast.error(<ToastBody title="an error occurred" description={error.message || "Something went wrong"} />);
      return error;
    }
  };

  useEffect(() => {
    getMerchantDetails();
  }, []);

  return (
    <section className="mt-4">
      <section className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-bold">Bio</h3>
      </section>
      <Separator />
      <Form {...form}>
        <form className="flex flex-col w-full mt-5 space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({field}) => (
              <FormItem>
                <FormLabel>Name </FormLabel>
                <FormControl>
                  <Input placeholder="Enter name" disabled={isLoading} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({field}) => (
              <FormItem>
                <FormLabel>E-Mail</FormLabel>
                <FormControl>
                  <Input placeholder="Enter name" disabled={isLoading} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone_number"
            render={({field}) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your phone number" disabled={isLoading} {...field} />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </section>
  );
};

const Organization: React.FC<{permissions: Permissions}> = ({permissions}) => {
  const location = useLocation();
  const prevLocation = location.pathname.split("/").slice(0, 3).join("/");
  const breadcrumbItems = [{title: title_page, link: prevLocation}];

  return (
    <section>
      <Breadcrumb items={breadcrumbItems} />
      <section className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold">{title_page}</h1>
      </section>
      <Separator />
      <Tabs defaultValue="bio" className="w-full">
        <TabsList className="flex justify-start">
          <TabsTrigger value="bio">Bio</TabsTrigger>
          <TabsTrigger value="Merchant Address">Merchant Address</TabsTrigger>
          <TabsTrigger value="Member Points">Member Points</TabsTrigger>
          <TabsTrigger value="Checkout Setting">Checkout Setting</TabsTrigger>
          <TabsTrigger value="Setting">Setting</TabsTrigger>
        </TabsList>
        <TabsContent value="bio">
          <Bio />
        </TabsContent>
        <TabsContent value="Merchant Address">
          <Address permissions={permissions} />
        </TabsContent>
        <TabsContent value="Member Points">
          <ActivateMemberPoint permissions={permissions} />
        </TabsContent>
        <TabsContent value="Checkout Setting">
          <CheckoutSetting permissions={permissions} />
        </TabsContent>
        <TabsContent value="Setting">
          <Setting permissions={permissions} />
        </TabsContent>
      </Tabs>
    </section>
  );
};

export default Organization;

