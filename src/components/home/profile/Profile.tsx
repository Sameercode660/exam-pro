'use client'

import { useLayout } from '@/app/contexts/LayoutContext';

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Loader2,
    AlertTriangle,
    Building2,
    Mail,
    Phone,
    User,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from '@/auth/AuthContext';

interface Organization {
    id: number;
    name: string;
    email: string;
    phone: string;
    address: string;
    State: string;
    Country: string;
    CountryCode: string;
}

interface UserData {
    id: number;
    name: string;
    email: string;
    mobileNumber: string;
    active: boolean;
    approved: boolean;
    visibility: boolean;
    organization: Organization;
}


function Profile() {

    const [data, setData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { setTitle } = useLayout();
    const { user } = useAuth();


    useEffect(() => {
        setTitle("My Groups")
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await axios.post("/api/participants/profile", { id: user?.id }); // Axios GET call
                setData(response.data.data);
            } catch (err: any) {
                setError(err.response?.data?.message || "Failed to fetch user data");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    /** Loading State */
    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
            </div>
        );
    }

    /** Error State */
    if (error) {
        return (
            <div className="flex justify-center items-center min-h-[50vh] text-red-600">
                <AlertTriangle className="h-6 w-6 mr-2" />
                <span>{error}</span>
            </div>
        );
    }

    /** Empty Data */
    if (!data) return null;


    return (
        <>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="p-6 max-w-3xl mx-auto"
            >
                <Card className="shadow-lg border border-gray-200 rounded-2xl bg-white">
                    <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-2xl text-white">
                        <CardTitle className="text-2xl font-bold text-center">
                            Profile
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="p-6 space-y-6">
                        {/* === Personal Information === */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold text-gray-800">
                                Personal Information
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InfoItem
                                    icon={<User className="text-blue-500" />}
                                    label="Name"
                                    value={data.name}
                                />
                                <InfoItem
                                    icon={<Mail className="text-green-500" />}
                                    label="Email"
                                    value={data.email}
                                />
                                <InfoItem
                                    icon={<Phone className="text-purple-500" />}
                                    label="Mobile Number"
                                    value={`+${data.organization.CountryCode} ${data.mobileNumber}`}
                                />
                                <InfoItem
                                    icon={<Building2 className="text-orange-500" />}
                                    label="Status"
                                    value={data.approved ? "Approved ✅" : "Pending Approval ⏳"}
                                />
                            </div>
                        </div>

                        {/* === Organization Information === */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold text-gray-800">
                                Organization Details
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InfoItem label="Organization Name" value={data.organization.name} />
                                <InfoItem label="Organization Email" value={data.organization.email} />
                                <InfoItem label="Phone" value={data.organization.phone} />
                                <InfoItem
                                    label="Address"
                                    value={`${data.organization.address}, ${data.organization.State}`}
                                />
                                <InfoItem
                                    label="Country"
                                    value={`${data.organization.Country} (${data.organization.CountryCode})`}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </>
    )
}

/** === Info Item Subcomponent === */
interface InfoItemProps {
    icon?: React.ReactNode;
    label: string;
    value: string;
}

const InfoItem: React.FC<InfoItemProps> = ({ icon, label, value }) => {
    return (
        <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
            {icon && <div className="flex-shrink-0">{icon}</div>}
            <div>
                <p className="text-sm text-gray-500">{label}</p>
                <p className="text-gray-800 font-medium break-words">{value}</p>
            </div>
        </div>
    );
};

export default Profile
