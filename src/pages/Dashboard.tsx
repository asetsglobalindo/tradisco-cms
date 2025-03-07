import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CircleCheckBig, HandCoins, Users } from "lucide-react";
import ApiService from "../lib/ApiService";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register the necessary components of Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [userCount, setUserCount] = useState<number>(0); // State to store the user count
  const [visitorData, setVisitorData] = useState<any>({});
  // const [startMonth, setStartMonth] = useState<string>("");
  // const [endMonth, setEndMonth] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true); // State to manage loading state
  const [error, setError] = useState<string | null>(null); // State to store any error

  const fetchUserCount = async () => {
    try {
      const responseUser = await ApiService.secure().get(`/user/count`);
      setUserCount(responseUser.data.data.user_count); // Update the user count state
    } catch (err) {
      setError("Failed to fetch user count");
    } finally {
      setLoading(false);
    }
  };

  const fetchVisitorData = async () => {
    try {
      setLoading(true);

      const response = await ApiService.secure().get(
        `/visitor/details?limit=6&sort=desc&reverseOrder=true`
      );
      setVisitorData(response.data);
    } catch (err) {
      setError("Failed to fetch visitor data");
    } finally {
      setLoading(false);
    }
  };

  // Fetch the user count from the API
  useEffect(() => {
    fetchUserCount(); // Call the function to fetch the user count
    fetchVisitorData();
  }, []); // Empty dependency array to run this effect only once on component mount

  // Sample chart data
  const chartData = {
    labels: Object.keys(visitorData), // months
    datasets: [
      {
        label: "Total Visitors",
        data: Object.values(visitorData).map(
          (item: any) => item.total_visitors
        ), // sales numbers
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };
  // Chart options (you can customize this as needed)
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const, // Ensure you use the correct type here
      },
      tooltip: {
        mode: "index" as const, // This is a valid option in Chart.js
        intersect: false,
      },
    },
  };

  return (
    <section className="flex flex-col gap-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* New Card to show the user count */}
        <Card className="bg-background rounded-sm menu-item-rounded">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users size={16} />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-2xl font-bold">Loading...</div>
            ) : error ? (
              <div className="text-2xl font-bold text-red-500">{error}</div>
            ) : (
              <div className="text-2xl font-bold">{userCount}</div>
            )}
          </CardContent>
        </Card>
        <Card className="bg-background rounded-sm menu-item-rounded">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <CircleCheckBig size={16} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>
        <Card className="bg-background rounded-sm menu-item-rounded">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Users size={16} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>
        <Card className="bg-background rounded-sm menu-item-rounded">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <HandCoins size={16} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="bg-background rounded-sm menu-item-rounded col-span-4">
          <CardHeader>
            <CardTitle>Visitor Overview</CardTitle>
            <CardDescription>Monthly visitor data.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <Bar data={chartData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-4 md:col-span-3 bg-background rounded-sm menu-item-rounded">
          <CardHeader>
            <CardTitle>Total</CardTitle>
            <CardDescription>You made 0 this month.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              <p>You don't have any.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default Dashboard;
