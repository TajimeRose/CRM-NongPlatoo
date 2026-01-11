# Flask API Routes for Admin Panel and Telemetry
# Copy this to your Flask backend

from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
from sqlalchemy import func, desc
from user_agents import parse as parse_user_agent
from functools import wraps

# Assuming you have these imports from your Flask app
# from app import db
# from models import User, Place, SystemConfig, UserActivityLog, SecurityLog, ChatHistory, UserRole

admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')
telemetry_bp = Blueprint('telemetry', __name__, url_prefix='/api')


# ==================== MIDDLEWARE ====================

def admin_required(f):
    """Decorator to require admin role"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Get current user from session/token
        # user = get_current_user()
        # if not user or user.role != UserRole.admin:
        #     return jsonify({'error': 'Admin access required'}), 403
        return f(*args, **kwargs)
    return decorated_function


# ==================== TELEMETRY ROUTES ====================

@telemetry_bp.route('/track', methods=['POST'])
def track_events():
    """
    Universal tracking endpoint
    Receives user actions and stores in user_activity_logs
    """
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        events = data.get('events', [])
        
        # Parse User-Agent
        user_agent_string = request.headers.get('User-Agent', '')
        user_agent = parse_user_agent(user_agent_string)
        
        browser = user_agent.browser.family
        os = user_agent.os.family
        device_type = 'mobile' if user_agent.is_mobile else ('tablet' if user_agent.is_tablet else 'desktop')
        
        # Get IP address
        ip_address = request.headers.get('X-Forwarded-For', request.remote_addr)
        if ip_address:
            ip_address = ip_address.split(',')[0].strip()
        
        for event in events:
            log = UserActivityLog(
                user_id=user_id,
                action_type=event.get('action_type'),
                target_element=event.get('target_element'),
                page_url=event.get('page_url'),
                meta_data=event.get('meta_data'),
                ip_address=ip_address,
                user_agent=user_agent_string,
                browser=browser,
                os=os,
                device_type=device_type,
                created_at=datetime.fromisoformat(event.get('timestamp', datetime.utcnow().isoformat()))
            )
            db.session.add(log)
        
        db.session.commit()
        return jsonify({'success': True, 'tracked': len(events)}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# ==================== DASHBOARD ANALYTICS ====================

@admin_bp.route('/analytics/overview', methods=['GET'])
@admin_required
def get_overview_stats():
    """Get overview statistics for dashboard"""
    try:
        # Time ranges
        now = datetime.utcnow()
        today = now.replace(hour=0, minute=0, second=0, microsecond=0)
        last_week = now - timedelta(days=7)
        last_month = now - timedelta(days=30)
        
        # User stats
        total_users = User.query.count()
        new_users_month = User.query.filter(User.created_at >= last_month).count()
        
        # Active users (logged in within last 24 hours)
        active_users = User.query.filter(
            User.last_login >= now - timedelta(hours=24)
        ).count()
        
        # Page views
        total_page_views = UserActivityLog.query.filter(
            UserActivityLog.action_type == 'page_view'
        ).count()
        
        page_views_today = UserActivityLog.query.filter(
            UserActivityLog.action_type == 'page_view',
            UserActivityLog.created_at >= today
        ).count()
        
        # AI stats
        total_ai_queries = ChatHistory.query.count()
        total_tokens = db.session.query(func.sum(ChatHistory.tokens_used)).scalar() or 0
        
        return jsonify({
            'total_users': total_users,
            'new_users_month': new_users_month,
            'active_users': active_users,
            'total_page_views': total_page_views,
            'page_views_today': page_views_today,
            'total_ai_queries': total_ai_queries,
            'total_tokens_used': total_tokens
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@admin_bp.route('/analytics/traffic', methods=['GET'])
@admin_required
def get_traffic_stats():
    """Get traffic breakdown by browser/OS"""
    try:
        # Browser distribution
        browser_stats = db.session.query(
            UserActivityLog.browser,
            func.count(UserActivityLog.id).label('count')
        ).filter(
            UserActivityLog.browser.isnot(None)
        ).group_by(
            UserActivityLog.browser
        ).order_by(desc('count')).limit(5).all()
        
        # OS distribution
        os_stats = db.session.query(
            UserActivityLog.os,
            func.count(UserActivityLog.id).label('count')
        ).filter(
            UserActivityLog.os.isnot(None)
        ).group_by(
            UserActivityLog.os
        ).order_by(desc('count')).limit(5).all()
        
        # Device type distribution
        device_stats = db.session.query(
            UserActivityLog.device_type,
            func.count(UserActivityLog.id).label('count')
        ).filter(
            UserActivityLog.device_type.isnot(None)
        ).group_by(
            UserActivityLog.device_type
        ).all()
        
        return jsonify({
            'browsers': [{'name': b[0], 'count': b[1]} for b in browser_stats],
            'operating_systems': [{'name': o[0], 'count': o[1]} for o in os_stats],
            'devices': [{'name': d[0], 'count': d[1]} for d in device_stats]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@admin_bp.route('/analytics/pages', methods=['GET'])
@admin_required
def get_page_views():
    """Get page view counts grouped by URL"""
    try:
        page_stats = db.session.query(
            UserActivityLog.page_url,
            func.count(UserActivityLog.id).label('views')
        ).filter(
            UserActivityLog.action_type == 'page_view'
        ).group_by(
            UserActivityLog.page_url
        ).order_by(desc('views')).limit(10).all()
        
        return jsonify({
            'pages': [{'page': p[0], 'views': p[1]} for p in page_stats]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@admin_bp.route('/analytics/ai-usage', methods=['GET'])
@admin_required
def get_ai_usage():
    """Get AI usage trends over time"""
    try:
        last_7_days = datetime.utcnow() - timedelta(days=7)
        
        daily_usage = db.session.query(
            func.date(ChatHistory.created_at).label('date'),
            func.count(ChatHistory.id).label('queries'),
            func.sum(ChatHistory.tokens_used).label('tokens')
        ).filter(
            ChatHistory.created_at >= last_7_days
        ).group_by(
            func.date(ChatHistory.created_at)
        ).order_by('date').all()
        
        return jsonify({
            'usage': [{
                'date': str(d[0]),
                'queries': d[1],
                'tokens': d[2] or 0
            } for d in daily_usage]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ==================== USER MANAGEMENT ====================

@admin_bp.route('/users', methods=['GET'])
@admin_required
def get_users():
    """List all users with pagination"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        search = request.args.get('search', '')
        
        query = User.query
        if search:
            query = query.filter(
                (User.name.ilike(f'%{search}%')) |
                (User.email.ilike(f'%{search}%'))
            )
        
        users = query.order_by(desc(User.created_at)).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'users': [{
                'id': u.id,
                'email': u.email,
                'name': u.name,
                'role': u.role.value,
                'status': u.status.value,
                'last_login': u.last_login.isoformat() if u.last_login else None,
                'created_at': u.created_at.isoformat()
            } for u in users.items],
            'total': users.total,
            'pages': users.pages,
            'current_page': page
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@admin_bp.route('/users/<int:user_id>', methods=['DELETE'])
@admin_required
def delete_user(user_id):
    """Delete a user"""
    try:
        user = User.query.get_or_404(user_id)
        db.session.delete(user)
        db.session.commit()
        return jsonify({'success': True}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@admin_bp.route('/users/<int:user_id>/ban', methods=['POST'])
@admin_required
def ban_user(user_id):
    """Ban/Unban a user"""
    try:
        user = User.query.get_or_404(user_id)
        user.status = UserStatus.banned if user.status != UserStatus.banned else UserStatus.active
        db.session.commit()
        return jsonify({'success': True, 'status': user.status.value}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# ==================== PLACES MANAGEMENT ====================

@admin_bp.route('/places', methods=['GET'])
@admin_required  
def get_places():
    """List all places with promotion status"""
    try:
        places = Place.query.order_by(
            desc(Place.is_promoted),
            desc(Place.promoted_score),
            desc(Place.views_count)
        ).all()
        
        return jsonify({
            'places': [{
                'id': p.id,
                'name': p.name,
                'category': p.category,
                'is_promoted': p.is_promoted,
                'promoted_score': p.promoted_score,
                'promotion_expiry': p.promotion_expiry.isoformat() if p.promotion_expiry else None,
                'views': p.views_count
            } for p in places]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@admin_bp.route('/places/<int:place_id>/promote', methods=['POST'])
@admin_required
def update_promotion(place_id):
    """Update place promotion settings"""
    try:
        data = request.get_json()
        place = Place.query.get_or_404(place_id)
        
        place.is_promoted = data.get('is_promoted', place.is_promoted)
        place.promoted_score = data.get('promoted_score', place.promoted_score)
        
        if data.get('promotion_expiry'):
            place.promotion_expiry = datetime.fromisoformat(data['promotion_expiry'])
        
        db.session.commit()
        return jsonify({'success': True}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# ==================== SYSTEM CONFIG ====================

@admin_bp.route('/config', methods=['GET'])
@admin_required
def get_configs():
    """Get all system configurations"""
    try:
        configs = SystemConfig.query.order_by(SystemConfig.category, SystemConfig.key).all()
        return jsonify({
            'configs': [{
                'id': c.id,
                'key': c.key,
                'value': c.value,
                'description': c.description,
                'category': c.category
            } for c in configs]
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@admin_bp.route('/config/<int:config_id>', methods=['PUT'])
@admin_required
def update_config(config_id):
    """Update a configuration value"""
    try:
        data = request.get_json()
        config = SystemConfig.query.get_or_404(config_id)
        config.value = data.get('value', config.value)
        db.session.commit()
        return jsonify({'success': True}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@admin_bp.route('/config', methods=['POST'])
@admin_required
def create_config():
    """Create a new configuration"""
    try:
        data = request.get_json()
        config = SystemConfig(
            key=data['key'],
            value=data['value'],
            description=data.get('description'),
            category=data.get('category', 'System')
        )
        db.session.add(config)
        db.session.commit()
        return jsonify({'success': True, 'id': config.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# ==================== SECURITY LOGS ====================

@admin_bp.route('/security-logs', methods=['GET'])
@admin_required
def get_security_logs():
    """Get security incident logs"""
    try:
        severity = request.args.get('severity')
        
        query = SecurityLog.query
        if severity:
            query = query.filter(SecurityLog.severity == severity)
        
        logs = query.order_by(desc(SecurityLog.created_at)).limit(100).all()
        
        return jsonify({
            'logs': [{
                'id': l.id,
                'ip': l.ip_address,
                'action': l.action,
                'severity': l.severity,
                'count': l.count,
                'blocked': l.is_blocked,
                'timestamp': l.created_at.isoformat()
            } for l in logs]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@admin_bp.route('/security-logs/<int:log_id>/block', methods=['POST'])
@admin_required
def block_ip(log_id):
    """Block/Unblock an IP"""
    try:
        log = SecurityLog.query.get_or_404(log_id)
        log.is_blocked = not log.is_blocked
        db.session.commit()
        return jsonify({'success': True, 'blocked': log.is_blocked}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# ==================== CHAT LOGS ====================

@admin_bp.route('/chat-logs', methods=['GET'])
@admin_required
def get_chat_logs():
    """Get chat history logs"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        chats = ChatHistory.query.join(User).order_by(
            desc(ChatHistory.created_at)
        ).paginate(page=page, per_page=per_page, error_out=False)
        
        return jsonify({
            'chats': [{
                'id': c.id,
                'user_id': c.user_id,
                'user_name': c.user.name,
                'messages': c.messages,
                'tokens_used': c.tokens_used,
                'created_at': c.created_at.isoformat()
            } for c in chats.items],
            'total': chats.total,
            'pages': chats.pages
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ==================== PUBLIC API (WITH MONETIZATION) ====================

@telemetry_bp.route('/places', methods=['GET'])
def get_public_places():
    """
    Public API to get places with monetization sorting
    Promoted places appear first, sorted by promoted_score
    """
    try:
        category = request.args.get('category')
        search = request.args.get('search')
        
        query = Place.query
        
        if category:
            query = query.filter(Place.category == category)
        
        if search:
            query = query.filter(Place.name.ilike(f'%{search}%'))
        
        # MONETIZATION: Sort by promotion status first, then score
        places = query.order_by(
            desc(Place.is_promoted),
            desc(Place.promoted_score),
            desc(Place.views_count)
        ).all()
        
        return jsonify({
            'places': [{
                'id': p.id,
                'name': p.name,
                'description': p.description,
                'category': p.category,
                'is_promoted': p.is_promoted  # Optional: let frontend show "Sponsored" badge
            } for p in places]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
