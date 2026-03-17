import os

from flask import Flask

from app.extensions import bcrypt, cors, db, jwt, migrate
from config import config


def create_app(config_name=None):
    app = Flask(__name__)

    config_name = config_name or os.getenv('FLASK_ENV', 'development')
    app.config.from_object(config[config_name])

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    bcrypt.init_app(app)
    cors.init_app(app)

    # Register blueprints
    from app.api import register_blueprints
    register_blueprints(app)

    # Register error handlers
    _register_error_handlers(app)

    return app


def _register_error_handlers(app):
    from app.utils.response import error_response

    @app.errorhandler(404)
    def not_found(e):
        return error_response('Resource not found', 404)

    @app.errorhandler(500)
    def internal_error(e):
        return error_response('Internal server error', 500)

    @app.errorhandler(405)
    def method_not_allowed(e):
        return error_response('Method not allowed', 405)

    # JWT error callbacks
    @jwt.unauthorized_loader
    def missing_token(reason):
        return error_response('Missing authorization token', 401, error_code='AUTH_UNAUTHORIZED')

    @jwt.invalid_token_loader
    def invalid_token(reason):
        return error_response('Invalid token', 401, error_code='AUTH_INVALID_TOKEN')

    @jwt.expired_token_loader
    def expired_token(jwt_header, jwt_payload):
        return error_response('Token has expired', 401, error_code='AUTH_TOKEN_EXPIRED')
