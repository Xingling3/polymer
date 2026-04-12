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
import { useState } from "react"
interface TrainingConfig {
    model_name: string
    model_description: string
    model_save_path: string
    train_data_path: string
    test_data_path: string
    epochs: number
    batch_size: number
    learning_rate: number
    cv_folds: number
    hidden_units: number
    use_cv: boolean
    use_early_stop: boolean
    patience: number
    dataset_type: string
    random_split: boolean
    test_size: number
    seed: number
}
export default function FieldDemo() {
    const [config, setConfig] = useState<TrainingConfig>({
        model_name: "",
        model_description: "",
        model_save_path: "../gnn_logs",
        train_data_path: "data_train.csv",
        test_data_path: "",
        epochs: 500,
        batch_size: 5,
        learning_rate: 0.005,
        cv_folds: 5,
        hidden_units: 256,
        use_cv: true,
        use_early_stop: true,
        patience: 30,
        dataset_type: "nonionic",
        random_split: false,
        test_size: 0.1,
        seed: 2020,
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await fetch("http://localhost:8000/api/train_config", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify(config),
            });

            if (response.ok) {
                alert("训练配置已保存");
            } else {
                const error = await response.json();
                alert(`保存失败: ${error.detail}`);
            }
        } catch (error) {
            console.error(error);
            alert("网络错误");
        }
    };


    return (

        <div className="w-full p-6"> {/* 移除 max-w-md，使用全宽 */}
            <div className="max-w-4xl mx-auto"> {/* 居中并设置合理的最大宽度 */}
                <form onSubmit={handleSubmit}>
                    <FieldGroup>
                        <FieldSet>
                            <FieldLegend>训练模型配置</FieldLegend>
                            <FieldDescription>
                                配置GNN模型训练参数，点击提交后将在后端开始训练
                            </FieldDescription>

                            <FieldGroup className="space-y-4">
                                {/* 基础信息 */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Field>
                                        <FieldLabel htmlFor="model_name">模型名称 *</FieldLabel>
                                        <Input
                                            id="model_name"
                                            name="model_name"
                                            placeholder="例如：GCN_CMC_Predictor"
                                            value={config.model_name}
                                            onChange={(e) => setConfig({ ...config, model_name: e.target.value })}
                                            required
                                        />
                                    </Field>

                                    <Field>
                                        <FieldLabel htmlFor="model_description">模型描述</FieldLabel>
                                        <Input
                                            id="model_description"
                                            name="model_description"
                                            placeholder="模型用途说明"
                                            value={config.model_description}
                                            onChange={(e) => setConfig({ ...config, model_description: e.target.value })}

                                        />
                                    </Field>
                                </div>

                                {/* 路径配置 */}
                                <Field>
                                    <FieldLabel htmlFor="model_save_path">模型保存路径 *</FieldLabel>
                                    <Input
                                        id="model_save_path"
                                        name="model_save_path"
                                        placeholder="例如：../gnn_logs"
                                        value={config.model_save_path}
                                        onChange={(e) => setConfig({ ...config, model_save_path: e.target.value })}

                                        required
                                    />
                                    <FieldDescription>
                                        训练好的模型将保存到此目录
                                    </FieldDescription>
                                </Field>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Field>
                                        <FieldLabel htmlFor="train_data_path">训练集路径 *</FieldLabel>
                                        <Input
                                            id="train_data_path"
                                            name="train_data_path"
                                            placeholder="例如：data_train.csv"
                                            value={config.train_data_path}
                                            onChange={(e) => setConfig({ ...config, train_data_path: e.target.value })}

                                            required
                                        />
                                        <FieldDescription>
                                            CSV格式训练数据路径
                                        </FieldDescription>
                                    </Field>

                                    <Field>
                                        <FieldLabel htmlFor="test_data_path">测试集路径</FieldLabel>
                                        <Input
                                            id="test_data_path"
                                            name="test_data_path"
                                            placeholder="留空则使用内置划分"
                                            value={config.test_data_path}
                                            onChange={(e) => setConfig({ ...config, test_data_path: e.target.value })}

                                        />
                                        <FieldDescription>
                                            可选，如果为空则根据dataset_type自动划分
                                        </FieldDescription>
                                    </Field>
                                </div>

                                {/* 超参数配置 */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <Field>
                                        <FieldLabel htmlFor="epochs">训练轮数</FieldLabel>
                                        <Input
                                            id="epochs"
                                            name="epochs"
                                            type="number"
                                            value={config.epochs}
                                            onChange={(e) => setConfig({ ...config, epochs: parseInt(e.target.value) })}

                                        />
                                    </Field>

                                    <Field>
                                        <FieldLabel htmlFor="batch_size">批大小</FieldLabel>
                                        <Input
                                            id="batch_size"
                                            name="batch_size"
                                            type="number"
                                            value={config.batch_size}
                                            onChange={(e) => setConfig({ ...config, batch_size: parseInt(e.target.value) })}

                                        />
                                    </Field>

                                    <Field>
                                        <FieldLabel htmlFor="learning_rate">学习率</FieldLabel>
                                        <Input
                                            id="learning_rate"
                                            name="learning_rate"
                                            type="number"
                                            step="0.0001"
                                            value={config.learning_rate}
                                            onChange={(e) => setConfig({ ...config, learning_rate: parseFloat(e.target.value) })}

                                        />
                                    </Field>

                                    <Field>
                                        <FieldLabel htmlFor="hidden_units">隐藏层维度</FieldLabel>
                                        <Input
                                            id="hidden_units"
                                            name="hidden_units"
                                            type="number"
                                            value={config.hidden_units}
                                            onChange={(e) => setConfig({ ...config, hidden_units: parseInt(e.target.value) })}

                                        />
                                    </Field>
                                </div>

                                {/* 交叉验证设置 */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Field>
                                        <FieldLabel htmlFor="cv_folds">交叉验证折数</FieldLabel>
                                        <Input
                                            id="cv_folds"
                                            name="cv_folds"
                                            type="number"
                                            value={config.cv_folds}
                                            onChange={(e) => setConfig({ ...config, cv_folds: parseInt(e.target.value) })}

                                        />
                                    </Field>

                                    <Field>
                                        <FieldLabel htmlFor="test_size">测试集比例</FieldLabel>
                                        <Input
                                            id="test_size"
                                            name="test_size"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            max="1"
                                            value={config.test_size}
                                            onChange={(e) => setConfig({ ...config, test_size: parseFloat(e.target.value) })}

                                        />
                                    </Field>
                                    <Field>
                                        <FieldLabel htmlFor="patience">早停耐心值</FieldLabel>
                                        <Input
                                            id="patience"
                                            name="patience"
                                            type="number"
                                            value={config.patience}
                                            onChange={(e) => setConfig({ ...config, patience: parseInt(e.target.value) })}

                                        />
                                    </Field>


                                </div>



                                {/* 复选框配置 */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
                                    <Field orientation="horizontal">
                                        <input
                                            type="checkbox"
                                            id="use_cv"
                                            checked={config.use_cv}
                                            onChange={(e) => setConfig({ ...config, use_cv: e.target.checked })}

                                            className="mr-2"
                                        />
                                        <FieldLabel htmlFor="use_cv" className="font-normal">
                                            使用交叉验证
                                        </FieldLabel>
                                    </Field>

                                    <Field orientation="horizontal">
                                        <input
                                            type="checkbox"
                                            id="use_early_stop"
                                            checked={config.use_early_stop}
                                            onChange={(e) => setConfig({ ...config, use_early_stop: e.target.checked })}

                                            className="mr-2"
                                        />
                                        <FieldLabel htmlFor="use_early_stop" className="font-normal">
                                            使用早停
                                        </FieldLabel>
                                    </Field>

                                    <Field orientation="horizontal">
                                        <input
                                            type="checkbox"
                                            id="random_split"
                                            checked={config.random_split}
                                            onChange={(e) => setConfig({ ...config, random_split: e.target.checked })}

                                            className="mr-2"
                                        />
                                        <FieldLabel htmlFor="random_split" className="font-normal">
                                            随机划分
                                        </FieldLabel>
                                    </Field>
                                </div>
                            </FieldGroup>
                        </FieldSet>

                        <FieldSeparator />

                        <Field orientation="horizontal" className="justify-end space-x-4 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => window.history.back()}
                            >
                                取消
                            </Button>
                            <Button
                                type="submit"

                            >
                                训练
                            </Button>
                        </Field>
                    </FieldGroup>
                </form>
            </div>
        </div>
    )
}