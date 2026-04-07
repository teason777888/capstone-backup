from datetime import timezone
import uuid

from flask import current_app
from flask_jwt_extended import create_access_token, get_jwt_identity

from app.extensions import db
from app.models.community import Community
from app.models.community_member import CommunityMember
from app.models.user import User


def _to_utc_isoformat(value):
    if value.tzinfo is None:
        value = value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc).isoformat().replace('+00:00', 'Z')


def _expires_in_seconds():
    expires = current_app.config['JWT_ACCESS_TOKEN_EXPIRES']
    return int(expires.total_seconds()) if hasattr(expires, 'total_seconds') else int(expires)


def _parse_user_id(user_id):
    try:
        return uuid.UUID(str(user_id))
    except (TypeError, ValueError):
        return None


def get_current_user_context():
    parsed_user_id = _parse_user_id(get_jwt_identity())
    if parsed_user_id is None:
        return None, 'Invalid user identity', 401

    user = User.query.filter_by(id=parsed_user_id).first()
    if not user:
        return None, 'User not found', 404

    membership = CommunityMember.query.filter_by(user_id=user.id).first()
    if not membership:
        return None, 'Community membership not found', 404

    community = Community.query.filter_by(id=membership.community_id).first()
    if not community:
        return None, 'Community not found', 404

    return {
        'user': user,
        'membership': membership,
        'community': community,
    }, None, 200


def register_user(data):
    """
    Register a new user, create a community, and assign admin role.
    All operations run within a single transaction.

    Returns (result_dict, error_details, status_code)
    """
    email = data['email']

    if User.query.filter_by(email=email).first():
        return None, {'email': 'Email already exists'}, 400

    try:
        user = User(
            full_name=data['fullName'],
            email=email,
        )
        user.set_password(data['password'])
        db.session.add(user)
        db.session.flush()

        community = Community(
            community_name=data['communityName'],
            group_number=data.get('groupNumber'),
            disaster_type=data['disasterType'],
            region=data['region'],
            invite_code=Community.generate_invite_code(),
            created_by=user.id,
        )
        db.session.add(community)
        db.session.flush()

        membership = CommunityMember(
            user_id=user.id,
            community_id=community.id,
            role='admin',
        )
        db.session.add(membership)

        db.session.commit()

        return {
            'userId': str(user.id),
            'groupName': community.community_name,
            'inviteCode': community.invite_code,
            'createdAt': _to_utc_isoformat(user.created_at),
        }, None, 200

    except Exception:
        db.session.rollback()
        raise


def login_user(data):
    """Authenticate a user and return the documented login response payload."""
    user = User.query.filter_by(email=data['email']).first()
    if not user or not user.check_password(data['password']):
        return None, 'Invalid email or password', 401

    membership = CommunityMember.query.filter_by(user_id=user.id).first()
    role = membership.role if membership else 'member'
    expires_in = _expires_in_seconds()
    token = create_access_token(
        identity=str(user.id),
        additional_claims={
            'email': user.email,
            'role': role,
        },
    )

    return {
        'id': str(user.id),
        'name': user.full_name,
        'email': user.email,
        'role': role,
        'token': token,
        'expiresIn': expires_in,
    }, None, 200


def update_profile(data):
    context, err, status = get_current_user_context()
    if err:
        return None, err, status

    has_full_name = 'fullName' in data
    has_region = 'region' in data
    if not has_full_name and not has_region:
        return None, {'body': 'At least one updatable field is required'}, 400

    errors = {}
    full_name = None
    region = None

    if has_full_name:
        full_name = (data.get('fullName') or '').strip()
        if not full_name:
            errors['fullName'] = 'This field is required'
        elif len(full_name) > 100:
            errors['fullName'] = 'Must be at most 100 characters'

    if has_region:
        region = (data.get('region') or '').strip()
        if not region:
            errors['region'] = 'This field is required'
        elif len(region) > 200:
            errors['region'] = 'Must be at most 200 characters'

    if errors:
        return None, errors, 400

    membership = context['membership']
    if has_region and membership.role != 'admin':
        return None, 'Insufficient permissions', 403

    user = context['user']
    community = context['community']

    try:
        if has_full_name:
            user.full_name = full_name
        if has_region:
            community.region = region

        db.session.commit()

        return {
            'fullName': user.full_name,
            'region': community.region,
        }, None, 200
    except Exception:
        db.session.rollback()
        raise
