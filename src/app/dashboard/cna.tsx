import { useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import * as XLSX from "xlsx";

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
                  <BreadcrumbLink href="#">Building Your Application</BreadcrumbLink>
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
                      <td colSpan={3} className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200 text-center">Upload an Excel file list of employees to get started</td>
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
