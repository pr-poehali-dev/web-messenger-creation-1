'''
Business: API для корпоративного мессенджера
Args: event - dict с httpMethod, body, queryStringParameters
      context - объект с request_id, function_name
Returns: HTTP response dict
'''
import json
import os
from datetime import datetime
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def handler(event, context):
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    path = event.get('queryStringParameters', {}).get('action', '')
    
    if method == 'POST' and path == 'login':
        return login(event)
    elif method == 'POST' and path == 'register':
        return register(event)
    elif method == 'GET' and path == 'user':
        return get_user_by_phone(event)
    elif method == 'PUT' and path == 'user':
        return update_user(event)
    elif method == 'GET' and path == 'chats':
        return get_chats(event)
    elif method == 'POST' and path == 'chat':
        return create_chat(event)
    elif method == 'GET' and path == 'messages':
        return get_messages(event)
    elif method == 'POST' and path == 'message':
        return send_message(event)
    elif method == 'PUT' and path == 'online':
        return update_online_status(event)
    elif method == 'GET' and path == 'admin/users':
        return admin_get_users(event)
    elif method == 'PUT' and path == 'admin/block':
        return admin_block_user(event)
    
    return {
        'statusCode': 404,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Not found'})
    }

def login(event):
    body = json.loads(event.get('body', '{}'))
    phone = body.get('phone')
    password = body.get('password')
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute(
        "SELECT * FROM users WHERE phone = %s AND password = %s",
        (phone, password)
    )
    user = cur.fetchone()
    
    if user:
        cur.execute(
            "UPDATE users SET is_online = TRUE, last_seen = CURRENT_TIMESTAMP WHERE id = %s",
            (user['id'],)
        )
        conn.commit()
        
        user_dict = dict(user)
        user_dict['last_seen'] = user_dict['last_seen'].isoformat() if user_dict['last_seen'] else None
        user_dict['created_at'] = user_dict['created_at'].isoformat() if user_dict['created_at'] else None
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'user': user_dict})
        }
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 401,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Invalid credentials'})
    }

def register(event):
    body = json.loads(event.get('body', '{}'))
    phone = body.get('phone')
    password = body.get('password')
    
    import uuid
    user_id = str(uuid.uuid4())[:8]
    username = f'user{phone[-4:]}'
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute("SELECT id FROM users WHERE phone = %s", (phone,))
    existing = cur.fetchone()
    
    if existing:
        cur.close()
        conn.close()
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'User already exists'})
        }
    
    cur.execute(
        "INSERT INTO users (id, phone, password, first_name, last_name, username, is_online) VALUES (%s, %s, %s, %s, %s, %s, TRUE) RETURNING *",
        (user_id, phone, password, 'Пользователь', '', username)
    )
    user = cur.fetchone()
    conn.commit()
    
    user_dict = dict(user)
    user_dict['last_seen'] = user_dict['last_seen'].isoformat() if user_dict['last_seen'] else None
    user_dict['created_at'] = user_dict['created_at'].isoformat() if user_dict['created_at'] else None
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 201,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'user': user_dict})
    }

def get_user_by_phone(event):
    phone = event.get('queryStringParameters', {}).get('phone')
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute("SELECT * FROM users WHERE phone = %s", (phone,))
    user = cur.fetchone()
    
    if user:
        user_dict = dict(user)
        user_dict['last_seen'] = user_dict['last_seen'].isoformat() if user_dict['last_seen'] else None
        user_dict['created_at'] = user_dict['created_at'].isoformat() if user_dict['created_at'] else None
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'user': user_dict})
        }
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 404,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'User not found'})
    }

def update_user(event):
    body = json.loads(event.get('body', '{}'))
    user_id = body.get('user_id')
    first_name = body.get('first_name')
    last_name = body.get('last_name')
    username = body.get('username')
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute(
        "UPDATE users SET first_name = %s, last_name = %s, username = %s WHERE id = %s RETURNING *",
        (first_name, last_name, username, user_id)
    )
    user = cur.fetchone()
    conn.commit()
    
    user_dict = dict(user)
    user_dict['last_seen'] = user_dict['last_seen'].isoformat() if user_dict['last_seen'] else None
    user_dict['created_at'] = user_dict['created_at'].isoformat() if user_dict['created_at'] else None
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'user': user_dict})
    }

