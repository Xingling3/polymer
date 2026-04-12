import React, { useEffect, useState } from "react";
import { MoleculeViewer } from "./MoleculeViewer";
import Image from "@/assets/mo.webp";
export default function MoleculePage() {
	const [smiles, setSmiles] = useState<string>("");
	const [molBlock, setMolBlock] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [props, setProps] = useState<any>(null);
	// 请求 3D 分子函数
	const fetchMol = (inputSmiles: string) => {
		if (!inputSmiles.trim()) {
			setError("请输入 SMILES");
			return;
		}

		setLoading(true);
		setError(null);
		setMolBlock(null);

		fetch("http://localhost:8000/api/mol3d", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ smiles: inputSmiles }),
		})
			.then(async (res) => {
				const data = await res.json();
				if (res.ok) return data;
				throw data;
			})
			.then((data) => {
				setMolBlock(data.mol_block);
				setProps(data.properties);
			})
			.catch(() => {
				setError("获取 3D 分子失败");
			})
			.finally(() => setLoading(false));
	};

	// 页面加载时如果 URL 有参数就自动加载
	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const urlSmiles = params.get("smiles");
		if (urlSmiles) {
			setSmiles(urlSmiles);
			fetchMol(urlSmiles);
		}
	}, []);

	return (



		<div className="p-6 max-w-3xl mx-auto space-y-6">
			<div className="relative w-full overflow-hidden rounded-3xl shadow-2xl">

				{/* 图片 */}
				<img
					src={Image}
					alt="Polymer AI Banner"
					className="w-full h-[320px] object-cover"
				/>

				{/* 渐变遮罩 */}
				<div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-transparent" />

				{/* 文字内容 */}
				<div className="absolute bottom-8 left-8 text-white">
					<h1 className="text-4xl font-bold mb-2">
						3D 分子结构
					</h1>

				</div>

			</div>


			{/* 输入区域 */}
			<div className="flex gap-3">
				<input
					type="text"
					value={smiles}
					onChange={(e) => setSmiles(e.target.value)}
					placeholder="请输入 SMILES，例如：CCO"
					className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
				/>
				<button
					onClick={() => fetchMol(smiles)}
					className="px-5 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
				>
					生成
				</button>
			</div>

			{loading && <p>加载中...</p>}
			{error && (
				<div className="p-4 bg-red-50 text-red-600 rounded-lg">
					{error}
				</div>
			)}

			{molBlock && <MoleculeViewer molBlock={molBlock} />}
			{props && (
				<div className="bg-white p-5 rounded-2xl shadow-md space-y-4">

					<h2 className="text-xl font-semibold">
						Molecular Descriptors
					</h2>

					<div className="grid grid-cols-2 gap-4">

						<div className="p-3 bg-blue-50 rounded-lg">
							<p className="text-sm text-gray-500">分子量 (g/mol)</p>
							<p className="text-lg font-semibold">
								{props.molecular_weight}
							</p>
						</div>

						<div className="p-3 bg-green-50 rounded-lg">
							<p className="text-sm text-gray-500">LogP</p>
							<p className="text-lg font-semibold">
								{props.logp}
							</p>
						</div>

						<div className="p-3 bg-purple-50 rounded-lg">
							<p className="text-sm text-gray-500">TPSA (Å²)</p>
							<p className="text-lg font-semibold">
								{props.tpsa}
							</p>
						</div>

						<div className="p-3 bg-orange-50 rounded-lg">
							<p className="text-sm text-gray-500">原子数</p>
							<p className="text-lg font-semibold">
								{props.num_atoms}
							</p>
						</div>

						<div className="p-3 bg-pink-50 rounded-lg">
							<p className="text-sm text-gray-500">HBD</p>
							<p className="text-lg font-semibold">
								{props.hbd}
							</p>
						</div>

						<div className="p-3 bg-yellow-50 rounded-lg">
							<p className="text-sm text-gray-500">HBA</p>
							<p className="text-lg font-semibold">
								{props.hba}
							</p>
						</div>

						<div className="p-3 bg-indigo-50 rounded-lg">
							<p className="text-sm text-gray-500">分子式</p>
							<p className="text-lg font-semibold">
								{props.formula}
							</p>
						</div>

						<div className="p-3 bg-red-50 rounded-lg">
							<p className="text-sm text-gray-500">可旋转键</p>
							<p className="text-lg font-semibold">
								{props.rotatable_bonds}
							</p>
						</div>

					</div>
				</div>
			)}
		</div>
	);
}