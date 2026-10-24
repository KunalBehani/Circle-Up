import React from 'react';
import { CommentForm } from './CommentForm.jsx';
import { CommentItem } from './CommentItem.jsx';
import { MessageSquare } from 'lucide-react';

export const CommentList = ({
  postId,
  comments,
  onCommentAdded,
  onCommentDeleted,
  onCommentUpdated,
}) => {
  return (
    <section className="editorial-card p-5 space-y-6">
      <div className="flex items-center gap-2 pb-4 border-b border-neutral-100">
        <MessageSquare className="w-5 h-5 text-brand-600" />
        <h3 className="font-bold text-base text-neutral-900">
          Discussion ({comments.length})
        </h3>
      </div>

      {/* Comment Form */}
      <CommentForm postId={postId} onCommentAdded={onCommentAdded} />

      {/* Comments List */}
      {comments.length > 0 ? (
        <div className="divide-y divide-neutral-100 pt-2">
          {comments.map((comment) => (
            <CommentItem
              key={comment._id}
              comment={comment}
              onCommentDeleted={onCommentDeleted}
              onCommentUpdated={onCommentUpdated}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-neutral-400 space-y-1">
          <p className="text-sm font-semibold text-neutral-600">No comments yet</p>
          <p className="text-xs">Be the first to join the conversation!</p>
        </div>
      )}
    </section>
  );
};

export default CommentList;
