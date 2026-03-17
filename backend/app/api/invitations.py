from flask import Blueprint

from app.models.community import Community
from app.utils.response import success_response

invitations_bp = Blueprint('invitations', __name__)


@invitations_bp.route('/generate', methods=['POST'])
def generate_invite_code():
    return success_response(
        {'inviteCode': Community.generate_invite_code()},
        'Invite code generated',
    )
