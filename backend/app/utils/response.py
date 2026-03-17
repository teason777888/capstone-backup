from flask import jsonify


def success_response(data=None, message='Success', code=200):
    body = {
        'success': True,
        'message': message,
        'data': data,
    }
    return jsonify(body), code


def error_response(message, code=400, error_code=None, details=None):
    body = {
        'success': False,
        'error': message,
    }
    if details:
        body['details'] = details
    return jsonify(body), code
