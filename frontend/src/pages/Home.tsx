import React from "react";
import { Calendar } from "@/components/ui/calendar";
export default function home() {
    const [date, setDate] = React.useState<Date | undefined>(new Date());

    return (

        <div>

            {/* Calendar */}
            <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-lg border"
            />

            {/* 显示选中日期 */}
            <p style={{ marginTop: 10 }}>
                选中的日期: {date ? date.toDateString() : "未选择"}
            </p>
        </div>

    );
}
