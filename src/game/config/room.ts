/**
 * Open floor under the table. There are no walls.
 * The floor is wide enough that the 3× table still sits in the middle of it.
 */
export const ROOM = {
  floorSize: 80,
  floorThickness: 0.12,
} as const;

export const ROOM_LAYOUT = {
  width: ROOM.floorSize,
  depth: ROOM.floorSize,
  /** How high the camera may rise now that there is no ceiling. */
  height: 40,
  innerDepth: ROOM.floorSize,
  innerWidth: ROOM.floorSize,
} as const;
