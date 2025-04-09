import FormLogin from "@/components/Form/FormLogin";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function Login() {
  return (
    <section className="flex items-center justify-center h-screen">
      <Card className="w-full max-w-sm mx-auto shadow-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center">
            <img className="h-12" src="/images/logo.png" alt="" />
          </div>
        </CardHeader>
        <CardContent>
          <FormLogin />
        </CardContent>
      </Card>
    </section>
  );
}
