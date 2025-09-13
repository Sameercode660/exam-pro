// "use client";

// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { format } from "date-fns";
// import { DateRange } from "react-day-picker";
// import { Calendar } from "@/components/ui/calendar";
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import DynamicTable from "../utils/DynamicTable";
// import { useAuth } from "@/context/AuthContext";
// import PageHeading from "../utils/PageHeading";

// export default function ParticipantActivityTable() {
//   const [activities, setActivities] = useState<any[]>([]);
//   const [search, setSearch] = useState("");
//   const [dateRange, setDateRange] = useState<DateRange | undefined>();
//   const [admins, setAdmins] = useState<any[]>([]);
//   const [selectedAdmin, setSelectedAdmin] = useState<string | undefined>();
//   const { user } = useAuth();

//   const fetchActivities = async () => {
//     const res = await axios.post(
//       `${process.env.NEXT_PUBLIC_ROOT_URL}/participant-activity-tracking/fetch-activity-data`,
//       {
//         organizationId: Number(user?.organizationId),
//         search,
//         fromDate: dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : "",
//         toDate: dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : "",
//         adminId: selectedAdmin ? Number(selectedAdmin) : undefined,
//       }
//     );
//     console.log(res.data)
//     setActivities(res.data.data);
//   };

//   const fetchAdmins = async () => {
//     if (!user?.organizationId) return;
//     const res = await axios.post(
//       `${process.env.NEXT_PUBLIC_ROOT_URL}/groups/fetch-admin-list`,
//       {
//         organizationId: Number(user.organizationId),
//       }
//     );
//     setAdmins(res.data.admins || []);
//   };
//   useEffect(() => {
//     fetchAdmins();
//   }, [])

//   useEffect(() => {
//     fetchActivities();
    
//   }, [search, dateRange, selectedAdmin]);

//   const handleClear = () => {
//     setSearch("");
//     setDateRange(undefined);
//     setSelectedAdmin(undefined);
//   };

//   const columns = [
//     "Name",
//     "Email",
//     "Mobile Number",
//     "Login Time",
//     "Logout Time",
//     "Spent Time",
//     "Admin",
//   ];

//   const tableData = activities.map((activity) => {
//     return {
//       Name: activity.participant?.name || "Unknown",
//       Email: activity.participant?.email || "Unknown",
//       "Mobile Number": activity.participant?.mobileNumber || "Unknown",
//       "Login Time": format(new Date(activity.loginTime), "dd/MM/yyyy hh:mm a"),
//       "Logout Time":
//         activity.logoutTime !== activity.loginTime
//           ? format(new Date(activity.logoutTime), "dd/MM/yyyy hh:mm a")
//           : "-",
//       "Spent Time": activity.spentTime
//         ? (() => {
//           const totalSeconds = activity.spentTime;
//           const hours = Math.floor(totalSeconds / 3600);
//           const minutes = Math.floor((totalSeconds % 3600) / 60);
//           const seconds = totalSeconds % 60;
//           const parts = [];
//           if (hours > 0) parts.push(`${hours} hr`);
//           if (minutes > 0) parts.push(`${minutes} min`);
//           if (seconds > 0 || parts.length === 0)
//             parts.push(`${seconds} sec`);
//           return parts.join(" ");
//         })()
//         : "-",
//       Admin: activity.participant.name || "-",
//     };
//   });

//   return (
//     <>
//       <PageHeading title="Participant Activity"></PageHeading>
//       <div className="pl-4 pb-4 pr-4">
//       {/* Filters */}
//       <div className="flex flex-wrap gap-4 mb-4 items-center">
//         {/* Search */}
//         <Input
//           type="text"
//           placeholder="Search name, email, or mobile"
//           className="h-10 w-64"
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//         />

//         {/* Admin Select */}
//         <Select value={selectedAdmin} onValueChange={(val) => setSelectedAdmin(val)}>
//           <SelectTrigger className="w-48 h-10">
//             <SelectValue placeholder="Select Admin" />
//           </SelectTrigger>
//           <SelectContent>
//             {admins.map((admin) => (
//               <SelectItem key={admin.id} value={String(admin.id)}>
//                 {admin.name}
//               </SelectItem>
//             ))}
//           </SelectContent>
//         </Select>

//         {/* Date Range Picker */}
//         <Popover>
//           <PopoverTrigger asChild>
//             <Button variant="outline" className="h-10 w-64 justify-start text-left font-normal">
//               {dateRange?.from ? (
//                 dateRange.to ? (
//                   <>
//                     {format(dateRange.from, "dd/MM/yyyy")} - {format(dateRange.to, "dd/MM/yyyy")}
//                   </>
//                 ) : (
//                   format(dateRange.from, "dd/MM/yyyy")
//                 )
//               ) : (
//                 <span>Select date range</span>
//               )}
//             </Button>
//           </PopoverTrigger>
//           <PopoverContent className="w-auto p-0" align="start">
//             <Calendar
//               initialFocus
//               mode="range"
//               defaultMonth={dateRange?.from}
//               selected={dateRange}
//               onSelect={setDateRange}
//               numberOfMonths={1}
//             />
//           </PopoverContent>
//         </Popover>

//         {/* Apply / Clear Buttons */}
//         <Button onClick={fetchActivities} className="h-10">
//           Apply Filter
//         </Button>
//         {
//           (search || selectedAdmin || dateRange ) && ( 
//             <Button onClick={handleClear} variant="outline" className="h-10">
//           Clear
//         </Button>
//           )
//         }
//       </div>

//       {/* Reusable table */}
//       <DynamicTable
//         columns={columns}
//         data={tableData}
//         searchable={false}
//         color="text-blue-600 font-medium"
//       />
//     </div>
//     </>
//   );
// }
