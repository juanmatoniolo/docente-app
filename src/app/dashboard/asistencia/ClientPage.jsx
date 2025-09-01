"use client";
import dynamic from "next/dynamic";

const AttendanceManager = dynamic(
    () => import("../../components/AttendanceManager"),
    { ssr: false }
);

export default function ClientPage() {
    return <AttendanceManager />;
}
