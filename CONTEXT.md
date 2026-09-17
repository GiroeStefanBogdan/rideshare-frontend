# RideShare

The RideShare context describes how drivers publish journeys and passengers reserve portions of them.

## Language

**Ride**:
A journey published by a driver along an ordered route, with a schedule, passenger capacity, and prices.
_Avoid_: Trip, listing

**Stop**:
An ordered location on a Ride where the route begins, ends, or passengers may join or leave.
_Avoid_: Waypoint, route point

**Origin**:
The first Stop of a Ride.
_Avoid_: Starting point, pickup

**Destination**:
The final Stop of a Ride.
_Avoid_: Finish point, endpoint

**Intermediate Stop**:
A Stop between the Origin and Destination.
_Avoid_: Via, waypoint

**Segment**:
The portion of a Ride between two adjacent Stops.
_Avoid_: Leg, section

**Segment Price**:
The whole-RON fare charged to one passenger for travelling one Segment, derived from the difference between the Segment's ending and starting Cumulative Prices.
_Avoid_: Stop price, fare-to-destination

**Cumulative Price**:
The whole-RON fare for one passenger travelling from the Origin to a Stop. The Origin has no entered price and is treated as zero; each later Stop's value must be greater than the previous Stop's value.
_Avoid_: Segment price, remaining fare

**Scheduled Stop Time**:
The entered departure time at the Origin or the derived arrival time at a subsequent Stop; at an Intermediate Stop, the arrival time also serves as its departure time.
_Avoid_: Dwell time, separate arrival and departure times

**Segment Duration**:
The driver's estimate of the travel time from one Stop to the next adjacent Stop. Each subsequent Scheduled Stop Time is derived by adding Segment Durations cumulatively to the Origin's departure time.
_Avoid_: Arrival time, total journey duration, time from Origin

**Passenger Capacity**:
The number of passengers the driver offers to carry on a Ride, from one to four. A Ride Vehicle may suggest its initial value but does not constrain the driver's choice.
_Avoid_: People, total vehicle seats, available seats

**Ride Vehicle**:
An optional registered vehicle associated with a Ride. Its descriptive details may be shown to passengers, but its license plate and registered seat count remain private; deleting it removes the association without deleting the Ride.
_Avoid_: Required vehicle, car selection

**Reservation**:
The passenger action of requesting seats on a Ride between two selected Stops.
_Avoid_: Booking request, ride purchase

**Booking**:
The record created by a successful Reservation, allocating a number of seats on a Ride between two selected Stops.
_Avoid_: Reservation, ticket

**Booked / Hosted**:
The passenger's Bookings / the driver's published Rides in My Rides. These are view roles, not different account roles.

**Pickup / Drop-off**:
The selected Stops where a passenger joins / leaves a Ride. They need not be the Ride's Origin / Destination.

**Scheduled End**:
The Booking's Drop-off time or the Hosted Ride's final Scheduled Stop Time. It determines the server's Upcoming/Past bucket, not the pickup or origin time.

**Upcoming / Past**:
Time buckets independent of cancellation. Upcoming means Scheduled End is after server now or is a legacy null. Past includes Scheduled Ends in `[now.minusMonths(1), now]`, both boundaries inclusive, using a calendar month rather than 30 days. Older ends are omitted.

**On the way**:
An active Upcoming card whose known start has arrived but Scheduled End has not (`start <= now < end`). This is a presentation badge, not a persisted status or live tracking.

**Cancelled**:
A lifecycle status, not a synonym for Past. My Rides wire status is `ACTIVE` / `CANCELLED`; the backend maps legacy `INACTIVE` to `CANCELLED`. A Booking appears cancelled when either it or its Ride is no longer active. Main My Rides merges Cancelled from both server time buckets; Past shows active entries only.

**Passenger Cancellation**:
The Booking owner's action strictly before Pickup, changing only that Booking's status and restoring exactly its seats once on `[fromOrder, toOrder)`. Already cancelled/inactive Booking or Ride is a no-op. Driver cancellation changes only the Ride status and releases no seats.

See [My Rides architecture](docs/ARCHITECTURE.md#my-rides-and-passenger-cancellation) and [cancellation ADR](docs/adr/0003-use-explicit-cancelled-status.md).
