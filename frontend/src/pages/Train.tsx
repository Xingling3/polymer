import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
    FieldLegend,
    FieldSeparator,
    FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

export default function FieldDemo() {
    return (
        <div className="w-full p-6"> {/* 移除 max-w-md，使用全宽 */}
            <div className="max-w-4xl mx-auto"> {/* 居中并设置合理的最大宽度 */}
                <form>
                    <FieldGroup>
                        <FieldSet>
                            <FieldLegend>训练模型</FieldLegend>
                            <FieldDescription>
                                All transactions are secure and encrypted
                            </FieldDescription>
                            <FieldGroup>
                                <Field>
                                    <FieldLabel htmlFor="checkout-7j9-card-name-43j">
                                        模型名称
                                    </FieldLabel>
                                    <Input
                                        id="checkout-7j9-card-name-43j"
                                        placeholder="name"
                                        required
                                    />
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="checkout-7j9-card-name-43j">
                                        模型描述
                                    </FieldLabel>
                                    <Input
                                        id="checkout-7j9-card-name-43j"
                                        placeholder="discription"
                                        required
                                    />
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="checkout-7j9-card-number-uw1">
                                        模型地址
                                    </FieldLabel>
                                    <Input
                                        id="checkout-7j9-card-number-uw1"
                                        placeholder="e:/project/models"
                                        required
                                    />
                                    <FieldDescription>
                                        输入模型的存储地址
                                    </FieldDescription>
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="checkout-7j9-card-number-uw1">
                                        训练数据地址
                                    </FieldLabel>
                                    <Input
                                        id="checkout-7j9-card-number-uw1"
                                        placeholder="e:/project/datasets"
                                        required
                                    />
                                    <FieldDescription>
                                        输入训练模型的数据集地址
                                    </FieldDescription>
                                </Field>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Field>
                                        <FieldLabel htmlFor="checkout-exp-month-ts6">
                                            Month
                                        </FieldLabel>
                                        <Select defaultValue="">
                                            <SelectTrigger id="checkout-exp-month-ts6">
                                                <SelectValue placeholder="MM" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="01">01</SelectItem>
                                                <SelectItem value="02">02</SelectItem>
                                                <SelectItem value="03">03</SelectItem>
                                                <SelectItem value="04">04</SelectItem>
                                                <SelectItem value="05">05</SelectItem>
                                                <SelectItem value="06">06</SelectItem>
                                                <SelectItem value="07">07</SelectItem>
                                                <SelectItem value="08">08</SelectItem>
                                                <SelectItem value="09">09</SelectItem>
                                                <SelectItem value="10">10</SelectItem>
                                                <SelectItem value="11">11</SelectItem>
                                                <SelectItem value="12">12</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </Field>
                                    <Field>
                                        <FieldLabel htmlFor="checkout-7j9-exp-year-f59">
                                            Year
                                        </FieldLabel>
                                        <Select defaultValue="">
                                            <SelectTrigger id="checkout-7j9-exp-year-f59">
                                                <SelectValue placeholder="YYYY" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="2024">2024</SelectItem>
                                                <SelectItem value="2025">2025</SelectItem>
                                                <SelectItem value="2026">2026</SelectItem>
                                                <SelectItem value="2027">2027</SelectItem>
                                                <SelectItem value="2028">2028</SelectItem>
                                                <SelectItem value="2029">2029</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </Field>
                                    <Field>
                                        <FieldLabel htmlFor="checkout-7j9-cvv">CVV</FieldLabel>
                                        <Input id="checkout-7j9-cvv" placeholder="123" required />
                                    </Field>
                                </div>
                            </FieldGroup>
                        </FieldSet>
                        <FieldSeparator />
                        <FieldSet>
                            <FieldLegend>Billing Address</FieldLegend>
                            <FieldDescription>
                                The billing address associated with your payment method
                            </FieldDescription>
                            <FieldGroup>
                                <Field orientation="horizontal">
                                    <Checkbox
                                        id="checkout-7j9-same-as-shipping-wgm"
                                        defaultChecked
                                    />
                                    <FieldLabel
                                        htmlFor="checkout-7j9-same-as-shipping-wgm"
                                        className="font-normal"
                                    >
                                        Same as shipping address
                                    </FieldLabel>
                                </Field>
                            </FieldGroup>
                        </FieldSet>

                        <Field orientation="horizontal">
                            <Button type="submit">Submit</Button>
                            <Button variant="outline" type="button">
                                Cancel
                            </Button>
                        </Field>
                    </FieldGroup>
                </form>
            </div>
        </div>
    )
}