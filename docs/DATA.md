# Data and methods

The collection contains **359 selected road paths**, **12,877 original
vertices**, and **84 interchange/access groups**. It is not an inventory of
every physical ramp or permitted driving movement.

## Geometry

Source: NJDOT road centerlines, August 21, 2025, in EPSG:3424 (NAD83 / New
Jersey, US survey feet). The page preserves the supplied coordinates. Shapes
use translation and uniform scaling; north stays up. They are not rotated,
smoothed or redrawn. Sparse point sequences remain sparse.

355 selections are complete source features. Four are indexed, contiguous
US 9 excerpts. Two nonoverlapping excerpts share a raw FID, so application
selection IDs and raw source FIDs are distinct concepts. The drawings may
include forks, shared connections or approaches.

County boundaries are generalized browsing context. An exit near a boundary
may appear in both counties. Full-Parkway totals deduplicate it.

## Traffic

FHWA HPMS 2024 annual averages are matched to the source roads. 277 paths have
positive linked estimates; 82 are unavailable. These are vehicles per day,
not people, toll transactions, peak-hour totals or live congestion. Counts on
shared roads are not summed. 47 of the 54 paths associated with a listed toll
have usable traffic estimates.

## Tolls

The 2026 directory contains 34 named tariff entries: 11 on the Parkway and 23
at ramps. These are not counts of physical plazas, booths or lanes. Map
positions are approximate references. Cash, NJ E-ZPass peak and off-peak are
shown together for ten vehicle/plan profiles. Standard passenger-car fares do
not change by time of day; eligible enrolled Senior/Green and truck/bus plans
can differ. Eligibility and travel restrictions remain in the page.

## Rankings

There are 11 shape and 4 traffic categories. Exact metric definitions are in
`GSP_Superlatives_Data.json` and the page's optional methods. Equal values share
a competition rank, with a stable north-to-south/ID tie break for display.
Ten entries are shown even when a tie crosses the cutoff. Straightest stretches
displays percent extra distance; its export also preserves the raw ratio.
Toll-price rankings are intentionally omitted because widespread ties made
them uninformative. No sign-text character rankings are included: a reliable,
complete current public inventory has not been verified.

## Files and provenance

`study-data.json`, `county-data.json`, `traffic-data.json`,
`GSP_Tolls_2026.json` and `GSP_Superlatives_Data.json` are the canonical embedded
blocks. CSV/GeoJSON exports remain inspectable. Source URLs, retrieval dates,
schedule hashes and matching notes are in `Source_References.json`.

Layer updates require source review. No automatic data refresh is promised.
