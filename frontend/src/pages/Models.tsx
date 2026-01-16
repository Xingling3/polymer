import { Button } from "@/components/ui/button"
import {
    Item,
    ItemActions,
    ItemContent,
    ItemDescription,
    ItemTitle,
} from "@/components/ui/item"

export default function ItemVariant() {
    return (
        <div className="flex flex-col gap-6">
            <Item>
                <ItemContent>
                    <ItemTitle>模型1</ItemTitle>
                    <ItemDescription>
                        这是训练的第一个模型.
                    </ItemDescription>
                </ItemContent>
                <ItemActions>
                    <Button variant="outline" size="sm">
                        Delete
                    </Button>
                </ItemActions>
            </Item>
            <Item variant="outline">
                <ItemContent>
                    <ItemTitle>模型2</ItemTitle>
                    <ItemDescription>
                        这是用来测试的模型
                    </ItemDescription>
                </ItemContent>
                <ItemActions>
                    <Button variant="outline" size="sm">
                        Delete
                    </Button>
                </ItemActions>
            </Item>
            <Item variant="muted">
                <ItemContent>
                    <ItemTitle>模型3</ItemTitle>
                    <ItemDescription>
                        这是备用模型
                    </ItemDescription>
                </ItemContent>
                <ItemActions>
                    <Button variant="outline" size="sm">
                        Delete
                    </Button>
                </ItemActions>
            </Item>
        </div>
    )
}
