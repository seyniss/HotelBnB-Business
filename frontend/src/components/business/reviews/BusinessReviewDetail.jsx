import { useState } from "react";
import StatusBadge from "../../common/StatusBadge";

const BusinessReviewDetail = ({ review, onReply, onReport }) => {
  const [replyText, setReplyText] = useState("");

  const renderStars = (rating) => {
    return "★".repeat(rating) + "☆".repeat(5 - rating);
  };

  const handleReplySubmit = (e) => {
    e.preventDefault();
    if (replyText.trim()) {
      onReply(review.id, replyText);
      setReplyText("");
    }
  };

  if (!review) return null;

  return (
    <div className="review-detail">
      <div className="detail-section">
        <div className="detail-row">
          <span className="label">작성자</span>
          <span className="value">{review.guestName}</span>
        </div>
        <div className="detail-row">
          <span className="label">객실</span>
          <span className="value">{review.roomType}</span>
        </div>
        <div className="detail-row">
          <span className="label">평점</span>
          <span className="value rating">{renderStars(review.rating)}</span>
        </div>
        <div className="detail-row">
          <span className="label">작성일</span>
          <span className="value">{review.createdAt}</span>
        </div>
        <div className="detail-row">
          <span className="label">상태</span>
          <span className="value">
            <StatusBadge status={review.status} type="review" />
          </span>
        </div>
        <div className="detail-row">
          <span className="label">리뷰 내용</span>
          <span className="value">{review.content}</span>
        </div>

        {review.reply && (
          <div className="detail-row">
            <span className="label">답변</span>
            <span className="value">{review.reply}</span>
          </div>
        )}
      </div>

      {!review.reply && (
        <form onSubmit={handleReplySubmit} className="reply-form">
          <h4>답변 작성</h4>
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="리뷰에 대한 답변을 작성하세요..."
            rows={4}
          />
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              답변 등록
            </button>
          </div>
        </form>
      )}

      {review.status !== "reported" && (
        <div className="detail-actions">
          <button
            className="btn btn-danger"
            onClick={() => onReport(review.id)}
          >
            리뷰 신고
          </button>
        </div>
      )}
    </div>
  );
};

export default BusinessReviewDetail;
