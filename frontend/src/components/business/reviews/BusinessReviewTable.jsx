import { Link } from "react-router-dom";
import StatusBadge from "../../common/StatusBadge";

const BusinessReviewTable = ({ reviews, onReport }) => {
  const renderStars = (rating) => {
    return "★".repeat(rating) + "☆".repeat(5 - rating);
  };

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>작성자</th>
            <th>객실</th>
            <th>평점</th>
            <th>내용</th>
            <th>작성일</th>
            <th>상태</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          {reviews.map((review) => (
            <tr key={review.id}>
              <td>{review.guestName}</td>
              <td>{review.roomType}</td>
              <td className="rating">{renderStars(review.rating)}</td>
              <td className="review-content">{review.content.substring(0, 50)}...</td>
              <td>{review.createdAt}</td>
              <td>
                <StatusBadge status={review.status} type="review" />
              </td>
              <td>
                <Link to={`/business/reviews/${review.id}`} className="btn btn-sm btn-outline">
                  상세
                </Link>
                {review.status !== "reported" && (
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => onReport(review.id)}
                  >
                    신고
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BusinessReviewTable;
