import { Heart } from "lucide-react";
import { NavLink } from "react-router-dom";
import type { VacationModel } from "../../../Models/VacationModel";
import { appConfig } from "../../../Utils/AppConfig";
import { dateUtils } from "../../../Utils/DateUtils";
import "./VacationCard.css";

interface Props {
    vacation: VacationModel;
    canLike: boolean;
    canManage: boolean;
    onToggleLike?: (vacation: VacationModel) => void;
    onDelete?: (vacation: VacationModel) => void;
}

export function VacationCard({ vacation, canLike, canManage, onToggleLike, onDelete }: Props) {
    const imageUrl = appConfig.imageUrl(vacation.imageFileName);
    const active = dateUtils.isActive(vacation.startDate, vacation.endDate);
    const upcoming = dateUtils.isUpcoming(vacation.startDate);
    const statusLabel = active ? "Active now" : upcoming ? "Upcoming" : "Past";
    const statusClass = active ? "is-active" : upcoming ? "is-upcoming" : "is-past";
    const likeCountLabel = `${vacation.totalLikes} ${vacation.totalLikes === 1 ? "like" : "likes"} in total`;

    return (
        <article className="VacationCard">
            <div className="VacationCard-imageWrap">
                <img className="VacationCard-image" src={imageUrl} alt={vacation.destination} loading="lazy" />
                <span className={`VacationCard-status ${statusClass}`}>{statusLabel}</span>

                {/* Heart button = YOUR action only. No count on it. Tooltip explains the state. */}
                {canLike && onToggleLike && (
                    <button
                        type="button"
                        className={`VacationCard-like ${vacation.isLikedByCurrentUser ? "is-liked" : ""}`}
                        onClick={() => onToggleLike(vacation)}
                        aria-pressed={vacation.isLikedByCurrentUser}
                        aria-label={vacation.isLikedByCurrentUser ? "Unlike this vacation" : "Like this vacation"}
                        title={vacation.isLikedByCurrentUser ? "You liked this — click to unlike" : "Click to like"}
                    >
                        <Heart
                            className="VacationCard-likeIcon"
                            fill={vacation.isLikedByCurrentUser ? "currentColor" : "none"}
                            strokeWidth={2}
                        />
                    </button>
                )}
            </div>

            <div className="VacationCard-body">
                <h3 className="VacationCard-title">{vacation.destination}</h3>
                <p className="VacationCard-dates">{dateUtils.formatRange(vacation.startDate, vacation.endDate)}</p>
                <p className="VacationCard-description">{vacation.description}</p>
                <div className="VacationCard-footer">
                    <span className="VacationCard-price">${vacation.price.toLocaleString()}</span>
                    {canManage && (
                        <div className="VacationCard-adminActions">
                            <NavLink className="btn btn-ghost" to={`/admin/vacations/${vacation._id}/edit`}>Edit</NavLink>
                            <button type="button" className="btn btn-danger" onClick={() => onDelete?.(vacation)}>
                                Delete
                            </button>
                        </div>
                    )}
                </div>

                {/* Total count = separate, clearly labeled stat (not confused with YOUR state). */}
                <div className="VacationCard-likeStat" aria-label={likeCountLabel} title={likeCountLabel}>
                    <Heart className="VacationCard-likeStatIcon" fill="currentColor" strokeWidth={0} aria-hidden="true" />
                    <span>
                        <strong>{vacation.totalLikes}</strong>{" "}
                        {vacation.totalLikes === 1 ? "person" : "people"} liked this
                    </span>
                </div>
            </div>
        </article>
    );
}
