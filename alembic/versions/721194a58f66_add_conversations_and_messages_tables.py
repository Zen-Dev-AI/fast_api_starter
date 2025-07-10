"""Add conversations and messages tables

Revision ID: 721194a58f66
Revises: 
Create Date: 2025-07-09 10:16:56.672081
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '721194a58f66'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ── create conversations ─────────────────────────────────────────────────────
    op.create_table(
        'conversations',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('thread_id', sa.String(), nullable=False, unique=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
    )
    op.create_index('ix_conversations_thread_id', 'conversations', ['thread_id'], unique=True)
    op.create_index('ix_conversations_id', 'conversations', ['id'], unique=False)

    # ── create messages ─────────────────────────────────────────────────────────
    op.create_table(
        'messages',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('conversation_id', sa.Integer(), sa.ForeignKey('conversations.id'), nullable=False),
        sa.Column('role', sa.String(), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('timestamp', sa.DateTime(), server_default=sa.func.now(), nullable=False),
    )
    op.create_index('ix_messages_conversation_id', 'messages', ['conversation_id'], unique=False)
    op.create_index('ix_messages_id', 'messages', ['id'], unique=False)


def downgrade() -> None:
    op.drop_index('ix_messages_id', table_name='messages')
    op.drop_index('ix_messages_conversation_id', table_name='messages')
    op.drop_table('messages')

    op.drop_index('ix_conversations_id', table_name='conversations')
    op.drop_index('ix_conversations_thread_id', table_name='conversations')
    op.drop_table('conversations')
