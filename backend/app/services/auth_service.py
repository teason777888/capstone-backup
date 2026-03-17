from datetime import timezone

from flask import current_app
from flask_jwt_extended import create_access_token

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
