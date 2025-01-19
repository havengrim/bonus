import React, { useState, useEffect } from "react";
import axios from "axios";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";

export default function CreateUserPage() {
  const [userData, setUserData] = useState({
    username: "",
    password: "",
    roleName: "",
  });

  const [roles, setRoles] = useState<{ _id: string, name: string }[]>([]);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        // Hardcoded localhost:3000 for API call
        const response = await axios.get("http://localhost:3000/roles");
        console.log("Fetched roles:", response.data);  // Log the response data
        setRoles(response.data);  // Store the data in the state
      } catch (error) {
        console.error("Error fetching roles:", error);
      }
    };
  
    fetchRoles();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // You should set your backend URL here for register endpoint
      const response = await axios.post("http://localhost:3000/register", userData);
      console.log(response)
      alert("User registered successfully!");
    } catch (error: any) {
      alert("Error: " + error.response?.data || "Something went wrong");
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="#">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Create New User</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="min-h-[100vh] flex-1 rounded-xl bg-neutral-100/50 md:min-h-min dark:bg-neutral-800/50">
            <h2 className="text-lg font-medium text-gray-800 dark:text-white">
              Create New User
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Username</label>
                <input
                  type="text"
                  name="username"
                  value={userData.username}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-4 py-2 text-sm bg-white border rounded-lg dark:bg-gray-900 dark:text-white dark:border-gray-700"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Password</label>
                <input
                  type="password"
                  name="password"
                  value={userData.password}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-4 py-2 text-sm bg-white border rounded-lg dark:bg-gray-900 dark:text-white dark:border-gray-700"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Role</label>
                <select
                    name="roleName"
                    value={userData.roleName}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-4 py-2 text-sm bg-white border rounded-lg dark:bg-gray-900 dark:text-white dark:border-gray-700"
                    required
                    >
                    <option value="">Select a role</option>
                    {roles.map((role) => (
                    <option key={role._id} value={role.name}>
                        {role.name}
                    </option>
                    ))}
                    </select>
              </div>

              <button
                type="submit"
                className="w-full mt-4 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
              >
                Register User
              </button>
            </form>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
