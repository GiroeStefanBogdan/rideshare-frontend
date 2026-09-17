# Use lifetime user-pair reviews with reopening windows

A member has at most one Review per counterpart for life, and the reverse direction is a separate
Review. Reviews are not per Ride: a later shared Ride reopens the existing Review's fourteen-day
window instead of adding another. Reviews publish only once both counterparts have submitted for the
same cycle, or once the later window closes, and publication locks further edits until a later Ride
reopens the window.

## Consequences

- The client never creates a second Review for a counterpart. "Write review" and "Update review" are
  the same endpoint and differ only in whether an existing Review is present.
- Reputation cannot be inflated by repeated Rides, extra seats, or split Bookings.
- An amendment written before re-publication must not disturb what is already public: the UI shows the
  last published score, comment, and role badge to everyone, and surfaces the pending values only to
  their author, marked as awaiting the counterpart or the deadline.
- Unrated is rendered as "No reviews yet", never as a zero score.
- Reviews appear on the account page, public profiles, and as summaries where a driver is shown
  (search results, Ride details, booked cards), but a Review is only ever written from the surfaces
  backed by server-derived eligibility.
- The client never infers eligibility. It renders whatever the eligibility endpoints report, including
  `canSubmit`, because a Ride's shared history cannot be reconstructed reliably from the browser.
- After a successful submission the card is replaced by a brief confirmation and is never shown again
  on that browser, even after reload or on other pages: `ReviewsToWrite` records a per-cycle dismissal
  in `localStorage` (`reviews.dismissed.v1`, key `targetUserId:dropoffAt|rideId`, capped at 200 keys).
  This is presentation state only. The backend keeps a submitted-but-unpublished review writable
  (`canSubmit` stays true until publication or lock), so another browser or a cleared storage still
  shows it as updatable — the server, not storage, remains the source of truth for what may be written.

See [review architecture](../ARCHITECTURE.md#reviews), [CONTEXT](../../CONTEXT.md#reviews-and-reputation),
and the backend's
[lifetime pair decision](https://github.com/alexandru-dicu/rideshare-backend/blob/main/docs/adr/0004-use-lifetime-user-pair-reviews.md).