def get_chats(event):
    user_id = event.get('queryStringParameters', {}).get('user_id')
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute("""
        SELECT c.id, c.user1_id, c.user2_id, c.created_at,
               u.id as other_user_id, u.phone, u.first_name, u.last_name, 
               u.username, u.is_developer, u.is_blocked, u.is_online, u.last_seen
        FROM chats c
        JOIN users u ON (CASE WHEN c.user1_id = %s THEN c.user2_id ELSE c.user1_id END) = u.id
        WHERE c.user1_id = %s OR c.user2_id = %s
        ORDER BY c.created_at DESC
    """, (user_id, user_id, user_id))
    
    chats = cur.fetchall()
    
    result = []
    for chat in chats:
        chat_dict = dict(chat)
        chat_dict['last_seen'] = chat_dict['last_seen'].isoformat() if chat_dict['last_seen'] else None
        chat_dict['created_at'] = chat_dict['created_at'].isoformat() if chat_dict['created_at'] else None
        result.append(chat_dict)
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'chats': result})
    }

def create_chat(event):
    body = json.loads(event.get('body', '{}'))
    user1_id = body.get('user1_id')
    user2_id = body.get('user2_id')
    
    import uuid
    chat_id = str(uuid.uuid4())[:12]
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute(
        "SELECT id FROM chats WHERE (user1_id = %s AND user2_id = %s) OR (user1_id = %s AND user2_id = %s)",
        (user1_id, user2_id, user2_id, user1_id)
    )
    existing = cur.fetchone()
    
    if existing:
        cur.close()
        conn.close()
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'chat_id': existing['id']})
        }
    
    cur.execute(
        "INSERT INTO chats (id, user1_id, user2_id) VALUES (%s, %s, %s) RETURNING id",
        (chat_id, user1_id, user2_id)
    )
    result = cur.fetchone()
    conn.commit()
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 201,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'chat_id': result['id']})
    }

def get_messages(event):
    chat_id = event.get('queryStringParameters', {}).get('chat_id')
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute(
        "SELECT * FROM messages WHERE chat_id = %s ORDER BY timestamp ASC",
        (chat_id,)
    )
    messages = cur.fetchall()
    
    result = []
    for msg in messages:
        msg_dict = dict(msg)
        msg_dict['timestamp'] = msg_dict['timestamp'].isoformat() if msg_dict['timestamp'] else None
        result.append(msg_dict)
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'messages': result})
    }

def send_message(event):
    body = json.loads(event.get('body', '{}'))
    chat_id = body.get('chat_id')
    sender_id = body.get('sender_id')
    text = body.get('text')
    
    import uuid
    message_id = str(uuid.uuid4())[:12]
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute(
        "INSERT INTO messages (id, chat_id, sender_id, text) VALUES (%s, %s, %s, %s) RETURNING *",
        (message_id, chat_id, sender_id, text)
    )
    message = cur.fetchone()
    conn.commit()
    
    msg_dict = dict(message)
    msg_dict['timestamp'] = msg_dict['timestamp'].isoformat() if msg_dict['timestamp'] else None
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 201,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'message': msg_dict})
    }

def update_online_status(event):
    body = json.loads(event.get('body', '{}'))
    user_id = body.get('user_id')
    is_online = body.get('is_online', False)
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute(
        "UPDATE users SET is_online = %s, last_seen = CURRENT_TIMESTAMP WHERE id = %s",
        (is_online, user_id)
    )
    conn.commit()
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'success': True})
    }

def admin_get_users(event):
    user_id = event.get('queryStringParameters', {}).get('user_id')
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute("SELECT is_developer FROM users WHERE id = %s", (user_id,))
    admin = cur.fetchone()
    
    if not admin or not admin['is_developer']:
        cur.close()
        conn.close()
        return {
            'statusCode': 403,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Access denied'})
        }
    
    cur.execute("SELECT * FROM users ORDER BY created_at DESC")
    users = cur.fetchall()
    
    result = []
    for user in users:
        user_dict = dict(user)
        user_dict['last_seen'] = user_dict['last_seen'].isoformat() if user_dict['last_seen'] else None
        user_dict['created_at'] = user_dict['created_at'].isoformat() if user_dict['created_at'] else None
        result.append(user_dict)
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'users': result})
    }

def admin_block_user(event):
    body = json.loads(event.get('body', '{}'))
    admin_id = body.get('admin_id')
    target_user_id = body.get('user_id')
    is_blocked = body.get('is_blocked')
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute("SELECT is_developer FROM users WHERE id = %s", (admin_id,))
    admin = cur.fetchone()
    
    if not admin or not admin['is_developer']:
        cur.close()
        conn.close()
        return {
            'statusCode': 403,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Access denied'})
        }
    
    cur.execute(
        "UPDATE users SET is_blocked = %s WHERE id = %s RETURNING *",
        (is_blocked, target_user_id)
    )
    user = cur.fetchone()
    conn.commit()
    
    user_dict = dict(user)
    user_dict['last_seen'] = user_dict['last_seen'].isoformat() if user_dict['last_seen'] else None
    user_dict['created_at'] = user_dict['created_at'].isoformat() if user_dict['created_at'] else None
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'user': user_dict})
    }
