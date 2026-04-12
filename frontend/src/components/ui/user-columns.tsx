// components/ui/user-columns.tsx
import { type ColumnDef } from "@tanstack/react-table"

export type UserModel = {
    user_id: number
    name: string
    created_at: string
}

export const userColumns: ColumnDef<UserModel>[] = [
    {
        accessorKey: "user_id",
        header: "用户ID",
    },
    {
        accessorKey: "name",
        header: "模型名称",
    },
    {
        accessorKey: "created_at",
        header: "创建时间",
        cell: ({ row }) => {
            const dateValue = row.getValue("created_at")
            if (!dateValue) return "未知时间"
            return new Date(dateValue as string).toLocaleString()
        },
    },
]