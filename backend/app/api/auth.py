from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required

from app.services.auth_service import login_user, register_user, update_profile
from app.utils.response import error_response, success_response
from app.utils.validators import validate_email, validate_password, validate_required_fields

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json(silent=True)
    if data is None:
        return error_response('Validation failed', 400, details={'body': 'Request body is required'})

    required = ['fullName', 'email', 'password', 'communityName', 'disasterType', 'region']
    missing = validate_required_fields(data, required)
    if missing:
        return error_response(
            'Validation failed',
            400,
            details={field: 'This field is required' for field in missing},
        )

    if not validate_email(data['email']):
        return error_response(
            'Validation failed',
            400,
            details={'email': 'Must be a valid email address'},
        )

    valid, msg = validate_password(data['password'])
    if not valid:
        return error_response(
            'Validation failed',
            400,
            details={'password': msg},
        )

    result, err, status = register_user(data)
    if err:
        return error_response('Validation failed', status, details=err)

    return success_response(result, 'Registration successful', status)


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json(silent=True)
    if data is None:
        return error_response('Validation failed', 400, details={'body': 'Request body is required'})

    required = ['email', 'password']
    missing = validate_required_fields(data, required)
    if missing:
        return error_response(
            'Validation failed',
            400,
            details={field: 'This field is required' for field in missing},
        )

    if not validate_email(data['email']):
        return error_response(
            'Validation failed',
            400,
            details={'email': 'Must be a valid email address'},
        )

    result, err, status = login_user(data)
    if err:
        return error_response(err, status)

    return jsonify({'success': True, 'data': result}), status


@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def profile():
    data = request.get_json(silent=True)
    if data is None:
        return error_response('Validation failed', 400, details={'body': 'Request body is required'})
    if not isinstance(data, dict):
        return error_response('Validation failed', 400, details={'body': 'Request body must be a JSON object'})

    result, err, status = update_profile(data)
    if err:
        if isinstance(err, dict):
            return error_response('Validation failed', status, details=err)
        return error_response(err, status)

    return success_response(result, 'Profile updated successfully', status)
