# filter_smiles_simple.py
"""
简单过滤无效SMILES数据的脚本
将直接删除data_train.csv中的无效SMILES，保存为data_train_filtered.csv
"""

import csv
import os
from rdkit import Chem


def filter_smiles_simple():
    """
    过滤CSV文件中的无效SMILES，直接删除无效行
    """

    input_file = "data_train.csv"
    output_file = "data_train_filtered.csv"

    # 检查输入文件是否存在
    if not os.path.exists(input_file):
        print(f"错误：输入文件 '{input_file}' 不存在！")
        print(f"请确保 {input_file} 在当前目录: {os.getcwd()}")
        return

    print(f"开始过滤文件: {input_file}")
    print("-" * 50)

    valid_rows = []
    invalid_rows = []
    total_rows = 0

    # 读取CSV文件
    with open(input_file, 'r', encoding='utf-8') as csvfile:
        # 尝试检测分隔符
        sample = csvfile.read(1024)
        csvfile.seek(0)

        # 检测分隔符
        if ',' in sample:
            delimiter = ','
            print("检测到分隔符: 逗号 (,)")
        elif ';' in sample:
            delimiter = ';'
            print("检测到分隔符: 分号 (;)")
        elif '\t' in sample:
            delimiter = '\t'
            print("检测到分隔符: 制表符 (\\t)")
        else:
            delimiter = ','  # 默认
            print("使用默认分隔符: 逗号 (,)")

        reader = csv.reader(csvfile, delimiter=delimiter)

        for row_num, row in enumerate(reader, 1):
            total_rows += 1

            # 跳过空行
            if not row or all(cell.strip() == '' for cell in row):
                print(f"行 {row_num}: 跳过空行")
                continue

            # 检查是否有足够的列
            if len(row) < 2:
                invalid_rows.append((row_num, row, "列数不足"))
                print(f"行 {row_num}: 无效 - 列数不足 ({len(row)}列)")
                continue

            smiles = row[0].strip()
            label_str = row[1].strip()

            # 检查标签是否为有效数字
            try:
                label = float(label_str)
            except ValueError:
                invalid_rows.append((row_num, row, f"无效标签: {label_str}"))
                print(f"行 {row_num}: 无效 - 标签不是有效数字: '{label_str}'")
                continue

            # 检查SMILES有效性
            if not smiles:  # 空SMILES
                invalid_rows.append((row_num, row, "空SMILES"))
                print(f"行 {row_num}: 无效 - SMILES为空")
                continue

            # 使用RDKit检查SMILES
            mol = Chem.MolFromSmiles(smiles)
            if mol is None:
                invalid_rows.append((row_num, row, "无效SMILES"))
                print(f"行 {row_num}: 无效SMILES - '{smiles}'")
            else:
                valid_rows.append([smiles, label_str])

    # 保存过滤后的数据
    with open(output_file, 'w', encoding='utf-8', newline='') as csvfile:
        writer = csv.writer(csvfile, delimiter=',')
        for row in valid_rows:
            writer.writerow(row)

    # 打印统计信息
    print("\n" + "=" * 50)
    print("过滤完成！")
    print(f"原始数据行数: {total_rows}")
    print(f"有效数据行数: {len(valid_rows)}")
    print(f"无效数据行数: {len(invalid_rows)}")
    print(f"保留比例: {len(valid_rows) / total_rows * 100:.1f}%")
    print(f"输出文件: {output_file}")

    # 显示无效行的详细信息
    if invalid_rows:
        print("\n无效数据行详细信息:")
        print("-" * 50)
        for row_num, row, reason in invalid_rows[:20]:  # 只显示前20个
            row_preview = str(row)[:50] + "..." if len(str(row)) > 50 else str(row)
            print(f"行 {row_num}: {reason} - {row_preview}")

        if len(invalid_rows) > 20:
            print(f"... 还有 {len(invalid_rows) - 20} 个无效行未显示")

    # 显示第110行的情况（根据你的错误信息）
    print("\n" + "=" * 50)
    print("检查第110行数据:")
    print("-" * 50)

    # 重新读取原始文件查看第110行
    with open(input_file, 'r', encoding='utf-8') as csvfile:
        reader = csv.reader(csvfile, delimiter=delimiter)
        rows = list(reader)

        if len(rows) >= 110:
            row_110 = rows[109]  # 索引从0开始
            print(f"原始第110行数据: {row_110}")

            if len(row_110) >= 1:
                smiles_110 = row_110[0].strip()
                print(f"SMILES: '{smiles_110}'")

                # 检查有效性
                mol = Chem.MolFromSmiles(smiles_110)
                if mol is None:
                    print("状态: 无效（已被过滤）")
                else:
                    print("状态: 有效")
        else:
            print(f"文件只有 {len(rows)} 行，没有第110行")

    # 创建修复说明文件
    with open("filter_report.txt", 'w', encoding='utf-8') as report:
        report.write(f"数据过滤报告\n")
        report.write(f"=" * 50 + "\n")
        report.write(f"输入文件: {input_file}\n")
        report.write(f"输出文件: {output_file}\n")
        report.write(f"原始行数: {total_rows}\n")
        report.write(f"有效行数: {len(valid_rows)}\n")
        report.write(f"无效行数: {len(invalid_rows)}\n")
        report.write(f"保留比例: {len(valid_rows) / total_rows * 100:.1f}%\n\n")

        if invalid_rows:
            report.write("无效数据行列表:\n")
            report.write("-" * 50 + "\n")
            for row_num, row, reason in invalid_rows:
                report.write(f"行 {row_num}: {reason} - {row}\n")

    print(f"\n详细报告已保存到: filter_report.txt")
    print("=" * 50)


if __name__ == "__main__":
    # 检查RDKit是否可用
    try:
        from rdkit import Chem

        print("RDKit导入成功")
    except ImportError:
        print("错误: 无法导入RDKit")
        print("请确保已安装RDKit: pip install rdkit")
        exit(1)

    # 运行过滤
    filter_smiles_simple()

    # 提示下一步操作
    print("\n" + "=" * 50)
    print("下一步操作:")
    print("1. 修改 workflow_test1.py 第307行:")
    print('   将 with open("data_train.csv") as csvDataFile:')
    print('   改为 with open("data_train_filtered.csv") as csvDataFile:')
    print("\n2. 运行训练命令:")
    print('   python workflow_test1.py --train --skip_cv')
    print("=" * 50)