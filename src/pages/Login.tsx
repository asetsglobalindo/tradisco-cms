import FormLogin from "@/components/Form/FormLogin";
import {Card, CardContent, CardHeader} from "@/components/ui/card";

export default function Login() {
  return (
    <section className="flex items-center justify-center h-screen">
      <Card className="w-full max-w-sm mx-auto shadow-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center">
            {/* <svg
              xmlns="https://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-6 h-6"
            >
              <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
            </svg> */}
            <img className="hidden h-12 dark:block" src="/images/logo-white.png" alt="" />
            <img className="h-12 dark:hidden" src="/images/logo-black.png" alt="" />
          </div>
          {/* <CardTitle className="mt-5">Sign In</CardTitle>
          <CardDescription>Enter your email below to sign in</CardDescription> */}
        </CardHeader>
        <CardContent>
          <FormLogin />
        </CardContent>
      </Card>
    </section>
  );
}
