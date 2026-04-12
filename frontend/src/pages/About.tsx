import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { InlineMath, BlockMath } from "react-katex";

const GCNFullPipeline: React.FC = () => {
    return (
        <div className="max-w-5xl mx-auto p-8 space-y-12 bg-slate-50 min-h-screen">
            {/* 标题 */}
            <div className="space-y-2">
                <h1 className="text-3xl font-bold">
                    基于GCN预测聚合物玻璃化转变温度的完整流程解析
                </h1>
                <p className="text-muted-foreground">
                    从分子结构到玻璃化转变温度的端到端建模过程
                </p>
            </div>
            {/* 1. 原子特征 */}
            <Card className="bg-white border border-slate-200 shadow-sm rounded-xl border-l-4 border-l-blue-600">
                <CardHeader>
                    <CardTitle>1. 原子到向量（Atomic Feature Encoding）</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p>
                        每个原子被编码为一个特征向量，用于描述其化学属性：
                    </p>

                    <BlockMath math="h_i^{(0)} \in \mathbb{R}^d" />

                    <p>常见原子特征包括：</p>
                    <ul className="list-disc pl-6 space-y-1">
                        <li>原子类型（C, O, N, …）</li>
                        <li>杂化方式</li>
                        <li>是否为芳香原子</li>
                        <li>价电子数</li>
                    </ul>

                    <p>
                        所有节点特征组成74维初始特征矩阵：
                    </p>

                    <BlockMath math="H^{(0)} = [h_1^{(0)}, h_2^{(0)}, \dots, h_74^{(0)}]^T" />
                </CardContent>
            </Card>
            {/* 2. 分子到图 */}
            <Card className="bg-white border border-slate-200 shadow-sm rounded-xl border-l-4 border-l-emerald-600">
                <CardHeader>
                    <CardTitle>2. 从分子到图（Molecular Graph Construction）</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 leading-relaxed">
                    <p>
                        高分子通常以 <strong>SMILES</strong> 字符串或分子结构形式给出。
                        为了输入图神经网络，分子被转换为图结构：
                    </p>

                    <BlockMath math="G = (V, E)" />

                    <ul className="list-disc pl-6">
                        <li>
                            <InlineMath math="V" />：原子集合（节点）
                        </li>
                        <li>
                            <InlineMath math="E" />：化学键集合（边）
                        </li>
                    </ul>

                    <p>
                        该步骤通常由 <strong>RDKit</strong> 完成，并由
                        <strong>DGL</strong> 构建图数据结构。
                    </p>
                </CardContent>
            </Card>




            {/* 3. GCN 层 */}
            <Card className="bg-white border border-slate-200 shadow-sm rounded-xl border-l-4 border-l-amber-600">
                <CardHeader>
                    <CardTitle>3. 图卷积层（Graph Convolution Layers）</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <p>
                        GCN 的核心是 <strong>信息传播（Message Passing）</strong>：
                        每个节点通过聚合邻居节点的信息来更新自身表示。
                    </p>

                    <Separator />

                    <div className="space-y-4">
                        <h4 className="font-semibold">3.1 归一化处理</h4>

                        <p>为防止梯度爆炸并提升训练稳定性，采用<strong>对称归一化</strong>：</p>

                        <BlockMath math="\text{norm}_{ij} = \frac{1}{\sqrt{d_i d_j}}" />

                        <p>其中：</p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li><InlineMath math="d_i, d_j" />：节点 <InlineMath math="i" /> 和 <InlineMath math="j" /> 的度（邻居数）</li>
                            <li>归一化因子平衡了不同度数节点的影响</li>
                            <li>防止高度数节点主导信息传播</li>
                        </ul>

                        <div className="bg-slate-50 p-4 rounded-md">
                            <p className="font-mono text-sm"># DGL 框架中自动实现的归一化</p>
                            <p className="font-mono text-sm"># GraphConv 层内部包含对称归一化</p>
                        </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                        <h4 className="font-semibold">3.2 矩阵形式实现</h4>

                        <p>标准 GCN 层的矩阵形式为：</p>

                        <BlockMath
                            math="H^{(l+1)} = \sigma\left(\tilde{D}^{-1/2} \tilde{A} \tilde{D}^{-1/2} H^{(l)} W^{(l)}\right)"
                        />

                        <ul className="list-disc pl-6 space-y-2">
                            <li>
                                <InlineMath math="\tilde{A} = A + I" />：加入自环的邻接矩阵
                                <p className="text-sm text-muted-foreground pl-4">
                                    允许节点保留自身信息，防止信息丢失
                                </p>
                            </li>
                            <li>
                                <InlineMath math="\tilde{D}" />：度矩阵，对角元素 <InlineMath math="\tilde{D}_{ii} = \sum_j \tilde{A}_{ij}" />
                                <p className="text-sm text-muted-foreground pl-4">
                                    用于归一化，平衡不同度数节点的影响
                                </p>
                            </li>
                            <li>
                                <InlineMath math="W^{(l)} \in \mathbb{R}^{d_{\text{in}} \times d_{\text{out}}}" />：第 <InlineMath math="l" /> 层可学习权重矩阵
                            </li>
                            <li>
                                <InlineMath math="\sigma(\cdot)" />：非线性激活函数（ReLU）
                                <BlockMath math="\text{ReLU}(x) = \max(0, x)" />
                            </li>
                        </ul>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                        <h4 className="font-semibold">3.3 节点视角计算</h4>

                        <p>从单个节点的角度，更新公式为：</p>

                        <BlockMath
                            math="h_i^{(l+1)} = \sigma\left( \sum_{j \in \mathcal{N}(i) \cup \{i\}} \frac{1}{\sqrt{\tilde{d}_i \tilde{d}_j}} h_j^{(l)} W^{(l)} \right)"
                        />

                        <p>计算步骤分解：</p>
                        <ol className="list-decimal pl-6 space-y-2">
                            <li>
                                <strong>聚合邻居信息</strong>：收集所有邻居节点的特征
                                <InlineMath math="\{h_j^{(l)} | j \in \mathcal{N}(i)\}" />
                            </li>
                            <li>
                                <strong>添加自环</strong>：包含节点自身特征 <InlineMath math="h_i^{(l)}" />
                            </li>
                            <li>
                                <strong>对称归一化</strong>：应用归一化因子 <InlineMath math="1/\sqrt{\tilde{d}_i \tilde{d}_j}" />
                            </li>
                            <li>
                                <strong>线性变换</strong>：乘以权重矩阵 <InlineMath math="W^{(l)}" />
                            </li>
                            <li>
                                <strong>非线性激活</strong>：应用 ReLU 函数
                            </li>
                        </ol>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                        <h4 className="font-semibold">3.4 本模型架构</h4>

                        <p>在我们的实现中（model_GNN.py）：</p>

                        <div className="space-y-2">
                            <div className="bg-slate-50 p-3 rounded-md">
                                <p className="font-mono text-sm"># 标准 GCNReg 模型</p>
                                <p className="font-mono text-sm">self.conv1 = GraphConv(in_dim, hidden_dim)</p>
                                <p className="font-mono text-sm">self.conv2 = GraphConv(hidden_dim, hidden_dim)</p>
                                <p className="font-mono text-sm">h1 = F.relu(self.conv1(g, h))</p>
                                <p className="font-mono text-sm">h1 = F.relu(self.conv2(g, h1))</p>
                            </div>

                            <ul className="list-disc pl-6 space-y-1">
                                <li>默认使用 <strong>2 层图卷积</strong></li>
                                <li>每层后接 ReLU 激活函数</li>
                                <li>隐藏层维度可配置（如 256）</li>
                                <li>支持堆叠更多层（GCNReg_3gc）或减少层数（GCNReg_1gc）</li>
                            </ul>
                        </div>

                        <p className="text-sm text-muted-foreground">
                            <em>注意：多层 GCN 使节点能感知更远距离的结构信息，但层数过多可能导致过平滑问题。</em>
                        </p>
                    </div>
                </CardContent>
            </Card>


            {/* 4. Pooling */}
            <Card className="bg-white border border-slate-200 shadow-sm rounded-xl border-l-4 border-l-violet-600">
                <CardHeader>
                    <CardTitle>4. 池化层（Graph Pooling / Readout）</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <p>
                        GCN 输出的是 <strong>节点级特征</strong>，而 Tg 是
                        <strong>图级性质</strong>，因此需要将节点特征聚合为图表示。
                    </p>

                    <Separator />

                    <div className="space-y-4">
                        <p>本模型采用<strong>平均池化（Average Pooling）</strong>：</p>

                        <BlockMath math="h_G = \frac{1}{|V|} \sum_{i=1}^{|V|} h_i^{(L)} \in \mathbb{R}^{d_{\text{hidden}}}" />

                        <p>其中：</p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li><InlineMath math="|V|" />：图中节点总数（原子数）</li>
                            <li><InlineMath math="h_i^{(L)}" />：第 <InlineMath math="L" /> 层 GCN 后的节点特征</li>
                            <li><InlineMath math="d_{\text{hidden}}" />：隐藏层维度（如 256）</li>
                        </ul>

                        <div className="bg-slate-50 p-4 rounded-md mt-2">
                            <p className="font-mono text-sm"># model_GNN.py 中的实现</p>
                            <p className="font-mono text-sm">hg = dgl.mean_nodes(g, 'h')</p>
                        </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                        <h4 className="font-semibold">数学性质</h4>

                        <div className="space-y-2">
                            <p><strong>排列不变性：</strong></p>
                            <BlockMath math="\text{Permute}(V) \Rightarrow h_G \text{ 不变}" />
                            <p className="text-sm text-muted-foreground">
                                节点顺序不影响池化结果，适合图结构数据。
                            </p>
                        </div>

                        <div className="space-y-2">
                            <p><strong>尺寸不变性：</strong></p>
                            <BlockMath math="\dim(h_G) = d_{\text{hidden}} \quad (\text{与 } |V| \text{ 无关})" />
                            <p className="text-sm text-muted-foreground">
                                输出固定维度向量，便于后续处理不同大小的分子。
                            </p>
                        </div>
                    </div>

                    <Separator />

                    <div>
                        <p>
                            得到的 <InlineMath math="h_G" /> 是一个
                            <strong>固定长度的分子向量</strong>，与分子大小无关，可直接输入全连接网络进行回归预测。
                        </p>

                    </div>
                </CardContent>
            </Card>

            {/* 5. 全连接预测 */}
            <Card className="bg-white border border-slate-200 shadow-sm rounded-xl border-l-4 border-l-rose-600">
                <CardHeader>
                    <CardTitle>5. 全连接网络与 Tg 预测</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p>
                        图级向量随后被输入到全连接神经网络中，用于回归预测 Tg：
                    </p>

                    <BlockMath math="z = \mathrm{ReLU}(W_1 h_G + b_1)" />
                    <BlockMath math="\hat{T}_g = W_2 z + b_2" />

                    <p>
                        标准GCNReg模型包含3层全连接网络：
                    </p>

                    <BlockMath math="z_1 = \text{ReLU}(W_1 h_G + b_1)" />
                    <BlockMath math="z_2 = \text{ReLU}(W_2 z_1 + b_2)" />
                    <BlockMath math="\hat{y} = W_3 z_2 + b_3" />

                    <p>其中：</p>
                    <ul className="list-disc pl-6 space-y-1">
                        <li><InlineMath math="W_1, W_2 \in \mathbb{R}^{d_{\text{hidden}} \times d_{\text{hidden}}}" /></li>
                        <li><InlineMath math="W_3 \in \mathbb{R}^{d_{\text{hidden}} \times 1}" /></li>
                        <li><InlineMath math="b_1, b_2 \in \mathbb{R}^{d_{\text{hidden}}}" /></li>
                        <li><InlineMath math="b_3 \in \mathbb{R}" /></li>
                    </ul>

                    <p>激活函数使用ReLU：</p>
                    <BlockMath math="\text{ReLU}(x) = \max(0, x)" />

                    <p>对于回归任务，输出层不使用激活函数。</p>
                </CardContent>
            </Card>

            {/* 6. 训练目标 */}
            <Card className="bg-white border border-slate-200 shadow-sm rounded-xl border-l-4 border-l-red-600">
                <CardHeader>
                    <CardTitle>6. 模型训练与优化目标</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p>
                        模型以实验测得的 Tg 作为监督信号，使用均方误差损失函数：
                    </p>

                    <BlockMath math="\mathcal{L} = \frac{1}{N} \sum_{i=1}^N (\hat{T}_{g,i} - T_{g,i})^2" />

                    <p>
                        参数通过 Adam 优化器进行更新，训练过程中采用早停策略以防止过拟合。
                    </p>
                </CardContent>
            </Card>


            {/* 7 模型训练与验证流程 */}
            <Card className="bg-white border border-slate-200 shadow-sm rounded-xl border-l-4 border-l-indigo-600">
                <CardHeader>
                    <CardTitle>7 模型训练与验证流程</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 leading-relaxed">
                    <p>
                        我们使用 <strong>交叉验证（K-Fold CV）</strong> 或 <strong>固定训练/测试集划分</strong> 进行模型评估，具体流程如下：
                    </p>

                    <ul className="list-disc pl-6 space-y-2">
                        <li>
                            <strong>数据预处理</strong>：
                            <ul className="list-circle pl-6 mt-1">
                                <li>从 CSV 文件中读取 SMILES 字符串与对应标签（如 Tg 或 logCMC）</li>
                                <li>使用 RDKit 转换为 DGL 图，并采用 CanonicalAtomFeaturizer 编码原子特征</li>
                                <li>支持单原子特征（原子序数）或完整原子特征（74 维）</li>
                            </ul>
                        </li>
                        <li>
                            <strong>训练过程</strong>：
                            <ul className="list-circle pl-6 mt-1">
                                <li>使用 Adam 优化器，初始学习率可调（如 0.005）</li>
                                <li>损失函数为均方误差（MSE）</li>
                                <li>支持早停策略（Early Stopping）防止过拟合</li>
                                <li>支持 TensorBoard 记录训练/验证损失、RMSE 等指标</li>
                            </ul>
                        </li>
                        <li>
                            <strong>测试与可视化</strong>：
                            <ul className="list-circle pl-6 mt-1">
                                <li>对训练集、验证集、测试集分别进行预测</li>
                                <li>保存预测结果与梯度显著性映射（.pickle 格式）</li>
                                <li>支持模型检查点保存与加载</li>
                            </ul>
                        </li>
                    </ul>

                    <p>
                        整个训练脚本（<code>workflow_test.py</code>）支持多种命令行参数配置，包括：
                    </p>

                    <div className="bg-slate-50 p-4 rounded-md text-sm font-mono">
                        <div>--epochs 500 # 总训练轮数</div>
                        <div>--batch_size 5 # 批大小</div>
                        <div>--lr 0.005 # 学习率</div>
                        <div>--cv 5 # K 折交叉验证</div>
                        <div>--unit_per_layer 256 # 隐藏层维度</div>
                        <div>--gnn_model GCNReg # 选择模型变体</div>
                        <div>--early_stop # 启用早停</div>
                    </div>
                </CardContent>
            </Card>

            {/* 3.3 端到端流程总结（图示化） */}
            <Card className="bg-white border border-slate-200 shadow-sm rounded-xl border-l-4 border-l-slate-600">
                <CardHeader>
                    <CardTitle>8. 全流程总结</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 leading-relaxed">
                    <p>
                        整个 GCN 预测流程可以概括为以下步骤：
                    </p>

                    <div className="bg-slate-100 p-6 rounded-lg text-center font-mono text-sm">
                        <div className="grid grid-cols-6 gap-2 items-center">
                            <div className="p-3 bg-blue-100 rounded">SMILES</div>
                            <div className="text-xl">→</div>
                            <div className="p-3 bg-green-100 rounded">RDKit → DGL Graph</div>
                            <div className="text-xl">→</div>
                            <div className="p-3 bg-yellow-100 rounded">GCN Layers</div>
                            <div className="text-xl">→</div>
                            <div className="p-3 bg-purple-100 rounded">Mean Pooling</div>
                            <div className="text-xl">→</div>
                            <div className="p-3 bg-red-100 rounded">MLP → Prediction</div>
                        </div>
                    </div>

                    <p>
                        该模型能够自动学习从分子结构到宏观性质的复杂映射，无需人工设计特征，适用于多种聚合物或小分子性质预测任务。
                    </p>

                    <p className="text-sm text-muted-foreground">
                        <em>注：代码中支持多种数据集划分方式（随机划分、固定测试集、非离子表面活性剂专用集等），并可通过 <code>--dataset</code> 参数选择。</em>
                    </p>
                </CardContent>
            </Card>

        </div>
    );
};

export default GCNFullPipeline;
