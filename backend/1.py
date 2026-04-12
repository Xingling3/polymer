import sqlite3

def export_db_prompt(db_path):
    """直接输出数据库结构作为prompt"""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # 获取所有表
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';")
    tables = cursor.fetchall()
    
    print("=== 数据库结构 ===")
    
    for table_info in tables:
        table = table_info[0]
        print(f"\n表名: {table}")
        
        # 获取字段
        cursor.execute(f"PRAGMA table_info('{table}');")
        columns = cursor.fetchall()
        
        for col in columns:
            col_id, col_name, col_type, not_null, default_val, pk = col
            pk_mark = " (PK)" if pk > 0 else ""
            nullable = " NOT NULL" if not_null else ""
            default_str = f" DEFAULT {default_val}" if default_val else ""
            print(f"  - {col_name}: {col_type}{nullable}{default_str}{pk_mark}")
        
        # 获取外键
        cursor.execute(f"PRAGMA foreign_key_list('{table}');")
        fks = cursor.fetchall()
        
        for fk in fks:
            if len(fk) >= 5:  # 确保有足够的元素
                target_table = fk[2] if len(fk) > 2 else "unknown"
                from_col = fk[3] if len(fk) > 3 else "unknown"
                to_col = fk[4] if len(fk) > 4 else "unknown"
                print(f"  - 外键: {from_col} → {target_table}({to_col})")
    
    cursor.close()
    conn.close()

# 使用示例 - 直接运行这个
export_db_prompt("backend/test.db")