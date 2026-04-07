def register_blueprints(app):
    from app.api.auth import auth_bp
    from app.api.invitations import invitations_bp
    from app.api.questionnaire_survey import questionnaire_survey_bp

    app.register_blueprint(auth_bp, url_prefix='/api')
    app.register_blueprint(invitations_bp, url_prefix='/api/v1/invitations')
    app.register_blueprint(questionnaire_survey_bp, url_prefix='/api/v1/questionnaire-surveys')
