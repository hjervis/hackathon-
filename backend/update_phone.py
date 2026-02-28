#!/usr/bin/env python3
import pymysql

try:
    conn = pymysql.connect(
        host='localhost',
        user='root',
        password='yacht1lrk',
        database='publicsafety_db'
    )
    cur = conn.cursor()
    cur.execute('UPDATE users SET phone="9495620239" WHERE id=1;')
    conn.commit()
    print('✅ Phone number updated successfully for user ID 1')
    cur.close()
    conn.close()
except Exception as e:
    print(f'❌ Error: {e}')
