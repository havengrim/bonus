import { useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import * as XLSX from "xlsx";
import { AiOutlineCloudDownload } from "react-icons/ai";
interface EmployeeData {
  name: string;
  startDate: string | Date;
  totalCNAIncentive: number;
}

export default function CNAIncentivePage() {
  const [data, setData] = useState<EmployeeData[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [isCalculated, setIsCalculated] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 20;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const binaryStr = event.target?.result as string;
      const wb = XLSX.read(binaryStr, { type: "binary" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(ws, { header: 1 });

      const processedData = jsonData.slice(1).map((row: any) => {
        const rawDate = row[1];
        const parsedDate = typeof rawDate === "number" ? new Date((rawDate - 25569) * 86400 * 1000) : new Date(rawDate);

        return {
          name: row[0],
          startDate: parsedDate.toLocaleDateString(),
          totalCNAIncentive: 0,
        };
      });

      setData(processedData);
      setFileName(file.name);
    };
    reader.readAsBinaryString(file);
  };

  const calculateCNAIncentive = (startDate: string): number => {
    const [month, day, year] = startDate.split("/").map((part) => parseInt(part, 10));
    const start = new Date(year, month - 1, day);
    const end = new Date("2024-11-30");  // Set the end date to 31 December 2024
  
    // Ensure that if the start date is before 01 January 2024, we set the start to 01 January 2024
    if (start < new Date("2024-01-01")) {
      start.setFullYear(2024, 0, 1); // Set to 01 January 2024
    }
  
    // Calculate the number of days worked within the range
    const daysWorked = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24));
    
    // Calculate months worked
    const monthsWorked = daysWorked / 30;
  
    let cnaAmount = 0;
  
    // Calculate CNA amount based on months worked
    if (monthsWorked >= 4) {
      cnaAmount = 30000;  // 4 months or more
    } else if (monthsWorked >= 3) {
      cnaAmount = 15000;  // 3 months to less than 4 months
    } else if (monthsWorked >= 2) {
      cnaAmount = 12000;  // 2 months to less than 3 months
    } else if (monthsWorked >= 1) {
      cnaAmount = 9000;   // 1 month to less than 2 months
    } else {
      cnaAmount = 6000;   // Less than 1 month
    }
  
    return cnaAmount;
  };
  
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const handleCalculate = () => {
    const newData = data.map((row) => ({
      ...row,
      totalCNAIncentive: row.startDate ? calculateCNAIncentive(String(row.startDate)) : 0,
    }));
    setData(newData);
    setIsCalculated(true);
  };

  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Employee Data");

    XLSX.writeFile(wb, `${fileName || "EmployeeData"}.xlsx`);
  };

  const totalPages = Math.ceil(data.length / rowsPerPage);
  const currentData = data.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>CNA Incentive</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <section className="container px-4 mx-auto">
          <div className="sm:flex sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-x-3">
                <h2 className="text-lg font-medium text-gray-800 dark:text-white">CNA Incentive</h2>
                <span className="px-3 py-1 text-xs text-blue-600 bg-blue-100 rounded-full dark:bg-gray-800 dark:text-blue-400">
                  {data.length > 0 ? `${data.length} employees` : "0"}
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-300">Upload employee data and calculate CNA incentives.</p>
            </div>

            <div className="flex items-center mt-4 gap-x-3">
              <label htmlFor="file-upload" className="flex items-center justify-center w-1/2 px-5 py-2 text-sm text-gray-700 transition-colors duration-200 bg-white border rounded-lg gap-x-2 sm:w-auto dark:hover:bg-gray-800 dark:bg-gray-900 hover:bg-gray-100 dark:text-gray-200 dark:border-gray-700">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g clipPath="url(#clip0_3098_154395)">
                    <path d="M13.3333 13.3332L9.99997 9.9999M9.99997 9.9999L6.66663 13.3332M9.99997 9.9999V17.4999M16.9916 15.3249C17.8044 14.8818 18.4465 14.1806 18.8165 13.3321C19.1866 12.4835 19.2635 11.5359 19.0351 10.6388C18.8068 9.7417 18.2862 8.94616 17.5555 8.37778C16.8248 7.80939 15.9257 7.50052 15 7.4999H13.95C13.6977 6.52427 13.2276 5.61852 12.5749 4.85073C11.9222 4.08295 11.104 3.47311 10.1817 3.06708C9.25943 2.66104 8.25709 2.46937 7.25006 2.50647C6.24304 2.54358 5.25752 2.80849 4.36761 3.28129C3.47771 3.7541 2.70656 4.42249 2.11215 5.23622C1.51774 6.04996 1.11554 6.98785 0.935783 7.9794C0.756025 8.97095 0.803388 9.99035 1.07431 10.961C1.34523 11.9316 1.83267 12.8281 2.49997 13.5832" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
                  </g>
                  <defs>
                    <clipPath id="clip0_3098_154395">
                      <rect width="20" height="20" fill="white"/>
                    </clipPath>
                  </defs>
                </svg>
                <span>Upload File</span>
                <input type="file" id="file-upload" className="hidden" onChange={handleFileUpload} />
              </label>

              <button
                className="flex items-center justify-center w-1/2 px-5 py-2 text-sm tracking-wide text-white transition-colors duration-200 bg-blue-500 rounded-lg shrink-0 sm:w-auto gap-x-2 hover:bg-blue-600 dark:hover:bg-blue-500 dark:bg-blue-600"
                onClick={handleCalculate}
              >
                <span>Calculate CNA</span>
              </button>

              <button
                className={`flex items-center justify-center w-1/2 px-5 py-2 text-sm tracking-wide text-white transition-colors duration-200 rounded-md ${isCalculated ? "bg-green-500 hover:bg-green-600" : "bg-gray-400 cursor-not-allowed"} shrink-0 sm:w-auto gap-x-2`}
                onClick={handleExport}
                disabled={!isCalculated}
              >
                <AiOutlineCloudDownload className="h-6 w-6" />
                <span>Export</span>
              </button>
            </div>
          </div>

          <div className="mt-6">
            <div className="overflow-x-auto bg-white border rounded-lg shadow-md dark:bg-gray-900 dark:border-gray-700">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-800">
                    <th className="px-4 py-2 text-sm font-medium text-left text-gray-700 dark:text-gray-300">Name</th>
                    <th className="px-4 py-2 text-sm font-medium text-left text-gray-700 dark:text-gray-300">Start Date</th>
                    <th className="px-4 py-2 text-sm font-medium text-left text-gray-700 dark:text-gray-300">Total CNA Incentive</th>
                  </tr>
                </thead>
                <tbody>
                  {data.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="p-8 text-sm text-gray-800 dark:text-gray-200 text-center">
                      <div className="flex items-center text-center rounded-lg h-full  dark:border-gray-700">
                          <div className="flex flex-col w-full max-w-sm px-4 mx-auto">
                            <div className="p-3 mx-auto text-blue-500 bg-blue-100 rounded-full dark:bg-gray-800">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="w-6 h-6"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                                />
                              </svg>
                            </div>
                            <h1 className="mt-3 text-lg text-gray-800 dark:text-white">No Employee Details Found</h1>
                              <p className="mt-2 text-gray-500 dark:text-gray-400">
                                It looks like there are no employee details available at the moment. To get started, please upload an Excel file containing the employee information.
                              </p>
                            
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    currentData.map((row, index) => (
                      <tr key={index} className="border-b dark:border-gray-700">
                        <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200">{row.name}</td>
                        <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200 w-1/3">
                          {typeof row.startDate === 'string' ? row.startDate : row.startDate.toLocaleDateString()}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200">{formatNumber(row.totalCNAIncentive)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center mt-4">
              <span className="text-sm text-gray-700 dark:text-gray-300">Page {currentPage} of {totalPages}</span>
              <div className="flex gap-2">
                <button
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>

                <button
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </section>
      </SidebarInset>
    </SidebarProvider>
  );
}
